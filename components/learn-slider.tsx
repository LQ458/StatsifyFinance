"use client"
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, EffectCards } from 'swiper/modules';
import Str2html from "./str2html";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-cards';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import Image from "next/image"
type className = string;

// 定义对象类型
interface Item {
    title: string;
    content: string;
}

interface ChangeData {
    activeIndex: number; 
  }

interface sliderProps {
    className: className;
    items: Item[];
    onChange: (data: ChangeData) => void;
}

export interface SwiperComponentHandle {
  slideNext: () => void;
  slidePrev: () => void;
  slideTo: (index: number) => void;
}

const LearnSlider = forwardRef<SwiperComponentHandle, sliderProps>((props, ref) => {
  const { className, items, onChange } = props;
  const swiperRef = useRef(null);

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
        spaceBetween={0} // 设置滑块之间的间距为0px
        slidesPerView={1} // 设置每次显示的滑块数量
        initialSlide={2}  // 从索引为2的滑块（即第3个滑块）开始显示
        onSlideChange={(v) => onChange(v)}
        onSwiper={(swiper) => console.log(swiper)}
        className={`${className}`}
          >
        {items.map((item, idx) => (
            <SwiperSlide key={idx} className="w-full h-full">
                <Str2html htmlString={item.content} />
            </SwiperSlide>
        ))}        
      </Swiper>
    </>
  )
})

export default LearnSlider