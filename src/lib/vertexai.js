import {
  HarmBlockThreshold,
  HarmCategory,
  VertexAI,
  FunctionDeclarationSchemaType,
} from "@google-cloud/vertexai";
import { SAMPLE_CONVERSATION } from "./const";

const project = process.env.GCP_PROJECT_ID;
const location = process.env.GCP_LOCATION;
const model = process.env.VERTEXAI_COMPLETIONS_MODEL;

const vertexAI = new VertexAI({ project, location });

const functionDeclarations = [
  {
    functionDeclarations: [
      {
        name: "closeChat",
        description:
          "Closes the chat window when the conversation is finished. By default it always returns to the navigation view. Ask the user to confirm this action before executing.",
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            view: {
              type: FunctionDeclarationSchemaType.STRING,
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
          "Recalculates the route when a new stop is added. By default this function will find the neares service station. Ask the user to confirm this action before executing.",
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {},
        },
      },
      {
        name: "consultManual",
        description: "Retrieves relevant information from the car manual.",
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            query: {
              type: FunctionDeclarationSchemaType.STRING,
              description:
                "A query that specifies what information to retrieve from the manual.",
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
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {},
        },
      },
    ],
  },
];

const generativeModel = vertexAI.getGenerativeModel({
  model,
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
  generationConfig: { maxOutputTokens: 100 },
  systemInstruction: {
    role: "system",
    parts: [
      {
        text: `
        You are Leafy, a helpful in-car assistant. 
        Be proactive, every message there should be a suggestion for the user on what to do next. 
        For example: After making a diagnostic, suggest the next action to the user and ask for confirmation on the action.
        The user will be driving while talking to you, so be concise. 
        Responses must be under 140 characters. 
        No need to greet the user.

        If a function is needed, call the appropriate one.

        Your actions are limited to:
        1. Diagnose an issue by fetching Diagnostic Trouble Codes (DTC Codes) from the car.
        2. Suggest the next appropriate action by checking the car manual.
        3. If the user can benefit from going to a service station, suggest adding it to the route.
        4. If the user is done, close the chat.

        This is a sample conversation:
        ${JSON.stringify(SAMPLE_CONVERSATION)}
        `,
      },
    ],
  },
});

let chatSessions = {};

export const startChatSession = (sessionId) => {
  if (!chatSessions[sessionId]) {
    chatSessions[sessionId] = generativeModel.startChat({
      tools: functionDeclarations,
    });
  }
  return chatSessions[sessionId];
};
