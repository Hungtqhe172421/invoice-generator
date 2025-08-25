import { pdf } from "@react-pdf/renderer";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { redirect, useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import { useEffect, useState } from "react";
import { invoiceTemplates } from "~/components/Template";
import { Invoice } from "~/models/invoice";
import { getUserFromRequest } from "~/utils/auth.server";
import { connectToDatabase } from "~/utils/db.server";


export async function loader({ request, params }: LoaderFunctionArgs) {
  const authUser = getUserFromRequest(request);
  if (!authUser) {
    return redirect('/');
  }
  if (!params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
    throw new Response('Invalid invoice id', { status: 404 });
  }

  await connectToDatabase();


  const invoice = await Invoice.findById(params.id);

  if (!invoice) {
    throw new Response('Invoice not found', { status: 404 });
  }

  if (invoice.user == authUser.userId || authUser.role == 'admin') {
    return json(invoice);
  }

  throw new Response('Unauthorized to access this invoice', { status: 403 });
}



export default function InvoicePDFPage() {
  const invoice = useLoaderData<typeof loader>();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const generatePDF = async () => {
      const template = invoiceTemplates.find((t) => t.name === invoice.template);
      if (!template) return;

      const html = template.generateHTML(invoice, invoice.items);

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    };

    generatePDF();
  }, [invoice]);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {pdfUrl ? (
        <iframe
          src={pdfUrl}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="Invoice PDF"
        />
      ) : (
        <p style={{ textAlign: "center", marginTop: "20%" }}>
          Generating invoice PDF...
        </p>
      )}
    </div>
  );
}
