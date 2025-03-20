"use client";
import React from "react";
import { useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { IoIosArrowDown } from "react-icons/io";
import { Link } from "@/i18n/navigation";
import styles from "../src/css/menu.module.css";
import { useTranslations } from "next-intl";

const Menu = () => {
  const [rotate, setRotate] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("navigation");

  const handleMouseEnter = () => {
    if (document.documentElement.clientWidth > 768) {
      setRotate(true);
    }
  };

  const handleMouseLeave = () => {
    if (document.documentElement.clientWidth > 768) {
      setRotate(false);
    }
  };

  const handleClick = () => {
    if (document.documentElement.clientWidth <= 768) {
      setRotate(!rotate);
    }
  };

  return (
    <div className="flex text-[14px] ss-menu">
      <div
        className="relative flex ss-menu-item"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`${rotate ? "bg-menu-color" : ""} flex justify-center space-x-1 cursor-pointer relative  px-6 group hover:bg-menu-color ss-icon-submenu`}
          onClick={handleClick}
        >
          <h4
            className={`font-[400] self-center text-white group-hover:text-white`}
          >
            {t("learn")}
          </h4>
          <IoIosArrowDown
            className={`self-center relative ${rotate ? styles.iconRotate : styles.iconOriginal} text-[16px] transition`}
          />
        </div>
        {rotate && (
          <div className="absolute bg-menu-color top-[59px] grid-rows-2 left-0 right-0 grid p-0 ss-submenu">
            <Link
              href="/analysis/quantitative"
              className={`${pathname.indexOf("/analysis") > -1 ? styles.current : ""} relative justify-center flex no-underline text-white h-[60px] border-t border-black hover:bg-yellow-400 hover:text-black duration-200 transition`}
            >
              <h4 className="self-center font-[400]">{t("analysis")}</h4>
            </Link>
            <Link
              href="/strategy/trade"
              className={`${pathname.indexOf("/strategy") > -1 ? styles.current : ""} relative justify-center flex no-underline text-white h-[60px] border-t border-black hover:bg-yellow-400 hover:text-black duration-200 transition`}
            >
              <h4 className="self-center font-[400]">{t("strategy")}</h4>
            </Link>
          </div>
        )}
      </div>
      <Link
        className={`${pathname.indexOf("/articles") > -1 ? styles.current : ""} relative text-white no-underline flex justify-center px-6 hover:bg-yellow-400 hover:text-black ss-menu-item`}
        href="/articles"
      >
        <h4 className="font-[400] self-center">{t("articles")}</h4>
      </Link>
      <Link
        className={`${pathname === "/finance-terms" ? styles.current : ""} relative text-white no-underline flex justify-center px-6 hover:bg-yellow-400 hover:text-black ss-menu-item whitespace-nowrap`}
        href="/finance-terms"
      >
        <h4 className="font-[400] self-center">{t("finance_terms")}</h4>
      </Link>
    </div>
  );
};

export default Menu;
