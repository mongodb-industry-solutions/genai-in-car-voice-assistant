"use client";

import React from "react";
import Image from "next/image";
import styles from "./navigationView.module.css";

const NavigationView = ({ isFullScreen }) => {
  const imageSrc = isFullScreen
    ? "/navigation-full.png"
    : "/navigation-small.png";

  return (
    <div className={styles.imageContainer}>
      <Image
        src={imageSrc} // Replace with your image path
        alt="Car Image"
        layout="fill"
        objectFit="cover"
        className={styles.image}
        priority
      />
    </div>
  );
};

export default NavigationView;
