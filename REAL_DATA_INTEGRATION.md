# 风场真实数据接入说明

本文说明当前 demo 的数据加载、风场帧播放和真实项目接入方式。

当前 demo 只有一个风场播放策略，因此没有额外的策略管理器。业务页面通过 WindFieldPlayer 门面使用风场能力，数据加载、策略、播放控制和图层实现都收拢在门面内部。

## 一、当前 demo 的类职责

~~~text
WindFieldPlayer
  对外唯一的风场播放门面，负责组装内部对象并暴露业务 API

WindFieldDataLoader
  门面内部的下载实现，负责创建 NLoadTask、提交 DataManager、接收单帧回调

WindFieldFrameStrategy
  当前唯一的风场播放策略，负责保存帧并显示指定帧

WindFieldPlaybackController
  负责播放、暂停、跳帧、播放间隔和当前帧索引

WindFieldLayer
  负责创建、更新、显示、隐藏和销毁 CesiumWind 图层
~~~

对应文件：

~~~text
src/wind-field/WindFieldPlayer.ts
src/wind-field/index.ts
src/wind-field/WindFieldDataLoader.ts
src/wind-field/WindFieldFrameStrategy.ts
src/wind-field/WindFieldPlaybackController.ts
src/wind-field/WindFieldLayer.ts
~~~

当前对象关系：

~~~text
业务时次清单
  ↓
WindFieldPlayer.load()
  ↓
WindFieldDataLoader
  ↓
window.DataManager + Worker
  ↓
WindFieldFrameStrategy.addFrameData()
  ↓
WindFieldFrameStrategy.showFrameData()
  ↓
WindFieldLayer
  ↓
CesiumWind
~~~

## 二、当前 demo 的数据加载流程

### 1. 准备时次清单

当前 demo 在 App.vue 中使用本地模拟清单：

~~~ts
const frameConfigs = [
  {
    key: "synthetic-wind-20260918-00",
    time: "2026-09-18T00:00:00Z",
    dataUrl: "/data/wind/wind_001.json",
    dataType: "data_2d",
  },
];
~~~

frameConfigs 是业务侧元数据，包含：

- 当前帧的唯一 key；
- 当前帧对应的时间；
- 当前帧数据地址；
- DataManager 使用的数据类型；
- 可选的 parsType、cacheType 和其他 loadInfo 参数。

每个风场 JSON 只保存这一帧的风场数据，不保存时间、场次和页面展示信息。

### 2. 创建 DataManager 任务

门面调用方式：

~~~ts
const player = new WindFieldPlayer({
  viewer,
  CesiumWind,
  workerUrl: "./dataManager/workers/wind_field_worker.js",
  frameInterval: 2000,
});

const result = await player.load(frameConfigs);
if (result.failed === 0) {
  player.play();
}
~~~

WindFieldPlayer 内部再调用加载器：

~~~ts
await this.loader.loadFrames(frameConfigs, {
  workerUrl: "./dataManager/workers/wind_field_worker.js",
  workerCount: 1,
  onFrameLoaded(item) {
    // 单帧完成后立即处理
  },
});
~~~

WindFieldDataLoader 会为每个时次创建一个 NLoadTask 和 NLoadInfo，并设置：

~~~text
task.key
task.loadInfo.key
task.loadInfo.dataType
task.loadInfo.dataUrl
task.loadInfo.parsType
task.loadInfo.cacheType
task.TaskCallback
~~~

然后调用：

~~~ts
window.DataManager.loadDatas(tasks);
~~~

全局 DataManager 仍然通过 index.html 中的普通 script 加载：

~~~html
<script src="./dataManager/datamanager.js"></script>
<script src="./dataManager/loadconfig.js"></script>
<script src="./dataManager/index.js"></script>
~~~

### 3. 单帧完成后立即进入 WindFieldFrameStrategy

当前流程不是等所有任务完成后再批量添加，而是：

~~~text
Worker 返回某一帧
  ↓
DataManager 调用 task.TaskCallback
  ↓
WindFieldDataLoader.finishTask()
  ↓
onFrameLoaded(item)
  ↓
WindFieldFrameStrategy.addFrameData(item.data, options)
  ↓
保存该帧，并在需要时显示第一帧
~~~

单帧回调的参数结构：

~~~ts
{
  index,
  key,
  dataType,
  data,
  rawData,
  frame,
}
~~~

其中：

- data 是从 Worker 返回对象中提取出的真正风场数据；
- rawData 是 DataManager 的原始结果；
- frame 是提交任务时的业务元数据；
- index 用于保证异步完成顺序不会影响播放顺序。

### 4. 全部任务完成后的作用

player.load 仍然返回最终汇总 Promise：

~~~ts
const result = await player.load(frameConfigs, options);

if (result.failed > 0) {
  throw result.errors[0].error;
}
~~~

最终结果包含：

~~~ts
{
  total,
  completed,
  success,
  failed,
  items,
  errors,
  ready,
}
~~~

两类回调的职责不同：

~~~text
onFrameLoaded：逐帧处理，数据到一帧就处理一帧
Promise 结果或 onCompleted：判断所有任务是否完成、是否有失败
~~~

所有帧成功后只显示第一帧并保持暂停，用户点击播放按钮后才开始时序播放；每一帧在下载完成时已经提前进入 WindFieldFrameStrategy。

## 三、WindFieldFrameStrategy 的职责

WindFieldFrameStrategy 是当前唯一的具体风场策略，负责：

~~~text
保存基础数据
保存已加载的帧数据
记录帧索引、key、时间和数据类型
根据索引查找帧
把当前帧交给 WindFieldLayer
清空帧数据和图层
~~~

门面内部添加帧：

~~~ts
this.strategy.addFrameData(item.data, {
  index: item.index,
  key: item.key,
  time: item.frame.time,
  dataType: item.dataType,
  show: false,
});
~~~

门面内部显示帧：

~~~ts
this.strategy.showFrameData(index);
~~~

内部处理：

~~~text
showFrameData(index)
  ↓
查找 frameDataList[index]
  ↓
WindFieldLayer.createWindLayer() 或 updateWindLayer()
~~~

由于当前只有一个策略，WindFieldPlayer 直接持有 WindFieldFrameStrategy，不再增加一层 WindFieldAnimationManager 转发。业务页面不需要直接创建策略对象。

## 四、WindFieldPlaybackController 的职责

WindFieldPlaybackController 只负责时序播放，不负责下载数据，也不负责渲染图层。

它负责：

~~~text
播放状态
当前帧索引
播放间隔
下一帧计算
首帧、末帧、上一帧、下一帧
暂停和恢复
播放定时器
~~~

门面暴露的播放链路：

~~~text
WindFieldPlayer.play()
  ↓
WindFieldPlaybackController.tick()
  ↓
WindFieldPlaybackController.seek(index)
  ↓
WindFieldFrameStrategy.showFrameData(index)
  ↓
WindFieldLayer.updateWindLayer(data)
~~~

当前 demo 使用浏览器 setInterval 驱动播放：

~~~ts
window.setInterval(() => this.tick(), this.frameInterval);
~~~

greater-area 的 FloodSimulation 使用 Cesium 时钟：

~~~js
viewer.clock.onTick.addEventListener(FloodSimulation.playTick);
~~~

两者职责相同，区别只是时钟来源不同：

~~~text
greater-area：Cesium viewer.clock
demo：浏览器 setInterval
~~~

如果真实风场需要和 Cesium 时间轴同步，可以只替换 WindFieldPlaybackController 的时钟实现，不需要改动 WindFieldPlayer 的业务调用方式。

## 五、当前 demo 与 greater-area 的区别

### 1. 策略层级

greater-area 使用：

~~~text
NAnimationManager
  ↓
不同策略类
~~~

当前 demo 使用：

~~~text
WindFieldFrameStrategy
~~~

这是有意简化的，因为当前风场只有一种播放方式。如果以后增加缓存策略、纹理策略或 GPU Buffer 策略，再考虑重新增加策略管理器。

### 2. 数据来源

当前 demo 使用本地模拟文件：

~~~text
public/data/wind/wind_001.json
public/data/wind/wind_002.json
...
~~~

真实项目通常先请求场次和时次元数据，再根据帧 ID 生成真实数据地址。

### 3. Worker 和解析方式

当前 demo 默认使用：

~~~text
public/dataManager/workers/wind_field_worker.js
~~~

greater-area 根据业务数据类型使用不同 Worker 和不同 parsType，例如：

~~~text
flow_worker.js
water3d_json_worker_fbc_n.js
其他业务专用 Worker
~~~

真实接入时，不能只替换 dataUrl，还必须确认：

- 数据返回格式；
- Worker 地址；
- parsType；
- 是否是 JSON 或 ArrayBuffer；
- 是否需要授权请求头；
- Worker 返回结果是否已经符合 WindFieldLayer 的输入格式。

### 4. 基础数据

当前风场 demo 的每个 JSON 可以直接作为一帧风场数据使用，暂时没有独立的基础 VAO 任务。

如果真实风场服务把网格信息和风场值拆开，应在门面内部扩展基础数据接入；业务页面仍然只调用 player.load：

~~~ts
this.strategy.addBaseData(baseData);
~~~

### 5. 播放完成行为

当前 demo 的自动播放到达末帧后会暂停：

~~~text
播放到末帧 → 停止并保持末帧
~~~

用户再次点击播放时，控制器会先跳转到第一帧，再重新开始播放。

手动点击首帧、上一帧、下一帧或末帧仍然可以直接跳转，不会自动开始播放。

## 六、真实接入时需要替换的位置

### 1. 替换 frameConfigs 的生成方式

当前是写死的模拟数据：

~~~ts
const frameConfigs = [
  {
    key: "synthetic-wind-20260918-00",
    time: "2026-09-18T00:00:00Z",
    dataUrl: "/data/wind/wind_001.json",
    dataType: "data_2d",
  },
];
~~~

真实项目应先请求业务接口，再动态生成：

~~~ts
const frameConfigs = frameMetaList.map((frame, index) => ({
  key: modelId + "_" + frame.id + "_" + index,
  time: frame.time,
  dataUrl: buildWindDataUrl(frame),
  dataType: "data_2d",
  parsType: realParsType,
  loadInfo: {
    Authorization: true,
    headerArrayBuffer: realDataIsArrayBuffer,
  },
}));
~~~

需要替换的是：

~~~text
frameMetaList 的接口来源
buildWindDataUrl 的地址拼接规则
真实数据类型和解析参数
~~~

### 2. 业务侧只使用 WindFieldPlayer

真实接入时建议保持：

~~~ts
const player = new WindFieldPlayer({
  viewer,
  CesiumWind,
  workerUrl: realWorkerUrl,
  workerCount: realWorkerCount,
  onFrameLoaded(item) {
    console.log("风场单帧已加载", item.index);
  },
});

const result = await player.load(frameConfigs, {
  parsType: realParsType,
});

if (result.failed === 0) {
  player.play();
}
~~~

门面内部仍然保持单帧回调接入方式，业务页面不需要手动调用：

~~~ts
DataManager 回调
  ↓
WindFieldPlayer 内部 onFrameLoaded
  ↓
WindFieldFrameStrategy.addFrameData()
~~~

不要在业务页面绕过门面，重新创建四个内部类并在 result.items 上批量添加；那会让页面重新承担内部组装职责，也容易退回“全部下载完成后批量添加”的旧流程。

### 3. 替换 Worker 和 parsType

默认 demo 配置：

~~~ts
workerUrl: "./dataManager/workers/wind_field_worker.js"
~~~

真实接入时需要根据后端格式确认：

~~~ts
workerUrl: realWorkerUrl,
parsType: realParsType,
~~~

如果真实 Worker 返回的数据不是 WindFieldLayer 能直接使用的风场结构，应在 Worker 或 extractWorkerData() 中增加转换逻辑。

### 4. 替换认证和二进制请求参数

真实任务可能需要：

~~~ts
loadInfo: {
  Authorization: true,
  headerArrayBuffer: true,
  headers: realHeaders,
}
~~~

不要在 Worker 中硬编码真实 token、用户名或密码。应使用项目现有的请求代理、运行时配置或统一认证机制。

### 5. 设计真实缓存 key

缓存 key 应至少能区分：

~~~text
项目编号
模型编号
计算场次
帧编号
数据类型
数据版本
~~~

例如：

~~~ts
key: projectId + "_" + modelId + "_" + batchId + "_" + frame.id + "_wind_v" + version
~~~

真实数据更新后，如果 key 不变，DataManager 可能继续返回旧缓存。

## 七、真实接入推荐流程

~~~text
1. 请求真实场次和时次元数据
   ↓
2. 生成 frameConfigs
   ↓
3. 创建 WindFieldPlayer
   ↓
4. 调用 player.load()
   ↓
5. 门面内部每帧 onFrameLoaded 后立即 WindFieldFrameStrategy.addFrameData()
   ↓
6. 全部完成后检查 failed / ready
   ↓
7. 用户点击播放后调用 player.play()
~~~

## 八、接入前检查清单

- [ ] 已获得真实场次和时次元数据接口。
- [ ] 已确认每个时次的数据地址生成规则。
- [ ] 已确认数据是 JSON、ArrayBuffer 还是其他二进制格式。
- [ ] 已确认对应的 Worker。
- [ ] 已确认对应的 parsType。
- [ ] 已确认 Worker 返回的数据可以转换成 WindFieldLayer 支持的数据结构。
- [ ] 已确认认证信息不会硬编码在 Worker 中。
- [ ] 已设计不会冲突的 IndexedDB cache key。
- [ ] 已确认时间信息来自业务元数据，而不是风场 JSON。
- [ ] 已确认某一帧失败时的提示和重试方式。
- [ ] 已确认播放到末帧后是循环还是停止。
- [ ] 已确认播放间隔是否需要根据真实时间戳动态计算。

## 九、结论

当前 demo 的核心结构是：

~~~text
WindFieldPlayer 对外门面
内部组装 DataLoader、FrameStrategy、PlaybackController、Layer
全局 DataManager
多任务 Worker 加载
单帧完成回调
WindFieldFrameStrategy 单一策略
独立播放控制器
风场图层渲染层
~~~

真实接入时优先替换：

~~~text
1. frameConfigs 的接口生成逻辑
2. dataUrl 的真实地址
3. workerUrl 和 parsType
4. loadInfo 中的认证和二进制参数
5. WindFieldLayer 需要的数据转换逻辑
6. 播放间隔和末帧处理规则
~~~

通常不需要重新编写：

~~~text
WindFieldPlayer 的公共调用方式
WindFieldDataLoader 的任务提交机制
WindFieldFrameStrategy 的单帧接收和帧切换机制
WindFieldPlaybackController 的基础播放控制
WindFieldLayer 的 CesiumWind 图层管理
~~~
