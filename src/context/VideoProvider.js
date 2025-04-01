"use client";

import { createContext, useContext, useEffect, useState } from "react";

const VideoContext = createContext(null);

export const VideoProvider = ({ children }) => {
  const [videoSources, setVideoSources] = useState({
    fullScreenVideo: null,
    sharedScreenVideo: null,
  });

  useEffect(() => {
    const loadVideos = async () => {
      if (typeof window === "undefined") return;

      const loadVideoBlob = async (src) => {
        const response = await fetch(src);
        const blob = await response.blob();
        return URL.createObjectURL(blob); // Convert to Blob URL
      };

      const fullScreenVideoBlob = await loadVideoBlob(
        "/videos/full-screen.mp4"
      );
      const sharedScreenVideoBlob = await loadVideoBlob(
        "/videos/shared-screen.mp4"
      );

      setVideoSources({
        fullScreenVideo: fullScreenVideoBlob,
        sharedScreenVideo: sharedScreenVideoBlob,
      });
    };

    loadVideos();

    return () => {
      if (videoSources.fullScreenVideo)
        URL.revokeObjectURL(videoSources.fullScreenVideo);
      if (videoSources.sharedScreenVideo)
        URL.revokeObjectURL(videoSources.sharedScreenVideo);
    };
  }, []);

  return (
    <VideoContext.Provider value={videoSources}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideoContext = () => useContext(VideoContext);
