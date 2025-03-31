"use client";

import styles from "./page.module.css";
import { MongoDBLogo } from "@leafygreen-ui/logo";
import { useState } from "react";
import { H1 } from "@leafygreen-ui/typography";
import InfotainmentScreen from "@/components/infotainmentScreen/InfotainmentScreen";
import VehicleDashboard from "@/components/vehicleDashboard/VehicleDashboard";
import InfoWizard from "@/components/infoWizard/InfoWizard";
import LogConsole from "@/components/logConsole/LogConsole";
import { TALK_TRACK } from "@/lib/const";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulationMode, setSimulationMode] = useState(true);
  const [openHelpModal, setOpenHelpModal] = useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <MongoDBLogo />
        <H1>GenAI-Powered In-Car Assistant</H1>
      </div>
      <InfoWizard
        open={openHelpModal}
        setOpen={setOpenHelpModal}
        tooltipText="Tell me more!"
        iconGlyph="Wizard"
        sections={TALK_TRACK}
      />
      <VehicleDashboard isPlaying={isPlaying} />
      <InfotainmentScreen
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        simulationMode={simulationMode}
        setSimulationMode={setSimulationMode}
      />
      <LogConsole simulationMode={simulationMode} />
    </div>
  );
}
