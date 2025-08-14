import { json, redirect } from '@remix-run/node';
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { createInvoice, generateInvoiceNumber } from '~/models/invoice';
import InvoiceForm from '~/components/InvoiceForm';
import type { InvoiceData } from '~/models/invoice';
import { getUserFromRequest } from '~/utils/auth.server';
import { connectToDatabase } from '~/utils/db.server';
import User from '~/models/user.server';
import { Settings } from '~/models/settings';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {

    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return redirect('/login');
    }
    await connectToDatabase();

 const settings = await Settings.findOne({ user: authUser.userId }).lean();
 let invoiceNumber = "";

  invoiceNumber = await generateInvoiceNumber();

    return json({ settings, invoiceNumber });
  } catch (error) {
    throw new Response('Internal Server Error', { status: 500 });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {

    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return redirect('/login');
    }
    await connectToDatabase();
    const userId = await User.findById(authUser.userId);
    const formData = await request.formData();

    const invoiceData: Partial<InvoiceData> = {
      user: userId,
      title: formData.get('invoice') as string,
      template: formData.get('template') as string || 'Classic',
      fromName: formData.get('fromName') as string,
      fromEmail: formData.get('fromEmail') as string || undefined,
      fromAddress: formData.get('fromAddress') as string || undefined,
      fromPhone: formData.get('fromPhone') as string || undefined,
      businessNumber: formData.get('businessNumber') as string || undefined,
      billToName: formData.get('billToName') as string,
      billToEmail: formData.get('billToEmail') as string || undefined,
      billToAddress: formData.get('billToAddress') as string || undefined,
      billToPhone: formData.get('billToPhone') as string || undefined,
      billToMobile: formData.get('billToMobile') as string || undefined,
      billToFax: formData.get('billToFax') as string || undefined,
      invoiceNumber: formData.get('invoiceNumber') as string,
      date: formData.get('date') as string,
      terms: formData.get('terms') as string,
      notes: formData.get('notes') as string || undefined,
      signature: formData.get('signature') as string || undefined,
      color: formData.get('color') as string || undefined,
      currency: formData.get('currency') as string || 'VND',
      taxType: formData.get('taxType') as string,
      taxRate: parseFloat(formData.get('taxRate') as string) || 0,
      discountType: formData.get('discountType') as string,
      discountValue: parseFloat(formData.get('discountValue') as string) || 0,
      logo: formData.get('logo') as string || undefined,
      items: JSON.parse(formData.get('items') as string),
      subtotal: parseFloat(formData.get('subtotal') as string),
      taxAmount: parseFloat(formData.get('taxAmount') as string),
      discountAmount: parseFloat(formData.get('discountAmount') as string),
      total: parseFloat(formData.get('total') as string),
      balanceDue: parseFloat(formData.get('total') as string) || 0,
    };

try {
      const newInvoice = await createInvoice(
        invoiceData as Omit<InvoiceData, 'createdAt' | 'updatedAt' | '_id'>
      );
      return json({
        success: true,
        invoice: newInvoice
      });
    } catch (err) {
      const error = err as Error;
      return json(
        { success: false, error: error.message },
        { status: 409 }
      );
    }
  } catch (err) {
    const error = err as Error;
    return json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
};


export default function InvoiceFormRoute() {
  const { settings,invoiceNumber } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">

<InvoiceForm
          initialData={settings ? (settings as Partial<InvoiceData>) : undefined}
          invoiceNumber={invoiceNumber}
        />
      </div>
    </div>
  );
}