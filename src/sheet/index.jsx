import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useDragControls,
} from "framer-motion";

import { SheetPortal } from "./portal";
import styles from "./styles.module.css";
import useWindowHeight from "./useWindowHeight";

const maxSnap = 835; // === 0 translate
const minSnap = 32; // == ?? translate

export const Sheet = forwardRef(function Sheet({ children }, ref) {
  const dragContainerRef = useRef(null);
  const y = useMotionValue(10);

  const initialYRef = useRef(0);
  const offsetYRef = useRef(0);
  const currentYRef = useRef(0);

  //canSroll = true if currentSnap = maxSnap
  const canSroll = false;

  const onTouchStart = (event) => {
    initialYRef.current = event.touches[0].clientY - offsetYRef.current;
  };

  const onTouchEnd = () => {
    initialYRef.current = currentYRef.current;
  };

  const onTouchMove = (event) => {
    currentYRef.current = event.touches[0].clientY - initialYRef.current;
    offsetYRef.current = currentYRef.current;

    y.set(currentYRef.current);
  };

  return (
    <SheetPortal>
      <motion.div
        ref={dragContainerRef}
        className={styles.content}
        style={{ height: 835, y }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchMove={onTouchMove}
      >
        <div className={styles.header} />

        <div className={styles.section} style={{ overflowY: "hidden" }}>
          {children}
        </div>
      </motion.div>
    </SheetPortal>
  );
});
