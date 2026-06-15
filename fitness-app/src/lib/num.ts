// 入力文字列を半角数字だけに整える（かな・全角・記号を除去し、NaN 表示を防ぐ）。
export const toIntInput = (t: string) => t.replace(/[^0-9]/g, '');

// 小数点を1つだけ許す数値入力。
export const toDecimalInput = (t: string) =>
  t.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
