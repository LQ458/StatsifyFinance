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
          className="absolute bottom-[-4rem] h-[8rem] w-[60%] left-1/2 flex flex-row"
          style={{ transform: "translateX(-50%)" }}
        >
          <div className="inline-flex relative" style={{ flexGrow: "1" }}>
            <img src="./map-left.png" alt="left" className="bg-cover w-full" />
            <div
              className="absolute text-white text-2xl font-[600] text-right left-1/2 top-1/2"
              style={{ transform: "translate(-50%, -50%)" }}
            >
              <p>Vocabs</p>
              <p className="whitespace-nowrap">for the week</p>
            </div>
          </div>
          <div className="bg-white" style={{ flexGrow: "12" }}></div>
          <div className="bg-gray-300" style={{ flexGrow: "0.1" }} />
          <div className="bg-white" style={{ flexGrow: "12" }}></div>
          <div className="inline-flex" style={{ flexGrow: "0.3" }}>
            <img
              src="./map-right.png"
              alt="right"
              className="bg-cover w-full"
            />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
