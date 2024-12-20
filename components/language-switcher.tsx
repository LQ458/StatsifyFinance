"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { SUPPORTED_LOCALES, Locale } from "../middleware";
import { useEffect } from "react";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 确保在客户端执行
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('locale');
      if (!stored) {
        const browserLang = navigator.language.split('-')[0];
        const newLocale = SUPPORTED_LOCALES.includes(browserLang as Locale) 
          ? browserLang 
          : 'en';
        
        localStorage.setItem('locale', newLocale);
        if (newLocale !== locale) {
          switchLocale(newLocale as Locale);
        }
      }
    }
  }, [locale, pathname]);

  const switchLocale = (newLocale: Locale) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
    }
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <select
      value={locale}
      onChange={(e) => switchLocale(e.target.value as Locale)}
      className="bg-transparent text-white"
    >
      <option value="zh">中文</option>
      <option value="en">English</option>
    </select>
  );
}
