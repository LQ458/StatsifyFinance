"use client";
import Link from "next/link";
import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import React from "react";
import { useRouter, useSearchParams} from 'next/navigation';
import { useState, useRef, useEffect } from "react";
import styles from "@/src/css/news.module.css";
import Str2html from "@/components/str2html";
import {
  category,
  list
} from "@/src/data/news/content";

interface Item {
  id: number,
  title: string;
  cover: string;
  content: string;
  createTime: string;
}

interface Mapping {
  id: number;
  value: string;
}

const newsDetails = () => {
  const searchParams = useSearchParams()
  const [cat, setCategory] = useState<Mapping>({});
  const [news, setNews] = useState<Item>({});
  const [noPrev, setNoPrev] = useState(true); // 默认没有上一页
  const [noNext, setNoNext] = useState(false); // 默认还有下一页
  // 获取地址栏category参数，用于跳转到指定分类
  let id = searchParams.get('id')
  let cId = searchParams.get('category')

  // 类似于vue的mounted
  useEffect(() => {
    console.log('cId:::', cId) 
    console.log('idididid:::', id) 
    category.map(item => { 
      if (cId && (parseInt(cId) === item.id)) {
        console.log('sdfsdfsdfsdf') 
        setCategory(item)
      }
    })

    list.map(item => {      
        if (id && (parseInt(id) === item.id)) {
          console.log('dddd') 
          setNews(item)
        }
    })
    console.log('cat:::', cat) 
    console.log('news:::', news) 
  }, []);


  return (
    <main className="flex flex-col min-h-screen bg-[#131419]">
      <Topbar position="relative" />
      <div className="flex flex-grow flex-col w-full bg-login-bg bg-cover bg-center max-w-[1920px] min-w-[1180px] mx-auto p-[60px]" style={{ backgroundAttachment: 'fixed' }}>
          <div className="w-[1000px] mx-auto">
            <div className="text-left text-[#999] text-[16px]">
                <Link href={`/news?category=${cat.id}`}> { cat.value }</Link> &gt; <span>{ news.title } </span>
            </div>
            <div className={`${styles.newsContent}`}>
              <h1>{news.title}</h1>
              <div className="border-b border-[#666] pb-[10px] text-[#666] text-[16px]"> {news.createTime}</div>
              <div className={`${styles.newsMain}`}>
                <Str2html htmlString={news.content} />
              </div>
            </div>
          </div>        
      </div>
      <Footer position="relative" />
    </main>
  );
};

export default newsDetails;
