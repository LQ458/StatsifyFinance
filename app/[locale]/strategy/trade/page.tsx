"use client";
import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import React from "react";
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import styles from "@/src/css/learn.module.css";
import LearnSlider, { SwiperComponentHandle } from "@/components/learn-slider";
import MainNav from "@/components/main-nav";
import { mainNavList } from "@/src/data/strategy/mainNav";
import { IoIosArrowDown } from "react-icons/io";

interface Item {
  title: string;
  enTitle: string;
  content: string;
}
interface ChangeData {
  activeIndex: number;
  isBeginning: boolean;
  isEnd: boolean;
}

const Strategy = () => {
  const [swiperIndex, setSwiperIndex] = useState(0);
  const [isInitialRender, setIsInitialRender] = useState(true); // swiper初始化判定，用于跳过首次执行，避免首次执行覆盖地址栏传参
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [noPrev, setNoPrev] = useState(true); // 默认没有上一页
  const [noNext, setNoNext] = useState(false); // 默认还有下一页
  const [list, setList] = useState<Item[]>([]);
  const handleChange = (newData: ChangeData) => {
    const { activeIndex, isBeginning, isEnd } = newData;
    setCurrent(activeIndex);
    setNoPrev(isBeginning);
    setNoNext(isEnd);
    setSwiperIndex(activeIndex);
  };
  const swiperRef = useRef<SwiperComponentHandle>(null);
  const tabRef = useRef<HTMLUListElement>(null);
  const searchParams = useSearchParams();

  const updateIndex = (newIndex: number) => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("index", String(newIndex));
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState({}, "", newUrl);
  };

  // 获取数据
  const getTradeData = async () => {
    const response = await fetch(
      `/api/admin/learn?page=1&per=10000&type=trade`,
    );

    if (!response.ok) {
      console.error("Network response was not ok");
      return;
    }

    const text = await response.text();
    if (text) {
      try {
        const list = JSON.parse(text);
        if (list?.data?.list?.length > 0) {
          setList(list.data.list);
          setNoNext(false);
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    } else {
      console.warn("Response was empty");
    }
  };

  useEffect(() => {
    const getData = async () => {
      await getTradeData();
      setLoading(false);
    };
    getData();
  }, []);

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
    } else {
      updateIndex(swiperIndex);
    }
  }, [swiperIndex]);
  // 数据加载完成后判断地址栏参数index，用于滑动到指定位置
  useEffect(() => {
    let index = searchParams.get("index");
    if (index) {
      const sIndex = Number(index);
      if (!isNaN(sIndex)) {
        if (sIndex >= 0 && sIndex <= list.length - 1) {
          handleSlideTo(sIndex);
        }
      }
    }
  }, [list]);

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
        // 有滚动条才滚动
        if (tabRef.current.offsetWidth < tabRef.current.scrollWidth) {
          const li = (tabRef.current as HTMLElement).querySelectorAll("li");
          if (li.length > 0 && current >= 0) {
            tabRef.current?.scrollTo({
              left: li[current].offsetLeft,
            });
          }
        }
      }
    };
    tabScrollCenter();
  }, [current]);

  return (
    <main className="flex flex-col h-screen bg-[#131419]">
      <Topbar position="relative" />
      <div className="flex flex-grow flex-col w-full bg-strategy-bg bg-cover bg-center max-w-[1920px] min-w-[1100px] mx-auto px-[60px]">
        <MainNav navItems={mainNavList} />
        <div className={`${loading ? "invisible" : ""} flex flex-grow`}>
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
              <div className={`${styles.tab} ss-tab`}>
                <ul ref={tabRef}>
                  {list.map((item, idx) => (
                    <li
                      key={idx}
                      className={`${current === idx ? styles["active"] : ""}`}
                      onClick={(e) => tabChange(idx, e)}
                    >
                      {item.title}
                      <br />
                      {item.enTitle}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`${styles.tabContent} ss-tab-content`}>
                <LearnSlider
                  ref={swiperRef}
                  className={`${styles.slider}`}
                  items={list}
                  onChange={handleChange}
                />
                <div
                  onClick={() => handlePrev()}
                  className={`${styles["custom-prev"]} ${noPrev ? styles["disabled"] : ""} ss-custom-prev`}
                >
                  <IoIosArrowDown className={`text-[22px] rotate-[90deg]`} />
                </div>
                <div
                  onClick={() => handleNext()}
                  className={`${styles["custom-next"]} ${noNext ? styles["disabled"] : ""} ss-custom-next`}
                >
                  <IoIosArrowDown className={`text-[22px] rotate-[-90deg]`} />
                </div>
              </div>
            </div>
            <div
              className={`${styles["custom-pagination"]} ss-custom-pagination`}
            >
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
      {loading ? <div className="global-loading bg-loading"></div> : ""}
    </main>
  );
};

export default Strategy;
