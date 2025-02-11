"use client";

import styles from "./page.module.css";
import { MongoDBLogo } from "@leafygreen-ui/logo";
import { H1 } from "@leafygreen-ui/typography";
import InfotainmentScreen from "@/components/infotainmentScreen/InfotainmentScreen";
import Chat from "@/components/chat/Chat";
import Image from "next/image";
import WarningLight from "@/components/warningLight/WarningLight";

export default function Home() {
  const messages = [
    { sender: "user", text: "Hey, what’s this red light on my dashboard?" },
    {
      sender: "assistant",
      text: "That’s the engine oil pressure warning, Eddy. It means your oil level might be low. Want me to guide you on what to do?",
    },
    { sender: "user", text: "Yes, please." },
    {
      sender: "assistant",
      text: "First, pull over safely and turn off the engine. Then, check the oil level and top it up if needed. If the light stays on, you should get the car checked.",
    },
    {
      sender: "assistant",
      text: "Want me to add the nearest service station to your route?",
    },
    { sender: "user", text: "Yes, that’d be great!" },
    {
      sender: "assistant",
      text: "Done! I’ve set your route to the closest service station. Drive safely! 🚗💨",
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <MongoDBLogo />
        <H1>GenAI-Powered In-Car Assistant</H1>
      </div>
      <WarningLight />
      <InfotainmentScreen>
        <Chat messages={messages} />
        <div className={styles.imageContainer}>
          <Image
            src="/navigation.png" // Replace with your image path
            alt="Car Image"
            width={200}
            height={400}
            className={styles.image}
          />
        </div>
      </InfotainmentScreen>
    </div>
  );
}
