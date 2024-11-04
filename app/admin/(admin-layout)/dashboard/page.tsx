"use client";
import React, { useEffect } from "react";
import PageContainer from "../../_components/page-container";
import { useSession } from "next-auth/react";

function Dashboard() {
  const { data: session } = useSession();
  useEffect(() => {
    console.log("session::", session);
  }, [session]);
  return (
    <PageContainer title="管理主页">
      <h1>首页</h1>
    </PageContainer>
  );
}

export default Dashboard;
