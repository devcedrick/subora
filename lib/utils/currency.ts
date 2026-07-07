export function formatCurrency(
  value: number,
  currency: string = "PHP",
): string {
  try {
    const locale = currency === "PHP" ? "en-PH" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `₱${value.toFixed(2)}`;
  }
}
