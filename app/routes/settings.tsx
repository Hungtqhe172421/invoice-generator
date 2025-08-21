import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from '@remix-run/node'; // Adjust
import { useLoaderData } from '@remix-run/react';
import { z } from "zod";
import { zfd } from "zod-form-data";
import SettingsPage from '~/components/SettingsPage';
import { Settings } from '~/models/settings';
import { getUserFromRequest } from '~/utils/auth.server';
import { connectToDatabase } from '~/utils/db.server';

export const settingsSchema = zfd.formData({
  title: zfd.text(z.string().max(50).optional()),
  template: zfd.text(z.string().default("Classic")),
  fromName: zfd.text(z.string().max(50).optional()),
  fromEmail: zfd.text(z.string().email("Invalid email").optional()),
  fromAddress: zfd.text(z.string().max(50).optional()),
  fromPhone: zfd.text(z.string().max(50).optional()),
  businessNumber: zfd.text(z.string().max(50).optional()),
  logo: zfd.text(z.string().optional()),
  signature: zfd.text(z.string().optional()),
  color: zfd.text(z.string().regex(/^#([0-9A-Fa-f]{3,8})$/, "Invalid color")),
  currency: zfd.text(z.string().default("VND")),
  taxType: zfd.text(z.enum(["None", "GST", "VAT"]).default("None")),
  taxRate: zfd.numeric(z.number().min(0).max(100).default(0)),
});


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

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return redirect("/login");

    await connectToDatabase();
    const formData = await request.formData();

    const parsed = settingsSchema.safeParse(formData);
    if (!parsed.success) {
      return json(
        {
          success: false,
          error: "Validation failed",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }
    const normalizedData = Object.fromEntries(
      Object.entries(parsed.data).map(([key, value]) => [
        key,
        value === undefined ? '' : value,
      ])
    );


    const settingsData = {
      user: authUser.userId,
      ...normalizedData,
    };

    const existingSettings = await Settings.findOne({ user: authUser.userId });
    if (existingSettings) {
      await Settings.updateOne({ user: authUser.userId }, settingsData);
    } else {
      await Settings.create(settingsData);
    }

    return json({ success: true, message: "Settings saved successfully" });
  } catch (error) {
    return json({ success: false, error: "Failed to save settings" }, { status: 500 });
  }
};


export default function SettingsRoute() {
  const { settings } = useLoaderData<typeof loader>();
  return (<SettingsPage
    initialData={settings ? (settings as Partial<Settings>) : undefined}
  />
  );
}