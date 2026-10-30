/**
 * 风场对外入口。
 *
 * 业务页面优先从这里引入 WindFieldPlayer，避免直接依赖内部的
 * DataLoader、Strategy、PlaybackController 和 Layer 实现。
 */
export { default as WindFieldPlayer } from "./WindFieldPlayer";
// 图层控制面板需要独立创建图层与加载数据，因此对外开放底层实现。
export { default as WindFieldLayer } from "./WindFieldLayer";
export { default as WindFieldDataLoader } from "./WindFieldDataLoader";
export {
  default as CameraHeightController,
  DEFAULT_CAMERA_HEIGHT_PROFILES,
  DEFAULT_VELOCITY_NORMALIZATION,
} from "./CameraHeightController";
export type {
  CameraHeightViewerLike,
  CameraHeightControllerOptions,
  CameraHeightProfile,
  CameraHeightState,
  CameraHeightVelocityNormalizationOptions,
  CameraHeightLayerLike,
} from "./CameraHeightController";
export type {
  WindFieldPlayerCallbacks,
  WindFieldPlayerLoadOptions,
  WindFieldPlayerOptions,
  WindFieldPlayerProgress,
  WindFieldPlayerState,
} from "./WindFieldPlayer";
export type {
  WindFieldConfig,
  CesiumWindLike,
  WindLayerLike,
  WindFieldLayerOptions,
  VelocityMapAdapterLike,
} from "./WindFieldLayer";
export type {
  WindFrameRequest,
  WindLoadItem,
  WindLoadResult,
  WindFieldLoadOptions,
  DataManagerLike,
} from "./WindFieldDataLoader";
export {
  DEFAULT_PIXEL_SPEED_FACTOR,
  DEFAULT_REAL_SPEED_FACTOR,
  DEFAULT_VELOCITY_CONTROL,
  METERS_PER_DEGREE_EQUATOR,
  WIND_SPEED_SAMPLE_LIMIT,
  VelocityMotionPlanner,
  computeWindSpeedStatistics,
  level2Resolution,
  normalizeVelocityControl,
  pickReferenceWindSpeed,
} from "./VelocityScaleCalculator";
export type {
  NormalizedVelocityControl,
  RealWindSpeedStatistic,
  VelocityContext,
  VelocityControlOptions,
  VelocityMode,
  VelocityMotionResult,
} from "./VelocityScaleCalculator";
