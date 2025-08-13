import React, { useState } from 'react';
import { Form, json, Link, redirect, useLoaderData } from '@remix-run/react';
import { Invoice, InvoiceData } from '~/models/invoice';
import { LoaderFunctionArgs } from '@remix-run/node';
import { connectToDatabase } from '~/utils/db.server';
import { getUserFromRequest } from '~/utils/auth.server';
import { invoiceTemplates } from '~/components/Template';

export async function loader({ request }: LoaderFunctionArgs) {
  const authUser = getUserFromRequest(request);
  if (!authUser || authUser.role !== 'admin') {
    return redirect('/');
  }
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 10;
  const search = url.searchParams.get('search') || '';
  const sortBy = url.searchParams.get('sortBy') || 'createdAt';
  const sortOrder = url.searchParams.get('sortOrder') || 'desc';

  await connectToDatabase();

  const query: any = {};

  function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  const escapedSearch = escapeRegExp(search);

  const sortObj: any = {};
  sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const pipeline = [
    { $match: query },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    {
      $unwind: {
        path: '$userInfo',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $addFields: {
        username: '$userInfo.username'
      }
    },
    {
      $project: {
        invoiceNumber: 1,
        username: 1,
        title: 1,
        fromName: 1,
        billToName: 1,
        total: 1,
        currency: 1,
        createdAt: 1,
        updatedAt: 1
      }
    },
    {
      $match: search
        ? {
          $or: [
            { username: { $regex: escapedSearch, $options: 'i' } },
            { invoiceNumber: { $regex: escapedSearch, $options: 'i' } },
            { title: { $regex: escapedSearch, $options: 'i' } },
            { fromName: { $regex: escapedSearch, $options: 'i' } },
            { billToName: { $regex: escapedSearch, $options: 'i' } },
            { currency: { $eq: escapedSearch } },
            {
              $expr: {
                $regexMatch: {
                  input: { $toString: "$total" },
                  regex: escapedSearch,
                  options: 'i'
                }
              }
            }
          ]
        }
        : {}
    },
    { $sort: sortObj },
    {
      $facet: {
        data: [
          { $skip: (page - 1) * limit },
          { $limit: limit }
        ],
        count: [
          { $count: "total" }
        ]
      }
    }
  ];

  const [result] = await Invoice.aggregate(pipeline);
  const invoices = result.data || [];
  const totalInvoices = result.count[0]?.total || 0;
  const totalPages = Math.ceil(totalInvoices / limit);

  return json({
    invoices,
    pagination: {
      currentPage: page,
      totalPages,
      totalInvoices,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    filters: { search },
    sorting: { sortBy, sortOrder },
    authUserId: authUser.userId
  });
}


export default function InvoiceManagement() {
  const { invoices, pagination, filters, sorting } = useLoaderData<typeof loader>();
  const [jumpPage, setJumpPage] = useState('');

  const getSortIcon = (column: string) => {
    if (sorting.sortBy !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sorting.sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const getSortUrl = (column: string) => {
    const newSortOrder = sorting.sortBy === column && sorting.sortOrder === 'asc' ? 'desc' : 'asc';
    const params = new URLSearchParams();
    params.set('sortBy', column);
    params.set('sortOrder', newSortOrder);
    if (filters.search) params.set('search', filters.search);
    return `?${params.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Invoice Management</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <Form method="get" className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 items-end">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              name="search"
              defaultValue={filters.search}
              placeholder="Search invoice number, invoice title, from or to..."
              className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </Form>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Total Invoices: {pagination.totalInvoices}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Link
                    to={getSortUrl('username')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Username</span>
                    {getSortIcon('username')}
                  </Link>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Link
                    to={getSortUrl('invoiceNumber')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Invoice Number</span>
                    {getSortIcon('invoiceNumber')}
                  </Link>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Link
                    to={getSortUrl('title')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Invoice Title</span>
                    {getSortIcon('title')}
                  </Link>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Link
                    to={getSortUrl('fromName')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>From</span>
                    {getSortIcon('fromName')}
                  </Link>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Link
                    to={getSortUrl('billToName')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>To</span>
                    {getSortIcon('billToName')}
                  </Link>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Link
                    to={getSortUrl('total')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Total</span>
                    {getSortIcon('total')}
                  </Link>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Link
                    to={getSortUrl('createdAt')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Created</span>
                    {getSortIcon('createdAt')}
                  </Link>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Link
                    to={getSortUrl('updatedAt')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Last Update</span>
                    {getSortIcon('updatedAt')}
                  </Link>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice: any) => (
                <tr key={invoice._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <Link
                          to={`/admin/users?search=${invoice.username}`}
                          className="inline text-sm font-medium text-indigo-600 hover:text-indigo-900"
                        >
                          {invoice.username}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <Link
                          to={`/invoice/${invoice._id}`}
                          target="_blank"
                          className="inline text-sm font-medium text-indigo-600 hover:text-indigo-900"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="inline text-sm font-medium text-gray-900">
                          {invoice.title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="inline text-sm font-medium text-gray-900">
                          {invoice.fromName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="inline text-sm font-medium text-gray-900">
                          {invoice.billToName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="inline text-sm font-medium text-gray-900">
                          {invoice.total} {invoice.currency}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(invoice.createdAt!).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.updatedAt
                      ? new Date(invoice.updatedAt).toLocaleDateString("en-GB")
                      : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-gray-700">
                <span>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>

                <div className="flex items-center gap-2">
                  <span>Select Page:</span>
                  <input
                    type="number"
                    min={1}
                    max={pagination.totalPages}
                    value={jumpPage}
                    onChange={(e) => {
                      let value = parseInt(e.target.value);
                      if (isNaN(value)) value = 1;
                      if (value < 1) value = 1;
                      if (value > pagination.totalPages) value = pagination.totalPages;
                      setJumpPage(value.toString());
                    }}
                    className="w-20 px-2 py-1 border rounded text-sm"
                  />
                  <Link
                    to={`?page=${jumpPage || 1}&search=${filters.search}&sortBy=${sorting.sortBy}&sortOrder=${sorting.sortOrder}`}
                    className="px-3 py-1 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50"
                  >
                    Go
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {pagination.hasPrev && (
                  <Link
                    to={`?page=${pagination.currentPage - 1}&search=${filters.search}&sortBy=${sorting.sortBy}&sortOrder=${sorting.sortOrder}`}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                {pagination.hasNext && (
                  <Link
                    to={`?page=${pagination.currentPage + 1}&search=${filters.search}&sortBy=${sorting.sortBy}&sortOrder=${sorting.sortOrder}`}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}