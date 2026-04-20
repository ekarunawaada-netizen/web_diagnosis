

/**
 * symptomMap.ts
 *
 * Static mapping from frontend question IDs (used in the diagnosis quiz)
 * to backend symptom codes used by the inference engine API (/api/diagnose).
 *
 * Backend codes were sourced from GET /api/symptoms.
 * CF values represent user confidence level:
 *   'ya'          → 0.9  (definitely experiencing)
 *   'tidak_yakin' → 0.5  (unsure / maybe)
 *   'tidak'       → excluded from the payload
 */

export type UserAnswerCF = 'ya' | 'tidak_yakin' | 'tidak';

export const ANSWER_CF_MAP: Record<UserAnswerCF, number | null> = {
  ya: 0.9,
  tidak_yakin: 0.5,
  tidak: null, // excluded
};

/**
 * Mapping from frontend question IDs to backend symptom codes.
 * Keys match the `id` fields defined in the `questionTree` array in diagnosis/page.tsx.
 */
export const SYMPTOM_CODE_MAP: Record<string, string> = {
  // ── Vital Signs ──────────────────────────────────────────────────────────────
  demam: 'G001', // Demam Tinggi
  berkeringat_malam: 'G005', // Berkeringat Malam
  menggigil: 'G007', // Menggigil

  // ── Respiratory ──────────────────────────────────────────────────────────────
  batuk: 'G002', // Batuk Kering
  sesak_napas: 'G008', // Sesak Napas

  // ── Neurological ─────────────────────────────────────────────────────────────
  sakit_kepala: 'G006', // Sakit Kepala

  // ── Gastrointestinal ─────────────────────────────────────────────────────────
  mual: 'G009', // Mual
  muntah: 'G010', // Muntah
  diare: 'G011', // Diare

  // ── Pain ─────────────────────────────────────────────────────────────────────
  nyeri_dada: 'G004', // Nyeri Dada
  nyeri_otot: 'G003', // Nyeri Sendi / Otot

  // ── General ──────────────────────────────────────────────────────────────────
  lemas: 'G012', // Lemas / Kelelahan
  gatal: 'G013', // Gatal / Ruam Kulit
  sakit_tenggorokan: 'G014', // Sakit Tenggorokan
};

/**
 * Converts the quiz answers into the payload format expected by POST /api/diagnose.
 *
 * @param answers - Array of quiz answers from the diagnosis page state
 * @returns Array of { symptomCode, cfValue } for the API request
 */
export interface QuizAnswer {
  id: string;
  answer: UserAnswerCF;
}

export interface DiagnoseSymptomPayload {
  symptomCode: string;
  cfValue: number;
}

export function buildDiagnosePayload(answers: QuizAnswer[]): DiagnoseSymptomPayload[] {
  const payload: DiagnoseSymptomPayload[] = [];

  for (const answer of answers) {
    const cfValue = ANSWER_CF_MAP[answer.answer];
    if (cfValue === null) continue; // skip 'tidak' answers

    const symptomCode = SYMPTOM_CODE_MAP[answer.id];
    if (!symptomCode) continue; // skip unmapped symptoms

    payload.push({ symptomCode, cfValue });
  }

  return payload;
}
