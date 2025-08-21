import { NavLink } from "@remix-run/react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="bg-gray-100 flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `block rounded px-2 py-1 ${isActive ? "bg-gray-700 font-semibold" : "hover:bg-gray-700"
              }`
            }
          >
            Users
          </NavLink>
          <NavLink
            to="/admin/invoices"
            className={({ isActive }) =>
              `block rounded px-2 py-1 ${isActive ? "bg-gray-700 font-semibold" : "hover:bg-gray-700"
              }`
            }
          >
            Invoices
          </NavLink>
        </nav>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
