import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  Play,
  RotateCcw,
  Languages,
  CheckCircle,
  HelpCircle,
  Activity,
  Terminal,
  Zap,
  Radio
} from 'lucide-react';
import { AssistantState } from './PhoneSimulator';

interface LogItem {
  id: string;
  time: string;
  tag: 'SpeechRecognizer' | 'CommandExecutor' | 'GeminiManager' | 'TextToSpeech' | 'OverlayManager';
  message: string;
  type: 'info' | 'success' | 'warn' | 'ai';
}

interface VoiceSandboxProps {
  assistantState: AssistantState;
  setAssistantState: (state: AssistantState) => void;
  lastCommand: string;
  setLastCommand: (cmd: string) => void;
  assistantReply: string;
  setAssistantReply: (reply: string) => void;
  onExecuteCommand: (prompt: string, screenText?: string) => Promise<void>;
  currentApp: string;
  setCurrentApp: (app: 'main' | 'youtube' | 'whatsapp' | 'camera' | 'dialer') => void;
  volumeLevel: number;
  setVolumeLevel: React.Dispatch<React.SetStateAction<number>>;
  isTorchOn: boolean;
  setIsTorchOn: React.Dispatch<React.SetStateAction<boolean>>;
  setYoutubeSearchQuery: (query: string) => void;
}

export const VoiceSandbox: React.FC<VoiceSandboxProps> = ({
  assistantState,
  setAssistantState,
  lastCommand,
  setLastCommand,
  assistantReply,
  setAssistantReply,
  onExecuteCommand,
  currentApp,
  setCurrentApp,
  volumeLevel,
  setVolumeLevel,
  isTorchOn,
  setIsTorchOn,
  setYoutubeSearchQuery,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'bn-BD' | 'bn-IN' | 'en-US'>('bn-BD');
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [includeScreenContext, setIncludeScreenContext] = useState(true);
  const [logs, setLogs] = useState<LogItem[]>([
    {
      id: '1',
      time: '09:41:00',
      tag: 'OverlayManager',
      message: 'PoojaOverlayManager initialized (TYPE_APPLICATION_OVERLAY)',
      type: 'info',
    },
    {
      id: '2',
      time: '09:41:01',
      tag: 'TextToSpeech',
      message: 'TTS initialized with Bengali (bn_BD) & English fallback',
      type: 'success',
    },
    {
      id: '3',
      time: '09:41:02',
      tag: 'SpeechRecognizer',
      message: 'SpeechRecognizer ready for primary bn-BD and additional en-US',
      type: 'info',
    },
  ]);

  const addLog = (
    tag: LogItem['tag'],
    message: string,
    type: LogItem['type'] = 'info'
  ) => {
    const time = new Date().toTimeString().split(' ')[0];
    setLogs((prev) => [
      { id: Math.random().toString(), time, tag, message, type },
      ...prev.slice(0, 40),
    ]);
  };

  // Web Speech API recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const startWebSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addLog('SpeechRecognizer', 'Web Speech API is not supported in this browser.', 'warn');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setAssistantState('LISTENING');
        addLog('SpeechRecognizer', `Microphone active. Listening in ${selectedLanguage}...`, 'info');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsRecording(false);
        addLog('SpeechRecognizer', `Recognized voice: "${transcript}"`, 'success');
        handleTriggerCommand(transcript);
      };

      recognition.onerror = (event: any) => {
        setIsRecording(false);
        setAssistantState('IDLE');
        addLog('SpeechRecognizer', `Recognition error: ${event.error}`, 'warn');
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err: any) {
      setIsRecording(false);
      setAssistantState('IDLE');
      addLog('SpeechRecognizer', `Error starting mic: ${err.message}`, 'warn');
    }
  };

  const handleTriggerCommand = async (command: string) => {
    if (!command.trim()) return;

    setLastCommand(command);
    setInputText('');
    setAssistantState('PROCESSING');
    addLog('CommandExecutor', `Evaluating command: "${command}"`, 'info');

    const lower = command.toLowerCase();

    // 1. YouTube Intent Automation
    if (
      lower.includes('youtube') ||
      lower.includes('ইউটিউব') ||
      lower.includes('গান চালাও') ||
      lower.includes('ভিডিও')
    ) {
      let query = command
        .replace(/youtube|ইউটিউব|গান চালাও|প্লে করো|search|play/gi, '')
        .trim();
      if (!query) query = 'রবীন্দ্রসঙ্গীত (Bengali Songs)';

      setYoutubeSearchQuery(query);
      setCurrentApp('youtube');
      const feedback = `ইউটিউবে "${query}" সার্চ করছি এবং প্লে করছি...`;
      setAssistantReply(feedback);
      setAssistantState('SPEAKING');
      addLog(
        'CommandExecutor',
        `Dispatched Intent(ACTION_SEARCH).setPackage("com.google.android.youtube") with query "${query}"`,
        'success'
      );
      playVoiceTTS(feedback);
      return;
    }

    // 2. WhatsApp Automation
    if (lower.includes('whatsapp') || lower.includes('হোয়াটসঅ্যাপ')) {
      setCurrentApp('whatsapp');
      const feedback = 'হোয়াটসঅ্যাপ খুলছি...';
      setAssistantReply(feedback);
      setAssistantState('SPEAKING');
      addLog('CommandExecutor', 'Dispatched launch intent for com.whatsapp', 'success');
      playVoiceTTS(feedback);
      return;
    }

    // 3. Camera Automation
    if (lower.includes('camera') || lower.includes('ক্যামেরা')) {
      setCurrentApp('camera');
      const feedback = 'ক্যামেরা চালু করছি...';
      setAssistantReply(feedback);
      setAssistantState('SPEAKING');
      addLog(
        'CommandExecutor',
        'Dispatched Intent(MediaStore.ACTION_IMAGE_CAPTURE)',
        'success'
      );
      playVoiceTTS(feedback);
      return;
    }

    // 4. Phone Dialer
    if (
      lower.includes('phone') ||
      lower.includes('dial') ||
      lower.includes('ফোন') ||
      lower.includes('ডায়াল')
    ) {
      setCurrentApp('dialer');
      const feedback = 'ফোন ডায়ালার খুলছি...';
      setAssistantReply(feedback);
      setAssistantState('SPEAKING');
      addLog('CommandExecutor', 'Dispatched Intent(Intent.ACTION_DIAL)', 'success');
      playVoiceTTS(feedback);
      return;
    }

    // 5. Flashlight Toggle
    if (
      lower.includes('টর্চ') ||
      lower.includes('ফ্ল্যাশলাইট') ||
      lower.includes('torch') ||
      lower.includes('flashlight')
    ) {
      const turnOn =
        lower.includes('on') || lower.includes('জ্বালাও') || lower.includes('চালু')
          ? true
          : lower.includes('off') || lower.includes('বন্ধ')
          ? false
          : !isTorchOn;

      setIsTorchOn(turnOn);
      const feedback = turnOn
        ? 'ফ্ল্যাশলাইট জ্বালানো হয়েছে।'
        : 'ফ্ল্যাশলাইট বন্ধ করা হয়েছে।';
      setAssistantReply(feedback);
      setAssistantState('SPEAKING');
      addLog(
        'CommandExecutor',
        `CameraManager.setTorchMode(cameraId, ${turnOn})`,
        'success'
      );
      playVoiceTTS(feedback);
      return;
    }

    // 6. Volume Control
    if (lower.includes('ভলিউম') || lower.includes('volume') || lower.includes('আওয়াজ')) {
      let newVol = volumeLevel;
      let feedback = '';

      if (
        lower.includes('বাড়াও') ||
        lower.includes('up') ||
        lower.includes('increase')
      ) {
        newVol = Math.min(100, volumeLevel + 25);
        feedback = `ভলিউম বাড়ানো হয়েছে (${newVol}%)।`;
      } else if (
        lower.includes('কমাও') ||
        lower.includes('down') ||
        lower.includes('decrease')
      ) {
        newVol = Math.max(0, volumeLevel - 25);
        feedback = `ভলিউম কমানো হয়েছে (${newVol}%)।`;
      } else if (lower.includes('মিউট') || lower.includes('mute')) {
        newVol = 0;
        feedback = 'সাউন্ড মিউট করা হয়েছে।';
      } else {
        feedback = `বর্তমান ভলিউম ${volumeLevel}%।`;
      }

      setVolumeLevel(newVol);
      setAssistantReply(feedback);
      setAssistantState('SPEAKING');
      addLog(
        'CommandExecutor',
        `AudioManager.adjustStreamVolume(STREAM_MUSIC, newLevel=${newVol})`,
        'success'
      );
      playVoiceTTS(feedback);
      return;
    }

    // 7. Screen Reading via Accessibility
    if (
      lower.includes('স্ক্রিন') ||
      lower.includes('screen') ||
      lower.includes('পড়ে শোনাও')
    ) {
      addLog(
        'CommandExecutor',
        'AccessibilityService.rootInActiveWindow -> traversing AccessibilityNodeInfo hierarchy',
        'info'
      );
      let simulatedScreenText = '';
      if (currentApp === 'youtube') {
        simulatedScreenText =
          'YouTube এ দেখানো হচ্ছে: রবীন্দ্রসঙ্গীত গান, ভিউ ৪.২ মিলিয়ন, লাইক ও শেয়ার অপশন।';
      } else if (currentApp === 'whatsapp') {
        simulatedScreenText =
          'হোয়াটসঅ্যাপ চ্যাট: মা লিখেছেন "বাড়ি কখন ফিরবে বাবা? রাতের খাবার তৈরি আছে।"';
      } else {
        simulatedScreenText =
          'পূজা অ্যাসিস্ট্যান্ট হোম পেজ। সব অনুমতি সক্রিয় রয়েছে।';
      }

      const feedback = `স্ক্রিনের লেখা পড়ছি: ${simulatedScreenText}`;
      setAssistantReply(feedback);
      setAssistantState('SPEAKING');
      addLog('CommandExecutor', `Screen read complete: "${simulatedScreenText}"`, 'success');
      playVoiceTTS(feedback);
      return;
    }

    // 8. General AI Query -> Send to Gemini 3.8 Flash
    addLog(
      'GeminiManager',
      `Routing to Google Gemini API (model: gemini-3.8-flash) with Bengali persona prompt...`,
      'ai'
    );

    try {
      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: command,
          language: selectedLanguage.startsWith('bn') ? 'bn' : 'en',
          screenContext: includeScreenContext
            ? `Active screen: ${currentApp} view. Visible items: Buttons, navigation.`
            : undefined,
        }),
      });

      const data = await res.json();
      const reply = data.reply || 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি।';
      setAssistantReply(reply);
      setAssistantState('SPEAKING');
      addLog(
        'GeminiManager',
        `Gemini response received (${reply.length} chars)`,
        'ai'
      );
      playVoiceTTS(reply);
    } catch (err: any) {
      const errorMsg = 'দুঃখিত, সংযোগে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।';
      setAssistantReply(errorMsg);
      setAssistantState('SPEAKING');
      addLog('GeminiManager', `API Error: ${err.message}`, 'warn');
      playVoiceTTS(errorMsg);
    }
  };

  const playVoiceTTS = (text: string) => {
    if (!ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setTimeout(() => setAssistantState('IDLE'), 2000);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Try finding Bengali voice
    const voices = window.speechSynthesis.getVoices();
    const bnVoice =
      voices.find((v) => v.lang.includes('bn') || v.name.toLowerCase().includes('bengali') || v.name.toLowerCase().includes('bangla')) ||
      voices.find((v) => v.lang.includes('hi') || v.lang.includes('en-IN')) ||
      voices[0];

    if (bnVoice) utterance.voice = bnVoice;
    utterance.pitch = 1.05;
    utterance.rate = 0.95;

    utterance.onend = () => {
      setAssistantState('IDLE');
      addLog('TextToSpeech', 'TTS speech completed.', 'info');
    };

    utterance.onerror = () => {
      setAssistantState('IDLE');
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-5">
      {/* Voice Input & Controls Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
              <Radio className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Voice & Speech Studio</h2>
              <p className="text-xs text-slate-400">SpeechRecognizer (bn/en) + Gemini AI + TTS</p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <Languages className="w-3.5 h-3.5 text-purple-400 ml-1.5" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as any)}
              className="bg-transparent text-white font-medium focus:outline-none pr-2 py-0.5 cursor-pointer text-xs"
            >
              <option value="bn-BD" className="bg-slate-900 text-white">বাংলা (বাংলাদেশ - bn-BD)</option>
              <option value="bn-IN" className="bg-slate-900 text-white">বাংলা (ভারত - bn-IN)</option>
              <option value="en-US" className="bg-slate-900 text-white">English (US - en-US)</option>
            </select>
          </div>
        </div>

        {/* Input Bar with Mic & Send */}
        <div className="mt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTriggerCommand(inputText);
            }}
            className="flex items-center space-x-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  selectedLanguage.startsWith('bn')
                    ? 'বাংলা বা ইংরেজিতে কথা বলুন বা লিখুন (যেমন: "ইউটিউবে গান চালাও", "টর্চ জ্বালাও")...'
                    : 'Speak or type command (e.g., "Open YouTube", "Read screen", "How are you?")...'
                }
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              {inputText && (
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Mic Toggle Button */}
            <button
              type="button"
              onClick={startWebSpeechRecognition}
              disabled={isRecording}
              className={`p-3 rounded-xl border font-semibold flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                  : 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-900/30'
              }`}
              title={speechSupported ? 'Click to speak via microphone' : 'Microphone requires Chrome/Edge'}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || assistantState === 'PROCESSING'}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>

          {/* Quick options: TTS audio toggle & Screen Context */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <label className="flex items-center space-x-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={ttsEnabled}
                onChange={(e) => setTtsEnabled(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500"
              />
              <span>Text-To-Speech (ভয়েস অডিও বাজান)</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={includeScreenContext}
                onChange={(e) => setIncludeScreenContext(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500"
              />
              <span>Include Screen Context (AccessibilityNodeInfo)</span>
            </label>
          </div>
        </div>

        {/* Preset Command Chips for Instant Testing */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <p className="text-xs font-semibold text-purple-300 mb-2.5 flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>দ্রুত ভয়েস কমান্ড পরীক্ষা করুন (Click to test):</span>
          </p>

          <div className="flex flex-wrap gap-2 text-xs">
            {/* YouTube */}
            <button
              onClick={() => handleTriggerCommand('ইউটিউবে রবীন্দ্রসঙ্গীত গান চালাও')}
              className="bg-slate-950 hover:bg-purple-950/40 text-slate-300 hover:text-purple-200 border border-slate-800 hover:border-purple-500/40 px-3 py-1.5 rounded-lg transition-all text-left flex items-center space-x-1"
            >
              <span>🎵</span>
              <span>ইউটিউবে রবীন্দ্রসঙ্গীত চালাও</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={() => handleTriggerCommand('হোয়াটসঅ্যাপ খোলো')}
              className="bg-slate-950 hover:bg-emerald-950/40 text-slate-300 hover:text-emerald-200 border border-slate-800 hover:border-emerald-500/40 px-3 py-1.5 rounded-lg transition-all text-left flex items-center space-x-1"
            >
              <span>💬</span>
              <span>হোয়াটসঅ্যাপ খোলো</span>
            </button>

            {/* Flashlight */}
            <button
              onClick={() => handleTriggerCommand('ফ্ল্যাশলাইট জ্বালাও')}
              className="bg-slate-950 hover:bg-amber-950/40 text-slate-300 hover:text-amber-200 border border-slate-800 hover:border-amber-500/40 px-3 py-1.5 rounded-lg transition-all text-left flex items-center space-x-1"
            >
              <span>🔦</span>
              <span>ফ্ল্যাশলাইট জ্বালাও</span>
            </button>

            {/* Volume */}
            <button
              onClick={() => handleTriggerCommand('ভলিউম বাড়াও')}
              className="bg-slate-950 hover:bg-blue-950/40 text-slate-300 hover:text-blue-200 border border-slate-800 hover:border-blue-500/40 px-3 py-1.5 rounded-lg transition-all text-left flex items-center space-x-1"
            >
              <span>🔊</span>
              <span>ভলিউম বাড়াও</span>
            </button>

            {/* Read Screen */}
            <button
              onClick={() => handleTriggerCommand('স্ক্রিন পড়ে শোনাও')}
              className="bg-slate-950 hover:bg-purple-950/40 text-slate-300 hover:text-purple-200 border border-slate-800 hover:border-purple-500/40 px-3 py-1.5 rounded-lg transition-all text-left flex items-center space-x-1"
            >
              <span>📜</span>
              <span>স্ক্রিন পড়ে শোনাও</span>
            </button>

            {/* Gemini Knowledge */}
            <button
              onClick={() => handleTriggerCommand('পূজা, তুমি কেমন আছো এবং আমাকে কি কি সাহায্য করতে পারবে?')}
              className="bg-purple-900/30 hover:bg-purple-800/40 text-purple-200 border border-purple-500/40 px-3 py-1.5 rounded-lg transition-all text-left flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>পূজা, তুমি কেমন আছো?</span>
            </button>

            <button
              onClick={() => handleTriggerCommand('ঢাকা থেকে সুন্দরবন যাওয়ার সেরা উপায় কি?')}
              className="bg-purple-900/30 hover:bg-purple-800/40 text-purple-200 border border-purple-500/40 px-3 py-1.5 rounded-lg transition-all text-left flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>সুন্দরবন যাওয়ার উপায় কি?</span>
            </button>

            <button
              onClick={() => handleTriggerCommand('What are the three laws of robotics in English?')}
              className="bg-indigo-900/30 hover:bg-indigo-800/40 text-indigo-200 border border-indigo-500/40 px-3 py-1.5 rounded-lg transition-all text-left flex items-center space-x-1"
            >
              <span>🌐</span>
              <span>Three laws of robotics?</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Android Logcat & Intent Event Stream */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-mono font-bold text-slate-200">
              Android Logcat & Intent Dispatcher Monitor
            </h3>
          </div>
          <button
            onClick={() => setLogs([])}
            className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800"
          >
            Clear Log
          </button>
        </div>

        <div className="p-3 max-h-56 overflow-y-auto font-mono text-[11px] space-y-1.5 bg-black/60">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-2 leading-relaxed">
              <span className="text-slate-600 shrink-0">{log.time}</span>
              <span
                className={`font-semibold shrink-0 px-1 py-0.2 rounded text-[10px] ${
                  log.tag === 'SpeechRecognizer'
                    ? 'bg-blue-900/40 text-blue-300'
                    : log.tag === 'CommandExecutor'
                    ? 'bg-emerald-900/40 text-emerald-300'
                    : log.tag === 'GeminiManager'
                    ? 'bg-purple-900/40 text-purple-300'
                    : log.tag === 'TextToSpeech'
                    ? 'bg-pink-900/40 text-pink-300'
                    : 'bg-amber-900/40 text-amber-300'
                }`}
              >
                [{log.tag}]
              </span>
              <span
                className={
                  log.type === 'success'
                    ? 'text-emerald-300'
                    : log.type === 'ai'
                    ? 'text-purple-300'
                    : log.type === 'warn'
                    ? 'text-amber-400'
                    : 'text-slate-300'
                }
              >
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
