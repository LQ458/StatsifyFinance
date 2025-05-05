"use client";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import { Swiper, SwiperRef, SwiperSlide } from "swiper/react";
import styles from "@/src/css/learn.module.css";
import { Navigation, Pagination, EffectCards } from "swiper/modules";
import Str2html from "./str2html";
import { useTranslations, useLocale } from "next-intl";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import Image from "next/image";

// 定义对象类型
interface Item {
  title: string;
  enTitle: string;
  content: string;
  enContent: string;
}

interface ChangeData {
  activeIndex: number;
  isBeginning: boolean;
  isEnd: boolean;
}

interface sliderProps {
  className: string; // 给slider最外层的class
  items: Item[]; // 需要轮播的数据
  sliderIndex?: number; // 激活第几项,数组下标记数方式
  onChange: (data: ChangeData) => void; // 当slider改变时触发的回调
}

export interface SwiperComponentHandle {
  slideNext: () => void;
  slidePrev: () => void;
  slideTo: (index: number) => void;
}

const LearnSlider = forwardRef<SwiperComponentHandle, sliderProps>(
  (props, ref) => {
    const { className, items, onChange, sliderIndex = 0 } = props;
    const swiperRef = useRef<SwiperRef>(null);
    const [autoHeight, setAutoHeight] = useState(false);
    const [resetSwiper, setReSetSwiper] = useState(true);
    const t = useTranslations("learn");
    const locale = useLocale();

    useImperativeHandle(ref, () => ({
      slideNext() {
        swiperRef.current?.swiper?.slideNext();
      },
      slidePrev() {
        swiperRef.current?.swiper?.slidePrev();
      },
      slideTo(index: number) {
        swiperRef.current?.swiper?.slideTo(index);
      },
    }));

    useEffect(() => {
      // 检查窗口宽度
      const handleResize = () => {
        if (document.documentElement.clientWidth < 768) {
          setAutoHeight(true);
        } else {
          setAutoHeight(false);
        }
      };
      // 页面加载时判断一次窗口宽度
      handleResize();
      // 监听窗口尺寸变化
      window.addEventListener("resize", handleResize);
      // 清除监听
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, []);

    useEffect(() => {
      // 每当 autoHeight 改变时，重新渲染swiper
      setReSetSwiper(false);
      setTimeout(() => {
        setReSetSwiper(true);
      }, 10);
    }, [autoHeight]);

    return (
      <>
        {resetSwiper && (
          <Swiper
            // install Swiper modules
            ref={swiperRef}
            modules={[Navigation, EffectCards]}
            autoHeight={autoHeight}
            effect="Cards"
            // noSwiping // 增加swiper-no-swiping类可以让文字可选，但拖动翻页就不能用了
            spaceBetween={0} // 设置滑块之间的间距为0px
            slidesPerView={1} // 设置每次显示的滑块数量
            initialSlide={sliderIndex} // 从索引为2的滑块（即第3个滑块）开始显示
            onSlideChange={(swiper) => onChange(swiper)}
            className={`${className}`}
            aria-label={t("slider.label")}
          >
            {items.map((item, idx) => (
              <SwiperSlide
                key={idx}
                className="w-full h-full"
                aria-label={`${t("slide.label")} ${idx + 1}: ${item.title}`}
              >
                <div className={`${styles["slide-item"]} ss-slide-item`}>
                  <Str2html
                    htmlString={locale === "zh" ? item.content : item.enContent}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </>
    );
  },
);
LearnSlider.displayName = "LearnSlider";
export default LearnSlider;
