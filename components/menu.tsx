"use client";
import React from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { IoIosArrowDown } from "react-icons/io";
import Link from "next/link";
import styles from "../src/css/menu.module.css";

const Menu = () => {
  const [rotate, setRotate] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex">
      <div
        className="relative flex"
        onMouseEnter={() => setRotate(true)}
        onMouseLeave={() => setRotate(false)}
      >
        <div
          className={`${rotate ? "bg-menu-color" : ""} flex justify-center space-x-1 cursor-pointer relative  px-6 group hover:bg-menu-color`}
        >
          <h4
            className={`font-[400] self-center text-white group-hover:text-white`}
          >
            学习
          </h4>
          <IoIosArrowDown
            className={`self-center relative ${rotate ? styles.iconRotate : styles.iconOriginal} text-[16px] transition`}
          />
        </div>
        {rotate && (
          <div className="absolute bg-menu-color top-[59px] grid-rows-2 left-0 right-0 grid p-0">
            <Link
              href="/analysis/quantitative"
              className={`${pathname.indexOf('/analysis') > -1 ? styles.current : ''} relative justify-center flex no-underline text-white h-[60px] border-t border-black hover:bg-yellow-400 hover:text-black duration-200 transition`}
            >
              <h4 className="self-center font-[400]">分析</h4>
            </Link>
            <Link
              href="/strategy/trade"
              className={`${pathname.indexOf("/strategy") > -1 ? styles.current : ""} relative justify-center flex no-underline text-white h-[60px] border-t border-black hover:bg-yellow-400 hover:text-black duration-200 transition`}
            >
              <h4 className="self-center font-[400]">策略</h4>
            </Link>
          </div>
        )}
      </div>
      <Link
        className={`${pathname.indexOf("/articles") > -1 ? styles.current : ""} relative text-white no-underline flex justify-center px-6 hover:bg-yellow-400 hover:text-black`}
        href="/articles"
      >
        <h4 className="font-[400] self-center">资讯</h4>
      </Link>
      <Link
        className={`${pathname === "/finance-terms" ? styles.current : ""} relative text-white no-underline flex justify-center px-6 hover:bg-yellow-400 hover:text-black`}
        href="/finance-terms"
      >
        <h4 className="font-[400] self-center">金融基础术语</h4>
      </Link>
    </div>
  );
};

export default Menu;
