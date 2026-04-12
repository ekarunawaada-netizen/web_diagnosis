import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// === 1. SKEMA DATA UNTUK DIAGNOSIS (JSON) ===
// Memaksa Gemini untuk mengembalikan struktur data yang sesuai kebutuhan aplikasi
const diagnosisSchema = {
  type: SchemaType.OBJECT,
  properties: {
    vitaraGreeting: {
      type: SchemaType.STRING,
      description: "Sapaan asyik , ramah, kekinian, dan sangat empatik khas Vitara (Virtual Health Assistant)."
    },
    primaryCondition: {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING, description: "Nama Penyakit (Bahasa Indonesia)" },
        description: { type: SchemaType.STRING, description: "Penjelasan medis yang santai tapi akurat." },
        urgency: { type: SchemaType.STRING, description: "Wajib salah satu: 'Normal', 'Perlu Perhatian', atau 'UGD/Darurat'" },
        severity: { type: SchemaType.NUMBER, description: "Skala 1 (ringan) sampai 3 (berat)" },
        duration: { type: SchemaType.STRING, description: "Estimasi sembuh, misal: '3-7 Hari'" }
      },
      required: ["name", "description", "urgency", "severity", "duration"],
    },
    medicalAdvice: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          icon: { type: SchemaType.STRING, description: "Material Symbol seperti: water_drop, healing, hotel, local_pharmacy" },
          title: { type: SchemaType.STRING, description: "Judul saran singkat" },
          desc: { type: SchemaType.STRING, description: "Saran praktis dan empati dari Vitara" },
        },
        required: ["icon", "title", "desc"]
      },
    },
    otherPossibilities: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING, description: "Kemungkinan penyakit lain yang mirip" },
          pct: { type: SchemaType.NUMBER, description: "Persentase kemiripan, 0-100" },
          color: { type: SchemaType.STRING, description: "Kelas warna Tailwind, misal: 'bg-primary-container' atau 'bg-secondary-container'" }
        },
        required: ["name", "pct", "color"]
      },
      description: "Maksimal 2 kemungkinan penyakit lain"
    },
    confidence: { type: SchemaType.NUMBER, description: "Tingkat kepercayaan AI (0-100)" },
    finalDisclaimer: { type: SchemaType.STRING, description: "Penafian hangat bahwa Vitara cuma asisten AI, wajib ke dokter buat pastinya." },
  },
  required: ["vitaraGreeting", "primaryCondition", "medicalAdvice", "confidence", "finalDisclaimer"],
};

// === 2. KONFIGURASI MODEL & KEPRIBADIAN VITARA ===
export const AVAILABLE_MODELS = {
  FLASH: "gemini-1.5-flash",
  PRO: "gemini-1.5-pro",
  GEMMA: "gemma-7b-it",
  GEMMA_4: "gemma-4-31b"
} as const;

export type ModelType = keyof typeof AVAILABLE_MODELS;

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

// Fungsi helper untuk mendapatkan model tertentu
export function getVitaraModel(type: 'diagnosis' | 'chat', modelKey: ModelType = 'FLASH') {
  const modelName = AVAILABLE_MODELS[modelKey] || AVAILABLE_MODELS.FLASH;

  if (type === 'diagnosis') {
    return genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: vitaraSystemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: diagnosisSchema as any,
        temperature: 0.2,
      },
    });
  }

  const systemPrompt = modelKey === 'GEMMA_4' 
    ? "Kamu adalah asisten teknis berbasis Gemma. Berikan jawaban yang logis, teknis, dan langsung ke poin."
    : vitaraSystemInstruction + "\nFormat keluaran Anda adalah Markdown yang rapi (gunakan **bold** untuk penekanan, bullet points untuk saran). Selalu berikan sapaan manis di awal jikalau ini interaksi awal.";

  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: modelKey === 'GEMMA_4' ? 0.4 : 0.7,
      topP: modelKey === 'GEMMA_4' ? 0.9 : 1,
      maxOutputTokens: 1000,
    }
  });
}

// Model default untuk kompatibilitas ke belakang
export const diagnosisModel = getVitaraModel('diagnosis', 'FLASH');
export const chatModel = getVitaraModel('chat', 'FLASH');

export async function getDiagnosis(symptoms: string[]) {
  const prompt = `User melaporkan keluhan/gejala berikut: "${symptoms.join(", ")}". Sebagai VITARA, tolong berikan analisis lengkap. Output wajib menyertakan sambutan dan disclaimer sesuai skema!`;

  try {
    const result = await diagnosisModel.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Error Vitara Diagnosis:", error);
    return null;
  }
}

export async function chatService(
  message: string,
  history: { role: string; parts: { text: string }[] }[],
  modelKey: ModelType = 'FLASH'
) {
  const model = getVitaraModel('chat', modelKey);
  const chat = model.startChat({
    history: history.length > 0 ? history : undefined,
  });

  try {
    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error Vitara Chat:", error);
    return "Aduh, maaf banget ya kak.. sistem aku (Vitara) lagi ada sedikit kendala nih. Boleh tunggu sebentar dan coba tanyakan lagi ya! 🙏";
  }
}
