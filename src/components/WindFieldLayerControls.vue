<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch, type PropType } from "vue";

import {
  WindFieldLayer,
  type CesiumWindLike,
  type VelocityControlOptions,
  type VelocityMode,
  type WindFieldConfig,
} from "../wind-field";

/** 面板默认加载的数据地址：固定在 public 目录下，避免额外输入框。 */
const DEFAULT_DATA_URL = "./data/wind/wind_001.json";

/** 面板内独立加载的状态机。 */
type PanelStatus = "idle" | "loading" | "ready" | "error";

const props = defineProps({
  /** Cesium Viewer 实例，用于独立创建风场图层；由父组件提供。 */
  viewer: {
    type: Object as PropType<unknown>,
    default: null,
  },
  /** cesium-wind 全局对象，独立创建图层时使用。 */
  cesiumWind: {
    type: Object as PropType<CesiumWindLike | null>,
    default: null,
  },
  /** 独立加载的数据地址，默认取面板内的固定常量。 */
  dataUrl: {
    type: String,
    default: DEFAULT_DATA_URL,
  },
  /** 风场视觉参数，与图层一起透传给 CesiumWind。 */
  windOptions: {
    type: Object as PropType<Partial<WindFieldConfig>>,
    default: () => ({}),
  },
  /** 速度约束模式：pixel 像素每秒，meter 米每秒。 */
  velocityUnit: {
    type: String as PropType<VelocityMode>,
    default: "pixel",
  },
  /** 速度控制目标值与参考风速配置，与时序播放共用同一份业务配置。 */
  velocityControl: {
    type: Object as PropType<VelocityControlOptions>,
    default: () => ({}),
  },
  /** 地图适配器，提供当前分辨率（MapBaseHelper 相机距离法）与视角纬度。 */
  mapAdapter: {
    type: Object as PropType<{
      getResolution?: () => number;
      getScale?: () => number;
      getViewLatitude?: () => number;
    }>,
    default: null,
  },
});

const emit = defineEmits<{
  /** 面板独立加载或操作过程中的错误，向外抛出便于统一提示。 */
  "panel-error": [message: string];
}>();

/** 面板内独立维护的图层实例，与父组件的时序播放图层完全无关。 */
const layer = shallowRef<WindFieldLayer | null>(null);
/** 已经从数据文件解析出的单帧风场数据，用于反复创建图层。 */
const frameData = shallowRef<unknown>(null);
/** 面板内部的加载状态，不依赖父组件的时序播放状态。 */
const status = ref<PanelStatus>("idle");
/** 面板内部的错误信息。 */
const panelError = ref("");
/** 图层是否已创建（创建后才有可操作的底层实例）。 */
const hasLayer = ref(false);
/** 图层当前是否可见。 */
const isVisible = ref(false);

/** 数据文件是否已下载并解析完成。 */
const isDataReady = computed(() => status.value === "ready");
/** 是否正在下载数据。 */
const isLoading = computed(() => status.value === "loading");
/** 面板状态文案。 */
const statusText = computed(() => {
  if (status.value === "loading") return "数据加载中...";
  if (status.value === "error") return "数据加载失败";
  if (status.value !== "ready") return "未加载数据";
  if (!hasLayer.value) return "已加载数据";
  return isVisible.value ? "图层已显示" : "图层已隐藏";
});

/**
 * 直接请求风场 JSON 并解析为 cesium-wind 所需的数据。
 *
 * 该流程不经过 DataManager，只做一次 fetch + JSON 解析。
 * 数据文件格式为「时次数组」，每个时次是 { header, data }；
 * cesium-wind 需要完整时次对象（含 header 投影信息与 data 网格），
 * 因此这里直接返回整个数组，不能只取 data 字段。
 */
async function fetchFrameData(url: string): Promise<unknown> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`图层数据请求失败（HTTP ${response.status}）`);
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error("图层数据文件为空或格式不正确。");
  }
  return payload;
}

/** 加载图层数据（直接请求，不经过 DataManager）。 */
async function loadLayerData(): Promise<void> {
  if (isLoading.value) return;
  if (!props.viewer) {
    status.value = "error";
    panelError.value = "地图尚未初始化，无法加载图层数据。";
    emit("panel-error", panelError.value);
    return;
  }

  status.value = "loading";
  panelError.value = "";
  hasLayer.value = false;
  isVisible.value = false;

  try {
    frameData.value = await fetchFrameData(props.dataUrl);
    status.value = "ready";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    status.value = "error";
    panelError.value = message;
    emit("panel-error", message);
  }
}

/**
 * 确保独立图层实例存在。
 *
 * 数据已经解析完成时直接创建底层图层并显示，否则仅创建实例对象。
 */
function ensureLayer(): WindFieldLayer {
  if (!layer.value || layer.value.isDisposed) {
    layer.value = new WindFieldLayer({
      viewer: props.viewer,
      CesiumWind: props.cesiumWind,
      windOptions: props.windOptions,
      // 速度模式与分辨率换算统一由主类 WindFieldLayer 负责。
      velocityControl: {
        ...props.velocityControl,
        mode: props.velocityUnit === "meter" ? "meter" : "pixel",
      },
      mapAdapter: props.mapAdapter || undefined,
    });
  }
  return layer.value;
}

/** 创建图层：使用已下载的数据创建并显示风场图层。 */
function createLayer(): void {
  if (!isDataReady.value || hasLayer.value || !frameData.value) return;

  try {
    // 速度换算在 WindFieldLayer.createWindLayer 内部完成（含首帧预计算），
    // 这里只负责创建与状态同步。
    ensureLayer().createWindLayer(frameData.value);
    hasLayer.value = true;
    isVisible.value = true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    panelError.value = message;
    emit("panel-error", message);
  }
}

/** 移除图层：销毁底层图层对象，但保留已下载数据以便再次创建。 */
function removeLayer(): void {
  if (!layer.value) return;
  layer.value.removeWindLayer();
  hasLayer.value = false;
  isVisible.value = false;
}

/** 显示图层并恢复粒子动画。 */
function showLayer(): void {
  if (!hasLayer.value) return;
  layer.value?.showWindLayer();
  isVisible.value = true;
}

/** 隐藏图层并暂停粒子动画，但保留图层对象。 */
function hideLayer(): void {
  if (!hasLayer.value) return;
  layer.value?.hideWindLayer();
  isVisible.value = false;
}

/**
 * 速度模式切换：只通知主类，具体换算与生效由 WindFieldLayer 内部完成。
 */
watch(
  () => props.velocityUnit,
  (unit) => {
    layer.value?.setVelocityMode(unit === "meter" ? "meter" : "pixel");
  },
);

/** Viewer 变化时同步给底层图层实例。 */
watch(
  () => props.viewer,
  (nextViewer) => {
    if (layer.value && !layer.value.isDisposed) {
      layer.value.viewer = nextViewer;
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  layer.value?.dispose();
  layer.value = null;
  frameData.value = null;
});
</script>

<template>
  <section class="wind-module wind-module--layer" aria-label="风场图层控制">
    <header class="wind-module__head">
      <h2 class="wind-module__title">图层控制</h2>
      <span class="wind-module__tag">LAYER</span>
    </header>

    <div class="wind-module__body">
      <!-- 分组一：数据与图层生命周期 -->
      <div class="wind-action-group">
        <span class="wind-action-group__label">图层</span>
        <div class="wind-player__actions">
          <button type="button" :disabled="isLoading" @click="loadLayerData">
            {{ isLoading ? "加载中..." : "加载数据" }}
          </button>
          <button type="button" :disabled="!isDataReady || hasLayer" @click="createLayer">创建</button>
          <button type="button" :disabled="!hasLayer" @click="removeLayer">移除</button>
        </div>
      </div>

      <!-- 分组二：图层显隐 -->
      <div class="wind-action-group">
        <span class="wind-action-group__label">显示</span>
        <div class="wind-player__actions">
          <button type="button" :disabled="!hasLayer || isVisible" @click="showLayer">显示</button>
          <button type="button" :disabled="!hasLayer || !isVisible" @click="hideLayer">隐藏</button>
        </div>
      </div>

      <div class="wind-module__foot">
        <span class="wind-module__status" :class="{ 'is-error': status === 'error' }">{{ statusText }}</span>
      </div>
      <p v-if="panelError" class="wind-panel__error">{{ panelError }}</p>
    </div>
  </section>
</template>
