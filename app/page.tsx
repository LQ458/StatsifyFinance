/* eslint-disable @next/next/no-img-element */
import Topbar from "../components/topbar";
import Footer from "../components/footer";
import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-intro-color flex flex-col h-screen">
      <Topbar position="relative" />
      <div className="w-full flex-grow">
        <div className="flex flex-row justify-center align-middle max-w-[1920px] min-w-[1100px] mx-auto h-[100%]">
          <div className="self-center flex flex-col gap-[160px] flex-grow pl-[120px] -mt-[50px]">
            <div className="flex flex-col gap-5">
              <h1 className="text-white font-[400] text-[32px]">
                Your Path To Financial Clarity
              </h1>
              <div className="bg-yellow-400 h-0.5 w-16"></div>
              <div className="text-[16px]">
                <p className="text-[#666666] max-w-[600px]">
                  Gaining clear and organized financial understanding through
                  evaluation, budgeting, and planning.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-row justify-between max-w-[886px]">
                <p className="text-[#666666] text-[14px]">Vocabs for the week</p>
                <p className="text-[#666666] text-[14px]">more &gt;</p>
              </div>
              <div className="grid grid-cols-2 max-w-[886px]">
                <div className="flex flex-row h-[50px] leading-[50px]">
                  <div className="w-[86px] h-[100%] bg-[#3f4044] border-0 border-b-2 border-yellow-400">
                    <p className="text-[12px] h-[100%] text-center text-[#525356]">vocab<span className="text-[28px] text-[#666666] italic font-[600]">1</span></p>
                  </div>
                  <div className="flex-grow-[1] h-[100%] bg-[#2a2b30] text-white px-[20px] text-[16px]">
                    ESG
                  </div>
                </div>
                <div className="flex flex-row h-[50px] leading-[50px]">
                  <div className="w-[86px] h-[100%] bg-[#3f4044] border-0 border-b-2 border-yellow-400">
                    <p className="text-[12px] h-[100%] text-center text-[#525356]">vocab<span className="text-[28px] text-[#666666] italic font-[600]">2</span></p>
                  </div>
                  <div className="flex-grow-[1] h-[100%] bg-[#2a2b30] text-white px-[20px] text-[16px]">
                  Invest
                  </div>
                </div>

              </div>
            </div>
          </div>
          <div className="self-center flex pr-[76px]">
            <img
              src="/icon.png"
              alt="icon"
              width="736px"
              height="736px"
              className="m-auto ml-0"
            />
          </div>
        </div>
      </div>
      <Footer position="relative" />
    </main>
  );
}
