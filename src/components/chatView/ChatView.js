import React, { useEffect, useRef, useState } from "react";
import Message from "./message/Message";
import SuggestedAnswer from "./suggestedAnswer/SuggestedAnswer";
import styles from "./chatView.module.css";
import { v4 as uuidv4 } from "uuid";
import useChatSimulate from "@/hooks/useChatSimulate";
import useChat from "@/hooks/useChat";
import { DEFAULT_GREETINGS } from "@/lib/const";

const ChatView = ({ setIsRecalculating, setCurrentView, simulationMode }) => {
  const chatEndRef = useRef(null);
  const [messagesToShow, setMessagesToShow] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedAnswer, setSuggestedAnswer] = useState(null);
  const [userInput, setUserInput] = useState("");
  const sessionId = useRef(uuidv4());

  const {
    handleNextMessageSimulate,
    typeMessageSimulate,
    startConversationSimulation,
  } = useChatSimulate({
    setIsRecalculating,
    setCurrentView,
    setMessagesToShow,
    setIsTyping,
    setSuggestedAnswer,
  });

  const { handleLLMResponse } = useChat({
    setMessagesToShow,
    setIsTyping,
    sessionId,
  });

  useEffect(() => {
    if (simulationMode) {
      startConversationSimulation();
    } else {
      setMessagesToShow([DEFAULT_GREETINGS]);
      typeMessageSimulate(DEFAULT_GREETINGS, 0);
    }
  }, [simulationMode, startConversationSimulation, typeMessageSimulate]);

  // Scroll to the bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesToShow, suggestedAnswer]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return; // Prevent empty messages
    setMessagesToShow((prev) => [...prev, { sender: "user", text: userInput }]);
    handleLLMResponse(userInput);
    setUserInput(""); // Clear input field
  };

  return (
    <div className={styles.chatViewContainer}>
      {/* Scrollable chat messages */}
      <div className={styles.conversationContainer}>
        {messagesToShow.map((msg, index) => (
          <Message key={index} message={msg} />
        ))}
        <div ref={chatEndRef} />
      </div>

      <form className={styles.inputContainer} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type your message..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          disabled={isTyping}
        />
        <button type="submit" disabled={isTyping || !userInput.trim()}>
          Send
        </button>
      </form>

      <SuggestedAnswer
        suggestedAnswer={suggestedAnswer}
        isTyping={isTyping}
        onSuggestionClick={() => {
          setSuggestedAnswer(null);
          handleNextMessageSimulate();
        }}
      />
    </div>
  );
};

export default ChatView;
