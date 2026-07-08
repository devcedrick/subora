const API_URL = "https://api.frankfurter.app/latest";

const STATIC_RATES: Record<string, number> = {
  USD: 0.017,
  EUR: 0.016,
  GBP: 0.014,
  JPY: 2.63,
  AUD: 0.026,
  CAD: 0.024,
  SGD: 0.023,
};

let cachedRates: Record<string, number> | null = null;
let lastFetched = 0;
const CACHE_TTL = 30 * 60 * 1000;

async function fetchRates(): Promise<Record<string, number>> {
  const res = await fetch(`${API_URL}?from=PHP`);
  const data = await res.json();
  return data.rates as Record<string, number>;
}

export async function initCurrencyRates(): Promise<void> {
  try {
    cachedRates = await fetchRates();
    lastFetched = Date.now();
  } catch {
    cachedRates = STATIC_RATES;
  }
}

function getRate(fromCurrency: string): number {
  const now = Date.now();
  if (!cachedRates || now - lastFetched > CACHE_TTL) {
    return STATIC_RATES[fromCurrency] ?? 1;
  }
  return cachedRates[fromCurrency] ?? STATIC_RATES[fromCurrency] ?? 1;
}

export function formatCurrency(
  value: number,
  fromCurrency: string = "PHP",
): string {
  try {
    let phpValue = value;

    if (fromCurrency !== "PHP") {
      phpValue = value / getRate(fromCurrency);
    }

    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(phpValue);
  } catch {
    return `₱${value.toFixed(2)}`;
  }
}
