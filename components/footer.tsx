import React from "react";
import styles from "../css/footer.module.css";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <div className="bg-footer-color w-[100%] grid grid-cols-2 pt-4 pb-4">
      <div className="text-footer-tcolor m-[auto] ml-14 text-footer-font">
        <p>© 2024 StatsifyFinance. All Rights Reserved.</p>
      </div>
      <div className="grid grid-cols-5 self-center gap-3 m-[auto] mr-14 text-footer-font">
        <Link href="https://weibo.com">
          <Image src="./weibo.svg" width={28} height={28} alt="Weibo" />
        </Link>
        <Link href="https://twitter.com">
          <Image src="./twitter.svg" width={28} height={28} alt="Twitter" />
        </Link>
        <Link href="https://facebook.com">
          <Image src="./facebook.svg" width={28} height={28} alt="Facebook" />
        </Link>
        <Link href="https://weixin.qq.com">
          <Image src="./weChat.svg" width={28} height={28} alt="WeChat" />
        </Link>
        <Link href="https://linkedin.com">
          <Image src="./linkedin.svg" width={28} height={28} alt="LinkedIn" />
        </Link>
      </div>
    </div>
  );
};

export default Footer;
