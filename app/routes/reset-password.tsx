import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, Link, useActionData, useLocation, useNavigation } from '@remix-run/react';
import { useEffect, useState } from 'react';
import User from '~/models/user.server';
import { getUserFromRequest, hashPassword } from '~/utils/auth.server';
import { connectToDatabase } from '~/utils/db.server';


export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (user) {
    return redirect('/reset-password', {
      headers: {
        'Set-Cookie': 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax'
      }
    });

  }
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const resetCode = formData.get('resetCode') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!email || !resetCode || !password || !confirmPassword) {
    return json({ error: 'All fields are required' }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return json({ error: 'Passwords do not match' }, { status: 400 });
  }

  if (password.length < 6) {
    return json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const user = await User.findOne({
      email,
      resetPasswordToken: resetCode,
      resetPasswordExpires: { $gt: new Date() },
      isActive: true
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return json({ error: 'Invalid user or expired reset code' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return json({
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.'
    });
  } catch {
    return json({ error: 'Reset password error.' }, { status: 500 });
  }
}

export default function ResetPassword() {
  const actionData = useActionData<typeof action>();
  const [showStatus, setShowStatus] = useState(false);
  const location = useLocation();
  const navigation = useNavigation();
  const isSubmitting = navigation.state == "submitting";
  useEffect(() => {
    if (location.state?.message) {
      setShowStatus(true);
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  if (actionData && 'success' in actionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-green-600 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
            <p className="text-gray-600 mb-6">{actionData.message}</p>
            <Link
              to="/signin"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-md w-full space-y-8">
        {showStatus && location.state?.message && (
          <div className={`mb-4 p-4 rounded-md ${location.state.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
            <div className="flex justify-between items-center">
              <span className="font-medium">{location.state.message}</span>
              <button
                onClick={() => setShowStatus(false)}
                className="text-gray-400 hover:text-gray-600 ml-4"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the verification code sent to your email and your new password.
          </p>
        </div>

        <Form method="post" className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label htmlFor="resetCode" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <input
                id="resetCode"
                name="resetCode"
                type="text"
                required
                maxLength={6}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
                placeholder="000000"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm new password"
              />
            </div>
          </div>


          {actionData && 'error' in actionData && (
            <div className="text-red-600 text-sm text-center">
              {actionData.error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? "Changing ..." : "Reset Password"}
            </button>
          </div>

          <div className="text-center space-y-2">
            <Link
              to="/forgot-password"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Did not receive a code? Request new one
            </Link>
            <div>
              <Link
                to="/signin"
                className="font-medium text-gray-600 hover:text-gray-500"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}