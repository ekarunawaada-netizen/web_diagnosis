import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY || "";
const groq = new Groq({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true, // Safeguard for environments that look like browsers
});

import { AVAILABLE_MODELS, ModelType } from "./ai-constants";
export { AVAILABLE_MODELS };
export type { ModelType };

// Urutan fallback jika model utama terkena rate limit
const FALLBACK_CHAIN: ModelType[] = ['LLAMA3_8B', 'MIXTRAL', 'GEMMA', 'LLAMA3_70B'];

// === KEPRIBADIAN VITARA ===
const vitaraSystemInstruction = `
PENTING: Nama Anda adalah VITARA (Virtual Health Assistant MediScan). 
Anda adalah sahabat kesehatan yang asyik, modern, cerdas, dan empatik.

GAYA PENULISAN (WAJIB):
1. JANGAN membuat paragraf panjang. Maksimal 2-3 kalimat per paragraf.
2. GUNAKAN elemen visual Markdown agar mudah dibaca:
   - **Bold** untuk poin penting atau istilah medis.
   - > Blockquotes untuk pesan peringatan atau tips khusus.
   - Bullet points (-) atau Numbering (1.) untuk daftar gejala/saran.
   - Gunakan Horizontal Rules (---) untuk memisahkan topik jika jawaban terlalu panjang.
3. EMOJI: Gunakan emoji yang relevan di setiap poin (misal: 🩺, ✨, 💧, 🥗) agar tidak kaku.
4. STRUKTUR JAWABAN:
   - Sapaan hangat + Empati.
   - Poin utama (Analisis singkat).
   - Daftar saran praktis (Gunakan list).
   - Penutup/Disclaimer singkat.

5. ATURAN RED FLAG (SANGAT PENTING): Jika ada keluhan gejala berbahaya (nyeri dada tembus ke punggung, sesak napas akut parah, pendarahan hebat, dsb), JANGAN pakai emoji santai. Langsung ubah nada menjadi SANGAT SERIUS dan arahkan untuk SEGERA ke UGD atau telepon layanan darurat 112.
`;

const diagnosisJsonInstructions = ` 
Anda adalah VITARA Assistant. Analisis gejala berikut dan berikan output HANYA dalam format JSON valid tanpa teks markdown pembuka/penutup seperti \`\`\`json. Struktur harus persis seperti ini:
{
  "vitaraGreeting": "Sapaan asyik, ramah, kekinian, sangat empatik",
  "primaryCondition": {
    "name": "Nama Penyakit (Bahasa Indonesia)",
    "description": "Penjelasan medis yang akurat",
    "urgency": "Normal / Perlu Perhatian / UGD/Darurat",
    "severity": 1, // Angka 1 sampai 3
    "duration": "Estimasi sembuh, misal '3-7 Hari'"
  },
  "medicalAdvice": [
    { "icon": "water_drop", "title": "Saran 1", "desc": "Deskripsi" } // Icon pakai Material Symbols (hospital, healing, hotel, dll)
  ],
  "otherPossibilities": [
    { "name": "Penyakit Lain", "pct": 80, "color": "bg-primary-container" }
  ],
  "confidence": 90,
  "finalDisclaimer": "Penafian bahwa ini hanya AI, wajib ke dokter buat pastinya."
}
`;

// Helper untuk memastikan model ada di fallback chain, jika tidak, taruh di index 0
function getFallbackSequence(preferredModelKey: ModelType): ModelType[] {
  const sequence = [preferredModelKey];
  for (const model of FALLBACK_CHAIN) {
    if (model !== preferredModelKey) {
      sequence.push(model);
    }
  }
  return sequence;
}

// === FUNGSI DIAGNOSIS (Menggunakan llama3 70b untuk kecerdasan maksimal) ===
export async function getDiagnosis(symptoms: string[]) {
  const prompt = `User melaporkan keluhan/gejala berikut: "${symptoms.join(", ")}". Berikan analisis lengkap dalam format JSON yang ketat!`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: diagnosisJsonInstructions },
        { role: "user", content: prompt }
      ],
      model: AVAILABLE_MODELS.LLAMA3_70B, // Sangat pintar untuk diagnosis
      response_format: { type: "json_object" },
      temperature: 0.2, // Konsisten
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || "{}";
    return JSON.parse(responseContent);
  } catch (error) {
    console.error("Error Vitara Diagnosis (Groq):", error);
    return null;
  }
}

// === FUNGSI CHAT DENGAN AUTO-FALLBACK ===
export async function chatService(
  message: string,
  history: { role: string; parts: { text: string }[] }[], // format lama dari gemini
  modelKey: ModelType = 'LLAMA3_8B'
) {
  // Ubah history dari format Gemini ke format OpenAI/Groq
  const groqHistory = history.map((item) => ({
    role: item.role === 'model' ? ('assistant' as const) : ('user' as const),
    content: item.parts.map(p => p.text).join(" ")
  }));

  const messages: any[] = [
    {
      role: "system",
      content: vitaraSystemInstruction + "\nFormat keluaran Anda adalah Markdown yang rapi. Selalu berikan sapaan manis di awal jika ini interaksi awal."
    },
    ...groqHistory,
    { role: "user", content: message }
  ];

  const modelsToTry = getFallbackSequence(modelKey);

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModelKey = modelsToTry[i];
    const currentModelId = AVAILABLE_MODELS[currentModelKey];

    try {
      const response = await groq.chat.completions.create({
        messages: messages,
        model: currentModelId,
        temperature: 0.7,
        max_tokens: 1000,
      });

      return {
        text: response.choices[0]?.message?.content || "",
        usedModel: currentModelKey,
        wasFallback: i > 0 // Jika index > 0, berarti fallback terjadi
      };
    } catch (error: any) {
      // Jika error 429 (Rate Limit) atau 503 (Overloaded), coba model berikutnya
      if (error?.status === 429 || error?.status === 503 || error?.message?.includes("rate limit")) {
        console.warn(`[Auto-Fallback] Model ${currentModelId} limit/sibuk. Mencoba model berikutnya...`);
        continue;
      }

      // Jika error tipe lain, langsung throw
      throw error;
    }
  }

  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY belum dikonfigurasi di server.");
  }

  // Jika semua model gagal
  throw new Error("Semua server AI saat ini sedang sibuk. Mohon coba beberapa saat lagi.");
}
