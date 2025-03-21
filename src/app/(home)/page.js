"use client";

import styles from "./page.module.css";
import { MongoDBLogo } from "@leafygreen-ui/logo";
import { useState } from "react";
import { H1 } from "@leafygreen-ui/typography";
import InfotainmentScreen from "@/components/infotainmentScreen/InfotainmentScreen";
import VehicleDashboard from "@/components/vehicleDashboard/VehicleDashboard";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <MongoDBLogo />
        <H1>GenAI-Powered In-Car Assistant</H1>
      </div>
      <VehicleDashboard isPlaying={isPlaying} />
      <InfotainmentScreen isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
    </div>
  );
}
