import {
  HarmBlockThreshold,
  HarmCategory,
  VertexAI,
} from "@google-cloud/vertexai";
import { SAMPLE_CONVERSATION } from "./const";

const project = process.env.GCP_PROJECT_ID;
const location = process.env.GCP_LOCATION;
const model = process.env.VERTEXAI_COMPLETIONS_MODEL;

const vertexAI = new VertexAI({ project, location });

const generativeModel = vertexAI.getGenerativeModel({
  model,
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
  generationConfig: { maxOutputTokens: 30 },
  systemInstruction: {
    role: "system",
    parts: [
      {
        text: `
        You are Leafy, a helpful in car assistant. 
        The user will be driving while talking to you, so it is important you are very concise in your responses. 
        Responses must be under 140 characters. 
        No need to greet the user, the system will greet him before the text is sent to you.
        
        This is an example of a conversation you might have with the user:

        ${JSON.stringify(SAMPLE_CONVERSATION, null, 2)}
        `,
      },
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
