import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import React from "react";
import styles from "../css/learn.module.css";

const Quantitative = () => {
  return (
    <main className="flex flex-col h-screen bg-[#131419]">
      <Topbar position="relative" />
      <div className="flex-grow w-full bg-analysis-bg bg-cover bg-center">
        定量
      </div>
      <Footer position="relative" />
    </main>
  );
};

export default Quantitative;
