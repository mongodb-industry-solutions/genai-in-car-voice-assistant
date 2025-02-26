import React, { useEffect, useRef, useState } from "react";
import Message from "./message/Message";
import styles from "./chatView.module.css";

const ChatView = () => {
  const chatEndRef = useRef(null);
  const [messagesToShow, setMessagesToShow] = useState([]);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const messages = [
    {
      sender: "assistant",
      text: "Hi, I'm Leafy. How can I help you today?",
    },
    { sender: "user", text: "Hey, what’s this red light on my dashboard?" },
    {
      sender: "assistant",
      text: "That’s the engine oil pressure warning It means your oil level might be low. Want me to guide you on what to do?",
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
    {
      sender: "assistant",
      text: "Is there anything else I can assist you with today?",
    },
    {
      sender: "user",
      text: "No, that's all. Thanks!",
    },
  ];

  const playAudio = (index) => {
    const audioFile = `/audios/${index}.wav`;
    const audio = new Audio(audioFile);
    audio.play();
  };

  // Function to simulate typing effect
  const typeMessage = (message, index) => {
    setIsTyping(true);

    if (message.sender === "assistant") {
      playAudio(index);
    }

    let charIndex = 0;
    const interval = setInterval(() => {
      setMessagesToShow((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[index] = {
          ...updatedMessages[index],
          text: message.text.slice(0, charIndex + 1),
        };
        return updatedMessages;
      });

      charIndex += 1;
      if (charIndex === message.text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 55);
  };

  const handleNextMessage = () => {
    if (messageIndex < messages.length) {
      const newMessage = messages[messageIndex];
      setMessagesToShow((prevMessages) => [
        ...prevMessages,
        { ...newMessage, text: "" },
      ]);
      typeMessage(newMessage, messagesToShow.length);
      setMessageIndex(messageIndex + 1);
    }
  };

  // Delay first message
  useEffect(() => {
    const timeout = setTimeout(() => {
      handleNextMessage();
    }, 1000); // Delay for first message

    return () => clearTimeout(timeout);
  }, []);

  // Scroll to the bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesToShow]);

  return (
    <div className={styles.chatContainer}>
      {messagesToShow.map((msg, index) => (
        <Message key={index} message={msg} />
      ))}
      <div ref={chatEndRef} />
      <button onClick={handleNextMessage} disabled={isTyping}>
        Send Next Message
      </button>
    </div>
  );
};

export default ChatView;
