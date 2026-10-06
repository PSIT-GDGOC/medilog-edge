/**
 * MediLog Edge - AI Extension Points
 * 
 * NOTE: Edge AI screening (TensorFlow.js camera screening, decision-support models)
 * is part of the future contributor roadmap. 
 * 
 * Contributor Guidelines & Subsystems to be implemented in future PRs:
 * - Camera capture & preprocessing
 * - On-device TFJS model loading & offline inference
 * - Gemini API diagnostic support & summarization
 */

export const AI_FEATURE_FLAGS = {
  TFJS_SCREENING_ENABLED: false,
  GEMINI_ASSISTANT_ENABLED: false
};

export async function runEdgeScreening(imageBlob) {
  console.info('[AI Service] Edge screening feature point ready for contributor implementation.');
  return {
    status: 'unimplemented',
    message: 'Edge AI screening will be available in a future contributor module.'
  };
}

export async function queryGeminiClinicalAssist(patientData) {
  console.info('[AI Service] Gemini clinical assistant feature point ready for contributor implementation.');
  return {
    status: 'unimplemented',
    message: 'Gemini clinical assistant will be available in a future contributor module.'
  };
}
