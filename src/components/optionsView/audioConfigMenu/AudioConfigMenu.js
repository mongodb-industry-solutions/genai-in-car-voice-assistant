"use client";

import { useState, useEffect } from "react";
import Modal from "@leafygreen-ui/modal";
import { Select, Option } from "@leafygreen-ui/select";
import Button from "@leafygreen-ui/button";
import styles from "./audioConfigMenu.module.css";

const AudioConfigMenu = ({ isOpen, onClose, onConfirm }) => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices
        .getUserMedia({ audio: true }) // Request permission
        .then(() =>
          navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
            const audioDevices = deviceInfos.filter(
              (device) => device.kind === "audioinput"
            );
            setDevices(audioDevices);
            if (audioDevices.length > 0) {
              setSelectedDevice(audioDevices[0].deviceId);
            }
          })
        )
        .catch((error) => {
          console.error("Error accessing media devices:", error);
        });
    }
  }, [isOpen]);

  return (
    <Modal open={isOpen} setOpen={onClose}>
      <div className={styles.modalContent}>
        <h3>Select a Microphone</h3>
        <Select
          value={selectedDevice}
          className={styles.selectDevice}
          aria-label="Select Microphone"
          onChange={(value) => setSelectedDevice(value)}
        >
          {devices.map((device) => (
            <Option key={device.deviceId} value={device.deviceId}>
              {device.label || `Microphone ${device.deviceId}`}
            </Option>
          ))}
        </Select>
        <Button
          className={styles.confirmButton}
          onClick={() => onConfirm(selectedDevice)}
          disabled={!selectedDevice}
        >
          Confirm
        </Button>
      </div>
    </Modal>
  );
};

export default AudioConfigMenu;
