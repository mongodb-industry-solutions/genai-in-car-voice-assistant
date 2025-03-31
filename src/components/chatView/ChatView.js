import React, { useEffect, useRef, useState } from "react";
import Message from "./message/Message";
import SuggestedAnswer from "./suggestedAnswer/SuggestedAnswer";
import styles from "./chatView.module.css";
import { v4 as uuidv4 } from "uuid";
import useChatSimulate from "@/hooks/useChatSimulate";
import useChat from "@/hooks/useChat";
import { DEFAULT_GREETINGS } from "@/lib/const";
import Button from "@leafygreen-ui/button";

const ChatView = ({
  setIsRecalculating,
  setCurrentView,
  simulationMode,
  selectedDevice,
}) => {
  const chatEndRef = useRef(null);
  const [messagesToShow, setMessagesToShow] = useState([]);
  const [isTyping, setIsTyping] = useState(true);
  const [suggestedAnswer, setSuggestedAnswer] = useState(null);
  //const [userInput, setUserInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
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

  const { handleLLMResponse, startRecording, stopRecording } = useChat({
    setIsRecalculating,
    setCurrentView,
    setMessagesToShow,
    setIsTyping,
    setIsRecording,
    sessionId,
    selectedDevice,
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

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (!userInput.trim()) return; // Prevent empty messages
  //   setMessagesToShow((prev) => [...prev, { sender: "user", text: userInput }]);
  //   handleLLMResponse(userInput);
  //   setUserInput(""); // Clear input field
  // };

  // const handleToggleRecording = () => {
  //   if (isRecording) {
  //     stopRecording();
  //   } else {
  //     startRecording();
  //   }
  //   setIsRecording((prev) => !prev); // Toggle recording state
  // };

  // Stop recording automatically after the LLM response is sent
  useEffect(() => {
    if (!simulationMode && !isTyping && !isRecording) {
      startRecording();
    }
  }, [isTyping, simulationMode]);

  return (
    <div className={styles.chatViewContainer}>
      {/* Scrollable chat messages */}
      <div className={styles.conversationContainer}>
        {messagesToShow.map((msg, index) => (
          <Message key={index} message={msg} />
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* <form className={styles.inputContainer} onSubmit={handleSubmit}>
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
      </form> */}

      {/* <Button
        className={`${styles.recordButton} ${
          isRecording ? styles.recording : ""
        }`}
        //disabled={isTyping}
        onClick={handleToggleRecording}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </Button> */}

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
