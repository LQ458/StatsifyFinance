"use client";
import React from "react";
import styles from "../src/css/side-nav.module.css";

interface NavItem {
  _id: string;
  title: string;
}

interface ChildComponentProps {
  currentNav: string;
  navItems: NavItem[];
  onItemClick: (id: string) => void;
}

const sideNav: React.FC<ChildComponentProps> = ({
  currentNav,
  navItems,
  onItemClick,
}) => {
  return (
    <div className={`${styles["sub-nav"]}`}>
      <ul>
        {navItems &&
          navItems.map((item, idx) => (
            <React.Fragment key={idx}>
              <li className={`${currentNav === item._id && styles["active"]}`}>
                <button
                  onClick={() => onItemClick(item._id)}
                  type="button"
                  className="text-white w-full"
                >
                  {item.title}
                </button>
              </li>
            </React.Fragment>
          ))}
      </ul>
    </div>
  );
};

export default sideNav;
