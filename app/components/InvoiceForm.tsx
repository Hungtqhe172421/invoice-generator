import { useState, useEffect, useRef } from 'react';
import { Form, useActionData, useNavigate, useNavigation, useSubmit } from '@remix-run/react';
import ColorPicker from '../components/ColorPicker';
import TaxSelector from '../components/TaxSelector';
import DiscountSelector from '../components/DiscountSelector';
import type { InvoiceData, InvoiceItem } from '~/models/invoice';
import SignatureDrawer from '../components/SignatureDrawer';
import { formatCurrency, invoiceTemplates, TemplateSelector } from './Template';
import CurrencySelector from './CurrencySelector';

interface InvoiceFormProps {
  initialData?: Partial<InvoiceData>;
}

export default function InvoiceForm({ initialData }: InvoiceFormProps) {
  const [formData, setFormData] = useState<InvoiceData>({
    title: 'Invoice',
    template: 'Classic',
    fromName: '',
    fromEmail: '',
    fromAddress: '',
    fromPhone: '',
    businessNumber: '',
    billToName: '',
    billToEmail: '',
    billToAddress: '',
    billToPhone: '',
    billToMobile: '',
    billToFax: '',
    logo: '',
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    terms: 'On Receipt',
    notes: '',
    signature: '',
    color: '#ffffffff',
    currency: 'VND',
    taxType: 'None',
    taxRate: 10,
    discountType: 'None',
    discountValue: 0,
    items: [],
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    total: 0,
    balanceDue: 0,
    user: '',
    ...initialData
  });
  const [items, setItems] = useState<InvoiceItem[]>(
    initialData?.items && initialData.items.length > 0
      ? initialData.items
      : [{
        description: '',
        additionalDetails: '',
        rate: 0,
        quantity: 1,
        amount: 0,
        taxable: true
      }]
  );

  const submit = useSubmit();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saveStatus, setSaveStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });
  const actionData = useActionData<{ success: boolean; error?: string }>();
  const navigation = useNavigation();
const isSubmitting = navigation.state !== "idle";

  useEffect(() => {
    if (actionData?.success) {
      navigate('/invoices-list', {
        state: {
          message: 'Invoice saved successfully!',
          type: 'success',
        },
      });
    } else if (actionData?.error) {
      setSaveStatus({ type: 'error', message: actionData.error });
    }
  }, [actionData]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveStatus({ type: 'info', message: 'Submitting invoice form...' });
    submit(formRef.current, { method: 'post' });
  };


  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

  const discountAmount = formData.discountType !== 'None'
    ? formData.discountType === 'Percentage'
      ? (subtotal * Number(formData.discountValue)) / 100
      : Number(formData.discountValue)
    : 0;

  const subtotalAfterDiscount = subtotal - discountAmount;

  const taxableSubtotalBeforeDiscount = items
    .filter(item => item.taxable)
    .reduce((sum, item) => sum + item.amount, 0);

  const taxableDiscountAmount = formData.discountType !== 'None' && taxableSubtotalBeforeDiscount > 0
    ? (discountAmount * taxableSubtotalBeforeDiscount) / subtotal
    : 0;

  const taxableSubtotalAfterDiscount = taxableSubtotalBeforeDiscount - taxableDiscountAmount;

  const taxAmount = formData.taxType !== 'None' && (formData.taxRate ?? 0) > 0 && taxableSubtotalAfterDiscount > 0
    ? (taxableSubtotalAfterDiscount * Number(formData.taxRate ?? 0)) / 100
    : 0;

  const total = Math.max(subtotalAfterDiscount + taxAmount, 0);




  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    if (field === 'rate' || field === 'quantity') {
      updatedItems[index].amount = updatedItems[index].rate * updatedItems[index].quantity;
    }
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', additionalDetails: '', rate: 0, quantity: 1, amount: 0, taxable: true }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logo: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFilePicker = () => fileInputRef.current?.click();


  const generatePDF = async () => {
    try {
      const printWindow = window.open('Invoice', '_blank');
      if (!printWindow) {
        setSaveStatus({ type: 'error', message: 'Please allow popups to generate PDF' });
        return;
      }

      const updatedFormData = {
        ...formData,
        subtotal: subtotal,
        taxAmount: taxAmount,
        discountAmount: discountAmount,
        total: total,
        balanceDue: total
      };

      setFormData(updatedFormData);

      const template = invoiceTemplates.find(t => t.name == formData.template);
      if (!template) {
        setSaveStatus({ type: 'error', message: 'Template not found' });
        return;
      }

      const invoiceHTML = template.generateHTML(updatedFormData, items);
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    } catch (error) {
      setSaveStatus({ type: 'error', message: 'Failed to generate PDF' });
    }
  };


  return (

    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gray-50 rounded-lg">
          {saveStatus.type && (
            <div className={`p-4 mb-6 rounded-md ${saveStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              saveStatus.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {saveStatus.type === 'success' && <span>✅</span>}
                  {saveStatus.type === 'error' && <span>❌</span>}
                  {saveStatus.type === 'info' && <span>ℹ️</span>}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{saveStatus.message}</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 bg-gray-50">
            <h1 className="text-2xl font-medium text-gray-700 mb-6">Invoice Generator</h1>
            <div className="flex space-x-4 mb-6 ">
              <button className="px-4 py-2 bg-gray-200 font-medium text-gray-700 rounded-md hover:bg-gray-200" style={{ marginRight: `36%` }} onClick={() => window.location.reload()}>
                New Invoice
              </button>
              <button className="px-4 py-2 bg-gray-200 font-medium text-gray-700 rounded-md hover:bg-gray-200"
                onClick={generatePDF}>
                Preview
              </button>
              <button
                className="px-4 py-2 bg-blue-600 font-medium text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                type="submit"
                disabled={isSubmitting}
                form="invoice-form">
{isSubmitting ? "Saving ..." : "Save Invoice"}
              </button>
            </div>
          </div>

          <Form method="post" id="invoice-form" ref={formRef} className="p-6" style={{ marginTop: `-4%` }} onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8 bg-white p-6 rounded-lg shadow-md" style={{ borderTop: `4px solid ${formData.color}` }}>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <input
                      type="text"
                      name="invoice"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="text-xl w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Invoice"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <div className="relative">
                      {formData.logo ? (
                        <div className="group w-48 h-24 border border-gray-300 rounded-lg overflow-hidden relative cursor-pointer" onClick={triggerFilePicker}>
                          <img src={formData.logo} alt="Logo preview" className="w-full h-full object-contain" />
                          <button
                            onClick={(e) => { e.stopPropagation(); removeLogo(); }}
                            className="absolute top-1 right-1 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="w-48 h-24 border-2 border-dashed border-gray-300 flex items-center justify-center rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50" onClick={triggerFilePicker}>
                          <span className="text-gray-500">📷 + Logo</span>
                        </div>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      <input type="hidden" name="logo" value={formData.logo || ''} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">From</h3>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Name</label>
                      <input
                        type="text"
                        name="fromName"
                        value={formData.fromName}
                        onChange={(e) => handleInputChange('fromName', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Business Name"

                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Email</label>
                      <input
                        type="email"
                        name="fromEmail"
                        value={formData.fromEmail}
                        onChange={(e) => handleInputChange('fromEmail', e.target.value)}

                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="name@business.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Address</label>
                      <input
                        type="text"
                        name="fromAddress"
                        value={formData.fromAddress}
                        onChange={(e) => handleInputChange('fromAddress', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Street"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Phone</label>
                      <input
                        type="tel"
                        name="fromPhone"
                        value={formData.fromPhone}
                        onChange={(e) => handleInputChange('fromPhone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="(123) 456 789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Business Number</label>
                      <input
                        type="text"
                        name="businessNumber"
                        value={formData.businessNumber}
                        onChange={(e) => handleInputChange('businessNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="123-45-6789"
                      />
                    </div>

                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Bill To</h3>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Name</label>
                      <input
                        type="text"
                        name="billToName"
                        value={formData.billToName}
                        onChange={(e) => handleInputChange('billToName', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Client Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Email</label>
                      <input
                        type="email"
                        name="billToEmail"
                        value={formData.billToEmail}
                        onChange={(e) => handleInputChange('billToEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="name@client.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Address</label>
                      <input
                        type="text"
                        name="billToAddress"
                        value={formData.billToAddress}
                        onChange={(e) => handleInputChange('billToAddress', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Street"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Phone</label>
                      <input
                        type="tel"
                        name="billToPhone"
                        value={formData.billToPhone}
                        onChange={(e) => handleInputChange('billToPhone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="(123) 456 789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Mobile</label>
                      <input
                        type="tel"
                        name="billToMobile"
                        value={formData.billToMobile}
                        onChange={(e) => handleInputChange('billToMobile', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="(123) 456 789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Fax</label>
                      <input
                        type="tel"
                        name="billToFax"
                        value={formData.billToFax}
                        onChange={(e) => handleInputChange('billToFax', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="(123) 456 789"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Number</label>
                      <input
                        type="text"
                        name="invoiceNumber"
                        value={formData.invoiceNumber}
                        onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                        required
                        readOnly={!!initialData?.invoiceNumber}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${initialData?.invoiceNumber ? 'bg-gray-50 text-gray-500' : ''
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Terms</label>
                      <select
                        name="terms"
                        value={formData.terms}
                        onChange={(e) => handleInputChange('terms', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="On Receipt">On Receipt</option>
                        <option value="Net 15">Net 15</option>
                        <option value="Net 30">Net 30</option>
                        <option value="Net 60">Net 60</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th className="text-left py-2 text-sm font-medium text-gray-700">DESCRIPTION</th>
                          <th className="text-center py-2 text-sm font-medium text-gray-700 w-24">RATE</th>
                          <th className="text-center py-2 text-sm font-medium text-gray-700 w-20">QTY</th>
                          <th className="text-right py-2 text-sm font-medium text-gray-700 w-24">AMOUNT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => (
                          <tr key={index} className="border-b border-gray-200">
                            <td className="py-4">
                              <div className="space-y-2">
                                <div className="flex items-start space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="mt-1 w-6 h-6 flex items-center justify-center text-black bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
                                    disabled={items.length === 1}
                                  >
                                    x
                                  </button>
                                  <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Item Description"
                                    required
                                  />
                                </div>
                                <textarea
                                  value={item.additionalDetails}
                                  onChange={(e) => handleItemChange(index, 'additionalDetails', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Additional details"
                                  rows={2}
                                />
                                <div className="flex items-center space-x-2 mt-2">
                                  <input
                                    type="checkbox"
                                    id={`taxable-${index}`}
                                    checked={item.taxable}
                                    onChange={(e) => handleItemChange(index, 'taxable', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                  />
                                  <label htmlFor={`taxable-${index}`} className="text-xs text-gray-600">
                                    Apply tax to this item
                                  </label>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-center">
                              <input
                                type="number"
                                value={item.rate}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  handleItemChange(index, 'rate', isNaN(value) || value < 0 ? 0 : value);
                                }}
                                className="w-20 px-2 py-2 border bg-white text-black border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                                min="0"
                              />
                            </td>
                            <td className="py-4 text-center">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  handleItemChange(index, 'quantity', isNaN(value) || value < 0 ? 0 : value);
                                }}
                                className="w-16 px-2 py-2 border bg-white text-black border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="1"
                                min="1"
                              />
                            </td>
                            <td className="py-4 text-right">
                              <span className="text-gray-900 font-medium">
                                {formatCurrency(item.amount, formData.currency)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-900"
                  >
                    <span className="mr-2">+</span>
                    Add Item
                  </button>
                </div>

                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">{formatCurrency(subtotal, formData.currency)}</span>
                    </div>
                    {formData.discountType !== 'None' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Discount {formData.discountType === 'Percentage' ? `(${formData.discountValue}%)` : ''}
                        </span>
                        <span className="text-gray-900">-{formatCurrency(Number(discountAmount), formData.currency)}</span>
                      </div>
                    )}
                    {formData.taxType !== 'None' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {formData.taxType} ({formData.taxRate || 0}%)
                        </span>
                        <span className="text-gray-900">{formatCurrency(taxAmount, formData.currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total</span>
                      <span>{formatCurrency(total, formData.currency)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold ">
                      <span>Balance Due</span>
                      <span>{formatCurrency(total, formData.currency)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full px-3 py-4 border border-gray-300 rounded-md"
                    style={{ backgroundColor: '#ffffff', color: '#000000' }}
                    placeholder="Notes - any relevant information not covered, additional terms and conditions"
                    rows={4}
                  />
                </div>

                <SignatureDrawer
                  signature={formData.signature}
                  onSignatureSave={(signature) => setFormData(prev => ({ ...prev, signature: signature !== null ? signature : undefined }))}
                />

                <input type="hidden" name="items" value={JSON.stringify(items)} />
                <input type="hidden" name="subtotal" value={subtotal} />
                <input type="hidden" name="taxAmount" value={taxAmount} />
                <input type="hidden" name="discountAmount" value={discountAmount} />
                <input type="hidden" name="total" value={total} />
              </div>

              <div className="space-y-6 bg-gray-50 p-4 rounded-lg">
                <ColorPicker
                  selectedColor={formData.color ?? ''}
                  onColorChange={(color) => handleInputChange('color', color)}
                />
                <TaxSelector
                  taxType={formData.taxType ?? ''}
                  taxRate={Number(formData.taxRate)}
                  onTaxTypeChange={(type) => handleInputChange('taxType', type)}
                  onTaxRateChange={(rate: number) => handleInputChange('taxRate', rate.toString())}
                />
                <DiscountSelector
                  discountType={formData.discountType ?? ''}
                  discountValue={Number(formData.discountValue) || 0}
                  onDiscountTypeChange={(type) => handleInputChange('discountType', type)}
                  onDiscountValueChange={(value) => handleInputChange('discountValue', value.toString())}
                />
                <CurrencySelector
                  currency={formData.currency}
                  onCurrencyChange={(val) => handleInputChange('currency', val)}
                />

              </div>
            </div>
            <div style={{ marginTop: '2%' }}>
              <TemplateSelector
                selectedTemplate={formData.template}
                onTemplateChange={(template) => handleInputChange('template', template)}
              />
            </div>

          </Form>

        </div>
      </div>
    </div>
  );
}