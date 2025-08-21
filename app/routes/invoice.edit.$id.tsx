import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';

import { getUserFromRequest } from '~/utils/auth.server';
import { connectToDatabase } from '~/utils/db.server';
import { Invoice, InvoiceData, updateInvoice } from '~/models/invoice';
import User from '~/models/user.server';
import { useLoaderData } from '@remix-run/react';
import InvoiceForm from '~/components/InvoiceForm';
import { invoiceSchema } from './invoice-form';
import mongoose from 'mongoose';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {

    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return redirect('/login');
    }

      if (!params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
        throw new Response('Invalid invoice id', { status: 404 });
      }

    await connectToDatabase();

    const invoice = await Invoice.findById(params.id);
    if (!invoice) {
      throw new Response('Invoice not found', { status: 404 });
    }

    if (invoice.user != authUser.userId) {
      throw new Response('Unauthorize to access this invoice', { status: 403 });
    }
    return json({
      authUser,
      invoice: invoice,
    });
  
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return redirect('/login');
    }

    const invoiceId = params.id;
    if (!invoiceId) {
      return json({ success: false, error: 'Invoice ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const formData = await request.formData();
    const parsed = invoiceSchema.safeParse(formData);
    if (!parsed.success) {
      return json(
        {
          success: false,
          error: "Validation failed",
        },
        { status: 400 }
      );
    }
    const normalizedData = Object.fromEntries(
      Object.entries(parsed.data).map(([key, value]) => [
        key,
        value === undefined ? '' : value,
      ])
    );


    const userId = await User.findById(authUser.userId);

    const invoiceData: Partial<InvoiceData> = {
      user: userId,
      balanceDue: parseFloat(formData.get('total') as string) || 0,
      ...normalizedData
    };

    try {
      const updatedInvoice = await updateInvoice(invoiceId, invoiceData);
      if (!updatedInvoice) {
        return json({
          success: false,
          error: 'Failed to update invoice'
        }, { status: 400 });
      }

      return json({
        success: true,
        invoice: updatedInvoice
      });
    } catch  {
      return json({
        success: false,
        error: 'Error'
      }, { status: 400 });
    }
  } catch  {
    return json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
};

export default function EditInvoice() {
  const { invoice } = useLoaderData<typeof loader>();
  return (
    <InvoiceForm
      initialData={invoice ? (invoice as Partial<InvoiceData>) : undefined}
    />
  );
}