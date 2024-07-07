"use client";
import Link from "next/link";
import React from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";

const Topbar = () => {
  return (
    <div className="grid grid-cols-3 justify-items-center w-[100%] bg-topbar-color">
      <h1 className="text-2xl text-white font-normal">Statsify Finance</h1>
      <div className="grid grid-cols-3 text-center space-x-5">
        <div className="bg-white flex justify-center space-x-1 cursor-pointer">
          <h4 className="font-[400]">Learn</h4>
          <IoIosArrowDown className="self-center text-[1.6rem]" />
        </div>
        <Link className="text-white no-underline" href="#">
          <h4 className="font-[400]">资讯</h4>
        </Link>
        <Link className="text-white no-underline" href="#">
          <h4 className="font-[400]">金融基础术语</h4>
        </Link>
      </div>
      <div className="flex space-x-12">
        <Link href="/login" className="flex text-white space-x-3 no-underline">
          <h4 className="font-[400]">Login</h4>
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
