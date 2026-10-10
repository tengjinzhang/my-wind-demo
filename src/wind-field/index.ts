/**
 * 风场对外入口。
 *
 * 业务页面优先从这里引入 WindFieldPlayer，避免直接依赖内部的
 * DataLoader、Strategy、PlaybackController 和 Layer 实现。
 */
export { default as WindFieldPlayer } from "./WindFieldPlayer";
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
