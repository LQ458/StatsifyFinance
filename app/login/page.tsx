import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import React from "react";

const Login = () => {
  return (
    <main className="flex flex-col h-screen bg-[#131419]">
      <Topbar position="relative" />
      <div className="flex-grow w-full bg-login-bg bg-cover bg-center"></div>
      <Footer position="relative" />
    </main>
  );
};

export default Login;
