import React, { useEffect, useRef, useState } from "react";
import Message from "./message/Message";
import SuggestedAnswer from "./suggestedAnswer/SuggestedAnswer";
import styles from "./chatView.module.css";
import useChatSimulate from "@/hooks/useChatSimulate";
import useChat from "@/hooks/useChat";
import { DEFAULT_GREETINGS } from "@/lib/const";
import ChatOptions from "./chatOptions/ChatOptions";

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
  const [isRecording, setIsRecording] = useState(false);
  const [writerMode, setWriterMode] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);

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
    selectedDevice,
    isSpeakerMuted,
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

  const submitMessage = (text) => {
    setMessagesToShow((prev) => {
      const lastMessage = prev[prev.length - 1];

      // If the last message is from the user and is empty, overwrite it
      if (lastMessage?.sender === "user" && lastMessage?.text.trim() === "") {
        return [...prev.slice(0, -1), { sender: "user", text }];
      }

      // Otherwise, add a new message
      return [...prev, { sender: "user", text }];
    });

    handleLLMResponse(text);
  };

  // Stop recording automatically after the LLM response is sent
  useEffect(() => {
    if (!simulationMode && !isTyping && !isRecording && !writerMode) {
      startRecording();
    }
  }, [isTyping, simulationMode]);

  return (
    <div className={styles.chatViewContainer}>
      {/* Scrollable chat messages */}
      <div className={styles.conversationContainer}>
        {messagesToShow.map((msg, index) => (
          <Message
            key={index}
            message={msg}
            isRecording={isRecording}
            isLastMessage={index === messagesToShow.length - 1}
          />
        ))}
        <div ref={chatEndRef} />
      </div>

      {!simulationMode ? (
        <ChatOptions
          isSpeakerMuted={isSpeakerMuted}
          setIsSpeakerMuted={setIsSpeakerMuted}
          writerMode={writerMode}
          setWriterMode={setWriterMode}
          isRecording={isRecording}
          startRecording={startRecording}
          stopRecording={stopRecording}
          isTyping={isTyping}
          submitMessage={submitMessage}
        />
      ) : (
        <SuggestedAnswer
          suggestedAnswer={suggestedAnswer}
          isTyping={isTyping}
          onSuggestionClick={() => {
            setSuggestedAnswer(null);
            handleNextMessageSimulate();
          }}
        />
      )}
    </div>
  );
};

export default ChatView;
