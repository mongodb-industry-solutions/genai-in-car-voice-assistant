import { NextResponse } from "next/server";
import { convertTextToAudio } from "@/lib/speech";

export async function POST(req) {
  try {
    const { text } = await req.json();

    // Call the function to convert text to speech
    const audioContent = await convertTextToAudio(text);

    // Return the audio content in the response
    return NextResponse.json({ audioContent }, { status: 200 });
  } catch (error) {
    console.error("Error synthesizing speech:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
