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
  const [userInput, setUserInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const sessionId = useRef(uuidv4());

  // WebSocket and audio worklet refs
  const socketRef = useRef(null);
  const processorRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioInputRef = useRef(null);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

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

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
    setIsRecording((prev) => !prev); // Toggle recording state
  };

  const startRecording = async () => {
    setIsRecording(true);
    setMessagesToShow((prev) => [...prev, { sender: "user", text: "" }]);

    // Initialize WebSocket connection to the server
    socketRef.current = new WebSocket(`ws://${appUrl}/api/gcp/speechToText`);
    socketRef.current.onopen = () => {
      console.log("WebSocket connection established");
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessagesToShow((prev) => {
        const updatedMessages = [...prev];
        // Replace the last user message (empty one) with the final transcription
        updatedMessages[updatedMessages.length - 1] = {
          sender: "user",
          text: data.text,
        };
        return updatedMessages;
      });
      if (data.final && data.text.trim() !== "") {
        stopRecording();
        handleLLMResponse(data.text);
      }
    };

    // Set up Web Audio API
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: selectedDevice,
        sampleRate: 16000,
        channelCount: 1,
      },
      video: false,
    });

    audioContextRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();

    await audioContextRef.current.audioWorklet.addModule(
      "/worklets/recorderWorkletProcessor.js"
    );

    audioInputRef.current =
      audioContextRef.current.createMediaStreamSource(stream);

    processorRef.current = new AudioWorkletNode(
      audioContextRef.current,
      "recorder.worklet"
    );

    processorRef.current.connect(audioContextRef.current.destination);
    audioInputRef.current.connect(processorRef.current);

    processorRef.current.port.onmessage = (event) => {
      const audioData = event.data;
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(audioData);
      }
    };
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (socketRef.current) {
      socketRef.current.close();
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    if (audioInputRef.current) {
      audioInputRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

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

      <Button
        className={`${styles.recordButton} ${
          isRecording ? styles.recording : ""
        }`}
        //disabled={isTyping}
        onClick={handleToggleRecording}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </Button>

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
