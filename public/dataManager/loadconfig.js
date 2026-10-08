function getBackstageTasks() {
  var tasks = [];
  if (BackstageLoadConfig) {
    var dconfig = null;
    for (var i = 0; i < BackstageLoadConfig.length; i++) {
      dconfig = BackstageLoadConfig[i];
      switch (dconfig.TaskType) {
        case 0:
          tasks.push(...createTasks0(dconfig));
          break;
        case 1:
          break;
        case 2:
          break;
      }
    }
  }
  return tasks;
}

function getTestTasks() {
    var tList = [];
    let count = 400;
    for (var i = 0; i < count; i++) {
      var task = new NLoadTask();
      task.loadInfo = new NLoadInfo();
      task.loadInfo.key = "testdata" + (i + 1);
      task.loadInfo.dataType = "data_2d";
      task.loadInfo.parsType = 1;
      task.loadInfo.dataUrl = 'http://192.168.20.10:9584/datav/2D_year100Data/year100Data/year100_4.json';
      task.key = task.loadInfo.dataType + "_" + task.loadInfo.key;
      task.TaskCallback = null;
      tList.push(task);
    }
    return tList;
  }


function createTasks0(dconfig) {
  var tList = [];
  let count = dconfig.DataCount;
  let startnum = dconfig.StartNum;
  for (var i = startnum; i < count; i++) {
    var task = new NLoadTask();
    task.loadInfo = new NLoadInfo();
    task.loadInfo.key = dconfig.KeyRoot + (i + 1);
    task.loadInfo.dataType = dconfig.DataType;
    task.loadInfo.parsType = dconfig.parsType;
    task.loadInfo.dataUrl = dconfig.DataUrl.replace("{num}", i + 1);
    task.key = task.loadInfo.dataType + "_" + task.loadInfo.key;
    task.TaskCallback = null;
    tList.push(task);
  }
  return tList;
}
let BackstageLoadConfig = null;
function initBackstageLoadConfig() {
  BackstageLoadConfig = [
    // {
    //   DataName: "内涝100年",
    //   KeyRoot: "year100_",
    //   DataUrl:
    //     window.ApiCongfig.VUE_APP_MINIO_API +
    //     "/datav/2D_year100Data/year100Data/year100_{num}.json",
    //   StartNum: 0,
    //   DataCount: 33,
    //   DataType: "data_2d", //NCachedDataType
    //   parsType: 1, //NDataParsType
    //   TaskType: 0,
    // },
    // {
    //   DataName: "内涝50年",
    //   KeyRoot: "year50_",
    //   DataUrl:
    //     window.ApiCongfig.VUE_APP_MINIO_API +
    //     "/datav/2D_year50Data/year50_{num}.json",
    //   StartNum: 0,
    //   DataCount: 41,
    //   DataType: "data_2d", //NCachedDataType
    //   parsType: 1, //NDataParsType
    //   TaskType: 0,
    // },
    // {
    //   DataName: "流向数据2017",
    //   KeyRoot: "flow_2017_",
    //   DataUrl:
    //     "http://192.168.20.10:9589/tomcat/data/nansha2d/flow/flow_2017_{num}.json",
    //   StartNum: 0,
    //   DataCount: 220,
    //   DataType: "data_2d", //NCachedDataType
    //   parsType: 0, //NDataParsType
    //   TaskType: 0,
    // },
    // {
    //   DataName: "流向数据2018",
    //   KeyRoot: "flow_2018_",
    //   DataUrl:
    //     "http://192.168.20.10:9589/tomcat/data/nansha2d/flow/flow_2018_{num}.json",
    //   StartNum: 0,
    //   DataCount: 160,
    //   DataType: "data_2d", //NCachedDataType
    //   parsType: 0, //NDataParsType
    //   TaskType: 0,
    // },
  ];
}
