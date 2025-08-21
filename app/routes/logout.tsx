import { redirect } from '@remix-run/node';

export async function action() {
  return redirect('/signin', {
    headers: {
      'Set-Cookie': 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax'
    }
  });
}

export async function loader() {
  return redirect('/');
}