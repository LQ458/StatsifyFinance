"use client";
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Swiper, SwiperRef, SwiperSlide } from "swiper/react";
import styles from "@/src/css/investor.module.css";
import { Navigation, Pagination, EffectCards, EffectCoverflow } from "swiper/modules";
import Str2html from "./str2html";
import { useRouter} from 'next/navigation';

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
  image: string;
  content: string;
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
    const router = useRouter();
    const [isShow, setShowstate] = useState(false);
    const [intro, setIntro] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

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

    const handleClick = (content:string) => {
      setIntro(content)
      setShowstate(true)
    };
    const handleClose = () => {
      setShowstate(false)
      scrollRef?.current?.scrollTo({
        top: 0,  
        behavior: 'smooth' 
      });
    }

    return (
      <>
        <Swiper
          // install Swiper modules
          ref={swiperRef}
          modules={[Navigation, EffectCoverflow]}
          effect="coverflow"
          coverflowEffect={{
            rotate: 0,
            stretch: 50,
            depth: 1000,
            modifier: 1,
            slideShadows: false,
          }}
          centeredSlides={false}
          // noSwiping // 增加swiper-no-swiping类可以让文字可选，但拖动翻页就不能用了
          spaceBetween={0} // 设置滑块之间的间距为0px
          slidesPerView={1} // 设置每次显示的滑块数量
          initialSlide={sliderIndex} // 从索引为2的滑块（即第3个滑块）开始显示
          onSlideChange={(swiper) => onChange(swiper)}
          className={`${className}`}
        >
          {items.map((item, idx) => (
            <SwiperSlide key={idx} className="w-full h-full">
              <div className="w-[800px] mx-auto bg-[#3E3E3E] border border-[#666]">
                <div className="cursor-pointer h-[450px]" onClick={() => handleClick(item.content)}><img src={`${item.image}`} alt="" /></div>
                <div className="text-[#fff] text-[16px] text-center h-[60px] leading-[60px]">{ item.title }</div>
              </div>
            </SwiperSlide>
          ))}          
        </Swiper>
        <div className={`${styles.modal} ${isShow ? styles.active : ''}`}>
          <div className={`${styles['modal-close']}`} onClick={() => handleClose()} ></div>
          <div ref={scrollRef} className={`${styles['modal-content']}`}>
            <Str2html htmlString={intro} />
          </div>          
        </div>
      </>
    );
  },
);
LearnSlider.displayName = 'LearnSlider';
export default LearnSlider;
