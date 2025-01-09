"use client";
import React from "react";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import styles from "../src/css/main-nav.module.css";
import { useTranslations } from "next-intl";

interface NavItem {
  value: string;
  path: string;
}

interface ChildComponentProps {
  navItems: NavItem[];
}

const MainNav: React.FC<ChildComponentProps> = ({ navItems }) => {
  const t = useTranslations("analysis");
  const pathname = usePathname();

  return (
    <div className={`${styles.nav} w-full ss-main-nav`}>
      <ul>
        {navItems.map((item, idx) => (
          <li
            key={idx}
            className={`${pathname.indexOf(item.path) > -1 ? styles.active : ""}`}
          >
            <Link href={item.path}>{t(item.value)}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MainNav;
