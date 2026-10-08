// var dInfo = null;
var loadingInfo = null;
var bufferArray = [];
var depthColors = [];
var loadType = 1; // 水深 2：水位
self.onmessage = function (evt) {
  // debugger;
  //if (!evt.data.urlInfo) {
  //    return;
  //}
  // console.log('evt.data.loadInfo', evt.data.loadInfo);
  switch (evt.data.msg) {
    case 'load':
      // depthColors = evt.data.loadInfo.depthColors ? JSON.parse(evt.data.loadInfo.depthColors) : vColors;
      loadingInfo = evt.data.loadInfo;
      depthColors = JSON.parse(evt.data.loadInfo.depthColors);
      loadType = evt.data.loadInfo.loadType;
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
          var d = {};
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

function parsData0(obj) {
  var vs = covData(obj);
  obj = {
    colors: new Uint8Array(getDepthColors(vs)) //水深颜色
    // pos: new Float64Array(crdArr2c3(pos, 2)),
    // ins:new Int32Array(obj.PointIndexs),
    // values:vArr,
  };
  bufferArray.push(obj.colors.buffer);
  // bufferArray.push(obj.pos.buffer);
  // bufferArray.push(obj.ins.buffer);
  return obj;
}

function stopLoad() {
  loadingInfo = null;
}
// function parsData0(obj){

// }
function covData(arr) {
  let num = arr.length / 1;
  let ws = 0;
  for (var i = 0; i < num; i++) {
    ws = arr[i * 1 + 0];
    // pos[i * 3 + 2] = pos[i * 3 + 2]+30 + ws;
  }
  return arr;
}
function toC3Pos(crds) {}

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
      // colors.push(...getDepthColor(vArr[i]));
      let rgba = getDepthColor(vArr[i]);
      colors.push(rgba[0], rgba[1], rgba[2], rgba[3]);
    }
  }
  return colors;
}
function getDepthColor(depth) {
  let vcs = null;
  vcs = getColorsGroup(depthColors, 0);
  for (var i = 0; i < vcs.length; i++) {
    /* if (depth < 1.0000001e-20) {
      return [92, 9, 252, 180];
    } */
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
RadiiSquared = { x: 40680631590769, y: 40680631590769, z: 40408299984661.445 };
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
  };
  return c3;
}
function crdArr2c3(crds, vnum) {
  var arr = null;
  if (crds && crds.length > 0) {
    arr = [];
    var c3 = null;
    for (var i = 0; i < crds.length; i += vnum) {
      if (vnum == 3) {
        // c3=crd2c3(crds[i],crds[i+1],crds[i+2]+1.4);
        c3 = crd2c3(crds[i], crds[i + 1], crds[i + 2] + 0.2);
      } else {
        c3 = crd2c3(crds[i], crds[i + 1], 0.1);
      }
      arr.push(c3.x);
      arr.push(c3.y);
      arr.push(c3.z);
    }
  }
  return arr;
}

var vColors = [
  [
    {
      color: '#FE230A',
      text: '>10',
      max: '',
      min: '10',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [4.5, 100.0],
      alpha: 1,
      rgba: [254, 35, 10, 180]
    },
    {
      color: '#FF990B',
      text: '8.9-10.0',
      max: '10.0',
      min: '8.9',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [4.0, 4.5],
      alpha: 1,
      rgba: [255, 153, 11, 180]
    },
    {
      color: '#F8E51C',
      text: '7.8-8.9',
      max: '8.9',
      min: '7.8',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [3.5, 4.0],
      alpha: 1,
      rgba: [248, 229, 28, 180]
    },
    {
      color: '#CAF915',
      text: '6.7-7.8',
      max: '7.8',
      min: '6.7',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [3.0, 3.5],
      alpha: 1,
      rgba: [202, 249, 21, 180]
    },
    {
      color: '#82EE0D',
      text: '5.6-6.7',
      max: '6.7',
      min: '5.6',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [2.5, 3.0],
      alpha: 1,
      rgba: [130, 238, 13, 180]
    },
    {
      color: '#54E533',
      text: '4.4-5.6',
      max: '5.6',
      min: '4.4',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [2.0, 2.5],
      alpha: 1,
      rgba: [84, 229, 51, 180]
    },
    {
      color: '#65E2A4',
      text: '3.3-4.4',
      max: '4.4',
      min: '3.3',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [1.5, 2.0],
      alpha: 1,
      rgba: [101, 226, 164, 180]
    },
    {
      color: '#69D0FD',
      text: '2.2-3.3',
      max: '3.3',
      min: '2.2',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [1.0, 1.5],
      alpha: 1,
      rgba: [105, 208, 253, 180]
    },
    {
      color: '#357FF5',
      text: '1.1-2.2',
      max: '2.2',
      min: '1.1',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [0.5, 1.0],
      alpha: 1,
      rgba: [53, 127, 245, 180]
    },
    {
      color: '#002FED',
      text: '0.0-1.1',
      max: '1.1',
      min: '0.0',
      inclusiveMin: false,
      inclusiveMax: true,
      type: 'square',
      depth: [0.0, 0.5],
      alpha: 1,
      rgba: [0, 47, 237, 180]
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
