// app/routes/resend-verification.tsx
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation, Link, useSearchParams, redirect } from "@remix-run/react";
import User from "~/models/user.server";
import { getUserFromRequest } from "~/utils/auth.server";
import { connectToDatabase } from "~/utils/db.server";
import { sendVerificationEmail } from "~/utils/email";


export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (user) {
   return redirect('/resend-verification', {
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
  try {
    await connectToDatabase();
    
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return json({ 
        success: true, 
        message: 'A verification email has been sent.',
        email: email
      });
    }

    if (user.isEmailVerified) {
      return json({ 
        error: 'This email address is already verified.',
        alreadyVerified: true
      }, { status: 400 });
    }

    if (!user.isActive && user.isEmailVerified) {
      return json({ 
        error: 'Your account has been deactivated.' 
      }, { status: 403 });
    }

    const verificationToken = user.createEmailVerificationToken();
    await user.save();

    const emailResult = await sendVerificationEmail(user.email, user.username, verificationToken);
    
    if (!emailResult.success) {
      return json({ 
        error: 'Failed to send verification email' 
      }, { status: 500 });
    }

    return json({ 
      success: true, 
      message: 'Verification email sent successfully!',
      email: user.email,
    });

  } catch (error) {
    return json({ 
      error: 'Error.' 
    }, { status: 500 });
  }
}

export default function ResendVerification() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state == "submitting";

  if (actionData && 'success' in actionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verification Email Sent
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {actionData.message}
            </p>
            {actionData.email && (
              <p className="mt-2 text-center text-sm text-gray-500">
                Sent to: <strong>{actionData.email}</strong>
              </p>
            )}
            <div className="mt-6 space-y-3">
              <Link
                to="/signin"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Sign In
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
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Resend Verification Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address to receive a new verification link
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

          {actionData && 'error' in actionData  && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {(actionData && 'alreadyVerified' in actionData)? 'Email Already Verified' : 'Error sending mail'}
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {actionData.error}
                  </div>
                  {actionData && 'alreadyVerified' in actionData  && (
                    <div className="mt-3">
                      <Link
                        to="/signin"
                        className="text-sm font-medium text-red-800 underline hover:text-red-600"
                      >
                        Go to Sign In
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
               disabled={isSubmitting}
            >
              {isSubmitting ? "Sending ..." : "Send Verification Email"}
            </button>
          </div>

          <div className="text-center space-y-2">
            <Link
              to="/signin"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
               Back to Sign In
            </Link>
          </div>
        </Form>

      </div>
    </div>
  );
}