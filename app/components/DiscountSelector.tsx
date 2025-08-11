interface DiscountSelectorProps {
  discountType: string;
  discountValue: number;
  onDiscountTypeChange: (type: string) => void;
  onDiscountValueChange: (value: number) => void;
}

const discountOptions = [
  { value: 'None', label: 'None' },
  { value: 'Percentage', label: 'Percentage' },
  { value: 'Fixed Amount', label: 'Fixed Amount' },
];

export default function DiscountSelector({
  discountType,
  discountValue,
  onDiscountTypeChange,
  onDiscountValueChange
}: DiscountSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 border-b border-gray-300 pb-1">
        DISCOUNT
      </label>
      <div className="space-y-2">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Type</label>
          <select
            value={discountType}
            name="discountType"
            onChange={(e) => {
              onDiscountTypeChange(e.target.value);
              onDiscountValueChange(0);
            }}
            className="w-full px-3 py-2 border border-gray-300 bg-white text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {discountOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {discountType !== 'None' && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              {discountType === 'Percentage' ? 'Percentage (%)' : 'Amount'}
            </label>
            <input
              type="number"
              name="discountValue"
              value={discountValue === 0 ? '' : discountValue}
              onChange={(e) => {
                let value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                if (discountType === 'Percentage') {
                  if (value < 0) value = 0;
                  if (value > 100) value = 100;
                }
                onDiscountValueChange(isNaN(value) ? 0 : value);
              }}
              className="w-full px-3 py-2 border border-gray-300 bg-white text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
              step={discountType === 'Percentage' ? '0.1' : '0.01'}
              max={discountType === 'Percentage' ? '100' : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}
