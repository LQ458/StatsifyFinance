interface NavItem {
  value: string;
  enValue: string;
  path: string;
}

const mainNavList: NavItem[] = [
  {
    value: "交易策略",
    enValue: "Trade Strategy",
    path: "/strategy/trade",
  },
  {
    value: "投资者",
    enValue: "Investor",
    path: "/strategy/investor",
  },
  {
    value: "风控",
    enValue: "Risk Management",
    path: "/strategy/risk-manage",
  },
];

export { mainNavList };
