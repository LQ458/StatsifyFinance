/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { IoSearch } from "react-icons/io5";
import Menu from "./menu";
import User from "./user";
type PositionType = "relative" | "fixed" | "absolute";

interface TopbarProps {
  position: PositionType;
}

const Topbar: React.FC<TopbarProps> = ({ position }) => {
  const [showMenu, setShowMenu] = useState(false);

  const ChangeMenuState = () => {
    setShowMenu(!showMenu);
  };

  const divRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (event: MouseEvent) => {
    // 如果点击发生在元素外部，则触发事件
    if (
      divRef.current &&
      menuRef.current &&
      !divRef.current.contains(event.target as Node) &&
      !menuRef.current.contains(event.target as Node)
    ) {
      // console.log("Clicked outside of div!");
      // 执行点击外部的逻辑，例如关闭模态框
      setShowMenu(false);
    }
  };

  useEffect(() => {
    // 添加 mousedown 事件监听
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // 在组件卸载时移除事件监听
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`w-[100%] min-w-[1100px] bg-topbar-color border-b border-topbar-border-color h-[60px] ${position} z-[10000] flex-grow-0 flex-shrink-0 ss-topbar`}
    >
      <div
        className={`flex justify-between max-w-[1920px] min-w-[1100px] mx-auto h-[100%] px-[60px] ss-topbar-inner`}
      >
        <Link
          href="/"
          className="flex gap-2 text-[16px] text-white self-center no-underline whitespace-nowrap"
        >
          <img src="/logo-gold.svg" width={20} alt="" />
          Statsify Finance
        </Link>
        <div className={`${showMenu ? "ss-menu-wrap" : ""} flex gap-32 ss-gap`}>
          <div ref={menuRef} className="flex">
            <Menu />
          </div>
          <div className="flex gap-[1px]">
            <Link
              href="/search"
              className="self-center w-[60px] h-[60px] flex cursor-pointer justify-center hover:bg-[#313131]"
            >
              <IoSearch className="text-[24px] text-white self-center" />
            </Link>
            <User />
            <div
              ref={divRef}
              className={`${showMenu ? "ss-menu-show" : ""} hidden self-center ss-icon-menu `}
              onClick={ChangeMenuState}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
