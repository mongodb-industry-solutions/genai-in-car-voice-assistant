import { useRef, useEffect } from "react";
import { useChatSession } from "@/context/ChatSessionContext";
import { useVehicle } from "@/context/VehicleContext";
import { dtcCodesDictionary } from "@/lib/const";

const useChat = ({
  setIsRecalculating,
  setCurrentView,
  setMessagesToShow,
  setIsTyping,
  setIsRecording,
  selectedDevice,
  isSpeakerMuted,
}) => {
  const socketRef = useRef(null);
  const processorRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioInputRef = useRef(null);
  const vehicleRef = useRef(null);

  const sessionId = useChatSession();

  // Web Socket Config
  const protocol = process.env.NEXT_PUBLIC_ENV === "local" ? "ws" : "wss";
  const host = typeof window !== "undefined" ? window.location.host : "";

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
        sessionId: sessionId,
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
        if (partialMessage && !isSpeakerMuted)
          await handleTextToSpeech(partialMessage);
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

  const addLog = async (sessionId, toolName, type, details) => {
    try {
      await fetch("/api/action/updateOne", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection: "logs",
          filter: { sessionId },
          update: {
            $push: {
              logs: {
                timestamp: new Date().toISOString(),
                toolName,
                type,
                details,
              },
            },
          },
          upsert: true,
        }),
      });
    } catch (error) {
      console.error("Error saving log:", error);
    }
  };

  const handleFunctionCall = async (functionCall) => {
    return new Promise((resolve) => {
      switch (functionCall.name) {
        case "recalculateRoute":
          setIsRecalculating(true);
          setTimeout(() => {
            setIsRecalculating(false);

            let response = { success: true };
            replyToFunctionCall(functionCall.name, response);

            addLog(sessionId, functionCall.name, "response", response);

            resolve();
          }, 2000);

          break;

        case "closeChat":
          setTimeout(() => {
            setCurrentView("navigation");

            let response = { success: true };
            replyToFunctionCall(functionCall.name, response);

            addLog(sessionId, functionCall.name, "response", response);

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

          addLog(sessionId, functionCall.name, "response", dtcResponse);

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
        sessionId: sessionId,
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
      if (done) {
        if (partialMessage && !isSpeakerMuted)
          await handleTextToSpeech(partialMessage);
        return;
      }

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

    setMessagesToShow((prev) => {
      // Check if the last message is from the user and is empty
      const lastMessage = prev[prev.length - 1];
      if (lastMessage?.sender === "user" && lastMessage?.text?.trim() === "") {
        return prev; // Do nothing if the last message is empty
      }
      return [...prev, { sender: "user", text: "" }];
    });

    // Initialize WebSocket connection to the server
    socketRef.current = new WebSocket(
      `${protocol}://${host}/api/gcp/speechToText`
    );
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

  const handleTextToSpeech = async (text) => {
    try {
      // Make a request to our text-to-speech API to get the audio content
      const audioResponse = await fetch("/api/gcp/textToSpeech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const { audioContent } = await audioResponse.json();

      if (audioContent) {
        const audio = new Audio(`data:audio/wav;base64,${audioContent}`);
        audio.play(); // Play the audio
      }
    } catch (error) {
      console.error("Error in text-to-speech:", error);
    }
  };

  return {
    handleLLMResponse,
    startRecording,
    stopRecording,
  };
};

export default useChat;
