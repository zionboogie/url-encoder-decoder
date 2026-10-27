import React, { useState, useEffect, useMemo, useRef } from 'react';
import { EncodeStandard, ByteAnalysisItem } from '../types';
import {
  encodeUrlString,
  decodeUrlString,
  getByteInfo,
  analyzeCharacterBytes,
} from '../utils/urlEncoder';
import { PRESET_SAMPLES, PresetItem } from '../utils/presets';
import { ByteInspector } from './ByteInspector';
import {
  ArrowRightLeft,
  Copy,
  Check,
  Trash2,
  Download,
  Upload,
  Layers,
  ChevronDown,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface MainStudioProps {
  onCopyText: (text: string, label: string) => void;
  onSaveToHistory: (type: 'encode' | 'decode', standard: EncodeStandard, input: string, output: string) => void;
  initialInput?: string;
}

export const MainStudio: React.FC<MainStudioProps> = ({
  onCopyText,
  onSaveToHistory,
  initialInput = '',
}) => {
  const [inputText, setInputText] = useState<string>(
    initialInput || 'https://ja.wikipedia.org/wiki/東京スカイツリー?search=スカイツリー&ref=top#アクセス'
  );
  const [mode, setMode] = useState<'auto' | 'encode' | 'decode'>('auto');
  const [standard, setStandard] = useState<EncodeStandard>('rfc3986');
  const [spaceAsPlus, setSpaceAsPlus] = useState<boolean>(false);
  const [plusAsSpace, setPlusAsSpace] = useState<boolean>(true);
  const [recursiveDecode, setRecursiveDecode] = useState<boolean>(false);
  const [showByteInspector, setShowByteInspector] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [presetMenuOpen, setPresetMenuOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto detect if text is predominantly percent encoded
  const isAutoDetectingAsDecode = useMemo(() => {
    if (!inputText) return false;
    const matches = inputText.match(/%[0-9a-fA-F]{2}/g);
    return matches && matches.length >= 2;
  }, [inputText]);

  const activeAction: 'encode' | 'decode' = useMemo(() => {
    if (mode === 'auto') {
      return isAutoDetectingAsDecode ? 'decode' : 'encode';
    }
    return mode;
  }, [mode, isAutoDetectingAsDecode]);

  // Compute transformation
  const conversionResult = useMemo(() => {
    if (!inputText) {
      return { output: '', rounds: 0, hasError: false, errorMessage: '' };
    }

    if (activeAction === 'encode') {
      const output = encodeUrlString(inputText, standard, spaceAsPlus);
      return { output, rounds: 1, hasError: false, errorMessage: '' };
    } else {
      const { result, rounds, hasError, errorMessage } = decodeUrlString(
        inputText,
        plusAsSpace,
        recursiveDecode
      );
      return { output: result, rounds, hasError, errorMessage };
    }
  }, [inputText, activeAction, standard, spaceAsPlus, plusAsSpace, recursiveDecode]);

  // Save to history debounce
  useEffect(() => {
    if (!inputText.trim() || !conversionResult.output.trim() || inputText === conversionResult.output) return;

    const timer = setTimeout(() => {
      onSaveToHistory(activeAction, standard, inputText, conversionResult.output);
    }, 1200);

    return () => clearTimeout(timer);
  }, [inputText, conversionResult.output, activeAction, standard, onSaveToHistory]);

  // Byte stats
  const inputStats = useMemo(() => getByteInfo(inputText), [inputText]);
  const outputStats = useMemo(() => getByteInfo(conversionResult.output), [conversionResult.output]);

  const byteDiffPercent = useMemo(() => {
    if (inputStats.byteCount === 0) return 0;
    const diff = outputStats.byteCount - inputStats.byteCount;
    return Math.round((diff / inputStats.byteCount) * 100);
  }, [inputStats.byteCount, outputStats.byteCount]);

  // Analyze characters for byte breakdown
  const analyzedBytes = useMemo<ByteAnalysisItem[]>(() => {
    // If decoding, analyze the decoded output or input based on user convenience
    const target = activeAction === 'decode' ? conversionResult.output : inputText;
    return analyzeCharacterBytes(target);
  }, [activeAction, conversionResult.output, inputText]);

  const handleSwap = () => {
    if (!conversionResult.output) return;
    setInputText(conversionResult.output);
    if (mode === 'auto') {
      // Keep auto
    } else {
      setMode(mode === 'encode' ? 'decode' : 'encode');
    }
  };

  const handleCopyOutput = () => {
    if (!conversionResult.output) return;
    onCopyText(conversionResult.output, '変換後の文字列');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content !== undefined) {
        setInputText(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (!conversionResult.output) return;
    const blob = new Blob([conversionResult.output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `url-${activeAction}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyPreset = (preset: PresetItem) => {
    setInputText(preset.value);
    setMode(preset.defaultAction);
    setPresetMenuOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Action Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <button
              onClick={() => setMode('auto')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                mode === 'auto'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              ⚡ 自動判定
              {mode === 'auto' && (
                <span className="ml-1 text-[10px] text-neutral-400">
                  ({activeAction === 'encode' ? 'エンコード' : 'デコード'})
                </span>
              )}
            </button>
            <button
              onClick={() => setMode('encode')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                mode === 'encode'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              エンコード
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                mode === 'decode'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              デコード
            </button>
          </div>

          {/* Standards & Options */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {activeAction === 'encode' ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500 font-medium">規格:</span>
                  <select
                    value={standard}
                    onChange={(e) => setStandard(e.target.value as EncodeStandard)}
                    className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-md px-2.5 py-1.5 font-medium outline-none focus:border-neutral-500 cursor-pointer"
                  >
                    <option value="rfc3986">RFC 3986 厳格 (推奨: !'()*も対象)</option>
                    <option value="encodeURIComponent">encodeURIComponent (標準パラメータ)</option>
                    <option value="encodeURI">encodeURI (URL全体構造を維持)</option>
                    <option value="formUrlEncoded">Form URL (スペースを+に変換)</option>
                  </select>
                </div>

                {standard !== 'formUrlEncoded' && (
                  <label className="flex items-center gap-1.5 cursor-pointer text-neutral-600 dark:text-neutral-300 select-none">
                    <input
                      type="checkbox"
                      checked={spaceAsPlus}
                      onChange={(e) => setSpaceAsPlus(e.target.checked)}
                      className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0 cursor-pointer"
                    />
                    <span>半角スペースを「+」にする</span>
                  </label>
                )}
              </>
            ) : (
              <>
                <label className="flex items-center gap-1.5 cursor-pointer text-neutral-600 dark:text-neutral-300 select-none">
                  <input
                    type="checkbox"
                    checked={plusAsSpace}
                    onChange={(e) => setPlusAsSpace(e.target.checked)}
                    className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0 cursor-pointer"
                  />
                  <span>「+」を半角スペースとして解釈</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-neutral-600 dark:text-neutral-300 select-none" title="多重にエンコードされたURLを自動的に元通りになるまで繰り返しデコードします">
                  <input
                    type="checkbox"
                    checked={recursiveDecode}
                    onChange={(e) => setRecursiveDecode(e.target.checked)}
                    className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0 cursor-pointer"
                  />
                  <span>再帰的デコード (多重エンコード解消)</span>
                </label>
              </>
            )}

            {/* Preset Selector */}
            <div className="relative">
              <button
                onClick={() => setPresetMenuOpen(!presetMenuOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>プリセット</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {presetMenuOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-20 py-1">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-800">
                    サンプル一覧
                  </div>
                  {PRESET_SAMPLES.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex flex-col"
                    >
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">
                        {preset.title}
                      </span>
                      <span className="text-[10px] text-neutral-500 truncate">
                        {preset.description}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual Conversion Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative">
        {/* Input Panel */}
        <div className="flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
          {/* Header */}
          <div className="px-4 py-3 bg-neutral-50/70 dark:bg-neutral-800/40 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                入力 (Input)
              </span>
              <span className="text-[11px] font-mono tabular-nums text-neutral-500">
                {inputStats.charCount} 文字 · {inputStats.byteCount} bytes
              </span>
            </div>

            <div className="flex items-center gap-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.json,.csv"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition-colors"
                title="テキストファイルを読み込む"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleClear}
                disabled={!inputText}
                className="p-1.5 text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition-colors disabled:opacity-40"
                title="入力をクリア"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Textarea */}
          <div className="relative flex-1">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="変換したいURLまたは文字列を入力してください..."
              rows={12}
              className="w-full h-full p-4 font-mono text-sm leading-relaxed bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 resize-none outline-none border-none focus:ring-0"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Central Swap Floating Button (Desktop) */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <button
            onClick={handleSwap}
            disabled={!conversionResult.output}
            title="入力と出力を入れ替え (Swap)"
            className="w-10 h-10 rounded-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 shadow-md flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
          {/* Header */}
          <div className="px-4 py-3 bg-neutral-50/70 dark:bg-neutral-800/40 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                出力 (Output: {activeAction === 'encode' ? 'エンコード結果' : 'デコード結果'})
              </span>
              <span className="text-[11px] font-mono tabular-nums text-neutral-500">
                {outputStats.charCount} 文字 · {outputStats.byteCount} bytes
                {byteDiffPercent !== 0 && (
                  <span className={`ml-1 font-semibold ${byteDiffPercent > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    ({byteDiffPercent > 0 ? `+${byteDiffPercent}%` : `${byteDiffPercent}%`})
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleSwap}
                disabled={!conversionResult.output}
                className="lg:hidden p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition-colors disabled:opacity-40"
                title="入出力を反転"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDownload}
                disabled={!conversionResult.output}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition-colors disabled:opacity-40"
                title="テキストファイルとして保存"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCopyOutput}
                disabled={!conversionResult.output}
                className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-md text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors disabled:opacity-40 shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'コピー完了' : 'コピー'}</span>
              </button>
            </div>
          </div>

          {/* Result Content */}
          <div className="relative flex-1 p-4 bg-neutral-50/20 dark:bg-neutral-950/20">
            {conversionResult.hasError ? (
              <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
                <p className="font-semibold mb-1">デコード中にエラーが発生しました</p>
                <p className="font-mono">{conversionResult.errorMessage}</p>
                <p className="mt-2 text-neutral-500 dark:text-neutral-400">
                  ヒント: 不正な%シーケンス（%の後ろに16進数2桁がないなど）が含まれている可能性があります。安全な部分のみ抽出してデコードを試みました。
                </p>
              </div>
            ) : conversionResult.output ? (
              <textarea
                readOnly
                value={conversionResult.output}
                rows={12}
                className="w-full h-full font-mono text-sm leading-relaxed bg-transparent text-neutral-900 dark:text-neutral-100 resize-none outline-none border-none select-all focus:ring-0"
              />
            ) : (
              <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-600 text-xs">
                <span>左側に入力すると自動的に変換結果が表示されます</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* UTF-8 Byte Inspector Section */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
              UTF-8 バイト & エンコード詳細解析
            </h2>
          </div>
          <button
            onClick={() => setShowByteInspector(!showByteInspector)}
            className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium"
          >
            {showByteInspector ? '折りたたむ' : '展開する'}
          </button>
        </div>

        {showByteInspector && (
          <ByteInspector
            items={analyzedBytes}
            onCopy={onCopyText}
          />
        )}
      </div>
    </div>
  );
};
