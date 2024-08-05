import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "intro-1": "url('/intro1.png')",
        "intro-2": "url('/intro2.png')",
        "intro-3": "url('/intro3.png')",
        "econ-term": "url('/econTerm.png')",
        "intro-4": "url('/intro4.png')",
      },
      colors: {
        // 在这里添加自定义颜色
        "topbar-color": "rgb(9, 10, 12)",
        "footer-color": "#090A0C",
        "grey-color": "rgba(255, 255, 255, 0.3)",
        "learn-button": "rgba(2,2,23,0.7)",
        "intro-3-color": "rgba(255, 255, 255, 0.05)",
        "intro-4-color": "rgba(0, 0, 0, 0.05)",
        "intro-4-stroke": "rgb(224, 225, 227)",
        "menu-color": "rgb(49,49,49)",
        "footer-tcolor": "rgba(255, 255, 255, 0.3)",
      },
      fontSize: {
        "footer-font": "0.8em",
      },
    },
  },
  plugins: [],
};
export default config;
