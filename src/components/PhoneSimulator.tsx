import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Volume2,
  VolumeX,
  Flashlight,
  Video,
  MessageCircle,
  Camera,
  Phone,
  FileText,
  Sparkles,
  ArrowLeft,
  Search,
  Play,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Layers,
  Info
} from 'lucide-react';

export type AssistantState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING';

interface PhoneSimulatorProps {
  assistantState: AssistantState;
  setAssistantState: (state: AssistantState) => void;
  lastCommand: string;
  assistantReply: string;
  onTriggerVoice: (customPrompt?: string) => void;
  volumeLevel: number;
  setVolumeLevel: React.Dispatch<React.SetStateAction<number>>;
  isTorchOn: boolean;
  setIsTorchOn: React.Dispatch<React.SetStateAction<boolean>>;
  currentApp: 'main' | 'youtube' | 'whatsapp' | 'camera' | 'dialer';
  setCurrentApp: (app: 'main' | 'youtube' | 'whatsapp' | 'camera' | 'dialer') => void;
  youtubeSearchQuery: string;
  isOverlayVisible: boolean;
  setIsOverlayVisible: (val: boolean) => void;
  isAccessibilityActive: boolean;
  setIsAccessibilityActive: (val: boolean) => void;
  isAudioPermissionGranted: boolean;
  setIsAudioPermissionGranted: (val: boolean) => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  assistantState,
  setAssistantState,
  lastCommand,
  assistantReply,
  onTriggerVoice,
  volumeLevel,
  setVolumeLevel,
  isTorchOn,
  setIsTorchOn,
  currentApp,
  setCurrentApp,
  youtubeSearchQuery,
  isOverlayVisible,
  setIsOverlayVisible,
  isAccessibilityActive,
  setIsAccessibilityActive,
  isAudioPermissionGranted,
  setIsAudioPermissionGranted,
}) => {
  // Draggable floating bubble coordinates within the phone mockup
  const [bubblePos, setBubblePos] = useState({ x: 260, y: 160 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0, hasMoved: false });
  const phoneScreenRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: bubblePos.x,
      startY: bubblePos.y,
      hasMoved: false,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragStartRef.current.hasMoved = true;
      }
      const newX = Math.max(10, Math.min(290, dragStartRef.current.startX + dx));
      const newY = Math.max(40, Math.min(560, dragStartRef.current.startY + dy));
      setBubblePos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        if (!dragStartRef.current.hasMoved) {
          // It was a tap, trigger voice listening
          onTriggerVoice();
        }
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onTriggerVoice]);

  // Screen reading extraction simulation: returns text visible in current screen
  const getSimulatedScreenText = () => {
    switch (currentApp) {
      case 'main':
        return 'Pooja Assistant Settings. Audio permission: Granted. Floating overlay: Active. Accessibility Service: Active. Tap the mic button to start voice control.';
      case 'youtube':
        return `YouTube App. Searching for ${youtubeSearchQuery || 'Bengali Songs'}. Playing Rabindra Sangeet - Purano Shei Diner Kotha. 4.2M views. Like, Share, Subscribe.`;
      case 'whatsapp':
        return 'WhatsApp Messenger. Chat with Maa: "বাড়ি কখন ফিরবে বাবা? রাতের খাবার তৈরি আছে।" Unread messages: 2.';
      case 'camera':
        return 'Android Camera 4K HDR. Mode: Photo. Flash: Auto. Shutter ready.';
      case 'dialer':
        return 'Phone Dialer. Emergency contacts: Home, Ambulance 102, Police 100.';
      default:
        return 'Android 14 Home Screen.';
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Phone chassis */}
      <div className="relative w-[340px] h-[690px] bg-slate-900 rounded-[48px] p-3 shadow-2xl shadow-purple-950/40 border-[6px] border-slate-700/80 ring-1 ring-slate-800">
        {/* Physical side buttons */}
        <div className="absolute -left-3 top-28 w-1 h-12 bg-slate-600 rounded-l-md" />
        <div className="absolute -left-3 top-44 w-1 h-12 bg-slate-600 rounded-l-md" />
        <div className="absolute -right-3 top-32 w-1 h-16 bg-slate-600 rounded-r-md" />

        {/* Torch Beam effect when flashlight is on */}
        {isTorchOn && (
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-48 h-32 bg-yellow-200/20 blur-xl pointer-events-none rounded-full" />
        )}

        {/* Screen container */}
        <div
          ref={phoneScreenRef}
          className="relative w-full h-full bg-slate-950 rounded-[38px] overflow-hidden flex flex-col select-none border border-slate-800"
        >
          {/* Status Bar */}
          <div className="h-8 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between text-[11px] font-medium text-slate-300 z-30 shrink-0">
            <span>09:41</span>
            {/* Notch / Camera hole */}
            <div className="w-4 h-4 bg-black rounded-full ring-2 ring-slate-800" />
            <div className="flex items-center space-x-1.5">
              {isTorchOn && <Flashlight className="w-3 h-3 text-amber-400 animate-pulse" />}
              <span className="text-[10px]">5G</span>
              <div className="w-5 h-2.5 border border-slate-400 rounded-sm p-0.5 flex items-center">
                <div className="h-full bg-emerald-400 rounded-xs w-4" />
              </div>
            </div>
          </div>

          {/* Quick Notification / Volume Bar */}
          <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between text-xs text-slate-400 z-20">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-purple-300 font-semibold">Pooja Service:</span>
              <span className="text-[10px] text-emerald-400 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                Active
              </span>
            </div>
            <div className="flex items-center space-x-1 text-[11px]">
              <Volume2 className="w-3 h-3 text-slate-400" />
              <span className="font-mono text-white">{volumeLevel}%</span>
            </div>
          </div>

          {/* App Views Area */}
          <div className="flex-1 overflow-y-auto relative bg-slate-950 pb-12">
            {/* 1. MAIN APP / POOJA CONFIG SCREEN */}
            {currentApp === 'main' && (
              <div className="p-4 space-y-3.5">
                {/* Branding Card */}
                <div className="bg-gradient-to-br from-purple-900/50 via-slate-900 to-slate-900 border border-purple-500/30 rounded-2xl p-4 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 shadow-lg shadow-purple-600/30">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                      <Mic className="w-7 h-7 text-purple-400" />
                    </div>
                  </div>
                  <h2 className="mt-2 text-base font-bold text-white">Pooja Assistant</h2>
                  <p className="text-[11px] text-purple-300">বাংলা ও ইংরেজি ভয়েস সহকারী</p>
                </div>

                {/* Permissions Toggles in App */}
                <div className="space-y-2 text-xs">
                  {/* Audio */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white text-[11px]">মাইক্রোফোন (Audio)</p>
                      <p className="text-[10px] text-slate-400">SpeechRecognizer (bn-BD / en)</p>
                    </div>
                    <button
                      onClick={() => setIsAudioPermissionGranted(!isAudioPermissionGranted)}
                      className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all ${
                        isAudioPermissionGranted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {isAudioPermissionGranted ? 'অনুমোদিত' : 'অনুমতি দিন'}
                    </button>
                  </div>

                  {/* Overlay */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white text-[11px]">ডিসপ্লে ওভারলে (Overlay)</p>
                      <p className="text-[10px] text-slate-400">Floating Mic on all screens</p>
                    </div>
                    <button
                      onClick={() => setIsOverlayVisible(!isOverlayVisible)}
                      className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all ${
                        isOverlayVisible
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {isOverlayVisible ? 'সক্রিয়' : 'চালু করুন'}
                    </button>
                  </div>

                  {/* Accessibility */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white text-[11px]">অ্যাক্সেসিবিলিটি সার্ভিস</p>
                      <p className="text-[10px] text-slate-400">Screen reader & App launcher</p>
                    </div>
                    <button
                      onClick={() => setIsAccessibilityActive(!isAccessibilityActive)}
                      className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all ${
                        isAccessibilityActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {isAccessibilityActive ? 'সক্রিয়' : 'অন করুন'}
                    </button>
                  </div>
                </div>

                {/* Direct Trigger Button */}
                <button
                  onClick={() => onTriggerVoice()}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-900/40 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>পূজার সাথে কথা বলুন</span>
                </button>

                {/* Quick App Shortcuts for Testing Automation */}
                <div className="pt-1">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">
                    টেস্ট অ্যাপ লঞ্চার (App Intents)
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => setCurrentApp('youtube')}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2 rounded-xl flex flex-col items-center space-y-1 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center">
                        <Video className="w-3.5 h-3.5 text-red-400" />
                      </div>
                      <span className="text-[9px] text-slate-300">YouTube</span>
                    </button>
                    <button
                      onClick={() => setCurrentApp('whatsapp')}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2 rounded-xl flex flex-col items-center space-y-1 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <span className="text-[9px] text-slate-300">WhatsApp</span>
                    </button>
                    <button
                      onClick={() => setCurrentApp('camera')}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2 rounded-xl flex flex-col items-center space-y-1 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                        <Camera className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <span className="text-[9px] text-slate-300">Camera</span>
                    </button>
                    <button
                      onClick={() => setCurrentApp('dialer')}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2 rounded-xl flex flex-col items-center space-y-1 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                        <Phone className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <span className="text-[9px] text-slate-300">Dialer</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. YOUTUBE APP SIMULATION */}
            {currentApp === 'youtube' && (
              <div className="p-3 space-y-3">
                <div className="flex items-center space-x-2 text-white">
                  <button onClick={() => setCurrentApp('main')} className="p-1 rounded-lg bg-slate-800">
                    <ArrowLeft className="w-4 h-4 text-slate-300" />
                  </button>
                  <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 flex items-center space-x-1.5 text-xs text-slate-300">
                    <Search className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{youtubeSearchQuery || 'Bengali Songs'}</span>
                  </div>
                </div>

                {/* Video Player Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="w-full h-36 bg-gradient-to-tr from-slate-900 via-red-950 to-slate-900 relative flex items-center justify-center group">
                    <div className="w-12 h-12 rounded-full bg-red-600/80 flex items-center justify-center shadow-lg shadow-red-600/40">
                      <Play className="w-6 h-6 text-white ml-0.5" />
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/80 text-[9px] px-1.5 py-0.5 rounded text-white font-mono">
                      04:12
                    </span>
                  </div>
                  <div className="p-2.5">
                    <h3 className="text-xs font-bold text-white line-clamp-1">
                      {youtubeSearchQuery ? `Playing: ${youtubeSearchQuery}` : 'পুরনো সেই দিনের কথা • রবীন্দ্রসঙ্গীত'}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Geetanjali Music • 4.2M views</p>
                  </div>
                </div>

                {/* Simulated Accessibility Screen Node Preview */}
                <div className="bg-purple-950/30 border border-purple-500/20 rounded-xl p-2.5">
                  <div className="flex items-center space-x-1.5 text-purple-300 text-[10px] font-bold">
                    <FileText className="w-3 h-3" />
                    <span>AccessibilityNodeInfo Text on Screen:</span>
                  </div>
                  <p className="text-[10px] text-slate-300 mt-1 italic leading-relaxed">
                    "{getSimulatedScreenText()}"
                  </p>
                </div>
              </div>
            )}

            {/* 3. WHATSAPP SIMULATION */}
            {currentApp === 'whatsapp' && (
              <div className="p-3 space-y-3">
                <div className="flex items-center space-x-2 text-white">
                  <button onClick={() => setCurrentApp('main')} className="p-1 rounded-lg bg-slate-800">
                    <ArrowLeft className="w-4 h-4 text-slate-300" />
                  </button>
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white">
                      M
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">Maa (মা)</p>
                      <p className="text-[9px] text-emerald-400 leading-tight">Online</p>
                    </div>
                  </div>
                </div>

                {/* Chat bubbles */}
                <div className="space-y-2 text-xs pt-2">
                  <div className="bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl rounded-tl-xs p-2.5 max-w-[85%] text-[11px]">
                    বাড়ি কখন ফিরবে বাবা? রাতের খাবার তৈরি আছে।
                    <span className="block text-[8px] text-slate-500 text-right mt-1">09:30 PM</span>
                  </div>
                  <div className="bg-emerald-800/60 text-white rounded-2xl rounded-tr-xs p-2.5 max-w-[85%] ml-auto text-[11px]">
                    হ্যাঁ মা, আর ১৫ মিনিটের মধ্যে পৌঁছাচ্ছি!
                    <span className="block text-[8px] text-emerald-300 text-right mt-1">09:35 PM</span>
                  </div>
                </div>

                {/* Accessibility screen node info */}
                <div className="bg-purple-950/30 border border-purple-500/20 rounded-xl p-2.5 mt-4">
                  <div className="flex items-center space-x-1.5 text-purple-300 text-[10px] font-bold">
                    <FileText className="w-3 h-3" />
                    <span>স্ক্রিনের তথ্য (AccessibilityNodeInfo):</span>
                  </div>
                  <p className="text-[10px] text-slate-300 mt-1 italic">
                    "{getSimulatedScreenText()}"
                  </p>
                </div>
              </div>
            )}

            {/* 4. CAMERA SIMULATION */}
            {currentApp === 'camera' && (
              <div className="h-full flex flex-col justify-between p-3">
                <div className="flex items-center justify-between text-white">
                  <button onClick={() => setCurrentApp('main')} className="p-1 rounded-lg bg-slate-800">
                    <ArrowLeft className="w-4 h-4 text-slate-300" />
                  </button>
                  <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                    Camera Active
                  </span>
                </div>
                <div className="w-full h-64 bg-slate-900/60 border border-dashed border-slate-700 rounded-2xl flex items-center justify-center flex-col text-slate-400 space-y-2">
                  <Camera className="w-10 h-10 text-purple-400 animate-pulse" />
                  <span className="text-[11px]">Android 14 Camera Intent Opened</span>
                </div>
                <div className="flex justify-center pb-2">
                  <div className="w-14 h-14 rounded-full border-4 border-white flex items-center justify-center cursor-pointer hover:scale-95 transition-transform">
                    <div className="w-10 h-10 rounded-full bg-white" />
                  </div>
                </div>
              </div>
            )}

            {/* 5. DIALER SIMULATION */}
            {currentApp === 'dialer' && (
              <div className="p-3 space-y-3">
                <div className="flex items-center space-x-2 text-white">
                  <button onClick={() => setCurrentApp('main')} className="p-1 rounded-lg bg-slate-800">
                    <ArrowLeft className="w-4 h-4 text-slate-300" />
                  </button>
                  <span className="text-xs font-bold">Phone Dialer Intent</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                  <span className="text-lg font-mono text-purple-300 font-bold">+91 98765 43210</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                    <div
                      key={digit}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-800 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer"
                    >
                      {digit}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DRAGGABLE FLOATING OVERLAY MIC BUBBLE */}
            {isOverlayVisible && (
              <div
                style={{
                  transform: `translate3d(${bubblePos.x}px, ${bubblePos.y}px, 0)`,
                }}
                onMouseDown={handleMouseDown}
                className="absolute top-0 left-0 z-40 cursor-grab active:cursor-grabbing transition-transform duration-75"
              >
                <div className="relative group">
                  {/* Floating bubble aura & pulse */}
                  {assistantState === 'LISTENING' && (
                    <div className="absolute -inset-3 bg-pink-500/30 rounded-full blur-md animate-ping" />
                  )}
                  {assistantState === 'PROCESSING' && (
                    <div className="absolute -inset-2 bg-purple-500/40 rounded-full blur-sm animate-spin" />
                  )}
                  {assistantState === 'SPEAKING' && (
                    <div className="absolute -inset-2 bg-emerald-500/30 rounded-full blur-sm animate-pulse" />
                  )}

                  {/* Bubble button */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl border-2 transition-all ${
                      assistantState === 'LISTENING'
                        ? 'bg-gradient-to-tr from-pink-600 to-rose-500 border-pink-300 scale-110 shadow-pink-600/50'
                        : assistantState === 'PROCESSING'
                        ? 'bg-gradient-to-tr from-purple-700 to-indigo-600 border-purple-300 scale-105'
                        : assistantState === 'SPEAKING'
                        ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 border-emerald-300 scale-105'
                        : 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-800 border-purple-300/80 shadow-purple-950/60'
                    }`}
                  >
                    <Mic className="w-5 h-5 text-white drop-shadow" />
                  </div>

                  {/* Floating Tag */}
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] text-purple-300 font-semibold border border-purple-500/20 pointer-events-none">
                    Pooja Mic
                  </div>
                </div>
              </div>
            )}

            {/* LIVE ASSISTANT INTERACTION DIALOG OVERLAY (When listening / processing / speaking) */}
            {assistantState !== 'IDLE' && (
              <div className="absolute inset-x-2 bottom-8 bg-slate-900/95 backdrop-blur-xl border border-purple-500/40 rounded-2xl p-3 shadow-2xl z-30 space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        assistantState === 'LISTENING'
                          ? 'bg-pink-400 animate-ping'
                          : assistantState === 'PROCESSING'
                          ? 'bg-purple-400 animate-spin'
                          : 'bg-emerald-400 animate-pulse'
                      }`}
                    />
                    <span className="text-[11px] font-bold text-white">
                      {assistantState === 'LISTENING' && 'পূজা শুনছে... (Listening)'}
                      {assistantState === 'PROCESSING' && 'বিশ্লেষণ হচ্ছে... (Gemini Processing)'}
                      {assistantState === 'SPEAKING' && 'পূজা বলছে... (TTS Speaking)'}
                    </span>
                  </div>
                  <button
                    onClick={() => setAssistantState('IDLE')}
                    className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 bg-slate-800 rounded"
                  >
                    বন্ধ করুন
                  </button>
                </div>

                {lastCommand && (
                  <div className="bg-slate-950/70 rounded-lg p-2 text-[11px] text-slate-300 border border-slate-800">
                    <span className="text-purple-400 font-semibold block text-[9px]">আপনি বললেন:</span>
                    "{lastCommand}"
                  </div>
                )}

                {assistantReply && (
                  <div className="bg-purple-950/40 rounded-lg p-2 text-[11px] text-purple-200 border border-purple-500/30">
                    <span className="text-emerald-400 font-semibold block text-[9px]">পূজার উত্তর (বাংলা/English):</span>
                    {assistantReply}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Android Bottom Navigation Bar */}
          <div className="h-10 bg-slate-950/90 border-t border-slate-900 px-8 flex items-center justify-around z-30 shrink-0">
            {/* Back */}
            <button
              onClick={() => setCurrentApp('main')}
              className="text-slate-500 hover:text-white transition-colors"
              title="Back"
            >
              <div className="w-3.5 h-3.5 border-t-2 border-l-2 border-current -rotate-45" />
            </button>
            {/* Home */}
            <button
              onClick={() => setCurrentApp('main')}
              className="w-3.5 h-3.5 rounded-full border-2 border-slate-500 hover:border-white transition-colors"
              title="Home"
            />
            {/* Recent Apps */}
            <button
              onClick={() => setCurrentApp(currentApp === 'youtube' ? 'whatsapp' : 'youtube')}
              className="w-3.5 h-3.5 border-2 border-slate-500 hover:border-white rounded-xs transition-colors"
              title="Recents"
            />
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-3 text-center">
        💡 <span className="font-semibold text-purple-300">Drag</span> the floating mic anywhere on the screen, or{' '}
        <span className="font-semibold text-purple-300">Tap</span> it to speak!
      </p>
    </div>
  );
};
