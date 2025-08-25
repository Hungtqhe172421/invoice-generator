import { InvoiceData, InvoiceItem } from "~/models/invoice";
import { formatCurrency } from "~/utils/format";

export const invoiceTemplates = [
  {
    name: 'Classic',
    preview: '/Classic.png',
    generateHTML: generateClassicHTML
  },
  {
    name: 'Sharp',
    preview: '/Sharp.png',
    generateHTML: generateSharpHTML
  },
  {
    name: 'Clean',
    preview: '/Clean.png',
    generateHTML: generateCleanHTML
  }
  ,
  {
    name: 'Default',
    preview: '/Default.png',
    generateHTML: generateDefaultHTML
  }
];

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
}

export function TemplateSelector({
  selectedTemplate,
  onTemplateChange
}: TemplateSelectorProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Select a template style for your invoice
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {invoiceTemplates.map((template) => (
          <label
            key={template.name}
            className={`cursor-pointer border-2 rounded-lg p-3 transition-all hover:shadow-md ${selectedTemplate === template.name
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          >


            <div className="aspect-square mb-3 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
              <img
                src={template.preview}
                alt={`${template.name} preview`}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="text-center">
              <h4
                className={`font-semibold text-sm mb-1 ${selectedTemplate === template.name
                  ? 'text-blue-700'
                  : 'text-gray-900'
                  }`}
              >
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="template"
                    value={template.name}
                    checked={selectedTemplate === template.name}
                    onChange={() => onTemplateChange(template.name)}
                  />
                  {template.name}
                </label>
              </h4>
            </div>

          </label>
        ))}
      </div>
    </div>
  );
}

export function generateClassicHTML(formData: InvoiceData, items: InvoiceItem[]): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${formData.invoiceNumber}</title>
      <style>
        body { 
          border-top: 2px solid ${formData.color};
          font-family: Arial, sans-serif; 
          margin: 0;
          padding: 20px;
          color: #333;
          line-height: 1.4;
          font-size: 14px;
        }
        
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #ddd;
        }
        
        .left-section {
          flex: 1;
          display: flex;
          align-items: flex-start;
          gap: 20px;
        }
        
.logo { 
  flex-shrink: 0; 
  max-width: 240px; 
  max-height: 120px;
  object-fit: contain;
}
        .DESCRIPTION{
        text-align: left;
        }
        .company-info {
          flex: 1;
        }
        
        .company-name {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .company-details {
          font-size: 13px;
          line-height: 1.3;
        }
        
        .right-section {
          text-align: right;
          min-width: 200px;
        }
        
        .business-number {
          font-size: 13px;
          margin-bottom: 10px;
        }
        
        .invoice-number {
          font-size: 16px;
          margin-bottom: 15px;
        }
        
        .date-info {
          font-size: 13px;
          margin-bottom: 15px;
        }
        
        .date-info div {
          margin-bottom: 3px;
        }
      
        .client-section {
          margin-bottom: 30px;
        }
        
        .bill-to-label {
          font-weight: bold;
          font-size: 13px;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        
        .client-info {
          font-size: 13px;
          line-height: 1.4;
        }
        
        .client-name {
          font-weight: bold;
          margin-bottom: 3px;
        }
        
        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0;
          font-size: 13px;
        }
        
        .items-table th { 
          border-top: 1px solid #ddd;
          border-bottom: 1px solid #ddd;
          padding: 12px 8px;
          text-align: right;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 12px;
        }
        
        .items-table td { 
          border-top: 1px solid #ddd;
          border-bottom: 1px solid #ddd;
          padding: 12px 8px; 
          vertical-align: top;
        }
        
        .description-col {
          width: 50%;
        }
        
        .rate-col, .qty-col, .amount-col, .taxable-col{
          width: 16.67%;
          text-align: right;
        }
        
        .item-description {
          font-weight: bold;
          margin-bottom: 3px;
        }
        
        .item-details {
          font-size: 12px;
          color: #666;
        }
        
        .totals-section {
          display: flex;
          justify-content: flex-end;
          margin-top: 30px;
        }
        
        .totals-table {
          width: 300px;
          border-collapse: collapse;
          font-size: 13px;
        }
        
        .totals-table td {
          padding: 8px;
          border: none;
        }
        
        .totals-table .label-col {
          text-align: right;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .totals-table .amount-col {
          text-align: right;
          width: 100px;
        }
        
        .total-row {
          border-top: 1px solid #333;
          font-weight: bold;
        }
        
        .balance-due-row {
          border-top: 1px solid #333;
          font-weight: bolder;
        }
        
        .signature-section {
          margin-top: 40px;
          text-align: center;
        }
        
        .signature-image {
          max-width: 200px;
          max-height: 100px;
          margin: 10px 0;
        }
        
        .date-signed {
          font-size: 13px;
          font-weight: bold;
          margin-top: 10px;
        }
        
        .notes-section {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        
        .notes-title {
          font-weight: bold;
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        
        .footer {
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #666;
        }
        
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          .footer { position: fixed; bottom: 10px; }
        }
      </style>
    </head>
    <body>

      <div class="invoice-header">
        <div class="left-section">
          ${formData.logo ? `<img src="${formData.logo}" alt="Logo" class="logo" />` : ''}
          <div class="company-info">
            <div class="company-name">${formData.fromName || 'Company Name'}</div>
            <div class="company-details">
              ${formData.fromAddress ? `<div>${formData.fromAddress}</div>` : ''}
              ${formData.fromEmail ? `<div>${formData.fromEmail}</div>` : ''}
              ${formData.fromPhone ? `<div>Phone: ${formData.fromPhone}</div>` : ''}
              ${formData.businessNumber ? `<div>Business Number: ${formData.businessNumber}</div>` : ''}
            </div>
          </div>
        </div>
        
        <div class="right-section">
       
         <strong>  ${formData.title ? `<div class="title">${formData.title}</div>` : ''}</strong>
          <div class="invoice-number">${formData.invoiceNumber}</div>
          
          <div class="date-info">
            <div><strong>DATE</strong></div>
            <div>${new Date(formData.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            <div style="margin-top: 10px;"><strong>DUE DATE</strong></div>
            <div>${formData.terms}</div>
          </div>
          
        </div>
      </div>

      <div class="client-section">
        <div class="bill-to-label">BILL TO</div>
        <div class="client-info">
          <div class="client-name">${formData.billToName || 'Client Name'}</div>
          ${formData.billToAddress ? `<div>${formData.billToAddress}</div>` : ''}
          ${formData.billToEmail ? `<div>${formData.billToEmail}</div>` : ''}
          ${formData.billToPhone ? `<div>Phone: ${formData.billToPhone}</div>` : ''}
          ${formData.billToMobile ? `<div>Mobile: ${formData.billToMobile}</div>` : ''}
          ${formData.billToFax ? `<div>Fax: ${formData.billToFax}</div>` : ''}
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th class="description-col">  <div class="DESCRIPTION">DESCRIPTION </div> </th>
            <th class="rate-col">RATE</th>
            <th class="qty-col">QTY</th>
            <th class="amount-col">AMOUNT</th>
            <th class="taxable-col">TAXABLE</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td class="description-col">
                <div class="item-description">${item.description || 'Item Description'}</div>
                ${item.additionalDetails ? `<div class="item-details">${item.additionalDetails}</div>` : ''}
              </td>
              <td class="rate-col">${formatCurrency(item.rate, formData.currency)}</td>
              <td class="qty-col">${item.quantity}</td>
              <td class="amount-col">${formatCurrency(item.amount, formData.currency)}</td>
              <td class="taxable-col">${item.taxable ? '✔' : ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals-section">
        <table class="totals-table">
          <tr>
            <td class="label-col">SUBTOTAL</td>
            <td class="amount-col">${formatCurrency(formData.subtotal, formData.currency)}</td>
          </tr>
          ${formData.discountAmount > 0 ? `
            <tr>
              <td class="label-col">DISCOUNT${formData.discountType === 'Percentage' ? ` (${formData.discountValue}%)` : ''}</td>
              <td class="amount-col" >-${formatCurrency(formData.discountAmount, formData.currency)}</td>
            </tr>
          ` : ''}
          ${formData.taxAmount > 0 ? `
            <tr>
              <td class="label-col">${formData.taxType} (${formData.taxRate}%)</td>
              <td class="amount-col">${formatCurrency(formData.taxAmount, formData.currency)}</td>
            </tr>
          ` : ''}
          <tr class="total-row">
            <td class="label-col">TOTAL</td>
            <td class="amount-col">${formatCurrency(formData.total, formData.currency)}</td>
          </tr>
          <tr class="balance-due-row">
            <td class="label-col">BALANCE DUE</td>
            <td class="amount-col">${formatCurrency(formData.total, formData.currency)}</td>
          </tr>
        </table>
      </div>

      ${formData.notes ? `
        <div class="notes-section">
          <div class="notes-title">NOTES</div>
          <div>${formData.notes.replace(/\n/g, '<br>')}</div>
        </div>
      ` : ''}

      ${formData.signature ? `
        <div class="signature-section">
          <img src="${formData.signature}" alt="Signature" class="signature-image" />
          <div class="date-signed">
            <div>DATE SIGNED</div>
            <div>${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>
      ` : ''}


      <div class="no-print" style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()" style="background: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Print PDF</button>
        <button onclick="window.close()" style="background: #6b7280; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Close</button>
      </div>
    </body>
    </html>
  `;
}
export function generateSharpHTML(formData: InvoiceData, items: InvoiceItem[]): string {
  return `
    <!DOCTYPE html>
<html>
<head>
  <title>Invoice ${formData.invoiceNumber}</title>
  <style>
    body {
      border-top: 2px solid ${formData.color};
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      color: #333;
      font-size: 14px;
      line-height: 1.5;
    }

    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid #ddd;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }

    .company-info {
      max-width: 60%;
    }

    .company-name {
      font-weight: bold;
      font-size: 18px;
    }

    .company-details {
      font-size: 13px;
      margin-top: 5px;
    }
.logo { 
  flex-shrink: 0; 
  max-width: 240px; 
  max-height: 120px;
  object-fit: contain;
}

    .client-invoice-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }

          .bill-to-label {
          font-weight: bold;
          font-size: 13px;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

    .client-info {
      font-size: 13px;
    }

    .client-info .client-name {
      font-weight: bold;
    }

    .right-meta {
      text-align: right;
      font-size: 13px;
    }

    .right-meta div {
      margin-bottom: 5px;
    }

    table.items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin-bottom: 20px;
    }

    .items-table th {
      background-color: #2d2d2d;
      color: #fff;
      text-align: left;
      padding: 10px;
      font-size: 12px;
      text-transform: uppercase;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
    }

    .items-table td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
      vertical-align: top;
        -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
    }

    .items-table tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    .item-description {
      font-weight: bold;
    }

    .item-details {
      font-size: 12px;
      color: #666;
    }

    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .totals-table {
      width: 300px;
      font-size: 13px;
      border-collapse: collapse;
    }

    .totals-table td {
      padding: 8px 0;
    }

    .totals-table .label-col {
      text-align: right;
      text-transform: uppercase;
      font-weight: bold;
    }

    .totals-table .amount-col {
      text-align: right;
      width: 100px;
    }

    .total-row, .balance-due-row {
      border-top: 1px solid #000;
      font-weight: bold;
    }

    .notes-section {
      margin-top: 30px;
      border-top: 1px solid #eee;
      padding-top: 15px;
    }

    .notes-title {
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 5px;
    }

    .signature-section {
      margin-top: 40px;
      text-align: center;
        }
          .signature-image {
  max-width: 200px;
  max-height: 100px;
  margin: 10px 0;
  object-fit: contain;
}

    @media print {
      .no-print { display: none; }
    }
  </style>
</head>
<body>

  <div class="invoice-header">
    <div class="company-info">
      <div class="company-name">${formData.fromName || 'Company Name'}</div>
      <div class="company-details">
              ${formData.fromAddress ? `<div>${formData.fromAddress}</div>` : ''}
              ${formData.fromEmail ? `<div>${formData.fromEmail}</div>` : ''}
              ${formData.fromPhone ? `<div>Phone: ${formData.fromPhone}</div>` : ''}
              ${formData.businessNumber ? `<div>Business Number: ${formData.businessNumber}</div>` : ''}
      </div>
    </div>
              ${formData.logo ? `<img src="${formData.logo}" alt="Logo" class="logo" />` : ''}
  </div>

  <div class="client-invoice-section">
    <div class="client-info">
      <div class="bill-to-label">Bill To</div>
      <div class="client-name">${formData.billToName || 'Client Name'}</div>
          ${formData.billToAddress ? `<div>${formData.billToAddress}</div>` : ''}
          ${formData.billToEmail ? `<div>${formData.billToEmail}</div>` : ''}
          ${formData.billToPhone ? `<div>Phone: ${formData.billToPhone}</div>` : ''}
          ${formData.billToMobile ? `<div>Mobile: ${formData.billToMobile}</div>` : ''}
          ${formData.billToFax ? `<div>Fax: ${formData.billToFax}</div>` : ''}
    </div>
    <div class="right-meta">
      <div><strong>Date</strong><br>${new Date(formData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
      <div><strong>Due</strong><br>${formData.terms}</div>
      <div><strong>Balance Due</strong><br>${formatCurrency(formData.total, formData.currency)}</div>
    </div>
  </div>

  <div style="margin-bottom: 20px;">
  <div style="font-size: 13px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">Invoice</div>
  <div style="font-size: 14px;">${formData.invoiceNumber}</div>
</div>


  <table class="items-table">
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align:right;">Rate</th>
        <th style="text-align:right;">Qty</th>
        <th style="text-align:right;">Amount</th>
        <th style="text-align:right;">Taxable</th>
        
      </tr>
    </thead>
    <tbody>
      ${items.map(item => `
        <tr>
          <td>
            <div class="item-description">${item.description || 'Item'}</div>
            ${item.additionalDetails ? `<div class="item-details">${item.additionalDetails}</div>` : ''}
          </td>
          <td style="text-align:right;">${formatCurrency(item.rate, formData.currency)}</td>
          <td style="text-align:right;">${item.quantity}</td>
          <td style="text-align:right;">${formatCurrency(item.amount, formData.currency)}</td>
          <td style="text-align:right;">${item.taxable ? '✔' : ''}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals-section">
    <table class="totals-table">
      <tr>
        <td class="label-col">Subtotal</td>
        <td class="amount-col">${formatCurrency(formData.subtotal, formData.currency)}</td>
      </tr>
         ${formData.discountAmount > 0 ? `
            <tr>
              <td class="label-col">DISCOUNT${formData.discountType === 'Percentage' ? ` (${formData.discountValue}%)` : ''}</td>
              <td class="amount-col" >-${formatCurrency(formData.discountAmount, formData.currency)}</td>
            </tr>
          ` : ''}
          ${formData.taxAmount > 0 ? `
            <tr>
              <td class="label-col">${formData.taxType} (${formData.taxRate}%)</td>
              <td class="amount-col">${formatCurrency(formData.taxAmount, formData.currency)}</td>
            </tr>
          ` : ''}
      <tr class="total-row">
        <td class="label-col">Total</td>
        <td class="amount-col">${formatCurrency(formData.total, formData.currency)}</td>
      </tr>
      <tr class="balance-due-row">
        <td class="label-col">Balance Due</td>
        <td class="amount-col">${formatCurrency(formData.total, formData.currency)}</td>
      </tr>
    </table>
  </div>

  ${formData.notes ? `
  <div class="notes-section">
    <div class="notes-title">Notes</div>
    <div>${formData.notes.replace(/\n/g, '<br>')}</div>
  </div>` : ''}

      ${formData.signature ? `
        <div class="signature-section">
          <img src="${formData.signature}" alt="Signature" class="signature-image" />
          <div class="date-signed">
            <div>DATE SIGNED</div>
            <div>${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>
      ` : ''}

  <div class="no-print" style="text-align:center; margin-top: 30px;">
    <button onclick="window.print()" style="padding:10px 20px; background:#2563eb; color:white; border:none; border-radius:5px; margin-right:10px;">Print PDF</button>
    <button onclick="window.close()" style="padding:10px 20px; background:#6b7280; color:white; border:none; border-radius:5px;">Close</button>
  </div>

</body>
</html>

  `;
}

function generateCleanHTML(formData: InvoiceData, items: InvoiceItem[]): string {
  return `
    <!DOCTYPE html>
<html>
<head>
  <title>Invoice ${formData.invoiceNumber}</title>
  <style>
    body {
      border-top: 2px solid ${formData.color};
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      color: #333;
      font-size: 14px;
      line-height: 1.5;
    }

   .invoice-header {
  display: flex;
  justify-content: space-between; 
  align-items: flex-start; 
  border-bottom: 1px solid #ddd;
  padding-bottom: 20px;
  margin-bottom: 20px;
  gap: 20px; 
}

.logo { 
  flex-shrink: 0; 
  max-width: 240px; 
  max-height: 120px;
  object-fit: contain;
}

.company-info {
  text-align: left;
}

.company-name {
  font-weight: bold;
  font-size: 18px;
}

.company-details {
  font-size: 13px;
  margin-top: 5px;
}

        .bill-to-label {
          font-weight: bold;
          font-size: 13px;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

.right-meta {
  text-align: right;
  font-size: 13px;
}

.right-meta div {
  margin-bottom: 5px;
}

    table.items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin-bottom: 20px;
    }

    .items-table th {
      background-color: #2d2d2d;
      color: #fff;
      text-align: left;
      padding: 10px;
      font-size: 12px;
      text-transform: uppercase;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
    }

    .items-table td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
      vertical-align: top;
        -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
    }

    .items-table tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    .item-description {
      font-weight: bold;
    }

    .item-details {
      font-size: 12px;
      color: #666;
    }

    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .totals-table {
      width: 300px;
      font-size: 13px;
      border-collapse: collapse;
    }

    .totals-table td {
      padding: 8px 0;
    }

    .totals-table .label-col {
      text-align: right;
      text-transform: uppercase;
      font-weight: bold;
    }

    .totals-table .amount-col {
      text-align: right;
      width: 100px;
    }

    .total-row, .balance-due-row {
      border-top: 1px solid #000;
      font-weight: bold;
    }

    .notes-section {
      margin-top: 30px;
      border-top: 1px solid #eee;
      padding-top: 15px;
    }

    .notes-title {
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 5px;
    }

    .signature-section {
      margin-top: 40px;
      text-align: center;
        }
          .signature-image {
  max-width: 200px;
  max-height: 100px;
  margin: 10px 0;
  object-fit: contain;
}

    @media print {
      .no-print { display: none; }
    }
  </style>
</head>
<body>

<div class="invoice-header">
  <div style="display:flex; gap:15px; align-items:flex-start;">
    ${formData.logo ? `<img src="${formData.logo}" alt="Logo" class="logo" />` : ''}
    <div class="company-info">
      <div class="company-name">${formData.fromName || 'Company Name'}</div>
      <div class="company-details">
             ${formData.fromAddress ? `<div>${formData.fromAddress}</div>` : ''}
             ${formData.fromEmail ? `<div>${formData.fromEmail}</div>` : ''}
            ${formData.fromPhone ? `<div>Phone: ${formData.fromPhone}</div>` : ''}
            ${formData.businessNumber ? `<div>Business Number: ${formData.businessNumber}</div>` : ''}
      </div>
    </div>
  </div>

  <div class="right-meta">
    <div><strong>Date</strong><br>${new Date(formData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
    <div><strong>Due</strong><br>${formData.terms}</div>
    <div><strong>Balance Due</strong><br>${formatCurrency(formData.total, formData.currency)}</div>
  </div>
</div>


  <div class="client-invoice-section">
    <div class="client-info">
      <div class="bill-to-label">Bill To</div>
      <div class="client-name">${formData.billToName || 'Client Name'}</div>
          ${formData.billToAddress ? `<div>${formData.billToAddress}</div>` : ''}
          ${formData.billToEmail ? `<div>${formData.billToEmail}</div>` : ''}
          ${formData.billToPhone ? `<div>Phone: ${formData.billToPhone}</div>` : ''}
          ${formData.billToMobile ? `<div>Mobile: ${formData.billToMobile}</div>` : ''}
          ${formData.billToFax ? `<div>Fax: ${formData.billToFax}</div>` : ''}
    </div>

  </div>

<div style="margin-top: 15px;margin-bottom: 15px">
  <div style="font-size: 13px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">Invoice</div>
  <div style="font-size: 14px;">${formData.invoiceNumber}</div>
</div>


  <table class="items-table">
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align:right;">Rate</th>
        <th style="text-align:right;">Qty</th>
        <th style="text-align:right;">Amount</th>
        <th style="text-align:right;">Taxable</th>
        
      </tr>
    </thead>
    <tbody>
      ${items.map(item => `
        <tr>
          <td>
            <div class="item-description">${item.description || 'Item'}</div>
            ${item.additionalDetails ? `<div class="item-details">${item.additionalDetails}</div>` : ''}
          </td>
          <td style="text-align:right;">${formatCurrency(item.rate, formData.currency)}</td>
          <td style="text-align:right;">${item.quantity}</td>
          <td style="text-align:right;">${formatCurrency(item.amount, formData.currency)}</td>
          <td style="text-align:right;">${item.taxable ? '✔' : ''}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals-section">
    <table class="totals-table">
      <tr>
        <td class="label-col">Subtotal</td>
        <td class="amount-col">${formatCurrency(formData.subtotal, formData.currency)}</td>
      </tr>
         ${formData.discountAmount > 0 ? `
            <tr>
<td class="label-col">DISCOUNT${formData.discountType === 'Percentage' ? ` (${formData.discountValue}%)` : ''}</td>
              <td class="amount-col" >-${formatCurrency(formData.discountAmount, formData.currency)}</td>
            </tr>
          ` : ''}
          ${formData.taxAmount > 0 ? `
            <tr>
              <td class="label-col">${formData.taxType} (${formData.taxRate}%)</td>
              <td class="amount-col">${formatCurrency(formData.taxAmount, formData.currency)}</td>
            </tr>
          ` : ''}
      <tr class="total-row">
        <td class="label-col">Total</td>
        <td class="amount-col">${formatCurrency(formData.total, formData.currency)}</td>
      </tr>
      <tr class="balance-due-row">
        <td class="label-col">Balance Due</td>
        <td class="amount-col">${formatCurrency(formData.total, formData.currency)}</td>
      </tr>
    </table>
  </div>

  ${formData.notes ? `
  <div class="notes-section">
    <div class="notes-title">Notes</div>
    <div>${formData.notes.replace(/\n/g, '<br>')}</div>
  </div>` : ''}

      ${formData.signature ? `
        <div class="signature-section">
          <img src="${formData.signature}" alt="Signature" class="signature-image" />
          <div class="date-signed">
            <div>DATE SIGNED</div>
            <div>${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>
      ` : ''}

  <div class="no-print" style="text-align:center; margin-top: 30px;">
    <button onclick="window.print()" style="padding:10px 20px; background:#2563eb; color:white; border:none; border-radius:5px; margin-right:10px;">Print PDF</button>
    <button onclick="window.close()" style="padding:10px 20px; background:#6b7280; color:white; border:none; border-radius:5px;">Close</button>
  </div>

</body>
</html>

  `;
}
function generateDefaultHTML(formData: InvoiceData, items: InvoiceItem[]): string {
  return `
    <!DOCTYPE html>
<html>
<head>
  <title>Invoice ${formData.invoiceNumber}</title>
  <style>
    body {
      border-top: 2px solid ${formData.color};
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      color: #333;
      font-size: 14px;
      line-height: 1.5;
    }

   .invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; 
  border-bottom: 1px solid #ddd;
  padding-bottom: 20px;
  margin-bottom: 20px;
  gap: 20px; 
}
   .client-invoice-section {
  display: flex;
  justify-content: space-between; 
  align-items: flex-start; 
}

.logo { 
  flex-shrink: 0;
  max-width: 240px; 
  max-height: 120px;
  object-fit: contain;
}

.company-info {
  text-align: left;
}

.company-name {
  font-weight: bold;
  font-size: 18px;
}

.company-details {
  font-size: 13px;
  margin-top: 5px;
}

        .bill-to-label {
          font-weight: bold;
          font-size: 13px;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

.right-meta {
  text-align: right;
  font-size: 13px;
}

.right-meta div {
  margin-bottom: 5px;
}

    table.items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin-bottom: 20px;
    }

    .items-table th {
      background-color: #000000ff;
      color: #fff;
      text-align: left;
      padding: 10px;
      font-size: 12px;
      text-transform: uppercase;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
    }

    .items-table td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
      vertical-align: top;
        -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
    }

    .items-table tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    .item-description {
      font-weight: bold;
    }

    .item-details {
      font-size: 12px;
      color: #666;
    }

    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .totals-table {
      width: 300px;
      font-size: 13px;
      border-collapse: collapse;
    }

    .totals-table td {
      padding: 8px 0;
    }

    .totals-table .label-col {
      text-align: right;
      text-transform: uppercase;
      font-weight: bold;
    }

    .totals-table .amount-col {
      text-align: right;
      width: 100px;
    }

    .total-row, .balance-due-row {
      border-top: 1px solid #000;
      font-weight: bold;
    }

    .notes-section {
      margin-top: 30px;
      border-top: 1px solid #eee;
      padding-top: 15px;
    }

    .notes-title {
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 5px;
    }

    .signature-section {
      margin-top: 40px;
      text-align: center;
        }
          .signature-image {
  max-width: 200px;
  max-height: 100px;
  margin: 10px 0;
  object-fit: contain;
}

    @media print {
      .no-print { display: none; }
    }
  </style>
</head>
<body>

<div class="invoice-header">
  <div style="display:flex; gap:15px; align-items:flex-start;">
    ${formData.logo ? `<img src="${formData.logo}" alt="Logo" class="logo" />` : ''}
    <div class="company-info">
      <div class="company-name">${formData.fromName || 'Company Name'}</div>
      <div class="company-details">
             ${formData.fromAddress ? `<div>${formData.fromAddress}</div>` : ''}
             ${formData.fromEmail ? `<div>${formData.fromEmail}</div>` : ''}
            ${formData.fromPhone ? `<div>Phone: ${formData.fromPhone}</div>` : ''}
            ${formData.businessNumber ? `<div>Business Number: ${formData.businessNumber}</div>` : ''}
      </div>
    </div>
  </div>


</div>


  <div class="client-invoice-section">
    <div class="client-info">
      <div class="bill-to-label">Bill To</div>
      <div class="client-name">${formData.billToName || 'Client Name'}</div>
          ${formData.billToAddress ? `<div>${formData.billToAddress}</div>` : ''}
          ${formData.billToEmail ? `<div>${formData.billToEmail}</div>` : ''}
          ${formData.billToPhone ? `<div>Phone: ${formData.billToPhone}</div>` : ''}
          ${formData.billToMobile ? `<div>Mobile: ${formData.billToMobile}</div>` : ''}
          ${formData.billToFax ? `<div>Fax: ${formData.billToFax}</div>` : ''}
    </div>
    <div class="right-meta">
      <div><strong>Date</strong><br>${new Date(formData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
      <div><strong>Due</strong><br>${formData.terms}</div>
      <div><strong>Balance Due</strong><br>${formatCurrency(formData.total, formData.currency)}</div>
    </div>
  </div>

<div style="margin-top: 15px;margin-bottom: 15px">
  <div style="font-size: 13px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">Invoice</div>
  <div style="font-size: 14px;">${formData.invoiceNumber}</div>
</div>


  <table class="items-table">
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align:right;">Rate</th>
        <th style="text-align:right;">Qty</th>
        <th style="text-align:right;">Amount</th>
        <th style="text-align:right;">Taxable</th>
        
      </tr>
    </thead>
    <tbody>
      ${items.map(item => `
        <tr>
          <td>
            <div class="item-description">${item.description || 'Item'}</div>
            ${item.additionalDetails ? `<div class="item-details">${item.additionalDetails}</div>` : ''}
          </td>
          <td style="text-align:right;">${formatCurrency(item.rate, formData.currency)}</td>
          <td style="text-align:right;">${item.quantity}</td>
          <td style="text-align:right;">${formatCurrency(item.amount, formData.currency)}</td>
          <td style="text-align:right;">${item.taxable ? '✔' : ''}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals-section">
    <table class="totals-table">
      <tr>
        <td class="label-col">Subtotal</td>
        <td class="amount-col">${formatCurrency(formData.subtotal, formData.currency)}</td>
      </tr>
         ${formData.discountAmount > 0 ? `
            <tr>
<td class="label-col">DISCOUNT${formData.discountType === 'Percentage' ? ` (${formData.discountValue}%)` : ''}</td>
              <td class="amount-col" >-${formatCurrency(formData.discountAmount, formData.currency)}</td>
            </tr>
          ` : ''}
          ${formData.taxAmount > 0 ? `
            <tr>
              <td class="label-col">${formData.taxType} (${formData.taxRate}%)</td>
              <td class="amount-col">${formatCurrency(formData.taxAmount, formData.currency)}</td>
            </tr>
          ` : ''}
      <tr class="total-row">
        <td class="label-col">Total</td>
        <td class="amount-col">${formatCurrency(formData.total, formData.currency)}</td>
      </tr>
      <tr class="balance-due-row">
        <td class="label-col">Balance Due</td>
        <td class="amount-col">${formatCurrency(formData.total, formData.currency)}</td>
      </tr>
    </table>
  </div>

  ${formData.notes ? `
  <div class="notes-section">
    <div class="notes-title">Notes</div>
    <div>${formData.notes.replace(/\n/g, '<br>')}</div>
  </div>` : ''}

      ${formData.signature ? `
        <div class="signature-section">
          <img src="${formData.signature}" alt="Signature" class="signature-image" />
          <div class="date-signed">
            <div>DATE SIGNED</div>
            <div>${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>
      ` : ''}

  <div class="no-print" style="text-align:center; margin-top: 30px;">
    <button onclick="window.print()" style="padding:10px 20px; background:#2563eb; color:white; border:none; border-radius:5px; margin-right:10px;">Print PDF</button>
    <button onclick="window.close()" style="padding:10px 20px; background:#6b7280; color:white; border:none; border-radius:5px;">Close</button>
  </div>

</body>
</html>

  `;
}
