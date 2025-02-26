"use client";

import styles from "./page.module.css";
import { MongoDBLogo } from "@leafygreen-ui/logo";
import { H1 } from "@leafygreen-ui/typography";
import InfotainmentScreen from "@/components/infotainmentScreen/InfotainmentScreen";
import WarningLight from "@/components/warningLight/WarningLight";

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <MongoDBLogo />
        <H1>GenAI-Powered In-Car Assistant</H1>
      </div>
      <WarningLight />
      <InfotainmentScreen />
    </div>
  );
}
