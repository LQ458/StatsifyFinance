import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface EChartComponentProps {
  option: echarts.EChartsOption;
}

const EChartComponent: React.FC<EChartComponentProps> = ({ option }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Initialize the chart
      const chartInstance = echarts.init(chartRef.current);

      // Set chart options
      // @ts-ignore
      chartInstance.setOption(option);

      // Handle resize
      const handleResize = () => {
        chartInstance.resize();
      };

      window.addEventListener("resize", handleResize);

      // Cleanup on unmount
      return () => {
        window.removeEventListener("resize", handleResize);
        chartInstance.dispose();
      };
    }
  }, [option]);

  return <div ref={chartRef} style={{ width: "100%", height: "100%" }}></div>;
};

export default EChartComponent;
