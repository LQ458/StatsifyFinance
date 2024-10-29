"use client";
import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import React from "react";
import { useState, useRef, useEffect } from "react";
import styles from "@/src/css/finance-terms.module.css";
import Slider, {
  SwiperComponentHandle,
} from "@/components/finance-terms-slider";
import Str2html from "@/components/str2html";
import { IoIosArrowDown } from "react-icons/io";
import Link from "next/link";
// 定义对象类型
interface Item {
  _id: string;
  title: string;
  enTitle: string;
  image: string;
  content: string;
  createdAt: string;
}
interface ChangeData {
  activeIndex: number;
  isBeginning: boolean;
  isEnd: boolean;
}

const Qualitative = () => {
  const [current, setCurrent] = useState(0);
  const [noPrev, setNoPrev] = useState(true); // 默认没有上一页
  const [noNext, setNoNext] = useState(false); // 默认还有下一页
  const [list, setList] = useState<Item[]>([]);
  const swiperRef = useRef<SwiperComponentHandle>(null);
  const tabRef = useRef<HTMLUListElement>(null);
  const pageNum = 8; // 每页显示多少个


  // 获取资讯数据
  const getArticles = async () => {    
    const response = await fetch(
      `/api/admin/finance-terms?page=1&per=10000`
    )
    const list = await response.json();  
    console.log('list::::', list)
    setList(list.data.list) 
  };

  // 类似于vue的mounted
  useEffect(() => {
    const getData = async () => { 
      await getArticles()
    }
    getData()
    
  }, []);

  const pages = [];
  for (let i = 0; i < list.length; i += pageNum) {
    pages.push(list.slice(i, i + pageNum));
  }

  const handleChange = (newData: ChangeData) => {
    // console.log('handleChange::', newData)
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

  return (
    <main className="flex flex-col h-screen bg-[#131419]">
      <Topbar position="relative" />
      <div className="flex flex-grow flex-col w-full bg-login-bg bg-cover bg-center max-w-[1920px] min-w-[1180px] mx-auto px-[60px] pt-[80px]">
        <div className="flex flex-grow">
          <div className="w-[1180px] mx-auto text-center self-center translate-y-[-60px] finance-terms-container">
            <h1 className="text-white opacity-90 text-[40px] font-normal leading-[1.2] mb-[20px]">
              金融基础术语教学
            </h1>
            <p className="text-[#B8B8B8] text-[16px]">
              提供金融术语的字典或词典，包括定义、使用场景和例子
            </p>

            <div className="mt-[30px] text-left">
              <div className={`${styles.tabContent}`}>
                <Slider
                  ref={swiperRef}
                  className={`${styles.slider}`}
                  items={pages}
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
      <Footer position="relative" />
    </main>
  );
};

export default Qualitative;
