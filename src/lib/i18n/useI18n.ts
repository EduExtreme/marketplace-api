"use client";

import { useCallback, useSyncExternalStore } from "react";
import { ptBR } from "./locales/pt-BR";
import { enUS } from "./locales/en-US";

export type Locale = "pt-BR" | "en-US";
export type TranslationKey = keyof typeof ptBR;

const locales: Record<Locale, Record<TranslationKey, string>> = {
  "pt-BR": ptBR,
  "en-US": enUS,
};

let currentLocale: Locale = "pt-BR";
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  listeners.forEach((listener) => listener());
}

export interface TranslateParams {
  id: TranslationKey;
  values?: Record<string, string | number>;
}

export interface UseI18nResult {
  translate: (params: TranslateParams) => string;
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export function useI18n(): UseI18nResult {
  const locale = useSyncExternalStore(subscribe, getSnapshot, () => "pt-BR" as Locale);

  const translate = useCallback(
    ({ id, values }: TranslateParams): string => {
      const template = locales[locale][id] ?? id;
      if (!values) return template;
      return Object.entries(values).reduce(
        (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
        template,
      );
    },
    [locale],
  );

  return { translate, locale, setLocale };
}
