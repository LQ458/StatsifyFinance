import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

export const locales = ["en", "zh"] as const;
export const defaultLocale = "en";

export type Locale = (typeof locales)[number];

// 获取浏览器语言
const getBrowserLocale = () => {
  if (typeof window === "undefined") return defaultLocale;

  const stored = localStorage.getItem("locale");
  if (stored && locales.includes(stored as Locale)) {
    return stored;
  }

  const browserLang = navigator.language.split("-")[0];
  return locales.includes(browserLang as Locale) ? browserLang : defaultLocale;
};

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound();

  return {
    messages: {
      ...(await import(`../messages/${locale}.json`)).default,
      ...(await import(`../messages/en.json`)).default, // 英文作为fallback
    },
    defaultLocale,
    fallbackLocale: defaultLocale,
  };
});
