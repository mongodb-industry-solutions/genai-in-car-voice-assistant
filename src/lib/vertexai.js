import {
  HarmBlockThreshold,
  HarmCategory,
  VertexAI,
  FunctionDeclarationSchemaType,
} from "@google-cloud/vertexai";
import { PredictionServiceClient, helpers } from "@google-cloud/aiplatform";
import { SAMPLE_CONVERSATION } from "./const";

const project = process.env.GCP_PROJECT_ID;
const location = process.env.GCP_LOCATION;
const completionsModel = process.env.VERTEXAI_COMPLETIONS_MODEL;
const embeddingsModel = process.env.VERTEXAI_EMBEDDINGS_MODEL;
const apiEndpoint = process.env.VERTEXAI_API_ENDPOINT;

const vertexAIClient = new VertexAI({ project, location });
const predictionServiceClient = new PredictionServiceClient({
  apiEndpoint,
});

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
                "A question that represent an enriched version of what the user wants to retrieve from the manual. It must be in the form of a question.",
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

const generativeModel = vertexAIClient.getGenerativeModel({
  model: completionsModel,
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
        Be proactive, include suggestions for the user on what to do next. 
        For example: After making a diagnostic, suggest the next action to the user and ask for confirmation on the action.
        The user will be driving while talking to you, so be concise. 
        Responses must be under 140 characters. 
        No need to greet the user.
        You can enterntain your user with jokes and conversation if the user requests it.

        If a function is needed, call the appropriate one.

        Your main actions are:
        1. Diagnose an issue by fetching Diagnostic Trouble Codes (DTC Codes) from the car.
        2. Suggest the next appropriate action by checking the car manual.
        3. If the user can benefit from going to a service station, suggest adding it to the route.
        4. If the user is done, close the chat.

        This is a sample typical conversation:
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

export async function createEmbedding(text) {
  try {
    const endpoint = `projects/${project}/locations/${location}/publishers/google/models/${embeddingsModel}`;

    const instances = text
      .split(";")
      .map((e) =>
        helpers.toValue({ content: e, task_type: "QUESTION_ANSWERING" })
      );

    const request = {
      endpoint,
      instances,
      parameters: helpers.toValue({ outputDimensionality: 768 }),
    };

    const [response] = await predictionServiceClient.predict(request);
    const predictions = response.predictions;
    const embeddings = predictions.map((p) => {
      const embeddingsProto = p.structValue.fields.embeddings;
      const valuesProto = embeddingsProto.structValue.fields.values;
      return valuesProto.listValue.values.map((v) => v.numberValue);
    });

    return embeddings[0];
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Embedding generation failed");
  }
}
