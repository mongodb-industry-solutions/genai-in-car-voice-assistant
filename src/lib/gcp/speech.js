import { SpeechClient } from "@google-cloud/speech";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";

let speechToTextClient = null;
let textToSpeechClient = null;

export const getSpeechToTextClient = () => {
  if (!speechToTextClient) {
    speechToTextClient = new SpeechClient();
  }
  return speechToTextClient;
};

export const getTextToSpeechClient = () => {
  if (!textToSpeechClient) {
    textToSpeechClient = new TextToSpeechClient();
  }
  return textToSpeechClient;
};

const speechToTextConfig = {
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

const textToSpeechConfig = {
  audioEncoding: "LINEAR16",
  effectsProfileId: ["large-automotive-class-device"],
  pitch: 0,
  speakingRate: 1.05,
};

export const getSpeechRecognitionStream = (client) => {
  const speechToTextClient = getSpeechToTextClient();

  const recognizeStream = speechToTextClient
    .streamingRecognize({ config: speechToTextConfig, interimResults: true })
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

export async function convertTextToAudio(text) {
  const textToSpeechClient = getTextToSpeechClient();
  try {
    const request = {
      input: { text: text },
      voice: { languageCode: "en-US", name: "en-US-Chirp3-HD-Aoede" },
      audioConfig: textToSpeechConfig,
    };

    const [response] = await textToSpeechClient.synthesizeSpeech(request);

    // Return the audio content in the format that can be played
    return response.audioContent.toString("base64");
  } catch (error) {
    console.error("Error generating speech:", error);
    throw new Error("Text-to-speech conversion failed");
  }
}
