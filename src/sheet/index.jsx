import React from 'react';
import { forwardRef, useEffect, useMemo } from 'react';

import {
  animate,
  motion,
  useDragControls,
  useMotionValue,
} from 'framer-motion';
import { createPortal } from 'react-dom';

import styles from './styles.module.css';
import useWindowHeight from './useWindowHeight';

const getClosestSnap = (goal, snaps) => {
  return snaps.reduce((prev, curr) => {
    return Math.abs(curr - Math.abs(goal)) < Math.abs(prev - Math.abs(goal))
      ? curr
      : prev;
  });
};

const Sheet = forwardRef(function Sheet(
  {
    children,
    snapPoints,
    defaultSnap,
    onDragEvent,
    onDragEventEnd,
    onDragEventStart,
  },
  ref
) {
  const windowHeight = useWindowHeight();
  const y = useMotionValue(0);
  const dragControls = useDragControls();
  const snaps = useMemo(
    () => snapPoints(windowHeight),
    [snapPoints, windowHeight]
  );
  const maxSnap = useMemo(() => Math.max(...snaps), [snaps]);
  const minSnap = useMemo(() => Math.min(...snaps), [snaps]);
  const defaultSnapValue = useMemo(
    () =>
      typeof defaultSnap === 'number'
        ? -defaultSnap
        : -defaultSnap(windowHeight),
    [windowHeight, defaultSnap]
  );

  const dragStyles = {
    height: maxSnap,
    bottom: -maxSnap,
    y,
  };

  const dragConstraints = {
    top: -maxSnap,
    bottom: -minSnap,
  };

  const dragInitial = {
    y: defaultSnapValue,
  };

  //todo: change?
  // const onPointerDown = (event) => {
  //     dragControls.start(event);
  // };

  const onDragEnd = (event, { velocity }) => {
    if (velocity.y > 1000) {
      animate(y, -minSnap, {});

      if (typeof onDragEventEnd === 'function') {
        onDragEventEnd({ event, closest: minSnap, snaps });
      }

      return;
    }

    if (velocity.y < -1000) {
      animate(y, -maxSnap, {});

      if (typeof onDragEventEnd === 'function') {
        onDragEventEnd({ event, closest: maxSnap, snaps });
      }

      return;
    }

    const goal = y.get();
    const closest = getClosestSnap(goal, snaps);

    animate(y, -closest, {});

    if (typeof onDragEventEnd === 'function') {
      onDragEventEnd({ event, closest, snaps });
    }
  };

  const onDragStart = (event, data) => {
    if (typeof onDragEventStart === 'function') {
      onDragEventStart(event, data);
    }
  };

  const onDrag = (event, data) => {
    if (typeof onDragEvent === 'function') {
      onDragEvent(event, data);
    }
  };

  useEffect(() => {
    const snapTo = (snap) => {
      if (typeof snap === 'number') {
        animate(y, -snap, {});
        return;
      }

      animate(y, -snap(windowHeight), {});
    };

    ref.current = { snapTo };
  }, [y, ref, windowHeight]);

  return createPortal(
    <sheet-portal>
      <div className={styles.container}>
        <motion.div
          className={styles.content}
          drag="y"
          key={windowHeight}
          style={dragStyles}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          onDrag={onDrag}
          dragControls={dragControls}
          initial={dragInitial}
          dragConstraints={dragConstraints}
          // dragListener={false}
        >
          <div
            className={styles.header}
            // onPointerDown={onPointerDown}
          />

          <div className={styles.section}>{children}</div>
        </motion.div>
      </div>
    </sheet-portal>,
    document.body
  );
});

export default Sheet;
