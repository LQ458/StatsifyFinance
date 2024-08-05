/* eslint-disable @next/next/no-img-element */
import Topbar from "../components/topbar";
import Footer from "../components/footer";
import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-intro-color flex flex-col h-screen">
      <Topbar position="relative" />
      <div className="w-full flex-grow flex flex-row justify-center align-middle">
        <div className="self-center flex flex-col gap-36 flex-grow pl-44">
          <div className="flex flex-col gap-5">
            <h1 className="text-white font-[500]">
              Your Path To Financial Clarity
            </h1>
            <div className="bg-yellow-400 h-0.5 w-16"></div>
            <div>
              <p className="text-[#666666]">
                Gaining clear and organized financial understanding through
                evaluation,
              </p>
              <p className="text-[#666666]">budgeting, and planning.</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between">
              <p className="text-[#666666] text-[14px]">Vocabs for the week</p>
              <p className="text-[#666666] text-[14px]">more &gt;</p>
            </div>
            <div className="grid grid-cols-2">
              <div className="flex flex-row">
                <div className="flex-grow-[1] bg-[#3f4044] p-2 flex flex-row gap-[0.5px] justify-center pl-0 pr-0 border-b-2 border-yellow-400 border-solid border-t-0 border-l-0 border-r-0">
                  <p className="text-[10px] self-end text-[#525356]">vocab</p>
                  <p className="text-[#666666] italic font-[600] self-end">1</p>
                </div>
                <div className="flex-grow-[8] bg-[#2a2b30] text-white p-2">
                  ESG
                </div>
              </div>
              <div className="flex flex-row">
                <div className="flex-grow-[1] bg-[#3f4044] p-2 flex flex-row gap-[0.5px] justify-center pl-0 pr-0 border-b-2 border-yellow-400 border-solid border-t-0 border-l-0 border-r-0">
                  <p className="text-[10px] self-end text-[#525356]">vocab</p>
                  <p className="text-[#666666] italic font-[600] self-end">2</p>
                </div>
                <div className="flex-grow-[8] bg-[#2a2b30] text-white p-2">
                  Invest
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="self-center flex pr-44">
          <img
            src="/icon.png"
            alt="icon"
            width="550px"
            height="550px"
            className="m-auto ml-0"
          />
        </div>
      </div>
      <Footer position="relative" />
    </main>
  );
}
