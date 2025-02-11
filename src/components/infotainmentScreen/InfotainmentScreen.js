"use client";

import { useState, useEffect } from "react";
import styles from "./infotainmentScreen.module.css";

const InfotainmentScreen = ({ children }) => {
  const [time, setTime] = useState("--:--");

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
      <div className={styles.content}>{children}</div>

      {/* Bottom Icons */}
      <div className={styles.bottomIcons}>
        <span className="material-icons">grid_view</span>
        <span className="material-icons">explore</span>
        <span className="material-icons">call</span>
        <span className="material-icons">directions_car</span>
        <span className="material-icons">mic</span>
      </div>
    </div>
  );
};

export default InfotainmentScreen;
