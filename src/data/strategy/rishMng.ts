interface smallItem {
  name: string;
  value: string | number;
}

interface Maping {
  name: string;
  categories: smallItem[];
}

const industrySectors: Maping[] = [
  {
    name: "能源",
    categories: [
      { name: "石油和天然气", value: "包括勘探、生产、提炼、运输和销售" },
      { name: "煤炭", value: "涉及煤矿开采、洗选、运输和销售" },
      {
        name: "电力",
        value: "包括发电（如火力发电、水力发电、核能发电）、输电、配电和销售。",
      },
    ],
  },
  {
    name: "化工",
    categories: [
      { name: "Subcategory A1", value: 3 },
      { name: "Subcategory A2", value: 7 },
    ],
  },
  {
    name: "材料",
    categories: [
      { name: "Subcategory A1", value: 3 },
      { name: "Subcategory A2", value: 7 },
    ],
  },
  {
    name: "机械设备/军工",
    categories: [
      { name: "Subcategory A1", value: 3 },
      { name: "Subcategory A2", value: 7 },
    ],
  },
  {
    name: "企业服务/造纸印刷",
    categories: [
      { name: "Subcategory A1", value: 3 },
      { name: "Subcategory A2", value: 7 },
    ],
  },
  {
    name: "运输设备",
    categories: [
      { name: "Subcategory A1", value: 3 },
      { name: "Subcategory A2", value: 7 },
    ],
  },
  {
    name: "旅游酒店",
    categories: [
      { name: "Subcategory A1", value: 3 },
      { name: "Subcategory A2", value: 7 },
    ],
  },
  {
    name: "媒体/信息通信服务",
    categories: [
      { name: "Subcategory A1", value: 3 },
      { name: "Subcategory A2", value: 7 },
    ],
  },
  {
    name: "批发/零售",
    categories: [
      { name: "Subcategory A1", value: 3 },
      { name: "Subcategory A2", value: 7 },
    ],
  },
  {
    name: "消费品",
    categories: [
      { name: "Subcategory A1", value: 3 },
      { name: "Subcategory A2", value: 7 },
    ],
  },
  {
    name: "卫生保健/医疗",
    categories: [
      { name: "Subcategory A1", value: 3 },
      { name: "Subcategory A2", value: 7 },
    ],
  },
  {
    name: "金融",
    categories: [
      { name: "Subcategory A1", value: 3 },
      { name: "Subcategory A2", value: 7 },
    ],
  },
  {
    name: "建材/建筑/房地产",
    categories: [
      { name: "Subcategory A1", value: 3 },
      { name: "Subcategory A2", value: 7 },
    ],
  },
  {
    name: "公用事业",
    categories: [
      { name: "Subcategory A1", value: 3 },
      { name: "Subcategory A2", value: 7 },
    ],
  },
];

export { industrySectors };
