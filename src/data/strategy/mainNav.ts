interface NavItem {
  value: string;
  path: string;
}

const mainNavList: NavItem[] = [
  {
    value: "trade",
    path: "/strategy/trade",
  },
  {
    value: "investor",
    path: "/strategy/investor",
  },
  {
    value: "risk-manage",
    path: "/strategy/risk-manage",
  },
];

export { mainNavList };
