import React from 'react';
import { ToolTab } from '../types';
import { History, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: ToolTab;
  onTabChange: (tab: ToolTab) => void;
  historyCount: number;
  onOpenHistory: () => void;
  onSelectRandomPreset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  historyCount,
  onOpenHistory,
  onSelectRandomPreset,
}) => {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center text-white dark:text-neutral-900 font-mono font-bold text-sm tracking-tight shadow-xs">
            %
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap">
            URL Studio
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium">
          <button
            onClick={() => onTabChange('studio')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'studio'
                ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
            }`}
          >
            変換スタジオ
          </button>
          <button
            onClick={() => onTabChange('inspector')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'inspector'
                ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
            }`}
          >
            URL分解・クエリ編集
          </button>
          <button
            onClick={() => onTabChange('batch')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'batch'
                ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
            }`}
          >
            一括バッチ
          </button>
          <button
            onClick={() => onTabChange('cheatsheet')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'cheatsheet'
                ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
            }`}
          >
            仕様早見表
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onSelectRandomPreset}
            title="サンプルを入力"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>サンプル</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-950 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors whitespace-nowrap shrink-0 shadow-xs"
          >
            <History className="w-3.5 h-3.5" />
            <span>履歴</span>
            {historyCount > 0 && (
              <span className="ml-1 text-[11px] font-mono tabular-nums opacity-90">
                ({historyCount})
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile sub-tabs */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 border-t border-neutral-100 dark:border-neutral-800 gap-1 text-xs">
        <button
          onClick={() => onTabChange('studio')}
          className={`px-2.5 py-1.5 rounded whitespace-nowrap font-medium ${
            activeTab === 'studio'
              ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white'
              : 'text-neutral-600 dark:text-neutral-400'
          }`}
        >
          変換スタジオ
        </button>
        <button
          onClick={() => onTabChange('inspector')}
          className={`px-2.5 py-1.5 rounded whitespace-nowrap font-medium ${
            activeTab === 'inspector'
              ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white'
              : 'text-neutral-600 dark:text-neutral-400'
          }`}
        >
          URL分解・クエリ
        </button>
        <button
          onClick={() => onTabChange('batch')}
          className={`px-2.5 py-1.5 rounded whitespace-nowrap font-medium ${
            activeTab === 'batch'
              ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white'
              : 'text-neutral-600 dark:text-neutral-400'
          }`}
        >
          一括バッチ
        </button>
        <button
          onClick={() => onTabChange('cheatsheet')}
          className={`px-2.5 py-1.5 rounded whitespace-nowrap font-medium ${
            activeTab === 'cheatsheet'
              ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white'
              : 'text-neutral-600 dark:text-neutral-400'
          }`}
        >
          早見表
        </button>
      </div>
    </header>
  );
};
