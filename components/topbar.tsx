/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import React from "react";
import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaRegUserCircle } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import Menu from "./menu";
import styles from "../src/css/topbar.module.css";
import { signOut, useSession } from "next-auth/react";
type PositionType = "relative" | "fixed" | "absolute";

interface TopbarProps {
  position: PositionType;
}

const Topbar: React.FC<TopbarProps> = ({ position }) => {
  const nav = useRouter();
  const searchParams = useSearchParams();
  const [isSearch, setSearchState] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [username, setUsername] = useState("");
  const [admin, setAdmin] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  let urlKeywords = searchParams.get("keywords") || "";
  const { data: session } = useSession();

  useEffect(() => {
    if (urlKeywords) {
      setSearchState(true);
      setKeywords(urlKeywords);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, []);

  useEffect(() => {
    console.log("session::", session);
    if (!session) return;
    const { admin, email, image, name } = session?.user as any;
    setUsername(name);
    setAdmin(admin);
  }, [session]);

  // 切换搜索状态的函数
  const searchIconClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (keywords.trim() !== "") {
      // alert(`搜索关键字：${keywords}`);
      // router.push(`/search?keywords=${keywords}&random=${new Date().getTime()}`)
      window.location.href = `/search?keywords=${keywords}&random=${new Date().getTime()}`;
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
  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      searchIconClick();
    }
  };
  // 搜索关键字发生改变
  const keywordsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeywords(event.target.value);
  };

  // 退出
  const quit = () => {
    signOut({ callbackUrl: "/" });
  };
  // 管理
  const manage = () => {
    window.location.href = "/admin/dashboard";
  };
  return (
    <div className="w-[100%] min-w-[1100px] bg-topbar-color border-b border-topbar-border-color h-[60px] ${position} z-[10000] flex-grow-0 flex-shrink-0">
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
                placeholder="关键字"
                type="text"
                value={keywords}
                onChange={keywordsChange}
                onBlur={handleBlur}
                onKeyPress={handleKeyPress}
                className={`${isSearch ? styles.search : "w-0 opacity-0"} h-[30px] px-[8px] focus:outline-0 pr-[30px] text-[14px] placeholder-gray-300 rounded-[4px] text-white bg-input-bg-color self-center transition-all duration-300`}
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
            {!session ? (
              <Link
                href="/login"
                className="flex text-white space-x-3 no-underline"
              >
                <FaRegUserCircle className="text-[24px] self-center" />
              </Link>
            ) : (
              <div className="flex self-center relative text-white text-[14px]">
                {admin ? "管理员" : "您好"}：{username}{" "}
                <a
                  href="#"
                  className="mx-[15px] text-yellow-400 hover:text-yellow-300"
                  onClick={quit}
                >
                  退出登录
                </a>{" "}
                {admin ? (
                  <a
                    className=" text-yellow-400 hover:text-yellow-300"
                    href="#"
                    onClick={manage}
                  >
                    管理
                  </a>
                ) : (
                  ""
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
