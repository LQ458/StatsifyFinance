import createMiddleware from "next-intl/middleware";

export const locales = ["en", "zh"] as const;
export const defaultLocale = "en" as const;

export type Locale = (typeof locales)[number];

export const SUPPORTED_LOCALES = ['en', 'zh'] as const;

export default createMiddleware({
  locales: SUPPORTED_LOCALES,
  defaultLocale,
  localePrefix: "always",
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)", "/"],
};
