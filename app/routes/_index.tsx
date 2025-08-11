import {type LoaderFunctionArgs } from '@remix-run/node';
import { redirect, useLoaderData } from '@remix-run/react';
import InvoiceForm from '~/routes/invoice-form';
import InvoiceManagement from '~/routes/admin.invoices';
import { getUserFromRequest } from '~/utils/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
    if (user) {
    return redirect('/invoice-form');
  }
  return { user: null };
}

export default function Index() {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Invoice Generator
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Please sign in to create and manage your invoices.
          </p>
        </div>
      </div>
    );
}