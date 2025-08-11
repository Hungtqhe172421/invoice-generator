interface TaxSelectorProps {
  taxType: string;
  taxRate: number;
  onTaxTypeChange: (type: string) => void;
  onTaxRateChange: (rate: number) => void;
}

const taxOptions = [
  { value: 'None', label: 'None' },
  { value: 'VAT', label: 'VAT' },
  { value: 'GST', label: 'GST' },
  { value: 'Sales Tax', label: 'Sales Tax' },
  { value: 'Custom', label: 'Custom' },
];

export default function TaxSelector({ taxType, taxRate, onTaxTypeChange, onTaxRateChange }: TaxSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 border-b border-gray-300 pb-1">
        TAX
      </label>
      <div className="space-y-2">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Type</label>
          <select
            value={taxType}
            name="taxType"
            onChange={(e) => onTaxTypeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 bg-white text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {taxOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {taxType !== 'None' && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">Rate (%)</label>
            <input
              type="number"
              name="taxRate"
              value={taxRate || ''}
              onChange={(e) => {
                let value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                if (value < 0) value = 0;
                if (value > 100) value = 100;
                onTaxRateChange(isNaN(value) ? 0 : value);
              }}
              className="w-full px-3 py-2 border border-gray-300 bg-white text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        )}
      </div>
    </div>
  );
}
