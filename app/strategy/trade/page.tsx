"use client";
import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams} from 'next/navigation';
import styles from "@/src/css/learn.module.css";
import LearnSlider, { SwiperComponentHandle } from "@/components/learn-slider";
import Str2html from "@/components/str2html";
import MainNav from "@/components/main-nav";
import {
  list
} from "@/src/data/strategy/trade";
import {
  mainNavList
} from "@/src/data/strategy/mainNav";
import { IoIosArrowDown } from "react-icons/io";

// 定义对象类型
interface Item {
  title: string;
  content: string;
}
interface ChangeData {
  activeIndex: number;
  isBeginning: boolean;
  isEnd: boolean;
}
interface Map {
  title: string;
  content: Item[];
}
interface Mapping {
  key: string;
  value: string;
}

const Strategy = () => {
  const [current, setCurrent] = useState(0);
  const [noPrev, setNoPrev] = useState(true); // 默认没有上一页
  const [noNext, setNoNext] = useState(false); // 默认还有下一页
  const handleChange = (newData: ChangeData) => {
    const { activeIndex, isBeginning, isEnd } = newData;
    setCurrent(activeIndex);
    setNoPrev(isBeginning);
    setNoNext(isEnd);
  };
  const swiperRef = useRef<SwiperComponentHandle>(null);
  const tabRef = useRef(null);
  const searchParams = useSearchParams()


  useEffect(() => {
    let index = searchParams.get('index')
    if(index){
      const sIndex = Number(index)
      if (!isNaN(sIndex)) {
        if(sIndex >= 0 && sIndex <= list.length - 1){
          handleSlideTo(sIndex);
        }
      }
    }
  }, []);

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
  const tabChange = (idx: number, evt: any) => {
    handleSlideTo(idx);
  };

  useEffect(() => {
    const tabScrollCenter = () => {
      if (tabRef.current) {
        const li = (tabRef.current as HTMLElement).querySelectorAll("li");
        if (current >= li.length / 2) {          
          tabRef.current?.scrollTo({
            left: tabRef.current?.scrollWidth
          });
        } else {
          tabRef.current?.scrollTo({
            left: 0
          });
        }
      }
    };

    tabScrollCenter();
  }, [current]);


  return (
    <main className="flex flex-col h-screen bg-[#131419]">
      <Topbar position="relative" />
      <div className="flex flex-grow flex-col w-full bg-analysis-bg bg-cover bg-center max-w-[1920px] min-w-[1100px] mx-auto px-[60px]">
        <MainNav navItems={ mainNavList } />        
        <div className="flex flex-grow">
          <div className="w-[1000px] mx-auto text-center self-center translate-y-[-60px] learn-container">
            <h1 className="text-white opacity-90 text-[40px] font-normal leading-[1.2] mb-[20px]">
              交易策略
            </h1>
            <p className="text-[#B8B8B8] text-[16px]">
              使用数学、统计学、编程和大数据分析等技术，
              <br />
              基于历史数据和市场信号制定的交易策略
            </p>

            <div className="mt-[30px] text-left">
              <div className={`${styles.tab}`}>
                <ul ref={tabRef}>
                  {list.map((item, idx) => (
                    <li
                      key={idx}
                      className={`${current === idx ? styles["active"] : ""}`}
                      onClick={(e) => tabChange(idx, e)}
                    >
                      <Str2html htmlString={item.title} />
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`${styles.tabContent}`}>
                <LearnSlider
                  ref={swiperRef}
                  className={`${styles.slider}`}
                  items={list}
                  onChange={handleChange}
                  sliderIndex={0}
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
                {list.map((item, idx) => (
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

export default Strategy;
