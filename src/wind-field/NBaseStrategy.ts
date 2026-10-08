/**
 * 风场播放策略需要遵守的公共契约。
 *
 * 这里使用接口而不是基类：不同播放类型只需要实现统一的方法集合，
 * 不需要通过继承共享状态或调用父类实现。具体策略的字段和生命周期
 * 由实现类自己管理。
 */
export interface NBaseStrategy {
  /** 当前地图或 Viewer 引用。 */
  viewer: unknown;
  /** 当前显示帧索引。 */
  showIndex: number;
  /** 上一次显示的帧索引。 */
  previousIndex: number;
  /** 是否已经销毁。 */
  isDisposed: boolean;
  /** 已准备好的帧数量。 */
  completedFrameCount: number;
  /** 播放模型或场次编码。 */
  modelCode: string;
  /** 播放显示模式。 */
  showMode: string;
  /** 基础数据所需字段。 */
  frameDataAttributes: string[];
  /** 帧数据所需字段。 */
  baseDataAttributes: string[];
  /** 帧数据变化回调。 */
  onFrameDataChanged: unknown;
  /** 是否显示当前策略。 */
  visible: boolean;

  /** 返回当前策略的类型名称。 */
  getType(): string;
  /** 保存策略所需的基础数据。 */
  addBaseData(data: unknown, opt?: unknown): void;
  /** 保存一帧可播放数据。 */
  addFrameData(data: unknown, opt?: unknown): void;
  /** 显示指定索引的帧。 */
  showFrameData(index: number): boolean;
  /** 设置策略使用的外观类型。 */
  setAppearanceType(aType: unknown): void;
  /** 显示或隐藏策略。 */
  setVisible(visible: boolean): void;
  /** 显示或隐藏风场箭头。 */
  setArrowVisible(visible: boolean): void;
  /** 获取策略需要的数据字段。 */
  getNeedDataAttributes(type?: string): unknown;
  /** 清空当前策略数据，但保留策略对象。 */
  clear(): void;
  /** 释放策略持有的资源。 */
  dispose(): void;
}

export default NBaseStrategy;
