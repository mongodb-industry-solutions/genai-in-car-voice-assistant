"use client";

import styles from "./optionsView.module.css";
import Button from "@leafygreen-ui/button";

const OptionsView = ({ simulationMode, setSimulationMode, setCurrentView }) => {
  const handleModeChange = (mode) => {
    setSimulationMode(mode);
    setCurrentView("navigation");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Options Menu</h1>
      <div className={styles.buttonContainer}>
        <Button
          className={styles.button}
          disabled={simulationMode}
          onClick={() => handleModeChange(true)}
        >
          Simulation Mode
        </Button>
        <Button
          className={styles.button}
          disabled={!simulationMode}
          onClick={() => handleModeChange(false)}
        >
          Execution Mode
        </Button>
      </div>
    </div>
  );
};

export default OptionsView;
