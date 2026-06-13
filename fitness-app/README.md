# FitTracker 💪

筋トレ・体づくりをサポートするパーソナライズアプリ。
**Expo (React Native)** 製で、iOS / Android / Web を 1 つのコードベースで動かす。

## 主な機能

- **ダッシュボード** — 今日のサマリー、7日間の体重グラフ、最近のワークアウト
- **ワークアウト記録** — 種目・セット・重量・回数の記録、休憩タイマー（経過時間ストップウォッチ付き）
- **食事管理** — カロリー・PFC マクロの記録と今日の合計
- **体型トラッキング** — 体重・体脂肪率・筋肉量の記録と 30 日グラフ
- **トレーニングプラン** — 曜日別の週間メニュー作成
- **オンボーディング** — 目標・基本情報・活動量から TDEE と目標カロリーを算出

## 技術スタック

| 領域 | 採用技術 |
|---|---|
| Framework | Expo SDK 56 + expo-router（React Native 0.85 / React 19） |
| 言語 | TypeScript |
| スタイル | NativeWind（Tailwind CSS、ダークテーマ） |
| 状態管理 / 永続化 | Zustand + AsyncStorage |
| グラフ | react-native-svg（自作 LineChart） |
| アイコン | lucide-react-native |

## セットアップ

```bash
npm install
npx expo start
```

起動後、ターミナルで:

- `w` … PC のブラウザで開く（Web）
- `a` … Android エミュレータ / 接続デバイス
- `i` … iOS シミュレータ（macOS）
- スマホ実機 … [Expo Go](https://expo.dev/go) アプリで QR コードを読み取り

## Web 配信

```bash
npx expo export -p web   # dist/ に静的書き出し（Cloudflare Pages などに配信可能）
```

## ディレクトリ

ファイルベースルーティング（`src/app`）。詳細は [CLAUDE.md](./CLAUDE.md) を参照。
