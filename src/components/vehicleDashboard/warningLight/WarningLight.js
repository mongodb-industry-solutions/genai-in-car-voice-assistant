"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useVehicle } from "@/context/VehicleContext";
import styles from "./warningLight.module.css";

const WarningLight = ({ name, iconOn, iconOff, dtcCodes, isPlaying }) => {
  const [isOn, setIsOn] = useState(false);
  const { vehicle, updateVehicle } = useVehicle();
  const { DTCList } = vehicle.Diagnostics;

  useEffect(() => {
    setIsOn(dtcCodes.some((code) => DTCList.includes(code)));
  }, [DTCList, dtcCodes]);

  useEffect(() => {
    if (isPlaying && name === "Engine Oil") {
      const timer = setTimeout(() => {
        updateVehicle({
          Diagnostics: {
            DTCList: [...new Set([...DTCList, dtcCodes[0]])],
          },
        });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isPlaying, name]);

  const handleClick = () => {
    let newDTCList = [...DTCList];

    if (isOn) {
      newDTCList = newDTCList.filter((code) => !dtcCodes.includes(code));
    } else {
      newDTCList.push(dtcCodes[0]); // Add the first DTC as default
    }

    updateVehicle({
      Diagnostics: {
        DTCList: newDTCList,
      },
    });
  };

  return (
    <div className={styles.container} onClick={handleClick}>
      <div className={styles.circle}>
        <Image
          src={isOn ? iconOn : iconOff}
          alt={`${name} Warning Light`}
          width={60}
          height={60}
          className={styles.warningImage}
        />
      </div>
    </div>
  );
};

export default WarningLight;
