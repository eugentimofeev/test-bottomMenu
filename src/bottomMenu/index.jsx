import { createContext, useCallback, useRef, useState } from "react";

import { Sheet } from "../sheet";
import { HomeBottomMenu } from "../homeBottomMenu";
import { BottomMenuLayout } from "../bottomMenuLayout";
import { TopMenu } from "../topMenu";

const snapPoints = (windowHeight) => [88, windowHeight / 2, windowHeight - 32];
const defaultSnapPoint = 88;
const getMaxSnap = (windowHeight) => windowHeight - 32;

export const BottomMenuContext = createContext();

export const BottomMenu = () => {
  const bottomSheetRef = useRef(null);
  const [isMaxSnap, setIsMaxSnap] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [sheetData, setSheetData] = useState({});

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const snapToMax = () => {
    bottomSheetRef.current?.snapTo(getMaxSnap);
  };

  const onPositionChange = ({ snapValue, snaps }) => {
    const maxSnap = Math.max(...snaps);

    if (snapValue + 100 >= maxSnap) {
      setIsMaxSnap(true);
    } else {
      setIsMaxSnap(false);
    }
  };

  const contextValue = {
    isMaxSnap,
    isDragging,
    snapToMax,
    ...sheetData,
  };

  return (
    <BottomMenuContext.Provider value={contextValue}>
      <Sheet
        snapPoints={snapPoints}
        defaultSnapPoint={defaultSnapPoint}
        overlay={isMaxSnap}
        onPositionChange={onPositionChange}
        setSheetData={setSheetData}
      >
        <TopMenu hidden={isMaxSnap} />

        <BottomMenuLayout sheetData={sheetData}>
          <HomeBottomMenu />
        </BottomMenuLayout>
      </Sheet>
    </BottomMenuContext.Provider>
  );
};
