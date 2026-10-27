import React, { useState } from 'react';
import { HistoryItem } from '../types';
import {
  X,
  Trash2,
  Copy,
  Check,
  Star,
  Search,
  ArrowRight,
  ExternalLink,
  Clock,
} from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
  onCopyText: (text: string, label: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistory,
  onToggleFavorite,
  onDeleteItem,
  onClearHistory,
  onCopyText,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'encode' | 'decode' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = history.filter((item) => {
    if (filterType === 'encode' && item.type !== 'encode') return false;
    if (filterType === 'decode' && item.type !== 'decode') return false;
    if (filterType === 'favorites' && !item.isFavorite) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.input.toLowerCase().includes(q) || item.output.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    onCopyText(text, '履歴の変換結果');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 h-full flex flex-col shadow-2xl border-l border-neutral-200 dark:border-neutral-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-500" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
              変換履歴
            </h2>
            <span className="text-xs text-neutral-400 font-mono tabular-nums">
              ({history.length})
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 space-y-3 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="履歴内を検索..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:border-neutral-500"
            />
          </div>

          <div className="flex items-center justify-between gap-1 text-[11px]">
            <div className="flex items-center gap-1 p-0.5 bg-neutral-200/60 dark:bg-neutral-800 rounded-md">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2 py-1 rounded transition-colors ${
                  filterType === 'all'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-medium shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setFilterType('encode')}
                className={`px-2 py-1 rounded transition-colors ${
                  filterType === 'encode'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-medium shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                エンコード
              </button>
              <button
                onClick={() => setFilterType('decode')}
                className={`px-2 py-1 rounded transition-colors ${
                  filterType === 'decode'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-medium shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                デコード
              </button>
              <button
                onClick={() => setFilterType('favorites')}
                className={`px-2 py-1 rounded transition-colors ${
                  filterType === 'favorites'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-medium shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                お気に入り
              </button>
            </div>

            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1"
                title="すべての履歴を消去"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* History Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-xs">
              {history.length === 0
                ? 'まだ履歴がありません。入力すると自動的に保存されます。'
                : '条件に一致する履歴はありません。'}
            </div>
          ) : (
            filtered.map((item) => {
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/40 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors space-y-2 group"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-semibold px-1.5 py-0.5 rounded text-[10px] uppercase ${
                          item.type === 'encode'
                            ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {item.type === 'encode' ? 'エンコード' : 'デコード'}
                      </span>
                      <span className="text-neutral-400 font-mono">
                        {item.standard}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-neutral-400">
                      <span className="text-[10px] font-mono tabular-nums">
                        {formatTimestamp(item.timestamp)}
                      </span>
                      <button
                        onClick={() => onToggleFavorite(item.id)}
                        className={`p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors ${
                          item.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-neutral-400'
                        }`}
                        title="お気に入り切り替え"
                      >
                        <Star className={`w-3 h-3 ${item.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-rose-500 transition-colors"
                        title="この項目を削除"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Input / Output preview */}
                  <div className="font-mono text-xs space-y-1">
                    <div className="truncate text-neutral-500" title={item.input}>
                      <span className="text-[10px] text-neutral-400 mr-1 select-none">IN:</span>
                      {item.input}
                    </div>
                    <div className="truncate text-neutral-900 dark:text-neutral-100 font-semibold" title={item.output}>
                      <span className="text-[10px] text-neutral-400 mr-1 select-none">OUT:</span>
                      {item.output}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800/80">
                    <button
                      onClick={() => handleCopy(item.output, item.id)}
                      className="px-2 py-1 text-[11px] font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'コピー済' : 'コピー'}</span>
                    </button>
                    <button
                      onClick={() => {
                        onSelectHistory(item);
                        onClose();
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <span>復元して開く</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
