import {
  VelocityMotionPlanner,
  computeWindSpeedStatistics,
  level2Resolution,
  normalizeVelocityControl,
  pickReferenceWindSpeed,
  type NormalizedVelocityControl,
  type VelocityControlOptions,
  type VelocityMode,
} from "./VelocityScaleCalculator";

/**
 * 风场默认渲染配置。
 *
 * 这些配置会透传给 CesiumWind.WindLayer 内部的 windOptions，主要控制粒子颜色、
 * 透明度、线宽、粒子寿命、粒子数量和风速缩放比例。
 *
 * @type {{
 *   colorScale: string[],
 *   maxAge: number,
 *   globalAlpha: number,
 *   lineWidth: number,
 *   velocityScale: number,
 *   paths: number
 * }}
 */
/** CesiumWind.WindLayer 使用的风场渲染参数。 */
export interface WindFieldConfig {
  /** 按风速从低到高排列的颜色标尺。 */
  colorScale: string[];
  /** 粒子最大存活时间，数值越大轨迹通常越长。 */
  maxAge: number;
  /** 粒子整体透明度，范围会被限制在 0 到 1。 */
  globalAlpha: number;
  /** 粒子轨迹线宽。 */
  lineWidth: number;
  /** 风速到屏幕位移的缩放比例。 */
  velocityScale: number;
  /** 粒子数量，数量越大画面越密但计算量也越高。 */
  paths: number;
}

/** cesium-wind 底层粒子对象的最小接口。 */
interface WindCoreLike {
  /** cesium-wind 内部当前运行配置。 */
  options?: Record<string, unknown>;
  /** 当前粒子对象列表，用于同步 paths 数量。 */
  particles?: unknown[];
  /** 风场字段对象，用于随机生成粒子。 */
  field?: {
    randomize: (
      particle: Record<string, unknown>,
      width: number,
      height: number,
      unproject: unknown,
    ) => unknown;
    /** 扁平 U 分量网格数组（m/s），用于统计参考风速。 */
    us?: ArrayLike<number>;
    /** 扁平 V 分量网格数组（m/s），用于统计参考风速。 */
    vs?: ArrayLike<number>;
  };
  /** 底层绘图上下文和画布尺寸。 */
  ctx?: { canvas?: { width: number; height: number } };
  /** cesium-wind 内部的随机年龄生成函数。 */
  randomize?: () => number;
  /** 地理坐标反投影函数，输入屏幕像素返回 [经度, 纬度]。 */
  unproject?: ((pixel: [number, number]) => [number, number] | null) | unknown;
  /** 判断经纬度坐标在当前视角下是否可见。 */
  intersectsCoordinate?: (coordinate: [number, number]) => boolean;
  /** 经纬度到屏幕像素的投影函数，二维下由上层替换。 */
  project?: (coordinate: [number, number]) => [number, number] | null;
  /** 启动粒子动画。 */
  start?: () => void;
  /** 停止粒子动画。 */
  stop?: () => void;
  /** 当前动画是否处于停止状态。 */
  isStop?: () => boolean;
  /** 清空粒子画布像素。 */
  clearCanvas?: () => void;
  /** 触发一次粒子预渲染或重建。 */
  prerender?: () => void;
}

/** 对 CesiumWind.WindLayer 的最小依赖描述，避免绑定第三方库内部类型。 */
export interface WindLayerLike {
  /** 将底层图层挂载到 Cesium Viewer。 */
  addTo: (viewer: unknown) => void;
  /** 底层图层的标准移除方法。 */
  remove?: () => void;
  /** 某些 cesium-wind 版本提供的兼容移除方法。 */
  removeLayer?: () => void;
  /** 更新底层图层使用的风场数据。 */
  setData?: (data: unknown) => void;
  /** cesium-wind 内部粒子动画对象。 */
  wind?: WindCoreLike | null;
  /** 底层粒子 canvas，用于控制显隐。 */
  canvas?: {
    style?: { display?: string; visibility?: string };
    width?: number;
    height?: number;
  };
  /** 屏幕像素到经纬度的反投影，cesium-wind 默认实现只支持 3D。 */
  unproject?: (pixel: [number, number]) => [number, number] | null;
  /** 经纬度点是否可见，cesium-wind 默认实现只支持 3D。 */
  intersectsCoordinate?: (coordinate: [number, number]) => boolean;
  /** 经纬度到屏幕像素的投影，二维下需替换 Cesium 默认实现。 */
  project?: (coordinate: [number, number]) => [number, number] | null;
  /** 按 Viewer 画布尺寸重新同步粒子画布大小。 */
  adjustSize?: () => void;
}

/** Cesium Viewer 需要提供的最小结构。 */
export interface CameraVisibilityViewerLike {
  camera?: {
    moveStart?: {
      addEventListener: (listener: () => void) => (() => void) | void;
    };
    moveEnd?: {
      addEventListener: (listener: () => void) => (() => void) | void;
    };
  };
  scene?: {
    canvas?: HTMLCanvasElement;
  };
  container?: HTMLElement;
}

/** Cesium ScreenSpaceEventHandler 的最小接口。 */
interface ScreenSpaceEventHandlerLike {
  setInputAction: (callback: () => void, eventType: number) => void;
}

/** CesiumWind 暴露给 demo 的最小接口。 */
export interface CesiumWindLike {
  /** cesium-wind 提供的粒子风场图层构造函数。 */
  WindLayer?: new (
    data: unknown,
    options: { windOptions: WindFieldConfig },
  ) => WindLayerLike;
}

/** 提供分辨率与视角纬度的地图适配器最小接口。 */
export interface VelocityMapAdapterLike {
  /**
   * 返回当前分辨率（米/像素）。
   *
   * 该值应统一由 MapBaseHelper 的相机距离法计算：
   * `getMapsCenter` → `getCameraDistance` → `distance2MapsLevel` → `level2Resolution(level, true)`，
   * 与页面比例尺来源保持一致，避免风场速度与地图显示不同步。
   */
  getResolution?: () => number;
  /** 返回当前比例尺分母（可选，仅用于展示/调试）。 */
  getScale?: () => number;
  /** 返回当前视角中心纬度（度）；缺失时视为赤道。 */
  getViewLatitude?: () => number;
}

/** 风场图层构造参数。 */
export interface WindFieldLayerOptions {
  /** Cesium Viewer 实例。创建风场时必须提供。 */
  viewer?: unknown;
  /** cesium-wind 全局对象；不传时读取 globalThis.CesiumWind。 */
  CesiumWind?: CesiumWindLike | null;
  /** 风场初始配置对象或 WindFieldVisualConfig 实例。 */
  config?: Partial<WindFieldConfig> | WindFieldVisualConfig;
  /** config 的兼容别名，config 未传时使用。 */
  windOptions?: Partial<WindFieldConfig>;
  /** 相机移动后延迟多少毫秒恢复风场显示，默认 0。 */
  cameraVisibilityDelay?: number;
  /**
   * 粒子速度控制配置：pixel 像素每秒 / meter 米每秒，默认 pixel。
   *
   * 创建图层时会按当前视角换算 velocityScale；之后可通过
   * setVelocityControl / setVelocityMode 动态切换。
   */
  velocityControl?: VelocityControlOptions;
  /** 分辨率与视角纬度适配器，速度换算依赖它读取当前视角。 */
  mapAdapter?: VelocityMapAdapterLike;
}

/** 分辨率变化判定的最小阈值（米/像素），避免浮点抖动触发重算。 */
const VELOCITY_RESOLUTION_EPSILON = 1e-6;

/**
 * 默认的渲染帧间隔毫秒数，与 cesium-wind 内部 defaultOptions.frameRate 保持一致。
 *
 * 图层创建前的兜底帧率必须与底层实际使用的默认值相同，否则首帧速度换算会有偏差。
 */
const DEFAULT_FRAME_INTERVAL = 20;

/** 帧率换算单位：1 秒等于多少毫秒。 */
const DEFAULT_FRAME_RATE_UNIT = 1000;

/**
 * 二维/2.5D 下地图有效经纬度范围（世界地图边界）。
 *
 * 二维模式允许平移到世界范围之外（超出部分显示为黑边），
 * 该区域没有影像也没有风场，必须把落在范围外的粒子剔除，
 * 否则会用经度越界的坐标继续投影，画出横穿画布的错误线条。
 */
const WORLD_MIN_LONGITUDE = -180;
const WORLD_MAX_LONGITUDE = 180;
const WORLD_MIN_LATITUDE = -90;
const WORLD_MAX_LATITUDE = 90;

/** 角度转弧度的换算系数，二维投影需要弧度制经纬度。 */
const DEGREES_TO_RADIANS = Math.PI / 180;

const DEFAULT_WIND_CONFIG: WindFieldConfig = {
  colorScale: [
    "rgb(36,104,180)",
    "rgb(60,157,194)",
    "rgb(128,205,193)",
    "rgb(151,218,168)",
    "rgb(198,231,181)",
    "rgb(238,247,217)",
    "rgb(255,238,159)",
    "rgb(252,217,125)",
    "rgb(255,182,100)",
    "rgb(252,150,75)",
    "rgb(250,112,52)",
    "rgb(245,64,32)",
    "rgb(237,45,28)",
    "rgb(220,24,32)",
    "rgb(180,0,35)",
  ],
  maxAge: 60,
  globalAlpha: 0.9,
  lineWidth: 2,
  velocityScale: 1 / 150,
  paths: 2000,
};

/**
 * 返回浏览器动画帧函数。
 *
 * 浏览器优先使用原生 requestAnimationFrame；测试环境没有该 API 时，
 * 使用 setTimeout 作为兼容回退，保证配置重建逻辑仍然可执行。
 *
 * @returns {Function} 接收回调函数并返回调度句柄的动画帧函数。
 */
function getRequestAnimationFrame(): (callback: () => void) => number {
  if (typeof globalThis.requestAnimationFrame === "function") {
    return globalThis.requestAnimationFrame.bind(globalThis);
  }
  return (callback) => globalThis.setTimeout(callback, 0);
}

/** Cesium 反投影需要的最小笛卡尔坐标结构。 */
interface CesiumCartographicLike {
  /** 经度（弧度）。 */
  longitude: number;
  /** 纬度（弧度）。 */
  latitude: number;
}

/** Cesium 三维笛卡尔坐标的最小结构。 */
interface CesiumCartesian3Like {
  x: number;
  y: number;
  z: number;
}

/** Cesium 射线的最小结构。 */
interface CesiumRayLike {
  origin: CesiumCartesian3Like;
  direction: CesiumCartesian3Like;
}

/** 地图投影的最小结构，二维/2.5D 下用于经纬度与平面坐标的双向换算。 */
interface CesiumMapProjectionLike {
  unproject: (cartesian: CesiumCartesian3Like) => CesiumCartographicLike | undefined;
  project?: (
    cartographic: CesiumCartographicLike,
    result?: CesiumCartesian3Like,
  ) => CesiumCartesian3Like | undefined;
}

/** 二维地图平面上「像素 → 投影坐标」的线性映射参数。 */
interface Projector2D {
  /** 像素 x = 0 处的平面 y 值（对应投影坐标 x）。 */
  planeYAtLeft: number;
  /** 每向右移动一个像素，平面 y 的增量。 */
  planeYPerPixelX: number;
  /** 像素 y = 0 处的平面 z 值（对应投影坐标 y）。 */
  planeZAtTop: number;
  /** 每向下移动一个像素，平面 z 的增量。 */
  planeZPerPixelY: number;
}

/** Cesium 全局对象中反投影与可见性判定用到的最小成员。 */
interface CesiumApiLike {
  /** 二维屏幕坐标构造器。 */
  Cartesian2: new (x: number, y: number) => unknown;
  /** 三维笛卡尔坐标构造器与经纬度转换。 */
  Cartesian3: {
    new (x: number, y: number, z: number): CesiumCartesian3Like;
    fromDegrees: (longitude: number, latitude: number) => unknown;
  };
  /** 弧度制经纬度构造器（二维投影换算使用）。 */
  Cartographic: new (longitude: number, latitude: number) => CesiumCartographicLike;
  /** 世界坐标到屏幕坐标的转换，三维与 2.5D 使用。 */
  SceneTransforms?: {
    wgs84ToWindowCoordinates?: (
      scene: unknown,
      position: unknown,
    ) => { x: number; y: number } | undefined;
    worldToWindowCoordinates?: (
      scene: unknown,
      position: unknown,
    ) => { x: number; y: number } | undefined;
  };
  /** 场景模式枚举。 */
  SceneMode: { SCENE3D: number; SCENE2D: number; COLUMBUS_VIEW: number };
  /** WGS84 椭球。 */
  Ellipsoid: {
    WGS84: {
      cartesianToCartographic: (cartesian: unknown) => CesiumCartographicLike;
    };
  };
  /** 椭球遮挡判定器。 */
  EllipsoidalOccluder: new (
    ellipsoid: unknown,
    cameraPosition: unknown,
  ) => { isPointVisible: (point: unknown) => boolean };
  /** 角度弧度转换工具。 */
  Math: { toDegrees: (radians: number) => number };
}

/** 反投影与场景模式同步所需的 Viewer 最小结构。 */
interface SceneModeViewerLike {
  /** 相机，提供像素射线与椭球拾取。 */
  camera?: {
    getPickRay?: (pixel: unknown) => CesiumRayLike | null;
    pickEllipsoid?: (pixel: unknown, ellipsoid: unknown) => unknown | null;
    position?: unknown;
  };
  /** 场景，提供当前模式、球体与地图投影。 */
  scene?: {
    mode?: number;
    globe?: {
      pick: (ray: unknown, scene: unknown) => unknown | null;
      ellipsoid: {
        cartesianToCartographic: (cartesian: unknown) => CesiumCartographicLike;
      };
    };
    /** 当前地图投影，二维/2.5D 下反投影依赖它。 */
    mapProjection?: CesiumMapProjectionLike;
    canvas?: { width: number; height: number };
  };
}

/**
 * 读取全局 Cesium 对象。
 *
 * 风场插件运行在页面上下文中，Cesium 由宿主页面以全局脚本方式提供，
 * 因此这里按需读取，缺失时返回 null 并走安全兜底。
 */
function getGlobalCesium(): CesiumApiLike | null {
  return (globalThis as typeof globalThis & { Cesium?: CesiumApiLike }).Cesium || null;
}

/**
 * 风场可视化配置类。
 *
 * 该类对应类图中的“风场可视化配置类”，只负责保存和修改风场的显示参数，
 * 不负责创建 Cesium 图层，也不直接操作 Viewer。WindFieldLayer 通过组合关系
 * 持有一个 WindFieldVisualConfig 实例，并在创建或更新图层时读取其中的配置。
 *
 * 使用示例：
 * ```js
 * const config = new WindFieldVisualConfig({ paths: 3000 });
 * config.setColorScale(["#2c7bb6", "#ffffbf", "#d7191c"]);
 * config.setGlobalAlpha(0.85);
 *
 * const options = config.toObject();
 * ```
 *
 * @class WindFieldVisualConfig
 */
export class WindFieldVisualConfig {
  /** 按风速从低到高排列的颜色标尺。 */
  colorScale: string[];
  /** 粒子最大存活时间。 */
  maxAge: number;
  /** 粒子整体透明度。 */
  globalAlpha: number;
  /** 粒子轨迹线宽。 */
  lineWidth: number;
  /** 风速位移缩放比例。 */
  velocityScale: number;
  /** 粒子数量。 */
  paths: number;

  /**
   * 创建风场可视化配置。
   *
   * @param {Object} [options] 初始配置。未传入的字段使用默认值。
   * @param {Array<string>} [options.colorScale] 颜色标尺，从低风速颜色排列到高风速颜色。
   * @param {number} [options.maxAge=60] 粒子最大存活时间。
   * @param {number} [options.globalAlpha=0.9] 粒子整体透明度，通常取 0 到 1。
   * @param {number} [options.lineWidth=2] 粒子轨迹线宽。
   * @param {number} [options.velocityScale=1/150] 风速缩放比例。
   * @param {number} [options.paths=2000] 粒子数量。
   */
  constructor(options: Partial<WindFieldConfig> = {}) {
    const config = Object.assign({}, DEFAULT_WIND_CONFIG, options);
    this.colorScale = Array.isArray(config.colorScale)
      ? config.colorScale.slice()
      : DEFAULT_WIND_CONFIG.colorScale.slice();
    this.maxAge = config.maxAge;
    this.globalAlpha = config.globalAlpha;
    this.lineWidth = config.lineWidth;
    this.velocityScale = config.velocityScale;
    this.paths = config.paths;
  }

  /**
   * 设置颜色标尺。
   *
   * @param {Array<string>} colorScale 从低风速到高风速排列的颜色数组。
   * @returns {void}
   * @throws {TypeError} colorScale 不是数组时抛出错误。
   */
  setColorScale(colorScale: string[]): void {
    if (!Array.isArray(colorScale)) {
      throw new TypeError("colorScale must be an array.");
    }
    this.colorScale = colorScale.slice();
  }

  /**
   * 设置粒子最大存活时间。
   *
   * @param {number} maxAge 粒子最大存活时间，必须是非负有限数。
   * @returns {void}
   */
  setMaxAge(maxAge: number): void {
    this.maxAge = this.#toNonNegativeNumber(maxAge, "maxAge");
  }

  /**
   * 设置粒子整体透明度。
   *
   * @param {number} globalAlpha 透明度，建议范围为 0 到 1。
   * @returns {void}
   */
  setGlobalAlpha(globalAlpha: number): void {
    const value = this.#toFiniteNumber(globalAlpha, "globalAlpha");
    this.globalAlpha = Math.max(0, Math.min(1, value));
  }

  /**
   * 设置粒子轨迹线宽。
   *
   * @param {number} lineWidth 线宽，必须大于 0。
   * @returns {void}
   */
  setLineWidth(lineWidth: number): void {
    const value = this.#toFiniteNumber(lineWidth, "lineWidth");
    if (value <= 0) {
      throw new RangeError("lineWidth must be greater than 0.");
    }
    this.lineWidth = value;
  }

  /**
   * 设置风速缩放比例。
   *
   * @param {number} velocityScale 风速缩放比例，必须大于 0。
   * @returns {void}
   */
  setVelocityScale(velocityScale: number): void {
    const value = this.#toFiniteNumber(velocityScale, "velocityScale");
    if (value <= 0) {
      throw new RangeError("velocityScale must be greater than 0.");
    }
    this.velocityScale = value;
  }

  /**
   * 设置粒子数量。
   *
   * @param {number} paths 粒子数量，必须是非负整数。
   * @returns {void}
   */
  setPaths(paths: number): void {
    const value = this.#toNonNegativeNumber(paths, "paths");
    if (!Number.isInteger(value)) {
      throw new TypeError("paths must be an integer.");
    }
    this.paths = value;
  }

  /**
   * 返回普通对象形式的配置副本。
   *
   * @returns {Object} 可直接传递给 CesiumWind.WindLayer 的 windOptions 配置对象。
   */
  toObject(): WindFieldConfig {
    return {
      colorScale: this.colorScale.slice(),
      maxAge: this.maxAge,
      globalAlpha: this.globalAlpha,
      lineWidth: this.lineWidth,
      velocityScale: this.velocityScale,
      paths: this.paths,
    };
  }

  /**
   * 将配置对象字段转换为有限数值。
   *
   * @param {*} value 待转换值。
   * @param {string} name 字段名称，用于错误信息。
   * @returns {number} 转换后的有限数值。
   * @private
   */
  #toFiniteNumber(value: unknown, name: string): number {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      throw new TypeError(`${name} must be a finite number.`);
    }
    return number;
  }

  /**
   * 将配置对象字段转换为非负数值。
   *
   * @param {*} value 待转换值。
   * @param {string} name 字段名称，用于错误信息。
   * @returns {number} 转换后的非负数值。
   * @private
   */
  #toNonNegativeNumber(value: unknown, name: string): number {
    const number = this.#toFiniteNumber(value, name);
    if (number < 0) {
      throw new RangeError(`${name} must be greater than or equal to 0.`);
    }
    return number;
  }
}

/**
 * 风场渲染类。
 *
 * 职责：
 * 1. 创建 CesiumWind.WindLayer 风场图层；
 * 2. 将风场图层挂载到 Cesium Viewer；
 * 3. 更新风场数据和渲染配置；
 * 4. 控制风场动画播放、暂停、显示、隐藏；
 * 5. 销毁风场图层并释放引用。
 *
 * 使用示例：
 * ```js
 * import WindFieldLayer from "./WindFieldLayer";
 *
 * const windLayer = new WindFieldLayer({
 *   viewer,
 *   CesiumWind,
 *   config: {
 *     paths: 3000,
 *     lineWidth: 2,
 *     velocityScale: 1 / 180,
 *   },
 * });
 *
 * windLayer.createWindLayer(frameData);
 * windLayer.playWindAnimation();
 * windLayer.setPaths(5000);
 * windLayer.updateWindLayer(nextFrameData);
 * windLayer.disposes();
 * ```
 */
export default class WindFieldLayer {
  /** 外部传入的 Cesium Viewer。 */
  viewer: unknown;
  /** cesium-wind 对象。 */
  CesiumWind: CesiumWindLike | null;
  /** 当前底层 CesiumWind.WindLayer 实例。 */
  windLayer: WindLayerLike | null;
  /** 当前风场显示参数对象。 */
  visualConfig: WindFieldVisualConfig;
  /** 当前 canvas 是否应该显示。 */
  visible: boolean;
  /** 是否已经销毁，销毁后不能创建新图层。 */
  isDisposed: boolean;
  /** 是否已经安排了一次粒子重建。 */
  rebuildScheduled: boolean;
  /** 相机移动后延迟恢复风场的毫秒数。 */
  cameraVisibilityDelay: number;
  /** 相机可见性控制器实例。 */
  #cameraController: CameraVisibilityController | null;
  /** 粒子速度换算器：把真实风速 × 系数换算成 cesium-wind 的 velocityScale。 */
  #velocityPlanner: VelocityMotionPlanner;
  /** 当前粒子速度控制配置（模式 + 系数等）。 */
  #velocityControl: NormalizedVelocityControl;
  /** 分辨率与视角纬度适配器。 */
  #mapAdapter: VelocityMapAdapterLike | null;
  /** 数据统计得到的真实风速（m/s），仅用于换算读数，不参与倍率。 */
  #dataRealWindSpeed: number | null;
  /** 上一次重算速度时的分辨率（米/像素）。 */
  #lastVelocityResolution: number;
  /** 最近一次写入底层的 velocityScale。 */
  #appliedVelocityScale: number | null;
  /** 场景渲染帧监听解绑函数，用于缩放时实时跟随分辨率。 */
  #unbindVelocityPostRender: (() => void) | null;
  /** 上一次看到的场景模式（3D / 2D / 2.5D），用于识别二维切换。 */
  #lastSceneMode: number | null;
  /** 上一次同步的 Viewer 画布尺寸，格式为 "宽x高"。 */
  #lastCanvasSize: string | null;
  /** 二维模式下「像素 → 投影平面」的线性映射，每帧刷新。 */
  #projector2D: Projector2D | null;
  /** 底层原始的经纬度投影实现，非二维模式继续沿用。 */
  #nativeProject: ((coordinate: [number, number]) => [number, number] | null) | null;
  /** 复用的弧度制经纬度对象，避免每帧大量分配。 */
  #scratchCartographic: CesiumCartographicLike | null;
  /** 复用的投影结果对象，避免每帧大量分配。 */
  #scratchCartesian: CesiumCartesian3Like | null;

  /**
   * 创建风场渲染实例。
   *
   * @param {Object} [options] 构造参数。
   * @param {Object} [options.viewer] Cesium Viewer 实例。调用 createWindLayer 前必须存在。
   * @param {Object} [options.CesiumWind] cesium-wind.js 暴露的对象；不传时默认读取 globalThis.CesiumWind。
   * @param {Object|WindFieldVisualConfig} [options.config] 风场可视化配置对象，或普通配置对象。
   * @param {Object} [options.windOptions] config 的兼容别名；当 config 未传时使用。
   */
  constructor(options: WindFieldLayerOptions = {}) {
    this.viewer = options.viewer || null;
    this.CesiumWind =
      options.CesiumWind ||
      (globalThis as typeof globalThis & { CesiumWind?: CesiumWindLike })
        .CesiumWind ||
      null;
    this.windLayer = null;
    const inputConfig = options.config || options.windOptions;
    this.visualConfig = new WindFieldVisualConfig(inputConfig);
    this.visible = false;
    this.isDisposed = false;
    this.rebuildScheduled = false;
    this.cameraVisibilityDelay = Math.max(0, Number(options.cameraVisibilityDelay) || 0);
    this.#cameraController = null;
    this.#velocityPlanner = new VelocityMotionPlanner();
    this.#velocityControl = normalizeVelocityControl(options.velocityControl);
    this.#mapAdapter = options.mapAdapter || null;
    this.#dataRealWindSpeed = null;
    this.#lastVelocityResolution = Number.NaN;
    this.#appliedVelocityScale = null;
    this.#unbindVelocityPostRender = null;
    this.#lastSceneMode = null;
    this.#lastCanvasSize = null;
    this.#projector2D = null;
    this.#nativeProject = null;
    this.#scratchCartographic = null;
    this.#scratchCartesian = null;
    this.#cameraController = new CameraVisibilityController({
      viewer: this.viewer,
      delay: this.cameraVisibilityDelay,
      onHide: () => this.#setCanvasVisible(false),
      onShow: () => this.#setCanvasVisible(true),
      getVisible: () => this.visible,
    });
  }

  /**
   * 获取默认风场配置副本。
   *
   * @returns {Object} 默认配置的新对象。外部修改返回值不会影响类内部默认值。
   */
  static get defaultConfig(): WindFieldConfig {
    return new WindFieldVisualConfig().toObject();
  }

  /**
   * 创建并显示风场图层。
   *
   * 如果当前已经存在风场图层，会先移除旧图层，再使用新的帧数据创建图层。
   *
   * @param {Object|Array} frameData 单帧风场数据。通常是 cesium-wind 支持的 u/v 网格数据数组，
   * 或已经封装好的风场 Field 对象。
   * @returns {Object} 创建后的 CesiumWind.WindLayer 实例。
   * @throws {Error} viewer 缺失、CesiumWind.WindLayer 不存在或当前实例已销毁时抛出错误。
   */
  createWindLayer(frameData: unknown): WindLayerLike {
    this.#assertUsable();
    this.removeWindLayer();

    const WindLayer = this.CesiumWind?.WindLayer;
    if (!WindLayer) {
      throw new Error("CesiumWind.WindLayer is not available.");
    }

    // 底层 addTo 时会同步渲染首帧，必须在创建前写入目标速度；
    // 否则首帧仍使用默认 velocityScale，会画出一批超长拖尾（表现为闪一下）。
    this.#applyVelocityScale();

    this.windLayer = new WindLayer(frameData, {
      windOptions: this.visualConfig.toObject(),
    });
    // 必须在 addTo 之前替换反投影与可见性判定：底层首次 render 会绑定这两个方法，
    // 默认实现只适配 3D 椭球，二维模式下会把粒子画到错误位置。
    this.#installSceneAdapters();
    this.windLayer.addTo(this.viewer);
    this.visible = true;
    this.#applyConfigToWindCore();
    this.#cameraController?.ensureActive();
    this.#bindVelocityPostRender();
    // 记录创建时刻的场景状态，后续 postRender 只对真正的变化做重建。
    this.#lastSceneMode = this.#readSceneMode();
    this.#lastCanvasSize = this.#readCanvasSize();
    this.#lastVelocityResolution = this.#readResolution();
    // 统计数据真实风速，仅用于换算读数；velocityScale 与其无关，无需重算。
    this.#resolveDataRealWindSpeed();
    return this.windLayer;
  }

  /**
   * 移除当前风场图层。
   *
   * 该方法会停止并移除底层 CesiumWind 图层，同时清空本类保存的图层引用。
   * 多次调用是安全的；没有图层时不会报错。
   *
   * @returns {void}
   */
  removeWindLayer(): void {
    if (this.windLayer) {
      if (typeof this.windLayer.remove === "function") {
        this.windLayer.remove();
      } else if (typeof this.windLayer.removeLayer === "function") {
        this.windLayer.removeLayer();
      }
    }

    this.windLayer = null;
    this.visible = false;
    this.rebuildScheduled = false;
    // 图层销毁后不再持有场景监听与风速统计，重新创建时按新数据重新统计。
    this.#unbindVelocityPostRender?.();
    this.#unbindVelocityPostRender = null;
    this.#dataRealWindSpeed = null;
    this.#lastVelocityResolution = Number.NaN;
    this.#appliedVelocityScale = null;
    this.#lastSceneMode = null;
    this.#lastCanvasSize = null;
    this.#projector2D = null;
    this.#nativeProject = null;
    this.#scratchCartographic = null;
    this.#scratchCartesian = null;
  }

  /**
   * 显示风场图层并启动动画。
   *
   * @returns {void}
   */
  showWindLayer(): void {
    this.#setCanvasVisible(true);
    this.playWindAnimation();
    this.visible = true;
  }

  /**
   * 隐藏风场图层并暂停动画。
   *
   * 这里不会销毁图层，只是隐藏 canvas 并暂停粒子动画，后续可通过 showWindLayer 恢复。
   *
   * @returns {void}
   */
  hideWindLayer(): void {
    this.stopWindAnimation();
    this.#setCanvasVisible(false);
    this.visible = false;
  }

  /**
   * 更新风场图层数据。
   *
   * 如果图层已经创建，则调用底层 setData 更新；如果图层尚未创建，
   * 会自动调用 createWindLayer 创建图层。
   *
   * @param {Object|Array} frameData 新的单帧风场数据。
   * @returns {Object} 当前 CesiumWind.WindLayer 实例。
   */
  updateWindLayer(frameData: unknown): WindLayerLike {
    if (!this.windLayer) {
      return this.createWindLayer(frameData);
    }

    if (typeof this.windLayer.setData === "function") {
      this.windLayer.setData(frameData);
    }
    this.#applyConfigToWindCore();
    // 新帧数据的风速分布可能不同，重新统计真实风速（仅影响读数）。
    this.#dataRealWindSpeed = null;
    this.#resolveDataRealWindSpeed();
    return this.windLayer;
  }

  /**
   * 播放风场粒子动画。
   *
   * @returns {void}
   */
  playWindAnimation(): void {
    const wind = this.getWindCore();
    if (wind && typeof wind.start === "function") {
      wind.start();
    }
  }

  /**
   * 暂停风场粒子动画。
   *
   * @returns {void}
   */
  stopWindAnimation(): void {
    const wind = this.getWindCore();
    if (wind && typeof wind.stop === "function") {
      wind.stop();
    }
  }

  /** 按当前相机视口重新生成粒子，适合相机移动结束后调用。 */
  rebuildParticles(): void {
    this.#scheduleRebuild();
  }

  /**
   * 设置颜色标尺。
   *
   * @param {Array<string>} colorScale 从低风速到高风速排列的颜色数组。
   * @returns {void}
   */
  setColorScale(colorScale: string[]): void {
    this.visualConfig.setColorScale(colorScale);
    this.#applyConfigToWindCore();
  }

  /**
   * 设置粒子最大存活时间，并重建粒子缓存。
   *
   * @param {number} maxAge 粒子最大存活时间。
   * @returns {void}
   */
  setMaxAge(maxAge: number): void {
    this.visualConfig.setMaxAge(maxAge);
    this.#applyConfigToWindCore();
    this.#scheduleRebuild();
  }

  /**
   * 设置粒子整体透明度。
   *
   * @param {number} globalAlpha 粒子整体透明度，范围为 0 到 1。
   * @returns {void}
   */
  setGlobalAlpha(globalAlpha: number): void {
    this.visualConfig.setGlobalAlpha(globalAlpha);
    this.#applyConfigToWindCore();
  }

  /**
   * 设置粒子轨迹线宽。
   *
   * @param {number} lineWidth 粒子轨迹线宽，必须大于 0。
   * @returns {void}
   */
  setLineWidth(lineWidth: number): void {
    this.visualConfig.setLineWidth(lineWidth);
    this.#applyConfigToWindCore();
  }

  /**
   * 设置风速缩放比例。
   *
   * @param {number} velocityScale 风速缩放比例，必须大于 0。
   * @returns {void}
   */
  setVelocityScale(velocityScale: number): void {
    this.visualConfig.setVelocityScale(velocityScale);
    this.#applyConfigToWindCore();
  }

  /**
   * 设置或切换粒子速度控制。
   *
   * 这是粒子速度「pixel 像素每秒 / meter 米每秒」的对外入口：
   * 类内部按当前模式、地图分辨率、渲染帧率与数据真实风速换算 velocityScale，
   * 外部只需要关心模式与速度系数，不需要自行换算度值。
   *
   * 两种模式各自独立换算：pixel 锁定屏幕像素速度，meter 锁定地面速度；
   * 切换后立即按新模式生效，realSpeedFactor / pixelSpeedFactor 保持不变。
   *
   * @param control 速度控制配置；不传时沿用当前配置。
   * @returns {void}
   */
  setVelocityControl(control?: VelocityControlOptions): void {
    if (this.isDisposed) return;
    this.#velocityControl = normalizeVelocityControl(
      control ?? this.#velocityControl,
    );
    // 统计口径或单位换算可能变化，清空缓存后重新统计真实风速。
    this.#dataRealWindSpeed = null;
    this.#resolveDataRealWindSpeed();
    this.#applyVelocityScale();
  }

  /**
   * 仅切换粒子速度模式，其余速度配置保持不变。
   *
   * @param mode "pixel" 像素每秒（屏幕速度恒定）；"meter" 米每秒（地面速度恒定）。
   * @returns {void}
   */
  setVelocityMode(mode: VelocityMode): void {
    if (this.isDisposed) return;
    this.setVelocityControl({
      mode,
      realSpeedFactor: this.#velocityControl.realSpeedFactor,
      realWindSpeedStatistic: this.#velocityControl.realWindSpeedStatistic,
      windSpeedUnitScale: this.#velocityControl.windSpeedUnitScale,
    });
  }

  /**
   * 获取当前速度控制配置与最近一次写入底层的 velocityScale。
   *
   * @returns {NormalizedVelocityControl & { velocityScale: number | null }}
   */
  getVelocityControl(): NormalizedVelocityControl & {
    velocityScale: number | null;
  } {
    return {
      ...this.#velocityControl,
      velocityScale: this.#appliedVelocityScale,
    };
  }

  /**
   * 设置粒子数量，并重建粒子缓存。
   *
   * @param {number} paths 粒子数量，必须是非负整数。
   * @returns {void}
   */
  setPaths(paths: number): void {
    this.visualConfig.setPaths(paths);
    this.#applyConfigToWindCore();
    this.#scheduleRebuild();
  }

  /**
   * 获取当前风场配置副本。
   *
   * @returns {Object} 当前配置的新对象。外部修改返回值不会直接影响实例内部配置。
   */
  getConfig(): WindFieldConfig {
    return this.visualConfig.toObject();
  }

  /**
   * 获取风场可视化配置对象。
   *
   * @returns {WindFieldVisualConfig} 当前配置实例。
   */
  getVisualConfig(): WindFieldVisualConfig {
    return this.visualConfig;
  }

  /**
   * 获取底层 CesiumWind.WindLayer 实例。
   *
   * @returns {Object|null} 已创建时返回 WindLayer 实例，否则返回 null。
   */
  getWindLayer(): WindLayerLike | null {
    return this.windLayer;
  }

  /**
   * 获取底层 wind 动画核心对象。
   *
   * 一般业务代码不需要直接使用它；只有在调试粒子、同步内部 options、
   * 或访问 cesium-wind 内部能力时才使用。
   *
   * @returns {Object|null} 底层 wind core；未创建图层时返回 null。
   */
  getWindCore(): WindCoreLike | null {
    return this.windLayer?.wind || null;
  }

  /**
   * 获取底层渲染帧率，单位为帧/秒。
   *
   * cesium-wind 内部以 `options.frameRate`（毫秒）节流渲染，这里换算成秒，
   * 供粒子速度换算模块计算 `velocityScale` 使用。图层未创建时按底层默认帧间隔推算。
   *
   * @returns {number} 渲染帧率，单位为帧/秒。
   */
  getWindFrameRate(): number {
    const wind = this.getWindCore();
    const rawMilliseconds = Number(
      wind?.options && (wind.options as Record<string, unknown>).frameRate,
    );
    const milliseconds =
      Number.isFinite(rawMilliseconds) && rawMilliseconds > 0
        ? rawMilliseconds
        : DEFAULT_FRAME_INTERVAL;
    return DEFAULT_FRAME_RATE_UNIT / milliseconds;
  }

  /**
   * 读取底层当前帧风场数据，统计参考风速（max / 中位 / 均值）。
   *
   * 数据源为 cesium-wind 的 `wind.field.us / wind.field.vs`（扁平 U/V 网格），
   * 单位与数据一致（本 demo 为 m/s）。图层未创建或字段缺失时返回全 0。
   *
   * @param unitScale 风速单位换算系数，数据已是 m/s 时取 1。
   * @returns 参考风速统计量；不可用时各字段为 0。
   */
  getWindSpeedStatistics(unitScale = 1): {
    max: number;
    median: number;
    mean: number;
  } {
    const field = this.getWindCore()?.field;
    const us = field?.us;
    const vs = field?.vs;
    if (!us || !vs) return { max: 0, median: 0, mean: 0 };
    return computeWindSpeedStatistics(us, vs, unitScale);
  }

  /**
   * 销毁风场渲染类。
   *
   * 会移除当前风场图层，释放 viewer 和 CesiumWind 引用，并把 isDisposed 标记为 true。
   * 销毁后不应再调用 createWindLayer。
   *
   * @returns {void}
   */
  dispose(): void {
    this.removeWindLayer();
    this.#cameraController?.dispose();
    this.viewer = null;
    this.CesiumWind = null;
    this.isDisposed = true;
  }

  /**
   * 校验当前实例是否具备创建风场图层的条件。
   *
   * @returns {void}
   * @throws {Error} 当前实例不可用时抛出错误。
   */
  #assertUsable(): void {
    if (this.isDisposed) {
      throw new Error("WindFieldLayer has been disposed.");
    }
    if (!this.viewer) {
      throw new Error("WindFieldLayer requires a Cesium viewer instance.");
    }
    if (!this.CesiumWind || !this.CesiumWind.WindLayer) {
      throw new Error("CesiumWind.WindLayer is not available.");
    }
  }

  /**
   * 绑定场景渲染帧监听，缩放过程中分辨率变化时实时重算速度。
   *
   * 只监听 moveEnd 会在滚轮/惯性缩放期间滞后，导致屏幕像素速度漂移；
   * 这里用 scene.postRender 逐帧比对分辨率，变化时才重算。
   *
   * @returns {void}
   */
  #bindVelocityPostRender(): void {
    this.#unbindVelocityPostRender?.();
    this.#unbindVelocityPostRender = null;

    const scene = (this.viewer as {
      scene?: {
        postRender?: { addEventListener?: (cb: () => void) => (() => void) | void };
      };
    } | null)?.scene;
    const postRender = scene?.postRender;
    if (!postRender?.addEventListener) return;

    const remove = postRender.addEventListener(() => {
      // 相机每帧都可能平移/缩放，二维投影参数必须在使用前重新标定。
      this.#refreshProjector2D();
      this.#syncSceneStateIfNeeded();
      this.#syncVelocityScaleIfNeeded();
    });
    this.#unbindVelocityPostRender = typeof remove === "function" ? remove : null;
  }

  /**
   * 场景模式或画布尺寸变化时重建粒子。
   *
   * 切换到二维（SCENE2D）或 2.5D（COLUMBUS_VIEW）后，屏幕像素与经纬度的映射关系
   * 与三维完全不同；同时地图容器尺寸可能变化，粒子画布若不跟着重设就会整体错位。
   * 这里在每帧做一次轻量比对，只在真正变化时重绑反投影并重建粒子。
   *
   * @returns {void}
   */
  #syncSceneStateIfNeeded(): void {
    if (!this.windLayer) return;

    const mode = this.#readSceneMode();
    const canvasSize = this.#readCanvasSize();
    const modeChanged = mode !== null && mode !== this.#lastSceneMode;
    const sizeChanged = canvasSize !== null && canvasSize !== this.#lastCanvasSize;
    if (!modeChanged && !sizeChanged) return;

    this.#lastSceneMode = mode;
    this.#lastCanvasSize = canvasSize;

    // 模式切换后底层仍持有旧的反投影实现，必须重新覆盖后再重建粒子。
    this.#installSceneAdapters();

    if (sizeChanged && typeof this.windLayer.adjustSize === "function") {
      this.windLayer.adjustSize();
    }

    // 旧粒子的经纬度与旧拖尾都属于上一个视角，直接重建可避免残留错位画面。
    this.#rebuildParticlesNow();
  }

  /** 读取当前场景模式；Viewer 或场景不可用时返回 null。 */
  #readSceneMode(): number | null {
    const scene = (this.viewer as SceneModeViewerLike | null)?.scene;
    return typeof scene?.mode === "number" ? scene.mode : null;
  }

  /** 读取 Viewer 画布尺寸标识（宽x高）；不可用或尚未布局时返回 null。 */
  #readCanvasSize(): string | null {
    const canvas = (this.viewer as SceneModeViewerLike | null)?.scene?.canvas;
    const width = Number(canvas?.width);
    const height = Number(canvas?.height);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      return null;
    }
    return `${width}x${height}`;
  }

  /**
   * 用适配当前场景模式的反投影与可见性判定替换底层实现。
   *
   * cesium-wind 默认的 `unproject` 走 `globe.pick` + 椭球转经纬度，
   * `intersectsCoordinate` 走椭球遮挡判定，两者都只在三维成立：
   * - 二维/2.5D：地图铺在 x = 0 平面上，必须按 Cesium 内部拾取逻辑求交，
   *   再用 `scene.mapProjection.unproject` 还原经纬度，否则粒子会被生成到错误位置；
   * - 二维/2.5D：整幅地图都是可见的，椭球遮挡判定会误杀视口内的正常粒子。
   *
   * @returns {void}
   */
  #installSceneAdapters(): void {
    const windLayer = this.windLayer;
    if (!windLayer) return;

    // 首次安装时 windLayer.project 仍是底层原型方法，先保存原始实现，
    // 否则重新安装时会把我们自己的包装函数当作原始实现而递归调用。
    if (!this.#nativeProject && typeof windLayer.project === "function") {
      const nativeProject = windLayer.project.bind(windLayer);
      this.#nativeProject = (coordinate) => nativeProject(coordinate) ?? null;
    }

    windLayer.unproject = (pixel) => this.#unprojectPixel(pixel);
    windLayer.project = (coordinate) => this.#projectCoordinate(coordinate);
    windLayer.intersectsCoordinate = (coordinate) =>
      this.#isCoordinateVisible(coordinate);

    // 场景模式可能刚刚切换，先按当前相机刷新二维投影参数，保证首帧投影正确。
    this.#refreshProjector2D();

    // 底层风场核心在首次 render 时缓存了绑定后的方法，需要一并对齐。
    const wind = this.getWindCore();
    if (wind) {
      wind.unproject = windLayer.unproject;
      wind.project = windLayer.project;
      wind.intersectsCoordinate = windLayer.intersectsCoordinate;
    }
  }

  /**
   * 屏幕像素转经纬度，按当前场景模式选择正确的反投影方式。
   *
   * @param pixel 屏幕像素坐标 [x, y]。
   * @returns 反投影结果 [经度, 纬度]（单位：度）；无法换算时返回 null。
   */
  #unprojectPixel(pixel: [number, number]): [number, number] | null {
    const Cesium = getGlobalCesium();
    const viewer = this.viewer as SceneModeViewerLike | null;
    const scene = viewer?.scene;
    if (!Cesium || !viewer?.camera || !scene) return null;

    const pick = new Cesium.Cartesian2(pixel[0], pixel[1]);
    const ray = viewer.camera.getPickRay?.(pick);
    if (!ray) return null;

    // 三维：射线与椭球求交，与 cesium-wind 默认行为保持一致。
    if (scene.mode === Cesium.SceneMode.SCENE3D) {
      const globe = scene.globe;
      if (!globe) return null;
      const cartesian =
        globe.pick(ray, scene) || viewer.camera.pickEllipsoid?.(pick, globe.ellipsoid);
      if (!cartesian) return null;
      return this.#cartesianToDegrees(
        globe.ellipsoid.cartesianToCartographic(cartesian),
        Cesium,
      );
    }

    // 二维 / 2.5D：与 Cesium 内部拾取逻辑保持一致。
    // 这两种模式下地图铺在 x = 0 的平面上（投影坐标落在 (y, z) 分量），
    // 射线与之求交后再用 mapProjection.unproject 还原经纬度；
    // 直接按三维的 XY 平面求交会得到空结果，导致粒子被生成到错误位置。
    const projection = scene.mapProjection;
    if (!projection) return null;

    const directionX = ray.direction.x;
    // 射线与平面平行时无交点。
    if (!Number.isFinite(directionX) || directionX === 0) return null;

    const distance = -ray.origin.x / directionX;
    const planePoint = new Cesium.Cartesian3(
      0,
      ray.origin.y + ray.direction.y * distance,
      ray.origin.z + ray.direction.z * distance,
    );
    const cartographic = projection.unproject(
      new Cesium.Cartesian3(planePoint.y, planePoint.z, 0),
    );
    if (!cartographic) return null;

    const coordinate = this.#cartesianToDegrees(cartographic, Cesium);
    // 像素落在世界地图之外（黑边区域）时经纬度会越界，直接丢弃。
    return this.#isCoordinateInWorldRange(coordinate) ? coordinate : null;
  }

  /**
   * 按当前相机刷新二维「像素 → 投影平面」的线性映射。
   *
   * 二维模式（SCENE2D）下地图平面固定在 x = 0 上，相机为正射投影，
   * 屏幕上任意像素与该平面求交都可以用相机射线得到。
   * 这里用左上、右上、左下三个角点标定出平面 y/z 随像素 x/y 的增量，
   * 之后即可自行把经纬度投影成屏幕像素，不再使用 Cesium 自带实现。
   *
   * Cesium 自带的二维投影会把视野外的经度映射到「相邻世界副本」，
   * 同一粒子相邻两帧的屏幕 x 可能相差整整一个世界宽度（约一个画布宽），
   * 于是画出横穿画布的长直线；自行标定后坐标严格连续，不会再出现该问题。
   *
   * @returns {void}
   */
  #refreshProjector2D(): void {
    const Cesium = getGlobalCesium();
    const viewer = this.viewer as SceneModeViewerLike | null;
    const scene = viewer?.scene;
    if (!Cesium || !viewer?.camera || !scene) {
      this.#projector2D = null;
      return;
    }
    // 只有标准二维模式需要接管投影，三维与 2.5D 沿用底层实现。
    if (scene.mode !== Cesium.SceneMode.SCENE2D) {
      this.#projector2D = null;
      return;
    }

    const width = Number(scene.canvas?.width);
    const height = Number(scene.canvas?.height);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      this.#projector2D = null;
      return;
    }

    const topLeft = this.#planePointAtPixel(0, 0);
    const topRight = this.#planePointAtPixel(width, 0);
    const bottomLeft = this.#planePointAtPixel(0, height);
    if (!topLeft || !topRight || !bottomLeft) {
      this.#projector2D = null;
      return;
    }

    const planeYPerPixelX = (topRight[0] - topLeft[0]) / width;
    const planeZPerPixelY = (bottomLeft[1] - topLeft[1]) / height;
    // 尺度异常说明相机尚未稳定（例如刚切换模式的过渡帧），本帧不启用自投影。
    if (
      !Number.isFinite(planeYPerPixelX) ||
      !Number.isFinite(planeZPerPixelY) ||
      planeYPerPixelX === 0 ||
      planeZPerPixelY === 0
    ) {
      this.#projector2D = null;
      return;
    }

    this.#projector2D = {
      planeYAtLeft: topLeft[0],
      planeYPerPixelX,
      planeZAtTop: topLeft[1],
      planeZPerPixelY,
    };
  }

  /**
   * 求屏幕像素与二维地图平面（x = 0）的交点。
   *
   * @param pixelX 屏幕像素 x。
   * @param pixelY 屏幕像素 y。
   * @returns 交点平面坐标 [y, z]；无交点时返回 null。
   */
  #planePointAtPixel(pixelX: number, pixelY: number): [number, number] | null {
    const Cesium = getGlobalCesium();
    const camera = (this.viewer as SceneModeViewerLike | null)?.camera;
    if (!Cesium || !camera?.getPickRay) return null;

    const ray = camera.getPickRay(new Cesium.Cartesian2(pixelX, pixelY));
    if (!ray) return null;

    const directionX = ray.direction.x;
    // 射线与地图平面平行时无交点。
    if (!Number.isFinite(directionX) || directionX === 0) return null;

    const distance = -ray.origin.x / directionX;
    const planeY = ray.origin.y + ray.direction.y * distance;
    const planeZ = ray.origin.z + ray.direction.z * distance;
    if (!Number.isFinite(planeY) || !Number.isFinite(planeZ)) return null;
    return [planeY, planeZ];
  }

  /**
   * 二维模式下把经纬度投影到屏幕像素。
   *
   * @param coordinate 经纬度坐标 [经度, 纬度]（单位：度）。
   * @returns 屏幕像素 [x, y]；无法换算时返回 null。
   */
  #projectIn2D(coordinate: [number, number]): [number, number] | null {
    const Cesium = getGlobalCesium();
    const projection = (this.viewer as SceneModeViewerLike | null)?.scene?.mapProjection;
    const projector = this.#projector2D;
    if (!Cesium || !projection?.project || !projector) return null;

    // 复用经纬度对象与投影结果对象，避免每帧成百上千次分配。
    const cartographic = this.#scratchCartographic ?? new Cesium.Cartographic(0, 0);
    this.#scratchCartographic = cartographic;
    cartographic.longitude = coordinate[0] * DEGREES_TO_RADIANS;
    cartographic.latitude = coordinate[1] * DEGREES_TO_RADIANS;

    const projected = projection.project(
      cartographic,
      this.#scratchCartesian ?? undefined,
    );
    if (!projected) return null;
    this.#scratchCartesian = projected;

    // 地图平面坐标 (y, z) 与投影结果 (x, y) 一一对应，按标定参数反算像素。
    const pixelX =
      (projected.x - projector.planeYAtLeft) / projector.planeYPerPixelX;
    const pixelY =
      (projected.y - projector.planeZAtTop) / projector.planeZPerPixelY;
    if (!Number.isFinite(pixelX) || !Number.isFinite(pixelY)) return null;
    return [pixelX, pixelY];
  }

  /**
   * 经纬度转屏幕像素：二维走自标定投影，其他模式沿用底层实现。
   *
   * @param coordinate 经纬度坐标 [经度, 纬度]（单位：度）。
   * @returns 屏幕像素 [x, y]；无法换算时返回 null。
   */
  #projectCoordinate(coordinate: [number, number]): [number, number] | null {
    const Cesium = getGlobalCesium();
    const scene = (this.viewer as SceneModeViewerLike | null)?.scene;
    if (Cesium && scene && scene.mode === Cesium.SceneMode.SCENE2D) {
      return this.#projectIn2D(coordinate);
    }
    return this.#nativeProject ? this.#nativeProject(coordinate) : null;
  }

  /**
   * 判断经纬度是否落在地图有效范围内（经度 ±180、纬度 ±90）。
   *
   * 二维/2.5D 下平移出地图范围后会出现黑边区域，
   * 该区域的坐标既没有影像也不应该有风场，需要整体剔除。
   *
   * @param coordinate 经纬度坐标 [经度, 纬度]（单位：度）。
   * @returns 是否位于世界地图有效范围内。
   */
  #isCoordinateInWorldRange(coordinate: [number, number]): boolean {
    const longitude = coordinate[0];
    const latitude = coordinate[1];
    return (
      Number.isFinite(longitude) &&
      Number.isFinite(latitude) &&
      longitude >= WORLD_MIN_LONGITUDE &&
      longitude <= WORLD_MAX_LONGITUDE &&
      latitude >= WORLD_MIN_LATITUDE &&
      latitude <= WORLD_MAX_LATITUDE
    );
  }

  /**
   * 判断经纬度点是否需要绘制。
   *
   * 三维下沿用椭球遮挡判定剔除背面点；二维/2.5D 下地图是平面铺开的，
   * 不能再用遮挡判定（会把视口内正常粒子误判为不可见），
   * 改为按世界地图有效范围过滤：地图之外的黑边区域不绘制任何粒子，
   * 同时避免跨过 ±180 经线的线段被投影成横穿画布的长直线。
   *
   * @param coordinate 经纬度坐标 [经度, 纬度]（单位：度）。
   * @returns 该点是否可见。
   */
  #isCoordinateVisible(coordinate: [number, number]): boolean {
    const Cesium = getGlobalCesium();
    const viewer = this.viewer as SceneModeViewerLike | null;
    const scene = viewer?.scene;
    if (!Cesium || !viewer?.camera || !scene) return true;
    if (scene.mode !== Cesium.SceneMode.SCENE3D) {
      return this.#isCoordinateInWorldRange(coordinate);
    }

    const occluder = new Cesium.EllipsoidalOccluder(
      Cesium.Ellipsoid.WGS84,
      viewer.camera.position,
    );
    return occluder.isPointVisible(
      Cesium.Cartesian3.fromDegrees(coordinate[0], coordinate[1]),
    );
  }

  /** 把弧度制经纬度转换为角度制数组。 */
  #cartesianToDegrees(
    cartographic: CesiumCartographicLike,
    Cesium: CesiumApiLike,
  ): [number, number] {
    return [
      Cesium.Math.toDegrees(cartographic.longitude),
      Cesium.Math.toDegrees(cartographic.latitude),
    ];
  }

  /** 立即按当前视角重建粒子，不经过 requestAnimationFrame 合并。 */
  #rebuildParticlesNow(): void {
    const wind = this.getWindCore();
    if (!wind || typeof wind.prerender !== "function") return;

    // 记录播放状态：重建粒子不能把原本已暂停的图层自动跑起来。
    const wasRunning = typeof wind.isStop === "function" ? !wind.isStop() : false;

    // 先清掉上一个视角残留的轨迹像素，避免切换后出现双份错位画面。
    if (typeof wind.clearCanvas === "function") wind.clearCanvas();
    wind.prerender();

    if (wasRunning) {
      wind.start?.();
    } else {
      wind.stop?.();
    }
  }

  /** 仅在分辨率变化时重算 velocityScale，避免每帧无谓计算。 */
  #syncVelocityScaleIfNeeded(): void {
    if (!this.windLayer) return;

    const resolution = this.#readResolution();
    const changed =
      !Number.isFinite(this.#lastVelocityResolution) ||
      Math.abs(resolution - this.#lastVelocityResolution) > VELOCITY_RESOLUTION_EPSILON;
    if (!changed) return;

    this.#lastVelocityResolution = resolution;
    this.#applyVelocityScale();
  }

  /**
   * 按当前模式、分辨率、帧率与数据真实风速换算 velocityScale 并写入配置。
   *
   * 图层尚未创建时同样可调用：此时只写入 visualConfig，
   * 保证 createWindLayer 的首帧就用正确速度渲染。
   *
   * @returns {void}
   */
  #applyVelocityScale(): void {
    if (this.isDisposed) return;

    try {
      const result = this.#velocityPlanner.update(this.#velocityControl, {
        frameRate: this.getWindFrameRate(),
        resolution: this.#readResolution(),
        latitude: this.#readViewLatitude(),
        realWindSpeed: this.#dataRealWindSpeed ?? 0,
      });
      this.#appliedVelocityScale = result.velocityScale;
      this.setVelocityScale(result.velocityScale);
    } catch (error) {
      console.warn("[WindFieldLayer] velocityScale 计算失败：", error);
    }
  }

  /**
   * 读取当前分辨率（米/像素），由适配器按 MapBaseHelper 相机距离法提供。
   * 适配器缺失或返回非法值时回退到层级 0（世界全图）对应的分辨率。
   */
  #readResolution(): number {
    const resolution = this.#mapAdapter?.getResolution?.();
    if (Number.isFinite(Number(resolution)) && Number(resolution) > 0) {
      return Number(resolution);
    }
    return level2Resolution(0);
  }

  /** 读取当前视角中心纬度（度），适配器缺失时按赤道处理。 */
  #readViewLatitude(): number {
    const latitude = this.#mapAdapter?.getViewLatitude?.();
    return Number.isFinite(Number(latitude)) ? Number(latitude) : 0;
  }

  /**
   * 统计数据真实风速并缓存。
   *
   * 统计口径由 velocityControl.realWindSpeedStatistic 决定（默认中位数）；
   * 图层未创建时读不到字段，保持 null，下次调用再统计。
   *
   * @returns {void}
   */
  #resolveDataRealWindSpeed(): void {
    if (this.#dataRealWindSpeed !== null) return;

    const stats = this.getWindSpeedStatistics(this.#velocityControl.windSpeedUnitScale);
    const realWindSpeed = pickReferenceWindSpeed(
      stats,
      this.#velocityControl.realWindSpeedStatistic,
    );
    this.#dataRealWindSpeed = realWindSpeed > 0 ? realWindSpeed : null;
  }

  /**
   * 将当前配置同步到底层 wind core。
   *
   * @returns {void}
   */
  #applyConfigToWindCore(): void {
    const wind = this.getWindCore();
    if (!wind || !wind.options) return;

    const config = this.visualConfig.toObject();
    Object.keys(config).forEach((key) => {
      const configKey = key as keyof WindFieldConfig;
      wind.options![key] = config[configKey];
    });
    this.#syncParticleCount(wind);
  }

  /**
   * 同步底层粒子数量。
   *
   * cesium-wind 修改 options.paths 后，不一定会自动扩容或裁剪已有 particles 数组，
   * 所以这里手动补齐或截断，确保 paths 配置能即时反映到画面中。
   *
   * @param {Object} wind 底层 wind core 对象。
   * @returns {void}
   */
  #syncParticleCount(wind: WindCoreLike): void {
    if (
      !wind ||
      !wind.particles ||
      !wind.field ||
      !wind.options ||
      !Number.isFinite(Number(wind.options.paths))
    ) {
      return;
    }

    const target = Math.max(0, Math.floor(Number(wind.options.paths)));
    const current = wind.particles.length;

    if (target < current) {
      wind.particles.length = target;
      return;
    }

    if (
      target > current &&
      wind.ctx &&
      wind.ctx.canvas &&
      typeof wind.field.randomize === "function"
    ) {
      const width = wind.ctx.canvas.width;
      const height = wind.ctx.canvas.height;
      for (let i = current; i < target; i += 1) {
        wind.particles.push(
          wind.field.randomize(
            {
              age: typeof wind.randomize === "function" ? wind.randomize() : 0,
            },
            width,
            height,
            wind.unproject,
          ),
        );
      }
    }
  }

  /**
   * 调度一次粒子重建。
   *
   * 使用 requestAnimationFrame 合并多次配置更新，避免短时间连续调整粒子配置时频繁重建。
   *
   * @returns {void}
   */
  #scheduleRebuild() {
    if (this.rebuildScheduled) return;
    this.rebuildScheduled = true;

    getRequestAnimationFrame()(() => {
      this.rebuildScheduled = false;
      const wind = this.getWindCore();
      if (wind && typeof wind.prerender === "function") {
        wind.prerender();
      }
    });
  }

  /**
   * 设置底层 canvas 显隐。
   *
   * @param {boolean} visible 是否显示 canvas。
   * @returns {void}
   */
  #setCanvasVisible(visible: boolean): void {
    const canvas = this.windLayer && this.windLayer.canvas;
    if (canvas && canvas.style) {
      canvas.style.visibility = visible ? "visible" : "hidden";
    }
  }
}

/**
 * 相机移动可见性控制器（内部类）。
 *
 * 监听相机 moveStart/moveEnd 和鼠标抬起事件，实现 nullschool 效果：
 * - 相机开始移动时立即隐藏风场
 * - 鼠标抬起后延迟恢复显示风场
 *
 * 注意：moveEnd 在拖动中途停下来也会触发（惯性），所以需要配合 mouseup
 * 来判断用户是否真的松开了鼠标。只有松开鼠标后才会触发延迟恢复。
 */
class CameraVisibilityController {
  private readonly viewer: CameraVisibilityViewerLike | null;
  private readonly delay: number;
  private readonly onHide: () => void;
  private readonly onShow: () => void;
  private readonly getVisible: () => boolean;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private offMoveStart: (() => void) | null = null;
  private offMoveEnd: (() => void) | null = null;
  /** 鼠标是否正在按住（拖动中） */
  private isMouseDown = false;
  private active = false;

  constructor(options: {
    viewer: unknown;
    delay: number;
    onHide: () => void;
    onShow: () => void;
    getVisible: () => boolean;
  }) {
    this.viewer = (options.viewer as CameraVisibilityViewerLike) || null;
    this.delay = Math.max(0, options.delay || 0);
    this.onHide = options.onHide;
    this.onShow = options.onShow;
    this.getVisible = options.getVisible;
  }

  /** 启动相机和鼠标事件监听。外部在创建图层后调用一次。 */
  ensureActive(): void {
    if (this.active || !this.viewer?.camera) return;

    // 使用 Cesium 原生的 ScreenSpaceEventHandler 监听鼠标事件
    const canvas = this.viewer.scene?.canvas;
    if (canvas) {
      // Cesium 全局对象，用于 ScreenSpaceEventHandler
      const Cesium = (globalThis as { Cesium?: unknown }).Cesium;
      if (Cesium) {
        const ScreenSpaceEventHandler = (Cesium as { ScreenSpaceEventHandler?: new (el: HTMLElement) => ScreenSpaceEventHandlerLike }).ScreenSpaceEventHandler!;
        const ScreenSpaceEventType = (Cesium as { ScreenSpaceEventType?: Record<string, number> }).ScreenSpaceEventType!;
        const handler = new ScreenSpaceEventHandler(canvas as HTMLElement);
        handler.setInputAction(() => {
          this.isMouseDown = true;
        }, ScreenSpaceEventType.LEFT_DOWN);

        handler.setInputAction(() => {
          this.isMouseDown = false;
        }, ScreenSpaceEventType.LEFT_UP);

        handler.setInputAction(() => {
          this.isMouseDown = true;
        }, ScreenSpaceEventType.RIGHT_DOWN);

        handler.setInputAction(() => {
          this.isMouseDown = false;
        }, ScreenSpaceEventType.RIGHT_UP);
      }
    }

    const onMoveStart = () => {
      // 相机开始移动，立即隐藏风场
      this.#cancelTimer();
      if (this.getVisible()) this.onHide();
    };

    // 拖动结束（惯性也会触发 moveEnd）
    // 统一由 moveEnd 触发重建和显示，避免 mouseup 先触发导致旧粒子闪烁
    const onMoveEnd = () => {
      if (!this.isMouseDown) {
        this.#cancelTimer();
        // 延迟显示 canvas
        if (this.getVisible()) {
          if (this.delay > 0) {
            this.showTimer = setTimeout(() => {
              this.showTimer = null;
              if (this.getVisible()) this.onShow();
            }, this.delay);
          } else {
            this.onShow();
          }
        }
      }
    };

    const ms = this.viewer.camera.moveStart?.addEventListener(onMoveStart);
    const me = this.viewer.camera.moveEnd?.addEventListener(onMoveEnd);

    if (!ms && !me) return;

    this.offMoveStart = typeof ms === "function" ? ms : null;
    this.offMoveEnd = typeof me === "function" ? me : null;
    this.active = true;
  }

  /** 释放资源。 */
  dispose(): void {
    this.#cancelTimer();
    this.offMoveStart?.();
    this.offMoveEnd?.();
    this.offMoveStart = null;
    this.offMoveEnd = null;
    this.active = false;
  }

  #cancelTimer(): void {
    if (this.showTimer !== null) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
  }
}

export { DEFAULT_WIND_CONFIG, WindFieldLayer };
