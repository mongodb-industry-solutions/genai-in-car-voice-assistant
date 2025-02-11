import React, { useEffect, useRef } from "react";
import Message from "./message/Message";
import styles from "./chat.module.css";

const Chat = ({ messages }) => {
  const chatEndRef = useRef(null);

  // Scroll to the bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={styles.chatContainer}>
      {messages.map((msg, index) => (
        <Message key={index} message={msg} />
      ))}
      <div ref={chatEndRef} />
    </div>
  );
};

export default Chat;
