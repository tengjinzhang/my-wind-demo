/**
 * 粒子速度换算模块（三层换算方案）。
 *
 * 第三方库 cesium-wind 的位移规则（见 cesium-wind.js 的 moveParticles）：
 *
 *   xt = x + vector.u * velocityScale;
 *   yt = y + vector.v * velocityScale;
 *
 * 其中 x/y 是经纬度（度），u/v 是风速分量（m/s）。即每渲染一帧，粒子在
 * 经度方向移动 `u * velocityScale` 度，纬度方向移动 `v * velocityScale` 度。
 * 因此 `velocityScale` 的语义是「每帧、每 1 (m/s) 风速对应的经度位移（度）」。
 *
 * 新方案分三层：
 *
 * 1. 数据层：从风场 u/v 统计真实风速 vReal（m/s，单位换算后）；
 * 2. 系数层：K = realSpeedFactor × pixelSpeedFactor，目标地面速度 Vg = vReal × K；
 * 3. 换算层：
 *    - meter 模式：velocityScale = Vg / (vReal × f × M) = unitScale × K / (f × M)，
 *      与分辨率无关，地面速度恒定；放大时像素速度变快（同样的米数占更多像素）。
 *    - pixel 模式：velocityScale = 基准 × (r / r_ref)，r_ref 为固定的像素标定分辨率，
 *      使屏幕像素速度恒定、不随缩放漂移。
 *
 * 两种模式按各自的物理语义独立计算：同一缩放视角下，除 r = r_ref 外二者速度不同，
 * 因此切换模式会产生可感知的速度变化；realSpeedFactor / pixelSpeedFactor 在切换前后保持不变。
 */

/** 粒子速度约束模式：仅保留像素每秒、米每秒两种。 */
export type VelocityMode = "pixel" | "meter";

/** 统计真实风速时使用的口径。 */
export type RealWindSpeedStatistic = "max" | "median" | "mean";

/** 创建速度控制时使用的配置。 */
export interface VelocityControlOptions {
  /** 速度约束模式，默认 "pixel"（像素每秒）。 */
  mode?: VelocityMode;
  /**
   * 实际速度调整系数（对外唯一可调的量）。
   *
   * 作用于从风场数据统计出的真实风速，用于把真实风速放大到可见量级。
   * 像素速度调整系数固定在模块内部，不对外暴露。
   */
  realSpeedFactor?: number;
  /** 真实风速统计口径，默认 "median"（中位数）。 */
  realWindSpeedStatistic?: RealWindSpeedStatistic;
  /** 风速数据单位换算系数：数据已是 m/s 时取 1。 */
  windSpeedUnitScale?: number;
}

/** 归一化后的速度控制配置，所有字段均有确定取值。 */
export interface NormalizedVelocityControl {
  /** 当前生效的约束模式。 */
  mode: VelocityMode;
  /** 实际速度调整系数（对外可调，作用于真实风速）。 */
  realSpeedFactor: number;
  /** 像素速度调整系数（模块内部固定，不对外暴露）。 */
  pixelSpeedFactor: number;
  /** 真实风速统计口径。 */
  realWindSpeedStatistic: RealWindSpeedStatistic;
  /** 风速数据单位换算系数。 */
  windSpeedUnitScale: number;
}

/** 计算时需要的运行时上下文。 */
export interface VelocityContext {
  /** 渲染帧率，单位为帧/秒，通常取 1000 / 帧间隔。 */
  frameRate: number;
  /**
   * 当前地图分辨率，单位为「米/像素」。
   *
   * 统一由 MapBaseHelper 相机距离法给出（getCameraDistance → distance2MapsLevel
   * → level2Resolution(level, true)），该结果已反映当前视角的真实地面分辨率。
   * 只有该值非法时才退化为按纬度修正的赤道分辨率。
   */
  resolution: number;
  /** 当前视角中心纬度（度），仅在分辨率回退计算时使用。 */
  latitude: number;
  /** 从风场数据统计得到的真实风速（参考点，m/s），用于换算与读数。 */
  realWindSpeed?: number;
}

/** 一次换算的完整结果，既包含写入图层的速度，也包含可展示的物理读数。 */
export interface VelocityMotionResult {
  /** 可直接写入 cesium-wind 的 velocityScale。 */
  velocityScale: number;
  /** 参考点的真实风速（m/s）。 */
  realWindSpeed: number;
  /** 参考点的目标地面速度（m/s）。 */
  targetGroundSpeed: number;
  /** 参考点的屏幕像素速度（px/s）。 */
  targetPixelSpeed: number;
}

/** 实际速度调整系数默认值：把真实风速放大到可见量级的基准倍率（对外可调）。 */
export const DEFAULT_REAL_SPEED_FACTOR = 5000;

/** 像素速度调整系数默认值：模块内部固定，用于在真实速度基础上调节屏幕像素速度。 */
export const DEFAULT_PIXEL_SPEED_FACTOR = 10;

/** 默认的速度控制配置：像素每秒模式、默认倍率、数据单位为 m/s、中位数统计。 */
export const DEFAULT_VELOCITY_CONTROL: NormalizedVelocityControl = {
  mode: "pixel",
  realSpeedFactor: DEFAULT_REAL_SPEED_FACTOR,
  pixelSpeedFactor: DEFAULT_PIXEL_SPEED_FACTOR,
  realWindSpeedStatistic: "median",
  windSpeedUnitScale: 1,
};

/** Web 墨卡托投影下赤道半周长，单位为米（与 map_adapter.js 的 level2Resolution 保持一致）。 */
export const WEB_MERCATOR_HALF_CIRCUMFERENCE = 20037508.342787;

/** 通用瓦片边长，单位为像素。 */
export const TILE_SIZE = 256;

/** 赤道处 1 度经度对应的地表距离，单位为米。 */
export const METERS_PER_DEGREE_EQUATOR = 111319.49079327358;

/**
 * 像素模式的标定层级。
 *
 * 像素模式需要把「米/秒」换算成「像素/秒」，必须有一个参考分辨率；
 * 取固定的层级 5 作为标定基准，保证不同图层、不同缩放起点下像素模式的
 * 绝对速度一致（不随创建图层时的视角漂移）。
 */
export const PIXEL_REFERENCE_LEVEL = 5;

/** 像素模式的参考分辨率（米/像素），由标定层级换算得到。 */
const PIXEL_REFERENCE_RESOLUTION = level2Resolution(PIXEL_REFERENCE_LEVEL);

/** 统计风速分布时最多采样的格点数，避免大网格遍历带来性能开销。 */
export const WIND_SPEED_SAMPLE_LIMIT = 2048;

/** 纬度的最小余弦值，避免极点附近除零导致数值爆炸。 */
const MIN_LATITUDE_COS = 1e-6;

/**
 * 从 u/v 分量数组统计风速，返回 max、中位数、均值（单位由 unitScale 换算）。
 *
 * u/v 为扁平网格数组（与 cesium-wind 的 field.us / field.vs 一致），
 * 风速 = √(u² + v²)。为避免大网格全量遍历，按步长抽样至多
 * WIND_SPEED_SAMPLE_LIMIT 个有效格点；全部无效时返回全 0。
 *
 * @param us 东西向风速分量数组。
 * @param vs 南北向风速分量数组。
 * @param unitScale 单位换算系数，数据已是 m/s 时取 1。
 * @returns 风速统计量，包含 max、median、mean。
 */
export function computeWindSpeedStatistics(
  us: ArrayLike<number>,
  vs: ArrayLike<number>,
  unitScale = 1,
): { max: number; median: number; mean: number } {
  const total = Math.min(us?.length ?? 0, vs?.length ?? 0);
  if (total <= 0) return { max: 0, median: 0, mean: 0 };

  // 按步长抽样，保证采样数量不超过上限。
  const step = Math.max(1, Math.floor(total / WIND_SPEED_SAMPLE_LIMIT));
  const samples: number[] = [];
  let sum = 0;
  let max = 0;

  for (let i = 0; i < total; i += step) {
    const u = Number(us[i]);
    const v = Number(vs[i]);
    if (!Number.isFinite(u) || !Number.isFinite(v)) continue;
    const speed = Math.sqrt(u * u + v * v);
    samples.push(speed);
    sum += speed;
    if (speed > max) max = speed;
  }

  if (samples.length === 0) return { max: 0, median: 0, mean: 0 };

  samples.sort((a, b) => a - b);
  const middle = samples.length >> 1;
  const median =
    samples.length % 2 === 1
      ? samples[middle]
      : (samples[middle - 1] + samples[middle]) / 2;

  const scale = toPositiveNumber(unitScale, 1);
  const mean = sum / samples.length;
  return {
    max: max * scale,
    median: median * scale,
    mean: mean * scale,
  };
}

/**
 * 将用户传入的速度控制配置归一化为完整配置。
 *
 * @param options 外部传入的速度控制配置，可为空。
 * @returns 所有字段都有确定取值的速度控制配置。
 */
export function normalizeVelocityControl(
  options?: VelocityControlOptions | null,
): NormalizedVelocityControl {
  const mode: VelocityMode = options?.mode === "meter" ? "meter" : "pixel";
  // 像素速度调整系数固定在模块内部，不接受外部覆盖。
  const pixelSpeedFactor = DEFAULT_PIXEL_SPEED_FACTOR;
  // 实际速度调整系数是对外唯一可调的量。
  const realSpeedFactor = toPositiveNumber(
    options?.realSpeedFactor,
    DEFAULT_VELOCITY_CONTROL.realSpeedFactor,
  );
  const windSpeedUnitScale = toPositiveNumber(
    options?.windSpeedUnitScale,
    DEFAULT_VELOCITY_CONTROL.windSpeedUnitScale,
  );
  const realWindSpeedStatistic: RealWindSpeedStatistic =
    options?.realWindSpeedStatistic === "max" ||
    options?.realWindSpeedStatistic === "mean"
      ? options.realWindSpeedStatistic
      : "median";
  return {
    mode,
    realSpeedFactor,
    pixelSpeedFactor,
    realWindSpeedStatistic,
    windSpeedUnitScale,
  };
}

/**
 * 速度换算器：把「数据真实风速 × 系数」换算成 cesium-wind 的 velocityScale。
 *
 * 渲染规则：
 *   - meter 模式：velocityScale = 基准（与分辨率无关，锁定地面速度）；
 *   - pixel 模式：velocityScale = 基准 × (r / r_ref)，锁定屏幕像素速度。
 *   其中 r_ref 为固定的像素标定分辨率（PIXEL_REFERENCE_RESOLUTION）。
 *
 * 基准只在系数、帧率或单位换算发生变化时重建，模式切换不修改任何状态，
 * 因此切换模式会立即体现两种语义各自的差异，不会互相覆盖。
 */
export class VelocityMotionPlanner {
  /** 基准 velocityScale（meter 模式下直接使用）；null 表示尚未初始化。 */
  #baseVelocityScale: number | null = null;
  /** 上一次生效的系数乘积（realSpeedFactor × pixelSpeedFactor）。 */
  #factorProduct = 0;
  /** 上一次生效的帧率。 */
  #frameRate = 0;
  /** 上一次生效的单位换算系数。 */
  #unitScale = 0;

  /** 清空基准状态，下次换算会重新建立基准。 */
  reset(): void {
    this.#baseVelocityScale = null;
    this.#factorProduct = 0;
    this.#frameRate = 0;
    this.#unitScale = 0;
  }

  /**
   * 按当前配置与上下文换算速度。
   *
   * @param control 速度控制配置。
   * @param context 运行时上下文（帧率、分辨率、纬度、真实风速）。
   * @returns 速度换算结果。
   * @throws {RangeError} 帧率或分辨率非法时抛出错误。
   */
  update(
    control: NormalizedVelocityControl,
    context: VelocityContext,
  ): VelocityMotionResult {
    const frameRate = Number(context.frameRate);
    if (!Number.isFinite(frameRate) || frameRate <= 0) {
      throw new RangeError("velocityScale 计算需要大于 0 的 frameRate。");
    }

    // 分辨率由 MapBaseHelper 相机距离法提供，已是真实地面分辨率。
    const resolution = resolveGroundResolution(context.resolution, context.latitude);
    if (!Number.isFinite(resolution) || resolution <= 0) {
      throw new RangeError("velocityScale 计算需要大于 0 的分辨率。");
    }

    const unitScale = toPositiveNumber(control.windSpeedUnitScale, 1);
    // 最终倍率 = 实际速度调整系数 × 像素速度调整系数。
    const factorProduct =
      toPositiveNumber(control.realSpeedFactor, DEFAULT_REAL_SPEED_FACTOR) *
      toPositiveNumber(control.pixelSpeedFactor, DEFAULT_PIXEL_SPEED_FACTOR);

    // 1:1 物理基准：K=1、单位换算为 1 时，粒子地面速度恰等于真实风速。
    const baseVelocityScale =
      (unitScale * factorProduct) / (frameRate * METERS_PER_DEGREE_EQUATOR);

    const needsRebuild =
      this.#baseVelocityScale === null ||
      factorProduct !== this.#factorProduct ||
      frameRate !== this.#frameRate ||
      unitScale !== this.#unitScale;

    if (needsRebuild) {
      this.#baseVelocityScale = baseVelocityScale;
    }
    this.#factorProduct = factorProduct;
    this.#frameRate = frameRate;
    this.#unitScale = unitScale;

    const base = this.#baseVelocityScale as number;

    // meter 锁定地面速度；pixel 按 r/r_ref 缩放以锁定屏幕像素速度。
    const velocityScale =
      control.mode === "meter"
        ? base
        : base * (resolution / PIXEL_REFERENCE_RESOLUTION);

    const realWindSpeed = toNonNegativeNumber(context.realWindSpeed, 0);
    // 参考点的地面速度：局部真实风速 × velocityScale × 帧率 × 每度米数。
    const targetGroundSpeed =
      (realWindSpeed * velocityScale * frameRate * METERS_PER_DEGREE_EQUATOR) /
      unitScale;
    const targetPixelSpeed = targetGroundSpeed / resolution;

    return {
      velocityScale: Math.max(velocityScale, Number.MIN_VALUE),
      realWindSpeed,
      targetGroundSpeed,
      targetPixelSpeed,
    };
  }
}

/**
 * 按地图层级计算分辨率，单位为「米/像素」。
 *
 * 与 map_adapter.js 的 `level2Resolution(level, true)` 完全一致：
 * `20037508.342787 / (256 × 2^level)`。
 *
 * @param level 地图缩放层级，可为小数。
 * @returns 赤道处分辨率，单位为米/像素。
 */
export function level2Resolution(level: number): number {
  const safeLevel = Number.isFinite(Number(level)) ? Number(level) : 0;
  return WEB_MERCATOR_HALF_CIRCUMFERENCE / (TILE_SIZE * Math.pow(2, safeLevel));
}

/**
 * 对分辨率做纬度修正。
 *
 * Web 墨卡托在高纬度地区会被拉伸，实际地表分辨率需要乘以 cos(latitude)。
 *
 * @param resolution 赤道处分辨率，单位为米/像素。
 * @param latitude 当前纬度，单位为度。
 * @returns 修正后的分辨率，单位为米/像素。
 */
export function applyLatitudeToResolution(
  resolution: number,
  latitude: number,
): number {
  const radians = (Number(latitude) || 0) * (Math.PI / 180);
  const cosLatitude = Math.max(Math.abs(Math.cos(radians)), MIN_LATITUDE_COS);
  return resolution * cosLatitude;
}

/**
 * 取得当前视角的真实地面分辨率（米/像素）。
 *
 * 统一由 MapBaseHelper 相机距离法给出的分辨率已经是真实地面分辨率，
 * 不再重复做纬度修正；只有当传入值非法（适配器缺失或返回 0）时，
 * 才退化为按纬度对赤道分辨率做一次墨卡托修正，保证计算不中断。
 *
 * @param resolution 适配器给出的分辨率（米/像素）。
 * @param latitude 当前视角纬度（度），仅在回退时使用。
 * @returns 真实地面分辨率（米/像素）。
 */
export function resolveGroundResolution(
  resolution: number,
  latitude: number,
): number {
  const value = Number(resolution);
  if (Number.isFinite(value) && value > 0) return value;
  return applyLatitudeToResolution(level2Resolution(0), latitude);
}

/**
 * 按给定口径从风速统计量中取参考风速。
 *
 * @param stats 风速统计量（max / median / mean），单位 m/s。
 * @param statistic 统计口径。
 * @returns 对应口径的风速，单位为 m/s；非法时返回 0。
 */
export function pickReferenceWindSpeed(
  stats: { max: number; median: number; mean: number },
  statistic: RealWindSpeedStatistic,
): number {
  const value = Number(stats?.[statistic]);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/**
 * 把任意输入转换为大于 0 的有限数，非法时回退到默认值。
 *
 * @param value 待转换值。
 * @param fallback 转换失败时使用的默认值。
 * @returns 大于 0 的有限数。
 */
function toPositiveNumber(value: unknown, fallback: number): number {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return number;
}

/**
 * 把任意输入转换为非负有限数，非法时回退到默认值。
 *
 * @param value 待转换值。
 * @param fallback 转换失败时使用的默认值。
 * @returns 非负有限数。
 */
function toNonNegativeNumber(value: unknown, fallback: number): number {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return fallback;
  return number;
}
