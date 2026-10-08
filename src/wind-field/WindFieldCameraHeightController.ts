import type WindFieldLayer from "./WindFieldLayer";
import type { WindFieldConfig } from "./WindFieldLayer";

/** Cesium 相机需要提供的最小结构。 */
export interface CameraHeightViewerLike {
  camera?: {
    positionCartographic?: { height?: number };
    changed?: {
      addEventListener: (listener: () => void) => (() => void) | void;
    };
    moveEnd?: {
      addEventListener: (listener: () => void) => (() => void) | void;
    };
  };
  scene?: {
    postRender?: {
      addEventListener: (listener: () => void) => (() => void) | void;
    };
  };
}

/** 按相机高度使用的一档风场参数。 */
export interface WindFieldCameraHeightProfile
  extends Partial<
    Pick<WindFieldConfig, "maxAge" | "globalAlpha" | "lineWidth" | "velocityScale" | "paths">
  > {
  /** 该档位覆盖的最大相机高度，单位为米。最后一档通常使用 Infinity。 */
  maxHeight: number;
  /** 可选的业务标识，便于外部显示或调试。 */
  key?: string;
}

/** 默认的相机高度风场参数档位。外部传入 profiles 时会整体覆盖。 */
export const DEFAULT_WIND_FIELD_CAMERA_HEIGHT_PROFILES: WindFieldCameraHeightProfile[] = [
  {
    key: "ground",
    maxHeight: 1000,
    maxAge: 18,
    lineWidth: 0.75,
    velocityScale: 1 / 650,
    paths: 120,
  },
  {
    key: "near-ground",
    maxHeight: 5000,
    maxAge: 24,
    lineWidth: 0.8,
    velocityScale: 1 / 600,
    paths: 220,
  },
  {
    key: "local",
    maxHeight: 20000,
    maxAge: 30,
    lineWidth: 0.9,
    velocityScale: 1 / 500,
    paths: 400,
  },
  {
    key: "city",
    maxHeight: 50000,
    maxAge: 36,
    lineWidth: 1,
    velocityScale: 1 / 400,
    paths: 650,
  },
  {
    key: "regional-low",
    maxHeight: 100000,
    maxAge: 42,
    lineWidth: 1.1,
    velocityScale: 1 / 320,
    paths: 850,
  },
  {
    key: "regional",
    maxHeight: 250000,
    maxAge: 48,
    lineWidth: 1.25,
    velocityScale: 1 / 280,
    paths: 1050,
  },
  {
    key: "medium",
    maxHeight: 800000,
    maxAge: 55,
    lineWidth: 1.5,
    velocityScale: 1 / 230,
    paths: 1300,
  },
  {
    key: "high",
    maxHeight: 2000000,
    maxAge: 60,
    lineWidth: 1.75,
    velocityScale: 1 / 190,
    paths: 1700,
  },
  {
    key: "overview",
    maxHeight: Infinity,
    maxAge: 65,
    lineWidth: 2,
    velocityScale: 1 / 150,
    paths: 2200,
  },
];

/** 相机高度控制器回调中返回的当前状态。 */
export interface WindFieldCameraHeightState {
  /** 当前相机高度，单位为米。 */
  height: number;
  /** 当前命中的档位索引。 */
  profileIndex: number;
  /** 当前命中的档位。 */
  profile: WindFieldCameraHeightProfile;
  /** 当前实际应用的速度缩放比例。 */
  velocityScale: number | null;
}

/** 将世界坐标位移归一化为近似稳定的屏幕移动速度。 */
export interface WindFieldVelocityNormalizationOptions {
  /** 参考相机高度，单位为米。 */
  referenceHeight: number;
  /** 参考高度下使用的速度缩放比例。 */
  referenceVelocityScale: number;
  /** 高度比例指数，1 表示线性按高度缩放。 */
  exponent?: number;
  /** 速度缩放比例下限。 */
  minVelocityScale?: number;
  /** 速度缩放比例上限。 */
  maxVelocityScale?: number;
}

/** 默认的世界坐标速度归一化参数。外部传入 null 可关闭归一化。 */
export const DEFAULT_WIND_FIELD_VELOCITY_NORMALIZATION: WindFieldVelocityNormalizationOptions = {
  referenceHeight: 4500000,
  referenceVelocityScale: 1 / 150,
  exponent: 1,
  minVelocityScale: 1 / 1000000,
  maxVelocityScale: 1 / 120,
};

/** 相机高度控制器配置。 */
export interface WindFieldCameraHeightControllerOptions {
  /** Cesium Viewer 或提供 camera.changed 的兼容对象。 */
  viewer: CameraHeightViewerLike;
  /** 当前 demo 的风场图层包装类。 */
  windLayer: WindFieldLayer;
  /** 按最大高度从低到高排列的参数档位。 */
  profiles?: WindFieldCameraHeightProfile[];
  /** 高度变化小于该值时忽略，单位为米，默认 1。 */
  minHeightChange?: number;
  /** 命中档位后通知外部。 */
  onChanged?: (state: WindFieldCameraHeightState) => void;
  /** 按当前相机高度连续归一化速度；不传时使用档位里的固定速度。 */
  velocityNormalization?: WindFieldVelocityNormalizationOptions | null;
}

/**
 * 根据 Cesium 相机高度动态调整风场粒子参数。
 *
 * 控制器只负责监听相机和选择参数档位，实际参数写入委托给 WindFieldLayer，
 * 因此不会直接依赖 cesium-wind 的内部实现。
 */
export default class WindFieldCameraHeightController {
  private readonly viewer: CameraHeightViewerLike;
  private readonly windLayer: WindFieldLayer;
  private readonly profiles: WindFieldCameraHeightProfile[];
  private readonly minHeightChange: number;
  private readonly onChanged?: (state: WindFieldCameraHeightState) => void;
  private readonly velocityNormalization: WindFieldVelocityNormalizationOptions | null;
  private removeListeners: (() => void) | null;
  private started: boolean;
  private disposed: boolean;
  private lastHeight: number | null;
  private currentProfileIndex: number | null;
  private lastVelocityScale: number | null;

  constructor(options: WindFieldCameraHeightControllerOptions) {
    if (!options?.viewer) {
      throw new Error("WindFieldCameraHeightController requires a viewer.");
    }
    if (!options.windLayer) {
      throw new Error("WindFieldCameraHeightController requires a wind layer.");
    }
    this.viewer = options.viewer;
    this.windLayer = options.windLayer;
    this.profiles = this.#normalizeProfiles(
      options.profiles ?? DEFAULT_WIND_FIELD_CAMERA_HEIGHT_PROFILES,
    );
    this.minHeightChange = Math.max(0, Number(options.minHeightChange) || 1);
    this.onChanged = options.onChanged;
    this.velocityNormalization = this.#normalizeVelocityNormalization(
      options.velocityNormalization === undefined
        ? DEFAULT_WIND_FIELD_VELOCITY_NORMALIZATION
        : options.velocityNormalization,
    );
    this.removeListeners = null;
    this.started = false;
    this.disposed = false;
    this.lastHeight = null;
    this.currentProfileIndex = null;
    this.lastVelocityScale = null;
  }

  /** 开始监听并立即按当前相机高度应用一次参数。 */
  start(): void {
    if (this.disposed || this.started) return;

    const handleCameraChanged = () => this.update();
    const removers: Array<() => void> = [];
    const cameraRemove = this.viewer.camera?.changed?.addEventListener(handleCameraChanged);
    if (typeof cameraRemove === "function") removers.push(cameraRemove);

    const postRenderRemove = this.viewer.scene?.postRender?.addEventListener(handleCameraChanged);
    if (typeof postRenderRemove === "function") removers.push(postRenderRemove);

    const moveEndRemove = this.viewer.camera?.moveEnd?.addEventListener(() => {
      this.windLayer.rebuildParticles();
    });
    if (typeof moveEndRemove === "function") removers.push(moveEndRemove);

    if (removers.length === 0) {
      throw new Error("WindFieldCameraHeightController requires a camera or scene event.");
    }

    this.removeListeners = () => removers.forEach((remove) => remove());
    this.started = true;
    this.update(true);
  }

  /** 手动读取当前相机高度并更新风场参数。 */
  update(force = false): WindFieldCameraHeightState | null {
    if (this.disposed) return null;

    const height = this.#getCameraHeight();
    if (height === null) return null;
    const profileIndex = this.#findProfileIndex(height);
    const velocityScale = this.#getVelocityScale(height, this.profiles[profileIndex]);
    const profileChanged = profileIndex !== this.currentProfileIndex;
    const velocityChanged = this.#hasVelocityChanged(velocityScale);
    if (!force && this.lastHeight !== null && Math.abs(height - this.lastHeight) < this.minHeightChange) {
      if (!profileChanged && !velocityChanged) {
        return this.#getState(height, profileIndex);
      }
    }

    this.lastHeight = height;
    if (profileChanged) {
      this.currentProfileIndex = profileIndex;
      this.#applyProfile(this.profiles[profileIndex], this.velocityNormalization === null);
    }
    if (velocityScale !== null && (force || profileChanged || velocityChanged)) {
      this.windLayer.setVelocityScale(velocityScale);
      this.lastVelocityScale = velocityScale;
    }
    if (profileChanged || velocityChanged) {
      const state = this.#getState(height, profileIndex);
      this.onChanged?.(state);
      return state;
    }

    return this.#getState(height, profileIndex);
  }

  /** 返回当前控制器状态；尚未读取到相机高度时返回 null。 */
  getState(): WindFieldCameraHeightState | null {
    if (this.lastHeight === null || this.currentProfileIndex === null) return null;
    return this.#getState(this.lastHeight, this.currentProfileIndex);
  }

  /** 解除相机事件监听并释放控制器引用。 */
  dispose(): void {
    if (this.disposed) return;
    this.removeListeners?.();
    this.removeListeners = null;
    this.started = false;
    this.disposed = true;
    this.lastHeight = null;
    this.currentProfileIndex = null;
    this.lastVelocityScale = null;
  }

  #getCameraHeight(): number | null {
    const height = Number(this.viewer.camera?.positionCartographic?.height);
    return Number.isFinite(height) ? Math.max(0, height) : null;
  }

  #findProfileIndex(height: number): number {
    const index = this.profiles.findIndex((profile) => height <= profile.maxHeight);
    return index >= 0 ? index : this.profiles.length - 1;
  }

  #applyProfile(profile: WindFieldCameraHeightProfile, applyVelocityScale: boolean): void {
    if (profile.maxAge !== undefined) this.windLayer.setMaxAge(profile.maxAge);
    if (profile.globalAlpha !== undefined) this.windLayer.setGlobalAlpha(profile.globalAlpha);
    if (profile.lineWidth !== undefined) this.windLayer.setLineWidth(profile.lineWidth);
    if (applyVelocityScale && profile.velocityScale !== undefined) {
      this.windLayer.setVelocityScale(profile.velocityScale);
      this.lastVelocityScale = profile.velocityScale;
    }
    if (profile.paths !== undefined) this.windLayer.setPaths(profile.paths);
  }

  #getState(height: number, profileIndex: number): WindFieldCameraHeightState {
    return {
      height,
      profileIndex,
      profile: { ...this.profiles[profileIndex] },
      velocityScale: this.lastVelocityScale,
    };
  }

  #getVelocityScale(height: number, profile: WindFieldCameraHeightProfile): number | null {
    if (!this.velocityNormalization) return profile.velocityScale ?? null;

    const { referenceHeight, referenceVelocityScale, exponent = 1 } = this.velocityNormalization;
    const factor = Math.pow(Math.max(height, 0) / referenceHeight, exponent);
    const minFactor = 0.000001;
    const maxFactor = 100;
    const boundedFactor = Math.max(minFactor, Math.min(maxFactor, factor));
    const rawScale = referenceVelocityScale * boundedFactor;
    const minScale = this.velocityNormalization.minVelocityScale ?? Number.MIN_VALUE;
    const maxScale = this.velocityNormalization.maxVelocityScale ?? Number.POSITIVE_INFINITY;
    return Math.max(minScale, Math.min(maxScale, rawScale));
  }

  #hasVelocityChanged(nextVelocityScale: number | null): boolean {
    if (nextVelocityScale === null || this.lastVelocityScale === null) {
      return nextVelocityScale !== this.lastVelocityScale;
    }
    const denominator = Math.max(Math.abs(this.lastVelocityScale), Number.MIN_VALUE);
    return Math.abs(nextVelocityScale - this.lastVelocityScale) / denominator >= 0.01;
  }

  #normalizeProfiles(profiles: WindFieldCameraHeightProfile[]): WindFieldCameraHeightProfile[] {
    const normalized = profiles.map((profile) => ({
      ...profile,
      maxHeight: Number(profile.maxHeight),
    }));

    if (normalized.some((profile) => !Number.isFinite(profile.maxHeight) && profile.maxHeight !== Infinity)) {
      throw new TypeError("Each camera height profile maxHeight must be finite or Infinity.");
    }

    return normalized.sort((left, right) => left.maxHeight - right.maxHeight);
  }

  #normalizeVelocityNormalization(
    options?: WindFieldVelocityNormalizationOptions,
  ): WindFieldVelocityNormalizationOptions | null {
    if (!options) return null;

    const referenceHeight = Number(options.referenceHeight);
    const referenceVelocityScale = Number(options.referenceVelocityScale);
    const exponent = Number(options.exponent ?? 1);
    if (
      !Number.isFinite(referenceHeight) ||
      referenceHeight <= 0 ||
      !Number.isFinite(referenceVelocityScale) ||
      referenceVelocityScale <= 0 ||
      !Number.isFinite(exponent) ||
      exponent <= 0
    ) {
      throw new TypeError("velocityNormalization contains invalid values.");
    }

    return {
      ...options,
      referenceHeight,
      referenceVelocityScale,
      exponent,
    };
  }
}

export { WindFieldCameraHeightController };
