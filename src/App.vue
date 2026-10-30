<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  markRaw,
} from "vue";

import WindFieldLayerControls from "./components/WindFieldLayerControls.vue";
import WindFieldParametersControls from "./components/WindFieldParametersControls.vue";
import { WindFieldPlayer } from "./wind-field";

const loading = ref(false);
const errorMessage = ref("");
const isReady = ref(false);
const isPlaying = ref(false);
const frameCount = ref(0);
const currentIndex = ref(0);
const currentTime = ref("");
// 速度控制：m/s 按目标米每秒，px/s 按目标像素每秒
const velocityUnit = ref("px/s");
// 地图模式枚举：与 MyMapAdapter.switchCesiumMode 的入参一致（0=二维，1=三维）。
const MAP_MODE_2D = 0;
const MAP_MODE_3D = 1;
// 当前地图模式，与 createViewer 中的初始设置保持同步。
const mapMode = ref(MAP_MODE_3D);

let viewer = null;
// 保存 CesiumMap 实例，供图层初始化与地图适配器读取地图状态使用。
let mapView = null;
// 使用 shallowRef 让两个控制组件能在图层创建/销毁后拿到最新实例。
const windLayer = shallowRef(null);
// cesium-wind 全局对象，供图层控制面板独立创建图层使用。
const cesiumWind = shallowRef(null);
let windPlayer = null;
let frames = [];

const config = {
  // 风场数据解析 Worker 脚本地址，由 DataManager 异步加载风场文件时使用
  dataWorkerUrl: "./dataManager/workers/wind_field_worker.js",
  // 解析 Worker 并发数量，1 表示串行加载各时次
  dataWorkerCount: 1,
  // 时序自动播放时每帧停留时长，单位毫秒（2000 即每帧 2 秒）
  frameInterval: 4000,
  // 粒子视觉参数，透传给 cesium-wind 的 WindLayer
  windOptions: {
    // 粒子拖尾保留时长（单位：帧），值越大轨迹越长
    maxAge: 60,
    // 粒子整体不透明度，范围 0~1
    globalAlpha: 0.9,
    // 粒子拖尾线条宽度（单位：像素）
    lineWidth: 2,
    // 屏幕中同时存在的粒子数量上限，值越大越密、性能开销越高
    paths: 2000,
  },
  // 速度控制
  velocityControl: {
    // 当前生效模式：pixel 像素每秒（屏幕速度恒定）、meter 米每秒（地面速度恒定）
    mode: "pixel",
    // 实际速度调整系数：对外唯一可调量，作用于真实风速，把真实风速放大到可见量级
    realSpeedFactor: 2500,
  },
  // 图层控制面板的独立数据源：固定地址，与时序播放数据互不影响
  layerPanel: {
    // 图层控制面板单独请求的数据文件地址
    dataUrl: "./data/wind/wind_003.json",
  },
};

/** 按当前速度单位生成 WindFieldPlayer 需要的 velocityControl 配置。 */
function buildVelocityControl() {
  // 统计口径与单位换算不传，交由 WindFieldLayer 使用内部默认值。
  return {
    mode: velocityUnit.value === "m/s" ? "meter" : "pixel",
    realSpeedFactor: config.velocityControl.realSpeedFactor,
  };
}

// 模拟真实项目中的时次清单：每个时次对应一个独立的数据文件。
// 时间信息来自业务侧的时次元数据，不放在风场 JSON 文件中。
const frameConfigs = [
  {
    key: "synthetic-wind-20260918-00",
    time: "2026-09-18T00:00:00Z",
    dataUrl: "http://192.168.20.10:8408/v1/info/wind_files/wind_001.json",
    dataType: "data_2d",
  },
  {
    key: "synthetic-wind-20260918-03",
    time: "2026-09-18T03:00:00Z",
    dataUrl: "http://192.168.20.10:8408/v1/info/wind_files/wind_002.json",
    dataType: "data_2d",
  },
  {
    key: "synthetic-wind-20260918-06",
    time: "2026-09-18T06:00:00Z",
    dataUrl: "http://192.168.20.10:8408/v1/info/wind_files/wind_003.json",
    dataType: "data_2d",
  },
  {
    key: "synthetic-wind-20260918-09",
    time: "2026-09-18T09:00:00Z",
    dataUrl: "http://192.168.20.10:8408/v1/info/wind_files/wind_004.json",
    dataType: "data_2d",
  },
];

const statusText = computed(() => {
  if (errorMessage.value) return "加载失败";
  if (loading.value) return "正在加载风场";
  if (!isReady.value) return "未加载";
  return isPlaying.value ? "播放中" : "已暂停";
});

const formattedTime = computed(() => {
  if (!currentTime.value) return "--";
  return new Date(currentTime.value).toLocaleString("zh-CN");
});

function assertGlobal(name) {
  if (!window[name]) throw new Error(`${name} 未加载，请检查 index.html。`);
  return window[name];
}

function createViewer() {
  const maplet = new MyMapAdapter.CesiumMap(
    document.getElementById("cesiumContainer"),
  );
  const pMapView = markRaw(maplet);
  pMapView.initMap();
  pMapView.switchCesiumMode(MAP_MODE_3D);

  addAnnotationBaseMap(pMapView);
  viewer = pMapView.viewer;
  mapView = pMapView;
  // 地图模式变化（包括地图内部触发的切换）时同步按钮选中态。
  pMapView.mapModelTypeChangeCallback = (mode) => {
    mapMode.value = mode;
  };
  // 图层面板独立创建图层时需要同一个 cesium-wind 全局对象。
  cesiumWind.value = window.CesiumWind || null;
}

/**
 * 速度换算使用的地图适配器。
 *
 * 分辨率统一采用 MapBaseHelper 的「相机距离法」计算，与页面比例尺来源保持一致：
 *   const center = MapBaseHelper.getMapsCenter(viewer);
 *   const dis = MapBaseHelper.getCameraDistance(viewer, center);
 *   const level = MapBaseHelper.getMapsLevel(viewer, center);
 *   let resolution = MapBaseHelper.level2Resolution(level, true);
 *   const scale = MapBaseHelper.resolution2Scale(resolution);
 *   const level2 = MapBaseHelper.distance2MapsLevel(viewer, dis);
 *   resolution = MapBaseHelper.level2Resolution(level2, true);
 * 适配器只暴露风场计算真正需要的两个量：
 *   - getResolution()：最终分辨率（米/像素）；
 *   - getScale()：按该分辨率换算出的比例尺分母。
 * 两者均由 MapBaseHelper 静态方法在调用时刻实时读取地图状态。
 */
function buildVelocityMapAdapter() {
  return {
    /** 取得当前分辨率（米/像素），即上文 level2Resolution(level2, true) 的结果。 */
    getResolution: () => {
      const helper = MyMapAdapter?.MapBaseHelper;
      if (!helper || !viewer) return 0;
      // 取地图中心点作为相机距离的参考点（未取到中心时传 undefined，由射线拾取兜底）。
      const center = helper.getMapsCenter(viewer);
      const distance = helper.getCameraDistance(viewer, center);
      // 先用中心点求层级，再用相机距离反算层级，取反算结果作为最终层级。
      const level = helper.getMapsLevel(viewer, center);
      let resolution = helper.level2Resolution(level, true);
      const levelByDistance = helper.distance2MapsLevel(viewer, distance);
      resolution = helper.level2Resolution(levelByDistance, true);
      return resolution;
    },
    /** 取得当前比例尺分母，与页面比例尺展示口径一致（Math.round 前的结果）。 */
    getScale: () => {
      const resolution = buildVelocityMapAdapter().getResolution();
      return MyMapAdapter?.MapBaseHelper?.resolution2Scale?.(resolution) ?? 0;
    },
    getViewLatitude: () => {
      const cartographic = viewer?.camera?.positionCartographic;
      const latitude = cartographic?.latitude;
      return typeof latitude === "number" ? (latitude * 180) / Math.PI : 0;
    },
  };
}

// 供图层控制面板复用的地图适配器实例，函数内部实时读取最新地图状态。
const velocityMapAdapter = buildVelocityMapAdapter();

const addAnnotationBaseMap = (pMapView) => {
  const viewer = pMapView.viewer;
  if (!viewer) {
    return;
  }

  const url =
    "https://{s}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=dac97be0400bd474a33f28a771eb9b5e";

  const addLayer = (url, id) => {
    const layer = viewer.imageryLayers.addImageryProvider(
      new Cesium.UrlTemplateImageryProvider({
        url,
        subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
        maximumLevel: 18,
      }),
    );
    layer._id = id;
    layer.zIndex = 3;
    layer.alpha = 1;
    return layer;
  };

  addLayer(url, "TIANDITU_CVA");
};

function pausePlayback() {
  windPlayer?.pause();
}

function stopPlayback() {
  windPlayer?.clear();
  isPlaying.value = false;
  isReady.value = false;
  currentIndex.value = 0;
  currentTime.value = "";
  frameCount.value = 0;
}

function startPlayback() {
  windPlayer?.play();
}

function syncFrame(index) {
  windPlayer?.seek(index);
}

function showFirstFrame() {
  windPlayer?.first();
}

function showPreviousFrame() {
  windPlayer?.previous();
}

function showNextFrame() {
  windPlayer?.next();
}

function showLastFrame() {
  windPlayer?.last();
}

function setVelocityUnit(unit) {
  velocityUnit.value = unit;
  if (!windPlayer) return;

  // 运行时切换速度控制方式，门面会随缩放自动重算 velocityScale。
  windPlayer.setVelocityControl(buildVelocityControl());
  console.info("[速度控制] 已切换", {
    unit,
    velocityControl: windPlayer.getVelocityControl(),
    appliedConfig: windLayer.value?.getConfig(),
  });
}

/**
 * 切换地图二三维模式。
 *
 * 二维与三维的像素-经纬度映射不同，风场图层内部会在模式变化后自动重建粒子，
 * 这里只需触发地图本身切换并同步按钮选中态。
 *
 * @param {number} mode 目标模式：MAP_MODE_2D / MAP_MODE_3D。
 */
function setMapMode(mode) {
  if (!mapView || mapMode.value === mode) return;
  mapMode.value = mode;
  mapView.switchCesiumMode(mode);
  if (mode === MAP_MODE_2D) relaxMap2DBounds();
}

// 二维平移边界的放大倍数：放大后可平移到地图范围之外，超出部分显示为黑边。
const MAP_2D_PAN_LIMIT_SCALE = 4;
// 相机原始的二维位置钳制边界，只在首次记录，避免反复切换时倍数叠加。
let base2DMaxCoord = null;

/**
 * 放宽二维模式下的平移边界，允许视口平移到地图范围之外（超出部分为黑边）。
 *
 * Cesium 在二维模式下会用相机内部的 `_maxCoord` 钳制视口中心位置，
 * 默认正好等于地图投影范围，因此平移到边界就会被拦住。
 * 这里把该边界按固定倍数放大，即可自由平移且能看到黑边。
 */
function relaxMap2DBounds() {
  // const Cesium = window.Cesium;
  // const maxCoord = viewer?.camera?._maxCoord;
  // if (!Cesium || !maxCoord) return;

  // if (!base2DMaxCoord) {
  //   base2DMaxCoord = new Cesium.Cartesian2(maxCoord.x, maxCoord.y);
  // }
  // maxCoord.x = base2DMaxCoord.x * MAP_2D_PAN_LIMIT_SCALE;
  // maxCoord.y = base2DMaxCoord.y * MAP_2D_PAN_LIMIT_SCALE;
  mapView.viewBounds = {
    MinX: -200,
    MinY: -90,
    MaxX: 220,
    MaxY: 90,
  };
}

function createWindPlayer() {
  windPlayer?.dispose();
  windPlayer = new WindFieldPlayer({
    viewer,
    CesiumWind: assertGlobal("CesiumWind"),
    workerUrl: config.dataWorkerUrl,
    workerCount: config.dataWorkerCount,
    frameInterval: config.frameInterval,
    modelCode: "synthetic-wind-20260918",
    windOptions: config.windOptions,
    // 粒子速度约束：像素每秒（默认）或米每秒，门面结合缩放与纬度实时重算。
    velocityControl: buildVelocityControl(),
    mapAdapter: buildVelocityMapAdapter(),
    onFrameLoaded: (item) => {
      if (item.data === null || item.data === undefined) return;
      frames[item.index] = {
        ...frameConfigs[item.index],
        data: item.data,
      };
    },
    onProgress: (progress) => {
      frameCount.value = progress.total;
    },
    onFrameChanged: (index, frame) => {
      currentIndex.value = index;
      currentTime.value = frame?.time ? String(frame.time) : "";
    },
    onPlayingChanged: (playing) => {
      isPlaying.value = playing;
    },
    onError: (error) => {
      errorMessage.value = error.message;
    },
  });
  windLayer.value = windPlayer.getLayer();
}

async function loadFrames() {
  loading.value = true;
  errorMessage.value = "";
  isReady.value = false;
  frames = frameConfigs.map((frame) => ({ ...frame, data: null }));
  frameCount.value = 0;
  currentIndex.value = 0;
  currentTime.value = "";

  try {
    if (!windPlayer) createWindPlayer();

    const loadResult = await windPlayer.load(frameConfigs, {
      workerUrl: config.dataWorkerUrl,
      workerCount: config.dataWorkerCount,
    });

    if (loadResult.failed > 0) {
      throw loadResult.errors[0]?.error || new Error("风场时次加载失败");
    }

    if (loadResult.success === 0 || frames.length === 0) {
      throw new Error("风场序列为空");
    }

    frameCount.value = frameConfigs.length;
    isReady.value = true;
    // load() 完成后只显示首帧，是否播放由用户点击播放按钮决定。
  } catch (error) {
    console.error("风场时序加载失败：", error);
    errorMessage.value = error?.message || "风场时序加载失败";
  } finally {
    loading.value = false;
  }
}

// 图层面板独立报错只做提示，不影响时序播放区域的加载与播放状态。
function handlePanelError(message) {
  console.error("图层控制面板错误：", message);
}

onMounted(() => {
  try {
    createViewer();
  } catch (error) {
    console.error("地图初始化失败：", error);
    errorMessage.value = error?.message || "地图初始化失败";
  }
});

onBeforeUnmount(() => {
  windPlayer?.dispose();
  if (viewer && !viewer.isDestroyed()) viewer.destroy();
  windPlayer = null;
  windLayer.value = null;
  cesiumWind.value = null;
  viewer = null;
  mapView = null;
});
</script>

<template>
  <main class="wind-map-page">
    <div id="cesiumContainer" class="cesium-container"></div>

    <!-- 公共操作区：速度单位切换与二三维模式切换（同时作用于时序播放与图层控制） -->
    <nav class="wind-shell-actions" aria-label="公共操作">
      <span class="wind-shell-actions__label">粒子速度</span>
      <div class="wind-segmented" role="group" aria-label="速度单位切换">
        <button
          type="button"
          class="wind-segmented__item"
          :class="{ 'is-active': velocityUnit === 'm/s' }"
          :aria-pressed="velocityUnit === 'm/s'"
          @click="setVelocityUnit('m/s')"
        >
          m/s
        </button>
        <button
          type="button"
          class="wind-segmented__item"
          :class="{ 'is-active': velocityUnit === 'px/s' }"
          :aria-pressed="velocityUnit === 'px/s'"
          @click="setVelocityUnit('px/s')"
        >
          像素/s
        </button>
      </div>
      <span class="wind-shell-actions__divider" aria-hidden="true"></span>
      <span class="wind-shell-actions__label">地图模式</span>
      <div class="wind-segmented" role="group" aria-label="地图二三维模式切换">
        <button
          type="button"
          class="wind-segmented__item"
          :class="{ 'is-active': mapMode === MAP_MODE_3D }"
          :aria-pressed="mapMode === MAP_MODE_3D"
          @click="setMapMode(MAP_MODE_3D)"
        >
          三维
        </button>
        <button
          type="button"
          class="wind-segmented__item"
          :class="{ 'is-active': mapMode === MAP_MODE_2D }"
          :aria-pressed="mapMode === MAP_MODE_2D"
          @click="setMapMode(MAP_MODE_2D)"
        >
          二维
        </button>
      </div>
    </nav>

    <!-- 模块一：时序播放 -->
    <section class="wind-module wind-module--player" aria-label="风场时序播放">
      <header class="wind-module__head">
        <h2 class="wind-module__title">时序播放</h2>
        <span class="wind-module__tag">TIMELINE</span>
      </header>

      <div class="wind-module__body">
        <div class="wind-module__lead">
          <button
            class="wind-button wind-button--primary"
            type="button"
            :disabled="loading || isReady"
            @click="loadFrames"
          >
            {{ loading ? "加载中..." : isReady ? "已加载" : "加载风场" }}
          </button>
          <span class="wind-status" :class="{ 'is-error': errorMessage }">{{
            statusText
          }}</span>
          <span v-if="isReady" class="wind-readout">
            <span class="wind-readout__value">{{ currentIndex + 1 }}</span>
            <span class="wind-readout__unit">/ {{ frameCount }} 帧</span>
          </span>
        </div>

        <div class="wind-player__actions">
          <button type="button" :disabled="!isReady" @click="startPlayback">
            播放
          </button>
          <button type="button" :disabled="!isReady" @click="pausePlayback">
            暂停
          </button>
          <button type="button" :disabled="!isReady" @click="showFirstFrame">
            首帧
          </button>
          <button type="button" :disabled="!isReady" @click="showPreviousFrame">
            上一帧
          </button>
          <button type="button" :disabled="!isReady" @click="showNextFrame">
            下一帧
          </button>
          <button type="button" :disabled="!isReady" @click="showLastFrame">
            末帧
          </button>
          <button type="button" :disabled="!isReady" @click="stopPlayback">
            结束播放
          </button>
        </div>

        <div class="wind-scrubber">
          <input
            v-model.number="currentIndex"
            class="wind-player__range"
            type="range"
            min="0"
            :max="Math.max(frameCount - 1, 0)"
            step="1"
            :disabled="!isReady"
            @input="syncFrame(currentIndex)"
          />
          <span class="wind-scrubber__time">{{ formattedTime }}</span>
        </div>
      </div>
    </section>

    <!-- 模块二：图层控制（独立数据源，与时序播放无关） -->
    <WindFieldLayerControls
      :viewer="viewer"
      :cesium-wind="cesiumWind"
      :data-url="config.layerPanel.dataUrl"
      :wind-options="config.windOptions"
      :velocity-unit="velocityUnit === 'm/s' ? 'meter' : 'pixel'"
      :velocity-control="config.velocityControl"
      :map-adapter="velocityMapAdapter"
      @panel-error="handlePanelError"
    />

    <!-- 加载蒙层 -->
    <Transition name="fade">
      <div v-if="loading" class="wind-loading-overlay">
        <div class="wind-loading-content">
          <div class="wind-loading-spinner"></div>
          <p class="wind-loading-text">正在加载风场数据...</p>
        </div>
      </div>
    </Transition>
  </main>
</template>
