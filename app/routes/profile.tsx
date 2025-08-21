import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import User from '~/models/user.server';
import { getUserFromRequest } from '~/utils/auth.server';
import { connectToDatabase } from '~/utils/db.server';


export async function loader({ request }: LoaderFunctionArgs) {
  const authUser = getUserFromRequest(request);
  if (!authUser) {
    return redirect('/signin');
  }

  await connectToDatabase();
  const user = await User.findById(authUser.userId);

  return json({
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const authUser = getUserFromRequest(request);
  if (!authUser) {
    return redirect('/signin');
  }

  const formData = await request.formData();
  const action = formData.get('_action') as string;

  await connectToDatabase();
  const user = await User.findById(authUser.userId);

  if (!user) {
    return redirect('/signin');
  }

  if (action === 'updateProfile') {
    const username = formData.get('username') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;

    if (!username) {
      return json({ error: 'Username is required' }, { status: 400 });
    }
    if (username.toString().length < 2) {
      return json({ error: 'Username must be at least 2 characters' }, { status: 400 });
    }
    if (username.toString().length > 20) {
      return json({ error: 'Username cannot exceed 20 characters' }, { status: 400 });
    }
    if (firstName.toString().length > 20) {
      return json({ error: 'First name cannot exceed 20 characters' }, { status: 400 });
    }
    if (lastName.toString().length > 20) {
      return json({ error: 'Last name cannot exceed 20 characters' }, { status: 400 });
    }

    if (username !== user.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: user._id } });
      if (existingUser) {
        return json({ error: 'Username is already taken' }, { status: 400 });
      }
    }

    try {
      user.username = username;
      user.firstName = firstName;
      user.lastName = lastName;
      await user.save();

      return json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
      return json({ error: 'Failed to update profile' }, { status: 500 });
    }
  }

  return json({ error: 'Invalid action' }, { status: 400 });
}

export default function Profile() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state == "submitting";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
      </div>

      <div >
        <div className="bg-white shadow rounded-lg p-6">

          <Form method="post" className="space-y-4">
            <input type="hidden" name="_action" value="updateProfile" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  defaultValue={user.firstName}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  defaultValue={user.lastName}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username *
              </label>
              <input
                type="text"
                id="username"
                name="username"
                required
                defaultValue={user.username}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={user.email}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
              />
            </div>

            {actionData && 'error' in actionData && (
              <div className="text-red-600 text-sm">{actionData.error}</div>
            )}

            {actionData && 'success' in actionData && (
              <div className="text-green-600 text-sm">{actionData.message}</div>
            )}

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating ..." : "Update Profile"}
            </button>
          </Form>
        </div>

      </div>
    </div>
  );
}