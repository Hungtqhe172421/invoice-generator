import { Font } from "@react-pdf/renderer";
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: "bold",
    },
  ],
});

export function formatCurrency(amount: number, currency: string) {
  if (currency === "VND") {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  }).format(amount);
}

