class NDataManager {
  initCompleted = false; //管理器是否初始化完成
  idbTool = null; //缓存工具
  DaemonLoadManager = null; //后台下载管理器
  DaemonWorkerCount = 1; //后台下载管理器下载线程数目
  DaemonDelayTime = 0; //后台下载管理器下载线程数目
  DaemonWorkerUrl = null; //后台下载管理器的worker文件地址

  MemoryCache = new NMemoryCacheManager();

  loadManager = null; //下载管理器
  WorkerCount = 5; //下载管理器下载线程数目
  WorkerUrl = null; //下载管理器的worker文件地址
  initCompletedCallback = null;
  constructor(completedCallback) {
    // if (completedCallback) {
    //     this.initCompletedCallback = completedCallback.bind(this);
    // }
    // this.IDBcompleted = this.IDBcompleted.bind(this);
    // this.idbTool = new NIndexDBTool(this.IDBcompleted);
    this.initCompletedCallback = completedCallback;
    this.idbTool = new NIndexDBTool(new NCallbackDelegate(this, this.IDBcompleted));
  }
  IDBcompleted(msg) {
    if (!this.loadManager) {
      this.loadManager = new NLoadManager(this.WorkerCount);
      this.loadManager.WorkerUrl = this.WorkerUrl;
      this.loadManager.checkDataCached = this.contains.bind(this);
      this.loadManager.defaultLoadAction = new NCallbackDelegate(this, this.loadCallback);
    }
    if (this.idbTool) {
      this.idbTool.readedDataAction = new NCallbackDelegate(this, this.#readDataFromIndexDBCallback);
    }
    if (msg == 1) {
      if (!this.DaemonLoadManager) {
        this.DaemonLoadManager = new NLoadManager(this.DaemonWorkerCount);
        this.DaemonLoadManager.LoadDelayTime = this.DaemonDelayTime;
        this.DaemonLoadManager.WorkerUrl = this.DaemonWorkerUrl;
        this.DaemonLoadManager.checkDataCached = this.contains.bind(this);
        this.DaemonLoadManager.defaultLoadAction = new NCallbackDelegate(this, this.daemonLoadCallback);
      }
    }
    this.initCompleted = true;
    if (this.initCompletedCallback) {
      if (this.initCompletedCallback instanceof NCallbackDelegate) {
        this.initCompletedCallback.callback.apply(this.initCompletedCallback.actionScope, [msg]);
        this.initCompletedCallback.dispose();
        this.initCompletedCallback = null;
      } else {
        this.initCompletedCallback(msg);
      }
      this.initCompletedCallback = null;
    }
  }
  contains(key, dataType) {
    //判断缓存中是否有对应的数据
    if (this.initCompleted) {
      if (!dataType) {
        dataType = NCachedDataType.Data_2d;
      }
      return this.idbTool.contains(dataType, key) || this.MemoryCache.hasCacheData(key);
    }
    return false;
  }

  startDaemonLoad(dataInfoList) {
    //启动后台下载线程
    if (dataInfoList) {
      this.DaemonLoadManager.addTasks(dataInfoList);
      this.DaemonLoadManager.refreshLoading();
    }
  }
  daemonLoadCallback(data) {
    if (data) {
      switch (data.cacheType) {
        case NCacheType.OnlyIndexDB:
          this.#cacheToIndexDB(data);
          break;
        case NCacheType.OnlyMemory:
          this.#cacheToMemory(data);
          break;
        case NCacheType.IndexDBAndMemory:
          this.#cacheToMemory(data);
          this.#cacheToIndexDB(data);
          break;
        default:
          this.#cacheToIndexDB(data);
          break;
      }
    }
  }
  loadCallback(data) {
    if (data && data.cacheType != NCacheType.None) {
      switch (data.cacheType) {
        case NCacheType.OnlyIndexDB:
          this.#cacheToIndexDB(data);
          break;
        case NCacheType.OnlyMemory:
          this.#cacheToMemory(data);
          break;
        case NCacheType.IndexDBAndMemory:
          this.#cacheToMemory(data);
          this.#cacheToIndexDB(data);
          break;
        default:
          break;
      }
    }
  }
  #cacheToIndexDB(data) {
    if (data && this.idbTool && this.idbTool.initCompleted) {
      this.idbTool.insertData(data.dataType, data.key, data);
    }
  }

  #cacheToMemory(data) {
    if (data && this.MemoryCache) {
      this.MemoryCache.setCacheData(data.key, data);
    }
  }
  setWorkerUrl(url) {
    this.WorkerUrl = url;
    this.loadManager.setWorkerUrl(this.WorkerUrl);
  }
  setWorkerCount(num) {
    this.WorkerCount = num;
    this.loadManager.setWorkerCount(this.WorkerCount);
  }

  loadDatas(taskList) {
    //立刻下载一批数据
    if (taskList && taskList.length > 0) {
      var cachedList = [];
      for (var i = 0; i < taskList.length; i++) {
        if (this.contains(taskList[i].loadInfo.key, taskList[i].loadInfo.dataType)) {
          cachedList.push(taskList[i]);
        } else {
          this.loadManager.addTask(taskList[i], 0); //加入下载队列的队首
        }
      }
      this.loadManager.refreshLoading();
      taskList.length = 0;
      if (cachedList.length > 0) {
        for (var i = 0; i < cachedList.length; i++) {
          this.idbTool.readData(cachedList[i].loadInfo.dataType, cachedList[i].loadInfo.key, cachedList[i].TaskCallback);
          cachedList[i].disposeLoadInfo();
          if (cachedList[i].callback && cachedList[i].callback.dispose) {
            cachedList[i].callback.dispose();
          }
          cachedList[i].callback = null;
        }
        cachedList.length = 0;
      }
    }
  }
  loadData(task) {
    //立刻下载一份数据
    if (task) {
      if (this.contains(task.loadInfo.key, task.loadInfo.dataType)) {
        this.idbTool.readData(task.loadInfo.dataType, task.loadInfo.key, task.TaskCallback);
        task.disposeLoadInfo();
        if (task.callback && task.callback.dispose) {
          task.callback.dispose();
        }
        task.callback = null;
      } else {
        this.loadManager.addTask(task, 0); //加入下载队列的队首
        this.loadManager.refreshLoading();
      }
    }
  }
  removeLoadTask(taskKey) {
    this.loadManager.removeTask(taskKey);
  }
  removeLoadTasks(taskKeys) {
    this.loadManager.removeTasks(taskKeys);
  }
  clearLoadTasks() {
    this.loadManager.clearTasks();
  }
  readData(type, key, callback, intPtr) {
    //获取对应的数据
    if (this.initCompleted) {
      if (this.MemoryCache && this.MemoryCache.hasCacheData(key)) {
        this.#readDataFromMemory(type, key, callback, intPtr);
      } else if (this.idbTool && this.idbTool.contains(type, key)) {
        this.#readDataFromIndexDB(type, key, callback, intPtr);
      }
    }
  }
  // readDataByLoadInfo(loadinfo, callback) {//获取对应的数据
  //     if (this.initCompleted) {
  //         if(this.MemoryCache&&this.MemoryCache.hasCacheData(key)){
  //             this.#readDataFromMemory(type, key, callback,loadinfo.IntPtr);
  //         }else if(this.idbTool&&this.idbTool.contains(type, key)){
  //             this.#readDataFromIndexDB(type, key, callback);
  //         }
  //     }
  // }
  #readDataFromIndexDB(type, key, callback, intPtr) {
    this.idbTool.readData(type, key, callback, intPtr);
  }
  #readDataFromIndexDBCallback(data) {
    if (data && data.cacheType == NCacheType.IndexDBAndMemory) {
      this.MemoryCache.setCacheData(data.key, data);
    }
  }
  #readDataFromMemory(type, key, callback, intPtr) {
    var outData = this.MemoryCache.getCacheData(key);
    if (intPtr && intPtr > 0) {
      outData.IntPtr = intPtr;
    }
    if (callback instanceof NCallbackDelegate) {
      callback.callback.apply(callback.actionScope, [outData]);
      callback.dispose();
    } else {
      if (callback.callback) {
        if (!callback.actionScope[callback.callback.name]) {
          return;
        }
        callback.actionScope[callback.callback.name].apply(callback.actionScope, [outData]);
      } else {
        callback(outData);
      }
    }
  }
  clearCache() {}
}

class NMemoryCacheManager {
  // initCompletedCallback = null;
  // constructor(completedCallback) {
  //     this.initCompletedCallback = completedCallback;
  // }
  #CacheMap = new Map();
  hasCacheData(key) {
    var hasData = false;
    if (key) {
      hasData = this.#CacheMap.has(key);
    }
    return hasData;
  }
  getCacheData(key) {
    var value = null;
    if (key) {
      value = this.#CacheMap.get(key);
    }
    return value;
  }
  setCacheData(key, value) {
    if (key) {
      if (!this.#CacheMap) {
        this.#CacheMap = new Map();
      }
      this.#CacheMap.set(key, value);
    }
  }
  removeCacheData(key) {
    if (key && this.#CacheMap) {
      if (this.hasCacheData(key)) {
        this.#CacheMap.delete(key);
      }
    }
  }
  clear() {
    if (this.#CacheMap) {
      this.#CacheMap.clear();
    }
  }
}

class NIndexDBTool {
  initCompleted = false;
  indexDB = null;
  IDB = '';
  DataBaseName = 'NEWNSDB';
  Tables = [
    { tableName: NCachedDataType.Data_2d },
    { tableName: NCachedDataType.Data_3d },
    { tableName: NCachedDataType.Tiles_3d },
    { tableName: NCachedDataType.title3d }
  ];
  #TablesIndex = 0;
  TablesKeys = {};
  initCompletedCallback = null;
  readedDataAction = null;
  constructor(completedCallback) {
    // if (completedCallback) {
    //     this.initCompletedCallback = completedCallback.bind(this);
    // }
    this.initCompletedCallback = completedCallback;
    this.initIndexDB();
  }
  contains(tableName, key) {
    //判断缓存中是有对应的数据
    if (this.initCompleted && this.TablesKeys[tableName]) {
      if (this.TablesKeys[tableName].indexOf(key) > -1) {
        return true;
      }
    }
    return false;
  }
  getIndexDB() {
    const indexDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
    if (indexDB) {
      return indexDB;
    }
    console.log('当前浏览器不支持IndexDB');
    return null;
  }
  initIndexDB() {
    if (!this.IDB) {
      if (!this.indexDB) {
        this.indexDB = this.getIndexDB();
      }
      let request = indexedDB.open(this.DataBaseName);
      request.onerror = (evt) => {
        if (this.initCompletedCallback instanceof NCallbackDelegate) {
          this.initCompletedCallback.callback.apply(this.initCompletedCallback.actionScope, [0]);
          this.initCompletedCallback.dispose();
        } else {
          this.initCompletedCallback(0);
        }
        this.initCompletedCallback = null;
        console.log('IndexDB打开/创建出错', evt);
      };
      request.onupgradeneeded = (evt) => {
        this.IDB = evt.target.result; // 数据库对象
        for (var i = 0; i < this.Tables.length; i++) {
          this.createTable(this.Tables[i].tableName);
        }
        console.log('IndexDB数据库升级');
      };
      request.onsuccess = (evt) => {
        // success
        this.IDB = evt.target.result;
        console.log('IndexDB 打开/创建成功', evt);
        //this.clearTableData(NCachedDataType.Tiles_3d);
        this.#initKeyList();
      };
    }
  }
  #initKeyList() {
    for (var i = 0; i < this.Tables.length; i++) {
      // this.getKeyList(this.Tables[i].tableName, this.initKeyListCallback);
      var callbackDelegate = new NCallbackDelegate(this, this.#initKeyListCallback);
      this.getKeyList(this.Tables[i].tableName, callbackDelegate);
    }
  }
  #initKeyListCallback(tableName, keys) {
    this.#TablesIndex++;
    if (keys) {
      this.TablesKeys[tableName] = keys;
    }
    if (this.#TablesIndex >= this.Tables.length) {
      this.initCompleted = true;
      if (this.initCompletedCallback instanceof NCallbackDelegate) {
        this.initCompletedCallback.callback.apply(this.initCompletedCallback.actionScope, [1]);
        this.initCompletedCallback.dispose();
      } else {
        this.initCompletedCallback(1);
      }
      this.initCompletedCallback = null;
    }
  }
  getKeyList(tableName, callback) {
    if (tableName && callback) {
      var objectStore = this.IDB.transaction(tableName).objectStore(tableName);
      var request = objectStore.getAllKeys();

      request.onerror = function (evt) {
        console.log('事务失败');
      };
      request.onsuccess = function (evt) {
        if (request.result) {
          if (callback instanceof NCallbackDelegate) {
            callback.callback.apply(callback.actionScope, [tableName, request.result]);
            callback.dispose();
          } else {
            callback(tableName, request.result);
          }
          // callback(tableName, request.result);
        } else {
          // console.log('未获得数据记录');
          if (callback instanceof NCallbackDelegate) {
            callback.callback.apply(callback.actionScope, [null]);
            callback.dispose();
          } else {
            callback(null);
          }
        }
      };
    }
  }
  createTable = (tableName) => {
    if (!this.IDB.objectStoreNames.contains(tableName)) {
      var objectStore = this.IDB.createObjectStore(tableName, { keyPath: 'id' });
      // objectStore.createIndex('code', 'code', { unique: false });
      // objectStore.createIndex('email', 'email', { unique: true });
    }
  };
  #addKeyRecords(tableName, key) {
    if (this.initCompleted && this.TablesKeys[tableName]) {
      if (tableName && key && this.TablesKeys[tableName].indexOf(key) < 0) {
        this.TablesKeys[tableName].push(key);
      }
    }
  }
  insertData(tableName, key, value) {
    if (tableName && key && value) {
      if (this.contains(tableName, key)) {
        this.updateData(tableName, key, value);
      } else {
        var request = this.IDB.transaction([tableName], 'readwrite').objectStore(tableName).add({ id: key, data: value });

        request.onsuccess = function (evt) {
          // console.log('数据写入成功' + key);
        };

        request.onerror = function (evt) {
          console.log('数据写入失败' + key);
        };
        this.#addKeyRecords(tableName, key);
      }
    }
  }
  updateData(tableName, key, value) {
    if (tableName && key && value) {
      var request = this.IDB.transaction([tableName], 'readwrite').objectStore(tableName).put({ id: key, data: value });

      request.onsuccess = function (event) {
        console.log('数据更新成功');
      };

      request.onerror = function (event) {
        console.log('数据更新失败');
      };
    }
  }
  readData(tableName, key, callback, intPtr) {
    if (tableName && key && callback) {
      var root = this;
      var transaction = this.IDB.transaction([tableName]);
      var objectStore = transaction.objectStore(tableName);
      var request = objectStore.get(key);

      request.onerror = function (evt) {
        console.log('事务失败');
      };
      request.onsuccess = function (evt) {
        if (callback) {
          var data = null;
          if (request.result) {
            data = request.result.data;
            data.IntPtr = intPtr;
          } else {
            data = { key: key, IntPtr: intPtr, data: null };
          }
          if (data == null || data.data == null) {
            root.deleteData(tableName, key);
          }
          if (root.readedDataAction) {
            // 是否有默认的回调函数要执行
            root.readedDataAction.callback.apply(root.readedDataAction.actionScope, [data]);
          }
          if (callback instanceof NCallbackDelegate) {
            callback.callback.apply(callback.actionScope, [data]);
            callback.dispose();
          } else {
            if (callback.callback) {
              if (!callback.actionScope[callback.callback.name]) {
                return;
              }
              callback.actionScope[callback.callback.name].apply(callback.actionScope, [data]);
            } else {
              callback(data);
            }
          }
        }
      };
    }
  }
  readDataByKey(tableName, keyName, key, callback) {
    if (tableName && key && callback) {
      var transaction = this.IDB.transaction([tableName]);
      var objectStore = transaction.objectStore(tableName);
      var index = objectStore.index(keyName);
      var request = index.get(key);

      request.onerror = function (evt) {
        console.log('事务失败');
      };
      request.onsuccess = function (evt) {
        if (request.result) {
          // console.log('id: ' + request.result.id);
          // console.log('data: ' + request.result.data);
          if (callback) {
            if (callback instanceof NCallbackDelegate) {
              callback.callback.apply(callback.actionScope, [{ key: request.result.id, data: request.result.data }]);
              callback.dispose();
            } else {
              callback({ key: request.result.id, data: request.result.data });
            }
          }
        } else {
          // console.log('未获得数据记录');
          if (callback instanceof NCallbackDelegate) {
            callback.callback.apply(callback.actionScope, [null]);
            callback.dispose();
          } else {
            callback(null);
          }
        }
      };
    }
  }
  readAllData(tableName, callback) {
    if (tableName && callback) {
      var objectStore = this.IDB.transaction(tableName).objectStore(tableName);
      var list = [];
      objectStore.openCursor().onsuccess = function (evt) {
        var cursor = evt.target.result;
        if (cursor) {
          list.push({ key: cursor.id, data: cursor.data });
          cursor.continue();
        } else {
          if (callback instanceof NCallbackDelegate) {
            callback.callback.apply(callback.actionScope, [list]);
            callback.dispose();
          } else {
            callback(list);
          }
        }
      };
    }
  }
  deleteData(tableName, key) {
    if (tableName && key) {
      var request = this.IDB.transaction([tableName], 'readwrite').objectStore(tableName).delete(key);
      request.onsuccess = function (event) {};
    }
  }
  clearTableData(tableName) {
    if (tableName) {
      // 创建一个事务
      var transaction = this.IDB.transaction([tableName], 'readwrite');

      // 获取对象存储
      var store = transaction.objectStore(tableName);

      // 清除对象存储中的所有数据
      var request = store.clear();

      // 成功回调
      request.onsuccess = function (event) {
        console.log('表中的所有数据已成功清除');
      };

      // 错误回调
      request.onerror = function (event) {
        console.error('清除数据失败', event.target.error);
      };
    }
  }
  closeDB() {}
}

class NLoadManager {
  LoadDelayTime = 0; //下载间隔时间，单位毫秒，默认为0，
  pauseEnabled = false;
  WorkerList = null;
  WorkerCount = 5;
  LoaderOrder = 0; //任务压入队首还是队尾，0，队尾；1，队首
  WorkerUrl = null;
  #taskList = new Array();
  #loadingWorkers = new Array();
  #freeWorkers = new Array();
  #taskMap = new Map();
  checkDataCached = null;
  defaultLoadAction = null;
  constructor(count) {
    if (count) {
      this.WorkerCount = count;
      this.WorkerList = new Array();
    }
  }
  hasTask(key) {
    return this.#taskMap.has(key);
  }
  getTask(key) {
    return this.#taskMap.get(key);
  }
  setPauseEnabled(v) {
    //暂停下载
    this.pauseEnabled = v;
    if (!this.pauseEnabled) {
      this.refreshLoading();
    }
  }
  setWorkerUrl(url) {
    this.WorkerUrl = url;
    // if(){}
  }
  setWorkerCount(num) {
    this.WorkerCount = num;
  }

  addTask(task, loadOrder) {
    if (task) {
      if (!this.hasTask(task.key)) {
        this.#taskMap.set(task.key, task);
        if (loadOrder || this.LoaderOrder) {
          this.#taskList.unshift(task);
        } else {
          this.#taskList.push(task);
        }
      }
    }
  }
  addTasks(tasks) {
    if (tasks && tasks.length > 0) {
      for (let i = 0; i < tasks.length; i++) {
        this.addTask(tasks[i]);
      }
    }
  }
  removeTask(key) {
    if (key) {
      if (this.hasTask(key)) {
        var task = this.#taskMap.get(key);
        var i = this.#taskList.indexOf(task);
        this.#taskMap.delete(key);
        if (i >= 0) {
          console.log('removeTask success:' + key);
          var tmp = this.#taskList.splice(i, 1);
          if (tmp) {
            tmp[0].dispose();
          }
        } else {
          //正在下载中，等待下载完成
          console.log('removeTask Abort:' + key);
        }
      }
    }
  }
  removeTask1(key) {
    if (key) {
      if (this.hasTask(key)) {
        var task = this.#taskMap.get(key);
        var i = this.#taskList.indexOf(task);
        this.#taskMap.delete(key);
        if (i >= 0) {
          // console.log("removeTask success:"+key);
          var tmp = this.#taskList.splice(i, 1);
          if (tmp) {
            tmp[0].dispose();
          }
        } else {
          //正在下载中，等待下载完成
          // console.log("removeTask Abort:"+key);
        }
      }
    }
  }
  removeTasks(keys) {
    if (keys && keys.length > 0) {
      for (var i = 0; i < keys.length; i++) {
        this.removeTask(keys[i]);
      }
    }
  }

  /**
   * 清空某一类的下载任务
   * @param {*} tableName 需要清空的下载类型
   */
  clearTypeDownloadTasks(tableName) {
    if (this.#taskList && this.#taskList.length > 0) {
      let tmpArray = new Array();
      for (let i = 0; i < this.#taskList.length; i++) {
        if (this.#taskList[i].loadInfo.dataType == tableName) {
          tmpArray.push(this.#taskList[i]);
        }
      }
      for (let i = 0; i < tmpArray.length; i++) {
        this.removeTask(tmpArray[i].key);
      }
    }
  }

  refreshLoading() {
    if (!this.pauseEnabled) {
      if (this.#taskList && this.#loadingWorkers) {
        var worker = null,
          task = null;
        var isCached = false;
        //  console.log("length：" + this.#loadingWorkers.length + "-this.WorkerCount:" + this.WorkerCount);
        while (this.#taskList.length > 0 && this.#loadingWorkers.length < this.WorkerCount) {
          task = this.#taskList.shift();
          if (this.checkDataCached) {
            isCached = this.checkDataCached(task.loadInfo.key, task.loadInfo.dataType);
          }
          if (!isCached) {
            worker = this.#freeWorkers.shift();
            if (!worker) {
              worker = new NLoadWorker();
              worker.WorkerUrl = this.WorkerUrl;
              worker.pManager = this;
            }
            this.#loadingWorkers.push(worker);
            if (this.LoadDelayTime) {
              task.loadInfo.delayTime = this.LoadDelayTime;
            }
            worker.loadData(task);
          } else {
            // console.log('缓存中已存在该数据:' + task.loadInfo.dataType + "_" + task.loadInfo.key);
            task.dispose();
          }
        }
        this.closeFreeWorkers();
        if (this.#loadingWorkers.length == 0) {
          // console.timeEnd("后台下载结束");
          // window.readTest.apply(window, []);
        }
        // console.log("refreshLoading, taskList:"+this.#taskList.length+" loadingWorkers:"+this.#loadingWorkers.length+" freeWorkers:"+this.#freeWorkers.length+" taskMap:"+this.#taskMap.size);
      }
    }
  }
  closeFreeWorkers() {
    if (this.#freeWorkers && this.#freeWorkers.length > 0) {
      for (var i = 0; i < this.#freeWorkers.length; i++) {
        this.#freeWorkers[i].closeWorker();
      }
    }
  }
  removeLoadingWorker = function (worker) {
    if (worker) {
      var i = this.#loadingWorkers.indexOf(worker);
      if (i >= 0) {
        if (worker.Status == NWorkerStatus.idle) {
          // worker.abort();
          this.#loadingWorkers.splice(this.#loadingWorkers.indexOf(worker), 1);
          this.#freeWorkers.push(worker);
        }
      }
    } else {
      // if (this.loadingWorkers) {
      //     while (this.loadingWorkers.length > 0) {
      //         this.loadingWorkers[0].abort();
      //         this.freeLoaders.push(this.loadingWorkers.shift());
      //     }
      //     this.loadingWorkers.length = 0;
      // }
    }
  };
  clearTasks() {
    if (this.#taskList && this.#taskList.length > 0) {
      this.#taskMap.clear();
      var tmpArray = this.#taskList;
      this.#taskList = new Array();
      for (var i = 0; i < tmpArray.length; i++) {
        tmpArray[i].dispose();
      }
      tmpArray.length = 0;
    }
  }
  dispose() {
    this.clearTasks();
    this.closeFreeWorkers();
    // #loadingWorkers = new Array();
    // #freeWorkers = new Array();
    this.checkDataCached = null;
    this.defaultLoadAction = null;
  }
}

class NLoadWorker {
  #loadWorker = null;
  #loadCount = 10;
  #loadIndex = 0;
  type = 'loadworker'; //当前worker的类型
  Status = null;
  WorkerUrl = '';
  CurrentTask = null;
  LoadKey = null;
  pManager = null; //所属管理器
  constructor(workerUrl) {
    if (workerUrl) {
      this.WorkerUrl = workerUrl;
    }
    this.Status = NWorkerStatus.idle;
    this.onWorkerMessage = this.onWorkerMessage.bind(this);
  }
  #createLoadWorker() {
    if (this.WorkerUrl && !this.#loadWorker) {
      this.#loadWorker = new Worker(this.WorkerUrl);
      this.#loadWorker.onmessage = this.onWorkerMessage;
    }
  }

  setWorkerUrl(url) {
    // this.WorkerUrl=url;
  }

  onWorkerMessage(evt) {
    //这个地方很可能没有验证全面
    if (evt && evt.data) {
      //载入成功
      if (evt.data.msg == 'success' || evt.data.msg == 'ok') {
        if (this.CurrentTask) {
          var outData = {
            key: evt.data.loadInfo.key,
            cacheType: evt.data.loadInfo.cacheType,
            dataType: evt.data.loadInfo.dataType,
            IntPtr: evt.data.loadInfo.IntPtr,
            data: evt.data
          };
          // delete evt.data.loadInfo;
          if (this.pManager.defaultLoadAction) {
            this.pManager.defaultLoadAction.callback.apply(this.pManager.defaultLoadAction.actionScope, [outData]);
          }
          if (this.CurrentTask.TaskCallback) {
            if (this.CurrentTask.TaskCallback instanceof NCallbackDelegate) {
              this.CurrentTask.TaskCallback.callback.apply(this.CurrentTask.TaskCallback.actionScope, [outData]);
            } else {
              if (this.CurrentTask.TaskCallback.callback) {
                if (this.CurrentTask.TaskCallback.actionScope[this.CurrentTask.TaskCallback.callback.name]) {
                  this.CurrentTask.TaskCallback.actionScope[this.CurrentTask.TaskCallback.callback.name].apply(
                    this.CurrentTask.TaskCallback.actionScope,
                    [outData]
                  );
                }
              } else {
                this.CurrentTask.TaskCallback(outData);
              }
            }
          }
          this.pManager.removeTask1(this.CurrentTask.key);
          this.CurrentTask.dispose();
          this.CurrentTask = null;
          this.Status = NWorkerStatus.idle;
          this.pManager.removeLoadingWorker(this);
        }
      } else if (this.CurrentTask && evt.data.msg == 'error') {
        if (this.CurrentTask) {
          var outData = {
            key: evt.data.loadInfo.key,
            cacheType: evt.data.loadInfo.cacheType,
            dataType: evt.data.loadInfo.dataType,
            data: null
          };
          if (this.pManager.defaultLoadAction) {
            this.pManager.defaultLoadAction.callback.apply(this.pManager.defaultLoadAction.actionScope, [outData]);
          }
          if (this.CurrentTask.TaskCallback) {
            if (this.CurrentTask.TaskCallback instanceof NCallbackDelegate) {
              this.CurrentTask.TaskCallback.callback.apply(this.CurrentTask.TaskCallback.actionScope, [outData]);
            } else {
              if (this.CurrentTask.TaskCallback.callback) {
                if (this.CurrentTask.TaskCallback.actionScope[this.CurrentTask.TaskCallback.callback.name]) {
                  this.CurrentTask.TaskCallback.actionScope[this.CurrentTask.TaskCallback.callback.name].apply(
                    this.CurrentTask.TaskCallback.actionScope,
                    [outData]
                  );
                }
              } else {
                this.CurrentTask.TaskCallback(outData);
              }
              // this.CurrentTask.TaskCallback(outData);
            }
          }
          this.pManager.removeTask1(this.CurrentTask.key);
          // this.CurrentTask.dispose();
          this.CurrentTask = null;
          this.Status = NWorkerStatus.idle;
          this.pManager.removeLoadingWorker(this);
        }
      }
    } else {
      //失败
      /////////////////////注意校验数据//////////////////////////////////
      this.CurrentTask.dispose();
      this.CurrentTask = null;
      this.Status = NWorkerStatus.idle;
      if (this.pManager) {
        this.pManager.removeLoadingWorker(this);
      }
    }
    this.#loadIndex++;
    if (this.#loadIndex >= this.#loadCount) {
      this.closeWorker();
    }
    if (this.pManager) {
      this.pManager.refreshLoading();
    }
  }
  loadData(task) {
    this.CurrentTask = task;
    if (this.CurrentTask.workerUrl) {
      if (this.CurrentTask.workerUrl != this.WorkerUrl) {
        this.closeWorker();
        this.WorkerUrl = this.CurrentTask.workerUrl;
      }
    } else {
      if (this.WorkerUrl != this.pManager.WorkerUrl) {
        this.closeWorker();
        this.WorkerUrl = this.pManager.WorkerUrl;
      }
    }
    if (!this.#loadWorker) {
      this.#createLoadWorker();
    }
    this.flagData();
    this.#loadWorker.postMessage({ msg: 'load', loadInfo: this.CurrentTask.loadInfo });
    this.Status = NWorkerStatus.working;
  }
  flagData() {
    this.LoadKey = this.CurrentTask.key;
  }
  validationData(key) {
    if (this.LoadKey == key) {
      return true;
    } else {
      return false;
    }
  }
  stopLoad() {
    // if(this.#loadWorker){
    //     this.#loadWorker.postMessage({ msg: "stopload", loadInfo: this.CurrentTask});
    // }
  }
  closeWorker() {
    this.#loadIndex = 0;
    if (this.#loadWorker) {
      this.#loadWorker.terminate();
      this.#loadWorker = null;
    }
    this.Status = NWorkerStatus.closed;
  }
  dispose() {
    this.closeWorker();
    this.#loadWorker = null;
    this.WorkerUrl = null;
    this.CurrentTask = null;
    this.pManager = null;
    this.Status = NWorkerStatus.disposed;
  }
}
class NCallbackDelegate {
  callback = null;
  actionScope = null;
  constructor(target, func) {
    this.callback = func;
    this.actionScope = target;
  }
  dispose() {
    this.callback = null;
    this.actionScope = null;
  }
}
class NLoadTask {
  loadInfo = null;
  key = null;
  workerUrl = null;
  // url = null;
  // parsType=0;
  TaskStatus = NLoadStatus.wait;
  TaskCallback = null;
  constructor(callback) {
    // this.url = url;
    this.TaskCallback = callback;
  }
  disposeLoadInfo() {
    if (this.loadInfo) {
      this.loadInfo.dataUrl = null;
      this.loadInfo.key = null;
      this.loadInfo.dataType = null;
    }
    this.loadInfo = null;
  }
  dispose() {
    if (this.TaskCallback) {
      if (this.TaskCallback.dispose) {
        this.TaskCallback.dispose();
      }
      this.TaskCallback = null;
      this.key = null;
    }
    this.disposeLoadInfo();
  }
}
class NCachedDataType {
  static title3d = 'base_3d';
  static Data_2d = 'data_2d';
  static Data_3d = 'data_3d';
  static Tiles_3d = 'tiles_3d';
}
class NDataParsType {
  static linePos = 0; //流向数据的解析
  static posAndIns = 1; //风暴潮格式的数据
  static triangle = 2; //三角面
  static depth = 2; //水深数组
  static buffer = 9; //二进制数据
  static b3dm = 11;
  static buffer3D = 12;
  static stringU8 = 13;
  static b3dm_pars = 15;
}
class NCacheType {
  static None = 0; //不缓存
  static OnlyIndexDB = 1; //只缓存到IndexDB中
  static IndexDBAndMemory = 2; //缓存到IndexDB和内存中
  static OnlyMemory = 3; //只缓存到内存中
}
class NLoadInfo {
  key = null;
  dataUrl = null;
  dataType = NCachedDataType.Data_2d;
  parsType = NDataParsType.linePos;
  cacheType = NCacheType.OnlyIndexDB;
  Authorization = null;
  depthColors = null;
  togglePlayColor = null;
  headerArrayBuffer = null;
  IntPtr = -1;
  delayTime = 0;
  newFlow = false;
}
class NWorkerStatus {
  static idle = 1; //空闲
  static working = 2; //运行中
  static closed = 4; //已关闭
  static disposed = 5; //已销毁
}
class NLoadStatus {
  wait = 0; //等待
  loading = 1; //下载中
  success = 2; //下载成功
  error = 4; //下载错误
}
