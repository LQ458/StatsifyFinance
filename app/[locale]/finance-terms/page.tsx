"use client";
import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import React from "react";
import { useState, useRef, useEffect } from "react";
import styles from "@/src/css/finance-terms.module.css";
import Slider, {
  SwiperComponentHandle,
} from "@/components/finance-terms-slider";
import { IoIosArrowDown } from "react-icons/io";
import { useTranslations } from 'next-intl';
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

const FinanceTerms = () => {
  const t = useTranslations('finance_terms');
  const commonT = useTranslations('common');
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [noPrev, setNoPrev] = useState(true); // 默认没有上一页
  const [noNext, setNoNext] = useState(false); // 默认还有下一页
  const [list, setList] = useState<Item[]>([]);
  const [pages, setPages] = useState<Item[][]>([]);
  const swiperRef = useRef<SwiperComponentHandle>(null);
  const pageNum = 8; // 每页显示多少个

  // 获取数据
  const getArticles = async () => {
    const response = await fetch(`/api/admin/finance-terms?page=1&per=10000`);
    const list = await response.json();
    if (list?.data?.list?.length > 0) {
      setList(list.data.list);
    }
  };

  // 类似于vue的mounted
  useEffect(() => {
    const getData = async () => {
      await getArticles();
      setLoading(false);
    };
    getData();
  }, []);

  useEffect(() => {
    const pages = [];
    for (let i = 0; i < list.length; i += pageNum) {
      pages.push(list.slice(i, i + pageNum));
    }
    // 大于一页，设置下一页按钮状态
    if (pages.length > 1) {
      setNoNext(false);
    } else {
      setNoNext(true);
    }
    setPages(pages);
  }, [list]);

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
        <div className={`${loading ? "invisible" : ""} flex flex-grow`}>
          <div className="w-[1180px] mx-auto text-center self-center translate-y-[-60px] finance-terms-container">
            <h1 className="text-white opacity-90 text-[40px] font-normal leading-[1.2] mb-[20px]">
              {t('title')}
            </h1>
            <p className="text-[#B8B8B8] text-[16px]">
              {t('description')}
            </p>

            <div className="mt-[30px] text-left">
              <div className={`${styles.tabContent} ss-tab-content`}>
                <Slider
                  ref={swiperRef}
                  className={`${styles.slider}`}
                  items={pages}
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
      {loading && <div className="global-loading bg-loading">{commonT('loading')}</div>}
    </main>
  );
};

export default FinanceTerms;
