"use client";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Swiper, SwiperRef, SwiperSlide } from "swiper/react";
import styles from "@/src/css/finance-terms.module.css";
import { Navigation, Pagination, EffectCards } from "swiper/modules";
import Str2html from "./str2html";
import { useTranslations } from "next-intl";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import Image from "next/image";
import { SwiperContainer } from "swiper/element";

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

interface sliderProps {
  className: string; // 给slider最外层的class
  items: Item[][]; // 需要轮播的数据
  sliderIndex?: number; // 激活第几项,数组下标记数方式
  onChange: (data: ChangeData) => void; // 当slider改变时触发的回调
}

export interface SwiperComponentHandle {
  slideNext: () => void;
  slidePrev: () => void;
  slideTo: (index: number) => void;
}

const FinanceTermsSlider = forwardRef<SwiperComponentHandle, sliderProps>(
  (props, ref) => {
    const { className, items, onChange, sliderIndex = 0 } = props;
    const swiperRef = useRef<SwiperRef>(null);
    const t = useTranslations("finance_terms");

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

    return (
      <>
        <Swiper
          // install Swiper modules
          ref={swiperRef}
          modules={[Navigation, EffectCards]}
          effect="Cards"
          // noSwiping // 增加swiper-no-swiping类可以让文字可选，但拖动翻页就不能用了
          spaceBetween={0} // 设置滑块之间的间距为0px
          slidesPerView={1} // 设置每次显示的滑块数量
          initialSlide={sliderIndex} // 从索引为2的滑块（即第3个滑块）开始显示
          onSlideChange={(swiper) => onChange(swiper)}
          className={`${className}`}
        >
          {items.map((page, index) => (
            <SwiperSlide key={index}>
              <div className={`${styles["slide-item"]} ss-slide-item`}>
                <ul>
                  {page.map((item, idx) => (
                    <li key={idx}>
                      <div
                        className={`${styles["cover"]} ss-finance-terms-img`}
                      >
                        <img
                          src={item.image}
                          width="100%"
                          alt={`${t("term.image.alt")} - ${item.title}`}
                        />
                      </div>
                      <p>{item.content}</p>
                      <h4>
                        {item.title}
                        <br />
                        {item.enTitle}
                      </h4>
                    </li>
                  ))}
                </ul>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </>
    );
  },
);
FinanceTermsSlider.displayName = "FinanceTermsSlider";
export default FinanceTermsSlider;
