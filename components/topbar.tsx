"use client";
import Link from "next/link";
import React from "react";
import { useState } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import styles from "../css/topbar.module.css";

const Topbar = () => {
  const [rotate, setRotate] = useState("original");

  return (
    <div className="grid grid-cols-3 justify-items-center w-[100%] bg-topbar-color h-[4em]">
      <h1 className="text-2xl text-white font-normal self-center">
        Statsify Finance
      </h1>
      <div className="grid grid-cols-3 text-center">
        <div
          className="relative flex"
          onMouseEnter={() => setRotate("true")}
          onMouseLeave={() => setRotate("false")}
        >
          <div className="bg-white flex justify-center space-x-1 cursor-pointer relative w-[7em]">
            <h4 className="font-[400] self-center">Learn</h4>
            <IoIosArrowDown
              className={`self-center relative ${rotate === "true" && styles.iconRotate} ${rotate === "false" && styles.iconOriginal} text-[1.6em]`}
            />
          </div>
          {rotate === "true" && (
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
      <div className="flex space-x-12">
        <Link href="/login" className="flex text-white space-x-3 no-underline">
          <h4 className="font-[400] self-center">Login</h4>
          <FaRegUserCircle className="text-[1.9rem] self-center" />
        </Link>
        <button
          title="search"
          type="button"
          className="bg-transparent p-0 border-0"
        >
          <IoSearch className="text-[1.9rem] text-white cursor-pointer" />
        </button>
      </div>
    </div>
  );
};

export default Topbar;
