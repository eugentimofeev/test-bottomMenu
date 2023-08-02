import { createContext, useRef, useState } from "react";

import classNames from "classnames";
import { useMotionValueEvent, useMotionValue } from "framer-motion";

import styles from "./styles.module.css";

const scrollHiddenValue = 150;

const getHeaderClassName = (hidden, notTop) =>
  classNames(styles.header, {
    [styles.headerVisible]: !hidden,
    [styles.hederHidden]: hidden,
    [styles.headerNotTop]: notTop && !hidden,
  });

export const BottomMenuLayoutContext = createContext();

export const BottomMenuLayout = ({ children, sheetData }) => {
  const latestScrollY = useRef(0);
  const [hidden, setHidden] = useState(false);
  const [notTop, setNotTop] = useState(false);
  const { scrollY } = sheetData;
  const m = useMotionValue(0);

  useMotionValueEvent(scrollY ?? m, "change", (current) => {
    const last = scrollY.getPrevious();
    const latest = latestScrollY.current;
    // из-за динамического добавления эл-ов в контейнер со скролом, направление скрола считаем по двум парам
    const isDirectionDown = last <= current && latest <= last;
    const isNotTop = current > scrollHiddenValue;

    setNotTop(isNotTop);
    setHidden(isNotTop && isDirectionDown);

    latestScrollY.current = last;
  });

  return (
    <BottomMenuLayoutContext.Provider value={null}>
      <header className={getHeaderClassName(hidden, notTop)}>
        <div className={styles.search}>search</div>

        <div className={styles.tabs}>
          {[...new Array(5)].map((_v, index) => (
            <div className={styles.tab} key={index}>
              {index}
            </div>
          ))}
        </div>
      </header>

      {children}
    </BottomMenuLayoutContext.Provider>
  );
};
