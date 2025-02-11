import React from "react";
import styles from "./message.module.css";

const Message = ({ message }) => {
  const isUser = message.sender === "user";
  return (
    <div
      className={`${styles.messageContainer} ${
        isUser ? styles.user : styles.assistant
      }`}
    >
      <div className={styles.senderName}>
        {message.sender === "user" ? "Eddy" : "Leafy Assistant"}
      </div>
      <div className={styles.messageBubble}>{message.text}</div>
    </div>
  );
};

export default Message;
