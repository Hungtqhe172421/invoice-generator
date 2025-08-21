import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigate,
  useRouteError,
} from '@remix-run/react';
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import Header from '~/components/Header';
import { getUserFromRequest } from './utils/auth.server';
import { Link } from 'lucide-react';


export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
  {
    rel: 'stylesheet',
    href: 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  return json({ user });
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Invoice Generator</title>
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-50">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { user } = useLoaderData<typeof loader>();
  
  return (
    <div className="min-h-screen">
      <Header user={user} />
      <main  className="pt-12">
        <Outlet />
      </main>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          {error.status} {error.statusText}
        </h1>
        <p className="text-gray-700 mb-6">
          {error.data || "Something went wrong."}
        </p>
      <button
        onClick={() => navigate("/")}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        Go Home
      </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold text-red-600 mb-4">
        Unexpected Error
      </h1>
      <p className="text-gray-700 mb-6">
        {error instanceof Error ? error.message : "An unknown error occurred."}
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        Go Home
      </button>
    </div>
  );
}
