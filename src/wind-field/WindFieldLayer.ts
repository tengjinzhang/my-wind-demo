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
  };
  /** 底层绘图上下文和画布尺寸。 */
  ctx?: { canvas?: { width: number; height: number } };
  /** cesium-wind 内部的随机年龄生成函数。 */
  randomize?: () => number;
  /** 地理坐标反投影函数或对象。 */
  unproject?: unknown;
  /** 启动粒子动画。 */
  start?: () => void;
  /** 停止粒子动画。 */
  stop?: () => void;
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
  canvas?: { style?: { display: string } };
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
}

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
    this.windLayer = new WindLayer(frameData, {
      windOptions: this.visualConfig.toObject(),
    });
    this.windLayer.addTo(this.viewer);
    this.visible = true;
    this.#applyConfigToWindCore();
    this.#cameraController?.ensureActive();
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
      canvas.style.display = visible ? "" : "none";
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
