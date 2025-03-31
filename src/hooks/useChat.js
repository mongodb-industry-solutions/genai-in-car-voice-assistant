import { useRef } from "react";

const useChat = ({
  setMessagesToShow,
  setIsTyping,
  setIsRecording,
  sessionId,
  selectedDevice,
}) => {
  const socketRef = useRef(null);
  const processorRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioInputRef = useRef(null);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const handleLLMResponse = async (userMessage) => {
    setIsTyping(true);
    let assistantMessageIndex;
    setMessagesToShow((prev) => {
      const updatedMessages = [...prev, { sender: "assistant", text: "" }];
      assistantMessageIndex = updatedMessages.length - 1;
      return updatedMessages;
    });

    const response = await fetch("/api/gcp/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sessionId.current,
        message: userMessage,
      }),
    });

    if (!response.body) {
      console.error("Response stream is empty.");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let partialMessage = "";

    const processStream = async () => {
      const { value, done } = await reader.read();
      if (done) {
        setIsTyping(false);
        return;
      }

      partialMessage += decoder.decode(value, { stream: true });

      setMessagesToShow((prevMessages) =>
        prevMessages.map((msg, index) =>
          index === assistantMessageIndex
            ? { ...msg, text: partialMessage }
            : msg
        )
      );

      processStream();
    };

    processStream();
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

  return {
    handleLLMResponse,
    startRecording,
    stopRecording,
  };
};

export default useChat;
