/* eslint-disable @next/next/no-img-element */
import Topbar from "../components/topbar";
import Footer from "../components/footer";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <Topbar position="fixed" />
      <div className="bg-intro-1 bg-cover bg-center h-[35rem] bg-no-repeat relative">
        <div className="flex flex-col text-white absolute top-[25%] left-[20%] w-fit gap-2">
          <h1 className="font-[400] text-[2.5rem]">Your Path</h1>
          <h1 className="font-[400] text-[2.5rem]">To Financial Clarity</h1>
        </div>
        <Link
          href="/learn"
          className="bg-learn-button absolute top-[55%] left-[20%] text-2xl text-white pl-7 pr-7 pt-1 pb-1 cursor-pointer no-underline"
        >
          Learn
        </Link>
        <img
          src="./shadow.png"
          alt="shadow"
          width="100%"
          className="bottom-0 absolute"
        />
        <img
          src="./icon.png"
          width={370}
          height={370}
          className="absolute top-[20%] right-[20%]"
          alt="icon"
        />
        <div
          className="absolute bottom-[-4rem] h-[8rem] w-[62%] left-1/2 flex flex-row"
          style={{ transform: "translateX(-50%)" }}
        >
          <div
            className="inline-flex relative"
            style={{ flexGrow: "4", flexBasis: "0" }}
          >
            <img src="./map-left.png" alt="left" className="bg-cover w-full" />
            <div
              className="absolute text-white text-2xl font-[600] text-right left-1/2 top-1/2"
              style={{ transform: "translate(-50%, -50%)" }}
            >
              <p>Vocabs</p>
              <p className="whitespace-nowrap">for the week</p>
            </div>
          </div>
          <div
            className="bg-white grid grid-cols-2 p-4"
            style={{ flexGrow: "6", flexBasis: "0" }}
          >
            <div className="flex flex-col gap-1">
              <h2 className="text-lg">ESG</h2>
              <p className="text-xs">
                ESG
                是环境、社会和治理的缩写。它是一种衡量企业可持续性和社会责任的标准
              </p>
            </div>
            <img
              src="https://picsum.photos/id/247/150/90"
              width="90%"
              height="90%"
              alt="pic1"
              className="m-auto relative object-cover"
            />
          </div>
          <div
            className="bg-gray-300"
            style={{ flexGrow: "0.1", flexBasis: "0" }}
          />
          <div
            className="bg-white grid grid-cols-2 p-4"
            style={{ flexGrow: "6", flexBasis: "0" }}
          >
            <div className="flex flex-col gap-1">
              <h2 className="text-lg">ESG</h2>
              <p className="text-xs">
                ESG
                是环境、社会和治理的缩写。它是一种衡量企业可持续性和社会责任的标准
              </p>
            </div>
            <img
              src="https://picsum.photos/id/247/150/90"
              width="90%"
              height="90%"
              alt="pic2"
              className="m-auto relative"
            />
          </div>
          <div
            className="inline-flex relative"
            style={{ flexGrow: "1.3", flexBasis: "0" }}
          >
            <img
              src="./map-right.png"
              alt="right"
              className="bg-cover w-full"
            />
            <Link
              href="#"
              className="no-underline whitespace-nowrap text-gray-400 absolute left-1/2 top-1/2 font-[600] text-sm"
              style={{ transform: "translate(-50%, -50%)" }}
            >
              More &gt;
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-intro-2 bg-cover bg-center w-full h-[40rem] flex flex-col text-center pt-[5rem]">
        <br />
        <br />
        <div className="relative">
          <h2 className="text-3xl z-[1000] relative">著名投资者</h2>
          <h2 className="relative text-gray-200 text-[2.5rem] bottom-6 z-0">
            Famous Investors
          </h2>
          <p className="bottom-7 relative text-sm">
            影响力巨大的投资者就像金融世界的摇滚明星
          </p>
        </div>
        <div className="grid grid-cols-4 w-[70%] m-auto mt-0 mb-0">
          <div className="gap-2 flex flex-col justify-center">
            <img
              src="https://picsum.photos/id/277/200/200"
              alt="pic1"
              width="90%"
              height="70%"
              className="rounded-lg object-cover self-center"
            />
            <div>
              <p>沃伦·巴菲特</p>
              <p>(Warren Buffet)</p>
            </div>
          </div>
          <div className="gap-2 flex flex-col justify-center">
            <img
              src="https://picsum.photos/id/277/200/200"
              alt="pic1"
              width="90%"
              height="70%"
              className="rounded-lg object-cover self-center"
            />
            <div>
              <p>沃伦·巴菲特</p>
              <p>(Warren Buffet)</p>
            </div>
          </div>
          <div className="gap-2 flex flex-col justify-center">
            <img
              src="https://picsum.photos/id/277/200/200"
              alt="pic1"
              width="90%"
              height="70%"
              className="rounded-lg object-cover self-center"
            />
            <div>
              <p>沃伦·巴菲特</p>
              <p>(Warren Buffet)</p>
            </div>
          </div>
          <div className="gap-2 flex flex-col justify-center">
            <img
              src="https://picsum.photos/id/277/200/200"
              alt="pic1"
              width="90%"
              height="70%"
              className="rounded-lg object-cover self-center"
            />
            <div>
              <p>沃伦·巴菲特</p>
              <p>(Warren Buffet)</p>
            </div>
          </div>
        </div>
        <Link
          className="mr-auto ml-auto no-underline text-white bg-black pt-2 pb-2 pr-10 pl-10"
          href="#"
        >
          更多
        </Link>
      </div>
      <div className="bg-intro-3 w-full h-[35rem] bg-cover bg-center flex flex-col text-center pt-[5rem]">
        <div className="relative">
          <h2 className="text-3xl z-[1000] relative text-white">
            金融基础术语
          </h2>
          <h2 className="relative text-intro-3-color text-[2.5rem] bottom-6 z-0">
            Financial basic terms
          </h2>
          <p className="bottom-7 relative text-sm text-white">
            提供金融术语的字典或词典，包括定义、使用场景和例子
          </p>
        </div>
        <div className="grid grid-cols-2 w-[57%] m-auto mt-0 mb-0 gap-3">
          <div className="border-[10px] border-solid border-white bg-econ-term bg-center bg-cover object-cover text-white p-5 gap-5 flex flex-col pt-20">
            <h2>流动比率 (Current Ratio)</h2>
            <p className="whitespace-pre-wrap text-sm text-left">
              流动比率是企业流动资产与流动负债的比率，反映企业偿还短期债务的能力。
              流动比率高表明企业在短期内有足够的资产来偿还短期负债，通常认为流动比率在2:1左右较为理想。
            </p>
          </div>
          <div className="border-[10px] border-solid border-white bg-econ-term bg-center bg-cover object-cover text-white p-5 gap-5 flex flex-col pt-20">
            <h2>流动比率 (Current Ratio)</h2>
            <p className="whitespace-pre-wrap text-sm text-left">
              流动比率是企业流动资产与流动负债的比率，反映企业偿还短期债务的能力。
              流动比率高表明企业在短期内有足够的资产来偿还短期负债，通常认为流动比率在2:1左右较为理想。
            </p>
          </div>
        </div>
        <Link
          href="#"
          className="no-underline text-white pt-2 pb-2 pr-12 pl-12 border-solid border-[1.5px] border-white w-[fit-content] ml-auto mr-auto mt-16"
        >
          更多
        </Link>
      </div>
      <div className="bg-intro-4 w-full h-[60rem] bg-cover bg-center flex flex-col text-center pt-[5rem]">
        <div className="relative">
          <h2 className="text-3xl z-[1000] relative">最新文章</h2>
          <h2 className="relative text-intro-4-color text-[3rem] bottom-10 z-0">
            Latest article
          </h2>
          <p className="bottom-11 relative text-sm">
            金融市场动态、基础知识文章和深入分析
          </p>
        </div>
        <div className="grid grid-cols-2 grid-rows-2 w-[60%] m-auto mt-0 mb-0 gap-8">
          <Link
            href="#"
            className="flex flex-col bg-white p-4 gap-3 border-solid border-intro-4-stroke border-[1.5px] h-[22rem] hover:shadow-2xl transition-shadow duration-300 no-underline text-black"
          >
            <img
              src="https://picsum.photos/id/277/800/560"
              alt="pic1"
              width="100%"
              height="70%"
              className="object-cover self-center"
            />
            <h2 className="text-lg text-left font-[500]">
              英伟达拆股在即！什么意思？英伟达拆股在即！什么意思？英伟达拆股在即！什么意思？
            </h2>
            <p className="text-left text-gray-400 text-xs">
              2024-06-01 20:18:18
            </p>
          </Link>
          <Link
            href="#"
            className="flex flex-col bg-white p-4 gap-3 border-solid border-intro-4-stroke border-[1.5px] h-[22rem] hover:shadow-2xl transition-shadow duration-300 no-underline text-black"
          >
            <img
              src="https://picsum.photos/id/277/800/560"
              alt="pic1"
              width="100%"
              height="70%"
              className="object-cover self-center"
            />
            <h2 className="text-lg text-left font-[500]">
              英伟达拆股在即！什么意思？英伟达拆股在即！什么意思？英伟达拆股在即！什么意思？
            </h2>
            <p className="text-left text-gray-400 text-xs">
              2024-06-01 20:18:18
            </p>
          </Link>
          <Link
            href="#"
            className="flex flex-col bg-white p-4 gap-3 border-solid border-intro-4-stroke border-[1.5px] h-[22rem] hover:shadow-2xl transition-shadow duration-300 no-underline text-black"
          >
            <img
              src="https://picsum.photos/id/277/800/560"
              alt="pic1"
              width="100%"
              height="70%"
              className="object-cover self-center"
            />
            <h2 className="text-lg text-left font-[500]">
              英伟达拆股在即！什么意思？英伟达拆股在即！什么意思？英伟达拆股在即！什么意思？
            </h2>
            <p className="text-left text-gray-400 text-xs">
              2024-06-01 20:18:18
            </p>
          </Link>
          <Link
            href="#"
            className="flex flex-col bg-white p-4 gap-3 border-solid border-intro-4-stroke border-[1.5px] h-[22rem] hover:shadow-2xl transition-shadow duration-300 no-underline text-black"
          >
            <img
              src="https://picsum.photos/id/277/800/560"
              alt="pic1"
              width="100%"
              height="70%"
              className="object-cover self-center"
            />
            <h2 className="text-lg text-left font-[500]">
              英伟达拆股在即！什么意思？英伟达拆股在即！什么意思？英伟达拆股在即！什么意思？
            </h2>
            <p className="text-left text-gray-400 text-xs">
              2024-06-01 20:18:18
            </p>
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
