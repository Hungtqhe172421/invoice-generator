import puppeteer from "puppeteer";
import { ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json();
  const { html } = body;

  const browser = await puppeteer.launch({
    headless: "new" as any,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();
  const pdfArrayBuffer = new Uint8Array(pdfBuffer).buffer;

  return new Response(pdfArrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=invoice.pdf`,
    },
  });
};
