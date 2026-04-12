import { NextRequest, NextResponse } from "next/server";
import { chatService } from "../../../utils/gemini";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { message, history, model: requestedModel } = body;
    
    if (!message) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });
    }

    // Panggil chatService dengan menyertakan pilihan model
    const text = await chatService(message, history, requestedModel);

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Aduh, maaf banget ya kak.. sistem aku (Vitara) lagi ada kendala jaringan nih. Boleh tunggu sebentar dan coba tanyakan lagi ya! 🙏" }, { status: 500 });
  }
}
