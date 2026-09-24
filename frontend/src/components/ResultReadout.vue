<script setup lang="ts">
// 统一的读数展示：底部状态栏与侧栏共用，保证读数格式与显示样式一致。
// value 必须来自 utils/format 的格式化函数；未计算时该函数返回占位文本，
// 同时传入 pending 让读数置灰，与有结果的状态明确区分。
withDefaults(
  defineProps<{
    label: string;
    value: string;
    pending?: boolean;
    valueClass?: string;
    stacked?: boolean;
  }>(),
  { pending: false, valueClass: 'text-slate-200', stacked: false }
);
</script>

<template>
  <div :class="stacked ? 'flex flex-col gap-0.5' : 'inline-flex items-baseline gap-1'">
    <span class="text-slate-400">{{ label }}{{ stacked ? '' : ':' }}</span>
    <span class="font-bold" :class="pending ? 'text-slate-500' : valueClass">
      {{ value }}
    </span>
  </div>
</template>
