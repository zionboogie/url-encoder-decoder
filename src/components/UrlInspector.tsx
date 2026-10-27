import React, { useState, useEffect, useMemo } from 'react';
import { ParsedUrl, QueryParam } from '../types';
import { parseUrlString, reconstructUrl } from '../utils/urlEncoder';
import {
  Copy,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Code,
  SlidersHorizontal,
  RefreshCw,
  FileCode,
} from 'lucide-react';

interface UrlInspectorProps {
  onCopyText: (text: string, label: string) => void;
  initialUrl?: string;
}

export const UrlInspector: React.FC<UrlInspectorProps> = ({
  onCopyText,
  initialUrl = 'https://example.com/api/v1/search?query=%E6%9D%B1%E4%BA%AC%E3%82%B9%E3%82%AB%E3%82%A4%E3%83%84%E3%83%AA%E3%83%BC&page=1&limit=20&filter=open#results',
}) => {
  const [rawInput, setRawInput] = useState<string>(initialUrl);
  const [parsed, setParsed] = useState<ParsedUrl>(() => parseUrlString(initialUrl));
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);
  const [autoReconstruct, setAutoReconstruct] = useState<boolean>(true);

  // Sync when raw input changes from outside or manual user input
  const handleParseInput = (inputVal: string) => {
    setRawInput(inputVal);
    setParsed(parseUrlString(inputVal));
  };

  // Reconstructed URL based on current parsed state
  const reconstructed = useMemo(() => {
    return reconstructUrl(parsed, true);
  }, [parsed]);

  // Update a query param key or value
  const handleUpdateParam = (id: string, field: 'key' | 'value' | 'enabled', val: string | boolean) => {
    setParsed((prev) => {
      const updatedParams = prev.queryParams.map((param) => {
        if (param.id === id) {
          return { ...param, [field]: val };
        }
        return param;
      });
      return { ...prev, queryParams: updatedParams };
    });
  };

  // Add new param
  const handleAddParam = () => {
    const newParam: QueryParam = {
      id: Math.random().toString(36).substring(2, 9),
      key: '',
      value: '',
      enabled: true,
    };
    setParsed((prev) => ({
      ...prev,
      queryParams: [...prev.queryParams, newParam],
    }));
  };

  // Remove param
  const handleRemoveParam = (id: string) => {
    setParsed((prev) => ({
      ...prev,
      queryParams: prev.queryParams.filter((p) => p.id !== id),
    }));
  };

  // Update path, host, or protocol
  const handleUpdateComponent = (field: keyof ParsedUrl, value: string) => {
    setParsed((prev) => ({ ...prev, [field]: value }));
  };

  const handleCopyReconstructed = () => {
    onCopyText(reconstructed, '再構築されたURL');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyAsJson = () => {
    const obj: Record<string, string> = {};
    parsed.queryParams
      .filter((p) => p.enabled && p.key.trim())
      .forEach((p) => {
        obj[p.key] = p.value;
      });
    const jsonStr = JSON.stringify(obj, null, 2);
    onCopyText(jsonStr, 'クエリパラメータJSON');
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleCopyAsCurl = () => {
    const curl = `curl -X GET "${reconstructed}"`;
    onCopyText(curl, 'cURLコマンド');
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Input Box */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            解析対象のURL
          </label>
          <button
            onClick={() => handleParseInput('https://ja.wikipedia.org/wiki/東京タワー?mode=view&lang=ja#概要')}
            className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium"
          >
            サンプルURLをセット
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={rawInput}
            onChange={(e) => handleParseInput(e.target.value)}
            placeholder="https://example.com/path?key=value#hash"
            className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono text-sm text-neutral-900 dark:text-white outline-none focus:border-neutral-500 focus:bg-white dark:focus:bg-neutral-900 transition-colors"
          />
        </div>
      </div>

      {/* Reconstructed Output Banner */}
      <div className="bg-neutral-900 text-white rounded-xl p-4 shadow-sm border border-neutral-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              編集連動 URL（リアルタイム再構築）
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAsJson}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-md transition-colors"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5" />}
              <span>JSON</span>
            </button>
            <button
              onClick={handleCopyAsCurl}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-md transition-colors"
            >
              {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code className="w-3.5 h-3.5" />}
              <span>cURL</span>
            </button>
            <button
              onClick={handleCopyReconstructed}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-white text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors shadow-xs"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>URLをコピー</span>
            </button>
          </div>
        </div>

        <div className="p-3 bg-neutral-950 rounded-lg font-mono text-xs break-all text-neutral-200 select-all border border-neutral-800">
          {reconstructed || '(URLが空です)'}
        </div>
      </div>

      {/* URL Components Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Protocol & Host */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            接続・ホスト
          </h3>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-neutral-500 block mb-1">プロトコル (Protocol)</span>
              <input
                type="text"
                value={parsed.protocol}
                onChange={(e) => handleUpdateComponent('protocol', e.target.value)}
                placeholder="https:"
                className="w-full px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono text-neutral-800 dark:text-neutral-200"
              />
            </div>

            <div>
              <span className="text-neutral-500 block mb-1">ホスト名 (Hostname)</span>
              <input
                type="text"
                value={parsed.hostname}
                onChange={(e) => handleUpdateComponent('hostname', e.target.value)}
                placeholder="example.com"
                className="w-full px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono text-neutral-800 dark:text-neutral-200"
              />
            </div>

            <div>
              <span className="text-neutral-500 block mb-1">ポート (Port)</span>
              <input
                type="text"
                value={parsed.port}
                onChange={(e) => handleUpdateComponent('port', e.target.value)}
                placeholder="443, 8080等（通常は空）"
                className="w-full px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono text-neutral-800 dark:text-neutral-200"
              />
            </div>
          </div>
        </div>

        {/* Path & Hash */}
        <div className="md:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            パス & ハッシュ (Path & Hash)
          </h3>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-neutral-500 block mb-1">パス名 (Pathname)</span>
              <input
                type="text"
                value={parsed.pathname}
                onChange={(e) => handleUpdateComponent('pathname', e.target.value)}
                placeholder="/api/v1/search"
                className="w-full px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono text-neutral-800 dark:text-neutral-200"
              />
            </div>

            <div>
              <span className="text-neutral-500 block mb-1">アンカー / ハッシュ (Hash)</span>
              <input
                type="text"
                value={parsed.hash}
                onChange={(e) => handleUpdateComponent('hash', e.target.value)}
                placeholder="#section"
                className="w-full px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono text-neutral-800 dark:text-neutral-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Query Parameters Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              クエリパラメータ一覧 ({parsed.queryParams.length}件)
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              各パラメータの値はデコードされた平文で編集でき、自動でパーセントエンコードされ再構築URLに反映されます。
            </p>
          </div>

          <button
            onClick={handleAddParam}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>パラメータ追加</span>
          </button>
        </div>

        {parsed.queryParams.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl text-neutral-500 text-xs">
            クエリパラメータはありません。「パラメータ追加」ボタンから新しいキーと値を追加できます。
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                  <th className="py-2.5 px-2 w-12 font-medium text-center">有効</th>
                  <th className="py-2.5 px-3 w-1/3 font-medium">キー (Key)</th>
                  <th className="py-2.5 px-3 font-medium">値 (Value)</th>
                  <th className="py-2.5 px-2 w-12 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-mono">
                {parsed.queryParams.map((param) => (
                  <tr
                    key={param.id}
                    className={`transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 ${
                      !param.enabled ? 'opacity-40' : ''
                    }`}
                  >
                    <td className="py-2 px-2 text-center">
                      <input
                        type="checkbox"
                        checked={param.enabled}
                        onChange={(e) => handleUpdateParam(param.id, 'enabled', e.target.checked)}
                        className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0 cursor-pointer"
                        title="このパラメータをURLに含める"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={param.key}
                        onChange={(e) => handleUpdateParam(param.id, 'key', e.target.value)}
                        placeholder="key"
                        className="w-full px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-neutral-500"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={param.value}
                        onChange={(e) => handleUpdateParam(param.id, 'value', e.target.value)}
                        placeholder="value"
                        className="w-full px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-neutral-500"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => handleRemoveParam(param.id)}
                        className="p-1 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors rounded"
                        title="パラメータを削除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
