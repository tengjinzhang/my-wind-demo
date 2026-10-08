let ShortMap = ['X', 'Y', 'H', 'Zb', 'Zs', 'U', 'V', 'ID', 'RiskLevel', 'NewX', 'NewY', 'LL'];
let loadInfo = null;
let bufferArray = [];

self.onmessage = function (evt) {
  loadInfo = evt.data.loadInfo;

  switch (evt.data.msg) {
    case 'load':
      loadData();
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
        let d = null;

        if (loadInfo.headerArrayBuffer) {
          d = e.response;
        }

        if (d) {
          switch (loadInfo.parsType) {
            case 0:
              // 预警数据解析 --- 对象属性带ID
              d = parsData0(d);
              break;

            default:
              // d = parsData0(d);
              break;
          }
          d.loadInfo = loadInfo;
          d.msg = 'success';
          self.postMessage(d, bufferArray);
          if (d.loadInfo) {
            disposeObject(d.loadInfo);
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

    e.open('GET', loadInfo.dataUrl, false);

    // 通过后端携带Token请求
    if (loadInfo.Authorization) {
      e.setRequestHeader('Content-type', 'application/json');
      e.setRequestHeader('Authorization', 'Basic YWRtaW46YzYxZDRmYzMtM2RhMS00ZTQ5LWIzYWYtNDgxYzZmMzFiNzI3');
    }
    e.send(null);
  } catch (e) {
    self.postMessage({ loadInfo: loadInfo, msg: 'error' });
  }
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

function clear() {
  if (loadInfo) {
    disposeObject(loadInfo);
    loadInfo = null;
  }
  bufferArray.length = 0;
}

function parsData0(arrayBuffer) {
  let resObj = {};
  if (arrayBuffer) {
    let data = parsObjectPropertiesAndId(arrayBuffer);

    resObj = {
      data: {
        frameName: loadInfo.key.split('_')[0],
        data
      }
    };
  }

  return resObj;
}

// 对象属性数据-带ID 2024年8月23日12:34:22
function parsObjectPropertiesAndId(content) {
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

  let arr = [];

  if (orderType == 0) {
    for (let i = 0; i < count; i++) {
      let resultObj = {};
      sIdx = eIdx;
      eIdx = sIdx + 4; //读取数据总数，读一个int
      let id = readInt32Array(content, sIdx, eIdx)[0]; //得到数据id
      resultObj['ID'] = id;

      for (let j = 0; j < aCount; j++) {
        let res = null;
        let key = ShortMap[typeArr[j] - 1];

        sIdx = eIdx; //读一个Double
        eIdx = sIdx + 8; //读一个Double
        res = readFloat64Array(content, sIdx, eIdx)[0];
        resultObj[key] = res;
      }

      arr.push(resultObj);
    }
  }

  return arr;
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
