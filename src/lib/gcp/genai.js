import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
  Type,
} from "@google/genai";
import { SAMPLE_CONVERSATION } from "../const";

const project = process.env.GCP_PROJECT_ID || "default-project";
const location = process.env.GCP_LOCATION || "us-central1";
const completionsModel =
  process.env.VERTEXAI_COMPLETIONS_MODEL || "gemini-2.5-flash";
const embeddingsModel =
  process.env.VERTEXAI_EMBEDDINGS_MODEL || "text-embedding-005";

const ai = new GoogleGenAI({ vertexai: true, project, location });

const functionDeclarations = [
  {
    functionDeclarations: [
      {
        name: "closeChat",
        description:
          "Closes the chat window when the conversation is finished. By default it always returns to the navigation view. Ask the user to confirm this action before executing.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            view: {
              type: Type.STRING,
              enum: ["navigation"],
              description: "The next view to display after closing the chat.",
            },
          },
          required: ["view"],
        },
      },
      {
        name: "recalculateRoute",
        description:
          "Recalculates the route when a new stop is added. By default this function will find the nearest service station. Ask the user to confirm this action before executing.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: "consultManual",
        description: "Retrieves relevant information from the car manual.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: {
              type: Type.STRING,
              description:
                "A question that represents an enriched version of what the user wants to retrieve from the manual. It must be in the form of a question.",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "fetchDTCCodes",
        description:
          "Fetches active Diagnostic Trouble Codes (DTCs) in the format OBD II (SAE-J2012DA_201812) from the vehicle to assist with troubleshooting.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
    ],
  },
];

const systemInstruction = `
        You are Leafy, a helpful in-car assistant. 
        Be proactive, include suggestions for the user on what to do next. 
        For example: After making a diagnostic, suggest the next action to the user and ask for confirmation on the action.
        The user will be driving while talking to you, so be concise. 
        Responses must be under 140 characters. 
        No need to greet the user.
        You can entertain your user with jokes and conversation if the user requests it.

        If a function is needed, call the appropriate one.
        When the user implies something is wrong with the car, call fetchDTCCodes first to run a diagnostics check.
        Do not ask the user to describe a warning light, this information is already available in the diagnostic results.
        Translate diagnostic results into plain driver language and keep the answer natural, calm, and concise.

        Your main actions are:
        1. Diagnose an issue by checking the vehicle's active diagnostics.
        2. Suggest the next appropriate action by checking the car manual.
        3. If the user can benefit from going to a service station, suggest adding it to the route.
        4. If the user is done, close the chat.

        This is a sample typical conversation:
        ${JSON.stringify(SAMPLE_CONVERSATION)}
        `;

let chatSessions = {};

export const startChatSession = (sessionId) => {
  if (!chatSessions[sessionId]) {
    chatSessions[sessionId] = ai.chats.create({
      model: completionsModel,
      config: {
        systemInstruction,
        tools: functionDeclarations,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
        maxOutputTokens: 200,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
  }
  return chatSessions[sessionId];
};

export async function createEmbedding(text) {
  try {
    const response = await ai.models.embedContent({
      model: embeddingsModel,
      contents: text.split(";"),
      config: {
        taskType: "QUESTION_ANSWERING",
        outputDimensionality: 768,
      },
    });

    return response.embeddings[0].values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Embedding generation failed");
  }
}
