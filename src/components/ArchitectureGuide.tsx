import React, { useState } from 'react';
import {
  BookOpen,
  Terminal,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Smartphone,
  Shield,
  Workflow
} from 'lucide-react';

export const ArchitectureGuide: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const adbCommands = `# 1. Grant Audio Recording Permission
adb shell pm grant com.pooja.assistant android.permission.RECORD_AUDIO

# 2. Grant Overlay Window Permission (Draw over other apps)
adb shell appops set com.pooja.assistant SYSTEM_ALERT_WINDOW allow

# 3. Enable Pooja Accessibility Service
adb shell settings put secure enabled_accessibility_services com.pooja.assistant/com.pooja.assistant.PoojaAccessibilityService
adb shell settings put secure accessibility_enabled 1`;

  const gradleBuildCommand = `# Build debug APK from project root
./gradlew assembleDebug

# Output APK path:
# app/build/outputs/apk/debug/app-debug.apk`;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2.5">
          <Workflow className="w-5 h-5 text-purple-400" />
          <span>Pooja Assistant: System Architecture & Android Engineering Guide</span>
        </h2>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          Pooja Assistant is architected for Android 10 (API 29) through Android 15+ (API 35), utilizing
          a decoupled, reactive architecture. It bridges Android's <span className="text-purple-300 font-semibold">AccessibilityService</span>,{' '}
          <span className="text-purple-300 font-semibold">WindowManager overlays</span>, native{' '}
          <span className="text-purple-300 font-semibold">SpeechRecognizer</span> with dual Bengali/English acoustic models,
          and the <span className="text-purple-300 font-semibold">Google Generative AI (Gemini) SDK</span>.
        </p>
      </div>

      {/* 4 Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs">
            1
          </div>
          <h3 className="text-xs font-bold text-white">Floating Overlay Window</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Constructed with <code className="text-purple-300 font-mono text-[10px]">WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY</code>.
            Attaches a draggable touch listener that intercepts drag gestures without blocking underlying apps.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
            2
          </div>
          <h3 className="text-xs font-bold text-white">Bilingual Voice Engine</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Native <code className="text-emerald-300 font-mono text-[10px]">SpeechRecognizer</code> initialized with primary{' '}
            <code className="text-emerald-300 font-mono text-[10px]">bn-BD</code> / <code className="text-emerald-300 font-mono text-[10px]">bn-IN</code>{' '}
            and additional <code className="text-emerald-300 font-mono text-[10px]">en-US</code>. Paired with natural Bengali TTS.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400 font-bold text-xs">
            3
          </div>
          <h3 className="text-xs font-bold text-white">Accessibility Automation</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Traverses the active window's <code className="text-pink-300 font-mono text-[10px]">AccessibilityNodeInfo</code> tree to
            read visible text on any app. Dispatches intents for YouTube, WhatsApp, camera, and device quick toggles.
          </p>
        </div>

        {/* Pillar 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
            4
          </div>
          <h3 className="text-xs font-bold text-white">Google Gemini AI SDK</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Integrates <code className="text-indigo-300 font-mono text-[10px]">com.google.ai.client.generativeai:generativeai</code>.
            Configured with a custom Bengali system prompt for warm conversational voice responses.
          </p>
        </div>
      </div>

      {/* Architecture Flow Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          <span>Voice Execution & Intent Dispatch Pipeline</span>
        </h3>

        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 overflow-x-auto text-xs text-slate-300 font-mono leading-relaxed">
          <div className="min-w-[650px] space-y-3">
            <div className="flex items-center space-x-2 text-purple-400 font-bold">
              <span>[1. User Trigger]</span>
              <span>Floating Overlay Mic Bubble OR Accessibility Button</span>
            </div>
            <div className="pl-6 text-slate-400">
              ↓ Calls <span className="text-white">PoojaAccessibilityService.startListeningForVoiceCommand()</span>
            </div>

            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <span>[2. Speech-to-Text]</span>
              <span>VoiceManager.listen() via Android SpeechRecognizer</span>
            </div>
            <div className="pl-6 text-slate-400">
              ↓ Language Intent: <span className="text-emerald-300">"bn-BD"</span> with fallback to <span className="text-emerald-300">"en-US"</span>
            </div>

            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <span>[3. Intent Routing]</span>
              <span>CommandExecutor.tryExecuteCommand(recognizedText)</span>
            </div>

            <div className="pl-6 grid grid-cols-2 gap-3 text-[11px]">
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg space-y-1">
                <span className="text-emerald-300 font-bold block">Case A: Device Automation Match</span>
                <p>• YouTube: <code className="text-slate-400">Intent(ACTION_SEARCH).setPackage("com.google.android.youtube")</code></p>
                <p>• Flashlight: <code className="text-slate-400">CameraManager.setTorchMode(cameraId, true/false)</code></p>
                <p>• Volume: <code className="text-slate-400">AudioManager.adjustStreamVolume(STREAM_MUSIC, ...)</code></p>
                <p>• Read Screen: <code className="text-slate-400">rootInActiveWindow.findAccessibilityNodeInfosByViewId()</code></p>
                <p>• App Launch: <code className="text-slate-400">packageManager.getLaunchIntentForPackage()</code></p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg space-y-1">
                <span className="text-purple-300 font-bold block">Case B: AI Knowledge / General Query</span>
                <p>• Dispatches to <code className="text-slate-400">GeminiManager.generateResponse()</code></p>
                <p>• Attaches visible screen context if query asks about screen</p>
                <p>• Formatted with Bengali persona system instruction</p>
                <p>• Max tokens constrained (250) for fast spoken output</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-pink-400 font-bold">
              <span>[4. Voice Synthesis]</span>
              <span>VoiceManager.speak() via Android TextToSpeech</span>
            </div>
            <div className="pl-6 text-slate-400">
              ↓ Native TTS engine speaks Bengali audio with UtteranceProgressListener state feedback
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Commands: ADB & Gradle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ADB Quick Permissions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  ADB Fast Permission Grant
                </h3>
              </div>
              <button
                onClick={() => copyToClipboard(adbCommands, 'adb')}
                className="flex items-center space-x-1 text-slate-400 hover:text-white text-xs bg-slate-800 px-2 py-1 rounded"
              >
                {copiedSection === 'adb' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'adb' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Run these commands in terminal to grant microphone, overlay, and accessibility permissions in 1 second on emulator or USB connected phone:
            </p>
            <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
              {adbCommands}
            </pre>
          </div>
        </div>

        {/* Gradle Build & Run */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Gradle Build & CI Pipeline
                </h3>
              </div>
              <button
                onClick={() => copyToClipboard(gradleBuildCommand, 'gradle')}
                className="flex items-center space-x-1 text-slate-400 hover:text-white text-xs bg-slate-800 px-2 py-1 rounded"
              >
                {copiedSection === 'gradle' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'gradle' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Compiled with Kotlin 1.9, Java 17, and Gradle 8.5. Ready for GitHub Actions CI build:
            </p>
            <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-purple-300 overflow-x-auto leading-relaxed">
              {gradleBuildCommand}
            </pre>
          </div>
        </div>
      </div>

      {/* Android 10 to Android 15 Compatibility Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Production Android 10 (API 29) to Android 15+ (API 35) Compatibility Checklist</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Android 14+ Foreground Service</span>
            </span>
            <p className="text-[11px] text-slate-400">
              Includes <code className="text-purple-300 font-mono text-[10px]">FOREGROUND_SERVICE_MICROPHONE</code> in manifest as mandated by Google Play on API 34+.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Package Visibility (&lt;queries&gt;)</span>
            </span>
            <p className="text-[11px] text-slate-400">
              Android 11+ package filtering is handled via <code className="text-purple-300 font-mono text-[10px]">&lt;queries&gt;</code> tags for YouTube, WhatsApp, and Camera.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Dynamic WindowManager Overlay</span>
            </span>
            <p className="text-[11px] text-slate-400">
              Detects SDK version to apply <code className="text-purple-300 font-mono text-[10px]">TYPE_APPLICATION_OVERLAY</code> safely without deprecation warnings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
