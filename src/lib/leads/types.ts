export interface GoogleMapsOpeningHour {
  day: string;
  hours: string;
}

// Campos opcionais são `| null` porque o Apify retorna `null` explícito para
// dados ausentes (não omite a chave) — TypeScript só pega `.toFixed()` etc. em
// valor nulo se o tipo admitir null, então nunca usar só `?:` aqui.
export interface GoogleMapsPlaceItem {
  title?: string | null;
  name?: string | null;
  phone?: string | null;
  phoneUnformatted?: string | null;
  address?: string | null;
  neighborhood?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  countryCode?: string | null;
  categoryName?: string | null;
  categories?: string[] | null;
  website?: string | null;
  url?: string | null;
  imageUrl?: string | null;
  totalScore?: number | null;
  reviewsCount?: number | null;
  price?: string | null;
  openingHours?: GoogleMapsOpeningHour[] | null;
  permanentlyClosed?: boolean | null;
  temporarilyClosed?: boolean | null;
}
