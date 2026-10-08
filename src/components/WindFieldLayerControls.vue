<script setup lang="ts">
import type { PropType } from "vue";

import type WindFieldLayer from "../wind-field/WindFieldLayer";

const props = defineProps({
  windLayer: {
    type: Object as PropType<WindFieldLayer | null>,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits<{
  /** 图层对象销毁后，通知父组件清理播放对象和引用。 */
  "layer-disposed": [];
}>();

/** 显示图层并恢复粒子动画。 */
function showLayer(): void {
  props.windLayer?.showWindLayer();
}

/** 隐藏图层并暂停粒子动画，但保留图层对象。 */
function hideLayer(): void {
  props.windLayer?.hideWindLayer();
}

/** 移除当前 CesiumWind 图层，之后可以继续加载或显示下一帧。 */
function removeLayer(): void {
  props.windLayer?.removeWindLayer();
}

/** 只播放当前风场粒子动画，不改变时序播放状态。 */
function playAnimation(): void {
  props.windLayer?.playWindAnimation();
}

/** 暂停当前风场粒子动画，不清除图层。 */
function pauseAnimation(): void {
  props.windLayer?.stopWindAnimation();
}

/** 销毁图层对象，并把清理动作通知给父组件。 */
function disposeLayer(): void {
  props.windLayer?.dispose();
  emit("layer-disposed");
}
</script>

<template>
  <section class="wind-panel wind-panel--layer" aria-label="风场图层控制">
    <div class="wind-panel__header">图层控制</div>
    <div class="wind-player__actions">
      <button type="button" :disabled="props.disabled" @click="showLayer">显示图层</button>
      <button type="button" :disabled="props.disabled" @click="hideLayer">隐藏图层</button>
      <button type="button" :disabled="props.disabled" @click="removeLayer">移除图层</button>
    </div>
    <div class="wind-player__actions">
      <button type="button" :disabled="props.disabled" @click="playAnimation">播放动画</button>
      <button type="button" :disabled="props.disabled" @click="pauseAnimation">暂停动画</button>
      <button type="button" :disabled="props.disabled" @click="disposeLayer">销毁图层</button>
    </div>
  </section>
</template>
