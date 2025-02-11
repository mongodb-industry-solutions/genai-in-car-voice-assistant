import { useState } from "react";
import Image from "next/image";
import styles from "./warningLight.module.css";

const WarningLight = () => {
  const [isOn, setIsOn] = useState(true);

  const handleClick = () => {
    setIsOn(!isOn);
  };

  return (
    <div className={styles.container} onClick={handleClick}>
      <div className={styles.circle}>
        <Image
          src={isOn ? "/low-oil-pressure-on.png" : "/low-oil-pressure-off.png"}
          alt="Warning Light"
          layout="intrinsic"
          width={60}
          height={60}
        />
      </div>
    </div>
  );
};

export default WarningLight;
