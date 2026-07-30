const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatPriceBRL(value: number): string {
  return brlFormatter.format(value);
}

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function formatDateTime(value: string | Date): string {
  return dateTimeFormatter.format(new Date(value));
}

export function maskApiKey(providerId: string): string {
  const seed = providerId.length.toString().padStart(2, "0");
  return `sk_live_${seed}${"•".repeat(24)}`;
}
