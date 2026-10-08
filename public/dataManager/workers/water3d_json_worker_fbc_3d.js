// let dInfo = null;
let loadingInfo = null;
let bufferArray = [];
let depthColors = [];
let loadType = 1; // 水深 2：水位
self.onmessage = function (evt) {
  //debugger
  //if (!evt.data.urlInfo) {
  //    return;
  //}
  // console.log('evt.data.loadInfo', evt.data.loadInfo);
  switch (evt.data.msg) {
    case 'load':
      loadingInfo = evt.data.loadInfo;
      depthColors = vColors;
      if (evt.data.loadInfo.depthColors) {
        depthColors = JSON.parse(evt.data.loadInfo.depthColors);
      }
      loadType = evt.data.loadInfo.loadType;
      if (evt.data.loadInfo.crds) {
        pos = evt.data.loadInfo.crds;
      }
      loadData(evt.data.loadInfo);
      break;
    case 'stopload':
      stopLoad();
      break;
  }
};
function loadData(loadInfo) {
  try {
    let e = new XMLHttpRequest();
    e.onreadystatechange = function () {
      if (e.readyState == 4 && e.status == 200) {
        if (loadInfo == loadingInfo) {
          bufferArray.length = 0;
          let d = {};
          // debugger;
          d = JSON.parse(e.response);
          if (d) {
            switch (loadInfo.parsType) {
              case 0:
                d = parsData0(d);
                break;
              default:
                d = parsData0(d);
                break;
            }

            d.loadInfo = loadInfo;
            d.msg = 'success';
            self.postMessage(d, bufferArray);
          } else {
            self.postMessage({ loadInfo: loadInfo, msg: 'success' });
          }
        }
      }
    };
    e.open('GET', loadInfo.dataUrl, false);
    e.send(null);
  } catch (e) {
    if (loadInfo == loadingInfo) {
      self.postMessage({ loadInfo: loadInfo, msg: 'error' });
    }
  }
}

// function parsData0(obj) {
//   //debugger
//   let colCount = 2;
//   if (loadingInfo.colCount) {
//     colCount = loadingInfo.colCount;
//   }
//   let vs = covData(obj, colCount);

//   obj = {
//     crds: new Float64Array(pos),
//     colors: new Uint8Array(getDepthColors(vs)), //水深颜色
//     pos: new Float64Array(crdArr2c3(pos, 3))
//     // ins:new Int32Array(obj.PointIndexs),
//     // values:vArr,
//   };
//   bufferArray.push(obj.colors.buffer);
//   bufferArray.push(obj.pos.buffer);
//   if (loadingInfo.encodePostions) {
//     computePostions(obj);
//   }
//   // bufferArray.push(obj.ins.buffer);
//   return obj;
// }

function parsData0(obj){
  let colCount=2;
  if(loadingInfo.colCount){
    colCount=loadingInfo.colCount;
  }
  let vnum=pos.length/(obj.length/colCount);
  if(vnum==2){
    pos=resetCrds(pos);
  }
  let vs = covData(obj,colCount);
  obj = {
    crds:new Float64Array(pos),
    colors: new Uint8Array(getDepthColors(vs)),//水深颜色
    pos: new Float64Array(crdArr2c3(pos, vnum)),
    // ins:new Int32Array(obj.PointIndexs),
    // values:vArr,
  };
  bufferArray.push(obj.colors.buffer);
  bufferArray.push(obj.pos.buffer);
  if(loadingInfo.encodePostions){
    computePostions(obj);
  }
  // bufferArray.push(obj.ins.buffer);
  return obj;
}
function resetCrds(pos){
  let n=pos.length/2;
  let npos=[];
  for(let i=0;i<n;i++){
    npos.push(pos[i*2+0]);
    npos.push(pos[i*2+1]);    
    npos.push(0);
  }
  pos.length=0;
  return npos;
}

function stopLoad() {
  loadingInfo = null;
}
// function parsData0(obj){

// }
function covData(arr, colCount) {
  if (!colCount) {
    colCount = 1;
  }
  let minH = 0.5;
  let num = arr.length / colCount;
  let ws = 0,
    nArr = [];
  for (let i = 0; i < num; i++) {
    ws = arr[i * colCount + 0];
    // ws = arr[i * colCount + 1];
    nArr.push(ws);
    if(colCount>1){
      ws=arr[i* colCount + 1];
    }
    if (ws < 0) {
      ws = minH;
    } else {
      ws = minH + ws;
    }
    pos[i * 3 + 2] = ws;
    // if(i%3==0){
    //   pos[i * 3 + 2] = ws*300;
    // }else if(i%3==1){
    //   pos[i * 3 + 2] = ws*300;
    // }else{
    //   pos[i * 3 + 2] = ws*300;
    // }
  }
  return nArr;
}

function computePostions(vao) {
  let npos = encodeDoubleBuffer(vao.pos);
  vao.pos3DHigh = npos.highBuffer;
  vao.pos3DLow = npos.lowBuffer;

  bufferArray.push(vao.pos3DHigh.buffer);
  bufferArray.push(vao.pos3DLow.buffer);

  npos = crdsTo2DPostions2(vao.crds, 3);
  npos = encodeDoubleBuffer(npos);
  vao.pos2DHigh = npos.highBuffer;
  vao.pos2DLow = npos.lowBuffer;

  bufferArray.push(vao.pos2DHigh.buffer);
  bufferArray.push(vao.pos2DLow.buffer);
}

function getColorsGroup(groups, index) {
  if (index < 0) {
    //console.info("图例颜色有错");
    index = 0;
  }
  if (index >= groups.length) {
    index = 0;
    //console.info("图例颜色有错,颜色类别组不足"+groups.length);
  }
  return groups[index];
}
function getDepthColors(vArr) {
  //按水深获取颜色
  let colors = null;
  if (vArr) {
    colors = [];
    for (let i = 0; i < vArr.length; i++) {
      // debugger
      const obj = getDepthColor(vArr[i])
      colors.push(obj[0], obj[1], obj[2], obj[3])
      // colors.push(...getDepthColor(vArr[i]));
    }
  }
  return colors;
}
//function getDepthColor(depth) {
//  let vcs=null;
//  vcs=getColorsGroup(depthColors,0);
//  for (let i = 0; i < vcs.length; i++) {
//    if (depth < 1.0000001E-20) {
//      return [92, 9, 252, 180];
//    }
//    if (depth >= vcs[i].depth[0] && depth < vcs[i].depth[1]) {
//      return vcs[i].rgba;
//    }
//  }
//  return vcs[0].rgba;
//}

function getDepthColor(depth) {
  let vcs = null;
  vcs = getColorsGroup(depthColors, 0);
  for (var i = 0; i < vcs.length; i++) {
    /* if (depth < 1.0000001e-20) {
      return [92, 9, 252, 180];
    } */

    // if (depth <= 0) {
    //   return [110, 224, 222, 0];
    // }
    if (depth >= vcs[i].depth[0] && vcs[i].depth[1] == '') {
      return vcs[0].rgba;
    }
    if (depth <= vcs[i].depth[1] && vcs[i].depth[0] == '') {
      return vcs[vcs.length - 1].rgba;
    }
    if (depth >= vcs[i].depth[0] && depth < vcs[i].depth[1]) {
      return vcs[i].rgba;
    }
  }

  if (Array.isArray(vcs)) {
    return vcs[0].rgba;
  }

  return vcs.rgba;
}

RADIANS_PER_DEGREE = Math.PI / 180.0;
semimajorAxis = 6378137.0;
RadiiSquared = { x: 40680631590769, y: 40680631590769, z: 40408299984661.445 };
function crd2c3(x, y, h) {
  let lon = x * RADIANS_PER_DEGREE;
  let lat = y * RADIANS_PER_DEGREE;
  let cosLatitude = Math.cos(lat);
  let scratchN = {
    x: cosLatitude * Math.cos(lon),
    y: cosLatitude * Math.sin(lon),
    z: Math.sin(lat)
  };
  let scratchK = {
    x: RadiiSquared.x * scratchN.x,
    y: RadiiSquared.y * scratchN.y,
    z: RadiiSquared.z * scratchN.z
  };
  let dot = scratchN.x * scratchK.x + scratchN.y * scratchK.y + scratchN.z * scratchK.z;
  let gamma = Math.sqrt(dot);
  scratchK.x = scratchK.x / gamma;
  scratchK.y = scratchK.y / gamma;
  scratchK.z = scratchK.z / gamma;
  if (!h) {
    h = 1;
  }

  scratchN.x = scratchN.x * h;
  scratchN.y = scratchN.y * h;
  scratchN.z = scratchN.z * h;

  let c3 = {
    x: scratchK.x + scratchN.x,
    y: scratchK.y + scratchN.y,
    z: scratchK.z + scratchN.z
  };
  return c3;
}
function crdArr2c3(crds, vnum) {
  let arr = null;
  if (crds && crds.length > 0) {
    arr = [];
    let c3 = null,
      h = 0;
    for (let i = 0; i < crds.length; i += vnum) {
      if (vnum == 3) {
        h = crds[i + 2] + 0.3;
      } else {
        h = 0.1;
      }
      c3 = crd2c3(crds[i], crds[i + 1], h);
      arr.push(c3.x);
      arr.push(c3.y);
      arr.push(c3.z);
    }
  }
  return arr;
}
function crdsTo2DPostions2(crds, vnum) {
  let pos = null;
  if (crds) {
    let c3s = projectCrdsToC3s2(crds, vnum);
    pos = [];
    for (let i = 0; i < c3s.length; i++) {
      pos.push(c3s[i].x);
      pos.push(c3s[i].y);
      pos.push(c3s[i].z);
    }
  }
  return pos;
}
function projectCrdsToC3s2(crds, vnum) {
  let c3s = null;
  if (crds) {
    if (!vnum) {
      vnum = 2;
    }
    c3s = [];
    let count = crds.length / vnum;
    let crd = null;
    for (let i = 0; i < count; i++) {
      crd = [crds[i * vnum + 0], crds[i * vnum + 1]];
      if (vnum == 3) {
        crd.push(crds[i * vnum + 2]);
      }
      c3s.push(mercatorProject(crd, vnum));
    }
  }
  return c3s;
}
function mercatorProject(crd, vnum, result) {
  if (crd) {
    let lon = crd[0] * RADIANS_PER_DEGREE;
    let lat = crd[1] * RADIANS_PER_DEGREE;
    if (!result) {
      result = {};
    }
    result.x = lon * semimajorAxis;
    result.y = lat * semimajorAxis;
    result.z = vnum == 3 ? crd[2] : 0;
  }
  return result;
}

function encodeDoubleBuffer(dBuf) {
  let v = null;
  if (dBuf) {
    let n = dBuf.length;
    const highBuf = new Float32Array(n);
    const lowBuf = new Float32Array(n);
    let tmp = null;
    for (let i = 0; i < n; i++) {
      tmp = encodeDouble(dBuf[i]);
      highBuf[i] = tmp.high;
      lowBuf[i] = tmp.low;
    }
    v = {
      highBuffer: highBuf,
      lowBuffer: lowBuf
    };
  }
  return v;
}
function encodeDouble(value, result) {
  if (!result) {
    result = {
      high: 0.0,
      low: 0.0
    };
  }

  let doubleHigh;
  if (value >= 0.0) {
    doubleHigh = Math.floor(value / 65536.0) * 65536.0;
    result.high = doubleHigh;
    result.low = value - doubleHigh;
  } else {
    doubleHigh = Math.floor(-value / 65536.0) * 65536.0;
    result.high = -doubleHigh;
    result.low = value + doubleHigh;
  }
  return result;
}

let vColors = [
  [
    {
      color: '#FE230A',
      text: '>7.5',
      max: '',
      min: '7.5',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['7.5', ''],
      rgba: [254, 35, 10, 230]
    },
    {
      color: '#FF770B',
      text: '7.2-7.5',
      max: '7.5',
      min: '7.2',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['7.2', '7.5'],
      rgba: [255, 119, 11, 230]
    },
    {
      color: '#FD930C',
      text: '6.9-7.2',
      max: '7.2',
      min: '6.9',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['6.9', '7.2'],
      rgba: [253, 147, 12, 230]
    },
    {
      color: '#FFAC11',
      text: '6.6-6.9',
      max: '6.9',
      min: '6.6',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['6.6', '6.9'],
      rgba: [255, 172, 17, 230]
    },
    {
      color: '#FCC410',
      text: '6.3-6.6',
      max: '6.6',
      min: '6.3',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['6.3', '6.6'],
      rgba: [252, 196, 16, 230]
    },
    {
      color: '#FBDB15',
      text: '6.0-6.3',
      max: '6.3',
      min: '6.0',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['6.0', '6.3'],
      rgba: [251, 219, 21, 230]
    },
    {
      color: '#F6F220',
      text: '5.7-6.0',
      max: '6.0',
      min: '5.7',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['5.7', '6.0'],
      rgba: [246, 242, 32, 230]
    },
    {
      color: '#EBFD1F',
      text: '5.4-5.7',
      max: '5.7',
      min: '5.4',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['5.4', '5.7'],
      rgba: [235, 253, 31, 230]
    },
    {
      color: '#D8FB1D',
      text: '5.1-5.4',
      max: '5.4',
      min: '5.1',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['5.1', '5.4'],
      rgba: [216, 251, 29, 230]
    },
    {
      color: '#C4F812',
      text: '4.8-5.1',
      max: '5.1',
      min: '4.8',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['4.8', '5.1'],
      rgba: [196, 248, 18, 230]
    },
    {
      color: '#AEF50B',
      text: '4.5-4.8',
      max: '4.8',
      min: '4.5',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['4.5', '4.8'],
      rgba: [174, 245, 11, 230]
    },
    {
      color: '#98F111',
      text: '4.2-4.5',
      max: '4.5',
      min: '4.2',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['4.2', '4.5'],
      rgba: [152, 241, 17, 230]
    },
    {
      color: '#7FEE0D',
      text: '3.9-4.2',
      max: '4.2',
      min: '3.9',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['3.9', '4.2'],
      rgba: [127, 238, 13, 230]
    },
    {
      color: '#62E908',
      text: '3.6-3.9',
      max: '3.9',
      min: '3.6',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['3.6', '3.9'],
      rgba: [98, 233, 8, 230]
    },
    {
      color: '#4EE60C',
      text: '3.2-3.6',
      max: '3.6',
      min: '3.2',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['3.2', '3.6'],
      rgba: [78, 230, 12, 230]
    },
    {
      color: '#53E52F',
      text: '2.9-3.2',
      max: '3.2',
      min: '2.9',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['2.9', '3.2'],
      rgba: [83, 229, 47, 230]
    },
    {
      color: '#59E452',
      text: '2.6-2.9',
      max: '2.9',
      min: '2.6',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['2.6', '2.9'],
      rgba: [89, 228, 82, 230]
    },
    {
      color: '#5EE375',
      text: '2.3-2.6',
      max: '2.6',
      min: '2.3',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['2.3', '2.6'],
      rgba: [94, 227, 117, 230]
    },
    {
      color: '#63E298',
      text: '2.0-2.3',
      max: '2.3',
      min: '2.0',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['2.0', '2.3'],
      rgba: [99, 226, 152, 230]
    },
    {
      color: '#69E1BB',
      text: '1.7-2.0',
      max: '2.0',
      min: '1.7',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['1.7', '2.0'],
      rgba: [105, 225, 187, 230]
    },
    {
      color: '#6EE0DE',
      text: '1.4-1.7',
      max: '1.7',
      min: '1.4',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['1.4', '1.7'],
      rgba: [110, 224, 222, 230]
    },
    {
      color: '#72DEFF',
      text: '1.1-1.4',
      max: '1.4',
      min: '1.1',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['1.1', '1.4'],
      rgba: [114, 222, 255, 230]
    },
    {
      color: '#62C5FC',
      text: '0.8-1.1',
      max: '1.1',
      min: '0.8',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['0.8', '1.1'],
      rgba: [98, 197, 252, 230]
    },
    {
      color: '#52ACFA',
      text: '0.5-0.8',
      max: '0.8',
      min: '0.5',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['0.5', '0.8'],
      rgba: [82, 172, 250, 230]
    },
    {
      color: '#4193F7',
      text: '0.2-0.5',
      max: '0.5',
      min: '0.2',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['0.2', '0.5'],
      rgba: [65, 147, 247, 230]
    },
    {
      color: '#317AF5',
      text: '-0.1-0.2',
      max: '0.2',
      min: '-0.1',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['-0.1', '0.2'],
      rgba: [49, 122, 245, 230]
    },
    {
      color: '#2161F2',
      text: '-0.4~-0.1',
      max: '-0.1',
      min: '-0.4',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['-0.4', '-0.1'],
      rgba: [33, 97, 242, 230]
    },
    {
      color: '#1048EF',
      text: '-0.7~-0.4',
      max: '-0.4',
      min: '-0.7',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['-0.7', '-0.4'],
      rgba: [16, 72, 239, 230]
    },
    {
      color: '#002FED',
      text: '-1.0~-0.7',
      max: '-0.7',
      min: '-1.0',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['-1.0', '-0.7'],
      rgba: [0, 47, 237, 230]
    },
    {
      color: '#002FED',
      text: '<-1',
      max: '-1',
      min: '',
      inclusiveMin: false,
      inclusiveMax: true,
      alpha: 1,
      depth: ['', '-1'],
      rgba: [0, 47, 237, 230]
    }
  ],
  [
    {
      color: '#FE230A',
      text: '>510',
      max: '',
      min: '510',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [510, 10000],
      alpha: 1,
      rgba: [254, 35, 10, 180]
    },
    {
      color: '#FF7909',
      text: '487.9-510.0',
      max: '510.0',
      min: '487.9',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [487.9, 510.0],
      alpha: 1,
      rgba: [255, 121, 9, 180]
    },
    {
      color: '#FEB012',
      text: '465.7-487.9',
      max: '487.9',
      min: '465.7',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [465.7, 487.9],
      alpha: 1,
      rgba: [254, 176, 18, 180]
    },
    {
      color: '#F9E01A',
      text: '443.6-465.7',
      max: '465.7',
      min: '443.6',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [443.6, 465.7],
      alpha: 1,
      rgba: [249, 224, 26, 180]
    },
    {
      color: '#E5FC1F',
      text: '421.4-443.6',
      max: '443.6',
      min: '421.4',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [421.4, 443.6],
      alpha: 1,
      rgba: [229, 252, 31, 180]
    },
    {
      color: '#BCF70D',
      text: '399.3-421.4',
      max: '421.4',
      min: '399.3',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [399.3, 421.4],
      alpha: 1,
      rgba: [188, 247, 13, 180]
    },
    {
      color: '#8EF010',
      text: '377.1-399.3',
      max: '399.3',
      min: '377.1',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [377.1, 399.3],
      alpha: 1,
      rgba: [142, 240, 16, 180]
    },
    {
      color: '#4FE704',
      text: '355.0-377.1',
      max: '377.1',
      min: '355.0',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [355.0, 377.1],
      alpha: 1,
      rgba: [79, 231, 4, 180]
    },
    {
      color: '#56E443',
      text: '332.9-355.0',
      max: '355.0',
      min: '332.9',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [332.9, 355.0],
      alpha: 1,
      rgba: [86, 228, 67, 180]
    },
    {
      color: '#61E28B',
      text: '310.7-332.9',
      max: '332.9',
      min: '310.7',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [310.7, 332.9],
      alpha: 1,
      rgba: [97, 226, 139, 180]
    },
    {
      color: '#6CE0D4',
      text: '288.6-310.7',
      max: '310.7',
      min: '288.6',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [288.6, 310.7],
      alpha: 1,
      rgba: [108, 224, 212, 180]
    },
    {
      color: '#65CAFD',
      text: '266.4-288.6',
      max: '288.6',
      min: '266.4',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [266.4, 288.6],
      alpha: 1,
      rgba: [101, 202, 253, 180]
    },
    {
      color: '#4496F8',
      text: '244.3-266.4',
      max: '266.4',
      min: '244.3',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [244.3, 266.4],
      alpha: 1,
      rgba: [68, 150, 248, 180]
    },
    {
      color: '#2263F2',
      text: '222.1-244.3',
      max: '244.3',
      min: '222.1',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [222.1, 244.3],
      alpha: 1,
      rgba: [34, 99, 242, 180]
    },
    {
      color: '#002FED',
      text: '200.0-222.1',
      max: '222.1',
      min: '200.0',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [200.0, 222.1],
      alpha: 1,
      rgba: [0, 47, 237, 180]
    }
  ],
  [
    {
      color: '#FE230A',
      text: '4.5-5.0',
      max: '5.0',
      min: '4.5',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [4.5, 5.0],
      alpha: 1,
      rgba: [254, 35, 10, 180]
    },
    {
      color: '#FF990B',
      text: '4.0-4.5',
      max: '4.5',
      min: '4.0',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [4.0, 4.5],
      alpha: 1,
      rgba: [255, 153, 11, 180]
    },
    {
      color: '#F8E51C',
      text: '3.5-4.0',
      max: '4.0',
      min: '3.5',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [3.5, 4.0],
      alpha: 1,
      rgba: [248, 229, 28, 180]
    },
    {
      color: '#CAF915',
      text: '3.0-3.5',
      max: '3.5',
      min: '3.0',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [3.0, 3.5],
      alpha: 1,
      rgba: [202, 249, 21, 180]
    },
    {
      color: '#82EE0D',
      text: '2.5-3.0',
      max: '3.0',
      min: '2.5',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [2.5, 3.0],
      alpha: 1,
      rgba: [130, 238, 13, 180]
    },
    {
      color: '#54E533',
      text: '2.0-2.5',
      max: '2.5',
      min: '2.0',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [2.0, 2.5],
      alpha: 1,
      rgba: [84, 229, 51, 180]
    },
    {
      color: '#65E2A4',
      text: '1.5-2.0',
      max: '2.0',
      min: '1.5',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [1.5, 2.0],
      alpha: 1,
      rgba: [101, 226, 164, 180]
    },
    {
      color: '#69D0FD',
      text: '1.0-1.5',
      max: '1.5',
      min: '1.0',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [1.0, 1.5],
      alpha: 1,
      rgba: [105, 208, 253, 180]
    },
    {
      color: '#357FF5',
      text: '0.5-1.0',
      max: '1.0',
      min: '0.5',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [0.5, 1.0],
      alpha: 1,
      rgba: [53, 127, 245, 180]
    },
    {
      color: '#002FED',
      text: '0.0-0.5',
      max: '0.5',
      min: '0.0',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [0.0, 0.5],
      alpha: 1,
      rgba: [0, 47, 237, 180]
    }
  ]
];

let pos = null;
