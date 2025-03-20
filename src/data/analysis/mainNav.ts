interface NavItem {
  value: string;
  path: string;
}

const mainNavList: NavItem[] = [
  {
    value: "quantitativeTitle",
    path: "/analysis/quantitative",
  },
  {
    value: "qualitative",
    path: "/analysis/qualitative",
  },
];

export { mainNavList };
