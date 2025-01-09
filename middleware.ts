import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/locales";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export const config = {
  matcher: [
    // Match all pathnames except for
    // - api routes
    // - static files
    // - internal Next.js paths
    "/((?!api|_next|_vercel|.*\\.[^/]*$).*)",
    // Also match root path
    "/",
  ],
};
