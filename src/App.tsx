import React, { useState, useEffect, useCallback } from 'react';
import { ToolTab, HistoryItem, EncodeStandard } from './types';
import { Header } from './components/Header';
import { MainStudio } from './components/MainStudio';
import { UrlInspector } from './components/UrlInspector';
import { BatchProcessor } from './components/BatchProcessor';
import { CheatsheetModal } from './components/CheatsheetModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { PRESET_SAMPLES } from './utils/presets';

const HISTORY_STORAGE_KEY = 'url_studio_history_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ToolTab>('studio');
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [studioInput, setStudioInput] = useState<string>('');
  const [inspectorUrl, setInspectorUrl] = useState<string>('');

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
    } catch {
      // Ignore storage errors
    }
  }, [history]);

  // Toast dispatcher
  const addToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2400);
  }, []);

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        addToast(`${label}をクリップボードにコピーしました`, 'success');
      },
      () => {
        addToast('コピーに失敗しました', 'error');
      }
    );
  };

  const handleSaveToHistory = useCallback(
    (type: 'encode' | 'decode', standard: EncodeStandard, input: string, output: string) => {
      if (!input.trim() || !output.trim() || input === output) return;

      setHistory((prev) => {
        // Avoid duplicate consecutive entry
        if (prev.length > 0 && prev[0].input === input && prev[0].output === output) {
          return prev;
        }
        const newItem: HistoryItem = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: Date.now(),
          type,
          standard,
          input,
          output,
          isFavorite: false,
        };
        return [newItem, ...prev.slice(0, 49)];
      });
    },
    []
  );

  const handleToggleFavorite = (id: string) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearHistory = () => {
    setHistory([]);
    addToast('履歴をすべて消去しました', 'info');
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setStudioInput(item.input);
    setActiveTab('studio');
    addToast('履歴からテキストを復元しました', 'info');
  };

  const handleSelectRandomPreset = () => {
    const randomPreset = PRESET_SAMPLES[Math.floor(Math.random() * PRESET_SAMPLES.length)];
    setStudioInput(randomPreset.value);
    setActiveTab('studio');
    addToast(`サンプル「${randomPreset.title}」をセットしました`, 'info');
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Universal Top Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        historyCount={history.length}
        onOpenHistory={() => setHistoryOpen(true)}
        onSelectRandomPreset={handleSelectRandomPreset}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Intro & Tab Header */}
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {activeTab === 'studio' && 'URL エンコード & デコード'}
              {activeTab === 'inspector' && 'URL 分解 & クエリパラメータ編集'}
              {activeTab === 'batch' && '複数URL 一括バッチ処理'}
              {activeTab === 'cheatsheet' && 'URL エンコード仕様 & 記号早見表'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {activeTab === 'studio' &&
                'RFC 3986、encodeURIComponent、UTF-8バイト詳細解析に完全対応したリアルタイム変換スタジオ'}
              {activeTab === 'inspector' &&
                'URLを構成要素（プロトコル・ホスト・パス・クエリ）に分解し、安全にパラメータを直接編集・再構築'}
              {activeTab === 'batch' &&
                '1行1URLで大量のURLやクエリ文字列をまとめてエンコード/デコードし、CSVやTXTで出力'}
              {activeTab === 'cheatsheet' &&
                '予約文字・非予約文字・RFC 3986の定義、各メソッドの違いやよくあるトラブル集'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="font-mono">UTF-8 / RFC 3986</span>
            <span aria-hidden="true">·</span>
            <span>Client-side Secure</span>
          </div>
        </div>

        {/* Dynamic Tab Body */}
        {activeTab === 'studio' && (
          <MainStudio
            onCopyText={handleCopyText}
            onSaveToHistory={handleSaveToHistory}
            initialInput={studioInput}
            key={studioInput}
          />
        )}

        {activeTab === 'inspector' && (
          <UrlInspector
            onCopyText={handleCopyText}
            initialUrl={inspectorUrl || undefined}
          />
        )}

        {activeTab === 'batch' && (
          <BatchProcessor onCopyText={handleCopyText} />
        )}

        {activeTab === 'cheatsheet' && (
          <CheatsheetModal onCopyText={handleCopyText} />
        )}
      </main>

      {/* Simple, Non-intrusive Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-6 text-xs text-neutral-500 dark:text-neutral-400 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            URL Studio · すべての処理はブラウザのクライアント側で安全に実行されます
          </div>
          <div className="flex items-center gap-4 text-neutral-400 dark:text-neutral-500">
            <span>RFC 3986</span>
            <span>RFC 1738</span>
            <span>Unicode / UTF-8</span>
          </div>
        </div>
      </footer>

      {/* History Slide-over Drawer */}
      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onSelectHistory={handleSelectHistoryItem}
        onToggleFavorite={handleToggleFavorite}
        onDeleteItem={handleDeleteHistoryItem}
        onClearHistory={handleClearHistory}
        onCopyText={handleCopyText}
      />

      {/* Toast feedback */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
