import { NextResponse } from "next/server";
import { startChatSession, createEmbedding } from "@/lib/vertexai";
import { vectorSearch, clientPromise } from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { sessionId, message } = await req.json();
    const chat = startChatSession(sessionId);

    const result = await chat.sendMessageStream(message);
    let functionCall = null;
    let assistantResponse = "";

    // Create a stream response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const item of result.stream) {
            const candidate = item.candidates[0];

            if (candidate.content?.parts?.[0]?.functionCall) {
              functionCall = candidate.content.parts[0].functionCall;
              addLog(sessionId, functionCall.name, "call", functionCall);
            } else {
              const token = candidate.content.parts?.[0]?.text || "";
              controller.enqueue(token);
              assistantResponse += token;
            }
          }

          if (functionCall) {
            await result.response;
            const { name, args } = functionCall;

            if (name === "consultManual") {
              const queryEmbedding = await createEmbedding(args.query);
              const relevantChunks = await vectorSearch(queryEmbedding);

              const functionResponseParts = [
                {
                  functionResponse: {
                    name,
                    response: {
                      name,
                      content: {
                        chunks: relevantChunks,
                      },
                    },
                  },
                },
              ];

              addLog(sessionId, name, "response", functionResponseParts);

              const followUpResult = await chat.sendMessageStream(
                functionResponseParts
              );

              for await (const item of followUpResult.stream) {
                const token =
                  item.candidates[0]?.content?.parts?.[0]?.text || "";
                controller.enqueue(token);
              }
            } else {
              // Client-side function calls (handled in frontend)
              controller.enqueue(JSON.stringify({ functionCall }));
            }
          }

          controller.close(); // Close stream when done
        } catch (error) {
          console.error("Error streaming response:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no", // Ensure streaming works correctly
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

async function addLog(sessionId, toolName, type, details) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME);
    const logsCollection = db.collection("logs");

    await logsCollection.updateOne(
      { sessionId },
      {
        $push: {
          logs: {
            timestamp: new Date().toISOString(),
            toolName,
            type,
            details,
          },
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("Error logging tool call:", error);
  }
}
