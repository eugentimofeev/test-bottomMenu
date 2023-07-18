import React from 'react';
import { useRef, useState } from 'react';
import './styles.module.css';

import Sheet from './sheet';

import styles from './styles.module.css';

const minSnap = 88;
const maxSnap = 32;
const getSnapPoints = (maxHeight) => [
  minSnap,
  maxHeight / 2.866,
  maxHeight - maxSnap,
];

export default function App() {
  const [isScrollBlock, setIsScrollBlock] = useState(false);
  const sheetRef = useRef(null);

  return (
    <>
      <div className={styles.map}>map</div>

      <Sheet
        snapPoints={getSnapPoints}
        defaultSnap={(maxHeight) => maxHeight / 2}
        ref={sheetRef}
      >
        <div className={styles.sheetContainer}>
          <div className={styles.isScrollBlock}>
            <label htmlFor="isScrollBlock">isScrollBlock: </label>
            <input
              id="isScrollBlock"
              type="checkbox"
              checked={isScrollBlock}
              onChange={({ target: { checked } }) => setIsScrollBlock(checked)}
            />
          </div>

          <div
            className={isScrollBlock ? styles.scrollBlock : styles.defailtBlock}
          >
            {isScrollBlock ? 'scrollBlock' : 'defaultBlock'}
          </div>
        </div>
      </Sheet>
    </>
  );
}
