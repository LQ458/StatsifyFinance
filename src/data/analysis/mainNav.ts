interface NavItem {
  value: string;
  path: string;
}

const mainNavList: NavItem[] = [
  {
    value: "定量",
    path: "/analysis/quantitative",
  },
  {
    value: "定性",
    path: "/analysis/qualitative",
  },
];

export { mainNavList };
