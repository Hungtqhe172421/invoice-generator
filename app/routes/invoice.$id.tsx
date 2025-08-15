// app/routes/admin.invoices.$id.tsx
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { redirect, useLoaderData } from "@remix-run/react";
import React, { useEffect, useRef } from "react";
import { invoiceTemplates } from "~/components/Template";
import { Invoice } from "~/models/invoice";
import { getUserFromRequest } from "~/utils/auth.server";
import { connectToDatabase } from "~/utils/db.server";


export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return redirect('/');
    }

    await connectToDatabase();
    const invoice = await Invoice.findById(params.id);

 if (!invoice) {
      return json(
        { error: 'Invoice not found' },
        { status: 404 }  
      );
    }

    if (invoice.user == authUser.userId || authUser.role == 'admin') {
      return json(invoice);
    }

    return json(
      { error: 'Unauthorized to access this invoice' },
      { status: 403 }
    );

  } catch (error) {
    return json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
export default function InvoicePDFPage() {
  const invoice = useLoaderData<typeof loader>();
  const data = useLoaderData<typeof loader>();
  
  if ('error' in data) {
    return <div className="error" style={{marginTop:'1%',color:'red'}}>{data.error}</div>;
  }
  useEffect(() => {
    const template = invoiceTemplates.find(t => t.name === invoice.template);
    if (!template) return;
    const invoiceHTML = template.generateHTML(invoice, invoice.items);
    window.document.write(invoiceHTML);
    window.document.close();
  });
}
