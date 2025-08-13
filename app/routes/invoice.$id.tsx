// app/routes/admin.invoices.$id.tsx
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React, { useEffect, useRef } from "react";
import { invoiceTemplates } from "~/components/Template";
import { Invoice } from "~/models/invoice";
import { connectToDatabase } from "~/utils/db.server";


export async function loader({ params }: LoaderFunctionArgs) {
    try {
  await connectToDatabase();
  const invoice = await Invoice.findById(params.id);
  if (!invoice) {
    throw new Response('Invoice not found', { status: 404 });
  }
  return json(invoice);
  } catch (error) {
    throw new Response('Error', { status: 500 });
  }
}

export default function InvoicePDFPage() {
  const invoice = useLoaderData<typeof loader>();
  useEffect(() => {
    const template = invoiceTemplates.find(t => t.name === invoice.template);
    if (!template) return;
    const invoiceHTML = template.generateHTML(invoice, invoice.items);
    window.document.write(invoiceHTML);
    window.document.close();
  });
}
