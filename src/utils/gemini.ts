import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function getDiagnosis(symptoms: string[]) {
  const prompt = `
    Anda adalah asisten medis AI untuk aplikasi MediScan. 
    Berdasarkan gejala berikut: ${symptoms.join(", ")}, berikan diagnosis awal yang terstruktur dalam format JSON.
    
    Format JSON harus seperti ini:
    {
      "primaryCondition": {
        "name": "Nama Penyakit (Bahasa Indonesia)",
        "description": "Deskripsi singkat tentang kondisi tersebut.",
        "urgency": "Perlu Perhatian" | "Normal",
        "duration": "3-7 Hari",
        "severity": 1-3
      },
      "medicalAdvice": [
        { "icon": "water_drop", "title": "Judul Saran", "desc": "Deskripsi saran" }
      ],
      "otherPossibilities": [
        { "name": "Kemungkinan Lain", "pct": 65, "color": "bg-primary-container" }
      ],
      "confidence": 84
    }

    Pastikan "icon" menggunakan Material Symbols yang valid (water_drop, medication, bed, hotel, local_pharmacy).
    Jangan memberikan saran medis yang menggantikan tenaga profesional. Tambahkan disclaimer jika diperlukan di deskripsi.
    Kembalikan HANYA JSON.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse Gemini response");
  } catch (error) {
    console.error("Error in getDiagnosis:", error);
    return null;
  }
}

export async function chatService(message: string, history: { role: string; parts: { text: string }[] }[]) {
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Anda adalah asisten Customer Service MediScan yang ramah, profesional, dan membantu. Anda membantu pengguna dengan pertanyaan seputar aplikasi MediScan, kesehatan umum (dengan disclaimer), dan cara menggunakan fitur diagnosis. Jangan pernah mendiagnosis secara pasti, selalu sarankan konsultasi dengan dokter jika gejalanya serius." }],
      },
      {
        role: "model",
        parts: [{ text: "Halo! Saya adalah Customer Service MediScan. Ada yang bisa saya bantu hari ini?" }],
      },
      ...history
    ],
  });

  try {
    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error in chatService:", error);
    return "Maaf, saya sedang mengalami gangguan teknis. Silakan coba lagi nanti.";
  }
}
