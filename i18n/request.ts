import { getRequestConfig } from "next-intl/server";
import { locales } from "./locales";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale; // 获取当前语言
  return {
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: "Asia/Shanghai",
    now: new Date(),
  };
});
