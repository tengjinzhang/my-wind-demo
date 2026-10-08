import type { NBaseStrategy } from "./NBaseStrategy";
import type WindFieldLayer from "./WindFieldLayer";

import type { WindFieldConfig } from "./WindFieldLayer";

/** 支持普通函数和 greater-area 中 NCallbackDelegate 两种回调形式。 */
export interface CallbackDelegate {
  /** 实际执行的回调函数。 */
  callback?: ((...args: unknown[]) => void) | null;
  /** 执行 callback 时绑定的 this 对象。 */
  actionScope?: unknown;
}

export type CallbackLike =
  | ((...args: unknown[]) => void)
  | CallbackDelegate
  | null
  | undefined;

/** 添加或定位播放帧时使用的业务元数据。 */
export interface WindFieldFrameOptions {
  /** 帧在时序列表中的固定位置，从 0 开始。 */
  index?: number;
  /** 帧的业务唯一标识，用于日志、缓存和排查问题。 */
  key?: string | null;
  /** DataManager 或业务侧使用的数据类型编码。 */
  dataType?: string | null;
  /** 当前帧的业务时间，通常来自时次接口。 */
  time?: string | null;
  /** 是否在添加后立即显示该帧。 */
  show?: boolean;
  /** 允许业务侧附带其他元数据，但不会参与核心渲染逻辑。 */
  [key: string]: unknown;
}

/** 播放类内部保存的一帧数据。 */
export interface WindFieldFrame {
  /** 归一化后的风场数据，最终交给 WindFieldLayer。 */
  data: unknown;
  /** DataManager 或 Worker 返回的原始数据，便于调试和追踪。 */
  rawData: unknown;
  /** 添加帧时传入的完整业务选项。 */
  opt: WindFieldFrameOptions;
  /** 归一化后的帧唯一标识。 */
  key: string | null;
  /** 归一化后的数据类型。 */
  dataType: string | null;
  /** 归一化后的业务时间。 */
  time: string | null;
}

/** 风场播放类的构造参数。 */
export interface WindFieldFrameStrategyOptions {
  /** Cesium Viewer 引用，策略本身不负责销毁 Viewer。 */
  viewer?: unknown;
  /** 已经创建好的风场图层对象，策略通过它切换和更新画面。 */
  windLayer: WindFieldLayer;
  /** 当前模型、场次或业务数据编码。 */
  modelCode?: string;
  /** 策略的显示模式，保留用于兼容统一策略接口。 */
  showMode?: string;
  /** 基础数据需要的字段列表，当前风场策略暂未使用。 */
  frameDataAttributes?: string[];
  /** 帧数据需要的字段列表，当前风场策略暂未使用。 */
  baseDataAttributes?: string[];
  /** 帧列表变化时通知外部的回调。 */
  onFrameDataChanged?: CallbackLike;
  /** 通用外观类型，保留用于兼容其他策略实现。 */
  appearanceType?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return typeof value === "string" ? value : String(value);
}

function callDelegate(
  callback: CallbackLike,
  scope: unknown,
  args: unknown[],
): void {
  if (!callback) return;
  if (typeof callback === "function") {
    callback.apply(scope || null, args);
    return;
  }
  if (callback.callback && typeof callback.callback === "function") {
    callback.callback.apply(callback.actionScope || scope || null, args);
  }
}

function normalizeFrameData(data: unknown): unknown {
  if (!data) return data;
  if (!isRecord(data)) return data;
  if (data.frameData) return data.frameData;
  if (isRecord(data.data) && data.data.frameData) return data.data.frameData;
  if (isRecord(data.data) && data.data.data) return data.data.data;
  if (data.data) return data.data;
  return data;
}

/**
 * 风场时序播放类。
 *
 * 该类只管理“已有风场数据帧”的保存、切换和显示，不负责创建
 * `DataManager`，也不负责下载数据。数据下载由 `WindFieldDataLoader`
 * 完成后，调用 `addFrameData` 交给本类管理。
 */
export default class WindFieldFrameStrategy implements NBaseStrategy {
  /** 当前地图或 Viewer 引用。 */
  viewer: unknown;
  /** 当前模型或场次编码。 */
  modelCode: string;
  /** 当前策略的显示模式。 */
  showMode: string;
  /** 基础数据字段需求。 */
  frameDataAttributes: string[];
  /** 帧数据字段需求。 */
  baseDataAttributes: string[];
  /** 帧列表变化回调。 */
  onFrameDataChanged: CallbackLike;
  /** 可选的基础数据，例如网格或 VAO 信息。 */
  baseData: unknown;
  /** 基础数据对应的业务参数。 */
  baseDataOptions: unknown;
  /** 按时序索引保存的帧数据；异步加载时可能暂时存在空位。 */
  frameDataList: Array<WindFieldFrame | undefined>;
  /** 等待刷新到 CesiumWind 的帧索引队列。 */
  taskList: number[];
  /** 是否暂时阻止刷新操作。 */
  isLoading: boolean;
  /** 当前外观类型。 */
  appearanceType: unknown;
  /** 是否显示风场箭头，当前 CesiumWind 实现保留此状态。 */
  arrowVisible: boolean;
  /** 实际负责 CesiumWind 创建和更新的图层类。 */
  windLayer: WindFieldLayer;
  /** 当前策略是否显示在地图上。 */
  visible: boolean;
  /** 是否已经释放策略资源。 */
  isDisposed: boolean;
  /** 当前显示帧索引。 */
  showIndex: number;
  /** 上一次显示的帧索引。 */
  previousIndex: number;
  /** 已经成功加入 frameDataList 的帧数量。 */
  completedFrameCount: number;

  /**
   * 创建风场帧策略。
   *
   * @param options 策略运行所需的图层、Viewer 和兼容性配置。
   */
  constructor(options: WindFieldFrameStrategyOptions) {
    this.viewer = options.viewer || options.windLayer?.viewer || null;
    this.showIndex = 0;
    this.previousIndex = -1;
    this.isDisposed = false;
    this.completedFrameCount = 0;
    this.modelCode = options.modelCode || "model";
    this.showMode = options.showMode || "all";
    this.frameDataAttributes = options.frameDataAttributes || [];
    this.baseDataAttributes = options.baseDataAttributes || [];
    this.onFrameDataChanged = options.onFrameDataChanged || null;

    this.baseData = null;
    this.baseDataOptions = null;
    this.frameDataList = [];
    this.taskList = [];
    this.isLoading = false;
    this.appearanceType = options.appearanceType || null;
    this.arrowVisible = true;

    if (!options.windLayer) {
      throw new Error("WindFieldFrameStrategy requires an existing WindFieldLayer instance.");
    }
    this.windLayer = options.windLayer;
  }

  /**
   * 把风场参数转交给已经创建的风场图层。
   *
   * `appearanceType`、`arrowVisible` 等通用播放参数仍被保留，
   * 这样不会破坏原有策略接口；当前 CesiumWind 只需要下面这些
   * 风场渲染参数。
   */
  /** @param config 要同步到 WindFieldLayer 的风场参数。 */
  initWindConfig(
    config: Partial<WindFieldConfig> & {
      appearanceType?: unknown;
      arrowVisible?: boolean;
    },
  ): void {
    if (!this.windLayer || !config || typeof config !== "object") return;
    if (config.colorScale !== undefined) this.windLayer.setColorScale(config.colorScale);
    if (config.maxAge !== undefined) this.windLayer.setMaxAge(config.maxAge);
    if (config.globalAlpha !== undefined) this.windLayer.setGlobalAlpha(config.globalAlpha);
    if (config.lineWidth !== undefined) this.windLayer.setLineWidth(config.lineWidth);
    if (config.velocityScale !== undefined) this.windLayer.setVelocityScale(config.velocityScale);
    if (config.paths !== undefined) this.windLayer.setPaths(config.paths);
  }

  /** 返回策略类型名称，便于统一策略接口识别当前实现。 */
  getType(): string {
    return "WindFieldFrameStrategy";
  }

  /**
   * 保存基础数据。
   *
   * 当前风场 JSON 已经包含渲染所需结构，因此通常不需要基础数据；
   * 保留该方法是为了兼容需要先加载网格、VAO 或字段定义的业务。
   *
   * @param data 基础数据内容。
   * @param opt 基础数据的附加业务参数。
   */
  addBaseData(data: unknown, opt?: unknown): void {
    this.baseData = data;
    this.baseDataOptions = opt || null;
  }

  /**
   * 添加一帧风场数据。
   *
   * `index` 存在时按指定时次位置保存，适合异步并行下载；
   * 不传 `index` 时追加到列表末尾。
   */
  /** @param data 当前帧的原始风场数据；@param opt 当前帧的索引、key、时间和显示选项。 */
  addFrameData(data: unknown, opt: WindFieldFrameOptions = {}): void {
    const record = isRecord(data) ? data : null;
    const frame = {
      data: normalizeFrameData(data),
      rawData: data,
      opt,
      key: readStringOrNull(opt.key || record?.key),
      dataType: readStringOrNull(opt.dataType || record?.dataType),
      time: readStringOrNull(opt.time || record?.time),
    };

    if (Number.isInteger(opt.index) && opt.index >= 0) {
      this.frameDataList[opt.index] = frame;
    } else {
      this.frameDataList.push(frame);
    }

    this.completedFrameCount = this.frameDataList.filter(Boolean).length;
    this.#notifyFrameDataChanged(frame);

    if (this.completedFrameCount === 1 || opt.show === true) {
      this.showFrameData(opt.index || 0);
    }
  }

  /**
   * 显示指定索引的风场帧，并将切换请求加入队列。
   *
   * @param index 目标帧索引，从 0 开始。
   * @returns 是否找到了可显示的帧。
   */
  showFrameData(index: number): boolean {
    if (this.isDisposed || this.frameDataList.length === 0) return false;

    const nextIndex = Math.max(
      0,
      Math.min(Number(index) || 0, this.frameDataList.length - 1),
    );
    if (!this.frameDataList[nextIndex]) return false;

    this.taskList.push(nextIndex);
    this.refreshData();
    return true;
  }

  /**
   * 消费帧切换队列，避免同一时刻重复更新底层 CesiumWind 图层。
   *
   * 一般由 showFrameData() 间接触发，业务侧通常不需要手动调用。
   */
  refreshData(): void {
    if (this.isDisposed || this.isLoading || this.taskList.length === 0) return;
    const index = this.taskList.shift();
    const frame = this.frameDataList[index];
    if (!frame || frame.data === null || frame.data === undefined) {
      this.refreshData();
      return;
    }

    this.#showFrame(index, frame.data);
    this.refreshData();
  }

  /**
   * 设置通用外观类型，并同步到风场配置入口。
   *
   * @param aType 外观类型标识，具体含义由策略实现决定。
   */
  setAppearanceType(aType: unknown): void {
    this.appearanceType = aType;
    this.initWindConfig({ appearanceType: aType });
  }

  /**
   * 设置策略图层的显隐状态。
   *
   * @param v true 显示并启动图层动画，false 隐藏并暂停图层动画。
   */
  setVisible(v: boolean): void {
    this.visible = Boolean(v);
    if (!this.windLayer) return;
    if (this.visible) {
      this.windLayer.showWindLayer();
    } else {
      this.windLayer.hideWindLayer();
    }
  }

  /**
   * 设置箭头显示状态。
   *
   * @param v 是否显示箭头；当前底层 CesiumWind 可能不使用该配置。
   */
  setArrowVisible(v: boolean): void {
    this.arrowVisible = Boolean(v);
    this.initWindConfig({ arrowVisible: this.arrowVisible });
  }

  /**
   * 获取策略声明的数据字段需求。
   *
   * @param type 传 base 返回基础字段，传 frame 返回帧字段，不传返回两者。
   */
  getNeedDataAttributes(
    type?: "base" | "frame" | string,
  ): string[] | {
    baseDataAttributes: string[];
    frameDataAttributes: string[];
  } {
    if (type === "base") return this.baseDataAttributes;
    if (type === "frame") return this.frameDataAttributes;
    return {
      baseDataAttributes: this.baseDataAttributes,
      frameDataAttributes: this.frameDataAttributes,
    };
  }

  /** 清空所有播放帧，并移除当前风场图层，但不销毁播放对象。 */
  clear(): void {
    if (this.windLayer) {
      this.windLayer.removeWindLayer();
    }
    this.frameDataList.length = 0;
    this.taskList.length = 0;
    this.isLoading = false;
    this.showIndex = 0;
    this.previousIndex = -1;
    this.completedFrameCount = 0;
    this.#notifyFrameDataChanged(null);
  }

  /** 释放播放类、风场图层以及策略保存的资源引用。 */
  dispose(): void {
    this.clear();
    if (this.windLayer) {
      this.windLayer.dispose();
    }
    this.viewer = null;
    this.isDisposed = true;
  }

  /** 兼容原项目中使用的复数形式销毁方法。 */
  disposes(): void {
    this.dispose();
  }

  #notifyFrameDataChanged(frame: WindFieldFrame | null): void {
    callDelegate(this.onFrameDataChanged, this, [
      this.completedFrameCount,
      frame,
      this.frameDataList,
    ]);
  }

  #showFrame(index: number, frameData: unknown): void {
    this.previousIndex = this.showIndex;
    this.showIndex = index;

    if (this.windLayer.getWindLayer()) {
      this.windLayer.updateWindLayer(frameData);
    } else {
      this.windLayer.createWindLayer(frameData);
      if (!this.visible) this.windLayer.hideWindLayer();
    }
  }
}

export { WindFieldFrameStrategy };
