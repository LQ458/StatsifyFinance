"use client";
import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import React from "react";
import { useState, useRef, useEffect } from "react";
import styles from "@/src/css/learn.module.css";
import LearnSlider, { SwiperComponentHandle } from "@/components/learn-slider";
import Str2html from "@/components/str2html";
import {
  flowDataArray,
  quanList,
  quanMap,
  quanArrayMap,
} from "@/src/data/analysis/quantitative";
import {
  qualList,
  qualMap,
  qualArrayMap,
} from "@/src/data/analysis/qualitative";
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

const Analysis = () => {
  const [current, setCurrent] = useState(0);
  const [noPrev, setNoPrev] = useState(true); // 默认没有上一页
  const [noNext, setNoNext] = useState(false); // 默认还有下一页
  const [curSubTopic, setCurSubTopic] = useState("flow");
  const [curTopic, setCurTopic] = useState("quan");
  const [dataArray, setDataArray] = useState<Item[]>(flowDataArray);
  const [topicList, setTopicList] = useState(quanList);
  const [curArrayMap, setCurArrayMap] = useState<Map[]>(quanArrayMap);
  const [curMap, setCurMap] = useState<Mapping[]>(quanMap);
  const handleChange = (newData: ChangeData) => {
    const { activeIndex, isBeginning, isEnd } = newData;
    setCurrent(activeIndex);
    setNoPrev(isBeginning);
    setNoNext(isEnd);
  };
  const swiperRef = useRef<SwiperComponentHandle>(null);
  const tabRef = useRef<HTMLUListElement>(null);

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

  useEffect(() => {
    // 使用简称从 curArrayMap 中获取 data 数组
    const dataMapping = curArrayMap.find((map) => map.title === curSubTopic);
    const data = dataMapping ? dataMapping.content : quanArrayMap[0].content;

    setDataArray(data);
  }, [curSubTopic, curArrayMap, curMap]);

  //辅助函数
  function findKeyByValue(map: Mapping[], value: string): string | undefined {
    for (const item of map) {
      if (item.value === value) {
        return item.key;
      }
    }
    return undefined;
  }

  useEffect(() => {
    switch (curTopic) {
      case "quan":
        setTopicList(quanList);
        setCurArrayMap(quanArrayMap);
        setCurMap(quanMap);
        setCurSubTopic("flow");
        break;
      case "qual":
        setTopicList(qualList);
        setCurArrayMap(qualArrayMap);
        setCurMap(qualMap);
        setCurSubTopic("esg");
        break;
    }
  }, [curTopic]);

  return (
    <main className="flex flex-col h-screen bg-[#131419]">
      <Topbar position="relative" />
      <div className="flex flex-grow flex-col w-full bg-analysis-bg bg-cover bg-center max-w-[1920px] min-w-[1100px] mx-auto px-[60px]">
        <div className={`${styles.nav} w-full`}>
          <ul>
            <li
              onClick={() => setCurTopic("quan")}
              className={`${curTopic === "quan" && styles.active}`}
            >
              定量
            </li>
            <li
              onClick={() => setCurTopic("qual")}
              className={`${curTopic === "qual" && styles.active}`}
            >
              定性
            </li>
          </ul>
        </div>
        <div className="flex flex-grow">
          <div className="w-[1000px] mx-auto text-center self-center translate-y-[-60px] learn-container flex">
            <div className={`${styles["left-side"]}`}>
              <div className={`${styles["sub-nav"]}`}>
                <ul>
                  {topicList &&
                    topicList.map((item, idx) => (
                      <React.Fragment key={idx}>
                        <li
                          className={`${curSubTopic === findKeyByValue(curMap, item) && styles["active"]}`}
                        >
                          <button
                            onClick={() =>
                              setCurSubTopic(findKeyByValue(curMap, item) || "flow")
                            }
                            type="button"
                            className="text-white w-full"
                          >
                            {item}
                          </button>
                        </li>
                      </React.Fragment>
                    ))}
                </ul>
              </div>
            </div>
            <div className={`${styles["main"]}`}>
              <h1 className="text-white opacity-90 text-[40px] font-normal leading-[1.2] mb-[20px]">
                {curTopic === "quan" ? "定量分析指标" : "定性分析指标"}
              </h1>
              <p className="text-[#B8B8B8] text-[16px]">
                {curTopic === "quan"
                  ? "在金融分析中用于评估投资的性能、风险和回报。"
                  : "在金融分析中用于评估企业的非财务方面，如管理质量、品牌价值和市场竞争力。"}
                <br />
                {curTopic === "quan"
                  ? "这些指标基于数学和统计方法，帮助投资者和分析师做出客观的投资决策。"
                  : "这些指标基于主观判断和经验，帮助投资者和分析师全面了解企业的整体状况。"}
              </p>

              <div className="mt-[30px] text-left">
                <div className={`${styles.tab}`}>
                  <ul ref={tabRef}>
                    {dataArray.map((item, idx) => (
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
                    items={dataArray}
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
                  {dataArray.map((item, idx) => (
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
    </main>
  );
};

export default Analysis;
