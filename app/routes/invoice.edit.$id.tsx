import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';

import { getUserFromRequest } from '~/utils/auth.server';
import { connectToDatabase } from '~/utils/db.server';
import { Invoice, InvoiceData, updateInvoice } from '~/models/invoice';
import User from '~/models/user.server';
import { useLoaderData } from '@remix-run/react';
import InvoiceForm from '~/components/InvoiceForm';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return redirect('/login');
    }

    const invoiceId = params.id;
    if (!invoiceId) {
      throw new Response('Invoice ID is required', { status: 400 });
    }
    await connectToDatabase();
    
    const invoice = await Invoice.findById(invoiceId);
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
  } catch (error) {
    throw new Response(' Error', { status: 500 });
  }
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
    const userId = await User.findById(authUser.userId);

    const invoiceData: Partial<InvoiceData> = {
      user: userId,
      title: formData.get('invoice') as string,
      template: formData.get('template') as string || 'Classic',
      fromName: formData.get('fromName') as string,
      fromEmail: formData.get('fromEmail') as string || '',
      fromAddress: formData.get('fromAddress') as string || '',
      fromPhone: formData.get('fromPhone') as string || '',
      businessNumber: formData.get('businessNumber') as string || '',
      billToName: formData.get('billToName') as string,
      billToEmail: formData.get('billToEmail') as string || '',
      billToAddress: formData.get('billToAddress') as string || '',
      billToPhone: formData.get('billToPhone') as string || '',
      billToMobile: formData.get('billToMobile') as string || '',
      billToFax: formData.get('billToFax') as string || '',
      invoiceNumber: formData.get('invoiceNumber') as string,
      date: formData.get('date') as string,
      terms: formData.get('terms') as string,
      notes: formData.get('notes') as string || '',
      signature: formData.get('signature') as string || '',
      color: formData.get('color') as string || '',
      currency: formData.get('currency') as string || 'VND',
      taxType: formData.get('taxType') as string,
      taxRate: parseFloat(formData.get('taxRate') as string) || 0,
      discountType: formData.get('discountType') as string,
      discountValue: parseFloat(formData.get('discountValue') as string) || 0,
      logo: formData.get('logo') as string || '',
      items: JSON.parse(formData.get('items') as string || '[]'),
      subtotal: parseFloat(formData.get('subtotal') as string) || 0,
      taxAmount: parseFloat(formData.get('taxAmount') as string) || 0,
      discountAmount: parseFloat(formData.get('discountAmount') as string) || 0,
      total: parseFloat(formData.get('total') as string) || 0,
      balanceDue: parseFloat(formData.get('total') as string) || 0,
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
    } catch (error) {
      return json({ 
        success: false, 
        error: 'Error'
      }, { status: 400 });
    }
  } catch (error) {
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