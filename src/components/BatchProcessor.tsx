import React, { useState, useMemo } from 'react';
import { EncodeStandard } from '../types';
import { encodeUrlString, decodeUrlString } from '../utils/urlEncoder';
import { Copy, Check, Download, Trash2, ArrowRight } from 'lucide-react';

interface BatchProcessorProps {
  onCopyText: (text: string, label: string) => void;
}

const SAMPLE_BATCH = [
  'https://ja.wikipedia.org/wiki/東京',
  'https://example.com/search?keyword=東京スカイツリー&category=観光',
  'https://shop.example.jp/items?tag=セール&price_min=1000&color=赤',
  'https://api.example.com/oauth/callback?code=abc123xyz&state=セッション情報',
  'キー=テスト & 記号=100%満足!',
].join('\n');

export const BatchProcessor: React.FC<BatchProcessorProps> = ({ onCopyText }) => {
  const [inputText, setInputText] = useState<string>(SAMPLE_BATCH);
  const [action, setAction] = useState<'encode' | 'decode'>('encode');
  const [standard, setStandard] = useState<EncodeStandard>('rfc3986');
  const [ignoreEmpty, setIgnoreEmpty] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Compute line-by-line conversion
  const lines = useMemo(() => {
    return inputText.split('\n');
  }, [inputText]);

  const convertedLines = useMemo(() => {
    return lines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed && ignoreEmpty) return '';

      if (action === 'encode') {
        return encodeUrlString(line, standard, false);
      } else {
        const { result } = decodeUrlString(line, true, false);
        return result;
      }
    });
  }, [lines, action, standard, ignoreEmpty]);

  const outputText = useMemo(() => {
    if (ignoreEmpty) {
      return convertedLines.filter((l) => l !== '').join('\n');
    }
    return convertedLines.join('\n');
  }, [convertedLines, ignoreEmpty]);

  const handleCopy = () => {
    if (!outputText) return;
    onCopyText(outputText, '一括変換結果');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-${action}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const rows = [['元テキスト', '変換後テキスト']];
    lines.forEach((orig, idx) => {
      const conv = convertedLines[idx] ?? '';
      if (!orig.trim() && ignoreEmpty) return;
      rows.push([`"${orig.replace(/"/g, '""')}"`, `"${conv.replace(/"/g, '""')}"`]);
    });
    const csvContent = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-${action}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <button
              onClick={() => setAction('encode')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                action === 'encode'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              一括エンコード
            </button>
            <button
              onClick={() => setAction('decode')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                action === 'decode'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              一括デコード
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {action === 'encode' && (
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 font-medium">エンコード規格:</span>
                <select
                  value={standard}
                  onChange={(e) => setStandard(e.target.value as EncodeStandard)}
                  className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-md px-2.5 py-1.5 font-medium outline-none"
                >
                  <option value="rfc3986">RFC 3986 厳格</option>
                  <option value="encodeURIComponent">encodeURIComponent</option>
                  <option value="encodeURI">encodeURI (URL全体構造維持)</option>
                  <option value="formUrlEncoded">Form URL (スペース=+)</option>
                </select>
              </div>
            )}

            <label className="flex items-center gap-1.5 cursor-pointer text-neutral-600 dark:text-neutral-300 select-none">
              <input
                type="checkbox"
                checked={ignoreEmpty}
                onChange={(e) => setIgnoreEmpty(e.target.checked)}
                className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0 cursor-pointer"
              />
              <span>空行をスキップ</span>
            </label>

            <button
              onClick={() => setInputText(SAMPLE_BATCH)}
              className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium"
            >
              サンプル一括入力
            </button>
          </div>
        </div>
      </div>

      {/* Dual Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Textarea */}
        <div className="flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
          <div className="px-4 py-3 bg-neutral-50/70 dark:bg-neutral-800/40 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                入力（1行に1つのURLまたは文字列）
              </span>
              <span className="text-[11px] font-mono tabular-nums text-neutral-500">
                {lines.length} 行
              </span>
            </div>
            <button
              onClick={() => setInputText('')}
              className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors"
              title="クリア"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-4 flex-1">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="https://example.com/path1&#10;https://example.com/path2"
              rows={14}
              className="w-full h-full font-mono text-xs leading-relaxed bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 resize-none outline-none border-none focus:ring-0"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Output Textarea */}
        <div className="flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
          <div className="px-4 py-3 bg-neutral-50/70 dark:bg-neutral-800/40 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                一括変換結果
              </span>
              <span className="text-[11px] font-mono tabular-nums text-neutral-500">
                {convertedLines.filter(Boolean).length} 件
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleDownloadCsv}
                disabled={!outputText}
                className="px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors disabled:opacity-40"
              >
                CSV保存
              </button>
              <button
                onClick={handleDownloadTxt}
                disabled={!outputText}
                className="px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors disabled:opacity-40"
              >
                TXT保存
              </button>
              <button
                onClick={handleCopy}
                disabled={!outputText}
                className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-md text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors disabled:opacity-40 shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'コピー完了' : 'すべてコピー'}</span>
              </button>
            </div>
          </div>
          <div className="p-4 flex-1 bg-neutral-50/20 dark:bg-neutral-950/20">
            <textarea
              readOnly
              value={outputText}
              rows={14}
              className="w-full h-full font-mono text-xs leading-relaxed bg-transparent text-neutral-900 dark:text-neutral-100 resize-none outline-none border-none select-all focus:ring-0"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
