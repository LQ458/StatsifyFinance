interface NavItem {
  value: string;
  enValue: string;
  path: string;
}

const mainNavList: NavItem[] = [
  {
    value: "定量",
    enValue: "Quantitative",
    path: "/analysis/quantitative",
  },
  {
    value: "定性",
    enValue: "Qualitative",
    path: "/analysis/qualitative",
  },
];

export { mainNavList };
