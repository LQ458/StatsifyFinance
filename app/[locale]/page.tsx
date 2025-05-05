"use client";
/* eslint-disable @next/next/no-img-element */
import Topbar from "@/components/topbar";
import Footer from "@/components/footer";
import Link from "next/link";
import Str2html from "@/components/str2html";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";

interface Item {
  _id: string;
  type: string;
  title: string;
  category: string;
  enTitle: string;
  content: string;
  enContent: string;
}

export default function Home() {
  const t = useTranslations("home");
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<Item[]>([]);
  const locale = useLocale();

  // 获取数据
  const getFeaturedData = async () => {
    const response = await fetch(
      `/api/admin/learn?page=1&per=10000&featured=1`,
    );
    const list = await response.json();
    if (list?.data?.list?.length > 0) {
      setList(list.data.list);
    }
  };

  useEffect(() => {
    const getData = async () => {
      await getFeaturedData();
      setLoading(false);
    };
    getData();
  }, []);

  return (
    <main className="bg-intro-color flex flex-col h-screen">
      <Topbar position="relative" />
      <div className="w-full flex-grow relative">
        <div className="abrazine">
          <div className="ball-list">
            <ul>
              <li
                style={{ background: "red", boxShadow: "0 0 50px 50px red" }}
              ></li>
              <li
                style={{ background: "blue", boxShadow: "0 0 50px 50px blue" }}
              ></li>
              <li
                style={{
                  background: "green",
                  boxShadow: "0 0 50px 50px green",
                }}
              ></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-row justify-center align-middle max-w-[1920px] min-w-[1100px] mx-auto h-[100%] relative z-10 index-container">
          <div className="self-center flex-grow pl-[120px] -mt-[50px] min-w-0 ss-index-left">
            <div className="flex flex-col gap-5 mb-[160px]">
              <h1 className="text-white font-[400] text-[32px]">
                {t("title")}
              </h1>
              <div className="bg-yellow-400 h-0.5 w-16"></div>
              <div className="text-[16px]">
                <p className="text-[#666666] max-w-[600px]">{t("subtitle")}</p>
              </div>
            </div>

            <div className="min-h-[81px]">
              <div className="flex flex-row justify-between max-w-[886px] mb-[10px]">
                <p className="text-[#666666] text-[14px]">
                  {t("vocabs.title")}
                </p>
                <Link
                  href="/analysis/quantitative"
                  className="text-[#666666] text-[14px] hover:text-[#ffd700]"
                >
                  {t("vocabs.more")} &gt;
                </Link>
              </div>
              {loading ? (
                <div className="text-[#666] text-center">
                  {t("vocabs.loading")}
                </div>
              ) : (
                <div className="flex max-w-[886px] gap-[1px] ss-vocabs">
                  {list.map((item, idx) => (
                    <div
                      key={idx}
                      className="relative group flex-1 min-w-0 ss-vocabs-item"
                    >
                      <div className="flex flex-row h-[50px] leading-[50px] ss-vocabs-head">
                        <div className="w-[86px] h-[100%] bg-[rgba(63,64,68,.7)] border-0 border-b-2 border-transparent duration-300 transition  group-hover:border-yellow-400 group-hover:delay-150 flex-shrink-0 flex-grow-0 ss-vocabs-label">
                          <p className="text-[12px] h-[100%] text-center text-[#525356]">
                            {t("vocabs.item.vocab")}
                            <span className="text-[28px] text-[#666666] italic font-[600]">
                              {idx + 1}
                            </span>
                          </p>
                        </div>
                        <div className="flex-grow-[1] h-[100%] bg-[rgba(42,43,48,.5)] text-white px-[20px] text-[16px] truncate">
                          {locale === "zh" ? item.title : item.enTitle}
                        </div>
                      </div>
                      <div className="absolute left-0 right-0 top-[50px] bg-[rgba(63,64,68,.3)] border-0 border-t border-[rgba(0,0,0,.3)] p-[20px] text-white text-[14px] duration-300 transition invisible opacity-0 translate-y-[-10%] group-hover:visible group-hover:opacity-100 group-hover:translate-y-[0] ss-vocabs-content">
                        <div className="vocab-content">
                          <Str2html
                            htmlString={
                              locale === "zh"
                                ? item.content
                                : item.enContent || ""
                            }
                          />
                        </div>
                        <style jsx>{`
                          .vocab-content {
                            display: -webkit-box;
                            -webkit-line-clamp: 3;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                          }
                        `}</style>
                        <div className="text-right">
                          <Link
                            href={`/analysis/${item.type}?category=${item.category}&_id=${item._id}`}
                            className="text-[16px] text-white no-underline hover:text-yellow-400"
                          >
                            more &gt;
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="self-center flex pr-[76px] min-w-[500px] ss-index-right">
            <img
              src="/icon.png"
              alt="icon"
              width="600px"
              height="600px"
              className="m-auto ml-0"
            />
          </div>
        </div>
      </div>
      <Footer position="relative" />
    </main>
  );
}
