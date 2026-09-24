<script setup lang="ts">
import { computed } from 'vue';
import { useFEAStore } from '../store/fea';
import {
  PENDING_LABEL,
  formatStress,
  formatStrain,
  formatForce,
} from '../utils/format';

const store = useFEAStore();

const selectedEl = computed(() => {
  if (store.selectedElement === null) return null;
  return store.model.elements.find((e) => e.id === store.selectedElement) || null;
});

// 应力/应变/轴力只认本次求解结果；未求解时为 null，绝不显示初始 0
const resultData = computed(() => {
  if (!selectedEl.value) return null;
  return store.getElementResult(selectedEl.value.id);
});

const node1 = computed(() => {
  if (!selectedEl.value) return null;
  return store.model.nodes.find((n) => n.id === selectedEl.value!.nodeIds[0]) || null;
});

const node2 = computed(() => {
  if (!selectedEl.value) return null;
  return store.model.nodes.find((n) => n.id === selectedEl.value!.nodeIds[1]) || null;
});

const length = computed(() => {
  if (!node1.value || !node2.value) return 0;
  const dx = node2.value.x - node1.value.x;
  const dy = node2.value.y - node1.value.y;
  return Math.sqrt(dx * dx + dy * dy);
});

const angle = computed(() => {
  if (!node1.value || !node2.value) return 0;
  const dx = node2.value.x - node1.value.x;
  const dy = node2.value.y - node1.value.y;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
});

const color = computed(() => {
  if (store.selectedElement === null) return '#6b7280';
  return store.elementColors.get(store.selectedElement) || '#6b7280';
});
</script>

<template>
  <div class="bg-slate-800 rounded-lg p-4">
    <h3 class="text-sm font-bold text-slate-200 border-b border-slate-700 pb-2 mb-3">
      单元详情
    </h3>

    <div v-if="!selectedEl" class="text-xs text-slate-500 text-center py-6">
      点击一个单元查看详情
    </div>

    <div v-else class="space-y-2 text-xs">
      <!-- Color indicator -->
      <div class="flex items-center gap-2 mb-3">
        <div class="w-4 h-4 rounded" :style="{ backgroundColor: color }" />
        <span class="text-slate-300 font-medium">单元 #{{ selectedEl.id }}</span>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div class="bg-slate-900 rounded p-2">
          <div class="text-slate-400">连接节点</div>
          <div class="text-sm font-mono text-slate-200">
            {{ selectedEl.nodeIds[0] }} → {{ selectedEl.nodeIds[1] }}
          </div>
        </div>
        <div class="bg-slate-900 rounded p-2">
          <div class="text-slate-400">长度 / 角度</div>
          <div class="text-sm font-mono text-slate-200">
            {{ length.toFixed(3) }}m / {{ angle.toFixed(1) }}°
          </div>
        </div>
        <div class="bg-slate-900 rounded p-2">
          <div class="text-slate-400">截面积</div>
          <div class="text-sm font-mono text-slate-200">
            {{ (selectedEl.area * 1e6).toFixed(0) }} mm²
          </div>
        </div>
        <div class="bg-slate-900 rounded p-2">
          <div class="text-slate-400">弹性模量</div>
          <div class="text-sm font-mono text-slate-200">
            {{ (selectedEl.youngsModulus / 1e9).toFixed(0) }} GPa
          </div>
        </div>
      </div>

      <div class="border-t border-slate-700 pt-2 mt-2">
        <div class="flex items-center justify-between mb-1">
          <div class="text-slate-400">计算结果</div>
          <div v-if="!resultData" class="text-[10px] text-slate-500">
            {{ PENDING_LABEL }}：点击「求解 FEA」后显示
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div class="bg-slate-900 rounded p-2">
            <div class="text-slate-500 text-[10px]">应力</div>
            <div class="text-sm font-bold" :class="resultData ? '' : 'text-slate-600'">
              <template v-if="resultData" :style="{ color }">
                {{ formatStress(resultData.stress) }}
              </template>
              <template v-else>— MPa</template>
            </div>
          </div>
          <div class="bg-slate-900 rounded p-2">
            <div class="text-slate-500 text-[10px]">应变</div>
            <div class="text-sm font-bold" :class="resultData ? 'text-sky-400' : 'text-slate-600'">
              <template v-if="resultData">{{ formatStrain(resultData.strain) }}</template>
              <template v-else>— %</template>
            </div>
          </div>
          <div class="bg-slate-900 rounded p-2">
            <div class="text-slate-500 text-[10px]">轴力</div>
            <div class="text-sm font-bold" :class="resultData ? 'text-amber-400' : 'text-slate-600'">
              <template v-if="resultData">{{ formatForce(resultData.force) }}</template>
              <template v-else>— kN</template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
