import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Link, Form } from '@remix-run/react';
import { ChevronDownIcon } from 'lucide-react';
import { JWTPayload } from '~/utils/auth.server';


interface HeaderProps {
  user?: JWTPayload | null;
}

export default function Header({ user }: HeaderProps) {
  return (
<header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      
      <Link to="/" className="flex items-center space-x-3">
        <img
          src="/invoice-simple.png"
          alt="Invoice Simple"
          className="h-8 w-auto object-contain"
        />
      </Link>

      <nav className="flex items-center space-x-2">
        {user ? (
          <>
            {user.role === 'admin' && (
              <>
                <Link
                  to="/admin/invoices"
                  className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Invoices
                </Link>
                <Link
                  to="/admin/users"
                  className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Users
                </Link>
              </>
            )}
            <Link
              to="/settings"
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Settings
            </Link>
            <Link
              to="/invoices-list"
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              My Invoices
            </Link>

            <Menu as="div" className="relative inline-block text-left">
              <MenuButton className="text-sm text-gray-700 hover:text-gray-900 inline-flex items-center space-x-1">
                <span>{user.username}</span>
                <ChevronDownIcon className="w-4 h-4 ml-1" aria-hidden="true" />
              </MenuButton>
              <MenuItems className="absolute right-0 mt-2 w-40 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none z-50">
                <div className="py-1">
                  <MenuItem>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <Link
                      to="/change-password"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Change password
                    </Link>
                  </MenuItem>
                  <Form method="post" action="/logout">
                    <button
                      type="submit"
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </Form>
                </div>
              </MenuItems>
            </Menu>
          </>
        ) : (
          <>
            <Link
              to="/signin"
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="text-sm bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md transition-colors"
            >
              Sign up
            </Link>
          </>
        )}
      </nav>
    </div>
  </div>
</header>

  );
}