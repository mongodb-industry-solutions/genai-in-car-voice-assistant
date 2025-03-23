import { WebSocketServer } from "ws";
import { SpeechClient } from "@google-cloud/speech";

// Initialize the Google Speech Client
const speechClient = new SpeechClient();

// Configuration for the speech-to-text API
const encoding = "LINEAR16";
const sampleRateHertz = 16000;
const languageCode = "en-US";

const request2 = {
  config: {
    encoding,
    sampleRateHertz,
    languageCode,
    enableWordTimeOffsets: true,
    enableAutomaticPunctuation: true,
    enableWordConfidence: true,
    enableSpeakerDiarization: true,
    diarizationSpeakerCount: 2,
    useEnhanced: true,
    speechContexts: [
      {
        phrases: ["hello", "how are you", "good morning"],
      },
    ],
  },
  interimResults: true, // Get intermediate results while the speech is still ongoing
};

export function SOCKET(client, request, server) {
  console.log("Client connected");

  // Creating the Google Cloud Speech-to-Text recognition stream
  let recognizeStream = null;

  // Start the recognition stream when the first message is received
  client.on("message", async (audioChunk) => {
    if (!recognizeStream) {
      try {
        // Start a new recognition stream
        recognizeStream = speechClient
          .streamingRecognize(request2)
          .on("error", (err) => {
            console.error("Error with Google Cloud Speech-to-Text:", err);
            client.send(JSON.stringify({ error: "Speech recognition error" }));
          })
          .on("data", (data) => {
            // Handle the response from the Speech-to-Text API
            const transcription = data.results
              .map((result) => result.alternatives[0].transcript)
              .join("\n");

            const isFinal = data.results[0].isFinal;

            client.send(
              JSON.stringify({ text: transcription, final: isFinal })
            );
          });
      } catch (error) {
        console.error("Error starting recognition stream:", error);
        client.send(
          JSON.stringify({ error: "Failed to start recognition stream" })
        );
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
