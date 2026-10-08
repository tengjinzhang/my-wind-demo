// DataManager 是通过 index.html 以普通 script 注册的全局对象，

/** DataManager 使用的构造函数类型。 */
type Constructor<T> = new () => T;

/** DataManager 回调代理的最小结构。 */
export interface DataManagerCallbackDelegate {
  /** DataManager 任务完成后实际执行的函数。 */
  callback?: ((...args: any[]) => void) | null;
  /** 执行 callback 时绑定的业务对象。 */
  actionScope?: unknown;
}

export type DataManagerCallback =
  | ((result: DataManagerResult | null) => void)
  | DataManagerCallbackDelegate
  | null;

/** 单帧任务完成后的业务回调。 */
export type WindFrameLoadedCallback =
  | ((item: WindLoadItem) => void)
  | DataManagerCallbackDelegate
  | null;

/** `NLoadInfo` 的最小字段集合，其他项目字段通过索引签名透传。 */
export interface NLoadInfoLike {
  /** 业务侧用于缓存和追踪的唯一标识。 */
  key: string | null;
  /** 实际要请求的数据地址。 */
  dataUrl: string | null;
  /** DataManager 使用的数据类型编码。 */
  dataType: string;
  /** Worker 解析方式编码，例如 linePos。 */
  parsType: number;
  /** 缓存策略编码，例如仅使用 IndexedDB。 */
  cacheType: number;
  /** greater-area 中 NLoadInfo 支持的其他字段。 */
  [key: string]: unknown;
}

/** `NLoadTask` 的最小字段集合。 */
export interface NLoadTaskLike {
  /** 当前任务的下载描述。 */
  loadInfo: NLoadInfoLike | null;
  /** DataManager 内部使用的任务唯一键。 */
  key: string | null;
  /** 当前任务完成后的回调。 */
  TaskCallback: DataManagerCallback;
}

/** DataManager 返回给任务回调的结果。 */
export interface DataManagerResult {
  /** DataManager 返回的任务 key。 */
  key?: string | null;
  /** DataManager 返回的数据类型。 */
  dataType?: string | null;
  /** DataManager 使用的缓存类型。 */
  cacheType?: number;
  /** Worker 或缓存返回的原始数据。 */
  data?: unknown;
  /** 其他项目自定义返回字段。 */
  [key: string]: unknown;
}

/** `window.DataManager` 对象使用到的最小方法集合。 */
export interface DataManagerLike {
  /** IndexedDB 和 DataManager 基础初始化是否完成。 */
  initCompleted?: boolean;
  /** 当前全局 Worker 地址。 */
  WorkerUrl?: string | null;
  /** 当前 Worker 并发数量。 */
  WorkerCount?: number;
  /** 设置 Worker 地址的官方方法。 */
  setWorkerUrl?: (url: string) => void;
  /** 设置 Worker 数量的官方方法。 */
  setWorkerCount?: (count: number) => void;
  /** 提交一批 NLoadTask。 */
  loadDatas: (tasks: NLoadTaskLike[]) => void;
  /** 清空尚未开始执行的任务。 */
  clearLoadTasks?: () => void;
}

/** 一个时次对应的下载任务描述。时间等业务元数据不会写入风场 JSON。 */
export interface WindFrameRequest {
  /** 当前帧的业务唯一标识。 */
  key?: string;
  /** 当前帧风场 JSON 或二进制数据地址。 */
  dataUrl?: string;
  /** DataManager 数据类型。 */
  dataType?: string;
  /** Worker 解析方式。 */
  parsType?: number;
  /** 缓存策略。 */
  cacheType?: number;
  /** 数据载荷类型，便于兼容旧的序列文件入口。 */
  payloadType?: string;
  /** 显式指定帧索引；不传时由数组位置决定。 */
  frameIndex?: number;
  /** 需要透传给 NLoadInfo 的其他业务字段。 */
  loadInfo?: Record<string, unknown>;
  /** 时间、场次等业务元数据不写入风场 JSON，可放在此处透传。 */
  [key: string]: unknown;
}

/** 单个任务完成后的统一结果。 */
export interface WindLoadItem {
  /** 当前帧在输入清单中的索引。 */
  index: number;
  /** 统一后的任务 key。 */
  key: string | null;
  /** 统一后的数据类型。 */
  dataType: string | null;
  /** 从 Worker 包装结果中提取出的真正风场数据。 */
  data: unknown;
  /** DataManager 原始返回对象。 */
  rawData: DataManagerResult | null;
  /** 创建任务时传入的业务元数据。 */
  frame: WindFrameRequest;
}

/** 批量风场任务的汇总结果。 */
export interface WindLoadResult {
  /** 本次提交的任务总数。 */
  total: number;
  /** 已收到回调的任务数。 */
  completed: number;
  /** 成功解析的任务数。 */
  success: number;
  /** 失败任务数。 */
  failed: number;
  /** 按输入索引保存的单帧结果。失败项也可能存在。 */
  items: Array<WindLoadItem | undefined>;
  /** 每个失败任务的索引、错误和原始结果。 */
  errors: Array<{
    index: number;
    key: string | null;
    error: Error;
    result: DataManagerResult | null;
  }>;
  /** 是否所有任务都成功完成。 */
  ready: boolean;
}

/** 加载器的构造配置。 */
export interface WindFieldDataLoaderOptions {
  /** 可选的 DataManager 实例；不传时读取全局 DataManager。 */
  dataManager?: DataManagerLike | null;
  /** 默认风场 Worker 地址。 */
  workerUrl?: string;
  /** 默认 Worker 并发数。 */
  workerCount?: number;
  /** 等待 DataManager 初始化的最长时间，单位为毫秒。 */
  readyTimeout?: number;
}

/** 批量加载时的公共配置和回调。 */
export interface WindFieldLoadOptions {
  /** 单任务兼容 key，批量加载时通常由 frame.key 提供。 */
  key?: string;
  /** 本次加载覆盖默认 Worker 地址。 */
  workerUrl?: string;
  /** 本次加载覆盖默认 Worker 数量。 */
  workerCount?: number;
  /** 默认数据类型。 */
  dataType?: string;
  /** 单任务兼容数据地址。 */
  dataUrl?: string;
  /** 默认解析方式。 */
  parsType?: number;
  /** 默认缓存策略。 */
  cacheType?: number;
  /** 用于生成缺省任务 key 的模型编码。 */
  modelCode?: string;
  /** 任意一帧完成后立即触发，适合边下载边交给播放策略。 */
  onFrameLoaded?: WindFrameLoadedCallback;
  /** 每完成一个任务后触发，参数包含总数、成功数和失败数。 */
  onProgress?: DataManagerCallback;
  /** 全部任务回调完成后触发，参数是最终汇总结果。 */
  onCompleted?:
    | ((result: WindLoadResult) => void)
    | DataManagerCallbackDelegate
    | null;
}

/**
 * DataManager 的普通 script 代码声明了这些全局类。
 *
 * 这里仅补充 TypeScript 编译所需的声明，不会在浏览器中重复创建它们。
 */
declare const NLoadTask: Constructor<NLoadTaskLike>;
declare const NLoadInfo: Constructor<NLoadInfoLike>;
declare const NCachedDataType: Record<string, string>;
declare const NDataParsType: Record<string, number>;
declare const NCacheType: Record<string, number>;

// 兼容两种回调写法：普通函数，以及 greater-area 中使用的 NCallbackDelegate。
function callCallback(
  callback:
    | ((...args: any[]) => void)
    | DataManagerCallbackDelegate
    | null
    | undefined,
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

function getGlobalValue(name: string): unknown {
  return (globalThis as unknown as Record<string, unknown>)[name];
}

function getGlobalDataManager(): DataManagerLike | null {
  const manager = getGlobalValue("DataManager");
  return manager ? (manager as DataManagerLike) : null;
}

// 从普通 script 暴露的全局作用域中取得 DataManager 的任务类。
// 保留后面的直接变量判断，是为了兼容 class 声明没有挂到 globalThis 属性上的情况。
function resolveConstructor<T>(
  name: string,
  fallback: Constructor<T> | null = null,
): Constructor<T> | null {
  const globalConstructor = getGlobalValue(name);
  if (typeof globalConstructor === "function") {
    return globalConstructor as Constructor<T>;
  }

  return fallback;
}

// 读取 DataManager 中定义的枚举值。
// 模块代码加载时可能早于普通 script，因此找不到枚举时使用与项目一致的兜底值。
function resolveStaticValue(
  typeName: "NCachedDataType" | "NDataParsType" | "NCacheType",
  valueName: string,
  fallback: string | number,
): string | number {
  let source = getGlobalValue(typeName);
  if (!source) {
    if (typeName === "NCachedDataType" && typeof NCachedDataType !== "undefined") {
      source = NCachedDataType;
    }
    if (typeName === "NDataParsType" && typeof NDataParsType !== "undefined") {
      source = NDataParsType;
    }
    if (typeName === "NCacheType" && typeof NCacheType !== "undefined") {
      source = NCacheType;
    }
  }

  if (source && (typeof source === "object" || typeof source === "function")) {
    const value = (source as Record<string, unknown>)[valueName];
    if (value !== undefined && value !== null) {
      return value as string | number;
    }
  }

  return fallback;
}

/**
 * 只输出数据的结构摘要，避免控制台直接展开几十万条 U/V 数值。
 */
function summarizeValue(value: unknown): Record<string, unknown> {
  if (Array.isArray(value)) {
    return {
      type: "array",
      length: value.length,
      firstItem: value.length > 0 ? summarizeValue(value[0]) : null,
    };
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const summary: Record<string, unknown> = {
      type: "object",
      keys: Object.keys(record),
    };

    if (Array.isArray(record.data)) {
      summary.dataLength = record.data.length;
    }
    if (record.header && typeof record.header === "object") {
      const header = record.header as Record<string, unknown>;
      summary.header = {
        parameterNumber: header.parameterNumber,
        comment: header.GRIB_COMMENT,
        nx: header.nx,
        ny: header.ny,
      };
    }
    return summary;
  }

  return {
    type: typeof value,
    value,
  };
}

// NLoadManager 的成功回调结构是：
// { key, dataType, data: workerMessage }，而 workerMessage 中才包含 frameData。
// 这里统一把不同来源（首次下载或 IndexedDB 缓存）的结果转换成真正的风场数据。
export function extractWorkerData(
  result: DataManagerResult | null | undefined,
): unknown {
  console.log(
    "[WindFieldDataLoader] 收到 DataManager 结果",
    {
      key: result?.key,
      dataType: result?.dataType,
      resultKeys: result ? Object.keys(result) : [],
      dataSummary: summarizeValue(result?.data),
    },
  );
  if (!result || result.data === null || result.data === undefined) {
    console.warn(
      "[WindFieldDataLoader] DataManager 返回空数据",
      result?.key,
    );
    return null;
  }

  const payload = result.data;
  if (!payload || typeof payload !== "object") {
    console.log(
      "[WindFieldDataLoader] 使用基础类型作为风场数据",
      summarizeValue(payload),
    );
    return payload;
  }

  const payloadRecord = payload as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(payloadRecord, "frameData")) {
    console.log(
      "[WindFieldDataLoader] 从 frameData 字段提取风场数据",
      summarizeValue(payloadRecord.frameData),
    );
    return payloadRecord.frameData;
  }

  if (payloadRecord.msg === "error") {
    console.warn(
      "[WindFieldDataLoader] Worker 返回错误消息",
      result.key,
    );
    return null;
  }

  const { msg: _msg, loadInfo: _loadInfo, ...frameData } = payloadRecord;
  console.log(
    "[WindFieldDataLoader] 从 Worker 包装对象中提取风场数据",
    summarizeValue(frameData),
  );
  return frameData;
}

/**
 * 风场数据加载器。
 *
 * 这个类只负责“如何下载数据”，不负责创建 Cesium 风场图层，也不负责播放帧。
 *
 * 数据流如下：
 * 1. 等待 window.DataManager 初始化完成；
 * 2. 按 greater-area 的方式创建 NLoadTask 和 NLoadInfo；
 * 3. 把风场专用 Worker 地址交给 DataManager；
 * 4. 调用 DataManager.loadDatas(tasks) 下载数据；
 * 5. 收集每个任务的回调，并返回统一的加载结果。
 */
export default class WindFieldDataLoader {
  /** 当前使用的全局 DataManager。 */
  dataManager: DataManagerLike | null;
  /** 默认风场 Worker 地址。 */
  workerUrl: string;
  /** 默认 Worker 并发数量。 */
  workerCount: number;
  /** 等待 DataManager 初始化的最长时间，单位为毫秒。 */
  readyTimeout: number;
  /** 共享的 DataManager 初始化等待 Promise，避免重复轮询。 */
  private _readyPromise: Promise<DataManagerLike> | null;
  /** 是否已经释放加载器。 */
  private _disposed: boolean;

  /**
   * @param options 配置项。
   * @param options.dataManager 可选，便于测试或手动传入 DataManager。
   * @param options.workerUrl 风场 Worker 地址。
   * @param options.workerCount Worker 并发数量。
   * @param options.readyTimeout 等待全局 DataManager 初始化的超时时间。
   */
  constructor(options: WindFieldDataLoaderOptions = {}) {
    this.dataManager = options.dataManager || getGlobalDataManager();
    this.workerUrl =
      options.workerUrl || "./dataManager/workers/wind_field_worker.js";
    this.workerCount = Number.isFinite(Number(options.workerCount))
      ? Number(options.workerCount)
      : 1;
    this.readyTimeout = Number.isFinite(Number(options.readyTimeout))
      ? Number(options.readyTimeout)
      : 15000;
    this._readyPromise = null;
    this._disposed = false;

    console.log("[WindFieldDataLoader] 创建加载器", {
      workerUrl: this.workerUrl,
      workerCount: this.workerCount,
      readyTimeout: this.readyTimeout,
      hasDataManager: Boolean(this.dataManager),
    });
  }

  /**
   * 兼容旧的“单个序列文件”调用方式。
   *
   * 当前 demo 使用 `loadFrames` 为每一个时次提交一个独立 JSON 文件；
   * 该方法保留是为了不破坏原有调用方。
   *
   * @param dataUrl 单个序列文件地址。
   * @param options 数据类型、解析方式、缓存策略和回调配置。
   */
  async loadSequence(
    dataUrl: string,
    options: WindFieldLoadOptions = {},
  ): Promise<unknown> {
    console.log("[WindFieldDataLoader] 开始加载序列文件", {
      dataUrl,
      key: options.key,
    });
    if (!dataUrl) {
      throw new Error("Wind sequence dataUrl is required.");
    }

    const result = await this.loadFrames(
      [
        {
          key: options.key || `wind-sequence-${dataUrl}`,
          dataUrl,
          dataType: options.dataType,
          parsType: options.parsType,
          cacheType:
            options.cacheType ??
            Number(resolveStaticValue("NCacheType", "OnlyIndexDB", 1)),
          payloadType: "wind-sequence",
        },
      ],
      options,
    );

    if (result.failed > 0 || !result.items[0]) {
      const error = result.errors[0]?.error;
      throw error || new Error("Wind sequence loading failed.");
    }

    console.log("[WindFieldDataLoader] 序列文件加载完成", {
      total: result.total,
      success: result.success,
      failed: result.failed,
      dataSummary: summarizeValue(result.items[0].data),
    });
    return result.items[0].data;
  }

  /**
   * 按 greater-area 的 DataManager 协议并行加载多个风场时次。
   *
   * 注意：本类只负责下载和汇总结果，时间等业务信息仍来自 frameList，
   * 不会被写入或依赖风场 JSON 文件内部。
   *
   * @param frameList 每个元素代表一个需要加载的风场时次。
   * @param options 本次批量加载的 Worker、解析、缓存和回调配置。
   */
  async loadFrames(
    frameList: WindFrameRequest[],
    options: WindFieldLoadOptions = {},
  ): Promise<WindLoadResult> {
    console.log("[WindFieldDataLoader] 开始批量加载风场时次", {
      total: Array.isArray(frameList) ? frameList.length : null,
      keys: Array.isArray(frameList)
        ? frameList.map((frame) => frame.key)
        : [],
      frameList, options
    });
    if (!Array.isArray(frameList)) {
      throw new TypeError("frameList must be an array.");
    }
    if (this._disposed) {
      throw new Error("WindFieldDataLoader has been disposed.");
    }

    // DataManager 的 IndexedDB 尚未初始化完成时不能提交任务。
    const manager = await this.#waitForDataManager();
    console.log("[WindFieldDataLoader] DataManager 已准备完成", {
      initCompleted: manager.initCompleted,
      workerUrl: manager.WorkerUrl,
      workerCount: manager.WorkerCount,
    });
    this.#configureManager(manager, options);

    if (frameList.length === 0) {
      const emptyResult: WindLoadResult = {
        total: 0,
        completed: 0,
        success: 0,
        failed: 0,
        items: [],
        errors: [],
        ready: true,
      };
      console.log("[WindFieldDataLoader] 没有待加载任务，直接完成", emptyResult);
      callCallback(options.onCompleted, this, [emptyResult]);
      return emptyResult;
    }

    // NLoadTask/NLoadInfo 来自 public/dataManager/datamanager.js，
    // 不是当前 Vue 模块导入的类。
    const TaskClass = resolveConstructor<NLoadTaskLike>(
      "NLoadTask",
      typeof NLoadTask === "function" ? NLoadTask : null,
    );
    const InfoClass = resolveConstructor<NLoadInfoLike>(
      "NLoadInfo",
      typeof NLoadInfo === "function" ? NLoadInfo : null,
    );
    if (!TaskClass || !InfoClass) {
      throw new Error("NLoadTask/NLoadInfo are not available.");
    }

    const tasks = frameList.map((frame, index) =>
      this.#createTask(TaskClass, InfoClass, frame, index, options),
    );

    console.log("[WindFieldDataLoader] 已创建 DataManager 任务", {
      taskCount: tasks.length,
      tasks: tasks.map((task) => ({
        taskKey: task.key,
        loadKey: task.loadInfo?.key,
        dataType: task.loadInfo?.dataType,
        dataUrl: task.loadInfo?.dataUrl,
      })),
    });

    return new Promise<WindLoadResult>((resolve, reject) => {
      const completedIndexes = new Set<number>();
      const items: Array<WindLoadItem | undefined> = [];
      const errors: WindLoadResult["errors"] = [];
      let completed = 0;
      let success = 0;
      let failed = 0;

      // DataManager 的任务回调可能来自 Worker，也可能来自缓存回读。
      // 两种结果都在这里统一计数和整理，业务层不需要关心数据来源。
      const finishTask = (
        index: number,
        result: DataManagerResult | null,
      ): void => {
        console.log("[WindFieldDataLoader] 单个任务回调触发", {
          index,
          frameKey: frameList[index]?.key,
          resultKey: result?.key,
          resultDataType: result?.dataType,
        });
        // 防止同一个任务重复回调导致计数错误或 Promise 重复完成。
        if (completedIndexes.has(index)) {
          console.warn("[WindFieldDataLoader] 忽略重复任务回调", { index });
          return;
        }
        completedIndexes.add(index);

        const frame = frameList[index];
        const loadedData = extractWorkerData(result);
        const item: WindLoadItem = {
          index,
          key: result?.key || frame.key || null,
          dataType: result?.dataType || frame.dataType || null,
          data: loadedData,
          rawData: result || null,
          frame,
        };
        const isSuccess = loadedData !== null && loadedData !== undefined;
        console.log("[WindFieldDataLoader] 单个任务数据解析完成", {
          index,
          key: item.key,
          success: isSuccess,
          dataSummary: summarizeValue(loadedData),
        });

        items[index] = item;
        // 先把当前帧交给业务层，再等待其他帧完成。
        // 这和 greater-area 的 loadChanged -> addFrameData 链路一致。
        callCallback(options.onFrameLoaded, this, [item]);
        completed += 1;
        if (isSuccess) {
          success += 1;
        } else {
          failed += 1;
          errors.push({
            index,
            key: item.key,
            error: new Error(`Wind data task failed: ${item.key}`),
            result,
          });
        }

        const progress = {
          total: frameList.length,
          completed,
          success,
          failed,
          index,
          item,
        };
        console.log("[WindFieldDataLoader] 更新加载进度", {
          total: progress.total,
          completed: progress.completed,
          success: progress.success,
          failed: progress.failed,
          index: progress.index,
          key: progress.item.key,
          dataSummary: summarizeValue(progress.item.data),
        });
        callCallback(options.onProgress, this, [progress]);

        if (completed !== frameList.length) return;

        const finalResult: WindLoadResult = {
          total: frameList.length,
          completed,
          success,
          failed,
          items,
          errors,
          ready: failed === 0,
        };
        console.log("[WindFieldDataLoader] 全部风场时次加载完成", {
          total: finalResult.total,
          completed: finalResult.completed,
          success: finalResult.success,
          failed: finalResult.failed,
          ready: finalResult.ready,
        });
        callCallback(options.onCompleted, this, [finalResult]);
        resolve(finalResult);
      };

      tasks.forEach((task, index) => {
        task.TaskCallback = (result) => finishTask(index, result);
      });
      console.log("[WindFieldDataLoader] 已绑定任务回调，提交给 DataManager");

      try {
        // loadDatas 会接管并清空 tasks 数组；任务完成后通过 TaskCallback 返回数据。
        manager.loadDatas(tasks);
        console.log("[WindFieldDataLoader] DataManager.loadDatas 已调用");
      } catch (error) {
        console.error("[WindFieldDataLoader] 调用 DataManager.loadDatas 失败", error);
        reject(error);
      }
    });
  }

  /** 清空 DataManager 中尚未开始的风场下载任务。 */
  clear(): void {
    console.log("[WindFieldDataLoader] 清理待执行下载任务");
    if (
      this.dataManager &&
      typeof this.dataManager.clearLoadTasks === "function"
    ) {
      this.dataManager.clearLoadTasks();
    }
  }

  /** 释放加载器；释放后不能再次提交风场任务。 */
  dispose(): void {
    console.log("[WindFieldDataLoader] 释放加载器");
    this.clear();
    this.dataManager = null;
    this._disposed = true;
    this._readyPromise = null;
  }

  /**
   * 创建 DataManager 需要的任务对象。
   *
   * NLoadInfo 描述“下载什么”，NLoadTask 描述“如何追踪这次下载”。
   * task.key 必须与 loadInfo.dataType 一起组成 DataManager 的任务唯一键。
   */
  #createTask(
    TaskClass: Constructor<NLoadTaskLike>,
    InfoClass: Constructor<NLoadInfoLike>,
    frame: WindFrameRequest,
    index: number,
    options: WindFieldLoadOptions,
  ): NLoadTaskLike {
    const task = new TaskClass();
    const loadInfo = new InfoClass();
    const dataType = String(
      frame.dataType ||
        options.dataType ||
        resolveStaticValue("NCachedDataType", "Data_2d", "data_2d"),
    );
    const key = frame.key || `${options.modelCode || "wind"}_${index}`;

    Object.assign(loadInfo, frame.loadInfo || {});
    loadInfo.key = key;
    loadInfo.dataType = dataType;
    loadInfo.dataUrl = frame.dataUrl || options.dataUrl || loadInfo.dataUrl;
    loadInfo.parsType =
      frame.parsType ??
      options.parsType ??
      Number(resolveStaticValue("NDataParsType", "linePos", 0));
    if (frame.cacheType !== undefined) loadInfo.cacheType = frame.cacheType;
    if (frame.payloadType) loadInfo.payloadType = frame.payloadType;
    if (frame.frameIndex !== undefined) loadInfo.frameIndex = frame.frameIndex;

    if (!loadInfo.dataUrl) {
      throw new Error(`Wind dataUrl is required for task ${key}.`);
    }

    task.loadInfo = loadInfo;
    task.key = `${dataType}_${key}`;
    console.log("[WindFieldDataLoader] 创建任务详情", {
      index,
      taskKey: task.key,
      key,
      dataType,
      dataUrl: loadInfo.dataUrl,
      parsType: loadInfo.parsType,
      cacheType: loadInfo.cacheType,
    });
    return task;
  }

  // 全局 DataManager 默认可能仍使用 flow_worker.js，
  // 风场加载前需要把它切换为风场专用 Worker。
  #configureManager(
    manager: DataManagerLike,
    options: WindFieldLoadOptions,
  ): void {
    const workerUrl = options.workerUrl || this.workerUrl;
    const workerCount = Number.isFinite(Number(options.workerCount))
      ? Number(options.workerCount)
      : this.workerCount;

    console.log("[WindFieldDataLoader] 配置 DataManager", {
      workerUrl,
      workerCount,
    });

    if (workerUrl) {
      if (typeof manager.setWorkerUrl === "function") {
        manager.setWorkerUrl(workerUrl);
      } else {
        manager.WorkerUrl = workerUrl;
      }
    }

    if (Number.isFinite(workerCount) && workerCount > 0) {
      if (typeof manager.setWorkerCount === "function") {
        manager.setWorkerCount(workerCount);
      } else {
        manager.WorkerCount = workerCount;
      }
    }
  }

  // index.html 中的 init() 会异步初始化 IndexedDB。
  // 多次调用只共用一个 Promise，避免重复等待或重复初始化判断。
  #waitForDataManager(): Promise<DataManagerLike> {
    if (this._readyPromise) return this._readyPromise;

    this._readyPromise = new Promise<DataManagerLike>((resolve, reject) => {
      const start = Date.now();
      const timer = globalThis.setInterval(() => {
        const manager = this.dataManager || getGlobalDataManager();
        if (manager) {
          this.dataManager = manager;
          if (manager.initCompleted) {
            globalThis.clearInterval(timer);
            console.log("[WindFieldDataLoader] 检测到 DataManager.initCompleted");
            resolve(manager);
            return;
          }
        }

        if (Date.now() - start >= this.readyTimeout) {
          globalThis.clearInterval(timer);
          console.error("[WindFieldDataLoader] 等待 DataManager 初始化超时", {
            readyTimeout: this.readyTimeout,
          });
          reject(new Error("window.DataManager did not finish initialization."));
        }
      }, 50);
    });

    return this._readyPromise;
  }
}
