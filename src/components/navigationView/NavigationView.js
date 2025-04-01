"use client";

import React, { useRef, useEffect, useState } from "react";
import { useVideoContext } from "@/context/VideoProvider";
import dynamic from "next/dynamic";
import styles from "./navigationView.module.css";

const Spinner = dynamic(
  () => import("@leafygreen-ui/loading-indicator").then((mod) => mod.Spinner),
  {
    ssr: false,
  }
);

const NavigationView = ({
  isFullScreen,
  isPlaying,
  setIsPlaying,
  currentTime,
  setCurrentTime,
  isRecalculating,
}) => {
  const { fullScreenVideo, sharedScreenVideo } = useVideoContext();
  const fullScreenVideoRef = useRef(null);
  const sharedScreenVideoRef = useRef(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isRecalculating && !isLoading) {
      fullScreenVideoRef.current.pause();
      sharedScreenVideoRef.current.pause();
      setIsLoading(true);
    } else if (!isRecalculating && isLoading) {
      fullScreenVideoRef.current.play();
      sharedScreenVideoRef.current.play();
      setIsLoading(false);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    }
  }, [isRecalculating, isLoading]);

  const handleStartNavigation = () => {
    setIsPlaying(true);
    fullScreenVideoRef.current.play();
    sharedScreenVideoRef.current.play();
  };

  const handleEndNavigation = () => {
    setIsPlaying(false);
    setCurrentTime(0); // Reset time
    fullScreenVideoRef.current.currentTime = 0;
    sharedScreenVideoRef.current.currentTime = 0;
    fullScreenVideoRef.current.pause();
    sharedScreenVideoRef.current.pause();
  };

  return (
    <div className={styles.videoContainer}>
      <video
        ref={fullScreenVideoRef}
        src={fullScreenVideo}
        className={`${styles.video} ${
          isFullScreen ? styles.active : styles.hidden
        }`}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={() => {
          fullScreenVideoRef.current.currentTime = currentTime;
          if (isPlaying) fullScreenVideoRef.current.play();
        }}
        onEnded={() => {
          fullScreenVideoRef.current.currentTime = 0;
          fullScreenVideoRef.current.play();
        }}
      />

      <video
        ref={sharedScreenVideoRef}
        src={sharedScreenVideo}
        className={`${styles.video} ${
          !isFullScreen ? styles.active : styles.hidden
        }`}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={() => {
          sharedScreenVideoRef.current.currentTime = currentTime;
          if (isPlaying) sharedScreenVideoRef.current.play();
        }}
        onEnded={() => {
          sharedScreenVideoRef.current.currentTime = 0;
          sharedScreenVideoRef.current.play();
        }}
      />

      {isRecalculating && (
        <div className={styles.overlay}>
          <Spinner size={40} description="Recalculating route..." />
        </div>
      )}

      {showSuccessMessage && (
        <div className={styles.notification}>New stop added to your route</div>
      )}

      {isFullScreen ? (
        !isPlaying ? (
          <button
            className={styles.startButton}
            onClick={handleStartNavigation}
          >
            Start Navigation
          </button>
        ) : (
          <button className={styles.endButton} onClick={handleEndNavigation}>
            End Navigation
          </button>
        )
      ) : (
        <></>
      )}
    </div>
  );
};

export default NavigationView;
