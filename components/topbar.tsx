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
      className={`grid grid-cols-3 justify-items-center w-[100%] bg-topbar-color h-[4em] ${position} z-[10000]`}
    >
      <Link
        href="/"
        className="text-2xl text-white font-normal self-center no-underline"
      >
        Statsify Finance
      </Link>
      <Menu />
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
