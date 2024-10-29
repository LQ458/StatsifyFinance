"use client";
import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import React from "react";
import { useRouter, useSearchParams} from 'next/navigation';
import { useState, useRef, useEffect } from "react";
import styles from "@/src/css/news.module.css";
import SideNav from "@/components/side-nav";
import Slider, {
  SwiperComponentHandle,
} from "@/components/news-slider";
import { IoIosArrowDown } from "react-icons/io";
import {
  category  
} from "@/src/data/news/content";

interface ChangeData {
  activeIndex: number;
  isBeginning: boolean;
  isEnd: boolean;
}
interface Item {
  _id: number;
  category: string;
  title: string;
  desc: string;
  image: string;
  content: string;
  createdAt: string;
}

interface Category {
  _id: string;
  title: string;
  order: number;
}


interface twoDimension extends Array<Item[]> {}

const News: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams()
  const [current, setCurrent] = useState(0);
  const [currentNav, setCurrentNav] = useState('');
  const [isNoData, setIsNoData] = useState(false);
  const [noPrev, setNoPrev] = useState(true); // 默认没有上一页
  const [noNext, setNoNext] = useState(false); // 默认还有下一页
  const [pages, setPagesArray] = useState<twoDimension>([]);
  const [list, setList] = useState<Item[]>([]);
  const [category, setCategory] = useState<Category[]>([]);
  const [categoryItem, setCategoryItem] = useState<Category>({
    _id: '',
    title: '',
    order: 1
  });

  const swiperRef = useRef<SwiperComponentHandle>(null);
  const pageNum = 8; // 每页显示多少个
  let firstEntry, categoryId: string = '', dataArrayTemp: Item[] = [], pagesTemp: twoDimension = []
  // 获取地址栏category参数，用于跳转到指定分类
  const cId = searchParams.get('category')

  // 获取资讯分类
  const getArticlesCategory = async () => {    
    const response = await fetch(
      `/api/admin/articles-category`
    )
    const list = await response.json();  
    console.log('category::::', list)
    setCategory(list.data.list) 
  };

  // 获取资讯数据
  const getArticles = async () => {    
    const response = await fetch(
      `/api/admin/articles?page=1&per=10000`
    )
    const list = await response.json();  
    console.log('list::::', list)
    setList(list.data.list) 
  };

  

  



  // 类似于vue的mounted
  useEffect(() => {
    const getData = async () => { 
      await getArticles()
      await getArticlesCategory()
      console.log('category:::', category)      
    }
    getData()    
    
  }, []);

  // slide切换时改变相关控件状态
  const handleChange = (newData: ChangeData) => {
    const { activeIndex, isBeginning, isEnd } = newData;
    setCurrent(activeIndex);
    setNoPrev(isBeginning);
    setNoNext(isEnd);
  };

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  const handlePrev = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const handleSlideTo = (index: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
    }
  };

  const switchNav = (id: string) => {
    setCurrentNav(id)
    // 切换Nav时slide回到第一页
    handleSlideTo(0)
  };

  const setNavData = (id: string) => {
    list.map(item => {
      const { category } = item
      if (category === id) {
        dataArrayTemp.push(item)
      }
    })
    pagesTemp = []
    for (let i = 0; i < dataArrayTemp.length; i += pageNum) {
      pagesTemp.push(dataArrayTemp.slice(i, i + pageNum));
    }
    // 大于一页，设置下一页按钮状态
    if (pagesTemp.length > 1) {
      setNoNext(false)
    } else {
      setNoNext(true)
    }
    setPagesArray(pagesTemp)
  };

  useEffect(() => {
    // ''为初值，没有意义
    if (currentNav === '') {
      return
    }
    setNavData(currentNav)
    category.forEach(item => {
      if (item._id === currentNav) {
        setCategoryItem(item)
      }
    })
  }, [currentNav]);

  useEffect(() => {
    // 如果分类数小于等于0，就判定没内容
    if (category.length <= 0) {
      setIsNoData(true);
    } else {
      // 如果有分类id参数就跳过去
      if (cId) {
        categoryId = cId
        category.forEach(item => {
          if (item._id === cId) {
            setCategoryItem(item)
          }
        })
      } else {
        firstEntry = category[0];
        categoryId = firstEntry['_id']
        setCategoryItem(firstEntry)
      }
      console.log('categoryId:::', categoryId)
      setCurrentNav(categoryId)
    }
  }, [category]);

  

  return (
    <main className="flex flex-col h-screen bg-[#131419]">
      <Topbar position="relative" />
      <div className="flex flex-grow flex-col w-full bg-login-bg bg-cover bg-center max-w-[1920px] min-w-[1100px] mx-auto px-[60px] pt-[80px]">
        <div className="flex flex-grow">
          <div className="w-[1000px] mx-auto text-center self-center translate-y-[-60px] news-container flex">
            <div className={`${styles["left-side"]}`}>
              <SideNav currentNav={ currentNav } navItems={ category } onItemClick={ switchNav } />            
            </div>
            <div className={`${styles["main"]}`}>
              <h1 className="text-white opacity-90 text-[40px] font-normal leading-[1.2] mb-[20px]">
              金融市场动态、基础知识和深入分析
              </h1>
              <p className="text-[#B8B8B8] text-[16px]">
              开启投资跃升之路
              </p>

              <div className="mt-[30px] text-left">
                <div className={`${styles.tabContent}`}>
                  <Slider
                    ref={swiperRef}
                    className={`${styles.slider}`}
                    items={pages}
                    category = {categoryItem}
                    onChange={handleChange}
                  />
                  <div
                    onClick={() => handlePrev()}
                    className={`${styles["custom-prev"]} ${noPrev ? styles["disabled"] : ""}`}
                  >
                    <IoIosArrowDown className={`text-[22px] rotate-[90deg]`} />
                  </div>
                  <div
                    onClick={() => handleNext()}
                    className={`${styles["custom-next"]} ${noNext ? styles["disabled"] : ""}`}
                  >
                    <IoIosArrowDown className={`text-[22px] rotate-[-90deg]`} />
                  </div>
                </div>
              </div>
              <div className={`${styles["custom-pagination"]}`}>
                <ul>
                  {pages.map((item, idx) => (
                    <li
                      key={idx}
                      className={`${current === idx ? styles["active"] : ""}`}
                      onClick={() => handleSlideTo(idx)}
                    ></li>
                  ))}
                </ul>
              </div>
            </div>
            
          </div>
          
        </div>
      </div>
      <Footer position="relative" />
    </main>
  );
};

export default News;
