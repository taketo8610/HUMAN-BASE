@AGENTS.md

# FitTracker — プロジェクト概要

筋トレ・体づくりをサポートするパーソナライズアプリ。
スマホアプリ（iOS/Android）を主軸に、同一コードベースで Web でも動作する。
モチベーション維持と個別最適化を軸に、将来的にビジネス化を目指す。

## 技術スタック

- **Framework**: Expo SDK 56 + expo-router（React Native 0.85 / React 19、TypeScript）
- **Styling**: NativeWind（Tailwind CSS）— ダークテーマ、オレンジアクセント
- **State / 永続化**: Zustand + AsyncStorage（persist middleware）
- **グラフ**: react-native-svg による自作 `LineChart`
- **アイコン**: lucide-react-native
- **日付**: date-fns（ja ロケール）

iOS / Android / Web を 1 コードベースで提供する。バックエンド・DBは現状なし（Phase 2 以降で Supabase 導入予定）。

> 旧構成は Next.js（Web のみ）だったが、スマホアプリ化のため Expo (React Native) へ移行した。
> ビジネスロジック（`src/lib`・`src/store`・`src/types`）はプラットフォーム非依存で移植している。

## 起動方法

```bash
npm install
npx expo start        # w=Web(PCブラウザ), a=Android, i=iOS。実機は Expo Go アプリで QR 読み取り
```

- Web 静的書き出し: `npx expo export -p web` → `dist/`（Cloudflare Pages などに配信可能）
- 型チェック: `npx tsc --noEmit`

## 現在の実装状況（Phase 1 進行中）

### 実装済み
- [x] ダッシュボード (`/`) — 今日のサマリー、7日間体重グラフ、最近のワークアウト
- [x] ワークアウト記録 (`/workout`) — 種目・セット・重量・回数の記録/削除
- [x] ワークアウトタイマー — セット間休憩カウントダウン（30s〜3分）、経過時間ストップウォッチ
- [x] 食事管理 (`/meal`) — カロリー・PFCマクロ記録、今日の合計
- [x] 体型トラッキング (`/body`) — 体重・体脂肪率・筋肉量、30日グラフ
- [x] トレーニングプラン (`/plan`) — 曜日別週間メニュー作成
- [x] オンボーディング — モチベーション選択 → 基本情報 → 活動量 → 運動環境 → 目標提示 → 完了（全ステップスキップ可、後から変更可）
- [x] TDEE 計算・目標カロリー算出 (`src/lib/fitness.ts`)

### Phase 1 残タスク（UIを磨く）
- [ ] ダッシュボード強化 — オンボーディング結果を活かした目標カロリー進捗表示
- [ ] トレーニングメニュー自動提案 — 運動環境・目標に基づく推奨メニュー生成
- [ ] オンボーディング再設定 — プロフィール画面から変更できるUI
- [ ] 日付入力の改善 — ネイティブ DatePicker の導入
- [ ] ビジュアル全体磨き — カード・グラフ・フォームのデザイン改善

## フェーズ計画

### Phase 1 — ローカル完結（現在）
UIを磨く。サーバーなし、AsyncStorage のみ。

### Phase 2 — Supabase 導入
- ユーザー認証（メール / Google）
- クラウド同期（複数デバイス対応）
- フレンド機能・進捗共有（アプリ内SNS的な機能）

### Phase 3 — 収益化
- プロモーション枠（ジム・プロテイン・食事宅配サービスの広告）
- サブスクリプション（Stripe 連携、プレミアム機能）
- スマート体重計連携（eufy / Withings 等の API。ネイティブ専用機能は Web では無効化して分岐）

## 要件・設計方針

### オンボーディング
- 選択肢ベースのステップ式（AI対話ではない）
- 選択肢に当てはまらない場合は自由入力でフォロー
- 全ステップスキップ可（スキップ時はデフォルト値で動作）
- プロフィール画面からいつでも再設定可能

### ビジネスモデル
- 無料層：基本記録機能 + 広告（ジム・プロテイン・食事宅配）
- 有料層（サブスク）：広告非表示・AIアドバイス・詳細分析

### ソーシャル機能（Phase 2）
- アプリ内フレンド機能（アカウント登録が必要）
- 友達と進捗・トレーニング結果を共有

### スマート体重計連携（Phase 3）
- eufy、Withings 等の API 連携
- 体重データを自動同期

## ディレクトリ構成

```
src/
  app/
    _layout.tsx          # ルート（Stack + OnboardingGate + テーマ/SafeArea）
    (tabs)/
      _layout.tsx        # タブナビ（5タブ・ダークテーマ）
      index.tsx          # ダッシュボード
      workout.tsx        # ワークアウト記録 + タイマー
      meal.tsx           # 食事管理
      body.tsx           # 体型トラッキング
      plan.tsx           # トレーニングプラン
  components/
    OnboardingGate.tsx   # オンボーディング表示制御（hydration 後に判定）
    OnboardingFlow.tsx   # オンボーディング 6 ステップ
    WorkoutTimer.tsx     # 休憩カウントダウン + 経過ストップウォッチ
    LineChart.tsx        # react-native-svg の軽量折れ線グラフ
    ui.tsx               # Card / Field / PrimaryButton / EmptyState
  lib/
    fitness.ts           # TDEE・BMR・目標カロリー計算
    id.ts                # レコード用 ID 生成（crypto.randomUUID の代替）
    colors.ts            # JS で色値が必要な箇所（ナビ・グラフ）の定数
  store/
    useAppStore.ts       # Zustand store（全データ + userProfile、AsyncStorage 永続化）
  types/
    index.ts             # 全型定義
```
