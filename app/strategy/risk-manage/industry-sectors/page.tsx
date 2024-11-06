"use client";
import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/src/css/learn.module.css";
import MainNav from "@/components/main-nav";
import SideNav from "@/components/side-nav";
import EChartComponent from "@/components/echarts";
import * as echarts from "echarts";
import { mainNavList } from "@/src/data/strategy/mainNav";

interface Mapping {
  _id: string;
  title: string;
}

interface EventHandler {
  (id: string): void;
}

interface chartCategory {
  name: string;
  value: string;
}

const IndustrySectors = () => {
  const [currentNav, setCurrentNav] = useState("2");
  const router = useRouter();
  const category: Mapping[] = [
    { _id: "1", title: "风险控制" },
    { _id: "2", title: "行业分类" },
  ];

  const navClick: EventHandler = (id: string) => {
    // setCurrentNav(id)
    if (id === "1") {
      router.push(`/strategy/risk-manage`);
    }
    if (id === "2") {
      router.push(`/strategy/risk-manage/industry-sectors`);
    }
  };
  function genData(count: number) {
    // prettier-ignore
    const nameList = [
          {name:'能源',
            categories:[
              { name: "石油和天然气", value: "开采、炼油、运输和销售" },
              { name: "煤炭", value: "开采、加工和使用，主要用于发电" },
              { name: "可再生能源", value: "太阳能、风能、水能和生物质能的生产与利用" },
              { name: "核能", value: "核电站的建设与运营" },
              { name: "电力", value: "发电、输配电和零售" },
              { name: "能源存储与电池技术", value: "储能系统和电池技术的开发" },
              { name: "能源效率与节能", value: "提高设备和建筑的能源利用效率" }
            ]
          },{name:'化工',
            categories:[
              { name: "基础化学品", value: "包括石油化工、无机化学品、有机化学品等的生产与销售" },
              { name: "精细化学品", value: "生产特种化学品，如农药、涂料、染料、香料等" },
              { name: "化肥", value: "生产氮肥、磷肥、钾肥等，用于农业" },
              { name: "医药化学", value: "制药原料和制剂的生产" },
              { name: "塑料与合成材料", value: "聚合物、塑料、合成纤维等的生产和加工" },
              { name: "环境化学", value: "处理废水、废气和固体废物等环境保护领域的化学品" },
              { name: "新材料", value: "研发和生产高性能材料，如纳米材料、半导体材料等" }
            ]
          },{name:'材料',
            categories:[
              { name: "金属材料", value: "包括钢铁、有色金属（如铝、铜等）、合金的生产与加工" },
              { name: "陶瓷材料", value: "生产传统陶瓷、工业陶瓷、耐火材料等" },
              { name: "聚合物材料", value: "塑料、橡胶、合成纤维等的制造和应用" },
              { name: "复合材料", value: "由两种或多种材料组合而成的高性能材料，如碳纤维复合材料" },
              { name: "半导体材料", value: "用于电子设备的材料，如硅、砷化镓等" },
              { name: "新能源材料", value: "用于太阳能、风能、电池等新能源技术的材料" },
              { name: "功能材料", value: "具有特殊功能的材料，如磁性、导电、光电等功能材料" }
            ]
          },{name:'机械设备/军工',
            categories:[
              { name: "机械设备", value: "包括各类工业机械、自动化设备、工程机械等的设计、制造和销售" },
              { name: "液压与气动设备", value: "液压系统、气动控制系统等设备的研发与应用" },
              { name: "机床与工具", value: "数控机床、切割工具、精密工具等的生产与加工" },
              { name: "电气设备", value: "发电机、电动机、变压器等电气机械设备的制造" },
              { name: "军工装备", value: "涉及武器装备、军用飞机、舰船、导弹、坦克等的研发和生产" },
              { name: "航天与航空", value: "航天器、卫星、航空器及相关系统的设计与制造" },
              { name: "兵器与军工技术", value: "包括枪械、弹药、军用车辆、指挥控制系统等的研发与生产" }
            ]
          },{name:'企业服务/造纸印刷',
            categories:[
              { name: "企业服务", value: "包括人力资源、财务、法律、咨询、IT服务等为企业提供支持的服务" },
              { name: "信息技术服务", value: "提供软件开发、系统集成、云计算、数据分析等技术支持" },
              { name: "企业咨询", value: "包括管理咨询、战略规划、市场分析、财务咨询等" },
              { name: "法律与合规服务", value: "为企业提供法律咨询、合规性审查、诉讼代理等服务" },
              { name: "造纸行业", value: "纸张、纸板的生产、加工、再生利用及相关设备制造" },
              { name: "印刷行业", value: "印刷技术、设备、材料的生产与应用，如书籍、报纸、包装印刷" },
              { name: "包装与制品", value: "纸制包装材料的生产，涉及产品包装的设计与制作" }
            ]
          },{name:'运输设备',
            categories:[
              { name: "汽车", value: "乘用车、商用车、电动车、汽车零部件的生产与销售" },
              { name: "铁路运输设备", value: "包括火车、轨道设施、铁路信号系统及相关设备的制造" },
              { name: "航空设备", value: "飞机、无人机、航空器零部件的设计与制造" },
              { name: "船舶与海洋工程", value: "商用船舶、军用舰艇、海上平台等海洋运输与工程设备的制造" },
              { name: "城市轨道交通设备", value: "地铁、有轨电车等城市公共交通工具及其相关设施" },
              { name: "物流设备", value: "运输工具、仓储设备、自动化物流系统等" },
              { name: "特种运输设备", value: "用于特定用途的运输工具，如冷链运输设备、重型机械运输设备" }
            ]
          },{name:'旅游酒店',
            categories:[
              { name: "旅游服务", value: "包括旅游策划、导游服务、旅行社、旅游咨询等" },
              { name: "酒店住宿", value: "包括酒店、民宿、度假村、宾馆等住宿服务" },
              { name: "餐饮服务", value: "酒店餐饮、宴会、外卖、餐厅等相关服务" },
              { name: "旅游交通", value: "包括航班、火车、长途汽车、旅游专线等交通服务" },
              { name: "旅游景点", value: "提供景区门票、旅游设施和景点管理的服务" },
              { name: "会展服务", value: "会议、展览、企业活动策划与组织等服务" },
              { name: "度假与休闲", value: "度假酒店、温泉、休闲娱乐设施等" }
            ]
          },{name:'媒体/信息通信服务',
            categories:[
              { name: "广播与电视", value: "电视台、广播电台的节目制作与传播" },
              { name: "新闻出版", value: "报纸、杂志、图书出版及其发行" },
              { name: "网络媒体", value: "互联网新闻、视频平台、社交媒体内容的生产与传播" },
              { name: "广告服务", value: "包括数字广告、电视广告、户外广告等的设计与投放" },
              { name: "电信服务", value: "包括固定电话、移动电话、数据通信、互联网接入等服务" },
              { name: "信息技术服务", value: "包括云计算、大数据、人工智能、网络安全等IT服务" },
              { name: "内容分发与平台服务", value: "在线视频、音乐、直播、游戏等内容的分发与平台运营" }
            ]
          },{name:'批发/零售',
            categories:[
              { name: "批发贸易", value: "大宗商品、原材料、设备、消费品等的大宗采购与销售" },
              { name: "零售贸易", value: "商品的终端销售，包括实体店和电商平台" },
              { name: "超市与便利店", value: "日用商品、食品、饮料等零售渠道" },
              { name: "专卖店", value: "特定品牌或类别商品的专营店，如服饰店、化妆品店等" },
              { name: "电子商务", value: "通过互联网进行商品和服务的销售，如线上零售平台" },
              { name: "批发市场", value: "为小型零售商提供商品批发的市场，如批发商店、仓储式商场" },
              { name: "物流与配送", value: "商品运输、仓储管理、最后一公里配送等服务" }
            ]
          },{name:'消费品',
            categories:[
              { name: "食品与饮料", value: "包括加工食品、饮料、零食、保健食品等的生产与销售" },
              { name: "家用电器", value: "包括电视、冰箱、洗衣机、空调等家电产品的制造与销售" },
              { name: "个人护理产品", value: "化妆品、护肤品、洗护用品等日用消费品" },
              { name: "服装与鞋类", value: "服装、鞋帽、配饰等的设计、生产和销售" },
              { name: "家居用品", value: "包括家具、家居装饰、日用家居用品等" },
              { name: "电子产品", value: "智能手机、电脑、可穿戴设备等消费类电子产品" },
              { name: "文具与办公用品", value: "包括文具、办公设备、办公消耗品等" }
            ]
          },{name:'卫生保健/医疗',
            categories:[
              { name: "医疗服务", value: "医院、诊所、健康体检、急救服务等" },
              { name: "药品与医疗器械", value: "药物研发、生产、销售及医疗设备、器械的生产与供应" },
              { name: "健康管理", value: "健康咨询、营养管理、慢性病管理等个性化健康服务" },
              { name: "生物技术", value: "包括基因工程、疫苗研发、细胞治疗等创新生物技术" },
              { name: "老龄化社会服务", value: "老年护理、康复治疗、辅助设备等服务和产品" },
              { name: "医疗保险与支付", value: "健康保险、医疗费用支付、医保管理等服务" },
              { name: "数字医疗与远程医疗", value: "通过技术手段提供远程诊断、在线咨询、健康监测等服务" }
            ]
          },{name:'金融',
            categories:[
              { name: "银行服务", value: "包括储蓄、贷款、信用卡、个人银行和企业银行等服务" },
              { name: "证券与投资", value: "股票、债券、基金、期货、资产管理等投资服务" },
              { name: "保险", value: "人寿保险、财产保险、健康保险、车险等保险产品与服务" },
              { name: "支付与结算", value: "支付处理、电子支付、跨境支付、结算服务等" },
              { name: "财富管理", value: "为个人和企业提供资产规划、投资咨询、财务顾问等服务" },
              { name: "金融科技", value: "基于科技的金融服务，如区块链、人工智能、P2P借贷等" },
              { name: "信贷与融资", value: "个人贷款、企业融资、风险投资、股权投资等" }
            ]
          },{name:'建材/建筑/房地产',
            categories:[
              { name: "建材", value: "水泥、钢材、玻璃、陶瓷、石材等建筑材料的生产与销售" },
              { name: "建筑工程", value: "建筑施工、基础设施建设、城市规划与设计等" },
              { name: "建筑设备", value: "建筑机械、施工设备、智能建筑系统等设备的生产与销售" },
              { name: "房地产开发", value: "土地开发、住宅、商业地产、写字楼等房地产项目的开发与销售" },
              { name: "房地产中介", value: "房地产买卖、租赁、代理等中介服务" },
              { name: "物业管理", value: "物业服务、建筑物维护、保安、清洁等日常管理服务" },
              { name: "房地产投资与金融", value: "房地产投资基金、融资、房地产证券化等" }
            ]
          },{name:'公用事业',
            categories:[
              { name: "电力供应", value: "电力的生产、输送、分配和销售" },
              { name: "天然气供应", value: "天然气的开采、运输、储存和分配" },
              { name: "水务服务", value: "供水、污水处理、灌溉及相关基础设施的运营与管理" },
              { name: "固废处理", value: "垃圾收集、分类、回收、处理与处置" },
              { name: "环境保护", value: "空气污染控制、环境监测与治理、绿色能源等环境保护服务" },
              { name: "通信服务", value: "包括固定通信、移动通信、宽带互联网接入等服务" },
              { name: "公共交通", value: "城市公共交通系统的建设与运营，如地铁、公交等" }
            ]
          }
      ];
    const legendData = [];
    const seriesData = [];
    for (var i = 0; i < count; i++) {
      var item = nameList[i];
      legendData.push(item.name);
      seriesData.push({
        name: item.name,
        value: 7.13,
        categories: item.categories,
      });
    }
    return {
      legendData: legendData,
      seriesData: seriesData,
    };
  }

  const data = genData(14);

  const chartOption: echarts.EChartsOption = {
    height: 580,
    backgroundColor: "#1d1e20",
    tooltip: {
      trigger: "item",
      backgroundColor: "#1d1e20",
      textStyle: {
        color: "#ffffff",
        fontSize: 12,
      },
      formatter: function (params: any) {
        var data = params.data;
        var tooltipContent = `<div style="padding: 10px; line-height:2; color:#b8b8b8; font-size:14px;"><strong>${params.name}</strong><br>`;
        if (data.categories) {
          data.categories.forEach(function (category: chartCategory) {
            tooltipContent += `<b>${category.name}</b>: ${category.value}<br>`;
          });
        }
        tooltipContent += `</div>`;
        return tooltipContent;
      },
    },
    legend: {
      type: "scroll",
      orient: "vertical",
      right: 80,
      top: 'middle',
      data: data.legendData,
      textStyle: {
        color: "#ffffff",
      },
    },
    series: [
      {
        name: "行业分类",
        type: "pie",
        radius: "55%",
        center: ["50%", "50%"],
        data: data.seriesData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
    media: [
      {
        query: { maxWidth: 5120 },  // 当屏幕宽度小于768px时
        option: {
          legend: {
            type: "scroll",
            orient: "vertical",
            right: 80,
            top: 'middle'
          },
          series: [{
            center: ['40%', '50%']  // 保证手机屏幕中间位置
          }]
        }
      },
      {
        query: { maxWidth: 768 },  // 当屏幕宽度小于768px时
        option: {
          legend: {
            orient: 'vertical',
            left: 'right',
            top: 'middle'
          }
        }
      },
      {
        query: { maxWidth: 480 },  // 当屏幕宽度小于480px时
        option: {
          legend: {
            orient: 'horizontal',
            left: 'center',
            bottom: 0
          },
          series: [{
            center: ['50%', '50%']  // 保证手机屏幕中间位置
          }]
        }
      }
    ]
  };

  return (
    <main className="flex flex-col h-screen bg-[#131419]">
      <Topbar position="relative" />
      <div className="flex flex-grow flex-col w-full bg-analysis-bg bg-cover bg-center max-w-[1920px] min-w-[1100px] mx-auto px-[60px]">
        <MainNav navItems={mainNavList} />
        <div className="flex flex-grow">
          <div className="w-[1000px] mx-auto text-center self-center translate-y-[-60px] learn-container flex">
            <div className={`${styles["left-side"]} ss-left-side`}>
              <SideNav
                currentNav={currentNav}
                navItems={category}
                onItemClick={navClick}
              />
            </div>
            <div className={`${styles["main"]} ss-main`}>
              <h1 className="text-white opacity-90 text-[40px] font-normal leading-[1.2] mb-[20px]">
                行业分类
              </h1>
              <p className="text-[#B8B8B8] text-[16px]">
                14个行业分类，每个行业都是经济巨轮的重要组成部分，
                <br />
                是一颗璀璨的明珠，闪耀着创新与智慧的光芒
              </p>

              <div className="mt-[30px] text-left h-[580px] bg-[#1d1e20]">
                <EChartComponent option={chartOption} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer position="relative" />
    </main>
  );
};

export default IndustrySectors;
