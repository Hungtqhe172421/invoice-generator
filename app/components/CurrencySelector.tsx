interface CurrencySelectorProps {
  currency: string;
  onCurrencyChange: (currency: string) => void;
}

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


export default function CurrencySelector({
  currency,
  onCurrencyChange,
}: CurrencySelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 border-b border-gray-300">
        CURRENCY
      </label>
      <div className="relative">
        <select
          name="currency"
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 bg-white text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {Object.keys(currencyFlags).map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
          <img
            src={currencyFlags[currency]}
            alt={`${currency} flag`}
            className="w-5 h-3 object-cover"
          />
        </div>
      </div>
    </div>
  );
}