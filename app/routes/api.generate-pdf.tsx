import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chrome-aws-lambda";
import { ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json();
  const { html } = body;

  const isLocal = !process.env.AWS_REGION;

  const browser = await puppeteer.launch({
    args: isLocal ? [] : chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: isLocal
      ? process.env.CHROME_EXECUTABLE_PATH || "/usr/bin/google-chrome"
      : await chromium.executablePath,
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
  const pdfArrayBuffer = new Uint8Array(pdfBuffer).buffer;

  return new Response(pdfArrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=invoice.pdf",
    },
  });
}
