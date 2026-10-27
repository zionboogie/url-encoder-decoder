import React, { useState } from 'react';
import { ByteAnalysisItem } from '../types';
import { Copy, Check, Info } from 'lucide-react';

interface ByteInspectorProps {
  items: ByteAnalysisItem[];
  onCopy: (text: string, label: string) => void;
}

export const ByteInspector: React.FC<ByteInspectorProps> = ({ items, onCopy }) => {
  const [filter, setFilter] = useState<'all' | 'multibyte' | 'reserved' | 'unreserved'>('all');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const filteredItems = items.filter((item) => {
    if (filter === 'multibyte') return item.category === 'multibyte';
    if (filter === 'reserved') return item.category === 'reserved';
    if (filter === 'unreserved') return item.category === 'unreserved';
    return true;
  });

  const handleCopyCode = (text: string, index: number, label: string) => {
    onCopy(text, label);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  if (items.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl text-neutral-500 dark:text-neutral-400 text-sm">
        文字を入力すると、文字ごとのUnicodeコードポイント、UTF-8バイト列（16進数）、パーセントエンコード詳細がここにリアルタイム表示されます。
      </div>
    );
  }

  const multibyteCount = items.filter((i) => i.category === 'multibyte').length;
  const reservedCount = items.filter((i) => i.category === 'reserved').length;

  return (
    <div className="space-y-3">
      {/* Filter and stats row */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            全文字 ({items.length})
          </button>
          <button
            onClick={() => setFilter('multibyte')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
              filter === 'multibyte'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            マルチバイト/日本語 ({multibyteCount})
          </button>
          <button
            onClick={() => setFilter('reserved')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
              filter === 'reserved'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            URL予約文字 ({reservedCount})
          </button>
        </div>

        <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
          <Info className="w-3.5 h-3.5" />
          <span>先頭最大300文字を表示中</span>
        </div>
      </div>

      {/* Grid of character cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-96 overflow-y-auto pr-1">
        {filteredItems.map((item, index) => {
          const isCopied = copiedIndex === index;
          const displayChar = item.char === ' ' ? '␣ (Space)' : item.char === '\n' ? '↵ (LF)' : item.char;

          return (
            <div
              key={index}
              className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all hover:border-neutral-400 dark:hover:border-neutral-600 ${
                item.category === 'multibyte'
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/40'
                  : item.category === 'reserved'
                  ? 'bg-sky-50/50 dark:bg-sky-950/20 border-sky-200/70 dark:border-sky-900/40'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1.5">
                <span
                  className="text-lg font-bold font-mono text-neutral-900 dark:text-white truncate max-w-[80px]"
                  title={item.char}
                >
                  {displayChar}
                </span>
                <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 tabular-nums">
                  {item.codePoint}
                </span>
              </div>

              <div className="space-y-1 text-[11px] font-mono">
                <div className="text-neutral-500 dark:text-neutral-400 truncate">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 mr-1">HEX:</span>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {item.utf8Hex.join(' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1 pt-1 border-t border-neutral-100 dark:border-neutral-800/80">
                  <span
                    className={`font-semibold truncate ${
                      item.isEncoded
                        ? 'text-sky-700 dark:text-sky-400'
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                    title={item.encoded}
                  >
                    {item.encoded}
                  </span>
                  <button
                    onClick={() => handleCopyCode(item.encoded, index, `「${item.char}」のエンコード値`)}
                    className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition-colors"
                    title="エンコード値をコピー"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
