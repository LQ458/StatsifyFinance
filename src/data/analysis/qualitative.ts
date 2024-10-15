interface Item {
  title: string;
  content: string;
}
interface Map {
  title: string;
  content: Item[];
}

interface Mapping {
  key: string;
  value: string;
}
const ESGDataArray: Item[] = [
  {
    title: "环境（Environmental）",
    content: `
    <p><strong>定义：</strong></p>
    <p>环境指标评估企业在环境保护和可持续发展方面的实践和政策。它涵盖了企业如何管理其对自然资源的影响、如何减少碳排放、如何处理废弃物以及如何节约能源等。</p>
    <p><strong>功能和作用：</strong></p>
    <ul>
      <li>资源管理：评估企业如何高效利用自然资源，包括水、能源和原材料。</li>
      <li>污染控制：衡量企业减少排放和污染的措施，如减少温室气体排放、减少水和空气污染。</li>
      <li>环保合规：检查企业是否遵守环境法规和标准。</li>
      <li>可再生能源：评估企业在可再生能源方面的投资和使用情况。</li>
    </ul>
    <p><strong>示例：</strong></p>
    <p>某公司采用了最新的清洁技术，每年减少了20%的碳排放，并且所有废弃物都经过分类处理和再利用。</p>
    `,
  },
  {
    title: "社会（Social）",
    content: `
    <p><strong>定义：</strong></p>
    <p>社会指标评估企业在员工福利、社区关系和社会责任方面的表现。它涵盖了企业如何对待员工、如何对社区产生积极影响以及如何承担社会责任等方面。</p>
    <p><strong>功能和作用：</strong></p>
    <ul>
      <li>员工待遇：评估企业在薪酬、福利、安全和职业发展等方面的政策和实践。</li>
      <li>多样性和包容性：衡量企业在促进员工多样性和包容性方面的努力。</li>
      <li>社区影响：检查企业如何通过慈善活动和社区项目回馈社会。</li>
      <li>客户关系：评估企业如何确保产品和服务的质量，以及如何处理客户投诉和反馈。</li>
    </ul>
    <p><strong>示例：</strong></p>
    <p>某公司为所有员工提供全面的健康保险和职业培训计划，并且积极参与社区建设，通过捐款和志愿服务支持当地教育和医疗项目。</p>
    `,
  },
  {
    title: "公司治理（Governence）",
    content: `
    <p><strong>定义：</strong></p>
    <p>公司治理指标评估企业的管理架构、治理政策和透明度。它涵盖了企业的董事会结构、管理层的独立性、股东权利和公司透明度等方面。</p>
    <p><strong>功能和作用：</strong></p>
    <ul>
      <li>董事会结构：评估企业董事会的独立性和多样性。</li>
      <li>管理层激励：检查高管薪酬与企业绩效的关联性。</li>
      <li>股东权利：衡量股东在公司决策中的权利和影响力。</li>
      <li>合规和透明度：评估企业在财务披露、审计和内部控制方面的合规性和透明度。</li>
    </ul>
    <p><strong>示例：</strong></p>
    <p>某公司设立了独立的审计委员会，并且所有高管薪酬都与公司长期绩效挂钩，确保管理层的决策符合股东利益。</p>
    `,
  },
  {
    title: "综合评估",
    content: `
    <p>ESG模型通过综合评估企业在环境、社会和公司治理方面的表现，帮助投资者和其他利益相关者了解企业的可持续性和道德实践。这种评估不仅关注企业的财务健康，还关注其在社会和环境方面的责任和贡献，从而推动企业实现长期的可持续发展。</p>
    `,
  },
];

const SWOTDataArray: Item[] = [
  {
    title: "优势（Strengths）",
    content: `
    <p><strong>定义：</strong></p>
    <p>优势是企业内部的积极因素，可以帮助企业在市场中取得成功。这些因素包括资源、能力、品牌声誉、技术优势等。</p>
    <p><strong>功能和作用：</strong></p>
    <ul>
      <li>资源优势：识别企业在资金、人力和技术资源方面的优势。</li>
      <li>品牌声誉：评估企业在市场中的品牌知名度和声誉。</li>
      <li>技术创新：衡量企业在技术创新方面的领先地位。</li>
      <li>市场份额：识别企业在市场中的份额和竞争优势。</li>
    </ul>
    <p><strong>示例：</strong></p>
    <p>某公司的品牌在市场上享有很高的声誉，拥有强大的研发团队和先进的技术，这使其在竞争中具有明显优势。</p>
    `,
  },
  {
    title: "劣势（Weaknesses）",
    content: `
    <p><strong>定义：</strong></p>
    <p>劣势是企业内部的消极因素，可能会阻碍企业的发展。这些因素包括资源不足、管理不善、品牌弱势、技术落后等。</p>
    <p><strong>功能和作用：</strong></p>
    <ul>
      <li>资源不足：识别企业在资金、人力和技术资源方面的不足。</li>
      <li>品牌弱势：评估企业在市场中的品牌知名度和声誉不足。</li>
      <li>技术落后：衡量企业在技术创新方面的劣势。</li>
      <li>市场份额低：识别企业在市场中的份额和竞争劣势。</li>
    </ul>
    <p><strong>示例：</strong></p>
    <p>某公司的资金有限，研发投入不足，导致其在市场竞争中处于劣势地位。</p>
    `,
  },
  {
    title: "机会（Opportunities）",
    content: `
    <p><strong>定义：</strong></p>
    <p>机会是外部市场中的积极因素，可以帮助企业扩展和发展。这些因素包括市场增长、政策支持、技术进步、消费者需求变化等。</p>
    <p><strong>功能和作用：</strong></p>
    <ul>
      <li>市场增长：识别市场中的增长机会和新兴市场。</li>
      <li>政策支持：评估政府政策对企业发展的支持作用。</li>
      <li>技术进步：衡量技术进步带来的市场机会。</li>
      <li>消费者需求变化：识别消费者需求的变化带来的市场机会。</li>
    </ul>
    <p><strong>示例：</strong></p>
    <p>某市场的需求快速增长，政府出台了有利于企业发展的政策，这为企业提供了扩展的机会。</p>
    `,
  },
  {
    title: "威胁（Threats）",
    content: `
    <p><strong>定义：</strong></p>
    <p>威胁是外部市场中的消极因素，可能会对企业造成不利影响。这些因素包括市场竞争、政策变化、技术替代、经济衰退等。</p>
    <p><strong>功能和作用：</strong></p>
    <ul>
      <li>市场竞争：识别市场中的竞争对手和竞争压力。</li>
      <li>政策变化：评估政府政策变化对企业的不利影响。</li>
      <li>技术替代：衡量新技术对现有技术的替代威胁。</li>
      <li>经济衰退：识别经济环境变化对企业的影响。</li>
    </ul>
    <p><strong>示例：</strong></p>
    <p>某市场的竞争日益激烈，政府政策发生变化，经济环境不稳定，这些都可能对企业的发展造成威胁。</p>
    `,
  },
];

const PESTELDataArray: Item[] = [
  {
    title: "政治因素（Political）",
    content: `
    <p><strong>定义：</strong></p>
    <p>政治因素包括政府政策、政治稳定性、税收政策、贸易法规和政府干预等。这些因素影响企业的运营环境和战略决策。</p>
    <p><strong>功能和作用：</strong></p>
    <ul>
      <li>政府政策：评估政府政策对企业的支持或限制。</li>
      <li>政治稳定性：衡量政治环境的稳定性对企业的影响。</li>
      <li>税收政策：识别税收政策变化对企业成本和利润的影响。</li>
      <li>贸易法规：评估贸易法规对企业国际业务的影响。</li>
    </ul>
    <p><strong>示例：</strong></p>
    <p>某国政府出台了支持高科技产业的优惠政策，这为相关企业提供了发展机会。</p>
    `,
  },
  {
    title: "经济因素（Economic）",
    content: `
    <p><strong>定义：</strong></p>
    <p>经济因素包括经济增长、通货膨胀率、利率、失业率和消费者支出等。这些因素影响企业的市场需求和运营成本。</p>
    <p><strong>功能和作用：</strong></p>
    <ul>
      <li>经济增长：评估经济增长对企业市场需求的影响。</li>
      <li>通货膨胀率：衡量通货膨胀对企业成本和定价的影响。</li>
      <li>利率：识别利率变化对企业融资成本的影响。</li>
      <li>失业率：评估失业率对消费者支出和市场需求的影响。</li>
    </ul>
    <p><strong>示例：</strong></p>
    <p>某国经济快速增长，消费者支出增加，这为企业提供了扩展市场的机会。</p>
    `,
  },
  {
    title: "社会因素（Social）",
    content: `
    <p><strong>定义：</strong></p>
    <p>社会因素包括人口结构、文化态度、社会价值观、生活方式和教育水平等。这些因素影响企业的市场定位和消费者行为。</p>
    <p><strong>功能和作用：</strong></p>
    <ul>
      <li>人口结构：评估人口变化对企业目标市场的影响。</li>
      <li>文化态度：衡量文化变化对消费者偏好的影响。</li>
      <li>社会价值观：识别社会价值观变化对企业品牌形象的影响。</li>
      <li>生活方式：评估生活方式变化对产品和服务需求的影响。</li>
    </ul>
    <p><strong>示例：</strong></p>
    <p>某地区的年轻人口增加，对高科技产品的需求上升，这为相关企业提供了市场机会。</p>
    `,
  },
  {
    title: "技术因素（Technological）",
    content: `
    <p><strong>定义：</strong></p>
    <p>技术因素包括技术进步、研发活动、自动化水平和技术创新等。这些因素影响企业的生产效率和市场竞争力。</p>
    <p><strong>功能和作用：</strong></p>
    <ul>
      <li>技术进步：评估技术进步对企业产品和服务的影响。</li>
      <li>研发活动：衡量研发投入对企业创新能力的影响。</li>
      <li>自动化水平：识别自动化水平对企业生产效率的影响。</li>
      <li>技术创新：评估技术创新对企业市场竞争力的影响。</li>
    </ul>
    <p><strong>示例：</strong></p>
    <p>某公司采用了最新的自动化生产技术，显著提高了生产效率和产品质量。</p>
    `,
  },
  {
    title: "环境因素（Environmental）",
    content: `
    <p><strong>定义：</strong></p>
    <p>环境因素包括环境保护法规、气候变化、资源稀缺和可持续发展等。这些因素影响企业的运营成本和社会责任。</p>
    <p><strong>功能和作用：</strong></p>
    <ul>
      <li>环境保护法规：评估环境法规对企业运营的影响。</li>
      <li>气候变化：衡量气候变化对企业生产和供应链的影响。</li>
      <li>资源稀缺：识别资源稀缺对企业成本和供应链的影响。</li>
      <li>可持续发展：评估可持续发展对企业品牌和市场的影响。</li>
    </ul>
    <p><strong>示例：</strong></p>
    <p>某公司实施了环保措施，减少了碳排放，提升了企业的社会责任形象。</p>
    `,
  },
  {
    title: "法律因素（Legal）",
    content: `
    <p><strong>定义：</strong></p>
    <p>法律因素包括劳动法、消费者保护法、知识产权法和反垄断法等。这些因素影响企业的合规成本和法律风险。</p>
    <p><strong>功能和作用：</strong></p>
    <ul>
      <li>劳动法：评估劳动法规对企业雇佣和管理的影响。</li>
      <li>消费者保护法：衡量消费者保护法规对企业产品和服务的影响。</li>
      <li>知识产权法：识别知识产权法规对企业创新和竞争力的影响。</li>
      <li>反垄断法：评估反垄断法规对企业市场行为的影响。</li>
    </ul>
    <p><strong>示例：</strong></p>
    <p>某公司严格遵守知识产权法，保护了自身的创新成果，提升了市场竞争力。</p>
    `,
  },
];

const qualList = ["ESG模型", "SWOT模型整体介绍", "PESTEL模型整体介绍"];

const qualMap: Mapping[] = [
  { key: "esg", value: "ESG模型" },
  { key: "swot", value: "SWOT模型整体介绍" },
  { key: "pestel", value: "PESTEL模型整体介绍" },
];

const qualArrayMap: Map[] = [
  { title: "esg", content: ESGDataArray },
  { title: "swot", content: SWOTDataArray },
  { title: "pestel", content: PESTELDataArray },
];

export {
  ESGDataArray,
  SWOTDataArray,
  PESTELDataArray,
  qualList,
  qualMap,
  qualArrayMap,
};
