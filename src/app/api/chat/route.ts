import { NextRequest, NextResponse } from "next/server";
import { chatService } from "../../../utils/gemini";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { message, history } = body;
    
    if (!message) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });
    }

    const response = await chatService(message, history || []);
    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat menghubungi asisten AI." }, { status: 500 });
  }
}
