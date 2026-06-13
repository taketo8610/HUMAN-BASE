// React Native (Hermes) には crypto.randomUUID がないため、衝突確率の十分低い簡易IDを生成する。
// ローカル保存のレコード識別用途であり、暗号学的な強度は不要。
export function genId(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10)
  );
}
