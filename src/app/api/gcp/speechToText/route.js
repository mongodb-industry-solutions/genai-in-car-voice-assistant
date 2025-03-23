import { getSpeechRecognitionStream } from "@/lib/speech";

export function SOCKET(client, request, server) {
  console.log("Client connected");

  // Creating the Google Cloud Speech-to-Text recognition stream
  let recognizeStream = null;

  // Start the recognition stream when the first message is received
  client.on("message", async (audioChunk) => {
    if (!recognizeStream) {
      try {
        recognizeStream = getSpeechRecognitionStream(client);
      } catch (error) {
        console.error("Error starting recognition stream:", error);
        client.send(
          JSON.stringify({ error: "Failed to start recognition stream" })
        );
        return;
      }
    }

    // Stream the audio data to Google Cloud
    try {
      recognizeStream.write(audioChunk);
    } catch (err) {
      console.error("Error streaming audio data:", err);
    }
  });

  // Close the recognition stream when the WebSocket connection is closed
  client.on("close", () => {
    console.log("Client disconnected");
    if (recognizeStream) {
      recognizeStream.end();
      recognizeStream = null;
    }
  });
}
