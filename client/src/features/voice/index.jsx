import React from 'react';
import { Mic, Clock } from 'lucide-react';

/**
 * Voice Input Extension Module
 * Clean placeholder for Speech-to-Text & Gemini structured extraction
 */
export function VoiceInputPanel() {
  return (
    <div className="card-panel p-6 border-dashed border-slate-700 text-center">
      <div className="w-12 h-12 bg-slate-800 text-cyan-400 rounded-xl flex items-center justify-center mx-auto mb-3">
        <Mic className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-200 mb-1">
        Voice-Based Medical Dictation
      </h3>
      <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">
        Google Speech-to-Text voice transcription pipeline for fast clinical dictation. Extension point reserved for future contributor PRs.
      </p>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-slate-400 text-xs rounded-full border border-slate-700">
        <Clock className="w-3.5 h-3.5" />
        Contributor Feature Point
      </div>
    </div>
  );
}

export default VoiceInputPanel;
