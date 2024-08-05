"use client";
import Link from "next/link";
import React from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import Menu from "./menu";
import styles from "../css/topbar.module.css";
type PositionType = "relative" | "fixed" | "absolute";

interface TopbarProps {
  position: PositionType;
}

const Topbar: React.FC<TopbarProps> = ({ position }) => {
  return (
    <div
      className={`flex justify-between w-[100%] bg-topbar-color h-[4em] ${position} z-[10000]`}
    >
      <Link
        href="/"
        className="text-2xl text-white font-normal self-center no-underline ml-16 border-l-4 border-b-0 border-t-0 border-r-0 pl-3 border-yellow-400 border-solid"
      >
        Statsify Finance
      </Link>
      <div className="flex gap-32 mr-16">
        <Menu />
        <div className="flex gap-10">
          <button
            title="search"
            type="button"
            className="bg-transparent p-0 border-0"
          >
            <IoSearch className="text-[1.9rem] text-white cursor-pointer" />
          </button>
          <Link
            href="/login"
            className="flex text-white space-x-3 no-underline"
          >
            <FaRegUserCircle className="text-[1.9rem] self-center" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
