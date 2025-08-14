interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const colors = [
  '#ffffffff',
  '#6b7280',
  '#374151',
  '#1f2937',
  '#ef4444',
  '#ec4899',
  '#8b5cf6',
  '#5b21b6',
  '#3b82f6',
  '#06b6d4',
  '#10b981',
  '#84cc16'
];

export default function ColorPicker({
  selectedColor,
  onColorChange,
}: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 border-b border-gray-300">
        COLOR
      </label>
      <input type="hidden" name="color" value={selectedColor} />

      <div className="grid grid-cols-6 gap-2">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            className={`w-8 h-8 rounded-md border-2 transition-all ${selectedColor === color
                ? 'border-gray-400 shadow-lg scale-110'
                : 'border-gray-200 hover:border-gray-300'
              }`}
            style={{ backgroundColor: color }}
            onClick={() => onColorChange(color)}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>

      <div className="flex items-center gap-3 mt-3">
        <div className="relative">
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-8 h-8 rounded-md border-gray-50 cursor-pointer appearance-none"
            aria-label="Pick a custom color"
          />
        </div>
      </div>

    </div>
  );
}
