"use client";
import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import React from "react";
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import styles from "@/src/css/learn.module.css";
import LearnSlider, { SwiperComponentHandle } from "@/components/learn-slider";
import SideNav from "@/components/side-nav";
import MainNav from "@/components/main-nav";
import { mainNavList } from "@/src/data/analysis/mainNav";
import { IoIosArrowDown } from "react-icons/io";

interface Item {
  title: string;
  category: string;
  enTitle: string;
  content: string;
}
interface ChangeData {
  activeIndex: number;
  isBeginning: boolean;
  isEnd: boolean;
}
interface Category {
  _id: string;
  title: string;
  order: number;
}
interface twoDimension extends Array<Item[]> {}

const Analysis = () => {
  const [currentNav, setCurrentNav] = useState("");
  const [swiperIndex, setSwiperIndex] = useState(0);
  const [isNoData, setIsNoData] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true); // swiper初始化判定，用于跳过首次执行，避免首次执行覆盖地址栏传参
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [noPrev, setNoPrev] = useState(true); // 默认没有上一页
  const [noNext, setNoNext] = useState(false); // 默认还有下一页
  const [pages, setPagesArray] = useState<Item[]>([]);
  const [list, setList] = useState<Item[]>([]);
  const [category, setCategory] = useState<Category[]>([]);
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
  const pageNum = 8; // 每页显示多少个
  let firstEntry,
    categoryId: string = "",
    dataArrayTemp: Item[] = [],
    pagesTemp: twoDimension = [];
  // 获取地址栏category参数，用于跳转到指定分类
  const cId = searchParams.get("category");
  // 设置地址栏index参数
  const updateIndex = (newIndex: number) => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("index", String(newIndex));
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState({}, "", newUrl);
  };
  // 设置地址栏category参数
  const updateCategory = (newIndex: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("category", newIndex);
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState({}, "", newUrl);
  };

  // 获取资讯分类
  const getArticlesCategory = async () => {
    const response = await fetch(`/api/admin/category?type=qualitative`);
    const list = await response.json();
    setCategory(list?.data?.list ?? []);
  };

  // 获取数据
  const getTradeData = async () => {
    const response = await fetch(
      `/api/admin/learn?page=1&per=10000&type=qualitative`,
    );
    const list = await response.json();
    if (list?.data?.list?.length > 0) {
      setList(list.data.list);
      setNoNext(false);
    }
  };

  useEffect(() => {
    const getData = async () => {
      await getTradeData();
      await getArticlesCategory();
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
        const li = (tabRef.current as HTMLElement).querySelectorAll("li");
        if (current >= li.length / 2) {
          tabRef.current?.scrollTo({
            left: tabRef.current?.scrollWidth,
          });
        } else {
          tabRef.current?.scrollTo({
            left: 0,
          });
        }
      }
    };

    tabScrollCenter();
  }, [current]);

  const switchNav = (id: string) => {
    setCurrentNav(id);
    updateCategory(id);
    // 切换Nav时slide回到第一页
    handleSlideTo(0);
  };

  const setNavData = (id: string) => {
    dataArrayTemp = list.filter((item) => item.category === id);
    // 大于一页，设置下一页按钮状态
    if (dataArrayTemp.length > 1) {
      setNoNext(false);
    } else {
      setNoNext(true);
    }
    setPagesArray(dataArrayTemp);
  };

  useEffect(() => {
    // ''为初值，没有意义
    if (currentNav === "") {
      return;
    }
    setNavData(currentNav);
  }, [currentNav]);

  // 分类切换
  useEffect(() => {
    // 如果分类数小于等于0，就判定没内容
    if (category.length <= 0) {
      setIsNoData(true);
    } else {
      // 如果有分类id参数就跳过去
      if (cId) {
        categoryId = cId;
      } else {
        firstEntry = category[0];
        categoryId = firstEntry["_id"];
      }
      setCurrentNav(categoryId);
    }
  }, [category]);

  return (
    <main className="flex flex-col h-screen bg-[#131419]">
      <Topbar position="relative" />
      <div className="flex flex-grow flex-col w-full bg-analysis-bg bg-cover bg-center max-w-[1920px] min-w-[1100px] mx-auto px-[60px]">
        <MainNav navItems={mainNavList} />
        <div className={`${loading ? "invisible" : ""} flex flex-grow`}>
          <div className="w-[1000px] mx-auto text-center self-center translate-y-[-60px] learn-container flex">
            <div className={`${styles["left-side"]}`}>
              <SideNav
                currentNav={currentNav}
                navItems={category}
                onItemClick={switchNav}
              />
            </div>
            <div className={`${styles["main"]}`}>
              <h1 className="text-white opacity-90 text-[40px] font-normal leading-[1.2] mb-[20px]">
                定性分析指标
              </h1>
              <p className="text-[#B8B8B8] text-[16px]">
                在金融分析中用于评估企业的非财务方面，如管理质量、品牌价值和市场竞争力。
                <br />
                这些指标基于主观判断和经验，帮助投资者和分析师全面了解企业的整体状况。
              </p>

              <div className="mt-[30px] text-left">
                <div className={`${styles.tab}`}>
                  <ul ref={tabRef}>
                    {pages.map((item, idx) => (
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
                <div className={`${styles.tabContent}`}>
                  <LearnSlider
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
      </div>
      <Footer position="relative" />
      {loading ? <div className="global-loading bg-loading"></div> : ""}
    </main>
  );
};

export default Analysis;
