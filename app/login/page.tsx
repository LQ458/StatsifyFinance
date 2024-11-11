"use client";
import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import Message from "@/components/message";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type TipType = 'success' | 'warning' | 'error';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msgType, setMsgType] = useState<TipType>("error");
  const [msg, setMsg] = useState("");
  const [msgVisible, setMsgVisible] = useState(false);
  const nav = useRouter();

  const Msg = (type:TipType, msg:string) => {    
    setMsg(msg)
    setMsgType(type)   
    setMsgVisible(true)
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });
      console.log("res:::", res);
      if (!res?.ok) {
        Msg('error', '用户名或密码错误')
        return
      }
      if (res?.error) {
        Msg('error', '登录失败')
        console.log("登录失败");
      } else {
        Msg('success', '登录成功')
        console.log("登录成功");
        nav.push("/");
      }
    } catch (error) {
      console.error("登录失败", error);
    }
  };

  return (
    <main className="flex flex-col h-screen bg-[#131419]">
      <Topbar position="relative" />
      <div className="flex-grow w-full flex bg-login-bg bg-cover bg-center">
        <div className="bg-[rgba(29,30,32,0.7)] flex border-[#333333] border-solid border-[1px] self-center m-auto w-[37%] h-[27rem] border-t-[#ffd700] border-t-2  min-w-[600px] ss-login-container">
          <div className="flex flex-col m-12 ml-32 mr-32 gap-5 self-center flex-grow ss-login-box">
            <h1 className="text-white text-lg">登录</h1>
            <form className="flex flex-col" onSubmit={handleSubmit}>
              <div className="flex flex-row">
                <div className="bg-[#666666] border-[#333333] mt-2 mb-3 w-full border-solid border-[1px] flex flex-row p-2 pt-1 pb-1 gap-[0.5px]">
                  <Image
                    src="/username.svg"
                    alt="username"
                    width="30"
                    height="30"
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="用户名"
                    className="bg-transparent placeholder-[#999999] text-white outline-none border-none flex-grow mt-auto mb-auto"
                  />
                </div>
              </div>
              <div className="flex flex-row">
                <div className="bg-[#666666] border-[#333333] w-full border-solid border-[1px] mt-3 mb-1 flex flex-row p-2 pt-1 pb-1 gap-[0.5px]">
                  <Image
                    src="/password.svg"
                    alt="password"
                    width="30"
                    height="30"
                  />
                  <input
                    value={password}
                    type="password"
                    placeholder="密码"
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent placeholder-[#999999] text-white outline-none border-none flex-grow mt-auto mb-auto"
                  />
                </div>
              </div>
              <Link
                href="#"
                className="no-underline text-[rgba(255,215,0,0.7)] text-right text-sm mb-6"
              >
                忘记密码
              </Link>
              <button
                type="submit"
                className="bg-[rgba(255,215,0,0.7)] border-[#333333] border-solid border-[1px] flex flex-row p-2 pt-2 pb-2 cursor-pointer"
              >
                <p className="text-white m-auto">登录</p>
              </button>
              <div className="flex flex-row text-sm ml-auto mr-auto mt-3">
                <p className="text-[#666666]">还没有帐号？</p>
                <Link href="/register" className="text-[rgba(255,215,0,0.7)]">
                  立即注册
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer position="relative" />
      {msgVisible && (
        <Message
          type={msgType} // 可选 "success"、"warning"、"error"
          message={msg}
          duration={2000} 
          onClose={() => setMsgVisible(false)}
        />
      )}
    </main>
  );
};

export default Login;
