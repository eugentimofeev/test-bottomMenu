import React from "react";
import "./styles.module.css";

import { BottomMenu } from "./bottomMenu";

import styles from "./styles.module.css";

export default function App() {
  return (
    <>
      <div className={styles.map}>map</div>

      <BottomMenu />
    </>
  );
}
