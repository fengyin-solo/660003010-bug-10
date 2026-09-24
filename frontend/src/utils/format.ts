// 统一的读数格式：详情面板、侧栏、底栏、图例共用同一套换算与精度，
// 避免同一结果在不同位置显示出不同数字。

export const PENDING_LABEL = '未计算';

/** 应力 Pa -> MPa */
export function formatStress(stressPa: number): string {
  return `${(stressPa / 1e6).toFixed(2)} MPa`;
}

/** 应变（无量纲） -> % */
export function formatStrain(strain: number): string {
  return `${(strain * 100).toFixed(4)} %`;
}

/** 轴力 N -> kN */
export function formatForce(forceN: number): string {
  return `${(forceN / 1000).toFixed(2)} kN`;
}

/** 位移 m -> mm */
export function formatDisplacement(displacementM: number): string {
  return `${(displacementM * 1000).toFixed(3)} mm`;
}

/** 图例顶端紧凑标签：与详情使用相同换算，只保留两位小数 */
export function formatHeatmapValue(mode: 'stress' | 'strain' | 'force', value: number): string {
  switch (mode) {
    case 'stress':
      return formatStress(value);
    case 'strain':
      return formatStrain(value);
    case 'force':
      return formatForce(value);
  }
}
