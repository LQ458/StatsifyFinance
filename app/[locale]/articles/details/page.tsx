"use client";
import { Link } from "@/i18n/navigation";
import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import styles from "@/src/css/news.module.css";
import Str2html from "@/components/str2html";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";

interface Item {
  id: number;
  title: string;
  cover: string;
  content: string;
  createdAt: string;
}

interface Mapping {
  id: number;
  value: string;
}

const NewsDetails = () => {
  const searchParams = useSearchParams();
  const [cat, setCategory] = useState<Mapping>({
    id: 0,
    value: "",
  });
  const [news, setNews] = useState<Item>({
    id: 0,
    title: "",
    cover: "",
    content: "",
    createdAt: "",
  });

  // 获取地址栏category参数，用于跳转到指定分类
  let id = searchParams.get("id");
  let cId = searchParams.get("category");
  let categoryName = searchParams.get("category-name");

  const t = useTranslations("article_details");
  const commonT = useTranslations("common");

  // 获取资讯数据
  const getArticles = async () => {
    try {
      const response = await fetch(`/api/admin/articles/${id}`);
      const list = await response.json();
      console.log("news::::", list);

      // 添加数据验证
      if (list?.data?.list) {
        setNews(list.data.list);
      } else {
        console.error("Invalid data structure:", list);
        // 可以设置一个错误状态或使用默认值
        setNews({
          id: 0,
          title: "",
          cover: "",
          content: "",
          createdAt: "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch article:", error);
      setNews({
        id: 0,
        title: "",
        cover: "",
        content: "",
        createdAt: "",
      });
    }
  };

  // 类似于vue的mounted
  useEffect(() => {
    if (id) {
      getArticles();
    }
  }, [id]);

  return (
    <main className="flex flex-col min-h-screen bg-[#131419]">
      <Topbar position="relative" />
      <div
        className="flex flex-grow flex-col w-full bg-login-bg bg-cover bg-center max-w-[1920px] min-w-[1180px] mx-auto p-[60px]"
        style={{ backgroundAttachment: "fixed" }}
      >
        <div className="w-[1000px] mx-auto news-container">
          <div className="text-left text-[#999] text-[16px] ss-bread">
            <Link href={`/articles?category=${cId}`}>
              {t("breadcrumb.articles")}
            </Link>{" "}
            &gt; <span>{news.title} </span>
          </div>
          <div className={`${styles.newsContent} ss-news-content`}>
            <h1>{news.title}</h1>
            <div className="border-b border-[#333] pb-[10px] text-[#666] text-[16px] ss-news-date">
              {news.createdAt &&
                dayjs(news.createdAt).format(commonT("dateFormat.long"))}
            </div>
            <div className={`${styles.newsMain} ss-news-main`}>
              <Str2html htmlString={news.content} />
            </div>
          </div>
        </div>
      </div>
      <Footer position="relative" />
    </main>
  );
};

export default NewsDetails;
