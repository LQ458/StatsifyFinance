import React from "react";
import styles from "../css/footer.module.css";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

type PositionType = "relative" | "fixed" | "absolute";

interface FooterProps {
  position: PositionType;
}

const Footer: React.FC<FooterProps> = ({ position }) => {
  const t = useTranslations("footer");

  return (
    <div
      className={`bg-footer-color w-[100%] min-w-[1100px] h-[60px] border-t border-topbar-border-color ${position} flex-grow-0 flex-shrink-0 ss-footer`}
    >
      <div className="flex justify-between max-w-[1920px] min-w-[1100px] mx-auto h-[100%] px-[60px] ss-footer-inner">
        <div className="text-footer-tcolor self-center text-[12px]">
          <p>{t("copyright")}</p>
        </div>
        <div className="grid grid-cols-5 self-center gap-[10px] text-footer-font">
          <Link href="https://weibo.com">
            <Image
              src="/weibo.svg"
              width={28}
              height={28}
              alt={t("social.weibo")}
            />
          </Link>
          <Link href="https://twitter.com">
            <Image
              src="/twitter.svg"
              width={28}
              height={28}
              alt={t("social.twitter")}
            />
          </Link>
          <Link href="https://facebook.com">
            <Image
              src="/facebook.svg"
              width={28}
              height={28}
              alt={t("social.facebook")}
            />
          </Link>
          <Link href="https://weixin.qq.com">
            <Image
              src="/weChat.svg"
              width={28}
              height={28}
              alt={t("social.wechat")}
            />
          </Link>
          <Link href="https://linkedin.com">
            <Image
              src="/linkedin.svg"
              width={28}
              height={28}
              alt={t("social.linkedin")}
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;
