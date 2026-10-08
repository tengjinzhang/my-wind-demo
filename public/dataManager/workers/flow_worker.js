var dInfo = null;
var playDepthColors = null;
var loadInfo = null;
var bufferArray = [];
let shortMap = ['X', 'Y', 'H', 'Zb', 'waterLevel', 'U', 'V', 'ID', 'RiskLevel', 'NewX', 'NewY', 'flow'];
const ShaftmentLength_LevelCount = 10;
const minShaftmentLength = 2;
let RADIANS_PER_DEGREE = Math.PI / 180.0;
let RadiiSquared = { x: 40680631590769, y: 40680631590769, z: 40408299984661.445 };
const tmpShowLevels = [8, 9, 10, 11, 12, 13, 14, 15, 14, 15, 14, 15, 14, 15];
let flowMinLevels = [];
let withRange = [0.8, 1.2, 1.4, 1.6, 1.8, 2];
let arrow_colors = [
  { color: '#002FED', rgba: [0, 0.1843137254901961, 0.9294117647058824], num: 0 },
  { color: '#1955F1', rgba: [0.09803921568627451, 0.3333333333333333, 0.9450980392156862], num: 1 },
  { color: '#327BF5', rgba: [0.19607843137254902, 0.4823529411764706, 0.9607843137254902], num: 2 },
  { color: '#4BA1F9', rgba: [0.29411764705882354, 0.6313725490196078, 0.9764705882352941], num: 3 },
  { color: '#64C8FD', rgba: [0.39215686274509803, 0.7843137254901961, 0.9921568627450981], num: 4 },
  { color: '#70E0EA', rgba: [0.4392156862745098, 0.8784313725490196, 0.9176470588235294], num: 5 },
  { color: '#68E1B5', rgba: [0.40784313725490196, 0.8823529411764706, 0.7098039215686275], num: 6 },
  { color: '#60E280', rgba: [0.3764705882352941, 0.8862745098039215, 0.5019607843137255], num: 7 },
  { color: '#57E44B', rgba: [0.3411764705882353, 0.8941176470588236, 0.29411764705882354], num: 8 },
  { color: '#4FE516', rgba: [0.30980392156862746, 0.8980392156862745, 0.08627450980392157], num: 9 },
  { color: '#6AEB0B', rgba: [0.41568627450980394, 0.9215686274509803, 0.043137254901960784], num: 10 },
  { color: '#92F112', rgba: [0.5725490196078431, 0.9450980392156862, 0.07058823529411765], num: 11 },
  { color: '#B5F60B', rgba: [0.7098039215686275, 0.9647058823529412, 0.043137254901960784], num: 12 },
  { color: '#D5FB1D', rgba: [0.8352941176470589, 0.984313725490196, 0.11372549019607843], num: 13 },
  { color: '#F2FE1E', rgba: [0.9490196078431372, 0.996078431372549, 0.11764705882352941], num: 14 },
  { color: '#FADE18', rgba: [0.9803921568627451, 0.8705882352941177, 0.09411764705882353], num: 15 },
  { color: '#FEBA12', rgba: [0.996078431372549, 0.7294117647058823, 0.07058823529411765], num: 16 },
  { color: '#FE940B', rgba: [0.996078431372549, 0.5803921568627451, 0.043137254901960784], num: 17 },
  { color: '#FE230A', rgba: [0.996078431372549, 0.13725490196078433, 0.0392156862745098], num: 18 }
];

self.onmessage = function (evt) {
    loadInfo = evt.data.loadInfo;
  switch (evt.data.msg) {
      case 'load':
          {
           
              loadData();
          }
      break;
  }
};
function loadData() {
  try {
    bufferArray.length = 0;
    let e = new XMLHttpRequest();
    if (loadInfo.headerArrayBuffer || loadInfo.parsType == 11 || loadInfo.parsType == 12 || loadInfo.parsType == 13 || loadInfo.parsType == 15) {
      e.responseType = 'arraybuffer';
    }
    e.onload = function () {
      if (e.readyState == 4 && e.status == 200) {
        var d = null;
        if (loadInfo.headerArrayBuffer) {
          d = e.response;
          playDepthColors = JSON.parse(loadInfo.depthColors);
        } else if (loadInfo.parsType == 11 || loadInfo.parsType == 12 || loadInfo.parsType == 13 || loadInfo.parsType == 15) {
          d = e.response;
        } else {
          d = JSON.parse(e.response);
        }
        if (d) {
          switch (loadInfo.parsType) {
            case 0:
              d = parsData0(d);
              break;
            case 1:
              d = parsData1(d);
              break;
            case 2:
              d = parsData2(d);
              break;
            case 3:
              d = parsData3(d);
              break;
            case 4:
            case 5:
              d = parsData4(d, loadInfo.parsType);
              break;
            case 6:
              d = parsData6(d);
              break;
            case 7:
              d = parsData7(d);
              break;
            case 11:
              d = parsData11(e.response);
              break;
            case 12:
              d = parsData11(e.response);
              break;
            case 13:
              d = parsData11(e.response);
              break;
            case 15:
                  d = parsData15(e.response);
              break;
            case 100:
              d = parsData100(d);
              break;
            case 101:
              d = parsData101(d);
              break;
            case 102:
              d = parsData102(d);
              break;
            case 103:
              d = parsData103(d);
              break;
            case 104:
              d = parsData104(d);
              break;
            case 105:
              d = parsData105(d);
              break;
            default:
              d = parsData0(d);
              break;
          }
          d.loadInfo = loadInfo;
          d.msg = 'success';
          // debugger
          self.postMessage(d, bufferArray);

          if (d.loadInfo) {
            disposeObject(d.loadInfo);
            // d.loadInfo.key=null;
            // d.loadInfo.dataUrl=null;
            d.loadInfo = null;
          }
          d.pos = null;
        } else {
          self.postMessage({ loadInfo: loadInfo, msg: 'success' });
        }
      } else {
        self.postMessage({ loadInfo: loadInfo, msg: 'error' });
      }
      clear();
    };
      if (loadInfo.dataUrl != "") {
          e.open('GET', loadInfo.dataUrl, false);
      }
      else {
          console.log("dataUrl:" + loadInfo.dataUrl);
          self.postMessage({ loadInfo: loadInfo, msg: 'error' });
      }
 
    if (loadInfo.Authorization) {
      e.setRequestHeader('Content-type', 'application/json');
      e.setRequestHeader('Authorization', 'Basic YWRtaW46YzYxZDRmYzMtM2RhMS00ZTQ5LWIzYWYtNDgxYzZmMzFiNzI3');
    }
    e.send(null);
  } catch (e) {
    self.postMessage({ loadInfo: loadInfo, msg: 'error' });
  }
}

function clear() {
  if (loadInfo) {
    disposeObject(loadInfo);
    loadInfo = null;
  }
  bufferArray.length = 0;
  // bufferArray=null;
}

function disposeObject(v) {
  if (v) {
    if (v instanceof Array) {
      for (let item of v) {
        item = null;
      }
    } else if (v instanceof Object) {
      for (let key in v) {
        v[key] = null;
      }
    }
  }
}

function parsData0(obj) {
  var fd = {};
  if (obj && obj.length > 0) {
    obj = getArowPos(obj);

    fd.pos = new Int32Array(crdArr2c3(obj));
    bufferArray.push(fd.pos.buffer);
    obj.length = 0;
  }
  return fd;
}

function parsData1(obj) {
  //内涝数据
  var fd = {};
  if (obj && obj.length > 0) {
    for (var i = 0; i < obj.length; i++) {
      obj[i].ins = new Int32Array(obj[i].ins);
      obj[i].pos = new Int32Array(crdArr2c3(obj[i].pos));
      // obj[i].type=obj[i].type;
      obj[i].color = playDepthColors[obj[i].type].color;
      obj[i].rgba = playDepthColors[obj[i].type]?.rgba;

      bufferArray.push(obj[i].ins.buffer);
      bufferArray.push(obj[i].pos.buffer);
    }
    fd.ts = obj;
  }
  return fd;
}

// 风暴潮 二维河网
function parsData2(obj) {
  let resObj = {};
  let posList = [];
  bufferArray = [];

  if (obj) {
    var tarr = null;

    obj.forEach((item) => {
      let posArr = [...item, item[0], item[1]];
      // tarr = new Float32Array(crdArr2c3(posArr));
      tarr = crdArr2c3(posArr);
      posList.push(tarr);
      // bufferArray.push(tarr.buffer);
    });
  }

  resObj.data = posList;

  return resObj;
}

function parsData3(obj) {
  let pos = [];
  bufferArray = [];

  let tarr = new Float32Array(obj);
  pos.push(tarr);
  bufferArray.push(tarr.buffer);

  return obj;
}

/**
 * 从二进制文件中读取数据并反序列化为一个TriangleNodeExportModel对象
 * @param {string} filePath - 文件路径
 * @returns {TriangleNodeExportModel} - 反序列化得到的对象
 */
function deserializeFromBinaryFile(filePath) {
  const fs = require('fs');
  const model = new TriangleNodeExportModel();

  const buffer = fs.readFileSync(filePath); // 读取整个文件到缓冲区
  let offset = 0;

  // 从缓冲区中读取Count
  model.Count = buffer.readInt32LE(offset);
  offset += 4;

  // 读取Data
  while (offset < buffer.length) {
    const dataItem = new TriangleNodeWithId();
    dataItem.Id = buffer.readInt32LE(offset);
    offset += 4;
    dataItem.PointA = buffer.readInt32LE(offset);
    offset += 4;
    dataItem.PointB = buffer.readInt32LE(offset);
    offset += 4;
    dataItem.PointC = buffer.readInt32LE(offset);
    offset += 4;
    model.Data.push(dataItem);
  }

  return model;
}

function parsData4(obj, num) {
  let propList = [];
  let names = [];
  let tableList = [];
  // key遍历
  let sortKeys = Object.keys(obj).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  // 对应数据
  for (const key in sortKeys) {
    tableList.push({
      [sortKeys[key]]: obj[sortKeys[key]]
    });
  }

  // 转换数据
  let newTableList = tableList.map((item, index) => {
    names = Object.values(item)[0].map((item) => item.name);
    return {
      time: Object.keys(item)[0],
      list: Object.values(item)[0].map((item) => item.state),
      name: Object.values(item)[0].map((item) => item.name)
    };
  });

  // table数据格式
  newTableList = newTableList.map((item) => {
    const list = {};
    item.list.forEach((v, i) => {
      list['state' + i] = v;
    });

    return { time: item.time, ...list };
  });

  names.forEach((item, i) => {
    propList.push({
      prop: 'state' + i,
      label: item,
      center: 'center',
      hidden: false
    });
  });

  return { propList, newTableList, num, obj };
}

function parsData5(obj) {}

function parsData6(arrayBuffer) {
  let resObj = {};
  let pos = [];
  let posList = [];
  let posList2 = [];
  bufferArray = [];

  let tarr = new Float64Array(arrayBuffer);

  for (let i = 0; i < tarr.length; i++) {
    pos.push(tarr[i]);

    if (pos.length == 6) {
      let tempPos = crdArr2c3([...pos, pos[0], pos[1]]);
      // let tempPos = [...pos, pos[0], pos[1]];
      posList.push(tempPos);
      posList2.push([...pos, pos[0], pos[1]]);
      pos = [];
    }
  }

  resObj.data = posList;
  resObj.ins = posList2;
  resObj.coordinateType = 'Descartes';

  return resObj;
}

function parsData7(arrayBuffer) {
  bufferArray = [];

  let data = new Float32Array(parsAttributeData(arrayBuffer));
  let colorIns = [];

  for (let i = 0; i < data.length; i++) {
    let h = data[i];
    const index = getColorMap(h);
    colorIns.push(index);
  }

  colorIns = new Int32Array(colorIns);
  bufferArray.push(data.buffer, colorIns.buffer);

  return {
    data: data,
    ins: colorIns,
    levelData: loadInfo.togglePlayColor,
    legend: playDepthColors
  };
}

// 获取二维河网颜色值
const getColorMap = (value) => {
  let legendList = playDepthColors;
  if (legendList && legendList.length > 0) {
    let index = legendList.length - 1;

    for (let i = 0; i < legendList.length; i++) {
      let min = legendList[i].min;
      let max = legendList[i].max;
      let inclusiveMin = legendList[i].inclusiveMin;
      let inclusiveMax = legendList[i].inclusiveMax;

      let minValid = !min || (inclusiveMin ? value >= parseFloat(min) : value > parseFloat(min)); // 如果min值不存在就返回true 否则 min存在 就进行vue比对获取是否在正确范围值内
      let maxValid = !max || (inclusiveMax ? value <= parseFloat(max) || value > parseFloat(max) : value < parseFloat(max));

      if (minValid && maxValid) {
        index = i;
        break;
      }
    }

    return index;
  }
};

function parsData11(content) {
  var u8a = null;
  if (content && content.byteLength > 0) {
    u8a = new Uint8Array(content);
    bufferArray.push(u8a.buffer);
  }
  // return u8a;
  return { data: u8a };
}

function parsData13(content) {
  var u8a = null;
  if (content && content.length > 0) {
    u8a = new TextEncoder().encode(content);
    bufferArray.push(u8a.buffer);
  }
  // return u8a;
  return { data: new TextEncoder().encode(content) };
}

function parsData15(content) {
  var obj = parsB3DM(content);
  bufferArray.push(obj.u8Array.buffer);
  return { data: obj.u8Array };
}

// 海堤点坐标处理(x,y,x,y,x,y...)
function parsData100(arrayBuffer) {
  // debugger
  // let data = parsAttributeData(arrayBuffer);

  /* var sIdx = 0, eIdx = 4;
    var aCount = readInt32Array(arrayBuffer, sIdx, eIdx); */

  sIdx = 0;
  eIdx = -1; //到结尾
  let data = readFloat64Array(arrayBuffer, sIdx, eIdx);
  let resObj = {};
  let pos = [];
  let posList = [];
  let temp = [];

  for (let i = 0; i < data.length; i++) {
    pos.push(data[i]);
    temp.push(data[i]);

    if (pos.length == 8) {
      posList.push([pos[2], pos[3], pos[4], pos[5], pos[6], pos[7]]);

      pos = [];
    }
  }

  resObj.data = posList;
  return resObj;
}

// 海堤风险等级处理 (对象属性数据-不带Id)
function parsData101(arrayBuffer) {
  let levelList = [];
  let flow = [];
  let data = parsAttributeData(arrayBuffer);

  data.forEach((lev, idx) => {
    if (idx % 2 != 0) {
      levelList.push(lev);
    } else {
      flow.push(lev);
    }
  });

  return {
    data: levelList,
    flow: flow
    // legend: playDepthColors
  };
}

function parsData102(arrayBuffer) {
  let resObj = {};
  let pos = [];
  let posList = [];
  let lanLatList = [];
  let strData = [];
  let cCount = null;
  let arrDb = null;
  let str = null;
  sIdx = 0;
  eIdx = -1; //到结尾

  // let data = readFloat64Array(arrayBuffer, sIdx, eIdx);
  // var db = readFloat64Array(arrayBuffer, sIdx, eIdx);
  // sIdx = eIdx; eIdx = sIdx + 4;

  var sIdx = 0,
    eIdx = 0;
  while (eIdx < arrayBuffer.byteLength) {
    sIdx = eIdx;
    eIdx = sIdx + 4;
    cCount = readInt32Array(arrayBuffer, sIdx, eIdx);

    sIdx = eIdx;
    eIdx = sIdx + cCount[0];
    str = readUTF8ToString(arrayBuffer, sIdx, eIdx);

    sIdx = eIdx;
    eIdx = sIdx + 8 * 8;
    arrDb = readFloat64Array(arrayBuffer, sIdx, eIdx);

    lanLatList.push(...arrDb);
    strData.push(str);
  }

  for (let i = 0; i < lanLatList.length; i++) {
    pos.push(lanLatList[i]);

    if (pos.length == 8) {
      posList.push([pos[2], pos[3], 0.5, pos[4], pos[5], 0.5, pos[6], pos[7], 0.5]);
      pos = [];
    }
  }
  resObj.data = posList;
  resObj.dataName = strData;

  return resObj;
}

/* 水位流向 对象属性数据-带Id*/
function parsData103(arrayBuffer) {
  var fd = {};
  let flowData = null;

  if (arrayBuffer) {
    let arrowList = [];
    let data = parsAttributeData103(arrayBuffer);
    flowMinLevels = loadInfo && !loadInfo.minTriangular ? flowMinLevels1 : flowMinLevels2;

    // 处理箭头数据
    if (!loadInfo.newFlow) {
      data = getArowPos(data);
      fd.pos = new Int32Array(crdArr2c3(data, 1));
      bufferArray.push(fd.pos.buffer);
    } else {
      // bufferArray.push(...insertValueAtFourthIndex(data));
      /* arrowList = insertValueAtFourthIndex(data);
      fd.pos = arrowList; */
      flowData = getShaderArrows_new(insertValueAtFourthIndex(data), [20, 2], 5);
      bufferArray.push(flowData.pos.buffer, flowData.ins.buffer, flowData.moffset.buffer);
      fd.flowDataInfo = flowData;
    }
  }

  return fd;
}

function insertValueAtFourthIndex(arr) {
  let countArrow = 1;
  let newArr = [countArrow];
  let temp = [];
  arr.forEach((d, index) => {
    if (temp.length == 4) {
      countArrow++;
      newArr.push(...temp, countArrow);
      temp = [];
    }
    temp.push(d);
  });
  newArr.pop();
  return newArr;
}

function getShaderArrows_new(pArr, asize, psize) {
  let vao_obj = null;

  if (pArr) {
    let w1 = asize[1] / 2;
    let w2 = asize[0];
    let w4 = w1 * 6 * 1.0;
    let w3 = w2 - w4;
    let w5 = w3;
    let angle = 0;
    let pos = [];
    let ins = [];
    let offsets = [];
    let colors = [];
    let showlevel = [];
    let arrow = null;
    let minLevel = 0;
    let pIndex = 0;
    let slevel = 0;
    let levelAndColor = 0;
    for (let i = 0; i < pArr.length - 1; i += psize) {
      if (Math.abs(pArr[i + 3]) < 1.0e-12 && Math.abs(pArr[i + 4]) < 1.0e-12) {
        continue;
      }

      angle = getFlowAngle(pArr[i + 3], pArr[i + 4]);
      //计算箭矢长度
      slevel = getFlowSpeedLevel(pArr[i + 3], pArr[i + 4], ShaftmentLength_LevelCount);

      w1 = getArrowWidth(slevel, withRange, ShaftmentLength_LevelCount);
      w4 = w1 * 6 * 1.0;
      w5 = asize[0] - w4;
      w3 = getShaftmentLength(slevel, minShaftmentLength, w5, ShaftmentLength_LevelCount);
      w2 = w3 + w4;

      arrow = [pArr[i + 1], pArr[i + 2], 0.1, pArr[i + 1], pArr[i + 2], 0.1, pArr[i + 1], pArr[i + 2], 0.1, pArr[i + 1], pArr[i + 2], 0.1, pArr[i + 1], pArr[i + 2], 0.1, pArr[i + 1], pArr[i + 2], 0.1, pArr[i + 1], pArr[i + 2], 0.1];
      pos.push(...arrow);
      ins.push(...[pIndex * 7 + 0, pIndex * 7 + 1, pIndex * 7 + 2, pIndex * 7 + 0, pIndex * 7 + 2, pIndex * 7 + 3, pIndex * 7 + 4, pIndex * 7 + 5, pIndex * 7 + 6]);
      pIndex++;

      minLevel = getArrowMinLevel(i / psize);
      levelAndColor = pack2Uint8ToFloat(minLevel, slevel);
      offsets.push(...rotatePosOffests([-w1, 0, 0, levelAndColor, w1, 0, 0, levelAndColor, w1, w3, 0, levelAndColor, -w1, w3, 0, levelAndColor, -w1 * 3, w3, 0, levelAndColor, w1 * 3, w3, 0, levelAndColor, 0, w2, 0, levelAndColor], angle, 4));

      // colors.push(...getArrowColor(pArr[i + 3], pArr[i + 4]));
      // showlevel.push(...[minLevel, minLevel, minLevel, minLevel, minLevel, minLevel, minLevel]);
    }
    vao_obj = {
      pos: new Float64Array(crdArr2c3Flow(pos, 3)),
      ins: new Int32Array(ins),
      moffset: new Float32Array(offsets),
      // color: new Float32Array(colors)
      // showlevel: new Int32Array(showlevel)
    };
  }

  return vao_obj;
}

const getArrowWidth = (flowLevel, wRange, levelCount) => {
  return wRange[Math.floor(flowLevel / (levelCount / wRange.length))];
};

const getArrowColor = (u, v) => {
  var v = Math.sqrt(Math.pow(u, 2) + Math.pow(v, 2));
  var i = Math.round(v / 0.1) + 4;
  if (i > arrow_colors.length - 1) {
    i = arrow_colors.length - 1;
  }
  var rga = arrow_colors[i].rgba;
  return [rga[0], rga[1], rga[2], 0.8, rga[0], rga[1], rga[2], 0.8, rga[0], rga[1], rga[2], 0.8, rga[0], rga[1], rga[2], 0.8, rga[0], rga[1], rga[2], 0.8, rga[0], rga[1], rga[2], 0.8, rga[0], rga[1], rga[2], 0.8];
};

const pack2Uint8ToFloat = (a, b) => {
  a = clamp(Math.floor(a), 0, 255);
  b = clamp(Math.floor(b), 0, 255);
  return a + b * 256;
};

const clamp = (value, min, max) => {
  return Math.max(min, Math.min(value, max));
};

const getArrowMinLevel = (index) => {
  let mlevel = 0;
  if (flowMinLevels && Array.isArray(flowMinLevels)) {
    mlevel = flowMinLevels[index];
  } else {
    mlevel = tmpShowLevels[index % tmpShowLevels.length];
  }
  return mlevel;
};

const getFlowAngle = (vx, vy) => {
  let angle = 0;
  angle = Math.atan2(vx, vy);
  return angle;
};

const getFlowSpeedLevel = (u, v, levelCount) => {
  var v = Math.sqrt(Math.pow(u, 2) + Math.pow(v, 2));
  var i = Math.round(v / 0.15); // 改变箭头颜色等级
  if (i > levelCount - 1) {
    i = levelCount - 1;
  }
  // console.info(i);
  return i;
};

const getShaftmentLength = (flowLevel, minLength, maxLength, levelCount) => {
  return minLength + ((maxLength - minLength) * flowLevel) / levelCount;
};

const rotatePosOffests = (offsetArr, angle, groupSize) => {
  if (offsetArr) {
    if (!groupSize) {
      groupSize = 2;
    }
    let p = null;
    for (let i = 0; i < offsetArr.length - 1; i += groupSize) {
      p = rotatePOffest([offsetArr[i + 0], offsetArr[i + 1]], angle);
      offsetArr[i + 0] = p[0];
      offsetArr[i + 1] = p[1];
    }
  }
  return offsetArr;
};

const crdArr2c3Flow = (crds, vnum) => {
  var arr = null;
  if (crds && crds.length > 0) {
      arr = [];
      var c3 = null;
      var h=0.2
      for (var i = 0; i < crds.length; i += vnum) {
          h=(vnum>2?crds[i + 2]:0);
          c3 = crd2c3(crds[i], crds[i + 1],h);
          arr.push(c3.x);
          arr.push(c3.y);
          arr.push(c3.z);
      }
  }
  return arr;
};

const rotatePOffest = (p, angle, centerPoint) => {
  let np = null;
  if (p) {
    np = [];
    if (!centerPoint) {
      //没有输入旋转中心点
      centerPoint = [0, 0];
    }
    np[0] = (p[0] - centerPoint[0]) * Math.cos(angle) + (p[1] - centerPoint[1]) * Math.sin(angle) + centerPoint[0];
    np[1] = (p[1] - centerPoint[1]) * Math.cos(angle) - (p[0] - centerPoint[0]) * Math.sin(angle) + centerPoint[1];
  }
  return np;
};

/* 内涝 带顶点的分类三角网的定义及属性数据 */
function parsData104(arrayBuffer) {
  var fd = {};
  let dataList = [];

  if (arrayBuffer) {
    let nodeList = null;
    let triangleList = null;

    var sIdx = 0,
      eIdx = 4;
    var aCount = readInt32Array(arrayBuffer, sIdx, eIdx)[0];

    for (let j = 0; j < aCount; j++) {
      let obj = {};
      (sIdx = eIdx), (eIdx = sIdx + 4);
      var TypeValue = readFloat32Array(arrayBuffer, sIdx, eIdx)[0];

      (sIdx = eIdx), (eIdx = sIdx + 4);
      var nodeCount = readInt32Array(arrayBuffer, sIdx, eIdx)[0];

      (sIdx = eIdx), (eIdx = sIdx + 4);
      var triangleCount = readInt32Array(arrayBuffer, sIdx, eIdx)[0];

      (sIdx = eIdx), (eIdx = sIdx + nodeCount * 8 * 2);
      nodeList = readFloat64Array(arrayBuffer, sIdx, eIdx);

      (sIdx = eIdx), (eIdx = sIdx + triangleCount * 4 * 3);
      triangleList = readInt32Array(arrayBuffer, sIdx, eIdx);

      obj.type = TypeValue;
      obj.ins = triangleList;
      obj.sanjiao = nodeList;
      obj.pos = new Float64Array(crdArr2c3(nodeList));
      obj.color = TypeValue != -1 ? playDepthColors[TypeValue]?.color || '#000000' : '#000000';

      bufferArray.push(obj.ins.buffer);
      bufferArray.push(obj.pos.buffer);

      nodeList = null;
      triangleList = null;

      dataList.push(obj);
    }

    fd.ts = dataList;
    fd.levelData = loadInfo.togglePlayColor;
    // fd.legend = playDepthColors;
  }

  return fd;
}

function parsData105(arrayBuffer) {
  var resObj = {};
  var colorIns = [];
  if (arrayBuffer) {
    let data = parsAttributeDataYiWei(arrayBuffer);
    let waterLevelData = data.map((item) => item.waterLevel);

    for (let i = 0; i < waterLevelData.length; i++) {
      let h = loadInfo.togglePlayColor ? data[i].H : data[i].waterLevel;
      const index = getColorMap(h);
      colorIns.push(index);
    }

    resObj = {
      data: data,
      waterLevelData: waterLevelData,
      colorIns: colorIns,
      ins: colorIns,
      levelData: loadInfo.togglePlayColor
      // legend: playDepthColors
    };
  }

  return resObj;
}

function getArowPos(pos) {
  var npos = [];
  if (pos) {
    for (var i = 0; i < pos.length; i += 4) {
      //dx,dy,theta,
      npos.push(pos[i + 0]);
      npos.push(pos[i + 1]);
      npos.push(pos[i + 2]);
      npos.push(pos[i + 3]);

      var dx = (pos[i + 2] - pos[i + 0]) / 3;
      var dy = (pos[i + 3] - pos[i + 1]) / 3;

      var nx = pos[i + 2] - dx;
      var ny = pos[i + 3] - dy;
      var theta = (30 * Math.PI) / 180;

      var x1 = pos[i + 2] + (nx - pos[i + 2]) * Math.cos(theta) - (ny - pos[i + 3]) * Math.sin(theta);
      var y1 = pos[i + 3] + (nx - pos[i + 2]) * Math.sin(theta) + (ny - pos[i + 3]) * Math.cos(theta);

      npos.push(pos[i + 2]);
      npos.push(pos[i + 3]);
      npos.push(x1);
      npos.push(y1);

      x1 = pos[i + 2] + (nx - pos[i + 2]) * Math.cos(-theta) - (ny - pos[i + 3]) * Math.sin(-theta);
      y1 = pos[i + 3] + (nx - pos[i + 2]) * Math.sin(-theta) + (ny - pos[i + 3]) * Math.cos(-theta);

      npos.push(pos[i + 2]);
      npos.push(pos[i + 3]);
      npos.push(x1);
      npos.push(y1);
    }
  }
  return npos;
}

function getArowLineColors(pos) {
  var colors = null;
  if (pos && pos.length > 1) {
    colors = [];
    var r, g, b;
    for (var i = 0; i < pos.length; i += 3 * 6) {
      r = getRandomColor();
      g = getRandomColor();
      b = getRandomColor();
      for (var j = 0; j < 6; j++) {
        colors.push(r);
        colors.push(g);
        colors.push(b);
        colors.push(180);
      }
    }
  }
  return colors;
}

function getRandomColor() {
  return Math.floor(Math.random() * 256);
  // return Math.random();
}

function crd2c3(x, y, h) {
  var lon = x * RADIANS_PER_DEGREE;
  var lat = y * RADIANS_PER_DEGREE;
  var cosLatitude = Math.cos(lat);
  var scratchN = {
      x: cosLatitude * Math.cos(lon),
      y: cosLatitude * Math.sin(lon),
      z: Math.sin(lat)
  };
  var scratchK = {
      x: RadiiSquared.x * scratchN.x,
      y: RadiiSquared.y * scratchN.y,
      z: RadiiSquared.z * scratchN.z
  };
  var dot = scratchN.x * scratchK.x + scratchN.y * scratchK.y + scratchN.z * scratchK.z;
  var gamma = Math.sqrt(dot);
  scratchK.x = scratchK.x / gamma;
  scratchK.y = scratchK.y / gamma;
  scratchK.z = scratchK.z / gamma;
  if (!h) {
      h = 1;
  }

  scratchN.x = scratchN.x * h;
  scratchN.y = scratchN.y * h;
  scratchN.z = scratchN.z * h;

  var c3 = {
      x: scratchK.x + scratchN.x,
      y: scratchK.y + scratchN.y,
      z: scratchK.z + scratchN.z
  }
  return c3;
}

function crdArr2c3(crds, vnum = 0.1) {
  var arr = null;
  if (crds && crds.length > 0) {
    arr = [];
    var c3 = null;
    for (var i = 0; i < crds.length; i += 2) {
      c3 = crd2c3(crds[i], crds[i + 1], vnum);
      arr.push(c3.x);
      arr.push(c3.y);
      arr.push(c3.z);
    }
  }
  return arr;
}

// 对象属性数据-带ID
function parsAttributeData2(content) {
  //读取数量一个int 4字节
  var sIdx = 0,
    eIdx = 4;
  var aCount = readInt32Array(content, sIdx, eIdx);

  sIdx = eIdx;
  eIdx = sIdx + aCount * 2; //short是两个字节
  var typeArr = readInt16Array(content, sIdx, eIdx); //得到属性的编号

  sIdx = eIdx;
  eIdx = sIdx + 2; //读取数据的组织格式short
  var orderType = readInt16Array(content, sIdx, eIdx); //得到数据的组织顺序

  sIdx = eIdx;
  eIdx = sIdx + 4; //读取数据总数，读一个int
  var count = readInt32Array(content, sIdx, eIdx); //得到数据数量

  let ids = [];
  let arr = [];

  if (orderType == 0) {
    for (let i = 0; i < count.length; i++) {
      // sIdx = eIdx;
      // eIdx = sIdx + 4;//读取数据总数，读一个int
      // ids.push(readInt32Array(content, sIdx, eIdx)[0]);

      sIdx = eIdx + 4;
      eIdx = sIdx + 8 * aCount; //读取数据总数，读一个int
      arr.push(...readFloat64Array(content, sIdx, eIdx));
    }
  }

  /* sIdx = eIdx;
    eIdx = -1;//到结尾
    dataArr = readFloat64Array(content, sIdx, eIdx); */
  // // debugger

  return arr;
}

function formatDateYY(str) {
  const year = str.substring(0, 4);
  const month = str.substring(4, 6);
  const day = str.substring(6, 8);
  const hour = str.substring(8, 10);
  const mm = str.substring(10, 12);
  const ss = str.substring(12, 14);

  return `${year}-${month}-${day} ${hour}:${mm}:${ss}`;
  // return `${year}-${month}-${day} ${hour}`
}

// 对象属性数据-带ID
function parsAttributeDataYiWei(content) {
  // let strTime = loadInfo.key.split("_")[1].slice(0,-1);
  let strTime = '';

  if (loadInfo.key.startsWith('flow')) {
    strTime = loadInfo.key.split('_')[1].slice(0, 12);
  } else {
    strTime = loadInfo.key.split('_')[0];
  }

  let time = formatDateYY(strTime) + '00';

  let ids = [];
  let arr = [];

  var sIdx = 0,
    eIdx = 4;
  var aCount = readInt32Array(content, sIdx, eIdx);

  sIdx = eIdx;
  eIdx = sIdx + aCount * 2; //short是两个字节
  var typeArr = readInt16Array(content, sIdx, eIdx); //得到属性的编号

  sIdx = eIdx;
  eIdx = sIdx + 2; //读取数据的组织格式short
  var orderType = readInt16Array(content, sIdx, eIdx); //得到数据的组织顺序

  sIdx = eIdx;
  eIdx = sIdx + 4; //读取数据总数，读一个int
  var count = readInt32Array(content, sIdx, eIdx); //得到数据数量

  for (let i = 0; i < count; i++) {
    let obj = {};

    for (let j = 0; j < aCount; j++) {
      let res = null;
      sIdx = eIdx; //读一个Double
      eIdx = sIdx + 8; //读一个Double
      res = readFloat64Array(content, sIdx, eIdx)[0];
      let key = shortMap[typeArr[j] - 1];
      obj[key] = key == 'waterLevel' || key == 'flow' ? res.toFixed(2) : res;
      obj['time'] = time;
      obj['frameName']= loadInfo.key
    }

    arr.push(obj);
  }

  return arr;
}

// 对象属性数据-带ID
function parsAttributeData103(content) {
  //读取数量一个int 4字节
  var sIdx = 0,
    eIdx = 4;
  var aCount = readInt32Array(content, sIdx, eIdx);

  sIdx = eIdx;
  eIdx = sIdx + aCount * 2; //short是两个字节
  var typeArr = readInt16Array(content, sIdx, eIdx); //得到属性的编号

  sIdx = eIdx;
  eIdx = sIdx + 2; //读取数据的组织格式short
  var orderType = readInt16Array(content, sIdx, eIdx); //得到数据的组织顺序

  sIdx = eIdx;
  eIdx = sIdx + 4; //读取数据总数，读一个int
  var count = readInt32Array(content, sIdx, eIdx); //得到数据数量

  let ids = [];
  let arr = [];

  if (orderType == 0) {
    for (let i = 0; i < count; i++) {
      sIdx = eIdx + 4;
      eIdx = sIdx + 8 * aCount; //读取数据总数，读一个int
      arr.push(...readFloat64Array(content, sIdx, eIdx));
    }
  }

  return arr;
}

/* 对象属性数据-不带Id  风暴潮 二位河网*/
function parsAttributeData(content) {
  var sIdx = 0,
    eIdx = 4;
  var aCount = readInt32Array(content, sIdx, eIdx);

  sIdx = eIdx;
  eIdx = sIdx + aCount[0] * 2; //short是两个字节
  var typeArr = readInt16Array(content, sIdx, eIdx); //得到属性的编号

  sIdx = eIdx;
  eIdx = sIdx + 2; //读取数据的组织格式short
  var orderType = readInt16Array(content, sIdx, eIdx); //得到数据的组织顺序

  sIdx = eIdx;
  eIdx = sIdx + 4; //读取数据总数，读一个int
  var count = readInt32Array(content, sIdx, eIdx); //得到数据数量

  sIdx = eIdx;
  eIdx = -1; //到结尾
  dataArr = readFloat64Array(content, sIdx, eIdx);
  // // debugger

  return dataArr;
}

/////////////b3dm数据解析/////////////////////////////////////
///解析出的格式：二进制头部5个uint,依次为 pos,ins,normal,img，other的字节数；后面依次跟pos,ins,normal,img，other二进制数据
function parsB3DM(buffer) {
  //debugger
  var ins, pos, img;
  var insType = GLTF_ComponentType.ushort;
  var sIdx = 0;
  eIdx = 4 * 7;
  var arr1 = readUint32Array(buffer, sIdx, eIdx);
  var strBitLen = arr1[3];
  sIdx = eIdx;
    eIdx = sIdx + strBitLen;
    var jsonStr = readUTF8ToString(buffer, sIdx, eIdx);
    var obj1 = JSON.parse(jsonStr);
  ////////////
  sIdx = eIdx;
  eIdx = sIdx + arr1[4] + arr1[5] + arr1[6];
  /////////

  sIdx = eIdx;
  eIdx = sIdx + 5 * 4;
  var arr1 = readUint32Array(buffer, sIdx, eIdx);

  strBitLen = arr1[3];
  sIdx = eIdx;
  eIdx = sIdx + strBitLen;
  var obj2 = JSON.parse(readUTF8ToString(buffer, sIdx, eIdx));
  ////////////
  sIdx = eIdx;
  eIdx = sIdx + 2 * 4;
  /////////

  //////////////bufferViews//////////////////
  var oIdx = eIdx;

  var byteOffset = obj2.bufferViews[0].byteOffset ? obj2.bufferViews[0].byteOffset : 0;
  sIdx = oIdx + byteOffset;
  eIdx = sIdx + obj2.bufferViews[0].byteLength;
  pos = readFloat32Array(buffer, sIdx, eIdx);
  // pos= Array.from(pos);

  // if(obj1.RTC_CENTER){
  var count = pos.length / 5;
  if (obj1.RTC_CENTER) {
    for (var j = 0; j < count; j++) {
      pos[j * 5 + 0] = -pos[j * 5 + 0] - obj1.RTC_CENTER[0];
      pos[j * 5 + 1] = pos[j * 5 + 1] + obj1.RTC_CENTER[2];
      pos[j * 5 + 2] = -pos[j * 5 + 2] + obj1.RTC_CENTER[1];

      pos[j * 5 + 4] = 1 - pos[j * 5 + 4];
    }
  } else {
    for (var j = 0; j < count; j++) {
      pos[j * 5 + 2] = -pos[j * 5 + 2];

      pos[j * 5 + 4] = 1.0 - pos[j * 5 + 4];
    }
  }
  // }

  byteOffset = obj2.bufferViews[1].byteOffset ? obj2.bufferViews[1].byteOffset : 0;
  sIdx = oIdx + byteOffset;
  eIdx = sIdx + obj2.bufferViews[1].byteLength;
  if (obj2.accessors[2].bufferView == 1) {
    insType = obj2.accessors[2].componentType;
    ins = buffer.slice(sIdx, eIdx);
    // switch(obj2.accessors[2].componentType){
    //     case GLTF_ComponentType.short:
    //         ins=readInt16Array(buffer,sIdx,eIdx);//ins
    //         break;
    //     case GLTF_ComponentType.ushort:
    //         ins=readUint16Array(buffer,sIdx,eIdx);//ins
    //         break;
    //     case GLTF_ComponentType.int:
    //         ins=readInt32Array(buffer,sIdx,eIdx);//ins
    //         break;
    //     case GLTF_ComponentType.uint:
    //         ins=readUint32Array(buffer,sIdx,eIdx);//ins
    //         break;
    //     default:
    //         ins=readUint16Array(buffer,sIdx,eIdx);//ins
    //         break;
    // }
  } else {
    console.log('瓦片解析出错');
  }
    var format = obj2.imgFormat;
    var height = obj2.imgHeight;
    var width = obj2.imgWidth;
    if (obj2.images) {
        byteOffset = obj2.bufferViews[obj2.images[0].bufferView].byteOffset ? obj2.bufferViews[obj2.images[0].bufferView].byteOffset : 0;
        sIdx = oIdx + byteOffset;
        eIdx = sIdx + obj2.bufferViews[obj2.images[0].bufferView].byteLength;
        img = buffer.slice(sIdx, eIdx); //img
  
        //console.log("obj2.imgFormat:"+obj2.imgFormat);
        var bLengths = new Uint32Array([pos.buffer.byteLength, ins.byteLength, 0, img.byteLength, insType, format, height, width]);//pos,ins,normal,img，other
        return {
            pos: pos.buffer.byteLength,
            ins: ins.byteLength,
            img: img.byteLength,
            u8Array: mergeBuffer([bLengths.buffer, pos.buffer, ins, img]),
            bLengths: bLengths
        };
    }
    else {
        var bLengths = new Uint32Array([pos.buffer.byteLength, ins.byteLength, 0, 0, insType, format, height, width]);//pos,ins,normal,img，other
        return {
            pos: pos.buffer.byteLength,
            ins: ins.byteLength,
            u8Array: mergeBuffer([bLengths.buffer, pos.buffer, ins]),
            bLengths: bLengths
        };
    }

  return {
    pos: pos.buffer.byteLength,
    ins: ins.byteLength,
    img: img.byteLength,
    u8Array: mergeBuffer([bLengths.buffer, pos.buffer, ins, img]),
    bLengths: bLengths
  };
}
function mergeBuffer(bufs) {
  var byteLength = 0;
  var i = 0,
    j = 0;
  for (i = 0; i < bufs.length; i++) {
    byteLength += bufs[i].byteLength;
  }

  u8Array = new Uint8Array(byteLength);

  for (i = 0; i < bufs.length; i++) {
    u8Array.set(new Uint8Array(bufs[i]), j);
    j += bufs[i].byteLength;
  }
  return u8Array;
}

GLTF_ComponentType = {
  byte: 5120,
  ubyte: 5121,
  short: 5122,
  ushort: 5123,
  int: 5124,
  uint: 5125,
  float: 5126,
  double: 5130
};

/////////////b3dm数据解析/////////////////////////////////////

function parsInsBuffer(content) {
  var arr = [];
  if (content) {
    var item = null;
    var sIdx = 0;
    var eIdx = 0;
    while (sIdx < content.byteLength) {
      item = {};
      eIdx = sIdx + 4; //分类的结束索引
      item.type = readFloat32Array(content, sIdx, eIdx)[0];

      sIdx = eIdx;
      eIdx = sIdx + 4;
      item.count = readInt32Array(content, sIdx, eIdx)[0];

      sIdx = eIdx;
      eIdx = sIdx + item.count * 4 * 3;
      item.ins = readInt32Array(content, sIdx, eIdx);
      arr.push(item);
      sIdx = eIdx;

      bufferArray.push(item.ins.buffer);
    }
  }
  return { ts: arr };
}

function parsPosBuffer(content) {
  var pos = null;
  if (content && content.byteLength > 4) {
    var sIdx = 4;
    var eIdx = -1;
    pos = readFloat64Array(content, sIdx, eIdx);
  }
  return { pos: pos };
}

function parsPosBuffer(content) {
  var pos = null;
  if (content && content.byteLength > 4) {
    var sIdx = 4;
    var eIdx = -1;
    pos = readFloat64Array(content, sIdx, eIdx);
  }
  return { pos: pos };
}

function readInt16Array(buf, startIdx, endIdx) {
  if (endIdx <= 0) {
    return new Int16Array(buf.slice(startIdx));
  } else {
    return new Int16Array(buf.slice(startIdx, endIdx));
  }
}

function readInt32Array(buf, startIdx, endIdx) {
  if (endIdx <= 0) {
    return new Int32Array(buf.slice(startIdx));
  } else {
    return new Int32Array(buf.slice(startIdx, endIdx));
  }
}

function readUint16Array(buf, startIdx, endIdx) {
  if (endIdx <= 0) {
    return new Uint16Array(buf.slice(startIdx));
  } else {
    return new Uint16Array(buf.slice(startIdx, endIdx));
  }
}

function readUint32Array(buf, startIdx, endIdx) {
  if (endIdx <= 0) {
    return new Uint32Array(buf.slice(startIdx));
  } else {
    return new Uint32Array(buf.slice(startIdx, endIdx));
  }
}

function readFloat32Array(buf, startIdx, endIdx) {
  if (endIdx <= 0) {
    return new Float32Array(buf.slice(startIdx));
  } else {
    return new Float32Array(buf.slice(startIdx, endIdx));
  }
}

function readFloat64Array(buf, startIdx, endIdx) {
  if (endIdx <= 0) {
    return new Float64Array(buf.slice(startIdx));
  } else {
    return new Float64Array(buf.slice(startIdx, endIdx));
  }
}

var UTF8Decoder = null;
function readUTF8ToString(buf, startIdx, endIdx) {
  if (!UTF8Decoder) {
    UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;
  }
  if (endIdx <= 0) {
    return UTF8Decoder.decode(buf.slice(startIdx));
  } else {
    return UTF8Decoder.decode(buf.slice(startIdx, endIdx));
  }
}

let fileNames = [];

let flowMinLevels1 = [
  10, 14, 10, 14, 13, 12, 13, 11, 13, 12, 13, 12, 13, 13, 14, 14, 12, 11, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 10, 14, 14, 14, 14, 12, 11, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 15, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 11, 14, 14, 14, 14, 12, 10, 14, 13, 13, 11,
  13, 13, 10, 14, 13, 11, 13, 14, 12, 14, 13, 14, 13, 14, 10, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 13, 14, 11, 14, 14, 14, 14, 12, 11, 14, 14, 14, 14, 12, 11, 14, 13, 14, 14, 14, 14, 13, 14, 11, 13, 14, 13, 14, 10, 14, 13, 14, 14, 14, 14, 12, 11, 13, 13, 11, 13, 12, 13, 12, 13, 13, 11, 13,
  12, 13, 11, 13, 14, 12, 14, 13, 14, 12, 14, 14, 15, 13, 14, 11, 14, 13, 14, 12, 13, 14, 13, 12, 13, 12, 13, 13, 10, 13, 12, 14, 13, 14, 13, 12, 13, 11, 13, 12, 13, 11, 13, 12, 14, 14, 12, 14, 13, 14, 14, 10, 14, 13, 14, 14, 11, 14, 13, 14, 14, 10, 14, 13, 14, 14, 11, 14, 13, 14, 14, 11, 14, 14,
  12, 14, 13, 14, 14, 14, 14, 12, 14, 14, 12, 14, 13, 14, 10, 14, 14, 12, 14, 14, 11, 14, 14, 12, 14, 14, 11, 13, 12, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 10, 14, 13, 12, 13, 11, 13, 13, 13, 13, 10, 14, 12, 13, 14, 11, 14, 13, 14, 13, 14, 10, 14, 13, 14, 13, 14, 14, 15, 13, 14, 11, 14, 14, 15,
  15, 15, 15, 12, 14, 15, 11, 15, 15, 15, 13, 15, 15, 15, 15, 13, 9, 15, 14, 12, 14, 14, 15, 13, 15, 12, 14, 13, 15, 14, 15, 12, 15, 13, 14, 10, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 13, 11, 13, 12, 13, 13, 14, 10, 14, 13, 14, 12, 14, 14, 15, 11, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14,
  12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 13, 14, 10, 14, 13, 14, 12, 14, 13, 14, 11, 15, 13, 15, 13, 15, 14, 10, 13, 14, 12, 13, 14, 12, 14, 13, 10, 14, 14, 12, 14, 13, 11, 14, 13, 12, 13, 14, 13, 14, 12, 13, 11, 13, 13, 10, 13, 12, 13, 11, 13, 14, 12, 14, 13, 14, 13, 14, 11, 14, 13, 14,
  12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 11, 14, 14, 15, 13, 14, 12, 15, 13, 14, 14, 15, 11, 15, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 11, 13, 13, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 13, 14, 10, 15, 13, 14, 13, 14, 14, 14, 14, 11, 12,
  14, 13, 14, 12, 14, 13, 14, 11, 14, 14, 14, 13, 14, 12, 15, 10, 14, 13, 15, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 15, 14, 14, 14, 11, 14, 14, 13, 14, 13, 14, 10, 15, 12, 15, 14, 14, 13, 14, 11, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14,
  13, 14, 14, 14, 11, 14, 13, 12, 13, 11, 13, 12, 13, 12, 14, 14, 13, 14, 12, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 13, 13, 12, 13, 12, 13, 13, 10, 13, 12, 13, 13, 11, 13, 15, 12, 15, 13, 15, 13, 14, 12, 14, 13, 14, 14, 14, 14, 13, 13, 10, 13, 12, 13,
  11, 13, 13, 12, 13, 11, 15, 15, 15, 13, 12, 15, 13, 15, 14, 15, 14, 15, 13, 14, 13, 14, 14, 15, 14, 15, 10, 14, 14, 14, 12, 13, 15, 15, 15, 12, 14, 14, 10, 15, 13, 15, 12, 15, 13, 15, 11, 15, 14, 15, 13, 15, 12, 15, 15, 15, 15, 13, 14, 15, 11, 15, 14, 15, 15, 15, 15, 12, 14, 15, 10, 15, 14, 15,
  15, 15, 15, 12, 14, 15, 11, 15, 15, 15, 15, 13, 12, 15, 15, 15, 15, 13, 12, 15, 13, 15, 13, 12, 13, 10, 13, 12, 13, 11, 13, 12, 13, 11, 13, 13, 11, 13, 13, 11, 14, 11, 14, 13, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 13, 12, 13, 11, 13, 12, 13, 12, 13, 13, 10, 13, 12, 13, 12, 13, 13, 13, 12,
  13, 11, 13, 13, 13, 12, 14, 13, 15, 13, 15, 11, 14, 13, 14, 12, 14, 13, 15, 10, 15, 14, 15, 13, 14, 14, 11, 14, 14, 12, 13, 12, 14, 15, 13, 15, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 15, 12, 15, 14, 15, 13, 14, 11, 14, 13, 12, 10, 13, 13, 13, 12, 11, 13, 12, 13, 11, 13, 12,
  13, 12, 13, 11, 14, 13, 12, 13, 11, 13, 13, 12, 13, 11, 13, 12, 13, 11, 11, 13, 12, 13, 13, 13, 12, 13, 11, 12, 13, 10, 13, 13, 12, 11, 13, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 10, 14, 14, 14, 14, 12, 11, 14, 13, 14, 12,
  13, 12, 13, 11, 13, 12, 13, 10, 13, 12, 11, 12, 11, 12, 11, 12, 10, 12, 11, 11, 10, 11, 10, 11, 11, 11, 11, 11, 10, 11, 12, 10, 11, 11, 11, 11, 10, 11, 10, 11, 10, 11, 11, 11, 11, 11, 11, 10, 11, 11, 10, 10, 11, 11, 11, 10, 10, 11, 10, 11, 11, 10, 11, 11, 10, 11, 10, 11, 9, 11, 11, 11, 10, 11, 10,
  11, 10, 11, 10, 11, 10, 11, 9, 11, 10, 11, 10, 11, 11, 11, 11, 10, 11, 11, 11, 10, 11, 10, 11, 10, 11, 11, 11, 10, 11, 11, 10, 11, 11, 11, 11, 10, 11, 10, 11, 10, 11, 10, 11, 11, 11, 10, 11, 11, 10, 11, 10, 11, 10, 11, 10, 11, 10, 11, 11, 11, 10, 11, 11, 10, 11, 10, 11, 10, 11, 10, 11, 11, 10, 11,
  11, 11, 10, 11, 11, 11, 11, 9, 11, 10, 11, 11, 10, 11, 11, 11, 10, 11, 10, 11, 10, 11, 10, 11, 10, 11, 11, 11, 10, 11, 10, 11, 10, 11, 11, 10, 11, 10, 11, 11, 11, 11, 11, 10, 11, 11, 10, 11, 10, 11, 11, 11, 10, 11, 12, 10, 12, 11, 11, 10, 11, 11, 11, 11, 10, 11, 11, 9, 12, 12, 11, 9, 11, 10, 11,
  10, 11, 11, 10, 11, 10, 11, 11, 11, 10, 11, 11, 11, 10, 11, 11, 10, 11, 11, 11, 11, 10, 11, 10, 11, 10, 11, 10, 11, 11, 11, 10, 11, 10, 11, 11, 11, 10, 11, 9, 11, 10, 12, 12, 10, 12, 11, 11, 11, 10, 11, 10, 11, 10, 11, 10, 11, 11, 11, 11, 11, 10, 11, 12, 12, 11, 12, 10, 11, 11, 9, 11, 10, 11, 10,
  12, 10, 12, 12, 10, 12, 12, 10, 12, 12, 10, 12, 12, 10, 12, 12, 10, 12, 12, 10, 12, 11, 12, 11, 12, 11, 12, 12, 12, 10, 12, 11, 12, 10, 12, 11, 12, 12, 10, 12, 11, 13, 12, 13, 10, 13, 12, 13, 11, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 10, 13, 12, 13, 11, 13, 12, 13, 11, 13, 12,
  14, 14, 11, 14, 13, 12, 14, 13, 14, 10, 14, 13, 14, 15, 12, 15, 14, 13, 14, 11, 14, 14, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 10, 13, 12, 13, 11, 14, 14, 12, 15, 14, 15, 15, 11, 14, 14, 15, 12, 14, 14, 12, 13, 10, 13, 12, 13, 12, 13, 14, 14, 10, 14, 13, 13, 15, 14, 15, 14, 12, 14, 11,
  14, 13, 14, 12, 14, 13, 14, 12, 14, 14, 14, 10, 14, 12, 13, 11, 14, 14, 12, 15, 14, 15, 11, 15, 14, 14, 12, 14, 14, 15, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 10, 15, 15, 15, 15, 12, 15, 14, 15, 15, 11, 14, 13, 14, 12, 14, 13, 14, 10, 14, 15, 12, 14, 13, 11, 13, 12, 13, 10, 13, 14, 13,
  11, 14, 13, 14, 14, 10, 14, 13, 15, 12, 14, 13, 14, 11, 14, 13, 14, 13, 14, 10, 14, 13, 14, 14, 11, 14, 14, 12, 14, 14, 12, 14, 13, 14, 14, 14, 12, 11, 14, 14, 14, 14, 12, 11, 13, 13, 11, 13, 12, 13, 10, 13, 13, 12, 13, 11, 13, 13, 10, 13, 12, 13, 14, 12, 14, 13, 14, 10, 14, 13, 14, 12, 14, 13,
  14, 11, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 13, 14, 10, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 13, 14, 10, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 13, 11, 13, 12, 11, 14, 13, 14, 14, 11, 14, 13, 13,
  13, 14, 12, 14, 13, 14, 14, 14, 12, 14, 13, 14, 11, 14, 14, 14, 10, 12, 14, 13, 14, 11, 14, 14, 14, 14, 12, 14, 14, 11, 14, 14, 14, 14, 12, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 10, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 14, 15, 10,
  14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 10, 14, 14, 14, 14, 12, 11, 14, 13, 13, 11, 14, 13, 11, 13, 13, 11, 14, 13, 10, 14, 14, 12, 11, 14, 14, 14, 14, 12, 11, 14, 14, 14, 14, 12, 11, 14, 14, 14, 14, 12, 11, 14, 14, 14, 15, 12, 11, 15, 13, 14, 15, 12, 14, 15, 13, 14, 15, 10, 14, 15, 14, 14,
  15, 14, 15, 15, 14, 15, 14, 13, 14, 13, 10, 15, 14, 13, 14, 14, 15, 12, 14, 11, 15, 13, 13, 14, 14, 14, 12, 15, 11, 15, 13, 13, 15, 14, 12, 14, 15, 13, 14, 15, 10, 15, 14, 13, 14, 12, 14, 14, 14, 14, 12, 15, 10, 14, 15, 14, 15, 15, 15, 12, 11, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 13, 14,
  10, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 11, 14, 14, 14, 14, 12, 10, 14, 13, 14, 12, 13, 12, 14, 14, 14, 10, 12, 14, 14, 14, 14, 11, 12, 14, 13, 14, 12, 14, 14, 14, 14, 12, 11, 14, 14, 14, 14, 12, 11, 14, 13, 14, 12, 13, 11, 13, 12, 13, 12,
  13, 10, 13, 12, 13, 12, 14, 13, 14, 13, 14, 10, 14, 13, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 13, 12, 13, 12, 13, 10, 13, 12, 13, 11, 13, 12, 13, 12, 13, 12, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 13, 15, 14, 15, 13, 14, 14, 11, 14, 13, 14,
  13, 10, 14, 14, 14, 12, 14, 14, 12, 14, 13, 14, 10, 14, 14, 12, 14, 14, 11, 14, 14, 14, 13, 14, 13, 14, 12, 14, 14, 11, 14, 14, 14, 12, 14, 11, 15, 15, 15, 13, 12, 15, 14, 15, 13, 14, 13, 14, 14, 12, 14, 14, 11, 14, 14, 13, 12, 13, 12, 13, 13, 13, 15, 13, 15, 12, 15, 13, 14, 12, 14, 13, 15, 12,
  15, 13, 12, 13, 12, 13, 14, 13, 13, 12, 13, 12, 13, 12, 13, 13, 14, 11, 13, 12, 14, 13, 13, 11, 13, 15, 12, 15, 13, 15, 14, 15, 15, 15, 14, 13, 12, 15, 12, 13, 13, 12, 13, 11, 13, 12, 10, 13, 13, 12, 13, 11, 13, 13, 14, 11, 13, 12, 13, 11, 13, 12, 13, 11, 13, 14, 13, 14, 11, 14, 14, 12, 14, 13,
  14, 11, 15, 15, 13, 12, 15, 13, 15, 14, 15, 11, 15, 10, 15, 14, 15, 12, 15, 15, 13, 15, 13, 14, 12, 14, 13, 15, 12, 15, 13, 14, 13, 14, 14, 11, 14, 13, 14, 14, 11, 14, 14, 12, 14, 14, 12, 14, 13, 10, 14, 14, 13, 12, 14, 14, 12, 13, 14, 10, 14, 13, 14, 14, 11, 14, 12, 13, 12, 13, 13, 12, 13, 12,
  13, 13, 10, 13, 12, 13, 11, 13, 14, 13, 14, 11, 14, 13, 13, 11, 13, 14, 14, 14, 11, 13, 12, 13, 10, 14, 12, 13, 11, 14, 12, 13, 13, 14, 13, 13, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 13, 14, 13, 14, 12, 14, 13, 15, 11, 15, 13, 15, 12, 15, 15, 14, 11, 15, 14,
  15, 14, 15, 14, 12, 13, 14, 14, 14, 11, 15, 14, 15, 14, 14, 11, 14, 13, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 10, 14, 14, 14, 14, 12, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 14, 14, 14, 12, 11, 14, 14, 14, 14, 12, 11, 14, 13, 14, 12, 14, 13, 14, 14, 10, 13, 13, 11, 13, 12, 13, 11, 13, 12, 14,
  14, 14, 12, 12, 10, 14, 14, 10, 14, 14, 12, 14, 14, 11, 14, 14, 12, 14, 13, 14, 13, 14, 14, 14, 12, 11, 14, 15, 10, 14, 13, 14, 12, 14, 13, 14, 13, 14, 11, 15, 14, 15, 12, 14, 13, 15, 13, 14, 13, 14, 14, 12, 14, 11, 14, 13, 14, 13, 13, 14, 11, 14, 15, 15, 14, 14, 15, 12, 15, 15, 13, 11, 14, 15,
  15, 12, 14, 13, 14, 14, 14, 13, 14, 14, 11, 14, 13, 13, 14, 13, 11, 12, 14, 11, 13, 12, 14, 14, 13, 14, 14, 12, 14, 14, 13, 15, 14, 10, 14, 13, 14, 13, 14, 13, 14, 11, 13, 14, 13, 13, 13, 12, 13, 13, 10, 13, 11, 13, 12, 13, 14, 11, 13, 14, 12, 14, 14, 10, 14, 13, 14, 14, 13, 13, 13, 14, 11, 14,
  13, 12, 13, 15, 14, 11, 12, 13, 11, 13, 13, 14, 14, 14, 13, 14, 13, 14, 14, 12, 14, 14, 12, 14, 11, 14, 13, 13, 14, 10, 14, 12, 13, 14, 14, 11, 15, 13, 14, 13, 14, 14, 14, 15, 13, 14, 12, 15, 15, 14, 11, 12, 14, 14, 14, 14, 13, 14, 12, 11, 14, 13, 11, 14, 13, 14, 14, 12, 14, 13, 14, 14, 12, 14,
  13, 15, 12, 15, 13, 15, 15, 11, 15, 15, 13, 14, 15, 11, 15, 13, 14, 12, 15, 14, 10, 14, 13, 14, 13, 14, 11, 14, 14, 12, 14, 14, 11, 14, 14, 12, 14, 13, 14, 14, 14, 14, 12, 14, 14, 12, 14, 13, 11, 14, 13, 14, 14, 11, 14, 13, 13, 14, 14, 13, 13, 14, 12, 13, 12, 13, 11, 13, 12, 13, 11, 13, 13, 10,
  13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 10, 13, 12, 13, 14, 14, 11, 14, 14, 12, 14, 14, 12, 14, 14, 12, 14, 13, 14, 11, 13, 14, 13, 11, 13, 12, 13, 11, 13, 12, 13, 12, 13, 14, 11, 14, 14, 12, 14, 14, 12, 14, 14, 11, 13, 14, 12, 14, 14, 11, 14, 14, 12, 14, 14, 12, 14, 13, 14, 14, 15, 14, 12,
  14, 13, 14, 15, 15, 14, 15, 14, 12, 14, 13, 14, 12, 14, 13, 15, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 11, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 13, 14, 13, 14, 12, 14, 13, 14, 12, 15, 15, 13, 15, 13, 14, 14, 14, 13, 14, 15, 11, 14, 13, 14, 14, 12,
  14, 14, 15, 14, 13, 15, 12, 15, 13, 15, 15, 13, 15, 11, 11, 14, 13, 14, 12, 14, 13, 14, 13, 14, 15, 13, 14, 12, 14, 15, 12, 14, 13, 14, 14, 12, 14, 13, 14, 13, 14, 14, 12, 13, 11, 14, 13, 14, 14, 14, 14, 11, 11, 14, 13, 12, 14, 13, 14, 14, 13, 12, 13, 11, 13, 12, 13, 14, 10, 14, 11, 13, 13, 14,
  12, 14, 13, 14, 11, 13, 13, 14, 12, 11, 14, 13, 12, 13, 11, 14, 14, 12, 13, 13, 14, 12, 14, 13, 14, 10, 14, 13, 14, 12, 14, 13, 15, 12, 15, 13, 15, 12, 15, 13, 14, 11, 14, 13, 14, 14, 13, 13, 13, 12, 13, 13, 13, 10, 13, 14, 13, 14, 13, 12, 11, 14, 14, 14, 14, 12, 14, 14, 11, 13, 13, 13, 14, 12,
  14, 14, 11, 12, 14, 14, 13, 14, 14, 12, 13, 14, 13, 14, 14, 12, 14, 11, 14, 13, 14, 14, 14, 13, 14, 12, 14, 14, 14, 13, 12, 14, 14, 11, 14, 13, 14, 14, 12, 14, 13, 14, 13, 14, 10, 15, 14, 13, 14, 15, 15, 13, 14, 15, 14, 15, 13, 13, 14, 14, 14, 14, 12, 15, 13, 11, 10, 14, 14, 12, 14, 13, 14, 9, 13,
  12, 13, 14, 13, 14, 12, 12, 13, 13, 14, 13, 14, 14, 12, 14, 10, 14, 14, 11, 14, 13, 14, 13, 14, 15, 15, 11, 15, 15, 13, 15, 15, 12, 15, 15, 13, 15, 15, 12, 14, 13, 14, 13, 14, 13, 14, 14, 11, 14, 13, 10, 13, 13, 14, 12, 13, 13, 13, 11, 13, 12, 14, 14, 13, 14, 12, 15, 15, 14, 14, 11, 14, 13, 14,
  13, 15, 10, 15, 13, 15, 15, 12, 14, 13, 14, 14, 13, 14, 13, 12, 11, 14, 14, 14, 13, 14, 13, 11, 13, 14, 15, 14, 12, 15, 13, 14, 14, 14, 14, 11, 14, 14, 10, 14, 14, 12, 14, 13, 11, 13, 14, 13, 14, 13, 12, 14, 14, 12, 14, 11, 14, 13, 14, 13, 14, 13, 14, 12, 11, 13, 14, 13, 14, 11, 14, 14, 14, 14,
  14, 12, 13, 13, 13, 13, 12, 13, 13, 14, 12, 10, 13, 13, 13, 11, 14, 14, 13, 12, 14, 13, 11, 13, 13, 12, 14, 15, 12, 13, 13, 14, 13, 14, 13, 14, 12, 14, 15, 15, 15, 13, 15, 14, 12, 14, 15, 15, 15, 15, 14, 15, 13, 15, 15, 13, 12, 15, 14, 15, 15, 12, 14, 15, 15, 13, 12, 13, 15, 14, 15, 13, 15, 14,
  15, 13, 14, 15, 11, 15, 15, 13, 15, 15, 14, 13, 15, 10, 15, 13, 15, 14, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 11, 14, 13, 14, 13, 14, 13, 14, 14, 14, 13, 14, 13, 15, 15, 15, 15, 13, 15, 14, 13, 14, 10, 12, 14, 13, 14, 12, 14, 14, 11, 14, 13, 14, 15, 13, 15, 13, 14, 13, 14, 13, 13, 13, 15, 13,
  14, 13, 14, 13, 14, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 9, 13, 13, 14, 14, 10, 14, 13, 12, 13, 13, 14, 13, 14, 14, 14, 13, 14, 14, 14, 13, 14, 13, 14, 13, 15, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 15, 14, 15, 12, 14, 14, 14, 12, 13, 13, 14, 13, 14, 13,
  14, 13, 14, 14, 13, 14, 13, 14, 13, 15, 13, 15, 14, 15, 13, 13, 14, 14, 14, 13, 15, 10, 14, 12, 14, 14, 11, 14, 14, 12, 14, 13, 14, 14, 13, 14, 13, 14, 11, 14, 13, 12, 14, 14, 12, 14, 14, 14, 15, 14, 15, 15, 13, 14, 15, 13, 14, 14, 14, 12, 14, 13, 11, 14, 11, 13, 10, 13, 13, 14, 13, 14, 13, 13, 9,
  13, 12, 13, 11, 14, 13, 10, 13, 12, 13, 12, 13, 11, 14, 13, 12, 13, 12, 13, 10, 14, 14, 14, 14, 12, 14, 13, 15, 15, 12, 15, 14, 15, 15, 11, 15, 14, 13, 14, 14, 15, 14, 14, 14, 14, 14, 11, 14, 12, 14, 13, 14, 15, 14, 14, 13, 14, 12, 14, 14, 11, 14, 12, 14, 13, 14, 11, 15, 15, 14, 13, 11, 12, 14,
  13, 14, 14, 11, 14, 13, 14, 14, 13, 14, 13, 14, 11, 15, 13, 14, 12, 14, 13, 14, 11, 15, 14, 13, 15, 12, 14, 14, 14, 11, 14, 13, 14, 12, 13, 14, 11, 13, 12, 13, 11, 14, 13, 12, 13, 13, 13, 12, 13, 11, 14, 14, 12, 14, 14, 14, 15, 14, 13, 15, 13, 12, 15, 15, 12, 15, 13, 14, 13, 14, 13, 13, 13, 13,
  13, 12, 13, 13, 14, 14, 14, 13, 14, 13, 14, 14, 13, 12, 14, 14, 14, 14, 13, 13, 13, 13, 13, 14, 14, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 15, 14, 13, 14, 13, 14, 14, 13, 14, 13, 14, 13, 14, 14, 13, 13, 13, 12, 13, 14, 13, 13, 12, 13, 13, 12, 14, 13, 14, 13, 14, 12, 14, 13, 15, 14,
  15, 14, 14, 13, 14, 15, 14, 14, 15, 13, 14, 11, 16, 13, 14, 15, 12, 14, 10, 14, 13, 14, 12, 14, 13, 14, 14, 11, 13, 12, 14, 13, 14, 13, 15, 12, 14, 13, 13, 14, 14, 11, 13, 13, 16, 12, 14, 12, 14, 14, 10, 15, 14, 13, 14, 9, 14, 13, 14, 13, 14, 15, 15, 11, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 14,
  15, 14, 15, 15, 15, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15, 15, 11, 15, 15, 13, 15, 14, 10, 15, 14, 13, 14, 14, 12, 14, 13, 14, 13, 14, 11, 14, 14, 12, 14, 14, 13, 14, 14, 12, 14, 14, 12, 14, 14, 14, 14, 15, 14, 13, 15, 15, 15, 15, 15, 11, 12, 15, 13, 15, 15, 14, 15, 10, 15, 13, 15, 15, 15, 15,
  14, 15, 11, 12, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 15, 11, 15, 15, 12, 15, 15, 13, 15, 14, 15, 15, 10, 15, 15, 14, 15, 12, 15, 15, 13, 15, 15, 15, 16, 14, 15, 14, 15, 15, 12, 15, 14, 13, 15, 15, 11, 15, 14, 15, 14, 15, 15, 13, 15, 14, 10, 14, 13, 12, 14, 13, 14, 11, 14, 14, 14, 11, 13, 14,
  12, 14, 14, 12, 14, 13, 14, 15, 14, 13, 14, 12, 14, 13, 14, 12, 14, 10, 11, 14, 14, 12, 13, 14, 12, 14, 13, 14, 12, 15, 13, 15, 14, 15, 11, 15, 13, 14, 12, 14, 14, 12, 14, 13, 14, 14, 11, 14, 13, 14, 14, 11, 14, 13, 14, 13, 15, 14, 15, 13, 15, 10, 14, 13, 14, 11, 14, 14, 12, 14, 13, 14, 12, 14,
  14, 11, 14, 13, 14, 13, 14, 15, 15, 14, 14, 15, 14, 12, 14, 13, 14, 11, 14, 14, 12, 14, 14, 11, 12, 14, 12, 14, 14, 14, 14, 12, 12, 14, 13, 14, 14, 13, 13, 12, 13, 14, 14, 11, 14, 14, 12, 14, 12, 14, 13, 14, 11, 14, 14, 13, 14, 13, 13, 14, 13, 14, 14, 14, 14, 13, 14, 13, 14, 12, 13, 13, 13, 12,
  12, 13, 14, 13, 14, 12, 12, 13, 12, 13, 12, 13, 13, 14, 14, 14, 12, 14, 13, 13, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 14, 11, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 14, 14, 14, 15, 11, 14, 13, 14, 13, 14, 12, 14, 13, 14, 11, 14, 14, 14, 14, 12, 14, 13, 13, 14, 10, 14, 13, 14, 12, 14,
  13, 14, 11, 13, 13, 12, 13, 10, 13, 12, 13, 11, 13, 12, 13, 11, 13, 12, 13, 10, 13, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 13, 14, 14, 15, 15, 10, 13, 14, 12, 14, 13, 15, 12, 15, 13, 14, 12, 15, 13, 15, 14, 14, 13, 15, 15, 15, 13, 10, 15, 12, 14, 14, 13, 14, 13, 14, 14, 13, 14, 15, 15, 15,
  13, 14, 15, 14, 13, 14, 13, 13, 15, 13, 14, 14, 13, 14, 14, 14, 13, 15, 14, 12, 14, 14, 13, 14, 12, 14, 14, 13, 14, 14, 14, 15, 15, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 12, 14, 14, 14, 14, 13, 14, 15, 14, 15, 15, 14, 14, 11, 14, 15, 15, 15, 13, 12, 15, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14,
  12, 14, 14, 15, 13, 14, 14, 15, 10, 15, 14, 15, 14, 15, 13, 14, 11, 15, 14, 15, 13, 15, 12, 14, 15, 15, 15, 13, 10, 15, 14, 15, 15, 15, 15, 12, 15, 14, 11, 15, 15, 15, 15, 13, 12, 15, 14, 15, 13, 15, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 14, 15, 11, 15, 15, 15, 15, 13, 13, 14, 15, 11,
  13, 14, 12, 14, 12, 14, 14, 13, 12, 13, 15, 11, 15, 13, 15, 12, 15, 13, 15, 11, 15, 13, 15, 12, 14, 13, 14, 11, 13, 12, 13, 13, 10, 13, 13, 14, 14, 14, 11, 14, 13, 14, 14, 14, 11, 14, 14, 12, 15, 15, 15, 15, 13, 10, 15, 13, 15, 12, 15, 13, 15, 14, 14, 12, 14, 15, 12, 13, 13, 14, 13, 13, 14, 14,
  13, 13, 13, 13, 12, 13, 11, 13, 14, 13, 10, 13, 12, 13, 11, 13, 14, 14, 10, 14, 12, 13, 11, 13, 12, 13, 13, 14, 12, 13, 14, 14, 11, 14, 14, 12, 14, 13, 14, 12, 14, 14, 11, 14, 13, 15, 14, 15, 13, 14, 13, 14, 13, 14, 13, 14, 15, 14, 14, 15, 13, 14, 13, 14, 10, 14, 13, 14, 13, 14, 13, 14, 13, 14,
  14, 14, 14, 14, 14, 10, 15, 13, 14, 12, 14, 14, 14, 13, 14, 14, 12, 12, 13, 14, 12, 14, 14, 12, 14, 14, 12, 14, 14, 12, 14, 13, 14, 14, 13, 13, 14, 14, 12, 15, 14, 13, 14, 14, 14, 14, 11, 14, 14, 12, 14, 14, 11, 14, 11, 12, 14, 14, 12, 14, 14, 12, 14, 14, 12, 14, 13, 14, 12, 14, 13, 12, 13, 12,
  13, 14, 12, 13, 12, 14, 13, 11, 13, 11, 14, 13, 14, 14, 11, 14, 14, 12, 14, 13, 14, 14, 11, 14, 13, 14, 12, 14, 15, 12, 14, 13, 14, 14, 13, 14, 13, 14, 12, 14, 12, 14, 13, 14, 13, 14, 13, 14, 10, 14, 14, 15, 12, 15, 15, 13, 15, 15, 14, 15, 12, 15, 15, 13, 15, 15, 13, 15, 13, 13, 14, 13, 14, 13,
  14, 15, 12, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 12, 14, 13, 14, 13, 14, 13, 14, 15, 14, 13, 12, 14, 14, 13, 14, 13, 14, 13, 14, 14, 14, 14, 13, 15, 14, 13, 14, 14, 12, 15, 15, 13, 15, 15, 13, 14, 14, 15, 13, 14, 13, 14, 13, 14, 14, 14, 14, 14, 13, 13, 13, 13, 14, 16, 14, 12, 14, 11, 13, 13,
  13, 10, 14, 14, 14, 16, 12, 11, 14, 13, 16, 14, 12, 15, 14, 13, 14, 16, 14, 15, 13, 13, 14, 13, 14, 13, 14, 13, 13, 13, 13, 13, 14, 14, 13, 12, 13, 14, 12, 14, 14, 15, 14, 13, 15, 13, 15, 14, 14, 15, 14, 15, 15, 12, 15, 13, 15, 15, 11, 15, 14, 15, 12, 15, 14, 15, 15, 10, 15, 14, 15, 12, 14, 13,
  14, 11, 14, 13, 14, 15, 14, 14, 14, 15, 15, 12, 15, 13, 15, 14, 15, 15, 11, 14, 15, 13, 15, 15, 13, 15, 15, 10, 15, 13, 15, 15, 12, 15, 14, 15, 15, 12, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 11, 15, 15, 15, 15, 12, 15, 14, 15, 15, 11, 14, 15, 13, 14, 13, 14, 14, 14, 15, 11, 13,
  14, 13, 14, 14, 15, 14, 14, 13, 12, 14, 14, 11, 14, 14, 14, 12, 14, 14, 15, 13, 14, 14, 14, 13, 11, 15, 15, 14, 15, 12, 15, 15, 14, 15, 14, 15, 14, 15, 13, 15, 15, 13, 15, 14, 15, 15, 15, 15, 12, 15, 14, 14, 14, 15, 15, 13, 14, 13, 14, 13, 14, 14, 13, 14, 14, 13, 15, 14, 14, 14, 14, 14, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 16, 15, 15, 15, 14, 15, 15, 11, 14, 14, 15, 15, 12, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 9, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15,
  15, 15, 15, 16, 16, 16, 15, 15, 15, 15, 15, 15, 14, 15, 13, 16, 16, 15, 15, 16, 14, 14, 16, 15, 16, 14, 15, 15, 14, 15, 15, 16, 16, 15, 15, 15, 16, 14, 15, 15, 14, 14, 9, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 14,
  15, 14, 15, 13, 15, 14, 14, 14, 14, 15, 13, 13, 15, 15, 14, 15, 13, 15, 14, 15, 13, 14, 13, 14, 14, 11, 14, 14, 13, 14, 14, 13, 14, 12, 14, 14, 13, 14, 11, 14, 13, 14, 14, 14, 14, 12, 14, 14, 12, 14, 14, 12, 14, 14, 12, 14, 14, 14, 14, 13, 14, 13, 12, 14, 12, 14, 13, 14, 12, 14, 13, 14, 14, 12,
  14, 13, 14, 14, 13, 14, 14, 12, 14, 14, 12, 14, 14, 12, 14, 13, 14, 11, 14, 14, 12, 14, 14, 12, 14, 13, 14, 14, 15, 14, 14, 12, 14, 13, 14, 13, 10, 14, 14, 14, 11, 14, 14, 12, 15, 15, 12, 13, 14, 10, 14, 13, 13, 11, 13, 12, 13, 12, 13, 13, 12, 13, 13, 14, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13,
  10, 13, 13, 14, 13, 12, 13, 11, 13, 14, 12, 14, 14, 14, 11, 14, 12, 14, 14, 12, 14, 13, 14, 13, 14, 10, 14, 13, 14, 12, 14, 15, 13, 15, 15, 12, 15, 14, 15, 14, 14, 14, 14, 11, 14, 13, 14, 14, 13, 14, 13, 14, 14, 12, 14, 13, 14, 14, 11, 14, 14, 12, 14, 14, 12, 14, 14, 10, 14, 14, 12, 14, 14, 11,
  14, 12, 12, 14, 14, 11, 14, 14, 12, 14, 14, 11, 14, 14, 12, 14, 13, 12, 14, 14, 11, 13, 13, 14, 14, 11, 14, 14, 14, 14, 11, 14, 14, 12, 14, 11, 14, 14, 12, 14, 13, 14, 15, 13, 15, 14, 13, 14, 12, 14, 13, 14, 14, 12, 14, 11, 14, 13, 14, 12, 14, 14, 13, 14, 13, 14, 14, 12, 14, 12, 13, 12, 13, 12,
  14, 13, 14, 14, 13, 14, 13, 14, 13, 14, 12, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 12, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 15, 15, 13, 15, 15,
  13, 15, 15, 12, 10, 15, 15, 13, 15, 14, 15, 15, 15, 16, 15, 15, 13, 15, 14, 15, 15, 12, 16, 14, 14, 14, 11, 15, 14, 13, 12, 14, 13, 14, 10, 14, 13, 14, 14, 14, 14, 11, 14, 13, 14, 12, 14, 13, 14, 10, 14, 12, 14, 14, 11, 13, 14, 14, 14, 14, 14, 14, 13, 12, 14, 13, 14, 11, 15, 14, 14, 12, 14, 11,
  14, 13, 14, 14, 14, 13, 14, 15, 14, 15, 11, 15, 14, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 15, 15, 13, 14, 15, 14, 15, 14, 14, 14, 12, 13, 13, 14, 15, 13, 14, 11, 14, 14, 12, 14, 14, 14, 13, 14, 12, 15, 14, 14, 14, 12, 13, 14, 11, 14, 13, 14, 13, 14, 13, 14, 14, 13, 14, 14, 14,
  14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 13, 15, 14, 16, 16, 14, 15, 12, 15, 13, 15, 15, 13, 15, 15, 13, 14, 13, 14, 13, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 14, 12, 13, 14, 13, 14, 13, 14, 14, 12, 14, 13, 14,
  12, 14, 13, 14, 12, 14, 14, 13, 14, 14, 12, 12, 14, 11, 14, 14, 14, 12, 14, 13, 14, 14, 14, 14, 14, 13, 13, 14, 11, 14, 14, 12, 14, 14, 12, 14, 15, 14, 11, 13, 14, 14, 14, 12, 14, 14, 14, 15, 14, 12, 15, 14, 15, 14, 15, 15, 12, 15, 15, 13, 15, 15, 12, 15, 15, 15, 13, 15, 12, 15, 14, 15, 12, 15,
  15, 13, 15, 14, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 12, 15, 14, 15, 15, 14, 15, 15, 13, 15, 13, 14, 11, 15, 14, 15, 14, 15, 13, 15, 15, 13, 15, 14, 10, 15, 15, 15, 15, 12, 15, 15, 13, 15, 14, 15, 14, 15, 15, 13, 15, 15, 12, 15, 12, 15, 15, 11, 15, 15, 13, 15, 13, 15, 14,
  11, 14, 13, 14, 14, 13, 14, 14, 12, 14, 13, 14, 11, 13, 14, 14, 14, 10, 13, 12, 13, 11, 13, 12, 13, 12, 13, 14, 12, 13, 14, 12, 14, 14, 12, 14, 13, 13, 11, 14, 13, 14, 13, 14, 14, 11, 14, 14, 12, 14, 11, 14, 14, 12, 14, 14, 12, 14, 13, 14, 13, 14, 14, 12, 14, 14, 11, 14, 14, 12, 14, 14, 11, 14,
  13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 13, 14, 14, 13, 14, 13, 14, 13, 11, 13, 12, 13, 13, 13, 13, 14, 13, 13, 12, 13, 14, 14, 13, 14, 13, 14, 15, 14, 14, 11, 14, 13, 14, 13, 15, 14, 15, 12, 14, 14, 13, 14, 14, 14, 13, 12, 13, 12, 13, 14, 14, 10, 13, 14, 12, 14, 15, 11, 13, 15,
  14, 15, 15, 12, 13, 15, 14, 15, 16, 14, 15, 11, 13, 14, 15, 14, 12, 13, 14, 14, 14, 13, 13, 14, 13, 14, 13, 14, 13, 14, 14, 14, 13, 15, 12, 13, 14, 10, 14, 14, 11, 14, 13, 14, 12, 14, 13, 14, 11, 15, 14, 14, 10, 14, 14, 14, 13, 14, 12, 14, 13, 15, 11, 15, 13, 15, 15, 12, 15, 14, 14, 12, 14, 13,
  14, 14, 14, 14, 13, 14, 13, 11, 11, 14, 14, 12, 14, 14, 12, 14, 13, 15, 14, 15, 13, 15, 15, 13, 15, 15, 12, 15, 15, 13, 15, 14, 12, 14, 13, 14, 15, 15, 11, 15, 13, 15, 12, 15, 15, 13, 13, 11, 15, 15, 15, 14, 15, 15, 15, 13, 15, 14, 13, 14, 14, 15, 13, 15, 14, 11, 12, 14, 15, 10, 14, 15, 15, 13,
  15, 14, 15, 11, 15, 14, 15, 15, 14, 15, 14, 14, 12, 11, 14, 12, 14, 13, 14, 14, 15, 15, 13, 14, 15, 14, 14, 15, 13, 11, 12, 14, 13, 14, 13, 14, 13, 14, 10, 12, 14, 14, 12, 14, 13, 14, 11, 15, 13, 15, 14, 15, 14, 12, 14, 13, 13, 15, 12, 14, 12, 13, 11, 13, 10, 13, 14, 13, 12, 14, 14, 13, 13, 14,
  15, 12, 13, 14, 16, 16, 16, 16, 15, 13, 17, 16, 16, 16, 13, 16, 15, 15, 15, 15, 16, 16, 16, 15, 16, 15, 15, 13, 15, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 14, 14, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 14, 10, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 14, 13, 14, 12, 12, 14, 13,
  14, 13, 13, 13, 14, 12, 14, 13, 14, 13, 14, 14, 12, 13, 14, 13, 12, 13, 12, 13, 13, 12, 14, 13, 12, 13, 13, 14, 14, 13, 12, 14, 13, 14, 14, 12, 15, 12, 14, 13, 15, 15, 13, 15, 15, 15, 14, 13, 14, 12, 14, 14, 15, 12, 11, 13, 14, 13, 14, 10, 14, 13, 14, 14, 12, 14, 13, 12, 13, 13, 12, 13, 14, 13,
  13, 12, 13, 12, 14, 14, 12, 14, 13, 14, 12, 15, 14, 11, 14, 13, 14, 15, 12, 15, 15, 14, 15, 12, 15, 15, 13, 15, 12, 14, 13, 14, 11, 15, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 15, 13, 15, 13, 15, 12, 15, 13, 14, 13, 14, 14, 12, 14, 14, 12, 14, 14, 11, 14, 14, 11, 13, 12, 13,
  12, 13, 12, 13, 12, 13, 13, 13, 14, 12, 12, 13, 12, 13, 11, 13, 12, 13, 12, 14, 13, 14, 10, 15, 13, 14, 13, 14, 15, 14, 14, 13, 15, 13, 14, 15, 13, 15, 15, 15, 15, 12, 15, 13, 15, 12, 15, 14, 14, 11, 14, 13, 15, 14, 15, 11, 11, 14, 14, 12, 14, 13, 14, 11, 14, 14, 12, 14, 13, 13, 14, 11, 14, 13,
  12, 14, 13, 14, 14, 11, 14, 14, 12, 14, 14, 11, 14, 14, 12, 14, 14, 12, 14, 12, 14, 13, 13, 14, 11, 14, 12, 14, 13, 14, 14, 13, 14, 14, 14, 12, 14, 13, 11, 10, 14, 14, 12, 14, 13, 14, 14, 11, 14, 14, 12, 14, 14, 13, 12, 14, 11, 14, 14, 12, 14, 14, 14, 14, 14, 12, 14, 10, 14, 14, 14, 13, 13, 14,
  14, 14, 14, 12, 14, 14, 10, 14, 13, 14, 13, 14, 11, 14, 13, 14, 15, 14, 14, 11, 14, 15, 12, 15, 12, 14, 13, 14, 14, 15, 11, 15, 14, 13, 14, 14, 13, 15, 14, 13, 14, 9, 14, 14, 10, 14, 13, 15, 14, 14, 14, 11, 14, 13, 14, 12, 14, 13, 14, 15, 13, 14, 11, 14, 13, 14, 11, 14, 14, 12, 14, 14, 10, 14, 14,
  12, 14, 14, 12, 14, 13, 15, 12, 14, 14, 12, 14, 13, 14, 11, 14, 14, 12, 14, 14, 11, 14, 13, 14, 10, 13, 13, 14, 11, 14, 14, 12, 14, 13, 14, 11, 14, 13, 14, 13, 14, 11, 14, 14, 12, 13, 14, 12, 14, 13, 13, 12, 13, 14, 13, 14, 13, 11, 14, 14, 13, 13, 14, 14, 14, 14, 12, 14, 14, 10, 14, 13, 15, 13,
  15, 14, 15, 15, 14, 14, 12, 12, 14, 9, 14, 13, 14, 14, 10, 13, 13, 14, 11, 13, 13, 14, 13, 13, 12, 14, 9, 12, 14, 13, 14, 14, 14, 11, 14, 14, 12, 14, 15, 12, 13, 14, 14, 11, 14, 13, 14, 13, 15, 14, 12, 14, 14, 10, 14, 13, 14, 14, 13, 14, 14, 12, 11, 13, 14, 13, 13, 11, 13, 12, 10, 12, 13, 11, 13,
  10, 13, 12, 13, 13, 13, 11, 14, 13, 13, 13, 14, 14, 15, 13, 14, 14, 10, 14, 15, 13, 11, 14, 14, 14, 15, 15, 14, 14, 15, 14, 14, 14, 14, 10, 13, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 15, 14, 15, 15, 16, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 14, 15,
  15, 14, 14, 14, 14, 14, 13, 14, 14, 15, 13, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 13, 16, 14, 13, 15, 15, 15, 15, 10, 13, 15, 14, 13, 12, 15, 14, 15, 15, 11, 13, 12, 14, 13, 12, 14, 14, 12, 14, 13, 14, 13, 14, 13, 14, 12, 14, 14, 11, 14,
  11, 14, 13, 12, 13, 12, 13, 13, 13, 14, 13, 13, 11, 13, 14, 12, 14, 10, 14, 13, 14, 13, 14, 13, 14, 11, 15, 14, 12, 15, 13, 15, 15, 15, 15, 13, 14, 14, 14, 14, 13, 14, 13, 14, 11, 14, 11, 14, 14, 14, 13, 14, 13, 14, 14, 15, 13, 12, 14, 14, 15, 13, 10, 11, 14, 13, 14, 12, 14, 13, 14, 13, 14, 10,
  14, 13, 14, 13, 14, 14, 11, 14, 14, 12, 14, 14, 12, 14, 14, 9, 14, 12, 13, 11, 13, 12, 13, 11, 13, 13, 14, 12, 14, 14, 13, 14, 11, 13, 14, 12, 14, 13, 14, 10, 14, 13, 14, 14, 12, 13, 14, 13, 10, 13, 12, 14, 14, 11, 14, 14, 10, 14, 14, 10, 14, 14, 12, 13, 11, 13, 12, 13, 11, 13, 12, 13, 13, 14, 13,
  12, 13, 12, 13, 13, 11, 14, 14, 14, 14, 10, 14, 14, 12, 10, 14, 11, 14, 13, 14, 14, 10, 14, 14, 12, 14, 14, 11, 14, 13, 14, 13, 14, 11, 14, 14, 12, 14, 14, 11, 14, 14, 12, 14, 14, 11, 14, 14, 12, 14, 14, 12, 14, 14, 13, 14, 10, 13, 12, 13, 11, 13, 12, 13, 11, 13, 12, 13, 13, 13, 14, 11, 14, 12,
  13, 14, 12, 13, 14, 10, 14, 14, 12, 14, 13, 14, 10, 14, 13, 14, 14, 11, 14, 14, 12, 14, 14, 10, 14, 13, 12, 14, 13, 11, 13, 14, 14, 12, 14, 14, 10, 14, 13, 14, 14, 11, 14, 14, 12, 13, 14, 13, 14, 13, 12, 13, 13, 12, 14, 14, 10, 14, 13, 14, 14, 11, 14, 14, 12, 13, 14, 10, 14, 14, 13, 13, 14, 13,
  14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 12, 14, 13, 14, 13, 14, 14, 12, 13, 13, 14, 13, 13, 13, 13, 14, 12, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 10, 14, 14, 14, 14, 14, 13, 14, 14, 12, 14, 12, 14, 13, 14, 14, 15, 14,
  11, 13, 15, 13, 15, 11, 13, 15, 13, 12, 14, 14, 12, 13, 13, 14, 14, 14, 10, 15, 12, 13, 13, 14, 16, 16, 15, 14, 12, 15, 13, 15, 15, 13, 14, 14, 15, 14, 15, 15, 15, 13, 15, 14, 14, 15, 15, 14, 14, 13, 14, 12, 14, 15, 13, 15, 15, 15, 15, 15, 16, 14, 15, 15, 16, 8, 15, 14, 14, 15, 14, 14, 14, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 15, 13, 14, 13, 14, 15, 13, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 15, 14, 13, 14, 14, 14, 15,
  14, 15, 13, 14, 14, 14, 13, 14, 13, 14, 13, 13, 12, 13, 14, 13, 13, 12, 13, 12, 13, 13, 12, 12, 13, 14, 12, 14, 13, 14, 12, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 13, 14, 13, 14, 13, 14, 14, 13, 13, 13, 14, 11, 14, 13, 14, 10, 13, 14, 14, 12, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14,
  12, 14, 14, 11, 14, 13, 14, 13, 14, 14, 14, 14, 11, 14, 13, 14, 15, 11, 14, 13, 14, 13, 14, 14, 11, 14, 13, 14, 12, 14, 13, 14, 14, 13, 14, 13, 14, 14, 14, 12, 13, 10, 13, 12, 13, 12, 13, 13, 13, 13, 14, 14, 12, 13, 13, 13, 13, 10, 15, 14, 12, 13, 12, 13, 14, 13, 11, 15, 14, 14, 12, 14, 13, 14,
  14, 10, 14, 14, 12, 14, 13, 14, 14, 14, 13, 14, 12, 15, 13, 14, 11, 14, 13, 12, 12, 14, 13, 14, 15, 14, 13, 14, 14, 13, 10, 15, 13, 14, 12, 14, 13, 14, 14, 11, 14, 13, 14, 14, 14, 13, 10, 12, 14, 13, 14, 15, 12, 14, 13, 15, 14, 12, 14, 13, 15, 13, 14, 12, 13, 15, 13, 15, 13, 14, 11, 14, 12, 15,
  14, 15, 10, 16, 15, 15, 16, 15, 15, 13, 15, 11, 14, 12, 14, 14, 13, 14, 11, 14, 15, 14, 12, 14, 15, 13, 12, 14, 14, 10, 13, 15, 12, 15, 14, 14, 15, 11, 15, 14, 15, 13, 15, 14, 15, 15, 12, 15, 13, 15, 15, 12, 15, 15, 13, 15, 14, 15, 11, 15, 15, 13, 15, 15, 12, 15, 15, 13, 15, 14, 15, 14, 15, 15,
  10, 15, 15, 13, 15, 14, 15, 13, 15, 15, 15, 14, 13, 14, 12, 14, 13, 11, 14, 14, 14, 14, 13, 14, 14, 14, 14, 15, 14, 16, 16, 16, 16, 12, 15, 15, 15, 16, 15, 15, 16, 15, 13, 15, 15, 15, 15, 14, 15, 16, 15, 15, 15, 16, 16, 16, 13, 16, 16, 13, 15, 14, 15, 14, 15, 15, 14, 15, 16, 16, 15, 14, 15, 15,
  15, 14, 15, 13, 11, 14, 13, 14, 13, 14, 13, 14, 12, 14, 15, 15, 15, 13, 15, 13, 14, 15, 15, 12, 13, 15, 14, 13, 15, 14, 15, 15, 14, 11, 15, 11, 15, 14, 15, 15, 12, 15, 15, 13, 15, 15, 15, 16, 15, 13, 15, 12, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 11, 15, 15, 13, 11, 15, 12,
  15, 15, 13, 14, 14, 15, 12, 14, 13, 14, 14, 15, 13, 14, 15, 15, 12, 12, 14, 13, 14, 14, 11, 14, 13, 14, 12, 15, 13, 15, 15, 15, 15, 13, 12, 12, 14, 13, 14, 14, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 13, 14, 14, 11, 14, 13, 14, 14, 15, 14, 13, 14, 14, 12, 14, 13, 15, 14, 15, 14, 14, 14,
  14, 14, 15, 14, 14, 15, 15, 14, 14, 15, 15, 14, 9, 14, 14, 14, 15, 14, 15, 13, 15, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 15, 14, 14, 13, 15, 15, 14, 12, 14, 14, 14, 14, 14, 15, 13, 15, 13, 13, 15, 14, 15, 14, 14, 15, 14, 14, 14, 13, 14, 13, 14,
  15, 13, 14, 13, 14, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 13, 13, 13, 14, 13, 13, 13, 13, 13, 11, 13, 13, 14, 13, 14, 14, 13, 13, 13, 13, 12, 14, 13, 13, 13, 14, 13, 13, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 12, 14, 13, 14, 13, 14, 13, 15, 13, 15, 13, 14, 13, 15, 13, 14, 13, 14, 14, 15,
  13, 14, 13, 14, 14, 11, 14, 13, 14, 13, 14, 14, 14, 13, 14, 13, 14, 10, 14, 14, 12, 13, 13, 14, 13, 13, 14, 13, 14, 14, 14, 12, 14, 14, 15, 14, 11, 14, 13, 14, 13, 14, 14, 12, 14, 11, 14, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 15, 13, 15, 12, 14, 13, 14, 12, 14, 13, 14, 14, 10, 13, 13,
  13, 11, 13, 14, 14, 14, 13, 14, 14, 12, 14, 13, 14, 12, 15, 13, 15, 13, 15, 15, 10, 15, 15, 11, 14, 13, 14, 14, 14, 14, 12, 14, 14, 11, 11, 14, 14, 12, 14, 14, 11, 14, 14, 12, 14, 13, 14, 14, 15, 14, 13, 11, 12, 15, 14, 14, 11, 15, 13, 15, 13, 15, 14, 15, 10, 15, 15, 15, 14, 12, 15, 13, 14, 15,
  11, 14, 13, 14, 14, 14, 13, 13, 14, 14, 13, 12, 13, 11, 13, 12, 13, 12, 11, 14, 13, 14, 10, 14, 13, 14, 10, 14, 14, 12, 14, 13, 15, 11, 15, 13, 15, 12, 15, 13, 15, 11, 14, 13, 14, 12, 15, 13, 14, 14, 14, 13, 14, 12, 14, 14, 11, 14, 14, 12, 14, 14, 11, 14, 14, 12, 14, 13, 14, 10, 14, 14, 10, 13,
  14, 11, 14, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 13, 14, 11, 14, 13, 14, 14, 14, 12, 14, 14, 11, 14, 14, 12, 14, 13, 15, 14, 12, 14, 14, 11, 14, 13, 13, 11, 13, 12, 13, 12, 13, 12, 13, 12, 14, 13, 11, 13, 13, 14, 11, 14, 13, 14, 12, 14, 14, 14, 13, 15, 11, 14, 13, 14, 12, 13, 13,
  10, 13, 12, 13, 11, 14, 13, 14, 12, 14, 13, 14, 13, 14, 14, 14, 14, 10, 13, 15, 12, 14, 14, 14, 12, 15, 14, 13, 14, 12, 14, 13, 14, 13, 14, 13, 14, 12, 14, 13, 14, 13, 14, 14, 14, 13, 14, 13, 14, 13, 13, 14, 13, 14, 13, 13, 14, 12, 14, 13, 14, 13, 14, 14, 12, 14, 13, 12, 14, 13, 11, 13, 15, 15,
  15, 15, 15, 12, 15, 14, 11, 15, 15, 15, 15, 13, 12, 15, 14, 15, 13, 15, 12, 15, 13, 11, 13, 14, 12, 14, 13, 14, 13, 14, 11, 14, 14, 12, 14, 14, 12, 14, 14, 12, 14, 13, 14, 13, 14, 11, 14, 13, 12, 13, 11, 14, 13, 13, 11, 13, 12, 13, 11, 12, 13, 13, 11, 12, 13, 13, 12, 13, 11, 13, 13, 14, 11, 14,
  13, 15, 12, 15, 13, 14, 12, 14, 13, 15, 12, 14, 13, 14, 12, 15, 13, 14, 12, 15, 13, 11, 13, 12, 13, 12, 13, 13, 12, 13, 11, 13, 12, 13, 11, 13, 12, 13, 11, 13, 12, 13, 11, 14, 13, 13, 14, 10, 14, 14, 15, 15, 13, 11, 15, 15, 15, 13, 15, 15, 15, 15, 13, 12, 15, 13, 14, 11, 14, 14, 15, 14, 15, 14,
  15, 14, 13, 15, 10, 13, 14, 12, 14, 13, 15, 12, 13, 13, 9, 13, 12, 13, 11, 13, 12, 13, 10, 13, 12, 11, 13, 13, 12, 13, 10, 13, 12, 13, 11, 13, 12, 13, 12, 13, 12, 13, 12, 13, 14, 12, 13, 13, 10, 13, 12, 14, 14, 11, 14, 13, 14, 10, 13, 14, 13, 14, 14, 11, 14, 13, 14, 14, 15, 11, 14, 15, 12, 15, 15,
  15, 13, 15, 14, 15, 13, 15, 11, 15, 13, 15, 12, 15, 13, 15, 12, 13, 13, 13, 11, 13, 12, 13, 10, 13, 13, 14, 11, 14, 14, 13, 14, 10, 14, 13, 13, 11, 13, 13, 14, 11, 13, 13, 15, 15, 15, 12, 15, 14, 15, 15, 15, 14, 15, 15, 15, 13, 16, 11, 14, 12, 14, 14, 14, 14, 14, 11, 14, 14, 12, 14, 13, 14, 14,
  12, 14, 13, 14, 11, 11, 14, 14, 12, 14, 13, 15, 14, 15, 13, 13, 14, 14, 12, 14, 13, 14, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 14, 13, 14, 14, 15, 14, 13, 10, 14, 13, 15, 12, 14, 13, 11, 13, 12, 13, 11, 14, 15, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14,
  12, 14, 13, 14, 12, 14, 13, 13, 13, 13, 11, 12, 14, 13, 14, 12, 14, 13, 14, 13, 14, 11, 14, 13, 15, 12, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 13, 11, 13, 12, 13, 12, 13, 13, 13, 12, 14, 13, 14, 11, 14, 14, 14, 14, 12, 11, 14, 14, 14, 14, 12, 11, 14, 14,
  15, 14, 12, 11, 14, 13, 15, 12, 14, 16, 13, 14, 11, 14, 13, 14, 12, 14, 14, 14, 14, 11, 12, 14, 13, 14, 11, 14, 14, 14, 14, 12, 11, 14, 13, 14, 12, 14, 14, 14, 14, 14, 10, 14, 13, 14, 13, 14, 13, 14, 12, 14, 13, 14, 10, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 10, 14, 13, 14,
  14, 14, 14, 13, 14, 11, 13, 14, 14, 14, 10, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 12, 14, 13, 14, 10, 14, 14, 14, 14, 12, 11, 14, 13, 14, 12, 14, 13, 14, 10, 14, 14, 14, 14, 12, 11, 14, 14, 14, 14, 12, 11, 14, 14, 14, 14, 12, 11, 14, 14, 14, 14, 12, 11, 14, 14, 14, 14, 12, 11, 14, 14, 14, 14,
  12, 10, 14, 14, 14, 14, 12, 11, 13, 13, 13, 12, 13, 13, 14, 10, 14, 14, 14, 14, 12, 11, 14, 14, 14, 14, 12, 11, 14, 14, 14, 14, 12, 10, 14, 13, 14, 14, 14, 14, 11, 13, 14, 10, 14, 13, 14, 13, 14, 12, 14, 14, 14, 14, 10, 14, 14, 12, 15, 14, 15, 11, 12, 15, 13, 15, 10, 14, 14, 13, 14, 14, 14, 14,
  11, 13, 14, 10, 14, 12, 14, 14, 14, 14, 11, 13, 14, 10, 14, 12, 13, 11, 13, 12, 13, 11, 13, 12, 13, 11, 13, 12, 13, 11, 13, 12, 13, 11, 13, 12, 13, 10, 13, 12, 13, 11, 13, 12, 13, 10, 13, 14, 12, 15, 14, 13, 14, 11, 14, 13, 14, 12, 14, 14, 10, 13, 12, 13, 11, 13, 12, 13, 11, 13, 12, 13, 10, 14,
  14, 12, 14, 13, 14, 11, 14, 13, 14, 14, 12, 15, 15, 13, 15, 15, 10, 14, 14, 12, 13, 11, 13, 12, 13, 11, 13, 12, 15, 13, 14, 10, 15, 14, 15, 15, 12, 14, 13, 15, 11, 13, 12, 13, 11, 13, 13, 13, 11, 14, 14, 14, 13, 13, 12, 14, 15, 10, 14, 14, 12, 13, 11, 13, 13, 14, 14, 12, 14, 10, 14, 13, 11, 14,
  14, 14, 15, 12, 11, 13, 15, 13, 14, 14, 12, 14, 14, 13, 14, 10, 14, 13, 14, 14, 14, 14, 11, 13, 14, 10, 14, 14, 14, 14, 12, 11, 14, 14, 14, 14, 12, 11, 14, 14, 14, 14, 12, 12, 14, 13, 14, 10, 14, 14, 14, 13, 11, 13, 12, 14, 13, 14, 10, 14, 13, 14, 12, 14, 13, 14, 11, 14, 14, 14, 14, 12, 10, 14,
  14, 14, 14, 12, 11, 14, 13, 14, 12, 14, 13, 14, 10, 14, 14, 14, 14, 14, 12, 11, 14, 13, 14, 13, 11, 14, 13, 14, 12, 14, 10, 14, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 14, 14, 14, 10, 15, 14, 14, 12, 15, 11, 15, 15, 16, 13, 14, 15, 13, 15, 12, 14, 15, 10, 14, 14, 14, 13, 14, 14, 14, 14, 11,
  14, 14, 13, 14, 10, 14, 13, 14, 12, 15, 15, 13, 15, 15, 11, 14, 13, 14, 12, 14, 14, 14, 13, 14, 12, 14, 10, 14, 13, 13, 14, 12, 14, 11, 14, 13, 14, 12, 15, 14, 15, 15, 13, 14, 9, 14, 12, 14, 14, 13, 14, 11, 14, 13, 14, 12, 14, 10, 14, 14, 13, 14, 12, 14, 13, 14, 11, 14, 12, 14, 14, 15, 13, 14, 11,
  14, 13, 14, 12, 14, 13, 14, 13, 14, 10, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 13, 14, 12, 14, 14, 14, 11, 12, 14, 13, 14, 13, 14, 12, 14, 13, 14, 11, 14, 14, 15, 15, 13, 14, 15, 13, 15, 15, 11, 14, 15, 13, 12, 15, 12, 15, 13, 14, 15, 13, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14,
  10, 14, 14, 13, 15, 12, 14, 13, 14, 11, 15, 12, 15, 13, 14, 13, 15, 11, 15, 12, 14, 14, 13, 15, 11, 15, 13, 15, 12, 15, 13, 15, 10, 15, 14, 14, 13, 15, 14, 15, 14, 15, 13, 15, 11, 15, 13, 15, 12, 15, 13, 14, 14, 14, 15, 10, 15, 13, 14, 12, 15, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 14, 11, 14,
  15, 15, 14, 12, 11, 14, 14, 14, 14, 12, 10, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 14, 14, 14, 12, 10, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 10, 14, 13, 14, 13, 14, 12, 14, 10, 13, 12, 13, 12, 13, 9, 13, 13, 14, 13, 13, 12, 11, 14, 10, 14, 13, 13, 13, 13, 11, 10, 13, 12, 14, 14, 11, 14, 13,
  14, 12, 14, 13, 14, 13, 14, 14, 10, 14, 14, 12, 13, 11, 13, 12, 13, 10, 14, 13, 14, 12, 15, 13, 15, 15, 11, 14, 13, 14, 14, 12, 14, 14, 11, 13, 12, 13, 10, 13, 12, 14, 13, 14, 13, 14, 10, 12, 14, 14, 12, 14, 13, 11, 13, 12, 13, 11, 13, 12, 13, 11, 13, 12, 13, 14, 13, 12, 11, 14, 10, 13, 14, 12,
  14, 13, 14, 12, 14, 13, 10, 13, 14, 12, 13, 11, 13, 12, 13, 12, 13, 10, 13, 12, 13, 11, 14, 13, 12, 14, 13, 14, 14, 14, 14, 12, 14, 14, 15, 11, 15, 15, 10, 14, 15, 13, 14, 12, 14, 13, 14, 13, 14, 14, 9, 13, 13, 13, 13, 11, 10, 13, 12, 13, 11, 13, 12, 13, 11, 13, 12, 13, 11, 13, 12, 13, 10, 13, 12,
  13, 11, 13, 12, 13, 11, 14, 13, 12, 14, 14, 14, 14, 13, 14, 12, 10, 14, 14, 14, 15, 14, 14, 11, 12, 13, 14, 13, 14, 12, 14, 13, 14, 15, 11, 14, 13, 14, 15, 12, 14, 13, 14, 10, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 10, 14, 14, 12, 14, 13, 11, 13, 14, 12, 13, 12, 13, 14, 11, 15, 15, 13, 15, 15,
  12, 15, 14, 14, 15, 11, 14, 13, 14, 12, 14, 14, 10, 13, 14, 12, 14, 13, 11, 14, 14, 12, 14, 14, 10, 14, 13, 14, 13, 14, 13, 14, 13, 15, 14, 11, 15, 15, 10, 15, 15, 13, 15, 15, 12, 14, 13, 14, 11, 14, 14, 12, 13, 11, 13, 12, 13, 12, 13, 10, 13, 12, 13, 11, 13, 12, 14, 14, 10, 14, 13, 14, 12, 14,
  13, 14, 12, 14, 13, 14, 10, 14, 13, 14, 15, 12, 14, 13, 14, 11, 14, 13, 14, 12, 13, 14, 10, 13, 12, 13, 11, 13, 12, 13, 11, 13, 12, 13, 11, 13, 14, 14, 13, 12, 14, 13, 14, 14, 10, 14, 15, 13, 14, 14, 14, 14, 11, 13, 14, 10, 14, 13, 14, 14, 14, 14, 11, 12, 14, 14, 14, 14, 12, 10, 14, 13, 14, 14,
  14, 14, 11, 13, 14, 10, 14, 14, 14, 14, 12, 11, 14, 14, 14, 15, 12, 15, 11, 13, 15, 14, 14, 14, 12, 10, 14, 14, 14, 14, 12, 11, 14, 14, 14, 14, 12, 10, 13, 15, 13, 15, 14, 15, 13, 15, 14, 12, 14, 13, 14, 10, 14, 14, 14, 14, 12, 11, 14, 14, 14, 14, 12, 11, 14, 13, 14, 12, 14, 13, 14, 10, 14, 13,
  14, 13, 14, 14, 14, 14, 11, 13, 14, 14, 14, 14, 12, 13, 16, 15, 15, 13, 14, 15, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 15, 12, 14, 13, 14, 12, 14, 13, 14, 11, 14, 14, 14, 14, 12, 11, 14, 14, 14, 14, 12, 11, 14, 13, 14, 12, 14, 14, 14, 11, 14, 13, 14, 12, 14, 13, 14, 11, 14,
  12, 14, 13, 14, 13, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 13, 14, 15, 14, 10, 13, 15, 13, 14, 15, 12, 15, 14, 13, 14, 11, 14, 13, 14, 14, 14, 11, 14, 13, 14, 12, 14, 13, 14, 14, 14, 10, 14, 13, 14, 14, 14, 11, 14, 13, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13,
  14, 11, 14, 14, 14, 14, 12, 11, 14, 14, 14, 15, 12, 11, 13, 15, 13, 14, 15, 12, 14, 13, 14, 13, 14, 10, 14, 13, 14, 13, 14, 11, 14, 13, 15, 14, 13, 10, 14, 14, 14, 15, 14, 15, 12, 15, 13, 14, 11, 14, 13, 14, 14, 15, 12, 15, 13, 14, 11, 15, 13, 15, 12, 14, 14, 13, 15, 11, 14, 15, 13, 15, 14, 15,
  12, 15, 13, 15, 12, 15, 13, 15, 12, 14, 13, 14, 13, 14, 14, 14, 14, 11, 13, 14, 13, 10, 13, 12, 15, 15, 13, 11, 15, 15, 15, 12, 14, 13, 14, 13, 14, 13, 14, 13, 14, 10, 14, 13, 14, 12, 14, 13, 11, 13, 12, 13, 12, 13, 12, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 14, 12, 14, 15, 13,
  14, 13, 14, 15, 12, 14, 14, 11, 14, 13, 14, 14, 11, 14, 15, 15, 15, 12, 13, 15, 11, 14, 14, 14, 12, 14, 13, 14, 12, 14, 13, 14, 13, 14, 14, 11, 14, 13, 14, 13, 14, 14, 14, 11, 15, 14, 13, 14, 12, 14, 13, 14, 13, 13, 12, 14, 15, 15, 13, 12, 15, 13, 15, 15, 15, 12, 15, 14, 15, 13, 15, 15, 15, 15,
  13, 11, 15, 15, 15, 15, 13, 12, 15, 15, 15, 15, 13, 12, 15, 14, 15, 13, 15, 14, 15, 11, 15, 15, 15, 15, 13, 12, 15, 14, 15, 13, 15, 14, 15, 10, 15, 14, 15, 13, 15, 14, 15, 13, 15, 14, 15, 11, 15, 14, 15, 15, 15, 15, 14, 15, 12, 14, 14, 11, 14, 13, 14, 12, 14, 13, 14, 13, 13, 14, 13, 14, 15, 13,
  15, 14, 15, 12, 15, 13, 14, 15, 14, 15, 13, 11, 15, 14, 15, 15, 15, 15, 12, 14, 15, 14, 13, 15, 14, 15, 12, 14, 13, 14, 12, 15, 15, 13, 15, 14, 12, 14, 15, 13, 15, 14, 15, 12, 15, 15, 15, 15, 13, 12, 15, 15, 15, 15, 13, 13, 15, 11, 15, 14, 15, 15, 15, 15, 12, 15, 14, 11, 15, 15, 15, 15, 13, 12,
  15, 15, 15, 15, 13, 11, 15, 13, 15, 14, 15, 12, 15, 13, 15, 12, 13, 14, 14, 10, 14, 12, 14, 14, 14, 13, 10, 14, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 15, 14, 14, 14, 15, 11, 15, 14, 15, 13, 15, 14, 15, 14, 15, 11, 15, 14, 15, 13, 15, 14, 15, 15, 15, 15, 12, 14, 15, 13, 15, 15,
  15, 12, 13, 15, 15, 15, 15, 12, 13, 15, 15, 15, 15, 15, 13, 15, 15, 12, 15, 15, 13, 12, 15, 15, 15, 15, 13, 12, 15, 15, 15, 15, 13, 11, 15, 15, 15, 15, 14, 15, 12, 14, 15, 11, 15, 14, 15, 13, 15, 14, 15, 15, 14, 15, 11, 13, 14, 15, 15, 12, 13, 15, 13, 15, 11, 15, 13, 15, 14, 15, 12, 15, 14, 15,
  13, 15, 12, 15, 13, 15, 12, 15, 15, 15, 14, 13, 11, 15, 15, 15, 15, 13, 15, 12, 14, 15, 11, 15, 14, 15, 13, 15, 13, 15, 15, 15, 13, 11, 14, 13, 14, 12, 14, 14, 15, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 13, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 10, 14, 14, 14, 14, 12, 11, 14, 13,
  14, 13, 11, 13, 13, 14, 15, 11, 15, 13, 14, 12, 14, 13, 14, 11, 14, 12, 14, 14, 13, 14, 10, 14, 13, 13, 11, 13, 12, 13, 11, 13, 12, 13, 13, 14, 10, 14, 13, 14, 13, 14, 14, 14, 13, 12, 13, 10, 13, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 10, 14, 13, 14, 12, 14, 13, 13, 10,
  13, 13, 13, 13, 10, 13, 13, 11, 14, 14, 14, 14, 12, 11, 14, 13, 14, 12, 14, 11, 14, 12, 13, 12, 13, 10, 13, 12, 13, 11, 13, 12, 13, 11, 13, 12, 13, 11, 13, 12, 14, 13, 10, 14, 13, 12, 14, 14, 11, 15, 14, 14, 12, 15, 14, 14, 11, 14, 13, 14, 13, 14, 15, 15, 11, 14, 15, 15, 13, 14, 15, 15, 15, 14,
  15, 14, 13, 14, 15, 15, 10, 14, 14, 15, 14, 13, 14, 15, 15, 13, 11, 14, 14, 10, 14, 14, 14, 14, 14, 14, 11, 13, 14, 10, 14, 13, 14, 13, 11, 13, 13, 11, 13, 13, 11, 13, 12, 13, 11, 13, 12, 13, 14, 14, 13, 14, 12, 14, 13, 14, 13, 14, 12, 13, 11, 12, 13, 13, 11, 13, 12, 13, 11, 13, 13, 13, 12, 11,
  13, 12, 13, 14, 11, 14, 13, 14, 13, 14, 12, 14, 11, 14, 12, 14, 13, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 15, 13, 14, 14, 14, 14, 11, 14, 14, 13, 14, 10, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 13, 14, 11, 13, 12, 15, 13, 15, 11, 15, 13, 15, 13, 14, 14, 11,
  15, 13, 15, 12, 15, 13, 15, 14, 15, 12, 15, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 11, 14, 15, 15, 14, 13, 12, 15, 13, 14, 11, 15, 14, 14, 13, 14, 14, 14, 15, 11, 15, 13, 14, 12, 15, 10, 10, 11, 10, 11, 11, 10, 11, 10, 11, 11, 10, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 10, 11, 10, 10, 11, 11,
  10, 11, 11, 11, 11, 10, 10, 11, 11, 11, 11, 10, 10, 11, 11, 11, 11, 10, 11, 11, 14, 14, 15, 15, 14, 14, 14, 13, 14, 14, 13, 14, 15, 14, 15, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15,
  15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 14, 13, 13, 14, 12, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 15, 14, 14, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 14, 15,
  14, 15, 11, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 15, 14, 15, 15, 15, 15, 15, 14, 14, 14, 15, 14, 14, 14, 15, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 15, 14, 15, 14, 13, 15, 15, 14, 14, 14, 15, 14, 15, 15, 14, 14, 14, 15, 14, 15, 12, 15, 14, 14, 14, 14, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15,
  15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 15, 15, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14,
  14, 14, 13, 14, 14, 15, 15, 14, 15, 15, 14, 14, 15, 15, 15, 13, 15, 14, 15, 13, 15, 14, 15, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 15, 14, 14, 14, 14, 13, 15, 15, 13, 14,
  14, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 14, 15, 11, 15, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 13, 14, 14, 13, 14, 14, 13, 14, 11, 14, 14, 15, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 15, 15, 13, 15, 14, 14, 14, 13, 14, 15, 15, 15, 15, 14, 14,
  14, 14, 14, 14, 15, 15, 11, 15, 15, 15, 15, 14, 14, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 16, 15, 15, 15, 13, 15, 15, 15, 14,
  15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 14, 14, 15, 14, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 10, 15, 14, 14, 15, 14, 14, 14, 13, 14, 15, 15, 14, 14, 13,
  14, 14, 14, 14, 14, 14, 10, 14, 14, 12, 14, 15, 14, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 10, 14, 15, 14, 14, 16, 14, 15, 16, 13, 15, 16, 12, 16, 16, 16, 16, 15, 15, 15, 15, 15, 15, 15, 15, 16, 15, 15, 16, 16,
  15, 15, 14, 14, 14, 14, 15, 15, 14, 15, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 16, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 12, 14, 14, 14, 14,
  15, 8, 15, 15, 15, 15, 11, 15, 14, 15, 15, 15, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 13, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 13, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 13, 14, 15, 15, 13, 14, 14,
  14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 15, 14, 13, 14, 14, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 15, 14, 14, 15, 14, 15, 15,
  15, 14, 14, 15, 15, 14, 15, 15, 14, 15, 14, 14, 14, 15, 13, 14, 15, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 14, 14, 15, 14, 15, 15, 15, 15, 14,
  15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 14, 14, 14, 15, 15, 14, 15, 14, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 13, 14, 14, 15, 14, 14, 15, 14, 14, 14, 14, 15, 14, 14, 14, 14, 15, 15, 15, 15, 14, 15, 15, 14, 14, 14, 15, 15, 15, 15, 14, 15, 15, 13, 14, 14, 14, 15, 15, 15, 15, 15, 15,
  15, 15, 14, 14, 14, 15, 15, 14, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 14, 14, 15, 13, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 14, 14, 15, 15, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 15, 14, 10, 15, 15, 15, 15, 14, 15, 15, 14,
  15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 13, 14, 14, 14, 14, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15,
  15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 13, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 13, 14, 14, 14, 15, 14, 14, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 14, 14, 15, 14, 15, 15, 14, 14, 14, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 15, 14, 15, 15, 13, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 10, 14, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 14, 15, 14, 14, 14, 14, 14, 12, 15, 15, 15, 15, 15,
  15, 15, 15, 14, 9, 14, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 13, 14, 14, 13, 14, 14, 15, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 15, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 13,
  14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 15, 15, 14, 14, 14, 15, 14, 14, 15, 13, 15, 15, 14, 15, 14, 15, 14, 13, 14, 14, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 15, 15, 15, 15, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14,
  14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 14, 14, 15, 15, 15, 14, 14, 14, 15, 15, 13, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 13, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 12, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 13, 15, 14, 14, 13, 15, 15, 14, 14, 14, 15, 14, 13, 15,
  15, 15, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 11, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 14, 14, 15, 14, 15, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14,
  13, 14, 14, 13, 14, 14, 14, 15, 14, 13, 14, 14, 15, 13, 14, 14, 14, 14, 14, 15, 13, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 14, 14, 15, 13, 15, 15,
  15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 13, 14, 15, 13, 15, 14, 15, 14, 14, 14, 13, 15, 15, 14, 13, 14, 14, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 14, 15, 13, 15, 14, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15,
  15, 14, 15, 14, 15, 14, 15, 14, 15, 13, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 15, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 15,
  14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 11, 14, 15, 14, 14, 15, 14, 14, 14, 14, 14, 14, 15, 15, 13, 13, 15, 14, 14, 13, 14,
  14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 15, 15, 14, 15, 14, 14, 14, 14, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,
  14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 14, 14, 14, 14, 14, 13, 14, 14, 15, 14, 15, 15, 15, 14, 14, 14, 14, 14, 15, 14, 13, 14, 14, 14, 14, 14, 14, 14, 15, 15, 14, 15, 15, 15, 15, 14, 14, 14, 14, 14, 15, 14, 14, 14, 15,
  14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 15, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 15, 15, 15, 15, 14, 14, 14, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15,
  15, 13, 14, 14, 15, 14, 14, 14, 14, 14, 14, 15, 14, 15, 15, 15, 15, 15, 13, 15, 14, 14, 15, 14, 15, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 15, 13, 14, 14, 14, 14, 14, 12, 14, 14, 15, 13, 14, 15, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14,
  13, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 13, 14, 14, 14, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 15, 15, 15, 13,
  14, 14, 14, 15, 14, 14, 14, 15, 15, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 14, 14, 14, 14, 14, 14, 15, 15, 15, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 12, 15, 15,
  15, 15, 14, 10, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 15, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 14,
  15, 15, 14, 14, 14, 14, 13, 14, 15, 15, 14, 14, 14, 15, 14, 15, 15, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 12, 14, 13, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 16, 14, 14, 15, 13, 14, 14, 14, 15, 13, 15, 14, 15, 13, 15, 12, 15, 14,
  14, 14, 15, 13, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 13, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 13, 14, 14, 12, 14, 14, 15, 15, 16, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 11, 14, 14, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 15, 14, 15, 14, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 11, 14, 14, 10, 14, 14, 14, 14, 14, 14, 14, 14,
  15, 13, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 13, 14, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 13, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14,
  13, 14, 14, 15, 15, 14, 15, 14, 15, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 15, 15,
  14, 15, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 15, 15, 15, 14, 15, 15, 13, 14, 13, 14, 13, 14, 14, 14, 14, 15, 15, 14, 15, 15, 12, 14, 14, 14, 13, 14, 15, 15, 15, 14, 13, 14, 14, 15, 14, 14, 15, 14, 15, 14, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 14, 14, 14, 14, 14, 14, 15,
  15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 12, 14, 15, 14, 14, 14, 15, 14, 15, 10, 14, 15, 15, 15, 15, 15, 14, 14, 14, 14, 15, 15, 15, 14, 14, 15, 14, 15, 14, 14, 14, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 15, 12, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14,
  14, 14, 14, 12, 14, 14, 15, 14, 14, 14, 14, 14, 15, 14, 15, 14, 14, 14, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 15, 15, 14, 15, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14,
  14, 14, 14, 14, 15, 15, 15, 14, 14, 15, 14, 14, 10, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 13, 15, 14, 15, 14, 14, 13, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 14,
  15, 14, 14, 14, 13, 14, 14, 14, 15, 14, 14, 13, 14, 14, 14, 15, 15, 15, 14, 15, 16, 15, 14, 15, 14, 14, 14, 14, 14, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 14, 14, 14, 14, 14, 14, 15, 13, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 14, 14, 14, 14, 13, 14, 15, 14, 15, 14, 15, 14, 15, 13,
  15, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 14, 16, 14, 14, 14, 15, 14, 14, 14, 13, 14, 14, 12, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14, 14, 14, 15, 14, 15, 15, 11, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15,
  15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 14, 13, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 15, 13, 14, 15, 14, 14, 15, 15, 14, 12, 14, 14, 14, 14, 14, 14, 14, 12, 14, 15, 14, 14, 14, 15, 14, 15, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14,
  14, 14, 15, 15, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,
  13, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 15, 15, 15, 15, 10, 14, 14, 13, 14, 14, 14, 14, 14, 13, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 15, 14, 14, 15, 15, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 16, 14, 14, 14, 14, 14, 15, 15, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 13, 15, 14, 13, 14, 15, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 15,
  15, 14, 15, 14, 15, 15, 15, 15, 13, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 12, 15, 13, 14, 15, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 13, 14, 15, 15, 13, 15, 15, 15, 13, 14, 14, 14, 14, 14, 14, 14,
  14, 14, 14, 14, 14, 14, 15, 14, 14, 15, 14, 15, 13, 15, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 15, 15, 15, 14, 15, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 12, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 13, 15, 15, 15, 15, 14, 13, 14, 14, 13, 15, 15, 14, 15, 14, 14, 15, 14, 14, 14, 14, 12, 14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 15, 15, 14, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 15, 14, 14, 15,
  14, 15, 12, 15, 13, 15, 14, 15, 14, 15, 13, 14, 15, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 15, 15, 15, 15, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14,
  14, 14, 14, 15, 13, 15, 14, 15, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 15, 15, 15, 14, 15, 14, 15, 12, 14, 14, 14, 15, 14, 15, 14, 15, 14, 14, 14, 14, 14, 14, 15, 14, 14, 15, 15, 14, 14, 14, 14, 14, 14, 15, 15, 14, 15, 14, 15, 14, 14, 13, 14,
  14, 14, 15, 14, 14, 13, 14, 14, 14, 15, 14, 14, 15, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 15, 13, 15, 14, 14, 15, 14, 14, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 13, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15,
  13, 15, 15, 15, 15, 15, 14, 14, 14, 15, 15, 15, 15, 14, 14, 15, 15, 15, 16, 15, 15, 14, 15, 14, 15, 16, 16, 15, 15, 15, 14, 14, 14, 14, 15, 14, 15, 13, 14, 16, 15, 14, 15, 14, 15, 15, 14, 14, 14, 15, 12, 15, 15, 14, 15, 15, 14, 15, 14, 14, 14, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15,
  15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 14, 14, 15, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 14, 14, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15,
  15, 14, 15, 15, 14, 15, 15, 14, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 12, 15, 15, 15, 14, 15, 14, 15, 15, 12, 15, 14, 15, 14, 15, 15, 14, 14, 14, 14, 14, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 14, 14, 15, 15, 14,
  15, 15, 15, 14, 15, 14, 15, 14, 13, 14, 14, 14, 14, 14, 13, 15, 15, 14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 13, 14, 14, 13, 15, 14, 14, 14, 14, 15, 15, 15, 14, 15, 14, 14,
  14, 14, 13, 14, 14, 14, 13, 15, 14, 14, 14, 15, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 15, 15, 14, 14, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,
  14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 15, 14, 15, 14, 14, 15, 15, 13, 14, 15, 14, 15, 15, 15, 14, 15, 14, 13, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14,
  14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 10, 15, 15, 15, 14, 15, 14, 14, 13, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 13, 14, 14, 13, 14, 13, 14, 14, 13, 14, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 15,
  15, 15, 15, 14, 14, 14, 14, 15, 14, 14, 14, 9, 14, 14, 15, 15, 14, 14, 14, 14, 14, 15, 15, 14, 15, 14, 14, 14, 15, 15, 15, 15, 14, 14, 14, 14, 14, 15, 14, 14, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 9, 15, 14,
  14, 14, 11, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 10, 14, 14, 15, 15, 14, 14, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 14, 13, 14, 13, 15, 14, 15, 13, 15, 15, 13, 15, 14, 15, 15, 15, 13, 15,
  14, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 12, 15, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 14, 14, 14,
  14, 14, 14, 12, 14, 11, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 13, 14, 14, 14, 14, 15, 13, 14, 11, 14, 15, 15, 12, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 13, 15, 15, 13, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,
  13, 14, 14, 14, 14, 12, 14, 13, 14, 14, 14, 14, 14, 15, 14, 14, 15, 14, 14, 15, 15, 15, 14, 14, 15, 15, 14, 15, 14, 14, 14, 14, 14, 15, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 15, 14, 14, 14, 13, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 14, 15, 14, 15, 15, 12, 14, 14, 14, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 14, 15, 14, 14, 13, 14, 15, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 14, 15, 15, 15,
  14, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 14, 13, 14, 14, 14, 13, 13, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 15, 13, 14, 15, 13,
  14, 15, 15, 15, 15, 14, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 15, 14, 13, 15, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13,
  14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 15, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14, 14, 15, 13, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 15, 14, 15, 14, 15, 13, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 13, 14, 13, 15, 14, 14, 14, 15, 14, 15, 14, 15, 15, 15, 13, 15, 15,
  14, 15, 15, 14, 15, 13, 14, 14, 15, 11, 15, 14, 14, 15, 14, 14, 14, 14, 13, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 15, 15, 14, 14, 13, 15, 14, 15, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 15, 14, 14, 15, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 14, 12, 14, 14, 15, 14, 14,
  15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 15, 14, 14, 15, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 15, 15, 14, 14, 14, 13, 14, 14, 13,
  14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 13, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 12, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 13,
  14, 13, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 10, 14, 14, 14, 14, 14, 15, 14, 14, 14, 13, 14, 13, 14, 13, 13, 13, 14, 12, 13, 13, 13, 14, 13, 14, 14, 13, 12, 13, 13, 11, 11, 11, 10, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11,
  11, 11, 10, 11, 11, 11, 11, 11, 10, 11, 11, 10, 11, 11, 11, 10, 11, 11, 8, 11, 11, 11, 11, 9, 11, 11, 10, 10, 11, 11, 11, 11, 10, 11, 13, 14, 14, 12, 14, 14, 13, 13, 13, 14, 14, 14, 14, 15, 14, 14, 14, 15, 15, 14, 15, 14, 14, 14, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 14,
  15, 13, 15, 14, 15, 15, 15, 13, 15, 15, 16, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 13, 15, 15, 15, 13, 15, 15, 12, 13, 15, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 13, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 13, 15, 13, 14,
  13, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 15, 14, 10, 15, 14, 14, 14, 14, 14, 14, 15, 14, 15, 13, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 13, 15, 14, 10, 14, 14, 13, 15, 14, 13, 14, 14, 14, 15, 14, 14, 14, 15, 13, 14, 12, 14, 13,
  14, 14, 14, 13, 15, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 15, 14, 14, 15, 13, 14, 14, 14, 14, 14, 14, 15, 13, 14, 13, 14, 13, 15, 13, 15, 14, 15, 13, 14, 13, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 12, 14, 14, 13, 14, 14, 15, 13, 14, 14, 14, 14, 14, 14, 13, 14, 15, 14,
  14, 14, 14, 14, 14, 15, 14, 14, 14, 13, 14, 15, 15, 14, 13, 14, 14, 14, 14, 12, 14, 13, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 13, 14, 13, 14, 15, 13, 15, 14, 15, 13, 15, 15, 15, 12, 14, 15, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 15, 14, 15, 13, 15, 14, 15, 15, 13, 15, 15, 13, 14, 14,
  15, 13, 14, 14, 14, 13, 12, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 13, 14, 14, 15, 14, 14, 13, 14, 13, 13, 15, 15, 14, 12, 15, 15, 14, 11, 14, 14, 14, 13, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 13, 14, 14, 15, 14, 12, 14, 13, 15, 14, 15, 15, 14, 14, 14, 14, 14,
  15, 14, 14, 15, 14, 14, 13, 15, 14, 13, 13, 14, 15, 14, 15, 15, 13, 15, 15, 14, 15, 14, 14, 15, 13, 15, 14, 15, 14, 15, 14, 14, 13, 14, 14, 15, 13, 14, 10, 14, 14, 14, 14, 13, 14, 15, 14, 13, 15, 15, 14, 14, 15, 14, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15,
  15, 15, 15, 14, 13, 14, 14, 10, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15, 14, 15, 13, 15, 14, 15, 15, 13, 15, 15, 15, 15, 13, 15, 14, 14, 13, 14, 14, 14, 14, 12, 14, 14, 14, 12, 14, 14, 14, 10, 14, 14, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  14, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 13, 14, 14, 14, 12, 14, 14, 13, 14, 14, 15, 13, 14, 14, 14, 14, 14, 10, 12, 14, 14, 14, 14, 14, 14, 15, 14, 14, 15, 13, 14, 14, 14, 13, 15, 13, 15, 15, 13, 15, 14, 15, 13, 14, 15, 14, 14, 13, 14, 13,
  15, 14, 15, 14, 14, 14, 14, 13, 14, 13, 14, 13, 15, 14, 13, 15, 14, 15, 13, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 13, 14, 15, 14, 15, 14, 15, 12, 15, 14, 15, 13, 15, 15, 14, 15, 14, 15, 15, 13, 14, 14, 13, 14, 13, 14, 13, 14, 14, 12, 14, 13, 14, 13, 14, 14, 13, 14, 14, 14, 14, 15,
  14, 14, 14, 14, 15, 14, 15, 14, 14, 15, 14, 14, 10, 15, 14, 14, 14, 14, 15, 14, 14, 13, 15, 14, 11, 14, 14, 15, 13, 13, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 15, 15, 14, 15, 15, 15, 15, 13, 14, 13, 14, 12, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 15, 15, 15, 15, 14, 15, 15,
  14, 15, 15, 15, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 13, 14, 13, 14, 14, 13, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 13, 14, 13, 14, 14, 12, 14, 13, 14, 14, 13, 13, 14, 12, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 15, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 12, 14,
  14, 14, 14, 15, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 13, 12, 14, 15, 13, 14, 15, 14, 13, 14, 14, 14, 14, 14, 13, 14, 15, 13, 15, 15, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 12, 14, 13, 14, 14, 14, 14, 14, 14, 14, 12, 13, 14, 15, 14, 15, 13, 14, 14,
  14, 14, 15, 14, 15, 13, 14, 14, 14, 13, 14, 15, 14, 15, 13, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 15, 14, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 13, 11, 14, 14, 15, 14, 14, 15, 14, 11, 13, 14, 13, 14, 13, 14, 12, 14, 13, 14, 13,
  14, 15, 14, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 15, 15, 15, 13, 14, 13, 14, 13, 14, 13, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 13, 14, 14, 13, 15, 14, 14, 13, 14, 13, 14, 14, 15, 15, 14, 13, 14, 14, 15, 14, 14, 13, 14, 13, 14, 13, 14, 15, 14,
  15, 13, 14, 13, 14, 14, 13, 13, 14, 14, 14, 14, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 14, 14, 15, 13, 14, 13, 15, 14, 15, 15, 14, 13, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 14, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 14, 14, 12, 14, 13, 14, 15, 15, 14, 14, 15, 15, 15, 15, 13, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 12, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 13, 12, 15, 14, 15, 13, 14, 14, 14, 13,
  15, 14, 13, 14, 14, 12, 14, 14, 13, 14, 15, 15, 15, 12, 15, 15, 15, 14, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 13, 15, 12, 14, 14, 14, 14, 12, 15, 15, 14, 15, 14, 15, 15, 13, 14, 15, 15, 15, 15, 15, 14, 14, 15, 14, 14, 14, 14, 13, 13, 14, 13, 14,
  14, 14, 13, 14, 13, 14, 14, 13, 15, 15, 13, 14, 14, 13, 14, 13, 15, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 13, 13, 13, 13, 14, 13, 13, 13, 14, 14, 13, 13, 14, 13, 15, 14, 15, 13, 14, 14,
  13, 14, 14, 14, 13, 14, 14, 14, 12, 14, 13, 14, 13, 14, 13, 14, 14, 12, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 15, 14, 13, 14, 13, 14, 13, 14, 14, 13, 14, 13, 13, 15, 13, 14, 13, 14, 14, 10, 14, 14, 15, 15, 13, 15, 13, 13, 15, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14,
  15, 13, 14, 14, 14, 13, 14, 14, 13, 14, 15, 14, 13, 14, 13, 14, 14, 14, 14, 15, 13, 14, 12, 14, 13, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 12, 14, 15, 12, 14, 14, 14, 13, 14, 14, 13, 15, 15, 14, 15, 14, 15, 15, 14, 15, 13, 14, 14, 14, 14, 13, 12, 15, 14, 15, 14, 13, 14, 14, 13, 14, 14, 14, 14,
  14, 13, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 15, 12, 15, 13, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 15, 15, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 13, 13, 14, 12, 14, 14, 14, 15, 14, 13, 14, 13, 15, 14, 15, 14, 15, 14, 14, 14, 14, 13, 14, 14, 13, 14, 13, 14, 13, 14,
  14, 13, 14, 13, 14, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 10, 14, 14, 12, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 13, 14, 13, 14, 14, 13, 14, 13, 14, 12, 14, 13, 14, 14, 13, 14, 13, 14, 14, 13, 13, 14, 14, 12, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 13, 14, 13,
  14, 14, 13, 14, 12, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 15, 15, 14, 13, 14, 13, 14, 15, 14, 15, 14, 15, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 15, 13, 13, 15, 14, 14, 15, 13, 14, 13, 14, 14, 13, 14, 14, 13, 14, 12, 14, 13, 14, 12, 14, 12, 14, 13, 14, 13, 14, 12,
  14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 15, 15, 14, 15, 14, 14, 14, 14, 14, 13, 14, 14, 14, 15, 13, 15, 15, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 13, 15, 15, 15, 14, 15, 14, 14, 13, 14, 14, 14, 14, 14,
  13, 14, 13, 14, 13, 15, 15, 15, 14, 14, 15, 15, 14, 14, 14, 14, 14, 13, 15, 14, 14, 14, 12, 14, 13, 14, 12, 14, 13, 14, 14, 12, 14, 13, 14, 14, 12, 15, 15, 16, 14, 15, 15, 15, 13, 15, 15, 14, 13, 14, 15, 15, 14, 9, 13, 15, 15, 15, 14, 14, 14, 15, 14, 16, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15,
  14, 13, 15, 15, 14, 14, 14, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 16, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 9, 15, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14,
  14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 13, 14, 13, 15, 13, 14, 13, 14, 11, 14, 13, 14, 14, 14, 13, 15, 14, 15, 15, 13, 15, 13, 14, 14, 14, 15, 13, 14, 13, 14, 14, 13, 14, 14, 13, 14, 13, 15, 15, 13, 15, 14, 13,
  14, 14, 15, 13, 14, 13, 14, 13, 14, 13, 14, 14, 13, 14, 14, 13, 15, 13, 14, 14, 14, 14, 14, 12, 15, 13, 14, 14, 12, 13, 14, 13, 14, 14, 14, 14, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 13, 15, 14, 13, 14, 14, 13, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 15, 15, 15,
  13, 15, 15, 15, 14, 14, 14, 13, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 13, 15, 14, 15, 13, 14, 13, 15, 14, 15, 14, 14, 15, 15, 12, 15, 14, 15, 14, 13, 14, 13, 14, 13, 14, 14, 13, 14, 14, 14, 15, 15, 14, 14, 12, 14, 14, 14, 14, 13, 14, 14, 13, 15, 13, 14, 13,
  15, 14, 15, 13, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 15, 13, 15, 15, 13, 14, 12, 14, 13, 15, 15, 15, 15, 13, 15, 14, 15, 14, 13, 14, 13, 14, 14, 13, 15, 14, 14, 14, 14, 13, 13, 14, 14, 13, 14, 13, 13, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 15, 15, 14, 13, 14, 13, 14, 15, 13, 14, 14, 13, 14,
  13, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 13, 15, 14, 15, 15, 14, 14, 13, 13, 15, 14, 14, 13, 13, 14, 14, 13, 14, 12, 14, 14, 13, 12, 14, 14, 14, 15, 14, 14, 8, 14, 14, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 15, 14, 15, 15, 14, 12, 14, 14, 14, 13, 14, 15, 13, 14, 13, 15, 13,
  14, 14, 15, 15, 14, 13, 14, 14, 15, 14, 15, 15, 15, 13, 14, 10, 14, 13, 14, 14, 14, 13, 13, 14, 15, 15, 14, 14, 15, 15, 14, 15, 13, 14, 13, 14, 13, 14, 15, 15, 15, 13, 15, 14, 15, 14, 14, 13, 10, 15, 15, 15, 15, 15, 13, 14, 15, 15, 15, 15, 15, 13, 15, 13, 15, 14, 9, 15, 13, 15, 15, 13, 15, 15, 12,
  15, 14, 15, 15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 14, 14, 13, 14, 13, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 14, 15, 13, 15, 15, 12, 15, 14, 13, 14, 14, 14, 12, 14, 15, 13, 14, 13, 15, 15, 14, 13, 14, 14, 15, 14, 15, 13, 15, 13, 15, 13, 14, 13,
  14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 13, 14, 14, 15, 15, 13, 14, 14, 13, 15, 13, 15, 14, 13, 15, 14, 15, 14, 15, 11, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 13, 15, 13, 14, 13, 14, 12, 14, 15, 15, 14, 15, 15, 13, 14, 14, 14, 13, 14, 14, 14, 14, 15, 15, 15,
  15, 15, 14, 15, 14, 9, 15, 15, 14, 13, 15, 15, 14, 14, 14, 14, 13, 14, 13, 13, 15, 14, 13, 15, 13, 14, 15, 14, 14, 14, 15, 15, 13, 14, 14, 15, 14, 14, 15, 14, 15, 15, 14, 15, 13, 14, 13, 14, 14, 14, 14, 14, 15, 15, 13, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 13, 15, 15, 15, 14,
  15, 13, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 14, 15, 15, 13, 15, 14, 15, 13, 14, 14, 13, 13, 14, 14, 13, 14, 14, 13, 15, 14, 13, 15, 14, 15, 13, 14, 13, 13, 14, 13, 14, 13, 14, 14, 13, 14, 14, 14, 14, 13, 14, 13, 13, 13, 14, 14, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14,
  15, 15, 10, 14, 11, 14, 14, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 13, 15, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 13, 14, 15, 13, 14, 14, 14, 13, 14, 13, 15, 13, 15, 13, 15, 13, 15, 13, 15, 13, 14, 14, 14, 13, 14, 14, 14, 13, 14, 15, 14, 14,
  15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 14, 13, 15, 13, 14, 13, 14, 13, 15, 14, 14, 12, 14, 14, 14, 12, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 13, 14, 13, 14, 12, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 12, 14, 13, 15, 13, 14, 14, 14, 15, 13,
  13, 14, 13, 14, 14, 13, 14, 12, 14, 13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 13, 14, 13, 15, 14, 12, 15, 14, 14, 13, 14, 11, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 15, 13, 14, 15, 14, 13, 14, 13, 14, 13, 15, 15, 13, 14, 14, 14, 13, 14, 15, 13, 14, 13, 15, 15, 13, 14, 13, 15, 14, 15, 15, 15, 15,
  15, 15, 15, 13, 14, 12, 14, 13, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 13, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 15, 13, 14, 13, 14, 15, 13, 15, 13, 14, 13, 14, 13, 14, 14, 14, 14, 13, 14, 14, 13,
  14, 14, 13, 13, 14, 14, 13, 14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 13, 15, 14, 13, 14, 14, 13, 15, 13, 14, 15, 14, 13, 14, 13, 14, 14, 14, 14, 14, 13, 14, 12, 13,
  14, 13, 14, 13, 14, 14, 14, 15, 14, 14, 15, 14, 14, 13, 14, 15, 14, 13, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 15, 15, 15, 16, 14, 15, 13, 12, 13, 14, 14, 14, 14, 13, 14, 14, 14, 15, 15, 15, 14, 15, 15, 13, 15, 15, 14, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 14, 13, 14, 14, 15, 14, 14, 14, 15,
  13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 13, 14, 13, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 15, 13, 14, 14, 15, 13, 14, 14, 13, 14, 14,
  13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 15, 13, 14, 13, 14, 14, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 12, 14, 14, 14, 15, 13, 15, 14, 15, 14, 13, 14, 14, 12, 14, 13, 14, 13, 15, 14, 15, 15, 15, 15, 13, 15, 15, 13, 14, 13, 14, 14, 13, 14, 14, 12, 14, 13, 14,
  13, 15, 13, 15, 15, 13, 14, 14, 14, 13, 13, 14, 14, 15, 15, 14, 13, 15, 14, 15, 13, 14, 14, 14, 14, 13, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 12, 14, 14, 11, 14, 13, 14,
  14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 15, 14, 15, 14, 15, 15, 15, 15, 13, 15, 12, 15, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 13, 13, 14, 13, 14, 14, 14, 14, 15, 14, 14, 15, 13, 14, 13, 14, 12, 14, 14, 13, 14, 13, 13, 14, 14, 13, 14, 14, 13, 14, 12, 14, 14, 14, 14, 14, 14, 13,
  14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 15, 13, 14, 14, 14, 13, 14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 13, 14, 12, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 13, 14, 13, 14, 14, 15, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 13, 15, 14, 13, 14,
  13, 14, 13, 14, 13, 15, 13, 15, 13, 14, 13, 14, 13, 13, 14, 14, 14, 13, 14, 15, 14, 15, 14, 15, 14, 15, 15, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 15, 13, 14, 14, 13, 14, 13, 14, 13, 12, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 14, 13, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 13, 14, 13, 13,
  13, 13, 13, 13, 14, 14, 14, 13, 14, 13, 14, 13, 15, 15, 14, 14, 14, 13, 13, 13, 14, 13, 14, 13, 14, 14, 12, 14, 14, 14, 13, 15, 14, 14, 13, 14, 14, 14, 14, 13, 15, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 12, 14, 14, 13, 14, 15, 14, 14, 14, 13, 14, 13, 14, 13, 13, 14, 14, 14, 13, 14, 13, 14, 14,
  13, 14, 14, 14, 14, 14, 13, 14, 14, 13, 15, 14, 15, 13, 15, 14, 14, 15, 13, 14, 14, 12, 15, 13, 15, 15, 15, 13, 15, 14, 15, 14, 15, 13, 15, 12, 14, 13, 14, 14, 15, 14, 15, 14, 15, 13, 15, 15, 13, 15, 15, 15, 15, 15, 14, 14, 13, 14, 15, 14, 14, 14, 15, 14, 15, 14, 14, 14, 13, 15, 15, 14, 14, 15,
  15, 15, 15, 13, 14, 14, 14, 10, 14, 13, 13, 15, 14, 14, 15, 14, 13, 14, 13, 14, 13, 14, 13, 14, 15, 14, 14, 14, 14, 13, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 15, 15, 15, 13, 14, 15, 14, 14, 14, 13, 14, 14, 15, 13, 14, 13, 14, 14, 14, 14, 14, 13, 14, 13, 15, 14, 13,
  14, 15, 14, 13, 15, 13, 15, 13, 14, 13, 14, 14, 13, 14, 13, 15, 14, 13, 15, 14, 15, 15, 15, 14, 14, 13, 15, 13, 15, 14, 13, 14, 13, 14, 14, 12, 14, 14, 13, 14, 13, 14, 12, 14, 13, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15,
  15, 13, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 14, 15, 13, 15, 15, 15, 15, 13, 14, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 13, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 13, 15, 14, 15, 13, 14, 14, 13, 14, 14, 14, 12, 15, 15, 13, 15,
  14, 15, 15, 15, 13, 15, 14, 15, 13, 14, 14, 14, 14, 14, 12, 14, 13, 14, 14, 13, 14, 14, 12, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 15, 14, 14, 14, 15, 15, 15, 14, 15, 15, 15, 14, 14, 13, 14, 13, 14, 12, 15, 14, 14, 13, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14,
  14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 14, 13, 15, 15, 15, 14, 15, 15, 13, 14, 12, 14, 13, 14, 13, 14, 14, 13, 14, 14, 15, 12, 15, 14, 15, 15, 15, 13, 14, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 13, 15, 15, 12, 14, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 14,
  15, 15, 14, 15, 12, 13, 15, 15, 13, 15, 14, 15, 14, 15, 13, 14, 15, 15, 13, 14, 13, 14, 15, 15, 15, 14, 15, 14, 15, 14, 14, 13, 15, 13, 15, 14, 13, 14, 13, 14, 13, 14, 14, 14, 10, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 15, 15, 13, 15, 15, 14, 15, 14, 14, 14, 11, 14, 13, 14, 14, 14, 13, 14, 12,
  14, 13, 14, 13, 14, 12, 14, 14, 13, 14, 13, 14, 12, 14, 13, 14, 12, 14, 14, 13, 14, 13, 14, 14, 14, 15, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 15, 14, 13, 14, 13, 14, 13, 13, 13, 14, 13, 13, 15, 15, 13, 14, 15, 13, 14, 15, 13, 15, 15, 13, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 13,
  14, 14, 13, 14, 12, 14, 13, 14, 14, 14, 13, 14, 14, 15, 13, 14, 15, 13, 14, 13, 14, 14, 12, 14, 15, 14, 15, 12, 14, 14, 14, 13, 14, 12, 14, 14, 13, 14, 12, 14, 14, 13, 14, 13, 15, 14, 14, 14, 14, 12, 14, 13, 14, 13, 12, 13, 14, 14, 14, 12, 14, 14, 15, 11, 14, 14, 14, 15, 13, 14, 14, 14, 13, 14,
  14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 15, 14, 15, 14, 14, 15, 14, 14, 13, 14, 14, 15, 14, 14, 14, 14, 13, 14, 13, 14, 13, 14, 14, 13, 14, 14, 14, 13, 14, 12, 14, 13, 13, 14, 14, 14, 14, 14, 13, 13, 12, 14, 15, 14, 14, 14,
  14, 13, 14, 12, 14, 14, 14, 13, 14, 14, 14, 13, 15, 14, 12, 14, 13, 15, 13, 14, 14, 15, 13, 15, 14, 15, 14, 15, 13, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 13, 14, 14, 15, 14, 13, 14, 15, 12, 15, 14, 14, 13, 14, 15, 14, 15, 15, 13, 14, 13, 15,
  14, 13, 15, 10, 11, 14, 14, 15, 13, 14, 14, 14, 14, 14, 15, 14, 15, 15, 15, 15, 12, 14, 14, 14, 14, 13, 15, 13, 14, 13, 14, 13, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 11, 14, 14, 12, 14, 13, 14, 14, 13, 14, 13, 13, 14, 13, 14, 14, 14, 15, 14, 13, 14, 14, 14, 13, 14, 13, 14, 13, 15, 14, 13, 14,
  13, 14, 15, 13, 14, 13, 15, 14, 13, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 12, 14, 13, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 11, 14, 13, 14, 14, 14, 14, 13, 13, 14, 14, 13, 14, 12, 14, 14, 14, 13, 14, 14, 14, 12, 13, 13, 14,
  13, 14, 14, 13, 14, 14, 12, 13, 14, 14, 14, 14, 13, 14, 14, 13, 13, 13, 12, 13, 14, 12, 14, 14, 12, 13, 14, 13, 13, 10, 13, 13, 13, 13, 13, 13, 13, 12, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 13, 13, 13, 13, 12, 12, 14, 14, 13, 14, 13, 12, 13, 13, 13, 12, 13, 13, 13,
  12, 13, 12, 13, 11, 13, 13, 11, 11, 11, 11, 9, 11, 11, 11, 11, 10, 10, 11, 9, 11, 11, 11, 10, 11, 11, 11, 11, 12, 11, 14, 10, 11, 8, 11, 11, 9, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 10, 10, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 13, 14, 15, 14,
  15, 14, 14, 13, 14, 14, 14, 13, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 15, 15, 15, 13, 14, 15, 13, 15, 13, 15, 15, 15, 15, 14, 15, 15, 14, 12, 15, 13, 14, 14, 13, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15,
  15, 14, 13, 14, 15, 14, 14, 14, 15, 14, 15, 12, 15, 13, 14, 14, 14, 13, 14, 15, 14, 14, 14, 12, 14, 14, 13, 13, 15, 15, 15, 14, 15, 14, 14, 13, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 15, 14, 15, 14, 15, 14, 13, 14, 14, 15, 14, 14, 15, 15, 13, 14, 14, 15, 15, 15, 13, 14, 14, 13, 14, 15, 15, 13,
  15, 13, 15, 15, 15, 15, 14, 15, 13, 15, 13, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 14, 13, 14, 14, 14, 12, 14, 14, 13, 14, 14, 14, 14, 12, 14, 14, 14, 14, 15, 14, 14, 15, 15, 14, 14, 14, 14, 14, 12, 15, 15, 14, 14, 15, 15, 15, 14, 14, 14, 14, 15, 15, 15, 14, 15, 15, 14, 15, 14,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 15, 15, 15, 15, 13, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 13, 14, 13, 14, 11, 13, 14, 14, 15, 14, 14, 14, 14, 12, 15, 15, 13, 14,
  14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 13, 15, 15, 15, 13, 15, 16, 15, 14, 14, 14, 14, 14, 15, 14, 13, 15, 15, 14, 13, 14, 15, 14, 14, 15, 14, 15,
  15, 13, 14, 14, 15, 12, 14, 14, 14, 14, 13, 14, 14, 14, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 13, 14, 14, 14, 14, 13, 14, 9, 14, 14, 14, 14, 14, 13, 13, 14, 13, 15, 15, 13, 15, 15, 13, 15, 15, 15, 13, 15, 15, 14, 14, 14, 14, 14, 13, 15, 15, 13, 15, 13, 15, 15, 15, 15, 13, 15, 15,
  15, 15, 13, 15, 15, 15, 13, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 11, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14, 13, 14, 14, 15, 15, 15, 14, 14,
  14, 13, 15, 14, 13, 13, 15, 15, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 13, 15, 14, 15, 14, 14, 13, 14, 14, 14, 15, 13, 14, 14, 14, 14, 14, 12, 14, 14, 15, 14, 14, 13, 13, 14, 15, 14, 13, 13, 14, 14, 14, 15, 14, 14, 14, 14, 15, 14, 15, 13, 14, 14, 15, 13, 13, 14, 13, 13, 14, 13, 14, 15,
  15, 14, 14, 15, 14, 15, 13, 15, 14, 13, 14, 12, 14, 14, 14, 15, 15, 15, 14, 12, 14, 14, 14, 14, 14, 13, 14, 14, 15, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 15, 14, 14, 14, 12, 14, 14, 13, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 12, 14, 13, 14, 15, 15, 15, 15, 15, 13, 14, 14, 15, 15, 14, 14,
  14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 13, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 9, 15, 14, 13, 14, 14, 14, 14, 15, 15, 13, 15, 15, 15, 14, 14, 13, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 12, 15, 14, 15, 14, 14, 12, 14, 15, 13, 15, 15, 15, 15, 15,
  14, 10, 14, 10, 14, 14, 14, 14, 14, 14, 14, 12, 14, 15, 15, 14, 12, 14, 14, 13, 14, 14, 12, 14, 12, 15, 14, 15, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 15, 13, 15, 14, 14, 14, 15, 12, 14, 14, 12, 14, 14, 13, 15, 14, 15, 14, 15, 15, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 13, 14,
  12, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 14, 15, 13, 15, 14, 14, 14, 14, 14, 14, 15, 14, 13, 14, 12, 14, 14, 12, 14, 14, 12, 14, 13, 15, 15, 14, 15, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14, 14, 14, 12, 14, 15, 13, 14, 15, 15, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 12,
  14, 14, 14, 12, 14, 12, 14, 14, 12, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 13, 15, 13, 15, 13, 14, 13, 14, 13, 15, 13, 15, 15, 14, 13, 15, 15, 15, 13, 15, 15, 15, 13, 14, 13, 15, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 14,
  14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 12, 14, 14, 14, 14, 15, 14, 15, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 12, 14, 14, 14, 14, 15, 15, 14, 15, 14, 14, 15, 14, 14, 14, 14, 14, 14, 12, 14, 14,
  14, 13, 14, 14, 12, 14, 14, 14, 13, 15, 14, 15, 14, 12, 15, 14, 12, 14, 14, 14, 15, 15, 15, 14, 8, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 12, 14, 14, 15, 14, 14, 15, 15, 15, 15, 14, 15, 14, 14, 14, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 12, 14,
  14, 14, 14, 14, 12, 14, 14, 14, 12, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 12, 14, 15, 13, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 13, 15, 14, 14, 12, 14, 12, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 15, 14, 15, 15, 15, 14, 14, 14,
  14, 14, 14, 14, 14, 15, 15, 14, 15, 15, 14, 12, 14, 14, 14, 14, 15, 14, 14, 12, 14, 14, 14, 12, 13, 15, 13, 15, 15, 14, 14, 14, 14, 12, 14, 14, 14, 12, 14, 14, 14, 12, 14, 13, 14, 15, 14, 13, 14, 12, 13, 15, 12, 14, 12, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 15, 14, 15, 14, 14, 14, 12,
  15, 14, 14, 14, 14, 12, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 12, 14, 14, 12, 14, 13, 12, 14, 13, 14, 15, 15, 13, 14, 15, 14, 14, 15, 15, 15, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 12, 15, 14, 15, 15, 15, 15,
  15, 15, 12, 15, 14, 15, 14, 15, 12, 15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 12, 13, 14, 14, 15, 14, 15, 8, 14, 14, 13, 14, 14, 14, 14, 14, 12, 13, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 15, 14, 15, 15, 13, 15, 14,
  15, 15, 14, 15, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 12, 14, 14, 12, 14, 14, 14, 13, 14, 13, 14, 12, 14, 13, 13, 14, 14, 14, 13, 14, 15, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 15, 12, 14, 15, 14, 14, 14, 12, 15, 14, 14, 14, 14, 15, 14, 14, 14, 15,
  15, 15, 15, 15, 15, 14, 15, 15, 12, 14, 15, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 12, 14, 14, 15, 15, 12, 14, 15, 14, 14, 14, 14, 15, 15, 14, 15, 13, 15, 15, 14, 14, 14, 12, 14, 15, 15, 15, 12, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 11,
  14, 14, 14, 12, 14, 14, 15, 14, 15, 15, 13, 14, 15, 13, 14, 15, 14, 15, 14, 14, 12, 14, 11, 14, 14, 14, 12, 15, 15, 15, 14, 15, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 12, 15, 14, 15, 15, 14, 15, 12, 14, 14, 14, 12, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14,
  15, 14, 15, 14, 14, 12, 14, 14, 14, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 14, 14, 12, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 12, 14, 13, 14, 14, 12, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 12, 14, 13, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14,
  14, 13, 13, 14, 14, 12, 15, 14, 15, 15, 13, 15, 15, 15, 14, 14, 14, 14, 14, 13, 14, 14, 15, 14, 14, 14, 14, 14, 14, 12, 15, 15, 14, 15, 12, 14, 14, 12, 15, 14, 13, 15, 14, 15, 15, 14, 15, 14, 14, 12, 14, 14, 14, 12, 15, 15, 15, 15, 14, 15, 12, 14, 14, 14, 12, 14, 14, 14, 12, 14, 13, 14, 14, 12,
  14, 15, 14, 13, 15, 15, 13, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 15, 14, 13, 14, 14, 14, 15, 14, 15, 14, 15, 13, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 13, 15, 15, 15,
  14, 15, 12, 14, 13, 15, 15, 15, 15, 15, 15, 14, 14, 13, 14, 13, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 15, 14, 14, 14, 15, 14, 14, 14, 14, 14, 15, 14, 15, 14, 15, 15, 15, 15, 14, 14, 14, 15, 14, 14, 14, 14, 14, 15, 14, 13, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 13, 14, 14, 12, 14, 14, 14, 12,
  14, 14, 12, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 14, 14, 15, 14, 14, 14, 14, 14, 14, 13, 12, 14, 14, 14, 15, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 12, 14, 14, 12, 14, 14, 14, 14, 14, 14, 15,
  15, 15, 15, 15, 12, 14, 14, 10, 14, 14, 14, 14, 15, 12, 14, 14, 14, 14, 12, 14, 13, 14, 14, 15, 12, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 15, 15, 9, 14, 14, 14, 14, 14, 13, 14, 12, 11, 14, 14, 15, 15, 12, 14, 12, 14, 15, 15, 15, 14, 15, 15, 14, 15, 13, 14, 14, 14, 12, 14, 14, 13, 14, 14,
  15, 15, 15, 15, 12, 14, 15, 15, 15, 15, 14, 15, 13, 14, 13, 14, 14, 12, 15, 14, 12, 14, 14, 14, 12, 14, 14, 14, 12, 12, 14, 14, 14, 12, 14, 14, 14, 15, 15, 15, 15, 14, 14, 15, 13, 15, 15, 13, 14, 14, 15, 15, 13, 14, 14, 13, 15, 14, 14, 14, 14, 15, 15, 15, 15, 16, 14, 15, 14, 14, 14, 14, 14, 14,
  14, 14, 14, 15, 14, 14, 12, 14, 14, 13, 14, 12, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 12, 14, 14, 14, 14, 14, 12, 14, 14, 14, 13, 13, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 15, 14, 15, 14, 15, 14, 15, 14, 14, 15,
  13, 14, 14, 14, 14, 10, 15, 12, 15, 14, 14, 14, 14, 14, 14, 13, 15, 14, 14, 14, 14, 14, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 13, 15, 14, 15, 13, 15, 15, 15, 15, 14, 14, 14, 14, 15, 15, 15, 15, 14, 15, 14, 14, 15, 14, 15, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14,
  15, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 15, 15, 15, 14, 14, 14, 14, 14, 13, 14, 14, 14, 15, 14, 14, 14, 14, 12, 14, 14, 12, 14, 14, 12, 14, 14, 13, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 14, 13, 14, 14, 12, 13, 15, 14, 15, 13, 14, 14, 14, 15, 14, 15,
  14, 14, 14, 14, 14, 14, 14, 14, 13, 15, 15, 11, 14, 14, 14, 15, 12, 13, 14, 15, 12, 15, 14, 13, 14, 14, 15, 15, 12, 14, 13, 15, 15, 13, 15, 15, 13, 14, 13, 15, 15, 13, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 13, 15, 14, 15, 12, 15, 15, 15, 14, 13, 14, 13, 14, 14, 14,
  14, 14, 14, 15, 13, 15, 14, 14, 15, 14, 13, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 15, 12, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 12, 13, 14, 14, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 10, 14, 14, 14, 14, 14,
  12, 14, 14, 13, 14, 14, 9, 14, 13, 14, 13, 14, 14, 14, 14, 15, 13, 15, 15, 12, 14, 14, 14, 12, 14, 14, 15, 14, 15, 14, 14, 14, 14, 13, 14, 14, 14, 11, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 11, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 15, 12, 13, 14, 12, 15, 14, 14, 15, 14, 12,
  14, 14, 14, 15, 15, 14, 15, 14, 14, 14, 13, 14, 14, 12, 13, 14, 15, 13, 15, 13, 14, 14, 15, 14, 15, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 13, 14, 13, 14, 14, 12, 13, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 12, 14, 14,
  14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 15, 15, 14, 14, 13, 14, 12, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 12, 14, 14, 14, 14, 12, 13, 14, 14, 14, 14, 14, 14, 14, 15, 15, 13, 14, 12, 14, 14, 14, 12, 15, 12, 14, 13, 14, 14, 14, 11, 14, 14, 14, 14,
  12, 14, 14, 14, 14, 14, 14, 13, 14, 15, 15, 14, 14, 15, 15, 15, 12, 15, 15, 15, 13, 14, 14, 14, 14, 14, 14, 12, 14, 14, 12, 14, 14, 12, 14, 15, 15, 14, 13, 15, 12, 14, 14, 12, 14, 14, 14, 14, 12, 14, 15, 14, 15, 14, 15, 14, 11, 14, 14, 14, 12, 14, 13, 14, 14, 12, 14, 13, 14, 14, 13, 13, 14, 13,
  14, 14, 14, 15, 14, 14, 14, 14, 15, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 14, 14, 14, 15, 15, 13, 15, 14, 14, 12, 14, 14, 14, 12, 14, 14, 14, 14, 15, 14, 15, 12, 15, 15, 14, 13, 14, 15, 14, 15, 14, 15, 15, 15,
  14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 12, 14, 13, 14, 14, 15, 15, 15, 14, 15, 15, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 12, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 14, 15, 13, 14, 14, 9, 14, 14, 14, 14,
  14, 15, 14, 15, 15, 15, 15, 14, 14, 13, 15, 14, 14, 14, 14, 12, 14, 15, 15, 13, 14, 14, 13, 14, 14, 14, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 14, 13, 15, 13, 14, 13, 15, 14, 15, 11, 14, 14, 13, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 15, 14, 14, 14, 15, 15, 14, 15,
  13, 14, 15, 14, 15, 12, 14, 14, 14, 15, 14, 14, 14, 13, 15, 10, 14, 15, 13, 14, 15, 12, 15, 15, 15, 13, 15, 15, 12, 15, 14, 14, 14, 14, 12, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 11, 14, 14, 13, 14, 14, 15, 14, 15, 14, 13, 15, 14, 15, 14, 13, 14, 13, 15, 14, 14, 15, 13, 15, 14, 15, 15, 15, 15,
  15, 13, 15, 14, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 14, 13, 14, 14, 14, 14, 12, 14, 14, 14, 15, 14, 15, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 12, 14, 15, 14, 13, 15, 14, 15, 14, 14, 14, 15, 15, 12, 15, 14, 15, 15, 12, 15, 15, 14, 15, 14, 14, 14, 14, 15, 14, 14, 14, 14,
  14, 15, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 12, 14, 15, 14, 13, 14, 15, 14, 14, 15, 13, 14, 15, 12, 14, 14, 14, 13, 14, 15, 15, 15, 15, 14, 14, 14, 13, 14, 14, 12, 14, 14, 12, 14, 13, 13, 14, 9, 14, 14, 15, 15, 15, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,
  13, 14, 12, 13, 12, 14, 13, 14, 14, 13, 14, 15, 14, 14, 15, 14, 13, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 14, 15, 15, 12, 15, 13, 15, 14, 12, 14, 11, 14, 14, 14, 14, 13, 12, 14, 13, 14, 14, 14, 12, 14, 14, 14, 12, 14, 14, 13, 14, 13, 14, 12, 14, 14, 13, 14, 12, 13, 15, 14, 13, 14, 15, 15, 15,
  14, 15, 14, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 13, 14, 13, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14, 13, 14, 15, 10, 15, 14, 14, 14, 13, 14, 13, 13, 14, 13, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 12, 15, 14, 14, 15,
  12, 15, 14, 15, 13, 14, 14, 13, 14, 15, 14, 15, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 15, 15, 14, 13, 15, 14, 13, 14, 14, 15, 14, 14, 15, 15, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 12, 13, 15, 15, 15, 15,
  14, 15, 14, 14, 14, 15, 14, 14, 12, 14, 13, 13, 14, 14, 14, 15, 15, 12, 15, 14, 14, 12, 15, 14, 13, 14, 14, 12, 14, 12, 14, 14, 14, 15, 14, 14, 12, 14, 14, 14, 12, 14, 13, 14, 12, 14, 14, 12, 14, 14, 12, 14, 14, 14, 14, 11, 13, 14, 14, 12, 14, 14, 13, 14, 14, 14, 14, 12, 14, 14, 14, 11, 14, 14,
  14, 14, 14, 12, 14, 14, 13, 14, 13, 13, 15, 12, 14, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 14, 14, 14, 10, 14, 14, 14, 12, 14, 14, 15, 14, 15, 14, 14, 12, 14, 14, 15, 14, 13, 15, 13, 15, 14, 15, 15, 13, 15, 15, 14, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 12, 14, 14, 14, 13,
  14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 15, 14, 14, 13, 14, 14, 12, 14, 14, 11, 14, 14, 13, 14, 12, 14, 14, 11, 14, 14, 13, 13, 12, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 9, 14, 12, 14, 14, 14, 14, 14, 12, 14, 13, 13, 14, 14, 14, 11, 14, 13, 14, 13, 14, 13,
  14, 14, 13, 13, 14, 14, 11, 14, 14, 13, 14, 13, 14, 12, 14, 14, 10, 14, 13, 14, 12, 14, 13, 14, 14, 13, 13, 13, 13, 13, 13, 12, 12, 14, 13, 13, 13, 14, 13, 13, 11, 13, 13, 13, 13, 13, 13, 13, 13, 12, 13, 13, 9, 11, 11, 11, 10, 11, 11, 11, 11, 10, 11, 11, 10, 11, 11, 11, 11, 11, 15, 11, 11, 11, 10,
  11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 10, 11, 10, 10, 11, 9, 11, 11, 11, 10, 10, 11, 11, 10, 11, 10, 11, 10, 11, 11, 10, 11, 11, 11, 11, 11, 10, 11, 11, 11, 10, 10, 11, 15, 14, 15, 15, 14, 14, 15, 15, 14, 14, 13, 13, 8, 14, 14, 15, 14, 15, 15, 14, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15,
  14, 15, 15, 14, 13, 15, 15, 14, 15, 15, 15, 14, 14, 14, 13, 14, 13, 14, 15, 15, 13, 15, 15, 15, 15, 14, 15, 13, 15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 14, 13, 14, 14, 15, 14, 15, 15, 13, 12, 12, 14, 14, 14, 14, 12, 14, 13, 14, 13, 13, 14, 12, 15, 13, 13, 13, 15, 14, 15, 15, 15, 14, 14,
  14, 14, 14, 12, 15, 14, 12, 14, 14, 14, 14, 13, 14, 14, 11, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 12, 14, 14, 14, 12, 14, 12, 14, 15, 15, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14,
  13, 14, 14, 13, 14, 14, 13, 15, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 15, 14, 14, 13, 15, 15, 15, 15, 15, 14, 15, 14, 14, 14, 15, 13, 14, 15, 12, 14, 13, 14, 12, 14, 13, 14, 12, 15, 13, 15, 12, 14, 14, 15, 13, 14, 14, 12,
  14, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 13, 15, 15, 15, 15, 15, 12, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 12, 15, 14, 14, 14, 15, 15, 15, 15, 15, 16, 14, 15, 15, 15, 15, 14, 12, 14, 15, 15, 14, 14, 14, 13, 14, 12, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 15, 12, 15, 15, 15, 14,
  15, 15, 15, 14, 13, 14, 14, 15, 14, 15, 12, 15, 14, 14, 13, 14, 13, 15, 14, 13, 14, 13, 14, 15, 12, 13, 14, 13, 14, 14, 14, 15, 13, 15, 13, 15, 15, 14, 15, 15, 14, 15, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 12, 14, 13, 14, 14, 14, 14, 14,
  13, 15, 14, 14, 15, 14, 14, 14, 13, 14, 15, 14, 14, 14, 13, 14, 13, 14, 14, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 14,
  13, 14, 12, 14, 14, 12, 14, 14, 12, 14, 14, 12, 14, 14, 14, 14, 12, 14, 14, 14, 13, 14, 15, 15, 14, 15, 15, 12, 14, 14, 12, 14, 14, 12, 14, 13, 14, 12, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 15, 14, 14, 15, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 12, 14, 13, 14, 15, 15, 13, 14, 14, 14, 13,
  15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 15, 13, 14, 15, 12, 15, 13, 15, 14, 14, 14, 13, 14, 14, 14, 14, 15, 13, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 13, 13, 14, 13, 14, 14, 14, 14, 13, 14, 10, 14, 12, 15, 13, 14, 14, 12, 15,
  14, 14, 15, 15, 13, 14, 13, 14, 12, 14, 13, 14, 14, 14, 14, 15, 12, 13, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 10, 14, 13, 15, 15, 13, 14, 11, 14, 14, 12, 14, 13, 14, 13, 14, 13, 14, 13, 14, 12, 14, 13, 14, 13, 14, 14, 14, 12, 14, 13, 14, 13, 14, 13, 14, 14, 13, 14, 14, 14, 14,
  15, 12, 14, 15, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 13, 15, 14, 15, 14, 15, 14, 12, 14, 14, 14, 14, 14, 14, 14, 15, 11, 13, 14, 12, 14, 13, 14, 12, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 13, 13, 13, 14, 14, 14, 13, 14, 14, 12, 14, 14, 12, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14,
  14, 14, 14, 14, 15, 14, 12, 14, 15, 13, 15, 15, 13, 15, 15, 15, 14, 15, 15, 14, 16, 15, 15, 14, 15, 15, 15, 15, 15, 9, 14, 13, 15, 14, 15, 15, 14, 14, 12, 14, 13, 15, 14, 14, 15, 14, 12, 14, 14, 14, 13, 14, 13, 14, 13, 15, 14, 14, 13, 13, 14, 13, 14, 15, 14, 14, 14, 13, 14, 15, 15, 14, 14, 15, 14,
  14, 16, 13, 15, 14, 15, 15, 16, 15, 14, 13, 14, 14, 15, 14, 13, 15, 14, 15, 12, 14, 14, 12, 14, 14, 12, 14, 14, 12, 14, 14, 12, 14, 14, 14, 13, 12, 14, 14, 13, 14, 14, 14, 14, 14, 12, 14, 14, 13, 14, 14, 14, 12, 15, 15, 14, 14, 14, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 13, 15, 14, 15, 15, 14,
  15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 13, 14, 12, 13, 14, 14, 13, 14, 14, 14, 14, 15, 13, 14, 14, 11, 14, 14, 12, 14, 13, 14, 14, 13, 12, 14, 15, 12, 15, 15, 12, 14, 14, 12, 15, 15, 12, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 12, 14, 14, 12, 14, 13, 14, 14,
  12, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 12, 12, 14, 14, 15, 15, 14, 14, 14, 15, 14, 14, 15, 14, 15, 15, 13, 15, 14, 14, 15, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 15, 15, 14, 13, 14, 13, 15, 13, 14, 12, 15, 15, 15, 14, 14, 11, 14, 14, 14, 13, 14, 14, 13, 13, 14, 14, 14, 14, 14,
  13, 14, 13, 14, 14, 15, 15, 14, 15, 13, 14, 14, 14, 13, 14, 14, 15, 14, 14, 14, 14, 14, 14, 13, 14, 14, 15, 13, 14, 14, 13, 15, 15, 14, 13, 14, 14, 13, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 12, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 13, 15, 15, 13, 15, 15, 15, 15, 14, 15,
  13, 15, 15, 13, 15, 14, 15, 15, 15, 14, 14, 13, 14, 14, 14, 15, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 13, 14, 14, 15, 14, 15, 14, 14, 13, 13, 13, 14, 13, 14, 14, 15, 12, 13, 14, 13, 13, 13, 15, 14, 13, 14, 13, 14, 13, 14, 12, 14, 14, 14, 14, 11, 14, 14,
  14, 13, 14, 11, 14, 14, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 15, 12, 14, 14, 12, 14, 13, 15, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 12, 15, 13, 15, 12, 15, 13, 15, 14, 15, 14, 12, 15, 15, 13, 14, 14, 15, 14, 12, 14, 15, 13, 14, 12, 14, 14, 12, 14, 14, 12, 14, 14, 15, 12, 14,
  13, 15, 14, 14, 14, 14, 14, 15, 14, 12, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 13, 14, 13, 14, 14, 12, 14, 14, 14, 13, 14, 13, 13, 14, 12, 15, 14, 13, 14, 14, 12, 13, 14, 14, 14, 14, 14, 12, 14, 13, 13, 14, 13, 14, 13, 14, 14, 14, 14, 15, 13, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14,
  14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 12, 14, 14, 13, 15, 14, 14, 13, 14, 14, 14, 13, 13, 14, 14, 14, 14, 14, 13, 13, 14, 13, 12, 14, 12, 14, 14, 13, 14, 14, 13, 15, 14, 14, 14, 13, 14, 14, 12, 14, 15, 14, 15, 12, 15, 14, 15,
  14, 14, 12, 14, 14, 12, 14, 14, 12, 14, 14, 12, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 13, 14, 14, 13, 15, 14, 14, 14, 14, 11, 14, 14, 13, 15, 14, 14, 14, 14, 15, 15, 15, 15, 15, 12, 14, 13, 14, 15, 15, 15, 15, 13, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 12, 14, 13, 14,
  13, 15, 13, 14, 15, 14, 15, 15, 15, 15, 14, 15, 12, 15, 15, 15, 13, 14, 13, 13, 15, 15, 13, 14, 12, 14, 15, 15, 13, 15, 14, 15, 15, 14, 14, 14, 15, 13, 15, 15, 14, 15, 15, 14, 15, 12, 14, 13, 15, 13, 15, 15, 14, 14, 13, 13, 14, 14, 11, 14, 14, 12, 14, 13, 14, 14, 14, 14, 13, 14, 12, 14, 14, 14,
  14, 14, 14, 14, 13, 15, 13, 14, 15, 14, 15, 14, 15, 15, 13, 15, 15, 13, 14, 14, 13, 14, 14, 15, 15, 13, 15, 15, 13, 14, 14, 15, 14, 13, 11, 14, 14, 13, 14, 14, 13, 15, 15, 14, 14, 15, 14, 14, 13, 14, 11, 14, 13, 14, 14, 14, 13, 14, 12, 15, 13, 14, 14, 14, 14, 12, 14, 14, 14, 13, 14, 13, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 15, 12, 14, 14, 15, 15, 13, 14, 14, 14, 14, 12, 14, 15, 14, 14, 15, 14, 14, 13, 14, 14, 14, 13, 14, 15, 14, 14, 14, 13, 14, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 13, 13, 15, 13, 14, 13, 14, 14, 14, 14, 14, 13, 14, 12, 14, 14,
  12, 14, 13, 14, 14, 14, 14, 12, 14, 14, 14, 14, 13, 14, 9, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 10, 14, 14, 13, 12, 14, 14, 14, 14, 13, 14, 14, 15, 15, 13, 15, 14, 15, 13, 14, 14, 13, 14, 14, 15, 14, 15, 14, 14, 14, 15, 15, 14, 15, 15, 15, 15, 14, 14, 13, 15, 15, 13, 15, 15, 15, 15, 12, 15,
  15, 14, 15, 14, 12, 15, 14, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 14, 12, 12, 12, 14, 14, 13, 14, 11, 14, 13, 14, 14, 14, 14, 13, 14, 13, 15, 14, 15, 14, 12, 15, 14, 14, 14, 15, 14, 14, 14, 13, 14, 15, 14, 15, 14, 14, 13, 14, 14, 14, 12, 14, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15,
  15, 15, 14, 15, 14, 15, 12, 15, 14, 15, 15, 15, 15, 15, 13, 15, 14, 15, 14, 15, 15, 14, 13, 14, 14, 13, 15, 15, 13, 15, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 15, 13, 14, 14, 13, 14, 14, 11, 14, 13, 15, 12, 14, 13, 15, 13, 14, 12, 15, 14, 14, 14, 13, 15, 14, 14, 15, 15, 13, 15,
  14, 14, 13, 14, 14, 13, 15, 15, 12, 14, 15, 15, 15, 12, 15, 14, 14, 12, 14, 15, 15, 12, 15, 14, 13, 14, 15, 14, 15, 14, 14, 13, 14, 14, 15, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 13, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 15, 14, 14, 15, 15, 15, 14, 13, 14, 14, 14, 14, 14, 15, 14, 12, 14, 13, 14, 13, 15, 15, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 12, 14, 13, 14, 14, 14, 14, 15, 9, 14, 14, 14, 14, 13, 15, 12, 14, 15, 15, 14, 14, 13, 15,
  14, 14, 14, 12, 14, 14, 14, 12, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 13, 15, 14, 13, 14, 14, 14, 12, 14, 13, 14, 14, 14, 13, 15, 15, 14, 13, 15, 15, 14, 15, 15, 12, 15, 14, 15, 15, 15, 15, 14, 15, 15, 12, 15, 14, 15, 13, 15, 13, 15, 14, 14, 13, 14, 14, 14, 14, 15, 13,
  15, 15, 13, 14, 15, 15, 14, 13, 15, 14, 13, 14, 14, 13, 13, 15, 14, 15, 12, 14, 13, 14, 13, 14, 13, 14, 12, 14, 14, 14, 13, 14, 14, 14, 14, 12, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 13, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 12, 13, 14, 14, 14, 14, 12, 14, 14, 14, 13,
  14, 13, 14, 13, 14, 13, 13, 14, 14, 14, 13, 13, 14, 14, 13, 15, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 15, 13, 14, 15, 14, 14, 14, 14, 12, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 14, 11, 14, 14, 12, 14, 14, 15, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14,
  14, 13, 14, 14, 14, 13, 14, 12, 14, 14, 10, 14, 14, 14, 11, 14, 14, 14, 13, 14, 12, 14, 14, 15, 13, 14, 15, 14, 14, 15, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 15, 14, 14, 14, 13, 14, 14, 14, 12, 13, 14, 15, 15, 14, 15, 14, 13, 14, 11, 14, 14, 12, 15, 13, 14, 13, 14, 13, 14, 14,
  14, 14, 13, 13, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 15, 13, 14, 13, 13, 14, 14, 15, 14, 14, 14, 15, 13, 14, 13, 14, 13, 14, 14, 13, 14, 15, 12, 12, 14, 13, 15, 14, 15, 14, 14, 15, 14, 12, 14, 15, 14, 14, 14, 13, 14, 14, 14, 14, 12, 14, 14, 14, 13, 14, 13, 14, 14, 15, 14, 14, 14,
  13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 14, 13, 14, 14, 14, 14, 14, 13, 14, 15, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 12, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14,
  13, 14, 12, 14, 13, 14, 15, 12, 14, 13, 14, 15, 12, 14, 14, 14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 12, 14, 13, 14, 13, 14, 13, 15, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 13, 14, 13, 14, 12, 14, 13, 14, 13, 14, 14, 13, 14, 14, 12, 14, 14, 15, 14, 13, 15, 14, 14, 13, 14, 14, 14, 12, 14, 15, 12,
  14, 14, 12, 14, 15, 14, 14, 14, 14, 14, 14, 13, 14, 14, 15, 15, 15, 14, 14, 15, 13, 15, 15, 15, 14, 13, 14, 13, 14, 14, 12, 14, 14, 14, 14, 13, 14, 14, 11, 13, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 10, 14, 14, 14, 14, 11, 14, 14, 13, 14, 14, 15, 13, 14, 15, 15, 15, 14, 14, 14, 14, 14, 14, 12,
  15, 15, 14, 14, 15, 14, 14, 14, 15, 13, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 15, 13, 14, 15, 15, 14, 13, 15, 14, 14, 15, 14, 13, 15, 12, 15, 14, 15, 13, 15, 15, 14, 15, 14, 15, 15, 14, 14, 15, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14,
  13, 14, 14, 14, 14, 14, 10, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 13, 14, 15, 15, 15, 15, 15, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 13, 14, 13, 14, 13,
  14, 14, 14, 14, 13, 14, 14, 9, 14, 14, 14, 13, 14, 13, 14, 13, 14, 14, 14, 14, 13, 14, 14, 9, 14, 14, 14, 14, 15, 14, 13, 14, 13, 14, 12, 14, 14, 12, 14, 14, 12, 14, 13, 14, 14, 13, 13, 13, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 13, 15, 14, 12, 15, 14, 14, 12,
  14, 14, 12, 14, 13, 14, 14, 14, 14, 12, 12, 14, 14, 12, 14, 13, 14, 15, 14, 14, 13, 15, 13, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 13, 13, 14, 15, 15, 13, 14, 14, 14, 14, 14, 14, 15, 13, 14, 12, 14, 12, 15, 15, 12, 14, 14, 14, 14, 14, 13, 13, 12, 14, 14, 12, 14, 13, 14, 14, 14,
  14, 13, 14, 14, 14, 13, 14, 14, 14, 15, 15, 14, 15, 15, 15, 13, 14, 13, 15, 15, 14, 14, 13, 13, 14, 15, 14, 14, 13, 14, 14, 13, 14, 13, 14, 14, 9, 14, 13, 14, 13, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 15, 13, 15, 14, 15, 13, 15, 15, 15, 13, 14, 15, 11, 14, 13, 14, 14, 14, 14, 14,
  13, 14, 14, 14, 14, 13, 13, 12, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 15, 14, 13, 15, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 15, 13, 14, 13, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 13, 15, 13, 14, 13, 14, 14, 15, 13, 14, 14, 15, 13, 14, 12, 14,
  13, 14, 14, 14, 14, 15, 14, 15, 15, 13, 14, 15, 15, 14, 15, 13, 15, 15, 14, 15, 14, 15, 13, 14, 15, 14, 12, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 13, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14,
  14, 14, 13, 15, 14, 13, 15, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 11, 13, 14, 13, 14, 13, 14, 14, 14, 14, 13, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 9, 14, 14, 14, 13, 14, 14, 14, 10, 14, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 9, 14, 15, 14, 10, 14, 15, 11, 14, 13, 13, 13, 13, 12, 13, 12, 13, 13, 13, 14, 14, 14, 13, 13, 13, 12, 13, 13, 14, 13, 13, 13, 13, 13, 12, 11, 13, 13, 12, 13, 11, 11, 14, 11, 10, 11, 11, 10, 9, 11, 10, 11, 11, 11, 11, 10, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 9,
  10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 8, 11, 11, 11, 11, 10, 10, 11, 11, 11, 11, 11, 11, 14, 14, 15, 15, 14, 15, 15, 14, 15, 14, 14, 14, 15, 15, 9, 14, 15, 14, 14, 14, 14, 14, 13, 15, 14, 14,
  15, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 15, 15, 15, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 13, 14, 14, 15, 13, 14, 14, 13, 14, 13, 15, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 15, 13, 14, 14, 13, 14, 14, 11, 13, 14, 14, 15, 14, 14, 13, 14, 13, 14, 14, 13, 14,
  14, 13, 14, 14, 14, 14, 15, 14, 14, 15, 15, 14, 13, 15, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 13, 15, 14, 14, 14, 14, 13, 13, 14, 14, 15, 14, 13, 13, 14, 11, 14, 14, 12, 13, 15, 14, 14, 14, 15, 13, 14, 14, 14, 11, 13, 14, 14, 15, 15, 13, 13, 14, 15, 14, 14, 13, 14, 15, 14, 14, 13, 15, 15,
  14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 14, 15, 15, 14, 12, 13, 14, 14, 12, 14, 13, 14, 14, 15, 14, 15, 15, 13, 12, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 15, 12, 15, 14, 14, 12, 14, 14, 14, 14, 15, 13, 14, 13, 13, 14, 14, 10, 14, 15, 13, 15, 15, 15, 14, 13, 14,
  13, 14, 14, 14, 14, 12, 13, 13, 14, 12, 14, 14, 14, 14, 14, 14, 11, 14, 13, 15, 15, 13, 15, 14, 15, 14, 13, 13, 12, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 14, 15, 14, 14, 15, 12, 14, 15, 13, 14, 15, 14, 14, 14, 15, 14, 13, 15, 15, 14, 15, 15, 15, 15, 15, 15, 13, 13, 14, 15, 15, 15, 13,
  15, 14, 13, 15, 15, 14, 12, 15, 14, 14, 15, 15, 14, 15, 14, 14, 14, 13, 14, 14, 15, 14, 14, 14, 15, 15, 15, 15, 14, 14, 14, 14, 14, 13, 14, 12, 14, 15, 14, 14, 15, 14, 14, 14, 14, 14, 14, 15, 15, 14, 15, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 13, 14, 13, 15, 15, 14, 15, 14, 15, 14, 14, 13, 15,
  15, 14, 13, 15, 15, 14, 15, 14, 14, 13, 14, 14, 14, 14, 10, 14, 14, 12, 14, 14, 13, 14, 11, 14, 14, 12, 14, 13, 14, 9, 13, 14, 15, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 15, 15, 14, 14, 12, 14, 14, 14, 13, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 14, 13, 14, 13, 15, 15, 15, 15, 14, 15, 15,
  15, 15, 15, 15, 15, 15, 14, 14, 14, 15, 15, 15, 15, 14, 12, 15, 15, 14, 12, 14, 14, 14, 12, 15, 15, 15, 15, 15, 14, 14, 15, 15, 14, 15, 15, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14,
  14, 14, 14, 10, 15, 15, 14, 14, 14, 14, 14, 14, 12, 14, 14, 13, 14, 11, 14, 15, 13, 14, 14, 13, 15, 14, 14, 13, 14, 14, 14, 14, 13, 11, 14, 14, 14, 14, 14, 15, 15, 14, 13, 14, 14, 14, 11, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 13, 14, 15, 14, 14, 14, 14, 14, 14, 15, 11, 14, 15, 14, 14,
  14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 13, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 15, 14, 14, 15, 13, 15, 14, 14, 13, 15, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 10, 13, 14, 12, 14, 14, 14, 14, 11,
  14, 14, 12, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 12, 14, 14, 13, 14, 14, 13, 14, 12, 14, 15, 14, 15, 15, 15, 15, 13, 15, 15, 12, 15, 15, 15, 13, 15, 15, 15, 15, 14, 14, 14, 15, 14, 14, 13, 10, 14, 14, 15, 13, 14, 14, 13, 14, 14, 13, 13,
  14, 14, 14, 14, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 14, 13, 14, 14, 15, 15, 14, 15, 15, 14, 14, 13, 15, 15, 13, 14, 14, 13, 14, 14, 14, 15, 15, 15, 15, 14, 12, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 14, 15,
  14, 10, 14, 14, 14, 14, 13, 14, 12, 14, 14, 12, 14, 14, 15, 14, 14, 15, 13, 15, 14, 14, 15, 14, 14, 14, 15, 15, 14, 13, 14, 14, 14, 14, 13, 14, 15, 14, 13, 14, 14, 14, 13, 14, 15, 14, 15, 14, 15, 12, 15, 14, 15, 14, 14, 15, 14, 15, 14, 14, 14, 14, 13, 14, 14, 15, 14, 15, 15, 15, 14, 15, 14, 13,
  15, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 13, 13, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 13, 15, 14, 14, 13, 13, 14, 14, 14, 13, 14, 15, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 13, 13, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 12, 14, 15, 14, 14, 14, 14, 14,
  14, 14, 15, 14, 15, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 13, 12, 15, 14, 14, 14, 11, 15, 14, 14, 14, 14, 12, 15, 14, 14, 14, 13, 14, 15, 13, 14, 14, 15, 15, 15, 14, 15, 14, 15, 13, 15, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 15, 15, 13, 14, 15, 14, 14, 14, 14, 15, 14, 14,
  14, 15, 15, 15, 15, 15, 14, 15, 12, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 15, 15, 14, 14, 14, 15, 14, 14, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 12, 14, 13, 14, 14, 14, 13, 14, 14, 15, 14, 14, 14, 13, 15, 10, 14, 13, 14, 14, 11, 15, 15, 15, 14, 14, 13, 14, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 11, 14, 14, 14, 14, 13, 13, 14, 14, 13, 13, 13,
  14, 13, 14, 14, 13, 14, 14, 14, 12, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 13, 14, 15, 15, 15, 15, 13, 15, 14, 14, 13, 14, 14, 15, 14, 15, 14, 14, 14, 15, 15, 14, 14, 14, 14, 14, 14, 13, 15, 13, 14, 15, 15, 13, 14, 15,
  14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 15, 15, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 11, 14, 14, 14, 14, 14, 14, 15, 15, 14, 14, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 14, 14, 13, 14, 14, 14, 14, 13, 14, 15, 14, 14, 14, 13, 14, 14, 14, 14, 11, 14, 13, 14, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 13, 14, 15, 14, 14, 15, 14, 14, 15, 15, 12, 14, 15, 15, 13, 15, 14, 15, 15, 14, 14, 13, 14, 14, 11, 14, 13, 14, 15, 13, 15, 13, 15, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 15, 14, 15, 14, 15, 14, 14, 14, 14,
  14, 14, 13, 14, 11, 14, 14, 14, 13, 14, 14, 14, 15, 15, 15, 13, 14, 15, 13, 14, 15, 13, 15, 12, 15, 15, 13, 14, 14, 14, 14, 13, 14, 15, 13, 15, 15, 14, 11, 14, 13, 12, 14, 14, 14, 13, 14, 12, 14, 12, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 15, 15, 12, 15, 14, 15, 15, 15, 10,
  15, 14, 14, 15, 15, 15, 15, 15, 14, 12, 15, 15, 15, 15, 14, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 15, 14, 14, 15, 14, 15, 15, 14, 15, 13, 14, 14, 14, 14, 14, 15, 14, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14,
  14, 15, 14, 15, 14, 15, 14, 14, 14, 12, 14, 10, 15, 15, 15, 15, 15, 15, 13, 15, 14, 14, 15, 14, 14, 14, 14, 15, 15, 14, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 13, 15, 14, 13, 14, 14, 14, 14, 13, 14, 14, 13, 15, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 12, 14, 15,
  13, 15, 13, 14, 15, 15, 15, 13, 15, 15, 15, 15, 14, 14, 15, 13, 15, 14, 15, 13, 15, 14, 15, 11, 14, 14, 13, 14, 15, 15, 14, 13, 11, 14, 14, 13, 15, 14, 14, 14, 15, 15, 13, 15, 14, 15, 14, 15, 13, 14, 14, 14, 13, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 13, 13, 13, 14, 14, 14, 14, 13,
  14, 14, 13, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 13, 13, 13, 14, 14, 13, 13, 14, 14, 14, 14, 13, 12, 12, 14, 14, 14, 13, 14, 12, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 12, 14, 14,
  13, 14, 15, 13, 15, 15, 15, 12, 15, 14, 14, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 13, 14, 11, 14, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 11, 13, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 13, 14, 13, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14,
  14, 13, 14, 13, 14, 14, 13, 12, 14, 13, 15, 14, 15, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 11, 14, 14, 14, 14, 10, 14, 14, 13, 14, 12, 13, 14, 13, 14, 14, 14, 14, 12, 14, 14, 14, 15, 15, 15, 14, 15, 14, 14, 14, 13, 15, 12, 14, 14, 12, 14, 14, 13, 14, 13, 14, 13, 13, 13, 14, 13, 13,
  14, 14, 14, 13, 13, 15, 11, 14, 15, 14, 12, 15, 13, 14, 15, 14, 14, 14, 14, 15, 14, 15, 14, 15, 14, 15, 13, 15, 15, 13, 12, 15, 13, 14, 13, 11, 14, 14, 14, 14, 15, 14, 14, 14, 13, 14, 14, 15, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 15, 14, 15, 13, 14, 13, 14, 15, 13, 12, 14, 14, 13, 14,
  14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 12, 15, 14, 10, 12, 14, 14, 13, 13, 15, 14, 13, 14, 14, 14, 14, 13, 14, 14, 11, 14, 13, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 8, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 15, 14, 14, 14, 15, 15, 15, 14, 14,
  14, 14, 14, 14, 13, 14, 15, 15, 13, 15, 14, 14, 14, 15, 15, 14, 15, 14, 15, 15, 15, 13, 14, 15, 12, 14, 15, 14, 12, 15, 14, 15, 15, 12, 15, 14, 15, 15, 14, 12, 13, 14, 14, 14, 14, 11, 14, 14, 14, 14, 14, 14, 11, 13, 14, 13, 11, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 13, 14, 15, 15, 13,
  15, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 13, 12, 14, 14, 14, 14, 15, 15, 15, 14, 13, 14, 14, 15, 14, 14, 14, 14, 15, 14, 13, 14, 13, 14, 14, 15, 14, 14, 14, 12, 14, 14, 14, 13, 13, 8, 14, 12, 14, 12, 14, 14, 14, 14, 15, 15, 15, 14, 14, 15, 15, 14, 13, 15, 15, 14, 15, 14, 15, 15, 14, 14, 14, 13,
  14, 10, 12, 14, 14, 14, 14, 14, 13, 15, 14, 14, 14, 14, 14, 13, 13, 14, 14, 13, 13, 13, 13, 14, 10, 14, 14, 14, 12, 14, 15, 14, 14, 13, 13, 14, 14, 13, 13, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14,
  14, 14, 12, 14, 14, 12, 14, 13, 13, 13, 14, 14, 15, 13, 14, 13, 14, 14, 13, 13, 14, 14, 14, 14, 14, 13, 14, 15, 15, 15, 15, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 10, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 15, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 13, 12, 13, 13, 14, 12, 14, 13, 14,
  12, 13, 14, 14, 14, 13, 14, 13, 14, 13, 12, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 12, 14, 12, 14, 13, 14, 14, 12, 14, 14, 13, 14, 13, 13, 14, 13, 13, 14, 14, 13, 14, 13, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 13, 12, 14, 13, 13, 14, 14, 13, 14, 14, 15, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 12, 13, 14, 14, 13, 14, 11,
  12, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 10, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 15, 15, 15, 13, 15, 15, 14, 15, 14, 14, 15, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 15, 15, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 12, 15, 15,
  14, 15, 13, 14, 14, 14, 13, 14, 12, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 12, 13, 14, 13, 14, 12, 14, 13, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 13, 14, 14, 13, 14, 13,
  13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 15, 14, 13, 14, 14, 12, 14, 14, 14, 11, 14, 14, 14, 14, 14, 12, 14, 14, 15, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 11, 14, 15, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13,
  14, 14, 9, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 15, 14, 13, 14, 14, 14, 14, 14, 14, 14, 12, 14, 13, 14, 13, 14, 13, 13, 14, 14, 14, 13, 14, 14, 12, 14, 13, 14, 14, 12, 13, 14, 14, 15, 14, 12, 14, 13, 14, 14, 14, 8, 14, 12, 14, 14, 14, 14, 13, 13, 14, 13, 13, 12, 13, 13, 13,
  14, 13, 14, 14, 11, 13, 13, 12, 13, 11, 12, 10, 8, 13, 14, 10, 13, 13, 12, 13, 13, 12, 13, 12, 14, 13, 13, 13, 13, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 10, 12, 10, 11, 11, 11, 11, 11, 10, 11, 11, 11, 10, 11, 11, 10, 11, 11, 10, 11, 9, 11, 11, 11, 10, 11, 10, 11, 11, 11, 10, 11,
  11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 9, 11, 10, 11, 11, 10, 11, 10, 11, 11, 11, 10, 11, 11, 11, 11, 10, 10, 11, 14, 15, 14, 15, 15, 13, 14, 13, 14, 15, 14, 14, 14, 14, 14, 14, 13, 14, 15, 13, 14, 14, 14, 13, 14, 14, 14, 15, 12, 14, 14, 14, 14, 13, 15, 14, 15, 15, 15, 14, 14, 15, 14, 15, 13,
  14, 14, 14, 14, 15, 14, 14, 14, 12, 14, 13, 15, 13, 15, 14, 15, 14, 14, 13, 15, 14, 14, 14, 14, 14, 11, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 15, 15, 13, 15, 15, 13, 14, 12, 14, 14, 14, 13, 13, 14,
  15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 14, 14, 15, 15, 13, 14, 14, 14, 14, 14, 14, 14, 15, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 15, 14, 14, 13, 14, 14, 14, 15, 14, 15, 14, 14, 15, 15, 15, 14, 15, 15, 13, 14, 14, 15, 13, 13, 14,
  14, 14, 12, 13, 14, 13, 14, 14, 11, 14, 13, 14, 15, 13, 14, 14, 15, 13, 15, 14, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 13, 15, 13, 14, 14, 13, 14, 14, 14, 11, 14, 14, 13, 14, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 14, 14, 13, 14, 14, 14, 14, 14,
  14, 14, 14, 15, 15, 13, 15, 15, 13, 14, 14, 14, 15, 15, 14, 12, 14, 15, 12, 14, 15, 13, 15, 14, 15, 14, 14, 15, 14, 14, 14, 13, 14, 15, 14, 14, 13, 15, 15, 13, 15, 15, 15, 13, 15, 13, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 13, 14, 13, 15, 15, 15, 15, 13, 14, 13, 14, 13, 14, 13, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 13, 15, 13, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 15, 15, 11, 14, 13, 14, 13, 14, 14, 14, 13, 12, 14, 15, 15, 10, 15, 14, 14, 15, 13, 14, 13, 14, 12, 14, 14, 14, 14, 14, 13, 14, 13, 13, 15,
  14, 14, 13, 14, 14, 13, 14, 11, 14, 13, 14, 13, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 13, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 12, 14, 13, 14, 12, 14, 14, 13, 15, 13, 14, 14, 14, 15, 14, 15, 15, 13, 14, 13, 15, 14, 14, 14, 14, 12, 14, 14, 11,
  12, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 12, 14, 14, 14, 14, 13, 14, 14, 14, 13, 12, 14, 14, 13, 14, 14, 12, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 11, 14, 13, 15, 15, 15, 14, 13, 13, 14, 14, 14, 13, 14, 15, 14, 14, 15, 14, 14, 12, 13, 14, 14, 14, 15, 14,
  15, 14, 15, 15, 16, 15, 14, 14, 13, 14, 11, 14, 14, 14, 14, 14, 14, 13, 15, 14, 14, 14, 13, 14, 14, 14, 14, 13, 15, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 15, 13, 14, 14, 13, 14, 13, 9, 14, 14, 14, 14, 15, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 13, 13, 11, 14, 14,
  13, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 14, 13, 14, 14, 11, 15, 14, 14, 13, 14, 14, 14, 13, 14, 14, 15, 15, 14, 14, 14, 13, 12, 14, 12, 14, 14, 14, 15, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 15, 14, 13, 14, 14, 14, 14, 15, 14, 13, 14, 14, 14, 14, 11, 14, 14, 15, 13, 14,
  14, 14, 14, 13, 14, 14, 14, 14, 13, 13, 14, 14, 14, 14, 14, 15, 13, 13, 15, 14, 15, 13, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 13, 14, 14, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 14, 13, 15, 15, 12, 14, 14, 15, 15, 15, 15, 14, 14, 15, 14, 11, 14, 14, 15, 13, 14, 14, 14, 14, 12,
  14, 15, 14, 10, 15, 14, 13, 14, 14, 14, 15, 14, 15, 12, 15, 13, 12, 14, 14, 14, 14, 13, 14, 14, 15, 15, 15, 14, 14, 14, 14, 14, 12, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 13, 14, 12, 14, 14, 12, 14,
  15, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 11, 14, 13, 14, 13, 14, 14, 15, 15, 15, 13, 14, 14, 13, 14, 14, 15, 15, 14, 13, 14, 13, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 14, 15, 15, 14, 14, 14, 13, 14, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15,
  14, 15, 14, 14, 13, 15, 14, 15, 15, 12, 15, 14, 15, 14, 13, 14, 14, 14, 15, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 12, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 10, 14, 13, 14, 14, 14, 14, 14, 9, 13, 14, 12, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14,
  14, 14, 14, 14, 14, 14, 13, 11, 14, 14, 12, 12, 14, 12, 14, 13, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 14, 13, 14, 14, 13, 15, 14, 13, 14, 14, 13, 14, 13, 12, 14, 14, 13, 14, 14, 14, 13, 14, 13, 14, 14, 15, 15, 13, 15, 14, 14, 15, 13, 14, 15, 14, 14, 13, 15, 12, 14,
  10, 14, 14, 14, 14, 13, 14, 14, 14, 15, 15, 15, 13, 14, 14, 14, 13, 14, 15, 15, 14, 13, 14, 14, 13, 15, 15, 14, 14, 13, 15, 15, 15, 14, 14, 13, 15, 15, 15, 13, 14, 12, 15, 15, 14, 13, 14, 14, 15, 14, 15, 13, 14, 14, 13, 14, 15, 14, 13, 12, 14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 15, 15, 15,
  14, 13, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 13, 13, 15, 12, 14, 13, 14, 14, 10, 14, 15, 13, 14, 12, 14, 14, 12, 14, 14, 13, 15, 14, 14, 14, 15, 13, 15, 14, 15, 15, 15, 15, 15, 13, 14, 14, 14, 14, 14, 13, 15, 15, 14, 14, 14, 14, 13, 14, 14, 14, 14, 12, 13, 13, 14, 15, 14, 13, 14, 11,
  14, 14, 14, 12, 15, 15, 14, 14, 13, 14, 15, 14, 15, 14, 15, 15, 11, 15, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 15, 12, 15, 13, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 13, 15, 14, 14, 13, 14, 14, 14, 13, 11, 14, 14, 12, 14, 14, 12, 14, 14, 14, 12, 14, 14, 14, 14, 11, 14, 14, 14,
  13, 14, 12, 14, 14, 13, 14, 14, 14, 14, 15, 10, 14, 14, 15, 14, 13, 14, 13, 14, 14, 14, 14, 12, 15, 15, 15, 13, 12, 15, 14, 15, 13, 15, 14, 15, 12, 15, 14, 15, 14, 12, 14, 14, 12, 14, 13, 15, 11, 14, 14, 14, 15, 14, 13, 14, 14, 14, 14, 13, 14, 14, 10, 13, 14, 14, 14, 14, 14, 13, 14, 14, 12, 14,
  15, 11, 13, 10, 14, 14, 15, 15, 14, 14, 15, 13, 15, 15, 15, 15, 12, 15, 15, 15, 15, 13, 15, 14, 15, 15, 13, 13, 14, 13, 15, 13, 14, 11, 14, 13, 15, 14, 13, 14, 14, 14, 13, 13, 13, 14, 14, 14, 12, 14, 14, 14, 14, 15, 14, 13, 12, 13, 13, 11, 13, 13, 14, 14, 14, 15, 14, 12, 14, 14, 13, 14, 14, 13,
  14, 14, 13, 13, 14, 14, 14, 14, 14, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 14, 14, 15, 12, 14, 14, 15, 14, 12, 14, 13, 15, 14, 14, 13, 14, 14, 11, 14, 11, 15, 12, 13, 14, 14, 14, 12, 14, 15, 14, 14, 14, 15, 14, 14, 13, 14, 14, 15, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 11, 14, 15, 14, 14,
  14, 14, 14, 12, 14, 14, 14, 11, 15, 15, 15, 15, 13, 13, 14, 13, 14, 14, 14, 14, 14, 13, 14, 11, 14, 15, 13, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 11, 15, 13, 14, 14, 13, 13, 15, 14, 15, 14, 15, 14, 15, 14, 15, 13, 15, 11, 14, 14, 14, 15, 13, 15, 14, 12, 14, 14, 14, 13,
  14, 12, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 12, 15, 12, 14, 14, 13, 14, 11, 15, 14, 15, 14, 15, 15, 15, 13, 15, 15, 13, 15, 15, 14, 15, 13, 14, 14, 13, 14, 14, 15, 12, 15, 13, 13, 15, 14, 15, 15, 12, 15, 15, 14, 14, 14, 14, 14, 14, 13, 14, 14, 12, 14, 14, 14, 14, 13, 14, 13, 12, 13, 15,
  14, 14, 15, 14, 15, 15, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 14, 11, 14, 13, 14, 14, 12, 11, 13, 12, 13, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 14, 13, 15, 13, 11, 14, 13, 14, 13, 14, 14, 12, 14, 15, 13, 15, 14, 14, 13, 13, 14, 14, 14, 13,
  13, 14, 12, 14, 14, 14, 14, 12, 14, 13, 15, 14, 14, 14, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 11, 15, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 14, 13, 15, 15, 15, 15, 15, 14, 13, 14, 15, 15, 13, 14, 14, 15, 14, 15, 14, 15, 14, 14, 14, 13, 14, 14, 15, 15, 13, 14, 15, 15, 15, 15, 14,
  15, 14, 14, 14, 12, 15, 13, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 11, 15, 15, 14, 15, 15, 13, 15, 15, 13, 15, 13, 15, 14, 14, 15, 14, 15, 13, 15, 13, 14, 14, 14, 14, 13, 14, 14, 14, 15, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,
  14, 14, 13, 14, 14, 13, 14, 15, 14, 15, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 15, 14, 14, 15, 13, 15, 14, 14, 15, 15, 13, 15, 15, 13, 14, 13, 14, 12, 13, 13, 14, 12, 14, 14, 14, 12, 14, 15, 15, 14, 14, 14, 13, 13, 15, 14, 12, 15, 15, 13, 14, 15, 13,
  14, 14, 12, 14, 13, 14, 14, 14, 14, 14, 13, 15, 14, 14, 14, 14, 14, 14, 13, 14, 14, 15, 14, 14, 14, 11, 14, 14, 14, 14, 14, 14, 14, 10, 14, 14, 14, 14, 13, 14, 15, 15, 14, 13, 13, 14, 13, 14, 13, 14, 13, 13, 14, 13, 13, 14, 14, 13, 14, 14, 14, 11, 14, 12, 12, 14, 14, 12, 14, 14, 14, 14, 14, 13,
  14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 11, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 12, 14, 12, 13, 14, 14, 14, 14, 14, 13, 13, 12, 14, 14, 14, 14, 14, 13, 12, 13, 12, 14, 13, 14, 14, 14, 14, 12, 14, 11, 12, 14, 14, 14, 14, 14, 12, 14, 12, 14, 14, 13, 14, 14,
  14, 14, 14, 14, 14, 13, 13, 14, 13, 14, 13, 14, 13, 14, 11, 14, 13, 14, 14, 13, 14, 14, 12, 14, 14, 15, 14, 13, 14, 14, 15, 14, 14, 11, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 15, 14, 14, 15, 14, 15, 13, 14, 13, 14, 13, 14, 13, 14, 11, 14, 14, 14, 14, 14, 13, 14, 13, 14, 11, 14, 14, 14, 14,
  14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 10, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 11, 14, 14, 12, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 11, 14, 14, 12, 13, 14, 13, 14, 14, 12, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 15, 15, 14, 14, 14, 15, 14, 13, 14, 13, 15, 14, 15,
  14, 15, 14, 14, 12, 14, 14, 14, 13, 13, 13, 13, 14, 13, 14, 15, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 13, 14, 15, 8, 14, 13, 9, 14, 15, 15, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 13, 13, 14, 13, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 13, 14, 14, 14, 14, 14, 13,
  14, 15, 14, 13, 14, 14, 14, 12, 12, 13, 15, 14, 14, 13, 13, 14, 12, 14, 12, 14, 14, 14, 13, 14, 13, 12, 14, 14, 14, 13, 14, 14, 15, 14, 14, 14, 15, 14, 14, 12, 14, 14, 14, 11, 14, 13, 14, 13, 12, 14, 14, 14, 13, 12, 14, 13, 12, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 12, 14, 14,
  15, 14, 13, 14, 13, 14, 14, 14, 14, 13, 12, 14, 14, 14, 13, 12, 14, 13, 14, 12, 14, 13, 14, 13, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 13, 14, 14, 13, 14, 14, 13, 13, 14, 13, 14, 12, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 12,
  14, 14, 11, 14, 14, 14, 13, 14, 12, 14, 13, 13, 14, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 12, 14, 13, 14, 12, 14, 14, 13, 14, 14, 14, 14, 13, 14, 13, 14, 9, 14, 14, 14, 13, 13, 13, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 15, 14, 13, 14, 14, 13, 14, 13, 14, 14, 11, 13, 12, 13, 14,
  10, 14, 14, 13, 14, 14, 14, 14, 11, 14, 13, 13, 14, 12, 14, 14, 14, 12, 14, 15, 12, 13, 14, 14, 13, 14, 14, 14, 14, 13, 14, 13, 12, 14, 14, 12, 14, 14, 14, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 13, 14, 14, 12, 14, 14, 13, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 13, 14,
  13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 13, 13, 14, 13, 15, 14, 13, 14, 14, 13, 14, 12, 13, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 14, 12, 14, 14, 12, 14, 14, 14, 12, 14, 14,
  14, 14, 13, 14, 12, 14, 13, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 13, 10, 14, 14, 14, 12, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 10, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 13, 14, 13, 14, 14, 14, 13,
  14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 11, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 13, 12, 14, 14, 14, 13, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 12, 14, 14,
  13, 14, 13, 13, 14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 13, 14, 13, 13, 14, 13, 13, 10, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14,
  10, 13, 13, 13, 14, 13, 13, 13, 13, 13, 14, 14, 13, 12, 14, 13, 14, 14, 13, 13, 10, 14, 15, 14, 15, 9, 12, 14, 14, 14, 13, 15, 14, 13, 13, 14, 13, 12, 13, 13, 14, 13, 14, 13, 11, 13, 13, 13, 11, 13, 13, 13, 13, 13, 14, 13, 14, 12, 13, 13, 13, 13, 12, 13, 13, 13, 14, 10, 14, 14, 12, 13, 10, 11, 11,
  11, 11, 11, 8, 10, 11, 11, 10, 10, 11, 10, 11, 10, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 10, 11, 10, 11, 11, 11, 11, 11, 11, 10, 11, 9, 11, 11, 10, 11, 9, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11,
  9, 11, 11, 11, 11, 10, 14, 15, 14, 14, 13, 14, 14, 14, 15, 15, 14, 14, 13, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 15, 14, 15, 15, 13, 15, 14, 14, 15, 15, 14, 15, 15, 11, 15, 13, 14, 14, 13, 15, 15, 14, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 11, 14, 14, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14, 13, 14, 14, 15, 14, 14, 14, 14, 15, 15, 14, 13, 14, 14, 14, 13, 15, 15, 15, 14, 14, 14, 12, 13, 13, 14, 12, 13, 14, 14, 12, 13, 14, 14, 15, 15, 15, 14, 14, 14, 12, 14, 14, 12, 15, 14, 12, 13, 15, 12, 15,
  14, 15, 15, 14, 15, 15, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 15, 15, 15, 13, 14, 13, 14, 14, 12, 15, 15, 14, 14, 12, 15, 14, 15, 12, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 14, 14, 15, 13, 14, 14, 15, 15, 15, 14, 14, 15, 15, 14, 15, 14, 15, 15,
  13, 12, 13, 12, 14, 13, 13, 14, 14, 14, 15, 15, 15, 14, 12, 14, 14, 14, 15, 10, 14, 13, 14, 14, 14, 15, 14, 13, 14, 14, 14, 15, 13, 14, 15, 13, 14, 13, 15, 14, 11, 14, 13, 14, 12, 14, 14, 14, 14, 13, 13, 14, 13, 14, 14, 14, 14, 13, 13, 15, 14, 15, 15, 15, 14, 12, 13, 13, 14, 14, 14, 12, 13, 14,
  13, 14, 14, 13, 14, 14, 11, 14, 14, 14, 14, 14, 14, 14, 13, 14, 15, 10, 15, 14, 15, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 15, 13, 14, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14,
  14, 15, 15, 15, 14, 14, 14, 14, 13, 14, 15, 15, 14, 15, 15, 11, 14, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 12, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 14, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 14, 12, 14,
  13, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 14, 12, 14, 14, 14, 14, 14, 13, 14, 13, 12, 14, 14, 15, 13, 15, 14, 15, 15, 15, 15, 14, 13, 15, 14, 14, 14, 14, 12, 15, 13, 14, 13, 15, 14, 15, 14, 14, 15, 15, 14, 14, 14, 13, 14, 13, 12, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 13,
  14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 13, 14, 15, 15, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 11, 14, 13, 14, 14, 13, 14, 14, 15, 11, 14, 13, 14, 14, 14, 14, 12, 14, 14, 14, 15, 13, 15, 12, 14, 14, 13, 14, 14, 12, 14, 14, 15, 14, 14, 14, 14, 14, 12, 14, 14, 14, 13, 14,
  12, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 13, 14, 15, 14, 14, 14, 14, 14, 13, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 13, 15, 15, 14, 15,
  13, 15, 14, 8, 14, 13, 14, 15, 15, 14, 14, 12, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 14, 13, 14, 14, 14, 13, 15, 15, 15, 15, 14, 15, 15, 14, 14, 13, 15, 14, 15, 13, 14, 15, 14, 15, 15, 15, 13, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 11, 14, 14, 14, 15, 13, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14,
  14, 13, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 13, 12, 14, 13, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 15, 15, 14, 15, 15, 14, 15, 13, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 14, 14, 14, 14, 13, 14, 14, 14, 12, 12, 14, 14, 14, 14,
  14, 13, 14, 14, 14, 12, 14, 14, 13, 10, 14, 13, 15, 15, 14, 15, 15, 15, 13, 15, 14, 14, 14, 15, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 14, 15, 14, 13, 14, 12, 14, 14, 15, 12, 14, 14, 15, 14, 14, 14, 13, 14, 15, 12, 15,
  14, 13, 15, 12, 13, 14, 11, 13, 15, 15, 15, 12, 15, 14, 15, 14, 11, 14, 15, 15, 14, 15, 14, 14, 11, 14, 14, 15, 15, 14, 14, 14, 14, 14, 13, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 12, 15, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14,
  14, 14, 13, 15, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 15, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 15, 12, 14, 14, 14, 14, 14, 13, 15, 14, 13, 12, 14, 13, 14, 14, 12, 14, 12, 15, 14, 14, 14, 13, 14, 11, 14, 14, 13, 14, 15, 13,
  15, 13, 15, 15, 15, 14, 13, 13, 15, 15, 15, 13, 14, 14, 14, 14, 13, 15, 15, 15, 14, 15, 14, 15, 14, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14, 15, 15, 14, 14, 14, 14, 14, 14, 14, 13, 15, 14, 14, 15, 14, 15, 13, 15, 13, 14, 13, 15, 14, 14, 14, 15, 15, 13, 15, 14, 13, 14, 15, 14, 15, 14, 14, 14, 13,
  15, 12, 14, 15, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 13, 14, 12, 14, 14, 13, 14, 14, 14, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 11, 14, 14, 15, 14, 15, 14, 14, 14, 15, 12, 15, 15, 15, 14, 12, 14, 14, 14, 13, 14, 14, 14, 14, 10, 14, 13, 13, 14, 13, 14, 14, 14, 13, 11, 14, 14, 14, 14,
  14, 12, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 12, 14, 14, 13, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 15, 14, 15, 14, 14, 15, 11, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 12, 14, 15, 13, 15, 15, 15, 14, 14, 14, 15, 15, 14, 15, 14, 15, 14, 14, 15, 14, 15, 13, 14, 15,
  14, 15, 14, 13, 14, 14, 12, 13, 14, 12, 15, 15, 15, 14, 14, 15, 15, 14, 14, 14, 14, 14, 13, 15, 14, 14, 14, 13, 14, 13, 14, 15, 15, 12, 15, 14, 14, 12, 12, 14, 13, 13, 14, 12, 13, 14, 12, 13, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 11, 14, 15, 14, 14, 12, 14, 13, 14, 14, 14, 14, 10, 14, 14, 15,
  13, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 12, 15, 13, 14, 14, 14, 14, 12, 14, 15, 14, 11, 15, 14, 14, 14, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 14, 12, 14, 14, 15, 14, 15, 14, 15, 14, 14, 14, 14, 13, 14, 14, 13, 14, 15, 13, 15, 14, 14, 13, 14, 14, 14, 14, 13, 11, 13, 14,
  14, 15, 14, 14, 14, 14, 13, 14, 13, 11, 12, 12, 12, 14, 13, 14, 14, 12, 14, 13, 14, 12, 14, 13, 13, 13, 14, 13, 14, 11, 14, 14, 14, 14, 12, 14, 14, 12, 13, 14, 14, 14, 14, 14, 13, 13, 13, 14, 14, 13, 13, 13, 14, 12, 14, 14, 13, 12, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14,
  14, 13, 13, 14, 14, 12, 14, 14, 12, 14, 11, 14, 14, 14, 14, 13, 13, 14, 13, 14, 13, 12, 13, 14, 13, 14, 11, 13, 14, 13, 13, 14, 13, 13, 14, 14, 13, 12, 11, 13, 14, 12, 14, 14, 14, 13, 14, 14, 12, 13, 14, 13, 14, 14, 13, 13, 11, 13, 13, 14, 13, 14, 13, 14, 14, 14, 13, 13, 13, 12, 14, 13, 14, 14,
  14, 13, 13, 13, 14, 12, 14, 11, 14, 14, 13, 13, 14, 14, 14, 13, 13, 14, 14, 14, 14, 13, 14, 14, 14, 15, 15, 15, 13, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 12, 14, 13, 14, 12, 14, 14, 12, 14, 14, 14, 14, 14, 13, 13, 14, 13, 13, 13, 14, 12, 13, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14,
  14, 12, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 11, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 13, 14, 14, 13, 14, 11, 13, 13, 13, 13, 14, 11, 13, 13, 14, 14, 14, 14, 13, 13, 14, 14, 12, 13, 13, 12, 11, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 13, 14, 14, 13, 14, 13, 14, 12, 13, 14,
  10, 14, 14, 13, 13, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 12, 15, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 13, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14,
  14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 15, 14, 14, 14, 14, 14, 13, 14, 13, 14, 13, 14, 13, 15, 14, 10, 14, 13,
  14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 13, 13, 13, 12, 13, 13, 14, 13, 14, 10, 14, 13, 13, 13, 14, 14, 13, 13, 14, 14, 14, 13, 14, 14, 12, 14, 14, 14, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14, 13, 14, 14, 13, 13, 13, 14, 12, 14, 12, 14, 13, 13, 13, 10, 12, 14, 14, 14,
  14, 13, 15, 14, 14, 14, 13, 14, 14, 14, 12, 14, 14, 12, 13, 14, 14, 14, 14, 13, 14, 14, 13, 13, 13, 13, 14, 14, 12, 14, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 14, 12, 13, 14, 13, 14, 13, 13, 14, 14, 14, 13, 13, 14, 14, 13, 13, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 15, 14, 14, 14, 14, 13,
  12, 13, 14, 14, 11, 13, 13, 14, 14, 14, 13, 14, 13, 13, 14, 14, 12, 14, 14, 11, 14, 13, 14, 14, 14, 14, 14, 14, 14, 12, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 13, 13, 13, 13, 13, 14, 13, 13, 13, 14, 13, 13, 13, 14, 13, 11, 14, 13, 13, 14, 14, 13, 13, 12, 14, 14, 13, 14, 13, 14, 12, 13,
  14, 14, 13, 13, 14, 14, 12, 14, 14, 14, 15, 14, 13, 12, 13, 14, 14, 13, 14, 14, 13, 13, 14, 13, 13, 14, 14, 12, 13, 14, 14, 13, 13, 12, 13, 13, 13, 10, 12, 13, 11, 13, 14, 12, 15, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 12, 14, 14, 12, 14, 14, 14, 11, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,
  13, 12, 14, 13, 14, 14, 13, 14, 13, 13, 13, 14, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 12, 14, 14, 13, 14, 13, 14, 9, 14, 14, 12, 15, 14, 14, 14,
  14, 13, 12, 14, 13, 14, 14, 13, 14, 14, 13, 13, 14, 14, 13, 14, 12, 14, 10, 14, 13, 14, 13, 14, 14, 13, 12, 14, 14, 14, 13, 14, 13, 14, 13, 12, 14, 14, 13, 12, 12, 14, 14, 14, 13, 12, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 12, 14, 14, 13, 13, 13, 13, 14, 13, 14, 13, 14, 14, 13,
  13, 13, 13, 14, 13, 14, 14, 12, 14, 14, 13, 14, 14, 13, 8, 14, 12, 13, 11, 14, 13, 14, 14, 14, 14, 14, 10, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 13, 13, 14, 10, 14, 14, 14, 13, 14, 13, 13, 14, 14, 13, 14, 13, 14, 12, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14,
  14, 13, 14, 15, 14, 12, 13, 13, 13, 13, 14, 13, 12, 12, 14, 13, 13, 14, 13, 14, 14, 13, 13, 12, 11, 14, 13, 14, 14, 12, 13, 11, 13, 12, 12, 14, 14, 11, 13, 14, 14, 12, 13, 13, 13, 14, 12, 13, 13, 11, 11, 11, 11, 12, 11, 10, 11, 11, 10, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11,
  11, 11, 11, 11, 11, 10, 11, 11, 11, 10, 10, 12, 12, 11, 10, 11, 11, 11, 11, 11, 10, 11, 11, 10, 11, 11, 11, 10, 11, 10, 10, 10, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 10, 10, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 12, 10, 11, 11, 11, 10, 11, 10, 11, 11, 11, 10, 10, 11, 11, 11, 15, 15, 14, 15,
  14, 15, 15, 15, 15, 15, 15, 12, 15, 15, 13, 15, 15, 15, 14, 14, 15, 14, 15, 13, 15, 9, 13, 14, 14, 14, 14, 14, 11, 13, 15, 10, 13, 15, 14, 14, 14, 14, 13, 14, 14, 12, 14, 14, 14, 13, 15, 14, 14, 15, 14, 15, 14, 15, 13, 13, 15, 14, 14, 14, 14, 15, 14, 11, 14, 13, 14, 13, 15, 15, 15, 14, 14, 13, 15,
  14, 14, 14, 14, 14, 15, 15, 14, 14, 14, 14, 14, 13, 15, 14, 14, 14, 14, 14, 14, 13, 15, 13, 14, 15, 13, 13, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 14, 14, 14, 14, 15, 15, 15, 14, 13, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 13, 14, 13, 14, 15, 14, 15, 12, 15, 11, 15, 13, 15, 15, 15, 11, 15,
  15, 15, 13, 14, 12, 14, 14, 14, 11, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 13, 14, 14, 13, 15, 15, 15, 14, 15, 15, 13, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 12, 14, 13, 14, 14, 14, 15, 15, 14, 13, 15, 15, 14, 14,
  14, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 13, 14, 15, 15, 15, 15, 11, 14, 14, 15, 15, 15, 15, 11, 14, 13, 14, 13, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 13, 15, 15, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 15, 15, 15, 12, 14,
  15, 14, 15, 15, 14, 14, 13, 14, 14, 8, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 13, 14, 12, 12, 14, 14, 14, 12, 14, 14, 14, 12, 14, 14, 14, 14, 14, 15, 13, 15, 14, 14, 14, 14, 13, 14, 14, 15, 14, 13, 14, 13, 15, 14, 14, 12, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14,
  11, 14, 12, 14, 14, 14, 13, 14, 14, 14, 13, 12, 11, 14, 14, 15, 13, 14, 13, 13, 14, 14, 15, 15, 14, 14, 11, 14, 14, 15, 12, 14, 15, 13, 15, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 15, 15, 13, 14, 15, 15, 15, 14, 15, 15, 14, 14, 15, 14, 15, 15, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15,
  15, 11, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 13, 14, 14, 14, 14, 15, 13, 14, 14, 14, 11, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 15, 15, 13, 14, 15, 14, 15, 15, 14, 15, 15, 15, 13, 14, 15, 14, 14, 15, 14, 15, 13, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14,
  14, 14, 14, 15, 15, 14, 12, 14, 14, 15, 13, 15, 15, 15, 15, 15, 15, 14, 14, 13, 14, 13, 14, 13, 14, 14, 15, 13, 15, 14, 15, 14, 14, 14, 14, 14, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 15, 12, 14, 14, 14, 13, 14, 15, 14, 12, 15,
  13, 15, 15, 12, 15, 15, 13, 14, 14, 15, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 14, 15, 14, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 12, 14, 14, 13, 15, 15, 15, 15, 14, 13, 13, 15, 15, 15, 14, 15, 14, 15, 13, 14, 13, 14, 11, 13, 14, 13,
  14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 15, 14, 13, 14, 14, 15, 14, 15, 15, 14, 13, 14, 14, 13, 15, 15, 14, 15, 14, 15, 15, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 15, 15, 14, 15, 15, 9, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 13, 13, 15, 11, 14, 14, 14, 14, 14,
  14, 14, 13, 14, 15, 15, 15, 13, 14, 15, 14, 15, 15, 14, 15, 15, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 13, 13, 13, 14, 13, 14, 14, 14, 13, 14, 13, 14, 12, 12, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 12, 14, 13, 13, 14, 14, 15, 15, 14,
  13, 15, 15, 14, 11, 14, 14, 14, 14, 13, 11, 15, 14, 14, 15, 15, 14, 14, 13, 15, 15, 14, 15, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 12, 13, 14, 14, 13, 15, 14, 14, 13, 14, 15, 14, 14, 14, 14, 12, 14, 13, 15, 13, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14,
  13, 14, 14, 13, 14, 14, 15, 13, 14, 15, 14, 15, 15, 15, 13, 15, 12, 15, 14, 15, 14, 15, 14, 15, 14, 15, 11, 15, 14, 14, 14, 13, 14, 13, 14, 15, 15, 13, 15, 13, 14, 14, 14, 14, 13, 14, 12, 14, 13, 14, 14, 14, 13, 14, 14, 12, 14, 14, 13, 13, 15, 15, 15, 14, 14, 14, 11, 14, 15, 15, 11, 14, 14, 13,
  14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 13, 14, 14, 14, 13, 15, 14, 15, 14, 13, 14, 14, 15, 15, 13, 13, 14, 15, 15, 15, 14, 15, 14, 15, 13, 15, 15, 12, 15, 13, 14, 13, 15, 13, 15, 15, 10, 14, 14, 15, 15, 12, 15, 14, 15, 13, 14, 14, 14, 14, 15, 14, 13, 15, 13, 13, 13, 14, 14, 15, 14, 14,
  14, 12, 14, 15, 14, 15, 12, 14, 14, 14, 14, 14, 14, 14, 15, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 12, 14, 14, 14, 15, 13, 15, 15, 14, 12, 14, 13, 14, 14, 15, 14, 14, 14, 14, 14, 13, 14, 15, 14, 13, 15, 15, 14, 14, 14, 14, 12, 14, 14, 14,
  12, 14, 13, 14, 12, 13, 14, 15, 13, 15, 14, 12, 14, 14, 14, 15, 14, 15, 13, 15, 13, 14, 14, 13, 14, 12, 14, 14, 14, 13, 15, 13, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 12, 14, 14, 12, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 13, 13, 14, 14, 14, 13, 14, 14, 12, 14, 14, 14, 13, 14, 12,
  14, 14, 13, 14, 14, 14, 14, 13, 13, 14, 13, 13, 14, 13, 13, 13, 13, 14, 14, 13, 14, 12, 14, 13, 14, 14, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 12, 14, 13, 12, 14, 14, 12, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 12, 14, 14, 13, 13, 12, 14, 12, 14, 13, 13, 13, 13, 14, 13, 14, 13, 13, 13, 14,
  14, 14, 13, 14, 11, 14, 14, 14, 14, 14, 13, 13, 14, 13, 13, 14, 13, 14, 13, 14, 12, 14, 13, 14, 13, 14, 14, 14, 13, 10, 13, 14, 13, 14, 13, 11, 13, 14, 14, 13, 13, 13, 13, 13, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 12, 14, 10, 14, 14, 14, 13, 12, 13, 14, 12, 12, 14, 14, 13, 14, 14, 13, 14, 14,
  14, 13, 14, 14, 14, 13, 14, 14, 13, 13, 14, 14, 13, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 12, 13, 14, 13, 14, 14, 14, 13, 14, 13, 12, 13, 14, 13, 12, 13, 14, 14, 10, 13, 14, 11, 14, 13, 14, 14, 14, 14, 13, 11, 12, 14, 13, 14, 13, 13, 12, 13, 11, 14, 14, 14, 13, 14, 13, 14, 13, 14, 14, 14, 14,
  14, 11, 13, 14, 14, 14, 14, 11, 13, 12, 14, 13, 14, 14, 15, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 12, 13, 13, 13, 14, 13, 12, 14, 14, 13, 11, 12, 14, 14, 13, 14, 14, 14, 14, 13, 14, 12, 14, 13, 14, 12, 14, 14, 13, 14, 14, 12, 14, 14, 14, 14, 13, 14, 14, 13, 13, 13, 14, 13, 14, 14, 14,
  14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 13, 14, 13, 14, 12, 14, 13, 13, 14, 14, 14, 10, 14, 12, 13, 14, 12, 13, 14, 13, 14, 13, 14, 13, 13, 14, 13, 14, 14, 14, 13, 14, 14, 14, 13, 13, 14, 14, 14, 12, 14, 14, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 11, 13, 14, 14, 14, 14,
  14, 14, 12, 13, 14, 12, 14, 12, 14, 14, 14, 14, 13, 14, 14, 8, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 12, 13, 14, 14, 14, 12, 13, 14, 13, 13, 11, 13, 14, 14, 14, 13, 13, 13, 14, 13, 13, 14, 14, 14, 14, 12, 13, 14, 14, 12, 13, 14, 13, 13, 14, 14, 13, 13, 12, 14, 13, 14, 12,
  14, 14, 13, 12, 13, 13, 14, 13, 13, 13, 13, 14, 12, 13, 13, 14, 14, 11, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 12, 13, 14, 13, 13, 14, 12, 13, 12, 14, 13, 13, 12, 13, 13, 13, 13, 14, 14, 14, 14, 14, 13, 13, 12, 13, 13, 13, 14, 13, 14, 14, 14, 14, 12, 14, 14,
  13, 14, 14, 13, 13, 13, 12, 13, 13, 14, 14, 14, 14, 14, 13, 14, 14, 13, 12, 14, 13, 13, 13, 11, 13, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 13, 13, 13, 13, 14, 14, 14, 12, 13, 13, 13, 13, 13, 14, 14, 14, 11, 11, 13, 13, 12, 13, 13, 11, 14,
  14, 13, 15, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 13, 14, 12, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 13, 13, 14, 13, 14, 14, 14, 14, 13, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14,
  14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 12, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 12, 14, 14, 13, 14, 14, 14, 14, 15, 10, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 13, 14, 12, 14, 14, 14, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 12, 13, 13, 13, 14, 12, 14, 13, 13, 14, 14, 13, 13, 13, 13, 14, 12, 14, 14, 13, 11, 14, 13, 12, 13, 12, 13, 13, 13, 14, 14, 13, 12, 13, 14, 13, 13, 13, 14, 13, 11, 13, 13, 12, 14, 10, 13, 11, 10, 11, 11, 10, 11, 11, 9, 12, 11, 10,
  11, 8, 11, 11, 10, 11, 11, 11, 10, 10, 11, 11, 10, 11, 10, 11, 11, 10, 11, 10, 11, 11, 11, 8, 11, 11, 11, 10, 11, 11, 12, 11, 14, 10, 11, 11, 11, 11, 11, 11, 11, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 9, 11, 11, 10, 10, 11, 11,
  11, 11, 11, 10, 11, 11, 11, 11, 11, 10, 11, 11, 11, 10, 11, 15, 15, 15, 13, 15, 15, 15, 14, 12, 15, 13, 14, 14, 14, 14, 15, 14, 14, 14, 15, 14, 13, 15, 15, 15, 15, 12, 14, 12, 14, 15, 14, 14, 16, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 14, 15, 14, 15, 16, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14,
  15, 14, 14, 14, 13, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 15, 15, 15, 14, 14, 14, 15, 14, 14, 14, 13, 14, 13, 14, 12, 14, 14, 14, 15, 13, 13, 14, 13, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 13, 15, 12,
  15, 14, 16, 14, 15, 15, 15, 15, 14, 11, 14, 14, 15, 14, 15, 15, 14, 13, 14, 13, 14, 15, 15, 13, 14, 14, 14, 14, 14, 12, 15, 15, 13, 15, 14, 15, 15, 15, 15, 14, 14, 12, 14, 13, 15, 12, 15, 15, 15, 15, 12, 14, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 11, 14, 13, 15, 15, 15, 14,
  11, 15, 13, 15, 15, 14, 14, 14, 15, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 14, 14, 12, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 12, 14, 14, 13, 14, 13, 14, 14, 15, 13, 14, 15, 14, 11, 15, 13, 14, 14, 12, 14, 13, 13, 14, 14, 13, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13,
  14, 14, 14, 14, 11, 14, 12, 14, 14, 14, 13, 14, 14, 12, 14, 13, 14, 14, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 14, 14, 14, 15, 14, 14, 15, 14, 14, 12, 14, 14, 13, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 13, 15, 15, 14, 13, 15, 14, 13, 15, 15, 15, 14, 14, 15, 15, 15, 15, 13, 14,
  13, 14, 14, 15, 15, 14, 13, 14, 13, 15, 15, 15, 15, 15, 15, 14, 11, 14, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 14, 14, 13, 14, 14, 12, 15, 14, 12, 14, 13, 14, 14, 14, 14, 14, 14, 12, 14, 13, 15, 15, 15, 15, 15, 15, 12, 15, 14, 12, 15, 13, 14, 13, 15, 13, 13, 14, 13, 15, 13, 15, 15, 14, 14, 15,
  15, 12, 15, 14, 15, 15, 15, 14, 12, 14, 13, 12, 14, 14, 14, 14, 12, 14, 14, 13, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 13, 13, 12, 14, 12, 14, 12, 14, 14, 12, 14, 14, 13, 14, 12, 14, 12, 14, 15, 15, 14, 13, 13, 15, 15, 14, 15, 15, 15, 15, 14, 14, 14, 15, 13, 14, 14, 13, 14, 14, 14, 15, 15,
  13, 14, 14, 14, 14, 13, 13, 15, 12, 14, 14, 15, 15, 15, 13, 15, 13, 14, 15, 15, 15, 15, 15, 14, 13, 14, 13, 14, 13, 11, 14, 14, 13, 14, 14, 14, 14, 12, 14, 14, 14, 12, 15, 14, 15, 12, 14, 15, 11, 14, 14, 14, 15, 13, 14, 12, 14, 14, 14, 14, 15, 12, 14, 13, 14, 14, 14, 14, 14, 13, 13, 15, 13, 14,
  14, 14, 13, 14, 14, 12, 13, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 12, 14, 14, 14, 15, 12, 14, 14, 12, 14, 13, 15, 14, 14, 14, 11, 14, 14, 13, 14, 14, 13, 13, 14, 13, 14, 14, 14, 14, 13, 13, 12, 12, 14, 14, 13, 14, 15, 14, 14, 14, 14, 15, 13, 14, 14, 14, 14, 14, 14, 14, 15,
  14, 12, 13, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 10, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 13, 14, 14, 14, 12, 13, 14, 14, 12, 14, 15,
  12, 15, 14, 15, 13, 15, 14, 15, 14, 13, 14, 14, 12, 14, 14, 13, 13, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 15, 14, 14, 14, 13, 13, 12, 12, 14, 14, 11, 14, 14, 13, 14, 14, 15, 13, 13, 14, 15, 15, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 11, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 13,
  14, 14, 14, 14, 14, 14, 15, 15, 14, 13, 15, 14, 15, 14, 13, 14, 12, 14, 14, 13, 14, 14, 15, 14, 13, 14, 14, 14, 13, 12, 13, 13, 14, 13, 14, 13, 14, 13, 15, 15, 15, 15, 13, 14, 13, 14, 14, 15, 15, 14, 15, 15, 13, 15, 13, 14, 14, 14, 12, 15, 13, 13, 14, 11, 13, 14, 14, 15, 14, 14, 14, 14, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 14, 15, 15, 13, 15, 14, 15, 14, 14, 14, 11, 12, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 12, 13, 14, 13, 14, 14, 15, 14, 14, 14, 13, 14, 15, 15, 14, 14, 14, 14, 15, 15, 14, 13, 14, 13, 14, 13, 14, 14, 13, 13, 14, 14, 13,
  14, 14, 14, 14, 14, 14, 15, 13, 14, 12, 14, 13, 15, 14, 13, 14, 14, 14, 15, 14, 14, 14, 12, 14, 13, 14, 13, 14, 12, 14, 15, 14, 14, 14, 10, 15, 14, 8, 15, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 13, 13, 14, 14, 15, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 13, 15, 14, 14, 14, 13, 14, 13, 14,
  15, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 12, 14, 13, 12, 12, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 13, 14, 13, 13, 13, 14, 14, 14, 12, 14, 14, 13, 14, 14, 13, 14, 13, 13, 14, 14, 12, 14, 12, 13, 13, 13, 14, 14, 13, 11, 13, 13, 14, 13, 11, 13, 14, 13, 13, 13, 12, 13, 14, 14,
  13, 14, 14, 13, 14, 14, 15, 14, 14, 13, 14, 13, 12, 14, 14, 14, 13, 14, 14, 14, 12, 14, 13, 14, 13, 13, 13, 14, 13, 14, 14, 13, 13, 14, 11, 13, 12, 14, 13, 13, 14, 14, 14, 13, 12, 13, 14, 13, 14, 13, 13, 14, 13, 14, 13, 14, 12, 14, 14, 14, 13, 13, 14, 13, 13, 14, 14, 12, 14, 11, 9, 14, 14, 13, 12,
  14, 13, 15, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 12, 11, 14, 14, 14, 13, 13, 13, 14, 14, 13, 14, 14, 14, 13, 14, 14, 12, 14, 14, 14, 12, 14, 14, 14, 13, 13, 14, 14, 12, 13, 13, 13, 13, 13, 12, 13, 13, 14, 13, 12, 13, 13, 13, 14, 14, 13, 14, 13, 13, 13, 14, 11,
  14, 13, 12, 12, 13, 11, 12, 14, 13, 13, 13, 13, 13, 11, 13, 14, 13, 14, 13, 11, 14, 14, 14, 12, 13, 14, 13, 14, 14, 13, 13, 14, 12, 14, 14, 13, 14, 13, 14, 13, 13, 12, 14, 12, 13, 13, 13, 14, 14, 14, 11, 14, 14, 14, 13, 14, 12, 14, 14, 12, 13, 11, 14, 14, 12, 13, 14, 14, 12, 14, 14, 12, 13, 13,
  14, 13, 14, 12, 14, 14, 12, 14, 13, 13, 14, 12, 10, 13, 12, 12, 14, 13, 14, 13, 14, 14, 14, 13, 13, 13, 13, 14, 14, 13, 13, 14, 13, 14, 14, 13, 13, 14, 11, 12, 13, 14, 13, 13, 13, 14, 13, 13, 13, 14, 13, 14, 13, 14, 12, 13, 13, 14, 14, 14, 14, 13, 13, 13, 13, 14, 14, 13, 13, 14, 14, 14, 14, 13,
  13, 13, 14, 14, 14, 12, 13, 14, 13, 14, 12, 13, 14, 13, 14, 14, 14, 14, 14, 12, 14, 13, 14, 14, 13, 13, 11, 14, 13, 13, 12, 13, 14, 14, 14, 14, 13, 13, 14, 14, 12, 13, 14, 14, 13, 14, 14, 14, 14, 14, 12, 13, 13, 14, 13, 14, 13, 14, 14, 14, 14, 11, 12, 13, 13, 12, 13, 12, 12, 13, 13, 13, 12, 13,
  14, 13, 13, 14, 13, 14, 14, 14, 12, 14, 14, 14, 14, 12, 14, 13, 14, 13, 13, 13, 13, 13, 13, 11, 14, 14, 12, 14, 14, 10, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 10, 13, 13, 14, 14, 12, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 12, 14, 13, 12, 14, 14, 14,
  14, 14, 14, 14, 14, 12, 13, 14, 13, 14, 14, 13, 14, 12, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 12, 14, 13, 14, 14, 11, 14, 14, 14, 13, 14, 14, 14, 13, 14, 12, 14, 14, 12, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 13, 14, 13,
  13, 13, 14, 13, 14, 14, 12, 14, 14, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 12, 14, 14, 12, 8, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 12, 14, 14, 14, 13, 13, 11, 14,
  13, 12, 12, 14, 14, 13, 13, 12, 13, 13, 13, 13, 13, 12, 14, 13, 13, 13, 13, 14, 14, 13, 13, 13, 13, 12, 14, 13, 14, 14, 13, 14, 13, 14, 13, 13, 14, 13, 13, 13, 13, 14, 13, 13, 13, 12, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 12, 11, 11, 11, 11, 11, 11, 11, 11, 12, 11, 12, 11, 11,
  11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 9, 11, 11, 11, 11, 10, 11, 11, 11, 11, 12, 10, 11, 11, 11, 10, 11, 11, 11, 11, 10, 11, 10, 11, 10, 10, 11, 10, 10, 11, 10, 11, 11, 10, 11, 11, 10, 11, 11, 10, 11, 11, 10, 11, 11, 11, 10, 11, 10, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 10,
  10, 11, 11, 8, 11, 11, 11, 15, 15, 14, 13, 13, 14, 15, 15, 13, 15, 15, 15, 15, 15, 14, 14, 13, 13, 14, 15, 15, 13, 14, 15, 15, 14, 14, 12, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 12, 13, 15, 14, 15, 14, 15, 12, 14, 15, 13, 14, 15, 15, 14, 12, 15, 13, 15, 15, 13, 14, 14, 14, 14,
  14, 13, 14, 15, 15, 15, 15, 14, 13, 14, 14, 14, 14, 14, 14, 12, 14, 15, 14, 15, 14, 13, 14, 14, 15, 13, 15, 12, 14, 13, 14, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 15, 15, 15, 15, 14, 14, 13, 15, 15, 13, 14, 14, 15, 15, 14, 15, 14, 14, 15, 15, 15, 14, 13, 15, 15, 14, 15,
  15, 14, 15, 15, 15, 14, 14, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 13, 15, 13, 14, 14, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 13, 14, 14, 14, 14, 14, 12, 14, 13, 14, 14, 13, 14, 14, 14, 15, 14, 14, 14, 12, 14,
  14, 13, 14, 14, 15, 14, 15, 15, 15, 15, 15, 13, 14, 14, 15, 12, 14, 15, 14, 13, 14, 15, 15, 15, 15, 15, 14, 14, 15, 15, 14, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 14, 15, 15, 13, 14, 14, 14, 13, 13, 15, 13, 15, 12, 14, 14, 15, 13, 14, 14, 13, 15, 14, 15, 14, 14, 14, 14, 14, 13, 13, 14, 15, 15, 8,
  14, 13, 15, 14, 14, 14, 14, 15, 15, 13, 15, 15, 14, 13, 14, 15, 14, 13, 14, 15, 15, 15, 14, 15, 15, 14, 14, 15, 13, 14, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 13, 14, 13, 15, 13, 15, 15, 15, 15, 15, 15, 15, 14, 13, 14, 14, 15, 13, 15, 12, 15, 15, 13, 14,
  13, 15, 14, 15, 15, 13, 14, 12, 14, 14, 14, 15, 14, 13, 14, 15, 14, 15, 15, 15, 12, 14, 14, 14, 14, 14, 14, 11, 14, 15, 14, 15, 14, 14, 14, 12, 14, 13, 15, 14, 13, 14, 14, 13, 14, 14, 14, 14, 12, 14, 14, 11, 14, 13, 13, 14, 12, 14, 14, 13, 14, 14, 14, 13, 14, 14, 15, 14, 14, 14, 14, 14, 15, 14,
  13, 14, 13, 14, 13, 15, 15, 15, 13, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 15, 13, 14, 13, 15, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 14, 14, 13, 14, 13, 15, 15, 15, 15, 15, 12, 14, 15, 15, 14, 13, 14, 14, 15,
  12, 15, 15, 14, 14, 12, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 15, 14, 15, 15, 15, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 14, 14, 13, 15, 15, 14, 13, 14, 14, 14, 13, 14, 14, 13, 15, 14, 13, 15, 14, 13, 15, 14, 15, 14, 13, 14, 14, 13, 14,
  14, 13, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 15, 15, 13, 15, 14, 14, 15, 15, 12, 14, 14, 11, 14, 14, 14, 15, 12, 15, 15, 14, 14, 15, 14, 14, 14, 14, 14, 13, 15, 15, 13, 14, 14, 14, 14, 14, 13, 13, 12, 14, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 15, 15, 14, 14, 14, 14, 14, 13, 14, 15, 14, 15,
  15, 15, 15, 15, 14, 14, 15, 14, 15, 13, 14, 13, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 13, 12, 14, 15, 14, 13, 14, 13, 12, 12, 14, 14, 14, 14, 12, 14, 14, 15, 14, 14, 15, 15, 13, 14, 14, 13, 14, 13, 14, 13, 12, 14, 14, 14, 14, 14, 12, 14, 12, 13, 14, 12, 14, 14, 14, 11, 14, 14, 13, 14, 14,
  13, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 12, 14, 15, 14, 14, 13, 13, 14, 14, 11, 13, 12, 14, 13, 12, 14, 13, 14, 13, 14, 14, 13, 13, 14, 13, 14, 12, 14, 14, 13, 14, 10, 14, 14, 14, 14, 13, 14, 14, 14, 15, 14, 13, 14, 14, 14, 14, 13, 14, 13, 14, 13, 14, 12, 14, 13, 14, 14, 13, 15,
  15, 14, 14, 14, 14, 13, 15, 15, 12, 15, 15, 14, 15, 14, 14, 13, 14, 14, 14, 14, 13, 13, 12, 14, 13, 13, 14, 14, 12, 14, 11, 14, 14, 14, 14, 14, 12, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 13, 14, 14, 13, 14, 14, 14, 13, 12, 13, 14, 14, 10, 14, 14, 15, 14, 12, 14, 14, 15,
  13, 14, 13, 13, 14, 14, 15, 15, 15, 14, 12, 14, 15, 13, 13, 14, 14, 13, 14, 14, 14, 13, 14, 11, 14, 13, 13, 15, 13, 13, 13, 15, 14, 15, 14, 13, 15, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 11, 15, 14, 14, 15, 12, 14, 14, 15, 15, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14,
  14, 13, 14, 12, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 13, 11, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 13, 15, 14, 13, 14, 14, 13, 14, 12, 14, 13, 14, 13, 14, 12, 14, 13, 13, 14, 14, 14, 15, 15, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14,
  14, 13, 14, 14, 14, 14, 15, 14, 13, 12, 14, 14, 14, 14, 14, 13, 12, 14, 14, 11, 14, 14, 14, 13, 14, 13, 12, 14, 13, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 13, 12, 14, 13, 14, 14, 13, 14, 13, 13, 14, 12, 14, 13, 13, 14, 13, 14, 14, 14, 13, 14, 13, 12, 13,
  14, 14, 13, 13, 14, 14, 13, 13, 12, 11, 12, 14, 14, 13, 14, 13, 14, 13, 14, 14, 14, 13, 13, 13, 12, 13, 13, 14, 13, 12, 12, 14, 13, 11, 14, 14, 13, 13, 14, 14, 13, 13, 14, 13, 13, 13, 14, 14, 12, 14, 13, 14, 12, 13, 13, 13, 14, 14, 13, 13, 13, 13, 13, 14, 14, 13, 13, 13, 14, 13, 12, 14, 13, 14,
  13, 14, 12, 14, 13, 14, 14, 13, 13, 14, 13, 12, 12, 14, 12, 12, 14, 13, 13, 14, 14, 14, 13, 14, 14, 13, 13, 13, 13, 13, 14, 12, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 12, 13, 13, 13, 13, 14, 14, 13, 14, 14, 12, 11, 14, 14, 14, 14, 14, 14, 14, 14, 14, 11, 13, 14, 13, 13, 14, 12, 13, 14, 12,
  13, 13, 14, 14, 13, 13, 14, 14, 13, 14, 13, 12, 13, 14, 14, 13, 14, 13, 13, 14, 13, 14, 14, 14, 13, 14, 13, 13, 14, 14, 13, 12, 13, 13, 14, 13, 14, 13, 14, 13, 12, 13, 14, 14, 14, 14, 14, 13, 13, 14, 14, 13, 14, 14, 12, 13, 13, 14, 11, 13, 12, 14, 11, 14, 13, 14, 14, 13, 13, 14, 13, 14, 13, 14,
  13, 14, 14, 13, 14, 14, 13, 14, 12, 14, 13, 11, 13, 14, 13, 13, 13, 14, 14, 13, 14, 13, 13, 12, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 12, 13, 13, 13, 13, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 15, 14, 14, 14, 14, 10, 14, 14, 11, 13, 14, 14, 14, 13, 14, 12, 14, 13, 14, 14, 15, 14, 14, 14,
  13, 14, 13, 14, 14, 12, 12, 12, 14, 12, 13, 12, 12, 14, 13, 13, 13, 14, 14, 13, 14, 13, 13, 13, 13, 14, 12, 12, 13, 14, 13, 13, 14, 13, 14, 13, 13, 14, 11, 14, 13, 11, 13, 13, 14, 14, 14, 14, 14, 14, 12, 13, 13, 14, 13, 14, 13, 14, 14, 14, 12, 13, 14, 14, 13, 13, 13, 12, 13, 14, 14, 10, 14, 13,
  13, 13, 14, 13, 14, 14, 14, 13, 13, 13, 13, 14, 13, 12, 13, 13, 14, 14, 12, 13, 13, 13, 12, 13, 14, 13, 13, 12, 13, 12, 13, 14, 14, 14, 14, 14, 14, 14, 11, 13, 13, 13, 14, 13, 13, 10, 12, 14, 14, 14, 13, 14, 13, 13, 13, 10, 13, 13, 14, 14, 14, 14, 14, 12, 13, 13, 11, 14, 13, 12, 13, 13, 13, 14,
  13, 13, 14, 14, 14, 13, 8, 13, 13, 13, 13, 14, 12, 14, 14, 14, 13, 13, 13, 13, 14, 13, 14, 14, 14, 13, 14, 13, 14, 13, 14, 12, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 13, 14, 14, 13, 13, 13, 14, 13, 14, 14, 12, 13, 11, 13, 13, 13, 14, 13, 13, 13, 11, 11, 10, 13, 13, 14, 13, 13, 14, 14, 14, 13, 14,
  14, 14, 14, 14, 13, 14, 14, 12, 14, 12, 14, 14, 14, 14, 13, 13, 14, 13, 13, 12, 13, 12, 13, 14, 14, 14, 14, 13, 13, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 12, 13, 14, 14, 14, 13, 15, 13, 14, 12, 11, 14, 13, 13, 14, 14, 11, 14, 13, 14, 14, 14, 14, 13, 14, 12, 13, 14, 13, 13, 13, 11, 13, 12, 11,
  11, 11, 11, 10, 10, 11, 11, 11, 10, 10, 11, 10, 11, 10, 11, 11, 11, 12, 9, 9, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, 10, 9, 10, 11, 12, 11, 11, 11, 11, 11, 10, 11, 11, 11, 12, 11, 11, 12, 11, 10, 11, 11, 10, 11, 11, 10, 11, 11, 11, 10, 11, 11, 11, 11, 11, 10, 11, 9, 11, 11, 10, 11, 11,
  11, 11, 9, 11, 11, 11, 11, 11, 10, 10, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 10, 11, 11, 11, 11, 10, 11, 11, 10, 11, 11, 11, 11, 11, 11, 10, 11, 14, 15, 14, 15, 14, 14, 15, 14, 15, 15, 15, 14, 12, 14, 15, 15, 15, 13, 13, 12, 14, 14, 13, 14, 13, 14, 14, 12, 15, 14, 14, 14, 14, 15, 13, 14,
  14, 15, 13, 14, 15, 14, 15, 14, 15, 15, 15, 13, 14, 14, 15, 15, 14, 14, 14, 14, 14, 14, 14, 13, 13, 14, 14, 15, 14, 12, 14, 12, 15, 14, 13, 15, 14, 12, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 8, 14, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 13, 14, 13, 14, 14, 15, 15, 14,
  14, 15, 13, 14, 14, 12, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 14, 13, 15, 14, 15, 13, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 13, 13, 13, 14, 14, 14, 15, 15, 15, 14, 15, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 13, 13, 14, 14, 13, 14, 15, 13, 15, 14, 14, 14, 14, 14, 14,
  14, 14, 14, 15, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 13, 12, 14, 14, 15, 14, 13, 14, 14, 14, 12, 15, 14, 14, 14, 13, 14, 14, 14, 13, 14, 15, 15, 14, 15, 15, 14, 15, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 13, 15, 15, 15, 15, 15,
  15, 14, 15, 14, 14, 13, 14, 12, 13, 14, 14, 13, 14, 14, 14, 12, 14, 14, 13, 14, 13, 15, 14, 13, 14, 15, 15, 13, 14, 13, 15, 13, 15, 14, 15, 15, 15, 14, 14, 13, 14, 14, 14, 13, 14, 14, 15, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 15, 15, 14, 14, 15, 12, 15, 15, 12, 15, 13, 14, 14, 14,
  15, 12, 14, 14, 13, 14, 14, 14, 13, 15, 13, 14, 14, 13, 14, 14, 13, 14, 12, 15, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 11, 14, 13, 14, 14, 12, 12, 13, 14, 14, 14, 14, 15, 13, 14, 14, 14, 14, 14, 12, 14, 14, 9, 15, 14, 14, 14, 15, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14,
  14, 14, 13, 14, 13, 14, 14, 14, 14, 13, 13, 14, 14, 14, 14, 15, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 13, 15, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 12, 14, 14, 14, 12,
  14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 12, 13, 14, 14, 13, 14, 14, 13, 14, 15, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 15, 13, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 12, 14, 12, 15, 14, 14, 12, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 11,
  13, 13, 14, 13, 13, 14, 11, 13, 13, 13, 14, 14, 14, 14, 14, 13, 13, 13, 14, 13, 14, 14, 13, 14, 14, 14, 13, 14, 13, 14, 14, 12, 14, 12, 14, 13, 14, 14, 13, 14, 14, 14, 14, 15, 14, 14, 13, 12, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 15, 12, 13, 14, 14, 14, 12, 13, 13, 14, 14, 15, 13, 14, 14, 14,
  14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 15, 15, 14, 14, 13, 14, 14, 14, 14, 13, 14, 13, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 15, 13, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 12, 14, 14, 14, 14, 13, 14, 14,
  12, 14, 14, 14, 15, 15, 14, 14, 14, 14, 14, 14, 15, 15, 15, 14, 12, 14, 13, 14, 15, 13, 12, 14, 10, 14, 14, 13, 13, 13, 14, 14, 14, 13, 14, 14, 15, 15, 12, 15, 13, 15, 12, 14, 14, 14, 14, 13, 15, 14, 14, 14, 13, 13, 14, 14, 14, 13, 12, 13, 11, 13, 14, 13, 12, 14, 13, 14, 14, 13, 13, 13, 12, 10,
  13, 14, 13, 13, 13, 14, 13, 13, 11, 14, 13, 12, 13, 13, 14, 12, 13, 14, 13, 13, 13, 14, 13, 13, 12, 14, 14, 13, 14, 13, 12, 14, 14, 14, 13, 14, 13, 13, 12, 13, 11, 14, 14, 14, 13, 13, 12, 13, 13, 12, 14, 13, 13, 14, 14, 12, 13, 14, 13, 11, 14, 13, 12, 11, 13, 13, 12, 13, 13, 12, 13, 12, 14, 14,
  13, 14, 14, 13, 13, 12, 14, 13, 14, 12, 12, 13, 13, 14, 13, 14, 14, 14, 12, 13, 14, 13, 14, 14, 12, 14, 14, 13, 13, 14, 12, 14, 13, 14, 12, 14, 14, 14, 13, 13, 14, 12, 13, 12, 14, 13, 13, 11, 13, 12, 13, 13, 13, 13, 13, 14, 14, 13, 14, 14, 14, 10, 14, 14, 11, 13, 13, 14, 13, 13, 13, 12, 13, 13,
  12, 13, 14, 13, 14, 13, 13, 13, 13, 14, 13, 13, 13, 13, 14, 14, 13, 12, 13, 12, 13, 14, 13, 14, 13, 14, 13, 14, 13, 12, 13, 13, 13, 13, 13, 14, 11, 14, 14, 12, 13, 14, 14, 13, 13, 12, 14, 13, 12, 14, 14, 12, 11, 11, 11, 14, 14, 13, 13, 12, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 11, 13,
  13, 13, 13, 12, 13, 14, 14, 14, 13, 13, 13, 14, 13, 13, 13, 11, 14, 12, 14, 13, 13, 14, 14, 11, 14, 13, 13, 13, 14, 13, 14, 14, 11, 14, 14, 14, 14, 13, 14, 11, 13, 13, 13, 11, 13, 13, 10, 13, 13, 13, 14, 13, 14, 13, 14, 13, 13, 13, 13, 11, 13, 14, 14, 13, 14, 13, 13, 13, 14, 14, 14, 14, 13, 14,
  14, 13, 13, 13, 12, 14, 14, 12, 14, 14, 10, 14, 14, 12, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 13, 12, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 11, 13, 14, 14, 12, 14, 14, 13, 14, 14, 14, 14, 12, 13, 14, 13, 13, 13, 13, 13, 13, 13, 14, 13, 13, 13, 14, 14, 13, 14, 13, 13, 13, 12, 13, 13, 13, 13,
  12, 13, 13, 13, 13, 13, 14, 13, 14, 12, 12, 13, 13, 14, 13, 13, 13, 13, 13, 13, 13, 14, 13, 13, 14, 12, 14, 13, 11, 13, 13, 14, 14, 13, 13, 13, 13, 14, 13, 13, 8, 13, 13, 13, 13, 13, 13, 13, 14, 13, 13, 13, 11, 13, 12, 13, 11, 14, 14, 12, 13, 12, 12, 14, 13, 14, 14, 14, 12, 13, 14, 14, 14, 13, 14,
  14, 14, 12, 14, 14, 14, 14, 13, 12, 13, 12, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 11, 12, 13, 13, 13, 14, 14, 13, 14, 13, 13, 14, 13, 14, 13, 14, 13, 11, 13, 13, 13, 11, 14, 13, 11, 12, 13, 13, 10, 13, 13, 14, 14, 14, 14, 12, 13, 14, 12, 13, 13, 14, 13, 13, 13, 10, 14, 14,
  14, 14, 14, 14, 13, 13, 14, 14, 14, 14, 14, 13, 14, 13, 13, 13, 14, 14, 11, 13, 14, 14, 14, 14, 14, 14, 13, 12, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 9, 14, 15, 13, 14, 14, 12, 14, 13, 13, 13, 13, 13, 13, 11, 12, 11, 11, 10, 11, 10, 11, 11, 11, 10, 11, 12, 11, 11, 10, 11, 10, 11, 10, 11, 11, 11,
  12, 11, 11, 11, 12, 11, 11, 11, 10, 11, 9, 10, 10, 12, 11, 12, 10, 11, 12, 11, 11, 11, 11, 10, 11, 12, 10, 11, 11, 8, 11, 10, 12, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 10, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 9, 11, 11, 11, 10, 11, 11, 11, 11, 10, 11, 11,
  11, 11, 10, 11, 11, 11, 11, 11, 15, 11, 11, 10, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 10, 11, 11, 9, 15, 15, 13, 15, 14, 14, 15, 15, 14, 15, 15, 15, 15, 15, 13, 13, 13, 15, 12, 13, 14, 15, 14, 14, 15, 14, 11, 14, 15, 14, 14, 11, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 15, 15, 14, 14, 14, 13,
  14, 14, 13, 15, 13, 13, 14, 15, 13, 15, 14, 15, 15, 15, 14, 13, 15, 14, 15, 11, 14, 15, 15, 15, 15, 13, 15, 15, 14, 14, 13, 14, 13, 15, 14, 13, 15, 15, 14, 14, 14, 13, 14, 13, 15, 14, 15, 13, 14, 13, 15, 15, 15, 15, 15, 14, 14, 14, 15, 13, 15, 15, 14, 15, 15, 15, 14, 15, 12, 14, 14, 15, 13, 14,
  10, 14, 12, 15, 13, 14, 14, 15, 11, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 12, 14, 12, 14, 14, 14, 15, 13, 14, 14, 14, 14, 15, 14, 14, 14, 15, 14, 15, 14, 11, 14, 11, 14, 15, 12, 13, 14, 12, 14, 13, 14, 15, 14, 14, 14, 13, 14, 15, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 15, 13, 14, 14,
  14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 14, 14, 13, 15, 15, 15, 15, 15, 14, 15, 15, 14, 14, 14, 13, 15, 15, 15, 15, 15, 14, 11, 14, 14, 14, 14, 14, 15, 14, 14, 14, 15, 14, 14, 14, 14, 14, 15, 15, 15, 13, 14, 15, 14, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 15, 10,
  15, 13, 14, 14, 13, 14, 15, 15, 14, 15, 14, 15, 14, 14, 14, 14, 11, 14, 14, 14, 13, 12, 14, 14, 14, 14, 12, 14, 14, 14, 13, 13, 13, 14, 13, 14, 14, 14, 14, 14, 14, 11, 14, 14, 12, 13, 14, 14, 14, 13, 14, 14, 13, 13, 14, 14, 14, 14, 12, 14, 14, 13, 11, 13, 14, 15, 14, 15, 13, 14, 13, 13, 13, 14,
  13, 14, 14, 13, 13, 14, 13, 13, 14, 14, 14, 13, 14, 14, 15, 13, 12, 14, 14, 14, 13, 14, 14, 15, 15, 14, 14, 13, 13, 14, 14, 14, 13, 11, 15, 14, 14, 14, 14, 15, 13, 15, 12, 14, 15, 15, 13, 14, 14, 14, 13, 14, 13, 14, 15, 15, 14, 14, 14, 14, 14, 11, 14, 14, 14, 14, 13, 14, 12, 13, 15, 12, 14, 14,
  14, 14, 13, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 14, 12, 14, 13, 14, 14, 15, 12, 13, 13, 14, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 12, 13, 12, 13, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 13, 14, 14, 13, 13, 14, 12, 13, 14, 14, 14, 14, 12, 14, 14, 15,
  14, 13, 14, 15, 14, 12, 14, 14, 13, 14, 12, 14, 12, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 12, 14, 14, 14, 13, 13, 13, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 12, 14, 13, 14, 14, 12, 14, 14, 14, 14, 14, 12, 13, 13, 14, 14, 14, 13, 14, 13, 12, 13, 14, 12, 12,
  14, 14, 13, 13, 14, 14, 12, 13, 12, 14, 12, 14, 14, 12, 13, 12, 13, 14, 13, 15, 13, 14, 13, 14, 14, 13, 12, 14, 14, 13, 14, 13, 15, 11, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 14, 11, 12, 14, 14, 12, 14, 13, 14, 14, 13, 13, 13, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 13, 13, 13, 13,
  14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 13, 12, 14, 14, 13, 14, 13, 14, 14, 14, 12, 14, 13, 14, 14, 14, 13, 12, 13, 14, 14, 13, 14, 14, 14, 15, 13, 14, 12, 14, 14, 14, 14, 14, 14, 15, 13, 14, 14, 13, 14, 14, 14, 12, 14, 13, 12, 13, 13, 13, 13, 13, 14, 12, 14, 13,
  14, 14, 13, 14, 12, 14, 12, 14, 14, 14, 12, 14, 14, 13, 13, 14, 14, 13, 12, 14, 13, 13, 14, 13, 13, 14, 13, 13, 11, 13, 13, 13, 13, 12, 13, 13, 14, 14, 14, 13, 14, 12, 13, 13, 13, 14, 12, 13, 12, 14, 14, 13, 14, 14, 13, 13, 13, 13, 14, 13, 13, 13, 13, 14, 13, 14, 13, 12, 14, 13, 14, 12, 13, 14,
  14, 13, 10, 12, 13, 13, 13, 11, 13, 14, 12, 13, 13, 14, 13, 12, 13, 14, 13, 13, 14, 14, 14, 14, 14, 12, 13, 14, 14, 12, 11, 13, 14, 13, 14, 14, 13, 14, 14, 14, 13, 13, 14, 13, 14, 13, 14, 13, 13, 13, 13, 14, 14, 12, 13, 14, 13, 13, 13, 10, 13, 13, 12, 13, 13, 11, 14, 13, 13, 14, 13, 12, 13, 13,
  14, 13, 12, 13, 13, 14, 13, 13, 12, 11, 14, 12, 14, 12, 14, 14, 12, 14, 12, 14, 12, 13, 13, 13, 13, 14, 13, 14, 13, 14, 12, 14, 14, 11, 13, 13, 13, 13, 12, 13, 11, 14, 13, 13, 13, 13, 12, 13, 13, 14, 12, 13, 13, 13, 13, 13, 14, 14, 13, 14, 13, 14, 14, 12, 13, 12, 13, 13, 13, 13, 14, 10, 13, 12,
  12, 14, 14, 14, 12, 13, 13, 13, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 13, 13, 13, 13, 13, 13, 12, 13, 13, 12, 13, 12, 13, 13, 12, 13, 12, 14, 14, 13, 13, 12, 13, 13, 12, 14, 14, 13, 14, 12, 13, 11, 14, 14, 13, 13, 12, 14, 13, 12, 14, 14, 13, 14, 13, 14, 12, 13, 14, 13, 13, 13, 12, 14, 13,
  12, 14, 13, 13, 11, 13, 12, 14, 13, 14, 14, 11, 13, 13, 14, 14, 13, 14, 13, 14, 14, 14, 14, 12, 14, 13, 14, 13, 14, 14, 14, 14, 14, 11, 14, 14, 14, 14, 13, 12, 13, 14, 14, 13, 13, 13, 12, 14, 14, 13, 14, 12, 14, 12, 13, 13, 13, 14, 14, 12, 13, 14, 14, 14, 13, 11, 13, 12, 13, 13, 14, 13, 14, 12,
  13, 11, 10, 14, 13, 13, 12, 13, 14, 13, 12, 13, 12, 13, 10, 12, 13, 13, 12, 13, 13, 13, 11, 13, 12, 13, 14, 11, 14, 14, 13, 12, 13, 13, 11, 13, 13, 13, 13, 13, 13, 14, 14, 13, 13, 13, 14, 12, 13, 14, 12, 13, 13, 13, 13, 13, 13, 10, 13, 14, 13, 13, 14, 13, 13, 13, 13, 13, 12, 13, 14, 14, 14, 13,
  14, 14, 13, 14, 11, 14, 14, 10, 13, 13, 13, 13, 13, 11, 13, 12, 13, 14, 13, 13, 14, 12, 14, 14, 13, 14, 14, 8, 13, 13, 12, 14, 13, 13, 14, 14, 12, 14, 13, 13, 14, 14, 13, 12, 14, 14, 13, 13, 13, 14, 14, 13, 13, 13, 14, 12, 14, 14, 13, 12, 14, 13, 12, 13, 13, 13, 14, 14, 13, 13, 13, 14, 14, 12, 13,
  13, 14, 12, 13, 13, 13, 14, 13, 13, 12, 13, 13, 12, 14, 14, 13, 13, 14, 14, 13, 12, 13, 14, 14, 13, 13, 13, 12, 13, 13, 13, 12, 13, 13, 13, 14, 13, 14, 14, 13, 14, 14, 14, 14, 11, 12, 14, 14, 14, 12, 14, 13, 14, 13, 14, 14, 13, 12, 13, 13, 12, 11, 10, 8, 12, 11, 11, 12, 11, 11, 11, 10, 11, 12, 11,
  10, 11, 12, 11, 11, 11, 11, 11, 11, 11, 12, 10, 11, 11, 11, 11, 12, 12, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 10, 11, 12, 11, 11, 12, 12, 11, 10, 11, 12, 12, 11, 11, 12, 11, 10, 11, 10, 11, 10, 11, 11, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 10, 11, 11, 11, 11, 15, 11,
  11, 10, 11, 9, 11, 10, 11, 11, 11, 11, 10, 11, 10, 10, 11, 11, 11, 11, 14, 8, 11, 10, 10, 10, 11, 10, 11, 11, 11, 10, 11, 11, 10, 11, 10, 11, 11, 11, 11, 11, 14, 12, 15, 14, 13, 14, 15, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 15, 15, 11, 13, 14, 13, 15, 14, 15, 16, 15, 14, 15, 13, 14, 14, 13, 14,
  14, 14, 14, 13, 14, 15, 15, 14, 14, 14, 14, 13, 14, 14, 14, 14, 15, 15, 15, 14, 14, 15, 14, 14, 14, 13, 14, 14, 14, 11, 14, 14, 14, 15, 11, 14, 15, 14, 14, 14, 14, 13, 14, 14, 15, 15, 14, 14, 13, 15, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 12, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 15,
  14, 14, 12, 14, 14, 14, 14, 13, 14, 10, 14, 13, 14, 12, 14, 12, 15, 14, 14, 14, 14, 13, 14, 13, 14, 14, 12, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 12, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 10, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 11, 14, 15, 14, 15, 14,
  14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 14, 14, 14, 14, 14, 14, 15, 12, 14, 15, 15, 15, 14, 14, 15, 15, 15, 14, 15, 15, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 15, 14, 14, 14, 13, 14, 14, 13, 14, 14, 12, 14, 14, 14, 14, 14,
  13, 14, 15, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 11, 14, 13, 15, 12, 11, 13, 15, 14, 14, 14, 14, 12, 14, 15, 14, 15, 14, 14, 14, 15, 12, 15, 14, 14, 15, 14, 14, 14, 15, 14, 15, 14, 13, 14, 14, 13, 14, 14, 14, 14, 15, 14, 14, 13, 15, 15,
  14, 14, 14, 14, 14, 14, 14, 13, 15, 14, 13, 11, 14, 14, 15, 13, 14, 14, 13, 13, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 12, 14, 13, 13, 15, 15, 14, 13, 14, 15, 13, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 12, 13, 14, 14, 14, 14, 14, 14, 13, 15, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14,
  14, 14, 14, 15, 14, 13, 14, 14, 8, 14, 14, 14, 12, 14, 14, 15, 14, 12, 14, 14, 14, 14, 15, 15, 14, 14, 14, 14, 13, 15, 14, 13, 14, 14, 14, 15, 12, 15, 15, 15, 14, 12, 14, 15, 13, 15, 15, 15, 14, 15, 15, 13, 14, 13, 11, 14, 14, 14, 14, 14, 13, 14, 14, 14, 11, 14, 14, 13, 14, 15, 13, 13, 14, 13, 15,
  14, 14, 14, 13, 14, 14, 14, 14, 11, 14, 14, 12, 14, 13, 14, 15, 11, 13, 13, 13, 14, 13, 15, 15, 14, 12, 14, 14, 14, 15, 13, 15, 15, 12, 13, 14, 14, 13, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 13, 13, 14, 14, 14, 12, 13, 14, 12, 15, 14, 14, 14,
  13, 14, 12, 13, 11, 14, 14, 14, 13, 14, 14, 13, 14, 13, 14, 15, 14, 13, 14, 13, 14, 14, 14, 13, 14, 13, 14, 13, 13, 14, 14, 14, 11, 14, 14, 14, 13, 13, 14, 14, 14, 15, 13, 15, 14, 14, 14, 14, 14, 14, 14, 12, 12, 14, 14, 14, 14, 13, 15, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 13, 13, 13, 14, 14,
  14, 14, 13, 13, 14, 14, 12, 13, 14, 13, 14, 14, 14, 14, 13, 14, 14, 13, 13, 13, 13, 13, 12, 14, 14, 13, 14, 14, 14, 12, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 12, 14, 13, 14, 13, 14, 14, 13, 14, 14, 13, 13, 13, 14, 13, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 11, 13, 13, 14, 14, 14, 13, 14,
  13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 13, 14, 14, 14, 14, 12, 12, 14, 14, 14, 13, 13, 14, 12, 14, 13, 14, 14, 14, 14, 14, 14, 12, 13, 13, 14, 13, 13, 13, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 15, 15, 12, 13, 14, 13, 14, 14, 12, 13, 10, 13, 14, 14, 14, 13, 14, 14, 14, 13, 13, 14, 14, 13,
  14, 14, 10, 11, 13, 14, 13, 13, 14, 12, 14, 12, 13, 14, 13, 14, 13, 14, 13, 12, 12, 13, 13, 14, 14, 14, 12, 13, 14, 13, 14, 14, 12, 14, 13, 14, 14, 13, 14, 14, 13, 13, 14, 14, 14, 12, 13, 13, 14, 14, 13, 14, 11, 13, 14, 14, 14, 14, 14, 14, 13, 13, 14, 15, 14, 14, 13, 14, 14, 13, 12, 14, 13, 14,
  12, 13, 14, 14, 13, 15, 14, 14, 15, 15, 14, 14, 8, 14, 11, 14, 14, 12, 14, 14, 14, 14, 14, 13, 14, 13, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 12, 14, 14, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 13, 14, 13, 13, 12, 14, 14, 12,
  14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 12, 13, 14, 12, 13, 14, 13, 14, 13, 14, 14, 12, 14, 13, 14, 13, 14, 13, 13, 12, 13, 13, 13, 13, 13, 14, 13, 14, 14, 13, 14, 12, 14, 13, 14, 13, 13, 13, 14, 14, 12, 14, 12, 14, 14, 14, 14, 14, 13, 13, 13, 13, 14, 13, 14, 13, 14, 13, 14, 14, 11, 14,
  14, 12, 13, 13, 13, 13, 14, 12, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 12, 14, 13, 14, 13, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 12, 13, 13, 13, 13, 14, 14, 11, 14, 14, 14, 14, 13, 14, 14, 13, 13, 13, 13, 13, 13, 13, 13, 14, 14, 10,
  13, 13, 11, 13, 12, 13, 14, 14, 14, 13, 13, 14, 13, 14, 14, 13, 13, 13, 13, 13, 14, 11, 13, 12, 14, 13, 14, 12, 13, 13, 13, 13, 14, 12, 13, 14, 14, 13, 12, 14, 12, 13, 13, 13, 13, 12, 13, 14, 11, 13, 13, 13, 13, 14, 12, 13, 13, 13, 14, 12, 12, 12, 13, 14, 13, 13, 13, 13, 14, 14, 12, 13, 13, 13,
  14, 13, 14, 14, 13, 13, 13, 13, 13, 14, 13, 13, 14, 14, 14, 13, 14, 13, 13, 13, 13, 13, 14, 14, 13, 12, 13, 13, 14, 13, 12, 13, 12, 14, 12, 13, 13, 13, 14, 14, 14, 13, 13, 14, 14, 14, 14, 13, 13, 11, 13, 13, 13, 13, 14, 13, 13, 13, 14, 14, 13, 12, 12, 14, 13, 14, 13, 13, 13, 13, 13, 13, 12, 13,
  14, 11, 13, 13, 14, 13, 13, 13, 13, 13, 13, 13, 14, 14, 13, 13, 13, 14, 14, 11, 14, 13, 14, 13, 13, 14, 14, 13, 13, 14, 14, 13, 14, 14, 13, 13, 13, 12, 13, 13, 13, 14, 13, 12, 14, 13, 12, 13, 14, 13, 12, 14, 9, 13, 13, 10, 13, 13, 13, 13, 11, 14, 13, 14, 14, 13, 12, 14, 14, 11, 13, 13, 13, 12, 14,
  14, 14, 13, 14, 12, 13, 14, 11, 13, 12, 13, 14, 14, 13, 13, 14, 13, 14, 13, 13, 11, 13, 13, 13, 12, 12, 13, 12, 12, 13, 13, 13, 13, 13, 13, 14, 14, 13, 14, 13, 13, 13, 12, 14, 13, 12, 13, 13, 13, 13, 14, 14, 14, 12, 14, 14, 14, 13, 14, 13, 14, 13, 13, 13, 12, 13, 13, 13, 13, 13, 13, 12, 12, 14,
  14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 13, 13, 13, 13, 13, 13, 14, 13, 14, 12, 14, 13, 13, 12, 13, 14, 12, 13, 13, 13, 14, 13, 14, 13, 13, 13, 14, 14, 12, 13, 13, 12, 13, 13, 13, 13, 14, 13, 13, 13, 13, 13, 12, 13, 13, 13, 13, 12, 13, 13, 13, 13, 13, 13, 12, 13, 13, 13, 13, 13, 13,
  13, 13, 13, 13, 13, 13, 13, 14, 13, 13, 13, 13, 14, 13, 13, 11, 13, 11, 13, 13, 13, 11, 13, 13, 13, 14, 13, 14, 14, 13, 13, 13, 13, 13, 13, 14, 14, 13, 13, 12, 14, 12, 13, 13, 13, 11, 13, 13, 13, 14, 13, 14, 13, 13, 13, 14, 12, 14, 14, 14, 13, 14, 14, 14, 14, 12, 12, 13, 14, 14, 14, 13, 12, 13,
  14, 13, 14, 11, 14, 13, 13, 14, 13, 13, 14, 14, 14, 12, 14, 13, 14, 11, 13, 13, 13, 14, 14, 13, 14, 13, 13, 13, 14, 13, 12, 13, 14, 12, 13, 11, 13, 13, 13, 13, 14, 12, 14, 14, 13, 13, 13, 14, 11, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 13, 14, 13, 13, 12, 13, 14, 14, 13, 14, 13, 14,
  14, 13, 12, 12, 14, 13, 14, 14, 14, 13, 14, 13, 14, 13, 12, 14, 13, 14, 14, 14, 13, 11, 13, 13, 13, 13, 10, 14, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 10, 11, 12, 11, 11, 10, 11, 11, 11, 11, 11, 12, 10, 11, 11, 11, 11, 12, 9, 12, 11, 10, 10, 12, 12, 12, 10, 12, 12,
  12, 11, 12, 11, 11, 10, 12, 12, 12, 12, 11, 12, 11, 11, 10, 11, 11, 11, 11, 11, 11, 10, 11, 11, 15, 10, 11, 11, 11, 11, 11, 11, 10, 11, 8, 11, 11, 11, 11, 11, 11, 11, 8, 11, 10, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 10, 11, 11, 10, 10, 11, 11, 15, 11, 11, 11, 11, 11, 11, 11, 11,
  10, 11, 11, 11, 10, 10, 11, 11, 11, 11, 11, 11, 11, 13, 15, 13, 14, 14, 15, 14, 14, 14, 15, 14, 14, 12, 14, 14, 14, 14, 14, 15, 14, 14, 12, 14, 15, 14, 15, 14, 13, 14, 13, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 13, 13, 15, 14, 15, 13, 13, 15, 15, 15, 14, 11, 13, 12,
  14, 13, 15, 12, 14, 15, 14, 14, 14, 14, 12, 14, 13, 14, 14, 14, 15, 12, 12, 14, 14, 15, 14, 14, 15, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 15, 14, 13, 14, 15, 14, 13, 14, 14, 12, 15, 14, 13, 14, 14, 14, 15, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 15, 14, 14, 14, 13, 14, 13, 15, 15, 12,
  14, 14, 14, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 15, 14, 15, 14, 14, 15, 15, 13, 15, 14, 14, 14, 14, 14, 12, 13, 13, 14, 14, 14, 12, 14, 13, 14, 14, 14, 13, 13, 11, 13, 14, 14, 14, 13, 15, 12,
  15, 11, 13, 13, 13, 13, 14, 13, 14, 14, 12, 14, 14, 13, 14, 14, 14, 13, 13, 14, 14, 14, 13, 12, 14, 14, 13, 13, 13, 14, 12, 13, 13, 13, 13, 14, 14, 14, 12, 14, 11, 14, 13, 14, 14, 14, 13, 12, 13, 15, 13, 14, 13, 13, 12, 14, 14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 12, 14, 14, 14, 12, 14, 14, 14,
  12, 14, 13, 12, 14, 13, 12, 14, 13, 13, 13, 11, 13, 14, 14, 14, 14, 14, 13, 14, 11, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 13, 14, 15, 14, 14, 13, 14, 14, 13, 14, 13, 14, 14, 11, 14, 14, 13, 14, 12, 14, 13, 13, 14, 12, 13, 14, 13, 14, 13, 13, 13, 14, 12, 13, 14, 12, 12, 14,
  12, 14, 14, 14, 14, 13, 13, 13, 13, 13, 14, 12, 14, 13, 14, 13, 13, 13, 12, 14, 14, 14, 14, 13, 14, 14, 14, 12, 13, 13, 14, 12, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 13, 13, 14, 13, 13, 14, 14, 12, 14, 14, 14, 14, 11, 14, 14, 13, 13, 14, 13, 13, 13, 14, 13, 14, 13, 14, 13, 13, 14, 12,
  14, 14, 14, 12, 13, 14, 11, 13, 14, 14, 14, 12, 14, 14, 12, 14, 11, 14, 13, 14, 14, 14, 13, 13, 14, 14, 12, 14, 14, 14, 13, 14, 14, 14, 13, 13, 14, 13, 10, 13, 13, 14, 14, 14, 13, 13, 14, 13, 12, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 12, 14, 12, 14, 14, 13, 13, 12, 14, 12, 13, 12, 14,
  13, 13, 14, 13, 14, 13, 12, 14, 14, 14, 14, 14, 12, 14, 14, 14, 13, 12, 14, 12, 13, 11, 14, 14, 13, 13, 13, 14, 13, 14, 13, 12, 13, 13, 13, 13, 14, 14, 14, 12, 14, 14, 12, 14, 13, 14, 14, 12, 13, 14, 13, 13, 14, 14, 14, 14, 13, 12, 14, 13, 11, 13, 14, 13, 12, 13, 13, 12, 13, 12, 14, 13, 13, 14,
  13, 11, 13, 14, 12, 14, 13, 14, 13, 14, 14, 12, 14, 14, 11, 14, 13, 14, 14, 13, 14, 14, 12, 14, 14, 12, 14, 13, 14, 13, 14, 14, 14, 14, 13, 13, 10, 14, 13, 14, 11, 13, 12, 13, 11, 13, 13, 13, 13, 11, 14, 14, 14, 14, 13, 13, 14, 12, 14, 13, 12, 13, 14, 12, 13, 14, 14, 14, 12, 13, 14, 13, 13, 13,
  12, 13, 13, 13, 14, 13, 14, 13, 14, 14, 12, 14, 14, 12, 14, 14, 13, 12, 14, 14, 13, 12, 13, 12, 13, 13, 13, 13, 13, 13, 13, 14, 11, 14, 14, 12, 14, 13, 13, 13, 13, 12, 13, 12, 13, 14, 12, 14, 13, 13, 13, 14, 12, 14, 10, 14, 13, 13, 13, 13, 12, 11, 11, 12, 11, 13, 13, 13, 13, 14, 13, 14, 14, 14,
  14, 13, 14, 14, 13, 13, 13, 14, 13, 13, 12, 14, 13, 11, 13, 13, 14, 13, 13, 13, 13, 10, 14, 13, 13, 13, 12, 13, 13, 12, 13, 13, 13, 13, 12, 13, 13, 13, 12, 13, 14, 14, 12, 13, 13, 14, 14, 13, 14, 14, 14, 13, 13, 13, 13, 12, 14, 12, 8, 12, 14, 14, 14, 12, 13, 13, 13, 13, 14, 12, 13, 13, 14, 13, 13,
  12, 13, 13, 13, 12, 14, 13, 13, 14, 12, 13, 10, 13, 13, 11, 13, 13, 13, 13, 14, 13, 13, 14, 14, 13, 14, 14, 13, 13, 13, 13, 13, 13, 13, 11, 13, 14, 13, 11, 13, 13, 13, 13, 14, 11, 14, 13, 11, 14, 13, 11, 14, 14, 13, 13, 13, 14, 13, 12, 13, 13, 13, 13, 13, 13, 13, 12, 13, 14, 13, 14, 13, 13, 13,
  13, 13, 13, 13, 13, 13, 14, 12, 13, 12, 13, 13, 13, 14, 14, 12, 14, 13, 14, 14, 12, 14, 14, 12, 14, 13, 12, 13, 13, 13, 13, 13, 13, 12, 14, 13, 14, 14, 13, 13, 13, 12, 13, 13, 13, 13, 13, 14, 12, 13, 13, 14, 13, 12, 14, 12, 14, 14, 12, 14, 13, 13, 13, 14, 14, 13, 14, 14, 13, 12, 14, 13, 13, 10,
  13, 13, 12, 13, 13, 13, 13, 13, 13, 14, 13, 13, 12, 10, 14, 14, 13, 14, 14, 12, 14, 15, 13, 14, 13, 13, 12, 14, 14, 14, 14, 14, 12, 13, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 13, 14, 13, 14, 13, 12, 14, 13, 12, 13, 14, 14, 14, 11,
  13, 13, 13, 14, 12, 13, 13, 14, 13, 14, 14, 13, 12, 13, 13, 14, 11, 14, 12, 13, 13, 13, 12, 13, 13, 10, 13, 11, 13, 13, 14, 12, 14, 13, 11, 13, 13, 10, 12, 14, 13, 13, 12, 13, 10, 14, 13, 12, 13, 13, 9, 13, 11, 13, 13, 13, 13, 13, 12, 13, 10, 13, 13, 13, 13, 12, 13, 13, 13, 13, 13, 13, 13, 12, 13,
  12, 14, 14, 13, 14, 13, 13, 11, 12, 13, 13, 13, 11, 14, 14, 13, 14, 14, 13, 13, 14, 14, 13, 14, 14, 12, 14, 14, 14, 14, 12, 13, 13, 11, 13, 13, 13, 13, 13, 13, 13, 15, 13, 13, 14, 13, 14, 13, 14, 13, 13, 14, 12, 11, 13, 13, 13, 13, 14, 13, 13, 13, 13, 13, 13, 11, 13, 12, 13, 14, 14, 14, 12, 13,
  14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 13, 13, 14, 12, 13, 11, 14, 13, 14, 14, 14, 13, 14, 13, 14, 13, 14, 14, 14, 14, 12, 14, 14, 14, 14, 11, 13, 12, 13, 13, 13, 12, 12, 11, 12, 12, 12, 10, 11, 10, 12, 11, 12, 12, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 10, 10, 11, 11, 9, 11, 11, 11, 11, 11,
  11, 10, 11, 10, 11, 10, 11, 10, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 10, 11, 10, 10, 11, 10, 11, 11, 11, 11, 11, 11, 11, 10, 11, 9, 11, 11, 11, 11, 11, 11, 11, 10, 10, 11, 10, 11, 8, 11, 15, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 10, 11, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14,
  13, 14, 13, 14, 12, 14, 13, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 13, 13, 14, 14, 15, 15, 14, 14, 14, 15, 15, 14, 14, 14, 14, 15, 12, 13, 15, 14, 16, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 13, 12, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 15, 13, 14, 14,
  15, 14, 14, 14, 14, 14, 14, 14, 15, 14, 13, 15, 14, 14, 14, 13, 15, 15, 15, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 11, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 13, 15, 14, 13, 14, 14, 14, 14, 14, 11, 14, 14, 13, 14, 12, 14, 14, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 13, 15, 13,
  14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 13, 14, 13, 13, 12, 13, 13, 13, 14, 13, 13, 13, 14, 13, 14, 14, 13, 13, 14, 13, 14, 13, 14, 13, 14, 13, 13, 14, 14, 14, 14, 12, 13, 13, 14, 9, 13, 14, 14, 13, 14, 12, 14, 14, 14, 14, 13, 12, 13, 13, 14, 12, 14, 12, 14, 14, 14, 14, 14, 13, 14, 11, 13, 11, 14,
  14, 13, 13, 14, 14, 13, 13, 13, 11, 13, 13, 14, 14, 14, 13, 12, 14, 14, 13, 11, 14, 13, 14, 14, 13, 14, 14, 13, 13, 13, 14, 14, 13, 14, 13, 14, 13, 14, 13, 11, 14, 14, 11, 14, 13, 14, 14, 13, 14, 13, 14, 14, 13, 13, 14, 14, 14, 13, 13, 14, 12, 14, 13, 14, 12, 13, 12, 14, 13, 14, 14, 14, 13, 13,
  13, 13, 12, 13, 14, 13, 13, 14, 13, 13, 14, 13, 13, 13, 14, 13, 13, 14, 12, 14, 14, 14, 14, 12, 14, 13, 14, 14, 14, 13, 14, 13, 14, 14, 13, 13, 12, 14, 13, 12, 12, 13, 14, 14, 13, 14, 14, 9, 13, 13, 14, 14, 13, 11, 13, 13, 13, 13, 13, 14, 14, 12, 14, 14, 12, 14, 12, 14, 13, 14, 14, 14, 14, 12, 13,
  14, 14, 12, 13, 13, 14, 11, 13, 13, 13, 13, 14, 11, 14, 13, 14, 13, 13, 13, 14, 13, 13, 14, 12, 13, 13, 13, 12, 14, 12, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 11, 14, 14, 13, 14, 13, 12, 14, 14, 13, 13, 13, 12, 13, 14, 14, 14, 14, 14, 13, 11, 14, 13, 14, 12, 13, 13, 13, 14, 13, 13, 13, 14,
  14, 14, 12, 14, 14, 14, 13, 10, 14, 13, 12, 14, 13, 14, 14, 14, 14, 14, 11, 14, 14, 13, 14, 10, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 13, 13, 14, 12, 13, 12, 14, 11, 13, 14, 13, 14, 14, 12, 14, 13, 14, 14, 14, 13, 12, 13, 14, 14, 13, 13, 13, 14, 12, 14, 13, 13, 13, 13, 13, 14,
  13, 12, 13, 13, 14, 14, 14, 12, 13, 14, 14, 11, 14, 13, 13, 13, 14, 11, 14, 13, 13, 13, 13, 13, 13, 14, 13, 14, 11, 14, 13, 14, 13, 14, 13, 14, 14, 14, 13, 14, 11, 12, 14, 13, 15, 14, 14, 12, 13, 13, 12, 13, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 12, 14, 13, 13, 12, 13, 13, 14, 14, 14,
  13, 14, 13, 14, 13, 13, 12, 13, 12, 13, 11, 13, 13, 13, 11, 13, 14, 13, 14, 14, 13, 14, 13, 13, 14, 14, 12, 14, 13, 13, 14, 13, 13, 13, 13, 12, 14, 14, 14, 13, 12, 14, 13, 14, 13, 13, 13, 13, 12, 14, 14, 13, 11, 13, 14, 14, 14, 14, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 13,
  14, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 12, 14, 13, 13, 14, 12, 14, 14, 14, 13, 13, 14, 14, 14, 11, 14, 14, 13, 13, 13, 12, 13, 12, 10, 13, 14, 14, 12, 14, 14, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 11, 13, 13, 14, 13, 13, 13, 12, 12, 14, 13, 13, 13, 13, 13, 13, 14, 13, 14, 13, 13, 13, 13,
  13, 12, 13, 13, 14, 13, 13, 13, 14, 12, 14, 13, 13, 13, 12, 13, 12, 14, 13, 13, 13, 14, 13, 13, 13, 13, 13, 14, 12, 14, 13, 13, 14, 11, 14, 13, 13, 14, 13, 11, 12, 13, 13, 13, 14, 13, 13, 13, 13, 11, 13, 14, 13, 13, 12, 12, 13, 13, 13, 13, 12, 13, 13, 14, 12, 13, 12, 13, 12, 12, 14, 13, 13, 13,
  14, 14, 14, 13, 13, 14, 13, 13, 13, 13, 13, 14, 13, 14, 13, 13, 12, 13, 13, 13, 13, 12, 14, 14, 14, 13, 12, 14, 13, 13, 13, 13, 13, 13, 12, 13, 12, 13, 13, 14, 13, 14, 13, 14, 13, 14, 13, 13, 14, 12, 11, 14, 13, 13, 13, 13, 11, 13, 13, 13, 13, 14, 14, 14, 12, 11, 14, 13, 14, 13, 13, 12, 13, 13,
  13, 13, 13, 14, 14, 13, 12, 13, 14, 13, 14, 14, 13, 13, 11, 14, 14, 12, 13, 13, 13, 13, 12, 13, 13, 13, 14, 13, 13, 14, 13, 14, 12, 14, 14, 13, 13, 13, 12, 11, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 13, 13, 13, 13, 13, 13, 14, 13, 13, 13, 14, 12, 14, 12, 14, 13, 13, 14, 12, 14, 13, 13, 13,
  13, 13, 13, 13, 14, 13, 12, 13, 13, 13, 13, 13, 13, 13, 14, 13, 13, 12, 13, 10, 12, 13, 13, 11, 13, 13, 10, 11, 13, 12, 13, 13, 13, 12, 13, 13, 13, 11, 13, 13, 14, 14, 13, 13, 14, 14, 12, 13, 13, 11, 13, 13, 13, 14, 14, 14, 13, 13, 13, 14, 13, 13, 11, 13, 14, 14, 12, 14, 14, 14, 13, 14, 13, 13,
  13, 13, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 13, 13, 12, 13, 14, 14, 13, 14, 13, 13, 14, 14, 13, 12, 13, 14, 12, 14, 14, 14, 12, 13, 13, 13, 13, 14, 13, 13, 12, 14, 13, 12, 14, 11, 14, 13, 13, 13, 12, 13, 12, 14, 14, 13, 13, 12, 13, 12, 13, 13, 13, 11, 11, 13,
  13, 13, 12, 14, 14, 15, 14, 12, 14, 14, 14, 13, 12, 13, 14, 14, 14, 13, 13, 13, 14, 13, 13, 14, 14, 14, 11, 13, 14, 13, 11, 12, 13, 14, 12, 14, 14, 11, 14, 13, 13, 13, 14, 13, 13, 13, 13, 13, 12, 13, 11, 12, 11, 10, 8, 11, 12, 12, 12, 10, 12, 12, 11, 11, 11, 11, 12, 12, 12, 10, 12, 13, 12, 12, 11,
  8, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 10, 11, 11, 11, 10, 11, 11, 11, 9, 10, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 10, 11, 9, 11, 11, 11, 11, 14, 11, 11, 11, 11, 10, 11, 11, 11, 10, 11, 11, 10, 11, 11, 11, 10, 11, 11, 9, 10, 11, 11, 10, 14, 12, 14, 13,
  14, 14, 14, 14, 14, 13, 12, 14, 14, 14, 14, 12, 14, 14, 12, 13, 14, 14, 14, 13, 15, 15, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 11, 14, 14, 11, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 12, 14, 13, 12, 14, 14, 14, 15, 14, 14, 14, 14, 14, 13, 13, 13, 14, 14, 13, 14, 15, 14, 14, 14, 14, 14, 14, 14,
  14, 11, 14, 12, 12, 14, 14, 14, 14, 14, 14, 14, 12, 11, 13, 14, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 11, 14, 14, 14, 13, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 12, 14, 13, 14, 14, 14, 14, 13, 13, 13, 13, 12, 13, 13, 10, 14, 13, 14, 13, 13, 12, 14, 14, 13, 12, 14,
  13, 14, 13, 14, 13, 13, 13, 14, 14, 13, 13, 13, 14, 13, 14, 14, 12, 14, 13, 14, 12, 13, 13, 13, 13, 13, 14, 13, 13, 12, 13, 13, 13, 13, 12, 13, 13, 13, 12, 13, 14, 11, 13, 14, 13, 14, 12, 13, 13, 13, 14, 14, 13, 13, 13, 13, 12, 13, 13, 12, 14, 13, 13, 10, 13, 13, 12, 13, 14, 14, 14, 13, 13, 14,
  13, 14, 12, 13, 13, 13, 13, 13, 11, 13, 13, 12, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 13, 13, 14, 13, 14, 15, 13, 13, 12, 14, 12, 14, 14, 13, 14, 13, 13, 14, 13, 13, 12, 13, 13, 13, 13, 14, 12, 13, 13, 12, 12, 13, 14, 13, 14, 11, 12, 10, 13, 13, 13, 14, 13, 13, 13, 13, 14, 13, 14, 12, 14, 14,
  12, 14, 14, 14, 13, 13, 14, 13, 13, 12, 14, 14, 13, 14, 13, 12, 14, 12, 14, 14, 14, 13, 13, 13, 14, 14, 14, 13, 14, 12, 14, 14, 14, 13, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 13, 14, 14, 13, 13, 13, 14, 14, 13, 13, 14, 14, 14, 14, 14, 13, 11, 13, 14, 14, 14, 13, 13, 12, 13, 10, 14, 14, 13, 14,
  12, 13, 14, 11, 12, 13, 12, 14, 13, 13, 11, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 13, 12, 13, 13, 14, 13, 13, 14, 12, 14, 12, 14, 14, 13, 13, 14, 13, 13, 11, 14, 13, 14, 14, 13, 14, 13, 13, 13, 14, 14, 14, 14, 12, 13, 13, 11, 13, 14, 13, 13, 12, 11, 13, 13, 13, 12, 14, 13, 12, 13, 14, 13,
  13, 14, 11, 13, 14, 12, 12, 13, 13, 14, 13, 13, 13, 13, 13, 13, 12, 13, 14, 14, 14, 13, 14, 14, 13, 14, 13, 13, 14, 14, 13, 13, 13, 12, 13, 13, 14, 13, 14, 13, 14, 14, 12, 13, 11, 13, 14, 13, 14, 13, 13, 14, 14, 13, 13, 13, 14, 12, 14, 11, 13, 14, 13, 14, 12, 13, 14, 13, 14, 12, 14, 13, 14, 13,
  11, 13, 13, 14, 13, 14, 14, 14, 14, 11, 14, 13, 14, 12, 13, 13, 14, 12, 13, 14, 13, 14, 13, 13, 12, 14, 14, 13, 13, 13, 14, 14, 13, 13, 13, 13, 12, 13, 13, 13, 13, 12, 14, 13, 13, 13, 13, 14, 13, 14, 13, 13, 14, 13, 14, 14, 12, 14, 13, 14, 13, 13, 13, 14, 13, 13, 14, 13, 14, 13, 13, 13, 14, 14,
  14, 13, 13, 14, 14, 14, 14, 14, 11, 14, 14, 13, 12, 13, 12, 13, 12, 13, 14, 12, 14, 14, 13, 10, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 12, 14, 13, 12, 14, 13, 14, 14, 12, 13, 14, 14, 13, 13, 13, 13, 13, 13, 13, 14, 14, 12, 13, 13, 13, 13, 12, 13, 14, 13, 13, 13, 14, 13, 13, 14, 13, 13, 13, 12,
  12, 13, 13, 14, 13, 13, 14, 12, 13, 12, 12, 11, 11, 13, 10, 13, 13, 12, 14, 14, 13, 14, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 11, 13, 14, 12, 12, 13, 13, 13, 13, 14, 13, 14, 14, 12, 13, 14, 12, 13, 13, 12, 14, 13, 13, 12, 13, 14, 14, 13, 11, 13, 11, 14, 13, 12, 13, 14, 13, 13, 13, 11, 13, 11,
  13, 13, 13, 14, 14, 13, 13, 13, 13, 13, 13, 14, 12, 13, 14, 13, 13, 13, 13, 13, 13, 13, 12, 12, 10, 12, 13, 14, 14, 14, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 12, 13, 13, 13, 13, 13, 14, 14, 13, 10, 13, 13, 13, 13, 11, 13, 14, 11, 13, 13, 12, 13, 13, 11, 14, 14, 14, 11, 13, 13,
  13, 12, 13, 13, 13, 12, 14, 14, 13, 13, 14, 13, 13, 13, 12, 13, 13, 14, 14, 13, 13, 12, 13, 14, 13, 13, 13, 14, 13, 12, 12, 13, 12, 12, 13, 11, 13, 13, 12, 13, 14, 14, 14, 11, 13, 13, 13, 13, 13, 14, 13, 13, 13, 14, 13, 12, 13, 13, 14, 14, 13, 12, 13, 13, 12, 14, 14, 13, 13, 13, 13, 14, 13, 14,
  14, 13, 13, 15, 13, 13, 13, 14, 13, 11, 13, 14, 13, 13, 13, 14, 14, 14, 13, 13, 14, 14, 11, 13, 13, 14, 13, 14, 14, 14, 14, 13, 13, 14, 13, 14, 13, 13, 13, 14, 13, 13, 12, 12, 13, 13, 13, 12, 13, 13, 13, 13, 12, 13, 14, 14, 13, 13, 13, 13, 14, 14, 14, 13, 13, 12, 14, 14, 14, 13, 13, 13, 12, 14,
  14, 14, 14, 13, 13, 14, 13, 12, 12, 13, 13, 12, 12, 13, 11, 14, 13, 13, 11, 13, 13, 13, 12, 13, 12, 13, 12, 13, 12, 13, 13, 13, 12, 13, 13, 11, 14, 13, 12, 13, 11, 13, 13, 13, 13, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 13, 10, 12, 8, 13, 11, 12, 12, 11, 12, 11, 10, 11, 11, 11, 11, 11,
  11, 10, 10, 11, 11, 11, 10, 11, 11, 11, 11, 11, 10, 13, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 10, 11, 10, 9, 11, 11, 10, 11, 11, 11, 10, 11, 10, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 14, 14, 14, 14, 14, 14, 14,
  14, 14, 14, 14, 14, 13, 13, 14, 13, 14, 12, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 12, 14, 13, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 11, 14, 12, 14, 14, 14, 12, 14, 14, 14, 12, 14, 14, 14, 14, 14, 13, 14, 14, 13, 12, 14, 14, 14, 14, 14,
  13, 14, 12, 13, 14, 14, 12, 12, 14, 14, 12, 14, 13, 14, 13, 14, 14, 14, 14, 13, 14, 14, 11, 14, 14, 12, 14, 14, 13, 13, 14, 13, 13, 13, 13, 14, 14, 13, 12, 13, 12, 13, 12, 13, 14, 14, 12, 13, 14, 13, 13, 13, 13, 12, 13, 14, 11, 13, 14, 12, 14, 13, 13, 13, 13, 13, 13, 14, 13, 14, 14, 13, 13, 13,
  13, 13, 14, 14, 12, 14, 13, 14, 13, 14, 13, 12, 13, 13, 12, 14, 13, 13, 13, 13, 12, 13, 13, 13, 14, 14, 14, 14, 14, 13, 13, 13, 13, 13, 13, 12, 13, 13, 12, 13, 13, 13, 12, 14, 12, 13, 11, 13, 13, 14, 10, 13, 13, 13, 13, 13, 10, 14, 13, 13, 13, 13, 13, 13, 12, 14, 14, 13, 11, 10, 14, 14, 14, 13,
  13, 13, 14, 14, 13, 11, 14, 13, 14, 13, 14, 13, 13, 13, 14, 13, 13, 13, 14, 13, 13, 14, 13, 12, 13, 12, 12, 13, 13, 9, 15, 14, 13, 13, 11, 13, 13, 12, 13, 13, 14, 13, 13, 13, 13, 12, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 13, 13, 13, 14, 14, 13, 13, 13, 13, 12, 13, 13, 13, 13, 14, 13, 14, 13, 14,
  14, 14, 14, 11, 13, 14, 14, 13, 13, 13, 10, 14, 13, 13, 13, 14, 14, 13, 13, 13, 13, 14, 14, 14, 12, 12, 13, 14, 12, 13, 14, 14, 13, 14, 12, 13, 14, 13, 12, 10, 14, 12, 13, 14, 14, 13, 13, 12, 13, 11, 13, 11, 12, 13, 13, 13, 14, 13, 13, 13, 11, 12, 14, 12, 13, 12, 13, 13, 13, 14, 13, 13, 14, 13,
  12, 13, 13, 12, 13, 13, 13, 14, 13, 12, 13, 12, 13, 12, 14, 14, 14, 11, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 13, 13, 13, 13, 14, 14, 14, 14, 14, 13, 13, 13, 13, 13, 13, 13, 13, 13, 12, 13, 13, 12, 13, 13, 13, 14, 13, 14, 14, 14, 12, 13, 13, 12, 14, 14, 13, 13, 14, 13, 14, 14, 14, 14, 13, 13,
  13, 14, 12, 13, 14, 14, 13, 13, 13, 14, 14, 14, 13, 13, 13, 14, 13, 14, 13, 12, 14, 13, 13, 13, 13, 13, 13, 14, 14, 13, 14, 14, 12, 11, 13, 13, 13, 11, 13, 14, 13, 10, 12, 14, 13, 13, 14, 13, 14, 14, 14, 13, 14, 14, 12, 13, 13, 13, 13, 13, 13, 10, 14, 13, 14, 13, 13, 14, 14, 14, 10, 13, 13, 12,
  13, 13, 13, 13, 14, 13, 13, 12, 13, 8, 13, 13, 14, 14, 13, 13, 13, 14, 14, 14, 13, 13, 13, 12, 13, 11, 13, 13, 13, 12, 9, 13, 13, 13, 12, 13, 12, 13, 13, 13, 14, 14, 13, 12, 12, 14, 14, 13, 13, 13, 13, 13, 13, 13, 14, 13, 13, 13, 13, 13, 13, 12, 12, 13, 14, 12, 13, 8, 11, 13, 12, 13, 14, 14, 13,
  13, 13, 10, 13, 13, 13, 11, 13, 13, 13, 13, 14, 11, 13, 13, 13, 13, 14, 13, 13, 12, 13, 10, 13, 13, 13, 12, 13, 12, 14, 14, 13, 13, 13, 14, 14, 13, 13, 14, 13, 13, 13, 13, 13, 13, 12, 13, 12, 14, 14, 13, 12, 13, 13, 12, 11, 13, 13, 12, 12, 13, 13, 13, 13, 13, 12, 13, 12, 13, 13, 13, 13, 13, 13,
  13, 14, 13, 14, 13, 14, 13, 12, 13, 14, 13, 13, 13, 13, 13, 14, 13, 14, 13, 12, 13, 14, 13, 13, 13, 13, 13, 13, 12, 13, 13, 13, 13, 13, 13, 14, 11, 13, 13, 13, 13, 13, 12, 14, 13, 13, 13, 13, 13, 12, 14, 12, 14, 13, 12, 13, 14, 14, 14, 14, 13, 11, 14, 12, 14, 13, 13, 14, 13, 14, 12, 13, 13, 14,
  12, 13, 13, 13, 13, 13, 13, 14, 14, 12, 10, 11, 12, 14, 13, 13, 13, 13, 10, 14, 13, 13, 11, 13, 14, 14, 13, 14, 13, 14, 14, 13, 13, 14, 12, 14, 13, 11, 13, 13, 11, 11, 13, 12, 14, 13, 13, 14, 12, 13, 13, 13, 13, 13, 13, 12, 13, 13, 13, 14, 13, 14, 13, 12, 13, 14, 13, 13, 12, 13, 14, 13, 13, 14,
  13, 13, 13, 13, 13, 13, 13, 13, 13, 12, 13, 13, 13, 14, 12, 13, 13, 11, 13, 11, 12, 13, 11, 13, 13, 12, 12, 12, 12, 13, 12, 12, 13, 13, 13, 13, 12, 13, 12, 12, 10, 12, 11, 12, 11, 11, 11, 10, 10, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 10, 11, 11, 11, 11, 11, 10, 10, 11, 11, 11, 11, 11, 11, 11,
  11, 11, 10, 11, 11, 11, 11, 11, 10, 10, 11, 11, 11, 10, 11, 11, 14, 10, 10, 11, 11, 10, 11, 11, 10, 11, 10, 11, 11, 10, 11, 11, 10, 10, 11, 11, 11, 11, 10, 11, 11, 13, 11, 11, 10, 11, 11, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 13,
  13, 13, 13, 13, 13, 12, 14, 14, 14, 11, 15, 14, 14, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 13, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 12, 14, 15, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 15, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14,
  13, 14, 10, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 15, 13, 14, 13, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 12, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 13, 13, 14, 13, 14, 14, 14, 14, 14, 14, 13, 13, 14, 13, 14,
  11, 13, 13, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 13, 14, 14, 13, 13, 13, 14, 14, 14, 9, 14, 14, 14, 13, 14, 12, 12, 14, 14, 13, 14, 14, 14, 14, 14, 12, 13, 13, 14, 14, 14, 13, 14, 14, 14, 13, 13, 13, 13, 13, 13, 13, 13,
  13, 13, 13, 13, 13, 12, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 13, 14, 13, 13, 13, 14, 12, 14, 13, 13, 14, 14, 13, 13, 14, 14, 12, 14, 14, 14, 14, 14, 13, 13, 13, 13, 14, 14, 14, 14, 13, 13, 13, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14,
  14, 14, 14, 14, 12, 12, 13, 14, 14, 14, 13, 14, 11, 14, 14, 12, 14, 14, 12, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 13, 14, 13, 14, 12, 13, 14, 13, 12, 14, 13, 14, 14, 14, 13, 13, 13, 13, 13, 14, 14, 13, 14, 14, 14, 13, 13, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13,
  14, 14, 13, 13, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 11, 13, 14, 13, 13, 13, 13, 14, 14, 14, 13, 14, 13, 13, 13, 13, 13, 13, 14, 14, 11, 13, 14, 12, 14, 14, 14, 11, 14, 14, 14, 13, 12, 13, 14, 13, 14, 14, 14, 13, 13, 14, 12, 13, 13, 13, 13, 13, 12, 14, 14, 14, 14,
  14, 13, 14, 14, 14, 13, 13, 13, 13, 13, 14, 14, 14, 14, 13, 14, 12, 13, 14, 14, 14, 13, 14, 14, 13, 13, 13, 14, 12, 14, 14, 14, 12, 13, 14, 13, 13, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 14, 13, 13, 13, 14, 14, 13, 14, 13, 14, 14,
  14, 14, 13, 14, 14, 13, 14, 14, 12, 13, 13, 12, 13, 13, 12, 13, 13, 12, 13, 13, 12, 14, 14, 13, 14, 14, 14, 13, 13, 14, 13, 13, 13, 13, 12, 13, 11, 13, 12, 14, 14, 14, 13, 13, 14, 13, 13, 14, 14, 13, 13, 14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 14, 14, 12, 13, 13, 13, 13, 13, 14, 12, 13, 14, 14,
  14, 14, 14, 13, 13, 12, 13, 12, 13, 14, 14, 13, 14, 13, 14, 13, 13, 14, 14, 13, 13, 13, 13, 14, 14, 13, 14, 13, 13, 13, 14, 13, 13, 14, 12, 13, 12, 13, 13, 10, 12, 12, 14, 13, 14, 14, 13, 11, 12, 14, 13, 12, 11, 14, 12, 13, 14, 12, 13, 12, 14, 13, 13, 13, 13, 14, 14, 14, 13, 14, 13, 13, 13, 13,
  13, 13, 14, 14, 14, 13, 14, 14, 14, 14, 12, 14, 13, 13, 12, 11, 14, 13, 14, 12, 13, 13, 14, 14, 13, 13, 13, 12, 11, 14, 13, 13, 13, 13, 12, 13, 14, 12, 14, 14, 14, 12, 13, 13, 13, 12, 13, 13, 13, 13, 13, 14, 12, 14, 13, 13, 14, 14, 14, 14, 14, 13, 13, 13, 11, 13, 13, 11, 13, 13, 13, 14, 14, 13,
  13, 12, 13, 14, 14, 13, 13, 13, 13, 13, 13, 13, 13, 12, 13, 13, 13, 14, 13, 13, 14, 12, 12, 14, 12, 13, 13, 13, 14, 14, 14, 11, 14, 13, 13, 13, 13, 13, 14, 9, 14, 13, 14, 12, 13, 13, 14, 13, 13, 13, 13, 13, 13, 13, 12, 12, 13, 12, 13, 13, 14, 14, 13, 12, 13, 13, 12, 13, 13, 14, 13, 14, 14, 13, 12,
  13, 13, 11, 13, 12, 14, 12, 13, 13, 13, 13, 11, 13, 13, 13, 13, 13, 14, 13, 14, 14, 14, 14, 13, 13, 13, 11, 14, 13, 13, 13, 10, 13, 13, 13, 13, 13, 12, 13, 12, 13, 13, 13, 13, 13, 10, 11, 13, 13, 13, 13, 10, 13, 12, 11, 14, 14, 12, 13, 13, 13, 14, 13, 14, 13, 14, 14, 14, 14, 13, 14, 14, 13, 12,
  13, 12, 13, 12, 13, 14, 12, 12, 10, 13, 12, 13, 12, 14, 14, 13, 13, 13, 13, 13, 14, 13, 14, 13, 13, 14, 13, 13, 13, 12, 13, 12, 13, 13, 13, 13, 11, 13, 13, 12, 13, 13, 11, 13, 13, 13, 14, 10, 13, 13, 14, 14, 13, 13, 13, 12, 13, 13, 13, 13, 13, 13, 13, 11, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13,
  13, 13, 13, 13, 12, 13, 13, 13, 13, 13, 11, 13, 12, 13, 13, 14, 13, 14, 12, 13, 11, 13, 14, 11, 13, 13, 14, 12, 13, 13, 13, 13, 12, 13, 13, 13, 13, 14, 14, 13, 13, 13, 13, 12, 14, 14, 11, 13, 13, 13, 11, 13, 14, 13, 10, 11, 13, 12, 13, 12, 13, 13, 12, 13, 13, 13, 13, 13, 11, 13, 13, 11, 13, 13,
  13, 13, 13, 13, 13, 13, 13, 13, 13, 12, 13, 13, 13, 11, 13, 13, 13, 12, 13, 13, 13, 13, 12, 14, 12, 13, 13, 11, 12, 13, 14, 13, 13, 12, 13, 14, 13, 13, 13, 14, 14, 13, 13, 14, 13, 13, 13, 13, 13, 12, 13, 13, 13, 13, 13, 12, 12, 11, 12, 8, 13, 13, 13, 9, 13, 13, 13, 13, 13, 13, 13, 13, 13, 12, 14,
  13, 13, 13, 14, 13, 11, 12, 13, 14, 13, 13, 14, 14, 11, 13, 13, 10, 13, 14, 12, 13, 14, 12, 13, 13, 14, 11, 13, 13, 13, 12, 13, 13, 13, 11, 13, 13, 13, 13, 13, 13, 13, 12, 13, 13, 13, 12, 13, 13, 13, 13, 13, 13, 13, 12, 13, 13, 11, 14, 14, 13, 14, 13, 11, 13, 13, 12, 13, 13, 13, 13, 13, 12, 13,
  13, 13, 13, 12, 13, 13, 13, 13, 13, 11, 11, 11, 11, 12, 12, 11, 12, 12, 13, 13, 13, 11, 13, 13, 13, 12, 10, 12, 12, 13, 11, 12, 12, 12, 12, 11, 11, 11, 11, 11, 11, 10, 11, 10, 10, 11, 11, 11, 10, 11, 11, 11, 13, 11, 11, 11, 10, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 9, 11, 10, 11, 10, 11,
  11, 11, 10, 11, 15, 11, 11, 11, 10, 11, 11, 11, 10, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 10, 11, 13, 14, 14, 12, 14, 14, 14, 12, 13, 13, 14, 14, 14, 13, 14, 13, 11, 13, 14, 14, 12, 13, 14, 13, 13, 13, 13, 11, 14, 14, 14, 13, 12, 14, 13, 13, 14, 14, 14, 13, 13,
  14, 12, 13, 13, 14, 14, 12, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 13, 13, 14, 14, 13, 14, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14, 12, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 13, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 13, 12,
  13, 12, 13, 13, 14, 13, 14, 12, 14, 13, 14, 14, 12, 12, 12, 14, 14, 12, 13, 12, 13, 11, 13, 13, 12, 14, 13, 14, 14, 13, 14, 14, 13, 13, 14, 14, 14, 13, 13, 13, 14, 14, 14, 13, 13, 12, 13, 13, 14, 14, 14, 14, 13, 13, 13, 13, 14, 10, 14, 14, 12, 13, 14, 14, 14, 13, 13, 13, 13, 14, 13, 14, 14, 14,
  12, 13, 14, 14, 13, 13, 13, 14, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 12, 13, 13, 12, 13, 10, 13, 12, 13, 12, 13, 13, 13, 14, 14, 12, 14, 13, 14, 13, 14, 14, 13, 14, 14, 14, 13, 14, 12, 14, 13, 13, 12, 13, 13, 14, 14, 13, 12, 13, 13, 12, 12, 13, 13, 13, 13, 13, 14, 14, 13, 12, 13, 12,
  13, 14, 14, 14, 12, 13, 14, 14, 13, 13, 13, 14, 12, 12, 14, 13, 13, 13, 13, 14, 13, 13, 13, 12, 13, 13, 13, 14, 14, 13, 12, 13, 12, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 13, 13, 13, 14, 13, 12, 13, 13, 12, 13, 13, 12, 14, 13, 14, 12, 13, 14, 14, 14, 13, 11, 13, 14, 13, 14, 14, 12,
  13, 14, 14, 14, 13, 13, 13, 13, 13, 14, 10, 14, 13, 14, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 13, 13, 14, 13, 12, 14, 13, 13, 13, 14, 13, 13, 14, 13, 13, 14, 13, 13, 13, 13, 13, 14, 14, 14, 12, 14, 12, 13, 14, 13, 13, 13, 11, 13, 13, 13, 13, 13, 14, 12, 14, 14, 14, 13, 11, 13, 14, 13, 12,
  14, 13, 13, 13, 10, 13, 13, 14, 14, 11, 13, 13, 13, 13, 13, 11, 10, 13, 13, 13, 14, 14, 12, 14, 14, 13, 14, 13, 12, 13, 13, 14, 14, 13, 13, 13, 12, 13, 13, 14, 13, 12, 14, 12, 14, 13, 11, 14, 14, 14, 14, 14, 12, 13, 14, 14, 11, 13, 13, 14, 14, 13, 14, 12, 13, 14, 14, 14, 12, 14, 13, 13, 13, 12,
  13, 14, 14, 13, 14, 14, 14, 14, 13, 14, 11, 13, 11, 13, 13, 13, 13, 13, 13, 13, 13, 13, 14, 9, 14, 13, 13, 13, 11, 13, 13, 13, 13, 13, 13, 14, 14, 13, 13, 11, 13, 10, 13, 12, 12, 13, 13, 13, 11, 13, 13, 13, 12, 14, 12, 14, 14, 13, 14, 14, 13, 13, 13, 13, 12, 14, 14, 12, 11, 13, 13, 12, 14, 13, 13,
  13, 13, 13, 14, 13, 13, 12, 10, 13, 13, 13, 13, 13, 12, 12, 13, 13, 13, 13, 13, 11, 13, 12, 12, 13, 13, 10, 13, 13, 12, 13, 12, 13, 13, 12, 12, 13, 12, 13, 13, 13, 12, 13, 10, 14, 12, 12, 12, 13, 13, 14, 13, 12, 13, 12, 13, 13, 12, 13, 13, 13, 13, 13, 13, 13, 13, 12, 13, 13, 13, 13, 13, 13, 13,
  13, 11, 13, 13, 13, 13, 13, 13, 12, 13, 11, 8, 13, 13, 13, 13, 13, 13, 13, 13, 12, 13, 13, 13, 13, 13, 13, 11, 12, 13, 13, 13, 12, 12, 13, 13, 13, 11, 13, 11, 13, 12, 9, 13, 13, 12, 13, 13, 13, 13, 13, 13, 13, 13, 12, 12, 11, 13, 13, 13, 12, 13, 13, 13, 12, 13, 12, 13, 13, 12, 13, 13, 14, 11, 13,
  13, 13, 13, 13, 13, 14, 13, 13, 13, 13, 13, 13, 11, 13, 13, 12, 11, 13, 13, 13, 11, 12, 12, 13, 11, 13, 12, 13, 13, 13, 12, 13, 13, 12, 12, 13, 12, 13, 12, 13, 13, 11, 14, 11, 13, 12, 13, 13, 12, 14, 14, 13, 13, 14, 13, 13, 12, 14, 13, 12, 13, 13, 12, 12, 13, 11, 14, 10, 13, 13, 13, 13, 13, 13,
  13, 13, 13, 13, 13, 13, 11, 13, 14, 13, 14, 11, 13, 13, 13, 13, 13, 11, 13, 13, 13, 13, 13, 12, 13, 13, 13, 13, 13, 13, 14, 14, 10, 13, 13, 11, 13, 12, 13, 13, 12, 13, 12, 13, 13, 13, 13, 12, 13, 13, 12, 12, 13, 13, 12, 12, 12, 12, 12, 13, 12, 12, 12, 11, 12, 12, 10, 12, 12, 12, 9, 10, 11, 11, 11,
  11, 10, 11, 10, 11, 11, 11, 11, 10, 10, 11, 11, 10, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 10, 11, 10, 11, 10, 11, 9, 11, 10, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 9, 11, 11, 10, 10, 11, 10, 11, 11, 10, 14, 13, 11, 13, 14, 14, 14,
  13, 13, 13, 13, 12, 13, 13, 12, 14, 14, 13, 14, 13, 12, 14, 13, 13, 13, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 12, 14, 14, 11, 13, 13, 12, 13, 13, 14, 13, 14, 14, 11, 13, 13, 12, 13, 13, 13, 13, 13, 14, 13, 14, 13, 13, 13, 13, 11, 13, 14, 12, 13, 13, 13, 14, 12, 13,
  13, 12, 13, 13, 13, 14, 13, 14, 13, 13, 14, 14, 13, 14, 14, 14, 13, 12, 13, 14, 13, 13, 12, 13, 13, 14, 12, 14, 11, 13, 13, 14, 15, 14, 14, 13, 14, 12, 13, 14, 14, 14, 13, 13, 14, 14, 12, 14, 14, 13, 13, 14, 14, 14, 14, 12, 14, 13, 13, 14, 13, 14, 13, 13, 12, 14, 14, 13, 14, 12, 12, 14, 13, 14,
  14, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 13, 13, 13, 14, 13, 13, 14, 14, 14, 14, 13, 14, 14, 14, 12, 13, 12, 14, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 11, 14, 13, 14, 14, 13, 14, 14, 13, 13, 11, 14, 14, 13, 13, 14, 14, 14, 13, 14, 12, 14, 13, 14, 14, 14, 12, 13, 12, 12, 13, 14, 13,
  13, 13, 14, 13, 12, 13, 14, 13, 14, 13, 13, 14, 13, 14, 14, 14, 12, 13, 13, 12, 13, 13, 13, 13, 14, 14, 13, 14, 12, 14, 13, 13, 10, 13, 13, 12, 14, 12, 14, 12, 12, 13, 12, 13, 13, 13, 13, 14, 12, 13, 13, 12, 14, 13, 13, 13, 10, 13, 11, 14, 13, 14, 13, 14, 14, 12, 13, 13, 12, 13, 14, 12, 14, 14,
  14, 14, 13, 13, 14, 14, 13, 12, 11, 14, 13, 13, 13, 11, 14, 14, 14, 13, 13, 13, 13, 12, 14, 14, 12, 10, 13, 12, 13, 13, 12, 14, 13, 13, 13, 13, 12, 14, 13, 12, 13, 14, 13, 12, 14, 13, 13, 13, 10, 13, 13, 13, 13, 14, 13, 13, 13, 13, 13, 13, 14, 11, 13, 13, 13, 12, 13, 13, 13, 13, 14, 13, 13, 13,
  13, 13, 13, 13, 10, 13, 13, 13, 11, 13, 13, 13, 11, 12, 13, 13, 13, 13, 13, 12, 13, 14, 11, 13, 13, 12, 13, 14, 13, 14, 14, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 12, 13, 13, 14, 13, 13, 13, 13, 13, 11, 14, 10, 13, 13, 13, 13, 13, 13, 10, 13, 12, 13, 13, 11, 12, 13, 13, 13, 13, 12, 12,
  11, 13, 13, 13, 12, 13, 12, 12, 11, 13, 13, 12, 13, 11, 12, 13, 11, 12, 12, 13, 13, 13, 13, 13, 10, 12, 13, 12, 13, 13, 13, 13, 11, 9, 13, 12, 12, 12, 13, 13, 12, 13, 12, 13, 12, 13, 11, 11, 13, 13, 12, 14, 13, 12, 13, 11, 13, 13, 11, 12, 13, 13, 13, 10, 12, 11, 12, 10, 12, 13, 11, 13, 13, 11, 13,
  11, 13, 10, 14, 14, 12, 13, 12, 13, 13, 12, 14, 12, 12, 13, 14, 13, 13, 13, 12, 13, 12, 13, 13, 13, 13, 13, 13, 12, 13, 13, 10, 12, 12, 13, 10, 13, 13, 12, 12, 14, 14, 13, 13, 13, 13, 12, 13, 13, 12, 13, 13, 11, 13, 13, 13, 12, 13, 13, 12, 12, 12, 13, 13, 13, 13, 12, 12, 12, 14, 13, 13, 13, 14,
  13, 12, 13, 13, 12, 13, 13, 14, 14, 11, 13, 13, 13, 13, 13, 11, 13, 12, 13, 13, 12, 13, 13, 13, 12, 13, 12, 12, 12, 13, 13, 13, 13, 10, 12, 12, 12, 11, 13, 13, 13, 13, 13, 12, 13, 13, 12, 13, 13, 12, 12, 13, 13, 8, 13, 13, 13, 13, 12, 13, 12, 10, 13, 13, 12, 13, 13, 13, 13, 11, 11, 11, 11, 11, 11,
  11, 11, 11, 11, 11, 10, 11, 11, 11, 10, 11, 10, 10, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 9, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 10, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 9, 11, 11, 11, 14, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 14, 11, 13, 13, 13,
  12, 13, 14, 13, 14, 14, 13, 13, 13, 13, 13, 13, 10, 14, 13, 12, 14, 14, 13, 14, 14, 13, 11, 13, 14, 13, 13, 12, 12, 13, 13, 13, 13, 12, 13, 12, 13, 12, 14, 13, 12, 14, 13, 13, 13, 13, 11, 12, 12, 13, 12, 13, 13, 13, 12, 13, 13, 13, 12, 13, 13, 13, 13, 13, 13, 13, 12, 13, 12, 13, 10, 13, 13, 13,
  13, 12, 13, 13, 12, 14, 13, 13, 14, 13, 13, 13, 14, 13, 13, 13, 14, 14, 12, 14, 14, 11, 11, 14, 13, 14, 14, 12, 13, 14, 14, 13, 14, 13, 12, 13, 14, 13, 13, 13, 12, 13, 14, 13, 13, 13, 14, 12, 14, 13, 13, 13, 13, 14, 13, 12, 11, 14, 13, 14, 14, 13, 14, 14, 12, 14, 14, 13, 11, 13, 12, 14, 14, 13,
  14, 14, 13, 13, 13, 13, 12, 13, 14, 13, 11, 12, 14, 13, 13, 13, 13, 14, 12, 13, 12, 13, 13, 12, 13, 13, 13, 13, 13, 13, 14, 13, 13, 14, 12, 12, 14, 13, 14, 13, 12, 13, 13, 14, 14, 14, 12, 13, 14, 13, 13, 13, 14, 13, 11, 14, 13, 13, 14, 13, 14, 13, 13, 14, 13, 13, 13, 13, 13, 13, 13, 13, 14, 12,
  14, 13, 13, 13, 13, 14, 13, 13, 13, 13, 13, 14, 14, 13, 13, 13, 13, 12, 13, 13, 14, 13, 13, 12, 13, 13, 13, 13, 13, 13, 13, 11, 11, 13, 13, 14, 14, 13, 13, 13, 14, 13, 13, 14, 13, 13, 14, 13, 14, 12, 13, 13, 12, 12, 13, 11, 13, 13, 13, 13, 13, 12, 13, 13, 13, 13, 13, 12, 13, 13, 11, 13, 13, 13,
  13, 12, 13, 13, 13, 13, 13, 12, 13, 13, 13, 13, 13, 13, 13, 11, 13, 13, 12, 13, 12, 13, 13, 12, 12, 13, 13, 12, 12, 13, 12, 13, 13, 13, 13, 14, 14, 10, 13, 13, 12, 13, 13, 13, 13, 13, 13, 13, 13, 12, 14, 12, 13, 13, 13, 13, 13, 13, 13, 11, 11, 14, 12, 11, 13, 12, 13, 13, 13, 13, 12, 13, 13, 12,
  14, 12, 10, 12, 11, 13, 13, 12, 13, 13, 13, 13, 13, 12, 12, 13, 13, 13, 11, 13, 13, 12, 13, 11, 13, 13, 10, 13, 14, 11, 12, 13, 12, 12, 13, 13, 13, 13, 13, 12, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 12, 13, 13, 13, 13, 11, 13, 13, 12, 13, 13, 12, 13, 13, 13, 13, 13, 13, 11, 11, 10, 11, 11,
  11, 10, 11, 11, 11, 11, 8, 11, 11, 11, 11, 10, 10, 11, 11, 11, 10, 11, 10, 11, 10, 11, 10, 11, 11, 9, 11, 10, 11, 11, 10, 10, 10, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 13, 11, 11, 11, 11, 11, 11, 11, 9, 11, 10, 10, 11, 10, 11, 13, 10, 11, 11, 11, 10, 10, 11, 11, 11, 13, 13, 14, 14, 13, 13, 13,
  11, 13, 13, 13, 12, 13, 13, 13, 14, 14, 14, 13, 13, 13, 14, 14, 13, 14, 13, 12, 13, 14, 12, 14, 14, 12, 13, 14, 13, 12, 13, 12, 14, 13, 14, 11, 13, 13, 13, 13, 14, 13, 12, 13, 14, 14, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 11, 13, 13, 12, 13, 13, 13, 14, 13, 11, 13, 12, 13, 13, 12, 13, 14,
  13, 13, 12, 12, 13, 13, 13, 13, 10, 13, 13, 13, 13, 12, 14, 13, 13, 13, 13, 13, 13, 13, 14, 13, 10, 13, 13, 13, 14, 14, 11, 13, 13, 13, 12, 13, 13, 13, 13, 13, 13, 12, 12, 14, 13, 13, 14, 13, 13, 13, 13, 13, 14, 11, 12, 13, 13, 13, 13, 13, 13, 13, 13, 12, 13, 12, 13, 13, 14, 11, 10, 13, 12, 11,
  12, 13, 13, 13, 11, 12, 12, 13, 13, 13, 12, 11, 13, 12, 12, 13, 13, 13, 13, 13, 13, 12, 13, 12, 13, 12, 13, 13, 9, 13, 13, 12, 13, 13, 13, 10, 12, 13, 13, 12, 13, 13, 12, 13, 12, 13, 12, 13, 14, 10, 13, 13, 13, 12, 12, 13, 13, 13, 13, 13, 12, 13, 13, 12, 12, 13, 12, 13, 13, 12, 13, 11, 12, 13, 13,
  13, 13, 13, 12, 11, 13, 13, 13, 13, 13, 11, 11, 12, 13, 12, 13, 13, 12, 12, 13, 11, 13, 13, 13, 12, 13, 13, 12, 13, 13, 13, 12, 13, 14, 13, 13, 13, 13, 12, 12, 11, 13, 10, 14, 12, 13, 13, 11, 13, 11, 13, 12, 13, 11, 13, 13, 12, 12, 13, 11, 13, 13, 13, 13, 12, 13, 12, 12, 13, 11, 12, 12, 13, 13,
  13, 12, 11, 13, 12, 13, 13, 13, 13, 11, 13, 12, 13, 13, 10, 12, 11, 12, 12, 12, 13, 12, 11, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 12, 13, 13, 13, 13, 12, 13, 13, 13, 11, 13, 13, 14, 13, 13, 11, 13, 12, 13, 13, 11, 13, 13, 10, 13, 13, 13, 11, 13, 13, 11, 13, 13, 13, 9, 12, 13, 13, 13, 11, 12, 11,
  11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 10, 11, 8, 10, 11, 12, 11, 10, 10, 11, 11, 11, 11, 11, 9, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 9, 11, 10, 11, 14, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 14, 13, 14, 13, 13, 13, 13, 13,
  12, 13, 13, 13, 11, 13, 14, 13, 14, 13, 12, 14, 13, 14, 13, 13, 13, 13, 12, 13, 13, 12, 13, 12, 13, 12, 13, 13, 13, 13, 13, 13, 12, 14, 13, 13, 13, 11, 13, 13, 13, 13, 13, 13, 13, 13, 13, 12, 13, 11, 13, 13, 13, 13, 13, 13, 11, 11, 13, 9, 13, 13, 12, 13, 12, 12, 14, 13, 13, 13, 13, 13, 13, 13, 13,
  13, 13, 14, 13, 13, 13, 13, 12, 13, 13, 12, 13, 13, 12, 13, 13, 13, 12, 13, 12, 12, 10, 13, 13, 13, 13, 13, 13, 10, 13, 14, 13, 13, 12, 12, 13, 13, 13, 12, 12, 13, 14, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 11, 12, 13, 13, 13, 13, 13, 13, 13, 11, 12, 13, 13, 13, 13, 13, 13, 13, 12, 13,
  11, 13, 13, 13, 13, 13, 13, 12, 13, 13, 13, 12, 12, 11, 12, 11, 13, 13, 13, 13, 13, 13, 13, 12, 13, 11, 12, 13, 13, 11, 10, 13, 12, 13, 13, 12, 12, 13, 12, 12, 13, 12, 12, 13, 13, 13, 10, 12, 12, 11, 13, 13, 14, 12, 12, 13, 12, 12, 12, 12, 12, 13, 10, 12, 13, 13, 12, 13, 13, 13, 11, 13, 13, 13,
  13, 12, 13, 13, 11, 13, 12, 11, 13, 13, 13, 12, 13, 12, 13, 13, 12, 13, 13, 12, 13, 13, 13, 12, 12, 13, 13, 13, 13, 13, 11, 12, 13, 13, 12, 12, 12, 12, 10, 13, 13, 13, 13, 13, 12, 13, 13, 12, 13, 12, 13, 11, 13, 13, 13, 12, 13, 12, 13, 11, 10, 12, 13, 13, 11, 13, 12, 10, 12, 12, 11, 12, 13, 13,
  13, 11, 12, 11, 12, 13, 12, 12, 12, 12, 12, 10, 12, 12, 11, 13, 11, 12, 11, 13, 12, 13, 12, 13, 12, 13, 11, 12, 13, 13, 12, 13, 12, 13, 12, 13, 13, 12, 12, 12, 12, 12, 12, 13, 13, 12, 12, 13, 13, 12, 11, 13, 12, 12, 12, 13, 13, 10, 12, 12, 13, 11, 12, 12, 10, 12, 13, 13, 13, 11, 12, 11, 12, 12,
  12, 12, 12, 12, 13, 12, 13, 13, 12, 13, 11, 13, 12, 11, 9, 10, 13, 13, 12, 12, 13, 13, 12, 12, 13, 12, 12, 12, 12, 13, 12, 13, 13, 13, 11, 12, 13, 13, 13, 11, 11, 12, 13, 13, 12, 13, 12, 13, 12, 12, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11,
  11, 11, 11, 12, 11, 10, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 14, 11, 10, 11, 9, 11, 10, 11, 11, 10, 11, 11, 9, 13, 11, 11, 10, 10, 11, 10, 11, 11, 11, 14, 13, 13, 13, 12, 13, 12, 13, 13, 13, 12, 13, 13, 12, 13, 12, 13, 13, 11, 13, 13, 14, 13, 13, 12, 13, 13, 13, 11, 13, 9, 13,
  13, 13, 12, 13, 13, 13, 13, 12, 13, 13, 11, 12, 13, 14, 13, 13, 12, 13, 14, 13, 12, 13, 13, 13, 13, 13, 12, 13, 11, 13, 13, 13, 13, 13, 12, 13, 11, 13, 13, 13, 13, 13, 14, 13, 13, 13, 13, 13, 11, 13, 13, 13, 12, 13, 13, 14, 13, 13, 12, 12, 12, 14, 13, 13, 12, 12, 14, 13, 12, 13, 12, 11, 13, 10,
  13, 13, 11, 10, 12, 13, 13, 14, 11, 12, 11, 12, 11, 13, 12, 12, 13, 12, 12, 12, 11, 12, 13, 12, 9, 11, 12, 12, 12, 12, 13, 11, 12, 13, 13, 12, 13, 13, 12, 10, 13, 12, 12, 13, 12, 13, 11, 13, 12, 10, 12, 12, 12, 13, 12, 10, 12, 12, 13, 12, 12, 12, 13, 13, 12, 11, 12, 12, 13, 13, 12, 13, 13, 10, 12,
  12, 12, 12, 13, 12, 13, 11, 12, 13, 12, 12, 13, 11, 13, 13, 12, 12, 12, 12, 11, 10, 12, 12, 12, 11, 12, 13, 13, 12, 11, 12, 12, 11, 12, 13, 13, 11, 13, 12, 11, 12, 13, 12, 12, 12, 11, 12, 13, 12, 11, 13, 12, 12, 12, 11, 13, 12, 12, 13, 11, 11, 12, 12, 12, 13, 11, 12, 12, 12, 13, 12, 12, 10, 12,
  12, 12, 12, 8, 12, 11, 12, 12, 13, 13, 12, 12, 12, 12, 13, 12, 12, 12, 12, 13, 12, 12, 12, 11, 12, 11, 12, 12, 12, 10, 12, 11, 12, 13, 12, 11, 12, 12, 12, 12, 11, 12, 12, 10, 11, 12, 12, 12, 12, 12, 12, 11, 12, 12, 10, 12, 13, 12, 12, 10, 12, 12, 10, 12, 12, 10, 11, 11, 11, 11, 10, 10, 10, 11, 11,
  11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 10, 11, 11, 10, 10, 11, 11, 11, 11, 11, 11, 10, 11, 10, 11, 10, 11, 11, 11, 11, 11, 11, 10, 11, 8, 11, 11, 11, 11, 11, 10, 11, 11, 11, 12, 13, 13, 11, 11, 11, 11, 11, 10, 11, 10, 13, 13, 12, 13, 13, 12, 12, 12, 13, 11, 13, 11, 12, 12, 11, 11, 12,
  12, 13, 13, 12, 10, 13, 12, 12, 12, 11, 12, 12, 12, 12, 13, 11, 13, 13, 13, 11, 13, 11, 12, 13, 11, 12, 12, 13, 13, 13, 13, 10, 13, 12, 12, 12, 13, 10, 11, 12, 13, 12, 12, 12, 12, 12, 12, 11, 12, 12, 12, 12, 12, 12, 12, 12, 10, 12, 13, 12, 11, 12, 12, 12, 12, 13, 12, 12, 11, 10, 11, 12, 12, 12,
  13, 12, 13, 12, 12, 10, 12, 12, 12, 9, 13, 12, 12, 10, 12, 13, 12, 12, 12, 11, 12, 13, 11, 12, 11, 12, 12, 11, 12, 12, 12, 12, 12, 11, 12, 12, 12, 12, 11, 12, 12, 12, 12, 10, 12, 12, 12, 12, 9, 12, 12, 11, 11, 12, 12, 12, 11, 12, 13, 12, 11, 12, 12, 12, 12, 12, 10, 12, 12, 12, 12, 12, 12, 12, 12,
  10, 12, 12, 10, 12, 12, 12, 11, 12, 12, 12, 12, 12, 11, 13, 12, 13, 11, 12, 12, 12, 12, 11, 10, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 12, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 8, 11, 11, 10, 11, 10, 11, 10, 11, 11, 11, 10, 11, 11, 11, 12, 11, 10, 11, 11, 11, 11, 11, 10, 10, 11, 10, 11,
  10, 11, 11, 11, 11, 11, 11, 11, 11, 10, 12, 13, 12, 11, 12, 12, 11, 12, 13, 13, 13, 12, 12, 12, 11, 12, 11, 13, 12, 12, 10, 12, 12, 12, 11, 11, 12, 12, 12, 11, 12, 12, 12, 12, 10, 12, 12, 11, 12, 12, 12, 11, 12, 12, 10, 12, 12, 12, 12, 11, 12, 12, 12, 12, 10, 11, 12, 13, 12, 11, 12, 11, 12, 12,
  12, 12, 12, 12, 13, 12, 12, 11, 12, 11, 12, 11, 12, 12, 12, 12, 13, 12, 12, 12, 11, 12, 10, 12, 12, 12, 11, 12, 12, 12, 12, 10, 12, 12, 10, 12, 11, 12, 11, 12, 10, 10, 12, 12, 11, 12, 11, 12, 11, 12, 11, 12, 12, 11, 12, 12, 12, 11, 12, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 11, 11, 12, 11, 12,
  12, 10, 11, 12, 12, 11, 12, 10, 10, 11, 12, 13, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 10, 9, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 10, 11, 11, 10, 11, 11, 10, 11, 11, 10, 11, 11, 11, 9, 11, 11, 11, 11, 8, 11, 11, 11, 11, 11, 13, 11, 8, 11, 12, 12, 12, 12,
  12, 12, 12, 12, 13, 12, 13, 12, 12, 12, 10, 12, 11, 12, 12, 11, 11, 12, 13, 12, 12, 11, 12, 12, 11, 12, 12, 12, 12, 12, 11, 12, 11, 11, 10, 12, 12, 12, 10, 12, 12, 11, 12, 11, 12, 12, 11, 12, 12, 10, 12, 12, 11, 11, 11, 12, 12, 12, 11, 11, 10, 12, 12, 12, 12, 12, 12, 12, 12, 12, 10, 11, 12, 12,
  11, 12, 12, 10, 12, 12, 12, 12, 10, 11, 12, 12, 11, 12, 10, 12, 12, 11, 12, 10, 10, 12, 12, 10, 12, 12, 11, 12, 12, 12, 12, 11, 12, 11, 12, 10, 12, 11, 12, 11, 12, 12, 12, 10, 12, 11, 12, 12, 12, 12, 11, 12, 11, 11, 10, 12, 11, 11, 11, 10, 10, 11, 11, 12, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11,
  11, 10, 11, 11, 11, 11, 11, 11, 11, 10, 10, 11, 11, 10, 10, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 9, 11, 11, 11, 10, 11, 11, 10, 11, 11, 12, 12, 12, 11, 12, 12, 12, 12, 12, 10, 12, 12, 12, 12, 12, 12, 9, 12, 11, 12, 12, 12, 10, 12, 13, 12, 10, 12, 12,
  12, 11, 12, 12, 11, 11, 11, 12, 12, 11, 12, 9, 12, 12, 12, 12, 12, 12, 12, 12, 11, 12, 11, 11, 10, 12, 12, 11, 12, 12, 12, 12, 10, 12, 11, 12, 12, 12, 12, 12, 11, 12, 11, 12, 12, 12, 11, 12, 11, 12, 10, 11, 11, 11, 11, 11, 10, 11, 11, 12, 11, 11, 12, 12, 12, 11, 11, 12, 12, 12, 11, 11, 10, 12, 10,
  11, 12, 12, 12, 9, 12, 11, 12, 10, 12, 11, 12, 11, 12, 12, 10, 10, 11, 10, 11, 10, 12, 12, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 10, 11, 11, 10, 11, 10, 11, 10, 11, 11, 11, 10, 11, 11, 11, 11, 10, 11, 10, 11, 11, 11, 10, 11, 10, 10, 11, 11, 11, 11, 10, 10, 11, 11, 11,
  11, 11, 11, 11, 8, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 10, 11, 10, 12, 11, 11, 11, 10, 11, 11, 11, 10, 11, 11, 11, 12, 12, 12, 12, 12, 10, 12, 11, 11, 10, 12, 12, 11, 11, 12, 10, 11, 12, 10, 12, 12, 10, 10, 12, 11, 11, 11, 11, 12, 11, 11, 12, 12, 11, 12, 12, 11, 12, 12, 12, 11, 12, 12, 12, 11,
  12, 10, 12, 12, 12, 12, 12, 10, 12, 10, 12, 11, 12, 11, 11, 11, 12, 10, 11, 10, 11, 12, 10, 11, 11, 11, 11, 11, 11, 12, 12, 10, 11, 12, 11, 8, 11, 10, 12, 12, 11, 12, 12, 12, 12, 11, 10, 12, 11, 10, 12, 12, 10, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11,
  10, 11, 11, 11, 11, 10, 11, 11, 11, 10, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 10, 11, 10, 11, 11, 11, 11, 11, 10, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 9, 11, 10, 10, 11, 11, 11, 11, 11, 12, 10, 11, 11, 10, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 10, 12,
  11, 10, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 9, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 10, 11, 11, 11, 11, 12, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 9, 11, 10, 11, 11, 11, 11,
  11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 10, 11, 10, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 10, 11, 11, 9, 11, 11, 10, 11, 11, 11, 10, 11, 11, 11, 11, 10, 12, 12, 10, 11, 12, 11, 12, 12, 12, 11, 12, 11, 12, 11, 11, 11, 11, 12,
  11, 11, 11, 11, 10, 12, 11, 10, 10, 11, 8, 10, 11, 11, 11, 11, 12, 11, 10, 10, 11, 11, 10, 11, 11, 12, 10, 12, 11, 12, 12, 11, 10, 11, 11, 10, 11, 11, 10, 10, 12, 11, 11, 11, 11, 10, 11, 12, 10, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 10, 11, 9, 11, 11, 10, 11, 11, 11, 12, 11, 12, 11, 11, 11, 11,
  10, 11, 11, 11, 10, 11, 10, 11, 11, 11, 11, 10, 11, 11, 11, 12, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 10, 11, 10, 11, 9, 11, 11, 11, 11, 11, 9, 11, 11, 11, 11, 10, 11, 11, 9, 11, 11, 11, 12, 10, 11, 11, 8, 11, 11, 11, 11, 10, 11, 11, 10, 11, 11, 10, 11, 11, 10, 11, 11, 9, 11, 11, 10, 11, 11,
  11, 10, 11, 11, 10, 11, 11, 11, 10, 11, 11, 10, 11, 8, 11, 11, 10, 11, 10, 11, 11, 10, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 10, 11, 11, 10, 11, 11, 11, 11, 9, 11, 10, 11, 11, 10, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 10, 11,
  10, 11, 11, 11, 11, 10, 11, 11, 10, 10, 11, 11, 10, 11, 11, 11, 10, 9, 11, 11, 11, 11, 11, 10, 10, 11, 11, 11, 11, 11, 11, 12, 12, 11, 10, 12, 11, 11, 11, 11, 11, 11, 12, 10, 12, 11, 10, 11, 11, 11, 11, 11, 11, 12, 11, 11, 11, 12, 12, 11, 11, 12, 11, 11, 11, 11, 12, 11, 12, 11, 11, 12, 10, 10, 11,
  11, 10, 10, 11, 11, 11, 11, 11, 12, 11, 11, 11, 11, 11, 10, 11, 11, 10, 11, 11, 11, 10, 11, 10, 11, 11, 11, 11, 11, 11, 11, 10, 10, 11, 12, 11, 11, 11, 11, 8, 11, 11, 11, 11, 11, 12, 10, 11, 11, 10, 11, 10, 11, 11, 10, 11, 11, 11, 11, 10, 11, 11, 11, 10, 11, 10, 11, 10, 11, 11, 11, 11, 8, 11, 11,
  11, 11, 11, 11, 10, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 9, 11, 11, 11, 11, 10, 11, 11, 10, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 9, 11, 11, 11, 10, 11, 10, 11, 10, 11, 10, 12, 10, 10, 11, 10, 11, 10, 11, 11, 12, 11, 11, 11, 11, 11,
  11, 11, 11, 11, 11, 11, 10, 11, 9, 11, 10, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 10, 11, 10, 11, 10, 11, 11, 10, 9, 11, 11, 11, 11, 11, 11, 11, 10, 11, 10, 11, 11, 11, 11, 11, 11, 11, 10, 11, 10, 11, 11, 11, 10, 11, 11, 11, 11, 11, 10, 11, 11, 11, 10, 11, 11, 10, 11, 11, 11, 11, 10, 11, 11, 11,
  9, 11, 10, 11, 12, 10, 11, 10, 11, 11, 9, 11, 11, 10, 11, 12, 10, 11, 10, 12, 11, 11, 11, 11, 11, 11, 10, 10, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 10, 11, 11, 11, 11, 11, 10, 11, 12, 10, 11, 11, 10, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 10, 11, 10, 11, 11, 11, 10, 11,
  11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 9, 11, 11, 10, 11, 11, 10, 11, 11, 11, 11, 10, 11, 11, 11, 10, 11, 11, 10, 11, 10, 11, 11, 10, 11, 10, 11, 10, 11, 10, 11, 11, 10, 11, 11, 11, 11, 11, 11, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 10, 10, 10, 10, 11, 10,
  11, 11, 11, 11, 11, 11, 8, 11, 11, 11, 11, 11, 11, 10, 10, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 10, 11, 11, 11, 10, 11, 10, 10, 11, 11, 10, 11, 10, 11, 11, 12, 8, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 10, 11, 11, 11, 11, 10, 11, 11, 10,
  8, 11, 11, 11, 11, 10, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 11, 10, 11, 11, 10, 11, 11, 11, 10, 11, 10, 11, 11, 11, 10, 11, 11, 11, 11, 11, 10, 11, 10, 11, 11, 11, 10, 10, 11, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 10, 12, 11, 11, 11, 11, 11, 10,
  11, 11, 11, 11, 11, 8, 11, 11, 11, 10, 11, 11, 10, 11, 11, 11, 10, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 10, 11, 11, 10, 11, 11, 11, 11, 10, 11, 10, 11, 11, 11, 11, 12, 11, 11, 10, 11, 11, 10, 10, 11, 11, 11, 11, 10, 10, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 10, 11, 11, 11, 11, 11, 10,
  11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, 10, 11, 10, 11, 11, 11, 10, 11, 11, 11, 9, 11, 10, 10, 11, 11, 11, 10, 11, 11, 11, 9, 11, 11, 11, 10, 11, 11, 11, 12, 11, 8, 11, 11, 11, 9, 10, 11, 11, 11, 10, 11, 11, 11, 11, 12, 11, 11, 10, 11, 11, 12, 11, 11, 11, 12, 12, 11, 11, 11, 11, 11, 8, 11,
  11, 10, 11, 11, 11, 10, 11, 9, 10, 11, 11, 11, 11, 11, 11, 10, 11, 10, 11, 11, 10, 10, 11, 11, 10, 11, 11, 11, 11, 10, 11, 11, 10, 11, 11, 8, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 10, 11, 11, 10, 11, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 12, 10, 9, 11, 11, 11, 11,
  11, 11, 10, 11, 10, 11, 11, 10, 11, 11, 11, 11, 11, 10, 11, 11, 10, 11, 11, 11, 10, 11, 11, 10, 11, 11, 11, 11, 11, 11, 12, 11, 12, 11, 11, 11, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 10, 12, 11, 11, 11, 10, 11, 10, 10, 11, 11, 11, 10, 10, 11, 10, 11, 10, 10, 11, 11, 11, 11, 11, 11, 9,
  11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 11, 11, 11, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 9, 12, 11, 11, 11, 10, 11, 11
];

let flowMinLevels2 = [
  11, 11, 12, 12, 11, 13, 12, 13, 12, 13, 11, 12, 11, 11, 13, 11, 11, 14, 11, 15, 12, 12, 14, 14, 13, 14, 12, 14, 13, 14, 13, 14, 14, 11, 14, 13, 15, 12, 15, 13, 14, 15, 14, 12, 14, 13, 14, 13, 14, 12, 14, 14, 12, 14, 13, 14, 13, 15, 15, 15, 14, 12, 14, 13, 14, 15, 11, 14, 13, 14, 12, 14, 13, 14,
  12, 15, 15, 15, 15, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 13, 14, 14, 14, 13, 14, 12, 14, 13, 15, 15, 12, 15, 15, 13, 14, 12, 14, 15, 13, 15, 15, 13, 14, 12, 14, 13, 14, 14, 15, 12, 15, 15, 14, 15, 12, 15, 15, 13, 15, 14, 15, 13, 15, 14, 15, 11, 15, 14, 15, 14, 15, 15, 14,
  15, 14, 15, 11, 15, 15, 13, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 11, 15, 15, 13, 15, 15, 12, 15, 14, 15, 14, 15, 12, 15, 13, 15, 14, 15, 14, 15, 11, 14, 13, 14, 12, 14, 15, 13, 14, 15, 11, 14, 13, 14, 12, 14, 13, 14, 15, 11, 15, 14, 15, 15, 12,
  15, 14, 15, 13, 15, 15, 15, 14, 15, 13, 15, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 15, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 14, 11, 14, 13, 15, 15, 12, 15, 14, 15, 13, 15, 15, 11, 15, 14, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 12, 14,
  13, 14, 13, 14, 11, 14, 13, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 13, 14, 12, 14, 14, 15, 12, 15, 15, 13, 15, 14, 12, 14, 13, 15, 14, 15, 12, 14, 13, 14, 14, 12, 14, 13, 14, 15, 11, 14, 13, 14, 13, 14, 14, 13, 14, 14, 12, 15, 14, 15, 11, 15, 14, 15, 14, 12, 14, 15, 13, 15, 12, 15, 15, 15,
  12, 15, 14, 15, 15, 12, 15, 15, 13, 15, 14, 14, 13, 14, 12, 14, 15, 14, 12, 14, 13, 14, 13, 14, 14, 15, 13, 14, 12, 14, 13, 14, 13, 15, 15, 15, 15, 14, 13, 14, 13, 14, 14, 11, 14, 15, 15, 15, 12, 15, 15, 13, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 15, 12, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15,
  12, 14, 15, 13, 15, 11, 15, 13, 15, 15, 12, 15, 15, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15, 14, 15, 13, 15, 14, 15, 11, 15, 14, 15, 15, 12, 15, 15, 13, 15, 14, 14, 14, 14, 11, 14, 13, 14, 12, 15, 13, 14, 12, 14, 13, 14, 13, 14, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14,
  13, 14, 12, 14, 13, 14, 14, 13, 15, 14, 13, 14, 13, 15, 15, 11, 15, 14, 15, 15, 12, 15, 15, 13, 14, 15, 14, 15, 15, 12, 15, 13, 15, 12, 15, 15, 13, 14, 14, 12, 14, 14, 11, 13, 14, 12, 14, 13, 14, 13, 14, 13, 14, 13, 12, 14, 13, 14, 12, 14, 13, 14, 12, 12, 14, 13, 12, 14, 13, 14, 11, 13, 14, 12,
  14, 13, 14, 12, 14, 13, 14, 13, 14, 13, 14, 14, 14, 14, 14, 11, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 11, 14, 14, 14, 13, 14, 13, 12, 13, 11, 13, 12, 12, 13, 12, 11, 12, 9, 12, 12, 10, 13, 12, 12, 11, 12, 11, 12, 11, 13, 12, 12, 13, 12, 12, 11, 12, 12, 10, 12, 12, 11, 12, 11, 12, 12, 10, 12,
  9, 12, 11, 12, 12, 10, 12, 11, 12, 11, 12, 11, 12, 13, 12, 12, 12, 11, 12, 12, 10, 12, 11, 12, 12, 12, 12, 12, 13, 12, 12, 12, 11, 12, 12, 13, 13, 11, 12, 11, 12, 13, 11, 12, 12, 13, 12, 11, 12, 13, 11, 13, 13, 11, 13, 13, 11, 13, 13, 11, 13, 12, 13, 12, 13, 11, 13, 13, 11, 13, 13, 11, 13, 12, 13,
  13, 13, 12, 13, 12, 13, 12, 13, 12, 13, 13, 10, 13, 13, 11, 13, 13, 11, 13, 13, 11, 13, 13, 11, 13, 13, 11, 13, 12, 13, 13, 11, 15, 15, 11, 13, 12, 13, 12, 13, 12, 13, 13, 13, 12, 13, 11, 13, 12, 13, 12, 13, 12, 13, 11, 14, 12, 13, 11, 13, 12, 13, 12, 14, 15, 11, 15, 12, 13, 12, 13, 13, 11, 13,
  12, 13, 13, 13, 13, 12, 13, 11, 14, 15, 12, 14, 12, 13, 14, 11, 14, 15, 14, 15, 11, 14, 14, 14, 13, 15, 15, 11, 15, 15, 12, 15, 15, 12, 14, 13, 14, 11, 15, 15, 12, 15, 15, 15, 15, 12, 15, 15, 12, 15, 15, 12, 14, 13, 14, 14, 15, 15, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14,
  13, 14, 15, 15, 12, 14, 13, 14, 14, 11, 14, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 13, 14, 14, 13, 14, 13, 12, 14, 13, 14, 12, 14, 13, 14, 15, 12, 15, 15, 12, 14, 13, 14, 13, 14, 13, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 14, 11, 14, 15, 15, 15, 15, 16,
  11, 15, 15, 12, 15, 15, 12, 15, 15, 12, 14, 13, 15, 15, 11, 15, 15, 12, 15, 15, 12, 15, 15, 12, 15, 15, 12, 15, 15, 12, 15, 15, 12, 14, 15, 15, 12, 15, 15, 12, 15, 15, 12, 14, 13, 14, 11, 15, 15, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 13, 15, 15, 12, 14,
  14, 11, 14, 14, 12, 14, 14, 12, 14, 13, 14, 13, 14, 13, 14, 14, 12, 14, 13, 14, 12, 14, 13, 14, 13, 14, 12, 14, 14, 15, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 13, 14, 14, 14, 13, 14, 12, 14, 13, 14, 12, 14, 14, 15, 12, 14, 15, 13, 14, 14, 12, 14, 13, 14, 12, 14, 13, 14, 15, 14, 15, 13,
  15, 14, 15, 13, 15, 14, 14, 11, 15, 15, 15, 15, 14, 15, 12, 14, 15, 14, 15, 15, 12, 15, 14, 15, 14, 15, 14, 15, 13, 15, 14, 15, 15, 12, 15, 13, 15, 15, 12, 15, 14, 15, 14, 15, 15, 14, 15, 13, 15, 14, 15, 15, 15, 13, 15, 14, 15, 13, 15, 14, 14, 15, 13, 15, 14, 13, 15, 14, 15, 15, 15, 13, 15, 15,
  13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15, 13, 15, 15, 13, 15, 14, 13, 15, 11, 14, 15, 15, 15, 12, 15, 15, 13, 15, 15, 15, 15, 12, 15, 14, 15, 15, 12, 15, 15, 13, 15, 14, 15, 13, 15, 15, 12, 15, 14, 15, 15, 14, 13, 15, 15, 13, 15, 14, 15, 15, 12, 15, 15, 13, 15,
  15, 12, 15, 15, 13, 15, 14, 15, 14, 15, 11, 15, 14, 15, 15, 12, 15, 14, 15, 15, 12, 15, 15, 13, 15, 15, 15, 14, 15, 15, 13, 15, 15, 13, 15, 15, 11, 15, 15, 15, 15, 12, 15, 14, 15, 15, 12, 15, 14, 13, 15, 15, 12, 15, 14, 15, 15, 12, 15, 15, 13, 15, 14, 14, 15, 15, 14, 14, 14, 12, 14, 13, 14, 12,
  14, 13, 14, 14, 14, 13, 15, 15, 12, 15, 15, 13, 15, 14, 15, 14, 15, 12, 15, 15, 15, 12, 14, 15, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 12, 15, 15, 13, 15, 14, 15, 14, 15, 12, 14, 14, 13, 14, 12, 14, 13, 14, 11,
  14, 13, 14, 12, 15, 15, 13, 15, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 14, 11, 14, 15, 14, 13, 14, 12, 14, 13, 14, 12, 14, 15, 13, 14, 15, 13, 15, 15, 13, 15, 15, 11, 14, 15, 15, 11, 15, 15, 15, 15, 12, 15, 15, 13, 15, 13, 15, 15, 13, 15, 14, 15, 11, 15, 14, 15, 15, 12, 14, 13, 15, 14,
  15, 13, 15, 15, 11, 15, 14, 15, 15, 12, 15, 15, 15, 15, 12, 15, 15, 13, 15, 14, 15, 12, 15, 14, 15, 15, 12, 15, 15, 15, 12, 15, 15, 13, 15, 14, 15, 15, 13, 15, 14, 15, 15, 12, 15, 14, 13, 14, 12, 15, 15, 15, 15, 12, 15, 14, 14, 12, 14, 13, 15, 14, 15, 13, 15, 15, 11, 15, 15, 13, 15, 15, 14, 15,
  12, 15, 14, 15, 15, 15, 13, 14, 15, 13, 15, 14, 15, 13, 14, 15, 12, 15, 15, 15, 15, 12, 15, 14, 14, 15, 12, 15, 14, 14, 15, 12, 15, 15, 13, 15, 14, 15, 13, 15, 15, 12, 15, 15, 13, 15, 14, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 12, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 13, 15,
  15, 11, 15, 14, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 12, 15, 15, 13, 15, 15, 11, 15, 15, 13, 15, 15, 12, 15, 15, 15, 14, 12, 15, 15, 13, 15, 15, 13, 15, 15, 12, 15, 14, 15, 15, 12, 15, 15, 13, 15, 14, 13, 14, 15, 13, 15, 14, 13, 14, 15, 13, 14, 15, 15, 12, 14, 13, 15, 15,
  13, 15, 15, 13, 14, 15, 13, 15, 14, 15, 15, 12, 15, 15, 13, 15, 15, 12, 15, 15, 13, 14, 15, 13, 14, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 13, 14, 14, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 14, 12, 14, 13, 14, 12, 15, 15, 14, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 14, 11,
  14, 13, 14, 12, 14, 13, 14, 14, 15, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 14, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 13, 15, 14, 15, 14, 15, 12, 15, 14, 15, 15, 12, 15, 15, 15, 15, 12, 15,
  15, 15, 15, 12, 15, 15, 13, 15, 14, 15, 13, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 14, 15, 13, 15, 14, 15, 12, 14, 13, 14, 9, 14, 13, 14, 12, 14, 13, 14, 13, 14, 12, 14, 13, 14, 13, 15, 13, 14, 14, 12, 14, 13, 14, 12, 14, 15, 14, 12, 14, 13, 14, 13, 15, 11, 14, 13,
  14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 15, 11, 15, 15, 12, 15, 15, 11, 14, 15, 15, 14, 11, 14, 15, 15, 15, 11, 15, 15, 12, 15, 14, 11, 14, 15, 14, 15, 11, 15, 12, 13, 11, 13, 12, 14, 15, 15, 15, 13, 14, 14, 11, 15, 12, 13, 12, 13, 12, 13, 12, 13, 13, 11, 13, 12, 14, 11, 13, 14, 15,
  11, 15, 15, 12, 14, 13, 14, 11, 15, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 15, 15, 14, 13, 15, 11, 15, 14, 15, 15, 15, 13, 15, 15, 11, 15, 14, 15, 15, 14, 15, 13, 15, 15, 11, 15, 15, 13, 15, 15, 12, 15, 15, 15, 15, 12, 15, 15, 13, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15, 15, 12, 15, 14, 15,
  15, 11, 15, 15, 13, 15, 15, 13, 15, 14, 15, 12, 14, 15, 15, 12, 15, 15, 13, 15, 14, 15, 12, 15, 15, 13, 15, 15, 12, 15, 15, 15, 12, 15, 15, 13, 15, 15, 12, 15, 14, 15, 15, 12, 15, 14, 15, 15, 11, 15, 14, 15, 15, 12, 15, 15, 13, 15, 14, 15, 11, 15, 15, 13, 15, 15, 12, 15, 15, 13, 15, 14, 15, 13,
  15, 14, 15, 12, 15, 15, 13, 15, 15, 13, 15, 14, 15, 13, 15, 14, 15, 12, 15, 14, 13, 15, 14, 15, 13, 15, 15, 12, 15, 15, 13, 15, 15, 11, 15, 15, 13, 15, 15, 12, 15, 13, 15, 14, 15, 15, 13, 15, 15, 12, 15, 13, 15, 14, 11, 15, 15, 13, 15, 15, 12, 15, 13, 15, 15, 12, 15, 13, 15, 15, 13, 15, 14, 15,
  13, 15, 15, 13, 15, 15, 13, 15, 12, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 13, 15, 12, 15, 15, 13, 15, 15, 13, 15, 15, 15, 14, 15, 14, 15, 12, 11, 15, 15, 13, 15, 15, 13, 15, 14, 15, 11, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 14, 15, 14, 15, 13, 15, 14, 15, 14, 15, 15,
  13, 15, 15, 13, 15, 14, 15, 13, 15, 13, 14, 15, 13, 15, 15, 13, 15, 13, 15, 15, 13, 15, 14, 15, 13, 15, 15, 13, 15, 14, 15, 12, 15, 15, 13, 15, 15, 13, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 12, 15, 15, 13, 15, 15, 13, 15, 14, 15, 13, 15, 14, 15, 13, 15, 14, 15, 13, 15, 14,
  15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 15, 12, 15, 14, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15, 15, 11, 15, 14, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 12, 15, 15, 15, 15, 11, 15, 14, 15, 15, 12, 15, 14, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 12, 15, 14, 15, 15, 12, 15, 15, 13, 15,
  14, 15, 15, 13, 15, 15, 13, 15, 15, 12, 15, 15, 13, 15, 15, 12, 15, 15, 13, 15, 14, 15, 15, 13, 15, 15, 12, 15, 15, 13, 15, 14, 15, 15, 13, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 15, 15, 13, 15, 15, 12, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 13, 15, 15, 12, 15, 13, 15, 15, 13, 15,
  15, 13, 15, 15, 13, 14, 15, 14, 15, 12, 15, 14, 15, 15, 13, 15, 14, 12, 14, 13, 14, 13, 14, 13, 14, 14, 12, 14, 14, 14, 15, 13, 14, 12, 14, 13, 14, 12, 14, 14, 12, 14, 13, 14, 13, 14, 13, 14, 14, 12, 14, 13, 14, 12, 14, 14, 13, 14, 13, 13, 15, 15, 11, 14, 14, 15, 12, 15, 15, 13, 15, 14, 15, 13,
  15, 14, 15, 13, 14, 15, 13, 15, 15, 13, 15, 14, 15, 14, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 13, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 14, 15, 15, 12, 15, 15, 13, 15, 14, 12, 15, 15, 13, 15, 14, 15, 14, 15, 12, 15, 15, 13, 15, 15, 13, 15, 14, 15, 13, 15, 15, 13, 15, 15,
  13, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15, 14, 15, 14, 15, 14, 15, 13, 15, 14, 15, 13, 15, 15, 13, 15, 14, 15, 14, 15, 15, 15, 13, 15, 15, 12, 15, 14, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 12, 15, 13, 15, 15, 15, 14, 15, 13, 15, 15, 13, 15, 14, 15, 12, 15, 14, 15, 15, 12, 15, 14,
  15, 13, 15, 14, 15, 12, 15, 14, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 14, 15, 15, 12, 15, 15, 13, 14, 15, 13, 15, 15, 13, 14, 15, 13, 15, 15, 13, 15, 15, 12, 14, 15, 15, 15, 12, 14, 13, 15, 15, 13, 15, 15, 13, 15, 15, 12, 15, 14, 15, 15, 12, 15, 14, 14, 15, 12, 15, 15, 13,
  15, 14, 15, 12, 15, 14, 15, 14, 12, 15, 15, 14, 15, 12, 14, 15, 13, 14, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 15, 14, 12, 14, 15, 14, 12, 14, 13, 14, 12, 14, 14, 14, 14, 13, 14, 12, 14, 14, 12, 14, 13, 14, 14, 10, 14, 13, 14, 13, 14, 11, 14, 14, 12, 14, 13,
  14, 13, 14, 13, 14, 14, 10, 14, 13, 15, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 15, 14, 12, 14, 13, 15, 15, 13, 14, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 12, 15, 15, 12, 15, 15, 12, 15, 15, 12, 15, 15, 12, 15, 15, 12, 14, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14,
  13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 14, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 13, 12, 14, 14, 15, 11, 15, 13, 14, 12, 14, 14, 12, 14, 15, 13, 15, 14, 15, 13, 15, 15, 13, 15, 14, 15, 11, 14, 15, 15, 12, 15, 14, 15, 14, 12, 15, 14, 15, 15, 12, 15, 15, 13, 15, 14, 14,
  15, 12, 15, 15, 14, 15, 12, 15, 15, 13, 15, 15, 15, 14, 15, 12, 15, 14, 15, 13, 15, 14, 15, 14, 15, 15, 15, 15, 12, 15, 15, 15, 14, 15, 12, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 13, 15, 15, 12, 15, 14, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15, 14, 15,
  12, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 12, 15, 15, 13, 15, 15, 13, 15, 14, 15, 12, 15, 15, 13, 15, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 12, 14, 13, 14, 14, 14, 15, 12, 15, 14, 15, 15, 12, 15, 14, 14, 12, 14, 13, 14, 12, 14, 14, 15, 14, 13, 15, 15, 13, 15, 14, 15, 14, 15, 14,
  15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 11, 15, 15, 13, 15, 14, 15, 12, 15, 14, 15, 14, 12, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 15, 13, 15, 15,
  12, 15, 14, 14, 15, 12, 15, 14, 13, 15, 15, 13, 15, 12, 14, 12, 14, 15, 14, 12, 14, 15, 14, 15, 12, 15, 14, 13, 14, 15, 13, 14, 15, 13, 15, 15, 12, 14, 15, 13, 14, 13, 14, 15, 12, 14, 15, 14, 11, 15, 14, 15, 15, 15, 15, 15, 15, 11, 15, 14, 15, 15, 12, 15, 15, 13, 15, 15, 12, 15, 15, 15, 15, 12,
  15, 15, 15, 15, 11, 14, 13, 15, 15, 13, 14, 15, 10, 15, 15, 13, 14, 15, 13, 14, 15, 11, 14, 14, 15, 12, 15, 14, 15, 15, 12, 15, 15, 13, 15, 14, 13, 15, 14, 15, 12, 15, 14, 15, 15, 11, 15, 14, 15, 15, 12, 15, 14, 15, 11, 15, 14, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15, 14, 15, 13, 15, 15, 13, 15,
  14, 14, 15, 13, 15, 15, 13, 14, 15, 11, 15, 15, 13, 15, 15, 13, 15, 14, 15, 11, 14, 15, 15, 15, 12, 15, 14, 15, 14, 15, 13, 15, 15, 12, 14, 15, 14, 12, 15, 14, 14, 15, 12, 15, 14, 13, 14, 13, 14, 13, 14, 12, 14, 13, 14, 13, 14, 13, 13, 14, 13, 14, 13, 14, 12, 15, 14, 13, 14, 14, 12, 14, 13, 14,
  13, 14, 13, 14, 13, 14, 14, 12, 14, 13, 14, 14, 15, 15, 12, 14, 13, 14, 12, 14, 13, 14, 12, 15, 13, 14, 12, 14, 13, 14, 13, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 11, 14, 14, 15, 15, 14, 14, 11, 14, 13, 15, 15, 15, 14, 11, 14, 13, 14, 12, 14, 13, 14, 11, 14, 14, 15, 15, 14, 14, 11, 15, 14,
  15, 15, 15, 15, 11, 15, 15, 12, 15, 15, 12, 15, 15, 12, 15, 15, 12, 15, 15, 12, 15, 15, 11, 15, 15, 12, 14, 13, 14, 11, 15, 15, 12, 15, 15, 12, 15, 15, 11, 15, 15, 12, 15, 15, 11, 15, 15, 12, 15, 15, 11, 15, 15, 12, 15, 14, 14, 11, 15, 14, 12, 15, 14, 12, 13, 13, 13, 12, 13, 12, 13, 13, 14, 14,
  11, 13, 12, 13, 11, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 11, 13, 12, 13, 15, 14, 11, 15, 14, 12, 14, 14, 13, 15, 14, 15, 11, 13, 14, 12, 15, 15, 12, 15, 15, 12, 15, 15, 15, 14, 11, 15, 15, 12, 15, 15, 11, 14, 14, 12, 14, 13, 14, 13, 14, 11, 14, 13, 14, 15, 14, 14, 11, 14, 13, 14,
  12, 14, 13, 14, 12, 14, 14, 15, 15, 15, 11, 14, 13, 14, 12, 14, 13, 14, 15, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 13, 14, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 13, 14, 12, 14, 14, 11, 14, 15, 12, 14, 15, 11, 14, 13, 14, 12, 13, 14, 11, 14, 13, 12, 14, 13, 14, 12, 14, 13, 14, 12,
  14, 13, 12, 14, 13, 14, 12, 14, 13, 14, 12, 13, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 15, 12, 14, 13, 15, 12, 15, 15, 15, 12, 15, 15, 13, 15, 11, 15, 13, 15, 15, 12, 15, 14, 15, 11, 15, 14, 13, 14, 13, 14, 12, 14, 14, 15, 15, 15, 14, 11, 14, 13, 14, 12, 14, 13, 14, 14, 14, 13, 15, 15, 15, 15,
  11, 15, 15, 12, 13, 11, 14, 14, 10, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 13, 13, 13, 12, 13, 11, 13, 12, 13, 11, 13, 12, 13, 12, 14, 15, 15, 14, 11, 14, 15, 15, 14, 12, 13, 12, 13, 12, 13, 13, 13, 13, 11, 13, 12, 13, 10, 13, 12, 13, 13, 12, 13, 12, 13, 13, 11, 13, 12, 13, 13, 12,
  13, 12, 13, 13, 14, 13, 12, 13, 12, 13, 13, 11, 13, 12, 13, 12, 13, 13, 13, 11, 13, 12, 13, 11, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 11, 13, 12, 13, 11, 13, 12, 13, 12, 13, 12, 15, 12, 15, 15, 12, 15, 15, 12, 15, 15, 11, 15, 15, 12, 15, 15, 12, 15, 15, 12, 14, 13, 14, 11, 15, 15,
  12, 14, 13, 14, 13, 14, 11, 15, 15, 12, 15, 15, 11, 15, 15, 12, 15, 15, 11, 15, 15, 12, 15, 15, 12, 14, 13, 14, 12, 14, 13, 14, 14, 14, 13, 14, 14, 14, 15, 12, 14, 13, 14, 13, 15, 13, 14, 13, 14, 12, 15, 15, 12, 14, 13, 14, 12, 14, 13, 14, 14, 12, 14, 13, 13, 14, 14, 12, 14, 13, 14, 11, 14, 13,
  14, 12, 14, 13, 14, 12, 14, 13, 14, 14, 14, 14, 11, 14, 13, 14, 12, 14, 13, 15, 14, 12, 14, 13, 14, 12, 14, 13, 14, 13, 14, 12, 15, 15, 15, 14, 15, 11, 14, 14, 15, 12, 15, 14, 15, 11, 15, 14, 15, 15, 12, 15, 15, 13, 15, 13, 15, 12, 15, 15, 13, 15, 14, 15, 14, 13, 14, 14, 12, 14, 14, 15, 11, 15,
  15, 13, 15, 15, 13, 15, 14, 15, 14, 15, 11, 15, 14, 15, 15, 12, 15, 13, 14, 14, 13, 15, 12, 15, 13, 14, 13, 14, 14, 15, 14, 15, 13, 15, 14, 16, 15, 15, 12, 15, 15, 13, 15, 15, 12, 15, 15, 13, 16, 15, 13, 15, 14, 15, 15, 13, 15, 14, 15, 12, 15, 14, 15, 13, 15, 14, 15, 13, 15, 12, 15, 14, 15, 13,
  15, 14, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15, 14, 15, 12, 15, 14, 15, 13, 15, 14, 15, 11, 15, 14, 15, 15, 14, 15, 12, 15, 14, 15, 13, 15, 14, 15, 13, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 12, 15, 15, 13, 15, 14, 15, 12, 15, 14, 15, 15, 13,
  15, 14, 15, 13, 16, 16, 14, 16, 15, 14, 15, 13, 15, 14, 15, 13, 15, 14, 15, 15, 12, 15, 14, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15, 15, 12, 15, 15, 13, 14, 15, 15, 14, 12, 14, 13, 14, 14, 11, 14, 13, 14, 12, 14, 15, 15, 15, 12, 15, 14, 15, 15, 15, 12, 15, 14, 15, 13, 15, 15, 13, 15, 13, 15, 14,
  15, 12, 15, 14, 15, 13, 15, 15, 13, 15, 15, 12, 15, 14, 15, 15, 12, 15, 15, 13, 15, 14, 15, 12, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 12, 15, 15, 13, 15, 14, 15, 14, 16, 14, 15, 12, 15, 13, 14, 14, 12, 14, 13, 14, 14, 14, 15, 15, 15, 14, 14, 11, 14, 13, 14, 12, 14, 14, 15, 12, 15,
  13, 14, 12, 14, 13, 14, 14, 11, 14, 13, 14, 14, 13, 14, 12, 14, 13, 14, 14, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 13, 14, 12, 14, 13, 15, 15, 11, 15, 15, 12, 15, 15, 11, 15, 15, 12, 15, 15, 12, 15, 15, 12, 14, 13, 14, 13, 14, 12, 15, 15, 12, 14, 13, 14, 15, 15, 12, 15, 15, 12, 14, 15,
  14, 11, 14, 15, 15, 14, 11, 15, 15, 12, 15, 15, 11, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 15, 14, 14, 14, 14, 15, 14, 14, 12, 13, 14, 12, 14, 14, 15, 14, 13, 12, 14, 13, 14, 12, 14, 13, 14, 12, 13, 14, 13, 14, 13, 14, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 14, 13, 14, 12, 15,
  15, 13, 15, 15, 12, 15, 14, 13, 15, 15, 13, 15, 15, 13, 15, 14, 13, 14, 15, 12, 15, 14, 15, 15, 12, 14, 14, 15, 12, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 15,
  15, 15, 14, 15, 15, 12, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 12, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 14, 14, 15, 15, 15, 15, 12, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15,
  14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 12, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 11, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 12, 13, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 16, 15, 13, 15, 16, 15, 13, 15, 15,
  15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 14, 15, 11, 15, 15, 13, 15, 15, 13, 15, 15, 11, 15, 14, 15, 15, 12, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 15, 15, 14, 15, 12, 15, 14, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 13, 15, 15,
  15, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 13, 13, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 13, 13, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 16, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 13, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 13,
  15, 11, 15, 15, 14, 15, 15, 15, 15, 12, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 12, 15, 15, 14, 15, 15, 15, 15, 12, 15, 15, 13, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 13, 15, 12, 15, 15,
  15, 14, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 13, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 12, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 14, 15, 15, 13, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15,
  13, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 13, 15, 14, 15, 15, 13, 13, 15, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 13, 14, 12, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 12, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 13, 13, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 14, 13, 14, 15, 14, 14, 14, 15, 14, 14, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 12, 15, 15, 14, 15,
  15, 15, 16, 15, 11, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 13, 12, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 14, 12, 15, 15, 15, 15, 13, 15, 12, 15, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 16, 14, 15, 15, 14, 10, 15, 14, 16, 14, 15, 16, 15, 15, 15, 15, 15, 16, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 14, 15, 15, 16, 15, 15, 15, 16, 14, 15, 15, 15, 15, 15, 15, 15, 16, 15, 15, 15, 15, 15, 16, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16, 16, 15, 16, 15, 15,
  15, 16, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 16, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 14, 15, 16, 15, 14, 15, 14, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 13, 15, 15, 15, 14, 15, 15, 16, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 16, 16, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 12, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15,
  15, 15, 15, 13, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 16, 15, 15, 15, 15, 15, 9, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15,
  14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 16, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14,
  15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 16, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 16, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 10, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16, 15, 13, 15, 15, 15, 16,
  15, 16, 14, 15, 14, 15, 14, 15, 16, 15, 15, 15, 15, 16, 15, 15, 14, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15,
  15, 14, 13, 15, 15, 10, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 14, 13, 14, 15, 15, 15, 15, 14,
  15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 16, 15, 16, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 16, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 16, 14, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16, 15, 15, 15, 15, 16, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15,
  13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 16, 16, 15, 15, 15, 15, 15, 15, 15, 16, 15, 15, 15, 15, 15, 15, 16, 16, 15, 16, 15, 15, 16, 15,
  15, 15, 10, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16, 15, 15, 11, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 14, 14, 14, 10, 15, 15, 13, 15, 10, 14, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 16, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  16, 15, 14, 13, 15, 15, 15, 15, 15, 16, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 13, 15, 15, 14, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 13, 14, 14, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 14, 15, 15,
  15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14,
  15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 15, 13, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 15, 15, 15, 15, 15, 13, 15, 15, 14, 15, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 13, 14, 14, 14, 15, 13, 15, 15, 14, 14, 15, 14,
  14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16, 15, 15, 15, 15, 16, 15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 14, 15, 14, 14, 15, 15, 15, 15, 16, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 10, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 9, 16, 15, 15, 15, 15, 14,
  15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 14, 14, 14, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 13, 15, 15, 14,
  15, 13, 15, 15, 14, 15, 13, 15, 14, 15, 14, 15, 14, 15, 13, 14, 15, 14, 13, 15, 15, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15,
  15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 14, 14, 15, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 14,
  14, 14, 14, 14, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 9, 14, 15,
  15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 16, 15, 15, 15, 16, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 14, 15, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 12, 15, 14, 15, 15, 14, 15, 15, 14, 14, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15,
  14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 10, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 14, 15, 14, 15, 15, 12, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 10, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 9, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15,
  14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 13, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15,
  15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15,
  15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 14, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 14, 14, 14, 14, 14, 15, 13, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15,
  14, 15, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 14, 14, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14,
  15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15,
  14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15,
  14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 12, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 14, 14, 15,
  14, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15,
  14, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 14, 15, 14, 15, 15, 14, 14, 14, 14, 14, 14, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 13, 15, 15, 14, 15, 14, 15, 15,
  15, 15, 14, 15, 15, 14, 15, 14, 15, 13, 15, 14, 15, 14, 14, 15, 14, 14, 15, 15, 13, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 13, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 13, 15, 14, 15, 14, 15, 15, 14, 15, 14, 14, 15, 15, 14, 14, 14, 13, 15, 14, 15, 14, 15,
  15, 14, 15, 15, 14, 15, 13, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 14, 14, 14, 15, 14, 15, 15, 13, 15, 14, 14, 14, 13, 14, 15, 15, 13, 15, 15, 14, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 14, 15, 15, 15, 15, 10, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 13, 14, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 12, 14, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15,
  14, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15,
  15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 11, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 12, 14, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 14,
  15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15,
  14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 14,
  15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15,
  14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 16, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 12, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 14, 15, 14, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15,
  13, 15, 14, 14, 15, 14, 15, 15, 14, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15,
  15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15,
  15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15,
  15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 16, 14, 14, 14, 14, 14, 14, 15, 13, 15, 15, 13, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15,
  15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 13, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  14, 15, 15, 15, 10, 15, 15, 14, 15, 15, 14, 15, 15, 9, 15, 15, 14, 14, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15,
  15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 12, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15,
  14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 13,
  14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 10, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 10, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 14, 13, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 13, 15, 15, 14, 15, 15,
  14, 15, 14, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 13, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14,
  15, 14, 14, 14, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 13, 15, 14, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 13, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15,
  14, 15, 13, 15, 15, 14, 15, 14, 14, 15, 14, 15, 14, 15, 13, 15, 15, 15, 15, 15, 14, 14, 15, 15, 14, 15, 15, 15, 14, 14, 15, 15, 15, 15, 14, 15, 13, 14, 15, 14, 14, 15, 14, 14, 14, 10, 14, 14, 15, 15, 14, 14, 14, 15, 14, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15,
  15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 13, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 14, 13, 14, 15, 15, 14, 15, 15, 16, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15,
  14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 13, 15, 14, 14, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 13, 15, 14, 13, 15, 14, 13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 14, 15, 15, 13, 15, 15, 14, 15, 14, 15, 13, 15, 14, 15, 14, 15, 14, 15, 15, 14,
  15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 14, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15,
  15, 12, 15, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 16, 14, 15, 14, 15, 15, 15, 15, 15, 15, 9, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14,
  15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 13, 15, 14, 15, 14, 15, 13, 15, 14, 15, 15, 14, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15,
  15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 14, 14, 15, 15, 15, 8, 14, 15, 14, 15, 15, 15, 14, 15, 14, 14, 14, 14, 13, 15, 15, 13, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 8, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 14, 13, 14, 15, 13,
  15, 14, 15, 13, 14, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 10, 14, 15, 14, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15,
  15, 15, 15, 14, 14, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 14,
  15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 13, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 16, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14,
  15, 15, 14, 15, 15, 15, 14, 14, 15, 15, 14, 15, 15, 14, 15, 13, 15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 13, 14, 15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 13, 15, 14, 14, 15, 15, 15, 15, 14, 14, 14, 15, 15, 14, 14, 14, 15, 15, 15, 15, 15, 15, 14, 14, 14, 13, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15,
  15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 14, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 14, 16, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 13, 15,
  15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 13, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 13, 15, 14, 14, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 14, 14, 15, 14, 15, 15, 15, 15, 15, 14, 14, 15, 14, 15, 15, 15,
  15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 9, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 13, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15,
  14, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 10, 15, 14, 15, 14, 15, 13, 15, 15, 15, 15, 14, 15, 15, 10, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 14, 15, 15, 14, 15, 14, 14, 15, 15, 14, 15, 15, 15, 14, 14, 13, 15, 15, 14, 14, 15, 14, 15, 15, 15, 13, 14, 15, 14, 15, 14,
  15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 13, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 14, 15, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 14, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15,
  15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 14, 15, 14, 14, 15, 14, 13, 15, 15, 14, 14, 15, 14, 15, 14, 15, 14, 14, 14, 15, 14, 15, 15, 15, 15, 14, 14, 13, 14, 15, 15, 14, 13, 14, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 14, 15, 14, 14, 15, 15, 14, 15, 15, 14, 15, 10, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 14, 15, 14, 16, 14, 15, 14, 15, 14, 15,
  14, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 13, 14, 15, 15, 14, 14, 13, 15, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 13, 14, 13, 15, 14, 14, 14, 15, 14, 15, 14, 15, 14, 14, 14, 14, 15, 13, 15, 14, 14, 15, 13, 15, 14, 14, 15, 15, 15, 14, 15, 15, 14, 15, 13,
  15, 15, 15, 13, 15, 14, 15, 13, 14, 15, 14, 15, 13, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 13, 15, 15, 15, 14, 15, 15, 10, 15, 14, 15, 15, 13, 14, 15, 15, 14, 14, 14, 15, 15, 14, 14, 15, 14, 15, 15, 13, 14, 14, 14, 13, 14, 13, 15, 15, 15, 14, 14, 14, 9, 14, 14, 14,
  13, 15, 15, 15, 14, 14, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 9, 15, 14, 15, 14, 15, 14, 15, 15, 15, 14, 15, 10, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15,
  14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 14, 15, 13, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 13, 15, 15, 14, 15, 15, 15, 14,
  15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 14, 14, 15, 14, 15, 13, 14, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 13, 14, 13, 14, 15, 15, 15, 14, 14, 12, 15, 15, 14,
  15, 15, 15, 15, 14, 14, 15, 14, 15, 14, 14, 14, 15, 13, 15, 15, 13, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15,
  14, 14, 13, 15, 15, 14, 14, 14, 15, 14, 15, 14, 14, 14, 14, 14, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 13, 15, 15, 14, 15, 15, 14, 15, 14, 15, 13, 15, 14, 15, 10,
  15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 14, 13, 15, 15, 14, 14, 15, 14, 14, 14, 13, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14,
  15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 10, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 13, 15, 14, 15, 13, 15, 15, 14, 15, 14, 15, 14, 15, 15, 13, 15, 15, 13, 15, 15,
  15, 15, 14, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 15, 13, 15, 14, 15, 15, 15, 13, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 12, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 14, 15, 15, 14, 14, 15, 15, 15, 15, 14, 14, 14, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 13, 15, 14, 15, 15, 15, 15, 15, 14, 15, 13, 15, 14, 15, 13, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15,
  15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 13, 14, 15, 13, 14, 13, 14, 14, 14, 13, 14, 14, 15, 14, 13, 14, 14, 14, 13, 14, 14, 15, 14, 15, 14, 15, 13, 14, 15, 14, 15, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 15, 15, 14, 13, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 13, 14, 15,
  14, 10, 14, 13, 14, 14, 15, 14, 15, 13, 15, 14, 14, 14, 14, 13, 14, 14, 14, 14, 15, 15, 9, 14, 14, 14, 15, 15, 14, 14, 14, 15, 13, 15, 15, 14, 13, 15, 14, 15, 15, 15, 15, 14, 14, 15, 14, 14, 15, 14, 14, 15, 15, 15, 14, 15, 15, 14, 15, 14, 14, 14, 14, 14, 14, 15, 15, 15, 13, 14, 14, 15, 14, 15, 14,
  14, 14, 14, 14, 14, 14, 15, 15, 15, 14, 13, 15, 15, 13, 15, 15, 15, 14, 15, 13, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 13, 15, 14, 15, 13, 15, 14, 15, 13, 15, 14, 15, 13, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 13, 15, 15,
  15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 14, 15, 13, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14,
  15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 15, 14, 15, 15, 12, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15,
  15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 14, 15, 14, 15, 15, 15, 13, 15, 15, 14, 15, 15, 14,
  15, 15, 13, 15, 15, 14, 15, 15, 13, 14, 15, 14, 15, 13, 15, 15, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 13, 15, 15, 13, 14, 15, 14, 15, 15, 14, 14, 15, 13, 15, 15, 13, 15, 14, 14, 13, 14, 15, 14, 13, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 15,
  13, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 13, 15, 14, 15, 13, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14,
  15, 14, 15, 14, 15, 16, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 14, 15, 14, 15, 13, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 13, 15, 14, 15, 14, 15, 14, 15, 13, 15, 14, 15, 15, 15, 15, 15, 14, 15, 13, 15, 14, 15, 14, 15, 14, 15,
  12, 15, 14, 15, 13, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 14, 14, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 14, 15, 13, 15, 15, 13, 14, 15, 14, 15, 13, 14,
  15, 15, 15, 15, 15, 13, 14, 15, 14, 15, 13, 15, 14, 15, 15, 15, 14, 15, 15, 12, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 13, 15, 14, 15, 13, 15, 14, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 14, 13, 15, 14, 15, 13, 14, 15, 12, 15, 13, 15, 15, 14, 15, 14,
  15, 14, 15, 14, 15, 14, 15, 13, 15, 14, 13, 14, 14, 14, 13, 14, 13, 15, 14, 14, 14, 14, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 14, 15, 15, 13, 15, 14, 15, 15, 13, 15, 14, 14, 15, 14, 15, 15, 13, 14, 14, 14, 15, 15, 13, 15, 15, 14, 14, 14, 15, 15, 15, 15, 10, 14, 14, 14, 14,
  14, 13, 14, 14, 15, 15, 14, 14, 15, 14, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 14, 14, 14, 15, 14, 14, 12, 14, 13, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 14, 13, 15, 13, 14, 14, 13, 14, 14, 15, 14, 14,
  15, 14, 12, 14, 14, 13, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 13, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 13, 15, 14, 15, 13, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 13, 15, 14, 14, 14, 14, 15, 15, 15, 11, 15, 15, 13, 15, 14, 15, 14, 15, 13, 15,
  15, 13, 15, 15, 13, 15, 15, 14, 15, 15, 15, 14, 15, 13, 12, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 11, 15, 15, 15, 13, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 13, 15, 13, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 14, 15, 13, 15, 14, 15, 14, 15, 15, 14, 15, 15,
  15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 14, 15, 13, 15, 14, 15, 13, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 13, 15, 14, 15, 14, 15, 14, 15, 15,
  15, 14, 15, 12, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 13, 15, 14, 15, 15, 14, 13, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 14, 15, 15, 13, 15, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15,
  15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 13, 15, 15, 15, 15, 13, 15,
  15, 13, 15, 14, 15, 12, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 10, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 14, 15, 15, 14, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15,
  15, 15, 15, 14, 15, 15, 14, 15, 13, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 14, 15, 12, 15, 14, 15, 14, 16, 14, 15, 14, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 13, 15, 14, 15, 15, 15, 14, 15, 13, 15, 15,
  14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 13, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 14, 15, 14, 15, 15, 14, 15, 15, 16, 15, 14, 15, 15, 14, 15, 10, 15, 14, 15, 15, 15, 15, 15, 15, 14, 10, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 14,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 13, 15, 15, 13, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15,
  15, 14, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 10, 15, 15, 15, 13, 15, 14, 15, 15, 14, 15, 14, 14, 14, 15, 10, 14, 13, 14, 14, 15, 14, 15, 15, 14, 14, 14, 14, 9, 14, 15, 15, 14, 15, 13,
  15, 14, 15, 14, 15, 13, 14, 13, 14, 13, 15, 14, 15, 14, 14, 15, 14, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 13, 14, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 10, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 13, 14,
  15, 14, 15, 15, 14, 15, 15, 13, 14, 15, 14, 14, 15, 15, 14, 15, 14, 14, 15, 15, 15, 15, 9, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 14, 14, 15, 10, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 12, 15, 14, 15, 15, 13, 14, 15, 15, 15, 15, 15,
  13, 14, 15, 15, 13, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 12, 15, 14, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 9, 15, 15, 15, 15, 14, 15, 15, 15, 15, 13, 14, 15, 14, 15, 14, 15, 15, 13, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 14, 14, 15, 15, 14, 15, 15, 15, 15, 15,
  14, 14, 14, 13, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 14, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 14,
  15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 13, 14, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 13, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 15, 15,
  15, 14, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 14, 15, 13, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 13, 15, 15, 13, 15, 15, 13, 15, 14, 12, 14, 15, 15, 15, 15, 14,
  15, 15, 15, 13, 15, 15, 15, 15, 13, 13, 15, 15, 15, 13, 14, 15, 15, 15, 14, 14, 14, 15, 14, 12, 14, 15, 15, 14, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 10, 14, 15, 15, 15, 14, 15, 14, 14, 15, 15, 15, 15, 15, 14, 15, 14, 14, 14, 14, 14,
  15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 10, 14, 15, 15, 15, 14, 14, 14, 14, 14, 15, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15,
  15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 14, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 13, 15, 15, 15, 14, 15, 15, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 15, 15, 15, 15, 13, 14, 13, 15, 15, 15, 13, 15, 15, 13, 15, 13, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 14, 15,
  13, 15, 14, 15, 14, 15, 15, 14, 15, 14, 14, 14, 14, 13, 15, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 14, 14, 14, 15, 15, 13, 15, 15, 14, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 15, 15, 14,
  15, 15, 16, 14, 14, 14, 14, 14, 13, 15, 14, 15, 13, 13, 15, 15, 15, 14, 15, 15, 15, 14, 15, 13, 13, 15, 15, 15, 15, 14, 15, 14, 14, 15, 14, 15, 15, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 14, 14,
  14, 13, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 15, 15, 13, 15, 15, 13, 15, 14, 14, 12, 15, 13, 15, 15, 14, 15, 13, 15, 15, 14, 13, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 13, 15,
  15, 12, 15, 15, 15, 13, 15, 15, 13, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 16, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 13, 14, 13, 14, 13, 14, 15, 15, 14, 15,
  15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 13, 15, 14, 15, 15, 10, 15, 15, 13, 15, 15, 15, 15, 15, 13,
  15, 15, 13, 15, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 14, 14, 14, 14, 15, 15, 14, 15, 15, 13, 15, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 13, 15, 15, 15, 13, 15, 15, 13, 15, 14, 15, 13, 15, 14, 15, 15, 15, 13, 15,
  15, 13, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 15, 10, 15, 14, 15, 15, 15, 13, 15, 14, 15, 13, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15,
  13, 15, 15, 15, 14, 15, 15, 15, 15, 15, 13, 14, 13, 14, 15, 14, 15, 15, 13, 15, 14, 15, 13, 15, 15, 13, 15, 13, 14, 15, 13, 15, 15, 13, 15, 15, 15, 14, 15, 14, 15, 13, 15, 14, 15, 15, 13, 15, 15, 15, 13, 14, 13, 14, 13, 14, 13, 14, 15, 14, 13, 15, 15, 13, 15, 15, 15, 15, 15, 15, 13, 15, 13, 15,
  13, 14, 15, 13, 13, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 14, 14, 15, 14, 15, 15, 15, 13, 14, 13, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 13, 15, 14, 15, 14, 15, 14, 14, 14, 14, 15, 13, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15,
  13, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 14, 15, 13, 15, 15, 13, 15, 14, 15, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 13, 15, 14,
  15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 14, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15,
  15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 12, 15, 14, 15, 14, 15, 15, 14, 14, 13, 15, 14, 14, 15, 15, 14, 14, 14, 14, 15, 14, 15, 15, 14, 14, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 14, 13, 14, 15, 15, 15, 15, 14, 13, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14,
  14, 15, 14, 15, 15, 14, 15, 15, 15, 13, 14, 15, 14, 15, 14, 15, 14, 15, 13, 15, 15, 15, 14, 14, 14, 13, 15, 14, 15, 13, 15, 14, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 15, 12, 15, 15, 13, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 15, 13, 15, 13, 15, 13, 14, 13, 14, 13, 14, 14, 14, 15, 13, 14, 15, 14, 15, 15, 15, 14,
  15, 13, 15, 15, 13, 15, 15, 14, 15, 10, 14, 13, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 15, 10, 15, 10, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 13, 13, 8, 15, 15, 15, 14, 15,
  15, 15, 15, 15, 15, 13, 15, 14, 13, 15, 13, 15, 14, 15, 13, 14, 13, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 13, 14, 15, 13, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 10, 15, 13, 14, 13, 14, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 14, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15,
  13, 15, 15, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 8, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 14, 14, 15, 13, 14, 15, 15, 15, 12, 14, 14, 15, 15, 15, 15, 15, 12, 15, 15, 14, 15, 14, 15, 15, 12, 15, 15, 14, 15, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 15, 13, 14, 15,
  10, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 13, 14, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 13, 14, 15, 15, 13, 14, 14, 14, 15, 15, 15, 14, 15, 15, 15, 14, 13, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 12, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15,
  15, 13, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 12, 15, 15, 13, 14, 15, 15, 13, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 13, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 13, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15,
  15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 15, 13, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 14, 15, 13, 15, 14, 15, 15, 13, 15, 15, 13, 15, 14, 15, 13, 15, 14, 15, 14, 15, 15,
  14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 13, 14, 15, 15, 14, 15, 14, 15, 13, 15, 14, 15, 14, 15, 15, 14, 13, 15, 15, 14, 14, 15, 13, 15, 14, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 13, 15, 15, 15, 14, 15, 12, 15, 14, 15, 14, 15, 14, 15, 14, 15,
  14, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 8, 15, 15, 13, 15, 15, 13, 14, 15, 13, 15, 15, 13, 15, 15, 13, 14, 15, 15, 15, 14, 14, 14, 13, 15, 14, 15, 13, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 15,
  15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15,
  13, 15, 15, 15, 15, 15, 15, 13, 15, 15, 14, 15, 14, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 14, 14, 15, 15, 15, 15, 14, 15, 12, 13, 15, 14, 15, 15, 14, 14, 15, 15, 13, 15, 15, 14, 15, 14, 15, 15, 15, 15, 14,
  15, 14, 15, 15, 15, 15, 15, 13, 15, 14, 15, 13, 15, 15, 13, 13, 9, 15, 15, 15, 14, 15, 15, 14, 14, 15, 15, 9, 15, 15, 13, 15, 15, 13, 15, 15, 13, 14, 15, 14, 15, 15, 15, 13, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 14, 13, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 13, 13, 15, 15, 14, 15, 15, 15,
  13, 15, 15, 13, 14, 13, 15, 15, 13, 14, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 14, 14, 13, 15, 13, 15, 13, 15, 14, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 14, 15, 13, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14,
  15, 13, 15, 15, 13, 15, 15, 15, 12, 15, 15, 13, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 11, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 14, 15, 13, 15, 15, 15, 15, 14, 15, 15, 13,
  15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 14, 13, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 13, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15,
  14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 15, 14, 14, 14, 15, 15, 15, 13, 14, 14, 14, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 15,
  13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 15, 13, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 14, 15, 14, 13, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 13, 15, 15, 13, 15, 14, 15, 15,
  13, 15, 15, 13, 15, 15, 13, 15, 15, 14, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 14, 15, 12, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 15,
  14, 15, 15, 15, 15, 12, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 13, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 14, 14, 14, 13, 15, 13, 13, 15, 15, 15, 12, 15,
  15, 15, 14, 15, 15, 15, 14, 15, 13, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 13, 14, 14, 9, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 14, 14, 14, 15, 15, 15, 14, 14, 13, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14,
  15, 14, 15, 15, 14, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 13, 15, 15, 14, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 13, 15, 10, 15, 14, 13, 15, 13, 14, 13, 15, 15, 15, 14, 13, 15, 15, 12, 15, 13, 14, 14, 15, 15, 13, 15, 15, 15, 13, 15,
  15, 13, 15, 15, 15, 15, 14, 13, 14, 13, 15, 15, 15, 13, 14, 13, 14, 13, 15, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 15, 15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 15, 15, 10, 15, 15, 13, 15, 15, 14, 15, 15, 13, 15, 15, 14, 15, 13, 15, 14, 13, 15, 15, 14, 13, 15, 15,
  15, 14, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 14, 15, 13, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 14, 15, 13, 15, 14, 15, 15, 14, 15, 13, 15, 14, 15, 15,
  14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 16, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15,
  15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 14, 13, 15, 15, 15, 13, 15, 15, 15, 13, 14, 13, 15, 15, 15, 15, 13, 15, 15, 15, 13, 15, 14, 13, 15, 15, 13, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 13, 15, 15, 15, 15, 14, 13, 14, 14, 10, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 13, 15, 14, 14, 15, 13, 14, 13, 15, 14, 15, 15, 15, 15, 13, 14, 13, 15, 15, 15, 14, 13, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 10, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15,
  15, 15, 10, 14, 15, 14, 15, 15, 15, 15, 14, 14, 15, 13, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 14, 14, 15, 13, 14, 15, 14, 15, 15, 13, 15, 14, 15, 14, 14, 14, 14, 14, 13, 15, 15, 13, 15, 15, 14, 13, 15, 15, 15, 14, 14, 14, 13, 15, 14, 14, 13, 14, 14, 15, 15, 14, 14, 15, 14, 15, 15,
  15, 13, 15, 13, 15, 13, 15, 15, 14, 15, 14, 15, 15, 13, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 14, 15, 15, 15, 13, 15, 15, 13, 14, 14, 15, 13, 14, 13, 14, 13, 15, 12, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 14, 13, 14, 16, 14, 15, 14, 15,
  13, 15, 15, 13, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 13, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 16, 15, 15, 15, 13, 15, 15, 15, 14, 15, 13, 15, 15, 14,
  15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 14, 14, 15, 14, 15, 15, 14, 14, 15, 15, 15, 15, 15, 14, 14, 14, 15, 14, 15, 14, 14, 13, 14, 13, 14, 14, 13, 14, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 14, 12, 15, 15, 15, 15, 14, 15, 15, 13, 13, 14, 15, 15, 15, 15, 14, 15, 14, 10, 15, 14, 15, 15, 15, 9, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15,
  14, 15, 15, 14, 15, 15, 15, 14, 15, 13, 15, 13, 15, 15, 14, 15, 14, 15, 15, 14, 14, 15, 14, 10, 14, 14, 14, 14, 14, 13, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 14, 14, 15, 14, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 12, 15, 14, 15, 15, 13, 15, 14, 13, 15, 13, 14, 12, 15, 14, 14, 14, 14, 15,
  14, 15, 15, 15, 13, 14, 15, 15, 15, 14, 15, 14, 15, 15, 12, 15, 14, 15, 15, 14, 14, 14, 14, 15, 15, 14, 15, 13, 14, 15, 14, 13, 14, 13, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 15, 8, 15, 14, 15, 15, 14, 15, 15, 15, 14, 13, 13, 15, 15, 14, 14, 14, 14, 14, 15, 15, 15,
  14, 15, 13, 14, 13, 14, 14, 15, 14, 14, 13, 14, 14, 14, 13, 15, 14, 15, 15, 15, 16, 14, 13, 14, 15, 14, 14, 14, 14, 14, 14, 13, 15, 13, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15,
  15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 13, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 10, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 12, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15,
  14, 15, 14, 14, 15, 14, 15, 14, 14, 13, 14, 14, 13, 15, 15, 13, 15, 15, 10, 15, 15, 13, 15, 15, 14, 15, 14, 15, 12, 15, 15, 15, 14, 15, 15, 12, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 12, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15,
  15, 15, 12, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 13, 15, 15, 15, 14, 15, 14, 15, 15, 15, 13, 15, 14, 14, 14, 13, 14, 15, 13, 15, 14, 15, 13, 15, 14, 14, 13, 14, 13, 14, 13, 14, 14, 15, 15, 14, 15, 15,
  15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 12, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 12, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 10, 15, 14, 15, 15, 14, 15, 12,
  15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 12, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 14, 13, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 14, 14, 13, 14, 15, 14, 15, 14, 15, 15, 13, 15, 15, 13, 15, 15,
  15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 13, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 13, 14, 15, 13, 14, 13, 14, 14, 15, 15, 14, 14,
  13, 15, 15, 13, 15, 15, 14, 15, 14, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 13, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 13, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15,
  14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15,
  15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 14, 15, 12, 15, 14, 15, 14, 15, 15, 15, 12, 15, 15, 15, 14, 15, 14, 10, 15, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 13, 15, 15, 14, 15, 13,
  15, 15, 14, 15, 13, 14, 13, 14, 15, 13, 15, 14, 15, 14, 15, 14, 15, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 10, 15, 15, 12, 14, 15, 15, 15, 15, 14, 13, 15, 14, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 13, 10, 15, 15, 14, 15, 16, 15, 14, 15, 15, 14, 15, 15, 15, 13, 14,
  15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 14, 12, 14, 12, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 13, 14, 14, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 13, 15, 15, 14, 14, 15, 13, 14, 9, 13, 14, 14, 15, 15, 14, 12, 15, 13, 15, 13, 12, 15,
  15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 14, 14, 14, 13, 14, 14, 14, 14, 15, 15, 15, 14, 15, 15, 13, 15, 14, 15, 13, 13, 14, 15, 15, 15, 15, 12, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 13, 15, 14, 15, 13, 15, 15, 15, 14, 15, 15, 12, 15, 15, 15, 15, 13, 15,
  15, 15, 14, 15, 14, 14, 14, 14, 15, 15, 14, 15, 14, 15, 15, 12, 14, 15, 14, 15, 15, 14, 15, 15, 13, 15, 15, 15, 14, 14, 14, 14, 13, 14, 14, 14, 15, 13, 15, 15, 15, 15, 15, 13, 14, 15, 15, 15, 15, 12, 14, 14, 14, 12, 14, 14, 14, 14, 13, 15, 14, 15, 13, 15, 14, 15, 14, 15, 14, 15, 15, 15, 14, 15,
  14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 12, 15, 14, 15, 15, 14, 15, 12, 15, 14, 15, 15, 12, 15, 15, 15, 14, 15, 10, 15, 15, 15, 14, 15, 14, 15, 15, 13, 14, 15, 14, 13, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 15, 13, 15, 15, 13, 14, 14, 15, 14, 14, 14,
  15, 14, 15, 15, 15, 13, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 15, 15, 14, 14, 14, 15, 14, 14, 10, 14, 14, 14, 14, 15, 15, 13, 14, 15, 14, 12, 14, 15, 14, 15, 15, 15, 15, 15, 13, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 12, 15, 14, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 14, 15, 13, 15, 14,
  15, 15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 14, 15, 13, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 12, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 12, 15, 15, 14, 15, 12, 15, 14, 15, 15, 15, 13, 15, 15, 15,
  13, 15, 12, 15, 15, 15, 15, 15, 15, 15, 15, 15, 9, 14, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 12, 15, 14, 15, 13, 14, 10, 14, 15, 15, 15, 15, 14, 15, 14, 14, 15, 14, 13, 15, 15, 12, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 12, 15, 15, 13, 15, 15, 15, 15, 15, 15, 13, 15,
  14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 10, 15, 15, 15, 15, 13, 15, 14, 15, 14, 15, 15, 15, 14, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 15, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 15, 15, 15, 13, 15, 15, 15, 14, 15, 12, 15, 15, 14, 15, 13, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 14, 15, 14, 15, 14, 14, 14, 13, 15, 13, 14, 13,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15,
  15, 14, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 12, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 12, 14, 14, 15, 14,
  14, 12, 15, 15, 15, 15, 14, 15, 15, 13, 14, 14, 15, 13, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 12, 15, 15, 13, 15, 14, 15, 15, 10, 14, 15, 15, 15, 12, 15, 15, 15, 14, 15, 8, 15, 14, 15, 14, 15, 14, 14, 15, 15, 15, 15, 14, 15,
  15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 14, 12, 15, 14, 13, 15, 15, 13, 14, 14, 15, 13, 14, 15, 15, 15, 15, 15, 13, 13, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 13, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 10, 15, 15, 13, 15, 14, 15, 15, 15, 12,
  15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 14, 15, 10, 14, 15, 15, 15, 10, 15, 15, 15, 14, 13, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 12, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 12, 15, 15, 13, 15, 12, 15, 15, 15, 10, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15,
  13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 14, 15, 14, 14, 15, 14, 13, 14, 15, 14, 15, 15, 14, 15, 14, 13, 14, 14, 15, 14, 10, 15, 13, 14, 14, 13, 14, 12, 14, 13, 14, 13, 14, 13, 14, 14, 12, 15, 15, 15, 14, 15, 14, 14, 14, 14, 15, 14, 14, 14, 14, 10, 14, 14,
  14, 12, 15, 15, 14, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 14, 13, 15, 15, 15, 13, 15, 14, 15, 15, 13, 15, 15, 14, 15, 13, 14, 15, 15, 13, 15, 15, 14, 15, 14, 9, 15, 15, 15, 14, 15, 12, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 14, 13, 15, 15, 12, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15,
  15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 12, 15, 15, 14, 15, 13, 15, 15, 15, 15,
  14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 14, 15, 12, 15, 14, 15, 13, 15, 14, 15, 12, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 13, 15, 14, 15, 14, 15, 15, 15, 14, 15, 12, 15, 14, 15, 15, 15, 12, 15, 15, 15, 15, 15, 12, 15, 15, 13, 15, 15, 15, 14, 15, 13,
  15, 14, 15, 15, 14, 15, 12, 15, 14, 15, 13, 15, 15, 12, 15, 15, 13, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 12, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 13, 15,
  15, 12, 15, 15, 14, 15, 15, 12, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 12, 15, 15, 13, 15, 15, 12, 15, 15, 13, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 12, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 13, 15, 14, 15, 12, 15, 14, 15, 13, 15, 14, 15, 15, 12, 15, 15, 14, 15,
  15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 13, 15, 15, 13, 15, 15, 12, 15,
  15, 13, 15, 15, 12, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 14, 15, 15, 12, 15, 15, 14, 15, 15, 15, 12, 15, 14, 15, 15, 14, 15, 12, 15, 14, 15, 13, 15, 14, 15, 12, 15, 14, 15, 13, 15, 14, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15,
  15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 13, 15, 13, 15, 15, 14, 15, 15, 14, 15, 13, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 12, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 13, 15, 14, 15, 14, 15, 14, 15, 13, 15, 14, 15, 13, 15, 14, 15, 15, 15, 14, 15, 13, 15,
  15, 12, 15, 15, 13, 15, 15, 12, 15, 15, 14, 15, 12, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 14, 9, 9, 15, 15, 16, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15,
  14, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 12, 15, 14, 15, 15, 15, 15, 15,
  15, 14, 15, 14, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 14, 15, 15, 13, 15, 15, 12, 15, 15, 15, 14, 15, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 13, 15, 15, 13, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 12, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15,
  14, 15, 14, 14, 15, 15, 12, 15, 15, 15, 14, 14, 14, 14, 13, 14, 14, 15, 13, 14, 12, 14, 13, 14, 13, 14, 15, 15, 13, 15, 12, 15, 15, 15, 15, 14, 15, 15, 15, 13, 13, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 10, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15,
  15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 13, 15, 14, 12, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 14, 15, 12, 15, 14, 15, 14, 15, 15, 12, 15, 14, 15, 14, 15, 15, 15, 15,
  15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 12, 15, 14, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 12, 15, 14, 15,
  14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 12, 15, 14, 15, 13, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 14, 13, 15, 14, 14, 15, 14, 15, 14, 15, 14, 15, 12, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14,
  15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 12, 15, 13, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 14, 15, 15, 14, 15, 15, 15, 15, 12, 15, 14, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 12, 15, 14, 15, 14, 15, 14, 15, 13, 15, 14, 15,
  10, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15,
  14, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 14, 14, 15, 14, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 12, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 14, 14, 12, 13,
  14, 15, 15, 15, 15, 13, 15, 15, 12, 15, 15, 15, 15, 14, 15, 12, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 12, 15, 14, 15, 15, 12, 15, 14, 15, 15, 12, 15, 15, 15, 15, 12, 15, 14, 15, 15, 10, 15, 14, 15, 14, 15, 15, 13, 15, 15, 12, 15, 14, 15, 15, 15, 13, 15, 15, 14, 15, 15, 12, 15, 14,
  15, 15, 15, 12, 15, 14, 15, 15, 15, 12, 15, 14, 15, 14, 15, 10, 15, 14, 15, 14, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 12, 15, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 12, 15, 15,
  15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 12, 15, 14, 15, 14, 15, 10, 15, 15, 14, 15, 15, 12, 15, 15, 14, 15, 14, 15, 13, 15, 15, 13, 15, 14, 15, 15, 13, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15,
  15, 15, 15, 15, 14, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 12, 15, 15, 13, 15, 12, 15, 14, 15, 15, 15, 12, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 14, 15, 13, 15, 14, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15,
  15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 11, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 12, 15, 15, 15, 14, 15, 13, 14, 14, 14, 15, 14, 15, 15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 12, 15, 15, 15, 15, 14, 13, 15, 15, 14, 15, 13, 15, 15, 14,
  15, 14, 15, 15, 15, 15, 15, 15, 12, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 13, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 14, 14, 13, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 14, 14, 14, 14, 12, 14, 15, 15, 15, 13, 15, 14, 15, 15,
  15, 15, 15, 8, 15, 12, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 12, 15, 14, 14, 14, 15, 15, 15, 13, 14, 14, 14, 14, 15, 13, 14, 15, 15, 16, 14, 15, 15, 15, 13, 12, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 14,
  15, 14, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 13, 12, 13, 14, 15, 15, 14, 12, 15, 15, 14, 15, 14, 15, 14, 14, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 12, 15, 14, 15, 15, 15, 14,
  14, 15, 14, 14, 15, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 15, 10, 15, 14, 15, 14, 15, 14, 14, 15, 13, 15, 15, 12, 15, 14, 14, 15, 15, 15, 15, 9, 14, 15, 15, 12, 15, 14, 15, 15, 10, 15, 15, 15, 14, 15, 15, 14, 14, 14, 15, 15, 13, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 15, 14, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 14, 16, 15, 15, 13, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 13, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 13, 15,
  15, 15, 15, 13, 14, 14, 15, 14, 15, 13, 15, 14, 15, 14, 15, 14, 15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 13, 13, 16, 15, 14, 15, 15, 14, 15, 13, 14, 15, 14, 15, 12, 15, 14, 15, 15, 16, 15, 14, 13, 16, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 13, 15, 15, 12,
  15, 14, 15, 13, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 15, 15, 15,
  15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 12, 14, 15, 15, 15, 12, 15, 15, 15, 15, 12, 15, 15, 15, 15, 12, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 13, 15, 15, 12, 15, 15, 15, 15, 15, 12, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 13,
  15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 12, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 12, 14, 15, 15, 15, 14,
  12, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 10, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15,
  15, 15, 13, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 13, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 12, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15,
  14, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 14, 13, 14, 12, 14, 14, 15, 14, 14, 13, 8, 15, 14, 15, 15, 15, 15, 14, 15, 14, 13, 14, 14, 10, 14, 13, 14, 15, 14, 13, 14, 14, 10, 14, 14, 13, 14, 14, 12, 15, 14, 15, 15, 15, 15, 14, 15, 10, 15, 14, 15, 15, 15, 13, 14, 15, 15, 15, 15, 14, 15, 15, 15,
  15, 15, 15, 12, 15, 15, 15, 13, 15, 15, 15, 14, 14, 15, 15, 15, 15, 13, 15, 16, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 14, 15, 14, 14, 15, 15, 13, 15, 14, 15, 15, 15, 14, 14, 13, 12, 15, 15, 15, 15, 12, 14, 15, 15, 15, 15, 15,
  15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 13, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 13, 15, 10, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 14, 8, 15, 15, 15, 14, 15, 15, 15, 13, 14, 10, 14, 15, 15, 15, 15, 14, 12, 15, 14, 15, 13, 14, 15, 15, 13, 15,
  15, 15, 15, 15, 15, 14, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 14, 13, 15, 14, 15, 15, 14, 15, 14, 15, 14, 14, 14, 14, 14, 12, 14, 13, 14, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 13, 15, 15, 14, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 14, 14,
  14, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 13, 14, 9, 15, 15, 14, 15, 15, 15, 14, 14, 12, 15, 15, 15, 15, 14, 14, 15, 13, 15, 14, 15, 13, 15, 14, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 14, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15,
  13, 15, 15, 13, 15, 15, 15, 14, 15, 13, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 10, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 12, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 14, 11, 15, 15, 15, 14, 15, 12, 15, 14, 15, 14, 15, 14, 14, 15, 15, 15, 13, 15,
  14, 15, 15, 14, 15, 15, 14, 15, 13, 15, 13, 14, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 10, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 12, 15, 14, 15, 14, 14,
  15, 14, 14, 14, 14, 14, 14, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 14, 15, 10, 15, 14, 15, 14, 15, 15, 15, 15, 13, 15, 14, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 15, 14, 15, 14, 15, 13, 15, 14, 15, 14, 13, 15, 15, 14, 15, 14, 15, 15, 15, 14, 14, 14, 13, 14, 15, 15,
  15, 15, 13, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 14, 13, 15, 15, 14, 15, 15, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 13, 15, 15, 14, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 13,
  15, 14, 15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 14, 15, 14, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 11, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15,
  15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 14, 15, 15, 14, 13, 14, 14, 15, 15, 14, 14, 15, 15, 14, 12, 15, 15, 15, 15, 15, 14, 14, 15, 14, 15, 14, 14, 15, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 12, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 14,
  15, 13, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 12, 15, 15, 15, 16, 14, 15, 15, 12, 15, 15, 15, 15, 14, 15, 13, 15, 14, 15, 15, 13, 14, 15, 15, 14, 13, 15, 15, 14, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 12, 15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15,
  14, 15, 15, 14, 15, 15, 14, 15, 9, 15, 15, 15, 14, 15, 12, 15, 15, 15, 14, 15, 12, 15, 15, 12, 15, 14, 15, 15, 15, 15, 14, 15, 10, 15, 14, 15, 15, 15, 13, 15, 15, 15, 14, 15, 13, 15, 14, 15, 13, 15, 15, 15, 15, 14, 15, 15, 14, 14, 15, 14, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15,
  14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 13, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 10, 15, 15, 15, 15, 14, 15, 12, 15, 14, 15, 15, 12,
  15, 14, 15, 15, 10, 15, 15, 15, 14, 15, 15, 15, 15, 15, 12, 15, 14, 15, 15, 12, 15, 15, 15, 15, 14, 15, 12, 15, 14, 15, 15, 15, 12, 15, 15, 13, 15, 15, 12, 15, 15, 15, 13, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 13, 14, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15,
  15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 12, 15, 15, 13, 15, 14, 15, 15, 14, 15, 12, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 10, 15, 15, 15, 13, 15, 15, 15, 15,
  15, 14, 15, 14, 15, 14, 15, 13, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 10, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 16, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 12, 15, 14, 15, 15, 14, 14, 15, 15, 14, 15, 15, 16, 15, 15, 15, 13, 15, 14, 15, 13,
  15, 15, 14, 15, 15, 15, 14, 15, 10, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 12, 15, 15, 15, 14, 15, 14, 15, 13, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 8, 15, 15, 15, 14, 15, 15, 15, 14, 15, 12, 15, 15, 15, 15, 15,
  15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 13, 15, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 13, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15,
  15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 13, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 15, 13, 14, 14, 14, 14, 14, 15, 14, 15, 14, 15, 15, 15, 12, 13, 15, 14, 14, 15, 14, 16, 15, 15, 15, 14, 13, 15, 13, 15, 15, 14, 15, 15, 14, 15, 14, 14, 13, 15, 15, 14, 14, 13, 12, 15, 15, 14, 15, 15, 14,
  14, 13, 15, 14, 15, 15, 15, 15, 10, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 15, 13, 15, 15, 12, 15, 15, 14, 15, 15, 14, 15, 12, 15, 14, 15, 14, 15, 14, 15, 14, 15, 12, 15, 14, 15, 15, 15, 15, 15, 14, 15, 12, 15, 14, 15, 15, 12, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15,
  15, 15, 14, 15, 13, 15, 15, 12, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 12, 14, 14, 14, 12, 14, 15, 15, 15, 15, 15, 12, 14, 14, 14, 12, 14, 15, 15, 15, 15, 15, 15, 15, 14, 12, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 14, 14,
  15, 14, 15, 15, 14, 14, 14, 15, 14, 14, 14, 15, 15, 13, 14, 15, 15, 14, 12, 15, 15, 15, 14, 14, 15, 15, 15, 14, 14, 14, 14, 14, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 15, 15, 15, 14, 15, 15, 14, 14, 12, 14, 15, 15, 14, 14, 15, 15, 15, 14, 15, 15, 12, 15, 15, 15, 14, 15, 12, 15, 15, 15, 15, 12,
  15, 15, 15, 15, 12, 15, 15, 13, 15, 15, 14, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 12, 15, 14, 15, 15, 15, 12, 15, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 12, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 14, 14,
  14, 15, 15, 14, 15, 15, 15, 12, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 10, 15, 15, 15, 15, 13, 14, 14, 14, 15, 14, 14, 13, 15, 14, 15, 14, 14, 14, 15, 14, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 14, 15, 13, 15, 15, 14, 15, 15, 13, 12, 15, 15, 15,
  15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 14, 15, 13, 15, 14, 15, 15, 14, 13, 15, 15, 14, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 12, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 10,
  15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 10, 15, 15, 14, 15, 15, 15, 12, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 12, 15, 14, 15, 15, 12,
  15, 15, 15, 15, 15, 12, 15, 15, 15, 14, 15, 12, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14,
  15, 14, 14, 14, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 13, 15, 14, 15, 14, 15, 13, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 15,
  12, 14, 14, 13, 13, 14, 14, 14, 10, 15, 14, 15, 15, 15, 15, 13, 15, 15, 10, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 14, 14, 15, 14, 13, 15, 15, 15, 14, 15, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 12, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 15, 15, 14, 15,
  14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 12, 15, 14, 15, 15, 12, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 12, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 13, 15, 14, 15,
  14, 15, 14, 15, 12, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 14, 14, 15, 15, 14, 13, 15, 15, 14, 14, 15, 15, 15, 15, 14, 14, 14, 15, 15, 15, 15,
  15, 13, 15, 15, 14, 15, 15, 15, 15, 13, 12, 15, 15, 15, 14, 15, 15, 15, 15, 13, 12, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 14, 14, 15, 15, 14, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 13, 10, 15, 12, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 12, 14, 15, 15, 15, 13, 15, 15,
  14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 14, 15, 14, 14, 15, 15, 14, 15, 14, 15, 13, 14, 13, 15, 15, 15, 15, 14, 15, 14, 15, 14, 14, 15, 15, 15, 14, 15, 14, 14, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 12, 8, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 14,
  15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 14, 15, 12, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 10, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 14, 14, 15, 15, 14, 13, 13, 14,
  15, 14, 15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 12, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 10, 15, 14, 15, 15, 14, 13, 15, 13, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 13, 14, 15, 14, 15, 13, 15, 14, 15, 13, 15, 15, 15, 14,
  15, 15, 12, 15, 15, 12, 14, 15, 14, 13, 15, 13, 14, 15, 13, 15, 14, 15, 8, 15, 15, 12, 15, 15, 14, 15, 15, 15, 15, 15, 12, 13, 15, 15, 14, 13, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 15, 14, 14, 12, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15,
  14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 14, 14, 15, 15, 14, 14, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 13, 14, 15, 15, 15, 14, 15, 15, 14, 12, 13, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 12, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 14, 15, 14, 15, 12, 15, 14, 15, 14, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 14, 15, 15,
  15, 15, 15, 15, 13, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 13, 15, 14, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 14, 15, 15, 12, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15,
  15, 15, 15, 15, 12, 15, 15, 14, 15, 15, 12, 15, 15, 14, 15, 15, 12, 15, 15, 13, 15, 15, 12, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 14, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 13,
  15, 15, 15, 13, 15, 13, 15, 15, 15, 14, 15, 15, 15, 10, 14, 14, 14, 14, 15, 15, 14, 12, 15, 15, 15, 15, 14, 16, 15, 14, 15, 14, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 13, 14, 15, 13, 15, 14, 15, 14, 15, 13, 14, 13, 15, 15, 13, 15, 15, 14, 15, 15, 10, 15, 14, 15,
  14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 13, 15, 15, 12, 15, 15, 13, 15, 15, 14, 15, 13, 15, 14, 15, 13, 15,
  14, 15, 13, 15, 14, 15, 12, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15,
  15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 13, 15, 14, 15,
  13, 15, 14, 15, 13, 15, 14, 15, 12, 15, 15, 14, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 16, 10, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 13, 15, 15, 14, 15, 15, 14, 15, 14, 15, 13, 15, 14, 15, 13, 15, 14, 15,
  13, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 10, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 15, 15,
  15, 15, 14, 15, 15, 15, 15, 14, 15, 16, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 12, 15, 15, 14, 15, 13, 15, 14, 15, 14, 15, 14, 15, 12, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 13, 15, 15, 14,
  15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15,
  15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 12, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 14, 15, 15, 15, 15, 13, 10, 15, 14, 15, 14, 15, 13, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 10, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15,
  15, 14, 15, 14, 12, 11, 15, 14, 15, 14, 15, 14, 15, 15, 14, 14, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 13, 15, 13, 15, 14, 15, 15, 14, 15, 10, 14, 15, 15, 15, 13, 15, 15, 13, 15, 16, 13, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15,
  13, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 13, 15, 15, 14, 14, 14, 14, 15, 13, 15, 14, 14, 15, 15, 14, 15, 15, 14, 14, 14, 15, 15, 15, 15, 14, 13, 14, 13, 15, 14, 15, 15, 14, 14, 15, 15, 15, 15, 14, 15, 13, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 12, 15, 15, 14, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 12, 15, 15, 13, 15, 14, 15, 15, 15, 15, 12, 15, 15, 15, 15, 14, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 14, 15, 14, 15, 15, 15, 14, 13, 15, 15, 14, 14,
  15, 14, 15, 15, 15, 13, 15, 14, 15, 14, 15, 14, 15, 14, 12, 14, 15, 14, 15, 15, 12, 15, 14, 8, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 12, 15, 15, 13, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 12, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 13, 15, 13, 15, 14,
  15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 14, 15, 14, 15, 15, 15, 13, 15, 15, 14, 15, 15, 13, 15, 15, 14, 15, 15, 13, 15, 14, 15, 13, 15, 15, 15, 15, 14, 15, 12, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 12, 15, 15,
  15, 15, 15, 15, 14, 15, 15, 14, 15, 12, 15, 14, 15, 15, 15, 15, 12, 15, 15, 13, 15, 14, 15, 13, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 14, 15, 15, 13, 15, 15, 8, 15, 14, 15, 15, 15, 15, 15, 14, 14, 14, 13, 15, 14, 14, 12, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 14, 15,
  14, 15, 8, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 13, 13, 10, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 13, 15, 14, 15, 15, 13, 15, 15, 13, 15, 15, 15, 13, 14, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 10, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 14, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 13, 15, 14, 15, 15, 15, 13, 15, 15, 13,
  15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 13, 14, 12,
  14, 13, 14, 15, 15, 15, 15, 15, 15, 15, 14, 13, 14, 13, 15, 15, 15, 15, 15, 15, 15, 14, 14, 13, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 13, 15, 14, 15, 13, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 14,
  15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 15, 13, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 14, 15, 14, 15, 13, 15, 14, 15, 15, 10, 15, 14, 13, 14, 14, 14, 15, 14, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 14, 14, 15, 15, 15, 13, 15, 15, 13,
  15, 15, 13, 14, 14, 14, 13, 14, 15, 15, 14, 15, 15, 13, 15, 15, 12, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 12, 15, 15, 13, 15, 15, 15, 14, 15, 15, 10, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 13, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 14,
  15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 13, 15, 14, 15, 13, 14, 15, 15, 14, 15, 15, 14, 13, 15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 13, 15, 15, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 12, 15, 14, 15, 15, 13, 15, 15, 13,
  15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15,
  15, 15, 15, 15, 14, 15, 12, 15, 14, 15, 15, 15, 15, 15, 13, 15, 14, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 15, 15, 13, 15, 15, 14, 15, 9, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 14, 15,
  15, 15, 15, 15, 16, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 14, 15, 14, 15, 13, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 12, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 13, 15, 15, 14,
  15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 13, 14, 15, 15, 15, 15, 15, 14, 13, 14, 15, 14, 14, 15, 14, 15, 14, 15, 13, 15, 13, 14, 10, 14, 15, 15, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15, 15, 14, 13, 15, 14, 15, 12, 15, 15, 14, 12, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14,
  15, 15, 15, 15, 15, 15, 14, 15, 15, 12, 15, 15, 15, 13, 15, 14, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15, 14, 15, 13, 15, 15, 15, 15, 15, 14, 15, 14, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 12, 15, 15, 13, 15, 14, 15, 15, 15,
  15, 13, 15, 15, 10, 15, 15, 14, 15, 12, 15, 14, 15, 14, 15, 15, 15, 13, 15, 15, 15, 10, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 14, 12, 14, 14, 15, 14, 15, 13, 15, 15, 15, 15, 13, 15, 10, 15, 14, 15, 15, 12, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 13, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 13, 14, 15, 15, 15, 15, 14, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 12, 15, 15, 13, 15, 14, 15, 13, 15, 14, 15, 15, 15, 15, 15, 14, 14,
  13, 14, 14, 15, 15, 13, 15, 15, 14, 14, 15, 15, 13, 15, 14, 15, 15, 14, 15, 13, 15, 14, 15, 15, 15, 14, 14, 13, 15, 15, 16, 15, 15, 15, 15, 14, 15, 10, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 10, 15, 15, 14, 15, 14, 16, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 13, 13, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 13, 15, 15, 15, 15,
  15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 12, 15, 15, 15, 14, 14, 15, 15, 15, 13, 15, 15, 14, 15, 8, 15, 15, 14, 15, 15,
  15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 15, 10, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15,
  15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 14, 15, 14, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 14, 14, 15, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 14, 15,
  15, 12, 15, 14, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 12, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 13,
  15, 14, 15, 14, 15, 13, 15, 14, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 13, 14, 15, 15, 15, 15, 15, 14, 16, 15, 14, 15, 15, 15, 15, 15, 16, 15, 15, 15, 15, 15, 15, 15, 9, 15, 15, 15, 14, 15, 15, 15, 15, 14, 14, 15, 12, 15, 15, 13, 15, 15,
  12, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 11, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 14, 15, 15,
  14, 15, 14, 15, 14, 15, 13, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 13, 15, 14, 15, 13, 15, 14, 15, 13, 15,
  15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 12, 15, 15, 15, 13, 15, 15, 13, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 12, 15, 15, 15, 15, 13, 14, 15, 12, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 14, 15, 15, 10, 15, 14, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 14, 15, 12, 15, 14, 15, 13, 15, 14, 15, 13, 15, 14, 15, 15, 14, 15, 14, 14, 13, 14, 14, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 15, 14, 15, 13, 15, 14, 15, 10, 15, 15, 13, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15,
  15, 14, 15, 15, 13, 15, 15, 12, 15, 14, 15, 15, 8, 16, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 13, 15, 15, 12, 15, 15, 13, 15, 15, 15, 15, 14, 13, 15, 15, 14,
  15, 15, 15, 15, 14, 13, 15, 15, 15, 15, 14, 13, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 16, 15, 15, 14, 15, 15, 14, 15, 13, 15, 14, 15, 15,
  15, 15, 14, 15, 15, 13, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 14, 15, 15, 14, 15, 15, 15, 14, 15, 14, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 10, 14, 15, 15, 15, 14, 13, 14, 15, 15, 15, 15, 14, 14, 14, 15, 15,
  15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15,
  15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 13, 15, 15, 13, 15, 14, 15, 15, 14, 13, 15, 15, 14, 15, 14, 15, 13, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 13, 15, 15, 15, 15, 15, 15, 14, 15, 13, 14, 15, 14, 15, 14, 15, 15, 13, 15, 15, 13, 15, 13, 15, 15, 14, 15, 15, 15, 15,
  15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 12, 14, 15, 14, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 13, 15, 15, 14, 15, 14, 13, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 14, 15, 15, 12, 15, 15, 13, 15, 15, 13, 15,
  14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 12, 15, 15, 13, 15, 15, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 13, 14, 14, 15, 15, 14, 12, 15, 15, 15, 14, 15, 15, 15, 10, 14, 15, 14, 15, 15, 15, 15, 15, 15, 13, 12, 14,
  15, 15, 15, 14, 14, 15, 15, 13, 15, 14, 15, 14, 15, 11, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 13, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 13, 15, 14, 15, 15, 15,
  14, 15, 12, 15, 14, 15, 14, 15, 14, 15, 15, 15, 13, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 13, 15, 15, 10, 15, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15,
  15, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 13, 14, 14, 14, 15, 12, 15, 14, 15, 14, 13, 15, 15, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15,
  15, 13, 15, 15, 15, 10, 15, 15, 14, 15, 12, 15, 15, 13, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 15, 13, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 14, 12, 14, 12, 14, 13, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 8, 13, 15, 15,
  16, 15, 15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 14, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 13, 15, 14, 15, 15,
  15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 13, 15, 14, 15, 15, 15, 15, 15, 13, 15, 14, 15, 13, 15, 15, 13, 15, 15, 14, 15, 13, 13, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 14, 15, 15, 13, 15, 15,
  12, 15, 15, 15, 15, 14, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 12, 15, 15, 15, 15, 15, 14, 15, 15, 14, 13, 14, 14, 14, 15, 15, 15, 15, 15, 14, 14, 13, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 13, 15, 15, 13, 15, 15, 15,
  15, 12, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 12, 15, 14, 15, 15, 15, 14, 15, 13, 15, 14, 14, 15, 15, 13, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 14, 14, 15, 15, 9, 15, 15, 13, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 13, 14, 13, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 12, 15, 14, 15, 12, 14, 13, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 13, 15, 15, 15, 15, 14, 15,
  15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 12, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 10, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 12, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15,
  14, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 13, 15, 13, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 13, 14, 15, 15, 14, 14, 15, 14, 11, 15, 15, 14, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 13, 14, 15, 15, 14,
  15, 12, 15, 15, 15, 15, 8, 15, 15, 15, 15, 14, 14, 15, 14, 15, 14, 15, 15, 15, 13, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 14, 13, 14, 15, 15, 14, 15, 14, 15, 15, 13, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 14, 15, 15, 15, 15, 15, 14, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 13, 13, 14, 15, 15, 15, 14, 15, 12, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 9, 15, 13, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14,
  13, 15, 14, 13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 14, 15, 13, 15, 15, 12, 15, 15, 15, 14, 15, 15, 15, 15, 13, 14, 15, 13, 15, 14, 15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 12, 15, 15, 15, 15, 15, 13, 15, 14, 15, 13, 15, 15, 12, 15, 15,
  13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 12, 15, 14, 15, 14, 15, 15, 9, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15,
  15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 12, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 14, 15, 14, 15, 12, 15, 15, 14, 15, 14, 15, 13, 15, 15, 14, 15, 15, 15, 13,
  15, 15, 14, 15, 13, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 13, 14, 15, 14, 12, 15, 14, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 13, 15, 15, 12, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 14, 13, 15, 15, 13, 15, 15, 15, 15, 15, 15,
  15, 15, 14, 14, 14, 15, 15, 15, 15, 15, 15, 13, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 14, 15, 13, 14, 15, 13, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 13, 13, 15, 15, 15, 15, 14, 14, 15, 14,
  14, 14, 15, 13, 15, 14, 14, 14, 14, 15, 15, 14, 15, 8, 15, 15, 15, 15, 12, 14, 15, 14, 14, 15, 15, 15, 13, 14, 14, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 14, 15, 14, 13, 14, 15, 13, 14, 15, 14, 15, 15, 14, 15, 13, 15, 15, 13, 15, 14, 15, 13, 15, 15, 12,
  15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 14, 14, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 11, 14, 13, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15,
  15, 15, 13, 14, 15, 14, 15, 13, 15, 14, 15, 15, 15, 15, 14, 15, 12, 12, 15, 15, 13, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 14, 15, 13, 15, 14, 15, 14, 15, 15, 10, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15, 13, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 11, 15,
  12, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 12, 15, 15, 14, 14, 15, 14, 14, 14, 15, 13, 14, 13, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 13, 15, 13, 15, 14, 13, 14, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 13, 15, 15, 13, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 13, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 11, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15,
  15, 15, 15, 15, 13, 14, 14, 14, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 13, 14, 15, 15, 12, 15, 14, 15, 13, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15,
  15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 12, 15, 15, 15, 15, 14, 15, 12, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 14, 15, 14, 15, 14, 14, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15,
  15, 14, 15, 14, 15, 14, 15, 14, 14, 15, 14, 15, 15, 13, 15, 14, 15, 15, 14, 14, 14, 14, 10, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 11, 13, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 13, 15, 15, 11, 15, 14, 15, 13, 15,
  15, 12, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 13, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 13, 15, 14, 15,
  14, 15, 15, 15, 15, 13, 14, 15, 14, 14, 15, 14, 14, 15, 15, 15, 12, 15, 15, 13, 15, 15, 14, 15, 14, 15, 12, 15, 15, 14, 15, 12, 15, 15, 13, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 14, 15, 15, 14, 15, 12, 15, 14, 15, 14, 15, 12, 15, 14, 15, 14, 15, 12, 15, 15, 13,
  15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 13, 15, 15, 15, 13, 15, 15, 13, 14, 15, 14, 14, 14, 14, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 13, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 13, 15, 13, 15, 14, 15, 14, 15, 13, 14, 15, 15, 15, 14, 14, 13, 15, 15, 15, 15, 15, 13, 15, 15, 15, 12,
  15, 14, 14, 15, 13, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 14, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 15, 12, 15, 14, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15,
  14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 14, 15, 14, 14, 13, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 14, 14, 15, 14, 15, 15, 14, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 12, 15, 15, 14, 13, 15, 15, 10,
  15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 14, 13, 15, 14, 15, 13, 14, 14, 14, 15, 15, 15, 14, 15, 14, 14, 15, 13, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 15, 14, 13, 14, 9, 15, 15, 15, 15,
  13, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 12, 15, 14, 15, 14, 12, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 12, 15, 15, 15, 14, 15, 15, 12, 15, 15, 15, 14, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 12, 15, 15, 15, 14, 15, 14, 14, 15, 15, 15, 15,
  15, 12, 14, 15, 15, 15, 15, 15, 15, 15, 15, 12, 14, 15, 14, 15, 12, 14, 15, 14, 15, 14, 15, 14, 15, 13, 15, 15, 14, 13, 14, 15, 14, 14, 13, 15, 15, 15, 15, 13, 15, 14, 15, 14, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 12, 15, 14, 15,
  14, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 12, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 12, 15, 13, 15, 14, 15, 15, 14, 12, 15, 13, 15, 15, 13, 15, 14, 15, 14, 15, 13, 15, 15, 15, 14, 15,
  13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 15, 12, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 13, 14, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15,
  15, 15, 14, 14, 13, 15, 15, 15, 15, 15, 14, 13, 14, 12, 14, 13, 15, 15, 15, 14, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 13, 14, 15, 15, 15, 13, 15, 13, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 10, 15, 15,
  15, 14, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 14, 15, 13, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 11, 13, 15, 15, 15, 15, 9, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 16, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 13, 14, 15, 15, 14, 15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 14, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 15, 15, 14, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 12, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 12, 15, 15, 15, 15, 15, 12, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 13,
  15, 15, 14, 15, 14, 14, 14, 14, 15, 14, 14, 15, 13, 14, 14, 14, 15, 15, 14, 15, 15, 14, 15, 14, 13, 15, 15, 14, 15, 15, 12, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 14, 15, 14, 15, 13, 15, 14, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 14,
  15, 15, 14, 14, 15, 14, 15, 15, 12, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 12, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 13, 15, 15, 14, 15, 13, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15,
  15, 15, 15, 12, 15, 14, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 13, 12, 15, 14, 15, 14, 14, 13, 15, 14, 13, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 15, 15, 14, 15, 14,
  13, 15, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 9, 15, 14, 12, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 13, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 14, 12, 14, 15, 15, 15, 15, 12, 15, 15,
  15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 13, 15, 15, 14, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 12, 15, 15, 15, 15, 11, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15,
  15, 14, 15, 15, 14, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 14, 14, 15, 14, 15, 13, 15, 15, 14, 15, 14, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 13, 14, 14, 14, 15, 14, 14, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 14, 14, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 13, 14, 15,
  15, 15, 15, 12, 15, 15, 14, 14, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 12, 15, 15, 13, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15,
  12, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 8, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 14, 15, 12, 15, 15, 13, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 14, 15, 14, 15, 13,
  13, 15, 14, 14, 14, 15, 14, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 13, 15, 14, 15, 12, 15, 14, 15, 13, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15,
  15, 15, 14, 15, 15, 15, 11, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 14, 14, 13, 14, 14, 15, 16, 15, 13, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 12, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 14,
  15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 14, 14, 15, 15, 15, 9, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 12, 15, 14, 13, 15, 14, 15, 14, 14, 15, 13, 15, 14, 12, 14, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 13, 15, 15, 15, 13, 15, 15, 12, 15, 14, 15, 15,
  15, 13, 14, 14, 15, 14, 15, 15, 14, 14, 14, 15, 15, 15, 15, 15, 15, 14, 11, 15, 14, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 10, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15,
  15, 14, 15, 13, 15, 15, 15, 15, 13, 15, 15, 14, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 11, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 14, 15, 14, 15, 15, 14, 15, 9, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 13, 15, 14, 15, 14, 15, 15, 15,
  11, 15, 14, 15, 14, 15, 13, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 13, 14, 15, 14, 15, 14, 14, 15, 13, 15, 15, 15, 13, 15, 14, 14, 14, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 12, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15,
  15, 14, 15, 15, 14, 12, 15, 14, 12, 15, 15, 14, 15, 15, 13, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 14, 15, 15, 15, 12, 15, 15, 15, 15, 15, 14, 15, 15, 10, 15, 12, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 13, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 14, 15,
  15, 15, 15, 14, 14, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 12, 15, 15, 15, 12, 15, 15, 15, 14, 15, 12, 15, 15, 14, 15, 15, 10, 15, 15, 13, 15, 15, 12, 15, 14, 14, 15, 15, 14, 15, 15, 15, 15, 14, 10, 14, 13, 14, 12, 14, 15, 15, 15, 11, 14, 13, 14, 12, 15, 14,
  15, 15, 14, 15, 13, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 12, 14, 15, 15, 12, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 12, 14, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15,
  14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 13, 14, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 13, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15, 14, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15,
  15, 13, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 12, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14,
  15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 14, 15, 14, 15, 13, 15, 14, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 14, 14, 14, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 14, 15, 15,
  15, 14, 15, 13, 14, 13, 15, 15, 15, 15, 15, 15, 15, 15, 14, 13, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 14, 14, 14, 15, 13, 14, 14, 15, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 14, 13, 14, 15, 14, 12, 15, 15, 15, 14,
  15, 15, 15, 14, 13, 15, 13, 15, 15, 15, 14, 15, 14, 15, 15, 15, 12, 15, 15, 15, 14, 15, 15, 15, 14, 15, 12, 15, 15, 14, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 13, 15, 14, 15, 14, 15, 14, 13, 15, 14, 15, 14, 15, 14, 15, 15, 12, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15,
  13, 15, 15, 9, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 14, 12, 15, 14, 14, 15, 15, 14, 15, 15, 13, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 13, 11, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 14, 14, 15, 15, 14, 15, 14, 15, 15, 10, 15,
  14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 13, 12, 14, 15, 13, 14, 14, 15, 13, 14, 15, 15, 14, 15, 15, 15, 14, 14, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 13, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 12, 15,
  15, 15, 15, 13, 15, 15, 15, 14, 15, 14, 15, 12, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 13, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15,
  12, 14, 15, 15, 15, 15, 15, 15, 14, 14, 11, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 11, 15, 14, 14, 15, 15, 12, 15, 15, 15, 15, 15, 13, 15, 15, 13, 14, 15, 14, 15, 15, 14, 15, 13, 15, 15, 14, 15, 15,
  15, 15, 14, 14, 14, 15, 15, 14, 15, 15, 12, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 14, 14, 15, 14, 14, 15, 15, 15, 15, 13, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 13, 15, 15, 14, 15, 15, 13,
  15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 13, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 12, 14, 15, 15, 15, 15, 13, 15, 14, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 14, 15, 14, 15, 15, 13, 15, 15, 13, 15, 14, 15,
  12, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 12, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 14, 14, 14, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 14, 15, 14, 15, 13, 13, 15, 13, 15, 14, 14, 15, 15,
  14, 15, 15, 12, 15, 15, 15, 15, 14, 16, 15, 15, 15, 15, 14, 14, 15, 15, 12, 15, 15, 15, 14, 13, 16, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 12, 15, 15, 14, 15, 15, 15, 14, 8, 14, 15, 15, 14, 15,
  15, 14, 15, 14, 13, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 10, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15,
  15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 11, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 13, 15, 14, 13, 15, 13, 14, 14, 14, 15, 15, 15, 15, 10, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15,
  15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 12,
  14, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 14, 15, 15, 13, 15, 15, 14, 13, 15, 15, 15, 13, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 14, 13, 15, 14, 15, 14, 15, 14, 15,
  15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 13, 14, 15, 14, 14, 12, 15, 15, 15, 13, 15, 15, 15, 15, 9, 15, 13, 15, 15, 13, 14, 15, 12, 15, 14, 14, 14, 13, 15, 14, 15, 13, 13, 12, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 13, 15, 14, 15, 14, 11,
  15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 13, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 10, 15, 15, 12, 15, 14, 15, 15, 15, 15, 12, 15, 14, 15, 14, 15, 15, 15, 15, 13, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15,
  15, 15, 14, 15, 13, 15, 15, 14, 14, 10, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 14, 14, 14, 15, 15, 15, 15, 13, 15, 15, 14, 12, 15, 14, 14, 15, 15, 15, 14, 13, 13, 15, 15, 14, 15, 12, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14,
  15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 12, 15, 15, 13, 15, 15, 14, 15, 15, 15, 14, 15, 11, 14, 13, 14, 12, 15, 15, 15, 15, 12, 15, 14, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 13, 14, 15, 13, 14, 15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 14,
  12, 14, 15, 14, 14, 15, 15, 14, 15, 15, 15, 15, 13, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 14, 12, 15, 14, 14, 15, 15, 15, 14, 15, 15, 13, 14, 14, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 14, 14, 15, 14, 13, 15, 14, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 14,
  15, 12, 15, 14, 15, 14, 14, 14, 15, 15, 15, 15, 14, 14, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15, 14, 15, 14, 13, 15, 14, 12, 15, 14, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 13, 15, 14, 15, 15, 14, 13, 14, 12, 14,
  15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 12, 15, 15, 13, 15, 15, 15, 14, 15, 12, 15, 14, 15, 15, 15, 15, 15, 14, 14, 15, 15, 14, 13, 15, 15, 14, 15, 13, 15, 15, 15, 15, 14, 13, 15, 15, 13, 15, 14, 15, 15, 13, 15, 14, 15, 13, 15, 15, 15, 14, 15, 14, 15,
  15, 15, 15, 15, 14, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 13, 14, 13, 14, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 13, 15, 14, 14, 15, 10, 15, 14, 15, 15, 11, 15, 15, 15, 14, 15, 15, 12, 15, 15, 15, 14, 14, 14, 14, 15, 15, 15, 15, 15, 13, 14, 15, 14,
  15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 12, 15, 15, 14, 15, 12, 15, 15, 15, 14,
  15, 15, 14, 15, 15, 15, 13, 15, 15, 12, 15, 15, 13, 15, 15, 14, 15, 13, 15, 15, 14, 15, 14, 15, 9, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 14, 13, 14, 15, 13, 14, 15, 15, 15, 15, 13, 14, 15, 15, 14, 14, 13, 15, 15, 14, 14, 14,
  15, 12, 15, 15, 13, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 13, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 11, 14, 15, 15, 14, 15, 15, 15, 15, 14, 12, 15, 14, 15, 14, 15,
  15, 15, 14, 15, 12, 15, 15, 15, 14, 13, 15, 15, 15, 15, 15, 15, 14, 15, 13, 15, 13, 15, 15, 14, 15, 14, 15, 13, 15, 15, 15, 10, 15, 15, 15, 14, 15, 14, 13, 14, 14, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 13, 15, 15, 15, 15, 15, 14, 14, 13, 15, 15, 15, 15, 14, 15, 15, 15, 13, 14, 15, 15, 15,
  14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 14, 15, 15, 15, 15, 15, 14, 14, 15, 15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 12, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 14, 11, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15,
  15, 15, 15, 14, 15, 15, 13, 15, 15, 13, 13, 15, 14, 14, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 9, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 14, 13, 14, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 12, 15, 13, 13, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 14, 14, 15, 15,
  14, 15, 14, 15, 15, 15, 14, 14, 15, 15, 13, 15, 15, 15, 16, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 14, 15, 14, 14, 15, 14, 14, 15, 15, 13, 15, 14, 15, 15, 15, 15, 8, 15, 15, 14, 15, 15, 15, 15, 14, 14, 12, 15, 14, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 12,
  15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 10, 15, 15, 15, 15, 14, 12, 15, 15, 14, 15, 15, 15, 13, 15, 13, 14, 15, 13, 14, 14, 15, 15, 14, 14, 15, 14, 15, 14, 15, 15, 15, 14, 14, 13, 15, 13, 15, 15, 14, 15, 15, 14, 14, 15, 14, 15, 14, 14, 13,
  15, 14, 14, 15, 15, 8, 13, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 13, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 12, 15, 14, 15, 14, 14, 15, 15, 14, 14, 15, 13, 15, 14, 14, 12, 13, 15, 15, 14, 15, 13, 15, 15,
  14, 15, 14, 15, 15, 15, 15, 14, 14, 15, 14, 14, 13, 15, 15, 15, 15, 15, 15, 15, 13, 14, 14, 14, 15, 15, 13, 15, 13, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 14, 15, 14, 15, 15, 15, 14, 14, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15, 11, 14, 14, 14, 15, 15, 15, 12, 12, 15, 15,
  14, 14, 15, 13, 15, 14, 9, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 13, 14, 15, 13, 13, 14, 15, 15, 12, 13, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 14, 13, 15, 15,
  15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 12, 15, 15, 13, 15, 14, 15, 15, 13, 15, 15, 14, 14, 15, 14, 15, 14, 15, 15, 15, 12, 15, 15, 14, 15, 14, 15, 15, 14, 15, 13, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 14, 15, 14, 14, 12, 15, 15, 14, 14, 14, 14, 14, 14, 13, 15, 14, 13, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 13, 14, 14, 14, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 14, 15, 15, 15, 15, 15, 15, 12, 15,
  15, 15, 13, 15, 15, 12, 15, 14, 15, 12, 15, 12, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 12, 15, 13, 14, 15, 13, 15, 14, 15, 15, 14, 15, 15, 13, 15, 12, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 15, 13, 15, 15, 12, 15, 15, 15, 14,
  15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 13, 15, 15, 12, 15, 15, 15, 14, 15, 15, 15, 13, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 14, 13, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15,
  15, 14, 15, 14, 13, 14, 14, 15, 14, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 13, 13, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 14, 15, 13, 12, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15,
  15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 14, 15, 15, 15, 14, 14, 14, 14, 13, 14, 13, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 12, 15, 15, 14, 15, 15, 11,
  15, 14, 15, 15, 15, 12, 14, 15, 15, 15, 15, 12, 14, 15, 15, 15, 15, 10, 15, 14, 15, 13, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 13, 13, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 12, 15, 14, 15, 15, 15,
  15, 15, 15, 15, 13, 14, 14, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 13, 14, 13, 13, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 14, 11, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 13, 14, 15, 15, 15, 15, 14, 15, 15,
  15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 12, 14, 13, 14, 12, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 12, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 13,
  15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 14, 14, 14, 15, 15, 14, 15, 14, 14, 15, 15, 15, 14, 15, 14, 14, 15, 13, 14, 15, 15, 15, 15, 13, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 9, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15, 14, 14,
  15, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 12, 15, 15, 15, 15, 12, 15, 12, 14, 14, 14, 14, 14, 14, 14, 15, 15, 14, 14, 14, 15, 15, 15, 14, 13, 14, 13, 15, 14, 14, 15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 13, 15, 15, 15, 12, 15, 15, 14, 15, 12, 15, 15, 15, 14, 15, 15, 12, 15,
  15, 13, 15, 15, 15, 15, 14, 15, 14, 15, 13, 15, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 13, 15, 15, 13, 15, 15, 14, 15, 14, 15, 15, 14, 15, 13, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 14, 14, 15, 14, 15, 15, 15, 14, 13, 14, 14, 15, 15, 15, 13, 14, 14, 15, 14,
  15, 15, 15, 14, 13, 15, 15, 15, 14, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 11, 15, 13, 15, 15, 14, 15, 14, 14, 15, 14, 15, 15, 15, 15, 14, 12, 15, 15, 15, 13, 15, 15, 15, 13, 14, 14, 14, 15, 14, 14, 15, 14, 15, 13, 14, 14, 15, 15, 14, 15, 15, 13, 15, 15, 14, 15, 14, 15, 15, 15, 14, 14,
  15, 14, 15, 14, 15, 15, 12, 15, 15, 14, 15, 13, 11, 15, 15, 15, 14, 14, 15, 13, 15, 15, 14, 15, 15, 13, 15, 14, 15, 12, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 14, 15, 13, 14, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 11, 15, 15, 14, 15, 15, 13, 15, 15, 14, 15, 15, 13, 15, 15,
  15, 15, 14, 15, 15, 15, 12, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 12, 15, 14, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 14, 15, 11, 15, 13, 15, 13, 15, 15, 15, 14, 15, 14, 14, 13, 14, 15, 15, 15, 10, 15, 15, 15, 14, 14, 12, 14, 14, 14, 13, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 12, 12, 13, 14, 15, 14, 14, 15, 14, 15, 15, 15, 15, 14, 15, 13, 15, 14, 14, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 15, 13, 15, 15, 13, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 14,
  15, 15, 15, 14, 15, 15, 15, 14, 14, 10, 15, 15, 14, 15, 14, 15, 15, 15, 15, 11, 15, 15, 14, 15, 13, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 13, 15, 15, 14, 15, 13, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 12, 15, 15, 15, 15, 14, 15, 15, 15,
  12, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 14, 15, 14, 14, 15, 15, 15, 15, 15, 14, 15, 12, 15, 15, 14, 15, 15, 12, 13, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 14, 15, 15, 12, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 13, 14, 15,
  15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 13, 12, 15, 14, 15, 15, 14, 15, 14, 14, 13, 15, 12, 14, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 14, 15, 14, 15, 14, 13, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 12, 15, 15, 15, 13, 15, 15, 15, 15, 15, 12, 15, 15, 14, 15, 15, 15, 15, 14, 15, 12, 15, 15, 13, 15, 15, 15, 14, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 13, 15, 14, 15, 15, 15, 15, 12,
  15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 13, 13, 15, 15, 15, 14, 13, 15, 15, 15, 15, 15, 12, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 13, 15, 15, 13, 15, 15, 15,
  15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 14, 14, 15, 15, 15, 14, 15, 14, 13, 15, 13, 15, 14, 13, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 12, 15, 15, 15, 13, 15, 15,
  15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 13, 13, 15, 13, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 13, 15, 15, 15, 15, 15, 15, 14, 15, 14, 14, 15, 13, 14, 14, 15, 15, 13, 15, 15, 14, 15, 13, 14, 15, 15, 15,
  15, 14, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 12, 13, 14, 15, 15, 14, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 13, 15, 10, 13, 14, 15, 14, 12, 15, 15, 13, 15, 14, 14, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15,
  15, 15, 15, 15, 13, 15, 15, 15, 14, 14, 15, 15, 15, 14, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 12, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 13, 14, 15, 13, 15, 15,
  15, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 15, 15, 14, 15, 15, 14, 14, 13, 14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 13, 13, 15, 14, 12, 15, 15, 14, 15, 15, 13, 13, 15, 14, 14, 15, 13, 13, 14, 15, 14, 15, 15, 14, 15, 15, 14, 13, 15, 14, 15, 15, 14, 15,
  14, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 13, 15, 15, 14, 16, 15, 15, 13, 15, 14, 15, 14, 15, 13, 14, 14, 14, 14, 15, 15, 15, 13, 14, 14, 15, 14, 13, 15, 15, 14, 12, 15, 14, 14, 14, 14, 14, 15, 14, 13, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 13, 15, 14, 14, 15,
  14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 13, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 13, 15, 13, 15, 15, 14, 15, 13, 14, 14, 14, 15, 15, 15, 14, 14, 15, 14, 15, 14, 14, 14, 15, 13, 15, 14, 14, 14, 15, 13, 14, 13, 15, 14, 15,
  15, 15, 13, 14, 14, 15, 13, 14, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 14, 14, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 12, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 12, 15, 15, 13, 15, 15, 15, 15, 14, 14, 15, 14, 14, 15, 15, 14, 14, 15, 15, 14, 15, 14, 15, 14, 14, 14, 15,
  14, 15, 14, 15, 10, 15, 15, 13, 15, 14, 15, 15, 14, 13, 14, 15, 15, 13, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 11, 15, 14, 15, 13, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 13, 15, 14, 15, 12, 15, 15, 15, 15, 10, 15, 14, 15, 13, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 13,
  13, 14, 14, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 14, 15, 12, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 13, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 14,
  15, 15, 15, 15, 12, 15, 15, 14, 14, 15, 13, 15, 14, 15, 15, 12, 14, 15, 15, 13, 15, 15, 14, 15, 15, 14, 15, 12, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 14, 15, 15, 13,
  15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 12, 15, 15, 15, 13, 15, 14, 15, 15, 14, 15, 14, 15, 15, 11, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 13, 15, 15, 12, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 15,
  15, 15, 15, 14, 14, 14, 15, 14, 15, 15, 15, 14, 14, 12, 15, 15, 13, 14, 15, 15, 14, 14, 15, 14, 14, 13, 14, 15, 15, 15, 15, 15, 14, 15, 15, 12, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 13, 12, 13, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14,
  15, 15, 15, 15, 15, 14, 15, 15, 11, 15, 14, 15, 15, 15, 14, 14, 15, 13, 14, 14, 13, 15, 14, 15, 15, 12, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 13, 12, 15, 15, 13, 15, 15, 15, 15, 15, 15, 13, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15,
  14, 15, 15, 12, 13, 15, 15, 15, 15, 12, 15, 15, 14, 15, 13, 15, 13, 15, 15, 15, 15, 13, 15, 13, 15, 14, 14, 14, 14, 14, 14, 14, 15, 15, 14, 14, 12, 15, 12, 14, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 12, 15, 15, 14, 15, 13, 15, 15, 13, 15, 15, 15, 15, 15, 14, 13, 15, 14, 15, 14, 15, 14, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 15, 10, 15, 15, 15, 15, 15, 15, 15, 15, 13, 14, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 14, 15, 15, 12, 15, 15, 15, 14, 15,
  14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 13, 12, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 13, 15, 12, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 14, 14, 14, 12, 14, 15, 15, 15, 14, 14,
  15, 14, 15, 15, 13, 14, 14, 15, 14, 15, 15, 15, 15, 15, 12, 15, 14, 15, 14, 15, 15, 11, 15, 14, 15, 14, 15, 15, 14, 14, 14, 14, 14, 14, 15, 15, 14, 15, 14, 15, 13, 14, 15, 15, 15, 15, 15, 14, 15, 14, 14, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 13, 15, 15, 14, 15, 14, 14, 15, 15, 15, 15, 14,
  15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 13, 15, 13, 15, 15, 14, 15, 15, 15, 14, 14, 14, 15, 14, 15, 14, 15, 15, 15, 14, 12, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 12, 15, 15, 13, 15, 14, 15, 14, 15, 14, 15,
  15, 13, 15, 14, 15, 15, 13, 15, 14, 15, 15, 14, 15, 14, 15, 15, 13, 15, 15, 15, 14, 15, 14, 15, 15, 13, 15, 15, 12, 15, 14, 15, 15, 14, 15, 14, 14, 15, 13, 15, 14, 13, 15, 14, 14, 15, 14, 14, 14, 15, 14, 15, 14, 15, 15, 14, 14, 15, 13, 15, 15, 14, 11, 14, 15, 15, 15, 15, 14, 12, 15, 15, 15, 15,
  12, 15, 14, 15, 14, 15, 15, 15, 15, 15, 13, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 11, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 12, 14, 14, 15, 14, 13, 14, 15, 14, 15, 13, 15, 14, 12, 14, 14, 14, 14, 12, 14, 11, 14, 15, 15, 14, 14, 14, 14, 14, 14, 13, 15, 15, 14, 15, 15, 14, 15,
  14, 15, 14, 15, 15, 12, 15, 15, 15, 14, 14, 15, 15, 14, 14, 14, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 12, 14, 8, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 13, 14, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 14, 15, 14, 13, 14, 14, 14, 15,
  14, 13, 15, 14, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 13, 13, 15, 15, 13, 15, 15, 15, 12, 15, 14, 15, 13, 15, 14, 15, 15, 15, 12, 15, 14, 15, 14, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 13, 10, 15, 14, 15, 14, 14, 15, 15, 15, 15, 14,
  15, 12, 15, 14, 15, 13, 15, 15, 14, 15, 12, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 15, 15, 14, 15, 14, 14, 14, 14, 12, 13, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 12, 14, 15, 15, 15, 15, 15,
  15, 15, 12, 14, 15, 14, 15, 15, 13, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 13, 15, 15, 14, 14, 13, 15, 15, 15, 14, 13, 15, 14, 15, 14, 15, 15, 13, 15, 13, 14, 15, 15, 13, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15,
  15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 14, 15, 14, 15, 13, 13, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 14, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 14, 14, 15,
  15, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 12, 14, 14, 13, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 12, 13, 14, 15, 15, 15, 15, 14, 15, 13, 14, 15, 15, 13, 14, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 13, 15, 15,
  14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 12, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 13, 12, 15, 15, 15,
  15, 14, 15, 14, 15, 14, 15, 15, 13, 15, 15, 13, 15, 15, 15, 13, 15, 14, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 14, 15, 15, 12, 14, 15, 13, 13, 15, 15, 13, 13, 12, 14, 15, 15, 15, 15, 15, 13, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15,
  15, 15, 14, 14, 12, 15, 15, 15, 14, 15, 14, 15, 13, 15, 15, 14, 15, 14, 13, 14, 15, 15, 13, 15, 15, 15, 15, 15, 14, 14, 13, 15, 15, 15, 14, 15, 14, 14, 15, 15, 15, 14, 15, 13, 14, 15, 11, 14, 15, 15, 15, 14, 13, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 14, 15, 13,
  14, 13, 13, 15, 11, 15, 15, 15, 15, 15, 14, 15, 15, 12, 15, 15, 13, 15, 14, 15, 15, 14, 15, 14, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 14, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 13, 15, 15, 14, 15, 15, 13,
  15, 14, 15, 14, 15, 14, 15, 13, 15, 15, 15, 14, 11, 14, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 15, 14, 14, 13, 15, 14, 13, 14, 15, 15, 15, 15, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 11, 15, 15, 14, 15, 13, 15, 14, 15, 9, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 12, 15, 13, 15, 13,
  14, 14, 14, 14, 13, 14, 15, 14, 13, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 15, 14, 15, 15, 15, 13, 15, 14, 14, 15, 14, 15, 15, 15, 12, 15, 15, 15, 14, 15, 14, 12, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 13, 15, 15, 13, 14, 14, 15, 15, 14, 15, 14, 15, 13, 15, 15, 15, 15, 13,
  15, 15, 15, 15, 12, 15, 14, 14, 15, 15, 15, 14, 14, 14, 14, 14, 15, 15, 15, 14, 14, 15, 13, 15, 15, 15, 14, 14, 15, 12, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 13, 15, 13, 15, 15, 15, 15, 13, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 13, 15, 14, 15, 12,
  15, 15, 14, 13, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 13, 15, 14, 15, 15, 15, 15, 14, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 11, 15, 15, 14, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 14, 15, 15, 15, 15, 14, 10, 15, 15, 15, 15, 12, 15, 14, 13, 14, 14, 14, 14,
  15, 15, 15, 15, 14, 15, 15, 15, 15, 13, 14, 15, 15, 15, 15, 15, 15, 12, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 13, 13, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 13, 14, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 15, 15, 15, 15, 14, 14, 13, 15, 15, 11, 15, 15, 14, 15, 14,
  15, 12, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 13, 15, 13, 14, 15, 15, 13, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 12, 15, 13, 15, 15, 15, 14, 14, 15, 15, 13, 15, 12, 15, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 12, 15,
  15, 15, 14, 15, 15, 15, 15, 12, 15, 15, 14, 15, 15, 15, 13, 15, 13, 15, 13, 14, 15, 15, 12, 14, 15, 14, 15, 13, 15, 15, 15, 14, 14, 15, 15, 13, 15, 14, 14, 13, 15, 15, 14, 14, 12, 14, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 12, 15, 15, 14, 15, 15, 15, 15, 13, 15, 14, 15, 15, 13, 15, 15, 15, 11,
  15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 13, 14, 12, 11, 15, 13, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 14, 14, 15, 13, 15, 15, 11, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 13, 15, 15, 15, 13, 15, 15, 14, 15, 13, 15, 14, 15,
  15, 14, 15, 15, 15, 12, 15, 14, 15, 11, 14, 15, 14, 15, 15, 15, 15, 13, 14, 15, 14, 14, 13, 14, 14, 14, 11, 13, 13, 15, 14, 14, 15, 14, 14, 15, 15, 12, 15, 15, 15, 14, 13, 12, 14, 13, 14, 14, 14, 15, 14, 15, 13, 15, 15, 14, 15, 15, 13, 15, 15, 13, 15, 14, 15, 14, 15, 14, 13, 14, 13, 15, 15, 14,
  12, 15, 14, 15, 14, 14, 14, 15, 14, 15, 12, 15, 15, 15, 14, 14, 15, 15, 15, 15, 14, 14, 14, 15, 14, 15, 14, 14, 15, 14, 15, 12, 15, 15, 14, 14, 14, 15, 13, 15, 13, 15, 15, 15, 15, 14, 14, 15, 13, 14, 15, 13, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 12, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15,
  13, 15, 13, 14, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 13, 15, 15, 12, 15, 14, 15, 15, 15, 15, 9, 15, 15, 15, 15, 12, 15, 14, 15, 15, 13, 15, 15, 13, 15, 14, 15, 12, 15, 15, 14, 15, 15, 14, 15, 15, 12, 15, 15, 14, 15, 13, 15, 14, 15, 14, 15, 15, 14, 12, 14, 13, 12, 15, 14,
  15, 15, 14, 14, 14, 12, 14, 13, 15, 14, 12, 13, 14, 14, 13, 14, 14, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 13, 15, 15, 14, 14, 15, 14, 15, 15, 13, 15, 15, 14, 15, 15, 12, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 12, 15, 15, 13,
  15, 15, 13, 14, 14, 13, 14, 14, 14, 13, 14, 14, 13, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 14, 14, 15, 15, 15, 14, 15, 15, 15, 13, 14, 15, 14, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14,
  14, 14, 15, 15, 15, 14, 15, 14, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 13, 14, 15, 13, 15, 15, 15, 12, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15,
  14, 12, 13, 15, 14, 15, 15, 14, 14, 15, 12, 13, 15, 15, 15, 15, 15, 13, 14, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 14, 14, 15, 15, 14, 14, 14, 14, 15, 13, 15, 15, 15, 14, 13, 13, 14, 15, 15, 14, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 14, 15, 15, 15, 15, 14, 13, 15, 14, 14, 15, 15,
  15, 14, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 15, 14, 13, 15, 15, 15, 15, 15, 13, 15, 13, 15, 15, 14, 15, 15, 15, 13, 15, 15, 14, 13, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 15, 15, 12, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 12, 15, 13, 14,
  14, 14, 14, 12, 14, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 13, 15, 14, 14, 13,
  15, 14, 15, 14, 14, 15, 13, 15, 13, 15, 15, 15, 15, 12, 15, 15, 13, 15, 12, 15, 13, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15, 15, 14, 15, 14, 13, 15, 14, 15, 12, 15, 13, 14, 15, 15, 15, 15, 14, 13, 12, 14, 15, 15, 14, 15, 12, 15, 15, 15, 15, 15, 14, 15, 13, 15, 15, 15,
  14, 14, 15, 14, 14, 13, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 13, 14, 15, 14, 15, 15, 14, 15, 15, 13, 15, 15, 13, 15, 15, 15, 14, 14, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 13, 15, 15, 14, 15, 13, 15, 15, 14, 15, 14, 15, 15, 14, 15, 12, 15, 15, 13, 15, 14, 15,
  13, 15, 15, 14, 15, 15, 14, 15, 14, 15, 13, 15, 14, 15, 15, 15, 14, 13, 14, 15, 15, 15, 15, 13, 15, 15, 15, 14, 14, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 14, 14, 14, 14, 14, 15, 15, 14, 15, 14, 15, 14, 15, 12, 15, 14, 15, 12, 14, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 11, 14, 13, 14, 14, 14,
  14, 14, 14, 14, 14, 14, 13, 14, 14, 15, 14, 14, 14, 14, 14, 15, 15, 13, 14, 12, 14, 13, 15, 14, 14, 14, 14, 14, 13, 15, 13, 14, 15, 14, 14, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 15, 13, 15, 15, 14, 15, 13, 13, 14, 11, 14, 14, 14, 14,
  14, 15, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 13, 14, 15, 15, 15, 15, 14, 13, 14, 15, 15, 13, 15, 13, 14, 13, 13, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 12, 15, 14, 13, 14, 15, 14, 15, 15, 13, 13, 15, 15, 9, 13, 15, 15, 14, 15, 14, 15, 14, 13, 15,
  15, 13, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 16, 15, 15, 14, 15, 15, 14, 15, 12, 15,
  15, 15, 15, 14, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 15, 15, 15, 14, 13, 15, 15, 15, 15, 15, 15, 14, 15, 14, 14, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 8, 15, 13, 14, 15, 14, 15, 15, 13, 14, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 14, 14, 14, 15, 14, 13, 15,
  15, 14, 13, 14, 8, 15, 14, 14, 14, 15, 14, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 12, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 15, 14, 15, 14, 14, 15, 15, 12, 15, 15, 15, 14, 14, 15, 15, 15, 14, 15, 14, 14, 14, 14, 14,
  13, 14, 13, 14, 15, 15, 14, 15, 14, 14, 14, 15, 14, 14, 14, 15, 14, 14, 14, 15, 14, 14, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 12, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 14, 13, 15, 15, 15, 15, 12, 13, 13, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15,
  15, 14, 15, 15, 13, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 13, 15, 15, 14, 15, 13, 15, 15, 13, 15, 15, 15, 15, 15, 15, 13, 15, 15, 13, 14, 14, 14, 14, 15, 15, 15, 14, 15, 14, 14, 12, 15, 15, 14, 14, 15, 15, 14, 14, 14,
  14, 15, 13, 14, 14, 13, 14, 14, 15, 13, 14, 15, 15, 13, 15, 14, 15, 15, 14, 15, 13, 15, 15, 15, 14, 14, 14, 15, 13, 13, 15, 14, 15, 14, 14, 13, 15, 14, 15, 15, 12, 14, 14, 14, 13, 13, 14, 14, 14, 14, 15, 14, 13, 15, 15, 14, 14, 14, 15, 15, 14, 14, 14, 14, 15, 14, 12, 14, 14, 15, 15, 14, 15, 15,
  13, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 14, 15, 14, 15, 12, 15, 14, 15, 15, 15, 15, 14, 15, 12, 15, 14, 15, 15, 15, 15, 14, 14, 14, 14, 13, 15, 14, 14, 14, 14, 14, 12, 12, 14, 15, 15, 13, 14, 15, 8, 12, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 14, 15, 15, 15, 14, 14, 13, 15, 14, 15, 14, 15,
  15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 13, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 12, 15, 15, 15, 15, 15, 15, 14, 13, 14, 14, 15, 15, 13, 15, 15, 15, 13, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 14, 14, 14, 14, 14, 15, 14, 15, 15, 15, 15, 14, 13, 14, 15, 13, 14, 15, 13, 15, 14, 15,
  15, 14, 14, 14, 14, 15, 14, 15, 15, 15, 14, 13, 13, 15, 13, 15, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 13, 15, 9, 15, 15, 15, 14, 13, 14, 15, 15, 13, 15, 14, 14, 12, 13, 14, 14, 14, 15, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 14, 15, 14, 15, 15, 14, 15, 15, 13, 14, 15, 15, 12, 13, 15, 15, 15, 15, 14, 14, 14, 15, 13, 13, 15, 13, 14, 15, 14, 15, 12, 14, 15, 14, 15, 14, 13, 15, 14, 15, 14, 13, 13, 15, 12, 15, 15, 13, 15, 15, 15, 14, 15, 15, 13, 15, 15, 13, 15, 15,
  15, 13, 15, 15, 13, 15, 14, 15, 14, 15, 15, 12, 15, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 14, 15, 15, 13, 15, 15, 14, 15, 15, 11, 15, 15, 13, 15, 15, 12, 15, 15, 15, 15, 13, 14, 14, 15, 13, 12, 15, 15, 15, 15, 14, 15, 15, 12, 14, 15, 14, 14, 13, 14, 13, 15, 14, 13, 14,
  13, 15, 12, 15, 14, 15, 14, 15, 14, 15, 14, 14, 15, 14, 15, 14, 15, 15, 14, 14, 15, 15, 14, 15, 15, 14, 14, 15, 15, 14, 13, 14, 15, 15, 14, 14, 14, 14, 15, 14, 14, 13, 13, 14, 14, 14, 14, 14, 10, 14, 15, 13, 14, 13, 14, 14, 12, 14, 14, 14, 13, 15, 14, 15, 15, 15, 12, 14, 15, 14, 14, 15, 14, 13,
  15, 14, 15, 15, 14, 15, 14, 15, 12, 15, 15, 15, 14, 15, 14, 15, 14, 15, 13, 15, 15, 14, 15, 15, 15, 15, 12, 15, 15, 15, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 13, 15, 15, 13, 14, 15, 11, 14, 15, 14, 14, 12, 15, 14, 12, 14, 15, 14, 15, 15, 12, 15, 15, 14, 14, 14, 15,
  14, 14, 14, 14, 14, 15, 14, 14, 14, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 13, 15, 14, 11, 15, 15, 15, 15, 14, 15, 12, 15, 15, 14, 13, 14, 14, 13, 14, 14, 12, 15, 14, 15, 13, 15, 14, 14, 14, 14, 14, 15, 15, 15, 14, 15, 15, 15, 14, 12, 15, 13, 15, 15, 12, 14, 15, 15, 13, 15, 15, 15, 15,
  14, 14, 15, 15, 13, 14, 15, 14, 13, 14, 14, 15, 14, 14, 14, 14, 15, 15, 15, 12, 15, 15, 14, 14, 15, 14, 15, 15, 15, 15, 15, 14, 14, 14, 15, 15, 15, 14, 13, 14, 14, 14, 15, 14, 10, 14, 12, 14, 14, 13, 14, 15, 14, 13, 14, 14, 15, 15, 15, 14, 15, 15, 13, 15, 14, 15, 14, 14, 14, 14, 14, 15, 14, 15,
  15, 15, 14, 12, 14, 14, 13, 15, 15, 14, 14, 14, 14, 13, 14, 14, 15, 15, 15, 14, 15, 15, 13, 14, 15, 14, 11, 14, 14, 15, 15, 15, 15, 14, 14, 14, 14, 15, 14, 15, 15, 14, 14, 15, 15, 15, 15, 14, 14, 14, 14, 14, 15, 15, 13, 15, 15, 13, 15, 12, 15, 14, 15, 15, 14, 13, 15, 14, 15, 15, 14, 15, 15, 13,
  15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 11, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 15, 13, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 12, 15, 14, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 15, 15, 14, 13, 15, 15, 15, 14, 15, 14,
  14, 14, 14, 12, 14, 14, 15, 14, 15, 14, 15, 15, 14, 14, 15, 10, 14, 15, 15, 15, 15, 13, 15, 15, 11, 15, 15, 13, 15, 14, 13, 15, 14, 14, 13, 14, 13, 15, 15, 15, 13, 14, 14, 13, 15, 14, 14, 13, 14, 15, 14, 14, 15, 13, 14, 14, 15, 14, 14, 14, 14, 14, 14, 13, 14, 15, 14, 13, 15, 14, 14, 14, 14, 11,
  15, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 15, 15, 14, 15, 15, 15, 13, 15, 15, 14, 15, 15, 14, 15, 15, 12, 15, 14, 15, 14, 15, 15, 13, 15, 15, 14, 15, 15, 15, 14, 14, 13, 15, 15, 15, 13, 15, 14, 15, 15, 12, 14, 14, 14, 15, 14, 13, 14, 13, 10, 15, 15, 14, 15, 13, 14, 14, 14, 14, 15, 14, 14, 15,
  15, 15, 15, 15, 14, 15, 14, 13, 15, 15, 15, 14, 15, 13, 14, 14, 15, 14, 15, 12, 14, 15, 14, 14, 15, 15, 14, 13, 14, 14, 14, 14, 12, 14, 15, 12, 15, 14, 13, 14, 15, 14, 12, 15, 15, 14, 14, 13, 15, 15, 13, 14, 13, 14, 14, 14, 15, 15, 15, 14, 15, 9, 14, 13, 14, 14, 15, 15, 13, 14, 14, 15, 14, 13, 15,
  15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 13, 14, 14, 10, 14, 15, 15, 14, 15, 15, 14, 14, 13, 13, 14, 14, 14, 14, 15, 15, 13, 15, 13, 15, 14, 14, 13, 14, 15, 15, 15, 15, 14, 15, 15, 15, 13, 14, 14, 15, 14, 15, 14, 15, 14,
  15, 15, 15, 13, 15, 14, 15, 14, 15, 14, 15, 14, 15, 13, 15, 15, 11, 15, 14, 15, 15, 14, 15, 13, 15, 15, 13, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 12, 14, 15, 15, 13, 15, 14, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 15, 15, 13, 14, 12, 15, 13, 14, 15, 15, 15,
  13, 15, 14, 15, 15, 14, 14, 13, 15, 15, 15, 13, 14, 15, 15, 14, 14, 14, 13, 14, 13, 14, 14, 15, 14, 14, 15, 13, 15, 15, 15, 12, 14, 15, 15, 14, 15, 14, 15, 15, 15, 12, 14, 15, 15, 14, 15, 14, 15, 15, 14, 14, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 15, 14, 15, 15,
  14, 15, 14, 13, 14, 15, 14, 12, 14, 14, 14, 14, 14, 14, 13, 14, 14, 15, 14, 14, 15, 14, 13, 14, 14, 15, 14, 14, 15, 15, 15, 13, 15, 14, 15, 14, 15, 11, 14, 14, 15, 14, 14, 15, 14, 14, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 13, 15, 14, 14, 13, 15, 14,
  15, 13, 14, 14, 12, 13, 14, 15, 12, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 15, 15, 14, 15, 14, 15, 12, 15, 13, 14, 13, 14, 15, 15, 14, 15, 15, 14, 15, 13, 14, 14, 15, 15, 14, 14, 15, 15, 14, 15, 15, 13, 15, 15, 12, 15, 15, 15, 14,
  14, 14, 13, 15, 14, 13, 14, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 13, 14, 12, 15, 15, 14, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 15, 15, 14, 15, 15, 13, 15, 15, 14, 11, 14, 15, 14, 15, 15, 15, 14, 15, 15, 15, 14, 15, 14, 15, 14, 15, 15, 13, 15, 15, 15, 15, 15, 14, 15, 15, 15, 14,
  14, 14, 14, 14, 15, 15, 15, 14, 14, 15, 12, 15, 15, 13, 15, 12, 14, 15, 13, 15, 15, 12, 15, 15, 14, 15, 13, 15, 15, 14, 15, 13, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 13, 15, 15, 15, 15, 13, 15, 15, 12, 15, 15, 14, 15, 15, 15, 15, 15,
  11, 15, 15, 14, 15, 12, 15, 15, 14, 14, 15, 15, 14, 14, 15, 15, 15, 14, 11, 15, 14, 15, 14, 13, 13, 14, 15, 15, 15, 13, 12, 15, 15, 13, 14, 13, 13, 13, 10, 15, 15, 14, 14, 14, 15, 13, 14, 15, 14, 14, 14, 13, 14, 15, 15, 15, 14, 14, 14, 15, 13, 14, 15, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14,
  15, 15, 15, 15, 15, 13, 14, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 15, 15, 13, 14, 15, 15, 15, 14, 13, 14, 13, 14, 14, 14, 14, 15, 14, 14, 14, 12, 14, 15, 15, 13, 14, 15, 14, 14, 14, 12, 15, 13, 15, 15, 12, 14, 15, 15, 14, 15, 14, 14, 15, 12, 15, 15, 13, 15, 15, 13, 15, 15, 13, 14, 15, 15,
  14, 15, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 14, 12, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 11, 14, 15, 14, 14, 14, 14, 13, 15, 14, 14, 14, 15, 15, 13, 14, 14, 13, 14, 12, 14, 14, 14, 15, 15, 15, 13, 14, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 13, 15, 15, 14, 15, 14, 15,
  15, 14, 15, 15, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 14, 15, 15, 15, 13, 13, 15, 13, 15, 14, 14, 15, 15, 15, 15, 13, 15, 15, 15, 15, 15, 13, 14, 14, 13, 15, 15, 14, 14, 15, 15, 14, 15, 14, 13, 13, 15, 14, 15, 14, 15, 15, 12, 14, 11, 15, 14, 14,
  14, 14, 14, 15, 14, 14, 15, 13, 14, 15, 14, 15, 14, 15, 15, 12, 15, 14, 15, 15, 15, 15, 12, 15, 15, 15, 13, 15, 15, 15, 15, 12, 15, 14, 15, 15, 11, 15, 14, 15, 15, 12, 15, 14, 15, 12, 15, 14, 15, 15, 14, 15, 14, 13, 14, 15, 13, 15, 13, 15, 14, 15, 15, 13, 15, 14, 15, 15, 10, 15, 15, 13, 13, 14,
  15, 15, 15, 14, 14, 14, 14, 12, 14, 13, 15, 15, 15, 15, 14, 14, 15, 14, 13, 15, 15, 14, 15, 14, 14, 14, 15, 15, 15, 15, 15, 14, 13, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 12, 15, 15, 13, 12, 14, 12, 13, 14, 15, 13, 14, 15, 15, 14, 14, 14, 14, 14, 15, 14, 13, 15, 13, 14, 12, 15, 14, 12, 12,
  14, 14, 13, 11, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 13, 15, 10, 15, 15, 14, 14, 14, 15, 14, 14, 15, 15, 15, 15, 13, 15, 15, 14, 14, 15, 14, 15, 15, 14, 15, 15, 14, 15, 14, 14, 15, 13, 14, 15, 14, 12, 15, 14, 13, 14, 14, 14, 15, 15, 14, 13, 14, 14, 14, 14, 13, 14, 13, 14, 15,
  14, 14, 14, 14, 13, 14, 15, 14, 14, 14, 14, 13, 14, 15, 13, 15, 12, 14, 15, 15, 15, 15, 10, 15, 15, 14, 14, 14, 12, 14, 14, 15, 15, 15, 14, 15, 15, 15, 11, 15, 15, 15, 15, 13, 15, 14, 15, 14, 15, 15, 15, 14, 14, 14, 13, 14, 12, 14, 14, 14, 15, 15, 14, 15, 15, 15, 14, 15, 13, 15, 14, 15, 15, 14,
  14, 14, 15, 14, 15, 14, 15, 13, 15, 13, 13, 15, 15, 15, 14, 14, 14, 15, 13, 15, 14, 12, 14, 15, 15, 14, 14, 14, 15, 15, 14, 14, 15, 15, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 13, 14, 14, 15, 14, 15, 13, 15, 15, 15, 14, 14, 15, 14, 15, 15, 15, 13, 15, 14, 15, 15, 14,
  15, 15, 15, 13, 15, 14, 15, 15, 13, 15, 14, 15, 15, 13, 15, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 14, 15, 15, 15, 15, 14, 12, 13, 14, 13, 13, 15, 14, 15, 15, 15, 15, 15, 14, 13, 15, 14, 14, 12, 14, 14, 15, 15, 14, 15, 14, 12, 15, 13, 14, 15, 14, 11, 14, 15, 14, 15, 15, 14,
  15, 14, 15, 14, 15, 14, 15, 14, 14, 12, 14, 15, 15, 15, 15, 14, 15, 15, 14, 14, 15, 15, 13, 14, 14, 14, 13, 13, 14, 14, 15, 14, 14, 14, 14, 15, 15, 14, 14, 12, 14, 14, 12, 15, 15, 15, 15, 14, 13, 15, 14, 13, 15, 13, 14, 13, 14, 13, 9, 15, 15, 14, 14, 14, 15, 15, 14, 14, 14, 15, 14, 13, 15, 14, 15,
  15, 13, 15, 15, 12, 15, 14, 15, 14, 14, 15, 14, 13, 15, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 11, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 13, 14, 15, 14, 14, 13, 14, 14, 11, 13, 15, 12, 15, 15, 13, 15, 14, 15, 14, 15, 14, 15, 13, 15, 15,
  14, 15, 13, 15, 12, 14, 14, 14, 13, 14, 14, 14, 14, 15, 15, 15, 15, 15, 13, 12, 15, 15, 14, 14, 15, 15, 14, 15, 14, 13, 14, 12, 14, 15, 15, 15, 14, 14, 13, 14, 15, 14, 15, 15, 12, 15, 14, 14, 14, 14, 13, 14, 13, 15, 14, 15, 15, 13, 14, 13, 14, 14, 15, 15, 14, 15, 14, 15, 12, 13, 15, 15, 13, 14,
  14, 15, 14, 15, 15, 9, 14, 13, 15, 15, 12, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 13, 15, 15, 14, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 13, 15, 14, 14, 15, 15, 13, 15, 15, 13, 15, 15, 15, 14, 15, 14, 14, 14, 15, 13, 14, 14, 15, 14, 15, 15, 15, 12, 15, 14, 14, 15, 15, 15,
  14, 15, 14, 15, 14, 13, 14, 14, 14, 15, 14, 15, 13, 13, 15, 14, 13, 14, 14, 14, 15, 13, 15, 15, 15, 15, 12, 14, 14, 14, 15, 15, 14, 15, 13, 15, 14, 15, 14, 13, 14, 14, 14, 13, 15, 15, 14, 15, 14, 13, 14, 15, 15, 14, 13, 14, 15, 13, 14, 14, 14, 15, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 13, 15,
  15, 15, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 14, 13, 14, 14, 14, 14, 15, 14, 15, 13, 15, 14, 15, 14, 15, 14, 15, 12, 15, 13, 11, 14, 15, 15, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 13, 14, 14, 15,
  15, 15, 15, 13, 14, 14, 14, 15, 14, 14, 15, 15, 15, 14, 15, 14, 15, 12, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 14, 14, 14, 14, 11, 14, 14, 14, 13, 14, 14, 15, 15, 14, 15, 15, 13, 14, 14, 14, 14, 12, 15, 14, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 13, 13, 14, 15, 15, 15, 15, 14, 15, 14, 14,
  14, 14, 13, 15, 15, 14, 14, 15, 14, 15, 13, 13, 15, 14, 14, 14, 14, 14, 13, 15, 13, 15, 14, 15, 12, 15, 15, 13, 15, 14, 15, 15, 13, 15, 14, 15, 15, 13, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 14, 14, 14, 15, 14, 15, 14, 14, 14, 14, 15, 14, 15, 14, 15, 14, 15, 12, 15, 14, 15, 15, 14, 15, 11, 14,
  14, 15, 13, 14, 15, 13, 14, 15, 15, 15, 14, 15, 13, 13, 15, 15, 13, 15, 14, 14, 15, 15, 15, 14, 15, 14, 14, 15, 14, 13, 15, 14, 12, 15, 14, 14, 13, 14, 15, 14, 14, 14, 15, 12, 14, 15, 13, 14, 14, 13, 14, 14, 14, 8, 15, 15, 15, 15, 14, 15, 14, 14, 11, 15, 14, 15, 14, 14, 15, 14, 14, 15, 15, 14, 14,
  14, 15, 15, 11, 14, 13, 15, 15, 13, 13, 14, 15, 15, 14, 13, 15, 15, 14, 14, 12, 15, 14, 13, 15, 15, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 14, 15, 14, 15, 14, 13, 15, 15, 15, 13, 15, 14, 15, 15, 13, 15, 15, 14, 15, 14, 14, 14, 15, 13, 15, 14, 13, 14, 14, 14, 14, 13, 11, 12, 14, 15, 15, 13,
  14, 14, 12, 14, 15, 13, 14, 14, 14, 13, 14, 12, 14, 14, 12, 14, 15, 14, 14, 13, 14, 14, 14, 15, 15, 14, 14, 14, 15, 14, 14, 15, 14, 15, 14, 15, 14, 15, 13, 15, 14, 15, 13, 14, 13, 14, 14, 13, 14, 13, 15, 14, 14, 12, 14, 14, 14, 14, 14, 14, 15, 13, 15, 14, 14, 13, 14, 14, 14, 14, 14, 15, 15, 13,
  15, 15, 14, 15, 15, 15, 13, 14, 13, 14, 14, 15, 14, 14, 14, 15, 14, 14, 14, 14, 15, 15, 14, 14, 15, 15, 14, 15, 15, 14, 15, 15, 15, 14, 14, 15, 15, 14, 15, 15, 15, 14, 15, 15, 15, 12, 15, 14, 15, 15, 12, 15, 14, 15, 15, 12, 15, 14, 15, 14, 14, 14, 14, 13, 14, 15, 13, 15, 14, 14, 14, 15, 15, 14,
  15, 15, 13, 14, 14, 15, 14, 15, 15, 15, 13, 15, 15, 15, 14, 15, 14, 14, 13, 14, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 14, 15, 14, 12, 14, 14, 13, 14, 11, 13, 15, 14, 15, 14, 15, 15, 12, 15, 14, 14, 14, 14, 15, 13, 15, 15, 13, 15, 15, 15, 13, 15,
  15, 13, 15, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 14, 14, 14, 14, 12, 14, 13, 14, 15, 12, 14, 15, 13, 14, 13, 14, 12, 14, 13, 14, 13, 15, 15, 14, 15, 15, 13, 15, 15, 14, 12, 14, 14, 15, 15, 13, 14, 15, 14, 15, 14, 15, 13, 14, 15, 15, 15, 14, 15, 15, 15, 13, 13,
  15, 15, 15, 13, 14, 15, 14, 14, 14, 15, 13, 15, 14, 12, 14, 14, 15, 13, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 12, 14, 14, 15, 14, 14, 13, 14, 14, 14, 15, 14, 14, 15, 15, 13, 15, 15, 14, 14, 14, 14, 14, 14, 15, 12, 15, 14, 14, 13, 14, 14, 15, 14, 14, 14, 11, 14, 14, 14, 14,
  15, 12, 14, 14, 15, 13, 15, 14, 15, 15, 14, 15, 13, 14, 13, 15, 15, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 10, 14, 14, 14, 14, 15, 15, 14, 13, 14, 14, 14, 13, 14, 14, 14, 15, 14, 14, 14, 12, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 14, 13, 14, 12, 14, 15, 12,
  15, 15, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 15, 14, 11, 14, 13, 15, 14, 15, 12, 14, 13, 15, 14, 14, 15, 12, 15, 13, 15, 15, 15, 15, 14, 14, 14, 14, 13, 14, 14, 15, 14, 14, 14, 15, 15, 15, 10, 15, 15, 15, 14, 14, 14, 14, 15, 15, 14, 14, 15, 14, 15, 14, 15, 15, 14, 15, 14, 15, 15, 13, 15,
  15, 13, 15, 14, 15, 13, 15, 15, 13, 15, 14, 15, 14, 14, 14, 14, 14, 15, 13, 15, 14, 14, 14, 15, 15, 15, 14, 14, 15, 15, 14, 15, 14, 15, 14, 14, 14, 13, 12, 14, 15, 15, 14, 14, 15, 15, 14, 15, 14, 15, 14, 15, 15, 15, 15, 14, 15, 15, 13, 14, 15, 15, 15, 14, 14, 14, 14, 15, 14, 14, 14, 13, 15, 14,
  13, 14, 14, 13, 15, 14, 15, 13, 15, 12, 14, 13, 15, 13, 14, 14, 13, 14, 14, 14, 14, 13, 14, 11, 14, 14, 14, 13, 13, 14, 14, 14, 13, 11, 14, 14, 14, 14, 15, 13, 14, 14, 12, 14, 14, 14, 15, 14, 14, 15, 15, 14, 13, 14, 14, 15, 15, 15, 15, 15, 15, 15, 13, 14, 14, 14, 14, 15, 14, 15, 15, 13, 14, 15,
  14, 15, 12, 15, 14, 15, 12, 15, 15, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 13, 15, 14, 14, 14, 13, 15, 14, 15, 14, 14, 14, 14, 14, 12, 14, 13, 14, 13, 14, 15, 14, 12, 14, 14, 15, 13, 13, 14, 13, 14, 14, 14, 15, 14, 15, 15, 14, 13, 14, 14, 13, 12, 13, 14, 14, 14, 14, 14, 15, 14, 14, 14,
  14, 10, 15, 14, 15, 14, 14, 14, 14, 15, 14, 14, 14, 14, 15, 14, 15, 15, 13, 15, 14, 13, 15, 15, 14, 13, 14, 14, 14, 13, 15, 12, 14, 14, 15, 13, 15, 15, 15, 14, 13, 15, 14, 14, 15, 15, 14, 15, 14, 15, 15, 13, 15, 15, 11, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 13, 14, 13, 14,
  14, 14, 15, 13, 14, 15, 15, 13, 15, 15, 15, 15, 15, 15, 14, 13, 14, 15, 15, 14, 12, 14, 15, 15, 14, 14, 14, 15, 13, 14, 14, 15, 15, 15, 13, 14, 14, 14, 14, 14, 14, 13, 14, 15, 15, 14, 15, 11, 15, 14, 14, 15, 12, 15, 13, 15, 13, 15, 14, 12, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 15, 8, 14, 15,
  14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 13, 15, 14, 15, 14, 15, 15, 13, 15, 15, 13, 15, 15, 14, 15, 15, 13, 15, 13, 14, 14, 14, 15, 15, 14, 14, 15, 12, 13, 14, 14, 14, 15, 12, 14, 14, 13, 15, 15, 15, 15, 15, 14, 15, 14, 15, 14, 14, 15, 14, 14, 15, 14, 14, 15, 13, 14, 14, 13, 15, 14, 14, 14, 15,
  14, 14, 14, 14, 14, 14, 12, 15, 13, 14, 13, 14, 14, 14, 14, 12, 15, 14, 14, 15, 14, 14, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 15, 13, 14, 15, 15, 13, 15, 13, 15, 10, 15, 13, 15, 15, 13, 14, 14, 14, 15, 15, 15, 14, 13, 14, 15, 15, 13, 15, 14, 12, 15, 14, 15, 14, 15, 15, 14, 13, 14, 12, 14, 14,
  14, 12, 14, 14, 13, 14, 14, 14, 14, 12, 14, 14, 12, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 13, 15, 14, 12, 13, 15, 15, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 14, 15, 14, 14, 14, 12, 13, 14, 14, 13, 14, 15, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 12, 15, 14, 13, 15, 15, 15, 15, 13, 15,
  14, 14, 13, 14, 15, 14, 15, 13, 14, 15, 14, 14, 14, 14, 13, 15, 15, 14, 14, 15, 14, 14, 14, 15, 14, 15, 14, 15, 12, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 14, 15, 15, 11, 15, 14, 15, 14, 15, 14, 14, 14, 10, 14, 15, 14, 15, 14, 12, 15, 13, 15, 14, 14, 13, 14, 14, 14, 14, 14, 15, 11, 15, 14, 13,
  15, 14, 14, 11, 14, 13, 14, 14, 14, 14, 15, 14, 14, 14, 14, 15, 15, 12, 14, 14, 14, 15, 12, 15, 14, 13, 14, 13, 14, 14, 14, 14, 13, 14, 15, 15, 14, 14, 13, 14, 13, 14, 15, 13, 15, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 15, 13, 15, 15, 14, 15, 13, 15, 14, 15, 14, 15, 14, 14, 14, 14, 14,
  15, 14, 15, 14, 14, 12, 15, 14, 15, 14, 14, 14, 14, 15, 14, 14, 15, 12, 14, 14, 14, 13, 14, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 15, 12, 15, 13, 14, 14, 14, 15, 15, 14, 11, 14, 14, 14, 12, 14, 11, 14, 14, 13, 15, 14, 15, 14, 14, 13, 15, 13, 14, 14, 15, 14,
  14, 13, 15, 15, 14, 14, 14, 13, 14, 15, 12, 14, 15, 14, 15, 15, 15, 15, 13, 14, 15, 14, 14, 14, 15, 14, 14, 15, 15, 11, 14, 15, 14, 14, 15, 13, 15, 14, 15, 14, 14, 14, 15, 15, 15, 14, 14, 13, 14, 14, 12, 14, 13, 14, 14, 14, 14, 14, 14, 14, 10, 14, 15, 14, 15, 14, 14, 15, 14, 15, 14, 13, 15, 14,
  14, 12, 14, 14, 14, 14, 15, 15, 15, 12, 14, 13, 15, 15, 14, 14, 14, 14, 13, 14, 14, 15, 13, 15, 12, 14, 14, 15, 14, 15, 14, 14, 14, 15, 14, 14, 15, 14, 14, 13, 14, 14, 14, 15, 15, 15, 15, 14, 15, 15, 14, 15, 14, 14, 15, 14, 13, 14, 14, 15, 13, 14, 13, 14, 14, 15, 14, 14, 15, 14, 14, 15, 15, 15,
  14, 14, 14, 14, 14, 13, 15, 15, 14, 14, 14, 14, 14, 14, 15, 14, 13, 14, 14, 15, 15, 11, 15, 14, 14, 14, 13, 13, 14, 12, 13, 14, 15, 15, 14, 15, 15, 13, 14, 14, 14, 14, 14, 14, 13, 15, 14, 12, 14, 13, 14, 13, 15, 15, 14, 11, 14, 14, 14, 15, 14, 14, 13, 14, 15, 12, 13, 14, 13, 14, 15, 15, 14, 15,
  14, 14, 15, 15, 15, 14, 14, 15, 15, 12, 14, 14, 12, 14, 14, 14, 14, 15, 14, 14, 14, 14, 15, 14, 15, 14, 14, 14, 14, 13, 15, 14, 15, 14, 14, 14, 14, 13, 14, 15, 14, 14, 14, 14, 14, 14, 13, 15, 14, 14, 12, 14, 13, 15, 15, 15, 15, 11, 14, 13, 14, 14, 14, 13, 15, 15, 13, 13, 14, 14, 14, 15, 15, 13,
  14, 13, 15, 14, 12, 14, 15, 15, 15, 14, 13, 15, 15, 13, 15, 15, 12, 15, 14, 15, 15, 12, 15, 14, 15, 14, 15, 13, 15, 14, 15, 14, 12, 15, 14, 15, 13, 14, 14, 13, 14, 14, 14, 13, 15, 14, 14, 14, 14, 12, 14, 13, 14, 14, 13, 14, 14, 14, 14, 15, 14, 11, 14, 13, 15, 14, 15, 14, 12, 13, 12, 14, 14, 12,
  14, 14, 14, 15, 14, 13, 14, 14, 14, 13, 13, 14, 13, 14, 15, 13, 15, 14, 14, 14, 14, 14, 12, 13, 15, 12, 14, 13, 14, 13, 14, 14, 14, 14, 14, 12, 14, 14, 13, 14, 14, 12, 14, 14, 13, 14, 13, 12, 14, 14, 15, 13, 14, 14, 14, 13, 14, 14, 14, 15, 12, 14, 14, 11, 14, 14, 15, 14, 13, 11, 14, 12, 14, 13,
  14, 13, 14, 14, 14, 14, 15, 13, 13, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 15, 15, 15, 15, 14, 14, 15, 13, 14, 15, 14, 14, 14, 10, 13, 14, 14, 14, 14, 14, 14, 15, 15, 14, 14, 13, 14, 15, 15, 15, 14, 13, 15, 13, 11, 14, 14, 14, 14, 14, 15, 15, 14, 13, 14, 14, 15, 14, 14, 13, 13, 14, 15, 15,
  14, 15, 12, 14, 14, 14, 14, 14, 14, 14, 15, 15, 14, 15, 14, 14, 13, 15, 14, 14, 15, 14, 14, 13, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 15, 14, 15, 14, 15, 14, 14, 14, 14, 15, 14, 14, 15, 14, 15, 15, 13, 13, 15, 15, 13, 15, 14, 14, 13, 14, 15, 14, 14, 14, 14, 12, 14, 13, 14, 14, 15, 14, 15, 14,
  15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 15, 13, 15, 15, 15, 13, 14, 15, 13, 10, 14, 14, 14, 14, 14, 14, 13, 14, 15, 14, 13, 15, 13, 14, 14, 12, 15, 14, 14, 12, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 14, 15, 15, 14, 14, 14, 14, 13, 15, 13, 13, 14, 15, 15, 15,
  15, 15, 14, 14, 12, 15, 14, 14, 12, 14, 14, 14, 14, 14, 13, 14, 13, 14, 15, 14, 14, 14, 15, 15, 14, 15, 15, 14, 14, 15, 14, 15, 13, 14, 11, 12, 14, 13, 12, 14, 14, 12, 14, 14, 14, 13, 14, 14, 15, 13, 14, 14, 14, 15, 15, 15, 13, 14, 14, 14, 14, 14, 10, 14, 14, 14, 14, 13, 14, 15, 15, 15, 14, 14,
  15, 14, 13, 14, 14, 14, 13, 14, 15, 12, 12, 14, 14, 14, 14, 14, 14, 14, 15, 13, 14, 15, 13, 14, 15, 15, 15, 14, 13, 15, 13, 14, 13, 15, 15, 14, 14, 14, 13, 14, 14, 14, 14, 14, 12, 15, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 13, 14, 14, 12, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15,
  14, 15, 14, 15, 14, 15, 14, 15, 14, 14, 12, 14, 14, 14, 14, 14, 14, 13, 14, 13, 15, 12, 13, 13, 14, 13, 15, 14, 15, 14, 15, 14, 8, 15, 14, 14, 14, 14, 15, 14, 15, 15, 15, 12, 14, 14, 14, 12, 14, 11, 13, 15, 15, 14, 14, 14, 15, 15, 14, 15, 15, 13, 13, 14, 14, 15, 14, 12, 14, 14, 14, 15, 14, 15, 15,
  14, 13, 14, 14, 14, 14, 13, 14, 14, 13, 15, 14, 14, 13, 14, 14, 14, 13, 13, 15, 14, 15, 14, 15, 12, 14, 15, 15, 14, 14, 14, 14, 15, 15, 15, 14, 14, 14, 14, 13, 15, 13, 14, 15, 12, 14, 13, 13, 14, 12, 14, 14, 15, 15, 13, 15, 15, 11, 15, 14, 15, 15, 12, 15, 14, 15, 15, 12, 15, 14, 15, 15, 12, 15,
  15, 14, 13, 14, 15, 15, 13, 14, 14, 14, 14, 11, 15, 15, 13, 14, 14, 14, 14, 14, 14, 13, 15, 13, 14, 14, 14, 14, 13, 14, 15, 14, 13, 15, 14, 13, 14, 14, 13, 13, 12, 15, 15, 15, 13, 14, 12, 14, 14, 15, 14, 14, 15, 14, 14, 12, 14, 14, 14, 15, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 12, 12,
  14, 14, 14, 14, 14, 15, 14, 14, 15, 14, 14, 15, 12, 14, 14, 13, 15, 14, 13, 14, 15, 14, 13, 14, 14, 14, 13, 14, 12, 14, 13, 15, 15, 15, 13, 14, 14, 13, 15, 14, 12, 15, 14, 14, 14, 14, 12, 14, 14, 14, 15, 15, 15, 14, 15, 12, 15, 15, 14, 15, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14,
  14, 14, 14, 13, 14, 14, 14, 12, 14, 8, 14, 13, 14, 13, 15, 14, 11, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 15, 14, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 15, 13, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 12, 14, 13, 15, 14, 14, 14, 14, 12, 14, 12, 15, 13, 14, 13, 14, 15, 15, 15,
  13, 15, 15, 13, 14, 13, 15, 14, 14, 14, 15, 14, 13, 15, 15, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 13, 14, 10, 15, 13, 14, 14, 14, 14, 15, 15, 14, 15, 14, 15, 14, 14, 13, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14,
  15, 14, 15, 14, 15, 15, 13, 14, 15, 15, 13, 14, 15, 14, 14, 13, 14, 14, 14, 14, 14, 14, 15, 13, 13, 14, 15, 15, 14, 13, 15, 15, 15, 14, 15, 14, 13, 15, 14, 15, 14, 14, 14, 14, 15, 12, 14, 14, 14, 14, 15, 13, 14, 14, 13, 14, 12, 14, 14, 15, 14, 14, 15, 14, 14, 15, 14, 14, 14, 15, 14, 14, 13, 14,
  14, 15, 13, 14, 12, 14, 14, 13, 15, 14, 14, 13, 14, 15, 14, 14, 15, 14, 14, 15, 14, 15, 14, 14, 14, 15, 12, 15, 14, 15, 15, 13, 14, 14, 14, 14, 13, 14, 15, 13, 14, 14, 14, 14, 14, 14, 15, 15, 13, 13, 13, 13, 12, 14, 10, 13, 14, 13, 14, 14, 14, 15, 14, 12, 14, 14, 14, 15, 10, 14, 14, 14, 13, 14,
  12, 15, 13, 15, 15, 15, 15, 14, 12, 14, 14, 15, 15, 14, 14, 14, 14, 14, 14, 15, 13, 14, 14, 13, 14, 14, 14, 14, 14, 12, 15, 14, 14, 14, 15, 10, 15, 14, 15, 15, 14, 13, 14, 14, 14, 12, 14, 14, 14, 13, 14, 15, 14, 14, 14, 14, 15, 14, 15, 14, 14, 14, 13, 14, 14, 15, 14, 14, 14, 12, 14, 14, 14, 14,
  13, 14, 13, 14, 15, 15, 12, 15, 14, 15, 15, 12, 15, 14, 15, 14, 15, 15, 13, 15, 14, 15, 13, 15, 14, 13, 13, 14, 14, 14, 14, 14, 15, 15, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 15, 13, 15, 13, 13, 15, 13, 12, 13, 15, 14, 13, 14, 15, 13, 14, 14, 14, 14, 15, 14, 14, 15, 15, 11, 14, 14, 14, 14,
  14, 14, 15, 14, 12, 14, 14, 14, 14, 13, 15, 14, 14, 14, 13, 15, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 13, 15, 12, 15, 14, 15, 14, 13, 15, 15, 14, 14, 14, 14, 14, 15, 15, 15, 14, 15, 15, 12, 15, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 13, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14, 12, 14,
  14, 15, 13, 14, 14, 15, 14, 15, 13, 15, 14, 15, 14, 15, 15, 12, 15, 14, 15, 14, 15, 15, 14, 14, 14, 14, 14, 14, 14, 12, 15, 15, 14, 14, 13, 14, 12, 14, 14, 15, 14, 12, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 15, 10, 14, 14, 14, 15, 15, 14, 12, 14, 15, 15, 15, 14, 15, 14, 15, 13, 14, 14, 13,
  14, 14, 15, 15, 15, 15, 14, 14, 12, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 15, 15, 15, 14, 14, 14, 14, 14, 15, 14, 14, 14, 13, 15, 14, 14, 14, 14, 15, 14, 15, 12, 14, 14, 15, 14, 15, 15, 15, 14, 14, 11, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14,
  13, 14, 14, 13, 15, 14, 14, 15, 14, 14, 14, 14, 14, 14, 15, 12, 14, 14, 15, 15, 13, 14, 14, 10, 14, 15, 14, 14, 14, 14, 13, 14, 14, 14, 14, 15, 15, 15, 14, 15, 14, 15, 13, 15, 14, 15, 14, 15, 15, 13, 15, 13, 14, 14, 14, 14, 14, 15, 15, 11, 14, 13, 14, 14, 15, 15, 14, 14, 15, 14, 14, 14, 14, 14,
  14, 14, 15, 15, 14, 15, 14, 14, 13, 14, 14, 13, 14, 15, 15, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 15, 14, 14, 12, 14, 10, 14, 13, 14, 14, 12, 13, 15, 14, 14, 15, 15, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 14, 14, 15, 15, 13, 15, 15, 15, 15, 14, 15,
  15, 15, 13, 15, 15, 15, 14, 13, 14, 14, 13, 14, 14, 14, 13, 15, 13, 14, 14, 13, 14, 14, 14, 15, 13, 15, 11, 13, 14, 14, 14, 14, 15, 15, 15, 15, 12, 14, 14, 15, 14, 15, 14, 12, 14, 14, 14, 13, 14, 15, 14, 14, 14, 13, 15, 15, 14, 14, 14, 13, 12, 14, 14, 11, 14, 15, 14, 14, 13, 13, 14, 14, 12, 14,
  14, 14, 14, 14, 14, 13, 14, 14, 12, 14, 14, 14, 13, 14, 14, 12, 14, 14, 13, 15, 13, 14, 11, 14, 13, 15, 12, 14, 15, 14, 14, 14, 12, 14, 13, 14, 13, 14, 12, 14, 14, 13, 13, 13, 13, 14, 15, 13, 14, 13, 15, 15, 14, 14, 14, 15, 15, 14, 12, 14, 13, 14, 14, 13, 14, 14, 14, 13, 14, 15, 13, 14, 14, 14,
  14, 14, 13, 12, 14, 14, 14, 13, 14, 14, 12, 14, 15, 14, 14, 14, 14, 15, 15, 15, 14, 10, 14, 14, 13, 15, 13, 15, 13, 14, 15, 15, 15, 13, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 13, 14, 15, 11, 14, 14, 14, 13, 12, 14, 15, 14, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 15, 13, 13,
  14, 14, 15, 14, 15, 14, 14, 14, 14, 14, 15, 15, 14, 14, 14, 14, 13, 15, 14, 14, 13, 13, 15, 14, 12, 14, 13, 14, 14, 14, 14, 14, 15, 14, 15, 13, 15, 15, 15, 12, 15, 15, 14, 15, 15, 14, 15, 14, 14, 14, 13, 14, 12, 14, 14, 13, 13, 14, 14, 14, 14, 14, 15, 15, 13, 12, 14, 14, 14, 14, 14, 14, 14, 14,
  14, 13, 14, 13, 14, 15, 15, 12, 15, 14, 14, 10, 14, 15, 15, 14, 14, 14, 14, 12, 11, 14, 14, 14, 14, 15, 13, 14, 14, 14, 15, 14, 14, 13, 14, 15, 15, 15, 14, 15, 13, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 11, 15, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 15, 14, 15, 14, 15,
  14, 14, 13, 14, 14, 12, 14, 15, 14, 12, 14, 15, 15, 15, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 15, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 13, 14, 15, 14, 14, 13, 14, 15, 14, 15, 14, 15, 13, 12, 14, 11, 13, 11, 12, 13, 14, 14, 13, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 15, 14, 13, 15,
  14, 15, 14, 14, 14, 13, 14, 14, 14, 15, 14, 14, 11, 15, 14, 14, 13, 15, 14, 15, 13, 15, 12, 14, 15, 15, 14, 12, 12, 14, 12, 15, 14, 14, 14, 14, 15, 15, 12, 14, 12, 14, 14, 14, 14, 13, 15, 15, 14, 14, 13, 13, 13, 15, 14, 15, 15, 15, 14, 11, 15, 14, 14, 14, 14, 13, 15, 14, 14, 15, 14, 14, 14, 14,
  15, 13, 13, 15, 14, 13, 13, 14, 14, 15, 14, 14, 14, 14, 14, 14, 13, 14, 10, 15, 13, 13, 15, 15, 14, 12, 14, 14, 15, 14, 15, 12, 14, 15, 14, 14, 14, 14, 15, 10, 15, 13, 14, 14, 14, 14, 14, 15, 9, 14, 13, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 14, 14, 13, 13, 15, 14, 14, 14, 14, 14, 14, 15, 13, 12,
  14, 13, 14, 14, 13, 14, 14, 14, 14, 15, 15, 14, 15, 14, 14, 14, 14, 14, 13, 14, 14, 15, 14, 14, 14, 14, 14, 12, 14, 14, 15, 15, 14, 13, 15, 14, 14, 14, 14, 15, 14, 15, 14, 15, 14, 15, 15, 14, 14, 15, 14, 14, 13, 14, 13, 13, 14, 15, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 12, 14, 13, 14,
  14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 12, 15, 14, 13, 15, 15, 14, 14, 13, 13, 13, 14, 14, 15, 14, 14, 14, 12, 15, 15, 13, 14, 15, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 15, 14, 14, 15, 14, 14, 13, 14, 14, 13, 14, 15, 14, 15, 13, 13, 14, 14, 14, 15, 13,
  14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 13, 14, 15, 14, 14, 14, 13, 14, 14, 13, 14, 13, 14, 15, 14, 15, 14, 14, 14, 14, 13, 15, 14, 14, 14, 14, 14, 12, 14, 14, 15, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 15, 15, 12, 14, 14, 13, 13, 15, 14, 14, 15,
  15, 13, 15, 14, 15, 15, 14, 14, 14, 15, 14, 14, 14, 14, 15, 14, 15, 14, 13, 14, 14, 14, 14, 14, 13, 15, 15, 14, 13, 13, 14, 14, 14, 14, 15, 14, 13, 13, 14, 15, 14, 14, 13, 14, 14, 12, 14, 14, 14, 14, 14, 14, 12, 14, 13, 14, 15, 15, 15, 14, 15, 14, 14, 14, 13, 14, 14, 14, 12, 14, 14, 13, 13, 15,
  14, 15, 15, 15, 15, 13, 15, 15, 14, 13, 15, 14, 14, 14, 14, 13, 14, 15, 12, 12, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 12, 15, 14, 14, 14, 14, 11, 14, 15, 15, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 11, 15, 13, 14, 15, 14, 14, 15, 14, 13,
  14, 14, 13, 14, 14, 13, 13, 15, 15, 15, 12, 14, 15, 14, 12, 15, 13, 14, 15, 14, 15, 15, 14, 13, 15, 14, 11, 13, 14, 14, 14, 14, 15, 15, 14, 13, 14, 14, 14, 14, 13, 14, 14, 11, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 15, 14, 13, 14, 14, 15, 14, 14, 12, 13, 15, 15, 15, 13, 14, 14, 14, 15,
  14, 14, 14, 14, 14, 15, 14, 11, 14, 14, 12, 12, 15, 15, 14, 14, 12, 13, 14, 13, 14, 14, 12, 13, 15, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 13, 13, 14, 15, 14, 14, 15, 15, 14, 14, 14, 14, 14, 13, 14, 14, 13, 15, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14,
  15, 14, 14, 14, 14, 14, 15, 13, 14, 12, 14, 14, 14, 14, 15, 15, 11, 15, 14, 15, 14, 15, 13, 14, 14, 14, 14, 13, 14, 14, 15, 15, 14, 14, 14, 10, 13, 15, 15, 14, 14, 10, 15, 14, 13, 15, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 12, 13, 15, 14, 14, 14, 14, 15, 15, 14, 13, 13, 14, 14, 14, 12, 15,
  12, 14, 13, 15, 14, 14, 14, 13, 14, 12, 15, 15, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 15, 14, 14, 14, 13, 13, 15, 15, 15, 14, 14, 13, 14, 14, 15, 14, 14, 13, 14, 14, 13, 13, 14, 13, 15, 15, 15, 15, 15, 13, 14, 14, 14, 15, 13, 14, 14, 13, 14, 14, 13, 12, 14, 11, 14, 14, 14, 13, 15, 14, 12,
  14, 14, 14, 15, 14, 13, 14, 13, 14, 14, 15, 15, 15, 15, 15, 15, 15, 14, 12, 12, 14, 14, 12, 14, 14, 13, 14, 14, 15, 14, 15, 14, 14, 14, 14, 15, 14, 11, 15, 12, 12, 11, 14, 14, 13, 15, 13, 14, 14, 14, 13, 14, 13, 15, 14, 15, 14, 14, 13, 14, 12, 14, 14, 14, 12, 14, 14, 13, 14, 13, 14, 15, 14, 14,
  14, 15, 14, 14, 15, 15, 14, 15, 14, 15, 14, 14, 13, 14, 14, 14, 15, 14, 13, 14, 15, 14, 14, 10, 13, 14, 15, 14, 14, 14, 14, 14, 13, 14, 13, 14, 13, 13, 14, 12, 15, 14, 14, 14, 14, 14, 13, 14, 13, 15, 13, 14, 13, 14, 13, 14, 14, 13, 14, 14, 15, 14, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 12, 14,
  14, 15, 14, 14, 14, 14, 13, 14, 15, 14, 14, 14, 14, 13, 14, 14, 15, 14, 13, 14, 14, 14, 15, 14, 14, 12, 13, 13, 14, 15, 14, 13, 14, 14, 14, 14, 13, 14, 12, 14, 15, 15, 13, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 13, 15, 13, 15, 15, 15, 12, 14, 14, 14, 14, 14, 15, 13, 14, 14, 14, 13, 14, 14, 14,
  14, 14, 13, 14, 14, 14, 10, 12, 14, 13, 14, 14, 13, 14, 12, 14, 12, 15, 13, 14, 13, 15, 14, 15, 14, 13, 15, 15, 14, 13, 13, 14, 14, 14, 14, 14, 15, 13, 13, 13, 14, 15, 13, 14, 15, 13, 14, 14, 14, 14, 15, 13, 8, 14, 14, 14, 13, 14, 14, 12, 14, 14, 14, 13, 13, 14, 14, 15, 14, 14, 12, 14, 14, 14, 14,
  14, 14, 15, 15, 13, 15, 15, 15, 15, 12, 15, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 15, 14, 14, 14, 15, 15, 14, 14, 14, 12, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 11, 15, 15, 14, 13, 14, 13, 14, 12, 12, 14, 14, 14, 14, 13, 14, 15, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 15, 14, 14,
  14, 14, 12, 14, 14, 14, 13, 14, 14, 15, 14, 15, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 12, 14, 14, 14, 13, 13, 13, 15, 14, 15, 15, 14, 13, 14, 15, 15, 15, 14, 14, 14, 14, 11, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 12, 15, 14,
  14, 14, 14, 14, 14, 14, 13, 14, 14, 15, 15, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 15, 13, 14, 13, 14, 14, 9, 13, 14, 14, 14, 14, 13, 14, 15, 15, 14, 14, 15, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 15, 14, 14, 15, 14, 12, 14, 13, 14, 14, 14, 14, 15, 15, 12, 14, 14, 14, 15, 13, 15, 15, 15, 15,
  14, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 13, 14, 14, 14, 10, 14, 13, 14, 14, 14, 14, 12, 15, 13, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 15, 14, 13, 13, 15, 13, 14, 12, 15, 14, 13, 13, 14, 14, 15, 15, 15, 14, 14, 15, 14, 13, 13, 14, 15, 13, 14, 13,
  14, 15, 13, 14, 14, 14, 14, 14, 14, 12, 14, 13, 14, 14, 14, 14, 14, 12, 14, 15, 12, 14, 14, 13, 14, 14, 14, 14, 12, 14, 13, 15, 14, 14, 15, 14, 15, 14, 13, 13, 13, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 15, 14, 13, 15, 13, 14, 14, 14, 14, 13, 14, 12, 13, 14, 11, 14, 12, 14, 14, 15, 14, 14, 14,
  13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 13, 11, 14, 14, 13, 14, 14, 14, 13, 13, 14, 13, 15, 12, 14, 14, 14, 14, 15, 15, 14, 14, 14, 14, 14, 14, 14, 13, 15, 14, 14, 14, 14, 15, 12, 14, 15, 15, 13, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 13, 14, 13, 15, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14,
  13, 15, 13, 14, 14, 12, 14, 14, 15, 15, 15, 13, 15, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 15, 14, 12, 14, 14, 14, 14, 14, 14, 15, 14, 13, 12, 14, 11, 14, 13, 14, 14, 14, 15, 14, 14, 10, 14, 13, 14, 14, 12, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14,
  15, 14, 15, 12, 14, 14, 14, 14, 12, 13, 14, 14, 14, 14, 9, 14, 13, 14, 15, 14, 14, 14, 14, 14, 15, 15, 14, 15, 12, 14, 15, 15, 15, 14, 15, 14, 14, 14, 14, 14, 13, 14, 13, 14, 15, 14, 14, 14, 14, 14, 14, 15, 14, 12, 15, 14, 14, 14, 14, 13, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 11, 14, 8,
  14, 14, 14, 15, 14, 13, 15, 15, 14, 14, 14, 12, 12, 14, 14, 15, 14, 13, 14, 14, 13, 13, 14, 13, 12, 14, 14, 13, 13, 15, 13, 13, 14, 13, 14, 14, 10, 14, 14, 14, 12, 14, 15, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 15, 15, 13, 14, 14, 14, 13, 14, 14, 12, 14, 13, 14, 11, 15, 14,
  12, 14, 14, 14, 14, 10, 14, 14, 14, 14, 13, 14, 14, 14, 14, 12, 14, 14, 15, 14, 14, 13, 15, 15, 15, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 11, 14, 14, 15, 14, 12, 14, 13, 14, 14, 15, 14, 13, 14, 14, 15, 14, 14, 14, 15, 14, 14, 15, 14, 15, 14, 14, 14, 11, 14, 14, 15, 14, 14, 13,
  14, 14, 13, 14, 14, 13, 14, 13, 14, 14, 14, 14, 15, 14, 15, 12, 12, 14, 14, 14, 15, 15, 14, 13, 14, 13, 12, 14, 12, 13, 14, 15, 14, 14, 14, 14, 14, 14, 13, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 13, 14, 15, 14, 15, 14, 15, 14,
  14, 14, 14, 13, 15, 12, 14, 14, 13, 13, 14, 14, 14, 15, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 12, 14, 13, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 15, 13, 15, 15, 14, 13, 14, 13, 11, 13, 14, 14, 15, 14, 14, 13, 14, 14, 13, 14, 15, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14,
  13, 14, 14, 14, 13, 14, 15, 13, 14, 14, 14, 15, 14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 12, 14, 14, 13, 13, 14, 14, 14, 14, 14, 15, 14, 11, 14, 15, 14, 14, 14, 14, 14, 14, 15, 13, 15, 15, 14, 12, 13, 14, 14, 14, 14, 14, 11, 14, 14, 13, 14, 13, 13, 14, 14, 13, 14, 14, 13, 14, 14, 13, 13, 14, 14,
  14, 14, 14, 14, 12, 15, 14, 13, 13, 14, 14, 15, 14, 13, 13, 14, 14, 14, 12, 14, 15, 14, 13, 15, 14, 12, 15, 13, 14, 14, 14, 14, 15, 14, 15, 14, 14, 14, 13, 14, 14, 11, 14, 14, 14, 15, 14, 14, 14, 13, 14, 14, 14, 14, 14, 15, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14,
  13, 14, 14, 12, 14, 15, 13, 14, 14, 15, 14, 14, 14, 15, 11, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 15, 14, 14, 13, 15, 14, 13, 13, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 13, 14, 15, 14, 14, 15, 15, 15, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 12,
  14, 14, 13, 14, 14, 14, 14, 14, 15, 14, 14, 13, 14, 13, 14, 14, 14, 15, 14, 10, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 13, 15, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 12, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 11, 12, 14, 15, 15, 15, 14, 15, 14, 13,
  14, 15, 14, 14, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 10, 14, 14, 14, 14, 14, 14, 13, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 14, 15, 15, 14, 14, 14, 14, 14, 14, 14, 10, 15, 14, 12, 13, 14, 14, 13, 15, 13, 14, 13, 13, 13, 13, 13, 14, 14, 14, 14, 13, 13, 14, 14, 13, 14, 14, 13,
  15, 12, 14, 14, 15, 11, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 13, 14, 13, 14, 14, 14, 13, 14, 13, 13, 14, 14, 14, 14, 13, 14, 14, 14, 11, 14, 14, 13, 14, 14, 12, 13, 13, 15, 14, 14, 13, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 13, 14, 12, 14, 11, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14,
  14, 14, 14, 14, 14, 15, 14, 15, 14, 14, 14, 13, 14, 14, 14, 12, 14, 13, 14, 14, 13, 15, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 12, 14, 13, 14, 12, 14, 14, 14, 11, 14, 14, 12, 14, 13, 14, 14, 14, 13, 14, 14, 11, 14, 14, 15, 15, 14, 14, 14, 15, 13, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14,
  14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 15, 13, 14, 13, 14, 14, 13, 14, 14, 13, 14, 15, 14, 13, 13, 15, 15, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 12, 14, 14, 15, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 13, 15, 14,
  14, 14, 14, 11, 14, 14, 15, 13, 15, 14, 14, 13, 15, 14, 12, 14, 12, 14, 14, 13, 13, 14, 13, 14, 14, 15, 12, 13, 14, 14, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 12, 14, 14, 14, 14, 14, 14, 13, 13, 15, 14, 13, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14,
  14, 14, 14, 15, 14, 13, 14, 12, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 15, 13, 14, 13, 14, 13, 14, 14, 14, 14, 15, 13, 10, 13, 13, 14, 12, 14, 14, 14, 14, 14, 15, 15, 14, 13, 14, 11, 14, 14, 14, 12, 14, 14, 12, 14, 14, 14, 15, 14, 13, 14, 14, 14, 15, 14, 12, 14, 12, 13, 13, 14, 14, 14, 14,
  13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 15, 14, 14, 13, 14, 14, 14, 12, 14, 14, 12, 14, 14, 15, 13, 15, 13, 15, 13, 14, 14, 14, 14, 14, 14, 13, 15, 14, 14, 14, 14, 14, 13, 14, 14, 11, 12, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14,
  14, 13, 14, 13, 14, 14, 10, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 15, 13, 14, 14, 14, 14, 14, 14, 14, 15, 13, 14, 13, 14, 14, 14, 15, 15, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 10, 14, 14, 14, 14, 14, 14, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 15, 14, 14, 14, 14, 14, 12, 14, 14, 13, 14, 13, 14, 13, 14, 14, 13, 14, 14, 13, 15, 13, 14, 14, 14, 14, 14, 13, 14, 15, 14, 14, 14, 14, 14, 14, 10, 14, 14, 14, 12, 14, 13, 14, 14, 14, 14, 12, 14, 14, 14, 15, 15, 13, 15, 15, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 11, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 15, 14, 14, 12, 14, 15, 14, 12, 14, 15, 14, 13, 13, 14, 14, 13, 11, 14, 13, 13, 14, 14, 12, 14, 13, 14, 15, 14, 14, 14, 13, 13, 14, 14, 12, 13, 14, 14, 14, 13, 15, 14, 12,
  14, 14, 14, 13, 13, 13, 15, 15, 12, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 11, 14, 12, 14, 14, 14, 14, 14, 14, 12, 14, 13, 14, 13, 13, 14, 14, 14, 11, 13, 14, 13, 14, 15, 14, 14, 14, 14, 12, 12, 14, 14, 14, 14, 13, 13, 14, 13, 14, 12, 14, 13, 14, 14, 12, 13, 14, 14, 14, 15, 12, 15, 14, 14, 14,
  14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 14, 14, 13, 14, 12, 13, 14, 14, 14, 11, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 12, 14, 14, 14, 14, 14, 13, 14, 13, 12, 14,
  14, 15, 14, 14, 14, 15, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 12, 14, 13, 14, 14, 12, 13, 14, 14, 12, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 11, 13, 15, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 15, 14, 14, 12, 14, 14, 14,
  14, 14, 14, 14, 14, 13, 14, 13, 14, 12, 15, 13, 14, 13, 12, 14, 13, 14, 15, 14, 14, 14, 14, 14, 14, 11, 13, 14, 14, 14, 14, 13, 14, 14, 15, 15, 12, 14, 14, 14, 13, 14, 14, 13, 12, 15, 14, 13, 14, 15, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 15, 14, 13, 13, 14, 14, 13, 14, 14, 15,
  14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 15, 13, 14, 14, 13, 15, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 15, 14, 14, 13, 14, 12, 14, 13, 14, 14, 14, 14, 15, 14, 13, 14, 14, 12, 14, 14, 15, 14, 13, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 13, 14, 13, 14, 12,
  13, 12, 13, 15, 14, 13, 13, 14, 14, 13, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 13, 14, 14, 13, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 13, 14, 12, 14, 14, 15, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 15, 13, 13, 14, 14, 13, 14, 13, 14, 13, 14,
  14, 12, 14, 11, 14, 14, 14, 14, 14, 8, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 13, 14, 14, 13, 14, 15, 15, 14, 14, 14, 15, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14,
  14, 14, 14, 13, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 11, 15, 14, 14, 11, 14, 12, 14, 13, 14, 13, 14, 14, 13, 14, 14, 14, 15, 14, 14, 15, 14, 14, 14, 15, 15, 14, 13, 15, 14, 14, 14, 14, 14, 14, 13, 14, 15, 12, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 12, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 13, 14, 13, 13, 14, 14, 13, 15, 14, 15, 13, 14, 13, 14, 14, 13, 14, 14, 14, 14, 11, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14,
  14, 14, 12, 13, 14, 14, 12, 14, 14, 12, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 13, 14, 10, 12, 14, 14, 14, 13, 15, 14, 13, 15, 14, 14, 14, 12, 14, 14, 13, 14, 13, 11, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14,
  14, 14, 15, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 13, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 13, 14, 15, 14, 14, 11, 13, 15, 14, 14, 14, 15, 13, 14, 14, 14, 14, 14, 14, 14, 14, 11, 14, 14, 13, 14, 14, 14, 11, 15, 15, 14, 14, 11, 14, 13, 14, 13, 13, 13, 13, 14, 14, 13, 15, 14, 14, 14,
  14, 12, 14, 14, 14, 14, 12, 14, 14, 13, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 13, 14, 15, 14, 14, 13, 13, 14, 15, 14, 14, 14, 14, 14, 14, 13, 14, 15, 14, 14, 12, 14, 14, 12, 15, 14, 12, 15, 13, 14, 14, 12, 14, 14, 13, 14, 13, 14, 14, 14, 15, 14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 14, 14,
  14, 14, 14, 14, 12, 13, 13, 13, 14, 14, 14, 14, 15, 12, 15, 10, 14, 12, 14, 14, 13, 14, 14, 14, 13, 12, 14, 15, 14, 13, 14, 14, 14, 14, 14, 12, 14, 13, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14, 14, 12, 15, 14, 13, 14, 14, 13, 14, 14, 13, 15, 14, 14, 14, 14, 15, 14, 14,
  13, 14, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 12, 14, 10, 14, 14, 14, 14, 14, 14, 12, 14, 11, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 13, 13, 10, 14, 14, 11, 14, 14, 14, 13, 13, 14, 14, 14, 13, 15, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 13, 15, 14, 14, 14,
  14, 15, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 12, 13, 14, 14, 14, 15, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 13, 15, 14, 14, 14, 14, 14, 14, 10, 14,
  14, 14, 13, 14, 14, 14, 14, 14, 15, 12, 11, 14, 14, 14, 15, 14, 14, 12, 14, 13, 14, 14, 14, 13, 13, 14, 14, 13, 13, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 12, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 12, 14, 14,
  12, 14, 14, 13, 14, 14, 14, 13, 14, 12, 14, 13, 14, 15, 15, 14, 14, 14, 12, 14, 14, 14, 13, 14, 14, 14, 12, 13, 13, 13, 13, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 13, 13, 10, 14, 12, 14, 13, 14, 13, 14, 13, 13, 14, 14, 14, 14, 9, 14, 13, 14, 14, 13, 13, 14, 13,
  14, 14, 14, 14, 13, 12, 14, 14, 14, 14, 12, 11, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 13, 13, 14, 14, 14, 14, 14, 12, 12, 13, 14, 13, 14, 13, 14, 14, 14, 15, 15, 12, 14, 14, 13, 13, 14, 14, 14, 14, 12, 14, 14, 13, 15, 15, 14, 15, 14, 13, 14, 14, 14, 14, 13, 14,
  14, 15, 13, 15, 14, 15, 13, 12, 14, 14, 13, 13, 13, 14, 14, 14, 14, 14, 14, 12, 14, 13, 15, 14, 14, 13, 14, 14, 15, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 13, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 11,
  14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 13, 15, 15, 13, 14, 14, 14, 13, 14, 14, 13, 14, 13, 15, 15, 14, 13, 14, 14, 15, 14, 14, 13, 14, 14, 14, 14, 12, 14, 15, 14, 13, 14, 14, 14, 15, 14, 12, 14, 12, 13, 14, 14, 13, 14, 14, 13, 13, 14, 14, 13, 14, 14, 15, 14, 13, 14, 14, 12, 14, 14,
  14, 15, 12, 14, 14, 13, 12, 14, 14, 11, 14, 14, 12, 14, 14, 14, 14, 14, 12, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 11, 13, 14, 14, 14, 13, 14, 12, 14, 12, 13, 14, 14, 14, 13, 13, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 13, 14, 14, 15, 14, 14, 14, 15, 12, 13, 14, 14, 12,
  14, 14, 14, 14, 14, 14, 14, 14, 14, 11, 14, 14, 14, 14, 14, 14, 13, 14, 15, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 12, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 9, 14, 14, 15, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13,
  14, 13, 13, 14, 13, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 11, 13, 14, 14, 14, 14, 13, 14,
  13, 12, 14, 14, 14, 14, 14, 12, 14, 12, 13, 14, 14, 14, 15, 14, 14, 11, 14, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 12, 14, 10, 14, 14, 12, 15, 14, 13, 12, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14,
  12, 14, 14, 13, 14, 12, 15, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 12, 14, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 15, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 13, 13, 14, 13, 14, 15, 14, 15, 14, 13, 14, 13, 14, 14, 11, 15, 13, 12, 14, 14, 13, 14, 12, 14,
  14, 14, 13, 14, 11, 13, 14, 14, 14, 14, 12, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 12, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 13, 14, 13, 14, 13, 13, 12, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 13, 14, 13, 14, 14, 14,
  14, 14, 11, 13, 14, 14, 13, 14, 14, 13, 14, 13, 14, 14, 14, 14, 13, 14, 14, 12, 13, 14, 14, 14, 13, 13, 13, 14, 12, 12, 14, 14, 13, 14, 14, 14, 13, 10, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 15, 14, 14, 14, 14, 13, 14, 14, 14, 9, 13, 14, 14, 14, 14, 13, 13, 14, 14, 15, 15, 14, 12, 14, 14, 14,
  14, 15, 14, 15, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 13, 14, 14, 13, 12, 14, 14, 12, 14, 14, 14, 12, 14, 14, 12, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 15, 14, 14, 14, 13, 14, 14, 14, 14, 15, 13, 10, 14,
  14, 13, 13, 14, 14, 14, 15, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 12, 14, 12, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 11, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 12, 14, 14, 15, 14, 12, 14, 14, 14, 14,
  14, 14, 14, 13, 13, 14, 14, 11, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 12, 14, 14, 13, 14, 14, 12, 14, 12, 14, 14, 14, 13, 13, 14, 13, 14, 13, 14, 10, 14, 13, 13, 14, 13, 14, 13, 14, 12, 13, 14, 13, 14, 14, 14, 12, 15, 13, 14, 14, 13, 13, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14,
  14, 13, 14, 14, 14, 14, 14, 12, 13, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 13, 14, 14, 14, 14, 10, 14, 14, 14, 14, 13, 14, 12, 12, 14, 13, 14, 14, 13, 14, 13, 12, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 15, 13, 14, 15, 13, 13,
  14, 14, 14, 14, 14, 13, 14, 14, 13, 13, 13, 13, 13, 14, 14, 15, 14, 14, 13, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 13, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 15, 13, 13, 14, 14,
  14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 13, 14, 14, 11, 12, 14, 14, 14, 14, 13, 14, 13, 14, 13, 13, 15, 12, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 11, 12, 14, 14, 14, 13, 14, 14, 14, 13, 14,
  14, 14, 14, 13, 13, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 10, 14, 14, 14, 14, 12, 12, 14, 14, 14, 13, 14, 12, 13, 14, 14, 14, 14, 14, 13, 14, 13, 14, 13, 15, 15, 14, 13, 14, 14, 11, 14, 14, 14, 13, 13, 12, 14, 12, 13, 14, 14, 15, 14, 14, 14, 15, 13, 14,
  14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 10, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 13, 14, 12, 13, 14, 14, 14, 14, 13, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 13, 14, 14, 12, 14, 15, 14, 14, 14, 14, 14, 15,
  14, 14, 14, 12, 14, 12, 14, 12, 14, 15, 14, 14, 14, 12, 13, 14, 13, 10, 14, 14, 12, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 15, 15, 15, 14, 15, 9, 14, 14, 14, 14, 14, 14, 14, 15, 13, 12, 14, 14, 12, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14,
  14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 14, 12, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 12, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 11, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 13, 12, 12, 15, 12, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 13, 14, 14, 14, 14, 14, 13, 14, 13, 14, 12, 13, 14, 13, 14, 14, 14, 14, 14, 14, 13, 15, 15, 14, 13, 14, 13, 13, 13, 14, 13, 14, 12, 14, 13, 14, 14, 14, 14, 13, 14, 15, 13, 13,
  14, 13, 15, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 13, 12, 14, 13, 14, 13, 14, 14, 12, 14, 13, 14, 14, 14, 15, 14, 11, 10, 13, 14, 11, 11, 14, 14, 14, 14, 13, 15, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 13, 8, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14,
  12, 14, 14, 13, 14, 14, 14, 11, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 15, 14, 14, 13, 14, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 10, 14, 11, 14, 12, 13, 14, 13, 14, 14, 15, 14, 15, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14,
  13, 14, 14, 13, 14, 13, 12, 14, 14, 13, 14, 14, 14, 14, 15, 14, 14, 13, 14, 13, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 12, 13, 13, 13, 14, 14, 14, 14, 14, 14, 13, 14, 11, 12, 14, 14, 14, 14, 11, 14, 13, 14, 13, 14, 12,
  14, 14, 14, 13, 13, 13, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 11, 14, 14, 14, 12, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 11, 13, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 13, 12, 14, 14, 13, 13, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14,
  14, 14, 11, 14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 13, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 9, 14, 12, 14, 12, 14, 12, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 13,
  14, 14, 14, 14, 12, 14, 14, 14, 14, 12, 14, 13, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 14, 15, 12, 14, 14, 13, 13, 14, 14, 12, 15, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 13, 12, 14, 14, 14, 14, 13, 14, 13, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14,
  14, 14, 14, 13, 12, 14, 14, 12, 14, 14, 13, 14, 12, 14, 14, 14, 14, 14, 11, 14, 14, 14, 11, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 15, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,
  14, 14, 13, 14, 13, 14, 15, 14, 12, 13, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 13, 13, 11, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 12, 15, 13, 14, 14, 14, 15, 14, 13, 14, 14, 14, 11, 14, 12, 14, 13, 14, 14, 13, 14, 12, 14, 14, 14, 14, 14, 14, 13, 14, 14, 15,
  14, 13, 14, 13, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 13, 14, 13, 13, 13, 13, 13, 14, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 12, 14, 14, 12, 14, 14, 14, 13, 14, 12, 10, 14, 11, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 13,
  12, 13, 15, 13, 14, 15, 14, 14, 14, 12, 13, 13, 12, 14, 14, 12, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 12, 14, 14, 13, 14, 13, 13, 13, 13, 13, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 11, 14, 14, 14, 14, 14, 14, 14, 14, 14,
  14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 13, 13, 14, 12, 14, 13, 12, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 12, 14, 10, 13, 14, 12, 14, 11, 14, 13, 13, 12, 13,
  13, 12, 14, 13, 13, 13, 12, 13, 13, 14, 14, 14, 13, 14, 13, 13, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 15, 14, 13, 10, 14, 12, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 12, 13, 13, 14, 13, 13, 14, 13, 14, 14, 12, 14, 13, 14, 13, 14, 13, 14, 14, 14, 14, 13, 14,
  13, 13, 13, 13, 13, 14, 14, 13, 14, 14, 14, 14, 13, 12, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14, 13, 13, 14, 14, 14, 13, 13, 11, 14, 13, 13, 14, 14, 14, 14, 13, 14, 12, 13, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 12, 14, 13, 14, 12, 14, 13, 13, 14, 13, 14, 14, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 14, 14, 12, 14, 11, 13, 14, 13, 14, 13, 14, 12, 13, 14, 14, 14, 14, 12, 12, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14, 14, 10, 14, 14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14,
  14, 14, 12, 14, 13, 14, 13, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 15, 15, 14, 14, 14, 12, 14, 14, 12, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 14, 13, 14, 14, 14, 13, 11, 13, 13, 13, 14, 14, 14, 13, 13, 14, 13, 12, 15, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14,
  14, 13, 14, 14, 13, 14, 14, 14, 13, 13, 14, 12, 14, 13, 13, 14, 14, 11, 12, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 15, 13, 13, 13, 14, 14, 14, 14, 12, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 10, 13, 14, 14, 12, 14, 14, 14, 12, 14, 14, 14, 12, 14, 13, 14, 12, 12, 13, 15, 14, 12, 14,
  14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 10, 13, 12, 13, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 11, 14, 14, 13, 14, 13, 14, 14, 12, 15, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 12, 14, 14, 13, 14,
  13, 14, 14, 13, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 12, 14, 13, 13, 14, 13, 15, 13, 14, 14, 14, 14, 14, 11, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 13, 14, 12, 14, 14, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 14, 14, 12, 14, 14, 14, 14, 13,
  13, 13, 13, 15, 14, 14, 13, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 13, 14, 14, 13, 12, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 12, 13, 14, 14, 14, 13, 14, 14, 13, 13, 13, 13, 14, 13, 14, 13, 13, 14, 14, 14, 14, 13, 14, 14, 13, 13, 14, 15, 13, 13, 14, 13, 14,
  13, 14, 12, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 9, 13, 14, 12, 15, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 12, 14, 14, 14, 12, 13, 10, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 12, 14, 14, 14, 11, 14, 14, 14, 14, 14, 11, 14,
  14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 13, 12, 13, 12, 14, 13, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 12, 14, 13, 13, 13, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 13, 14, 14, 14, 11, 14, 13, 12, 13, 14, 14, 14, 14, 13, 12, 14, 14,
  12, 14, 13, 13, 12, 13, 14, 13, 13, 14, 15, 14, 14, 12, 14, 12, 14, 14, 13, 14, 9, 13, 14, 13, 13, 15, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 13, 14, 14, 13, 14, 14, 13, 14, 12, 14, 13, 14, 14, 12, 14, 14, 14, 14, 14, 15, 13, 14, 14, 13, 13, 14, 14, 13, 14, 14, 14, 13, 14, 12, 13,
  14, 11, 14, 14, 14, 13, 14, 15, 14, 14, 14, 14, 10, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 12, 14, 14, 14, 12, 14, 13, 14, 13, 14, 14, 14, 14, 11, 13, 13, 12, 14, 12, 13, 14, 13, 11, 14, 15, 14, 12, 14, 12, 14, 14, 13, 14, 14, 14, 11, 14, 13, 13, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 15,
  14, 14, 14, 14, 14, 14, 10, 14, 14, 14, 14, 12, 14, 14, 14, 13, 14, 15, 13, 12, 13, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 13, 14, 14, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 9, 13, 13, 13, 13, 13, 13, 12, 13, 13, 13, 13, 14, 12, 13, 13, 13, 12, 13, 12, 13, 14, 14, 15,
  14, 13, 14, 14, 14, 14, 14, 14, 12, 11, 13, 12, 14, 13, 13, 14, 13, 13, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 12, 14, 13, 14, 14, 14, 13, 13, 14, 14, 13, 14, 14, 13, 14, 15, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 11, 14, 14, 14, 15, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14,
  14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 10, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 9, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 15, 14, 14,
  13, 14, 14, 14, 14, 14, 13, 14, 14, 13, 13, 14, 13, 14, 14, 14, 12, 13, 13, 13, 13, 12, 13, 13, 12, 13, 13, 10, 13, 13, 13, 12, 14, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 12, 14, 12, 14, 14, 14, 14, 15, 12, 14, 13, 14, 12, 13, 14, 13, 14, 14, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 11, 14, 14, 13, 14, 14, 11, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 13, 14, 12, 13, 14, 13, 12, 12, 14, 13, 14, 14, 14, 12, 14, 13, 14, 14, 12, 14, 14, 14, 12, 14, 13, 14, 14, 12, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 13,
  14, 13, 12, 13, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 15, 10, 14, 12, 14, 14, 14, 14, 13, 14, 13, 13, 14, 14, 13, 14, 13, 12, 14, 14, 12, 14, 14, 9, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 11, 13, 10, 12, 13, 13, 12, 12, 14, 12, 13, 12, 10, 13, 10, 13, 13,
  13, 13, 13, 13, 13, 11, 13, 13, 13, 13, 13, 13, 13, 10, 13, 13, 8, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 12, 13, 13, 13, 13, 11, 13, 13, 13, 12, 13, 13, 14, 13, 12, 13, 14, 14, 12, 13, 14, 14, 14, 14, 14, 11, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 13, 14, 10, 14, 14, 14, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 11, 13, 13, 14, 14, 14, 14, 14, 14, 13, 12, 14, 14, 14, 13, 14, 14, 14, 14, 14, 12, 14, 14, 13, 14, 13, 14, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14,
  14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 14, 12, 14, 14, 12, 14, 13, 14, 10, 14, 12, 14, 14, 12, 13, 14, 14, 13, 14, 10, 14, 12, 13, 13, 14, 14, 12, 13, 13, 13, 12, 13, 12, 13, 13, 13, 12, 13, 13, 13, 13, 13, 13, 12, 12, 13, 13, 10, 12, 12, 12, 12, 13, 12, 14, 13, 13, 13, 12, 13, 13, 11,
  13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 12, 13, 13, 13, 8, 13, 13, 13, 13, 13, 12, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13,
  14, 14, 14, 14, 14, 12, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 14, 13, 14, 14, 14, 13, 14, 13, 13, 12, 14, 13, 13, 14, 14, 14, 14, 12, 14, 13, 12, 14, 14, 14, 12, 14, 13, 13, 14, 14, 13, 14, 13, 14, 14, 13, 14, 13, 14, 13, 14, 13, 14, 12, 14, 14, 14, 13, 13,
  14, 14, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 11, 13, 13, 10, 13, 13, 13, 11, 10, 13, 13, 13, 10, 13, 12, 13, 13, 13, 12, 13, 14, 13, 13, 13, 13, 13, 11, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 11, 13, 13, 13, 12, 13, 11, 13, 10, 14, 13, 13, 13, 13, 12, 13, 13,
  11, 12, 13, 13, 12, 14, 14, 14, 13, 14, 14, 12, 14, 13, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 12, 14, 13, 14, 14, 12, 14, 14, 14, 14, 12, 13, 13, 13, 14, 14, 14, 14, 14, 13, 13, 14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 13, 15, 14, 14, 14, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 9, 14, 14, 14, 14, 13, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 10, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 13, 14, 14, 14, 12, 10, 14, 14, 14, 14,
  13, 14, 14, 14, 12, 14, 12, 14, 13, 13, 13, 13, 13, 13, 13, 14, 13, 13, 13, 12, 13, 13, 13, 13, 13, 12, 13, 13, 13, 13, 11, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 12, 13, 13, 13, 10, 12, 13, 14, 14, 13, 13, 14, 13, 12, 13, 13, 13, 12, 13, 13, 12, 13, 13, 14, 14, 14, 14, 14, 13, 14, 14,
  11, 14, 14, 14, 14, 14, 11, 14, 14, 14, 13, 14, 13, 14, 14, 13, 13, 14, 14, 14, 14, 14, 13, 12, 13, 14, 14, 12, 13, 13, 14, 12, 14, 14, 14, 14, 14, 11, 13, 14, 14, 14, 11, 14, 14, 13, 13, 14, 14, 14, 13, 13, 14, 10, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 13, 13, 14, 11, 14, 14, 14, 14, 13, 14,
  14, 14, 13, 14, 14, 13, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 14, 13, 13, 13, 10, 12, 13, 13, 13, 14, 12, 13, 9, 13, 13, 13, 12, 13, 13, 13, 12, 13, 13, 12, 14, 12, 12, 11, 12, 13, 13, 12, 13, 14, 13, 12, 13, 14, 14, 12, 13, 13, 13,
  12, 14, 13, 13, 14, 12, 13, 13, 13, 13, 12, 13, 14, 14, 14, 14, 15, 14, 14, 14, 14, 12, 14, 14, 12, 14, 14, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14, 12, 14, 14, 10, 14, 14, 14, 13, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 12, 14, 13, 13, 13, 14, 14, 14, 14, 13,
  14, 14, 14, 14, 15, 14, 12, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 11, 14, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 13, 12, 13, 13, 13, 12, 13, 14, 14, 14, 12, 14, 13, 13, 13, 13, 13, 11, 13, 14, 13, 13, 13, 13, 13, 13, 13, 13, 13, 14, 13, 13, 14, 14, 13, 13, 13, 12, 13, 13,
  12, 14, 14, 13, 11, 13, 13, 14, 12, 14, 14, 14, 14, 13, 14, 12, 13, 14, 14, 14, 14, 15, 14, 14, 13, 15, 11, 14, 14, 13, 14, 13, 14, 13, 14, 14, 14, 14, 14, 13, 13, 14, 14, 13, 14, 14, 12, 13, 14, 13, 13, 14, 12, 13, 14, 14, 14, 14, 14, 14, 14, 10, 13, 13, 14, 14, 14, 14, 12, 14, 13, 14, 14, 14,
  14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 12, 14, 13, 14, 13, 14, 14, 14, 14, 12, 14, 13, 11, 11, 14, 12, 14, 13, 14, 11, 14, 13, 14, 13, 13, 13, 13, 13, 10, 14, 14, 13, 14, 13, 13, 13, 14, 13, 14, 13, 13, 11, 13, 13, 13, 13, 14, 13, 13, 13, 12, 13, 13, 12, 13, 14, 14, 12, 14, 13, 14, 14,
  14, 12, 14, 13, 13, 14, 14, 15, 14, 12, 14, 14, 14, 14, 14, 14, 12, 14, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 12, 14, 14, 14, 14, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 12, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 11, 14,
  14, 13, 14, 14, 14, 14, 14, 14, 12, 14, 13, 14, 14, 13, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 13, 12, 14, 14, 14, 13, 14, 13, 14, 13, 12, 12, 14, 14, 13, 14, 13, 12, 12, 13, 12, 13, 13, 13, 14, 13, 13, 12, 13, 14, 14, 10, 14, 13, 13, 13, 14, 12, 14, 13, 13, 13, 13, 12, 14, 12, 14, 14,
  12, 14, 13, 13, 14, 13, 14, 12, 13, 14, 13, 13, 13, 14, 14, 12, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 11, 14, 13, 14, 14, 14, 14, 14, 14, 12, 14, 13, 14, 14, 14, 14, 14, 14, 12, 14, 12, 14, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 11, 14, 11, 14, 14, 14, 12, 14, 14, 14, 13, 14, 14,
  14, 14, 14, 14, 12, 13, 13, 14, 14, 14, 12, 14, 14, 14, 14, 14, 13, 12, 13, 14, 14, 13, 13, 13, 13, 12, 13, 14, 13, 14, 14, 14, 13, 13, 13, 14, 13, 12, 10, 14, 14, 14, 13, 12, 14, 14, 14, 14, 13, 13, 12, 11, 11, 14, 14, 14, 14, 12, 14, 13, 13, 14, 13, 14, 14, 14, 14, 13, 14, 14, 12, 13, 14, 14,
  13, 14, 14, 14, 12, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 13, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 14, 14, 12, 13, 14, 14, 13, 12, 12, 14, 13, 13, 13, 14, 13, 14, 14, 13, 13, 13, 13, 14, 14, 14, 14, 13, 14, 14, 13, 12, 14,
  13, 14, 14, 13, 12, 14, 14, 13, 13, 14, 13, 14, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 9, 13, 14, 13, 14, 14, 14, 13, 14, 12, 14, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 14, 12, 14, 14, 14, 14, 13, 14, 12, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14,
  14, 12, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 12, 14, 14, 14, 13, 14, 13, 12, 13, 13, 12, 14, 14, 13, 13, 14, 13, 12, 13, 11, 14, 12, 14, 13, 14, 12, 14, 14, 13, 14, 14, 12, 14, 14, 14, 14, 14, 12, 13, 13, 15, 14, 14, 14, 13, 14, 14, 12, 14, 13, 13, 14, 14,
  12, 13, 14, 13, 14, 14, 13, 14, 14, 14, 13, 12, 13, 14, 13, 14, 14, 13, 14, 12, 14, 13, 13, 14, 14, 14, 14, 14, 8, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 12, 14, 12, 14, 13, 13, 14, 14, 13, 11,
  14, 13, 14, 12, 13, 14, 13, 14, 14, 14, 14, 14, 13, 14, 13, 12, 13, 14, 14, 14, 14, 15, 13, 14, 10, 14, 14, 14, 14, 13, 13, 14, 14, 14, 12, 14, 14, 13, 14, 14, 14, 14, 13, 14, 11, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 11, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,
  12, 13, 14, 14, 13, 14, 14, 10, 14, 14, 14, 14, 11, 14, 13, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 12, 14, 13, 14, 14, 13, 13, 13, 14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 13, 14, 13, 14, 14, 13, 12, 14, 14, 14, 13, 14, 12, 14, 12, 14, 14, 14, 13, 14, 13, 14, 14, 14,
  14, 13, 10, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 13, 14, 11, 12, 13, 14, 14, 14, 8, 14, 14, 14, 10, 14, 14, 14, 13, 14, 14, 13, 12, 14, 14, 14, 13, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 13, 14, 12, 14, 14, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 12, 14,
  14, 12, 14, 14, 14, 14, 14, 13, 13, 14, 14, 14, 14, 11, 14, 14, 14, 14, 14, 14, 11, 13, 13, 14, 14, 14, 14, 9, 14, 13, 14, 12, 13, 12, 14, 14, 14, 13, 13, 13, 14, 14, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14, 13, 12, 14, 14, 14, 14, 13, 14, 14, 14, 14, 12, 14, 13, 13, 14, 14, 14, 14, 14, 13, 14, 14,
  13, 14, 14, 14, 14, 12, 14, 14, 13, 14, 13, 14, 14, 13, 13, 14, 13, 13, 14, 14, 14, 12, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 12, 14, 12, 14, 12, 14, 14, 12, 13, 11, 13, 13, 13, 14, 14, 12, 14, 14, 12, 13, 14, 13, 14, 14, 12, 14, 15, 11, 13, 14, 14, 14, 14, 13, 14, 14, 14, 14,
  14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 12, 10, 14, 14, 14, 13, 13, 14, 14, 11, 14, 14, 14, 13, 14, 13, 14, 14, 13, 14, 14, 14, 14, 15, 14, 14, 12, 13, 14, 14, 14, 11, 14, 14, 14, 14, 14, 13, 14, 13, 13, 14, 13, 14, 14, 13, 14, 13, 12, 14, 14, 14, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,
  14, 14, 14, 13, 13, 14, 14, 13, 14, 13, 13, 13, 14, 14, 14, 13, 14, 14, 11, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 13, 14, 13, 14, 14, 14, 13, 14, 14, 12, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 12, 13, 14, 14, 14, 14, 12, 14, 13, 14, 13, 14, 14, 14, 13, 13, 14, 14,
  14, 14, 14, 14, 12, 14, 14, 13, 13, 14, 14, 12, 14, 12, 14, 14, 14, 13, 14, 14, 14, 14, 14, 12, 14, 14, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 14, 13, 14, 14, 14, 14, 13, 14, 11, 14, 13, 12, 14, 14, 14, 14, 12, 13, 13, 14, 14, 11, 14, 13, 14, 14, 14, 14, 14, 13, 14, 14, 13, 14,
  14, 14, 12, 14, 14, 14, 14, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 12, 13, 13, 10, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14
];

let PointWeightArr = [];
