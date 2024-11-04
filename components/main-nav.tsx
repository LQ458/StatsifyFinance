"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "../src/css/main-nav.module.css";

interface NavItem {
  value: string;
  path: string;
}

interface ChildComponentProps {
  navItems: NavItem[];
}

const MainNav: React.FC<ChildComponentProps> = ({ navItems }) => {
  const pathname = usePathname();
  // console.log('pathname:::', pathname)
  return (
    <div className={`${styles.nav} w-full`}>
      <ul>
        {navItems.map((item, idx) => (
          <li
            key={idx}
            className={`${pathname.indexOf(item.path) > -1 ? styles.active : ""}`}
          >
            <Link passHref href={item.path}>
              {item.value}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MainNav;
