"use client";
import React from "react";
import styles from "../src/css/side-nav.module.css";

interface NavItem {
  id: number;
  value: string;
}

interface ChildComponentProps {
  currentNav: number;
  navItems: NavItem[]; 
  onItemClick: (id: number) => void;
}


const sideNav : React.FC<ChildComponentProps> = ({currentNav, navItems, onItemClick}) => {
  return (
    <div className={`${styles["sub-nav"]}`}>
      <ul>
        {navItems &&
          navItems.map((item, idx) => (
            <React.Fragment key={idx}>
              <li
                className={`${currentNav === item.id && styles["active"]}`}
              >
                <button
                  onClick={() =>
                    onItemClick(item.id)
                  }  
                  type="button"
                  className="text-white w-full"
                >
                  {item.value}
                </button>
              </li>
            </React.Fragment>
          ))}
      </ul>
    </div>
  );
};

export default sideNav;
