import { NextRequest, NextResponse } from "next/server";
import { getDiagnosis } from "../../../utils/gemini";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { symptoms } = body;
    
    if (!symptoms || !Array.isArray(symptoms)) {
      return NextResponse.json({ error: "Gejala tidak valid atau kosong." }, { status: 400 });
    }

    const diagnosis = await getDiagnosis(symptoms);
    if (!diagnosis) {
      return NextResponse.json({ error: "Gagal membuat diagnosis. Silakan coba lagi." }, { status: 500 });
    }

    return NextResponse.json(diagnosis);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal pada server." }, { status: 500 });
  }
}
