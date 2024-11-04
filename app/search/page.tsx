"use client";
import Link from "next/link";
import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import styles from "@/src/css/search.module.css";
import Str2html from "@/components/str2html";

type Article = {
  _id: string;
  title: string;
  desc: string;
  image: string;
  content: string;
  category: string;
};

const Search = () => {
  const searchParams = useSearchParams();
  const [serarchList, setSerarchList] = useState<Article[]>([]);
  const [keywords, setKeywords] = useState("");
  const [query, setQuery] = useState({
    per: 1000,
    page: 1,
  });

  // 监听查询条件的改变
  useEffect(() => {}, [query]);

  // 监听查询条件的改变
  // useEffect(() => {
  //   setQuery({
  //     page: 1,
  //     per: 1000,
  //     title: keywords
  //   });
  // }, [keywords]);

  // 类似于vue的mounted
  useEffect(() => {
    // 获取地址栏keywords参数
    let keywords = searchParams.get("keywords") || "";
    if (keywords) {
      fetch(
        `/api/admin/articles?page=${query.page}&per=${query.per}&title=${keywords}`,
      )
        .then((res) => res.json())
        .then((res) => {
          let filterList: Article[] = [];
          res.data.list.map((item: Article) => {
            let { title } = item;
            if (title.indexOf(keywords) > -1) {
              let tempItem = { ...item };
              const regex = new RegExp(keywords, "g");
              tempItem.title = title.replace(
                regex,
                `<span style="color:#FFD700">${keywords}</span>`,
              );
              filterList.push(tempItem);
            }
          });
          setSerarchList(filterList);
        });
    }
  }, []);

  return (
    <main className="flex flex-col min-h-screen bg-[#131419]">
      <Topbar position="relative" />
      <div
        className="flex flex-grow flex-col w-full bg-login-bg bg-cover bg-center max-w-[1920px] min-w-[1180px] mx-auto p-[60px]"
        style={{ backgroundAttachment: "fixed" }}
      >
        <div className="w-[1000px] mx-auto">
          <div className={`${styles.newsContent}`}>
            <div className="border-b border-[#666] pb-[20px] text-[#fff] text-[18px]">
               找到与“<span className="text-[#FFD700]">{keywords}</span>
              ”相关的内容共{serarchList.length}条
            </div>
            <div className={`${styles.newsMain}`}>
              <ul>
                {serarchList.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href={`/articles/details?category=${item.category}&id=${item._id}&category-name=返回分类`}
                    >
                      {" "}
                      <Str2html htmlString={item.title} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer position="relative" />
    </main>
  );
};

export default Search;
