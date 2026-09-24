// ─── 读数显示统一约定 ─────────────────────────────────────────────────────────
// 所有读数（详情面板 / 图例 / 侧栏 / 底部状态栏）共用本模块：
// 1. 没有计算结果时一律显示 NOT_COMPUTED，绝不显示 0.00、横杠等其他形式；
// 2. 有结果时统一套用同一套格式化函数，保证各处读数格式一致。

/** 未计算时的统一占位文本 */
export const NOT_COMPUTED = '未计算';

function orPending<T>(value: T | null | undefined, fmt: (v: T) => string): string {
  return value === null || value === undefined ? NOT_COMPUTED : fmt(value);
}

/** 应力：Pa → MPa，保留 2 位小数 */
export function formatStressMPa(pa: number | null | undefined): string {
  return orPending(pa, (v) => `${(v / 1e6).toFixed(2)} MPa`);
}

/** 位移：m → mm，保留 3 位小数 */
export function formatDisplacementMM(m: number | null | undefined): string {
  return orPending(m, (v) => `${(v * 1000).toFixed(3)} mm`);
}

/** 应变：小数 → 百分数，保留 4 位小数 */
export function formatStrainPercent(strain: number | null | undefined): string {
  return orPending(strain, (v) => `${(v * 100).toFixed(4)} %`);
}

/** 轴力：N → kN，保留 2 位小数 */
export function formatForceKN(n: number | null | undefined): string {
  return orPending(n, (v) => `${(v / 1000).toFixed(2)} kN`);
}

/** 图例峰值：换算到与面板一致的单位（MPa / % / kN）后用科学计数法紧凑显示 */
export function formatLegendMax(
  mode: 'stress' | 'strain' | 'force',
  value: number | null | undefined
): string {
  if (value === null || value === undefined) return NOT_COMPUTED;
  switch (mode) {
    case 'stress':
      return `${(value / 1e6).toExponential(1)} MPa`;
    case 'strain':
      return `${(value * 100).toExponential(1)} %`;
    case 'force':
      return `${(value / 1000).toExponential(1)} kN`;
  }
}
