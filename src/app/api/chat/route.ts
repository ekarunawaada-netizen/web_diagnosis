import { NextRequest, NextResponse } from "next/server";
import { chatModel } from "../../../utils/gemini";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { message, history } = body;
    
    if (!message) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });
    }

    const chat = chatModel.startChat({
      history: history?.length > 0 ? history : undefined,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Aduh, maaf banget ya kak.. sistem aku (Vitara) lagi ada kendala jaringan nih. Boleh tunggu sebentar dan coba tanyakan lagi ya! 🙏" }, { status: 500 });
  }
}
