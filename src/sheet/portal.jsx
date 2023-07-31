import { useState } from "react";

import { createPortal } from "react-dom";

import styles from "./styles.module.css";

export const SheetPortal = ({ children }) => {
  const [sheetPortal] = useState(() => {
    const portal = document.querySelector(`.${styles.sheetPortal}`);
    if (portal) return portal;

    const newPortal = document.createElement("div");
    newPortal.classList.add(styles.sheetPortal);
    document.body.appendChild(newPortal);

    return newPortal;
  });

  return createPortal(
    <div className={styles.container}>{children}</div>,
    sheetPortal
  );
};
