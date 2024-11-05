/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import React from "react";
import { IoSearch } from "react-icons/io5";
import Menu from "./menu";
import User from "./user";
type PositionType = "relative" | "fixed" | "absolute";

interface TopbarProps {
  position: PositionType;
}

const Topbar: React.FC<TopbarProps> = ({ position }) => {
  
  return (
    <div className={`w-[100%] min-w-[1100px] bg-topbar-color border-b border-topbar-border-color h-[60px] ${position} z-[10000] flex-grow-0 flex-shrink-0`}>
      <div
        className={`flex justify-between max-w-[1920px] min-w-[1100px] mx-auto h-[100%] px-[60px]`}
      >
        <Link
          href="/"
          className="flex gap-2 text-[16px] text-white self-center no-underline"
        >
          <img src="/logo-gold.svg" width={20} alt="" />
          Statsify Finance
        </Link>
        <div className="flex gap-32">
          <Menu />
          <div className="flex gap-10">              
            <Link href="/search" className="self-center">
              <IoSearch
              className="text-[24px] text-white cursor-pointer"
              />
            </Link>
            <User />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
