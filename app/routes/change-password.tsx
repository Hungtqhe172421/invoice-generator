import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import User from '~/models/user.server';
import { getUserFromRequest, hashPassword, verifyPassword } from '~/utils/auth.server';
import { connectToDatabase } from '~/utils/db.server';


export async function loader({ request }: LoaderFunctionArgs) {
  const authUser = getUserFromRequest(request);
  if (!authUser) {
    return redirect('/signin');
  }

  await connectToDatabase();
  const user = await User.findById(authUser.userId);
  
  if (!user) {
    return redirect('/signin');
  }

  return json({ user: {
    _id: user._id,
  }});
}

export async function action({ request }: ActionFunctionArgs) {
  const authUser = getUserFromRequest(request);

  const formData = await request.formData();
  const action = formData.get('_action') as string;

  await connectToDatabase();
  const user = await User.findById(authUser?.userId);
  
  if (!user) {
    return redirect('/signin');
  }

  if (action === 'changePassword') {
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return json({ error: 'All password fields are required' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return json({ error: 'New passwords do not match' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return json({ error: 'New password must be at least 6 characters long' }, { status: 400 });
    }

    if (newPassword == currentPassword) {
      return json({ error: 'New password is the same as current password' }, { status: 400 });
    }

    try {
      const isValidPassword = await verifyPassword(currentPassword, user.password);
      if (!isValidPassword) {
        return json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      const hashedPassword = await hashPassword(newPassword);
      user.password = hashedPassword;
      await user.save();

      return json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      return json({ error: 'Failed to change password' }, { status: 500 });
    }
  }

  return json({ error: 'Invalid action' }, { status: 400 });
}

export default function Profile() {
  const actionData = useActionData<typeof action>();


  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
        <div className="bg-white shadow rounded-lg p-6">
          
          <Form method="post" className="space-y-4">
            <input type="hidden" name="_action" value="changePassword" />
            
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {actionData && 'error' in actionData  &&  (
              <div className="text-red-600 text-sm">{actionData.error}</div>
            )}

            {actionData && 'success' in actionData  && (
              <div className="text-green-600 text-sm">{actionData.message}</div>
            )}

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
           Change Password
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}