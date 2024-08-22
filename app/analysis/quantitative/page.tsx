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

const flowDataArray: Item[] = [
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
    content: `    
   <p><strong>公式：</strong>速动比率 = (流动资产 – 存货) / 流动负债</p>
    <p><strong>示例：</strong></p>
    <p>假设某企业的财务报表提供了以下数据：</p>
    <p>- 流动资产：$120,000</p>
    <p>- 存货：$40,000</p>
    <p>- 流动负债：$60,000</p>
    <p></p>
    <p><strong>根据速动比率的公式：</strong></p>
    <p>速动比率 = (流动资产 – 存货) / 流动负债</p>
    <p>速动比率 = (120,000 - 40,000) / 60,000 = 80,000 / 60,000 = 1.33</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>速动比率为1.33表示企业不考虑存货的情况下，其流动资产仍然能覆盖流动负债，表明企业在短期内有较强的偿债能力。</p>`,
  },
  {
    title: `现金比率<br/>
    The cash ratio`,
    content: `<p><strong>公式：</strong>现金比率 = 现金及现金等价物 / 流动负债</p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某企业的财务报表提供了以下数据：</p>
    <p>- 现金及现金等价物：$50,000</p>
    <p>- 流动负债：$100,000</p>
    <p></p>
    <p><strong>根据现金比率的公式：</strong></p>
    <p>现金比率 = 现金及现金等价物 / 流动负债</p>
    <p>现金比率 = 50,000 / 100,000 = 0.5</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>现金比率为0.5表示企业的现金及现金等价物只能覆盖其流动负债的一半，表明企业在短期内可能面临一定的流动性风险。</p>`,
  },
  {
    title: `经营现金流比率<br/>
    The operating cash flow ratio`,
    content: `<p><strong>公式：</strong>经营现金流比率 = 经营现金流 / 流动负债</p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某企业的财务报表提供了以下数据：</p>
    <p>- 经营现金流：$150,000</p>
    <p>- 流动负债：$75,000</p>
    <p></p>
    <p><strong>根据经营现金流比率的公式：</strong></p>
    <p>经营现金流比率 = 经营现金流 / 流动负债</p>
    <p>经营现金流比率 = 150,000 / 75,000 = 2</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>经营现金流比率为2表示企业的经营现金流可以覆盖其流动负债两次，表明企业在短期内有较强的偿债能力。</p>`,
  },
];

const leverDataArray: Item[] = [
  {
    title: `负债比率<br/>Debt Ratio`,
    content: `<p><strong>公式：负债比率 = 总负债 / 总资产</strong></p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某企业的财务报表提供了以下数据：</p>
    <p>- 总负债：$200,000</p>
    <p>- 总资产：$500,000</p>
    <p></p>
    <p><strong>根据负债比率的公式：</strong></p>
    <p>负债比率 = $200,000 / $500,000 = 0.4</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>负债比率为0.4表示企业的总资产中有40%是由负债提供的，表明企业的财务结构较为稳健。</p>`,
  },
  {
    title: `债务权益比率<br/>Debt-to-Equity Ratio`,
    content: `<p><strong>公式：债务权益比率 = 总负债 / 股东权益</strong></p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某企业的财务报表提供了以下数据：</p>
    <p>- 总负债：$250,000</p>
    <p>- 股东权益：$750,000</p>
    <p></p>
    <p><strong>根据债务权益比率的公式：</strong></p>
    <p>债务权益比率 = $250,000 / $750,000 = 0.33</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>债务权益比率为0.33表示企业的总负债是其股东权益的三分之一，表明企业的财务杠杆适中。</p>`,
  },
  {
    title: `利息覆盖比率<br/>Interest Coverage Ratio`,
    content: `<p><strong>公式：利息覆盖比率 = 营业收入 / 利息费用</strong></p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某企业的财务报表提供了以下数据：</p>
    <p>- 营业收入：$300,000</p>
    <p>- 利息费用：$50,000</p>
    <p></p>
    <p><strong>根据利息覆盖比率的公式：</strong></p>
    <p>利息覆盖比率 = $300,000 / $50,000 = 6</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>利息覆盖比率为6表示企业的营业收入可以支付其利息费用六次，表明企业的利息支付能力较强。</p>`,
  },
  {
    title: `债务服务覆盖比率<br/>Debt Service Coverage Ratio`,
    content: `<p><strong>公式：债务服务覆盖比率 = 营业收入 / 总债务服务</strong></p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某企业的财务报表提供了以下数据：</p>
    <p>- 营业收入：$400,000</p>
    <p>- 总债务服务：$200,000</p>
    <p></p>
    <p><strong>根据债务服务覆盖比率的公式：</strong></p>
    <p>债务服务覆盖比率 = $400,000 / $200,000 = 2</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>债务服务覆盖比率为2表示企业的营业收入可以支付其债务服务两次，表明企业的债务支付能力较强。</p>`,
  },
];

const efficiencyDataArray: Item[] = [
  {
    title: `资产周转率<br/>Asset Turnover Ratio`,
    content: `<p><strong>公式：资产周转率 = 净销售额 / 平均总资产</strong></p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某企业的财务报表提供了以下数据：</p>
    <p>- 净销售额：$1,000,000</p>
    <p>- 平均总资产：$500,000</p>
    <p></p>
    <p><strong>根据资产周转率的公式：</strong></p>
    <p>资产周转率 = $1,000,000 / $500,000 = 2</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>资产周转率为2表示企业每一美元的资产产生了两美元的销售额，表明企业利用资产的效率较高。</p>`,
  },
  {
    title: `存货周转率<br/>Inventory Turnover Ratio`,
    content: `<p><strong>公式：存货周转率 = 销售成本 / 平均存货</strong></p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某企业的财务报表提供了以下数据：</p>
    <p>- 销售成本：$600,000</p>
    <p>- 平均存货：$150,000</p>
    <p></p>
    <p><strong>根据存货周转率的公式：</strong></p>
    <p>存货周转率 = $600,000 / $150,000 = 4</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>存货周转率为4表示企业在一定时期内出售和更换存货的次数为4次，表明企业的存货管理效率较高。</p>`,
  },
  {
    title: `应收账款周转率<br/>Accounts Receivable Turnover Ratio`,
    content: `<p><strong>公式：应收账款周转率 = 净赊销额 / 平均应收账款</strong></p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某企业的财务报表提供了以下数据：</p>
    <p>- 净赊销额：$800,000</p>
    <p>- 平均应收账款：$200,000</p>
    <p></p>
    <p><strong>根据应收账款周转率的公式：</strong></p>
    <p>应收账款周转率 = $800,000 / $200,000 = 4</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>应收账款周转率为4表示企业在一定时期内将应收账款转化为现金的次数为4次，表明企业的应收账款管理效率较高。</p>`,
  },
  {
    title: `存货周转天数比率<br/>Days Sales in Inventory Ratio`,
    content: `<p><strong>公式：存货周转天数比率 = 365天 / 存货周转率</strong></p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某企业的财务报表提供了以下数据：</p>
    <p>- 存货周转率：8</p>
    <p></p>
    <p><strong>根据存货周转天数比率的公式：</strong></p>
    <p>存货周转天数比率 = 365天 / 8 ≈ 45.63天</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>存货周转天数比率为45.63天表示企业平均持有存货45.63天后再出售，表明企业的存货管理周期较短。</p>`,
  },
];

const profitDataArray: Item[] = [
  {
    title: `存货周转天数比率<br/>Days Sales in Inventory Ratio`,
    content: `<p><strong>公式：存货周转天数比率 = 365天 / 存货周转率</strong></p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某企业的财务报表提供了以下数据：</p>
    <p>- 存货周转率：8</p>
    <p></p>
    <p><strong>根据存货周转天数比率的公式：</strong></p>
    <p>存货周转天数比率 = 365天 / 8 ≈ 45.63天</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>存货周转天数比率为45.63天表示企业平均持有存货45.63天后再出售，表明企业的存货管理周期较短。</p>`,
  },
  {
    title: `营业利润率<br/>Operating Margin Ratio`,
    content: `<p><strong>公式：营业利润率 = 营业收入 / 净销售额</strong></p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某企业的财务报表提供了以下数据：</p>
    <p>- 营业收入：$150,000</p>
    <p>- 净销售额：$1,000,000</p>
    <p></p>
    <p><strong>根据营业利润率的公式：</strong></p>
    <p>营业利润率 = $150,000 / $1,000,000 = 0.15</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>营业利润率为0.15（或15%）表示企业每一美元的销售收入产生了15美分的营业利润，表明企业的运营效率较高。</p>`,
  },
  {
    title: `资产回报率<br/>Return on Assets Ratio`,
    content: `<p><strong>公式：资产回报率 = 净收入 / 总资产</strong></p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某企业的财务报表提供了以下数据：</p>
    <p>- 净收入：$80,000</p>
    <p>- 总资产：$400,000</p>
    <p></p>
    <p><strong>根据资产回报率的公式：</strong></p>
    <p>资产回报率 = $80,000 / $400,000 = 0.2</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>资产回报率为0.2（或20%）表示企业每一美元的资产产生了20美分的净利润，表明企业利用资产的效率较高。</p>`,
  },
  {
    title: `权益回报率<br/>Return on Equity Ratio`,
    content: `<p><strong>公式：权益回报率 = 净收入 / 股东权益</strong></p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某企业的财务报表提供了以下数据：</p>
    <p>- 净收入：$100,000</p>
    <p>- 股东权益：$500,000</p>
    <p></p>
    <p><strong>根据权益回报率的公式：</strong></p>
    <p>权益回报率 = $100,000 / $500,000 = 0.2</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>权益回报率为0.2（或20%）表示企业每一美元的股东权益产生了20美分的净利润，表明企业利用股东权益的效率较高。</p>`,
  },
];

const marketDataArray: Item[] = [
  {
    title: `每股账面价值比率<br/>Book Value Per Share Ratio`,
    content: `<p><strong>公式：每股账面价值比率 =（股东权益 – 优先股权益）/ 流通在外普通股总数</strong></p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某企业的财务报表提供了以下数据：</p>
    <p>- 股东权益：$1,000,000</p>
    <p>- 优先股权益：$200,000</p>
    <p>- 流通在外普通股总数：40,000股</p>
    <p></p>
    <p><strong>根据每股账面价值比率的公式：</strong></p>
    <p>每股账面价值比率 = ($1,000,000 - $200,000) / 40,000 = 20</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>每股账面价值比率为20表示公司每一股普通股的账面价值为20美元，表明公司的资产净值较高。</p>`,
  },
  {
    title: `股息收益率比率<br/>Dividend Yield Ratio`,
    content: `<p><strong>公式：股息收益率比率 = 每股股息 / 股价</strong></p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某企业的财务报表提供了以下数据：</p>
    <p>- 每股股息：$2</p>
    <p>- 股价：$40</p>
    <p></p>
    <p><strong>根据股息收益率比率的公式：</strong></p>
    <p>股息收益率比率 = $2 / $40 = 0.05</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>股息收益率比率为0.05（或5%）表示公司每一美元的股价产生了5美分的股息收益，表明公司的股息回报较为丰厚。</p>`,
  },
  {
    title: `每股收益比率<br/>Earnings Per Share Ratio`,
    content: `<p><strong>公式：每股收益比率 = 净收入 / 流通在外总股数</strong></p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某企业的财务报表提供了以下数据：</p>
    <p>- 净收入：$200,000</p>
    <p>- 流通在外总股数：50,000股</p>
    <p></p>
    <p><strong>根据每股收益比率的公式：</strong></p>
    <p>每股收益比率 = $200,000 / 50,000 = 4</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>每股收益比率为4表示公司每一股流通在外的普通股产生了4美元的净收入，表明公司的盈利能力较强。</p>`,
  },
  {
    title: `市盈率比率<br/>Price-to-Earnings Ratio`,
    content: `<p><strong>公式：市盈率比率 = 股价 / 每股收益</strong></p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某公司的股价为$40，每股收益为$4。</p>
    <p></p>
    <p><strong>根据市盈率比率的公式：</strong></p>
    <p>市盈率比率 = $40 / $4 = 10</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>市盈率比率为10表示公司的股价为每一美元的净收入为10美元，表明公司的股价相对较低。</p>`,
  },
];

const riskDataArray: Item[] = [
  {
    title: `贝塔系数<br/>Beta Coefficient`,
    content: `<p><strong>公式：贝塔系数 = 资产的协方差 / 市场的方差</strong></p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某资产的贝塔系数为1.2，这意味着该资产的价格波动性比市场整体波动性高20%。</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>贝塔系数为1.2表示该资产在市场波动时，其价格波动幅度大于市场波动幅度，表明该资产的系统性风险较高。</p>`,
  },
  {
    title: `波动率<br/>Volatility`,
    content: `<p><strong>公式：波动率 = 标准差</strong></p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某股票的年波动率为30%，这意味着该股票的价格在一年内的标准差为30%。</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>波动率为30%表示该股票的价格在一年内可能会有较大的波动，表明该股票的风险较高。</p>`,
  },
  {
    title: `价值风险<br/>Value at Risk (VaR)`,
    content: `<p><strong>公式：VaR = 投资金额 × 波动率 × 标准正态分布的临界值</strong></p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某投资组合的VaR为$50,000，这意味着在95%的置信水平下，该投资组合在未来某个时间段内可能损失不超过$50,000。</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>VaR为$50,000表示该投资组合在未来某个时间段内的最大可能损失为$50,000，表明该投资组合的市场风险较大。</p>`,
  },
];

const macroDataArray: Item[] = [
  {
    title: `国内生产总值<br/>Gross Domestic Product (GDP)`,
    content: `<p><strong>公式：GDP = 消费 + 投资 + 政府支出 + 净出口</strong></p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某国的年度GDP为$3万亿美元，这意味着该国在一年内生产的所有最终产品和服务的总价值为$3万亿美元。</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>GDP为$3万亿美元表示该国的经济规模较大，表明其经济活动较为活跃。</p>`,
  },
  {
    title: `通货膨胀率<br/>Inflation Rate`,
    content: `<p><strong>公式：通货膨胀率 = （今年的价格水平 - 去年的价格水平）/ 去年的价格水平 × 100%</strong></p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某国的年度通货膨胀率为2%，这意味着该国的一般价格水平在一年内上升了2%。</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>通货膨胀率为2%表示该国的价格水平有所上升，表明其货币购买力有所下降。</p>`,
  },
  {
    title: `失业率<br/>Unemployment Rate`,
    content: `<p><strong>公式：失业率 = 失业人数 / 劳动力总数 × 100%</strong></p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某国的失业率为5%，这意味着该国的劳动力总数中有5%的人口没有工作。</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>失业率为5%表示该国的劳动力市场状况较为稳定，表明其经济活动能够提供足够的就业机会。</p>`,
  },
  {
    title: `利率<br/>Interest Rate`,
    content: `<p><strong>公式：利率 = （利息 / 本金）× 100%</strong></p>
    <p></p>
    <p><strong>示例：</strong></p>
    <p>假设某国的基准利率为3%，这意味着银行向借款人收取的利息为本金的3%。</p>
    <p></p>
    <p><strong>解释：</strong></p>
    <p>利率为3%表示借款人需要支付相对于本金3%的利息，表明该国的货币政策相对宽松。</p>`,
  },
];

const Quantitative = () => {
  const [current, setCurrent] = useState(0);
  const [noPrev, setNoPrev] = useState(true); // 默认没有上一页
  const [noNext, setNoNext] = useState(false); // 默认还有下一页
  const [curSubTopic, setCurSubTopic] = useState("flow");
  const [dataArray, setDataArray] = useState<Item[]>(flowDataArray);
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

  useEffect(() => {
    switch (curSubTopic) {
      case "lever":
        setDataArray(leverDataArray);
        break;
      case "flow":
        setDataArray(flowDataArray);
        break;
      case "efficiency":
        setDataArray(efficiencyDataArray);
        break;
      case "profit":
        setDataArray(profitDataArray);
        break;
      case "market":
        setDataArray(marketDataArray);
        break;
      case "risk":
        setDataArray(riskDataArray);
        break;
      case "macro":
        setDataArray(macroDataArray);
        break;
      default:
        setDataArray(flowDataArray);
        break;
    }
  }, [curSubTopic]);

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
              <li className={`${curSubTopic === "flow" && styles["active"]}`}>
                <button
                  onClick={() => setCurSubTopic("flow")}
                  type="button"
                  className="text-white w-full"
                >
                  流动性比率
                </button>
              </li>
              <li className={`${curSubTopic === "lever" && styles["active"]}`}>
                <button
                  onClick={() => setCurSubTopic("lever")}
                  type="button"
                  className="text-white w-full"
                >
                  负债比率
                </button>
              </li>
              <li
                className={`${curSubTopic === "efficiency" && styles["active"]}`}
              >
                <button
                  onClick={() => setCurSubTopic("efficiency")}
                  type="button"
                  className="text-white w-full"
                >
                  效率比率
                </button>
              </li>
              <li className={`${curSubTopic === "profit" && styles["active"]}`}>
                <button
                  onClick={() => setCurSubTopic("profit")}
                  type="button"
                  className="text-white w-full"
                >
                  盈利能力比率
                </button>
              </li>
              <li className={`${curSubTopic === "market" && styles["active"]}`}>
                <button
                  onClick={() => setCurSubTopic("market")}
                  type="button"
                  className="text-white w-full"
                >
                  市值比率
                </button>
              </li>
              <li className={`${curSubTopic === "risk" && styles["active"]}`}>
                <button
                  onClick={() => setCurSubTopic("risk")}
                  type="button"
                  className="text-white w-full"
                >
                  风险和市场指标
                </button>
              </li>
              <li className={`${curSubTopic === "macro" && styles["active"]}`}>
                <button
                  onClick={() => setCurSubTopic("macro")}
                  type="button"
                  className="text-white w-full"
                >
                  宏观经济指标
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <Footer position="relative" />
    </main>
  );
};

export default Quantitative;
