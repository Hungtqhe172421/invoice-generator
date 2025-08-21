// app/routes/verify-email.tsx
import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import User from "~/models/user.server";
import { getUserFromRequest } from "~/utils/auth.server";
import { connectToDatabase } from "~/utils/db.server";
import { sendWelcomeEmail } from "~/utils/email";


export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const email = url.searchParams.get('email');

  const user = getUserFromRequest(request);
  if (user) {
    return redirect(url.pathname + url.search, {
      headers: {
        'Set-Cookie': 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax'
      }
    });
  }

  if (!token || !email) {
    return json({
      success: false,
      error: 'Invalid verification link'
    }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const user = await User.findOne({
      email: decodeURIComponent(email),
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return json({
        success: false,
        error: 'Invalid user or verification token expired'
      }, { status: 400 });
    }

    if (user.isEmailVerified) {
      return json({
        success: true,
        message: 'Your email has already been verified',
        alreadyVerified: true
      });
    }

    user.isEmailVerified = true;
    user.isActive = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    await sendWelcomeEmail(user.email, user.username);

    return json({
      success: true,
      message: 'Email verified successfully! Your account is now active. You can sign in.',
      username: user.username
    });

  } catch (error) {
    return json({
      success: false,
      error: 'An error occurred during email verification'
    }, { status: 500 });
  }
}

export default function VerifyEmail() {
  const data = useLoaderData<typeof loader>();

  if (data.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {'alreadyVerified' in data && data.alreadyVerified ? 'Already Verified' : 'Email Verified!'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {'message' in data && data.message}
            </p>
            {'username' in data && data.username && !('alreadyVerified' in data && data.alreadyVerified) && (
              <p className="mt-4 text-center text-sm text-green-600">
                Welcome, {data.username}! 🎉
              </p>
            )}
            <div className="mt-6 space-y-4">
              <Link
                to="/signin"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign In to Your Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verification Failed
          </h2>

          {data && 'error' in data && (
            <div className="text-red-600 text-sm text-center">
              {data.error}
            </div>
          )}
          <div className="mt-6 space-y-4">
            <Link
              to="/resend-verification"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Request New Verification Email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}