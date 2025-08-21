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
import { z } from "zod";
import { zfd } from "zod-form-data";


export const itemSchema = z.object({
  description: z.string().min(1, 'Item description is required').max(50, 'Description must be less than 50 characters'),
  additionalDetails: z.string().max(50, 'Additional details must be less than 50 characters').optional(),
  rate: z.number().min(0, 'Rate must be positive').max(1000000000000, 'Rate too large'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(999, 'Quantity cannot exceed 999'),
  amount: z.number().min(0, 'Amount must be positive'),
  taxable: z.boolean().default(true),
});

export const invoiceSchema = zfd.formData({
  title: zfd.text(z.string().min(1, "Title is required").max(50, "Title must be less than 50 characters")),
  fromName: zfd.text(z.string().min(1, "From name is required").max(50, "From name must be less than 50 characters")),
  billToName: zfd.text(z.string().min(1, "Bill to name is required").max(50, "Bill to name must be less than 50 characters")),
  invoiceNumber: zfd.text(z.string().min(1, "Invoice number is required").max(50, "Invoice number must be less than 50 characters")),
  date: zfd.text(z.string().min(1, "Date is required")),
  terms: zfd.text(z.string().min(1, "Terms are required")),
  
  template: zfd.text(z.string().optional().default('Classic')),
  fromEmail: zfd.text(z.string().email('Invalid email format').max(50, "Email must be less than 50 characters").optional()),
  fromAddress: zfd.text(z.string().max(50, "Address must be less than 50 characters").optional()),
  fromPhone: zfd.text(z.string().max(50, "Phone must be less than 50 characters").optional()),
  businessNumber: zfd.text(z.string().max(50, "Business number must be less than 50 characters").optional()),
  billToEmail: zfd.text(z.string().email('Invalid email format').max(50, "Email must be less than 50 characters").optional()),
  billToAddress: zfd.text(z.string().max(50, "Address must be less than 50 characters").optional()),
  billToPhone: zfd.text(z.string().max(50, "Phone must be less than 50 characters").optional()),
  billToMobile: zfd.text(z.string().max(50, "Mobile must be less than 50 characters").optional()),
  billToFax: zfd.text(z.string().max(50, "Fax must be less than 50 characters").optional()),
  notes: zfd.text(z.string().max(200, "Notes must be less than 200 characters").optional()),
  signature: zfd.text(z.string().optional()),
  color: zfd.text(z.string().optional().default('#ffffffff')),
  logo: zfd.text(z.string().optional()),
  
  currency: zfd.text(z.string().optional().default('VND')),
  taxType: zfd.text(z.string().min(1, 'Tax type is required')),
  discountType: zfd.text(z.string().min(1, 'Discount type is required')),
  taxRate: zfd.numeric(z.number().min(0, 'Tax rate must be positive').max(100, 'Tax rate cannot exceed 100%').optional().default(0)),
  discountValue: zfd.numeric(z.number().min(0, 'Discount value must be positive').optional().default(0)),
  subtotal: zfd.numeric(z.number().min(0, 'Subtotal must be positive')),
  taxAmount: zfd.numeric(z.number().min(0, 'Tax amount must be positive')),
  discountAmount: zfd.numeric(z.number().min(0, 'Discount amount must be positive')),
  total: zfd.numeric(z.number().min(0, 'Total must be positive')),
  
  items: zfd.text(z.string().transform((str, ctx) => {
    try {
      const parsed = JSON.parse(str);
      const result = z.array(itemSchema).min(1, 'At least one item is required').parse(parsed);
      return result;
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid items format or empty items list',
      });
      return z.NEVER;
    }
  })),
});


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

    const invoiceData: Partial<InvoiceData> = {
      user: userId,
      balanceDue: parseFloat(formData.get('total') as string) || 0,
      ...parsed.data,
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