// === KONFIGURASI MODEL GROQ ===
// File ini dipisahkan agar bisa diimpor oleh Client Component tanpa memicu error SDK Groq di browser.

export const AVAILABLE_MODELS = {
  LLAMA3_8B: "llama3-8b-8192",
  LLAMA3_70B: "llama3-70b-8192",
  MIXTRAL: "mixtral-8x7b-32768",
  GEMMA: "gemma-7b-it"
} as const;

export type ModelType = keyof typeof AVAILABLE_MODELS;
