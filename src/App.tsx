/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { PhoneSimulator, AssistantState } from './components/PhoneSimulator';
import { VoiceSandbox } from './components/VoiceSandbox';
import { CodeExplorer } from './components/CodeExplorer';
import { ArchitectureGuide } from './components/ArchitectureGuide';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'architecture'>('simulator');

  // Shared Assistant States
  const [assistantState, setAssistantState] = useState<AssistantState>('IDLE');
  const [lastCommand, setLastCommand] = useState<string>('');
  const [assistantReply, setAssistantReply] = useState<string>('');
  const [volumeLevel, setVolumeLevel] = useState<number>(75);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [currentApp, setCurrentApp] = useState<'main' | 'youtube' | 'whatsapp' | 'camera' | 'dialer'>('main');
  const [youtubeSearchQuery, setYoutubeSearchQuery] = useState<string>('রবীন্দ্রসঙ্গীত (Bengali Songs)');
  const [isOverlayVisible, setIsOverlayVisible] = useState<boolean>(true);
  const [isAccessibilityActive, setIsAccessibilityActive] = useState<boolean>(true);
  const [isAudioPermissionGranted, setIsAudioPermissionGranted] = useState<boolean>(true);

  const handleTriggerVoiceFromPhone = (customPrompt?: string) => {
    if (customPrompt) {
      setLastCommand(customPrompt);
      setAssistantState('PROCESSING');
      return;
    }
    // Simulate opening voice listening dialog
    setAssistantState('LISTENING');
    setLastCommand('');
    setAssistantReply('');
  };

  const handleExecuteVoiceCommand = async (prompt: string, screenText?: string) => {
    // Handled inside VoiceSandbox
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: INTERACTIVE SIMULATOR & VOICE STUDIO */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Phone Device Mockup (5 Cols on large) */}
              <div className="lg:col-span-5 flex justify-center sticky top-20">
                <PhoneSimulator
                  assistantState={assistantState}
                  setAssistantState={setAssistantState}
                  lastCommand={lastCommand}
                  assistantReply={assistantReply}
                  onTriggerVoice={handleTriggerVoiceFromPhone}
                  volumeLevel={volumeLevel}
                  setVolumeLevel={setVolumeLevel}
                  isTorchOn={isTorchOn}
                  setIsTorchOn={setIsTorchOn}
                  currentApp={currentApp}
                  setCurrentApp={setCurrentApp}
                  youtubeSearchQuery={youtubeSearchQuery}
                  isOverlayVisible={isOverlayVisible}
                  setIsOverlayVisible={setIsOverlayVisible}
                  isAccessibilityActive={isAccessibilityActive}
                  setIsAccessibilityActive={setIsAccessibilityActive}
                  isAudioPermissionGranted={isAudioPermissionGranted}
                  setIsAudioPermissionGranted={setIsAudioPermissionGranted}
                />
              </div>

              {/* Voice Controls, Presets & Android Logcat (7 Cols on large) */}
              <div className="lg:col-span-7">
                <VoiceSandbox
                  assistantState={assistantState}
                  setAssistantState={setAssistantState}
                  lastCommand={lastCommand}
                  setLastCommand={setLastCommand}
                  assistantReply={assistantReply}
                  setAssistantReply={setAssistantReply}
                  onExecuteCommand={handleExecuteVoiceCommand}
                  currentApp={currentApp}
                  setCurrentApp={setCurrentApp}
                  volumeLevel={volumeLevel}
                  setVolumeLevel={setVolumeLevel}
                  isTorchOn={isTorchOn}
                  setIsTorchOn={setIsTorchOn}
                  setYoutubeSearchQuery={setYoutubeSearchQuery}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CODEBASE EXPLORER */}
        {activeTab === 'code' && <CodeExplorer />}

        {/* TAB 3: ARCHITECTURE & SETUP GUIDE */}
        {activeTab === 'architecture' && <ArchitectureGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>Pooja Assistant • Android Studio Studio & Emulator Sandbox • Built for Bengali & English Voice AI</p>
      </footer>
    </div>
  );
}
