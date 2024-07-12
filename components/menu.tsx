import React from "react";
import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import Link from "next/link";
import styles from "../css/menu.module.css";

const Menu = () => {
  const [rotate, setRotate] = useState(false);

  return (
    <div className="grid grid-cols-3 text-center">
      <div
        className="relative flex"
        onMouseEnter={() => setRotate(true)}
        onMouseLeave={() => setRotate(false)}
      >
        <div
          className={`${rotate ? "bg-white" : ""} flex justify-center space-x-1 cursor-pointer relative w-[7em]`}
        >
          <h4
            className={`font-[400] self-center ${!rotate ? "text-white" : ""}`}
          >
            Learn
          </h4>
          <IoIosArrowDown
            className={`self-center relative ${rotate ? styles.iconRotate : styles.iconOriginal} text-[1.6em]`}
          />
        </div>
        {rotate && (
          <div className="absolute h-[8rem] w-[7em] bg-white top-[4em] grid-rows-2 left-0 grid p-0">
            <Link
              href="#"
              className="justify-center flex no-underline text-black h-[4em] pr-9"
            >
              <h4 className="self-center font-[400]">分析</h4>
            </Link>
            <Link
              href="#"
              className="justify-center flex no-underline text-black h-[4em] pr-9"
            >
              <h4 className="self-center font-[400]">策略</h4>
            </Link>
          </div>
        )}
      </div>
      <Link className="text-white no-underline flex justify-center" href="#">
        <h4 className="font-[400] self-center">资讯</h4>
      </Link>
      <Link className="text-white no-underline flex justify-center" href="#">
        <h4 className="font-[400] self-center">金融基础术语</h4>
      </Link>
    </div>
  );
};

export default Menu;
