import { useContext, useEffect, useRef } from "react";

import { BottomMenuContext } from "../bottomMenu";

export const useBottomMenuDragScrollPrevent = (targetRef) => {
  const touchStartPositionYRef = useRef(0);
  const touchStartPositionXRef = useRef(0);
  const { isMaxSnap } = useContext(BottomMenuContext);

  useEffect(() => {
    const element = targetRef.current;

    const onTouchStart = (event) => {
      touchStartPositionYRef.current = event.touches[0].clientY;
      touchStartPositionXRef.current = event.touches[0].clientX;
    };

    element?.addEventListener("touchstart", onTouchStart, {
      passive: false,
    });

    return () => {
      element?.removeEventListener("touchstart", onTouchStart);
    };
  }, [targetRef]);

  //Драг и скролл не работают вместе, поэтому отменяем евент скролла по условию
  useEffect(() => {
    const element = targetRef.current;

    const onTouchMove = (event) => {
      const touchPositionY = event.touches[0].clientY;
      const isScrollOnTop = targetRef.current.scrollTop === 0;
      const isDragDown = touchStartPositionYRef.current < touchPositionY;
      const isDragUp = touchStartPositionYRef.current > touchPositionY + 5;

      if (isDragDown && isScrollOnTop && event.cancelable) {
        event.preventDefault();
        return;
      }

      if (isDragUp && !isMaxSnap && event.cancelable) {
        event.preventDefault();
        return;
      }
    };

    element?.addEventListener("touchmove", onTouchMove, {
      passive: false,
    });

    return () => {
      element?.removeEventListener("touchmove", onTouchMove);
    };
  }, [isMaxSnap, targetRef]);

  return isMaxSnap;
};
