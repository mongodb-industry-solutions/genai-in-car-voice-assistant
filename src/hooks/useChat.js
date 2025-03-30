import { useRef, useEffect } from "react";
import { useVehicle } from "@/context/VehicleContext";
import { dtcCodesDictionary } from "@/lib/const";

const useChat = ({
  setIsRecalculating,
  setCurrentView,
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
  const vehicleRef = useRef(null);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const { vehicle } = useVehicle();

  useEffect(() => {
    vehicleRef.current = vehicle;
  }, [vehicle]);

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
    let isFunctionCallActive = false;

    const processStream = async () => {
      const { value, done } = await reader.read();
      if (done && !isFunctionCallActive) {
        setIsTyping(false);
        return;
      }

      const decodedChunk = decoder.decode(value, { stream: true });

      try {
        const parsedChunk = JSON.parse(decodedChunk);
        if (parsedChunk.functionCall) {
          isFunctionCallActive = true;
          await handleFunctionCall(parsedChunk.functionCall);
          isFunctionCallActive = false;
        }
      } catch {
        // Normal text response, continue displaying
        partialMessage += decodedChunk;
        setMessagesToShow((prevMessages) =>
          prevMessages.map((msg, index) =>
            index === assistantMessageIndex
              ? { ...msg, text: partialMessage }
              : msg
          )
        );
      }

      processStream();
    };

    processStream();
  };

  const handleFunctionCall = async (functionCall) => {
    return new Promise((resolve) => {
      switch (functionCall.name) {
        case "recalculateRoute":
          setIsRecalculating(true);
          setTimeout(() => {
            setIsRecalculating(false);
            replyToFunctionCall(functionCall.name, {});
            resolve();
          }, 2000);
          break;

        case "closeChat":
          setTimeout(() => {
            setCurrentView("navigation");
            replyToFunctionCall(functionCall.name, {});
            resolve();
          }, 500);
          break;

        case "fetchDTCCodes":
          const dtcList = vehicleRef.current.Diagnostics.DTCList || [];
          const dtcCount = vehicleRef.current.Diagnostics.DTCCount || 0;

          const enrichedDtcList = dtcList.map((dtcCode) => {
            const dtc = dtcCodesDictionary.find(
              (entry) => entry.code === dtcCode
            );
            if (dtc) {
              return `${dtc.code} - ${dtc.description}`;
            }
            return dtcCode;
          });

          const dtcResponse = { dtcCount, dtcList: enrichedDtcList };
          replyToFunctionCall(functionCall.name, dtcResponse);
          resolve();
          break;
        default:
          console.warn("Unknown function call:", functionCall.name);
          resolve();
      }
    });
  };

  const replyToFunctionCall = async (name, content) => {
    const functionResponseParts = [
      { functionResponse: { name, response: { name, content } } },
    ];

    const response = await fetch("/api/gcp/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sessionId.current,
        message: functionResponseParts,
      }),
    });

    if (!response.body) {
      console.error("Error sending function response.");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let partialMessage = "";

    const processStream = async () => {
      const { value, done } = await reader.read();
      if (done) return;

      partialMessage += decoder.decode(value, { stream: true });

      setMessagesToShow((prevMessages) =>
        prevMessages.map((msg, index) =>
          index === prevMessages.length - 2
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
