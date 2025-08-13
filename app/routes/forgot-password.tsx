import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, Link, useActionData, useNavigate, useNavigation } from '@remix-run/react';
import { useEffect } from 'react';
import User from '~/models/user.server';
import { getUserFromRequest } from '~/utils/auth.server';
import { connectToDatabase } from '~/utils/db.server';
import { sendPasswordResetEmail } from '~/utils/email';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (user) {
    return redirect('/');
  }
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;

  if (!email) {
    return json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    await connectToDatabase();
    
    const user = await User.findOne({ email, isActive: true });
    
    if (!user) {
      return json({ 
        success: true
      });
    }

    const resetCode = user.createPasswordResetToken();
    await user.save();

    const emailResult = await sendPasswordResetEmail(email, resetCode, user.username);
    
    if (!emailResult.success) {
      return json({ error: 'Failed to send reset email. Please try again.' }, { status: 500 });
    }

    return json({ 
      success: true
    });
  } catch (error) {
    return json({ error: 'Forgot password error.' }, { status: 500 });
  }
}

export default function ForgotPassword() {
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== "idle";
useEffect(() => {
  if (actionData && 'success' in actionData && actionData.success) {
    navigate('/reset-password', {
      state: {
        message: 'Verification code sent to your email address!',
        type: 'success',
      },
    });
  }
}, [actionData]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a verification code to reset your password.
          </p>
        </div>
        
        <Form method="post" className="mt-8 space-y-6">
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

          {actionData && 'error' in actionData && (
            <div className="text-red-600 text-sm text-center">
              {actionData.error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Reset Code"}
            </button>
          </div>

          <div className="text-center space-y-2">
            <Link
              to="/reset-password"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Already have a reset code? Reset password
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