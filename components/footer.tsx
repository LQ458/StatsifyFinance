import React from "react";
import styles from "../css/footer.module.css";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <div className="bg-footer-color w-[100%] grid grid-cols-2 justify-center align-middle pt-8 pb-8">
      <div className="text-white m-[auto] gap-3 flex flex-col text-footer-font">
        <h4 className="text-[1.2em]">Contact Us:</h4>
        <p>Email: example@eg.com</p>
        <p>WeChat: StatsifyFinance</p>
      </div>
      <div className="text-center justify-center flex flex-col m-[auto] text-footer-font gap-3">
        <div className="grid grid-cols-5 self-center gap-4">
          <Link href="https://weibo.com">
            <Image src="./weibo.svg" width={34} height={34} alt="Weibo" />
          </Link>
          <Link href="https://twitter.com">
            <Image src="./twitter.svg" width={34} height={34} alt="Twitter" />
          </Link>
          <Link href="https://facebook.com">
            <Image src="./facebook.svg" width={34} height={34} alt="Facebook" />
          </Link>
          <Link href="https://weixin.qq.com">
            <Image src="./weChat.svg" width={34} height={34} alt="WeChat" />
          </Link>
          <Link href="https://linkedin.com">
            <Image src="./linkedin.svg" width={34} height={34} alt="LinkedIn" />
          </Link>
        </div>
        <p className="text-grey-color">
          @ 2024 StatsifyFinance. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
