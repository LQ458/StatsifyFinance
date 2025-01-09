import { createSharedPathnamesNavigation } from "next-intl/navigation";
import { locales } from "./locales";

// 创建导航工具
export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({
    locales,
    localePrefix: "always", // 总是显示语言前缀
  });

// 导出通用的路由跳转函数
export function navigateToLocale(pathname: string, locale: string) {
  return `/${locale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}
