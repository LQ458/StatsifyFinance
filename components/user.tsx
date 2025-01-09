"use client";
import React from "react";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { FaRegUserCircle } from "react-icons/fa";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";

const User = () => {
  const [rotate, setRotate] = useState(false);
  const { data: session } = useSession();
  const [username, setUsername] = useState("");
  const [admin, setAdmin] = useState(false);
  const locale = useLocale();
  const router = useRouter();

  const t = useTranslations("navigation");

  useEffect(() => {
    if (!session) return;
    const { admin, email, image, name } = session?.user as any;
    setUsername(name);
    setAdmin(admin);
  }, [session]);

  // 退出
  const quit = () => {
    signOut({ callbackUrl: `/${locale}` });
  };

  // 管理
  const manage = () => {
    router.push("/admin/dashboard");
  };

  return (
    <div className="flex text-[14px]">
      <div className="relative flex">
        {!session ? (
          <Link
            href="/login"
            locale={locale}
            className="text-white space-x-3 no-underline self-center text-[14px] w-[60px] h-[60px] leading-[60px] text-center hover:bg-[#313131]"
          >
            {t("login")}
          </Link>
        ) : (
          <div
            className="flex relative text-white text-[14px]"
            onMouseEnter={() => setRotate(true)}
            onMouseLeave={() => setRotate(false)}
          >
            <div
              className={`${rotate ? "bg-[#313131]" : ""}  text-[24px] w-[60px] flex justify-center`}
            >
              <FaRegUserCircle className="self-center" />
            </div>
            {rotate && (
              <div className="absolute top-[59px] right-[0px] w-[200px] bg-[#313131] p-5 py-2.5 shadow-[0_5px_5px_rgba(0,0,0,0.3)]">
                <div className="leading-[40px] text-[#999]">
                  {admin ? t("admin") : t("hello")}
                </div>
                <div className="leading-[24px] text-[18px] truncate">
                  {username}
                </div>
                <div className="leading-[40px] flex justify-center gap-10 mt-[15px]">
                  <button
                    className="text-yellow-400 hover:text-yellow-300 bg-transparent border-0 cursor-pointer"
                    onClick={quit}
                  >
                    {t("logout")}
                  </button>
                  {admin && (
                    <button
                      className="text-yellow-400 hover:text-yellow-300 bg-transparent border-0 cursor-pointer"
                      onClick={manage}
                    >
                      {t("manage")}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default User;
