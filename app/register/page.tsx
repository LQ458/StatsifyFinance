"use client";
import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import Image from "next/image";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const [email, setEmail] = useState("");

  const PassReg =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

  const UserReg = /^[^\W_]+$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validateInput = () => {
      switch (true) {
        case !UserReg.test(username):
          alert("用户名格式错误");
          return false;
        case !PassReg.test(password):
          alert("密码格式错误");
          return false;
        case password !== repassword:
          alert("两次密码不一致");
          return false;
        case email === "":
          alert("邮箱不能为空");
          return false;
        default:
          return true;
      }
    };

    if (!validateInput()) {
      return;
    }

    try {
      const params = new URLSearchParams({
        username: username,
        password: password,
        email: email,
      });

      const res = await axios.post(`/api/register?${params.toString()}`);
      if (res.data.message === "User created successfully") {
        alert("注册成功");
        window.location.href = "/login";
      } else {
        alert("注册失败");
      }
    } catch (error) {
      console.error(error);
      alert("注册失败");
    }
  };

  return (
    <main className="flex flex-col h-screen bg-[#131419]">
      <Topbar position="relative" />
      <div className="flex-grow w-full flex bg-login-bg bg-cover bg-center">
        <div className="bg-[rgba(29,30,32,0.7)] border-[#333333] border-solid border-[1px] self-center m-auto w-[55%] h-[27rem] border-t-[#ffd700] border-t-2 min-w-[800px]">
          <div className="flex flex-col m-12 ml-28 mr-14 gap-5">
            <h1 className="text-white text-lg">注册</h1>
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="flex flex-row">
                <div className="bg-[#666666] border-[#333333] border-solid border-[1px] flex flex-row p-2 pt-1 pb-1 w-[48%] gap-[0.5px]">
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
                <p className="text-[#999999] text-sm m-auto ml-2 max-3xl:text-[12px] max-[1430px]:text-[10px] max-[1260px]:text-[8px]">
                  用户名格式字母开头，可包含数字，4-18个字符
                </p>
              </div>
              <div className="flex flex-row">
                <div className="bg-[#666666] border-[#333333] border-solid border-[1px] flex flex-row p-2 pt-1 pb-1 w-[48%] gap-[0.5px]">
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
                <p className="text-[#999999] text-sm m-auto ml-2 max-3xl:text-[12px] max-[1430px]:text-[10px] max-[1260px]:text-[8px]">
                  8~16个字符，包括字母、数字、特殊符号，区分大小写
                </p>
              </div>
              <div className="flex flex-row">
                <div className="bg-[#666666] border-[#333333] border-solid border-[1px] flex flex-row p-2 pt-1 pb-1 w-[48%] gap-[0.5px]">
                  <Image
                    src="/password.svg"
                    alt="password"
                    width="30"
                    height="30"
                  />
                  <input
                    type="password"
                    value={repassword}
                    onChange={(e) => setRepassword(e.target.value)}
                    placeholder="再次输入密码"
                    className="bg-transparent placeholder-[#999999] text-white outline-none border-none flex-grow mt-auto mb-auto"
                  />
                </div>
              </div>
              <div className="flex flex-row">
                <div className="bg-[#666666] border-[#333333] border-solid border-[1px] flex flex-row p-2 pt-1 pb-1 w-[48%] gap-[0.5px]">
                  <Image src="/email.svg" alt="email" width="30" height="30" />
                  <input
                    type="email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入邮箱，用于将来找回密码"
                    className="bg-transparent placeholder-[#999999] text-white outline-none border-none flex-grow mt-auto mb-auto"
                  />
                </div>
                {/* <div className="flex flex-row align-middle justify-center gap-1">
                  <Image
                    src={"/imp.svg"}
                    alt="important"
                    width="17"
                    height="17"
                    className="m-auto ml-2"
                  />
                  <p className="text-red-600 m-auto text-sm">
                    请填写正确格式电子邮箱
                  </p>
                </div> */}
              </div>
              <div className="flex flex-row">
                <button
                  type="submit"
                  className="bg-[rgba(255,215,0,0.7)] border-[#333333] border-solid border-[1px] flex flex-row p-2 pt-2 pb-2 w-[48%] cursor-pointer"
                >
                  <p className="text-white m-auto">注册</p>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer position="relative" />
    </main>
  );
};

export default Register;
