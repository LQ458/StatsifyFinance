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
      </div>
      <Footer />
    </main>
  );
}
