import React, { useState } from 'react';
import { Download, Sparkles, Smartphone, Code2, BookOpen, Mic } from 'lucide-react';
import { exportAndroidProjectZip, downloadBlob } from '../utils/zipExporter';

interface HeaderProps {
  activeTab: 'simulator' | 'code' | 'architecture';
  setActiveTab: (tab: 'simulator' | 'code' | 'architecture') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      const blob = await exportAndroidProjectZip();
      downloadBlob(blob, 'PoojaAssistant-AndroidStudio-Project.zip');
    } catch (err) {
      console.error('Failed to export ZIP:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 p-0.5 shadow-lg shadow-purple-900/30">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Mic className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-white tracking-tight">Pooja Assistant</h1>
                <span className="text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  Android 10 - 15+
                </span>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  বাংলা & English
                </span>
              </div>
              <p className="text-xs text-slate-400">Production Android Voice AI • Accessibility Service • Gemini SDK</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-sm font-medium">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'simulator'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Interactive Phone Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'code'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Android Codebase & Files</span>
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'architecture'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Architecture & Setup Guide</span>
            </button>
          </div>

          {/* Download Android Studio Project Button */}
          <button
            onClick={handleDownloadZip}
            disabled={isExporting}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-lg shadow-purple-900/30 transition-all active:scale-95 disabled:opacity-50"
            title="Download full Android Studio project as .zip"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isExporting ? 'Generating ZIP...' : 'Export Android Studio Project (.ZIP)'}
            </span>
            <span className="sm:hidden">Export .ZIP</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="flex md:hidden border-t border-slate-800/80 bg-slate-950 px-2 py-1 justify-around text-xs">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg ${
            activeTab === 'simulator' ? 'bg-purple-600 text-white' : 'text-slate-400'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Simulator</span>
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg ${
            activeTab === 'code' ? 'bg-purple-600 text-white' : 'text-slate-400'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Codebase</span>
        </button>
        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg ${
            activeTab === 'architecture' ? 'bg-purple-600 text-white' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Docs</span>
        </button>
      </div>
    </header>
  );
};
