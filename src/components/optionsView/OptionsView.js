"use client";

import styles from "./optionsView.module.css";

const OptionsView = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Options Menu</h1>
      <div className={styles.buttonContainer}>
        <button className={styles.button}>Simulation Mode</button>
        <button className={styles.button}>Execution Mode</button>
      </div>
    </div>
  );
};

export default OptionsView;
