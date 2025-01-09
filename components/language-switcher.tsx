"use client";

import React from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales } from "@/i18n/locales";
import { useTranslations } from "next-intl";

const LanguageSwitcher = () => {
  const t = useTranslations("common.language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = async (newLocale: string) => {
    try {
      await router.replace(pathname, { locale: newLocale });
    } catch (error) {
      console.error("Failed to switch language:", error);
    }
  };

  return (
    <select
      value={locale}
      onChange={(e) => handleLocaleChange(e.target.value)}
      className="bg-transparent text-white text-[14px] border-none outline-none cursor-pointer hover:text-[#FFD700] self-center"
      aria-label={t("select")}
    >
      <option value="zh" className="bg-[#1D1E20] text-white hover:bg-[#313131]">
        {t("zh")}
      </option>
      <option value="en" className="bg-[#1D1E20] text-white hover:bg-[#313131]">
        {t("en")}
      </option>
    </select>
  );
};

export default LanguageSwitcher;
