import { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, redirect } from "@remix-run/react";
import AdminLayout from "~/components/AdminLayout";
import { getUserFromRequest } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
    const authUser = getUserFromRequest(request);
    if (!authUser || authUser.role !== 'admin') {
        return redirect('/');
    }
  return null;
}

export default function AdminRoute() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
