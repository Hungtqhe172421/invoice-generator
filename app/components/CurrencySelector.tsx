import { useState } from "react";

const currencyFlags: Record<string, string> = {
  VND: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg',
  USD: 'https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg',
  EUR: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg',
  GBP: 'https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg',
  JPY: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Flag_of_Japan.svg',
  AUD: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Flag_of_Australia.svg',
  CAD: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Flag_of_Canada.svg',
  CHF: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Flag_of_Switzerland.svg',
  CNY: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Flag_of_the_People%27s_Republic_of_China.svg',
  INR: 'https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg',
  SGD: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Flag_of_Singapore.svg',
  THB: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Flag_of_Thailand.svg',
  RUB: 'https://upload.wikimedia.org/wikipedia/en/f/f3/Flag_of_Russia.svg'
};

interface CurrencySelectorProps {
  currency: string;
  onCurrencyChange: (value: string) => void;
}

export default function CurrencySelector({
  currency,
  onCurrencyChange,
}: CurrencySelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2 relative">
      <label className="block text-sm font-medium text-gray-700 border-b border-gray-300">
        CURRENCY
      </label>

      <div
        className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <img
            src={currencyFlags[currency]}
            alt={`${currency} flag`}
            className="w-5 h-3 object-cover"
          />
          <span>{currency}</span>
        </div>
        <span className="text-gray-500">▼</span>
      </div>

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {Object.entries(currencyFlags).map(([currency, flag]) => (
            <div
              key={currency}
              onClick={() => {
                onCurrencyChange(currency);
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <img src={flag} alt={`${currency} flag`} className="w-5 h-3 object-cover" />
              <span>{currency}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
