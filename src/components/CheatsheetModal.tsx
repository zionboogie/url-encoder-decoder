import React, { useState } from 'react';
import { Copy, Check, Search, BookOpen, AlertTriangle } from 'lucide-react';

interface CheatsheetProps {
  onCopyText: (text: string, label: string) => void;
}

interface CharTableEntry {
  char: string;
  name: string;
  hex: string;
  percent: string;
  rfcRole: string;
}

const COMMON_CHARACTERS: CharTableEntry[] = [
  { char: '␣ (スペース)', name: 'Space', hex: '0x20', percent: '%20 (または +)', rfcRole: '要エンコード' },
  { char: '!', name: 'Exclamation', hex: '0x21', percent: '%21', rfcRole: 'サブデリミタ (RFC3986では要エンコード推奨)' },
  { char: '"', name: 'Double Quote', hex: '0x22', percent: '%22', rfcRole: '要エンコード' },
  { char: '#', name: 'Hash / Fragment', hex: '0x23', percent: '%23', rfcRole: 'ジェネリック区切り文字 (フラグメント)' },
  { char: '$', name: 'Dollar', hex: '0x24', percent: '%24', rfcRole: 'サブデリミタ' },
  { char: '%', name: 'Percent', hex: '0x25', percent: '%25', rfcRole: 'パーセント記号自身' },
  { char: '&', name: 'Ampersand', hex: '0x26', percent: '%26', rfcRole: 'パラメータ区切り' },
  { char: "'", name: 'Single Quote', hex: '0x27', percent: '%27', rfcRole: 'サブデリミタ' },
  { char: '(', name: 'Open Paren', hex: '0x28', percent: '%28', rfcRole: 'サブデリミタ' },
  { char: ')', name: 'Close Paren', hex: '0x29', percent: '%29', rfcRole: 'サブデリミタ' },
  { char: '*', name: 'Asterisk', hex: '0x2A', percent: '%2A', rfcRole: 'サブデリミタ' },
  { char: '+', name: 'Plus', hex: '0x2B', percent: '%2B', rfcRole: 'サブデリミタ / フォームではスペース' },
  { char: ',', name: 'Comma', hex: '0x2C', percent: '%2C', rfcRole: 'サブデリミタ' },
  { char: '/', name: 'Slash', hex: '0x2F', percent: '%2F', rfcRole: 'パス区切り文字' },
  { char: ':', name: 'Colon', hex: '0x3A', percent: '%3A', rfcRole: 'スキーム / ポート区切り' },
  { char: ';', name: 'Semicolon', hex: '0x3B', percent: '%3B', rfcRole: 'サブデリミタ' },
  { char: '<', name: 'Less Than', hex: '0x3C', percent: '%3C', rfcRole: '要エンコード' },
  { char: '=', name: 'Equals', hex: '0x3D', percent: '%3D', rfcRole: 'キー・値区切り' },
  { char: '>', name: 'Greater Than', hex: '0x3E', percent: '%3E', rfcRole: '要エンコード' },
  { char: '?', name: 'Question Mark', hex: '0x3F', percent: '%3F', rfcRole: 'クエリ文字列開始' },
  { char: '@', name: 'At sign', hex: '0x40', percent: '%40', rfcRole: 'ユーザー情報区切り' },
  { char: '[', name: 'Left Bracket', hex: '0x5B', percent: '%5B', rfcRole: 'IPv6アドレス' },
  { char: '\\', name: 'Backslash', hex: '0x5C', percent: '%5C', rfcRole: '要エンコード' },
  { char: ']', name: 'Right Bracket', hex: '0x5D', percent: '%5D', rfcRole: 'IPv6アドレス' },
  { char: '^', name: 'Caret', hex: '0x5E', percent: '%5E', rfcRole: '要エンコード' },
  { char: '`', name: 'Backtick', hex: '0x60', percent: '%60', rfcRole: '要エンコード' },
  { char: '{', name: 'Left Brace', hex: '0x7B', percent: '%7B', rfcRole: '要エンコード' },
  { char: '|', name: 'Pipe', hex: '0x7C', percent: '%7C', rfcRole: '要エンコード' },
  { char: '}', name: 'Right Brace', hex: '0x7D', percent: '%7D', rfcRole: '要エンコード' },
  { char: '~', name: 'Tilde', hex: '0x7E', percent: '%7E', rfcRole: '非予約文字（エンコード不要）' },
];

export const CheatsheetModal: React.FC<CheatsheetProps> = ({ onCopyText }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredChars = COMMON_CHARACTERS.filter((c) => {
    return (
      c.char.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.percent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.hex.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleCopy = (text: string, key: string, label: string) => {
    onCopyText(text, label);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-2">
            非予約文字 (Unreserved)
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed">
            RFC 3986により、どのような文脈でもエンコードしてはならない文字群です。
          </p>
          <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg font-mono text-xs text-neutral-800 dark:text-neutral-200 break-all select-all">
            A-Z a-z 0-9 - _ . ~
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-2">
            予約文字 (Reserved)
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed">
            URI構文で特別な意味を持つ文字（区切り文字等）。データ値としてはエンコードが必要です。
          </p>
          <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg font-mono text-xs text-neutral-800 dark:text-neutral-200 break-all select-all">
            : / ? # [ ] @ ! $ & ' ( ) * + , ; =
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-2">
            マルチバイト文字 (UTF-8)
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed">
            日本語（ひらがな・カタカナ・漢字・絵文字など）はUTF-8バイト列ごとに %XX 形式に変換されます。
          </p>
          <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg font-mono text-xs text-neutral-800 dark:text-neutral-200 break-all">
            例: 「東」→ %E6%9D%B1 (3バイト)
          </div>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            JavaScript メソッドと各規格の変換挙動の差異
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            目的に応じて適切な規格を選択することで、パラメータの意図せぬ破壊や通信エラーを防止できます。
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-neutral-200 dark:border-neutral-800">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300">
                <th className="py-2.5 px-4 font-semibold">規格 / メソッド</th>
                <th className="py-2.5 px-4 font-semibold">用途・推奨シーン</th>
                <th className="py-2.5 px-4 font-semibold">保持される文字（変換されない）</th>
                <th className="py-2.5 px-4 font-semibold">スペースの扱い</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono text-neutral-700 dark:text-neutral-300">
              <tr>
                <td className="py-3 px-4 font-bold text-sky-700 dark:text-sky-400 font-sans">
                  RFC 3986 厳格 (当アプリ標準)
                </td>
                <td className="py-3 px-4 font-sans text-xs">
                  REST API、クエリパラメータ、OAuth等、厳密な互換性が求められる現代のWeb全般
                </td>
                <td className="py-3 px-4 text-[11px]">
                  A-Z a-z 0-9 - _ . ~
                </td>
                <td className="py-3 px-4 text-xs font-sans">%20</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold font-sans">encodeURIComponent</td>
                <td className="py-3 px-4 font-sans text-xs">
                  ブラウザ標準のURLパラメータ変換。※ ! ' ( ) * は変換されず残ります
                </td>
                <td className="py-3 px-4 text-[11px]">
                  A-Z a-z 0-9 - _ . ! ~ * ' ( )
                </td>
                <td className="py-3 px-4 text-xs font-sans">%20</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold font-sans">encodeURI</td>
                <td className="py-3 px-4 font-sans text-xs">
                  完全なURL全体の構文を保ったまま、パスやクエリ内のマルチバイト文字のみを変換
                </td>
                <td className="py-3 px-4 text-[11px]">
                  : / ? # [ ] @ ! $ & ' ( ) * + , ; = 等のURL構文文字
                </td>
                <td className="py-3 px-4 text-xs font-sans">%20</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold font-sans">application/x-www-form-urlencoded</td>
                <td className="py-3 px-4 font-sans text-xs">
                  HTMLフォームPOST送信や、Google検索などの古典的クエリパラメータ形式
                </td>
                <td className="py-3 px-4 text-[11px]">
                  A-Z a-z 0-9 - _ . *
                </td>
                <td className="py-3 px-4 text-xs font-sans font-bold text-amber-600 dark:text-amber-400">+ (プラス記号)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Characters Fast Search & Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              主要文字・記号のパーセントエンコード対応表
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              よく使われる予約文字と特殊記号のエンコード値一覧（クリックでコピー可能）
            </p>
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="文字、名前、%XXで検索..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:border-neutral-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                <th className="py-2 px-3 font-medium">文字</th>
                <th className="py-2 px-3 font-medium">名称</th>
                <th className="py-2 px-3 font-medium">ASCII HEX</th>
                <th className="py-2 px-3 font-medium">エンコード値</th>
                <th className="py-2 px-3 font-medium">役割・注意事項</th>
                <th className="py-2 px-2 text-center">コピー</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-mono">
              {filteredChars.map((item, idx) => {
                const isCopied = copiedKey === item.char;
                return (
                  <tr
                    key={idx}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-bold text-neutral-900 dark:text-white text-sm">
                      {item.char}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-neutral-600 dark:text-neutral-400">
                      {item.name}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-500 dark:text-neutral-400">
                      {item.hex}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-sky-700 dark:text-sky-400">
                      {item.percent}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-neutral-500 dark:text-neutral-400">
                      {item.rfcRole}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <button
                        onClick={() => handleCopy(item.percent.split(' ')[0], item.char, item.name)}
                        className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded"
                        title="エンコード値をコピー"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Troubleshooting Tips */}
      <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            開発者によくあるURLエンコードの落とし穴 & 回避法
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
          <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-2">
            <h4 className="font-bold text-neutral-900 dark:text-white">
              1. 二重エンコード（Double Encoding）問題
            </h4>
            <p>
              すでにエンコードされた文字列（例: <code className="text-neutral-900 dark:text-white font-mono">%20</code>）を再度エンコードすると、最初のパーセント記号自身が <code className="text-neutral-900 dark:text-white font-mono">%25</code> に変換され、<code className="text-neutral-900 dark:text-white font-mono">%2520</code> となってしまいます。
            </p>
            <p className="text-neutral-500">
              解決策: 当アプリの「再帰的デコード」機能を使えば、多重にエンコードされたURLも元の状態に復元できます。
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-2">
            <h4 className="font-bold text-neutral-900 dark:text-white">
              2. 「+」記号とスペースの混同
            </h4>
            <p>
              URLのパス部分（<code className="text-neutral-900 dark:text-white font-mono">/foo+bar</code>）では「+」はそのまま文字のプラスですが、クエリ文字列（<code className="text-neutral-900 dark:text-white font-mono">?q=foo+bar</code>）では半角スペースとして扱われることがあります。
            </p>
            <p className="text-neutral-500">
              解決策: 本物の「+」記号をクエリパラメータの値として渡したいときは、必ず <code className="text-neutral-900 dark:text-white font-mono">%2B</code> にエンコードしてください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
