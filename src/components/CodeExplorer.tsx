import React, { useState, useMemo } from 'react';
import {
  FileCode,
  Folder,
  FolderOpen,
  Copy,
  Check,
  Download,
  Search,
  FileText,
  Settings,
  Code2,
  Box,
  Layers,
  Sparkles
} from 'lucide-react';
import { ANDROID_PROJECT_FILES, AndroidProjectFile } from '../androidProjectData';
import { exportAndroidProjectZip, downloadBlob } from '../utils/zipExporter';

export const CodeExplorer: React.FC = () => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    'app/src/main/java/com/pooja/assistant/PoojaAccessibilityService.kt'
  );
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const filteredFiles = useMemo(() => {
    return ANDROID_PROJECT_FILES.filter((file) => {
      const matchesCategory =
        filterCategory === 'all' || file.category === filterCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        file.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [filterCategory, searchQuery]);

  const selectedFile = useMemo(() => {
    return (
      ANDROID_PROJECT_FILES.find((f) => f.path === selectedFilePath) ||
      filteredFiles[0] ||
      ANDROID_PROJECT_FILES[0]
    );
  }, [selectedFilePath, filteredFiles]);

  const handleCopyCode = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingleFile = () => {
    if (!selectedFile) return;
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const filename = selectedFile.path.split('/').pop() || 'file.txt';
    downloadBlob(blob, filename);
  };

  const handleDownloadFullZip = async () => {
    try {
      setIsExporting(true);
      const blob = await exportAndroidProjectZip();
      downloadBlob(blob, 'PoojaAssistant-AndroidStudio-Project.zip');
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const getFileCategoryColor = (cat: AndroidProjectFile['category']) => {
    switch (cat) {
      case 'kotlin':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'gradle':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'manifest':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'xml':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'config':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Exporter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Box className="w-5 h-5 text-purple-400" />
            <span>Pooja Assistant Android Project Structure</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete, production-ready codebase supporting Android 10 (API 29) to Android 15+ (API 35).
            Contains all Kotlin managers, WindowManager overlay, Accessibility configs, and Gradle KTS build files.
          </p>
        </div>

        <button
          onClick={handleDownloadFullZip}
          disabled={isExporting}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-purple-900/30 transition-all shrink-0 active:scale-95 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Generating ZIP...' : 'Download Full Android Studio Project (.ZIP)'}</span>
        </button>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files, classes, methods (e.g., PoojaAccessibilityService, YouTube, TTS)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: 'all', label: `All (${ANDROID_PROJECT_FILES.length})` },
            { id: 'kotlin', label: 'Kotlin (6)' },
            { id: 'manifest', label: 'Manifest (1)' },
            { id: 'gradle', label: 'Gradle (3)' },
            { id: 'xml', label: 'XML Resources (9)' },
            { id: 'config', label: 'CI & Configs' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                filterCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split View: File Tree + Code Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: File Tree (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-3 max-h-[720px] overflow-y-auto space-y-1">
          <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Project Files ({filteredFiles.length})</span>
            <span className="text-[10px] text-purple-400 font-normal">Click to view</span>
          </div>

          <div className="space-y-1">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile?.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFilePath(file.path)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start space-x-2.5 ${
                    isSelected
                      ? 'bg-purple-600/20 border border-purple-500/50 text-white'
                      : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <FileCode
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isSelected ? 'text-purple-400' : 'text-slate-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-semibold truncate text-[12px]">{file.name}</p>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border shrink-0 ${getFileCategoryColor(
                          file.category
                        )}`}
                      >
                        {file.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {file.path}
                    </p>
                  </div>
                </button>
              );
            })}

            {filteredFiles.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500">
                No matching Android files found for "{searchQuery}".
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Viewer (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          {/* File Header */}
          <div className="bg-slate-900 border-b border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-white">
                  {selectedFile?.path}
                </span>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getFileCategoryColor(
                    selectedFile?.category || 'kotlin'
                  )}`}
                >
                  {selectedFile?.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedFile?.description}</p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleCopyCode}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-all active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
              <button
                onClick={handleDownloadSingleFile}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition-all"
                title="Download this file"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Code Body with Line Numbers */}
          <div className="p-4 overflow-x-auto max-h-[640px] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed bg-[#0A0E17]">
            <pre className="table w-full">
              {selectedFile?.content.split('\n').map((line, index) => (
                <div key={index} className="table-row hover:bg-purple-950/20">
                  <span className="table-cell select-none pr-4 text-right text-slate-600 font-mono text-[11px] w-10">
                    {index + 1}
                  </span>
                  <span className="table-cell whitespace-pre font-mono">{line}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
