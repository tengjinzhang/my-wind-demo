function init() {
  // console.log("进入页面初始化函数");
  initDataManager();
}
function initDataManager() {
  // console.log("初始化数据管理器函数");
  if (!window.DataManager) {
    console.log('初始化数据管理器');
    window.DataManager = new NDataManager(new NCallbackDelegate(this, dataManagerCompleted));
    window.DataManager.WorkerUrl = './dataManager/workers/flow_worker.js';
    window.DataManager.WorkerCount = 15;

    window.DataManager.DaemonWorkerUrl = './dataManager/workers/flow_worker.js';
    window.DataManager.DaemonDelayTime = 500;
    window.DataManager.DaemonWorkerCount = 1;
    // loadmanager.WorkerUrl=
    // loadmanager.WorkerCount=5;
    // loadmanager.checkDataCached=checkDataCached;
  } else {
    if (window.DataManager.initCompleted) {
      dataManagerCompleted();
    }
  }
}
function dataManagerCompleted(msg) {
  if (msg == 1) {
    console.log('管理器初始化成功，开始在后台下载数据');
    initBackstageLoadConfig();
    window.DataManager.startDaemonLoad(getBackstageTasks());
    // window.DataManager.startDaemonLoad(getTestTasks());
  }
}
