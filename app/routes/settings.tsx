import { LoaderFunctionArgs, json, ActionFunctionArgs, redirect } from '@remix-run/node'; // Adjust
import { useLoaderData } from '@remix-run/react';
import SettingsPage from '~/components/SettingsPage';
import { Settings } from '~/models/settings';
import { getUserFromRequest } from '~/utils/auth.server';
import { connectToDatabase } from '~/utils/db.server';


export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return redirect('/login');
    }
    await connectToDatabase();
    const settings = await Settings.findOne({ user: authUser.userId }).lean();
    return json({ settings });
  } catch (error) {
    throw new Response('Internal Server Error', { status: 500 });
  }
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return redirect('/login');
    }
    await connectToDatabase();
    const formData = await request.formData();
    const settingsData = {
      user: authUser.userId,
      title: formData.get('title') as string,
      template: formData.get('template') as string,
      fromName: formData.get('fromName') as string,
      fromEmail: formData.get('fromEmail') as string,
      fromAddress: formData.get('fromAddress') as string,
      fromPhone: formData.get('fromPhone') as string,
      businessNumber: formData.get('businessNumber') as string,
      logo: formData.get('logo') as string,
      taxType: formData.get('taxType') as string,
      taxRate: parseFloat(formData.get('taxRate') as string) || 0,
      color: formData.get('color') as string,
      signature: formData.get('signature') as string,
      currency: formData.get('currency') as string
    };

    const existingSettings = await Settings.findOne({ user: authUser.userId });
    if (existingSettings) {
      await Settings.updateOne({ user: authUser.userId }, settingsData);
    } else {
      await Settings.create(settingsData);
    }

    return json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    return json({ success: false, error: 'Failed to save settings' }, { status: 500 });
  }
};

export default function SettingsRoute() {
  const { settings } = useLoaderData<typeof loader>();
  return (<SettingsPage
    initialData={settings ? (settings as Partial<Settings>) : undefined}
  />
  );
}