import React, { useEffect, useRef, useState, useCallback } from "react";
import Message from "./message/Message";
import SuggestedAnswer from "./suggestedAnswer/SuggestedAnswer";
import { SAMPLE_CONVERSATION } from "../../lib/const";
import styles from "./chatView.module.css";

const ChatView = ({ setIsRecalculating, setCurrentView }) => {
  const chatEndRef = useRef(null);
  const [messagesToShow, setMessagesToShow] = useState([]);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedAnswer, setSuggestedAnswer] = useState(null);

  const messages = SAMPLE_CONVERSATION;

  const playAudio = useCallback((index) => {
    const audioFile = `/audios/${index}.wav`;
    const audio = new Audio(audioFile);
    audio.play();
  }, []);

  // Function to simulate typing effect
  const typeMessage = useCallback(
    (message, index) => {
      return new Promise((resolve) => {
        setIsTyping(true);
        if (message.sender === "assistant") playAudio(index);

        const words = message.text.split(" ");
        let wordIndex = 0;

        const interval = setInterval(() => {
          setMessagesToShow((prev) => {
            const updated = [...prev];
            if (updated.length > 0) {
              updated[updated.length - 1].text = words
                .slice(0, wordIndex + 1)
                .join(" ");
            }
            return updated;
          });

          wordIndex += 1;
          if (wordIndex === words.length) {
            clearInterval(interval);
            setIsTyping(false);
            resolve();
          }
        }, 300);
      });
    },
    [playAudio]
  );

  const handleTool = useCallback(
    (toolName) => {
      return new Promise((resolve) => {
        switch (toolName) {
          case "recalculateRoute":
            setIsRecalculating(true);
            setTimeout(() => {
              setIsRecalculating(false);
              resolve();
            }, 2000);
            break;
          case "closeChat":
            setTimeout(() => {
              setCurrentView("navigation");
              resolve();
            }, 500);
            break;
          default:
            resolve();
        }
      });
    },
    [setIsRecalculating, setCurrentView]
  );

  const handleNextMessage = useCallback(async () => {
    if (messageIndex < messages.length) {
      const newMessage = messages[messageIndex];

      if (newMessage.tool) {
        await handleTool(newMessage.tool);
      } else {
        setMessagesToShow((prev) => [...prev, { ...newMessage, text: "" }]); // Add new message first

        await typeMessage(newMessage, messageIndex); // Use messageIndex directly
      }
      setMessageIndex((prev) => prev + 1);
    }
  }, [messageIndex, messages, handleTool, typeMessage]);

  // Conversation management
  useEffect(() => {
    if (messageIndex < messages.length) {
      const timeout = setTimeout(async () => {
        const nextMessage = messages[messageIndex];

        if (nextMessage.sender === "user") {
          setSuggestedAnswer(nextMessage.text);
        } else {
          await handleNextMessage();
        }
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [messageIndex, messages, handleNextMessage]);

  // Scroll to the bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesToShow, suggestedAnswer]);

  return (
    <div className={styles.chatViewContainer}>
      {/* Scrollable chat messages */}
      <div className={styles.conversationContainer}>
        {messagesToShow.map((msg, index) => (
          <Message key={index} message={msg} />
        ))}
        <div ref={chatEndRef} />
      </div>

      <SuggestedAnswer
        suggestedAnswer={suggestedAnswer}
        isTyping={isTyping}
        onSuggestionClick={() => {
          setSuggestedAnswer(null);
          handleNextMessage();
        }}
      />
    </div>
  );
};

export default ChatView;
