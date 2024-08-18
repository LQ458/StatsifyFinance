import React from "react";
import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import Link from "next/link";
import styles from "../css/menu.module.css";

const Menu = () => {
  const [rotate, setRotate] = useState(false);

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
            Learn
          </h4>
          <IoIosArrowDown
            className={`self-center relative ${rotate ? styles.iconRotate : styles.iconOriginal} text-[16px] transition`}
          />
        </div>
        {rotate && (
          <div className="absolute bg-menu-color top-[59px] grid-rows-2 left-0 right-0 grid p-0">
            <Link
              href="/analysis/qualitative"
              className="justify-center flex no-underline text-white h-[60px] border-t border-black hover:bg-yellow-400 hover:text-black duration-200 transition"
            >
              <h4 className="self-center font-[400]">分析</h4>
            </Link>
            <Link
              href="#"
              className="justify-center flex no-underline text-white h-[60px] border-t border-black hover:bg-yellow-400 hover:text-black duration-200 transition"
            >
              <h4 className="self-center font-[400]">策略</h4>
            </Link>
          </div>
        )}
      </div>
      <Link
        className="text-white no-underline flex justify-center px-6 hover:bg-yellow-400 hover:text-black"
        href="#"
      >
        <h4 className="font-[400] self-center">资讯</h4>
      </Link>
      <Link
        className="text-white no-underline flex justify-center px-6 hover:bg-yellow-400 hover:text-black"
        href="/finance-terms"
      >
        <h4 className="font-[400] self-center">金融基础术语</h4>
      </Link>
    </div>
  );
};

export default Menu;
