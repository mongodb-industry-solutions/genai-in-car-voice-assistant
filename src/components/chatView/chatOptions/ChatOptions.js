import React, { useState } from "react";
import Toggle from "@leafygreen-ui/toggle";
import TextInput from "@leafygreen-ui/text-input";
import Button from "@leafygreen-ui/button";
import styles from "./chatOptions.module.css";
import { Body } from "@leafygreen-ui/typography";
import Icon from "@leafygreen-ui/icon";
import IconButton from "@leafygreen-ui/icon-button";

const ChatOptions = ({
  isSpeakerMuted,
  setIsSpeakerMuted,
  writerMode,
  setWriterMode,
  isRecording,
  startRecording,
  stopRecording,
  isTyping,
  submitMessage,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [userInput, setUserInput] = useState("");

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleToggleWriterMode = () => {
    if (!writerMode && isRecording) {
      stopRecording();
    }
    setWriterMode((prev) => !prev);
  };

  return (
    <div className={styles.chatOptionsContainer}>
      {/* Collapsed Banner */}
      {isCollapsed ? (
        <div className={styles.collapsedBanner}>
          <IconButton
            onClick={() => setIsCollapsed(false)}
            aria-label="Expand Menu"
          >
            <Icon glyph="ChevronDown" />
          </IconButton>
        </div>
      ) : (
        <div className={styles.expandedMenu}>
          {/* Header */}
          <div className={styles.menuHeader}>
            <IconButton
              onClick={() => setIsCollapsed(true)}
              aria-label="Collapse Menu"
            >
              <Icon glyph="ChevronUp" />
            </IconButton>
          </div>

          {/* Toggle Controls */}
          <div className={styles.togglesContainer}>
            <div className={styles.toggleGroup}>
              <Body weight="medium">Mic</Body>
              <Toggle
                size="xsmall"
                checked={isRecording}
                onChange={handleToggleRecording}
                aria-label="Microphone Toggle"
              />
            </div>

            <div className={styles.toggleGroup}>
              <Body weight="medium">Speaker</Body>
              <Toggle
                size="xsmall"
                checked={!isSpeakerMuted}
                onChange={() => setIsSpeakerMuted((prev) => !prev)}
                aria-label="Speaker Toggle"
              />
            </div>

            <div className={styles.toggleGroup}>
              <Body weight="medium">Typing</Body>
              <Toggle
                size="xsmall"
                checked={writerMode}
                onChange={handleToggleWriterMode}
                aria-label="Typing Mode Toggle"
              />
            </div>
          </div>
        </div>
      )}
      {/* Typing Input Field */}
      {writerMode && (
        <div className={styles.writerContainer}>
          <TextInput
            placeholder="Type your message..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && userInput.trim()) {
                submitMessage(userInput);
                setUserInput(""); // Clear input after sending
              }
            }}
            aria-labelledby="Text input"
            className={styles.textArea}
            disabled={isTyping}
          />
          <Button
            className={styles.sendButton}
            disabled={isTyping || !userInput.trim()}
            onClick={() => {
              submitMessage(userInput);
              setUserInput("");
            }}
          >
            Send
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatOptions;
