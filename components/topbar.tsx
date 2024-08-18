"use client";
import Link from "next/link";
import React from "react";
import { useState, useRef } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import Menu from "./menu";
import styles from "../css/topbar.module.css";
type PositionType = "relative" | "fixed" | "absolute";

interface TopbarProps {
  position: PositionType;
}

const Topbar: React.FC<TopbarProps> = ({ position }) => {
  const [isSearch, setSearchState] = useState(false);
  const [keywords, setKeywords] = useState("");
  const inputRef = useRef(null);
  // 切换搜索状态的函数
  const searchIconClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (keywords.trim() !== "") {
      alert(`搜索关键字：${keywords}`);
    } else {
      setSearchState((isSearch) => {
        return !isSearch;
      });
    }
  };
  // 失去焦点判断输入框内有没有值，没有就收起输入框
  const handleBlur = () => {
    if (keywords.trim() === "") {
      setSearchState((isSearch) => {
        return false;
      });
    }
  };
  // 搜索关键字发生改变
  const keywordsChange = (event) => {
    setKeywords(event.target.value);
  };
  return (
    <div className="w-[100%] bg-topbar-color border-b border-topbar-border-color h-[60px] ${position} z-[10000] flex-grow-0 flex-shrink-0">
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
            <div className="flex self-center relative">
              <input
                ref={inputRef}
                type="text"
                value={keywords}
                onChange={keywordsChange}
                onBlur={handleBlur}
                className={`${isSearch ? styles.search : "w-0 opacity-0"} h-[30px] px-[8px] focus:outline-0 pr-[30px] rounded-[4px] text-white bg-input-bg-color self-center transition-all duration-300`}
              />
              <button
                title="search"
                type="button"
                className={`absolute right-[5px] top-[3px] bg-transparent p-0 border-0`}
                onClick={searchIconClick}
              >
                <IoSearch
                  className={`text-[24px] text-white cursor-pointer ${isSearch ? styles.searchText : "transition-all duration-300"}`}
                />
              </button>
            </div>
            <Link
              href="/login"
              className="flex text-white space-x-3 no-underline"
            >
              <FaRegUserCircle className="text-[24px] self-center" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
