import { SpeechClient } from "@google-cloud/speech";

let speechClient = null;
export const getSpeechClient = () => {
  if (!speechClient) {
    speechClient = new SpeechClient();
  }
  return speechClient;
};

const speechConfig = {
  encoding: "LINEAR16",
  sampleRateHertz: 16000,
  languageCode: "en-US",
  enableWordTimeOffsets: false,
  enableAutomaticPunctuation: true,
  enableWordConfidence: false,
  enableSpeakerDiarization: false,
  profanityFilter: true,
  useEnhanced: true,
};

export const getSpeechRecognitionStream = (client) => {
  const speechClient = getSpeechClient();

  const recognizeStream = speechClient
    .streamingRecognize({ config: speechConfig, interimResults: true })
    .on("error", (err) => {
      console.error("Error with Google Cloud Speech-to-Text:", err);
      client.send(JSON.stringify({ error: "Speech recognition error" }));
    })
    .on("data", (data) => {
      const transcription = data.results
        .map((result) => result.alternatives[0].transcript)
        .join("\n");

      const isFinal = data.results[0]?.isFinal;

      client.send(JSON.stringify({ text: transcription, final: isFinal }));
    });

  return recognizeStream;
};
