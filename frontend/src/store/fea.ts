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
  const maxStress = computed(() => {
    if (!result.value) return 0;
    return result.value.maxStress;
  });

  const maxDisplacement = computed(() => {
    if (!result.value) return 0;
    return result.value.maxDisplacement;
  });

  // 当前热力图模式对应的每单元读数（有结果时一律取自同一次 result）
  const heatmapValues = computed<number[]>(() => {
    if (!result.value) return [];
    switch (heatmapMode.value) {
      case 'stress':
        return result.value.stresses.map(Math.abs);
      case 'strain':
        return result.value.strains.map(Math.abs);
      case 'force':
        return result.value.forces.map(Math.abs);
      default:
        return result.value.stresses.map(Math.abs);
    }
  });

  const heatmapRange = computed(() => {
    const values = heatmapValues.value;
    if (values.length === 0) return { min: 0, max: 0 };
    return { min: Math.min(...values), max: Math.max(...values) };
  });

  const elementColors = computed(() => {
    const colors = new Map<number, string>();
    if (!result.value || model.value.elements.length === 0) {
      for (const el of model.value.elements) {
        colors.set(el.id, '#6b7280');
      }
      return colors;
    }

    const { min, max } = heatmapRange.value;

    model.value.elements.forEach((el, i) => {
      colors.set(el.id, jetColormap(heatmapValues.value[i], min, max));
    });
    return colors;
  });

  // 按单元 id 取本次求解的应力/应变/轴力；未求解时为 null
  function getElementResult(elementId: number): { stress: number; strain: number; force: number } | null {
    if (!result.value) return null;
    const index = model.value.elements.findIndex((e) => e.id === elementId);
    if (index < 0) return null;
    return {
      stress: result.value.stresses[index],
      strain: result.value.strains[index],
      force: result.value.forces[index],
    };
  }

  return {
    model,
    result,
    selectedPreset,
    showDeformed,
    deformationScale,
    selectedElement,
    heatmapMode,
    maxStress,
    maxDisplacement,
    elementColors,
    heatmapValues,
    heatmapRange,
    getElementResult,
    loadPreset,
    solve,
    toggleDeformed,
    selectElement,
    setHeatmapMode,
    addLoad,
    toggleFixed,
  };
});
