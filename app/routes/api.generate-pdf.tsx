import { ActionFunctionArgs } from "@remix-run/node";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json();
  const { html } = body;

  // Launch serverless-compatible Chromium
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
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
      "Content-Disposition": `inline; filename="invoice.pdf"`,
    },
  });
}
