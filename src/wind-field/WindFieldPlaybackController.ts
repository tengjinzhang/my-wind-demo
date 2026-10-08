/** 播放控制器的构造配置。 */
export interface WindFieldPlaybackControllerOptions {
  /** 动态返回当前可播放的帧数量，允许数据加载完成后再增加帧。 */
  getFrameCount: () => number;
  /** 显示指定帧，返回是否成功；真正的渲染由策略和图层完成。 */
  showFrame: (index: number) => boolean;
  /** 开始播放时显示并启动风场图层。 */
  showLayer?: () => void;
  /** 当前索引发生变化时通知外部。 */
  onFrameChanged?: (index: number) => void;
  /** 播放状态发生变化时通知外部。 */
  onPlayingChanged?: (playing: boolean) => void;
  /** 自然播放到最后一帧并暂停后的通知。 */
  onFinished?: () => void;
  /** 两帧之间的间隔，单位为毫秒，默认 2000。 */
  frameInterval?: number;
}

/**
 * 风场时序播放控制器。
 *
 * 该类只负责播放节奏和帧索引，不负责下载数据，也不负责创建图层。
 * 这样 App.vue 只需要把按钮事件转发给控制器即可。
 */
export default class WindFieldPlaybackController {
  /** 动态获取当前帧总数的函数。 */
  private readonly getFrameCount: () => number;
  /** 由策略实现的帧显示函数。 */
  private readonly showFrame: (index: number) => boolean;
  /** 开始播放时用于显示图层的函数。 */
  private readonly showLayer?: () => void;
  /** 帧索引变化回调。 */
  private readonly onFrameChanged?: (index: number) => void;
  /** 播放状态变化回调。 */
  private readonly onPlayingChanged?: (playing: boolean) => void;
  /** 自然播放完成回调。 */
  private readonly onFinished?: () => void;
  /** 浏览器定时器句柄。 */
  private timer: number | null;
  /** 是否已经销毁，销毁后不能再次播放。 */
  private disposed: boolean;
  /** 是否已经自然播放到最后一帧。 */
  private finished: boolean;

  /** 当前正在显示的帧索引。 */
  currentIndex: number;
  /** 当前是否正在自动播放。 */
  isPlaying: boolean;
  /** 两帧之间的播放间隔，单位为毫秒。 */
  frameInterval: number;

  /**
   * 创建播放控制器。
   *
   * @param options 帧数量、帧显示函数、回调函数和播放间隔配置。
   */
  constructor(options: WindFieldPlaybackControllerOptions) {
    this.getFrameCount = options.getFrameCount;
    this.showFrame = options.showFrame;
    this.showLayer = options.showLayer;
    this.onFrameChanged = options.onFrameChanged;
    this.onPlayingChanged = options.onPlayingChanged;
    this.onFinished = options.onFinished;
    this.timer = null;
    this.disposed = false;
    this.finished = false;
    this.currentIndex = 0;
    this.isPlaying = false;
    this.frameInterval = Math.max(16, Number(options.frameInterval) || 2000);
  }

  /** 开始或恢复时序播放。 */
  play(): boolean {
    if (this.disposed || this.getFrameCount() <= 0) return false;

    this.stopTimer();
    // 自然播放完成，或当前已经停在末帧时，重新从第一帧开始。
    if (this.finished || this.currentIndex >= this.getFrameCount() - 1) {
      this.currentIndex = 0;
    }
    this.finished = false;
    this.isPlaying = true;
    this.showLayer?.();
    this.onPlayingChanged?.(true);
    if (!this.seek(this.currentIndex)) {
      this.isPlaying = false;
      this.onPlayingChanged?.(false);
      return false;
    }
    this.timer = window.setInterval(() => this.tick(), this.frameInterval);
    return true;
  }

  /** 暂停时序播放，但保留当前帧和图层。 */
  pause(): void {
    this.stopTimer();
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.onPlayingChanged?.(false);
  }

  /** 从头播放。 */
  restart(): boolean {
    this.currentIndex = 0;
    return this.play();
  }

  /** 跳转到第一帧。 */
  first(): boolean {
    return this.seek(0);
  }

  /** 跳转到上一帧，首帧前循环到末帧。 */
  previous(): boolean {
    const count = this.getFrameCount();
    return this.seek(count > 0 ? (this.currentIndex - 1 + count) % count : 0);
  }

  /** 跳转到下一帧，末帧后循环到首帧。 */
  next(): boolean {
    const count = this.getFrameCount();
    return this.seek(count > 0 ? (this.currentIndex + 1) % count : 0);
  }

  /** 跳转到末帧。 */
  last(): boolean {
    return this.seek(this.getFrameCount() - 1);
  }

  /** 跳转到指定帧，播放中也可以调用。 */
  seek(index: number): boolean {
    const count = this.getFrameCount();
    if (this.disposed || count <= 0) return false;

    const nextIndex = Math.max(0, Math.min(Number(index) || 0, count - 1));
    if (!this.showFrame(nextIndex)) return false;

    this.currentIndex = nextIndex;
    this.finished = false;
    this.onFrameChanged?.(nextIndex);
    return true;
  }

  /**
   * 调整帧间隔；播放中会使用新的间隔重启定时器。
   *
   * @param interval 两帧之间的间隔，单位为毫秒，最小为 16。
   */
  setFrameInterval(interval: number): void {
    this.frameInterval = Math.max(16, Number(interval) || 2000);
    if (this.isPlaying) this.play();
  }

  /** 释放定时器和控制器状态。 */
  dispose(): void {
    this.stopTimer();
    this.isPlaying = false;
    this.finished = false;
    this.disposed = true;
  }

  /** 定时器每次触发时推进一帧，末帧会停止而不会自动循环。 */
  private tick(): void {
    const count = this.getFrameCount();
    if (count <= 0) return;

    if (this.currentIndex >= count - 1) {
      this.stopTimer();
      this.isPlaying = false;
      this.finished = true;
      this.onPlayingChanged?.(false);
      this.onFinished?.();
      return;
    }

    const nextIndex = this.currentIndex + 1;
    if (!this.seek(nextIndex)) return;
  }

  /** 清除当前定时器，但不修改当前帧索引。 */
  private stopTimer(): void {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export { WindFieldPlaybackController };
