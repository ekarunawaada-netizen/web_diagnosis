// === KONFIGURASI MODEL GROQ ===
// File ini dipisahkan agar bisa diimpor oleh Client Component tanpa memicu error SDK Groq di browser.

export const AVAILABLE_MODELS = {
  LLAMA3_8B: "llama-3.1-8b-instant",
  LLAMA3_70B: "llama-3.3-70b-versatile",
  MIXTRAL: "mixtral-8x7b-32768",
  GEMMA: "gemma2-9b-it"
} as const;

export type ModelType = keyof typeof AVAILABLE_MODELS;
