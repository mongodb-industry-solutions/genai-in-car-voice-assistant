import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./warningLight.module.css";

const WarningLight = ({ isPlaying }) => {
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        setIsOn(true);
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setIsOn(false);
    }
  }, [isPlaying]);

  const handleClick = () => {
    setIsOn(!isOn);
  };

  return (
    <div className={styles.container} onClick={handleClick}>
      <div className={styles.circle}>
        <Image
          src={isOn ? "/low-oil-pressure-on.png" : "/low-oil-pressure-off.png"}
          alt="Warning Light"
          width={60}
          height={60}
          className={styles.warningImage}
        />
      </div>
    </div>
  );
};

export default WarningLight;
