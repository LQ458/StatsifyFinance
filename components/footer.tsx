import React from "react";
import styles from "../css/footer.module.css";

const Footer = () => {
  return (
    <div className="bg-footer-color w-[100%] grid grid-cols-2 justify-center align-middle pt-8 pb-8">
      <div className="text-white m-[auto] gap-3 flex flex-col text-footer-font">
        <h4 className="text-[1.2em]">Contact Us:</h4>
        <p>Email: example@eg.com</p>
        <p>WeChat: StatsifyFinance</p>
      </div>
      <div className="text-center justify-center flex m-[auto] text-footer-font">
        <p className="text-grey-color">
          @ 2024 StatsifyFinance. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
