import {
  HarmBlockThreshold,
  HarmCategory,
  VertexAI,
} from "@google-cloud/vertexai";

const project = "manufacturing-project-425012";
const location = "us-central1";
const model = "gemini-1.0-pro";

const vertexAI = new VertexAI({ project, location });

const generativeModel = vertexAI.getGenerativeModel({
  model,
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
  generationConfig: { maxOutputTokens: 256 },
  systemInstruction: {
    role: "system",
    parts: [
      { text: "You are a helpful AI assistant for a car infotainment system." },
    ],
  },
});

let chatSessions = {};

export const startChatSession = (sessionId) => {
  if (!chatSessions[sessionId]) {
    chatSessions[sessionId] = generativeModel.startChat();
  }
  return chatSessions[sessionId];
};
