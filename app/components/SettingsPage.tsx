import React, { useState, useEffect, useRef } from 'react';
import { Form, useActionData, useNavigation, useSubmit } from '@remix-run/react';
import SignatureDrawer from './SignatureDrawer';
import ColorPicker from './ColorPicker';
import TaxSelector from './TaxSelector';
import type { Settings } from '~/models/settings';
import { TemplateSelector } from './Template';
import CurrencySelector from './CurrencySelector';

interface SettingsFormProps {
  initialData?: Partial<Settings>;
}

export default function SettingsPage({ initialData }: SettingsFormProps) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const actionData = useActionData<{ success: boolean; error?: string; invoice?: Settings }>();
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | 'info' | null; message: string }>({ type: null, message: '' });
  const [formData, setFormData] = useState<Settings>({
    user: '',
    title: '',
    template: 'Classic',
    fromName: '',
    fromEmail: '',
    fromAddress: '',
    fromPhone: '',
    businessNumber: '',
    logo: '',
    signature: '',
    color: '#ffffffff',
    currency: 'VND',
    taxType: 'None',
    taxRate: 0,
    ...initialData
  });


  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        setSaveStatus({
          type: 'success',
          message: `Settings saved successfully!`
        });
      } else if (actionData.error) {
        setSaveStatus({ type: 'error', message: actionData.error });
      }
    }
  }, [actionData]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveStatus({ type: 'info', message: 'Submitting settings...' });
    submit(formRef.current, { method: 'post' });
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

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const triggerFilePicker = () => fileInputRef.current?.click();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gray-50 rounded-lg">
          {saveStatus.type && (
            <div className={`p-4 mb-6 rounded-md ${saveStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              saveStatus.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                'bg-blue-50 text-blue-800 border border-blue-200'}`}>
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
            <h1 className="text-2xl font-medium text-gray-700 mb-6">Settings</h1>
            <div className="flex space-x-4 mb-6">
              <button
                className="px-4 py-2 bg-blue-600 font-medium text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                type="submit"
                disabled={isSubmitting}
                form="settings-form"
              >
{isSubmitting ? "Saving ..." : "Save Invoice"}
              </button>
            </div>
          </div>

          <Form method="post" id="settings-form" ref={formRef} className="p-6" style={{ marginTop: '-4%' }} onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8 bg-white p-6 rounded-lg shadow-md" style={{ borderTop: `4px solid ${formData.color}` }}>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="text-xl w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Invoice"

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
                        type="tel"
                        name="businessNumber"
                        value={formData.businessNumber}
                        onChange={(e) => handleInputChange('businessNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="123-45-6789"
                      />
                    </div>
                  </div>
                </div>

                <SignatureDrawer
                  signature={formData.signature}
                  onSignatureSave={(signature) => handleInputChange('signature', signature || '')}
                />
              </div>

              <div className="space-y-6 bg-gray-50">
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
};
