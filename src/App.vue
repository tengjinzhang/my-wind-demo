<script setup>
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, markRaw } from "vue";

import WindFieldLayerControls from "./components/WindFieldLayerControls.vue";
import WindFieldParametersControls from "./components/WindFieldParametersControls.vue";
import { CameraHeightController, WindFieldPlayer } from "./wind-field";

const loading = ref(false);
const errorMessage = ref("");
const isReady = ref(false);
const isPlaying = ref(false);
const frameCount = ref(0);
const currentIndex = ref(0);
const currentTime = ref("");
// 速度单位：m/s 使用固定参数，px/s 开启相机高度自适应
const velocityUnit = ref("m/s");

let viewer = null;
let cameraHeightController = null;
// 使用 shallowRef 让两个控制组件能在图层创建/销毁后拿到最新实例。
const windLayer = shallowRef(null);
let windPlayer = null;
let frames = [];

const config = {
  dataWorkerUrl: "./dataManager/workers/wind_field_worker.js",
  dataWorkerCount: 1,
  frameInterval: 2000,
  windOptions: {
    maxAge: 60,
    globalAlpha: 0.9,
    lineWidth: 2,
    velocityScale: 1 / 150,
    paths: 2000,
  },
};

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
  const maplet = new MyMapAdapter.CesiumMap(document.getElementById('cesiumContainer'));
  const pMapView = markRaw(maplet);
  pMapView.initMap();
  pMapView.switchCesiumMode(1);

  addAnnotationBaseMap(pMapView);
  viewer = pMapView.viewer
}

const addAnnotationBaseMap = (pMapView) => {
  const viewer = pMapView.viewer;
  if (!viewer) {
    return;
  }

  const url =
    'https://{s}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=dac97be0400bd474a33f28a771eb9b5e';

  const addLayer = (url, id) => {
    const layer = viewer.imageryLayers.addImageryProvider(
      new Cesium.UrlTemplateImageryProvider({
        url,
        subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
        maximumLevel: 18,
      })
    );
    layer._id = id;
    layer.zIndex = 3;
    layer.alpha = 1;
    return layer;
  };

  addLayer(url, 'TIANDITU_CVA');
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
  if (!windLayer.value) return;

  if (unit === "m/s") {
    // m/s 模式：禁用相机高度控制器，使用固定参数
    if (cameraHeightController) {
      cameraHeightController.dispose();
      cameraHeightController = null;
    }
    // 应用默认配置中的固定速度参数
    windLayer.value?.setVelocityScale?.(config.windOptions.velocityScale);
    windLayer.value?.setPaths?.(config.windOptions.paths);
    windLayer.value?.setLineWidth?.(2);
    windLayer.value?.setMaxAge?.(config.windOptions.maxAge);
    console.info("[速度单位] 已切换至 m/s，使用固定参数", {
      velocityScale: config.windOptions.velocityScale,
      paths: config.windOptions.paths,
    });
  } else {
    // px/s 模式：启用相机高度控制器
    cameraHeightController?.dispose();
    cameraHeightController = new CameraHeightController({
      viewer,
      target: windLayer.value,
      minHeightChange: 10,
      onChanged: (state) => {
        console.info("[CameraHeightController] 风场配置已更新", {
          cameraHeight: Math.round(state.height),
          cameraHeightKm: Number((state.height / 1000).toFixed(2)),
          profileIndex: state.profileIndex,
          profileKey: state.profile.key,
          normalizedVelocityScale: state.velocityScale,
          profileConfig: state.profile,
          appliedConfig: windLayer.value?.getConfig(),
        });
      },
    });
    cameraHeightController.start();
    console.info("[速度单位] 已切换至 px/s，开启相机高度自适应");
  }
}

function createWindPlayer() {
  cameraHeightController?.dispose();
  cameraHeightController = null;
  windPlayer?.dispose();
  windPlayer = new WindFieldPlayer({
    viewer,
    CesiumWind: assertGlobal("CesiumWind"),
    workerUrl: config.dataWorkerUrl,
    workerCount: config.dataWorkerCount,
    frameInterval: config.frameInterval,
    modelCode: "synthetic-wind-20260918",
    windOptions: config.windOptions,
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
  cameraHeightController?.dispose();
  cameraHeightController = null;

  // 根据当前速度单位决定是否启用相机高度控制器
  if (velocityUnit.value === "px/s") {
    cameraHeightController = new CameraHeightController({
      viewer,
      target: windLayer.value,
      minHeightChange: 10,
      onChanged: (state) => {
        console.info("[CameraHeightController] 风场配置已更新", {
          cameraHeight: Math.round(state.height),
          cameraHeightKm: Number((state.height / 1000).toFixed(2)),
          profileIndex: state.profileIndex,
          profileKey: state.profile.key,
          normalizedVelocityScale: state.velocityScale,
          profileConfig: state.profile,
          appliedConfig: windLayer.value?.getConfig(),
        });
      },
    });
    cameraHeightController.start();
  }
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

// 图层组件已经完成 WindFieldLayer.dispose，这里只清理 App 的播放状态和引用。
function handleLayerDisposed() {
  cameraHeightController?.dispose();
  cameraHeightController = null;
  windPlayer?.dispose();
  windLayer.value = null;
  windPlayer = null;
  isReady.value = false;
  isPlaying.value = false;
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
  cameraHeightController?.dispose();
  windPlayer?.dispose();
  if (viewer && !viewer.isDestroyed()) viewer.destroy();
  windPlayer = null;
  windLayer.value = null;
  viewer = null;
});
</script>

<template>
  <main class="wind-map-page">
    <div id="cesiumContainer" class="cesium-container"></div>

    <section class="wind-toolbar" aria-label="风场时序播放">
      <button class="wind-button wind-button--primary" type="button" :disabled="loading || isReady" @click="loadFrames">
        {{ loading ? "加载中..." : isReady ? "已加载" : "加载风场" }}
      </button>
      <span class="wind-status" :class="{ 'is-error': errorMessage }">{{ statusText }}</span>
      <span v-if="isReady" class="wind-status">第 {{ currentIndex + 1 }} / {{ frameCount }} 帧</span>
    </section>

    <!-- 速度单位切换按钮 -->
    <section class="wind-velocity-toolbar" aria-label="速度单位切换">
      <button
        type="button"
        class="wind-velocity-btn"
        :class="{ 'is-active': velocityUnit === 'm/s' }"
        @click="setVelocityUnit('m/s')"
      >
        m/s
      </button>
      <button
        type="button"
        class="wind-velocity-btn"
        :class="{ 'is-active': velocityUnit === 'px/s' }"
        @click="setVelocityUnit('px/s')"
      >
        像素/s
      </button>
    </section>

    <section class="wind-panel wind-panel--player" aria-label="风场播放控件">
      <div class="wind-panel__header">时序播放控件</div>
      <div class="wind-player__actions">
        <button type="button" :disabled="!isReady" @click="startPlayback">播放</button>
        <button type="button" :disabled="!isReady" @click="pausePlayback">暂停</button>
        <button type="button" :disabled="!isReady" @click="showFirstFrame">首帧</button>
        <button type="button" :disabled="!isReady" @click="showPreviousFrame">上一帧</button>
        <button type="button" :disabled="!isReady" @click="showNextFrame">下一帧</button>
        <button type="button" :disabled="!isReady" @click="showLastFrame">末帧</button>
        <button type="button" :disabled="!isReady" @click="stopPlayback">结束播放</button>
      </div>
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
      <div class="wind-player__time">{{ formattedTime }}</div>
    </section>

    <!-- <WindFieldParametersControls
      :wind-layer="windLayer"
      :paths="config.windOptions.paths"
      :line-width="config.windOptions.lineWidth"
      :speed="0.2"
      :max-age="config.windOptions.maxAge"
      :disabled="!isReady"
      :error-message="errorMessage"
    /> -->
    <WindFieldLayerControls
      :wind-layer="windLayer"
      :disabled="!isReady"
      @layer-disposed="handleLayerDisposed"
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
