"use client";
import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter} from 'next/navigation';
import styles from "@/src/css/learn.module.css";
import LearnSlider, { SwiperComponentHandle } from "@/components/learn-slider";
import Str2html from "@/components/str2html";
import MainNav from "@/components/main-nav";
import SideNav from "@/components/side-nav";
import EChartComponent from '@/components/echarts';
import * as echarts from 'echarts';
import {
  list,
} from "@/src/data/strategy/rishMng";
import {
  mainNavList
} from "@/src/data/strategy/mainNav";
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
  id: number;
  value: string;
}

interface EventHandler {
  (id: number): void;
}

interface chartCategory {
  name: string;
  value: string;
}

const Strategy = () => {
  const [current, setCurrent] = useState(0);
  const [noPrev, setNoPrev] = useState(true); // 默认没有上一页
  const [noNext, setNoNext] = useState(false); // 默认还有下一页
  const [currentNav, setCurrentNav] = useState(2);
  const router = useRouter();
  const handleChange = (newData: ChangeData) => {
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

  const category: Mapping[] = [
    { id: 1, value: "风险控制" },
    { id: 2, value: "行业分类" }
  ];

  const navClick: EventHandler = (id: number) => {
    // setCurrentNav(id)
    if (id === 1) {
      router.push(`/strategy/risk-manage`)
    }
    if (id === 2) {
      router.push(`/strategy/risk-manage/industry-sectors`)
    }    
  };






  function genData(count:number) {
    // prettier-ignore
    const nameList = [
          {name:'能源',
            categories:[
              {name: '石油和天然气', value: '包括勘探、生产、提炼、运输和销售'},
              {name: '煤炭', value: '涉及煤矿开采、洗选、运输和销售'},
               {name: '电力', value: '包括发电（如火力发电、水力发电、核能发电）、输电、配电和销售。'}
              ]
          },{name:'化工',
            categories:[
              {name: 'Subcategory A1', value: 3},
              {name: 'Subcategory A2', value: 7}
              ]
          },{name:'材料',
            categories:[
              {name: 'Subcategory A1', value: 3},
              {name: 'Subcategory A2', value: 7}
              ]
          },{name:'机械设备/军工',
            categories:[
              {name: 'Subcategory A1', value: 3},
              {name: 'Subcategory A2', value: 7}
              ]
          },{name:'企业服务/造纸印刷',
            categories:[
              {name: 'Subcategory A1', value: 3},
              {name: 'Subcategory A2', value: 7}
              ]
          },{name:'运输设备',
            categories:[
              {name: 'Subcategory A1', value: 3},
              {name: 'Subcategory A2', value: 7}
              ]
          },{name:'旅游酒店',
            categories:[
              {name: 'Subcategory A1', value: 3},
              {name: 'Subcategory A2', value: 7}
              ]
          },{name:'媒体/信息通信服务',
            categories:[
              {name: 'Subcategory A1', value: 3},
              {name: 'Subcategory A2', value: 7}
              ]
          },{name:'批发/零售',
            categories:[
              {name: 'Subcategory A1', value: 3},
              {name: 'Subcategory A2', value: 7}
              ]
          },{name:'消费品',
            categories:[
              {name: 'Subcategory A1', value: 3},
              {name: 'Subcategory A2', value: 7}
              ]
          },{name:'卫生保健/医疗',
            categories:[
              {name: 'Subcategory A1', value: 3},
              {name: 'Subcategory A2', value: 7}
              ]
          },{name:'金融',
            categories:[
              {name: 'Subcategory A1', value: 3},
              {name: 'Subcategory A2', value: 7}
              ]
          },{name:'建材/建筑/房地产',
            categories:[
              {name: 'Subcategory A1', value: 3},
              {name: 'Subcategory A2', value: 7}
              ]
          },{name:'公用事业',
            categories:[
              {name: 'Subcategory A1', value: 3},
              {name: 'Subcategory A2', value: 7}
              ]
          }
      ];
    const legendData = [];
    const seriesData = [];
    for (var i = 0; i < count; i++) {
      var item = nameList[i]
      legendData.push(item.name);
      seriesData.push({
        name: item.name,
        value: 7.13,
        categories: item.categories
      });
    }
    return {
      legendData: legendData,
      seriesData: seriesData
    };
  }

  const data = genData(14);

  const chartOption: echarts.EChartsOption = {
    height:580,
    backgroundColor:'#1d1e20',
    tooltip: {
      trigger: 'item',
      backgroundColor:'#1d1e20',
      textStyle:{
        color:'#ffffff',
        fontSize:12
      },
      formatter: function (params) {
          var data = params.data;
          var tooltipContent = `<div style="padding: 10px;"><strong>${params.name}</strong><br>`;
          if (data.categories) {
              data.categories.forEach(function (category:chartCategory) {
                  tooltipContent += `<b>${category.name}</b>: ${category.value}<br>`;
              });
          }
          tooltipContent += `</div>`;
          return tooltipContent;
      }
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 80,
      top: 120,
      bottom: 20,
      data: data.legendData,
      textStyle:{
        color:'#ffffff'
      }
    },
    series: [
      {
        name: '行业分类',
        type: 'pie',
        radius: '55%',
        center: ['40%', '50%'],
        data: data.seriesData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };



  return (
    <main className="flex flex-col h-screen bg-[#131419]">
      <Topbar position="relative" />
      <div className="flex flex-grow flex-col w-full bg-analysis-bg bg-cover bg-center max-w-[1920px] min-w-[1100px] mx-auto px-[60px]">
        <MainNav navItems={ mainNavList } />        
        <div className="flex flex-grow">
          <div className="w-[1000px] mx-auto text-center self-center translate-y-[-60px] container">
            <h1 className="text-white opacity-90 text-[40px] font-normal leading-[1.2] mb-[20px]">
            行业分类
            </h1>
            <p className="text-[#B8B8B8] text-[16px]">
            14个行业分类，每个行业都是经济巨轮的重要组成部分，<br/>
是一颗璀璨的明珠，闪耀着创新与智慧的光芒
            </p>

            <div className="mt-[30px] text-left h-[580px] bg-[#1d1e20]">
              <EChartComponent option={chartOption} />
            </div>
            
          </div>  
          <div className="fixed-left">
            <SideNav currentNav={ currentNav } navItems={ category } onItemClick={ navClick } />
          </div>
        </div>
      </div>
      <Footer position="relative" />
    </main>
  );
};

export default Strategy;
