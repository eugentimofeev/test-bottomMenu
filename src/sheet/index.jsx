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

const snapPoints = (windowHeight) => [88, windowHeight / 2, windowHeight - 32];
const defaultSnapPoint = 88;

const getSnaps = (snapPoints, windowHeight) => {
  if (typeof snapPoints === "function") {
    return snapPoints(windowHeight);
  }

  return snapPoints;
};

const getDefaultSnap = (defaultSnapPoint, windowHeight) => {
  if (typeof defaultSnapPoint === "function") {
    return defaultSnapPoint(windowHeight);
  }

  return defaultSnapPoint;
};

const snapValueToTransformValue = (snapValue, maxSnap) => {
  return maxSnap - snapValue;
};

export const Sheet = forwardRef(function Sheet({ children }, ref) {
  const windowHeight = useWindowHeight();
  const snaps = getSnaps(snapPoints, windowHeight);
  const defaultSnap = getDefaultSnap(defaultSnapPoint, windowHeight);

  const maxSnap = Math.max(...snaps);
  const minSnap = Math.min(...snaps);

  const defaultTranformValue = snapValueToTransformValue(defaultSnap, maxSnap);
  const minTransformValue = maxSnap - minSnap;
  const initialYRef = useRef(0);
  const offsetYRef = useRef(defaultTranformValue);
  const currentYRef = useRef(0);
  const scrollContainerRef = useRef(null);
  const blockDragRef = useRef(false);

  const y = useMotionValue(defaultTranformValue);

  const touchStartPosY = useRef(0);
  const touchStartTime = useRef(0);

  const [currentSnap, setCurrentSnap] = useState(defaultSnap);
  const isMaxSnap = currentSnap === maxSnap;

  const snapTo = (snap) => {
    const transformValue =
      typeof snap === "function"
        ? snapValueToTransformValue(snap(windowHeight, maxSnap))
        : snapValueToTransformValue(snap, maxSnap);

    offsetYRef.current = transformValue;
    animate(y, transformValue, { duration: 0.2 });
  };

  const toNearestSnap = (direction, speed) => {
    const currentSnapIndex = snaps.findIndex((snap) => snap === currentSnap);

    if (direction === 1 && currentSnapIndex === snaps.length - 1) {
      return;
    }

    if (direction === -1 && currentSnapIndex === 0) {
      return;
    }

    if (direction === 1 && speed > 0.9) {
      setCurrentSnap(maxSnap);
      snapTo(maxSnap);

      return;
    }

    if (direction === -1 && speed > 0.9) {
      setCurrentSnap(minSnap);
      snapTo(minSnap);

      return;
    }

    const newSnap =
      direction > 0
        ? snaps.at(currentSnapIndex + 1)
        : snaps.at(currentSnapIndex - 1);

    setCurrentSnap(newSnap);
    snapTo(newSnap);
  };

  const onTouchStart = (event) => {
    // if (blockDragRef.current) {
    //   return;
    // }

    if (scrollContainerRef.current.scrollTop !== 0 && isMaxSnap) {
      blockDragRef.current = true;
      return;
    }

    blockDragRef.current = false;
    touchStartTime.current = new Date().getTime();
    touchStartPosY.current = event.touches[0].clientY;
    initialYRef.current = event.touches[0].clientY - offsetYRef.current;
  };

  const onTouchEnd = (event) => {
    if (blockDragRef.current) {
      return;
    }

    const touchEndTime = new Date().getTime();
    const touchEndPosY = event.changedTouches[0].clientY;
    const direction = touchStartPosY.current > touchEndPosY ? 1 : -1;
    const speed =
      Math.abs(touchEndPosY - touchStartPosY.current) /
      (touchEndTime - touchStartTime.current);

    toNearestSnap(direction, speed);

    initialYRef.current = currentYRef.current;
  };

  const onTouchMove = (event) => {
    const diff = Math.abs(touchStartTime.current - new Date().getTime());

    if (diff < 50) {
      return;
    }

    if (blockDragRef.current) {
      return;
    }

    if (scrollContainerRef.current.scrollTop !== 0 && isMaxSnap) {
      blockDragRef.current = true;
      return;
    }

    currentYRef.current = event.touches[0].clientY - initialYRef.current;

    if (currentYRef.current <= 0) {
      offsetYRef.current = 0;
      y.set(0);

      return;
    }

    if (currentYRef.current >= minTransformValue) {
      offsetYRef.current = minTransformValue;
      y.set(minTransformValue);

      return;
    }

    offsetYRef.current = currentYRef.current;
    y.set(currentYRef.current);
  };

  const onScrollCapture = (event) => {
    const target = event.target;

    if (target === scrollContainerRef.current) {
      return;
    }

    blockDragRef.current = true;
  };

  return (
    <SheetPortal>
      <motion.div
        className={styles.content}
        style={{ height: maxSnap, y }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchMove={onTouchMove}
        onScrollCapture={onScrollCapture}
      >
        <div className={styles.header} />

        <div
          ref={scrollContainerRef}
          className={styles.section}
          style={{ overflowY: isMaxSnap ? "scroll" : "hidden" }}
        >
          {children}
        </div>
      </motion.div>
    </SheetPortal>
  );
});
