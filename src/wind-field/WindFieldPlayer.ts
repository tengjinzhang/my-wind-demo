import WindFieldDataLoader, {
  type DataManagerLike,
  type WindFieldDataLoaderOptions,
  type WindFieldLoadOptions,
  type WindFrameRequest,
  type WindLoadItem,
  type WindLoadResult,
} from "./WindFieldDataLoader";
import WindFieldLayer, {
  type CesiumWindLike,
  type WindFieldConfig,
} from "./WindFieldLayer";
import WindFieldFrameStrategy, {
  type WindFieldFrameStrategyOptions,
} from "./WindFieldFrameStrategy";
import WindFieldPlaybackController from "./WindFieldPlaybackController";

/** 一帧加载完成后的进度信息。 */
export interface WindFieldPlayerProgress {
  /** 本次加载任务总数，也就是总帧数。 */
  total: number;
  /** 已经收到回调的任务数量，包括成功和失败。 */
  completed: number;
  /** 已经成功解析出风场数据的帧数。 */
  success: number;
  /** 没有拿到有效风场数据的帧数。 */
  failed: number;
  /** 本次刚刚完成的帧在 frameList 中的索引。 */
  index: number;
  /** 本次完成任务对应的统一风场结果。 */
  item: WindLoadItem;
}

/** 门面对外暴露的播放状态。 */
export interface WindFieldPlayerState {
  /** 门面的生命周期状态。 */
  status: "idle" | "loading" | "ready" | "playing" | "paused" | "finished" | "error" | "disposed";
  /** 是否正在等待数据加载完成。 */
  isLoading: boolean;
  /** 是否已经具备完整可播放的数据。 */
  isReady: boolean;
  /** 是否正在按时序自动切换帧。 */
  isPlaying: boolean;
  /** 当前加载批次的总帧数。 */
  total: number;
  /** 当前已经完成回调的帧数。 */
  completed: number;
  /** 当前成功加载的帧数。 */
  success: number;
  /** 当前失败的帧数。 */
  failed: number;
  /** 当前正在显示的帧索引，从 0 开始。 */
  currentIndex: number;
  /** 当前帧的业务时间，来自 frameList，而不是风场 JSON。 */
  currentTime: string | null;
  /** 最近一次加载或播放错误。 */
  error: Error | null;
}

/** WindFieldPlayer 的公共事件回调。 */
export interface WindFieldPlayerCallbacks {
  /** 某一帧下载并解析完成后触发。 */
  onFrameLoaded?: (item: WindLoadItem) => void;
  /** 每完成一帧后触发，用于更新进度条或状态文字。 */
  onProgress?: (progress: WindFieldPlayerProgress) => void;
  /** 全部帧完成后触发，无论是否存在失败帧。 */
  onCompleted?: (result: WindLoadResult) => void;
  /** 当前显示帧发生变化时触发。 */
  onFrameChanged?: (index: number, frame: WindFrameRequest | undefined) => void;
  /** 播放状态从播放变为暂停，或从暂停变为播放时触发。 */
  onPlayingChanged?: (playing: boolean) => void;
  /** 自然播放到最后一帧并暂停时触发。 */
  onFinished?: () => void;
  /** 加载过程发生异常或出现失败帧时触发。 */
  onError?: (error: Error) => void;
}

/** 创建门面时使用的配置。 */
export interface WindFieldPlayerOptions extends WindFieldPlayerCallbacks {
  /** 外部创建的 Cesium Viewer，门面不会负责销毁它。 */
  viewer: unknown;
  /** cesium-wind 全局对象；不传时由 WindFieldLayer 尝试读取全局值。 */
  CesiumWind?: CesiumWindLike | null;
  /** 风场专用 Worker 地址。 */
  workerUrl?: string;
  /** DataManager 同时处理的 Worker 数量。 */
  workerCount?: number;
  /** 等待全局 DataManager 初始化完成的最长时间，单位为毫秒。 */
  readyTimeout?: number;
  /** 两帧之间的播放间隔，单位为毫秒。 */
  frameInterval?: number;
  /** 当前模型、场次或业务数据的标识。 */
  modelCode?: string;
  /** 创建 WindFieldLayer 时使用的初始风场显示参数。 */
  windOptions?: Partial<WindFieldConfig>;
  /** 可选的 DataManager 实例，主要用于测试或特殊运行环境。 */
  dataManager?: DataManagerLike | null;
}

/** load() 可以覆盖的任务配置和回调。 */
export type WindFieldPlayerLoadOptions = Partial<
  Pick<
    WindFieldLoadOptions,
    | "workerUrl"
    | "workerCount"
    | "dataType"
    | "dataUrl"
    | "parsType"
    | "cacheType"
    | "modelCode"
  >
> &
  WindFieldPlayerCallbacks;

/**
 * 风场播放门面。
 *
 * 业务层只需要创建一个 WindFieldPlayer，就可以完成风场数据加载、
 * 单帧接入、播放控制和 CesiumWind 图层管理。DataManager、策略类、
 * 播放控制器和图层类都被收拢在门面内部，避免页面直接拼装多个对象。
 */
export default class WindFieldPlayer {
  /** 外部传入的 Cesium Viewer，只保存引用，不负责 destroy。 */
  private readonly viewer: unknown;
  /** 当前风场模型或场次编码。 */
  private readonly modelCode: string;
  /** 默认 Worker 地址，load() 未覆盖时使用。 */
  private readonly defaultWorkerUrl: string;
  /** 默认 Worker 并发数量。 */
  private readonly defaultWorkerCount: number;
  /** 默认帧间隔，单位为毫秒。 */
  private readonly defaultFrameInterval: number;
  /** 门面需要向外转发的事件回调。 */
  private readonly callbacks: WindFieldPlayerCallbacks;
  /** 内部数据加载器。 */
  private readonly loader: WindFieldDataLoader;
  /** 内部 CesiumWind 图层包装类。 */
  private readonly layer: WindFieldLayer;
  /** 当前唯一的风场帧播放策略。 */
  private readonly strategy: WindFieldFrameStrategy;
  /** 内部时序播放控制器。 */
  private playbackController: WindFieldPlaybackController;
  /** 当前加载批次的业务帧清单，包含时间和数据地址等元数据。 */
  private frames: WindFrameRequest[];
  /** 是否已经执行 dispose()。 */
  private disposed: boolean;
  /** 当前加载批次编号，用于忽略旧任务的异步回调。 */
  private loadToken: number;

  /** 供页面读取的当前状态快照。每次状态变化都会原地更新。 */
  readonly state: WindFieldPlayerState;

  /**
   * 创建风场播放门面。
   *
   * 构造阶段只组装内部对象，不会自动下载数据；真正加载数据需要调用 load()。
   *
   * @param options 门面运行所需的 Viewer、Worker、图层配置和事件回调。
   */
  constructor(options: WindFieldPlayerOptions) {
    if (!options || !options.viewer) {
      throw new Error("WindFieldPlayer requires a Cesium viewer instance.");
    }

    this.viewer = options.viewer;
    this.modelCode = options.modelCode || "wind";
    this.defaultWorkerUrl =
      options.workerUrl || "./dataManager/workers/wind_field_worker.js";
    this.defaultWorkerCount = Number.isFinite(Number(options.workerCount))
      ? Number(options.workerCount)
      : 1;
    this.defaultFrameInterval = Math.max(
      16,
      Number(options.frameInterval) || 2000,
    );
    this.callbacks = {
      onFrameLoaded: options.onFrameLoaded,
      onProgress: options.onProgress,
      onCompleted: options.onCompleted,
      onFrameChanged: options.onFrameChanged,
      onPlayingChanged: options.onPlayingChanged,
      onFinished: options.onFinished,
      onError: options.onError,
    };
    this.frames = [];
    this.disposed = false;
    this.loadToken = 0;
    this.state = {
      status: "idle",
      isLoading: false,
      isReady: false,
      isPlaying: false,
      total: 0,
      completed: 0,
      success: 0,
      failed: 0,
      currentIndex: 0,
      currentTime: null,
      error: null,
    };

    this.layer = new WindFieldLayer({
      viewer: options.viewer,
      CesiumWind: options.CesiumWind,
      windOptions: options.windOptions,
    });
    this.strategy = new WindFieldFrameStrategy({
      viewer: options.viewer,
      windLayer: this.layer,
      modelCode: this.modelCode,
    } satisfies WindFieldFrameStrategyOptions);
    this.loader = new WindFieldDataLoader({
      dataManager: options.dataManager,
      workerUrl: this.defaultWorkerUrl,
      workerCount: this.defaultWorkerCount,
      readyTimeout: options.readyTimeout,
    } satisfies WindFieldDataLoaderOptions);
    this.playbackController = this.#createPlaybackController();
  }

  /**
   * 加载一组风场时次。
   *
   * 每个 JSON 文件被视为一帧。某一帧下载完成后，门面会立即调用
   * WindFieldFrameStrategy.addFrameData()，不会等全部任务结束才批量添加。
   *
   * @param frameList 按播放顺序排列的风场时次清单。
   * @param options 本次加载覆盖的 Worker、解析参数和回调配置。
   */
  async load(
    frameList: WindFrameRequest[],
    options: WindFieldPlayerLoadOptions = {},
  ): Promise<WindLoadResult> {
    this.#assertUsable();
    if (!Array.isArray(frameList)) {
      throw new TypeError("frameList must be an array.");
    }

    const token = ++this.loadToken;
    this.#resetForLoad(frameList);
    this.#updateState({
      status: "loading",
      isLoading: true,
      isReady: false,
      isPlaying: false,
      error: null,
      total: frameList.length,
      completed: 0,
      success: 0,
      failed: 0,
      currentIndex: 0,
      currentTime: null,
    });

    const onFrameLoaded = options.onFrameLoaded || this.callbacks.onFrameLoaded;
    const onProgress = options.onProgress || this.callbacks.onProgress;
    const onCompleted = options.onCompleted || this.callbacks.onCompleted;
    const onError = options.onError || this.callbacks.onError;

    try {
      const result = await this.loader.loadFrames(frameList, {
        ...options,
        workerUrl: options.workerUrl || this.defaultWorkerUrl,
        workerCount: options.workerCount || this.defaultWorkerCount,
        modelCode: options.modelCode || this.modelCode,
        onFrameLoaded: (item) => {
          if (token !== this.loadToken || this.disposed) return;

          this.#handleFrameLoaded(item);
          onFrameLoaded?.(item);
        },
        onProgress: (progress) => {
          if (token !== this.loadToken || this.disposed) return;

          const normalized = progress as unknown as WindFieldPlayerProgress;
          this.#updateState({
            completed: normalized.completed,
            success: normalized.success,
            failed: normalized.failed,
          });
          onProgress?.(normalized);
        },
        onCompleted: (completedResult) => {
          if (token !== this.loadToken || this.disposed) return;

          this.#handleCompleted(completedResult);
          onCompleted?.(completedResult);
        },
      });

      if (token !== this.loadToken || this.disposed) return result;

      if (result.failed > 0) {
        const error = result.errors[0]?.error || new Error("Wind data loading failed.");
        this.#setError(error, onError);
      }

      return result;
    } catch (error) {
      if (token === this.loadToken && !this.disposed) {
        this.#setError(error, onError);
      }
      throw error;
    }
  }

  /** 开始或恢复播放；自然播放完成后再次调用会从第一帧开始。 */
  play(): boolean {
    this.#assertUsable();
    if (!this.state.isReady) return false;
    return this.playbackController.play();
  }

  /** 暂停播放并保留当前帧。 */
  pause(): void {
    if (this.disposed) return;
    this.playbackController.pause();
  }

  /** 从第一帧重新播放。 */
  restart(): boolean {
    this.#assertUsable();
    if (!this.state.isReady) return false;
    return this.playbackController.restart();
  }

  /** 跳到第一帧。 */
  first(): boolean {
    return this.#seek(() => this.playbackController.first());
  }

  /** 跳到上一帧。 */
  previous(): boolean {
    return this.#seek(() => this.playbackController.previous());
  }

  /** 跳到下一帧。 */
  next(): boolean {
    return this.#seek(() => this.playbackController.next());
  }

  /** 跳到最后一帧。 */
  last(): boolean {
    return this.#seek(() => this.playbackController.last());
  }

  /**
   * 跳到指定索引的帧。
   *
   * @param index 目标帧索引，从 0 开始；超出范围时会被限制到合法范围。
   */
  seek(index: number): boolean {
    return this.#seek(() => this.playbackController.seek(index));
  }

  /**
   * 修改帧间隔；播放中会立即使用新间隔。
   *
   * @param interval 两帧之间的时间间隔，单位为毫秒，最小值为 16。
   */
  setFrameInterval(interval: number): void {
    if (this.disposed) return;
    this.playbackController.setFrameInterval(interval);
  }

  /** 显示风场图层，但不改变时序帧索引。 */
  show(): void {
    if (this.disposed) return;
    this.strategy.setVisible(true);
  }

  /** 隐藏风场图层，但不清空已经加载的帧。 */
  hide(): void {
    if (this.disposed) return;
    this.strategy.setVisible(false);
  }

  /** 移除当前 CesiumWind 图层，之后显示帧时可以重新创建。 */
  removeLayer(): void {
    if (this.disposed) return;
    this.layer.removeWindLayer();
  }

  /** 清空帧数据和待加载任务，但保留门面和 Viewer。 */
  clear(): void {
    if (this.disposed) return;
    ++this.loadToken;
    this.playbackController.pause();
    this.loader.clear();
    this.strategy.clear();
    this.frames = [];
    this.playbackController = this.#createPlaybackController();
    this.#updateState({
      status: "idle",
      isLoading: false,
      isReady: false,
      isPlaying: false,
      total: 0,
      completed: 0,
      success: 0,
      failed: 0,
      currentIndex: 0,
      currentTime: null,
      error: null,
    });
  }

  /** 获取内部风场图层，供参数控制和图层控制组件使用。 */
  getLayer(): WindFieldLayer {
    return this.layer;
  }

  /** 获取当前策略对象；一般业务代码不需要直接调用它。 */
  getStrategy(): WindFieldFrameStrategy {
    return this.strategy;
  }

  /** 释放门面内部资源，但不会销毁外部传入的 Cesium Viewer。 */
  dispose(): void {
    if (this.disposed) return;
    ++this.loadToken;
    this.playbackController.dispose();
    this.loader.dispose();
    this.strategy.dispose();
    this.frames = [];
    this.disposed = true;
    this.#updateState({
      status: "disposed",
      isLoading: false,
      isReady: false,
      isPlaying: false,
    });
  }

  /**
   * 创建内部播放控制器，并把帧显示动作委托给当前策略。
   *
   * 播放控制器不保存风场数据，只负责索引、定时器和播放状态；
   * 因此这里通过回调把真正的显示动作连接到 strategy.showFrameData()。
   */
  #createPlaybackController(): WindFieldPlaybackController {
    return new WindFieldPlaybackController({
      getFrameCount: () => this.frames.length,
      showFrame: (index) => this.strategy.showFrameData(index),
      showLayer: () => this.strategy.setVisible(true),
      onFrameChanged: (index) => {
        const frame = this.frames[index];
        this.#updateState({
          currentIndex: index,
          currentTime: frame?.time ? String(frame.time) : null,
        });
        this.callbacks.onFrameChanged?.(index, frame);
      },
      onPlayingChanged: (playing) => {
        this.#updateState({
          isPlaying: playing,
          status: playing ? "playing" : this.state.status === "finished" ? "finished" : "paused",
        });
        this.callbacks.onPlayingChanged?.(playing);
      },
      onFinished: () => {
        this.#updateState({
          isPlaying: false,
          status: "finished",
        });
        this.callbacks.onFinished?.();
      },
      frameInterval: this.defaultFrameInterval,
    });
  }

  /**
   * 为新一轮加载清理旧状态。
   *
   * @param frameList 新一轮加载的业务时次清单。
   */
  #resetForLoad(frameList: WindFrameRequest[]): void {
    this.playbackController.pause();
    this.strategy.clear();
    this.loader.clear();
    this.frames = frameList.slice();
    this.playbackController = this.#createPlaybackController();
  }

  /**
   * 把加载器返回的单帧结果转换成策略需要的帧记录。
   *
   * @param item DataManager 任务完成后整理出的单帧结果。
   */
  #handleFrameLoaded(item: WindLoadItem): void {
    if (item.data === null || item.data === undefined) return;

    this.strategy.addFrameData(item.data, {
      index: item.index,
      key: item.key,
      time: item.frame.time ? String(item.frame.time) : null,
      dataType: item.dataType,
      show: false,
    });
  }

  /**
   * 处理整批任务完成事件，并在成功时只显示首帧、不自动播放。
   *
   * @param result 本轮加载的最终汇总结果。
   */
  #handleCompleted(result: WindLoadResult): void {
    this.#updateState({
      status: result.failed > 0 ? "error" : "paused",
      isLoading: false,
      isReady: result.failed === 0 && result.success > 0,
      isPlaying: false,
      total: result.total,
      completed: result.completed,
      success: result.success,
      failed: result.failed,
    });

    // 加载完成只展示首帧，不自动播放。
    if (result.failed === 0 && result.success > 0) {
      this.playbackController.first();
    }
  }

  /** 执行一次跳帧动作，并统一拦截未就绪或已销毁状态。 */
  #seek(action: () => boolean): boolean {
    if (this.disposed || !this.state.isReady) return false;
    return action();
  }

  /** 统一把未知错误转换成 Error，并同步状态和错误回调。 */
  #setError(error: unknown, onError?: (error: Error) => void): void {
    const normalized = error instanceof Error ? error : new Error(String(error));
    this.#updateState({
      status: "error",
      isLoading: false,
      isReady: false,
      isPlaying: false,
      error: normalized,
    });
    onError?.(normalized);
  }

  /** 只更新传入的状态字段，保留其他状态值。 */
  #updateState(patch: Partial<WindFieldPlayerState>): void {
    Object.assign(this.state, patch);
  }

  /** 检查门面是否仍可用，防止销毁后继续提交任务或播放。 */
  #assertUsable(): void {
    if (this.disposed) {
      throw new Error("WindFieldPlayer has been disposed.");
    }
  }
}

export { WindFieldPlayer };
