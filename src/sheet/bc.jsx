import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";

import { SheetPortal } from "./portal";
import styles from "./styles.module.css";
import useWindowHeight from "./useWindowHeight";

const getClosestSnap = (goal, snaps) => {
  return snaps.reduce((prev, curr) => {
    return Math.abs(curr - Math.abs(goal)) < Math.abs(prev - Math.abs(goal))
      ? curr
      : prev;
  });
};

export const Sheet = forwardRef(function Sheet(
  {
    children,
    snapPoints,
    defaultSnap,
    onDrag,
    onDragEnd,
    onDragStart,
    overlay,
    onPositionChange,
  },
  ref
) {
  const scrollContainerRef = useRef(null)
  const windowHeight = useWindowHeight();
  const y = useMotionValue(0);
  const snaps = useMemo(
    () => snapPoints(windowHeight),
    [snapPoints, windowHeight]
  );
  const maxSnap = useMemo(() => Math.max(...snaps), [snaps]);
  const minSnap = useMemo(() => Math.min(...snaps), [snaps]);
  const defaultSnapValue = useMemo(
    () =>
      typeof defaultSnap === "number"
        ? -defaultSnap
        : -defaultSnap(windowHeight),
    [windowHeight, defaultSnap]
  );

  const [currentSnap, setCurrentSnap] = useState(Math.abs(defaultSnapValue));
  const isMaxSnap = currentSnap === maxSnap

  const dragStyles = useMemo(
    () => ({
      height: maxSnap,
      bottom: -maxSnap,
      y,
    }),
    [maxSnap, y]
  );

  const dragConstraints = useMemo(
    () => ({
      top: -maxSnap,
      bottom: -minSnap,
    }),
    [maxSnap, minSnap]
  );

  const dragInitial = useMemo(
    () => ({
      y: defaultSnapValue,
    }),
    [defaultSnapValue]
  );

  const snapTo = useCallback(
    (to) => {
      if (typeof to === "function") {
        const span = to(windowHeight);

        animate(y, -span, {});
        setCurrentSnap(span)

        return;
      }

      animate(y, -to, {});
      setCurrentSnap(to)
    },
    [windowHeight, y]
  );

  const _onDragStart = (event, data) => {
    console.log('_onDragStart');

    if (typeof onDragStart === "function") {
      onDragStart({ event, data });
    }
  };

  const _onDragEnd = (event, data) => {
    console.log('_onDragEnd', event.type);

    if (data.velocity.y > 1000) {
      snapTo(minSnap);

      if (typeof onDragEnd === "function") {
        onDragEnd({ event, closest: minSnap, snaps, data });
      }

      return;
    }

    if (data.velocity.y < -1000) {
      snapTo(maxSnap);

      if (typeof onDragEnd === "function") {
        onDragEnd({ event, closest: maxSnap, snaps, data });
      }

      return;
    }

    const goal = y.get();
    const closest = getClosestSnap(goal, snaps);

    snapTo(closest);

    if (typeof onDragEnd === "function") {
      onDragEnd({ event, closest, snaps, data });
    }
  };

  const _onDrag = (event, data) => {
    const currentY = Math.abs(y.get());

    if (typeof onDrag === "function") {
      onDrag({ event, data, currentY, snaps });
    }
  };

  const onOverlayClick = () => {
    snapTo(minSnap);
  };

  useMotionValueEvent(y, "change", (position) => {
    if (typeof onPositionChange === "function") {
      onPositionChange({ position: Math.abs(position), snaps });
    }
  });

  useEffect(() => {
    ref.current = { snapTo };
  }, [y, ref, windowHeight, snapTo]);

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
            variants={{
              visible: { opacity: 1 },
              hidden: { opacity: 0 },
            }}
            transition={{
              ease: "linear",
              duration: 0.2,
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        className={styles.content}
        drag="y"
        key={windowHeight}
        style={dragStyles}
        onDragEnd={_onDragEnd}
        onDragStart={_onDragStart}
        onDrag={_onDrag}
        initial={dragInitial}
        dragConstraints={dragConstraints}
        dragDirectionLock
      >
        <div className={styles.header} />

        <div 
          className={styles.section}
          ref={scrollContainerRef}
          style={{ overflowY: isMaxSnap ? "scroll" : "hidden" }}
        >
          {children}
        </div>
      </motion.div>
    </SheetPortal>
  );
});
