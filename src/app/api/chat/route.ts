import { NextRequest, NextResponse } from "next/server";
import { chatService } from "../../../utils/ai";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { message, history } = body;
    
    if (!message) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });
    }

    // Panggil chatService (Otomatis menggunakan fallback chain di sisi server)
    const result = await chatService(message, history);

    return NextResponse.json({ 
      response: result.text,
      usedModel: result.usedModel,
      wasFallback: result.wasFallback
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ 
      error: `Error: ${error.message || "Kendala jaringan"}. Silakan coba beberapa saat lagi! 🙏` 
    }, { status: 500 });
  }
}
