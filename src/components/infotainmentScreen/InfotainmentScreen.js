"use client";

import { useState, useEffect } from "react";
import ChatView from "@/components/chatView/ChatView";
import NavigationView from "@/components/navigationView/NavigationView";
import OptionsView from "@/components/optionsView/OptionsView";
import styles from "./infotainmentScreen.module.css";

const InfotainmentScreen = ({
  isPlaying,
  setIsPlaying,
  simulationMode,
  setSimulationMode,
}) => {
  const [time, setTime] = useState("--:--");
  const [currentView, setCurrentView] = useState("navigation");
  const [currentTime, setCurrentTime] = useState(0);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    const updateClock = () => {
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };

    updateClock(); // Set initial time
    const interval = setInterval(updateClock, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.frame}>
      {/* Top Left Icons */}
      <div className={styles.topLeft}>
        <span className="material-icons">signal_cellular_4_bar</span>
        <span className="material-icons">bluetooth</span>
        <span className="material-icons">near_me</span>
        <span className="material-icons">wifi</span>
      </div>

      {/* Top Center Clock */}
      <div className={styles.topCenter}>{time}</div>

      {/* Screen Content */}
      <div
        className={`${styles.content} ${
          currentView === "chat" ? styles.sharedScreen : styles.fullScreen
        }`}
      >
        {currentView === "chat" && (
          <>
            <ChatView
              setIsRecalculating={setIsRecalculating}
              setCurrentView={setCurrentView}
              simulationMode={simulationMode}
              selectedDevice={selectedDevice}
            />{" "}
            <NavigationView
              isFullScreen={false}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              currentTime={currentTime}
              setCurrentTime={setCurrentTime}
              isRecalculating={isRecalculating}
            />
          </>
        )}
        {currentView === "navigation" && (
          <NavigationView
            isFullScreen={true}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            currentTime={currentTime}
            setCurrentTime={setCurrentTime}
            isRecalculating={isRecalculating}
          />
        )}
        {currentView === "options" && (
          <OptionsView
            simulationMode={simulationMode}
            setSimulationMode={setSimulationMode}
            setCurrentView={setCurrentView}
            setSelectedDevice={setSelectedDevice}
          />
        )}
      </div>

      {/* Bottom Icons */}
      <div className={styles.bottomIcons}>
        <span
          className={`material-icons ${styles["clickable-icon"]}`}
          onClick={() => setCurrentView("options")}
        >
          grid_view
        </span>
        <span
          className={`material-icons ${styles["clickable-icon"]}`}
          onClick={() => setCurrentView("navigation")}
        >
          explore
        </span>
        <span className={`material-icons`}>call</span>
        <span className={`material-icons`}>directions_car</span>
        <span
          className={`material-icons ${styles["clickable-icon"]}`}
          onClick={() => setCurrentView("chat")}
        >
          mic
        </span>
      </div>
    </div>
  );
};

export default InfotainmentScreen;
