import { NextResponse } from "next/server";
import { startChatSession } from "@/lib/vertexai";

export async function POST(req) {
  try {
    const { sessionId, message } = await req.json();
    const chat = startChatSession(sessionId);

    // Create a stream response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await chat.sendMessageStream(message);

          for await (const item of result.stream) {
            const token = item.candidates[0].content.parts?.[0]?.text;
            controller.enqueue(token || ""); // Send token to client
          }

          controller.close(); // Close stream when done
        } catch (error) {
          console.error("Error streaming LLM response:", error);
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
