"use client";

import { useState, useEffect } from "react";
import ChatView from "@/components/chatView/ChatView";
import NavigationView from "@/components/navigationView/NavigationView";
import OptionsView from "@/components/optionsView/OptionsView";
import styles from "./infotainmentScreen.module.css";

const InfotainmentScreen = () => {
  const [time, setTime] = useState("--:--");
  const [currentView, setCurrentView] = useState("navigation");

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
            <ChatView /> <NavigationView isFullScreen={false} />
          </>
        )}
        {currentView === "navigation" && <NavigationView isFullScreen={true} />}
        {currentView === "options" && <OptionsView />}
      </div>

      {/* Bottom Icons */}
      <div className={styles.bottomIcons}>
        <span
          className="material-icons"
          onClick={() => setCurrentView("options")}
        >
          grid_view
        </span>
        <span
          className="material-icons"
          onClick={() => setCurrentView("navigation")}
        >
          explore
        </span>
        <span className="material-icons">call</span>
        <span className="material-icons">directions_car</span>
        <span className="material-icons" onClick={() => setCurrentView("chat")}>
          mic
        </span>
      </div>
    </div>
  );
};

export default InfotainmentScreen;
