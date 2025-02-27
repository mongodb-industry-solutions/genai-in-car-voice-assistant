import React, { useEffect, useRef, useState } from "react";
import Message from "./message/Message";
import styles from "./chatView.module.css";

const ChatView = ({ setIsRecalculating, setCurrentView }) => {
  const chatEndRef = useRef(null);
  const [messagesToShow, setMessagesToShow] = useState([]);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedAnswer, setSuggestedAnswer] = useState(null);

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
    { sender: "assistant", tool: "recalculateRoute" },
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
    { sender: "assistant", tool: "closeChat" },
  ];

  const playAudio = (index) => {
    const audioFile = `/audios/${index}.wav`;
    const audio = new Audio(audioFile);
    audio.play();
  };

  // Function to simulate typing effect
  const typeMessage = (message, index) => {
    return new Promise((resolve) => {
      setIsTyping(true);

      if (message.sender === "assistant") {
        playAudio(index);
      }

      const words = message.text.split(" ");
      let wordIndex = 0;
      const interval = setInterval(() => {
        setMessagesToShow((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[index] = {
            ...updatedMessages[index],
            text: words.slice(0, wordIndex + 1).join(" "),
          };
          return updatedMessages;
        });

        wordIndex += 1;
        if (wordIndex === words.length) {
          clearInterval(interval);
          setIsTyping(false);
          resolve();
        }
      }, 300);
    });
  };

  const handleTool = (toolName) => {
    return new Promise((resolve) => {
      switch (toolName) {
        case "recalculateRoute":
          setIsRecalculating(true);

          setTimeout(() => {
            setIsRecalculating(false);
            resolve(); // Resolve after recalculating
          }, 2000);
          break;

        case "closeChat":
          setTimeout(() => {
            setCurrentView("navigation");
            resolve(); // Resolve after closing chat
          }, 500);
          break;

        default:
          console.log(`Tool ${toolName} not implemented yet`);
          resolve();
      }
    });
  };

  const handleNextMessage = async () => {
    if (messageIndex < messages.length) {
      const newMessage = messages[messageIndex];

      if (newMessage.tool) {
        await handleTool(newMessage.tool);
      } else {
        setMessagesToShow((prevMessages) => [
          ...prevMessages,
          { ...newMessage, text: "" },
        ]);
        await typeMessage(newMessage, messagesToShow.length);
      }
      setMessageIndex(messageIndex + 1);
    }
  };

  const handleSuggestionClick = () => {
    setSuggestedAnswer(null);
    handleNextMessage();
  };

  const handleEnterKey = (e) => {
    if (e.key === "Enter" && suggestedAnswer && !isTyping) {
      handleSuggestionClick();
    }
  };

  useEffect(() => {
    if (messageIndex < messages.length) {
      const timeout = setTimeout(async () => {
        const nextMessage = messages[messageIndex];

        if (nextMessage.sender === "user") {
          setSuggestedAnswer(nextMessage.text);
        } else {
          await handleNextMessage();
        }
      }, 1000); // Always wait 1 second before handling messages

      return () => clearTimeout(timeout);
    }
  }, [messageIndex]);

  useEffect(() => {
    window.addEventListener("keydown", handleEnterKey);
    return () => {
      window.removeEventListener("keydown", handleEnterKey);
    };
  }, [suggestedAnswer, isTyping]);

  // Scroll to the bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesToShow, suggestedAnswer]);

  return (
    <div className={styles.chatViewContainer}>
      {/* Scrollable chat messages */}
      <div className={styles.conversationContainer}>
        {messagesToShow.map((msg, index) => (
          <Message key={index} message={msg} isTyping={isTyping} />
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Fixed suggested answer at the bottom */}

      <div className={styles.suggestedContainer}>
        {suggestedAnswer && !isTyping && (
          <>
            <p className={styles.suggestedText}>Suggested answer:</p>
            <div
              className={styles.suggestedAnswer}
              onClick={handleSuggestionClick}
            >
              {suggestedAnswer}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatView;
