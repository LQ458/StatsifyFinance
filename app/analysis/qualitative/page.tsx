"use client";
import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import React from "react";
import { useState, useRef, useEffect } from "react";
import styles from "@/css/learn.module.css";
import LearnSlider, { SwiperComponentHandle } from "@/components/learn-slider";
import Str2html from "@/components/str2html";
import { IoIosArrowDown } from "react-icons/io";
import Link from "next/link";
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

const dataArray: Item[] = [
  {
    title: `流动比率<br/>
  Current Ratio`,
    content: `<p><strong>公式：流动比率 = 流动资产 / 流动负债</strong>111</p>
  <p></p>
  <p><strong>示例：</strong></p>
  <p>假设某企业的财务报表提供了以下数据：</p>
  <p>- 流动资产：$120,000</p>
  <p>- 流动负债：$60,000</p>
  <p></p>
  <p><strong>根据流动比率的公式： </strong></p>
  <p>流动比率 = $120,000</p>
  <p>/ $60,000 = 2</p>
  <p></p>
  <p><strong>解释：</strong></p>
  <p>流动比率为2表示该企业的流动资产是其流动负债的两倍，表明企业在短期内有较好的偿债能力。</p>`,
  },
  {
    title: `速动比率<br/>
  The acid-test ratio`,
    content: `<p><strong>公式：流动比率 = 流动资产 / 流动负债</strong>222</p>
  <p></p>
  <p><strong>示例：</strong></p>
  <p>假设某企业的财务报表提供了以下数据：</p>
  <p>- 流动资产：$120,000</p>
  <p>- 流动负债：$60,000</p>
  <p></p>
  <p><strong>根据流动比率的公式： </strong></p>
  <p>流动比率 = $120,000</p>
  <p>/ $60,000 = 2</p>
  <p></p>
  <p><strong>解释：</strong></p>
  <p>流动比率为2表示该企业的流动资产是其流动负债的两倍，表明企业在短期内有较好的偿债能力。</p><p>流动比率为2表示该企业的流动资产是其流动负债的两倍，表明企业在短期内有较好的偿债能力。</p><p>流动比率为2表示该企业的流动资产是其流动负债的两倍，表明企业在短期内有较好的偿债能力。</p><p>流动比率为2表示该企业的流动资产是其流动负债的两倍，表明企业在短期内有较好的偿债能力。</p><p>流动比率为2表示该企业的流动资产是其流动负债的两倍，表明企业在短期内有较好的偿债能力。</p><p>流动比率为2表示该企业的流动资产是其流动负债的两倍，表明企业在短期内有较好的偿债能力。</p>`,
  },
  {
    title: `现金比率<br/>
  The cash ratio`,
    content: `<p><strong>公式：流动比率 = 流动资产 / 流动负债</strong>333</p>
  <p></p>
  <p><strong>示例：</strong></p>
  <p>假设某企业的财务报表提供了以下数据：</p>
  <p>- 流动资产：$120,000</p>
  <p>- 流动负债：$60,000</p>
  <p></p>
  <p><strong>根据流动比率的公式： </strong></p>
  <p>流动比率 = $120,000</p>
  <p>/ $60,000 = 2</p>
  <p></p>
  <p><strong>解释：</strong></p>
  <p>流动比率为2表示该企业的流动资产是其流动负债的两倍，表明企业在短期内有较好的偿债能力。</p>`,
  },
  {
    title: `经营现金流比率<br/>
  The operating cash flow ratio`,
    content: `<p><strong>公式：流动比率 = 流动资产 / 流动负债</strong>444</p>
  <p></p>
  <p><strong>示例：</strong></p>
  <p>假设某企业的财务报表提供了以下数据：</p>
  <p>- 流动资产：$120,000</p>
  <p>- 流动负债：$60,000</p>
  <p></p>
  <p><strong>根据流动比率的公式： </strong></p>
  <p>流动比率 = $120,000</p>
  <p>/ $60,000 = 2</p>
  <p></p>
  <p><strong>解释：</strong></p>
  <p>流动比率为2表示该企业的流动资产是其流动负债的两倍，表明企业在短期内有较好的偿债能力。</p>`,
  },
  {
    title: `经营现金流比率<br/>
  The operating cash flow ratio`,
    content: `<p><strong>公式：流动比率 = 流动资产 / 流动负债</strong>444</p>
  <p></p>
  <p><strong>示例：</strong></p>
  <p>假设某企业的财务报表提供了以下数据：</p>
  <p>- 流动资产：$120,000</p>
  <p>- 流动负债：$60,000</p>
  <p></p>
  <p><strong>根据流动比率的公式： </strong></p>
  <p>流动比率 = $120,000</p>
  <p>/ $60,000 = 2</p>
  <p></p>
  <p><strong>解释：</strong></p>
  <p>流动比率为2表示该企业的流动资产是其流动负债的两倍，表明企业在短期内有较好的偿债能力。</p>`,
  },
  {
    title: `经营现金流比率<br/>
  The operating cash flow ratio`,
    content: `<p><strong>公式：流动比率 = 流动资产 / 流动负债</strong>444</p>
  <p></p>
  <p><strong>示例：</strong></p>
  <p>假设某企业的财务报表提供了以下数据：</p>
  <p>- 流动资产：$120,000</p>
  <p>- 流动负债：$60,000</p>
  <p></p>
  <p><strong>根据流动比率的公式： </strong></p>
  <p>流动比率 = $120,000</p>
  <p>/ $60,000 = 2</p>
  <p></p>
  <p><strong>解释：</strong></p>
  <p>流动比率为2表示该企业的流动资产是其流动负债的两倍，表明企业在短期内有较好的偿债能力。</p>`,
  },
];

const Qualitative = () => {
  const [current, setCurrent] = useState(0);
  const [noPrev, setNoPrev] = useState(true); // 默认没有上一页
  const [noNext, setNoNext] = useState(false); // 默认还有下一页
  const handleChange = (newData: ChangeData) => {
    // console.log('handleChange::', newData)
    const { activeIndex, isBeginning, isEnd } = newData;
    setCurrent(activeIndex);
    setNoPrev(isBeginning);
    setNoNext(isEnd);
  };
  const swiperRef = useRef<SwiperComponentHandle>(null);
  const tabRef = useRef(null);

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
        if (current > li.length / 2) {
          li[li.length - 1].scrollIntoView();
        } else {
          li[0].scrollIntoView();
        }
      }
    };

    tabScrollCenter();
  }, [current]);

  return (
    <main className="flex flex-col h-screen bg-[#131419]">
      <Topbar position="relative" />
      <div className="flex flex-grow flex-col w-full bg-analysis-bg bg-cover bg-center max-w-[1920px] min-w-[1100px] mx-auto px-[60px] pt-[20px]">
        <div className={`${styles.nav} w-full`}>
          <ul>
            <li className={`${styles.active}`}>定量</li>
            <li>定性</li>
          </ul>
        </div>
        <div className="flex flex-grow">
          <div className="w-[1000px] mx-auto text-center self-center translate-y-[-60px] container">
            <h1 className="text-white opacity-90 text-[40px] font-normal leading-[1.2] mb-[20px]">
              定量分析指标
            </h1>
            <p className="text-[#B8B8B8] text-[16px]">
              在金融分析中用于评估投资的性能、风险和回报。
              <br />
              这些指标基于数学和统计方法，帮助投资者和分析师做出客观的投资决策。
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
                  sliderIndex={1}
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
          <div className="fixed-left">
            <ul className={`${styles["sub-nav"]}`}>
              <li className={`${styles["active"]}`}>
                <Link href="#">流动性比率</Link>
              </li>
              <li>
                <Link href="#">杠杆财务比率</Link>
              </li>
              <li>
                <Link href="#">效率比率</Link>
              </li>
              <li>
                <Link href="#">盈利能力比率</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <Footer position="relative" />
    </main>
  );
};

export default Qualitative;
