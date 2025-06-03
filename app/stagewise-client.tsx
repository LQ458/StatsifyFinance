"use client";

import { useEffect } from "react";

export default function StagewiseClient() {
  useEffect(() => {
    // 确保在客户端环境中才加载
    if (typeof window === "undefined") return;

    const initStagewise = async () => {
      try {
        const { initToolbar } = await import("@stagewise/toolbar");

        // 配置 stagewise 工具栏
        const config = {
          plugins: [],
        };

        // 初始化工具栏（不返回清理函数）
        initToolbar(config);

        console.log("✅ Stagewise 工具栏初始化成功");
      } catch (error) {
        console.warn("⚠️ Stagewise 工具栏初始化失败:", error);
      }
    };

    // 延迟初始化以确保页面完全加载
    const timer = setTimeout(initStagewise, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return null; // 不渲染任何内容
}
