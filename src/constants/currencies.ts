export interface CurrencyI {
  code: string;
  icon: string;
  name: string;
  symbol: string;
}

export const currenciesArray: CurrencyI[] = [
  { code: "USD", name: "US Dollar", icon: "🇺🇸", symbol: "$" },
  { code: "EUR", name: "Euro", icon: "🇪🇺", symbol: "€" },
  { code: "GBP", name: "British Pound", icon: "🇬🇧", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", icon: "🇯🇵", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", icon: "🇨🇦", symbol: "$" },
  { code: "AUD", name: "Australian Dollar", icon: "🇦🇺", symbol: "$" },
  { code: "CHF", name: "Swiss Franc", icon: "🇨🇭", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", icon: "🇨🇳", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", icon: "🇮🇳", symbol: "₹" },
  { code: "AED", name: "UAE Dirham", icon: "🇦🇪", symbol: "د.إ" },
  { code: "UGX", name: "Ugandan Shilling", icon: "🇺🇬", symbol: "USh" },
  { code: "KES", name: "Kenyan Shilling", icon: "🇰🇪", symbol: "KSh" },
  { code: "NGN", name: "Nigerian Naira", icon: "🇳🇬", symbol: "₦" },
  { code: "ZAR", name: "South African Rand", icon: "🇿🇦", symbol: "R" },
  { code: "MXN", name: "Mexican Peso", icon: "🇲🇽", symbol: "$" },
  { code: "SGD", name: "Singapore Dollar", icon: "🇸🇬", symbol: "$" },
  { code: "HKD", name: "Hong Kong Dollar", icon: "🇭🇰", symbol: "HK$" },
  { code: "NZD", name: "New Zealand Dollar", icon: "🇳🇿", symbol: "$" },
  { code: "BRL", name: "Brazilian Real", icon: "🇧🇷", symbol: "R$" },
  { code: "RUB", name: "Russian Ruble", icon: "🇷🇺", symbol: "₽" },
];
