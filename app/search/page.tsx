"use client";
import Link from "next/link";
import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import styles from "@/src/css/search.module.css";
import Str2html from "@/components/str2html";
import { IoSearch } from "react-icons/io5";
import Image from 'next/image';
import dayjs from "dayjs";

type Item = {
  _id: string;
  title: string;
  enTitle?: string;
  desc: string;
  image: string;
  content: string;
  category: string;
  createdAt: string;
};

const Search = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [keywords, setKeywords] = useState('');
  const [currentNav, setCurrentNav] = useState('articles');
  const [data, setData] = useState<Item[]>([]);
  const [controller, setController] = useState<AbortController | null>(null);
  const [currentSearchKeyword, setCurrentSearchKeyword] = useState('')
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [noData, setNoData] = useState(true);  
  const [query, setQuery] = useState({
    per: 1000,
    page: 1,
  });

  const DICT: { [key: string]: string } = {
    'articles': `/api/admin/articles?page=${query.page}&per=${query.per}&title=${currentSearchKeyword}`,
    'finance-terms': `/api/admin/finance-terms?page=1&per=10000&title=${currentSearchKeyword}`,
    'qualitative': `/api/admin/learn?page=1&per=10000&type=qualitative&title=${currentSearchKeyword}`,
    'quantitative': `/api/admin/learn?page=1&per=10000&type=quantitative&title=${currentSearchKeyword}`,
    'trade': `/api/admin/learn?page=1&per=10000&type=trade&title=${currentSearchKeyword}`,
    'risk-manage': `/api/admin/learn?page=1&per=10000&type=risk-manage&title=${currentSearchKeyword}`,
  }

  // 切换 Tab 时调用的请求函数
  const fetchData = async (url: string) => {
    // 取消之前的请求
    if (controller) controller.abort();

    // 创建新的 AbortController
    const newController = new AbortController();
    setController(newController);

    try {
      const response = await fetch(url, {
        signal: newController.signal,
      });
      const result = await response.json();
      let filterList: Item[] = []
      result?.data?.list && result.data.list.map((item: Item) => {
        
        let tempData = {
          ...item,
          title: addMark(item.title, currentSearchKeyword)
        }
        if (item.enTitle) {
          tempData.enTitle = addMark(item.enTitle, currentSearchKeyword)
        }        
        filterList.push(tempData)
      })
      setData(filterList);
      if (filterList.length === 0) {
        setNoData(true)
      } else {
        setNoData(false)
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('请求被取消');
      } else {
        console.error('请求出错', error);
      }
    }
  };



  // 标记
  const addMark = (content: string, keyword: string) => {
    const regex = new RegExp(keyword, 'gi');
    let result = content.replace(regex, (match) => `<span style="color:#FFD700">${match}</span>`);      
    return result
  }

  const tabClick = async (val: string) => {        
    if (currentSearchKeyword.length > 0) {
      await fetchData(DICT[val])
    }
    setCurrentNav(val)
  }

  const searchHandle = async () => {
    if (keywords.trim().length === 0) {
      return
    }
    setCurrentSearchKeyword(keywords.trim())    
  }
 
  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      searchHandle();
    }
  };
  // 搜索关键字发生改变
  const keywordsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeywords(event.target.value);
  };

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
    } else {
      if (currentSearchKeyword.length > 0) {
        fetchData(DICT[currentNav])
      }
    }    
  }, [currentSearchKeyword]);

  useEffect(() => {    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <main className="flex flex-col min-h-screen bg-[#131419]">
      <Topbar position="relative" />
      <div className="flex flex-grow flex-col w-full bg-login-bg bg-cover bg-center max-w-[1920px] min-w-[1180px] mx-auto p-[60px]" style={{ backgroundAttachment: 'fixed' }}>
          <div className="w-[1000px] mx-auto search-container">            
          <div className={`${styles.searchContent}`}>
            <div>

            <div className="flex gap-10 pb-[20px]">
              <div className="flex self-center relative">
                <input
                  ref={inputRef}
                  placeholder="请输入关键字"
                  type="text"
                  value={keywords}
                  onChange={keywordsChange}
                  onKeyPress={handleKeyPress}
                  className={`h-[30px] px-[8px] focus:outline-0 pr-[30px] text-[14px] placeholder-gray-300 rounded-[4px] text-white bg-input-bg-color self-center transition-all duration-300`}
                />
                <button
                  title="search"
                  type="button"
                  className={`absolute right-[5px] top-[3px] bg-transparent p-0 border-0`}
                >
                    <IoSearch
                      className={`text-[24px] text-white cursor-pointer`}
                      onClick={ searchHandle }
                  />
                </button>
              </div>
            </div>






            </div>
          <div className={`${styles.nav} w-full`}>
            <ul className="border-b border-[#666] ">
                <li className={`${ currentNav === 'articles' ? styles.active : ''}`}>
                  <Link href="#" onClick={() => tabClick('articles')}>资讯</Link>
                </li>
                <li className={`${ currentNav === 'finance-terms' ? styles.active : ''}`}>
                  <Link href="#" onClick={() => tabClick('finance-terms')}>金融基础术语</Link>
                </li>
                <li className={`${ currentNav === 'quantitative' ? styles.active : ''}`}>
                  <Link href="#" onClick={() => tabClick('quantitative')}>定量</Link>
                </li>
                <li className={`${ currentNav === 'qualitative' ? styles.active : ''}`}>
                  <Link href="#" onClick={() => tabClick('qualitative')}>定性</Link>
                </li>
                <li className={`${ currentNav === 'trade' ? styles.active : ''}`}>
                  <Link href="#" onClick={() => tabClick('trade')}>交易策略</Link>
                </li>
                <li className={`${ currentNav === 'risk-manage' ? styles.active : ''}`}>
                  <Link href="#" onClick={() => tabClick('risk-manage')}>风控</Link>
                </li>
            </ul>
          </div>
            



            {currentSearchKeyword.length > 0 && (
              <div className=" pt-[20px] text-[#999] text-[14px]"> 找到与“<span className="text-[#FFD700]">{currentSearchKeyword}</span>”相关的内容共{data.length}条</div>
            )}
            
            
            <div className={`${styles.searchMain}`}>
              {/* 资讯 */}
              { currentNav === 'articles' && (
                    <ul>
                      {data.map((item, idx) => (
                        <li key={idx} >
                          <div className={`${styles.searchArticles}`}>
                            <Link href={`/articles/details?category=${item.category}&id=${item._id}&category-name=返回分类`}> <Str2html htmlString={item.title} /></Link>
                            <div className="text-[14px] text-[#666] flex-shrink-0 flex-grow-0 text-nowrap" >{dayjs(item.createdAt).format("YYYY-MM-DD HH:mm:ss")}</div>
                          </div>                          
                        </li>
                      ))}
                    </ul>     
              )}
              {/* 金融基础术语 */}
              { currentNav === 'finance-terms' && (   
                <ul>
                    {data.map((item, idx) => (
                      <li key={idx} >
                        <div className={`${styles.searchFinanceTerms}`}>                          
                          <div className="flex-auto">
                            <h3><Str2html htmlString={item.title} /> <Str2html htmlString={item.enTitle || ''} /></h3>
                            <p className="text-[14px]">{item.content}</p>
                            <div  className="text-[12px] text-[#666] mt-[10px]">{dayjs(item.createdAt).format("YYYY-MM-DD HH:mm:ss")}</div>
                          </div>
                          <div className="flex-shrink-0 flex-grow-0 self-center">
                            <Image                              
                                src={item.image}
                                alt="风景"
                                width={140}
                                height={79}
                            />
                          </div>
                        </div>
                            
                      </li>
                    ))}
                </ul>
              )}
              {/* 定量、 定性、交易策略、风控*/}
              {(currentNav === 'quantitative'
                || currentNav === 'qualitative'
                || currentNav === 'trade'
                || currentNav === 'risk-manage'
              ) && (   
                <ul>
                    {data.map((item, idx) => (
                      <li key={idx} >
                        <div className={`${styles.learn}`}>
                          <h3><Str2html htmlString={item.title} /><Str2html htmlString={item.enTitle || ''} /></h3>
                          <div className="text-[14px]"><Str2html htmlString={item.content} /></div>
                          <div className="text-[14px] text-[#666] mt-[10px]" >{dayjs(item.createdAt).format("YYYY-MM-DD HH:mm:ss")}</div>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
              
            </div>
            
            {/* 没有数据 */}
            {noData && (
              <div className="text-center text-[#999] min-h-[200px] pt-[50px] text-[14px]">
                <div className="bg-no-result w-[64px] h-[64px] bg-cover opacity-30 mx-auto mb-[10px]"></div>
                { currentSearchKeyword.length > 0 ? '没有搜到相关内容' : '请输入需要查找的内容'}
              </div>
            )}
            
          </div>
        </div>
      </div>
      <Footer position="relative" />
    </main>
  );
};

export default Search;
