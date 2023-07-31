import { AnimatePresence, motion } from "framer-motion";

import styles from "./styles.module.css";

const variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const transition = {
  ease: "linear",
  duration: 0.2,
};

export const TopMenu = ({ hidden = false }) => {
  return (
    <AnimatePresence initial={false}>
      {!hidden && (
        <motion.div
          className={styles.topMenu}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={variants}
          transition={transition}
        >
          <div className={styles.w}>W</div>

          <div className={styles.g}>G</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
