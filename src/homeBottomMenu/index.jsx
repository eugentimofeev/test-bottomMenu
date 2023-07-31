import styles from "./styles.module.css";

export const HomeBottomMenu = () => {
  return (
    <>
      <div className={styles.rowBlock}>
        <div className={styles.rowText1} style={{ marginLeft: 16 }} />

        <div className={styles.rows}>
          {[...new Array(10)].map((_v, index) => (
            <div key={index}>
              <div className={styles.rowImg1}>{index}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.rowBlock}>
        <div className={styles.rowText2} style={{ marginLeft: 16 }} />

        <div className={styles.rows}>
          {[...new Array(10)].map((_v, index) => (
            <div key={index}>
              <div className={styles.rowImg2}>{index}</div>
            </div>
          ))}
        </div>
      </div>

      {[...new Array(20)].map((_v, index) => (
        <div className={styles.colBlock} key={index}>
          <div className={styles.colImg}>{index}</div>

          <div className={styles.colText} />
        </div>
      ))}
    </>
  );
};
