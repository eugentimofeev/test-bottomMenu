import { createContext, useCallback, useRef, useState } from "react";

import { Sheet } from "../sheet";
import { HomeBottomMenu } from "../homeBottomMenu";
import { BottomMenuLayout } from "../bottomMenuLayout";
import { TopMenu } from "../topMenu";

const minSnap = 88;
const maxSnap = 32;

const getSnapPoints = (maxHeight) => [
  minSnap,
  maxHeight / 2.866,
  maxHeight - maxSnap,
];

const getMaxSnap = (maxHeight) => maxHeight - maxSnap;

export const BottomMenuContext = createContext();

export const BottomMenu = () => {
  const bottomSheetRef = useRef(null);
  const [isMaxSnap, setIsMaxSnap] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const snapToMax = () => {
    bottomSheetRef.current?.snapTo(getMaxSnap);
  };

  const onPositionChange = ({ position, snaps }) => {
    const maxSnap = Math.max(...snaps);

    if (position + 100 >= maxSnap) {
      setIsMaxSnap(true);
    } else {
      setIsMaxSnap(false);
    }
  };

  const contextValue = {
    isMaxSnap,
    isDragging,
    snapToMax,
  };

  return (
    <BottomMenuContext.Provider value={contextValue}>
      <Sheet
        ref={bottomSheetRef}
        snapPoints={getSnapPoints}
        defaultSnap={minSnap}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        overlay={isMaxSnap}
        onPositionChange={onPositionChange}
      >
        <TopMenu hidden={isMaxSnap} />

        <BottomMenuLayout>
          <HomeBottomMenu />
        </BottomMenuLayout>
      </Sheet>
    </BottomMenuContext.Provider>
  );
};
