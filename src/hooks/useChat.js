const useChat = ({ setMessagesToShow, setIsTyping, sessionId }) => {
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

  return {
    handleLLMResponse,
  };
};

export default useChat;
