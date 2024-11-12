/* eslint-disable @next/next/no-img-element */
import Topbar from "../components/topbar";
import Footer from "../components/footer";
import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-intro-color flex flex-col h-screen">
      <Topbar position="relative" />
      <div className="w-full flex-grow relative">
        <div className="abrazine">
          <div className="ball-list">
            <ul>
              <li
                style={{ background: "red", boxShadow: "0 0 50px 50px red" }}
              ></li>
              <li
                style={{ background: "blue", boxShadow: "0 0 50px 50px blue" }}
              ></li>
              <li
                style={{
                  background: "green",
                  boxShadow: "0 0 50px 50px green",
                }}
              ></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-row justify-center align-middle max-w-[1920px] min-w-[1100px] mx-auto h-[100%] relative z-10 index-container">
          <div className="self-center flex flex-col gap-[160px] flex-grow pl-[120px] -mt-[50px] ss-index-left">
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
                <p className="text-[#666666] text-[14px]">
                  Vocabs for the week
                </p>
                <p className="text-[#666666] text-[14px]">more &gt;</p>
              </div>
              <div className="flex max-w-[886px] ss-vocabs">
                <div className="relative group flex-1 ss-vocabs-item">
                  <div className="flex flex-row h-[50px] leading-[50px] ss-vocabs-head">
                    <div className="w-[86px] h-[100%] bg-[rgba(63,64,68,.7)] border-0 border-b-2 border-transparent duration-300 transition  group-hover:border-yellow-400 group-hover:delay-150 ss-vocabs-label">
                      <p className="text-[12px] h-[100%] text-center text-[#525356]">
                        vocab
                        <span className="text-[28px] text-[#666666] italic font-[600]">
                          1
                        </span>
                      </p>
                    </div>
                    <div className="flex-grow-[1] h-[100%] bg-[rgba(42,43,48,.5)] text-white px-[20px] text-[16px] truncate">
                      ESG
                    </div>
                  </div>
                  <div className="absolute left-0 right-0 top-[50px] bg-[rgba(63,64,68,.3)] border-0 border-t border-black p-[20px] text-white text-[14px] duration-300 transition invisible opacity-0 translate-y-[-10%] group-hover:visible group-hover:opacity-100 group-hover:translate-y-[0] ss-vocabs-content">
                    ESG
                    是环境、社会和治理的缩写。它是一种衡量企业可持续性和社会责任的标准
                    <div className="text-right">
                      <Link
                        href="/"
                        className="text-[16px] text-white no-underline hover:text-yellow-400"
                      >
                        more &gt;
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="relative group flex-1 ss-vocabs-item">
                  <div className="flex flex-row h-[50px] leading-[50px] border-l border-black ss-vocabs-head">
                    <div className="w-[86px] h-[100%] bg-[rgba(63,64,68,.7)] border-0 border-b-2 border-transparent duration-300 transition  group-hover:border-yellow-400 group-hover:delay-150 ss-vocabs-label">
                      <p className="text-[12px] h-[100%] text-center text-[#525356]">
                        vocab
                        <span className="text-[28px] text-[#666666] italic font-[600]">
                          2
                        </span>
                      </p>
                    </div>
                    <div className="flex-grow-[1] h-[100%] bg-[rgba(42,43,48,.5)] text-white px-[20px] text-[16px] truncate">
                      Invest
                    </div>
                  </div>
                  <div className="absolute left-0 right-0 top-[50px] bg-[rgba(63,64,68,.3)] border-0 border-t border-black p-[20px] text-white text-[14px] duration-300 transition invisible opacity-0 translate-y-[-10%] group-hover:visible group-hover:opacity-100 group-hover:translate-y-[0] ss-vocabs-content">
                    Invest指的是将资金投入到某个项目、资产或企业中，以期获得未来的收益
                    <div className="text-right">
                      <Link
                        href="/"
                        className="text-[16px] text-white no-underline hover:text-yellow-400"
                      >
                        more &gt;
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="self-center flex pr-[76px] ss-index-right">
            <img
              src="/icon.png"
              alt="icon"
              width="600px"
              height="600px"
              className="m-auto ml-0"
            />
          </div>
        </div>
      </div>
      <Footer position="relative" />
    </main>
  );
}
