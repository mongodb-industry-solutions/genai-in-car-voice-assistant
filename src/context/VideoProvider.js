"use client";

import { createContext, useContext, useEffect, useState } from "react";

const VideoContext = createContext(null);

export const VideoProvider = ({ children }) => {
  const [videoSources, setVideoSources] = useState({
    fullScreenVideo: null,
    sharedScreenVideo: null,
  });

  useEffect(() => {
    let fullScreenVideoBlob = null;
    let sharedScreenVideoBlob = null;

    const loadVideos = async () => {
      if (typeof window === "undefined") return;

      const loadVideoBlob = async (src) => {
        const response = await fetch(src);
        const blob = await response.blob();
        return URL.createObjectURL(blob); // Convert to Blob URL
      };

      fullScreenVideoBlob = await loadVideoBlob("/videos/full-screen.mp4");
      sharedScreenVideoBlob = await loadVideoBlob("/videos/shared-screen.mp4");

      setVideoSources({
        fullScreenVideo: fullScreenVideoBlob,
        sharedScreenVideo: sharedScreenVideoBlob,
      });
    };

    loadVideos();

    return () => {
      if (fullScreenVideoBlob) URL.revokeObjectURL(fullScreenVideoBlob);
      if (sharedScreenVideoBlob) URL.revokeObjectURL(sharedScreenVideoBlob);
    };
  }, []);

  return (
    <VideoContext.Provider value={videoSources}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideoContext = () => useContext(VideoContext);
