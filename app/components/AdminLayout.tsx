import { Links, Meta, Scripts, ScrollRestoration } from "@remix-run/react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Admin - Invoice Generator</title>
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-100 flex min-h-screen">

        <aside className="w-64 bg-gray-800 text-white p-4">
          <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
          <nav className="space-y-2">
            <a href="/admin/invoices" className="block hover:underline">Invoices</a>
            <a href="/admin/users" className="block hover:underline">Users</a>
          </nav>
        </aside>


        <div className="flex-1 p-8">
          {children}
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
