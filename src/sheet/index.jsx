import { useCallback, useEffect, useRef, useState } from "react";

import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";

import { SheetPortal } from "./portal";
import styles from "./styles.module.css";
import useWindowHeight from "./useWindowHeight";

const maxSpeed = 2;
const touchMoveDelay = 70;
const overlayVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};
const overlayTransition = {
  ease: "linear",
  duration: 0.2,
};

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

const getClosestSnap = (snap, snaps) => {
  return snaps.reduce((prev, curr) => {
    return Math.abs(curr - Math.abs(snap)) < Math.abs(prev - Math.abs(snap))
      ? curr
      : prev;
  });
};

const tranfromSnapValue = (snapValue, maxSnap) => {
  return maxSnap - snapValue;
};

export const Sheet = ({
  snapPoints,
  defaultSnapPoint,
  overlay,
  onPositionChange,
  setSheetData,
  children,
}) => {
  const windowHeight = useWindowHeight();

  const snaps = getSnaps(snapPoints, windowHeight);
  const defaultSnap = getDefaultSnap(defaultSnapPoint, windowHeight);
  const maxSnap = Math.max(...snaps);
  const minSnap = Math.min(...snaps);

  const [currentSnap, setCurrentSnap] = useState(defaultSnap);
  const defaultTranformValue = tranfromSnapValue(defaultSnap, maxSnap);
  const minTransformValue = maxSnap - minSnap;
  const isMaxSnap = currentSnap === maxSnap;

  const scrollContainerRef = useRef(null);
  const initialYRef = useRef(0);
  const offsetYRef = useRef(defaultTranformValue);
  const currentYRef = useRef(0);
  const prevCurrentYRef = useRef(0);
  const blockDragRef = useRef(false);
  const touchStartPosY = useRef(0);
  const touchStartTime = useRef(0);

  const y = useMotionValue(defaultTranformValue);
  const { scrollY } = useScroll({
    container: scrollContainerRef,
  });

  const snapTo = useCallback(
    (snap) => {
      const transformValue =
        typeof snap === "function"
          ? tranfromSnapValue(snap(windowHeight, maxSnap))
          : tranfromSnapValue(snap, maxSnap);

      setCurrentSnap(snap);
      offsetYRef.current = transformValue;
      animate(y, transformValue, { duration: 0.2 });
    },
    [y, windowHeight, maxSnap]
  );

  const toNearestSnap = (direction, speed, transformValue, diffY) => {
    const currentSnapIndex = snaps.findIndex((snap) => snap === currentSnap);

    if (direction === 1 && currentSnapIndex === snaps.length - 1) {
      snapTo(maxSnap);
      return;
    }

    if (direction === -1 && currentSnapIndex === 0) {
      snapTo(minSnap);
      return;
    }

    if (direction === 1 && speed > maxSpeed) {
      snapTo(maxSnap);

      return;
    }

    if (direction === -1 && speed > maxSpeed) {
      snapTo(minSnap);

      return;
    }

    const newSnap =
      diffY > 200
        ? getClosestSnap(tranfromSnapValue(transformValue, maxSnap), snaps)
        : direction > 0
        ? snaps.at(currentSnapIndex + 1)
        : snaps.at(currentSnapIndex - 1);

    snapTo(newSnap);
  };

  const onTouchStart = (event) => {
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
    const direction = prevCurrentYRef.current > currentYRef.current ? 1 : -1;
    const diffY = Math.abs(touchStartPosY.current - touchEndPosY);
    const speed =
      Math.abs(touchEndPosY - touchStartPosY.current) /
      (touchEndTime - touchStartTime.current);

    toNearestSnap(direction, speed, currentYRef.current, diffY);

    initialYRef.current = currentYRef.current;
  };

  const onTouchMove = (event) => {
    const speedDiff = Math.abs(touchStartTime.current - new Date().getTime());

    if (speedDiff < touchMoveDelay) {
      return;
    }

    if (blockDragRef.current) {
      return;
    }

    if (scrollContainerRef.current.scrollTop !== 0 && isMaxSnap) {
      blockDragRef.current = true;
      return;
    }

    prevCurrentYRef.current = currentYRef.current;
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

  const onOverlayClick = () => {
    snapTo(minSnap);
  };

  useMotionValueEvent(y, "change", (transformValue) => {
    if (typeof onPositionChange === "function") {
      onPositionChange({
        transformValue,
        snapValue: tranfromSnapValue(transformValue, maxSnap),
        snaps,
      });
    }
  });

  useEffect(() => {
    setSheetData({
      snapTo,
      scrollY,
    });
  }, [setSheetData, snapTo, scrollContainerRef, scrollY]);

  return (
    <SheetPortal>
      <AnimatePresence>
        {overlay && (
          <motion.div
            className={styles.overlay}
            onClick={onOverlayClick}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            transition={overlayTransition}
          />
        )}
      </AnimatePresence>

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
};
