export interface PresetItem {
  id: string;
  title: string;
  description: string;
  category: 'japanese' | 'symbols' | 'double_encoded' | 'complex_url' | 'emoji';
  value: string;
  defaultAction: 'encode' | 'decode';
}

export const PRESET_SAMPLES: PresetItem[] = [
  {
    id: 'jp_wiki',
    title: '日本語Wikipedia URL',
    description: 'パスとクエリに日本語（漢字・カタカナ）が含まれるURL',
    category: 'japanese',
    value: 'https://ja.wikipedia.org/wiki/東京スカイツリー?ref=おすすめ&category=観光地#概要',
    defaultAction: 'encode',
  },
  {
    id: 'jp_encoded',
    title: 'エンコード済みの日本語URL',
    description: 'UTF-8でパーセントエンコードされたURL',
    category: 'japanese',
    value: 'https://ja.wikipedia.org/wiki/%E6%9D%B1%E4%BA%AC%E3%82%B9%E3%82%AB%E3%82%A4%E3%83%84%E3%83%AA%E3%83%BC?ref=%E3%81%8A%E3%81%99%E3%81%99%E3%82%81&category=%E8%A6%B3%E5%85%89%E5%9C%B0#%E6%A6%82%E8%A6%81',
    defaultAction: 'decode',
  },
  {
    id: 'symbols',
    title: 'プログラミング言語 & 記号',
    description: 'スペース、+、&、#、スラッシュ等を含むクエリ文字列',
    category: 'symbols',
    value: 'query=C++ & Python/Ruby! (2026)#tag & price=100$ & discount=20%',
    defaultAction: 'encode',
  },
  {
    id: 'double_encoded',
    title: '2重エンコード (リダイレクトURL)',
    description: 'OAuthやリダイレクトで発生しやすい多重エンコードURL',
    category: 'double_encoded',
    value: 'https%3A%2F%2Fexample.com%2Fcallback%3Fredirect_uri%3Dhttps%253A%252F%252Fauth.service.jp%252Ftoken%253Fclient_id%253Dxyz123',
    defaultAction: 'decode',
  },
  {
    id: 'emoji_url',
    title: '絵文字を含む検索URL',
    description: 'サロゲートペア・4バイトUTF-8絵文字（🍣、🍜、🚀）の検証',
    category: 'emoji',
    value: 'https://search.example.com/gourmet?keyword=寿司🍣とラーメン🍜&sort=人気🚀',
    defaultAction: 'encode',
  },
  {
    id: 'rfc_check',
    title: 'RFC 3986 境界記号一覧',
    description: '予約文字・非予約文字の境界検証（! * \' ( ) ; : @ & = + $ , / ? # [ ]）',
    category: 'symbols',
    value: "!*'();:@&=+$,/?#[] ABC abc 123 -_.~",
    defaultAction: 'encode',
  },
];
