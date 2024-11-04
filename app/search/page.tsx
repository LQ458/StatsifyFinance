"use client";
import Link from "next/link";
import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import styles from "@/src/css/search.module.css";
import mainNav from "@/src/css/main-nav.module.css";
import Str2html from "@/components/str2html";

type Article = {
  _id: string;
  title: string;
  desc: string;
  image: string;
  content: string;
  category: string;
};

interface FinanceTerms {
  _id: string;
  title: string;
  enTitle: string;
  image: string;
  content: string;
  createdAt: string;
}

const Search = () => {
  const searchParams = useSearchParams()
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [financeTermsList, setFinanceTermsList] = useState<FinanceTerms[]>([]);
  const [keywords, setKeywords] = useState('');
  const [currentNav, setCurrentNav] = useState('a');
  
  const [query, setQuery] = useState({
    per: 1000,
    page: 1,
  });

  // 标记
  const addMark = (content: string, keyword: string) => {
    let result = ''
    if (content.indexOf(keyword) > -1) {
      const regex = new RegExp(keyword, 'g');
      result = content.replace(regex, `<span style="color:#FFD700">${keyword}</span>`);      
    } 
    return result
  }

  // 获取资讯
  const getArticles = async (key: string) => {
    const response = await fetch(
      `/api/admin/articles?page=${query.page}&per=${query.per}&title=${key}`
    )      
    const list = await response.json();       
    let filterList: Article[] = []
    list?.data?.list && list.data.list.map((item: Article) => {
      filterList.push({
        ...item,
        title: addMark(item.title, key)
      })
    })
    setArticlesList(filterList);
  }
  // 获取金融基础术语
  const getFinanceTerms = async (key: string) => {    
    const response = await fetch(
      `/api/admin/finance-terms?page=1&per=10000&title=${key}`
    )
    const list = await response.json();  
    let filterList: FinanceTerms[] = []
    list?.data?.list && list.data.list.map((item: FinanceTerms) => {
      filterList.push({
        ...item,
        title: addMark(item.title, key),
        enTitle: addMark(item.enTitle, key)
      })
    })
    setFinanceTermsList(filterList) 
  };

  // 类似于vue的mounted
  useEffect(() => {
    // 获取地址栏keywords参数
    let keywords = searchParams.get('keywords') || ''
    if (keywords) {      
      setKeywords(keywords)
      // 资讯
      getArticles(keywords)
      // 金融基础术语
      getFinanceTerms(keywords)
    }
  }, []);

  return (
    <main className="flex flex-col min-h-screen bg-[#131419]">
      <Topbar position="relative" />
      <div className="flex flex-grow flex-col w-full bg-login-bg bg-cover bg-center max-w-[1920px] min-w-[1180px] mx-auto p-[60px]" style={{ backgroundAttachment: 'fixed' }}>
          <div className="w-[1000px] mx-auto">            
          <div className={`${styles.newsContent}`}>
          <div className={`${mainNav.nav} w-full`}>
            <ul className="border-b border-[#666] ">
                <li className={`${ currentNav === 'articles' ? mainNav.active : ''}`}>
                  <Link href="#">资讯</Link>
                </li>
                <li className={`${ currentNav === 'a' ? mainNav.active : ''}`}>
                  <Link href="#">金融基础术语</Link>
                </li>
                <li className={`${ currentNav === 'articles' ? mainNav.active : ''}`}>
                  <Link passHref href="#">定量</Link>
                </li>
                <li className={`${ currentNav === 'articles' ? mainNav.active : ''}`}>
                  <Link passHref href="#">定性</Link>
                </li>
                <li className={`${ currentNav === 'articles' ? mainNav.active : ''}`}>
                  <Link passHref href="#">交易策略</Link>
                </li>
                <li className={`${ currentNav === 'articles' ? mainNav.active : ''}`}>
                  <Link passHref href="#">风控</Link>
                </li>
            </ul>
          </div>
            




              <div className=" pt-[20px] text-[#fff] text-[14px]"> 找到与“<span className="text-[#FFD700]">{keywords}</span>”相关的内容共{articlesList.length}条</div>
            <div className={`${styles.newsMain}`}>
                <h2>资讯</h2>
                <ul>                
                  {articlesList.map((item, idx) => (
                    <li key={idx} >         
                      <Link href={`/articles/details?category=${item.category}&id=${item._id}&category-name=返回分类`}> <Str2html htmlString={item.title} /></Link>          
                    </li>
                  ))}
                </ul>
              =====================
                <h2>金融基础术语</h2>
                <ul>                
                    {financeTermsList.map((item, idx) => (
                      <li key={idx} >
                        <h3><Str2html htmlString={item.title} /><Str2html htmlString={item.enTitle} /></h3>
                        <p>{item.content}</p>
                        {/* <Link href={`/articles/details?category=${item.category}&id=${item._id}&category-name=返回分类`}> <Str2html htmlString={item.title} /></Link>           */}
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
