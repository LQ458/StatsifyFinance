"use client";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Swiper, SwiperRef, SwiperSlide } from "swiper/react";
import styles from "@/src/css/news.module.css";
import { Navigation, Pagination, EffectCards } from "swiper/modules";
import Str2html from "./str2html";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import Image from "next/image";

// 定义对象类型
interface Item {
  _id: string;
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

interface ChangeData {
  activeIndex: number;
  isBeginning: boolean;
  isEnd: boolean;
}

interface sliderProps {
  className: string; // 给slider最外层的class
  items: Item[][]; // 需要轮播的数据
  category: Category; //分类信息
  sliderIndex?: number; // 激活第几项,数组下标记数方式
  onChange: (data: ChangeData) => void; // 当slider改变时触发的回调
}

export interface SwiperComponentHandle {
  slideNext: () => void;
  slidePrev: () => void;
  slideTo: (index: number) => void;
}

const NewsSlider = forwardRef<SwiperComponentHandle, sliderProps>(
  (props, ref) => {
    const { className, items, onChange, sliderIndex = 0, category } = props;
    const swiperRef = useRef<SwiperRef>(null);
    const router = useRouter();
    const t = useTranslations("common");
    const newsT = useTranslations("news");

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

    const goDetails = (data: Item) => {
      const { _id, category: categoryId } = data;
      router.push(
        `/articles/details?category=${categoryId}&id=${_id}&category-name=${category.title}`,
      );
    };

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
          aria-label={newsT("slider.label")}
        >
          {items.map((page, index) => (
            <SwiperSlide key={index}>
              <div className={`${styles["slide-item"]} ss-slide-item`}>
                <ul>
                  {page.map((item, idx) => (
                    <li key={idx} onClick={() => goDetails(item)}>
                      <div className={`${styles["cover"]} ss-news-img`}>
                        <img
                          src={item.image}
                          width="100%"
                          alt={`${newsT("image.alt")} - ${item.title}`}
                        />
                      </div>
                      <h4>{item.title}</h4>
                      <div className={`${styles["date"]} ss-news-date`}>
                        {dayjs(item.createdAt).format(t("dateFormat.short"))}
                      </div>
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
NewsSlider.displayName = "NewsSlider";
export default NewsSlider;
