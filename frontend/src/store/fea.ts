import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { FEAModel, FEAResult } from '../types';
import {
  solve as feaSolve,
  presetCantileverBeam,
  presetBridgeTruss,
  presetSimpleFrame,
  jetColormap,
} from '../utils/fea-solver';

export const useFEAStore = defineStore('fea', () => {
  const model = ref<FEAModel>({ nodes: [], elements: [], loads: [] });
  const result = ref<FEAResult | null>(null);
  const selectedPreset = ref<string>('cantilever');
  const showDeformed = ref(false);
  const deformationScale = ref(10);
  const selectedElement = ref<number | null>(null);
  const heatmapMode = ref<'stress' | 'strain' | 'force'>('stress');

  // ─── Actions ──────────────────────────────────────────────────────────────
  function loadPreset(name: string) {
    selectedPreset.value = name;
    result.value = null;
    selectedElement.value = null;
    switch (name) {
      case 'cantilever':
        model.value = presetCantileverBeam();
        break;
      case 'bridge':
        model.value = presetBridgeTruss();
        break;
      case 'frame':
        model.value = presetSimpleFrame();
        break;
      default:
        model.value = presetCantileverBeam();
    }
  }

  function solve() {
    result.value = feaSolve(model.value);
  }

  function toggleDeformed() {
    showDeformed.value = !showDeformed.value;
  }

  function selectElement(id: number | null) {
    selectedElement.value = id;
  }

  function setHeatmapMode(mode: 'stress' | 'strain' | 'force') {
    heatmapMode.value = mode;
  }

  function addLoad(nodeId: number, fx: number, fy: number) {
    model.value.loads.push({ nodeId, fx, fy });
  }

  function toggleFixed(nodeId: number) {
    const node = model.value.nodes.find((n) => n.id === nodeId);
    if (node) node.fixed = !node.fixed;
  }

  // ─── Computed ─────────────────────────────────────────────────────────────
  // 所有读数都以 result 为唯一数据源；未计算时一律为 null，由 UI 统一显示占位
  const hasResult = computed(() => result.value !== null);

  const maxStress = computed(() => {
    if (!result.value) return null;
    return result.value.maxStress;
  });

  const maxDisplacement = computed(() => {
    if (!result.value) return null;
    return result.value.maxDisplacement;
  });

  // 每个单元的计算结果（应力/应变/轴力），与 result 的数组按单元顺序一一对应
  const elementResults = computed(() => {
    const map = new Map<number, { stress: number; strain: number; force: number }>();
    if (!result.value) return map;
    model.value.elements.forEach((el, i) => {
      map.set(el.id, {
        stress: result.value!.stresses[i],
        strain: result.value!.strains[i],
        force: result.value!.forces[i],
      });
    });
    return map;
  });

  // 各热力图模式的峰值（取绝对值），图例与着色共用同一份
  const modeMaxes = computed(() => {
    if (!result.value) return null;
    const absMax = (arr: number[]) => Math.max(...arr.map(Math.abs));
    return {
      stress: absMax(result.value.stresses),
      strain: absMax(result.value.strains),
      force: absMax(result.value.forces),
    };
  });

  const elementColors = computed(() => {
    const colors = new Map<number, string>();
    if (!result.value || model.value.elements.length === 0) {
      for (const el of model.value.elements) {
        colors.set(el.id, '#6b7280');
      }
      return colors;
    }

    let values: number[];
    switch (heatmapMode.value) {
      case 'stress':
        values = result.value.stresses.map(Math.abs);
        break;
      case 'strain':
        values = result.value.strains.map(Math.abs);
        break;
      case 'force':
        values = result.value.forces.map(Math.abs);
        break;
      default:
        values = result.value.stresses.map(Math.abs);
    }

    const min = Math.min(...values);
    const max = Math.max(...values);

    for (let i = 0; i < model.value.elements.length; i++) {
      colors.set(
        model.value.elements[i].id,
        jetColormap(values[i], min, max)
      );
    }
    return colors;
  });

  return {
    model,
    result,
    selectedPreset,
    showDeformed,
    deformationScale,
    selectedElement,
    heatmapMode,
    hasResult,
    maxStress,
    maxDisplacement,
    elementResults,
    modeMaxes,
    elementColors,
    loadPreset,
    solve,
    toggleDeformed,
    selectElement,
    setHeatmapMode,
    addLoad,
    toggleFixed,
  };
});
