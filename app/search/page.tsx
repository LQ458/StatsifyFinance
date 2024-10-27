"use client";
import Link from "next/link";
import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import React from "react";
import { useRouter, useSearchParams} from 'next/navigation';
import { useState, useRef, useEffect } from "react";
import styles from "@/src/css/search.module.css";
import Str2html from "@/components/str2html";
import {
  category,
  list
} from "@/src/data/news/content";

interface Item {
  id: number,
  fid: number,
  title: string;
  cover: string;
  content: string;
  createTime: string;
}

const Search = () => {
  const searchParams = useSearchParams()
  const [serarchList, setSerarchList] = useState<Item[]>([]);
  // 获取地址栏keywords参数
  let keywords = searchParams.get('keywords') || ''
  let filterList: Item[] = []

  // 类似于vue的mounted
  useEffect(() => {
    list.map(item => {
      let {title} = item
        if (title.indexOf(keywords) > -1) {
          let tempItem = {...item}
          const regex = new RegExp(keywords, 'g');
          tempItem.title = title.replace(regex, `<span style="color:#FFD700">${keywords}</span>`);
          filterList.push(tempItem)
        }
    })
    setSerarchList(filterList)
  }, []);

  return (
    <main className="flex flex-col min-h-screen bg-[#131419]">
      <Topbar position="relative" />
      <div className="flex flex-grow flex-col w-full bg-login-bg bg-cover bg-center max-w-[1920px] min-w-[1180px] mx-auto p-[60px]" style={{ backgroundAttachment: 'fixed' }}>
          <div className="w-[1000px] mx-auto">            
            <div className={`${styles.newsContent}`}>
              <div className="border-b border-[#666] pb-[20px] text-[#fff] text-[18px]"> 找到与“<span className="text-[#FFD700]">{keywords}</span>”相关的内容共{serarchList.length}条</div>
              <div className={`${styles.newsMain}`}>
                <ul>                
                  {serarchList.map((item, idx) => (
                    <li key={idx} >         
                      <Link href={`/news/details?category=${item.fid}&id=${item.id}`}> <Str2html htmlString={item.title} /></Link>          
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
