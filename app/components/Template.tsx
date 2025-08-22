import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { InvoiceData, InvoiceItem } from "~/models/invoice";
import { formatCurrency } from "~/utils/format";

export const invoiceTemplates = [
  {
    name: 'Classic',
    preview: '/Classic.png',
    component: ClassicTemplate
  },
  {
    name: 'Sharp',
    preview: '/Sharp.png',
    component: SharpTemplate
  },
  {
    name: 'Clean',
    preview: '/Clean.png',
    component: CleanTemplate
  },
  {
    name: 'Default',
    preview: '/Default.png',
    component: DefaultTemplate
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


const classicStyles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    paddingTop: 10,
    paddingBottom: 30,
    paddingHorizontal: 30,
    fontSize: 12,
    color: "#333",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "2 solid #ddd",
    borderBottom: "1 solid #ddd",
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: 20,
  },
  companyInfo: { maxWidth: "60%" },
  companyName: { fontSize: 18, fontWeight: "bold" },
  companyDetails: { marginTop: 5, fontSize: 11, lineHeight: 1.3 },
  label: { fontWeight: "bold" },
  logo: { width: 120, alignSelf: "flex-start" , objectFit: "contain"},

  clientSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  clientInfo: { fontSize: 11 },
  clientName: { fontWeight: "bold", marginBottom: 3 },
  rightMeta: { textAlign: "right", fontSize: 11 },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginBottom: 5,
  },

  invoiceNumberBlock: { marginBottom: 20 },
  invoiceLabel: { fontSize: 11, fontWeight: "bold", textTransform: "uppercase" },
  invoiceNumber: { fontSize: 12, marginTop: 3 },

  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1 solid #ddd",
    color: "#2d2d2d",
    textTransform: "uppercase",
  },
  headerCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
    fontWeight: "bold",
  },
  row: { flexDirection: "row", borderBottom: "1 solid #ddd" },
  cell: { flex: 1, padding: 8, fontSize: 10 },
  right: { textAlign: "right" },

  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
  },
  totalsTable: { width: 250 },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 11,
    marginBottom: 4,
  },
  totalBold: { fontWeight: "bold", borderTop: "1 solid #000", paddingTop: 4 },

  notes: { marginTop: 25, paddingTop: 10, borderTop: "1 solid #eee" },
  notesTitle: { fontSize: 11, fontWeight: "bold", textTransform: "uppercase", marginBottom: 5 },
  notesText: { fontSize: 10, lineHeight: 1.3 },

  signature: { marginTop: 35, alignItems: "center" },
  signatureImg: { width: 150, height: 80, objectFit: "contain", marginBottom: 8 },
  signatureDate: { fontSize: 10 },
});

export function ClassicTemplate({
  formData,
  items,
}: {
  formData: InvoiceData;
  items: InvoiceItem[];
}) {
  return (
    <Document>
      <Page size="A4" style={classicStyles.page}>
        <View style={[classicStyles.header, { borderTopColor: formData.color }]}>
          <View style={classicStyles.companyInfo}>
            <Text style={classicStyles.companyName}>{formData.fromName || "Company Name"}</Text>
            <View style={classicStyles.companyDetails}>
              {formData.fromAddress && <Text><Text style={classicStyles.label}>Address: </Text>{formData.fromAddress}</Text>}
              {formData.fromEmail && <Text><Text style={classicStyles.label}>Email: </Text>{formData.fromEmail}</Text>}
              {formData.fromPhone && <Text><Text style={classicStyles.label}>Phone: </Text>{formData.fromPhone}</Text>}
              {formData.businessNumber && <Text><Text style={classicStyles.label}>Business No: </Text>{formData.businessNumber}</Text>}
            </View>
          </View>
          {formData.logo && <Image src={formData.logo} style={classicStyles.logo} />}
        </View>

        <View style={classicStyles.clientSection}>
          <View style={classicStyles.clientInfo}>
            <Text style={{ fontSize: 11, marginBottom: 2 }}>Bill To</Text>
            <Text style={classicStyles.clientName}>{formData.billToName || "Client Name"}</Text>
            {formData.billToAddress && <Text><Text style={classicStyles.label}>Address: </Text>{formData.billToAddress}</Text>}
            {formData.billToEmail && <Text><Text style={classicStyles.label}>Email: </Text>{formData.billToEmail}</Text>}
            {formData.billToPhone && <Text><Text style={classicStyles.label}>Phone: </Text>{formData.billToPhone}</Text>}
            {formData.billToMobile && <Text><Text style={classicStyles.label}>Mobile: </Text>{formData.billToMobile}</Text>}
            {formData.billToFax && <Text><Text style={classicStyles.label}>Fax: </Text>{formData.billToFax}</Text>}
          </View>
          <View style={classicStyles.rightMeta}>
            <Text style={classicStyles.metaRow}>
              <Text style={{ fontWeight: "bold" }}>Date: </Text>
              {"\n"}
              <Text>{new Date(formData.date).toLocaleDateString()}</Text>
            </Text>
            <Text style={classicStyles.metaRow}>
              <Text style={{ fontWeight: "bold" }}>Due: </Text>
              {"\n"}
              <Text>{formData.terms}</Text>
            </Text>
            <Text style={classicStyles.metaRow}>
              <Text style={{ fontWeight: "bold" }}>Balance Due: </Text>
              {"\n"}
              <Text>{formatCurrency(formData.total, formData.currency)}</Text>
            </Text>
          </View>
        </View>

        <View style={classicStyles.invoiceNumberBlock}>
          <Text style={classicStyles.invoiceLabel}>Invoice</Text>
          <Text style={classicStyles.invoiceNumber}>{formData.invoiceNumber}</Text>
        </View>

        <View style={classicStyles.table}>
          <View style={classicStyles.tableHeader}>
            <Text style={[classicStyles.headerCell, { flex: 2 }]}>Description</Text>
            <Text style={[classicStyles.headerCell, classicStyles.right]}>Rate</Text>
            <Text style={[classicStyles.headerCell, classicStyles.right]}>Qty</Text>
            <Text style={[classicStyles.headerCell, classicStyles.right]}>Amount</Text>
            <Text style={[classicStyles.headerCell, classicStyles.right]}>Taxable</Text>
          </View>

          {items.map((item, i) => (
            <View key={i} style={classicStyles.row}>
              <Text style={[classicStyles.cell, { flex: 2 }]}>{item.description || "Item"}</Text>
              <Text style={[classicStyles.cell, classicStyles.right]}>
                {formatCurrency(item.rate, formData.currency)}
              </Text>
              <Text style={[classicStyles.cell, classicStyles.right]}>{item.quantity}</Text>
              <Text style={[classicStyles.cell, classicStyles.right]}>
                {formatCurrency(item.amount, formData.currency)}
              </Text>
              <Text style={[classicStyles.cell, classicStyles.right]}>  {item.taxable ? "√" : ""}</Text>
            </View>
          ))}
        </View>

        <View style={classicStyles.totalsSection}>
          <View style={classicStyles.totalsTable}>
            <View style={classicStyles.totalsRow}>
              <Text>Subtotal</Text>
              <Text>{formatCurrency(formData.subtotal, formData.currency)}</Text>
            </View>
            {formData.discountAmount > 0 && (
              <View style={classicStyles.totalsRow}>
                <Text>
                  Discount
                  {formData.discountType === "Percentage"
                    ? ` (${formData.discountValue}%)`
                    : ""}
                </Text>
                <Text>-{formatCurrency(formData.discountAmount, formData.currency)}</Text>
              </View>
            )}
            {formData.taxAmount > 0 && (
              <View style={classicStyles.totalsRow}>
                <Text>
                  {formData.taxType} ({formData.taxRate}%)
                </Text>
                <Text>{formatCurrency(formData.taxAmount, formData.currency)}</Text>
              </View>
            )}
            <View style={[classicStyles.totalsRow, classicStyles.totalBold]}>
              <Text>Total</Text>
              <Text>{formatCurrency(formData.total, formData.currency)}</Text>
            </View>
            <View style={[classicStyles.totalsRow, classicStyles.totalBold]}>
              <Text>Balance Due</Text>
              <Text>{formatCurrency(formData.total, formData.currency)}</Text>
            </View>
          </View>
        </View>

        {formData.notes && (
          <View style={classicStyles.notes}>
            <Text style={classicStyles.notesTitle}>Notes</Text>
            <Text style={classicStyles.notesText}>{formData.notes}</Text>
          </View>
        )}

        {formData.signature && (
          <View style={classicStyles.signature}>
            <Image src={formData.signature} style={classicStyles.signatureImg} />
            <Text style={classicStyles.signatureDate}>
              DATE SIGNED:{" "}
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
const sharpStyles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    paddingTop: 10,
    paddingBottom: 30,
    paddingHorizontal: 30,
    fontSize: 12,
    color: "#333",
  },

  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    borderTop: "2 solid #ddd",
    borderBottom: "1 solid #ddd",
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: 20,
  },
  companyInfo: { maxWidth: "60%",paddingLeft:20 },
  companyName: { fontSize: 18, fontWeight: "bold" },
  companyDetails: { marginTop: 5, fontSize: 11, lineHeight: 1.3 },
  label: { fontWeight: "bold" },
  logo: { width: 120, alignSelf: "flex-start" , objectFit: "contain"},

  clientSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  clientInfo: { fontSize: 11 },
  clientName: { fontWeight: "bold", marginBottom: 3 },
  rightMeta: { textAlign: "right", fontSize: 11 },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginBottom: 5,
  },

  invoiceNumberBlock: { marginBottom: 20 },
  invoiceLabel: { fontSize: 11, fontWeight: "bold", textTransform: "uppercase" },
  invoiceNumber: { fontSize: 12, marginTop: 3 },

  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#2d2d2d",
    color: "#fff",
    textTransform: "uppercase",
  },
  headerCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
    fontWeight: "bold",
  },
  row: { flexDirection: "row", borderBottom: "1 solid #ddd" },
  cell: { flex: 1, padding: 8, fontSize: 10 },
  right: { textAlign: "right" },

  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
  },
  totalsTable: { width: 250 },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 11,
    marginBottom: 4,
  },
  totalBold: { fontWeight: "bold", borderTop: "1 solid #000", paddingTop: 4 },

  notes: { marginTop: 25, paddingTop: 10, borderTop: "1 solid #eee" },
  notesTitle: { fontSize: 11, fontWeight: "bold", textTransform: "uppercase", marginBottom: 5 },
  notesText: { fontSize: 10, lineHeight: 1.3 },

  signature: { marginTop: 35, alignItems: "center" },
  signatureImg: { width: 150, height: 80, objectFit: "contain", marginBottom: 8 },
  signatureDate: { fontSize: 10 },
});

export function SharpTemplate({
  formData,
  items,
}: {
  formData: InvoiceData;
  items: InvoiceItem[];
}) {
  return (
    <Document>
      <Page size="A4" style={sharpStyles.page}>
        <View style={[sharpStyles.header, { borderTopColor: formData.color }]}>
          {formData.logo && <Image src={formData.logo} style={sharpStyles.logo} />}
          <View style={sharpStyles.companyInfo}>
            <Text style={sharpStyles.companyName}>{formData.fromName || "Company Name"}</Text>
            <View style={sharpStyles.companyDetails}>
              {formData.fromAddress && <Text><Text style={sharpStyles.label}>Address: </Text>{formData.fromAddress}</Text>}
              {formData.fromEmail && <Text><Text style={sharpStyles.label}>Email: </Text>{formData.fromEmail}</Text>}
              {formData.fromPhone && <Text><Text style={sharpStyles.label}>Phone: </Text>{formData.fromPhone}</Text>}
              {formData.businessNumber && <Text><Text style={sharpStyles.label}>Business No: </Text>{formData.businessNumber}</Text>}
            </View>
          </View>

        </View>

        <View style={sharpStyles.clientSection}>
          <View style={sharpStyles.clientInfo}>
            <Text style={{ fontSize: 11, marginBottom: 2 }}>Bill To</Text>
            <Text style={sharpStyles.clientName}>{formData.billToName || "Client Name"}</Text>
            {formData.billToAddress && <Text><Text style={sharpStyles.label}>Address: </Text>{formData.billToAddress}</Text>}
            {formData.billToEmail && <Text><Text style={sharpStyles.label}>Email: </Text>{formData.billToEmail}</Text>}
            {formData.billToPhone && <Text><Text style={sharpStyles.label}>Phone: </Text>{formData.billToPhone}</Text>}
            {formData.billToMobile && <Text><Text style={sharpStyles.label}>Mobile: </Text>{formData.billToMobile}</Text>}
            {formData.billToFax && <Text><Text style={sharpStyles.label}>Fax: </Text>{formData.billToFax}</Text>}
          </View>
          <View style={sharpStyles.rightMeta}>
            <Text style={sharpStyles.metaRow}>
              <Text style={{ fontWeight: "bold" }}>Date: </Text>
              {"\n"}
              <Text>{new Date(formData.date).toLocaleDateString()}</Text>
            </Text>
            <Text style={sharpStyles.metaRow}>
              <Text style={{ fontWeight: "bold" }}>Due: </Text>
              {"\n"}
              <Text>{formData.terms}</Text>
            </Text>
            <Text style={sharpStyles.metaRow}>
              <Text style={{ fontWeight: "bold" }}>Balance Due: </Text>
              {"\n"}
              <Text>{formatCurrency(formData.total, formData.currency)}</Text>
            </Text>
          </View>
        </View>

        <View style={sharpStyles.invoiceNumberBlock}>
          <Text style={sharpStyles.invoiceLabel}>Invoice</Text>
          <Text style={sharpStyles.invoiceNumber}>{formData.invoiceNumber}</Text>
        </View>

        <View style={sharpStyles.table}>
          <View style={sharpStyles.tableHeader}>
            <Text style={[sharpStyles.headerCell, { flex: 2 }]}>Description</Text>
            <Text style={[sharpStyles.headerCell, sharpStyles.right]}>Rate</Text>
            <Text style={[sharpStyles.headerCell, sharpStyles.right]}>Qty</Text>
            <Text style={[sharpStyles.headerCell, sharpStyles.right]}>Amount</Text>
            <Text style={[sharpStyles.headerCell, sharpStyles.right]}>Taxable</Text>
          </View>

          {items.map((item, i) => (
            <View key={i} style={sharpStyles.row}>
              <Text style={[sharpStyles.cell, { flex: 2 }]}>{item.description || "Item"}</Text>
              <Text style={[sharpStyles.cell, sharpStyles.right]}>
                {formatCurrency(item.rate, formData.currency)}
              </Text>
              <Text style={[sharpStyles.cell, sharpStyles.right]}>{item.quantity}</Text>
              <Text style={[sharpStyles.cell, sharpStyles.right]}>
                {formatCurrency(item.amount, formData.currency)}
              </Text>
              <Text style={[sharpStyles.cell, sharpStyles.right]}>  {item.taxable ? "√" : ""}</Text>
            </View>
          ))}
        </View>

        <View style={sharpStyles.totalsSection}>
          <View style={sharpStyles.totalsTable}>
            <View style={sharpStyles.totalsRow}>
              <Text>Subtotal</Text>
              <Text>{formatCurrency(formData.subtotal, formData.currency)}</Text>
            </View>
            {formData.discountAmount > 0 && (
              <View style={sharpStyles.totalsRow}>
                <Text>
                  Discount
                  {formData.discountType === "Percentage"
                    ? ` (${formData.discountValue}%)`
                    : ""}
                </Text>
                <Text>-{formatCurrency(formData.discountAmount, formData.currency)}</Text>
              </View>
            )}
            {formData.taxAmount > 0 && (
              <View style={sharpStyles.totalsRow}>
                <Text>
                  {formData.taxType} ({formData.taxRate}%)
                </Text>
                <Text>{formatCurrency(formData.taxAmount, formData.currency)}</Text>
              </View>
            )}
            <View style={[sharpStyles.totalsRow, sharpStyles.totalBold]}>
              <Text>Total</Text>
              <Text>{formatCurrency(formData.total, formData.currency)}</Text>
            </View>
            <View style={[sharpStyles.totalsRow, sharpStyles.totalBold]}>
              <Text>Balance Due</Text>
              <Text>{formatCurrency(formData.total, formData.currency)}</Text>
            </View>
          </View>
        </View>

        {formData.notes && (
          <View style={sharpStyles.notes}>
            <Text style={sharpStyles.notesTitle}>Notes</Text>
            <Text style={sharpStyles.notesText}>{formData.notes}</Text>
          </View>
        )}

        {formData.signature && (
          <View style={sharpStyles.signature}>
            <Image src={formData.signature} style={sharpStyles.signatureImg} />
            <Text style={sharpStyles.signatureDate}>
              DATE SIGNED:{" "}
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
const cleanStyles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    paddingTop: 10,
    paddingBottom: 30,
    paddingHorizontal: 30,
    fontSize: 12,
    color: "#333",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "2 solid #ddd",
    borderBottom: "1 solid #ddd",
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: 20,
  },
  companyInfo: { maxWidth: "60%",paddingRight:60 },
  companyName: { fontSize: 18, fontWeight: "bold" },
  companyDetails: { marginTop: 5, fontSize: 11, lineHeight: 1.3 },
  label: { fontWeight: "bold" },
  logo: { width: 120, alignSelf: "flex-start" , objectFit: "contain"},

  clientSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  clientInfo: { fontSize: 11 },
  clientName: { fontWeight: "bold", marginBottom: 3 },
  rightMeta: { textAlign: "right", fontSize: 11 },
  metaRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 200,
    marginBottom: 5,
  },

  invoiceNumberBlock: { marginBottom: 20 },
  invoiceLabel: { fontSize: 11, fontWeight: "bold", textTransform: "uppercase" },
  invoiceNumber: { fontSize: 12, marginTop: 3 },

  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#2d2d2d",
    color: "#fff",
    textTransform: "uppercase",
  },
  headerCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
    fontWeight: "bold",
  },
  row: { flexDirection: "row", borderBottom: "1 solid #ddd" },
  cell: { flex: 1, padding: 8, fontSize: 10 },
  right: { textAlign: "right" },

  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
  },
  totalsTable: { width: 250 },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 11,
    marginBottom: 4,
  },
  totalBold: { fontWeight: "bold", borderTop: "1 solid #000", paddingTop: 4 },

  notes: { marginTop: 25, paddingTop: 10, borderTop: "1 solid #eee" },
  notesTitle: { fontSize: 11, fontWeight: "bold", textTransform: "uppercase", marginBottom: 5 },
  notesText: { fontSize: 10, lineHeight: 1.3 },

  signature: { marginTop: 35, alignItems: "center" },
  signatureImg: { width: 150, height: 80, objectFit: "contain", marginBottom: 8 },
  signatureDate: { fontSize: 10 },
});

export function CleanTemplate({
  formData,
  items,
}: {
  formData: InvoiceData;
  items: InvoiceItem[];
}) {
  return (
    <Document>
      <Page size="A4" style={cleanStyles.page}>
        <View style={[cleanStyles.header, { borderTopColor: formData.color }]}>
          {formData.logo && <Image src={formData.logo} style={cleanStyles.logo} />}
          <View style={cleanStyles.companyInfo}>
            <Text style={cleanStyles.companyName}>{formData.fromName || "Company Name"}</Text>
            <View style={cleanStyles.companyDetails}>
              {formData.fromAddress && <Text><Text style={cleanStyles.label}>Address: </Text>{formData.fromAddress}</Text>}
              {formData.fromEmail && <Text><Text style={cleanStyles.label}>Email: </Text>{formData.fromEmail}</Text>}
              {formData.fromPhone && <Text><Text style={cleanStyles.label}>Phone: </Text>{formData.fromPhone}</Text>}
              {formData.businessNumber && <Text><Text style={cleanStyles.label}>Business No: </Text>{formData.businessNumber}</Text>}
            </View>
          </View>
          <View style={cleanStyles.rightMeta}>
            <Text style={cleanStyles.metaRow}>
              <Text style={{ fontWeight: "bold" }}>Date: </Text>
              {"\n"}
              <Text>{new Date(formData.date).toLocaleDateString()}</Text>
            </Text>
            <Text style={cleanStyles.metaRow}>
              <Text style={{ fontWeight: "bold" }}>Due: </Text>
              {"\n"}
              <Text>{formData.terms}</Text>
            </Text>
            <Text style={cleanStyles.metaRow}>
              <Text style={{ fontWeight: "bold" }}>Balance Due: </Text>
              {"\n"}
              <Text>{formatCurrency(formData.total, formData.currency)}</Text>
            </Text>
          </View>
        </View>

        <View style={cleanStyles.clientSection}>
          <View style={cleanStyles.clientInfo}>
            <Text style={{ fontSize: 11, marginBottom: 2 }}>Bill To</Text>
            <Text style={cleanStyles.clientName}>{formData.billToName || "Client Name"}</Text>
            {formData.billToAddress && <Text><Text style={cleanStyles.label}>Address: </Text>{formData.billToAddress}</Text>}
            {formData.billToEmail && <Text><Text style={cleanStyles.label}>Email: </Text>{formData.billToEmail}</Text>}
            {formData.billToPhone && <Text><Text style={cleanStyles.label}>Phone: </Text>{formData.billToPhone}</Text>}
            {formData.billToMobile && <Text><Text style={cleanStyles.label}>Mobile: </Text>{formData.billToMobile}</Text>}
            {formData.billToFax && <Text><Text style={cleanStyles.label}>Fax: </Text>{formData.billToFax}</Text>}
          </View>
        </View>

        <View style={cleanStyles.invoiceNumberBlock}>
          <Text style={cleanStyles.invoiceLabel}>Invoice</Text>
          <Text style={cleanStyles.invoiceNumber}>{formData.invoiceNumber}</Text>
        </View>

        <View style={cleanStyles.table}>
          <View style={cleanStyles.tableHeader}>
            <Text style={[cleanStyles.headerCell, { flex: 2 }]}>Description</Text>
            <Text style={[cleanStyles.headerCell, cleanStyles.right]}>Rate</Text>
            <Text style={[cleanStyles.headerCell, cleanStyles.right]}>Qty</Text>
            <Text style={[cleanStyles.headerCell, cleanStyles.right]}>Amount</Text>
            <Text style={[cleanStyles.headerCell, cleanStyles.right]}>Taxable</Text>
          </View>

          {items.map((item, i) => (
            <View key={i} style={cleanStyles.row}>
              <Text style={[cleanStyles.cell, { flex: 2 }]}>{item.description || "Item"}</Text>
              <Text style={[cleanStyles.cell, cleanStyles.right]}>
                {formatCurrency(item.rate, formData.currency)}
              </Text>
              <Text style={[cleanStyles.cell, cleanStyles.right]}>{item.quantity}</Text>
              <Text style={[cleanStyles.cell, cleanStyles.right]}>
                {formatCurrency(item.amount, formData.currency)}
              </Text>
              <Text style={[cleanStyles.cell, cleanStyles.right]}>  {item.taxable ? "√" : ""}</Text>
            </View>
          ))}
        </View>

        <View style={cleanStyles.totalsSection}>
          <View style={cleanStyles.totalsTable}>
            <View style={cleanStyles.totalsRow}>
              <Text>Subtotal</Text>
              <Text>{formatCurrency(formData.subtotal, formData.currency)}</Text>
            </View>
            {formData.discountAmount > 0 && (
              <View style={cleanStyles.totalsRow}>
                <Text>
                  Discount
                  {formData.discountType === "Percentage"
                    ? ` (${formData.discountValue}%)`
                    : ""}
                </Text>
                <Text>-{formatCurrency(formData.discountAmount, formData.currency)}</Text>
              </View>
            )}
            {formData.taxAmount > 0 && (
              <View style={cleanStyles.totalsRow}>
                <Text>
                  {formData.taxType} ({formData.taxRate}%)
                </Text>
                <Text>{formatCurrency(formData.taxAmount, formData.currency)}</Text>
              </View>
            )}
            <View style={[cleanStyles.totalsRow, cleanStyles.totalBold]}>
              <Text>Total</Text>
              <Text>{formatCurrency(formData.total, formData.currency)}</Text>
            </View>
            <View style={[cleanStyles.totalsRow, cleanStyles.totalBold]}>
              <Text>Balance Due</Text>
              <Text>{formatCurrency(formData.total, formData.currency)}</Text>
            </View>
          </View>
        </View>

        {formData.notes && (
          <View style={cleanStyles.notes}>
            <Text style={cleanStyles.notesTitle}>Notes</Text>
            <Text style={cleanStyles.notesText}>{formData.notes}</Text>
          </View>
        )}

        {formData.signature && (
          <View style={cleanStyles.signature}>
            <Image src={formData.signature} style={cleanStyles.signatureImg} />
            <Text style={cleanStyles.signatureDate}>
              DATE SIGNED:{" "}
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
const defaultStyles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    paddingTop: 10,
    paddingBottom: 30,
    paddingHorizontal: 30,
    fontSize: 12,
    color: "#333",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "2 solid #ddd",
    borderBottom: "1 solid #ddd",
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: 20,
  },
  companyInfo: { maxWidth: "60%",paddingRight:60 },
  companyName: { fontSize: 18, fontWeight: "bold" },
  companyDetails: { marginTop: 5, fontSize: 11, lineHeight: 1.3 },
  label: { fontWeight: "bold" },
  logo: { width: 120, alignSelf: "flex-start" , objectFit: "contain"},

  clientSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  clientInfo: { fontSize: 11 },
  clientName: { fontWeight: "bold", marginBottom: 3 },
  rightMeta: { textAlign: "right", fontSize: 11 },
  metaRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 200,
    marginBottom: 5,
  },

  invoiceNumberBlock: { marginBottom: 20 },
  invoiceLabel: { fontSize: 11, fontWeight: "bold", textTransform: "uppercase" },
  invoiceNumber: { fontSize: 12, marginTop: 3 },

  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#2d2d2d",
    color: "#fff",
    textTransform: "uppercase",
  },
  headerCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
    fontWeight: "bold",
  },
  row: { flexDirection: "row", borderBottom: "1 solid #ddd" },
  cell: { flex: 1, padding: 8, fontSize: 10 },
  right: { textAlign: "right" },

  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
  },
  totalsTable: { width: 250 },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 11,
    marginBottom: 4,
  },
  totalBold: { fontWeight: "bold", borderTop: "1 solid #000", paddingTop: 4 },

  notes: { marginTop: 25, paddingTop: 10, borderTop: "1 solid #eee" },
  notesTitle: { fontSize: 11, fontWeight: "bold", textTransform: "uppercase", marginBottom: 5 },
  notesText: { fontSize: 10, lineHeight: 1.3 },

  signature: { marginTop: 35, alignItems: "center" },
  signatureImg: { width: 150, height: 80, objectFit: "contain", marginBottom: 8 },
  signatureDate: { fontSize: 10 },
});

export function DefaultTemplate({
  formData,
  items,
}: {
  formData: InvoiceData;
  items: InvoiceItem[];
}) {
  return (
    <Document>
      <Page size="A4" style={defaultStyles.page}>
        <View style={[defaultStyles.header, { borderTopColor: formData.color }]}>
          {formData.logo && <Image src={formData.logo} style={defaultStyles.logo} />}
          <View style={defaultStyles.companyInfo}>
            <Text style={defaultStyles.companyName}>{formData.fromName || "Company Name"}</Text>
            <View style={defaultStyles.companyDetails}>
              {formData.fromAddress && <Text><Text style={defaultStyles.label}>Address: </Text>{formData.fromAddress}</Text>}
              {formData.fromEmail && <Text><Text style={defaultStyles.label}>Email: </Text>{formData.fromEmail}</Text>}
              {formData.fromPhone && <Text><Text style={defaultStyles.label}>Phone: </Text>{formData.fromPhone}</Text>}
              {formData.businessNumber && <Text><Text style={defaultStyles.label}>Business No: </Text>{formData.businessNumber}</Text>}
            </View>
          </View>
          <View style={defaultStyles.rightMeta}>
            <Text style={defaultStyles.metaRow}>
              <Text style={{ fontWeight: "bold" }}>Date: </Text>
              {"\n"}
              <Text>{new Date(formData.date).toLocaleDateString()}</Text>
            </Text>
            <Text style={defaultStyles.metaRow}>
              <Text style={{ fontWeight: "bold" }}>Due: </Text>
              {"\n"}
              <Text>{formData.terms}</Text>
            </Text>
            <Text style={defaultStyles.metaRow}>
              <Text style={{ fontWeight: "bold" }}>Balance Due: </Text>
              {"\n"}
              <Text>{formatCurrency(formData.total, formData.currency)}</Text>
            </Text>
          </View>
        </View>

        <View style={defaultStyles.clientSection}>
          <View style={defaultStyles.clientInfo}>
            <Text style={{ fontSize: 11, marginBottom: 2 }}>Bill To</Text>
            <Text style={defaultStyles.clientName}>{formData.billToName || "Client Name"}</Text>
            {formData.billToAddress && <Text><Text style={defaultStyles.label}>Address: </Text>{formData.billToAddress}</Text>}
            {formData.billToEmail && <Text><Text style={defaultStyles.label}>Email: </Text>{formData.billToEmail}</Text>}
            {formData.billToPhone && <Text><Text style={defaultStyles.label}>Phone: </Text>{formData.billToPhone}</Text>}
            {formData.billToMobile && <Text><Text style={defaultStyles.label}>Mobile: </Text>{formData.billToMobile}</Text>}
            {formData.billToFax && <Text><Text style={defaultStyles.label}>Fax: </Text>{formData.billToFax}</Text>}
          </View>
          <View style={defaultStyles.invoiceNumberBlock}>
            <Text style={defaultStyles.invoiceLabel}>Invoice</Text>
            <Text style={defaultStyles.invoiceNumber}>{formData.invoiceNumber}</Text>
          </View>
        </View>



        <View style={defaultStyles.table}>
          <View style={defaultStyles.tableHeader}>
            <Text style={[defaultStyles.headerCell, { flex: 2 }]}>Description</Text>
            <Text style={[defaultStyles.headerCell, defaultStyles.right]}>Rate</Text>
            <Text style={[defaultStyles.headerCell, defaultStyles.right]}>Qty</Text>
            <Text style={[defaultStyles.headerCell, defaultStyles.right]}>Amount</Text>
            <Text style={[defaultStyles.headerCell, defaultStyles.right]}>Taxable</Text>
          </View>

          {items.map((item, i) => (
            <View key={i} style={defaultStyles.row}>
              <Text style={[defaultStyles.cell, { flex: 2 }]}>{item.description || "Item"}</Text>
              <Text style={[defaultStyles.cell, defaultStyles.right]}>
                {formatCurrency(item.rate, formData.currency)}
              </Text>
              <Text style={[defaultStyles.cell, defaultStyles.right]}>{item.quantity}</Text>
              <Text style={[defaultStyles.cell, defaultStyles.right]}>
                {formatCurrency(item.amount, formData.currency)}
              </Text>
              <Text style={[defaultStyles.cell, defaultStyles.right]}>  {item.taxable ? "√" : ""}</Text>
            </View>
          ))}
        </View>

        <View style={defaultStyles.totalsSection}>
          <View style={defaultStyles.totalsTable}>
            <View style={defaultStyles.totalsRow}>
              <Text>Subtotal</Text>
              <Text>{formatCurrency(formData.subtotal, formData.currency)}</Text>
            </View>
            {formData.discountAmount > 0 && (
              <View style={defaultStyles.totalsRow}>
                <Text>
                  Discount
                  {formData.discountType === "Percentage"
                    ? ` (${formData.discountValue}%)`
                    : ""}
                </Text>
                <Text>-{formatCurrency(formData.discountAmount, formData.currency)}</Text>
              </View>
            )}
            {formData.taxAmount > 0 && (
              <View style={defaultStyles.totalsRow}>
                <Text>
                  {formData.taxType} ({formData.taxRate}%)
                </Text>
                <Text>{formatCurrency(formData.taxAmount, formData.currency)}</Text>
              </View>
            )}
            <View style={[defaultStyles.totalsRow, defaultStyles.totalBold]}>
              <Text>Total</Text>
              <Text>{formatCurrency(formData.total, formData.currency)}</Text>
            </View>
            <View style={[defaultStyles.totalsRow, defaultStyles.totalBold]}>
              <Text>Balance Due</Text>
              <Text>{formatCurrency(formData.total, formData.currency)}</Text>
            </View>
          </View>
        </View>

        {formData.notes && (
          <View style={defaultStyles.notes}>
            <Text style={defaultStyles.notesTitle}>Notes</Text>
            <Text style={defaultStyles.notesText}>{formData.notes}</Text>
          </View>
        )}

        {formData.signature && (
          <View style={defaultStyles.signature}>
            <Image src={formData.signature} style={defaultStyles.signatureImg} />
            <Text style={defaultStyles.signatureDate}>
              DATE SIGNED:{" "}
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

