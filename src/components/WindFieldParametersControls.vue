<script setup lang="ts">
import { reactive, watch, type PropType } from "vue";

import type WindFieldLayer from "../wind-field/WindFieldLayer";

interface WindParameters {
  paths: number;
  lineWidth: number;
  speed: number;
  maxAge: number;
}

const props = defineProps({
  windLayer: {
    type: Object as PropType<WindFieldLayer | null>,
    default: null,
  },
  paths: {
    type: Number,
    default: 2000,
  },
  lineWidth: {
    type: Number,
    default: 2,
  },
  speed: {
    type: Number,
    default: 0.2,
  },
  maxAge: {
    type: Number,
    default: 60,
  },
  disabled: {
    type: Boolean,
    default: true,
  },
  errorMessage: {
    type: String,
    default: "",
  },
});

const emit = defineEmits<{
  /** 通知父组件参数已经写入风场图层。 */
  "parameters-changed": [parameters: WindParameters];
}>();

// 参数状态归组件自己维护，App.vue 不再保存或转发每个滑块的变化。
const parameters = reactive<WindParameters>({
  paths: props.paths,
  lineWidth: props.lineWidth,
  speed: props.speed,
  maxAge: props.maxAge,
});

watch(
  () => [props.paths, props.lineWidth, props.speed, props.maxAge],
  ([paths, lineWidth, speed, maxAge]) => {
    parameters.paths = paths;
    parameters.lineWidth = lineWidth;
    parameters.speed = speed;
    parameters.maxAge = maxAge;
  },
);

// App 创建新的 WindFieldLayer 后，把组件当前参数重新应用到新图层，
// 避免重新加载数据时界面显示的参数和实际图层配置不一致。
watch(
  () => props.windLayer,
  (layer) => {
    if (!layer) return;
    layer.setPaths(Number(parameters.paths));
    layer.setLineWidth(Number(parameters.lineWidth));
    layer.setVelocityScale(Number(parameters.speed) / 30);
    layer.setMaxAge(Number(parameters.maxAge));
  },
  { immediate: true },
);

/** 将粒子数量写入底层风场图层，并通知父组件记录操作结果。 */
function updatePaths(): void {
  const value = Number(parameters.paths);
  props.windLayer?.setPaths(value);
  emit("parameters-changed", { ...parameters, paths: value });
}

/** 将轨迹线宽写入底层风场图层。 */
function updateLineWidth(): void {
  const value = Number(parameters.lineWidth);
  props.windLayer?.setLineWidth(value);
  emit("parameters-changed", { ...parameters, lineWidth: value });
}

/** 将速度倍率转换成 CesiumWind 使用的速度缩放比例后写入图层。 */
function updateSpeed(): void {
  const value = Number(parameters.speed);
  props.windLayer?.setVelocityScale(value / 30);
  emit("parameters-changed", { ...parameters, speed: value });
}

/** 将粒子寿命写入底层风场图层。 */
function updateMaxAge(): void {
  const value = Number(parameters.maxAge);
  props.windLayer?.setMaxAge(value);
  emit("parameters-changed", { ...parameters, maxAge: value });
}
</script>

<template>
  <section class="wind-panel wind-panel--settings" aria-label="风场渲染配置">
    <div class="wind-panel__header">风场参数</div>
    <label class="wind-panel__row">
      <span class="wind-panel__row-head"><span>粒子数量</span><strong>{{ parameters.paths }}</strong></span>
      <input v-model.number="parameters.paths" type="range" min="100" max="8000" step="100" :disabled="props.disabled" @input="updatePaths" />
    </label>
    <label class="wind-panel__row">
      <span class="wind-panel__row-head"><span>线宽</span><strong>{{ parameters.lineWidth }}px</strong></span>
      <input v-model.number="parameters.lineWidth" type="range" min="0.5" max="5" step="0.5" :disabled="props.disabled" @input="updateLineWidth" />
    </label>
    <label class="wind-panel__row">
      <span class="wind-panel__row-head"><span>速度倍率</span><strong>{{ parameters.speed.toFixed(2) }}x</strong></span>
      <input v-model.number="parameters.speed" type="range" min="0.01" max="1" step="0.01" :disabled="props.disabled" @input="updateSpeed" />
    </label>
    <label class="wind-panel__row">
      <span class="wind-panel__row-head"><span>粒子寿命</span><strong>{{ parameters.maxAge }}帧</strong></span>
      <input v-model.number="parameters.maxAge" type="range" min="10" max="200" step="5" :disabled="props.disabled" @input="updateMaxAge" />
    </label>
    <p v-if="props.errorMessage" class="wind-panel__error">{{ props.errorMessage }}</p>
  </section>
</template>
