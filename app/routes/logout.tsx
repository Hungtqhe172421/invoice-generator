import { redirect, type ActionFunctionArgs } from '@remix-run/node';

export async function action({ request }: ActionFunctionArgs) {
  return redirect('/signin', {
    headers: {
      'Set-Cookie': 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax'
    }
  });
}

export async function loader() {
  return redirect('/');
}