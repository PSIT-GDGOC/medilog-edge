import React from 'react';
import { AIScreeningPanel } from '../features/ai';
import { VoiceInputPanel } from '../features/voice';
import { Cpu, Layers, GitPullRequest, Code2 } from 'lucide-react';

export function ExtensionsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-100">
            Edge AI & Voice Extensibility Architecture
          </h1>
          <span className="text-[10px] font-semibold px-2 py-0.5 bg-teal-950 text-teal-300 rounded-md border border-teal-800">
            Roadmap Extension Points
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Clean integration boundaries reserved for future open-source contributor pull requests and feature issues.
        </p>
      </div>

      {/* Overview Card */}
      <div className="card-panel p-5 space-y-3">
        <div className="flex items-center gap-2.5 text-slate-200">
          <Layers className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-semibold">Modular Extension Boundaries</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          The MediLog Edge core MVP has been intentionally engineered with isolated directory structures (<code className="text-teal-400 bg-slate-950 px-1.5 py-0.5 rounded">client/src/features/ai</code>, <code className="text-teal-400 bg-slate-950 px-1.5 py-0.5 rounded">client/src/features/voice</code>, and <code className="text-teal-400 bg-slate-950 px-1.5 py-0.5 rounded">client/src/services/ai</code>). This architecture enables student contributors to implement on-device TensorFlow.js inference and Google Speech-to-Text pipelines without touching or risking core patient management or offline sync subsystems.
        </p>
      </div>

      {/* Visual panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AIScreeningPanel />
        <VoiceInputPanel />
      </div>

      {/* Architecture specifications */}
      <div className="card-panel p-5 space-y-3">
        <div className="flex items-center gap-2 text-slate-200">
          <Code2 className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-semibold">Future Contributor Interface Contracts</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
            <span className="font-semibold text-teal-400">1. Edge AI Interface</span>
            <p className="text-slate-400">
              Future PRs will mount camera capture streams directly to WebGL TFJS backends, processing image tensors on-device for preliminary clinical screening without requiring internet connectivity.
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
            <span className="font-semibold text-cyan-400">2. Voice Dictation Interface</span>
            <p className="text-slate-400">
              Future PRs will integrate audio recording buffers with Google Cloud Speech-to-Text and Gemini structured JSON extraction, auto-filling patient clinical encounter fields.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExtensionsPage;
