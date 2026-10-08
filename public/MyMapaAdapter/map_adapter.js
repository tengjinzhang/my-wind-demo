var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var _a, _b;
class EventType {
}
//图形事件类型
__publicField(EventType, "LeftClick", "LeftClick");
__publicField(EventType, "LeftDoubleClick", "LeftDoubleClick");
__publicField(EventType, "MouseMove", "MouseMove");
__publicField(EventType, "CameraChanged", "CameraChanged");
__publicField(EventType, "MapModelTypeChange", "MapModelTypeChange");
class EventObject {
  constructor() {
    //图形事件对象
    __publicField(this, "EventType", "");
    //事件类型，必须有这个属性
    __publicField(this, "Target", null);
    __publicField(this, "EventId", "");
    __publicField(this, "Callback", () => {
    });
    //回调函数
    __publicField(this, "isPick", true);
    //是否执行pick
    __publicField(this, "forbidden", false);
  }
  //是否禁止触发
}
class EventDispatcher {
  constructor() {
    __publicField(this, "listenerList", []);
    __publicField(this, "isDispose", false);
  }
  addListener(objEvent) {
    if (!this.hasEventListener(objEvent)) {
      this.listenerList.push(objEvent);
    }
  }
  removeListener(objEvent) {
    this.listenerList = this.listenerList.filter(
      (e) => e.EventId !== objEvent.EventId
    );
  }
  // 设置启用或禁用事件
  setEventForbidden(eventType, eventIds) {
    if (eventType) {
      this.listenerList.forEach((e) => {
        if (e.EventType == eventType) {
          if (eventIds && eventIds.includes(e.EventId)) {
            e.forbidden = false;
          } else {
            e.forbidden = true;
          }
        }
      });
    }
  }
  // 恢复事件事件
  restoreEvent() {
    this.listenerList.forEach((v) => {
      v.forbidden = false;
    });
  }
  dispatchEvent(eventType, pick, crd, event, viewer) {
    this.listenerList.forEach((obj) => {
      if (obj && obj.Callback && obj.Callback instanceof Function && eventType === obj.EventType && obj.forbidden == false) {
        if (eventType == EventType.MouseMove) {
          let _pick = pick;
          if (viewer && obj.isPick && crd && crd.endPosition) {
            _pick = viewer.scene.pick(crd.endPosition);
          }
          obj.Callback(_pick, crd, event);
        } else {
          obj.Callback(pick, crd, event);
        }
      }
    });
  }
  hasEventListener(objEvent) {
    this.listenerList.forEach((obj) => {
      if (obj.EventType === objEvent.EventType && obj.EventId === objEvent.EventId) {
        return true;
      }
    });
    return false;
  }
  clear() {
    for (let i = 0; i < this.listenerList.length; i++) {
      this.listenerList[i].EventType = "";
      this.listenerList[i].Target = null;
      this.listenerList[i].EventId = "";
      this.listenerList[i].Callback = () => {
      };
    }
    this.listenerList = [];
  }
  dispose() {
    this.clear();
    this.isDispose = true;
  }
}
const cesiumToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkZGYzOTEyYi04OTQxLTRmOGItOTFhMy1hMTBjODU3Yzg3NzkiLCJpZCI6MTM1NDA3LCJpYXQiOjE2ODIzOTI4Njh9.hjfKta1J1OLGfycyaTcZZOKaOGavp0nYP_AiGZDhSg8";
const tdtMap = window.mapImageUrl;
const tdtLevelMap = window.tdtLevelMap;
const tdtKeyList = [
  "e13bdbc337c3300ace4e35125c84fcab",
  "dac97be0400bd474a33f28a771eb9b5e"
  // "9aca920a49cc5cf11b0fb51dd42a4a0e",
  // "6692bec7985d266e3354b51075b4f39c",
];
class RayPickedHelper {
  static drillPick(viewer, px, py, count) {
    let pickeds = null;
    if (viewer) {
      if (!count) {
        count = 10;
      }
      let c2 = new Cesium.Cartesian2(px, py);
      if (viewer.scene.mode == Cesium.SceneMode.SCENE3D) {
        let ray = this.createRayByC2(viewer, c2);
        pickeds = this.drillPickByRay(viewer, ray, count);
      } else {
        pickeds = viewer.scene.drillPick(c2, count, 1, 1);
      }
    }
    return pickeds;
  }
  static drillPickByBLH(viewer, blh, count) {
    let pickeds = null;
    if (viewer && blh) {
      let oc = Cesium.Cartesian3.fromDegrees(blh[0], blh[1], blh[2]);
      let tc = Cesium.Cartesian3.fromDegrees(blh[0], blh[1], 0);
      let ray = this.createRayByC3Point(oc, tc);
      pickeds = this.drillPickByRay(viewer, ray, count);
    }
    return pickeds;
  }
  static drillPickByRay(viewer, ray, count) {
    let pickeds = null;
    if (viewer && ray) {
      if (!count) {
        count = 20;
      }
      let pick = viewer.scene.drillPickFromRay(ray, count);
      if (pick && pick.length > 0) {
        pickeds = [];
        for (let i = 0; i < pick.length; i++) {
          pickeds.push({
            obj: pick[i].object,
            position: pick[i].position,
            crd: MapBaseHelper$1.c3ToCoordinates(pick[i].position)
          });
        }
      }
    }
    return pickeds;
  }
  static pickPosition(viewer, px, py) {
    let crd = null;
    if (viewer) {
      let ray = RayPickedHelper.createRayByC2(
        viewer,
        new Cesium.Cartesian2(px, py)
      );
      crd = RayPickedHelper.pickPositionByRay(viewer, ray);
    }
    return crd;
  }
  static pickEllipsoidPosition(viewer, px, py) {
    let crd = null;
    if (viewer) {
      let ray = RayPickedHelper.createRayByC2(
        viewer,
        new Cesium.Cartesian2(px, py)
      );
      crd = RayPickedHelper.pickPositionByRay(viewer, ray);
    }
    return crd;
  }
  static pickPositionByRay(viewer, ray) {
    let crd = null;
    if (viewer && ray) {
      let c3 = this.pickC3PositionByRay(viewer, ray);
      switch (viewer.scene.mode) {
        case Cesium.SceneMode.SCENE2D:
          crd = MapBaseHelper$1.unproject(viewer, c3);
          break;
        case Cesium.SceneMode.COLUMBUS_VIEW:
          crd = MapBaseHelper$1.unproject(viewer, c3);
          break;
        case Cesium.SceneMode.SCENE3D:
          if (c3) {
            crd = MapBaseHelper$1.c3ToCoordinates(c3);
          }
          break;
      }
    }
    return crd;
  }
  static pickC3PositionByRay(viewer, ray) {
    let c3 = null;
    if (viewer && ray) {
      switch (viewer.scene.mode) {
        case Cesium.SceneMode.SCENE2D:
          c3 = Cesium.IntersectionTests.rayPlane(
            ray,
            Cesium.Plane.ORIGIN_XY_PLANE
          );
          break;
        case Cesium.SceneMode.COLUMBUS_VIEW:
          c3 = Cesium.IntersectionTests.rayPlane(
            ray,
            Cesium.Plane.ORIGIN_XY_PLANE
          );
          break;
        case Cesium.SceneMode.SCENE3D:
          let intersection = Cesium.IntersectionTests.rayEllipsoid(
            ray,
            viewer.scene.globe.ellipsoid
          );
          if (intersection && intersection.start) {
            c3 = Cesium.Ray.getPoint(ray, intersection.start);
          }
          break;
      }
    }
    return c3;
  }
  static createRayByC3Point(origin_c3, tp_c3) {
    let ot_c3 = Cesium.Cartesian3.subtract(
      tp_c3,
      origin_c3,
      new Cesium.Cartesian3()
    );
    let direction = Cesium.Cartesian3.normalize(ot_c3, new Cesium.Cartesian3());
    return new Cesium.Ray(origin_c3, direction);
  }
  static createRayByC2(viewer, c2) {
    return viewer.scene.camera.getPickRay(c2, new Cesium.Ray());
  }
  static createRayByPositionAndDirection(origin_c3, direction) {
    return new Cesium.Ray(origin_c3, direction);
  }
  static createCameraRay(viewer) {
    return this.createRayByPositionAndDirection(
      viewer.scene.camera.position,
      viewer.scene.camera.direction
    );
  }
  static createXRay(origin_c3) {
    return new Cesium.Ray(origin_c3, Cesium.Cartesian3.UNIT_X);
  }
  static createYRay(origin_c3) {
    return new Cesium.Ray(origin_c3, Cesium.Cartesian3.UNIT_Y);
  }
  static createZRay(origin_c3) {
    return new Cesium.Ray(origin_c3, Cesium.Cartesian3.UNIT_Z);
  }
  static createRayByHeadingPitchRoll(oc3, hpr) {
    let nhpr = new Cesium.HeadingPitchRoll(
      hpr.heading,
      // heading
      hpr.roll,
      // pitch
      hpr.pitch
      // roll
    );
    let m4 = Cesium.Transforms.headingPitchRollToFixedFrame(oc3, nhpr);
    let c0 = new Cesium.Cartesian3(0, 0, 0);
    let c1 = new Cesium.Cartesian3(0, 1e3, 0);
    Cesium.Matrix4.multiplyByPoint(m4, c0, c0);
    Cesium.Matrix4.multiplyByPoint(m4, c1, c1);
    let ray = RayPickedHelper.createRayByC3Point(c0, c1);
    return ray;
  }
}
class LayerFilter {
  constructor() {
    __publicField(this, "brightness", 1);
    //亮度
    __publicField(this, "contrast", 1);
    //对比度
    __publicField(this, "hue", 0);
    //色调
    __publicField(this, "saturation", 1);
    //饱和度
    __publicField(this, "gamma", 1);
    //伽玛校正
    __publicField(this, "colorToAlpha", null);
    //要用作 alpha 的颜色
    __publicField(this, "colorToAlphaThreshold", 4e-3);
    //颜色到 alpha 的阈值
    __publicField(this, "alpha", 1);
    //图层透明度
    __publicField(this, "nightAlpha", 1);
    //图层夜景透明度
    __publicField(this, "dayAlpha", 1);
  }
  //图层白天透明度
}
let MapBaseHelper$1 = (_a = class {
  constructor() {
  }
  static setLayerFilter(layer, filter) {
    if (layer && filter) {
      layer.brightness = filter.brightness;
      layer.contrast = filter.contrast;
      layer.hue = filter.hue;
      layer.saturation = filter.saturation;
      layer.gamma = filter.gamma;
      layer.alpha = filter.alpha;
      layer.nightAlpha = filter.nightAlpha;
      layer.dayAlpha = filter.dayAlpha;
      layer.colorToAlpha = filter.colorToAlpha;
      layer.colorToAlphaThreshold = filter.colorToAlphaThreshold;
    }
  }
  static getLayerFilter(layer) {
    let filter = null;
    if (layer) {
      filter = new LayerFilter();
      filter.brightness = layer.brightness;
      filter.contrast = layer.contrast;
      filter.hue = layer.hue;
      filter.saturation = layer.saturation;
      filter.gamma = layer.gamma;
      filter.colorToAlpha = layer.colorToAlpha;
      filter.colorToAlphaThreshold = layer.colorToAlphaThreshold;
      filter.alpha = layer.alpha;
    }
    return filter;
  }
  static setLayerFilterByLayerIndex(viewer, filter, layerIndex = 0) {
    if (filter) {
      if (!viewer) {
        viewer = this.viewer;
      }
      let layer = viewer.imageryLayers.get(layerIndex);
      this.setLayerFilter(layer, filter);
    }
  }
  static setMapsAlpha(viewer, alpha) {
    if (!viewer) {
      viewer = this.viewer;
    }
    this.viewer.scene.globe.translucency.enabled = alpha < 1;
    this.viewer.scene.globe.translucency.frontFaceAlpha = alpha;
    this.viewer.scene.globe.translucency.backFaceAlpha = alpha;
  }
  static addSortToCollection(collection) {
  }
  static sortCollection(collection, sortName, sortType) {
    if (collection) {
      let num = collection.length, i, j;
      let elm1, elm2;
      for (i = 0; i < num; i++) {
        for (j = 0; j < num - 1 - i; j++) {
          elm1 = collection.get(j);
          elm2 = collection.get(j + 1);
          if (elm1[sortName] == null || elm1[sortName] == void 0) {
            elm1[sortName] = 1;
          }
          if (elm2[sortName] == null || elm2[sortName] == void 0) {
            elm2[sortName] = 1;
          }
          if (elm1[sortName] > elm2[sortName]) {
            collection.raise(elm1);
          }
        }
      }
    }
  }
  static getMapsLevel(viewer, center) {
    if (!viewer) {
      viewer = this.viewer;
    }
    let level = -1, resolution;
    let distance2 = this.getCameraDistance(viewer, center);
    if (distance2) {
      resolution = _a.distance2Resolution(viewer, distance2);
      level = _a.resolution2Level(resolution, true);
    }
    return level;
  }
  static getCameraDistance(viewer, p) {
    let distance2 = 0;
    if (!viewer) {
      viewer = this.viewer;
    }
    if (viewer.scene.mode == Cesium.SceneMode.SCENE2D) {
      distance2 = viewer.scene.camera.positionCartographic.height;
    } else {
      let p_c3 = null;
      if (p) {
        if (p.length == 2) {
          p[2] = 0;
        }
        if (viewer.scene.mode == Cesium.SceneMode.COLUMBUS_VIEW) {
          p_c3 = this.project(viewer, p, 3);
        } else {
          p_c3 = Cesium.Cartesian3.fromDegrees(p[0], p[1], p[2]);
        }
      } else {
        let ray = RayPickedHelper.createCameraRay(viewer);
        p_c3 = RayPickedHelper.pickC3PositionByRay(viewer, ray);
      }
      if (p_c3) {
        let camera_c3 = new Cesium.Cartesian3(
          viewer.camera.position.x,
          viewer.camera.position.y,
          viewer.camera.position.z
        );
        distance2 = Cesium.Cartesian3.distance(camera_c3, p_c3);
      }
    }
    return distance2;
  }
  // static geth0(dis,level){//反算距离和等级的计算常量
  //   return Math.pow(2,level)*dis;
  // }
  static getMapsCenter(viewer) {
    if (!viewer) {
      viewer = this.viewer;
    }
    let center = null;
    switch (viewer.scene.mode) {
      case Cesium.SceneMode.SCENE2D:
        center = this.getMapsCenter2D();
        break;
      case Cesium.SceneMode.COLUMBUS_VIEW:
        center = this.getMapsCenterByRay();
        break;
      case Cesium.SceneMode.SCENE3D:
        center = this.getMapsCenterByRay();
        break;
    }
    return center;
  }
  static getMapsCenter2D(viewer) {
    if (!viewer) {
      viewer = this.viewer;
    }
    let c3 = viewer.camera.pickEllipsoid(
      new Cesium.Cartesian2(
        viewer.canvas.clientWidth / 2,
        viewer.canvas.clientHeight / 2
      )
    );
    if (c3) {
      let cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(c3);
      return [
        Cesium.Math.toDegrees(cartographic.longitude),
        Cesium.Math.toDegrees(cartographic.latitude),
        cartographic.height
      ];
    }
    return null;
  }
  static getMapsCenterByRay(viewer) {
    if (!viewer) {
      viewer = this.viewer;
    }
    let ray = RayPickedHelper.createCameraRay(viewer);
    let crd = RayPickedHelper.pickPositionByRay(viewer, ray);
    return crd;
  }
  static offsetCenter(center, mlevel, px, py) {
    let h = this.mapsLevel2Distance(this.viewer, mlevel);
    h = h + center[2];
    mlevel = this.distance2MapsLevel(this.viewer, h);
    let r = this.level2Resolution(mlevel);
    let ox = center[0] - px * r;
    let oy = center[1] + py * r;
    return [ox, oy, center[2]];
  }
  static getLevelResolution(level) {
    return this.level2Resolution(level);
  }
  static getLevelResolution2(level) {
    return this.level2Resolution(level, true);
  }
  ////////////////等级、分辨率、相机距离、比例尺 相互换算////////////////////////////////////////
  static resolution2Level(r, isMercator) {
    let w = 180;
    if (isMercator) {
      w = 20037508342789244e-9;
    }
    return Math.log2(w / (256 * r));
  }
  static level2Resolution(level, isMercator) {
    let w = 180;
    if (isMercator) {
      w = 20037508342789244e-9;
    }
    return w / (256 * Math.pow(2, level));
  }
  static distance2Resolution(viewer, distance2) {
    let resolution = 0;
    if (!viewer) {
      viewer = this.viewer;
    }
    let ocf = viewer.scene.camera.frustum;
    let drawingBufferWidth = viewer.scene.context.drawingBufferWidth;
    let drawingBufferHeight = viewer.scene.context.drawingBufferHeight;
    let pixelRatio = viewer.scene.pixelRatio;
    let pixelSize = ocf.getPixelDimensions(
      drawingBufferWidth,
      drawingBufferHeight,
      distance2,
      pixelRatio,
      new Cesium.Cartesian2()
    );
    if (pixelSize) {
      resolution = pixelSize.x;
    }
    return resolution;
  }
  static resolution2Distance(viewer, resolution) {
    let distance2 = 0;
    if (!viewer) {
      viewer = this.viewer;
    }
    let ocf = null;
    let drawingBufferWidth = viewer.scene.context.drawingBufferWidth;
    let pixelRatio = viewer.scene.pixelRatio;
    if (viewer.scene.mode == Cesium.SceneMode.SCENE2D) {
      ocf = viewer.scene.camera.frustum;
      distance2 = resolution * drawingBufferWidth / pixelRatio;
    } else {
      ocf = viewer.scene.camera.frustum.offCenterFrustum;
      let inverseNear = 1 / ocf.near;
      let tanTheta = ocf.right * inverseNear;
      distance2 = resolution * drawingBufferWidth / (2 * pixelRatio * tanTheta);
    }
    return distance2;
  }
  static resolution2Scale(resolution, dpi) {
    if (!dpi) {
      dpi = this.DPI;
    }
    return dpi * resolution / 0.0254;
  }
  static scale2Resolution(scale, dpi) {
    if (!dpi) {
      dpi = this.DPI;
    }
    return 0.0254 * scale / dpi;
  }
  static distance2MapsLevel(viewer, distance2) {
    if (!viewer) {
      viewer = this.viewer;
    }
    let level = -1;
    let resolution = this.distance2Resolution(viewer, distance2);
    level = this.resolution2Level(resolution, true);
    return level;
  }
  static mapsLevel2Distance(viewer, level) {
    if (!viewer) {
      viewer = this.viewer;
    }
    let distance2 = 0;
    let resolution = this.level2Resolution(level, true);
    distance2 = this.resolution2Distance(viewer, resolution);
    return distance2;
  }
  ////////////////////////////////////////////////////////
  static getMapsCenterByRayTest(viewer) {
    if (!viewer) {
      viewer = this.viewer;
    }
    let crd = null;
    let ray = RayPickedHelper.createCameraRay(viewer);
    let intersection = Cesium.IntersectionTests.rayEllipsoid(
      ray,
      viewer.scene.globe.ellipsoid
    );
    let c3 = Cesium.Ray.getPoint(ray, intersection.start);
    if (c3) {
      crd = this.c3ToCoordinates(c3);
    }
    return crd;
  }
  static setMapsView1(xc, yc, mlevel, duration) {
    if (Math.abs(mlevel - this.getMapsLevel()) > this.levelDiff) {
      let center = this.getMapsCenter();
      center[2] = 0;
      let cameraPosition1 = [
        Cesium.Math.toDegrees(
          this.viewer.camera.positionCartographic.longitude
        ),
        Cesium.Math.toDegrees(this.viewer.camera.positionCartographic.latitude),
        this.viewer.camera.positionCartographic.height
      ];
      let center_c3 = Cesium.Cartesian3.fromDegrees(
        center[0],
        center[1],
        center[2]
      );
      let camera_c3 = Cesium.Cartesian3.fromDegrees(
        cameraPosition1[0],
        cameraPosition1[1],
        cameraPosition1[2]
      );
      let d1 = Cesium.Cartesian3.distance(camera_c3, center_c3);
      let d2 = this.mapsLevel2Distance(this.viewer, mlevel);
      let nc3 = new Cesium.Cartesian3();
      nc3.x = center_c3.x - d2 * (center_c3.x - camera_c3.x) / d1;
      nc3.y = center_c3.y - d2 * (center_c3.y - camera_c3.y) / d1;
      nc3.z = center_c3.z - d2 * (center_c3.z - camera_c3.z) / d1;
      let cartographic2 = Cesium.Cartographic.fromCartesian(nc3);
      let cameraPosition2 = [
        Cesium.Math.toDegrees(cartographic2.longitude),
        Cesium.Math.toDegrees(cartographic2.latitude),
        cartographic2.height
      ];
      cameraPosition2[0] += xc - center[0];
      cameraPosition2[1] += yc - center[1];
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          cameraPosition2[0],
          cameraPosition2[1],
          cameraPosition2[2]
        ),
        orientation: {
          heading: this.viewer.camera.heading,
          pitch: this.viewer.camera.pitch,
          roll: this.viewer.camera.roll
        },
        duration
      });
    }
  }
  static setViewByBBox(bbox, duration, callback) {
    if (bbox) {
      this.setLocateRect(bbox);
      this.FlyToPromise = this.viewer.flyTo(this.LocateRect, {
        duration
        // offset: {
        //   heading: this.viewer.camera.heading,
        //   pitch: this.viewer.camera.pitch,
        //   range: mapsLevelToHeight(mlevel) / Math.cos(this.viewer.camera.pitch + Math.PI / 4)
        // }
      });
      if (callback) {
        this.FlyToPromise.then(function() {
          callback();
        });
      }
    }
  }
  static smoothZoomLevel(viewer, mlevel, duration) {
    if (Math.abs(mlevel - this.getMapsLevel()) > this.levelDiff) {
      let center = this.getMapsCenter();
      if (center) {
        this.smoothMapsView(viewer, {
          centerX: center[0],
          //必传
          centerY: center[1],
          //必传
          centerZ: center[2],
          //高度
          level: mlevel,
          //地图等级
          duration
        });
      }
    }
  }
  static async smoothMapsView(viewer, fv) {
    if (fv) {
      if (!viewer) {
        viewer = this.viewer;
      }
      if (fv.heading == null || fv.heading == void 0) {
        fv.heading = viewer.camera.heading;
      }
      if (fv.pitch == null || fv.pitch == void 0) {
        fv.pitch = viewer.camera.pitch;
      }
      if (fv.centerZ == null || fv.centerZ == void 0) {
        fv.centerZ = 0;
      }
      if (fv.range == null || fv.range == void 0) {
        if (fv.level == null || fv.level == void 0) {
          fv.level = 15;
        }
        fv.range = this.mapsLevel2Distance(viewer, fv.level);
      }
      if (fv.centerZ != 0 && fv.pitch % Math.PI != 0) {
        fv.range += fv.centerZ / Math.sin(fv.pitch);
      }
      if (fv.duration == null || fv.duration == void 0) {
        fv.duration = 0;
      }
      let hpr = new Cesium.HeadingPitchRange(fv.heading, fv.pitch, fv.range);
      this.setLocatePoint(viewer, fv.centerX, fv.centerY, fv.centerZ);
      await viewer.flyTo(viewer.LocatePoint, {
        duration: fv.duration,
        offset: hpr,
        maximumHeight: viewer.camera.positionCartographic.height
      });
      _a.setLocatePointVisible(viewer, false);
      _a.callFunction(fv.complete);
    }
  }
  static setMapsView(xc, yc, mlevel, duration) {
    if (Math.abs(mlevel - this.getMapsLevel()) > this.levelDiff) {
      this.smoothMapsView(this.viewer, {
        centerX: xc,
        //必传
        centerY: yc,
        //必传
        level: mlevel,
        //地图等级
        duration
      });
    }
  }
  static setMapsView3D(viewer, xc, yc, zc, mlevel, duration) {
    if (!viewer) {
      viewer = this.viewer;
    }
    this.smoothMapsView(viewer, {
      centerX: xc,
      //必传
      centerY: yc,
      //必传
      centerZ: zc,
      //高度
      level: mlevel,
      //地图等级
      duration
    });
  }
  static setViewAngle(xc, yc, mlevel, angle, duration) {
    let hpr = new Cesium.HeadingPitchRange(
      this.viewer.camera.heading,
      Cesium.Math.toRadians(angle),
      this.mapsLevel2Distance(this.viewer, mlevel)
    );
    this.setLocatePoint(this.viewer, xc, yc);
    this.viewer.flyTo(this.viewer.LocatePoint, {
      duration,
      offset: hpr,
      maximumHeight: this.viewer.camera.positionCartographic.height
    });
  }
  static setLocatePoint(viewer, cx, cy, cz) {
    if (!viewer) {
      viewer = this.viewer;
    }
    if (!viewer.LocatePoint) {
      if (!cz) {
        cz = 0;
      }
      viewer.LocatePoint = viewer.entities.add(
        new Cesium.Entity({
          id: "LocatePoint",
          position: Cesium.Cartesian3.fromDegrees(cx, cy, cz),
          point: {
            pixelSize: 1,
            color: Cesium.Color.WHITE.withAlpha(0)
          }
        })
      );
    } else {
      this.setLocatePointVisible(viewer, true);
      viewer.LocatePoint.position = Cesium.Cartesian3.fromDegrees(cx, cy, cz);
    }
  }
  static setLocateRect(bbox) {
    if (!this.LocateRect) {
      this.LocateRect = this.viewer.entities.add(
        new Cesium.Entity({
          id: "LocateRect",
          rectangle: {
            coordinates: Cesium.Rectangle.fromDegrees(
              bbox[0],
              bbox[1],
              bbox[2],
              bbox[3]
            ),
            material: Cesium.Color.WHITE.withAlpha(0),
            height: 0,
            outline: false
          }
        })
      );
    } else {
      this.LocateRect.rectangle.coordinates = Cesium.Rectangle.fromDegrees(
        bbox[0],
        bbox[1],
        bbox[2],
        bbox[3]
      );
    }
  }
  static setLocatePointVisible(viewer, v) {
    if (!viewer) {
      viewer = this.viewer;
    }
    if (!viewer.LocatePoint) {
      viewer.LocatePoint.show = v;
    }
  }
  static setViewAndAngle(xc, yc, mlevel, pitch, heading, duration, callback) {
    this.smoothMapsView(this.viewer, {
      centerX: xc,
      //必传
      centerY: yc,
      //必传
      // centerZ:0,//高度
      level: mlevel,
      //地图等级
      // range:MapBaseHelper.mapsLevelToHeight(level),//米
      heading: Cesium.Math.toRadians(heading),
      //弧度
      pitch: Cesium.Math.toRadians(pitch),
      //弧度
      // roll:Cesium.Math.toRadians(0),//弧度
      duration,
      complete: callback
    });
  }
  static setViewAndAngle3D(viewer, fv) {
    if (!viewer) {
      viewer = this.viewer;
    }
    this.smoothMapsView(this.viewer, fv);
  }
  static setOrientation(viewer, hpr, duration, callback) {
    if (!viewer) {
      viewer = this.viewer;
    }
    let center = this.getMapsCenter(this.viewer);
    let level = this.getMapsLevel(this.viewer);
    let options = {
      heading: Cesium.Math.toRadians(hpr.heading),
      //弧度
      pitch: Cesium.Math.toRadians(hpr.pitch),
      //弧度
      roll: Cesium.Math.toRadians(hpr.roll),
      //弧度
      duration,
      complete: callback
    };
    if (center) {
      options.centerX = center[0];
      options.centerY = center[1];
      options.level = level;
    }
    this.smoothMapsView(viewer, options);
  }
  static changSceneMode(viewer, mode, options) {
    if (mode != viewer.scene.mode) {
      let center, mlevel, duration, pitch;
      if (options && options.center) {
        center = options.center;
      } else {
        center = _a.getMapsCenter(viewer);
      }
      if (options && options.level) {
        mlevel = options.level;
      } else {
        mlevel = _a.getMapsLevel(viewer, center);
      }
      if (options && options.angle) {
        pitch = Cesium.Math.toRadians(options.angle);
      } else {
        pitch = viewer.camera.pitch;
      }
      if (options && options.duration) {
        duration = options.duration;
      } else {
        duration = 0;
      }
      viewer.scene.mode = mode;
      viewer.scene.completeMorph();
      this.smoothMapsView(viewer, {
        centerX: center[0],
        //必传
        centerY: center[1],
        //必传
        // centerZ:center[2],//高度
        level: mlevel,
        //地图等级
        // range:MapBaseHelper.mapsLevelToHeight(level),//米
        // heading:viewer.camera.heading,//弧度
        pitch,
        //弧度
        // roll:viewer.camera.roll,//弧度
        duration
      });
    }
  }
  static getSurfaceTileBounds(viewer) {
    let bounds = null;
    let tiles = viewer.scene._globe._surface._tilesToRender;
    if (tiles && tiles.length > 1) {
      let rectangle = tiles[0].rectangle;
      bounds = [
        rectangle.west,
        rectangle.south,
        rectangle.east,
        rectangle.north
      ];
      for (let i = 1; i < tiles.length; i++) {
        rectangle = tiles[i].rectangle;
        bounds[0] = Math.min(bounds[0], rectangle.west);
        bounds[1] = Math.min(bounds[1], rectangle.south);
        bounds[2] = Math.max(bounds[2], rectangle.east);
        bounds[3] = Math.max(bounds[3], rectangle.north);
      }
      bounds[0] = Cesium.Math.toDegrees(bounds[0]);
      bounds[1] = Cesium.Math.toDegrees(bounds[1]);
      bounds[2] = Cesium.Math.toDegrees(bounds[2]);
      bounds[3] = Cesium.Math.toDegrees(bounds[3]);
    }
    return bounds;
  }
  static setViewAndOrientation(viewer, fv) {
    if (fv) {
      if (!viewer) {
        viewer = this.viewer;
      }
      if (fv.roll == null || fv.roll == void 0) {
        fv.roll = Cesium.Math.toRadians(0);
      }
      if (fv.heading == null || fv.heading == void 0) {
        fv.heading = Cesium.Math.toRadians(0);
      }
      if (fv.pitch == null || fv.pitch == void 0 || viewer.scene.mode == Cesium.SceneMode.SCENE2D) {
        fv.pitch = Cesium.Math.toRadians(-90);
      }
      if (fv.duration == null || fv.duration == void 0) {
        fv.duration = 1;
      }
      let options = {
        orientation: {
          heading: fv.heading,
          pitch: fv.pitch,
          roll: fv.roll
        },
        maximumHeight: viewer.camera.positionCartographic.height,
        duration: fv.duration,
        complete: function() {
          _a.callFunction(fv.complete);
        }
      };
      if (fv.centerX) {
        if (fv.centerZ == null || fv.centerZ == void 0) {
          fv.centerZ = 0;
        }
        let t_c3 = Cesium.Cartesian3.fromDegrees(
          fv.centerX,
          fv.centerY,
          fv.centerZ
        );
        if (fv.range == null || fv.range == void 0) {
          if (fv.level == null || fv.level == void 0) {
            fv.level = 15;
          }
          fv.range = this.mapsLevel2Distance(viewer, fv.level);
        }
        if (fv.centerZ != 0 && fv.pitch % Math.PI != 0) {
          fv.range += fv.centerZ / Math.sin(fv.pitch);
        }
        let hpr = new Cesium.HeadingPitchRoll(fv.heading, fv.pitch, fv.roll);
        let ray = RayPickedHelper.createRayByHeadingPitchRoll(t_c3, hpr);
        ray.direction = Cesium.Cartesian3.multiplyByScalar(
          ray.direction,
          -1,
          ray.direction
        );
        options.destination = Cesium.Ray.getPoint(ray, fv.range);
      }
      viewer.camera.flyTo(options);
    }
  }
  static callFunction(execution) {
    if (execution) {
      if (execution instanceof Function) {
        execution();
      } else {
        if (execution.callback && execution.callback instanceof Function) {
          if (execution.actionScope) {
            execution.callback.apply(execution.actionScope, []);
          } else {
            execution.callback.apply(window, []);
          }
        }
      }
    }
  }
  static pickC3Position(viewer, px, py) {
    if (!viewer) {
      viewer = this.viewer;
    }
    if (this.viewer.scene.pickPositionSupported) {
      return this.viewer.scene.pickPosition({ x: px, y: py });
    }
    return null;
  }
  static pickPosition(viewer, px, py) {
    if (!viewer) {
      viewer = this.viewer;
    }
    let c3 = null;
    if (this.viewer.scene.pickPositionSupported) {
      c3 = this.viewer.scene.pickPosition({ x: px, y: py });
      if (Cesium.defined(c3)) {
        let cartographic = Cesium.Cartographic.fromCartesian(c3);
        return [
          Cesium.Math.toDegrees(cartographic.longitude),
          Cesium.Math.toDegrees(cartographic.latitude),
          cartographic.height
        ];
      }
    }
    if (!c3) {
      return this.pixelToCoordinates(viewer, px, py);
    }
    return null;
  }
  static pixelToCoordinates(viewer, px, py) {
    if (!viewer) {
      viewer = this.viewer;
    }
    let crd = RayPickedHelper.pickEllipsoidPosition(viewer, px, py);
    return crd;
  }
  static c3ToCrd(c3) {
    if (Cesium.defined(c3)) {
      let cartographic = Cesium.Cartographic.fromCartesian(c3);
      return [
        Cesium.Math.toDegrees(cartographic.longitude),
        Cesium.Math.toDegrees(cartographic.latitude),
        cartographic.height
      ];
    }
    return [x, y, z];
  }
  static createColor(cssColor, opacity) {
    if (!cssColor) {
      cssColor = "#ff0000";
    }
    if (!(typeof opacity === "number")) {
      opacity = 1;
    }
    let color = Cesium.Color.fromCssColorString(cssColor);
    color.alpha = opacity;
    return color;
  }
  static c3ToCoord(x2, y2, z2) {
    let epsilon = 1e-15;
    let a = this.semimajorAxis;
    let f = 298.257223563;
    let b = a - a / f;
    let e = Math.sqrt(a * a - b * b) / a;
    let B1 = 0;
    let N = 0;
    let B2 = Math.atan2(z2, Math.sqrt(x2 * x2 + y2 * y2));
    let counter = 0;
    while (this.toDegrees(Math.abs(B1 - B2)) > epsilon && counter < 25) {
      B1 = B2;
      N = a / Math.sqrt(1 - e * e * Math.sin(B1) * Math.sin(B1));
      B2 = Math.atan2(z2 + N * e * e * Math.sin(B1), Math.sqrt(x2 * x2 + y2 * y2));
      counter++;
    }
    x2 = this.toDegrees(Math.atan2(y2, x2));
    y2 = this.toDegrees(B1);
    z2 = z2 / Math.sin(B1) - N * (1 - e * e);
    return [x2, y2, z2];
  }
  static toDegrees(v) {
    return v * (180 / Math.PI);
  }
  static c3ToCoordinates(c3) {
    let crd = null;
    if (Cesium.defined(c3)) {
      let cartographic = Cesium.Cartographic.fromCartesian(c3);
      crd = [
        Cesium.Math.toDegrees(cartographic.longitude),
        Cesium.Math.toDegrees(cartographic.latitude),
        cartographic.height
      ];
    }
    return crd;
  }
  static c3sToCoordinates(c3s) {
    let crds = null;
    if (c3s) {
      crds = [];
      let num = c3s.length / 3;
      let crd = null;
      for (let i = 0; i < num; i++) {
        crd = this.c3ToCoordinates(
          new Cesium.Cartesian3(c3s[i * 3 + 0], c3s[i * 3 + 1], c3s[i * 3 + 2])
        );
        crds.push(crd[0], crd[1], crd[2]);
      }
    }
    return crds;
  }
  static crdArrToC3s(crdArr) {
    let c3s = null;
    if (crdArr && crdArr.length > 0) {
      c3s = this.crdsToC3s(this.crdArrToCrds(crdArr), crdArr[0].length);
    }
    return c3s;
  }
  static crdsTo3DPostions(crds, vnum) {
    let pos = null;
    if (crds) {
      if (!vnum) {
        vnum = 2;
      }
      pos = [];
      let c3s = this.crdsToC3s(crds, vnum);
      for (let i = 0; i < c3s.length; i++) {
        pos.push(c3s[i].x);
        pos.push(c3s[i].y);
        pos.push(c3s[i].z);
      }
    }
    return pos;
  }
  static crdArrToCrds(crdArr) {
    let crds = null;
    if (crdArr) {
      crds = [];
      for (let i = 0; i < crdArr.length; i++) {
        crds.push(crdArr[i][0]);
        crds.push(crdArr[i][1]);
        if (crdArr[i].length > 2) {
          crds.push(crdArr[i][2]);
        } else {
          crds.push(0.1);
        }
      }
    }
    return crds;
  }
  static crdsToC3s(crds, vnum) {
    let c3s = null;
    if (crds) {
      if (!vnum) {
        vnum = 2;
      }
      if (vnum == 2) {
        c3s = Cesium.Cartesian3.fromDegreesArray(crds);
      } else if (vnum == 3) {
        c3s = Cesium.Cartesian3.fromDegreesArrayHeights(crds);
      }
    }
    return c3s;
  }
  static getMaxLevel(bound, mapWidth, mapHeight) {
    maxLevel = 2;
    let resolution = 0, w = 0, h = 0;
    let vWidth = bound[2] - bound[0];
    let vHeight = bound[3] - bound[1];
    for (let i = 22; i > 2; i -= 0.5) {
      maxLevel = i;
      resolution = this.level2Resolution(maxLevel);
      w = resolution * mapWidth;
      h = resolution * mapHeight;
      if (w > vWidth && h > vHeight) {
        break;
      }
    }
    return maxLevel;
  }
  static getCameraOrientation(viewer) {
    let hpr = null;
    if (!viewer) {
      viewer = this.viewer;
    }
    if (viewer) {
      hpr = {
        heading: Cesium.Math.toDegrees(viewer.camera.heading),
        pitch: Cesium.Math.toDegrees(viewer.camera.pitch),
        roll: Cesium.Math.toDegrees(viewer.camera.roll)
      };
    }
    return hpr;
  }
  static crdsTo2DPostions(viewer, crds, vnum) {
    if (!viewer) {
      viewer = this.viewer;
    }
    let pos = null;
    if (viewer && crds) {
      let c3s = this.projectCrdsToC3s(viewer, crds, vnum);
      pos = [];
      for (let i = 0; i < c3s.length; i++) {
        pos.push(c3s[i].x);
        pos.push(c3s[i].y);
        pos.push(c3s[i].z);
      }
    }
    return pos;
  }
  static projectCrdsToC3s(viewer, crds, vnum) {
    let c3s = null;
    if (!viewer) {
      viewer = this.viewer;
    }
    if (viewer && crds) {
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
        c3s.push(this.project(viewer, crd, vnum));
      }
    }
    return c3s;
  }
  static unproject(viewer, c3) {
    if (!viewer) {
      viewer = this.viewer;
    }
    let crd = null;
    if (c3) {
      let cartographic = viewer.scene.mapProjection.unproject(c3);
      if (cartographic) {
        crd = [
          Cesium.Math.toDegrees(cartographic.longitude),
          Cesium.Math.toDegrees(cartographic.latitude),
          cartographic.height
        ];
      }
    }
    return crd;
  }
  static project(viewer, crd, vnum) {
    if (!viewer) {
      viewer = this.viewer;
    }
    let c3 = null;
    if (crd) {
      if (!vnum) {
        vnum = 2;
      }
      let h = 0;
      if (vnum == 3) {
        h = crd[2];
      }
      let cartographic = new Cesium.Cartographic(
        Cesium.Math.toRadians(crd[0]),
        Cesium.Math.toRadians(crd[1]),
        h
      );
      c3 = viewer.scene.mapProjection.project(cartographic);
    }
    return c3;
  }
  static crdsTo2DPostions2(crds, vnum) {
    let pos = null;
    if (crds) {
      let c3s = this.projectCrdsToC3s2(crds, vnum);
      pos = [];
      for (let i = 0; i < c3s.length; i++) {
        pos.push(c3s[i].x);
        pos.push(c3s[i].y);
        pos.push(c3s[i].z);
      }
    }
    return pos;
  }
  static projectCrdsToC3s2(crds, vnum) {
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
        c3s.push(this.mercatorProject(crd, vnum));
      }
    }
    return c3s;
  }
  static mercatorProject(crd, vnum, result) {
    if (crd) {
      let lon = crd[0] * this.RADIANS_PER_DEGREE;
      let lat = crd[1] * this.RADIANS_PER_DEGREE;
      if (!result) {
        result = {};
      }
      result.x = lon * this.semimajorAxis;
      result.y = lat * this.semimajorAxis;
      result.z = vnum == 3 ? crd[2] : 0;
    }
    return result;
  }
}, __publicField(_a, "viewer", null), __publicField(_a, "levelDiff", 1e-14), __publicField(_a, "LocatePoint", null), __publicField(_a, "LocateRect", null), __publicField(_a, "DPI", 96), //默认dpi
__publicField(_a, "maxCoord", {
  x: 20037508342789244e-9,
  y: 10018754171394622e-9,
  z: 0
}), __publicField(_a, "RADIANS_PER_DEGREE", Math.PI / 180), __publicField(_a, "DEGREES_PER_RADIAN", 180 / Math.PI), __publicField(_a, "semimajorAxis", 6378137), __publicField(_a, "FlyToPromise", null), _a);
const hexToRGBA = (hex, alpha = 1) => {
  let result = null;
  if (hex.length === 4) {
    result = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
    const r = parseInt(result[1] + result[1], 16);
    const g = parseInt(result[2] + result[2], 16);
    const b = parseInt(result[3] + result[3], 16);
    return [r, g, b, alpha];
  } else {
    result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return [r, g, b, alpha];
  }
};
class VaoGraphicHelper {
  static showVAOWater(viewer, vao, id, color, normalImg, isshow) {
    if (!color) {
      color = Cesium.Color.fromCssColorString("#409dfd");
      color.alpha = 0.5;
    }
    if (!normalImg) {
      normalImg = "/Apps/img/waterNormals.jpg";
    }
    const geometry = this.createVAOGeometry(vao);
    const instance = this.createInstanceByGeometry(geometry, id, null);
    const appearance = this.createWaterAppearance(color, normalImg);
    const gTriangles = viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances: [instance],
        appearance,
        compressVertices: true,
        releaseGeometryInstances: true,
        allowPicking: true,
        show: isshow,
        // classificationType: Cesium.ClassificationType.TERRAIN,
        asynchronous: false
        // debugShowBoundingVolume:true,
      })
    );
    return gTriangles;
  }
  static showVAO(viewer, vao, id, color, isshow) {
    const geometry = this.createVAOGeometry(vao);
    return this.showVAOByGeometry(viewer, geometry, id, color, isshow);
  }
  static showVAO_Border(viewer, vao, id, color, isshow) {
    const geometry = this.createVAOGeometryBorder(vao);
    return this.showVAOByGeometry(viewer, geometry, id, color, isshow);
  }
  static showVAO_GroundLine(viewer, vao, id, color, lineWidth, isshow) {
    const geometry = this.createVaoGroundLineGeometry(vao);
    const instance = this.createInstanceByGroundLineGeometry(geometry, id, color, lineWidth);
    if (!color) {
      color = Cesium.Color.fromCssColorString("#ff0000");
      color.alpha = 0.5;
    }
    const appearance = this.createLineAppearance(color);
    const line = new Cesium.GroundPolylinePrimitive({
      geometryInstances: instance,
      appearance,
      compressVertices: true,
      releaseGeometryInstances: true,
      allowPicking: false,
      show: isshow,
      asynchronous: false
    });
    return viewer.scene.primitives.add(line);
  }
  static showVAO_Ground(viewer, vao, id, color, isshow) {
    const geometry = this.createVAOGeometry(vao);
    return this.showVAOByGeometry(viewer, geometry, id, color, isshow);
  }
  static showVAOList(viewer, vaolist, colorList, isshow) {
    const geoList = [];
    let geometry = null;
    const idList = [];
    for (let i = 0; i < vaolist.length; i++) {
      geometry = this.createVAOGeometry(vaolist[i]);
      geoList.push(geometry);
      idList.push(vaolist[i].id);
    }
    return this.showVAOByGeometryList(viewer, geoList, idList, colorList, isshow);
  }
  static showVAOList_Border(viewer, vaolist, colorList, isshow) {
    const geoList = [];
    let geometry = null;
    const idList = [];
    for (let i = 0; i < vaolist.length; i++) {
      geometry = this.createVAOGeometryBorder(vaolist[i]);
      geoList.push(geometry);
      idList.push(vaolist[i].id);
    }
    return this.showVAOByGeometryList(viewer, geoList, idList, colorList, isshow);
  }
  static showVAOGroundLines(viewer, vaolist, colorList, lineWidth, isshow) {
    let color = null;
    if (!color) {
      color = Cesium.Color.fromCssColorString("#ff0000");
      color.alpha = 0.5;
    }
    let geometry = null;
    let instance = null;
    const instances = [];
    for (let i = 0; i < vaolist.length; i++) {
      geometry = this.createVaoGroundLineGeometry(vaolist[i]);
      instance = this.createInstanceByGroundLineGeometry(geometry, vaolist[i].id, color, lineWidth);
      instances.push(instance);
    }
    const appearance = this.createLineAppearance(color);
    const line = new Cesium.GroundPolylinePrimitive({
      geometryInstances: instances,
      appearance,
      compressVertices: true,
      releaseGeometryInstances: true,
      allowPicking: false,
      show: isshow,
      asynchronous: false
    });
    return viewer.scene.primitives.add(line);
  }
  static showVAOByGeometry(viewer, geometry, id, color, isshow) {
    const instance = this.createInstanceByGeometry(geometry, id, color);
    const appearance = this.createAppearance();
    const gTriangles = viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances: [instance],
        appearance,
        compressVertices: true,
        releaseGeometryInstances: true,
        allowPicking: true,
        show: isshow,
        // classificationType: Cesium.ClassificationType.TERRAIN,
        asynchronous: false
        // debugShowBoundingVolume:true,
      })
    );
    return gTriangles;
  }
  static showVAOByGeometryList(viewer, geoList, idList, colorList, isshow) {
    const instances = [];
    let instance = null;
    let color = null;
    for (let i = 0; i < geoList.length; i++) {
      if (colorList) {
        color = colorList[i];
      } else {
        color = null;
      }
      instance = this.createInstanceByGeometry(geoList[i], idList[i], color);
      instances.push(instance);
    }
    const appearance = this.createAppearance();
    const gTriangles = viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances: instances,
        appearance,
        compressVertices: true,
        releaseGeometryInstances: true,
        allowPicking: true,
        show: isshow,
        // classificationType: Cesium.ClassificationType.TERRAIN,
        asynchronous: false
        // debugShowBoundingVolume:true,
      })
    );
    return gTriangles;
  }
  static createAppearance(type) {
    const appearance = new Cesium.PerInstanceColorAppearance({
      flat: true,
      translucent: true
    });
    return appearance;
  }
  static createLineAppearance(color) {
    const appearance = new Cesium.PolylineMaterialAppearance({
      material: Cesium.Material.fromType("Color", {
        color
      })
    });
    return appearance;
  }
  static createWaterAppearance(color, normalImg) {
    const appearance = new Cesium.EllipsoidSurfaceAppearance({
      // aboveGround: false,
      material: new Cesium.Material({
        fabric: {
          type: "Water",
          uniforms: {
            faceForward: true,
            baseWaterColor: color,
            // normalMap: '/Apps/img/waterNormals.jpg',
            normalMap: normalImg,
            frequency: 1e3,
            animationSpeed: 5e-3,
            amplitude: 10,
            specularIntensity: 5
          }
        }
      })
    });
    return appearance;
  }
  static createVAOGeometry(vao) {
    const attr = {};
    if (vao.colors && vao.colors.length > 0) {
      attr.color = new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.UNSIGNED_BYTE,
        componentsPerAttribute: 4,
        normalize: true,
        values: vao.colors
      });
    }
    if (vao.pos && vao.pos.length > 0) {
      attr.position = new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.DOUBLE,
        componentsPerAttribute: 3,
        normalize: false,
        values: vao.pos
      });
    }
    if (vao.st && vao.st.length > 0) {
      attr.st = new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 2,
        normalize: false,
        values: vao.st
      });
    }
    if (vao.normal && vao.normal.length > 0) {
      attr.normal = new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        normalize: false,
        values: vao.normal
      });
    }
    const geometry = new Cesium.Geometry({
      attributes: new Cesium.GeometryAttributes(attr),
      indices: vao.ins,
      primitiveType: Cesium.PrimitiveType.TRIANGLES,
      // perPositionHeight: true,
      // vertexFormat: Cesium.VertexFormat.POSITION_AND_COLOR ,
      boundingSphere: Cesium.BoundingSphere.fromVertices(vao.pos)
    });
    return geometry;
  }
  static createVAOGeometryBorder(vao) {
    const geometry = this.createVAOGeometry(vao);
    return Cesium.GeometryPipeline.toWireframe(geometry);
  }
  static createInstanceByGeometry(geometry, id, color) {
    let instance = null;
    instance = new Cesium.GeometryInstance({
      id: id ? id : "vao_" + this.innum++,
      // geometry: Cesium.GeometryPipeline.toWireframe(geometry),
      // geometry: Cesium.GeometryPipeline.computeNormal(geometry),
      geometry,
      attributes: {
        // color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromRandom({alpha : 0.5})),
        color: color ? Cesium.ColorGeometryInstanceAttribute.fromColor(color) : void 0
        // color: color,
        // color: Cesium.ColorGeometryInstanceAttribute.fromColor(color),
        // show: new Cesium.ShowGeometryInstanceAttribute(true), //显示或者隐藏
      }
    });
    return instance;
  }
  static createVaoGroundLineGeometry(vao) {
    const attr = {};
    if (vao.colors && vao.colors.length > 0) {
      attr.color = new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.UNSIGNED_BYTE,
        componentsPerAttribute: 4,
        normalize: true,
        values: new Uint32Array(vao.colors)
      });
    }
    if (vao.pos && vao.pos.length > 0) {
      attr.position = new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.DOUBLE,
        componentsPerAttribute: 3,
        normalize: false,
        values: new Float64Array(vao.pos)
      });
    }
    if (vao.startHiAndForwardOffsetX && vao.startHiAndForwardOffsetX.length > 0) {
      attr.startHiAndForwardOffsetX = new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 4,
        normalize: true,
        values: new Float32Array(vao.startHiAndForwardOffsetX)
      });
    }
    if (vao.startLoAndForwardOffsetY && vao.startLoAndForwardOffsetY.length > 0) {
      attr.startLoAndForwardOffsetY = new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 4,
        normalize: true,
        values: new Float32Array(vao.startLoAndForwardOffsetY)
      });
    }
    if (vao.startNormalAndForwardOffsetZ && vao.startNormalAndForwardOffsetZ.length > 0) {
      attr.startNormalAndForwardOffsetZ = new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 4,
        normalize: false,
        values: new Float32Array(vao.startNormalAndForwardOffsetZ)
      });
    }
    if (vao.endNormalAndTextureCoordinateNormalizationX && vao.endNormalAndTextureCoordinateNormalizationX.length > 0) {
      attr.endNormalAndTextureCoordinateNormalizationX = new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 4,
        normalize: false,
        values: new Float32Array(vao.endNormalAndTextureCoordinateNormalizationX)
      });
    }
    if (vao.rightNormalAndTextureCoordinateNormalizationY && vao.rightNormalAndTextureCoordinateNormalizationY.length > 0) {
      attr.rightNormalAndTextureCoordinateNormalizationY = new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 4,
        normalize: false,
        values: new Float32Array(vao.rightNormalAndTextureCoordinateNormalizationY)
      });
    }
    if (vao.startHiLo2D && vao.startHiLo2D.length > 0) {
      attr.startHiLo2D = new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 4,
        normalize: false,
        values: new Float32Array(vao.startHiLo2D)
      });
    }
    if (vao.offsetAndRight2D && vao.offsetAndRight2D.length > 0) {
      attr.offsetAndRight2D = new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 4,
        normalize: false,
        values: new Float32Array(vao.offsetAndRight2D)
      });
    }
    if (vao.startEndNormals2D && vao.startEndNormals2D.length > 0) {
      attr.startEndNormals2D = new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 4,
        normalize: false,
        values: new Float32Array(vao.startEndNormals2D)
      });
    }
    if (vao.texcoordNormalization2D && vao.texcoordNormalization2D.length > 0) {
      attr.texcoordNormalization2D = new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 2,
        normalize: false,
        values: new Float32Array(vao.texcoordNormalization2D)
      });
    }
    const geometry = new Cesium.Geometry({
      attributes: attr,
      indices: new Int32Array(vao.ins),
      primitiveType: Cesium.PrimitiveType.TRIANGLES,
      // perPositionHeight: true,
      // vertexFormat: Cesium.VertexFormat.POSITION_AND_COLOR ,
      boundingSphere: Cesium.BoundingSphere.fromVertices(vao.pos)
    });
    return geometry;
  }
  static createInstanceByGroundLineGeometry(geometry, id, color, lineWidth) {
    let instance = null;
    instance = new Cesium.GeometryInstance({
      id: id ? id : "vao_" + this.innum++,
      geometry,
      attributes: {
        color: color ? Cesium.ColorGeometryInstanceAttribute.fromColor(color) : void 0
      }
    });
    instance.attributes.width = {
      componentDatatype: 5121,
      componentsPerAttribute: 1,
      normalize: false,
      value: [lineWidth]
    };
    return instance;
  }
}
__publicField(VaoGraphicHelper, "innum", 0);
class GraphicHelper {
  constructor() {
  }
  static showPolygon(crds, clamp2, pLen, color, gtype) {
    if (!color) {
      color = MapBaseHelper$1.createColor("#0000ff", 0.5);
    }
    let geometry = null;
    if (gtype == 1) {
      geometry = this.createRectangleGeometry(crds, pLen);
    } else {
      geometry = this.createPolygonGeometry(crds, pLen);
    }
    let polygonInstance = new Cesium.GeometryInstance({
      geometry,
      id: "rectangle",
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
      }
    });
    let appearance = null, polygon = null;
    appearance = this.createAppearance_Water();
    clamp2 = this.getClassificationType(clamp2);
    if (clamp2 > -1) {
      polygon = new Cesium.GroundPrimitive({
        geometryInstances: [polygonInstance],
        appearance,
        compressVertices: true,
        releaseGeometryInstances: false,
        allowPicking: true,
        asynchronous: false,
        // classificationType:Cesium.ClassificationType.TERRAIN,
        classificationType: clamp2
        // shadows:Cesium.ShadowMode.ENABLED,
      });
    } else {
      polygon = new Cesium.Primitive({
        geometryInstances: [polygonInstance],
        appearance,
        compressVertices: false,
        releaseGeometryInstances: false,
        allowPicking: true,
        asynchronous: false
        // shadows:Cesium.ShadowMode.ENABLED,
      });
    }
    polygon = this.viewer.scene.primitives.add(polygon);
    return polygon;
  }
  static showPolygon2(crds, pLen, color) {
    let geometry = this.createPolygonGeometry(crds, pLen);
    if (!color) {
      color = MapBaseHelper$1.createColor("#0000ff", 0.5);
    }
    let polygonInstance = new Cesium.GeometryInstance({
      geometry,
      id: "rectangle",
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
      }
    });
    let appearance = null, polygon = null;
    appearance = this.createPerInstanceColorAppearance(true);
    polygon = new Cesium.Primitive({
      geometryInstances: [polygonInstance],
      appearance,
      compressVertices: false,
      releaseGeometryInstances: false,
      allowPicking: true,
      asynchronous: false
      // shadows:Cesium.ShadowMode.ENABLED,
    });
    polygon = this.viewer.scene.primitives.add(polygon);
    return polygon;
  }
  static showPolygon3(geometry, color) {
    if (!color) {
      color = MapBaseHelper$1.createColor("#0000ff", 0.5);
    }
    let polygonInstance = new Cesium.GeometryInstance({
      geometry,
      id: "rectangle",
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
      }
    });
    let appearance = null, polygon = null;
    appearance = this.createPerInstanceColorAppearance(true);
    polygon = new Cesium.Primitive({
      geometryInstances: [polygonInstance],
      appearance,
      compressVertices: false,
      releaseGeometryInstances: false,
      allowPicking: true,
      asynchronous: false
      // shadows:Cesium.ShadowMode.ENABLED,
    });
    polygon = this.viewer.scene.primitives.add(polygon);
    return polygon;
  }
  static crdsToC3s(crds, pLen) {
    let c3s = null;
    if (pLen == 3) {
      c3s = Cesium.Cartesian3.fromDegreesArrayHeights(crds);
    } else {
      c3s = Cesium.Cartesian3.fromDegreesArray(crds);
    }
    return c3s;
  }
  static hasHoles(crds) {
    if (crds && crds.length > 0) {
      if (crds[0] instanceof Array) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  static createPolygonGeometry(crds, pLen, options) {
    let geometry = null;
    if (crds && crds.length > 0) {
      let c3s = null;
      let holes = null;
      if (this.hasHoles(crds)) {
        if (crds.length > 1) {
          holes = [];
          for (let j = 1; j < crds.length; j++) {
            c3s = this.crdsToC3s(crds[j], pLen);
            holes.push(new Cesium.PolygonHierarchy(c3s));
          }
        }
        c3s = this.crdsToC3s(crds[0], pLen);
      } else {
        c3s = this.crdsToC3s(crds, pLen);
      }
      if (!options) {
        options = new PolygonGeometryOptions();
        options.perPositionHeight = true;
      }
      options.polygonHierarchy = new Cesium.PolygonHierarchy(c3s, holes);
      geometry = new Cesium.PolygonGeometry(options);
    }
    return geometry;
  }
  static createPolygonGeometry2(crds, pLen, options) {
    let c3s = this.crdsToC3s(crds, pLen);
    let geometry = null;
    if (c3s) {
      geometry = new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(c3s),
        // extrudedHeight:extrudedHeight,
        // granularity:granularity,
        perPositionHeight: true
        // closeTop:true,
        // closeBottom:true,
        // height:100,
      });
    }
    return geometry;
  }
  static createPolygonGeometrys(crdArr, pLen) {
    let geometrys = null;
    if (crdArr) {
      geometrys = [];
      let geometry = null;
      for (let i = 0; i < crdArr.length; i++) {
        geometry = this.createPolygonGeometry(crdArr[i], pLen);
        geometrys.push(geometry);
      }
    }
    return geometrys;
  }
  static createRectangleGeometry(crds, pLen) {
    let c3s = this.crdsToC3s(crds, pLen);
    let geometry = null;
    if (c3s) {
      geometry = new Cesium.RectangleGeometry({
        ellipsoid: Cesium.Ellipsoid.WGS84,
        rectangle: Cesium.Rectangle.fromCartesianArray(c3s),
        // extrudedHeight:extrudedHeight,
        granularity,
        // perPositionHeight:true,
        // closeTop:true,
        // closeBottom:true,
        height: 1
      });
    }
    return geometry;
  }
  static createGroundLineGeometry(crds, pLen, width) {
    let c3s = this.crdsToC3s(crds, pLen);
    let geometry = null;
    if (c3s) {
      geometry = new Cesium.GroundPolylineGeometry({
        positions: c3s,
        width
        // arcType:Cesium.ArcType.RHUMB,
      });
    }
    return geometry;
  }
  static createLineGeometry(crds, pLen, width) {
    let c3s = this.crdsToC3s(crds, pLen);
    let geometry = null;
    if (c3s) {
      geometry = new Cesium.PolylineGeometry({
        positions: c3s,
        width
        // vertexFormat : Cesium.VertexFormat.ALL
      });
    }
    return geometry;
  }
  static createWallGeometry(crds, pLen, options) {
    let c3s = this.crdsToC3s(crds, pLen);
    let geometry = null;
    if (c3s) {
      if (!options) {
        options = new WallGeometryOptions();
      }
      options.positions = c3s;
      geometry = new Cesium.WallGeometry(options);
    }
    return geometry;
  }
  static createSingleFaceGeometry(crds, pLen) {
    let c3s = this.crdsToC3s(crds, pLen);
    let geometry = null;
    if (c3s) {
      geometry = new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(c3s),
        extrudedHeight: 0,
        // granularity:granularity,
        perPositionHeight: true,
        closeTop: false,
        closeBottom: false
        // height:100,
      });
    }
    return geometry;
  }
  static getClassificationType(v) {
    if (typeof v === "number") {
      return v;
    } else {
      if (v) {
        return 2;
      } else {
        return -1;
      }
    }
  }
  static addPolygons(crdArr, pLen, clamp2, color) {
    let polygons = null;
    if (crdArr && crdArr.length > 0) {
      if (!color) {
        color = MapBaseHelper$1.createColor("#409dfd", 0.7);
      }
      let instances = [], instance = null, geometrys = null, appearance = null;
      geometrys = this.createPolygonGeometrys(crdArr, pLen);
      if (geometrys) {
        for (let i = 0; i < geometrys.length; i++) {
          instance = new Cesium.GeometryInstance({
            geometry: geometrys[i],
            id: "polygon_" + i,
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
            }
          });
          instances.push(instance);
        }
      }
      appearance = this.createPerInstanceColorAppearance(true);
      clamp2 = this.getClassificationType(clamp2);
      if (clamp2 > -1) {
        polygons = new Cesium.GroundPrimitive({
          geometryInstances: instances,
          appearance,
          compressVertices: true,
          releaseGeometryInstances: false,
          vertexCacheOptimize: true,
          allowPicking: true,
          asynchronous: false,
          classificationType: clamp2
          // shadows:Cesium.ShadowMode.ENABLED,
        });
      } else {
        polygons = new Cesium.Primitive({
          geometryInstances: instances,
          appearance,
          vertexCacheOptimize: true,
          compressVertices: false,
          releaseGeometryInstances: false,
          allowPicking: true,
          asynchronous: false
        });
      }
      polygons = this.viewer.scene.primitives.add(polygons);
    }
    return polygons;
  }
  static addPolygons1(crdArr, pLen, clamp2, color) {
    let polygons = null;
    if (crdArr && crdArr.length > 0) {
      if (!color) {
        color = MapBaseHelper$1.createColor("#0000ff", 0.5);
      }
      let instances = [], instance = null, geometrys = null, appearance = null;
      geometrys = this.createPolygonGeometrys(crdArr, pLen);
      if (geometrys) {
        for (let i = 0; i < geometrys.length; i++) {
          instance = new Cesium.GeometryInstance({
            geometry: geometrys[i],
            id: "polygon_" + i,
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
            }
          });
          instances.push(instance);
        }
      }
      appearance = this.createPerInstanceColorAppearance(true);
      clamp2 = this.getClassificationType(clamp2);
      if (clamp2 > -1) {
        polygons = new Cesium.GroundPrimitive({
          geometryInstances: instances,
          appearance,
          compressVertices: true,
          releaseGeometryInstances: false,
          allowPicking: true,
          asynchronous: false,
          classificationType: clamp2
          // shadows:Cesium.ShadowMode.ENABLED,
        });
      } else {
        polygons = new Cesium.Primitive({
          geometryInstances: instances,
          appearance,
          compressVertices: false,
          releaseGeometryInstances: false,
          allowPicking: true,
          asynchronous: false
        });
      }
      polygons = this.viewer.scene.primitives.add(polygons);
    }
    return polygons;
  }
  static addLine(crds, pLen, color, width) {
    if (!color) {
      color = MapBaseHelper$1.createColor("#0000ff", 0.5);
    }
    let geometry = null, instance = null, appearance = null, line = null;
    clamp = this.getClassificationType(clamp);
    if (clamp > -1) {
      geometry = this.createGroundLineGeometry(crds, pLen, width);
    } else {
      geometry = this.createLineGeometry(crds, pLen, width);
    }
    instance = new Cesium.GeometryInstance({
      id: "line1",
      geometry,
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
      }
    });
    appearance = this.createPolylineColorAppearance(true);
    if (clamp > -1) {
      line = new Cesium.GroundPolylinePrimitive({
        geometryInstances: instance,
        appearance,
        compressVertices: true,
        releaseGeometryInstances: true,
        allowPicking: false,
        asynchronous: false,
        classificationType: Cesium.ClassificationType.BOTH
      });
    } else {
      line = new Cesium.Primitive({
        geometryInstances: instance,
        appearance,
        compressVertices: true,
        releaseGeometryInstances: true,
        allowPicking: false,
        asynchronous: false
      });
    }
    line = this.viewer.scene.primitives.add(line);
    return line;
  }
  static addDynamicLines(crdArr, pLen, color, width, clamp2) {
    if (crdArr && crdArr.length > 0) {
      if (!this.polylineCollection) {
        this.polylineCollection = this.viewer.scene.primitives.add(new Cesium.PolylineCollection());
      }
      if (!color) {
        color = MapBaseHelper$1.createColor("#ff0000", 0.9);
      }
      let material = MaterialHelper.createTestMaterial(color);
      MaterialHelper.getMaterials();
      let c3s = null;
      window.c3Arr = [];
      for (let i = 0; i < crdArr.length; i++) {
        c3s = this.crdsToC3s(crdArr[i], pLen);
        if (c3s) {
          if (i < 500) {
            this.polylineCollection.add({
              id: "polyline" + i,
              positions: c3s,
              // material : materials[i%materials.length],
              material,
              width,
              show: true
            });
          } else {
            window.c3Arr.push(c3s);
          }
        }
      }
    }
  }
  static addLines(crdArr, pLen, color, width, clamp2) {
    let line = null;
    if (crdArr && crdArr.length > 0) {
      if (!color) {
        color = MapBaseHelper$1.createColor("#ffffff", 1);
      }
      clamp2 = this.getClassificationType(clamp2);
      let instances = [], instance = null, geometry = null, appearance = null;
      let isShow = true;
      for (let i = 0; i < crdArr.length; i++) {
        if (clamp2 > -1) {
          geometry = this.createGroundLineGeometry(crdArr[i], pLen, width);
        } else {
          geometry = this.createLineGeometry(crdArr[i], pLen, width);
        }
        instance = new Cesium.GeometryInstance({
          id: "line" + i,
          geometry,
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(color),
            show: new Cesium.ShowGeometryInstanceAttribute(isShow)
          }
        });
        instances.push(instance);
      }
      appearance = this.createPolylineColorAppearance(false);
      if (clamp2 > -1) {
        line = new Cesium.GroundPolylinePrimitive({
          geometryInstances: instances,
          appearance,
          compressVertices: true,
          releaseGeometryInstances: false,
          allowPicking: true,
          asynchronous: false,
          classificationType: clamp2
        });
      } else {
        line = new Cesium.Primitive({
          geometryInstances: instances,
          appearance,
          compressVertices: true,
          releaseGeometryInstances: false,
          allowPicking: true,
          asynchronous: false
        });
      }
      line = this.viewer.scene.primitives.add(line);
    }
    return line;
  }
  static addWalls(crdArr, pLen, color) {
    let wall = null;
    if (crdArr && crdArr.length > 0) {
      if (!color) {
        if (this.colorNum == 0) {
          color = MapBaseHelper$1.createColor("#737373", 1);
        } else {
          color = MapBaseHelper$1.createColor("#409dfd", 0.5);
        }
        this.colorNum++;
      }
      let instances = [], instance = null, geometry = null, appearance = null;
      for (let i = 0; i < crdArr.length; i++) {
        geometry = this.createWallGeometry(crdArr[i], pLen);
        instance = new Cesium.GeometryInstance({
          id: "wall" + i,
          geometry,
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
          }
        });
        instances.push(instance);
      }
      appearance = this.createPerInstanceColorAppearance();
      wall = new Cesium.Primitive({
        geometryInstances: instances,
        appearance,
        compressVertices: true,
        releaseGeometryInstances: true,
        allowPicking: false,
        asynchronous: false
      });
      wall = this.viewer.scene.primitives.add(wall);
    }
    return wall;
  }
  static addWalls2(crdArr, pLen, color) {
    let wall = null;
    if (crdArr && crdArr.length > 0) {
      let appearance = null;
      if (!color) {
        if (this.colorNum == 0) {
          color = MapBaseHelper$1.createColor("#737373", 1);
          appearance = this.createPerInstanceColorAppearance(false);
        } else {
          color = MapBaseHelper$1.createColor("#409dfd", 0.5);
          appearance = this.createAppearance_Water("/Apps/img/waterNormals.jpg", color);
        }
        this.colorNum++;
      }
      let instances = [], instance = null, geometry = null;
      for (let i = 0; i < crdArr.length; i++) {
        geometry = this.createSingleFaceGeometry(crdArr[i], pLen);
        instance = new Cesium.GeometryInstance({
          id: "wall" + i,
          geometry,
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
          }
        });
        instances.push(instance);
      }
      wall = new Cesium.Primitive({
        geometryInstances: instances,
        appearance,
        compressVertices: true,
        releaseGeometryInstances: true,
        allowPicking: false,
        asynchronous: false
      });
      wall = this.viewer.scene.primitives.add(wall);
    }
    return wall;
  }
  static createColorAppearance(color, translucent) {
    return new Cesium.MaterialAppearance({
      // aboveGround: false,
      material: new Cesium.Material({
        fabric: {
          type: Cesium.Material.ColorType,
          uniforms: {
            flat: true,
            faceForward: true,
            color
          }
        }
      }),
      translucent
    });
  }
  static createDashPolylineMaterialAppearance(color, translucent) {
    return new Cesium.PolylineMaterialAppearance({
      material: new Cesium.Material({
        fabric: {
          type: Cesium.Material.PolylineDashType,
          uniforms: {
            color,
            // gapColor:Cesium.Color.TRANSPARENT,
            // dashLength:9,
            flat: true,
            faceForward: true
          }
        }
      }),
      translucent
    });
  }
  static createPolylineMaterialAppearance(color, translucent, type) {
    return new Cesium.PolylineMaterialAppearance({
      material: new Cesium.Material({
        fabric: {
          type: Cesium.Material.ColorType,
          uniforms: {
            flat: true,
            faceForward: true,
            color
          }
        }
      }),
      translucent
    });
  }
  static createPolylineColorAppearance(translucent) {
    return new Cesium.PolylineColorAppearance({
      translucent
    });
  }
  static createPolylineMaterialAppearance_Arrow(color, translucent) {
    return new Cesium.PolylineMaterialAppearance({
      material: new Cesium.Material({
        fabric: {
          type: Cesium.Material.PolylineArrowType,
          uniforms: {
            color
          }
        }
      }),
      translucent
    });
  }
  static createImgAppearance(img) {
    return new Cesium.MaterialAppearance({
      // aboveGround: false,
      material: new Cesium.Material({
        fabric: {
          type: Cesium.Material.ImageType,
          uniforms: {
            flat: true,
            faceForward: true,
            image: img,
            repeat: {
              x: 1,
              y: 1
            }
          }
        }
      })
    });
  }
  static createPerInstanceColorAppearance(translucent) {
    return new Cesium.PerInstanceColorAppearance({
      flat: true,
      faceForward: false,
      translucent,
      closed: true
    });
  }
  static createAppearance_Water(normalMap, color) {
    return new Cesium.EllipsoidSurfaceAppearance({
      material: this.createMaterial_Water(normalMap, color)
    });
  }
  static createMaterial_Water(normalMap, color) {
    if (!normalMap) {
      normalMap = "/Apps/img/waterNormals.jpg";
    }
    if (!color) {
      color = MapBaseHelper$1.createColor("#409dfd", 0.5);
    }
    return new Cesium.Material({
      fabric: {
        type: Cesium.Material.WaterType,
        uniforms: {
          flat: true,
          faceForward: true,
          baseWaterColor: color,
          // specularMap: "/Apps/img/earthspec1k.jpg",
          normalMap,
          frequency: 1e3,
          animationSpeed: 5e-3,
          amplitude: 10,
          specularIntensity: 5
        }
      }
    });
  }
  static addPoint(crd, cnum, fillColor, borderColor, t = 1) {
    let h = 0.1;
    if (cnum == 3) {
      h = crd[2];
    }
    let c3 = Cesium.Cartesian3.fromDegrees(crd[0], crd[1], h);
    if (!fillColor) {
      fillColor = MapBaseHelper$1.createColor("#ff0000", t);
    }
    if (!borderColor) {
      borderColor = MapBaseHelper$1.createColor("#0000ff", t);
    }
    if (!this.PointCollection) {
      this.PointCollection = this.viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection({
        allowPicking: false,
        blendOption: Cesium.BlendOption.TRANSLUCENT
      }));
    }
    let point = this.PointCollection.add({
      id: "p_0_0",
      position: c3,
      color: fillColor,
      // 设置颜色和透明度
      pixelSize: 10,
      outlineColor: borderColor,
      outlineWidth: 2,
      allowPicking: false,
      // // clampToGround : true,
      show: true
      // 是否显示
      // disableDepthTestDistance : Number.POSITIVE_INFINITY,
    });
    point.layerid = "point";
  }
  static addPoints(crdArr, cnum, fillColor, borderColor) {
    if (!fillColor) {
      fillColor = MapBaseHelper$1.createColor("#ff0000", 0.5);
    }
    if (!borderColor) {
      borderColor = MapBaseHelper$1.createColor("#0000ff", 0.5);
    }
    if (!this.PointCollection) {
      this.PointCollection = this.viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
    }
    let points = [];
    let num = crdArr.length / cnum;
    let c3 = null;
    let point = null;
    let h = 0.1;
    for (let i = 0; i < num; i++) {
      if (cnum == 3) {
        h = crdArr[i * cnum + 2];
      }
      c3 = Cesium.Cartesian3.fromDegrees(crdArr[i * cnum + 0], crdArr[i * cnum + 1], h);
      point = this.PointCollection.add({
        id: "p_" + i,
        position: c3,
        color: fillColor,
        // 设置颜色和透明度
        pixelSize: 5,
        outlineColor: borderColor,
        outlineWidth: 3,
        // clampToGround : true,
        show: true
        // 是否显示
        // disableDepthTestDistance : Number.POSITIVE_INFINITY,
      });
      points.push(point);
    }
    return points;
  }
  static addBillboard(crd, cnum, img) {
    let h = 0.1;
    if (cnum == 3) {
      h = crd[2];
    }
    if (!this.billboards) {
      this.billboards = this.viewer.scene.primitives.add(new Cesium.BillboardCollection({
        blendOption: Cesium.BlendOption.TRANSLUCENT
      }));
    }
    let color = MapBaseHelper$1.createColor("#ff0000", 1);
    let c3 = Cesium.Cartesian3.fromDegrees(crd[0], crd[1], h);
    let billboard = this.billboards.add({
      position: c3,
      image: img,
      color,
      // with:18,
      // height:18,
      // heightReference:Cesium.HeightReference.CLAMP_TO_GROUND,
      // sizeInMeters:true,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM
      // imageSubRegion:new Cesium.BoundingRectangle(49, 43, 18, 18),
    });
    return billboard;
  }
  static addLabel(crd, cnum, txt) {
    let h = 0.1;
    if (cnum == 3) {
      h = crd[2];
    }
    if (!this.labelCollection) {
      this.labelCollection = this.viewer.scene.primitives.add(new Cesium.LabelCollection({
        blendOption: Cesium.BlendOption.TRANSLUCENT
      }));
    }
    let color = MapBaseHelper$1.createColor("#ff0000", 1);
    let color2 = MapBaseHelper$1.createColor("#000000", 1);
    let color3 = MapBaseHelper$1.createColor("#ffffff", 1);
    let c3 = Cesium.Cartesian3.fromDegrees(crd[0], crd[1], h);
    let label = this.labelCollection.add({
      position: c3,
      text: txt,
      // font:'bold 24pt arial',
      font: "bold 24pt 黑体",
      scale: 0.5,
      // HeightReference:Cesium.HeightReference.CLAMP_TO_GROUND,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: color3,
      outlineColor: color2,
      outlineWidth: 1,
      showBackground: false,
      backgroundColor: color,
      backgroundPadding: new Cesium.Cartesian2(3, 3),
      // pixelOffset:new Cesium.Cartesian2(10, 10),
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM
    });
    return label;
  }
  static showMatrixPrimitive(m4, length, width) {
    let op = {};
    if (m4) {
      op.modelMatrix = m4;
    }
    if (length && length > 0) {
      op.length = length;
    }
    if (width && width > 0) {
      op.width = width;
    }
    let cs_primitive = this.viewer.scene.primitives.add(new Cesium.DebugModelMatrixPrimitive(op));
    return cs_primitive;
  }
  // static createColor(cssColor,opacity){
  //   if(!cssColor){
  //     cssColor="#ff0000";
  //   }
  //   if(!(typeof opacity === 'number')){
  //     opacity=1;
  //   }
  //   let color = Cesium.Color.fromCssColorString(cssColor);
  //   color.alpha = opacity;
  //   return color;
  // }
}
__publicField(GraphicHelper, "viewer", null);
//地图对象
__publicField(GraphicHelper, "numid", 0);
__publicField(GraphicHelper, "labelCollection", null);
__publicField(GraphicHelper, "billboards", null);
__publicField(GraphicHelper, "polylineCollection", null);
__publicField(GraphicHelper, "PointCollection", null);
__publicField(GraphicHelper, "colorNum", 0);
class PolygonGeometryOptions {
  constructor() {
    __publicField(this, "polygonHierarchy", null);
    __publicField(this, "height");
    __publicField(this, "extrudedHeight");
    // granularity=granularity;
    __publicField(this, "perPositionHeight", false);
    __publicField(this, "closeTop", true);
    __publicField(this, "closeBottom", true);
  }
}
class WallGeometryOptions {
  constructor() {
    __publicField(this, "positions", null);
    __publicField(this, "maximumHeights");
    __publicField(this, "minimumHeights");
  }
  // granularity=granularity;
}
const EARTH_RADIUS = 6378137;
const _PosUtil = class _PosUtil {
  static posNoHeightTransform(positions) {
    return positions.map((it) => [it[0], it[1]]);
  }
  static posHeightTransform(positions) {
    return positions.map((it) => [it[0], it[1], it[2] || 1]);
  }
  static Cartesian3ToCartographic(c) {
    return Cesium.Cartographic.fromCartesian(c);
  }
  static CartographicToCartesian3(c) {
    return Cesium.Cartesian3.fromRadians(c.longitude, c.latitude, c.height);
  }
  static CartographicToWGS84(c) {
    return [
      Cesium.Math.toDegrees(c.longitude),
      Cesium.Math.toDegrees(c.latitude),
      c.height
    ];
  }
  static Cartesian3ToWGS84(c) {
    const c1 = this.Cartesian3ToCartographic(c);
    return this.CartographicToWGS84(c1);
  }
  static WGS84ToCartesian3(c) {
    return Cesium.Cartesian3.fromDegrees(c[0], c[1], c[2]);
  }
  static WGS84ToCartographic(c) {
    return Cesium.Cartographic.fromDegrees(c[0], c[1], c[2]);
  }
  static Cartesian2ToCartesian3(c) {
    let cartesian = this.pickTilePos(c);
    if (Cesium.defined(cartesian)) {
      return cartesian;
    } else {
      const ray = this.viewer.camera.getPickRay(c);
      if (ray) {
        cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
        if (Cesium.defined(cartesian)) {
          return cartesian;
        }
      }
    }
  }
  static Cartesian2ToWGS84(c) {
    const cartesian = this.Cartesian2ToCartesian3(c);
    if (Cesium.defined(cartesian)) {
      return this.Cartesian3ToWGS84(cartesian);
    }
  }
  static picPoskModelHeight(c) {
    return new Promise((resolve) => {
      this.viewer.scene.clampToHeightMostDetailed([this.CartographicToCartesian3(c)]).then((pos) => {
        if (pos == null ? void 0 : pos.length) {
          const cc = this.Cartesian3ToCartographic(pos[0]);
          resolve(cc.height);
        } else {
          resolve(0);
        }
      });
    });
  }
  static pickPosHeight(c) {
    if (this.viewer.scene.sampleHeightSupported) {
      return this.viewer.scene.sampleHeight(c);
    }
  }
  static pickPosTerrainHeight(c) {
    return new Promise((resolve) => {
      Cesium.sampleTerrainMostDetailed(this.terrainProvider, [
        new Cesium.Cartographic(c.longitude, c.latitude)
      ]).then((pos) => {
        if (pos == null ? void 0 : pos.length) {
          resolve(pos[0].height);
        } else {
          resolve(0);
        }
      });
    });
  }
  static pickTilePosWGS84(c) {
    const pos = this.pickTilePos(c);
    if (Cesium.defined(pos)) {
      return this.Cartesian3ToWGS84(pos);
    }
  }
  static pickTerrainPosWGS84(c) {
    const pos = this.pickTerrainPos(c);
    if (Cesium.defined(pos)) {
      return this.Cartesian3ToWGS84(pos);
    }
  }
  static is2D() {
    return this.viewer.scene.mode === Cesium.SceneMode.SCENE2D;
  }
  static getViewBoundary() {
    const rect = this.viewer.camera.computeViewRectangle();
    return {
      left: Cesium.Math.toDegrees(rect.east),
      right: Cesium.Math.toDegrees(rect.west),
      bottom: Cesium.Math.toDegrees(rect.south),
      top: Cesium.Math.toDegrees(rect.north)
    };
  }
  static pickPos2D3D(c) {
    if (this.is2D()) {
      let cartesian;
      const ray = this.viewer.camera.getPickRay(c);
      if (ray) {
        cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
        if (Cesium.defined(cartesian)) {
          return cartesian;
        }
      }
    } else {
      let cartesian;
      try {
        if (this.viewer.scene.pick(c)) {
          cartesian = this.viewer.scene.pickPosition(c);
          if (Cesium.defined(cartesian)) {
            return cartesian;
          }
        }
      } catch (error) {
      }
      const ray = this.viewer.camera.getPickRay(c);
      if (ray) {
        cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
        if (Cesium.defined(cartesian)) {
          return cartesian;
        }
      }
    }
  }
  static pickPos2D3DWGS84(c) {
    const cartesian = this.pickPos2D3D(c);
    if (Cesium.defined(cartesian)) {
      return this.Cartesian3ToWGS84(cartesian);
    }
  }
  static pickTilePos(c) {
    try {
      if (this.viewer.scene.pick(c)) {
        const cartesian = this.viewer.scene.pickPosition(c);
        if (Cesium.defined(cartesian)) {
          return cartesian;
        }
      }
    } catch (error) {
    }
  }
  static pickTerrainPos(c) {
    let cartesian;
    const ray = this.viewer.camera.getPickRay(c);
    if (ray) {
      cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
      if (Cesium.defined(cartesian)) {
        return cartesian;
      }
    }
    cartesian = this.viewer.scene.camera.pickEllipsoid(
      c,
      this.viewer.scene.globe.ellipsoid
    );
    if (Cesium.defined(cartesian)) {
      return cartesian;
    }
  }
  static pickPos(c) {
    const pos = this.pixelToCoordinates(c.x, c.y);
    if (pos) {
      return Cesium.Cartesian3.fromDegrees(...pos);
    }
  }
  static getMapCenter() {
    try {
      let flag2 = this.viewer && this.viewer.canvas ? false : true;
      if (!this.viewer || flag2) return;
      const center = this.pickPos2D3DWGS84(
        new Cesium.Cartesian2(
          this.viewer.canvas.width * 0.5,
          this.viewer.canvas.height * 0.5
        )
      );
      if (center && Cesium.defined(center)) {
        center[2] = this.viewer.camera.positionCartographic.height;
        this.beforeCenter = center;
        return center;
      } else if (this.beforeCenter) {
        return this.beforeCenter;
      }
    } catch (error) {
    }
  }
  static pickPosWGS84(c) {
    const pos = this.pickPos(c);
    if (Cesium.defined(pos)) {
      return this.Cartesian3ToWGS84(pos);
    }
  }
  //获取空间距离
  static getSpaceDistance(c1, c2) {
    return Cesium.Cartesian3.distance(
      Cesium.Cartesian3.fromRadians(c1.longitude, c1.latitude, c1.height),
      Cesium.Cartesian3.fromRadians(c2.longitude, c2.latitude, c2.height)
    );
  }
  // 地球表面距离计算
  static getEarthDistance(c1, c2) {
    const lat1 = c1.latitude;
    const lat2 = c2.latitude;
    const lng1 = c1.longitude;
    const lng2 = c2.longitude;
    const a = lat1 - lat2;
    const b = lng1 - lng2;
    let s = 2 * Math.asin(
      Math.sqrt(
        Math.pow(Math.sin(a / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(b / 2), 2)
      )
    );
    s = s * EARTH_RADIUS;
    return s;
  }
  //距离单位米，距离转纬度
  static distanceToLat(d) {
    return Number((d * 1e-5).toFixed(6));
  }
  //距离单位米，距离转经度
  static distanceToLng(d) {
    return Number((d / 1.1132 * 1e-5).toFixed(6));
  }
};
__publicField(_PosUtil, "viewer", null);
__publicField(_PosUtil, "terrainProvider");
__publicField(_PosUtil, "beforeCenter");
__publicField(_PosUtil, "pixelToCoordinates", (px, py) => {
  var _a2, _b2, _c, _d, _e, _f;
  let c3 = null;
  if (_PosUtil.viewer.scene.pickPositionSupported && Cesium.defined(_PosUtil.viewer.scene.pick({ x: px, y: py }))) {
    c3 = (_a2 = _PosUtil.viewer.scene) == null ? void 0 : _a2.pickPosition({ x: px, y: py });
  } else {
    if ((_b2 = _PosUtil.viewer.camera) == null ? void 0 : _b2.getPickRay({ x: px, y: py })) {
      c3 = (_f = (_d = (_c = _PosUtil.viewer) == null ? void 0 : _c.scene) == null ? void 0 : _d.globe) == null ? void 0 : _f.pick(
        (_e = _PosUtil.viewer.camera) == null ? void 0 : _e.getPickRay({ x: px, y: py }),
        _PosUtil.viewer.scene
      );
    }
  }
  if (Cesium.defined(c3)) {
    const cartographic = Cesium.Cartographic.fromCartesian(c3);
    return [
      Cesium.Math.toDegrees(cartographic.longitude),
      Cesium.Math.toDegrees(cartographic.latitude),
      cartographic.height
    ];
  }
  return null;
});
let PosUtil = _PosUtil;
class CustomLinePrimitive {
  constructor(options) {
    __publicField(this, "_primitive");
    //Cesium.PrimitiveCollection | undefined = undefined;
    __publicField(this, "_linePrimitive");
    // | Cesium.Primitive
    // | Cesium.GroundPolylinePrimitive
    // | undefined = undefined;
    __publicField(this, "_pointPrimitive");
    //Cesium.PointPrimitiveCollection | undefined =
    //    undefined;
    __publicField(this, "id");
    __publicField(this, "_positions", []);
    __publicField(this, "positions");
    __publicField(this, "color");
    __publicField(this, "_color", Cesium.Color.RED);
    __publicField(this, "width");
    __publicField(this, "isGround");
    __publicField(this, "isDashed");
    __publicField(this, "dashLength");
    __publicField(this, "_isGround", false);
    __publicField(this, "isHeight", false);
    __publicField(this, "_isHeight", false);
    __publicField(this, "isTerrain", false);
    __publicField(this, "_isTerrain", false);
    __publicField(this, "isPoint");
    __publicField(this, "pointSize", 10);
    __publicField(this, "pointColor", Cesium.Color.WHITE);
    __publicField(this, "pointOutline");
    __publicField(this, "pointOutlineColor", Cesium.Color.RED);
    __publicField(this, "pointOutlineWidth");
    this.id = options.id || (Math.random() * 9999).toFixed(0);
    this.positions = options.positions;
    this.width = options.width || 3;
    this.color = options.color;
    this.isGround = options.isGround;
    this.isDashed = options.isDashed;
    this.dashLength = options.dashLength || 20;
    this.isPoint = options.isPoint || false;
    this.pointSize = options.pointSize || 10;
    this.pointColor = options.pointColor || Cesium.Color.WHITE;
    this.pointOutlineColor = options.pointOutlineColor || Cesium.Color.RED;
    this.pointOutline = options.pointOutline || false;
    this.pointOutlineWidth = options.pointOutlineWidth || 3;
    this.isTerrain = options.isTerrain || false;
    if (this.isGround) {
      this.isHeight = false;
    } else {
      this.isHeight = options.isHeight || false;
    }
  }
  getMaterial() {
    if (this.isDashed) {
      return Cesium.Material.fromType("PolylineDash", {
        color: this.color,
        gapColor: Cesium.Color.TRANSPARENT,
        dashLength: this.dashLength
      });
    } else {
      return Cesium.Material.fromType("Color", {
        color: this.color
      });
    }
  }
  getPointPrimitive() {
    const points = [];
    const pointStyle = {
      // show: false,
      pixelSize: this.pointSize,
      color: this.pointColor,
      outlineColor: this.pointOutline ? this.pointOutlineColor : void 0,
      outlineWidth: this.pointOutline ? this.pointOutlineWidth : 0,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      pickable: false
    };
    const baseHeight = 0;
    if (this.isGround) {
      if (this.isTerrain) {
        this.positions.forEach((it) => {
          points.push({
            position: Cesium.Cartesian3.fromDegrees(
              it[0],
              it[1],
              it[2] ? it[2] + baseHeight : baseHeight
            ),
            ...pointStyle
          });
        });
      } else {
        this.positions.forEach((it) => {
          points.push({
            position: Cesium.Cartesian3.fromDegrees(it[0], it[1], it[2]),
            ...pointStyle
          });
        });
      }
    } else {
      if (this.isHeight) {
        this.positions.forEach((it) => {
          points.push({
            position: Cesium.Cartesian3.fromDegrees(
              it[0],
              it[1],
              it[2] ? it[2] + baseHeight : baseHeight
            ),
            ...pointStyle
          });
        });
      } else {
        this.positions.forEach((it) => {
          points.push({
            position: Cesium.Cartesian3.fromDegrees(it[0], it[1], baseHeight),
            ...pointStyle
          });
        });
      }
    }
    return points;
  }
  getCenter() {
    const arr = PosUtil.posHeightTransform(this.positions);
    let lat = 0, lng = 0, h = 0;
    let distance2 = 0;
    arr.forEach((it, idx) => {
      lng += it[0];
      lat += it[1];
      const nx = arr[(idx + 1) % arr.length];
      distance2 = PosUtil.getEarthDistance(
        Cesium.Cartographic.fromDegrees(it[0], it[1], it[2]),
        Cesium.Cartographic.fromDegrees(nx[0], nx[1], nx[2])
      );
      h = Math.max(h, it[2], distance2);
    });
    return [lng / arr.length, lat / arr.length, h];
  }
  getGeometry() {
    if (this.isGround) {
      return new Cesium.GroundPolylineGeometry({
        positions: Cesium.Cartesian3.fromDegreesArray(
          PosUtil.posNoHeightTransform(this.positions).flat(1)
        ),
        width: this.width
      });
    } else {
      return new Cesium.PolylineGeometry({
        positions: this.isHeight ? Cesium.Cartesian3.fromDegreesArrayHeights(
          PosUtil.posHeightTransform(this.positions).flat(1)
        ) : Cesium.Cartesian3.fromDegreesArray(
          PosUtil.posNoHeightTransform(this.positions).flat(1)
        ),
        width: this.width
      });
    }
  }
  getPrimitive() {
    const geometry = this.getGeometry();
    if (this.isGround) {
      return new Cesium.GroundPolylinePrimitive({
        geometryInstances: new Cesium.GeometryInstance({
          id: this.id + "geometryInstance",
          geometry
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
          translucent: true,
          material: this.getMaterial()
        }),
        asynchronous: false
      });
    } else {
      return new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          id: this.id + "geometryInstance",
          geometry
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
          translucent: true,
          material: this.getMaterial()
        }),
        asynchronous: false
      });
    }
  }
  update(frameState) {
    if (JSON.stringify(this.positions) === JSON.stringify(this._positions) && this.isGround === this._isGround && this.isHeight === this._isHeight && this._isTerrain === this.isTerrain && this.color === this._color) {
      if (this._primitive) {
        this._primitive.update(frameState);
      }
      return;
    }
    this._positions = [...this.positions];
    this._isGround = this.isGround;
    this._isHeight = this.isHeight;
    this._isTerrain = this.isTerrain;
    this._color = Cesium.Color.clone(this.color);
    if (!this._primitive) {
      this._primitive = new Cesium.PrimitiveCollection();
    }
    if (this.isPoint) {
      this._pointPrimitive && this._pointPrimitive.removeAll();
      if (!this._pointPrimitive) {
        this._pointPrimitive = new Cesium.PointPrimitiveCollection();
      }
      const points = this.getPointPrimitive();
      points.forEach((it) => {
        this._pointPrimitive.add(it);
      });
    }
    this._linePrimitive && this._primitive && this._primitive.remove(this._linePrimitive);
    this._linePrimitive = this.getPrimitive();
    if (this._linePrimitive && !this._primitive.contains(this._linePrimitive)) {
      this._primitive.add(this._linePrimitive);
    }
    if (this.isPoint && this._pointPrimitive && !this._primitive.contains(this._pointPrimitive)) {
      this._primitive.add(this._pointPrimitive);
    }
    if (!this._primitive) return;
    this._primitive.update(frameState);
  }
  isDestroyed() {
    return false;
  }
  destroy() {
    this._primitive && this._primitive.removeAll();
    this._primitive = this._primitive && this._primitive.destroy();
    return Cesium.destroyObject(this);
  }
}
class CustomPolygonPrimitive {
  constructor(options) {
    __publicField(this, "_polygonPrimitive");
    __publicField(this, "_primitive");
    __publicField(this, "_linePrimitive");
    __publicField(this, "_pointPrimitive");
    __publicField(this, "id");
    __publicField(this, "positions");
    __publicField(this, "_positions", []);
    __publicField(this, "color", Cesium.Color.RED);
    __publicField(this, "_color", Cesium.Color.RED);
    __publicField(this, "outline");
    __publicField(this, "outlineColor", Cesium.Color.RED);
    __publicField(this, "_outlineColor", Cesium.Color.RED);
    __publicField(this, "outlineWidth");
    __publicField(this, "isGround");
    __publicField(this, "_isGround", false);
    __publicField(this, "isHeight", false);
    __publicField(this, "_isHeight", false);
    __publicField(this, "isTerrain", false);
    __publicField(this, "_isTerrain", false);
    __publicField(this, "isPoint");
    __publicField(this, "pointSize", 10);
    __publicField(this, "pointColor", Cesium.Color.WHITE);
    __publicField(this, "pointOutline");
    __publicField(this, "pointOutlineColor", Cesium.Color.RED);
    __publicField(this, "pointOutlineWidth");
    this.id = options.id || (Math.random() * 9999).toFixed(0);
    this.positions = options.positions;
    this.color = options.color || Cesium.Color.RED;
    this.isGround = options.isGround || false;
    this.outline = options.outline || false;
    this.outlineColor = options.outlineColor || Cesium.Color.RED;
    this.outlineWidth = options.outlineWidth || 3;
    this.isPoint = options.isPoint || false;
    this.pointSize = options.pointSize || 10;
    this.pointColor = options.pointColor || Cesium.Color.WHITE;
    this.pointOutlineColor = options.pointOutlineColor || Cesium.Color.RED;
    this.pointOutline = options.pointOutline || false;
    this.pointOutlineWidth = options.pointOutlineWidth || 3;
    this.isTerrain = options.isTerrain || false;
    if (this.isGround) {
      this.isHeight = false;
    } else {
      this.isHeight = options.isHeight || false;
    }
  }
  getGeometry() {
    if (this.isGround) {
      return new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(
          Cesium.Cartesian3.fromDegreesArray(PosUtil.posNoHeightTransform(this.positions).flat(1))
        )
      });
    } else {
      return new Cesium.PolygonGeometry({
        perPositionHeight: this.isHeight,
        polygonHierarchy: new Cesium.PolygonHierarchy(
          this.isHeight ? Cesium.Cartesian3.fromDegreesArrayHeights(
            PosUtil.posHeightTransform(this.positions).flat(1)
          ) : Cesium.Cartesian3.fromDegreesArray(
            PosUtil.posNoHeightTransform(this.positions).flat(1)
          )
        )
      });
    }
  }
  getLineGeometry() {
    if (this.isGround) {
      return new Cesium.GroundPolylineGeometry({
        positions: Cesium.Cartesian3.fromDegreesArray(
          PosUtil.posNoHeightTransform([...this.positions, this.positions[0]]).flat(1)
        ),
        width: this.outlineWidth
      });
    } else {
      return new Cesium.PolylineGeometry({
        positions: this.isHeight ? Cesium.Cartesian3.fromDegreesArrayHeights(
          PosUtil.posHeightTransform([...this.positions, this.positions[0]]).flat(1)
        ) : Cesium.Cartesian3.fromDegreesArray(
          PosUtil.posNoHeightTransform([...this.positions, this.positions[0]]).flat(1)
        ),
        width: this.outlineWidth
      });
    }
  }
  getLinePrimitive() {
    const g = this.getLineGeometry();
    if (this.isGround) {
      return new Cesium.GroundPolylinePrimitive({
        geometryInstances: new Cesium.GeometryInstance({
          id: this.id + "linegeometryInstance",
          geometry: g
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
          translucent: true,
          material: Cesium.Material.fromType("Color", {
            color: this.outlineColor
          })
        }),
        asynchronous: false
      });
    } else {
      return new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          id: this.id + "linegeometryInstance",
          geometry: g
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
          translucent: true,
          material: Cesium.Material.fromType("Color", {
            color: this.outlineColor
          })
        }),
        asynchronous: false
      });
    }
  }
  getPointPrimitive() {
    const points = [];
    const pointStyle = {
      pixelSize: this.pointSize,
      color: this.pointColor,
      outlineColor: this.pointOutline ? this.pointOutlineColor : void 0,
      outlineWidth: this.pointOutline ? this.pointOutlineWidth : 0,
      disableDepthTestDistance: Number.POSITIVE_INFINITY
    };
    const baseHeight = 0;
    if (this.isGround) {
      if (this.isTerrain) {
        this.positions.forEach((it) => {
          points.push({
            position: Cesium.Cartesian3.fromDegrees(it[0], it[1], it[2] || baseHeight),
            ...pointStyle
          });
        });
      } else {
        this.positions.forEach((it) => {
          points.push({
            position: Cesium.Cartesian3.fromDegrees(it[0], it[1], it[2]),
            ...pointStyle
          });
        });
      }
    } else {
      if (this.isHeight) {
        this.positions.forEach((it) => {
          points.push({
            position: Cesium.Cartesian3.fromDegrees(it[0], it[1], it[2] || baseHeight),
            ...pointStyle
          });
        });
      } else {
        this.positions.forEach((it) => {
          points.push({
            position: Cesium.Cartesian3.fromDegrees(it[0], it[1], baseHeight),
            ...pointStyle
          });
        });
      }
    }
    return points;
  }
  getCenter() {
    const arr = PosUtil.posHeightTransform(this.positions);
    let lat = 0, lng = 0, h = 0;
    let distance2 = 0;
    arr.forEach((it, idx) => {
      lng += it[0];
      lat += it[1];
      const nx = arr[(idx + 1) % arr.length];
      distance2 = PosUtil.getEarthDistance(
        Cesium.Cartographic.fromDegrees(it[0], it[1], it[2]),
        Cesium.Cartographic.fromDegrees(nx[0], nx[1], nx[2])
      );
      h = Math.max(h, it[2], distance2);
    });
    return [lng / arr.length, lat / arr.length, h * 2.5];
  }
  getPrimitive() {
    const geometries = this.getGeometry();
    if (this.isGround) {
      return new Cesium.GroundPrimitive({
        geometryInstances: new Cesium.GeometryInstance({
          id: this.id + "geometryInstance",
          geometry: geometries
        }),
        appearance: new Cesium.MaterialAppearance({
          faceForward: false,
          translucent: true,
          material: Cesium.Material.fromType("Color", {
            color: this.color
          })
        }),
        asynchronous: false
      });
    } else {
      return new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          id: this.id + "geometryInstance",
          geometry: geometries
        }),
        appearance: new Cesium.MaterialAppearance({
          faceForward: false,
          translucent: true,
          material: Cesium.Material.fromType("Color", {
            color: this.color
          })
        }),
        asynchronous: false
      });
    }
  }
  update(frameState) {
    if (this._primitive && JSON.stringify(this.positions) == JSON.stringify(this._positions) && this.isGround === this._isGround && this.isHeight === this._isHeight && this._isTerrain === this.isTerrain && this.color === this._color && this._outlineColor === this.outlineColor) {
      this._primitive.update(frameState);
      return;
    }
    this._positions = [...this.positions];
    this._isTerrain = this.isTerrain;
    this._isGround = this.isGround;
    this._isHeight = this.isHeight;
    this._color = Cesium.Color.clone(this.color);
    this._outlineColor = Cesium.Color.clone(this.outlineColor);
    if (!this._primitive) {
      this._primitive = new Cesium.PrimitiveCollection();
    }
    if (this.outline) {
      this._linePrimitive && this._primitive && this._primitive.remove(this._linePrimitive);
      if (this.positions.length >= 2) {
        this._linePrimitive = this.getLinePrimitive();
      }
    }
    this._polygonPrimitive && this._primitive && this._primitive.remove(this._polygonPrimitive);
    if (this.positions.length >= 2) {
      this._polygonPrimitive = this.getPrimitive();
    }
    if (this._polygonPrimitive && !this._primitive.contains(this._polygonPrimitive)) {
      this._primitive.add(this._polygonPrimitive);
    }
    if (this.outline && this._linePrimitive && !this._primitive.contains(this._linePrimitive)) {
      this._primitive.add(this._linePrimitive);
    }
    if (this.isPoint && this._pointPrimitive && !this._primitive.contains(this._pointPrimitive)) {
      this._primitive.add(this._pointPrimitive);
    }
    if (this._primitive) {
      this._primitive.update(frameState);
    }
  }
  isDestroyed() {
    return false;
  }
  destroy() {
    this._primitive && this._primitive.removeAll();
    this._primitive = this._primitive && this._primitive.destroy();
    return Cesium.destroyObject(this);
  }
}
class DynamicPrimitive {
  //初始化管理类
  static init(v, isTerrain) {
    this.viewer = v;
    this.viewer.scene.primitives.add(this.group);
    this.isTerrain = isTerrain || false;
  }
  static addPolygon(set) {
    const p = new CustomPolygonPrimitive({
      ...set,
      isTerrain: this.isTerrain
    });
    this.viewer.scene.primitives.add(p);
    this.polygons.set(set.id, p);
    return p;
  }
  static updatePolygonPos(id, pos) {
    const p = this.polygons.get(id);
    if (p) {
      p.positions = pos;
    }
  }
  static addPolyline(set) {
    const line = new CustomLinePrimitive({
      ...set,
      isTerrain: this.isTerrain
    });
    this.viewer.scene.primitives.add(line);
    this.lines.set(set.id, line);
    return line;
  }
  static updatePolylinePos(id, pos) {
    const line = this.lines.get(id);
    if (line) {
      line.positions = pos;
    }
  }
  static removePolyline(id) {
    const line = this.lines.get(id);
    if (line) {
      this.viewer.scene.primitives.remove(line);
      line.destroy();
    }
    this.lines.delete(id);
  }
  static removePolygon(id) {
    const p = this.polygons.get(id);
    if (p) {
      this.viewer.scene.primitives.remove(p);
      p.destroy();
    }
    this.polygons.delete(id);
  }
  static updateTerrain(isTerrain) {
    this.isTerrain = isTerrain;
    this.lines.forEach((line) => {
      if (line.isGround) line.isTerrain = isTerrain;
    });
    this.polygons.forEach((polygon) => {
      if (polygon.isGround) polygon.isTerrain = isTerrain;
    });
  }
  static getLine(id) {
    return this.lines.get(id);
  }
  static getPolygon(id) {
    return this.polygons.get(id);
  }
}
__publicField(DynamicPrimitive, "viewer");
//折线集合
__publicField(DynamicPrimitive, "lines", /* @__PURE__ */ new Map());
//多边形集合
__publicField(DynamicPrimitive, "polygons", /* @__PURE__ */ new Map());
//Primitive集合用于收集自定义Primitive
__publicField(DynamicPrimitive, "group", new Cesium.PrimitiveCollection());
//是否开启山形
__publicField(DynamicPrimitive, "isTerrain");
function DynamicWallMaterialProperty(options) {
  const color = Cesium.Color.fromCssColorString(options.color);
  color.alpha = options.alpha;
  this._definitionChanged = new Cesium.Event();
  this._color = void 0;
  this._colorSubscription = void 0;
  this.color = color;
  this.duration = options.duration;
  this.trailImage = options.trailImage;
  this.viewer = options.viewer;
  this._time = (/* @__PURE__ */ new Date()).getTime();
}
Object.defineProperties(DynamicWallMaterialProperty.prototype, {
  isConstant: {
    get: function() {
      return false;
    }
  },
  definitionChanged: {
    get: function() {
      return this._definitionChanged;
    }
  },
  color: Cesium.createPropertyDescriptor("color")
});
DynamicWallMaterialProperty.prototype.getType = function(time) {
  return "DynamicWall";
};
DynamicWallMaterialProperty.prototype.getValue = function(time, result) {
  if (!Cesium.defined(result)) {
    result = {};
  }
  result.color = Cesium.Property.getValueOrClonedDefault(
    this._color,
    time,
    Cesium.Color.WHITE,
    result.color
  );
  if (this.trailImage) {
    result.image = this.trailImage;
  } else {
    result.image = Cesium.Material.DynamicWallImage;
  }
  if (this.duration) {
    result.time = ((/* @__PURE__ */ new Date()).getTime() - this._time) % this.duration / this.duration;
  }
  this.viewer.scene.requestRender();
  return result;
};
DynamicWallMaterialProperty.prototype.equals = function(other) {
  return this === other || other instanceof DynamicWallMaterialProperty && Cesium.Property.equals(this._color, other._color);
};
function initWallMaterial() {
  Cesium.DynamicWallMaterialProperty = DynamicWallMaterialProperty;
  Cesium.Material.DynamicWallType = "DynamicWall";
  Cesium.Material.DynamicWallImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAAgCAYAAABkS8DlAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAADSSURBVHja7NYxEoUgDEDBYM39z2qHtZViwMFxt1FJnF/98ZXWWkRE7LWWOOt5Lsm9q/vsbu9Zdtazs/J19O5bs1XPZrwze/6V31zxbOZs1n905Wt2p3f25GzE7ohv6q3nLQCA3xEAACAAAAABAAAIAABAAAAAAgAAEAAAgAAAAAQAACAAAAABAAAIAABAAAAAAgAAEAAAgAAAAAQAACAAAEAAAAACAAAQAACAAAAABAAAIAAAAAEAAAgAAEAAAAACAAAQAACAAAAA8g4AAAD//wMA4WEFTJOT5UIAAAAASUVORK5CYII=";
  Cesium.Material.DynamicWallSource = "czm_material czm_getMaterial(czm_materialInput materialInput)\n    {\n      czm_material material = czm_getDefaultMaterial(materialInput);\n      vec2 st = materialInput.st;\n      vec4 colorImage = texture(image, vec2(fract(st.t - time), st.t));\n      vec4 fragColor;\n      fragColor.rgb = color.rgb / 1.0;\n      fragColor = czm_gammaCorrect(fragColor);\n      material.alpha = colorImage.a * color.a;\n      material.diffuse = color.rgb;\n      material.emission = fragColor.rgb;\n      return material;\n    }";
  Cesium.Material._materialCache.addMaterial(Cesium.Material.DynamicWallType, {
    fabric: {
      type: Cesium.Material.DynamicWallType,
      uniforms: {
        color: new Cesium.Color(1, 1, 1, 1),
        image: Cesium.Material.DynamicWallImage,
        time: 0
      },
      source: Cesium.Material.DynamicWallSource
    },
    translucent: function(material) {
      return true;
    }
  });
}
class LCCModelHelper {
  static addLccModel(viewer, opt) {
    let lccObj = null;
    if (viewer && opt) {
      if (!opt.camera) {
        opt.camera = viewer.camera;
      }
      if (!opt.scene) {
        opt.scene = viewer.scene;
      }
      if (!opt.canvas) {
        opt.canvas = viewer.scene.canvas;
      }
      if (!opt.renderLib) {
        opt.renderLib = Cesium;
      }
      if (opt.dataPath) {
        lccObj = LCCRender.load(
          opt,
          opt.successCallback,
          opt.loadingCallback,
          opt.failureCallback
        );
      }
    }
    return lccObj;
  }
  static destroyLccObject(lccObj) {
    LCCRender.unload(lccObj);
  }
  static destroyAll() {
    LCCRender.dispose();
  }
}
class LccLoadOption {
  constructor() {
    __publicField(this, "camera", null);
    //必填项，相机
    __publicField(this, "scene", null);
    //必填项，场景
    __publicField(this, "renderLib", Cesium);
    __publicField(this, "dataPath", "");
    //lcc文件地址url
    __publicField(this, "canvas", null);
    //必填项，画布
    __publicField(this, "modelMatrix", null);
    //变换矩阵,如果有真实坐标，则无效
    __publicField(this, "useEnv", false);
    //是否显示环境数据
    __publicField(this, "useIndexDB", true);
    //初始化场景时设置是否开启本地数据缓存
    __publicField(this, "useLoadingEffect", false);
    //初始化场景时设置是否开加载特效
    __publicField(this, "loadingEffectCenter", false);
    //初始化场景时设置加载特效的中心位置
    __publicField(this, "gpuAcceleration", true);
    //初始化场景时设置是否开启gpu硬件加速
    __publicField(this, "appKey", "");
    //左下角默认会出现水印, 添加对应的appKey可以去除水印
    __publicField(this, "successCallback", null);
    //模型加载完成回调函数，参数是模型构建完成的Mesh
    __publicField(this, "loadingCallback", null);
    //模型加载进度回调函数，参数是加载百分比，0.1,0.2,0.9等
    __publicField(this, "failureCallback", null);
  }
  //模型加载失败回调函数
}
class AMapOperation {
  constructor(divId) {
    __publicField(this, "viewer");
    // 整体cesium 实例化对象
    __publicField(this, "amapAdapter");
    // 地图适配器 内置地图容器
    __publicField(this, "divId");
    // div容器
    __publicField(this, "scaleDis");
    // div容器
    __publicField(this, "mapZoomMax");
    __publicField(this, "projection");
    __publicField(this, "tileWidth");
    __publicField(this, "FlyToPromise");
    __publicField(this, "viewBounds");
    __publicField(this, "isRotating", false);
    __publicField(this, "semiMajorAxis", 500);
    __publicField(this, "semiMinorAxis", 350);
    __publicField(this, "arrowAppearance", null);
    __publicField(this, "terrain", null);
    __publicField(this, "currentLevel", 13);
    __publicField(this, "mapModelType", 0);
    // 地图显示的类型 0：2D 1：3D 2：2.5D
    __publicField(this, "mapDefaultType", 0);
    // 地图初始化的类型 0二维可旋转 1三维可旋转 2二维无限滚动
    __publicField(this, "terrainState", 0);
    // 0：关闭地形 1：开启地形
    __publicField(this, "oldCenter", []);
    __publicField(this, "oldLevel", null);
    __publicField(this, "dfBaseLayer");
    __publicField(this, "center2D3D");
    //2D模式下最大高度
    __publicField(this, "max2DCameraHeight", 2e7);
    //3D模式下视角限制
    __publicField(this, "minPitch", Cesium.Math.toRadians(-90));
    __publicField(this, "maxPitch", Cesium.Math.toRadians(-10));
    __publicField(this, "minHeight", 10);
    __publicField(this, "maxHeight", 12805975);
    __publicField(this, "EventDispatcher", new EventDispatcher());
    __publicField(this, "isLeftClickFlag", false);
    __publicField(this, "isMouseMoveFlag", false);
    __publicField(this, "leftDownFlag", false);
    // 左键按下
    __publicField(this, "isRightDownFlag", false);
    // 右键按下
    __publicField(this, "modelMapMaxZoom", 30);
    // 三维情况地图放大等级
    __publicField(this, "mapMaxZoom", 20);
    // 二维情况地图放大等级
    __publicField(this, "mapMinZoom", 3);
    __publicField(this, "cameraRenderCallback", () => {
    });
    // 摄像机渲染回调
    __publicField(this, "mapModelTypeChangeCallback", (type) => {
    });
    // 地图显示类型变化回调
    __publicField(this, "postRenderCallback", () => {
    });
    // 帧渲染
    __publicField(this, "postRenderCallbackList", []);
    // 帧渲染
    __publicField(this, "subdomains", ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"]);
    __publicField(this, "levelDiff", 1e-14);
    // 根据浏览器缩放渲染地图
    __publicField(this, "renderingPixelated", () => {
      if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
        this.viewer.resolutionScale = window.devicePixelRatio;
      }
    });
    __publicField(this, "obh", null);
    /**
     * 设置地图中心位置和缩放等级 带动画
     * @param xc 经度
     * @param yc 纬度
     * @param mlevel 地图缩放等级
     * @param callback 回调函数
     */
    __publicField(this, "smoothZoomAndMove", (xc, yc, mlevel, duration, callback) => {
      if (!duration) {
        duration = Math.abs(this.getMapsLevel() - mlevel) * 1;
        if (duration < 1) {
          duration = 1;
        }
        if (duration > 7) {
          duration = 7;
        }
      }
      this.setLocatePoint(xc, yc);
      this.FlyToPromise = this.viewer.flyTo(
        this.amapAdapter.amapOperations.LocatePoint,
        {
          duration,
          offset: {
            heading: this.viewer.camera.heading,
            pitch: this.viewer.camera.pitch,
            range: this.mapsLevelToHeight(mlevel) / Math.cos(this.viewer.camera.pitch + Math.PI / 4)
          }
        }
      );
      if (callback) {
        this.FlyToPromise.then(function() {
          callback();
        });
      }
    });
    __publicField(this, "moveActive", false);
    __publicField(this, "contrasthandler", null);
    __publicField(this, "pixelToGlobeCoordinates", (px, py) => {
      const c3 = this.viewer.scene.globe.pick(
        this.viewer.camera.getPickRay({ x: px, y: py }),
        this.viewer.scene
      );
      if (Cesium.defined(c3)) {
        const cartographic = Cesium.Cartographic.fromCartesian(c3);
        return [
          Cesium.Math.toDegrees(cartographic.longitude),
          Cesium.Math.toDegrees(cartographic.latitude),
          cartographic.height
        ];
      }
      return null;
    });
    let el = document.getElementById(divId);
    this.divId = el ? el : divId;
    this.amapAdapter = {
      // 地图操作相关
      amapOperations: {
        LocatePoint: null,
        CBaseLayers: [],
        OldBaseLayers: [],
        multipleLayers: {},
        imageryProvider: {},
        tilesetModelList: []
      },
      // 图层操作相关
      layerOperations: {
        primitiveCollection: null,
        // 图元集合
        pointCollection: null,
        // 点集合
        iconPointCollection: null,
        // 点集合
        labelCollection: null,
        // 点集合
        multiplePoints: {},
        // 点容器
        multiplePolyline: {},
        // 线容器
        multiplePolygon: {},
        // 多边形容器
        multipleIconPoins: {},
        // 图标点容器
        especiallyPolygon: [],
        flowEspeciallyPolygon: [],
        especiallyPolygonShow: void 0,
        flowArrowLineList: [],
        flowArrowLineShow: void 0,
        allEspeciallyPolygon: [],
        allFlowArrowLine: [],
        multipleThirdPolygon: {}
      },
      // 图形操作相关
      graphicsOperations: {
        multipleLabels: {}
        // 图标点容器
      },
      // 冒泡操作相关
      balloonOperations: {
        multipleBalloon: {}
      },
      clippingPolygons: {},
      // 地图挖空多边形容器
      clippingSurfacePolygons: {},
      // 地图挖空多边形容器
      layerList: [],
      waterFloodMap: /* @__PURE__ */ new Map(),
      dynamicWallMap: /* @__PURE__ */ new Map(),
      contrastObj: {}
    };
    this.scaleDis = [
      3e6,
      2e6,
      1e6,
      5e5,
      2e5,
      1e5,
      5e4,
      3e4,
      2e4,
      1e4,
      5e3,
      2e3,
      1e3,
      500,
      200,
      100,
      50,
      25,
      10,
      5,
      3,
      1
    ];
    this.viewBounds = { MinX: -180, MinY: -90, MaxX: 180, MaxY: 90 };
    this.mapZoomMax = 19;
    this.projection = 20037508342795e-6;
    this.tileWidth = 256;
  }
  /**
   * 添加一个点图形 用于地图的缩放旋转
   * @param xc 经度
   * @param yc 维度
   */
  setLocatePoint(xc, yc) {
    if (!this.viewer) {
      return;
    }
    const LocatePoint = this.amapAdapter.amapOperations.LocatePoint;
    if (!LocatePoint) {
      let ent = this.viewer.entities.getById("LocatePoint");
      this.viewer.entities.remove(ent);
      this.amapAdapter.amapOperations.LocatePoint = this.viewer.entities.add(
        new Cesium.Entity({
          id: "LocatePoint",
          position: Cesium.Cartesian3.fromDegrees(xc, yc),
          point: {
            pixelSize: 3,
            color: Cesium.Color.WHITE.withAlpha(0)
          }
        })
      );
    } else {
      this.amapAdapter.amapOperations.LocatePoint.position = Cesium.Cartesian3.fromDegrees(xc, yc);
    }
  }
  /**
   * 地图高度 转换 地图缩放等级
   * @param height 地图高度
   * @returns 地图缩放等级
   */
  heightToMapsLevel(height) {
    const h0 = 128538232;
    return Math.log2(h0 / height);
  }
  /**
   * 地图缩放等级 转换 地图高度
   * @param level 地图缩放等级
   * @returns 地图高度
   */
  mapsLevelToHeight(level) {
    return MapBaseHelper$1.mapsLevel2Distance(this.viewer, level);
  }
  /**
   * 缩放地图
   * @param mlevel 缩放等级
   * @param duration 动画时间
   */
  smoothZoomLevel(mlevel, duration) {
    if (Math.abs(mlevel - MapBaseHelper$1.getMapsLevel(this.viewer)) > this.levelDiff) {
      let center = MapBaseHelper$1.getMapsCenter(this.viewer);
      if (center) {
        center[2] = 0;
        let cameraPosition1 = [
          Cesium.Math.toDegrees(
            this.viewer.camera.positionCartographic.longitude
          ),
          Cesium.Math.toDegrees(
            this.viewer.camera.positionCartographic.latitude
          ),
          this.viewer.camera.positionCartographic.height
        ];
        let center_c3 = Cesium.Cartesian3.fromDegrees(
          center[0],
          center[1],
          center[2]
        );
        let camera_c3 = Cesium.Cartesian3.fromDegrees(
          cameraPosition1[0],
          cameraPosition1[1],
          cameraPosition1[2]
        );
        let d1 = Cesium.Cartesian3.distance(camera_c3, center_c3);
        let d2 = MapBaseHelper$1.mapsLevel2Distance(this.viewer, mlevel);
        let nc3 = new Cesium.Cartesian3();
        nc3.x = center_c3.x - d2 * (center_c3.x - camera_c3.x) / d1;
        nc3.y = center_c3.y - d2 * (center_c3.y - camera_c3.y) / d1;
        nc3.z = center_c3.z - d2 * (center_c3.z - camera_c3.z) / d1;
        this.viewer.camera.flyTo({
          destination: nc3,
          orientation: {
            heading: this.viewer.camera.heading,
            pitch: this.viewer.camera.pitch,
            roll: this.viewer.camera.roll
          },
          duration
        });
      }
    }
  }
  //设置视角
  setCurrentView(pos, orient = {
    heading: 0,
    pitch: -45,
    roll: 0
  }, isLookAt) {
    let height = pos.height;
    if (PosUtil.is2D()) {
      height = height > this.max2DCameraHeight ? this.max2DCameraHeight : height;
    } else {
      height = height > this.maxHeight ? this.maxHeight : height;
    }
    if (isLookAt) {
      this.viewer.camera.lookAt(
        Cesium.Cartesian3.fromDegrees(
          pos.lng,
          pos.lat - (PosUtil.is2D() ? 0 : PosUtil.distanceToLat(
            height / Math.abs(
              Math.tan(Cesium.Math.toRadians(Math.abs(orient.pitch)))
            )
          )),
          height
        ),
        new Cesium.HeadingPitchRange(
          Cesium.Math.toRadians(0),
          Cesium.Math.toRadians(PosUtil.is2D() ? -90 : orient.pitch),
          height
        )
      );
      this.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    } else {
      this.viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(pos.lng, pos.lat, height),
        orientation: {
          heading: Cesium.Math.toRadians(orient.heading),
          pitch: Cesium.Math.toRadians(orient.pitch),
          roll: Cesium.Math.toRadians(orient.roll)
        }
      });
    }
  }
  //获取当前视角
  getCurrentView() {
    const camera = this.viewer.camera;
    const pos = camera.positionCartographic;
    const dest = {
      lng: Cesium.Math.toDegrees(pos.longitude),
      lat: Cesium.Math.toDegrees(pos.latitude),
      height: pos.height
    };
    const hpr = {
      heading: Math.round(Cesium.Math.toDegrees(camera.heading)),
      pitch: Math.round(Cesium.Math.toDegrees(camera.pitch)),
      roll: Math.round(Cesium.Math.toDegrees(camera.roll))
    };
    return { pos: dest, orient: hpr };
  }
  getViewRect() {
    const viewer = this.viewer;
    const pt1 = new Cesium.Cartesian2(0, 0);
    const pt2 = new Cesium.Cartesian2(
      viewer.canvas.width,
      viewer.canvas.height
    );
    const pick1 = viewer.scene.globe.pick(
      viewer.camera.getPickRay(pt1),
      viewer.scene
    );
    const pick2 = viewer.scene.globe.pick(
      viewer.camera.getPickRay(pt2),
      viewer.scene
    );
    Cesium.Cartographic.fromCartesian(pick1);
    Cesium.Cartographic.fromCartesian(pick2);
  }
  /**
   * 初始化地图
   * @param xc 经度
   * @param yc 纬度
   * @param level 地图缩放等级
   * @param loadback 地图初始化完成回调函数
   * @param modeType 地图显示的类型 0：2D 1：3D 2：2.5D
   */
  initMap(xc = 113.474353, yc = 22.744459, level = 6, loadback, modeType = 0, source = "SY_IMG_C") {
    if (this.viewer) {
      this.setMapsCenterAndLevel(xc, yc, level);
      if (typeof loadback === "function") {
        loadback();
      }
      return this.viewer;
    }
    Cesium.Ion.defaultAccessToken = cesiumToken;
    if (this.divId) {
      this.mapDefaultType = modeType;
      let mapModelOpt = {
        sceneMode: Cesium.SceneMode.SCENE2D,
        // 2d显示
        mapMode2D: Cesium.MapMode2D.ROTATE
        // 可以旋转
      };
      if (modeType == 1) {
        mapModelOpt = {
          sceneMode: Cesium.SceneMode.SCENE3D,
          // 默认显示为2.5D地图
          mapMode2D: Cesium.MapMode2D.ROTATE
          // 切换2D显示时可旋转
        };
      }
      if (modeType == 2) {
        mapModelOpt = {
          sceneMode: Cesium.SceneMode.SCENE2D,
          // 默认显示为2D地图
          mapMode2D: Cesium.MapMode2D.INFINITE_SCROLL
          // 无限滚动
        };
      }
      let obj = null;
      if (tdtMap && tdtMap[source]) {
        obj = {
          url: tdtMap[source],
          subdomains: tdtMap[source + "_subdomains"] || this.subdomains,
          minimumLevel: tdtLevelMap[source][0],
          maximumLevel: tdtLevelMap[source][1],
          customTags: {
            tk: this.tkRandomFun
          }
        };
        if (source === "AMAP_IMG_C") {
          const GCJ02TilingScheme = window.GCJ02TilingScheme;
          if (GCJ02TilingScheme) {
            obj.tilingScheme = new GCJ02TilingScheme();
          }
        }
      }
      this.viewer = new Cesium.Viewer(this.divId, {
        ...mapModelOpt,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        infoBox: false,
        animation: false,
        shouldAnimate: true,
        timeline: false,
        fullscreenButton: false,
        vrButton: false,
        selectionIndicator: false,
        contextOptions: {
          webgl: {
            alpha: true,
            // 关键1：保留绘图缓冲区，防止闲置清空画布
            preserveDrawingBuffer: true,
            // 关键2：优先GPU高性能，避免浏览器闲置降频回收WebGL资源
            powerPreference: "high-performance"
          },
          msaaSamples: 4,
          // 关键4：允许自动监听并恢复丢失的WebGL上下文
          allowContextLoss: true
        },
        msaaSamples: 4,
        baseLayerPicker: false,
        showRenderLoopErrors: true,
        //是否弹出错误信息窗口
        shadows: false,
        orderIndependentTranslucency: false,
        blurActiveElementOnCanvasFocus: true,
        useBrowserRecommendedResolution: true,
        // 是否选择浏览器推荐分辨率
        baseLayer: Cesium.ImageryLayer.fromProviderAsync(
          obj ? new Cesium.UrlTemplateImageryProvider(obj) : void 0
        )
      });
      this.initMapConfig();
      this.initMapOption();
      this.amapAdapter.amapOperations.CBaseLayers.push(
        this.viewer.imageryLayers.get(0)
      );
      this.initCollection();
      this.initEventListener();
      this.setMapsCenterAndLevel(xc, yc, level);
      if (this.viewer && loadback) {
        loadback();
      }
      this.initCustom();
      this.initCustomMaterial();
      GraphicHelper.viewer = this.viewer;
      GraphicHelper.addPoint([xc, yc, 1], 3, null, null, 0);
      this.oldCenter = [xc, yc, level];
      this.oldLevel = 6;
      return this.viewer;
    }
  }
  // 初始化自定义材质
  initCustomMaterial() {
    initWallMaterial();
  }
  initMapOption() {
    this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );
    this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_CLICK
    );
    this.viewer.scene.screenSpaceCameraController.inertiaTranslate = 0.3;
    this.viewer.scene.screenSpaceCameraController.inertiaZoom = 0.5;
    this.viewer.scene.screenSpaceCameraController.inertiaSpin = 0.1;
    this.setMapLevelRange(this.viewer, this.mapMinZoom, this.mapMaxZoom);
    this.viewer.scene.screenSpaceCameraController.tiltEventTypes = [
      Cesium.CameraEventType.RIGHT_DRAG,
      Cesium.CameraEventType.PINCH,
      {
        eventType: Cesium.CameraEventType.LEFT_DRAG,
        modifier: Cesium.KeyboardEventModifier.CTRL
      },
      {
        eventType: Cesium.CameraEventType.RIGHT_DRAG,
        modifier: Cesium.KeyboardEventModifier.CTRL
      },
      Cesium.CameraEventType.MIDDLE_DRAG
    ];
    this.viewer.scene.screenSpaceCameraController.zoomEventTypes = [
      Cesium.CameraEventType.WHEEL,
      Cesium.CameraEventType.PINCH
    ];
    if (window.hasOwnProperty("WheelZoomMultiple")) {
      window.WheelZoomMultiple = 2;
    }
  }
  initMapConfig() {
    this.viewer._cesiumWidget._creditContainer.style.display = "none";
    this.viewer.scene.skyAtmosphere.show = false;
    this.viewer.scene.globe.depthTestAgainstTerrain = true;
    this.viewer.scene.postProcessStages.fxaa.enabled = true;
    this.viewer.scene.globe.preloadAncestors = false;
    this.viewer.scene.globe.preloadSiblings = true;
    this.viewer.scene.globe.tileCacheSize = 1e3;
    this.viewer.scene.globe.maximumScreenSpaceError = 2;
    this.viewer.scene.screenSpaceCameraController.inertiaTranslate = 0.3;
    this.viewer.scene.screenSpaceCameraController.inertiaZoom = 0.5;
    this.viewer.scene.screenSpaceCameraController.inertiaSpin = 0.1;
    this.viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#a3b9ce");
    this.viewer.scene.screenSpaceCameraController.maximumTiltAngle = Math.PI / 2;
    this.viewer.scene.debugShowFramesPerSecond = true;
    this.viewer.scene.globe.enableLighting = false;
    this.viewer.scene.globe.showGroundAtmosphere = false;
    this.viewer.scene.fog.enable = false;
    this.viewer.scene.skyBox.show = false;
    this.viewer.scene.globe.showSkirts = true;
    this.viewer.scene.watchFramesPerSecond = true;
    this.viewer.scene.fxaa = true;
    this.viewer.scene.globe.translucency.enabled = true;
    this.viewer.camera.percentageChanged = 0.01;
  }
  initCustom() {
    var _a2;
    this.dfBaseLayer = this.viewer.imageryLayers.get(0);
    MapBaseHelper$1.viewer = this.viewer;
    DynamicPrimitive.viewer = this.viewer;
    PosUtil.viewer = this.viewer;
    if (window.meta && ((_a2 = window.meta) == null ? void 0 : _a2.VITE_BASE_TERRAIN_URL)) {
      Cesium.CesiumTerrainProvider.fromUrl(
        window.meta.VITE_BASE_TERRAIN_URL
      ).then((terrain) => {
        this.terrain = terrain;
        PosUtil.terrainProvider = terrain;
        const isTerrain = this.viewer.scene.mode == Cesium.SceneMode.SCENE3D && this.viewer.terrainProvider === this.terrain;
        DynamicPrimitive.init(this.viewer, isTerrain);
        this.viewer.scene.globe.terrainProviderChanged.addEventListener(
          (ev) => {
            let timer = setTimeout(() => {
              const isTerrain2 = this.viewer.scene.mode == Cesium.SceneMode.SCENE3D && this.viewer.terrainProvider === this.terrain;
              DynamicPrimitive.updateTerrain(isTerrain2);
              clearTimeout(timer);
              timer = null;
            }, 100);
          }
        );
      });
    }
  }
  initEventListener() {
    var _a2;
    this.viewer.scene.postRender.addEventListener(
      this.postRenderHandler.bind(this)
    );
    this.updateMapCenter();
    if (this.viewer && ((_a2 = this.viewer) == null ? void 0 : _a2.canvas)) {
      const hander = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
      hander.setInputAction(() => {
        this.updateMapCenter.bind(this);
        this.isRightDownFlag = true;
      }, Cesium.ScreenSpaceEventType.RIGHT_DOWN);
      hander.setInputAction(() => {
        this.leftDownFlag = true;
        this.updateMapCenter.bind(this);
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      hander.setInputAction(
        this.updateMapCenter.bind(this),
        Cesium.ScreenSpaceEventType.WHEEL
      );
      this.viewer.camera.changed.addEventListener(
        this.onCameraChanged.bind(this)
      );
      hander.setInputAction(() => {
        this.leftDownFlag = false;
      }, Cesium.ScreenSpaceEventType.LEFT_UP);
      hander.setInputAction(() => {
        this.isRightDownFlag = false;
      }, Cesium.ScreenSpaceEventType.RIGHT_UP);
    }
    let lastDevicePixelRatio = window.devicePixelRatio;
    this.viewer.resolutionScale = window.devicePixelRatio;
    window.addEventListener("resize", () => {
      const newDevicePixelRatio = window.devicePixelRatio;
      if (lastDevicePixelRatio !== newDevicePixelRatio) {
        this.renderingPixelated();
        lastDevicePixelRatio = newDevicePixelRatio;
      }
    });
  }
  updateMapCenter() {
    let mapCenter = [];
    let mapLevel = null;
    if (this.viewer && this.viewer.canvas) {
      mapCenter = PosUtil.getMapCenter();
      mapLevel = MapBaseHelper$1.getMapsLevel(this.viewer);
    }
    if (mapCenter == null ? void 0 : mapCenter.length) {
      this.oldCenter = mapCenter;
    }
    if (mapLevel) {
      this.oldLevel = mapLevel;
    }
    this.center2D3D = void 0;
  }
  // 监听相机变化
  onCameraChanged() {
    if (typeof this.cameraRenderCallback == "function") {
      this.cameraRenderCallback();
    }
    if (this.mapModelType != 1 && this.mapDefaultType != 2) {
      this.adjustMapsView();
    }
    this.balloonDisplayConditionHandel("camera");
    this.cameraChangedHandel();
    this.onThreeModelDisplayHandel();
  }
  // 三维模型控制显隐函数
  onThreeModelDisplayHandel() {
    const _tilesetModelList = this.amapAdapter.amapOperations.tilesetModelList;
    let curLevel = null;
    _tilesetModelList.forEach((model) => {
      if (model && model._showLevel) {
        curLevel = MapBaseHelper$1.getMapsLevel(this.viewer);
        if (curLevel > model._showLevel) {
          model.show = true;
        } else {
          model.show = false;
        }
      }
    });
  }
  // 上一次的冒泡摄像机高度
  // 控制自定义标牌显示范围
  balloonDisplayConditionHandel(type) {
    const _multipleBalloon = this.amapAdapter.balloonOperations.multipleBalloon;
    let balloon = null;
    for (const key in _multipleBalloon) {
      balloon = _multipleBalloon[key];
      if (balloon && balloon.show && !balloon.drag) {
        if (Array.isArray(balloon.distanceDisplayCondition)) {
          let distance2 = 0;
          if (this.viewer.scene.mode == Cesium.SceneMode.SCENE3D) {
            distance2 = Cesium.Cartesian3.distance(
              this.viewer.camera.position,
              Cesium.Cartesian3.fromDegrees(...balloon.crd)
            );
          } else {
            distance2 = this.viewer.camera.positionCartographic.height;
          }
          let heigth = this.mapsLevelToHeight(
            balloon.distanceDisplayCondition[1]
          );
          if (type == "render" && !balloon.distanceShow) {
            this.distanceBalloonHandel(balloon, heigth, distance2);
            if (this.obh != distance2) {
              this.obh = distance2;
            }
          }
          if (type == "camera" && balloon.distanceShow) {
            if (this.obh != distance2) {
              this.distanceBalloonHandel(balloon, heigth, distance2);
              balloon.distanceShow = false;
              this.obh = distance2;
            }
          }
        }
      }
    }
  }
  distanceBalloonHandel(balloon, height, distanceNum) {
    if (height && distanceNum && distanceNum < height) {
      balloon.style.display = "block";
    } else {
      balloon.style.display = "none";
    }
  }
  addPostRenderHandel(id, handler) {
    this.postRenderCallbackList.push({
      id,
      handler
    });
  }
  removePostRenderHandel(id) {
    this.postRenderCallbackList = this.postRenderCallbackList.filter(
      (item) => item.id !== id
    );
  }
  postRenderHandler(evt) {
    const _multipleBalloon = this.amapAdapter.balloonOperations.multipleBalloon;
    if (evt != null && Object.keys(_multipleBalloon).length > 0) {
      let balloon = null;
      let c3 = null;
      let c2 = null;
      for (const key in _multipleBalloon) {
        balloon = _multipleBalloon[key];
        if (balloon && balloon.crd && Array.isArray(balloon.crd) && balloon.crd.length && !balloon.drag) {
          c3 = Cesium.Cartesian3.fromDegrees(
            balloon.crd[0],
            balloon.crd[1],
            balloon.crd[2]
          );
          if (c3) {
            c2 = this.viewer.scene.cartesianToCanvasCoordinates(c3);
            if (c2) {
              let offsetx = 0;
              let offsety = 0;
              if (balloon.offset) {
                offsetx = balloon.offset[0];
                offsety = balloon.offset[1];
              }
              const cartographic = Cesium.Cartographic.fromCartesian(c3);
              const ellipsoid = this.viewer.scene.globe.ellipsoid;
              const surfaceNormal = ellipsoid.geodeticSurfaceNormalCartographic(cartographic);
              const cameraPosition = this.viewer.camera.positionWC;
              const dotProduct = Cesium.Cartesian3.dot(
                surfaceNormal,
                cameraPosition
              );
              if (dotProduct < 0 && this.viewer.scene.mapMode2D != Cesium.MapMode2D.INFINITE_SCROLL) {
                balloon.style.display = "none";
                if (balloon.show) {
                  balloon.dotProduct = true;
                }
              } else {
                if (balloon && balloon.show) {
                  if (balloon.dotProduct == true) {
                    balloon.style.display = "block";
                    balloon.dotProduct = false;
                  }
                  let level = null;
                  if (this.viewer) {
                    level = MapBaseHelper$1.getMapsLevel(this.viewer);
                  }
                  if (level && Array.isArray(balloon.distanceDisplayCondition) && balloon.distanceDisplayCondition[1] && balloon.distanceDisplayCondition[1] < level) {
                    balloon.style.display = "block";
                  }
                }
              }
              balloon.style.left = c2.x + offsetx + "px";
              balloon.style.top = c2.y + offsety + "px";
              balloon.style.pointerEvents = "none";
              balloon.style.opacity = 1;
            } else {
              balloon && (balloon.style.opacity = 0);
            }
          }
        }
      }
    }
    if (this.mapModelType != 1 && this.mapDefaultType != 2) {
      this.adjustMapsView();
    }
    if (this.arrowAppearance && this.arrowAppearance.material) {
      this.arrowAppearance.material.uniforms.trans_scale = this.getCurrentResolution();
      this.arrowAppearance.material.uniforms.clevel = this.getMapsLevel();
    }
    if (Array.isArray(this.postRenderCallbackList) && this.postRenderCallbackList.length) {
      this.postRenderCallbackList.forEach((item) => {
        if (typeof item.handler == "function") {
          item.handler();
        }
      });
    }
    if (typeof this.postRenderCallback == "function") {
      this.postRenderCallback();
    }
    this.balloonDisplayConditionHandel("render");
  }
  adjustMapsView() {
    const ViewBounds = this.viewBounds;
    const level = this.getMapsLevel();
    const resolution = 360 / (Math.pow(2, level + 1) * 256);
    const xDis = this.viewer.scene.canvas.clientWidth / 2 * resolution;
    const yDis = this.viewer.scene.canvas.clientHeight / 2 * resolution;
    const tmpCenter = this.getMapsCenter();
    if (Array.isArray(tmpCenter) && tmpCenter.length) {
      tmpCenter[0] = parseFloat(tmpCenter[0].toFixed(6));
      tmpCenter[1] = parseFloat(tmpCenter[1].toFixed(6));
      const minx = parseFloat((ViewBounds.MinX + xDis).toFixed(6));
      const maxx = parseFloat((ViewBounds.MaxX - xDis).toFixed(6));
      const miny = parseFloat((ViewBounds.MinY + yDis).toFixed(6));
      const maxy = parseFloat((ViewBounds.MaxY - yDis).toFixed(6));
      let needChange = false;
      if (tmpCenter[0] < minx) {
        tmpCenter[0] = minx;
        needChange = true;
      }
      if (tmpCenter[0] > maxx) {
        tmpCenter[0] = maxx;
        needChange = true;
      }
      if (tmpCenter[1] < miny) {
        tmpCenter[1] = miny;
        needChange = true;
      }
      if (tmpCenter[1] > maxy) {
        tmpCenter[1] = maxy;
        needChange = true;
      }
      let h = this.viewer.camera.positionCartographic.height;
      if (h > this.max2DCameraHeight) {
        h = this.max2DCameraHeight;
        needChange = true;
      }
      if (needChange) {
        this.viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(
            tmpCenter[0],
            tmpCenter[1],
            h
          ),
          orientation: {
            heading: this.viewer.camera.heading,
            pitch: Cesium.Math.toRadians(-90),
            roll: this.viewer.camera.roll
          }
        });
      }
    }
  }
  // 地图集合对象
  initCollection() {
    const primitiveCollection = this.amapAdapter.layerOperations.primitiveCollection;
    if (!primitiveCollection) {
      this.amapAdapter.layerOperations.primitiveCollection = new Cesium.PrimitiveCollection();
      this.viewer.scene.primitives.add(
        this.amapAdapter.layerOperations.primitiveCollection
      );
    }
    const pointCollection = this.amapAdapter.layerOperations.pointCollection;
    if (!pointCollection) {
      this.amapAdapter.layerOperations.pointCollection = new Cesium.PointPrimitiveCollection();
      this.viewer.scene.primitives.add(
        this.amapAdapter.layerOperations.pointCollection
      );
    }
    const iconPointCollection = this.amapAdapter.layerOperations.iconPointCollection;
    if (!iconPointCollection) {
      this.amapAdapter.layerOperations.iconPointCollection = new Cesium.BillboardCollection({
        blendOption: Cesium.BlendOption.TRANSLUCENT
      });
      this.viewer.scene.primitives.add(
        this.amapAdapter.layerOperations.iconPointCollection
      );
    }
    const labelCollection = this.amapAdapter.layerOperations.labelCollection;
    if (!labelCollection) {
      this.amapAdapter.layerOperations.labelCollection = new Cesium.LabelCollection();
      this.viewer.scene.primitives.add(
        this.amapAdapter.layerOperations.labelCollection
      );
    }
  }
  /**
   * 是否显示地图
   * @param isShowMap 是否显示
   */
  selectShowMap(isShowMap = true) {
    let mapDocument = null;
    if (typeof this.divId == "string") {
      mapDocument = document.getElementById(this.divId);
    } else {
      mapDocument = this.divId;
    }
    if (mapDocument) {
      if (isShowMap) {
        mapDocument.style.opacity = "1";
        mapDocument.style.zIndex = "0";
      } else {
        mapDocument.style.opacity = "0";
        mapDocument.style.zIndex = "-1";
      }
    }
  }
  // 获取当前像素
  getCurrentResolution() {
    return 20037508342789244e-9 / (Math.pow(2, this.getMapsLevel()) * 256);
  }
  /**
   * 改变地图底图类型 【TDT_VEC_A，TDT_IMG_C，TDT_TER_C...】
   * @param type 显示的瓦片类型
   * @param echoFlag 是否需要回显
   */
  switchMapsType(type, echoFlag = true) {
    let layer = null;
    let i = 0;
    this.amapAdapter.amapOperations.OldBaseLayers = this.amapAdapter.amapOperations.CBaseLayers;
    this.amapAdapter.amapOperations.CBaseLayers = [];
    let cloneImageryProvider = null;
    if (type !== "TDT_IMG_C") {
      this.dfBaseLayer.show = false;
    } else {
      this.dfBaseLayer.show = true;
    }
    if (Object.keys(this.amapAdapter.amapOperations.imageryProvider).length) {
      cloneImageryProvider = {
        ...this.amapAdapter.amapOperations.imageryProvider
      };
      for (const key in this.amapAdapter.amapOperations.imageryProvider) {
        this.removeMapImageryProvider(key);
      }
    }
    const obj = {
      url: tdtMap[type],
      subdomains: tdtMap[type + "_subdomains"] || this.subdomains,
      minimumLevel: tdtLevelMap[type][0] ? tdtLevelMap[type][0] : 2,
      maximumLevel: tdtLevelMap[type][1] ? tdtLevelMap[type][1] : 18,
      customTags: {
        tk: this.tkRandomFun
      }
    };
    if (type == "AMAP_IMG_C") {
      const GCJ02TilingScheme = window.GCJ02TilingScheme;
      if (GCJ02TilingScheme) {
        obj.tilingScheme = new GCJ02TilingScheme();
      }
    }
    layer = this.viewer.imageryLayers.addImageryProvider(
      new Cesium.UrlTemplateImageryProvider(obj)
    );
    layer._id = type;
    layer.zIndex = 2;
    this.amapAdapter.amapOperations.CBaseLayers.push(layer);
    const oldBaseLayers = this.amapAdapter.amapOperations.OldBaseLayers;
    if (oldBaseLayers != null && oldBaseLayers.length > 0) {
      for (i = 0; i < oldBaseLayers.length; i++) {
        this.viewer.imageryLayers.remove(oldBaseLayers[i], true);
      }
      this.amapAdapter.amapOperations.OldBaseLayers = this.amapAdapter.amapOperations.OldBaseLayers.filter((v) => v._id);
      this.amapAdapter.amapOperations.CBaseLayers.push(
        ...this.amapAdapter.amapOperations.OldBaseLayers
      );
    }
    if (cloneImageryProvider && echoFlag) {
      for (const key in cloneImageryProvider) {
        const provider = cloneImageryProvider[key];
        if (provider && provider._imageInfo) {
          this.addMapImageryProvider(provider._imageInfo);
        }
      }
    }
    if (Object.values(this.amapAdapter.amapOperations.multipleLayers).length && echoFlag) {
      Object.values(this.amapAdapter.amapOperations.multipleLayers).forEach(
        (item) => {
          this.removeWmsLayer(item._id);
          if (item && item._layerInfo) {
            if (Array.isArray(item._layerInfo.layers)) {
              this.addMultipleWmsLayers(item._layerInfo);
            } else {
              this.addWmsLayer(item._layerInfo);
            }
          }
        }
      );
    }
  }
  /**
   * 添加天地图提供的图层数据
   * @param url 要添加的图层地址
   */
  addMapImageryProvider(imageInfo) {
    if (this.amapAdapter.amapOperations.imageryProvider[imageInfo.id]) {
      return;
    }
    const obj = {
      ...imageInfo,
      id: imageInfo.id,
      url: imageInfo.url,
      subdomains: imageInfo.subdomains || this.subdomains,
      minimumLevel: imageInfo.minLevel || 2,
      maximumLevel: imageInfo.maxLevel || 18,
      customTags: {
        tk: this.tkRandomFun
      }
    };
    if (imageInfo.id == "AMAP_CIA_C") {
      const GCJ02TilingScheme = window.GCJ02TilingScheme;
      if (GCJ02TilingScheme) {
        obj.tilingScheme = new GCJ02TilingScheme();
      }
    }
    let provider = null;
    if (!imageInfo.type || imageInfo.type == "UrlTemplateImageryProvider") {
      provider = new Cesium.UrlTemplateImageryProvider(obj);
    }
    if (imageInfo.type == "SingleTileImageryProvider") {
      provider = new Cesium.SingleTileImageryProvider(obj);
    }
    const providerInfo = this.viewer.imageryLayers.addImageryProvider(provider);
    providerInfo._id = imageInfo.id;
    providerInfo._imageInfo = imageInfo;
    providerInfo.zIndex = imageInfo.zIndex;
    this.amapAdapter.amapOperations.imageryProvider[imageInfo.id] = providerInfo;
    return providerInfo;
  }
  /**
   * 移除天地图提供的图层数据
   * @param id 图层的唯一ID
   */
  removeMapImageryProvider(id) {
    const provider = this.amapAdapter.amapOperations.imageryProvider[id];
    if (provider) {
      this.viewer.imageryLayers.remove(provider);
      delete this.amapAdapter.amapOperations.imageryProvider[id];
    }
  }
  /**
   * 移除本地服务提供的图层数据
   * @param id 图层的唯一ID
   */
  removeMultipleImageryProvider(ids) {
    ids.forEach((id) => {
      this.removeMapImageryProvider(id);
    });
  }
  tkRandomFun() {
    return tdtKeyList[Math.floor(Math.random() * (tdtKeyList.length - 0) + 0)];
  }
  /**
   * 获取地图中心位置
   * @returns 地图中心位置
   */
  getMapsCenter() {
    const c3 = this.viewer.camera.pickEllipsoid(
      new Cesium.Cartesian2(
        this.viewer.canvas.clientWidth / 2,
        this.viewer.canvas.clientHeight / 2
      )
    );
    if (c3) {
      const cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(c3);
      return [
        cartographic.longitude * 180 / Math.PI,
        cartographic.latitude * 180 / Math.PI,
        cartographic.height
      ];
    } else {
      return [];
    }
  }
  /**
   * 获取地图当前的像素大小宽，高
   * @returns 地图的当前大小宽，高
   */
  getMapsSize() {
    let size = null;
    if (this.viewer) {
      size = [
        this.viewer.scene.canvas.clientWidth,
        this.viewer.scene.canvas.clientHeight
      ];
    }
    return size;
  }
  /**
   * 计算当前缩放等级下面的地图像素换算
   * @param level 缩放等级
   * @param count 计算的投影大小
   * @returns 换算后的像素值
   */
  getLevelResolution(level, count = 400750166855784e-7) {
    const resolution = count / (Math.pow(2, level + 1) * 256);
    return resolution;
  }
  /*
   * 获取地图等级范围
   * @returns 地图等级范围
   */
  getMapsLevelRange() {
    const range = [0, 20];
    if (this.viewer.scene.screenSpaceCameraController.maximumZoomDistance) {
      range[0] = this.heightToMapsLevel(
        this.viewer.scene.screenSpaceCameraController.maximumZoomDistance
      );
    }
    if (this.viewer.scene.screenSpaceCameraController.minimumZoomDistance) {
      range[1] = this.heightToMapsLevel(
        this.viewer.scene.screenSpaceCameraController.minimumZoomDistance
      );
    }
    return range;
  }
  /**
   * 设置地图中心位置
   * @param xc 经度
   * @param yc 纬度
   */
  setMapsCenter(xc, yc) {
    const mlevel = this.getMapsLevel();
    const LocatePoint = this.amapAdapter.amapOperations.LocatePoint;
    this.setLocatePoint(xc, yc);
    this.viewer.zoomTo(LocatePoint, {
      heading: this.viewer.camera.heading,
      pitch: this.viewer.camera.pitch,
      range: this.mapsLevelToHeight(mlevel) / Math.cos(this.viewer.camera.pitch + Math.PI / 4)
    });
  }
  /**
   * 获取地图边界
   * @returns 像素坐标、经度纬度坐标 笛卡尔坐标
   */
  getMapsBoundary() {
    const camera = this.viewer.camera;
    const ellipsoid = this.viewer.scene.globe.ellipsoid;
    const topLeft = camera.pickEllipsoid(
      new Cesium.Cartesian2(0, 0),
      ellipsoid
    );
    const bottomRight = camera.pickEllipsoid(
      new Cesium.Cartesian2(
        this.viewer.canvas.clientWidth,
        this.viewer.canvas.clientHeight
      ),
      ellipsoid
    );
    const topLeftCartographic = ellipsoid.cartesianToCartographic(topLeft);
    const bottomRightCartographic = ellipsoid.cartesianToCartographic(bottomRight);
    return [
      Cesium.Math.toDegrees(topLeftCartographic.longitude),
      Cesium.Math.toDegrees(bottomRightCartographic.latitude),
      Cesium.Math.toDegrees(bottomRightCartographic.longitude),
      Cesium.Math.toDegrees(topLeftCartographic.latitude)
    ];
  }
  /**
   * 获取数据边界
   * @param crds
   * @returns
   */
  getBounds(crds) {
    let rect = [];
    if (crds && crds.length > 2) {
      rect = [crds[0], crds[1], crds[0], crds[1]];
      for (let i = 2; i < crds.length; i += 2) {
        rect[0] = Math.min(rect[0], crds[i + 0]);
        rect[1] = Math.min(rect[1], crds[i + 1]);
        rect[2] = Math.max(rect[2], crds[i + 0]);
        rect[3] = Math.max(rect[3], crds[i + 1]);
      }
    }
    return rect;
  }
  /**
   * 获取地图当前缩放等级
   * @returns 当前缩放等级
   */
  getMapsLevel() {
    this.currentLevel = this.heightToMapsLevel(
      this.viewer.camera.positionCartographic.height
    );
    return this.currentLevel;
  }
  /**
   * 设置地图缩放等级
   * @param level 地图缩放等级
   */
  setMapsLevel(level) {
    const crd = this.getMapsCenter();
    if (crd) {
      const LocatePoint = this.amapAdapter.amapOperations.LocatePoint;
      this.setLocatePoint(crd[0], crd[1]);
      this.viewer.zoomTo(LocatePoint, {
        heading: this.viewer.camera.heading,
        pitch: this.viewer.camera.pitch,
        range: this.mapsLevelToHeight(level) / Math.cos(this.viewer.camera.pitch + Math.PI / 4)
      });
    }
  }
  /**
   * 设置地图中心位置和缩放等级 不带动画
   * @param xc 经度
   * @param yc 维度
   * @param mlevel 地图缩放等级
   */
  setMapsCenterAndLevel(xc, yc, mlevel, duration = 0) {
    if (xc && yc && mlevel) {
      if (Math.abs(mlevel - this.getMapsLevel()) > this.levelDiff) {
        const center = this.getMapsCenter();
        if (!center) return;
        center[2] = 0;
        const cameraPosition1 = [
          Cesium.Math.toDegrees(
            this.viewer.camera.positionCartographic.longitude
          ),
          Cesium.Math.toDegrees(
            this.viewer.camera.positionCartographic.latitude
          ),
          this.viewer.camera.positionCartographic.height
        ];
        const center_c3 = Cesium.Cartesian3.fromDegrees(
          center[0],
          center[1],
          center[2]
        );
        const camera_c3 = Cesium.Cartesian3.fromDegrees(
          cameraPosition1[0],
          cameraPosition1[1],
          cameraPosition1[2]
        );
        const d1 = Cesium.Cartesian3.distance(camera_c3, center_c3);
        const d2 = this.mapsLevelToHeight(mlevel);
        const nc3 = new Cesium.Cartesian3();
        nc3.x = center_c3.x - d2 * (center_c3.x - camera_c3.x) / d1;
        nc3.y = center_c3.y - d2 * (center_c3.y - camera_c3.y) / d1;
        nc3.z = center_c3.z - d2 * (center_c3.z - camera_c3.z) / d1;
        const cartographic2 = Cesium.Cartographic.fromCartesian(nc3);
        const cameraPosition2 = [
          Cesium.Math.toDegrees(cartographic2.longitude),
          Cesium.Math.toDegrees(cartographic2.latitude),
          cartographic2.height
        ];
        cameraPosition2[0] += xc - center[0];
        cameraPosition2[1] += yc - center[1];
        this.viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            cameraPosition2[0],
            cameraPosition2[1],
            cameraPosition2[2]
          ),
          orientation: {
            heading: this.viewer.camera.heading,
            pitch: this.viewer.camera.pitch,
            roll: this.viewer.camera.roll
          },
          duration
        });
      }
    }
  }
  setMapsCenterAndLevelArea(xc, yc, mlevel, duration = 0) {
    this.viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(
        xc,
        yc,
        this.mapsLevelToHeight(mlevel)
      ),
      orientation: {
        heading: this.viewer.camera.heading,
        pitch: Cesium.Math.toRadians(-90),
        roll: this.viewer.camera.roll
      }
    });
  }
  setMapsCenterAndLevel2(xc, yc, mlevel, center, duration = 0) {
    if (xc && yc && mlevel) {
      if (Math.abs(mlevel - this.getMapsLevel()) > this.levelDiff) {
        center[2] = 0;
        const cameraPosition1 = [
          Cesium.Math.toDegrees(
            this.viewer.camera.positionCartographic.longitude
          ),
          Cesium.Math.toDegrees(
            this.viewer.camera.positionCartographic.latitude
          ),
          this.viewer.camera.positionCartographic.height
        ];
        const center_c3 = Cesium.Cartesian3.fromDegrees(
          center[0],
          center[1],
          center[2]
        );
        const camera_c3 = Cesium.Cartesian3.fromDegrees(
          cameraPosition1[0],
          cameraPosition1[1],
          cameraPosition1[2]
        );
        const d1 = Cesium.Cartesian3.distance(camera_c3, center_c3);
        const d2 = this.mapsLevelToHeight(mlevel);
        const nc3 = new Cesium.Cartesian3();
        nc3.x = center_c3.x - d2 * (center_c3.x - camera_c3.x) / d1;
        nc3.y = center_c3.y - d2 * (center_c3.y - camera_c3.y) / d1;
        nc3.z = center_c3.z - d2 * (center_c3.z - camera_c3.z) / d1;
        const cartographic2 = Cesium.Cartographic.fromCartesian(nc3);
        const cameraPosition2 = [
          Cesium.Math.toDegrees(cartographic2.longitude),
          Cesium.Math.toDegrees(cartographic2.latitude),
          cartographic2.height
        ];
        cameraPosition2[0] += xc - center[0];
        cameraPosition2[1] += yc - center[1];
        this.viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            cameraPosition2[0],
            cameraPosition2[1],
            cameraPosition2[2]
          ),
          orientation: {
            heading: this.viewer.camera.heading,
            pitch: this.viewer.camera.pitch,
            roll: this.viewer.camera.roll
          },
          duration
        });
      }
    }
  }
  /**
   * 获取最大等级
   * @param bound 地图四高程点
   * @param mapWidth 地图宽度
   * @param mapHeight 地图高度
   * @returns 返回最大等级
   */
  getMaxLevel(bound, mapWidth, mapHeight) {
    let maxLevel2 = 2;
    let resolution = 0, w = 0, h = 0;
    const vWidth = bound[2] - bound[0];
    const vHeight = bound[3] - bound[1];
    for (let i = 19; i > 2; i -= 0.5) {
      maxLevel2 = i;
      resolution = this.getLevelResolution(maxLevel2, 360);
      w = resolution * mapWidth;
      h = resolution * mapHeight;
      if (w > vWidth && h > vHeight) {
        break;
      }
    }
    return maxLevel2;
  }
  /**
   * 获取地图旋转角度
   * @returns 当前地图旋转角度
   */
  getRotateAngle() {
    return this.viewer.camera.heading * (180 / Math.PI) % 360;
  }
  /**
   * 设置地图旋转角度 不带动画
   * @param angle 旋转度数
   */
  setRotateAngle(angle) {
    this.viewer.camera.setView({
      orientation: {
        heading: Cesium.Math.toRadians(angle),
        pitch: this.viewer.camera.pitch,
        roll: this.viewer.camera.roll
      }
    });
  }
  /**
   * 设置地图旋转角度 带动画
   * @param angle 旋转度数
   */
  smoothRotateAngle(angle) {
    if (!this.isRotating) {
      let c = this.getMapsCenter();
      if (this.oldCenter && (!Array.isArray(c) || !c.length)) {
        c = this.oldCenter;
      }
      if (Array.isArray(c) && c.length) {
        this.isRotating = true;
        this.viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            c[0],
            c[1],
            this.viewer.camera.positionCartographic.height
          ),
          duration: 0.5,
          orientation: {
            heading: Cesium.Math.toRadians(angle),
            pitch: this.viewer.camera.pitch,
            roll: this.viewer.camera.roll
          },
          complete: () => {
            this.isRotating = false;
          }
        });
      }
    }
  }
  /**
   * 修改 isRotating 变量
   */
  handleAmendIsRotating(bl) {
    this.isRotating = bl;
  }
  /**
   * 地图模式切换
   * @param callback 回调函数
   */
  screenSpaceModelChange(id, callback) {
    const eventObj = new EventObject();
    eventObj.EventType = EventType.MapModelTypeChange;
    eventObj.EventId = id;
    eventObj.Callback = callback;
    this.EventDispatcher.addListener(eventObj);
  }
  /**
   * 单击地图 左键点击 拾取地图上一个要素
   * @param callback 左键点击回调函数
   */
  screenSpaceLeftClick(id, callback) {
    const eventObj = new EventObject();
    eventObj.EventType = EventType.LeftClick;
    eventObj.EventId = id;
    eventObj.Callback = callback;
    this.EventDispatcher.addListener(eventObj);
    if (this.EventDispatcher.listenerList.filter(
      (v) => v.EventType === EventType.LeftClick
    ).length === 0) {
      this.isLeftClickFlag = false;
      this.viewer.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_CLICK
      );
    }
    if (!this.isLeftClickFlag) {
      this.viewer.screenSpaceEventHandler.setInputAction(
        this.leftClickHandel.bind(this),
        Cesium.ScreenSpaceEventType.LEFT_CLICK
      );
      this.isLeftClickFlag = true;
    }
  }
  leftClickHandel(event) {
    if (!event) return;
    const pick = this.viewer.scene.pick(event.position);
    if (pick && pick.primitive && pick.primitive instanceof Cesium.GroundPrimitive) {
      const ray = this.viewer.camera.getPickRay(event.position);
      const intersection = this.viewer.scene.globe.pick(ray, this.viewer.scene);
      if (intersection) {
        const cartographicPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(intersection);
        const longitude = Cesium.Math.toDegrees(cartographicPosition.longitude);
        const latitude = Cesium.Math.toDegrees(cartographicPosition.latitude);
        const height = cartographicPosition.height;
        this.EventDispatcher.dispatchEvent(
          EventType.LeftClick,
          pick,
          [longitude, latitude, height],
          event
        );
      }
    } else {
      const crd = this.pixelToCoordinates(
        event.position.x,
        event.position.y
      );
      this.EventDispatcher.dispatchEvent(EventType.LeftClick, pick, crd, event);
    }
  }
  removeMapListener(type, id) {
    let obj = new EventObject();
    obj.EventType = type;
    obj.EventId = id;
    this.EventDispatcher.removeListener(obj);
  }
  /**
   * 双击地图
   * @param callback 左键点击回调函数
   */
  screenSpaceLeftDoubleClick(id, callback) {
    const eventObj = new EventObject();
    eventObj.EventType = EventType.LeftDoubleClick;
    eventObj.EventId = id;
    eventObj.Callback = callback;
    this.EventDispatcher.addListener(eventObj);
    if (this.EventDispatcher.listenerList.filter(
      (v) => v.EventType === EventType.LeftDoubleClick
    ).length === 0) {
      this.viewer.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
      );
    }
    if (this.EventDispatcher.listenerList.filter(
      (v) => v.EventType === EventType.LeftDoubleClick
    ).length === 1) {
      this.viewer.screenSpaceEventHandler.setInputAction(
        this.leftDoubleClickHandel.bind(this),
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
      );
    }
  }
  leftDoubleClickHandel(event) {
    const crd = this.pixelToCoordinates(
      event.position.x,
      event.position.y
    );
    const pick = this.viewer.scene.pick(event.position);
    this.EventDispatcher.dispatchEvent(EventType.LeftDoubleClick, pick, crd);
  }
  /**
   * 鼠标移动事件
   * @param callback 鼠标移动回调函数
   */
  screenSpaceMouseMove(id, callback, isPick = true) {
    const eventObj = new EventObject();
    eventObj.EventType = EventType.MouseMove;
    eventObj.EventId = id;
    eventObj.isPick = isPick;
    eventObj.Callback = callback;
    this.EventDispatcher.addListener(eventObj);
    const mouseMoveCount = this.EventDispatcher.listenerList.filter(
      (v) => v.EventType === EventType.MouseMove
    );
    if (!this.isMouseMoveFlag && mouseMoveCount.length) {
      this.viewer.screenSpaceEventHandler.setInputAction(
        this.mouseMoveHandel.bind(this),
        Cesium.ScreenSpaceEventType.MOUSE_MOVE
      );
      this.isMouseMoveFlag = true;
    }
  }
  mouseMoveHandel(movement) {
    const mouseMoveCount = this.EventDispatcher.listenerList.filter(
      (v) => v.EventType === EventType.MouseMove
    );
    if (mouseMoveCount.length === 0) {
      this.isMouseMoveFlag = false;
      this.viewer.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.MOUSE_MOVE
      );
      return;
    }
    if (this.leftDownFlag || this.isRightDownFlag) return;
    this.EventDispatcher.dispatchEvent(
      EventType.MouseMove,
      null,
      movement,
      null,
      this.viewer
    );
  }
  // 图层置顶
  setLayerRaiseToTop(id) {
    const primitive = this.amapAdapter.layerOperations.primitiveCollection._primitives[this.amapAdapter.layerOperations.primitiveCollection._primitives.findIndex(
      (item) => item.LayerId == id
    )];
    if (!this.amapAdapter.layerOperations.primitiveCollection.contains(primitive)) {
      console.log("集合中不存在该图层");
      return;
    }
    if (primitive) {
      if (!primitive._ground) {
        console.log("不是贴地图层");
        return;
      }
      this.amapAdapter.layerOperations.primitiveCollection.raiseToTop(
        primitive
      );
    } else {
      console.log("图层不存在");
    }
  }
  /**
   * 地图相机变化事件
   * @param callback 回调函数
   */
  setupCameraChangedListener(id, callback) {
    const eventObj = new EventObject();
    eventObj.EventType = EventType.CameraChanged;
    eventObj.EventId = id;
    eventObj.Callback = callback;
    this.EventDispatcher.addListener(eventObj);
  }
  cameraChangedHandel() {
    this.EventDispatcher.dispatchEvent(EventType.CameraChanged);
  }
  /**
   * 监听地图中心改变事件
   * @param callback 地图中心改变回调函数
   */
  mapCenterChangedListener(callback) {
  }
  /**
   * 像素坐标转换成地理坐标
   * @param px X轴像素大小
   * @param py Y轴像素大小
   * @returns 地理坐标【经度, 纬度】
   */
  pixelToCoordinates(px, py) {
    let c3 = null;
    try {
      if (this.viewer.scene.pickPositionSupported) {
        c3 = this.viewer.scene.pickPosition({ x: px, y: py });
      }
      if (!c3) {
        c3 = this.viewer.scene.globe.pick(
          this.viewer.camera.getPickRay({ x: px, y: py }),
          this.viewer.scene
        );
      }
      if (Cesium.defined(c3)) {
        const cartographic = Cesium.Cartographic.fromCartesian(c3);
        return [
          Cesium.Math.toDegrees(cartographic.longitude),
          Cesium.Math.toDegrees(cartographic.latitude),
          cartographic.height
        ];
      }
    } catch (error) {
    }
    return null;
  }
  /**
   * 地理坐标转换成像素坐标
   * @param longitude 经度
   * @param latitude 纬度
   * @param height 高度
   * @returns
   */
  geodeticToPixel(longitude, latitude, height) {
    const scene = this.viewer.scene;
    const cartesian = Cesium.Cartesian3.fromDegrees(
      longitude,
      latitude,
      height
    );
    const pixelCoordinate = scene.cartesianToCanvasCoordinates(cartesian);
    return pixelCoordinate;
  }
  /**
   *  添加一个个WMS图层
   * @param layerInfo @param layerInfo 【对应 Cesium官方文档 WebMapServiceImageryProvider 方法参数】
   * @param layerOpter 是否是图层方式添加 图层的方式不会被添加到Map对象中  而是被添加到list数组中
   * @returns WMS图层
   */
  addWmsLayer(layerInfo, layerOpter) {
    const {
      id,
      show = true,
      url,
      layers,
      format = "image/png",
      zIndex,
      data,
      setTileset = false
      // 是否设置成贴3Dtitle图层
    } = layerInfo;
    const _amapOperations = this.amapAdapter.amapOperations;
    if (_amapOperations.multipleLayers[id]) {
      return;
    }
    const imageryProvider = new Cesium.WebMapServiceImageryProvider({
      url,
      layers,
      tilewidth: 256,
      tileHeight: 256,
      credit: "d196fd9da7426586d8938f86ea6b9c81",
      parameters: {
        service: "WMS",
        format,
        transparent: true
      }
    });
    const imageryLayer = new Cesium.ImageryLayer(imageryProvider, {
      show,
      zIndex
    });
    imageryLayer._id = id;
    imageryLayer._data = data;
    imageryLayer.zIndex = zIndex;
    imageryLayer._layerInfo = layerInfo;
    if (!setTileset) {
      !layerOpter && (_amapOperations.multipleLayers[id] = imageryLayer);
      this.viewer.imageryLayers.add(imageryLayer);
    }
    return imageryLayer;
  }
  /**
   * 移除一个WMS图层
   * @param id 图层的唯一标识
   */
  removeWmsLayer(id) {
    const _amapOperations = this.amapAdapter.amapOperations;
    const imageryLayer = _amapOperations.multipleLayers[id];
    if (imageryLayer) {
      this.viewer.imageryLayers.remove(imageryLayer);
      delete _amapOperations.multipleLayers[id];
    }
  }
  /**
   * 添加多个WMS图层
   * @param layerInfoArray 【对应 Cesium官方文档 WebMapServiceImageryProvider 方法参数】
   */
  addMultipleWmsLayers(layerInfo, layerOpter) {
    const {
      id,
      show = true,
      url,
      layers,
      format = "image/png",
      zIndex,
      data,
      setTileset = false
      // 是否设置成贴3Dtitle图层
    } = layerInfo;
    const _amapOperations = this.amapAdapter.amapOperations;
    if (_amapOperations.multipleLayers[id]) {
      return;
    }
    let _layers = layers;
    if (_layers && Array.isArray(_layers)) {
      _layers = _layers.join(",");
    }
    const imageryProvider = new Cesium.WebMapServiceImageryProvider({
      url,
      layers: _layers,
      tilewidth: 256,
      tileHeight: 256,
      credit: "d196fd9da7426586d8938f86ea6b9c81",
      parameters: {
        service: "WMS",
        format,
        transparent: true
      }
    });
    const imageryLayer = new Cesium.ImageryLayer(imageryProvider, {
      show,
      zIndex
    });
    imageryLayer._id = id;
    imageryLayer._data = data;
    imageryLayer.zIndex = zIndex;
    imageryLayer._layerInfo = layerInfo;
    if (!setTileset) {
      !layerOpter && (_amapOperations.multipleLayers[id] = imageryLayer);
      this.viewer.imageryLayers.add(imageryLayer);
    }
    return imageryLayer;
  }
  /**
   * 移除多个WMS图层
   * @param ids 图层的唯一标识
   */
  removeMultipleWmsLayers(ids) {
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      this.removeWmsLayer(id);
    }
  }
  /**
   * 移除所有WMS图层
   */
  removeAllWmsLayers() {
    const _amapOperations = this.amapAdapter.amapOperations;
    for (const key in _amapOperations.multipleLayers) {
      this.removeWmsLayer(key);
    }
  }
  /**
   * 设置图层层次顺序
   * @param id 图层的唯一标识
   * @param zIndex 图层层级
   */
  setLayerZIndex(id, zIndex) {
    const _amapOperations = this.amapAdapter.amapOperations;
    const imageryLayer = _amapOperations.multipleLayers[id];
    if (imageryLayer) {
      imageryLayer.zIndex = zIndex;
    }
  }
  /**
   *
   * @param mode 地图模式切换 0:2D 1:3D 2: Columbus View 2.5
   * @param flag 是否需要定位到指定位置
   * @param vieweCenter 定位中心点
   */
  async switchCesiumMode(mode, flag2 = false, vieweCenter) {
    this.mapModelType = mode;
    const viewer = this.viewer;
    MapBaseHelper$1.viewer = viewer;
    let MODELTYPEMAP = {
      0: Cesium.SceneMode.SCENE2D,
      1: Cesium.SceneMode.SCENE3D,
      2: Cesium.SceneMode.COLUMBUS_VIEW
    };
    let MODELTYPE = MODELTYPEMAP[mode];
    let center = MapBaseHelper$1.getMapsCenter(viewer);
    let mlevel = MapBaseHelper$1.getMapsLevel(viewer, center);
    let angle = mlevel <= 7 ? -90 : -45;
    this.EventDispatcher.dispatchEvent(EventType.MapModelTypeChange, mode);
    if (typeof this.mapModelTypeChangeCallback == "function") {
      this.mapModelTypeChangeCallback(mode);
    }
    MapBaseHelper$1.changSceneMode(viewer, MODELTYPE, {
      center,
      level: mlevel,
      angle,
      duration: 0.4
    });
    if (MODELTYPE === Cesium.SceneMode.SCENE2D) {
      this.hideAllClippingPolygonTerrain();
    } else if (MODELTYPE === Cesium.SceneMode.SCENE3D) {
      this.showAllClippingPolygonTerrain();
    }
    let mapMaxZoom = MODELTYPE == Cesium.SceneMode.SCENE2D ? this.mapMaxZoom : this.modelMapMaxZoom;
    this.setMapLevelRange(this.viewer, this.mapMinZoom, mapMaxZoom);
    if (flag2 && vieweCenter && vieweCenter.lng && vieweCenter.lat) {
      const { lng, lat, level } = vieweCenter;
      angle = level <= 7 ? -90 : -45;
      MapBaseHelper$1.setViewAndAngle(lng, lat, level, angle, 0, 0.4, null);
    }
  }
  setMapLevelRange(viewer, minLevel, maxLevel2) {
    if (viewer) {
      if (minLevel) {
        viewer.scene.screenSpaceCameraController.maximumZoomDistance = this.mapsLevelToHeight(minLevel);
        this.mapMinZoom = minLevel;
      }
      if (maxLevel2) {
        viewer.scene.screenSpaceCameraController.minimumZoomDistance = this.mapsLevelToHeight(maxLevel2);
        this.mapMaxZoom = maxLevel2;
      }
    }
  }
  /**
   * 添加3Dtileset瓦片
   * @param tilesetInfo 对应Cesium中文文档Cesium3DTileset传参
   */
  async add3DTileset(tilesetInfo) {
    const _tilesetModelList = this.amapAdapter.amapOperations.tilesetModelList;
    const { id, data, showLevel, type = "TileSet" } = tilesetInfo;
    const index = _tilesetModelList.findIndex((t) => t._id === id);
    if (index != -1) {
      return;
    }
    let tilesetModelPrim = null;
    if (!type || type == "TileSet") {
      tilesetModelPrim = await this.addTilesetDataModel(tilesetInfo);
    }
    if (type == "Lcc") {
      tilesetModelPrim = await this.addLccDataModel(tilesetInfo);
    }
    tilesetModelPrim._id = id;
    tilesetModelPrim._data = data;
    tilesetModelPrim._tilesetInfo = tilesetInfo;
    tilesetModelPrim._showLevel = showLevel;
    tilesetModelPrim._type = type;
    _tilesetModelList.push(tilesetModelPrim);
    this.resetModelMatrix();
    this.onThreeModelDisplayHandel();
    return tilesetModelPrim;
  }
  async addTilesetDataModel(tilesetInfo) {
    const { show = true, tileUrl, modelMatrix } = tilesetInfo;
    let matrix = Array.isArray(modelMatrix) && modelMatrix.length ? modelMatrix : [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    let tilesetModel = await Cesium.Cesium3DTileset.fromUrl(tileUrl, {
      show,
      url: tileUrl,
      modelMatrix: Cesium.Matrix4.fromArray(matrix),
      // modelMatrix: Cesium.Matrix4.fromArray([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 14.182212207000703, -33.41807206533849, -16.405409428291023, 1]),
      skipLevelOfDetail: true,
      baseScreenSpaceError: 1024,
      skipScreenSpaceErrorFactor: 16,
      skipLevels: 1,
      immediatelyLoadDesiredLevelOfDetail: false,
      loadSiblings: false,
      cullWithChildrenBounds: true,
      isSuperMapiServer: true,
      cullRequestsWhileMoving: true,
      cullRequestsWhileMovingMultiplier: 60,
      maximumCacheOverflowBytes: 536870912,
      cacheBytes: 536870912
    });
    let tilesetModelPrim = this.viewer.scene.primitives.add(tilesetModel);
    return tilesetModelPrim;
  }
  async addLccDataModel(tilesetInfo) {
    const { show = true, tileUrl, modelMatrix } = tilesetInfo;
    let matrix = Array.isArray(modelMatrix) && modelMatrix.length ? modelMatrix : [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    let opt = new LccLoadOption();
    opt.camera = this.viewer.camera;
    opt.scene = this.viewer.scene;
    opt.modelMatrix = Cesium.Matrix4.fromArray(matrix);
    opt.dataPath = tileUrl;
    opt.renderLib = Cesium;
    opt.canvas = this.viewer.scene.canvas;
    let tilesetModelPrim = LCCModelHelper.addLccModel(this.viewer, opt);
    return tilesetModelPrim;
  }
  // 恢复modelMatrix原值 如果是地形存在需要调用移除
  resetModelMatrix() {
    const _tilesetModelList = this.amapAdapter.amapOperations.tilesetModelList;
    let matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    let dfmatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    let timer = setTimeout(() => {
      _tilesetModelList.forEach((model) => {
        if (this.viewer.terrainProvider._scheme) {
          if (Array.isArray(model._tilesetInfo.terrainModelMatrix) && model._tilesetInfo.terrainModelMatrix.length) {
            matrix = model._tilesetInfo.terrainModelMatrix;
          } else {
            matrix = dfmatrix;
          }
        } else {
          if (Array.isArray(model._tilesetInfo.modelMatrix) && model._tilesetInfo.modelMatrix.length) {
            matrix = model._tilesetInfo.modelMatrix;
          } else {
            matrix = dfmatrix;
          }
        }
        model.modelMatrix = Cesium.Matrix4.fromArray(matrix);
      });
      clearTimeout(timer);
      timer = null;
    }, 1e3);
  }
  /**
   * 隐藏3d瓦片
   * @param id 3Dtileset瓦片唯一标识
   */
  hide3DTileset(id) {
    const _tilesetModelList = this.amapAdapter.amapOperations.tilesetModelList;
    if (_tilesetModelList && _tilesetModelList.length) {
      const index = _tilesetModelList.findIndex((t) => t._id === id);
      if (index !== -1) {
        _tilesetModelList[index].show = false;
      }
    }
  }
  /**
   * 显示3d瓦片
   * @param id 3Dtileset瓦片唯一标识
   */
  show3DTileset(id) {
    const _tilesetModelList = this.amapAdapter.amapOperations.tilesetModelList;
    if (_tilesetModelList && _tilesetModelList.length) {
      const index = _tilesetModelList.findIndex((t) => t._id === id);
      if (index !== -1) {
        _tilesetModelList[index].show = true;
      }
    }
  }
  /**
   * 卷帘工具
   * @param modelLeftInfo 左边模型
   * @param modelRightInfo 右边模型
   */
  async addModelContrast(modelLeftInfo, modelRightInfo) {
    if (modelLeftInfo) {
      if (this.amapAdapter.contrastObj.left) {
        this.remove3DTileset(this.amapAdapter.contrastObj.left._id);
      }
      if (modelLeftInfo.id && modelLeftInfo.tileUrl) {
        let left = await this.add3DTileset(modelLeftInfo);
        left.splitDirection = Cesium.SplitDirection.LEFT;
        this.amapAdapter.contrastObj.left = left;
      }
    }
    if (modelRightInfo) {
      if (this.amapAdapter.contrastObj.right) {
        this.remove3DTileset(this.amapAdapter.contrastObj.right._id);
      }
      if (modelRightInfo.id && modelRightInfo.tileUrl) {
        let right = await this.add3DTileset(modelRightInfo);
        right.splitDirection = Cesium.SplitDirection.RIGHT;
        this.amapAdapter.contrastObj.right = right;
      }
    }
    const slider = document.getElementById("my-map-slider");
    if (slider && slider.parentElement) {
      slider.style.display = "block";
      this.viewer.scene.splitPosition = slider.offsetLeft / slider.parentElement.offsetWidth;
      this.initContrastListener(slider);
    }
  }
  /**
   * 移除卷帘工具
   */
  removeModelContrast() {
    const slider = document.getElementById("my-map-slider");
    if (slider && slider.parentElement) {
      slider.style.display = "none";
      this.viewer.scene.splitPosition = 1;
      for (const key in this.amapAdapter.contrastObj) {
        let item = this.amapAdapter.contrastObj[key];
        if (item) {
          this.remove3DTileset(this.amapAdapter.contrastObj.left._id);
        }
      }
    }
    this.removeContrastListener();
  }
  initContrastListener(slider) {
    if (!this.contrasthandler) {
      this.contrasthandler = new Cesium.ScreenSpaceEventHandler(slider);
    }
    let _this = this;
    this.contrasthandler.setInputAction(function() {
      _this.moveActive = true;
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    this.contrasthandler.setInputAction(function() {
      _this.moveActive = true;
    }, Cesium.ScreenSpaceEventType.PINCH_START);
    this.contrasthandler.setInputAction(
      (e) => _this.moveHandel(e, slider),
      Cesium.ScreenSpaceEventType.MOUSE_MOVE
    );
    this.contrasthandler.setInputAction(
      (e) => _this.moveHandel(e, slider),
      Cesium.ScreenSpaceEventType.PINCH_MOVE
    );
    this.contrasthandler.setInputAction(function() {
      _this.moveActive = false;
    }, Cesium.ScreenSpaceEventType.LEFT_UP);
    this.contrasthandler.setInputAction(function() {
      _this.moveActive = false;
    }, Cesium.ScreenSpaceEventType.PINCH_END);
  }
  removeContrastListener() {
    if (this.contrasthandler) {
      this.contrasthandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOWN
      );
      this.contrasthandler.removeInputAction(
        Cesium.ScreenSpaceEventType.PINCH_START
      );
      this.contrasthandler.removeInputAction(
        Cesium.ScreenSpaceEventType.MOUSE_MOVE
      );
      this.contrasthandler.removeInputAction(
        Cesium.ScreenSpaceEventType.PINCH_MOVE
      );
      this.contrasthandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_UP
      );
      this.contrasthandler.removeInputAction(
        Cesium.ScreenSpaceEventType.PINCH_END
      );
      this.contrasthandler = null;
    }
  }
  moveHandel(movement, slider) {
    if (!this.moveActive) {
      return;
    }
    const relativeOffset = movement.endPosition.x;
    const splitPosition = (slider.offsetLeft + relativeOffset) / slider.parentElement.offsetWidth;
    slider.style.left = `${100 * (splitPosition < 0 ? 0 : splitPosition > 1 ? 1 : splitPosition)}%`;
    this.viewer.scene.splitPosition = splitPosition;
  }
  // 获取三维模型边界
  getModelBounds(model) {
    if (!model) return;
    const o_crd = MapBaseHelper$1.c3ToCoordinates(model.boundingSphere.center);
    const offset_degree = model.boundingSphere.radius * 180 / 200375083427892e-7;
    if (o_crd && Array.isArray(o_crd)) {
      const bounds = [
        o_crd[0] - offset_degree,
        o_crd[1] - offset_degree,
        o_crd[0] + offset_degree,
        o_crd[1] + offset_degree
      ];
      return bounds;
    }
    return null;
  }
  /**
   * 移除单个3d瓦片
   * @param id 3Dtileset瓦片唯一标识
   */
  remove3DTileset(id) {
    const _tilesetModelList = this.amapAdapter.amapOperations.tilesetModelList;
    if (_tilesetModelList && _tilesetModelList.length) {
      const index = _tilesetModelList.findIndex((t) => t._id === id);
      if (index !== -1) {
        this.viewer.scene.primitives.remove(_tilesetModelList[index]);
        LCCModelHelper.destroyLccObject(_tilesetModelList[index]);
        _tilesetModelList.splice(index, 1);
      }
    }
  }
  /**
   * 移除多个3d瓦片
   * @param ids 3Dtileset瓦片唯一标识集合
   */
  removeMultiple3DTileset(ids) {
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      this.remove3DTileset(id);
    }
  }
  /**
   * 添加地形图层
   * @param url 地形图层数据地址
   */
  async addTerrain(url) {
    this.terrainState = 1;
    this.viewer.terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(
      url
    );
    this.terrain = this.viewer.terrainProvider;
    this.resetModelMatrix();
    return this.terrain;
  }
  // 设置模型样式
  set3DTileStyleClicked(id, color, alpha = 1) {
    const _tilesetModelList = this.amapAdapter.amapOperations.tilesetModelList;
    if (_tilesetModelList && _tilesetModelList.length) {
      const index = _tilesetModelList.findIndex((t) => t._id === id);
      if (index !== -1) {
        const model = _tilesetModelList[index];
        const rgba = hexToRGBA(color, alpha);
        const _color = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]},  ${rgba[3]})`;
        if (model.style) {
          const style = new Cesium.Cesium3DTileStyle();
          style.color = _color;
          model.style = style;
        } else {
          const style = new Cesium.Cesium3DTileStyle();
          style.color = _color;
          model.style = style;
        }
      }
    }
  }
  /**
   * 地形只可以有一个
   * 移除地形图层
   */
  removeTerrain() {
    this.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider({});
    this.terrainState = 0;
  }
  /**
   * 获取地形高度
   * @param x 经度
   * @param y 纬度
   * @param terrainProvider 地形
   * @param callBack 回调函数
   */
  getTerrainHeight(x2, y2, terrainProvider, callBack) {
    if (callBack) {
      try {
        const positions = [Cesium.Cartographic.fromDegrees(x2, y2)];
        if (terrainProvider) {
          const promise = Cesium.sampleTerrainMostDetailed(
            terrainProvider,
            positions
          );
          promise.then(callBack);
        } else {
          callBack(null);
        }
      } catch (e) {
        callBack(null);
      }
    }
  }
  getAwaitTerrainHeights(crds, terrainProvider) {
    return new Promise(async (resolve, reject) => {
      let aphicCrds = [];
      let ncrd = [];
      crds.forEach((crd) => {
        aphicCrds.push(Cesium.Cartographic.fromDegrees(crd[0], crd[1]));
      });
      if (terrainProvider) {
        const promise = await Cesium.sampleTerrainMostDetailed(
          terrainProvider,
          aphicCrds,
          true
        );
        promise.forEach((cartographic, index) => {
          ncrd.push([...crds[index], cartographic.height.toFixed(2)]);
        });
        resolve(ncrd);
      }
    });
  }
  /**
   * 获取模型高度
   * @param x 经度
   * @param y 纬度
   * @param callBack 回调函数
   */
  getModelHeight(x2, y2, callBack) {
    return new Promise(async (resolve, reject) => {
      const positions = [Cesium.Cartesian3.fromDegrees(x2, y2)];
      let promise = await this.viewer.scene.clampToHeightMostDetailed(
        positions
      );
      if (!promise[0]) {
        let crd = this.pixelToCoordinates(x2, y2) || [];
        promise = [Cesium.Cartesian3.fromDegrees(...crd)];
      }
      resolve(promise);
    });
  }
  /**
   * 水淹分析多边形带波纹
   * @param params
   */
  // addWaterFlood2(
  //   params: {
  //     id: string;
  //     show?: boolean;
  //     height?: number;
  //     extrudedHeight?: number;
  //     material?: any;
  //     coord: number[];
  //     holes?: number[][];
  //     perPositionHeight?: boolean;
  //     closeTop?: boolean;
  //     closeBottom?: boolean;
  //     style?: any;
  //   },
  //   areaRangeNum?: number
  // ) {
  //   const {
  //     id,
  //     show = true,
  //     height,
  //     extrudedHeight,
  //     material,
  //     coord,
  //     holes,
  //     perPositionHeight = false,
  //     closeTop = true,
  //     closeBottom = true,
  //     style,
  //   } = params;
  //   let granularity = Math.PI / Math.pow(2, 12);
  //   const area = areaRangeNum ? areaRangeNum / 10 : 1;
  //   granularity = (granularity / 64) * area;
  //   let geo = null;
  //   this.amapAdapter.waterFloodMap.set(id, {
  //     primitive: null,
  //     height: height,
  //     extrudedHeight: extrudedHeight,
  //     coord: coord,
  //   });
  //   if (holes && holes.length > 0) {
  //     const holeList: any[] = [];
  //     holes.forEach((hole: any) => {
  //       holeList.push(
  //         new Cesium.PolygonHierarchy(
  //           Cesium.Cartesian3.fromDegreesArrayHeights(hole)
  //         )
  //       );
  //     });
  //     geo = new Cesium.PolygonGeometry({
  //       polygonHierarchy: new Cesium.PolygonHierarchy(
  //         Cesium.Cartesian3.fromDegreesArrayHeights(coord),
  //         holeList
  //       ),
  //       vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
  //     });
  //     // console.log('holeList', holeList);
  //   } else {
  //     geo = new Cesium.PolygonGeometry({
  //       polygonHierarchy: new Cesium.PolygonHierarchy(
  //         Cesium.Cartesian3.fromDegreesArrayHeights(coord)
  //       ),
  //       vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
  //       extrudedHeight: extrudedHeight,
  //       height: height,
  //       closeTop: closeTop,
  //       // granularity: Math.PI / Math.pow(2, 12) / 64,
  //       perPositionHeight: perPositionHeight,
  //       granularity: granularity,
  //       closeBottom: closeBottom,
  //     });
  //   }
  //   const color = Cesium.Color.fromCssColorString(style.color || "#409dfd");
  //   color.alpha = style.opacity || 0.5;
  //   const polygonInstance = new Cesium.GeometryInstance({
  //     geometry: geo,
  //     attributes: {
  //       color: Cesium.ColorGeometryInstanceAttribute.fromColor(color),
  //     },
  //   });
  //   // 创建水面效果
  //   const waterMaterial = material
  //     ? material
  //     : new Cesium.Material({
  //         fabric: {
  //           type: "Water",
  //           uniforms: {
  //             faceForward: true,
  //             baseWaterColor: color,
  //             normalMap: "./MyMapaAdapter/Cesium/Image/waterNormals.jpg",
  //             frequency: 1000.0,
  //             animationSpeed: 0.005,
  //             amplitude: 10,
  //             specularIntensity: 5,
  //           },
  //         },
  //       });
  //   // 创建立体多边形的Primitive
  //   const polygonPrimitive = new Cesium.Primitive({
  //     show: show,
  //     classificationType: Cesium.ClassificationType.TERRAIN,
  //     geometryInstances: polygonInstance,
  //     appearance: new Cesium.EllipsoidSurfaceAppearance({
  //       material: waterMaterial,
  //     }),
  //     compressVertices: false,
  //     releaseGeometryInstances: false,
  //     allowPicking: true,
  //     asynchronous: true,
  //     cull: false,
  //   });
  //   // 添加立体多边形的Primitive到场景
  //   const primitive = this.viewer.scene.primitives.add(polygonPrimitive);
  //   primitive._id = id;
  //   primitive._params = params;
  //   this.amapAdapter.waterFloodMap.set(id, {
  //     primitive: primitive,
  //     height: this.amapAdapter.waterFloodMap.get(id).height,
  //     initialHeight: height,
  //   });
  //   return primitive;
  // }
  /**
   * 水淹分析多边形带波纹
   * @param params
   */
  addWaterFlood2(params, areaRangeNum) {
    const {
      id,
      show = true,
      height,
      extrudedHeight,
      material,
      closeTop = true,
      closeBottom = true,
      coord,
      holes,
      style
    } = params;
    let granularity2 = Math.PI / Math.pow(2, 12);
    const area = areaRangeNum ? areaRangeNum / 10 : 1;
    granularity2 = granularity2 / 64 * area;
    this.amapAdapter.waterFloodMap.set(id, {
      primitive: null,
      height,
      extrudedHeight,
      coord
    });
    const holeList = [];
    if (holes && holes.length > 0) {
      holes.forEach((hole) => {
        holeList.push(
          new Cesium.PolygonHierarchy(
            Cesium.Cartesian3.fromDegreesArrayHeights(hole)
          )
        );
      });
    }
    const polygonInstance = new Cesium.GeometryInstance({
      geometry: new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(
          Cesium.Cartesian3.fromDegreesArrayHeights(coord),
          holeList
        ),
        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
        extrudedHeight,
        height,
        closeTop,
        // granularity: Math.PI / Math.pow(2, 12) / 64,
        // perPositionHeight: true,
        granularity: granularity2,
        closeBottom
      })
    });
    const color = Cesium.Color.fromCssColorString(style.color || "#409dfd");
    color.alpha = style.opacity || 0.5;
    const waterMaterial = material ? material : new Cesium.Material({
      fabric: {
        type: "Water",
        uniforms: {
          baseWaterColor: color,
          normalMap: "/Cesium/Image/waterNormals.jpg",
          frequency: 1e3,
          animationSpeed: 5e-3,
          amplitude: 10,
          specularIntensity: 5
        }
      }
    });
    const polygonPrimitive = new Cesium.Primitive({
      show,
      geometryInstances: polygonInstance,
      appearance: new Cesium.EllipsoidSurfaceAppearance({
        material: waterMaterial
      }),
      compressVertices: true,
      releaseGeometryInstances: true,
      allowPicking: true,
      asynchronous: true
    });
    const primitive = this.viewer.scene.primitives.add(polygonPrimitive);
    primitive._id = id;
    primitive._params = params;
    this.amapAdapter.waterFloodMap.set(id, {
      primitive,
      height: this.amapAdapter.waterFloodMap.get(id).height,
      initialHeight: height
    });
    return primitive;
  }
  /**
   * 隐藏淹没分析多边形
   * @param id
   */
  hideWaterFlood(id) {
    var _a2;
    if (id) {
      const waterPrimitive = (_a2 = this.amapAdapter.waterFloodMap.get(id)) == null ? void 0 : _a2.primitive;
      if (waterPrimitive) {
        waterPrimitive.show = false;
      }
    }
  }
  /**
   * 移除淹没分析多边形
   * @param id
   */
  showWaterFlood(id) {
    var _a2;
    if (id) {
      const waterPrimitive = (_a2 = this.amapAdapter.waterFloodMap.get(id)) == null ? void 0 : _a2.primitive;
      if (waterPrimitive) {
        waterPrimitive.show = true;
      }
    }
  }
  /**
   * 水淹分析多边形
   * @param params
   */
  addWaterFlood(params) {
    const { id, height, coord, style } = params;
    if (this.amapAdapter.waterFloodMap.get(id)) {
      return;
    }
    this.amapAdapter.waterFloodMap.set(id, {
      entity: null,
      height,
      coord
    });
    const color = Cesium.Color.fromCssColorString(style.color || "#409dfd");
    color.alpha = style.opacity || 0.5;
    const waterEntity = this.viewer.entities.add({
      id,
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(coord),
        closeTop: true,
        closeBottom: true,
        // granularity: Math.PI / Math.pow(2, 11) / 64,
        fill: true,
        material: color,
        classificationType: Cesium.ClassificationType.BOTH,
        perPositionHeight: true,
        extrudedHeight: new Cesium.CallbackProperty(() => {
          return this.amapAdapter.waterFloodMap.get(id).height;
        }, false)
      }
    });
    this.amapAdapter.waterFloodMap.set(id, {
      entity: waterEntity,
      height: this.amapAdapter.waterFloodMap.get(id).height
    });
    return this.amapAdapter.waterFloodMap.get(id);
  }
  /**
   * 水淹分析多边形带波纹
   * @param params
   */
  addWaterVaoFlood(params) {
    const { id, show = true, material, vaoObj, style } = params;
    const instances = [];
    this.amapAdapter.waterFloodMap.set(id, {
      primitive: null,
      coord: vaoObj
    });
    const geometry = VaoGraphicHelper.createVAOGeometry(vaoObj);
    const instance = VaoGraphicHelper.createInstanceByGeometry(
      geometry,
      id,
      null
    );
    instances.push(instance);
    const color = Cesium.Color.fromCssColorString("#409dfd");
    color.alpha = 0.5;
    const waterMaterial = material ? material : new Cesium.Material({
      fabric: {
        type: "Water",
        uniforms: {
          faceForward: true,
          baseWaterColor: color,
          normalMap: "./MyMapaAdapter/Cesium/Image/waterNormals.jpg",
          frequency: 1e3,
          animationSpeed: 5e-3,
          amplitude: 10,
          specularIntensity: 5
        }
      }
    });
    const polygonPrimitive = new Cesium.Primitive({
      show,
      geometryInstances: instances,
      appearance: new Cesium.EllipsoidSurfaceAppearance({
        material: waterMaterial
      }),
      compressVertices: true,
      releaseGeometryInstances: true,
      allowPicking: true,
      asynchronous: true,
      cull: false
    });
    const primitive = this.viewer.scene.primitives.add(polygonPrimitive);
    primitive._id = id;
    primitive._params = params;
    this.amapAdapter.waterFloodMap.set(id, {
      primitive
    });
    return primitive;
  }
  /**
   * 更新多边形高度
   * @param id 水淹分析多边形id
   * @param num
   */
  updateWaterFlood(id, num) {
    this.amapAdapter.waterFloodMap.get(id).height += num;
    return this.amapAdapter.waterFloodMap.get(id).height;
  }
  // 重置立方体高度
  resetWaterFoll(id) {
    this.amapAdapter.waterFloodMap.get(id).height = this.amapAdapter.waterFloodMap.get(id).initialHeight;
  }
  /**
   * 移除淹没分析多边形
   * @param id
   */
  removeWaterFlood(id) {
    var _a2, _b2;
    const waterEntity = (_a2 = this.amapAdapter.waterFloodMap.get(id)) == null ? void 0 : _a2.entity;
    const waterPrimitive = (_b2 = this.amapAdapter.waterFloodMap.get(id)) == null ? void 0 : _b2.primitive;
    if (waterEntity) {
      this.viewer.entities.remove(waterEntity);
    }
    if (waterPrimitive) {
      this.viewer.scene.primitives.remove(waterPrimitive);
    }
    this.amapAdapter.waterFloodMap.delete(id);
  }
  /**
   * 添加动态墙体效果
   * @param params
   */
  addDynamicWall(params) {
    const {
      id,
      show = true,
      positions,
      maximumHeights,
      minimumHeights,
      duration = 2e3,
      style
    } = params;
    const { color = "#ffffff", opacity = 0.7 } = style;
    const primitive = this.viewer.entities.add({
      id,
      show,
      name: id,
      wall: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(positions),
        maximumHeights,
        minimumHeights,
        material: new Cesium.DynamicWallMaterialProperty({
          color,
          alpha: opacity,
          duration,
          viewer: this.viewer
        })
      }
    });
    this.amapAdapter.dynamicWallMap.set(id, primitive);
  }
  /**
   * 移除动态墙体效果
   * @param id
   */
  removeDynamicWall(id) {
    if (id) {
      const entity = this.amapAdapter.dynamicWallMap.get(id);
      if (entity) {
        this.viewer.entities.remove(entity);
      }
      this.amapAdapter.dynamicWallMap.delete(id);
    }
  }
  /**
   * 创建白膜图层
   * @param params
   * @returns
   */
  addThirdPolygon(params) {
    const instances = [];
    let instance = null;
    const { id, postions } = params;
    const _color = Cesium.Color.fromCssColorString("#ffffff");
    _color.alpha = 0.8;
    postions.forEach((polygon, index) => {
      instance = new Cesium.GeometryInstance({
        id: polygon.id ? polygon.id : `polygon-${index}`,
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(
            Cesium.Cartesian3.fromDegreesArrayHeights(polygon.postions)
          ),
          vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
          perPositionHeight: true,
          closeTop: true,
          closeBottom: true,
          height: 1
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(_color)
        }
      });
      instances.push(instance);
    });
    const polygonPrimitive = new Cesium.Primitive({
      id,
      geometryInstances: instances,
      appearance: new Cesium.PerInstanceColorAppearance({
        flat: true,
        faceForward: true,
        aboveGround: true,
        translucent: true,
        closed: false
      }),
      compressVertices: true,
      releaseGeometryInstances: false,
      allowPicking: true,
      asynchronous: true
    });
    const primitive = this.amapAdapter.layerOperations.primitiveCollection.add(
      polygonPrimitive
    );
    primitive._id = id;
    this.amapAdapter.layerOperations.multipleThirdPolygon[id] = primitive;
    return primitive;
  }
  /**
   * 移除白膜图层
   * @param id
   */
  removeThirdPolygon(id) {
    const thirdPolygon = this.amapAdapter.layerOperations.multipleThirdPolygon[id];
    if (thirdPolygon) {
      this.amapAdapter.layerOperations.primitiveCollection.remove(
        this.amapAdapter.layerOperations.multipleThirdPolygon[id]
      );
      delete this.amapAdapter.layerOperations.multipleThirdPolygon[id];
    }
  }
  /**
   * 移除多个白膜图层
   * @param ids
   */
  removeMultipleThirdPolygon(ids) {
    if (ids && Array.isArray(ids)) {
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        this.removeThirdPolygon(id);
      }
    }
  }
  /**
   * 隐藏白膜图层
   * @param id
   */
  hideThirdPolygon(id) {
    const thirdPolygon = this.amapAdapter.layerOperations.multipleThirdPolygon[id];
    if (thirdPolygon) {
      thirdPolygon.show = false;
    }
  }
  /**
   * 显示白膜图层
   * @param id
   */
  showThirdPolygon(id) {
    const thirdPolygon = this.amapAdapter.layerOperations.multipleThirdPolygon[id];
    if (thirdPolygon) {
      thirdPolygon.show = true;
    }
  }
  /**
   * 添加围栏
   * @param crdArr 坐标数组 二维
   * @param pLen 是否带高度  3带高度 2不带高度
   * @param color 颜色
   * @param alpha 透明度
   * @returns
   */
  addwalls(id, crdArr, pLen, show = true, color, alpha = 1) {
    if (this.amapAdapter.waterFloodMap.get(id)) {
      return this.amapAdapter.waterFloodMap.get(id).primitive;
    }
    let wall = null;
    let _color = null;
    if (crdArr && crdArr.length > 0) {
      _color = Cesium.Color.fromCssColorString(color);
      _color.alpha = alpha;
      const instances = [];
      let instance = null;
      let geometry = null;
      let appearance = null;
      for (let i = 0; i < crdArr.length; i++) {
        geometry = this.createWallGeometry(crdArr[i], pLen);
        instance = new Cesium.GeometryInstance({
          id: "wall" + i,
          geometry,
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(_color)
          }
        });
        instances.push(instance);
      }
      appearance = new Cesium.PerInstanceColorAppearance({
        flat: true,
        faceForward: true,
        translucent: false
        // closed: true
      });
      wall = new Cesium.Primitive({
        id,
        show,
        geometryInstances: instances,
        appearance,
        compressVertices: true,
        releaseGeometryInstances: true,
        allowPicking: false,
        asynchronous: false
      });
      wall = this.viewer.scene.primitives.add(wall);
      this.amapAdapter.waterFloodMap.set(id, {
        primitive: wall
      });
    }
    return wall;
  }
  createWallGeometry(crds, pLen) {
    let c3s = null;
    if (pLen == 3) {
      c3s = Cesium.Cartesian3.fromDegreesArrayHeights(crds);
    } else {
      c3s = Cesium.Cartesian3.fromDegreesArray(crds);
    }
    let geometry = new Cesium.WallGeometry({
      positions: c3s
    });
    geometry = Cesium.WallGeometry.createGeometry(geometry);
    return geometry;
  }
  /**
   * 移除淹没分析多边形
   * @param id
   */
  removeWalls(id) {
    var _a2;
    if (id) {
      const waterPrimitive = (_a2 = this.amapAdapter.waterFloodMap.get(id)) == null ? void 0 : _a2.primitive;
      if (waterPrimitive) {
        this.viewer.scene.primitives.remove(waterPrimitive);
      }
      this.amapAdapter.waterFloodMap.delete(id);
    }
  }
  /**
   * 创建挖空地形多边形
   * @param id 唯一标识
   * @param crds 创建挖空多边形所需坐标
   * @param pLen 坐标是否带高度 3带高度 2不带高度
   * @returns
   */
  createClippingPolygonTerrain(id, show = true, crds, pLen = 2) {
    if (this.amapAdapter.clippingPolygons[id]) {
      return;
    }
    if (!this.viewer.scene.globe.clippingPolygons) {
      this.viewer.scene.globe.clippingPolygons = new Cesium.ClippingPolygonCollection({
        polygons: []
      });
    }
    const cp1 = this.createClippingPolygon(crds, pLen);
    if (show) {
      this.amapAdapter.clippingPolygons[id] = this.viewer.scene.globe.clippingPolygons.add(cp1);
    } else {
      this.amapAdapter.clippingPolygons[id] = cp1;
    }
    this.amapAdapter.clippingPolygons[id].show = show;
  }
  showClippingSurface(id, crds, pLen, h, bottomimg, wallImg, show = true) {
    if (crds && crds.length > 0) {
      let bottom = this.createPolygonBottom(crds, pLen, h, bottomimg, show);
      let wall = this.createPolygonWall(crds, pLen, h, wallImg, show);
      this.amapAdapter.clippingSurfacePolygons[id] = {
        bottom,
        wall
      };
      return { bottom, wall };
    }
    return null;
  }
  createPolygonBottom(crds, pLen, h, img, show) {
    let options = {
      polygonHierarchy: null,
      height: void 0,
      extrudedHeight: void 0,
      // granularity=granularity;
      perPositionHeight: false,
      closeTop: true,
      closeBottom: true
    };
    options.height = h;
    let geometry = GraphicHelper.createPolygonGeometry(crds, pLen, options);
    let polygonInstance = new Cesium.GeometryInstance({
      geometry,
      id: "clipBottom"
      // attributes : {}
    });
    let appearance = GraphicHelper.createImgAppearance(img);
    let polygon = new Cesium.Primitive({
      show,
      geometryInstances: [polygonInstance],
      appearance,
      compressVertices: false,
      releaseGeometryInstances: false,
      allowPicking: false,
      asynchronous: false
      // shadows:Cesium.ShadowMode.ENABLED,
    });
    polygon = this.viewer.scene.primitives.add(polygon);
    return polygon;
  }
  createPolygonWall(crds, pLen, h, img, show) {
    let options = {
      polygonHierarchy: null,
      height: void 0,
      extrudedHeight: void 0,
      // granularity=granularity;
      perPositionHeight: false,
      closeTop: true,
      closeBottom: true
    };
    options.minimumHeights = this.getWallMinimumHeights(h, crds.length / pLen);
    let geometry = GraphicHelper.createWallGeometry(crds, pLen, options);
    let instance = new Cesium.GeometryInstance({
      id: "clipWall",
      geometry
    });
    let appearance = GraphicHelper.createImgAppearance(img);
    let wall = new Cesium.Primitive({
      show,
      geometryInstances: [instance],
      appearance,
      compressVertices: true,
      releaseGeometryInstances: true,
      allowPicking: false,
      asynchronous: false
    });
    wall = this.viewer.scene.primitives.add(wall);
    return wall;
  }
  getWallMinimumHeights(h, len) {
    let arr = [];
    for (let i = 0; i < len; i++) {
      arr.push(h);
    }
    return arr;
  }
  /**
   * 移除挖空地形多边形
   * @param id 唯一标识
   * @returns
   */
  removeClippingPolygonTerrain(id) {
    if (!id) return;
    const cli = this.amapAdapter.clippingPolygons[id];
    const cliBgc = this.amapAdapter.clippingSurfacePolygons[id];
    if (cli) {
      this.viewer.scene.globe.clippingPolygons.remove(cli);
      delete this.amapAdapter.clippingPolygons[id];
    }
    if (cliBgc) {
      for (const key in cliBgc) {
        this.viewer.scene.primitives.remove(cliBgc[key]);
      }
      delete this.amapAdapter.clippingSurfacePolygons[id];
    }
  }
  /**
   * 隐藏挖空地形多边形
   * @param id 唯一标识
   * @returns
   */
  hideClippingPolygonTerrain(id) {
    if (!id) return;
    const cli = this.amapAdapter.clippingPolygons[id];
    const surface = this.amapAdapter.clippingSurfacePolygons[id];
    if (cli) {
      this.viewer.scene.globe.clippingPolygons.remove(cli);
      cli.show = false;
    }
    if (surface) {
      for (const key in surface) {
        surface[key].show = false;
      }
    }
  }
  /**
   * 显示挖空地形多边形
   * @param id 唯一标识
   * @returns
   */
  showClippingPolygonTerrain(id) {
    if (!id) return;
    const cli = this.amapAdapter.clippingPolygons[id];
    const surface = this.amapAdapter.clippingSurfacePolygons[id];
    if (cli) {
      this.viewer.scene.globe.clippingPolygons.add(cli);
      cli.show = true;
    }
    if (surface) {
      for (const key in surface) {
        surface[key].show = true;
      }
    }
  }
  hideAllClippingPolygonTerrain() {
    for (const key in this.amapAdapter.clippingPolygons) {
      this.hideClippingPolygonTerrain(key);
    }
  }
  showAllClippingPolygonTerrain() {
    for (const key in this.amapAdapter.clippingPolygons) {
      this.showClippingPolygonTerrain(key);
    }
  }
  resetClippingPolygonTerrain() {
    let timer = setTimeout(() => {
      if (this.viewer && this.viewer.terrainProvider && this.viewer.terrainProvider._scheme) {
        this.showAllClippingPolygonTerrain();
      } else {
        this.hideAllClippingPolygonTerrain();
      }
      clearTimeout(timer);
      timer = null;
    }, 1e3);
  }
  createClippingPolygon(crds, pLen) {
    let clipPolygon = null;
    if (crds) {
      let c3s = null;
      if (pLen == 3) {
        c3s = Cesium.Cartesian3.fromDegreesArrayHeights(crds);
      } else {
        c3s = Cesium.Cartesian3.fromDegreesArray(crds);
      }
      clipPolygon = new Cesium.ClippingPolygon({
        positions: c3s
      });
    }
    return clipPolygon;
  }
  // 将瓦片图层创建在3Dtitle 图层上
  setImageryLayerIn3DTitle(tileset, imageryLayer) {
    if (tileset && imageryLayer)
      tileset.forEach((item) => {
        if (item) {
          item.imageryLayers.add(imageryLayer);
        }
      });
  }
  // 将瓦片图层从3Dtitle 图层上移除
  removeImageryLayerIn3DTitle(tileset, imageryLayer) {
    tileset.forEach((item) => {
      item.imageryLayers.remove(imageryLayer);
    });
  }
}
class MatrixTransformHelper {
  /**
   * 缩放矩阵
   * @param o_c3 中心点 (笛卡尔坐标)
   * @param s_v3 缩放向量 (x,y,z) Array
   * @param o_modelMatrix 原来的矩阵
   */
  static getLocalScaleMatrix4(o_c3, s_v3, o_modelMatrix) {
    let resultMatrix = null;
    if (o_c3 && s_v3) {
      if (!o_modelMatrix) {
        o_modelMatrix = Cesium.Matrix4.fromArray([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      }
      resultMatrix = new Cesium.Matrix4();
      const localToWorld_m4 = Cesium.Transforms.eastNorthUpToFixedFrame(o_c3);
      const worldToLocal_m4 = Cesium.Matrix4.inverse(localToWorld_m4, new Cesium.Matrix4());
      const s_m4 = Cesium.Matrix4.fromScale(new Cesium.Cartesian3(s_v3[0], s_v3[1], s_v3[2]));
      Cesium.Matrix4.multiply(worldToLocal_m4, o_modelMatrix, resultMatrix);
      Cesium.Matrix4.multiply(s_m4, resultMatrix, resultMatrix);
      Cesium.Matrix4.multiply(localToWorld_m4, resultMatrix, resultMatrix);
    }
    return resultMatrix;
  }
  /**
   * 平移矩阵
   * @param s_c3  起点 (笛卡尔坐标)
   * @param e_c3   终点 (笛卡尔坐标)
   * @param o_m4   原来的矩阵
   */
  static getMoveMatrix(s_c3, e_c3, o_m4) {
    let resultMatrix = null;
    if (s_c3 && e_c3) {
      resultMatrix = Cesium.Matrix4.fromTranslation(
        Cesium.Cartesian3.subtract(e_c3, s_c3, new Cesium.Cartesian3())
      );
      if (o_m4) {
        Cesium.Matrix4.multiply(resultMatrix, o_m4, resultMatrix);
      }
    }
    return resultMatrix;
  }
}
const _GeoMath = class _GeoMath {
  constructor() {
  }
  static createAreaRange(crds, cnum, bufferRadius) {
    let ncrds = null;
    let dif = 0, h = 0, minx, miny, maxx, maxy;
    let ncrd = null;
    cnum = cnum ? cnum : 2;
    dif = bufferRadius * 1e-5;
    if (crds.length == cnum) {
      ncrd = crds;
      h = cnum == 2 ? 0 : ncrd[2];
    } else {
      ncrd = _GeoMath.getBoundsCenter(crds, cnum);
      h = cnum == 2 ? 0 : ncrd[2];
    }
    minx = ncrd[0] - dif, miny = ncrd[1] - dif, maxx = ncrd[0] + dif, maxy = ncrd[1] + dif;
    ncrds = [
      minx,
      miny,
      h,
      maxx,
      miny,
      h,
      maxx,
      maxy,
      h,
      minx,
      maxy,
      h,
      minx,
      miny,
      h
    ];
    return ncrds;
  }
  static getPloygonCentroid(crds, cnum) {
    let crd = this.getPloygonCentroid0(crds, cnum);
    if (crds && !this.inPolygon(crd[0], crd[1], crds, cnum)) {
      let polygon = this.getPloygon(crds, cnum);
      let bounds = turf.bbox(polygon);
      let rects = this.createRects(bounds, crd);
      let nPoly = null, nPoint = null, ncrds = [];
      for (let i = 0; i < rects.length; i++) {
        nPoly = turf.intersect(rects[i], polygon);
        if (nPoly) {
          nPoint = turf.centroid(nPoly);
          if (nPoint && turf.booleanPointInPolygon(nPoint, nPoly)) {
            ncrds.push(...nPoint.geometry.coordinates);
          }
        }
      }
      if (ncrds.length > 0) {
        crd = ncrds;
      }
    }
    if (!crd) {
      crd = this.getBoundsCenter(crds);
    }
    return crd;
  }
  static getPloygonCentroid0(crds, cnum) {
    cnum = cnum ? cnum : 2;
    let crd = null;
    if (crds && crds.length >= cnum * 3) {
      let area = 0;
      let Cx = 0;
      let Cy = 0;
      const v0x = crds[0];
      const v0y = crds[1];
      const num = crds.length / cnum;
      let v1x, v1y, v2x, v2y, A, x2, y2;
      for (let i = 1; i < num - 1; i++) {
        v1x = crds[i * cnum + 0] - v0x;
        v1y = crds[i * cnum + 1] - v0y;
        v2x = crds[(i + 1) * cnum + 0] - v0x;
        v2y = crds[(i + 1) * cnum + 1] - v0y;
        A = (v1x * v2y - v2x * v1y) / cnum;
        area += A;
        x2 = 0 + v1x + v2x;
        y2 = 0 + v1y + v2y;
        Cx += A * x2;
        Cy += A * y2;
      }
      Cx = Cx / area / 3 + v0x;
      Cy = Cy / area / 3 + v0y;
      if (Cx && Cy) {
        crd = [Cx, Cy];
      }
    }
    if (crd) {
      return crd;
    } else {
      return this.getBoundsCenter(crds);
    }
  }
  static getBoundsCenter(crds, cnum) {
    let crd = null;
    if (crds && crds.length >= cnum) {
      cnum = cnum ? cnum : 2;
      const bounds = this.getBounds(crds, cnum);
      crd = [
        (bounds[0] + bounds[3]) / 2,
        (bounds[1] + bounds[4]) / 2,
        (bounds[2] + bounds[5]) / 2
      ];
    }
    return crd;
  }
  static getBounds(crds, cnum) {
    let bounds = [];
    cnum = cnum ? cnum : 2;
    if (crds && crds.length > cnum) {
      let h = cnum == 2 ? 0 : crds[2];
      let x2 = crds[0], y2 = crds[1];
      bounds = [x2, y2, h, x2, y2, h];
      let num = crds.length / cnum;
      for (let i = 0; i < num; i++) {
        h = cnum == 2 ? 0 : crds[i * cnum + 2];
        x2 = crds[i * cnum + 0];
        y2 = crds[i * cnum + 1];
        bounds[0] = Math.min(bounds[0], x2);
        bounds[1] = Math.min(bounds[1], y2);
        bounds[2] = Math.min(bounds[2], h);
        bounds[3] = Math.max(bounds[3], x2);
        bounds[4] = Math.max(bounds[4], y2);
        bounds[5] = Math.max(bounds[5], h);
      }
    }
    return bounds;
  }
  static inPolygon(px, py, crds, cnum) {
    cnum = cnum ? cnum : 2;
    let isIn = false;
    if (crds && crds.length >= cnum * 3) {
      let s = 0, index, tlng;
      let num = crds.length / cnum;
      for (let i = 0; i < num; i++) {
        index = (i + 1) % num;
        if (Math.max(crds[i * cnum + 1], crds[index * cnum + 1]) >= py && Math.min(crds[i * cnum + 1], crds[index * cnum + 1]) <= py && crds[i * cnum + 1] != crds[index * cnum + 1]) {
          tlng = (crds[i * cnum + 0] * (py - crds[index * cnum + 1]) + crds[index * cnum + 0] * (crds[i * cnum + 1] - py)) / (crds[i * cnum + 1] - crds[index * cnum + 1]);
          if (px > tlng) {
            if (crds[i * cnum + 1] == py || crds[index * cnum + 1] == py) {
              s += 0.5;
            } else {
              s++;
            }
          }
        }
      }
      if (s % 2 == 1) {
        isIn = true;
      }
    }
    return isIn;
  }
  static inRect(px, py, rect) {
    if (rect) {
      if (px >= rect[0] && px <= rect[2] && py >= rect[1] && py <= rect[3]) {
        return true;
      }
    }
    return false;
  }
  // static getHaversineDistance(p1, p2,radius) {
  //   if(!radius){
  //     radius=6378137;//球体长半轴，默认CGCS2000和wgs84
  //   }
  //   let dLat=(p2[1]-p1[1])*Math.PI/180;
  //   let dLon=(p2[0]-p1[0])*Math.PI/180;
  //   let a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(p1[1]*Math.PI/180)*Math.cos(p2[1]*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
  //   let c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  //   return radius*c;
  // }
  static getHaversineDistance(p1, p2, radius) {
    return this.getSurfaceDistance(p1, p2);
  }
  //距离计算容差
  static lineInterpolationByDistance(crds, dis, vnum) {
    let ncrds = null;
    if (crds) {
      vnum = vnum ? vnum : 2;
      ncrds = [];
      let n = crds.length / vnum;
      let inCrds = null;
      let sx, sy, ex, ey;
      let offset_dis = 0;
      for (let i = 0; i < n - 1; i++) {
        sx = crds[i * vnum + 0], sy = crds[i * vnum + 1], ex = crds[(i + 1) * vnum + 0], ey = crds[(i + 1) * vnum + 1];
        if (i == 0) {
          ncrds.push(sx);
          ncrds.push(sy);
        }
        inCrds = this.getInterpolationPointsByDistance(
          [sx, sy],
          [ex, ey],
          dis,
          offset_dis
        );
        if (inCrds) {
          ncrds.push(...inCrds);
          offset_dis = dis - this.getSurfaceDistance(
            [inCrds[inCrds.length - 2], inCrds[inCrds.length - 1]],
            [ex, ey]
          );
        } else {
          offset_dis = offset_dis - this.getSurfaceDistance([sx, sy], [ex, ey]);
        }
        ncrds.push(ex);
        ncrds.push(ey);
      }
    }
    return ncrds;
  }
  static getInterpolationPointsByDistance(p1, p2, dis, offsetDis) {
    let coefficient = 1e-9;
    let ncrds = null;
    if (dis > 0) {
      const geodesic = new Cesium.EllipsoidGeodesic(
        Cesium.Cartographic.fromDegrees(p1[0], p1[1]),
        Cesium.Cartographic.fromDegrees(p2[0], p2[1]),
        Cesium.Ellipsoid.WGS84
      );
      let distance2 = geodesic.surfaceDistance;
      let d = 0;
      let cartographic = null;
      let count = 0;
      let x2, y2;
      if (offsetDis > this.minDistance) {
        if (offsetDis < distance2) {
          cartographic = geodesic.interpolateUsingSurfaceDistance(
            offsetDis,
            cartographic
          );
          x2 = Cesium.Math.toDegrees(cartographic.longitude);
          y2 = Cesium.Math.toDegrees(cartographic.latitude);
          ncrds = [x2, y2];
          p1 = [x2, y2];
        }
        d += offsetDis;
      }
      if (distance2 - d > dis) {
        if (!ncrds) {
          ncrds = [];
        }
        count = Math.floor((distance2 - d) / dis);
        for (let i = 1; i <= count; i++) {
          d += dis;
          cartographic = geodesic.interpolateUsingSurfaceDistance(
            d,
            cartographic
          );
          x2 = Cesium.Math.toDegrees(cartographic.longitude);
          y2 = Cesium.Math.toDegrees(cartographic.latitude);
          if (i == count) {
            if (Math.abs(x2 - p2[0]) < coefficient && Math.abs(y2 - p2[1]) < coefficient) {
              continue;
            }
          }
          ncrds.push(x2);
          ncrds.push(y2);
        }
      }
    }
    return ncrds;
  }
  static getSurfaceDistance(p1, p2) {
    const s = Cesium.Cartographic.fromDegrees(p1[0], p1[1]);
    const e = Cesium.Cartographic.fromDegrees(p2[0], p2[1]);
    const geodesic = new Cesium.EllipsoidGeodesic(s, e, Cesium.Ellipsoid.WGS84);
    return geodesic.surfaceDistance;
  }
  // static lineInterpolationByDistance(crds,dis,vnum){
  //   let ncrds=null;
  //   if(crds){
  //     vnum=vnum?vnum:2;
  //     ncrds=[];
  //     let n=crds.length/vnum;
  //     let inCrds=null;
  //     let sx,sy,ex,ey;
  //     let offset_dis=0;
  //     for(let i=0;i<n-1;i++){
  //       sx=crds[i*vnum+0],
  //       sy=crds[i*vnum+1],
  //       ex=crds[(i+1)*vnum+0],
  //       ey=crds[(i+1)*vnum+1];
  //       if(i==0){
  //         ncrds.push(sx);
  //         ncrds.push(sy);
  //       }
  //       inCrds=this.getInterpolationPointsByDistance([sx,sy],[ex,ey],dis,offset_dis);
  //       if(inCrds){//有插入点
  //         ncrds.push(...inCrds);
  //         //计算下一段的偏移量
  //         offset_dis=dis-this.getHaversineDistance([inCrds[inCrds.length-2],inCrds[inCrds.length-1]],[ex,ey]);
  //       }else{//无插入点
  //         //计算下一段的偏移量
  //         offset_dis=offset_dis-this.getHaversineDistance([sx,sy],[ex,ey]);
  //       }
  //       ncrds.push(ex);
  //       ncrds.push(ey);
  //     }
  //   }
  //   return ncrds;
  // }
  // static getInterpolationPointsByDistance(p1,p2,dis,offsetDis){
  //   let coefficient=0.000000001;
  //   let ncrds=null;
  //   if(dis>0){
  //     let distance=this.getHaversineDistance(p1,p2);
  //     let count=0,step;
  //     let x,y;
  //     if(offsetDis>this.minDistance){//有偏移，处理偏移
  //       if(offsetDis<distance){//偏移小于两点距离，那么插入偏移点
  //         step=this.getStepByDistance(p1,p2,distance,offsetDis);
  //         x=p1[0]+step[0];
  //         y=p1[1]+step[1];
  //         ncrds=[x,y];
  //         p1=[x,y];//将开始点移到插入点
  //       }
  //       distance=distance-offsetDis;
  //     }
  //     if(distance>dis){
  //       if(!ncrds){
  //         ncrds=[];
  //       }
  //       // ncrds.push(p1[0]);
  //       // ncrds.push(p1[1]);
  //       step=this.getStepByDistance(p1,p2,distance,dis);
  //       count=Math.floor(step[2]);
  //       for(let i=1;i<=count;i++){
  //         x=p1[0]+step[0]*i;
  //         y=p1[1]+step[1]*i;
  //         if(i==count){
  //           if(Math.abs(x-p2[0])<coefficient&&Math.abs(y-p2[1])<coefficient){
  //             continue;
  //           }
  //         }
  //         ncrds.push(x);
  //         ncrds.push(y);
  //       }
  //       // ncrds.push(p2[0]);
  //       // ncrds.push(p2[1]);
  //     }
  //   }
  //   return ncrds;
  // }
  static getStepByDistance(sPoint, ePoint, distance2, step) {
    let count = distance2 / step;
    let dx = (ePoint[0] - sPoint[0]) / count;
    let dy = (ePoint[1] - sPoint[1]) / count;
    return [dx, dy, count];
  }
  static getSphereDistance(p1, p2) {
    const EarthRadius = 6371e3;
    const distance2 = EarthRadius * Math.acos(
      Math.cos(p1[0] * Math.PI / 180 - p2[0] * Math.PI / 180) * Math.cos(p1[1] * Math.PI / 180) * Math.cos(p2[1] * Math.PI / 180) + Math.sin(p1[1] * Math.PI / 180) * Math.sin(p2[1] * Math.PI / 180)
    );
    return distance2;
  }
  static getAngle(sx, sy, ex, ey) {
    let dx = Math.abs(ex - sx);
    dx = ex - sx;
    let dy = ey - sy;
    let angle = 90;
    if (dx != 0) {
      angle = Math.atan2(dy, dx);
    }
    angle = -angle;
    if (dx < 0) {
      angle += Math.PI;
    }
    return angle;
  }
  static isClockwise(crds, pLen) {
    if (!pLen) {
      pLen = 2;
    }
    let length = crds.length / pLen;
    let v = 0;
    if (length > 2) {
      if (!this.isClosed(crds, pLen)) {
        crds = crds.slice();
        for (let i = 0; i < pLen; i++) {
          crds.push(crds[i]);
        }
        length = crds.length / pLen;
      }
      let j = 0;
      for (let i = 0; i < length - 1; i++) {
        j = i + 1;
        v += -0.5 * (crds[j * pLen + 0] - crds[i * pLen + 0]) * (crds[j * pLen + 1] + crds[i * pLen + 1]);
      }
    }
    return v < 0;
  }
  static isClosed(crds, pLen) {
    if (!pLen) {
      pLen = 2;
    }
    let length = crds.length / pLen;
    let v = false;
    if (crds[0] == crds[(length - 1) * pLen + 0] && crds[1] == crds[(length - 1) * pLen + 1]) {
      if (pLen == 2) {
        v = true;
      } else if (pLen == 3) {
        if (crds[2] == crds[(length - 1) * pLen + 2]) {
          v = true;
        }
      }
    }
    return v;
  }
  static isConvex(crds, pLen) {
    if (!pLen) {
      pLen = 2;
    }
    let n = crds.length / pLen;
    let determinant;
    let v = false;
    for (let i = 0; i < n; i++) {
      let j = (i + 1) % n, k = (i + 2) % n;
      determinant = (crds[j * pLen + 0] - crds[i * pLen + 0]) * (crds[k * pLen + 1] - crds[j * pLen + 1]) - (crds[j * pLen + 1] - crds[i * pLen + 1]) * (crds[k * pLen + 0] - crds[j * pLen + 0]);
      if (determinant < 0) {
        return false;
      }
      if (determinant != 0) {
        v = true;
      }
    }
    return v;
  }
  static isConvex1(crds, pLen) {
    if (!pLen) {
      pLen = 2;
    }
    let n = crds.length / pLen;
    let v = false;
    if (n >= 3) {
      let j, k, z2;
      let flag2 = 0;
      for (let i = 0; i < n; i++) {
        j = (i + 1) % n;
        k = (i + 2) % n;
        z2 = (crds[j * pLen + 0] - crds[i * pLen + 0]) * (crds[k * pLen + 1] - crds[j * pLen + 1]);
        z2 -= (crds[j * pLen + 1] - crds[i * pLen + 1]) * (crds[k * pLen + 0] - crds[j * pLen + 0]);
        if (z2 < 0) {
          flag2 |= 1;
        } else if (z2 > 0) {
          flag2 |= 2;
        }
        if (flag2 == 3) {
          v = false;
          break;
        }
      }
      if (flag2 != 0) {
        v = true;
      }
    }
    return v;
  }
};
__publicField(_GeoMath, "viewer", null);
__publicField(_GeoMath, "tileModels", []);
__publicField(_GeoMath, "minDistance", 0.01);
let GeoMath = _GeoMath;
class GeoMath3D {
  static computeNormal(crds, m4) {
    let c1 = Cesium.Cartesian3.fromDegrees(crds[3 * 0 + 0], crds[3 * 0 + 1], crds[3 * 0 + 2]);
    let c2 = Cesium.Cartesian3.fromDegrees(crds[3 * 1 + 0], crds[3 * 1 + 1], crds[3 * 1 + 2]);
    let c3 = Cesium.Cartesian3.fromDegrees(crds[3 * 2 + 0], crds[3 * 2 + 1], crds[3 * 2 + 2]);
    if (m4) {
      c1 = Cesium.Matrix4.multiplyByPoint(m4, c1, new Cesium.Cartesian3());
      c2 = Cesium.Matrix4.multiplyByPoint(m4, c2, new Cesium.Cartesian3());
      c3 = Cesium.Matrix4.multiplyByPoint(m4, c3, new Cesium.Cartesian3());
    }
    return this.computeNormalByC3(c1, c2, c3);
  }
  static computeNormalByC3(p1, p2, p3) {
    const normal = Cesium.Cartesian3.cross(
      Cesium.Cartesian3.subtract(p2, p1, new Cesium.Cartesian3()),
      Cesium.Cartesian3.subtract(p3, p1, new Cesium.Cartesian3()),
      new Cesium.Cartesian3()
    );
    Cesium.Cartesian3.normalize(normal, normal);
    return normal;
  }
  static getMatrixByNormal(op, normal) {
    let n_m4 = null;
    const oc3 = Cesium.Cartesian3.fromDegrees(op[0], op[1], op[2]);
    const localToWorld_m4 = Cesium.Transforms.eastNorthUpToFixedFrame(oc3);
    const worldToLocal_m4 = Cesium.Matrix4.inverse(localToWorld_m4, new Cesium.Matrix4());
    const v_z = new Cesium.Cartesian3(0, 0, normal.z);
    const v_d_p = Cesium.Cartesian3.subtract(normal, v_z, new Cesium.Cartesian3());
    let a1 = Cesium.Cartesian3.angleBetween(v_z, normal);
    const v_y = new Cesium.Cartesian3(0, normal.y, 0);
    let a_ny = Cesium.Cartesian3.angleBetween(v_y, v_d_p);
    if (normal.y > 0) {
      a1 = -a1;
      if (normal.x > 0) {
        a_ny = -a_ny;
      }
    } else {
      if (normal.x < 0) {
        a_ny = -a_ny;
      }
    }
    n_m4 = Cesium.Matrix4.fromArray([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    Cesium.Matrix4.multiply(worldToLocal_m4, n_m4, n_m4);
    const rx_m3 = Cesium.Matrix3.fromRotationX(a1);
    const rx_m4 = Cesium.Matrix4.fromRotation(rx_m3);
    Cesium.Matrix4.multiply(rx_m4, n_m4, n_m4);
    const rz_m3 = Cesium.Matrix3.fromRotationZ(a_ny);
    const rz_m4 = Cesium.Matrix4.fromRotation(rz_m3);
    Cesium.Matrix4.multiply(rz_m4, n_m4, n_m4);
    Cesium.Matrix4.multiply(localToWorld_m4, n_m4, n_m4);
    return n_m4;
  }
  // static formEastNorthUpByBLH(crd,center) {//计算一个经纬度在东北天坐标系下的坐标值
  //   let c3=Cesium.Cartesian3.fromDegrees(crd[0],crd[1],crd[2]);
  //   let center_c3=Cesium.Cartesian3.fromDegrees(center[0],center[1],center[2]);
  //   return this.getEastNorthUpMatrix(C3,center_c3);
  // }
  static toEastNorthUpByC3(c3, center_c3) {
    const enu_m4 = Cesium.Transforms.eastNorthUpToFixedFrame(center_c3);
    const inverse_m4 = Cesium.Matrix4.inverseTransformation(enu_m4, new Cesium.Matrix4());
    return this.getPositionByMatrix(c3, inverse_m4);
  }
  static fromEastNorthUpByC3(C3, center_c3) {
    const enu_m4 = Cesium.Transforms.eastNorthUpToFixedFrame(center_c3);
    return this.getPositionByMatrix(C3, enu_m4);
  }
  static getPositionByMatrix(c3, m4, result) {
    if (!result) {
      result = new Cesium.Cartesian3();
    }
    Cesium.Matrix4.multiplyByPoint(m4, c3, result);
    return result;
  }
  static getTriangleCenter(crds) {
    let crd = null;
    if (crds && crds.length > 2) {
      const vs = [];
      const n = crds.length / 3;
      for (let i = 0; i < n; i++) {
        vs.push(Cesium.Cartesian3.fromDegrees(crds[i * 3 + 0], crds[i * 3 + 1], crds[i * 3 + 2]));
      }
      const c3 = this.getTriangleC3Center(vs);
      crd = MapBaseHelper.c3ToCoordinates(c3);
    }
    return crd;
  }
  static getTriangleC3Center(vs) {
    let c3 = null;
    if (vs && vs.length && vs.length > 2) {
      c3 = new Cesium.Cartesian3();
      for (let i = 0; i < vs.length; i++) {
        Cesium.Cartesian3.add(c3, vs[i], c3);
      }
      Cesium.Cartesian3.divideByScalar(c3, vs.length, c3);
    }
    return c3;
  }
  static transformPoints(m4, crds, cnum) {
    const n = crds.length / cnum;
    let c3 = null;
    for (let i = 0; i < n; i++) {
      c3 = Cesium.Cartesian3.fromDegrees(crds[i * 3 + 0], crds[i * 3 + 1], crds[i * 3 + 2]);
      c3 = Cesium.Matrix4.multiplyByPoint(m4, c3, c3);
      c3 = MapBaseHelper.c3ToCoordinates(c3);
      crds[i * 3 + 0] = c3[0];
      crds[i * 3 + 1] = c3[1];
      crds[i * 3 + 2] = c3[2];
    }
    return crds;
  }
  static transformPositionBuffer(m4, buffer, h) {
    const n = buffer.length / 3;
    let c3 = new Cesium.Cartesian3();
    let crd = null;
    for (let i = 0; i < n; i++) {
      c3.x = buffer[i * 3 + 0];
      c3.y = buffer[i * 3 + 1];
      c3.z = buffer[i * 3 + 2];
      crd = MapBaseHelper.c3ToCoordinates(c3);
      c3 = Cesium.Cartesian3.fromDegrees(crd[0], crd[1], h);
      this.getPositionByMatrix(c3, m4, c3);
      buffer[i * 3 + 0] = c3.x;
      buffer[i * 3 + 1] = c3.y;
      buffer[i * 3 + 2] = c3.z;
    }
  }
  static resetPositionHeight(x2, y2, z2) {
  }
  static getTriangleArea(p0, p1, p2) {
    const v0 = Cesium.Cartesian3.subtract(p0, p1, new Cesium.Cartesian3());
    const v1 = Cesium.Cartesian3.subtract(p2, p1, new Cesium.Cartesian3());
    const cross = Cesium.Cartesian3.cross(v0, v1, v0);
    return Cesium.Cartesian3.magnitude(cross) * 0.5;
  }
  static getTriangleArea2(c1, c2, c3) {
    const a = Cesium.Cartesian3.distance(c1, c2);
    const b = Cesium.Cartesian3.distance(c2, c3);
    const c = Cesium.Cartesian3.distance(c3, c1);
    const s = (a + b + c) / 2;
    return Math.sqrt(s * (s - a) * (s - b) * (s - c));
  }
  static getTrianglesArea(pos, ins) {
    let area = 0;
    if (pos && ins) {
      const num = ins.length / 3;
      let i0, i1, i2, p0, p1, p2;
      for (let i = 0; i < num; i++) {
        i0 = ins[i * 3 + 0];
        i1 = ins[i * 3 + 1];
        i2 = ins[i * 3 + 2];
        p0 = new Cesium.Cartesian3(pos[i0 * 3 + 0], pos[i0 * 3 + 1], pos[i0 * 3 + 2]);
        p1 = new Cesium.Cartesian3(pos[i1 * 3 + 0], pos[i1 * 3 + 1], pos[i1 * 3 + 2]);
        p2 = new Cesium.Cartesian3(pos[i2 * 3 + 0], pos[i2 * 3 + 1], pos[i2 * 3 + 2]);
        area += this.getTriangleArea(p0, p1, p2);
      }
    }
    return area;
  }
  static getPolygonAreaByBLH(crds, pLen) {
    let c3s = null;
    if (crds) {
      pLen = pLen ? pLen : 2;
      if (pLen == 3) {
        c3s = Cesium.Cartesian3.fromDegreesArrayHeights(crds);
      } else {
        c3s = Cesium.Cartesian3.fromDegreesArray(crds);
      }
    }
    const polygonGeometry = Cesium.PolygonGeometry.fromPositions({
      positions: c3s,
      vertexFormat: Cesium.VertexFormat.POSITION_ONLY
    });
    const geom = Cesium.PolygonGeometry.createGeometry(polygonGeometry);
    const area = this.getTrianglesArea(geom.attributes.position.values, geom.indices);
    return area;
  }
  // static getTriangleCenter2(crds,cnum){
  //   let crd=null;
  //   if(crds&&crds.length>0){
  //     let h=SpatialComputingHelper.getMaxHeight(crds,cnum);
  //     crd=GeoMath.getBoundsCenter(crds,cnum);
  //     let ray=RayPickedHelper.createRayByC3Point(Cesium.Cartesian3.fromDegrees(crd[0],crd[1],h+1),Cesium.Cartesian3.fromDegrees(crd[0],crd[1],0));
  //     let p0=Cesium.Cartesian3.fromDegrees(crds[0],crds[1],crds[2]);
  //     let p1=Cesium.Cartesian3.fromDegrees(crds[3],crds[4],crds[5]);
  //     let p2=Cesium.Cartesian3.fromDegrees(crds[6],crds[7],crds[8]);
  //     let c3=Cesium.IntersectionTests.rayTriangle(ray, p0, p1, p2, true, new Cesium.Cartesian3());
  //     crd=MapBaseHelper.c3ToCoordinates(c3);
  //   }
  //   return crd;
  // }
  // static getMaxHeight(crds,cnum){
  //   let n=crds.length/cnum;
  //   let h=crds[2];
  //   for(let i=1;i<n;i++){
  //     h=Math.max(h,crds[i*3+2]);
  //   }
  //   return h;
  // }
}
class GraphicsOrderHelper {
  //香港环境下，这个半径覆盖整个香港的三角网了，其它情况时需要调整这个值，后续这个值改为动态计算
  // static maxBoundingRadius=0;//香港环境下，这个半径覆盖整个香港的三角网了，其它情况时需要调整这个值，后续这个值改为动态计算
  static bringToFront(gs) {
    if (gs && gs.length > 0) {
      let i = 0;
      for (i = 0; i < gs.length; i++) {
        gs[i].old_radius_2D = gs[i]._boundingSphere2D[0].radius;
        gs[i]._boundingSphere2D[0].radius = this.maxBoundingRadius;
      }
    }
  }
  static restoreZOrder(gs) {
    if (gs && gs.length > 0) {
      for (let i = 0; i < gs.length; i++) {
        if (gs[i].old_radius_2D) {
          gs[i]._boundingSphere2D[0].radius = gs[i].old_radius_2D;
        }
      }
    }
  }
  static bringAbove(p1, p2) {
    if (p1 && p2) {
      if (p1._boundingSphere2D && p2._boundingSphere2D) {
        p1.old_radius_2D = p1._boundingSphere2D[0].radius;
        p1._boundingSphere2D[0].radius = p2._boundingSphere2D[0].radius + 1;
      }
    }
  }
  static getMaxRadius(viewer) {
    let max = this.getMaxBoundingGraphics(viewer);
    if (max) {
      return max._boundingSphere2D[0].radius;
    }
    return null;
  }
  static getMaxBoundingGraphics(viewer) {
    return this.getMaxBoundingGraphicsByCollection(viewer.scene.primitives);
  }
  static getMaxBoundingGraphicsByCollection(collection) {
    let pCollectionArray = [collection];
    let i = 0, pCollection = null, p = null;
    let max = null;
    while (pCollectionArray.length > 0) {
      pCollection = pCollectionArray.splice(0, 1)[0];
      for (i = 0; i < pCollection.length; i++) {
        if (pCollection.get) {
          p = pCollection.get(i);
        } else {
          p = pCollection[i];
        }
        if (p instanceof Cesium.Primitive) {
          if (!max) {
            max = p;
          } else {
            if (p._boundingSphere2D[0].radius > max._boundingSphere2D[0].radius) {
              max = p;
            }
          }
        } else if (p instanceof Cesium.PrimitiveCollection || p instanceof Array) {
          pCollectionArray.push(p);
        }
      }
    }
    return max;
  }
  static findPrimitivesByEntity(viewer, entity) {
    let results = [];
    let pCollectionArray = [viewer.dataSourceDisplay._primitives];
    let i = 0, pCollection = null, p = null;
    while (pCollectionArray.length > 0) {
      pCollection = pCollectionArray.splice(0, 1)[0];
      for (i = 0; i < pCollection.length; i++) {
        if (pCollection.get) {
          p = pCollection.get(i);
        } else {
          p = pCollection[i];
        }
        if (p instanceof Cesium.Primitive) {
          if (this.isRelated(p, entity)) {
            results.push(p);
          }
        } else if (p instanceof Cesium.PrimitiveCollection || p instanceof Array) {
          pCollectionArray.push(p);
        }
      }
    }
    return results;
  }
  static isRelated(p, entity) {
    let result = false;
    if (p && entity) {
      let ids = p._instanceIds;
      if (ids && ids.length > 0) {
        for (let i = 0; i < ids.length; i++) {
          if (ids[i] == entity) {
            result = true;
            break;
          }
        }
      }
    }
    return result;
  }
}
__publicField(GraphicsOrderHelper, "maxBoundingRadius", 41569);
class Balloon {
  constructor() {
  }
  static init(optionInfo) {
    var _a2, _b2;
    const style = optionInfo.option.style;
    const crdh = [optionInfo.position[0], optionInfo.position[1], optionInfo.position[2] + 10];
    const p = optionInfo.pMapView.addBalloon({
      id: optionInfo.id + "_balloon",
      show: optionInfo.option.show,
      position: crdh,
      content: `
        <div class="custom-map-balloon-warpper" style="width: ${style == null ? void 0 : style.width}px; height: ${style == null ? void 0 : style.height}px; min-width: ${style == null ? void 0 : style.minWidth}px;  min-height: ${style == null ? void 0 : style.minHeight}px; ">
          <div class="header" style="background: linear-gradient(90deg, ${style == null ? void 0 : style.headerBg1Color} 0%, ${style == null ? void 0 : style.headerBg2Color} 100%)">
            <div class="title" style="color: ${style == null ? void 0 : style.headerTextColor}">标题</div>
            <div class="close"  id="${optionInfo.id + "balloon"}">
              <img class="close" src="/images/close.png" alt=""  id="${optionInfo.id + "balloon"}"/>
            </div>
          </div>

          <div class="content" style="background: ${style == null ? void 0 : style.bodyBgColor}">
            ${Balloon.formatContent(optionInfo.option.info, style)}
          </div>
        </div>
        `,
      offset: [0, -((_a2 = optionInfo.option.style) == null ? void 0 : _a2.offsetBottom)],
      data: crdh,
      distanceDisplayCondition: [25, (_b2 = optionInfo.option.style) == null ? void 0 : _b2.hideLevel]
    });
    Balloon.addEventListenerHandel(optionInfo.pMapView);
    return p;
  }
  static addEventListenerHandel(pMapView) {
    document.addEventListener("click", (e) => {
      const { className } = e.target;
      if (className === "close") {
        pMapView.hideBalloon(e.target.id);
      }
    });
  }
  static formatContent(info, style) {
    let str = "";
    info.forEach((item) => {
      str += `
      <div class="content-item">
        <div class="text" style="color: ${style == null ? void 0 : style.bodyTextColor}">${item.text}：</div>
        <div class="value" style="color: ${style == null ? void 0 : style.bodyValeColor}">${item.value}</div>
      </div>`;
    });
    return str;
  }
  static updateBody(balloon) {
  }
  static updateStyle(pMapView, balloon, option) {
  }
  static destroy() {
  }
}
class ScutcheonStyle {
  constructor() {
    __publicField(this, "pointType", "image");
    __publicField(this, "iconImage", "./MyMapaAdapter/Cesium/Image/waterNormals.jpg");
    __publicField(this, "iconWidth", 32);
    __publicField(this, "iconHeight", 33);
    __publicField(this, "iconOpacity", 1);
    __publicField(this, "iconOffsetX", -16);
    __publicField(this, "iconOffsetY", -16);
    __publicField(this, "iconRtation", 0);
    __publicField(this, "clampToGround", true);
    __publicField(this, "iconDistanceDisplayCondition", [1, Number.POSITIVE_INFINITY]);
    __publicField(this, "disableDepthTestDistance", Number.MAX_SAFE_INTEGER);
  }
}
class SurfaceMarkerStyle {
  constructor() {
    __publicField(this, "pointType", "image");
    __publicField(this, "iconImage", "./MyMapaAdapter/Cesium/Image/waterNormals.jpg");
    __publicField(this, "iconWidth", 32);
    __publicField(this, "iconHeight", 33);
    __publicField(this, "iconOpacity", 1);
    __publicField(this, "iconOffsetX", -16);
    __publicField(this, "iconOffsetY", -16);
    __publicField(this, "iconRtation", 0);
    __publicField(this, "clampToGround", true);
    __publicField(this, "iconDistanceDisplayCondition", [1, Number.POSITIVE_INFINITY]);
    __publicField(this, "disableDepthTestDistance", Number.MAX_SAFE_INTEGER);
  }
}
class SegmentStyle {
  constructor() {
    // lineType: 'solid',
    __publicField(this, "lineType", "image");
    __publicField(this, "lineImage", "./images/grade-line.png");
    __publicField(this, "lineWidth", 4);
    __publicField(this, "lineColor", "#ffffff");
    __publicField(this, "lineOpacity", 1);
  }
}
class Scutcheon {
  static init(optionInfo) {
    var _a2, _b2, _c, _d, _e;
    const style = new ScutcheonStyle();
    style.iconWidth = (_a2 = optionInfo.option.style) == null ? void 0 : _a2.width;
    style.iconHeight = (_b2 = optionInfo.option.style) == null ? void 0 : _b2.height;
    style.iconImage = (_c = optionInfo.option.style) == null ? void 0 : _c.imageUrl;
    style.iconOffsetX = -((_d = optionInfo.option.style) == null ? void 0 : _d.width) / 2;
    style.iconOffsetY = -((_e = optionInfo.option.style) == null ? void 0 : _e.height) / 2;
    const crdh = [
      optionInfo.position[0],
      optionInfo.position[1],
      optionInfo.position[2] + optionInfo.option.posHeight + 10
    ];
    const p = optionInfo.pMapView.addIconPoint({
      id: optionInfo.id + "_scutcheon",
      show: optionInfo.option.show,
      position: crdh,
      data: crdh,
      style
    });
    return p;
  }
  static updateStyle(pMapView, p, option) {
    var _a2, _b2, _c, _d, _e;
    const style = new ScutcheonStyle();
    style.iconWidth = (_a2 = option.style) == null ? void 0 : _a2.width;
    style.iconHeight = (_b2 = option.style) == null ? void 0 : _b2.height;
    style.iconImage = (_c = option.style) == null ? void 0 : _c.imageUrl;
    style.iconOffsetX = -((_d = option.style) == null ? void 0 : _d.width) / 2;
    style.iconOffsetY = -((_e = option.style) == null ? void 0 : _e.height) / 2;
    pMapView.updataIconPointParams(p, style);
  }
  static destroy() {
  }
}
class Segment {
  static init(optionInfo) {
    var _a2, _b2, _c;
    const style = new SegmentStyle();
    style.lineImage = (_a2 = optionInfo.option.style) == null ? void 0 : _a2.imageUrl;
    style.lineWidth = (_b2 = optionInfo.option.style) == null ? void 0 : _b2.width;
    style.lineColor = (_c = optionInfo.option.style) == null ? void 0 : _c.color;
    const crds = [
      [
        ...optionInfo.position,
        optionInfo.position[0],
        optionInfo.position[1],
        optionInfo.position[2] + 10
      ]
    ];
    const p = optionInfo.pMapView.addMultiplePolylines({
      id: optionInfo.id + "_segment",
      show: true,
      ground: false,
      vnum: 3,
      positions: crds,
      style,
      data: crds
    });
    return p;
  }
  static destroy() {
  }
}
class SurfaceMarker {
  static init(optionInfo) {
    var _a2, _b2, _c, _d, _e;
    const style = new SurfaceMarkerStyle();
    style.iconWidth = (_a2 = optionInfo.option.style) == null ? void 0 : _a2.width;
    style.iconHeight = (_b2 = optionInfo.option.style) == null ? void 0 : _b2.height;
    style.iconImage = (_c = optionInfo.option.style) == null ? void 0 : _c.imageUrl;
    style.iconOffsetX = -((_d = optionInfo.option.style) == null ? void 0 : _d.width) / 2;
    style.iconOffsetY = -((_e = optionInfo.option.style) == null ? void 0 : _e.height) / 2;
    const p = optionInfo.pMapView.addIconPoint({
      id: optionInfo.id + "_surfacemarker",
      show: optionInfo.option.show,
      position: optionInfo.position,
      data: optionInfo.position,
      style
    });
    return p;
  }
  static updateStyle(pMapView, p, option) {
    var _a2, _b2, _c, _d, _e;
    const style = new SurfaceMarkerStyle();
    style.iconWidth = (_a2 = option.style) == null ? void 0 : _a2.width;
    style.iconHeight = (_b2 = option.style) == null ? void 0 : _b2.height;
    style.iconImage = (_c = option.style) == null ? void 0 : _c.imageUrl;
    style.iconOffsetX = -((_d = option.style) == null ? void 0 : _d.width) / 2;
    style.iconOffsetY = -((_e = option.style) == null ? void 0 : _e.height) / 2;
    pMapView.updataIconPointParams(p, style);
  }
  static destroy() {
  }
}
class CustomCombination {
  constructor(pMapView) {
    __publicField(this, "pMapView", null);
    __publicField(this, "id", "");
    __publicField(this, "position", [113.47, 22.743, 1]);
    __publicField(this, "balloonOption");
    __publicField(this, "scutcheonOption");
    __publicField(this, "segmentOption");
    __publicField(this, "surfacemarkerOption");
    __publicField(this, "primitiveList", []);
    __publicField(this, "dfHegiht", 11.5);
    // 默认高度（米）
    __publicField(this, "oh_pix", 30);
    //往上偏移30个像素
    __publicField(this, "min_h_pix", 20 + 30);
    // 默认高度（像素）
    __publicField(this, "getIconHeightCrd", (waterHeight, pMapView) => {
      const center = MapBaseHelper$1.getMapsCenter(pMapView.viewer);
      if (center) {
        const curLevel = MapBaseHelper$1.getMapsLevel(
          pMapView.viewer,
          center ? center : pMapView.oldCenter
        );
        const resolution = pMapView.getLevelResolution(curLevel) / 2;
        const oh = this.oh_pix * resolution;
        const min_h = this.min_h_pix * resolution;
        let h0 = Math.max(waterHeight + oh, min_h);
        h0 < 10 && (h0 = 10);
        return h0;
      }
      return null;
    });
    this.pMapView = pMapView;
    this.pMapView.viewer.camera.changed.addEventListener(this.cameraChange.bind(this));
  }
  init(options) {
    var _a2, _b2, _c, _d;
    this.id = options.id;
    this.position = options.position;
    this.balloonOption = options.balloon;
    this.scutcheonOption = options.scutcheon;
    this.segmentOption = options.segment;
    this.surfacemarkerOption = options.surfacemarker;
    const option = {
      pMapView: this.pMapView,
      id: this.id,
      position: this.position,
      option: null
    };
    switch (true) {
      case ((_a2 = this.balloonOption) == null ? void 0 : _a2.show):
        option.option = this.balloonOption;
        this.primitiveList.push(Balloon.init(option));
      case ((_b2 = this.scutcheonOption) == null ? void 0 : _b2.show):
        option.option = this.scutcheonOption;
        this.primitiveList.push(Scutcheon.init(option));
      case ((_c = this.segmentOption) == null ? void 0 : _c.show):
        option.option = this.segmentOption;
        this.primitiveList.push(Segment.init(option));
      case ((_d = this.surfacemarkerOption) == null ? void 0 : _d.show):
        option.option = this.surfacemarkerOption;
        this.primitiveList.push(SurfaceMarker.init(option));
    }
    this.cameraChange();
  }
  cameraChange() {
    let id = null;
    if (this.primitiveList.length) {
      const height = this.getIconHeightCrd(1, this.pMapView);
      const angle = Cesium.Math.toDegrees(this.pMapView.viewer.camera.pitch);
      this.primitiveList.forEach((item) => {
        id = item.id ? item.id : item._id;
        if (item) {
          switch (true) {
            case id.includes("balloon"):
              this.balloonHandel(item, height, angle);
              break;
            case id.includes("scutcheon"):
              this.scutcheonHandel(item, height, angle);
              break;
            case id.includes("segment"):
              this.segmentHandel(item, height, angle);
              break;
            case id.includes("surfacemarker"):
              break;
          }
        }
      });
    }
  }
  // 线段
  segmentHandel(segment, height, angle) {
    if (height && angle < -2) {
      const scale_z = height / this.dfHegiht;
      if (segment && Array.isArray(segment.geometryInstances) && segment.geometryInstances.length) {
        for (let index = 0; index < segment.geometryInstances.length; index++) {
          const geo = segment.geometryInstances[index];
          if (index == 0) {
            const data = geo._data;
            let crd = [];
            if (data && data[index]) {
              crd = [data[index][0], data[index][1], data[index][2]];
            }
            if (crd.length) {
              const c3 = Cesium.Cartesian3.fromDegrees(crd[0], crd[1], crd[2]);
              if (c3) {
                let m4 = null;
                m4 = MatrixTransformHelper.getLocalScaleMatrix4(
                  c3,
                  [1, 1, scale_z],
                  geo.modelMatrix
                );
                if (m4) {
                  segment.modelMatrix = m4;
                }
              }
            }
            break;
          }
        }
      }
    }
  }
  // 标牌
  scutcheonHandel(p, height, angle) {
    const scutcheon = this.primitiveList.filter((v) => v._id == p._id)[0];
    if (scutcheon) {
      scutcheon.show = true;
      const data = scutcheon._data;
      let crd = [];
      if (data) {
        crd = [data[0], data[1], height];
      }
      if (crd.length) {
        const c3 = Cesium.Cartesian3.fromDegrees(crd[0], crd[1], crd[2]);
        c3 && (scutcheon.position = c3);
      }
      if (this.pMapView.viewer.camera.pitch <= -1.38) {
        scutcheon.disableDepthTestDistance = Number.MAX_SAFE_INTEGER;
      } else {
        scutcheon.disableDepthTestDistance = 0;
      }
    }
  }
  // 冒泡
  balloonHandel(balloon, height, angle) {
    if (balloon) {
      const data = balloon.data;
      let crd = [];
      if (data) {
        crd = [data[0], data[1], height];
      }
      if (data && crd.length) {
        this.pMapView.refreshBalloon(balloon.id, crd);
      }
    }
  }
  update(id, options) {
    const nprimitive = this.primitiveList.filter((item) => {
      const nid = item._id ? item._id : item.id;
      return nid.split("_").includes(id);
    });
    if (nprimitive.length) {
      nprimitive.forEach((v) => {
        const id2 = v.id ? v.id : v._id;
        if (options.balloon && id2.includes("balloon")) {
          Balloon.updateStyle(this.pMapView, v, options.balloon);
        }
        if (options.scutcheon && id2.includes("scutcheon")) {
          Scutcheon.updateStyle(this.pMapView, v, options.scutcheon);
        }
        if (options.surfacemarker && id2.includes("surfacemarker")) {
          SurfaceMarker.updateStyle(this.pMapView, v, options.surfacemarker);
        }
      });
    }
  }
  remove(id) {
    const nprimitive = this.primitiveList.filter((item) => {
      const nid = item._id ? item._id : item.id;
      return nid.includes(id);
    });
    this.primitiveList = this.primitiveList.filter((item) => {
      const nid = item._id ? item._id : item.id;
      return !nid.includes(id);
    });
    nprimitive.forEach((p) => {
      const nid = p._id ? p._id : p.id;
      if (nid) {
        this.pMapView.removeIconPoint(nid);
        this.pMapView.removePolyline(nid);
        this.pMapView.removeBalloon(nid);
      }
    });
  }
  destroy() {
    if (this.primitiveList.length) {
      this.primitiveList.forEach((primitive) => {
        const id = primitive._id ? primitive._id : primitive.id;
        if (id) {
          this.pMapView.removeIconPoint(id);
          this.pMapView.removePolyline(id);
          this.pMapView.removeBalloon(id);
        }
      });
    }
    this.primitiveList = [];
  }
}
class IWaterFollStyle {
  constructor() {
    __publicField(this, "color", "#409dfd");
    __publicField(this, "opacity", 0.6);
  }
}
class ILabelGraphicStyle {
  constructor() {
    __publicField(this, "fontSize", 14);
    __publicField(this, "fontFamily", "微软雅黑");
    __publicField(this, "fontOffsetX", 0);
    __publicField(this, "fontOffsetY", 0);
    __publicField(this, "fontBold", true);
    __publicField(this, "fontItalic", false);
    __publicField(this, "fontUnderline", false);
    __publicField(this, "fontAngle", 0);
    __publicField(this, "fontColor", "#FFFFFF");
    __publicField(this, "fontPandding", 2);
    __publicField(this, "fontOpacity", 1);
    __publicField(this, "fontBackground", false);
    __publicField(this, "fontBackgroundColor", "#479C1C");
    __publicField(this, "fontBackgroundOpacity", 1);
    __publicField(this, "fontBorderVisible", true);
    __publicField(this, "fontborderWidth", 3);
    __publicField(this, "fontBorderColor", "#000000");
    __publicField(this, "fontBorderOpacity", 1);
    __publicField(this, "fontDistanceDisplayCondition", [1, null]);
  }
}
class IWaterMaterial {
  static surfaceMateril(color) {
    return new Cesium.Material({
      fabric: {
        type: "Water",
        uniforms: {
          baseWaterColor: color,
          normalMap: "./MyMapaAdapter/Cesium/Image/waterNormals.jpg",
          frequency: 0,
          animationSpeed: 0,
          amplitude: 0,
          specularIntensity: 0
        }
      }
    });
  }
  static rippleMateril(color) {
    return new Cesium.Material({
      fabric: {
        type: "Water",
        uniforms: {
          baseWaterColor: color,
          normalMap: "./MyMapaAdapter/Cesium/Image/waterNormals.jpg",
          frequency: 1e3,
          animationSpeed: 5e-3,
          amplitude: 10,
          specularIntensity: 0.5
        }
      }
    });
  }
}
const _ModelMoveTool = class _ModelMoveTool {
  constructor() {
  }
  //原始矩阵
  static addEventListener() {
    this.viewer.clock.onTick.addEventListener(this.ontick);
  }
  static removeEventListener() {
    this.viewer.clock.onTick.removeEventListener(this.ontick);
  }
  static ontick() {
    _ModelMoveTool.changeTimeIndex++;
    if (_ModelMoveTool.changeTimeIndex % _ModelMoveTool.changeTick == 0) {
      if (_ModelMoveTool.isMoving) {
        _ModelMoveTool.model_moving();
      }
    }
  }
  static startMove(sPosition, ePosition) {
    this.startPosition = sPosition;
    this.currentPosition = Cesium.Cartesian3.clone(this.startPosition);
    this.endPosition = ePosition;
    this.isMoving = true;
    this.o_matrix = this.model.modelMatrix;
  }
  static stopMove() {
    this.endMoved();
  }
  static pauseMove() {
    this.isSuspend = !this.isSuspend;
  }
  static model_moving(evt) {
    if (this.isMoving && !this.isSuspend) {
      this.moveIndex++;
      this.currentPosition = this.calculateNewPosition(
        this.startPosition,
        this.moveStep,
        this.moveIndex
      );
      this.correctionPosition(this.currentPosition, this.endPosition, this.moveStep);
      if (this.currentPosition.x == this.endPosition.x && this.currentPosition.y == this.endPosition.y && this.currentPosition.z == this.endPosition.z) {
        this.endMoved();
      } else {
        const mat4 = this.calculateNewMatrix(
          this.startPosition,
          this.currentPosition,
          this.o_matrix
        );
        this.model.modelMatrix = mat4;
      }
    }
  }
  static modelMovingChange(index) {
    this.currentPosition = this.calculateNewPosition(this.startPosition, this.moveStep, index);
    this.correctionPosition(this.currentPosition, this.endPosition, this.moveStep);
    const mat4 = this.calculateNewMatrix(this.startPosition, this.currentPosition, this.o_matrix);
    this.model.modelMatrix = mat4;
  }
  static calculateNewPosition(o_crd, step, step_index) {
    const d_v3 = Cesium.Cartesian3.multiplyByScalar(step, step_index, new Cesium.Cartesian3());
    const e_crd = Cesium.Cartesian3.add(o_crd, d_v3, new Cesium.Cartesian3());
    return e_crd;
  }
  static correctionPosition(c_crd, e_crd, step) {
    if ((e_crd.x - c_crd.x) * (step.x / Math.abs(step.x)) < 0) {
      c_crd.x = e_crd.x;
    }
    if ((e_crd.y - c_crd.y) * (step.y / Math.abs(step.y)) < 0) {
      c_crd.y = e_crd.y;
    }
    if ((e_crd.z - c_crd.z) * (step.z / Math.abs(step.z)) < 0) {
      c_crd.z = e_crd.z;
    }
  }
  static endMoved() {
    this.isMoving = false;
    this.isSuspend = false;
    this.removeEventListener();
  }
  static calculateNewMatrix(o_crd, e_crd, o_m4) {
    const sc3 = Cesium.Cartesian3.fromDegrees(o_crd.x, o_crd.y, o_crd.z);
    const ec3 = Cesium.Cartesian3.fromDegrees(e_crd.x, e_crd.y, e_crd.z);
    return this.getMoveMatrix(sc3, ec3, o_m4);
  }
  //辅助函数
  static getMoveMatrix(s_c3, e_c3, o_m4) {
    let resultMatrix = null;
    if (s_c3 && e_c3) {
      resultMatrix = Cesium.Matrix4.fromTranslation(
        Cesium.Cartesian3.subtract(e_c3, s_c3, new Cesium.Cartesian3())
      );
      if (o_m4) {
        Cesium.Matrix4.multiply(resultMatrix, o_m4, resultMatrix);
      }
    }
    return resultMatrix;
  }
};
__publicField(_ModelMoveTool, "isMoving", false);
//是否正在移动
__publicField(_ModelMoveTool, "isSuspend", false);
//是否暂停
__publicField(_ModelMoveTool, "changeTick", 1);
//20帧变化一次
__publicField(_ModelMoveTool, "changeTimeIndex", 0);
//20帧变化一次
__publicField(_ModelMoveTool, "startPosition", null);
//开始位置
__publicField(_ModelMoveTool, "currentPosition", null);
//当前位置
__publicField(_ModelMoveTool, "endPosition", null);
//结束位置
__publicField(_ModelMoveTool, "moveIndex", 0);
//移动的步数
__publicField(_ModelMoveTool, "moveStep", new Cesium.Cartesian3(0, 0, 10));
//x,y,z
__publicField(_ModelMoveTool, "viewer", null);
//地图对象
__publicField(_ModelMoveTool, "model", null);
//移动的图元
__publicField(_ModelMoveTool, "o_matrix", null);
let ModelMoveTool = _ModelMoveTool;
let GetHeigthCoordinate$1 = (_b = class {
  static getTerrainHeightHandel(crdh) {
    return new Promise((resolve, reject) => {
      this.mapAdapter.getTerrainHeight(crdh[0], crdh[1], this.mapAdapter.terrain, (result) => {
        const height = result[0].height.toFixed(2);
        resolve(height);
      });
    });
  }
  static getModelHeightHandel(crdh) {
    return new Promise(async (resolve, reject) => {
      const result = await this.mapAdapter.getModelHeight(crdh[0], crdh[1]);
      const cartographic = Cesium.Cartographic.fromCartesian(result[0]);
      const height = Number(cartographic.height).toFixed(2);
      resolve(height);
    });
  }
}, __publicField(_b, "mapAdapter"), _b);
class WaterBaseDraw {
  // 气泡提示内容
  constructor(mapOption, pointCount) {
    // 淹没水深
    // 参数：
    // 1. 淹没的点
    // 2. 淹没的半径
    // 3. 淹没的深度
    // 4. 淹没的图层
    // 5. 淹没的回调函数
    // 返回值：
    // 淹没的图层
    __publicField(this, "mapOption");
    // 地图操作类
    __publicField(this, "viewer");
    // 地图实例
    __publicField(this, "currentStep", 0);
    // 当前步骤
    __publicField(this, "pointCount", Number.POSITIVE_INFINITY);
    // 绘制点的数量
    __publicField(this, "curPointCount", 0);
    // 当前绘制点的数量
    __publicField(this, "pointLatitude", []);
    // 绘制点的纬度
    __publicField(this, "labelParamsCollent", []);
    // 文字参数集合
    __publicField(this, "pointEntityList", []);
    // 绘制点的实体列表
    __publicField(this, "labelGatherList", []);
    // 绘制点文字的列表
    __publicField(this, "mapCanvas", document.querySelector("#map_container"));
    __publicField(this, "isOpen", false);
    // 是否开启绘制
    // 回调函数
    __publicField(this, "pointCountChangeCallBack", () => {
    });
    // 点绘制回调
    __publicField(this, "successPointCountCallBack", () => {
    });
    // 点绘制完成回调
    __publicField(this, "balloonTip", null);
    // 气泡提示
    __publicField(this, "balloonTipContent", '<div class="water-foll-tip">请单击地图绘制标记点</div>');
    // 刷新文字
    __publicField(this, "refreshPointLabel", () => {
      this.labelParamsCollent = this.labelParamsCollent.map(
        (label, index) => {
          const nText = label.text.includes("标记点") || label.text.includes("淹没起始点") ? `标记点${index + 1}` : label.text;
          this.setLabelText(index, nText);
          return {
            ...label,
            text: nText
          };
        }
      );
    });
    this.mapOption = mapOption;
    this.viewer = mapOption.viewer;
    pointCount && (this.pointCount = pointCount);
  }
  // 开始使用淹没水深操作
  openInit() {
    this.isOpen = true;
    this.addEventListener();
  }
  // 指定对应盒子使用对饮的鼠标样式
  appointBoxCursor(el, cursor) {
    if (el) {
      el.style.cursor = cursor;
    }
  }
  // 重置绘制点图层
  resetPointCount() {
    this.currentStep = 0;
    this.mapOption.removeBalloon("waterFollTip");
    this.balloonTip = null;
    this.removeEventListener();
    this.pointEntityList.forEach((point) => {
      this.viewer.entities.remove(point);
    });
    this.labelGatherList.forEach((label) => {
      this.mapOption.removeLabel(label.id);
    });
    this.pointEntityList = [];
    this.labelGatherList = [];
    this.pointLatitude = [];
    this.labelParamsCollent = [];
    this.curPointCount = 0;
  }
  // 移除全部点;
  removeAllPoint() {
    this.pointEntityList.forEach((point) => {
      this.viewer.entities.remove(point);
    });
    this.labelGatherList.forEach((label) => {
      this.mapOption.removeLabel(label.id);
    });
    this.pointEntityList = [];
    this.labelGatherList = [];
    this.pointLatitude = [];
    this.labelParamsCollent = [];
  }
  togglePointCountEntity(flag2) {
    this.removeEventListener();
    this.pointEntityList.forEach((point) => {
      point.show = flag2;
    });
    this.labelGatherList.forEach((label) => {
      label.show = flag2;
    });
    if (flag2) {
      this.mapOption.showBalloon("waterFollTip");
    } else {
      this.mapOption.hideBalloon("waterFollTip");
    }
  }
  // 添加交互事件
  addEventListener() {
    GetHeigthCoordinate$1.mapAdapter = this.mapOption;
    this.mapOption.screenSpaceLeftClick(
      "water_tool_left_click",
      this.leftClickListenerHandel.bind(this)
    );
    this.mapOption.screenSpaceMouseMove(
      "water_tool_mouse_move",
      this.mouseMoveListenerHandel.bind(this)
    );
    this.appointBoxCursor(this.mapCanvas, `url(./water_folld.cur), auto`);
  }
  // 地图左键
  async leftClickListenerHandel(pick, crd, event) {
    if (event) {
      let crd2 = this.mapOption.pixelToCoordinates(
        event.position.x,
        event.position.y
      );
      const pick2 = this.viewer.scene.pick(event.position);
      let resHeight = 0;
      if (this.mapOption.viewer.terrainProvider._scheme) {
        resHeight = await GetHeigthCoordinate$1.getTerrainHeightHandel(crd2);
      }
      if (pick2 && pick2.detail) {
        resHeight = await GetHeigthCoordinate$1.getModelHeightHandel(crd2);
      }
      crd2 = [crd2[0], crd2[1], Number(resHeight)];
      if (this.pointLatitude.length < this.pointCount) {
        this.pointLatitude.push(crd2);
        this.curPointCount++;
        this.drawPoint(crd2);
        const param = this.drawLabel(crd2);
        this.labelParamsCollent.push(param);
        this.refreshPointLabel();
        this.pointCountChangeCallBack(
          this.pointLatitude,
          this.labelParamsCollent,
          false
        );
        if (this.pointLatitude.length == this.pointCount) {
          this.currentStep = 1;
          this.balloonTip = null;
          this.mapOption.removeBalloon("waterFollTip");
          this.successPointCountCallBack(this.pointLatitude);
        }
      }
    }
  }
  addBasePoint(crd, labelText, callbackFlag = false) {
    this.pointLatitude.push(crd);
    this.curPointCount++;
    this.drawPoint(crd);
    const param = this.drawLabel(crd, labelText);
    this.labelParamsCollent.push(param);
    this.refreshPointLabel();
    this.pointCountChangeCallBack(
      this.pointLatitude,
      this.labelParamsCollent,
      callbackFlag
    );
  }
  // 绘制点
  drawPoint(crd) {
    const pointParams = {
      pixelSize: 10,
      color: this.hexToCesiumColor("#ffffff"),
      outlineColor: this.hexToCesiumColor("#ff0000"),
      outlineWidth: 3,
      disableDepthTestDistance: Number.POSITIVE_INFINITY
      // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    };
    const pointEntity = this.viewer.entities.add(
      new Cesium.Entity({
        show: true,
        id: `base_point${this.curPointCount}`,
        position: Cesium.Cartesian3.fromDegrees(...crd),
        point: pointParams
      })
    );
    this.pointEntityList.push(pointEntity);
  }
  // 移除点
  removePoint(index) {
    const point = this.pointEntityList[index];
    const label = this.labelGatherList[index];
    if (point) {
      this.viewer.entities.remove(point);
    }
    if (label) {
      this.mapOption.removeLabel(label.id);
    }
    this.pointLatitude.splice(index, 1);
    this.pointEntityList.splice(index, 1);
    this.labelGatherList.splice(index, 1);
    this.labelParamsCollent.splice(index, 1);
    this.refreshPointLabel();
    this.pointCountChangeCallBack(
      this.pointLatitude,
      this.labelParamsCollent,
      false
    );
  }
  // 绘制文字
  drawLabel(crd, text) {
    const style = new ILabelGraphicStyle();
    style.fontOffsetX = 15;
    style.fontOffsetY = -7;
    this.labelGatherList.push(
      this.mapOption.addLable({
        id: `base_label${this.curPointCount}`,
        show: true,
        position: {
          position: crd,
          text: text ? text : `标记点${this.curPointCount}`
        },
        style
      })
    );
    const result = {
      id: `base_label${this.curPointCount}`,
      text: text ? text : `标记点${this.curPointCount}`,
      crd
    };
    return result;
  }
  // 动态设置标记点文字内容
  setLabelText(index, text) {
    if (this.labelGatherList[index]) {
      this.labelGatherList[index].text = text;
    }
  }
  // 地图鼠标移动
  mouseMoveListenerHandel(crd, event) {
    if (event) {
      const crd2 = this.mapOption.pixelToCoordinates(
        event.endPosition.x,
        event.endPosition.y
      );
      if (Array.isArray(crd2) && crd2.length) {
        this.refreshTip([crd2[0], crd2[1], crd2[2]]);
      }
    }
  }
  // 气泡提示内容
  refreshTip(crd) {
    if (!this.isOpen) {
      return;
    }
    if (!this.balloonTip && this.currentStep == 0) {
      this.balloonTip = this.mapOption.addBalloon({
        id: "waterFollTip",
        position: crd,
        content: this.balloonTipContent,
        offset: [15, 25]
      });
    } else {
      let tipText = "单击绘制标记点";
      if (this.pointLatitude.length) {
        tipText = `点击开始分析绘制淹没分析多边形`;
      }
      this.balloonTipContent = `<div class="water-foll-tip">${tipText}</div>`;
      this.mapOption.refreshBalloon(
        "waterFollTip",
        crd,
        this.balloonTipContent
      );
    }
  }
  // 移除气泡提示
  removeBalloon() {
    this.mapOption.removeBalloon("waterFollTip");
    this.balloonTip = null;
  }
  // css 颜色转 Cesium.Color 类型
  hexToCesiumColor(cssColor, alpha = 1) {
    return Cesium.Color.fromCssColorString(cssColor).withAlpha(alpha);
  }
  // 移除交互事件
  removeEventListener() {
    this.mapOption.removeMapListener("LeftClick", "water_tool_left_click");
    this.mapOption.removeMapListener("MouseMove", "water_tool_mouse_move");
  }
  // 释放资源
  baseDispose() {
    this.pointCount = Number.POSITIVE_INFINITY;
    this.resetPointCount();
    this.removeBalloon();
    this.removeEventListener();
    this.isOpen = false;
  }
  // 清基础操作类
  baseClear() {
    this.baseDispose();
  }
}
class WaterFollDraw extends WaterBaseDraw {
  constructor() {
    super(...arguments);
    // 淹没水深
    // 参数：
    // 1. 淹没的点
    // 2. 淹没的半径
    // 3. 淹没的深度
    // 4. 淹没的图层
    // 5. 淹没的回调函数
    // 返回值：
    // 淹没的图层
    __publicField(this, "terrain");
    __publicField(this, "effectType", 2);
    // 淹没效果类型 默认波纹 1. 水面 2. 波纹
    __publicField(this, "waterFollLatitude", []);
    // 淹没的点
    __publicField(this, "waterFollLayer", {});
    // 淹没水深的图层
    __publicField(this, "allWaterFollLayerList", []);
    // 所有淹没水深的图层列表
    __publicField(this, "waterFollStyle", new IWaterFollStyle());
    // 淹没水深的样式
    __publicField(this, "maxWaterHeight", 0);
    // 最大淹没高度
    __publicField(this, "initialHeight", 1);
    // 初始淹没高度
    __publicField(this, "floodingRate", 1);
    // 淹没速率
    __publicField(this, "originalCrds", []);
    __publicField(this, "waterFollLayer2D");
    __publicField(this, "playFlag", false);
    // 播放状态
    // 回调函数
    __publicField(this, "successDrawWaterFollLayerCallBack", () => {
    });
    // 淹没水深多边形绘制完成回调
    __publicField(this, "clickWaterFollLayerCallBack", () => {
    });
  }
  // 淹没水深多边形点击回调
  // 创建淹没图层
  createWaterFollLayer(crds = this.pointLatitude, params, style = this.waterFollStyle) {
    GeoMath.viewer = this.mapOption.viewer;
    this.waterFollLatitude = this.pointLatitude;
    const { maxHeight, initialHeight, areaRangeNum, effectType = 2 } = params;
    const ncrds = GeoMath.createAreaRange(crds.flat(5), 3, areaRangeNum);
    this.originalCrds = ncrds.flat(5);
    this.initialHeight = initialHeight;
    this.maxWaterHeight = maxHeight;
    let primitive = null;
    this.waterFollStyle = style;
    const color = Cesium.Color.fromCssColorString(style.color);
    color.alpha = style.opacity;
    const material = effectType == 1 ? IWaterMaterial.surfaceMateril(color) : IWaterMaterial.rippleMateril(color);
    const follCreateObj = {
      id: `waterFoll${this.allWaterFollLayerList.length}`,
      show: this.mapOption.mapModelType == 0 ? false : true,
      material,
      extrudedHeight: -this.maxWaterHeight,
      coord: this.originalCrds,
      height: initialHeight <= 0 ? 1 : initialHeight,
      style
    };
    primitive = this.mapOption.addWaterFlood2(
      follCreateObj,
      areaRangeNum / 1e3
    );
    this.waterFollLayer2D = this.mapOption.addWaterFlood2(
      {
        ...follCreateObj,
        show: this.mapOption.mapModelType == 0 ? true : false,
        height: 1,
        id: `waterFoll2D${this.allWaterFollLayerList.length}`
      },
      areaRangeNum / 1e3
    );
    this.waterFollLayer = primitive;
    const result = {
      maxHeight: 100,
      primitive
    };
    this.allWaterFollLayerList.push(result);
    this.currentStep = 2;
    this.successDrawWaterFollLayerCallBack(result);
    this.addWaterFollTerrainData();
    this.initModelMoveTool(initialHeight);
  }
  // 控制水深显隐
  toggleWaterFollLayer(flag2) {
    if (this.waterFollLayer && flag2 != void 0) {
      this.waterFollLayer.show = flag2;
    }
  }
  // 控制水深显隐
  toggleWaterFollLayer2D(flag2) {
    if (this.waterFollLayer2D && flag2 != void 0) {
      this.waterFollLayer2D.show = flag2;
    }
  }
  // 初始化播放淹没水深
  initModelMoveTool(initialHeight) {
    const center = this.waterFollLatitude.flat(5).length > 3 ? GeoMath.getBoundsCenter(this.waterFollLatitude.flat(5), 3) || [] : this.waterFollLatitude.flat(5);
    ModelMoveTool.model = this.waterFollLayer;
    ModelMoveTool.viewer = this.viewer;
    ModelMoveTool.moveStep = new Cesium.Cartesian3(0, 0, this.floodingRate);
    const sp = new Cesium.Cartesian3(
      center[0],
      center[1],
      Number(initialHeight)
    );
    const ep = new Cesium.Cartesian3(
      center[0],
      center[1],
      Number(this.maxWaterHeight)
    );
    ModelMoveTool.startMove(sp, ep);
  }
  // 添加地形数据
  addWaterFollTerrainData() {
    this.terrain = this.mapOption.terrain;
  }
  // 获取点击多边形内容数据
  getClickWaterFollLayerHandel() {
    this.mapOption.screenSpaceLeftClick(
      "water_info_tool_left_click",
      this.follLyaerWaterInfoHandel.bind(this)
    );
  }
  follLyaerWaterInfoHandel(p, crd, event) {
    if (!this.playFlag) {
      return;
    }
    let groundHeight = 0;
    let waterHeight = 0;
    let depthWater = 0;
    let modelHeight = 0;
    let modelWaterHeight = 0;
    let modelDepthWater = 0;
    const pick = this.viewer.scene.pick(event.position);
    if (!pick || pick && pick._id && !pick._id.includes("waterFoll")) {
      return;
    }
    const pos = this.mapOption.pixelToCoordinates(
      event.position.x,
      event.position.y
    );
    const picks = RayPickedHelper.drillPickByBLH(this.viewer, [
      pos[0],
      pos[1],
      pos[2] + 10
    ]);
    this.mapOption.getTerrainHeight(
      pos[0],
      pos[1],
      this.terrain,
      (params) => {
        groundHeight = params[0].height != void 0 ? Number(params[0].height.toFixed(2)) : 0;
        waterHeight = ModelMoveTool.currentPosition.z ? ModelMoveTool.currentPosition.z.toFixed(2) : 0;
        depthWater = waterHeight - groundHeight < 0 ? 0 : Number((waterHeight - groundHeight).toFixed(2));
        if (picks && (picks == null ? void 0 : picks.length)) {
          const model = picks.filter((item) => {
            if (item && item.obj && item.obj.primitive) {
              return item.obj.primitive._url;
            }
          })[0];
          if (model) {
            modelHeight = model && model.crd[2] > 0 ? model.crd[2].toFixed(2) : 0;
          }
        }
        modelWaterHeight = ModelMoveTool.currentPosition.z ? ModelMoveTool.currentPosition.z.toFixed(2) : 0;
        modelDepthWater = Number(modelWaterHeight - modelHeight) < 0 ? 0 : Number(modelWaterHeight - modelHeight).toFixed(2);
        const result = {
          groundHeight,
          // 地形高度
          waterHeight,
          // 水面高度
          depthWater,
          // 水深
          modelHeight,
          modelWaterHeight,
          modelDepthWater
        };
        this.clickWaterFollLayerCallBack(result);
      }
    );
  }
  // 重置水波纹高度图层
  resetWaterFollLayer(id) {
    this.mapOption.resetWaterFoll(id);
  }
  // 清除淹没图层
  removeWaterFollLayer(id) {
    if (!id) {
      return;
    }
    this.mapOption.removeWaterFlood(id);
    this.waterFollLayer = null;
  }
  // 清除全部淹没图层
  removeAllWaterFollLayer() {
    this.allWaterFollLayerList.forEach((layer) => {
      this.mapOption.removeWaterFlood(layer.primitive._id);
    });
    if (this.waterFollLayer2D) {
      this.waterFollLayer2D.show = false;
    }
    this.waterFollLayer2D = null;
    this.waterFollLayer = null;
    this.allWaterFollLayerList = [];
  }
  // 释放资源
  follDispose() {
    this.removeAllWaterFollLayer();
    this.waterFollLayer = null;
    this.allWaterFollLayerList = [];
    this.waterFollLatitude = [];
    this.mapOption.removeMultiplePolygons(["polygon_water"]);
    this.mapOption.removeMapListener("LeftClick", "water_info_tool_left_click");
  }
  // 清空淹没分析类
  follClear() {
    this.follDispose();
  }
}
class WaterPlay extends WaterFollDraw {
  constructor() {
    super(...arguments);
    __publicField(this, "playTimer");
    // 淹没水深的播放定时器
    __publicField(this, "speedEnum", {
      1: 1e3,
      2: 500,
      4: 200,
      8: 100,
      16: 50,
      32: 20
    });
    __publicField(this, "playFlag", false);
    // 播放状态
    __publicField(this, "playIndex", 1);
    // 播放进度
    __publicField(this, "curSpeed", 1);
    // 当前倍速
    __publicField(this, "multiplierSpeed", [1, 2, 4, 8, 16, 32]);
    // 倍速列表
    __publicField(this, "curEffectType", 1);
    // 淹没水深的图层样式类型
    __publicField(this, "curHeight", 0);
    // 当前淹没高度
    // 回调函数
    __publicField(this, "playChangeCallback", (playFlag) => {
    });
    // 播放状态切换
    __publicField(this, "playProgressChnageCallback", (height) => {
    });
    // 播放进度变化
    __publicField(this, "successPlayCallback", () => {
    });
  }
  // 播放完成
  // 切换播放效果 【带波纹 || 水面】
  playEffectChange(type = this.effectType) {
    this.curEffectType = type;
    this.waterFollStyle;
    const color = Cesium.Color.fromCssColorString(this.waterFollStyle.color);
    color.alpha = this.waterFollStyle.opacity;
    switch (type) {
      case 1:
        this.waterFollLayer.appearance.material = IWaterMaterial.surfaceMateril(color);
        this.waterFollLayer2D.appearance.material = IWaterMaterial.surfaceMateril(color);
        break;
      case 2:
        this.waterFollLayer.appearance.material = IWaterMaterial.rippleMateril(color);
        this.waterFollLayer2D.appearance.material = IWaterMaterial.rippleMateril(color);
        break;
    }
    return type;
  }
  // 淹没水深播放
  waterFloodPlay(maxHeight = this.maxWaterHeight) {
    this.playFlag = !this.playFlag;
    this.currentStep = 2;
    this.maxWaterHeight = maxHeight;
    this.playProgressChnage();
    this.playChangeCallback(this.playFlag);
    if (this.playFlag) {
      clearInterval(this.playTimer);
      this.playTimer = null;
      this.playTimerHandel();
    } else {
      if (this.curHeight < maxHeight) {
        this.stopWaterFollPlay();
      }
    }
    if (this.curHeight >= this.maxWaterHeight) {
      this.resetPlayData();
    }
  }
  // 重置播放数据
  resetPlayData() {
    this.playIndex = 1;
    ModelMoveTool.modelMovingChange(0);
    this.curHeight = this.initialHeight;
    this.playProgressChnageCallback(Number(this.maxWaterHeight));
  }
  // 更新淹没图层
  // updateWaterFollLayer(id: string, num: number) {
  //   // 更新淹没图层的样式
  //   // 更新淹没图层的交互事件
  //   // return { /*淹没水深的图层*/ };
  //   const count = this.mapOption.updateWaterFlood(id, num);
  //   return count;
  // }
  // 更新淹没图层
  // updateWaterFollLayer(height: number) {
  //   ModelMoveTool.modelMovingChange(0);
  // }
  // 淹没水深高度步长变化
  updataFloodingRate(floodingRate) {
    this.floodingRate = floodingRate;
    ModelMoveTool.moveStep = new Cesium.Cartesian3(0, 0, this.floodingRate);
    this.playProgressChnage();
  }
  // 淹没水深高度变化
  updateWaterFollLayer(height) {
    this.curHeight = height;
    this.playProgressChnage();
    ModelMoveTool.modelMovingChange(this.playIndex);
  }
  // 定时器变化函数
  playTimerHandel() {
    this.playTimer = setInterval(() => {
      this.waterFollLayerChange(this.playIndex);
      this.curHeight = ModelMoveTool.currentPosition.z;
      this.playProgressChnageCallback(this.curHeight);
      this.playIndex = this.playIndex + 1;
      if (this.curHeight >= this.maxWaterHeight) {
        this.playIndex = Math.ceil(this.playIndex);
        this.stopWaterFollPlay();
        this.successPlayCallback();
      }
    }, this.speedEnum[this.curSpeed]);
  }
  // 当前进度值变化
  playProgressChnage() {
    const countHeight = this.maxWaterHeight - this.initialHeight;
    const index = (this.curHeight - this.initialHeight) / this.floodingRate / countHeight * countHeight;
    this.playIndex = index;
  }
  // 淹没水深高度变化
  waterFollLayerChange(index) {
    ModelMoveTool.modelMovingChange(index);
  }
  // 倍速切换
  multiplierSpeedChange(type) {
    if (this.multiplierSpeed.indexOf(type) == -1) {
      const error = `multiplierSpeedChangeError：${type}`;
      return error;
    }
    this.curSpeed = type;
    if (this.playFlag) {
      clearInterval(this.playTimer);
      this.playTimer = null;
      this.playTimerHandel();
    }
  }
  // 暂停播放
  stopWaterFollPlay() {
    clearInterval(this.playTimer);
    this.playTimer = null;
    this.playFlag = false;
  }
  // 释放资源
  playDispose() {
    clearInterval(this.playTimer);
    this.playTimer = null;
    this.playFlag = false;
    this.appointBoxCursor(this.mapCanvas, `default`);
  }
  // 清空淹没分析类
  playClear() {
  }
}
class WaterFollOption extends WaterPlay {
  // constructor() {}
  dispose() {
    this.currentStep = 0;
    this.baseDispose();
    this.follDispose();
    this.playDispose();
  }
}
class GltfModelHelper {
  constructor() {
  }
  static async addGltf(viewer, info) {
    let model = null;
    if (viewer && info && info.url && (info.crd || info.position || info.modelMatrix)) {
      let modelMatrix = null;
      if (info.modelMatrix) {
        modelMatrix = Cesium.Matrix4.fromArray(info.modelMatrix);
      } else {
        modelMatrix = this.getModelMatrix4(info);
      }
      try {
        model = await Cesium.Model.fromGltfAsync({
          id: info.id,
          clampAnimations: true,
          enableDebugWireframe: info.enableDebugWireframe,
          url: info.url,
          // url: "http://192.168.52.3:8092/3d/models/gxsbz/NoLod_0.glb",
          modelMatrix,
          // scale: info.scale?info.scale:1,
          allowPicking: info.allowPicking,
          asynchronous: true
        });
        model = viewer.scene.primitives.add(model);
        model.completedDelegate = info.completed;
        model.modelInfo = info;
        model.readyEvent.addEventListener(this.gltfLoadedCallback, this);
      } catch (error) {
      }
    }
    return model;
  }
  static gltfLoadedCallback(model) {
    model.activeAnimations.addAll({
      loop: Cesium.ModelAnimationLoop.NONE
      //循环的动画
    });
    if (model.completedDelegate) {
      if (model.modelInfo && model.modelInfo.activeAnimations) {
        model.activeAnimations.addAll(model.modelInfo.activeAnimations);
      }
      if (model.completedDelegate instanceof NCallbackDelegate) {
        model.completedDelegate.callback.apply(
          model.completedDelegate.actionScope,
          [model]
        );
        model.completedDelegate.dispose();
      } else {
        if (model.completedDelegate.callback) {
          if (!model.completedDelegate.actionScope[model.completedDelegate.callback.name]) {
            return;
          }
          model.completedDelegate.actionScope[model.completedDelegate.callback.name].apply(model.completedDelegate.actionScope, [model]);
        } else {
          model.completedDelegate(model);
        }
      }
      model.completedDelegate = null;
    }
    model.readyEvent.removeEventListener(this.gltfLoadedCallback, this);
  }
  static async addModels(viewer, infos) {
    let models = null;
    if (viewer && infos) {
      models = new Cesium.PrimitiveCollection();
      let info = null;
      let modelMatrix = null;
      for (let i = 0; i < infos.length; i++) {
        info = infos[i];
        modelMatrix = this.getModelMatrix4(info);
        let model2 = await Cesium.Model.fromGltfAsync({
          url: info.url,
          modelMatrix
          // scale: info.scale,
        });
        model2.delay = info.animationDelay;
        model2.readyEvent.addEventListener(this.gltfReadyCallback, this);
        models.add(model2);
      }
      models = viewer.scene.primitives.add(models);
      return models;
    }
  }
  static gltfReadyCallback(model, delay) {
    if (!delay) {
      if (model.delay) {
        delay = model.delay;
      } else {
        delay = 0;
      }
    }
    model.activeAnimations.addAll({
      delay,
      loop: Cesium.ModelAnimationLoop.NONE
      //循环的动画
      // loop: Cesium.ModelAnimationLoop.REPEAT, //循环的动画
    });
    model.readyEvent.removeEventListener(this.gltfReadyCallback, this);
  }
  static async showModelsByLine(viewer, modelInfo, lineBLHs, arrangementInfo) {
    let models = null;
    if (viewer && lineBLHs && modelInfo) {
      if (arrangementInfo == void 0 || arrangementInfo == null) {
        arrangementInfo = new ModelArrangementInfo();
      }
      let infos = null;
      let num = lineBLHs.length / 3 - 1;
      let infoArr = [];
      let i = 0;
      for (i = 0; i < num; i++) {
        infos = this.arrangeModel(
          [lineBLHs[i * 3 + 0], lineBLHs[i * 3 + 1], lineBLHs[i * 3 + 2]],
          [
            lineBLHs[(i + 1) * 3 + 0],
            lineBLHs[(i + 1) * 3 + 1],
            lineBLHs[(i + 1) * 3 + 2]
          ],
          modelInfo.size,
          arrangementInfo
        );
        infoArr = infoArr.concat(infos);
      }
      for (i = 0; i < infoArr.length; i++) {
        infoArr[i].url = modelInfo.url;
        infoArr[i].rotation[2] += modelInfo.angle;
        infoArr[i].animationDelay = i * arrangementInfo.delayStep;
      }
      models = await this.addModels(viewer, infoArr);
      return models;
    }
  }
  static getAngle(p1, p2) {
    let c1 = Cesium.Cartesian3.fromDegrees(p1[0], p1[1], p1[2]);
    let c2 = Cesium.Cartesian3.fromDegrees(p2[0], p2[1], p2[2]);
    let nc1 = new Cesium.Cartesian3(0, 0, 0);
    let nc2 = GeoMath3D.toEastNorthUpByC3(c2, c1);
    return Cesium.Math.toDegrees(GeoMath.getAngle(nc1.x, nc1.y, nc2.x, nc2.y));
  }
  static arrangeModel(p1, p2, size, arrangementInfo) {
    let modelInfos = null;
    switch (arrangementInfo.arrangementType) {
      case ModelArrangementType.SegmentedScaling:
        modelInfos = this.getModelPositions_0(p1, p2, size, arrangementInfo);
        break;
      case ModelArrangementType.Segmented:
        modelInfos = this.getModelPositions_1(p1, p2, size, arrangementInfo);
        break;
      case ModelArrangementType.Scaling:
        modelInfos = this.getModelPositions_2(p1, p2, size, arrangementInfo);
        break;
    }
    return modelInfos;
  }
  static getModelPositions_0(p1, p2, size, arrangementInfo) {
    let angle = this.getAngle(p1, p2);
    let step = size[0];
    let dis = GeoMath.getSphereDistance(p1, p2);
    let num = dis / step;
    let max = Math.ceil(num);
    let min = Math.floor(num);
    let count = Math.ceil(num);
    if (num - min > 0.5) {
      count = max;
    } else {
      count = min;
    }
    if (count == 0) {
      count = max;
    }
    let dx = (p2[0] - p1[0]) / count;
    let dy = (p2[1] - p1[1]) / count;
    let dz = (p2[2] - p1[2]) / count;
    let scale_v = dis / (count * step);
    let offset_x = dx / 2;
    let offset_y = dy / 2;
    let offset_z = dz / 2;
    let modelInfo = null;
    let modelInfos = [];
    for (let i = 0; i < count; i++) {
      modelInfo = {
        crd: [
          p1[0] + i * dx + offset_x,
          p1[1] + i * dy + offset_y,
          p1[2] + i * dz + offset_z
        ],
        scales: [1, scale_v, 1],
        rotation: [0, 0, -angle]
      };
      modelInfos.push(modelInfo);
    }
    return modelInfos;
  }
  static getModelPositions_1(p1, p2, size, arrangementInfo) {
    let angle = this.getAngle(p1, p2);
    let step = arrangementInfo.spacing;
    let dis = GeoMath.getSphereDistance(p1, p2);
    let num = dis / step;
    let max = Math.ceil(num);
    let min = Math.floor(num);
    let count = Math.ceil(num);
    if (num - min > 0.5) {
      count = max;
    } else {
      count = min;
    }
    if (count == 0) {
      count = max;
    }
    let dx = (p2[0] - p1[0]) / count;
    let dy = (p2[1] - p1[1]) / count;
    let dz = (p2[2] - p1[2]) / count;
    step = dis / count;
    let offset_x = size[0] * dx / (step * 2);
    let offset_y = size[0] * dy / (step * 2);
    let offset_z = size[0] * dz / (step * 2);
    let modelInfo = null;
    let modelInfos = [];
    for (let i = 0; i < count; i++) {
      modelInfo = {
        crd: [
          p1[0] + i * dx + offset_x,
          p1[1] + i * dy + offset_y,
          p1[2] + i * dz + offset_z
        ],
        scales: [1, 1, 1],
        rotation: [0, 0, -angle]
      };
      modelInfos.push(modelInfo);
    }
    modelInfo = {
      crd: [p2[0] - offset_x, p2[1] - offset_y, p2[2] - offset_z],
      scales: [1, 1, 1],
      rotation: [0, 0, -angle]
    };
    modelInfos.push(modelInfo);
    return modelInfos;
  }
  static getModelPositions_2(p1, p2, size, arrangementInfo) {
    let angle = this.getAngle(p1, p2);
    let dis = GeoMath.getSphereDistance(p1, p2);
    let dx = p2[0] - p1[0];
    let dy = p2[1] - p1[1];
    let dz = p2[2] - p1[2];
    let scale_v = dis / size[0];
    let offset_x = dx / 2;
    let offset_y = dy / 2;
    let offset_z = dz / 2;
    let modelInfos = [];
    let modelInfo = {
      crd: [p1[0] + offset_x, p1[1] + offset_y, p1[2] + offset_z],
      scales: [1, scale_v, 1],
      rotation: [0, 0, -angle]
    };
    modelInfos.push(modelInfo);
    return modelInfos;
  }
  static getModelPositions0(p1, p2, step) {
    let angle = this.getAngle(p1, p2);
    let dis = GeoMath.getSphereDistance(p1, p2);
    let num = dis / step;
    let count = Math.ceil(num);
    let dx = (p2[0] - p1[0]) / num;
    let dy = (p2[1] - p1[1]) / num;
    let dz = (p2[2] - p1[2]) / num;
    let modelInfo = null;
    let modelInfos = [];
    for (let i = 0; i < count; i++) {
      modelInfo = {
        crd: [
          p1[0] + (i + 0.5) * dx,
          p1[1] + (i + 0.5) * dy,
          p1[2] + (i + 0.5) * dz
        ],
        scales: [1, 2, 1],
        // angle:angle,
        rotation: [0, 0, -angle]
      };
      modelInfos.push(modelInfo);
    }
    if (count > num) {
      modelInfo = modelInfos[modelInfos.length - 1];
      modelInfo.crd = [p2[0] - 0.5 * dx, p2[1] - 0.5 * dy, p2[2] - 0.5 * dz];
    }
    return modelInfos;
  }
  static getModelMatrix4(info) {
    let resultMatrix = Cesium.Matrix4.fromArray([
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ]);
    if (info.scales) {
      let s_m4 = Cesium.Matrix4.fromScale(
        new Cesium.Cartesian3(info.scales[0], info.scales[1], info.scales[2])
      );
      Cesium.Matrix4.multiply(s_m4, resultMatrix, resultMatrix);
    }
    let rx = 0, ry = 0, rz = 0;
    if (info.angle) {
      rz = info.angle;
    }
    if (info.rotation) {
      rx = info.rotation[0];
      ry = info.rotation[1];
      rz += info.rotation[2];
    }
    if (rz && rz != 0) {
      let rz_m3 = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(rz));
      let rz_m4 = Cesium.Matrix4.fromRotation(rz_m3);
      Cesium.Matrix4.multiply(rz_m4, resultMatrix, resultMatrix);
    }
    if (rx && rx != 0) {
      let rx_m3 = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(rx));
      let rx_m4 = Cesium.Matrix4.fromRotation(rx_m3);
      Cesium.Matrix4.multiply(rx_m4, resultMatrix, resultMatrix);
    }
    if (ry && ry != 0) {
      let ry_m3 = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(ry));
      let ry_m4 = Cesium.Matrix4.fromRotation(ry_m3);
      Cesium.Matrix4.multiply(ry_m4, resultMatrix, resultMatrix);
    }
    let localToWorld_m4 = Cesium.Transforms.eastNorthUpToFixedFrame(
      Cesium.Cartesian3.fromDegrees(info.crd[0], info.crd[1], info.crd[2])
    );
    Cesium.Matrix4.multiply(localToWorld_m4, resultMatrix, resultMatrix);
    return resultMatrix;
  }
}
__publicField(GltfModelHelper, "numid", 0);
class ModelArrangementInfo {
  constructor() {
    __publicField(this, "arrangementType", ModelArrangementType.SegmentedScaling);
    __publicField(this, "spacing", 0);
  }
}
class ModelArrangementType {
  //整段进行拉伸，不进行分段
}
__publicField(ModelArrangementType, "SegmentedScaling", 0);
//分段排列,不足距离时进行收缩和拉伸
__publicField(ModelArrangementType, "Segmented", 1);
//沿线分段排列,不做拉伸
__publicField(ModelArrangementType, "Scaling", 2);
const tfMaterialMap = {
  SOLIDLINE: new Cesium.PolylineMaterialAppearance({
    material: new Cesium.Material({
      fabric: {
        type: "Color",
        uniforms: {
          flat: true,
          faceForward: true,
          color: Cesium.Color.fromCssColorString("#fb0f10")
        }
      }
    }),
    translucent: false
  }),
  ZGLINE: new Cesium.PolylineMaterialAppearance({
    material: Cesium.Material.fromType(Cesium.Material.PolylineDashType, {
      color: Cesium.Color.fromCssColorString("#ec2a34"),
      //线条颜色
      dashLength: 20
      //短划线长度
    })
  }),
  XGLINE: new Cesium.PolylineMaterialAppearance({
    material: Cesium.Material.fromType(Cesium.Material.PolylineDashType, {
      color: Cesium.Color.fromCssColorString("#f5961a"),
      //线条颜色
      dashLength: 20
      //短划线长度
    })
  }),
  TWLINE: new Cesium.PolylineMaterialAppearance({
    material: Cesium.Material.fromType(Cesium.Material.PolylineDashType, {
      color: Cesium.Color.fromCssColorString("#e53eff"),
      //线条颜色
      dashLength: 20
      //短划线长度
    })
  }),
  MGLINE: new Cesium.PolylineMaterialAppearance({
    material: Cesium.Material.fromType(Cesium.Material.PolylineDashType, {
      color: Cesium.Color.fromCssColorString("#18f4f7"),
      //线条颜色
      dashLength: 20
      //短划线长度
    })
  }),
  RBLINE: new Cesium.PolylineMaterialAppearance({
    material: Cesium.Material.fromType(Cesium.Material.PolylineDashType, {
      color: Cesium.Color.fromCssColorString("#34bd12"),
      //线条颜色
      dashLength: 20
      //短划线长度
    })
  }),
  GUANGZHOULINE: new Cesium.PolylineMaterialAppearance({
    material: Cesium.Material.fromType(Cesium.Material.PolylineDashType, {
      color: Cesium.Color.fromCssColorString("#f5961a"),
      //线条颜色
      dashLength: 20
      //短划线长度
    })
  }),
  GUANGDAOLINE: new Cesium.PolylineMaterialAppearance({
    material: Cesium.Material.fromType(Cesium.Material.PolylineDashType, {
      color: Cesium.Color.fromCssColorString("#18f4f7"),
      //线条颜色
      dashLength: 20
      //短划线长度
    })
  }),
  XIANGGANGLINE: new Cesium.PolylineMaterialAppearance({
    material: Cesium.Material.fromType(Cesium.Material.PolylineDashType, {
      color: Cesium.Color.fromCssColorString("#e53eff"),
      //线条颜色
      dashLength: 20
      //短划线长度
    })
  }),
  HANGUOLINE: new Cesium.PolylineMaterialAppearance({
    material: Cesium.Material.fromType(Cesium.Material.PolylineDashType, {
      color: Cesium.Color.fromCssColorString("#f2ff00"),
      //线条颜色
      dashLength: 20
      //短划线长度
    })
  })
};
class BaseTool {
  constructor() {
    __publicField(this, "viewer", null);
    __publicField(this, "isOpen", false);
    __publicField(this, "isDisposed", false);
  }
  // 工具打开时的操作
  openTool(type) {
    this.isOpen = true;
  }
  initTool() {
  }
  // 工具关闭时的操作
  closeTool() {
    this.isOpen = false;
  }
  clear() {
  }
  dispose() {
    this.clear();
    this.isDisposed = true;
  }
  //  获取 Cartesian3 坐标
  getCartesian3(obj) {
    if (Cesium.SceneMode.SCENE2D) {
      return this.viewer.scene.globe.pick(
        this.viewer.camera.getPickRay(obj),
        this.viewer.scene
      );
    } else {
      return RayPickedHelper.drillPick(this.viewer, obj.x, obj.y)[0].position;
    }
  }
  // 获取实体
  getEntity(position) {
    const obj = this.viewer.scene.pick(position);
    if (Cesium.defined(obj)) {
      return obj.id;
    }
    return null;
  }
  // css 颜色转 Cesium.Color 类型
  color(cssColor, alpha = 1) {
    return Cesium.Color.fromCssColorString(cssColor).withAlpha(alpha);
  }
}
const uuid = () => {
  const id = URL.createObjectURL(new Blob());
  URL.revokeObjectURL(id);
  return id.substring(5 + location.origin.length + 1);
};
const _AProfileAnalysisTool = class _AProfileAnalysisTool extends BaseTool {
  constructor(viewer, mapOption) {
    super();
    __publicField(this, "viewer", null);
    __publicField(this, "mapOption");
    __publicField(this, "handler", null);
    // 事件处理器
    __publicField(this, "isOpen", false);
    // 是否开启工具
    __publicField(this, "leftClickTime", 0);
    // 左键点击记录时间间隔
    __publicField(this, "mapCanvas", document.querySelector("#map_container"));
    __publicField(this, "mouseMovePointCrd", []);
    __publicField(this, "shapeId", "");
    //当前绘制形状uuid
    __publicField(this, "curLinePosObj", {
      id: null,
      labelArr: [],
      positions: [],
      positionArr: [],
      computeArr: [],
      inceptionPosArr: []
    });
    //当前绘制线对象
    __publicField(this, "lineArr", []);
    //所有绘制线对象
    __publicField(this, "lineTip", null);
    __publicField(this, "profileCollent", {
      labelList: []
    });
    // 打开、关闭、绘制完成回调函数
    __publicField(this, "openToolCallback", null);
    __publicField(this, "drawEndCallback", null);
    __publicField(this, "closeToolCallback", null);
    __publicField(this, "updataLineCallback", null);
    __publicField(this, "delectLineCallback", null);
    __publicField(this, "keyUpListenerHandel", (e) => {
      if (this.isOpen == true && e.key === "Delete") {
        if (this.curLinePosObj && Array.isArray(this.curLinePosObj.positions) && this.curLinePosObj.positions.length > 1) {
          this.curLinePosObj.positions.splice(
            this.curLinePosObj.positions.length - 1,
            1
          );
          this.curLinePosObj.positionArr.splice(
            this.curLinePosObj.positionArr.length - 1,
            1
          );
          this.curLinePosObj.computeArr.splice(
            this.curLinePosObj.computeArr.length - 1,
            1
          );
          this.curLinePosObj.inceptionPosArr.splice(
            this.curLinePosObj.inceptionPosArr.length - 1,
            1
          );
          let lastLine = this.lineArr.at(-1);
          if (lastLine) {
            DynamicPrimitive.updatePolylinePos(
              lastLine.id,
              this.curLinePosObj.positions
            );
          }
          if (DynamicPrimitive.getLine(this.shapeId + "un")) {
            DynamicPrimitive.removePolyline(this.shapeId + "un");
            let pointOutlineColor = Cesium.Color.fromCssColorString(
              _AProfileAnalysisTool.profileClassSetting.lineColor
            );
            pointOutlineColor.alpha = _AProfileAnalysisTool.profileClassSetting.pointOpacity;
            let pointColor = Cesium.Color.fromCssColorString(
              _AProfileAnalysisTool.profileClassSetting.pointColor
            );
            pointColor.alpha = _AProfileAnalysisTool.profileClassSetting.pointOpacity;
            DynamicPrimitive.addPolyline({
              id: this.shapeId + "un",
              color: Cesium.Color.LAWNGREEN,
              pointColor,
              pointOutlineColor,
              width: _AProfileAnalysisTool.profileClassSetting.lineWidth,
              positions: [
                this.curLinePosObj.positions.at(-1),
                this.mouseMovePointCrd
              ],
              isHeight: true,
              isGround: true,
              isDashed: true,
              isPoint: _AProfileAnalysisTool.profileClassSetting.isPointLine,
              pointOutline: true,
              pointOutlineWidth: 3
            });
          }
          let lastLabel = this.profileCollent.labelList.at(-1);
          if (lastLabel && lastLabel.id) {
            this.mapOption.removeBalloon(lastLabel.id);
            this.profileCollent.labelList = this.profileCollent.labelList.filter(
              (v) => {
                if (v && v.id) {
                  return v.id !== lastLabel.id;
                }
              }
            );
          }
        } else {
          DynamicPrimitive.removePolyline(this.shapeId);
          DynamicPrimitive.removePolyline(this.shapeId + "un");
          if (this.profileCollent && Array.isArray(this.profileCollent.labelList) && this.profileCollent.labelList.length) {
            this.profileCollent.labelList.forEach((lastLabel) => {
              if (lastLabel && lastLabel.id) {
                this.mapOption.removeBalloon(lastLabel.id);
              }
            });
          }
          this.lineArr = [];
          this.mouseMovePointCrd = [];
          if (this.curLinePosObj) {
            this.curLinePosObj.positions = [];
            this.curLinePosObj.positionArr = [];
            this.curLinePosObj.computeArr = [];
            this.curLinePosObj.inceptionPosArr = [];
          }
          this.profileCollent.labelList = [];
        }
      }
    });
    // 双击
    __publicField(this, "leftDoubleClickListener", () => {
      this.drawEnd();
      this.closeTool();
    });
    // 单击
    __publicField(this, "leftClickListener", async (e, rayCrd) => {
      if (performance.now() - this.leftClickTime < 300) {
        this.leftClickTime = performance.now();
        return this.leftDoubleClickListener();
      }
      this.leftClickTime = performance.now();
      if (this.isOpen) {
        if (this.mouseMovePointCrd.length) {
          let tempCrd = this.mouseMovePointCrd;
          rayCrd = tempCrd[2] <= 0 ? [tempCrd[0], tempCrd[1], 0] : tempCrd;
        } else {
          rayCrd = rayCrd[2] <= 0 ? [rayCrd[0], rayCrd[1], 0] : rayCrd;
        }
        this.mapOption.getTerrainHeight(
          rayCrd[0],
          rayCrd[1],
          this.mapOption.terrain,
          async (points) => {
            if (points && points.length > 0) {
              let h = points[0].height;
              let c3 = Cesium.Cartesian3.fromDegrees(rayCrd[0], rayCrd[1], h);
              let crd = {
                WGS84: rayCrd,
                Cartesian3: c3
              };
              if (crd) {
                if (!this.curLinePosObj.positions.length) {
                  this.createLine();
                }
                let pos84 = [
                  Number(crd.WGS84[0].toFixed(6)),
                  Number(crd.WGS84[1].toFixed(6)),
                  crd.WGS84[2] ? crd.WGS84[2] : 0
                ];
                this.curLinePosObj.positions.push(pos84);
                this.curLinePosObj.positionArr.push(crd.Cartesian3);
                this.curLinePosObj.inceptionPosArr.push([
                  rayCrd[0],
                  rayCrd[1],
                  h
                ]);
                if (!DynamicPrimitive.getLine(this.shapeId)) {
                  let pointOutlineColor = Cesium.Color.fromCssColorString(
                    _AProfileAnalysisTool.profileClassSetting.lineColor
                  );
                  pointOutlineColor.alpha = _AProfileAnalysisTool.profileClassSetting.pointOpacity;
                  let pointColor = Cesium.Color.fromCssColorString(
                    _AProfileAnalysisTool.profileClassSetting.pointColor
                  );
                  pointColor.alpha = _AProfileAnalysisTool.profileClassSetting.pointOpacity;
                  let lineColor = Cesium.Color.fromCssColorString(
                    _AProfileAnalysisTool.profileClassSetting.lineColor
                  );
                  lineColor.alpha = _AProfileAnalysisTool.profileClassSetting.lineOpacity;
                  DynamicPrimitive.addPolyline({
                    id: this.shapeId,
                    positions: this.curLinePosObj.positions,
                    color: lineColor,
                    pointColor,
                    pointOutlineColor,
                    width: _AProfileAnalysisTool.profileClassSetting.lineWidth,
                    isHeight: true,
                    isGround: true,
                    isPoint: _AProfileAnalysisTool.profileClassSetting.isPointLine,
                    pointOutline: true,
                    pointOutlineWidth: 3
                  });
                } else {
                  DynamicPrimitive.updatePolylinePos(
                    this.shapeId,
                    this.curLinePosObj.positions
                  );
                }
                if (DynamicPrimitive.getLine(this.shapeId + "un")) {
                  const l = this.curLinePosObj.positions.at(-1);
                  DynamicPrimitive.updatePolylinePos(this.shapeId + "un", [l, l]);
                }
                try {
                  await this.getConputedLength();
                  this.drawLabelHandel();
                } catch (error) {
                  this.drawLabelHandel();
                }
              }
            }
          }
        );
      }
    });
    // 右击
    __publicField(this, "rightClickListener", async (e) => {
      var _a2, _b2;
      if (e && this.isOpen && ((_b2 = (_a2 = this.curLinePosObj) == null ? void 0 : _a2.positions) == null ? void 0 : _b2.length)) {
        let ncrd = [this.mouseMovePointCrd[0], this.mouseMovePointCrd[1]];
        this.mapOption.getTerrainHeight(
          ncrd[0],
          ncrd[1],
          this.mapOption.terrain,
          async (points) => {
            let h = points[0].height;
            let crd = {
              WGS84: this.mouseMovePointCrd,
              Cartesian3: Cesium.Cartesian3.fromDegrees(
                this.mouseMovePointCrd[0],
                this.mouseMovePointCrd[1],
                h
              )
            };
            if (crd) {
              let pos84 = [
                Number(crd.WGS84[0].toFixed(6)),
                Number(crd.WGS84[1].toFixed(6)),
                crd.WGS84[2] ? crd.WGS84[2] : 0
              ];
              this.curLinePosObj.positions.push(pos84);
              this.curLinePosObj.positionArr.push(crd.Cartesian3);
              this.curLinePosObj.inceptionPosArr.push([ncrd[0], ncrd[1], h]);
              DynamicPrimitive.updatePolylinePos(
                this.shapeId,
                this.curLinePosObj.positions
              );
            }
            this.getConputedLength().then((res) => {
              if (res) {
                this.drawEnd();
                this.closeTool();
              }
            });
          }
        );
      }
    });
    __publicField(this, "mouseMoveListener", async (pick, e) => {
      var _a2, _b2;
      let rayCrds = RayPickedHelper.drillPick(
        this.viewer,
        e.endPosition.x,
        e.endPosition.y,
        3
      );
      let rayCrd = null;
      if (Array.isArray(rayCrds) && rayCrds.length) {
        rayCrds.filter((ray) => ray)[0];
      }
      if (!rayCrd) {
        let crd = this.mapOption.pixelToCoordinates(
          e.endPosition.x,
          e.endPosition.y
        );
        rayCrd = {
          crd,
          position: Cesium.Cartesian3.fromDegrees(crd[0], crd[1], crd[2])
        };
      }
      let c3 = rayCrd.position;
      const cartesian = c3;
      if (Cesium.defined(cartesian)) {
        this.refreshTip(cartesian);
      }
      if (this.isOpen) {
        if ((_b2 = (_a2 = this.curLinePosObj) == null ? void 0 : _a2.positions) == null ? void 0 : _b2.length) {
          rayCrd = rayCrd[2] <= 0 ? [rayCrd[0], rayCrd[1], 0.1] : rayCrd;
          let crd = {
            WGS84: rayCrd.crd,
            Cartesian3: c3
          };
          if (crd == null ? void 0 : crd.WGS84) {
            if (!DynamicPrimitive.getLine(this.shapeId + "un")) {
              let pointOutlineColor = Cesium.Color.fromCssColorString(
                _AProfileAnalysisTool.profileClassSetting.lineColor
              );
              pointOutlineColor.alpha = _AProfileAnalysisTool.profileClassSetting.pointOpacity;
              let pointColor = Cesium.Color.fromCssColorString(
                _AProfileAnalysisTool.profileClassSetting.pointColor
              );
              pointColor.alpha = _AProfileAnalysisTool.profileClassSetting.pointOpacity;
              DynamicPrimitive.addPolyline({
                id: this.shapeId + "un",
                color: Cesium.Color.LAWNGREEN,
                pointColor,
                pointOutlineColor,
                width: _AProfileAnalysisTool.profileClassSetting.lineWidth,
                positions: [this.curLinePosObj.positions.at(-1), crd.WGS84],
                isHeight: true,
                isGround: true,
                isDashed: true,
                isPoint: _AProfileAnalysisTool.profileClassSetting.isPointLine,
                pointOutline: true,
                pointOutlineWidth: 3
              });
            } else {
              DynamicPrimitive.updatePolylinePos(this.shapeId + "un", [
                this.curLinePosObj.positions.at(-1),
                crd.WGS84
              ]);
            }
            this.mouseMovePointCrd = crd.WGS84;
          }
        }
      }
    });
    if (viewer) {
      this.viewer = viewer;
      this.mapOption = mapOption;
      this.handler = mapOption.viewer.screenSpaceEventHandler;
      DynamicPrimitive.viewer = this.viewer;
      MapBaseHelper$1.viewer = this.viewer;
    }
  }
  // 初始化工具
  initTool() {
  }
  // 开始使用工具
  openTool() {
    if (this.isOpen) {
      return;
    }
    this.leftClickTime = 0;
    this.isOpen = true;
    this.shapeId = uuid();
    this.addEventListener();
    if (typeof this.openToolCallback === "function") {
      this.openToolCallback();
    }
  }
  // 添加事件
  addEventListener() {
    this.mapOption.screenSpaceLeftClick(
      "profile_tool_left_click",
      this.leftClickListener
    );
    this.handler.setInputAction(
      this.rightClickListener,
      Cesium.ScreenSpaceEventType.RIGHT_CLICK
    );
    this.mapOption.screenSpaceMouseMove(
      "profile_tool_mouse_move",
      this.mouseMoveListener.bind(this)
    );
    document.addEventListener("keyup", this.keyUpListenerHandel.bind(this));
  }
  // 计算长度
  getConputedLength() {
    return new Promise(async (resolve, reject) => {
      if (this.curLinePosObj.positionArr.at(-2) && this.curLinePosObj.positionArr.at(-1)) {
        const computeObj = await computedMeasureDistance$1(
          this.viewer,
          this.curLinePosObj.positions.at(-2),
          this.curLinePosObj.positions.at(-1)
        );
        this.curLinePosObj.computeArr.push(computeObj);
      }
      resolve(true);
    });
  }
  // 指定对应盒子使用对饮的鼠标样式
  appointBoxCursor(el, cursor) {
    if (el) {
      el.style.cursor = cursor;
    }
  }
  // 线绘制完成
  async drawEnd() {
    if (!this.curLinePosObj.positions.length) return;
    DynamicPrimitive.removePolyline(this.shapeId + "un");
    this.drawLabelHandel();
    if (typeof this.drawEndCallback === "function") {
      this.drawEndCallback(this.curLinePosObj, this.curLinePosObj.positions);
    }
  }
  formatLabelContent(index, data) {
    return `
   <div class="profile-tool-label-warpper">
     <div class="profile-label-header">
       <p>序号：#${index}</p>
     </div>
     <div class="profile-line"></div>
     <div class="profile-label-content">
       <p>线段长度：<span class="unit">${Number(data.segmentLength).toFixed(
      2
    )}</span>米</p>
       <p>距离起点的长度：<span class="unit">${Number(
      data.disHeadLength
    ).toFixed(2)}</span>米</p>
       <p>高程：<span class="unit">${data.height}</span>米</p>
     </div>
   </div>
   `;
  }
  reset() {
    this.curLinePosObj = null;
  }
  drawLabelHandel() {
    let crds = this.curLinePosObj.positions.at(-1);
    let segmentLength = 0;
    let disHeadLength = 0;
    if (this.curLinePosObj.positionArr.at(-2) && this.curLinePosObj.positionArr.at(-1)) {
      segmentLength = computeSphereDistance$1(
        this.curLinePosObj.positions.at(-2),
        this.curLinePosObj.positions.at(-1)
      ).toFixed(2);
    }
    if (this.curLinePosObj.computeArr.length) {
      disHeadLength = Number(
        this.curLinePosObj.computeArr.map((v) => v.globeSurface).reduce((acc, cur) => Number(acc) + Number(cur))
      ).toFixed(2);
    }
    let endCrd = this.curLinePosObj.inceptionPosArr.at(-1);
    this.drawLabel(
      crds,
      this.formatLabelContent(this.curLinePosObj.positions.length, {
        segmentLength,
        disHeadLength,
        height: Number(endCrd[2]).toFixed(2)
      })
    );
  }
  drawLabel(position, content, data) {
    const id = this.shapeId + "_" + this.curLinePosObj.positions.length;
    const labelEntity = this.mapOption.addBalloon({
      id,
      show: _AProfileAnalysisTool.profileClassSetting.isBalloon,
      position,
      content,
      offset: [12, -14],
      data,
      isGround: true
    });
    this.profileCollent.labelList.push(labelEntity);
  }
  refreshTip(position) {
    const coordinate = MapBaseHelper$1.c3ToCoordinates(position);
    let content = "";
    if (!this.lineTip) {
      this.lineTip = this.mapOption.addBalloon({
        id: "line_tip",
        position: [...coordinate],
        content,
        offset: [15, 25]
      });
    }
    if (!this.curLinePosObj.positions.length) {
      content = `<div class="line-tip">单击确定起点</div>`;
    } else {
      content = ` <div class="line-tip">单击继续，双击或者右键结束</div> `;
    }
    this.mapOption.showBalloon("line_tip");
    this.mapOption.refreshBalloon("line_tip", coordinate, content);
  }
  // 创建线
  createLine() {
    const completedLine = {
      id: this.shapeId,
      unId: this.shapeId + "un",
      positions: [],
      lineLength: 0,
      index: this.lineArr.length - 1,
      positionArr: [],
      labelArr: []
    };
    this.lineArr.push(completedLine);
    return completedLine;
  }
  //  移除事件
  removeEventListener() {
    this.mapOption.removeMapListener("LeftClick", "profile_tool_left_click");
    this.mapOption.removeMapListener("MouseMove", "profile_tool_mouse_move");
    this.handler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    document.removeEventListener("keyup", this.keyUpListenerHandel);
  }
  // 移除所有线
  clear() {
    this.isOpen = false;
    const ids = this.lineArr.map((it) => it.id);
    for (let i = ids.length - 1; i >= 0; i--) {
      DynamicPrimitive.removePolyline(ids[i]);
      DynamicPrimitive.removePolyline(ids[i] + "un");
    }
    this.lineArr = [];
    this.curLinePosObj = null;
    this.removeEventListener();
    this.profileCollent.labelList.forEach((el) => {
      el && this.mapOption.removeBalloon(el.id);
    });
    this.mapOption.removeBalloon("line_tip");
    this.lineTip = null;
  }
  // 移除线
  removeLine(line) {
    if (line) {
      this.lineArr.findIndex((item) => item.id === line.id);
      if (line.labelArr) {
        line.labelArr.forEach((m) => {
          this.mapOption.removeBalloon(m.id);
        });
      }
      DynamicPrimitive.removePolyline(line.id);
      DynamicPrimitive.removePolyline(line.id + "un");
    }
    if (typeof this.delectLineCallback == "function") {
      this.delectLineCallback(line);
    }
  }
  // 关闭工具
  closeTool() {
    if (this.isOpen && this.curLinePosObj) {
      this.removeEventListener();
      this.mouseMovePointCrd = [];
      if (this.curLinePosObj.positions.length === 1) {
        const id = this.shapeId + "_" + this.curLinePosObj.positions.length;
        DynamicPrimitive.removePolyline(this.shapeId);
        DynamicPrimitive.removePolyline(this.shapeId + "un");
        this.mapOption.removeBalloon("line_tip");
        this.mapOption.removeBalloon(id);
        this.curLinePosObj = null;
      } else {
        this.curLinePosObj && this.drawEnd();
      }
      this.isOpen = false;
      this.lineTip && this.mapOption.removeBalloon("line_tip");
      this.lineTip = null;
      if (typeof this.closeToolCallback === "function") {
        this.closeToolCallback();
      }
    } else {
      this.removeEventListener();
      this.isOpen = false;
      this.lineTip && this.mapOption.removeBalloon("line_tip");
      this.lineTip = null;
    }
  }
  // 清理资源
  dispose() {
    this.clear();
    this.isDisposed = true;
    this.handler = null;
    this.viewer = null;
    this.curLinePosObj = {
      id: null,
      labelArr: [],
      positions: [],
      positionArr: [],
      computeArr: []
    };
    this.lineArr = [];
    this.openToolCallback = null;
    this.drawEndCallback = null;
    this.closeToolCallback = null;
    this.delectLineCallback = null;
    this.updataLineCallback = null;
    this.removeEventListener();
  }
};
__publicField(_AProfileAnalysisTool, "profileClassSetting", {
  isPointLine: true,
  // 线段是否显示点
  isBalloon: true,
  // 线段是否显示弹框
  pointColor: "#ffffff",
  pointOpacity: 1,
  lineColor: "#ff0000",
  lineOpacity: 1,
  lineWidth: 3
});
let AProfileAnalysisTool = _AProfileAnalysisTool;
const computedMeasureDistance$1 = (viewer, previousCartesian, currentCartesian) => {
  return new Promise(async (resolve) => {
    const params = {};
    params.globeSurface = computeSphereDistance$1(
      previousCartesian,
      currentCartesian
    );
    resolve(params);
  });
};
const computeSphereDistance$1 = (previousCartesian, currentCartesian) => {
  return GeoMath.getSurfaceDistance(previousCartesian, currentCartesian);
};
class GetHeigthCoordinate {
  static getTerrainHeightHandel(crdh) {
    return new Promise((resolve, reject) => {
      this.mapAdapter.getTerrainHeight(crdh[0], crdh[1], this.mapAdapter.terrain, (result) => {
        const height = result[0].height.toFixed(2);
        resolve(height);
      });
    });
  }
  static getModelHeightHandel(crdh) {
    return new Promise(async (resolve, reject) => {
      const result = await this.mapAdapter.getModelHeight(crdh[0], crdh[1]);
      const cartographic = Cesium.Cartographic.fromCartesian(result[0]);
      const height = Number(cartographic.height).toFixed(2);
      resolve(height);
    });
  }
}
__publicField(GetHeigthCoordinate, "mapAdapter");
class TriangleTool extends BaseTool {
  constructor(viewer, mapOption) {
    super();
    // private viewer: Cesium.Viewer;
    __publicField(this, "mapOption");
    __publicField(this, "handler");
    __publicField(this, "isOpen", false);
    __publicField(this, "cursorName", "triangleCursor");
    __publicField(this, "labelName", "triangleLabel");
    __publicField(this, "pointName", "trianglePoint");
    __publicField(this, "unit", "公里");
    __publicField(this, "mapCanvas", document.querySelector("#map_container"));
    __publicField(this, "leftClickTime", +/* @__PURE__ */ new Date());
    //距离提示
    __publicField(this, "currentData", null);
    __publicField(this, "allShape", []);
    __publicField(this, "shapeId", "");
    __publicField(this, "shapeIdx", 1);
    __publicField(this, "moveCartesian", null);
    __publicField(this, "changeCallback", () => {
    });
    __publicField(this, "autoUnitFlag", true);
    // 是否自动切换单位
    __publicField(this, "autoUnit", "平方公里");
    __publicField(this, "cursorLabel", false);
    __publicField(this, "polygonParams", {
      color: Cesium.Color.RED,
      width: 3,
      isHeight: true,
      isPoint: true,
      pointOutline: true
      // color: Cesium.Color.RED.withAlpha(0.5),
      // outline: true,
      // outlineColor: Cesium.Color.RED,
      // outlineWidth: 3
    });
    __publicField(this, "pointParams", {
      pixelSize: 10,
      color: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.RED,
      outlineWidth: 3,
      zIndex: 99
    });
    __publicField(this, "activeId", "");
    __publicField(this, "autoConvertUnit", (value, unit = "米") => {
      const units = ["公里", "米", "分米", "厘米"];
      const unitValues = {
        公里: 1e-3,
        米: 1,
        分米: 10,
        厘米: 100
      };
      let currentValue = value;
      let currentUnit = unit;
      while (currentValue >= 1e3 && units.indexOf(currentUnit) > 0) {
        currentUnit = units[units.indexOf(currentUnit) - 1];
        currentValue = currentValue * unitValues[currentUnit];
      }
      return { value: currentValue.toFixed(2), unit: currentUnit };
    });
    __publicField(this, "leftDoubleClickListener", (ev) => {
      if (this.moveCartesian) {
        const wgs84 = PosUtil.Cartesian3ToWGS84(this.moveCartesian);
        let myCrds = this.mapOption.pixelToCoordinates(
          ev.position.x,
          ev.position.y
        );
        if (!wgs84 || !myCrds) return;
        this.drawEnd(myCrds);
      }
    });
    this.mapOption = mapOption;
    this.viewer = viewer;
    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    DynamicPrimitive.viewer = this.viewer;
    MapBaseHelper$1.viewer = this.viewer;
    PosUtil.viewer = this.viewer;
  }
  refreshCursor(c) {
    var _a2, _b2;
    let content = "";
    if ((_b2 = (_a2 = this.currentData) == null ? void 0 : _a2.positions) == null ? void 0 : _b2.length) {
      content = `<div class="line-tip">双击或右键结束</div>`;
    } else {
      content = `<div class="line-tip">单击确定起点</div>`;
    }
    if (this.cursorLabel) {
      this.mapOption.showBalloon(this.cursorName);
      this.mapOption.refreshBalloon(
        this.cursorName,
        PosUtil.Cartesian3ToWGS84(c),
        content
      );
    } else {
      this.cursorLabel = this.mapOption.addBalloon({
        id: this.cursorName,
        position: PosUtil.Cartesian3ToWGS84(c),
        content,
        offset: [12, 32]
      });
    }
  }
  getPointLabel(wgs84, isEnd, idx) {
    if (!idx) {
      idx = this.shapeIdx;
    }
    return `<span class="triangle-label">
     <span>三角测量${idx}${isEnd ? "终点" : "起点"}</span>
  ${isEnd ? ' <span class="btn-remove-triangle"></span>' : ""}
      <div class="line-label-content">
        <div class="line-division"></div>
        <span>经度：${wgs84[0].toFixed(6)}</span>
        <span>纬度：${wgs84[1].toFixed(6)}</span>
        <span>高度：${Number(wgs84[2]).toFixed(2)}</span>
      </div>
    </span>`;
  }
  getUnitValue(prop, data, autoUnitBl = this.autoUnitFlag) {
    var _a2;
    if (!data) {
      data = ((_a2 = this.currentData) == null ? void 0 : _a2.data) || {};
    }
    let unit = this.unit;
    let n = data[prop];
    const maxNum = Math.max(...Object.values(data));
    if (this.autoUnitFlag && autoUnitBl) {
      unit = this.autoConvertUnit(maxNum).unit;
      this.autoUnit = unit;
    } else {
      unit = this.unit;
    }
    if (unit === "公里") {
      n = n * 1e-3;
    } else if (unit === "分米") {
      n = n * 10;
    } else if (unit === "厘米") {
      n = n * 100;
    }
    if (prop === "distance") {
      return `<div class="triangle-tip">水平${n.toFixed(2)}${unit}</div>`;
    } else if (prop === "len") {
      return `<div class="triangle-tip" >空间${n.toFixed(2)}${unit}</div>`;
    } else if (prop === "height") {
      return `<div class="triangle-tip">直线${n.toFixed(2)}${unit}</div>`;
    }
  }
  async leftClickListener(ev) {
    if (Date.now() - this.leftClickTime < 300) {
      this.leftClickTime = Date.now();
      return this.leftDoubleClickListener(ev);
    }
    this.leftClickTime = Date.now();
    if (this.isOpen) {
      const cartesian = PosUtil.pickPos(ev.position);
      if (!cartesian) return;
      this.refreshCursor(cartesian);
      const wgs84 = PosUtil.Cartesian3ToWGS84(cartesian);
      let myCrds = this.mapOption.pixelToCoordinates(
        ev.position.x,
        ev.position.y
      );
      if (!wgs84 || !myCrds) return;
      if (myCrds[2] <= 0) {
        myCrds[2] = 0;
      }
      if (this.viewer.terrainProvider._scheme) {
        const resHeight = await GetHeigthCoordinate.getTerrainHeightHandel(
          myCrds
        );
        myCrds = [myCrds[0], myCrds[1], resHeight];
        const pick = this.viewer.scene.pick(ev.position);
        if (pick && pick.detail) {
          myCrds = this.mapOption.pixelToCoordinates(
            ev.position.x,
            ev.position.y
          );
          if (myCrds[2] <= 0) {
            myCrds[2] = 0;
          }
        }
      }
      if (!this.currentData) {
        const data = {
          id: this.shapeId + "",
          positions: [],
          //距离提示
          tips: [],
          //距离提示坐标
          tipsPoints: [],
          //经纬度提示
          pointLabel: [],
          data: {
            distance: 0,
            len: 0,
            height: 0
          }
        };
        this.allShape.push(data);
        this.currentData = data;
      }
      if (this.currentData.positions.length === 0 && !this.currentData.pointLabel[0]) {
        this.currentData.pointLabel[0] = this.mapOption.addBalloon({
          id: this.shapeId + "_0",
          position: myCrds,
          content: this.getPointLabel(myCrds),
          offset: [12, -48]
        });
        this.currentData.positions.push(wgs84);
        this.drawTriangle([wgs84, wgs84]);
      }
    }
  }
  async drawEnd(wgs84) {
    if (!this.currentData) return;
    if (wgs84 && wgs84[2]) {
      if (wgs84[2] <= 0) {
        wgs84[2] = 0;
      }
    }
    // if (this.viewer.terrainProvider._scheme) {
    //   const resHeight = await GetHeigthCoordinate.getTerrainHeightHandel(
    //     wgs84
    //   );
    //   wgs84 = [wgs84[0], wgs84[1], resHeight];
    // }
    this.currentData.pointLabel[1] = this.mapOption.addBalloon({
      id: this.shapeId + "_1",
      position: wgs84,
      content: this.getPointLabel(wgs84, true),
      offset: [12, -48]
    });
    this.currentData.positions.push(wgs84);
    this.drawTriangle(this.currentData.positions);
    this.closeTool();
  }
  updateTipLabel(autoUnitBl) {
    this.allShape.forEach((item) => {
      this.mapOption.refreshBalloon(
        item.tips[0].id,
        item.tipsPoints[0],
        this.getUnitValue("distance", item.data, autoUnitBl)
      );
      this.mapOption.refreshBalloon(
        item.tips[1].id,
        item.tipsPoints[1],
        this.getUnitValue("len", item.data, autoUnitBl)
      );
      this.mapOption.refreshBalloon(
        item.tips[2].id,
        item.tipsPoints[2],
        this.getUnitValue("height", item.data, autoUnitBl)
      );
    });
  }
  viewItem(id) {
    if (this.activeId) {
      const beforeActive = DynamicPrimitive.getLine(this.activeId);
      if (beforeActive) beforeActive.color = Cesium.Color.RED;
    }
    const idx = this.allShape.findIndex((it) => it.id === id);
    const item = this.allShape[idx];
    item.pointLabel.forEach((it) => {
      this.mapOption.showBalloon(it.id);
    });
    const line = DynamicPrimitive.getLine(id);
    if (line) {
      this.activeId = id;
      line.color = Cesium.Color.CYAN;
      item.tipsPoints[1];
      this.setMapView(item.positions);
      this.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    }
  }
  setMapView(positions) {
    MapBaseHelper$1.viewer = this.viewer;
    let crds = [];
    const heights = [];
    positions.forEach((crd) => {
      crds.push(crd[0], crd[1]);
      heights.push(crd[2]);
    });
    crds = crds.flat(5);
    if (crds) {
      const bbox = this.mapOption.getBounds(crds);
      const wh = [
        this.mapOption.viewer.scene.canvas.width - 720,
        this.mapOption.viewer.scene.canvas.height - 200
      ];
      const maxLevel2 = this.mapOption.getMaxLevel(bbox, wh[0], wh[1]);
      let pit = maxLevel2 <= 7 ? -90 : -45;
      let lng = (bbox[0] + bbox[2]) / 2;
      let lat = (bbox[1] + bbox[3]) / 2;
      if (this.mapOption.viewer.scene.mode == Cesium.SceneMode.SCENE3D) {
        MapBaseHelper$1.setViewAndAngle3D(this.mapOption.viewer, {
          centerX: lng,
          centerY: lat,
          centerZ: Math.max(...heights) + 10,
          level: maxLevel2 - 1,
          // range:MapBaseHelper.mapsLevelToHeight(level),//米
          heading: Cesium.Math.toRadians(0),
          //弧度
          pitch: Cesium.Math.toRadians(pit),
          //弧度
          roll: Cesium.Math.toRadians(0),
          //弧度
          duration: 0.5
        });
      } else {
        MapBaseHelper$1 == null ? void 0 : MapBaseHelper$1.setViewAndAngle(lng, lat, maxLevel2, pit, 0, 0.5);
      }
    }
  }
  updatePointLabel() {
    this.allShape.forEach((it, idx) => {
      this.mapOption.refreshBalloon(
        it.pointLabel[0].id,
        it.positions[0],
        this.getPointLabel(it.positions[0], false, idx + 1)
      );
      this.mapOption.refreshBalloon(
        it.pointLabel[1].id,
        it.positions[1],
        this.getPointLabel(it.positions[1], true, idx + 1)
      );
    });
  }
  drawTriangle(positions) {
    var _a2;
    if (!this.currentData) return;
    const p1 = positions[0];
    const p2 = positions[1];
    const distance2 = PosUtil.getSpaceDistance(
      PosUtil.WGS84ToCartographic(p1),
      PosUtil.WGS84ToCartographic(p2)
    );
    const height = Math.abs(p1[2] - p2[2]);
    const len = Math.sqrt(distance2 * distance2 + height * height);
    const maxHeight = Math.max(p1[2], p2[2]);
    const p3 = [p2[0], p2[1], p1[2]];
    const pos = [p2, p3, p1, p2];
    this.currentData.data = {
      distance: distance2,
      len,
      height
    };
    const id = this.shapeId;
    if (!DynamicPrimitive.getLine(this.currentData.id)) {
      DynamicPrimitive.addPolyline({
        id,
        positions: pos,
        ...this.polygonParams
      });
    } else {
      DynamicPrimitive.updatePolylinePos(id, pos);
    }
    const h = maxHeight - height * 0.5;
    const centerX = (p1[0] + p2[0]) * 0.5;
    const centerY = (p1[1] + p2[1]) * 0.5;
    const distancePoint = [centerX, centerY, p3[2]];
    const lenPoint = [centerX, centerY, h];
    const heightPoint = [p3[0], p3[1], h];
    this.currentData.tipsPoints = [distancePoint, lenPoint, heightPoint];
    if ((_a2 = this.currentData.tips) == null ? void 0 : _a2.length) {
      this.mapOption.refreshBalloon(
        this.currentData.tips[0].id,
        distancePoint,
        this.getUnitValue("distance")
      );
      this.mapOption.refreshBalloon(
        this.currentData.tips[1].id,
        lenPoint,
        this.getUnitValue("len")
      );
      this.mapOption.refreshBalloon(
        this.currentData.tips[2].id,
        heightPoint,
        this.getUnitValue("height")
      );
    } else {
      this.currentData.tips = [
        this.mapOption.addBalloon({
          id: this.shapeId + this.labelName + "1",
          position: distancePoint,
          content: this.getUnitValue("distance"),
          offset: [-60, -14]
        }),
        this.mapOption.addBalloon({
          id: this.shapeId + this.labelName + "2",
          position: lenPoint,
          content: this.getUnitValue("len"),
          offset: [-60, -14]
        }),
        this.mapOption.addBalloon({
          id: this.shapeId + this.labelName + "3",
          position: heightPoint,
          content: this.getUnitValue("height"),
          offset: [-95, -14]
        })
      ];
    }
  }
  rightClickListener(ev) {
    this.leftDoubleClickListener(ev);
  }
  mouseMoveListener(ev) {
    var _a2, _b2;
    if (this.isOpen) {
      const cartesian = PosUtil.pickPos(ev.endPosition);
      if (!cartesian) return;
      this.moveCartesian = cartesian;
      this.refreshCursor(cartesian);
      const wgs84 = PosUtil.Cartesian3ToWGS84(cartesian);
      if (!wgs84) return;
      if (((_b2 = (_a2 = this.currentData) == null ? void 0 : _a2.positions) == null ? void 0 : _b2.length) === 1) {
        this.drawTriangle([this.currentData.positions[0], wgs84]);
      }
    }
  }
  addEventListener() {
    this.handler.setInputAction(
      this.leftClickListener.bind(this),
      Cesium.ScreenSpaceEventType.LEFT_CLICK
    );
    this.handler.setInputAction(
      this.mouseMoveListener.bind(this),
      Cesium.ScreenSpaceEventType.MOUSE_MOVE
    );
    this.handler.setInputAction(
      this.rightClickListener.bind(this),
      Cesium.ScreenSpaceEventType.RIGHT_CLICK
    );
  }
  //  移除事件
  removeEventListener() {
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    document.body.addEventListener("click", this.onClickListener.bind(this));
  }
  removeItem(id) {
    const dPm = this.allShape.filter((item) => item.id == id)[0];
    this.deleteItem(dPm);
    this.allShape = this.allShape.filter((v) => v.id != id);
    this.updatePointLabel();
    if (this.changeCallback) {
      const data = this.allShape.map((it) => {
        return { id: it.id, ...it.data };
      });
      this.changeCallback(data, "close");
    }
  }
  onClickListener(ev) {
    if (ev.target.className === "btn-remove-triangle") {
      const dom = ev.target.parentNode.parentNode;
      const id = dom.id.split("_")[0];
      this.removeItem(id);
    } else if (ev.target.className === "btn-remove-triangle-point") {
      const dom = ev.target.parentNode.parentNode;
      const id = dom.id;
      this.mapOption.hideBalloon(id);
    }
  }
  // 工具打开时的操作
  openTool() {
    if (this.viewer.scene.mode !== Cesium.SceneMode.SCENE3D) {
      return false;
    }
    this.isOpen = true;
    this.addEventListener();
    this.currentIndex = 0;
    this.shapeId = uuid();
    this.shapeIdx = this.allShape.length + 1;
    GetHeigthCoordinate.mapAdapter = this.mapOption;
    return true;
  }
  // 指定对应盒子使用对饮的鼠标样式
  appointBoxCursor(el, cursor) {
    if (el) {
      el.style.cursor = cursor;
    }
  }
  // 工具关闭时的操作
  closeTool() {
    if (this.currentData) {
      if (this.changeCallback && typeof this.changeCallback == "function") {
        let list = this.allShape.map((it) => ({ id: it.id, ...it.data }));
        this.changeCallback(list, "close");
      }
    }
    this.mapOption.removeBalloon(this.cursorName);
    this.cursorLabel = false;
    this.reset();
    this.removeEventListener();
  }
  reset() {
    this.shapeId = "";
    this.currentData = null;
    this.isOpen = false;
    if (this.cursorLabel) {
      this.mapOption.hideBalloon(this.cursorName);
    }
  }
  deleteItem(item) {
    DynamicPrimitive.removePolyline(item ? item.id : "");
    const tipsArr = item && item.tips ? item.tips : [];
    const pointLabelArr = item && item.pointLabel ? item.pointLabel : [];
    tipsArr.forEach((a) => {
      this.mapOption.removeBalloon(a.id);
    });
    pointLabelArr.forEach((a) => {
      this.mapOption.removeBalloon(a.id);
    });
  }
  clear() {
    this.reset();
    this.removeEventListener();
    this.allShape.forEach((item) => {
      if (item) {
        this.deleteItem(item);
      }
    });
    this.allShape = [];
    this.unit = "公里";
    this.changeCallback && this.changeCallback([], "clear");
  }
  dispose2() {
    this.reset();
    this.allShape.forEach((item) => {
      if (item) {
        this.deleteItem(item);
      }
    });
    this.allShape = [];
    this.unit = "公里";
    this.changeCallback && this.changeCallback([], "close");
  }
  dispose() {
    this.reset();
    this.removeEventListener();
    this.allShape.forEach((item) => {
      if (item) {
        this.deleteItem(item);
      }
    });
    this.mapOption.removeBalloon(this.cursorName);
    this.allShape = [];
    this.unit = "公里";
  }
}
function pos2Cartographics(pos) {
  let cArr = null;
  if (pos) {
    cArr = [];
    for (let i = 0; i < pos.length; i += 3) {
      cArr.push(
        Cesium.Cartographic.fromCartesian(
          new Cesium.Cartesian3(pos[i], pos[i + 1], pos[i + 2])
        )
      );
    }
  }
  return cArr;
}
function cartographicsToC3s(cArr) {
  let c3s = null;
  if (cArr) {
    c3s = [];
    for (let i = 0; i < cArr.length; i++) {
      c3s.push(Cesium.Cartographic.toCartesian(cArr[i]));
    }
  }
  return c3s;
}
function getTerrainHeightsFromC3s(pos, terrainProvider, callBack) {
  if (callBack) {
    try {
      if (terrainProvider) {
        const promise = Cesium.sampleTerrainMostDetailed(terrainProvider, pos);
        promise.then(callBack);
      } else {
        callBack(null);
      }
    } catch (e) {
      console.info("地形高度获取失败");
    }
  }
}
let getTerrainAreaCallback = null;
function getTerrainHeightsFromC3sCallback(points) {
  if (points && points.length > 0) {
    const pos = cartographicsToC3s(points);
    const terrainArea = getTrianglesArea(pos, areaIns);
    if (getTerrainAreaCallback) {
      getTerrainAreaCallback(terrainArea);
    }
  } else {
    console.info("地形高度获取失败");
  }
}
function getTrianglesArea(pos, ins) {
  let area = 0;
  if (pos && ins) {
    let c1, c2, c3;
    for (let i = 0; i < ins.length; i += 3) {
      c1 = pos[ins[i]];
      c2 = pos[ins[i + 1]];
      c3 = pos[ins[i + 2]];
      if (!(c1 && c2 && c3)) {
        console.log("");
      }
      area += getTriangleArea(pos[ins[i]], pos[ins[i + 1]], pos[ins[i + 2]]);
    }
  }
  return area;
}
function getTriangleArea(c1, c2, c3) {
  const a = Cesium.Cartesian3.distance(c1, c2);
  const b = Cesium.Cartesian3.distance(c2, c3);
  const c = Cesium.Cartesian3.distance(c3, c1);
  const s = (a + b + c) / 2;
  return Math.sqrt(s * (s - a) * (s - b) * (s - c));
}
let areaIns = null;
let pTerrainProvider = null;
if (window.meta.VITE_BASE_TERRAIN_URL) {
  Cesium.CesiumTerrainProvider.fromUrl(window.meta.VITE_BASE_TERRAIN_URL).then(
    (res) => {
      pTerrainProvider = res;
    }
  );
}
const getTerrainArea = (pointArr, callback) => {
  if (typeof callback === "function") {
    getTerrainAreaCallback = callback;
  }
  let granularity2 = Math.PI / 180;
  const lonArr = pointArr.filter((point, index) => index % 2 === 0);
  const maxX = Math.max(...lonArr);
  const minX = Math.min(...lonArr);
  granularity2 = (maxX - minX) * granularity2 / 20;
  const polygonGeometry = Cesium.PolygonGeometry.fromPositions({
    positions: Cesium.Cartesian3.fromDegreesArray(pointArr),
    vertexFormat: Cesium.PerInstanceColorAppearance.FLAT_VERTEX_FORMAT,
    granularity: granularity2
  });
  const geom = Cesium.PolygonGeometry.createGeometry(polygonGeometry);
  if (geom) {
    const cArr = pos2Cartographics(geom.attributes.position.values);
    areaIns = geom.indices;
    if (cArr) {
      getTerrainHeightsFromC3s(
        cArr,
        pTerrainProvider,
        getTerrainHeightsFromC3sCallback
      );
    }
  }
};
const getPolygonArea = (pointArr) => {
  const EarthRadius = 6371e3;
  let area = 0;
  const crds = [];
  for (let i = 0; i < pointArr.length; i += 2) {
    crds.push({
      x: pointArr[i],
      y: pointArr[i + 1]
    });
  }
  if (crds && crds.length > 2) {
    let x1 = 0;
    let y1 = 0;
    let x2 = 0;
    let y2 = 0;
    for (let iCrd = 0; iCrd < crds.length; iCrd++) {
      const lastIndex = (iCrd + 1) % crds.length;
      x1 = crds[iCrd].x * Math.PI / 180 * EarthRadius;
      y1 = Math.sin(crds[iCrd].y * Math.PI / 180) * EarthRadius;
      x2 = crds[lastIndex].x * Math.PI / 180 * EarthRadius;
      y2 = Math.sin(crds[lastIndex].y * Math.PI / 180) * EarthRadius;
      area += x1 * y2 - y1 * x2;
    }
    area = Math.abs(area) * 0.5;
  }
  return area;
};
const radiansPerDegree = Math.PI / 180;
const degreesPerRadian = 180 / Math.PI;
const distance = (point1, point2) => {
  const point1cartographic = Cesium.Cartographic.fromCartesian(point1);
  const point2cartographic = Cesium.Cartographic.fromCartesian(point2);
  const geodesic = new Cesium.EllipsoidGeodesic();
  geodesic.setEndPoints(point1cartographic, point2cartographic);
  let s = geodesic.surfaceDistance;
  s = Math.sqrt(
    Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2)
  );
  return s;
};
const Bearing = (from, to) => {
  const lat1 = from.lat * radiansPerDegree;
  const lon1 = from.lon * radiansPerDegree;
  const lat2 = to.lat * radiansPerDegree;
  const lon2 = to.lon * radiansPerDegree;
  let angle = -Math.atan2(
    Math.sin(lon1 - lon2) * Math.cos(lat2),
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)
  );
  if (angle < 0) {
    angle += Math.PI * 2;
  }
  angle = angle * degreesPerRadian;
  return angle;
};
const Angle = (p1, p2, p3) => {
  const bearing21 = Bearing(p2, p1);
  const bearing23 = Bearing(p2, p3);
  let angle = bearing21 - bearing23;
  if (angle < 0) {
    angle += 360;
  }
  return angle;
};
const getArea = (points, positions) => {
  let res = 0;
  for (let i = 0; i < points.length - 2; i++) {
    const j = (i + 1) % points.length;
    const k = (i + 2) % points.length;
    const totalAngle = Angle(points[i], points[j], points[k]);
    const dis_temp1 = distance(positions[j], positions[0]);
    const dis_temp2 = distance(positions[k], positions[0]);
    res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle) / 2);
  }
  return res;
};
const getPlaneArea = (pointArr) => {
  const positionArr = pointArr.map(
    (m) => Cesium.Cartesian3.fromDegrees(m.lon, m.lat, m.height)
  );
  const area = getArea(pointArr, positionArr);
  return area;
};
areaIns = null;
function calculateSphereArea(crds, callback) {
  if (typeof callback === "function") {
    getTerrainAreaCallback = callback;
  }
  let granularity2 = Math.PI / 180;
  granularity2 = granularity2 / Math.pow(2, 7);
  const polygonGeometry = Cesium.PolygonGeometry.fromPositions({
    positions: Cesium.Cartesian3.fromDegreesArray(crds),
    vertexFormat: Cesium.PerInstanceColorAppearance.FLAT_VERTEX_FORMAT,
    granularity: granularity2
  });
  const geom = Cesium.PolygonGeometry.createGeometry(polygonGeometry);
  const cArr = pos2Cartographics(geom.attributes.position.values);
  areaIns = geom.indices;
  if (cArr) {
    getTerrainHeightsFromC3s(
      cArr,
      pTerrainProvider,
      getTerrainHeightsFromC3sCallback
    );
  }
}
new Cesium.CesiumTerrainProvider({
  url: "http://192.168.20.10:9596/v1/info/dixing"
});
function calculateSphereDistance(crds) {
  const [x1, y1, x2, y2] = crds;
  const EarthRadius = 6371e3;
  const distance2 = EarthRadius * Math.acos(
    Math.cos(x1 * Math.PI / 180 - x2 * Math.PI / 180) * Math.cos(y1 * Math.PI / 180) * Math.cos(y2 * Math.PI / 180) + Math.sin(y1 * Math.PI / 180) * Math.sin(y2 * Math.PI / 180)
  );
  return distance2;
}
class ALineType {
  //波浪线
}
__publicField(ALineType, "Solid", "solid");
//实线
__publicField(ALineType, "Dashed", "dashed");
//虚线
__publicField(ALineType, "Dotted", "cross");
//点线
__publicField(ALineType, "Double", "Double");
//双实线
__publicField(ALineType, "DoubleDashed", "DoubleDashed");
//双虚线
__publicField(ALineType, "DoubleSolidDashed", "DoubleSolidDashed");
////双线，虚实线
__publicField(ALineType, "WavyLine", "WavyLine");
class APointType {
}
__publicField(APointType, "IconPoint", "iconpoint");
__publicField(APointType, "TextPoint", "textpoint");
__publicField(APointType, "RectPoint", "rectpoint");
__publicField(APointType, "CirclePoint", "circlepoint");
__publicField(APointType, "TrianglePoint", "trianglepoint");
class AGraphicsStyle {
  constructor() {
    __publicField(this, "StyleKey", "ssssss");
    __publicField(this, "LineType", ALineType.Solid);
    //线条类型
    __publicField(this, "LineColor", "#ff0000");
    //线条颜色
    __publicField(this, "LineWeight", 2);
    //线条粗细
    __publicField(this, "LineOpacity", 1);
    //透明度
    __publicField(this, "BorderVisible", true);
    //是否有边线
    __publicField(this, "FillColor", "#ffffff");
    //填充颜色
    __publicField(this, "FillOpacity", 0.5);
    //填充区域透明度
    __publicField(this, "FillVisible", true);
    //是否填充
    //点的特有样式
    __publicField(this, "Offset", 4);
    //点的半径
    __publicField(this, "PointType", APointType.IconPoint);
    //点的类型，是圆点，还是方点
    //点为图标时的样式属性
    __publicField(this, "Icon", "https://picx.zhimg.com/v2-737e76d536e1d9d975c87a9e0d32358c_l.jpg?source=32738c0c");
    //图标对象
    __publicField(this, "IconWidth", 20);
    //图标的大小
    __publicField(this, "IconHeight", 20);
    __publicField(this, "IconOpacity", 1);
    __publicField(this, "OffsetX", 0);
    //图标的像素偏移值
    __publicField(this, "OffsetY", 0);
    __publicField(this, "FontOffsetX", 0);
    //图标的像素偏移值
    __publicField(this, "FontOffsetY", 0);
    __publicField(this, "IconFont", "");
    //字体图标的字体
    //点为文字时的样式属性
    __publicField(this, "Color", "#ffffff");
    //颜色
    __publicField(this, "Pandding", 2);
    __publicField(this, "FontOpacity", 1);
    __publicField(this, "Background", false);
    //是否有背景
    __publicField(this, "BackgroundColor", "#479C1C");
    //背景颜色
    __publicField(this, "BackgroundOpacity", 1);
    __publicField(this, "Border", false);
    //是否有边框
    __publicField(this, "BorderColor", "#f90000");
    //边框颜色
    __publicField(this, "BorderWeight", 1);
    __publicField(this, "BorderOpacity", 1);
    //边框颜色
    //FloatLabel = true;//线的文字标注是否始终在视野内
    //selectable = false;//是否可以选中文字
    __publicField(this, "FontSize", 14);
    //字体大小
    __publicField(this, "bold", true);
    //是否加粗
    __publicField(this, "italic", false);
    //是否斜体
    __publicField(this, "underline", false);
    //是否有下划线
    __publicField(this, "font", "bold 14px 微软雅黑");
    __publicField(this, "distanceDisplayCondition", [0, Number.POSITIVE_INFINITY]);
    // 在什么范围显示
    __publicField(this, "Angle", 0);
  }
  //旋转角度
}
const cartesianToCoordinates = (cartesian) => {
  const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
  const lng = Cesium.Math.toDegrees(cartographic.longitude);
  const lat = Cesium.Math.toDegrees(cartographic.latitude);
  return [lng, lat];
};
const computeSpaceDistance = (previousCartesian, currentCartesian, callback) => {
  return Cesium.Cartesian3.distance(previousCartesian, currentCartesian);
};
const computeSphereDistance = (previousCartesian, currentCartesian) => {
  const previousCoordinates = cartesianToCoordinates(previousCartesian);
  const currentCoordinates = cartesianToCoordinates(currentCartesian);
  return calculateSphereDistance([
    ...previousCoordinates,
    ...currentCoordinates
  ]);
};
const computedMeasureDistance = (viewer, previousCartesian, currentCartesian) => {
  return new Promise(async (resolve) => {
    const params = {
      // surface: 0, // 地表距离
      // space: 0, // 空间距离
      // sphere: 0, // 投影距离
      // globeSurface: 0 // 地球表面
    };
    if (viewer.scene.mode == Cesium.SceneMode.SCENE2D) {
      params.globeSurface = computeSphereDistance(
        previousCartesian,
        currentCartesian
      );
    } else {
      params.space = computeSpaceDistance(previousCartesian, currentCartesian);
    }
    resolve(params);
  });
};
const formatLength = (lineLength, unit = "公里") => {
  const { kilometers, meters, centimeters, decimeters } = convertUnits$1(
    lineLength
  );
  let value = kilometers;
  switch (unit) {
    case "公里":
      value = kilometers;
      break;
    case "米":
      value = meters;
      break;
    case "厘米":
      value = centimeters;
      break;
    case "分米":
      value = decimeters;
      break;
  }
  return '<span class="text-count">' + value + "</span>";
};
const convertUnits$1 = (value) => {
  const kilometers = value / 1e3;
  const meters = value;
  const centimeters = value * 100;
  const decimeters = value * 10;
  return {
    kilometers: kilometers ? kilometers.toFixed(2) : "0.00",
    // 公里
    meters: meters ? meters.toFixed(2) : "0.00",
    // 米
    centimeters: centimeters ? centimeters.toFixed(2) : "0.00",
    // 厘米
    decimeters: decimeters ? decimeters.toFixed(2) : "0.00"
    // 分米
  };
};
const formatContentList = (distanceParams) => {
  const contentList = [];
  for (const key in distanceParams) {
    const item = distanceParams[key];
    if (!item) continue;
    const name = key == "space" ? "空间距离" : key == "surface" ? "地表距离" : key == "sphere" ? "投影距离" : "";
    contentList.push({
      text: name,
      distance: item
    });
  }
  return contentList;
};
const _ALineTool = class _ALineTool extends BaseTool {
  // 3d显示的文字
  constructor(viewer, mapOption) {
    super();
    __publicField(this, "handler", null);
    // 事件处理器
    __publicField(this, "curLine", null);
    // 当前绘制的线
    __publicField(this, "lineArr", []);
    // 已绘制的线数组
    __publicField(this, "lineTip", null);
    __publicField(this, "mapOption");
    __publicField(this, "distanceInfoCount", {
      space: 0,
      // 空间距离
      // surface: 0, // 地表距离
      sphere: 0
      // 投影距离
    });
    __publicField(this, "type", 1);
    // 测量类型 1：空间距离  2：地表距离  3：投影距离
    __publicField(this, "curUnit", "公里");
    // 单位
    __publicField(this, "lineStyle", new AGraphicsStyle());
    // 线样式
    __publicField(this, "tipStyle", new AGraphicsStyle());
    // tip 样式
    // 是否贴地
    __publicField(this, "clampToGround", true);
    __publicField(this, "shapeId", "");
    //当前绘制形状uuid
    // 打开、关闭、绘制完成回调函数
    __publicField(this, "openToolCallback", null);
    __publicField(this, "drawEndCallback", null);
    __publicField(this, "closeToolCallback", null);
    __publicField(this, "updataLineCallback", null);
    __publicField(this, "delectLineCallback", null);
    // 单击事件完成之前的回调函数
    __publicField(this, "leftCLickCompletedCallback", null);
    __publicField(this, "leftClickIsCompleted", true);
    // 单击事件触发的时间
    __publicField(this, "leftClickTime", 0);
    __publicField(this, "mapCanvas", document.querySelector("#map_container"));
    __publicField(this, "lineAllCollent", {
      pointList: [],
      labelList: [],
      lineList: []
    });
    __publicField(this, "activeId", "");
    __publicField(this, "autoUnitFlag", true);
    // 是否自动切换单位
    __publicField(this, "autoUnit", "公里");
    __publicField(this, "mouseMovePointEntiy", null);
    __publicField(this, "mouseMovePointCrd", []);
    // 单击
    __publicField(this, "leftClickListener", async (e, rayCrd) => {
      if (performance.now() - this.leftClickTime < 300) {
        this.leftClickTime = performance.now();
        return this.leftDoubleClickListener();
      }
      this.leftClickTime = performance.now();
      if (this.isOpen) {
        if (this.mouseMovePointCrd.length) {
          let tempCrd = this.mouseMovePointCrd;
          rayCrd = tempCrd[2] <= 0 ? [tempCrd[0], tempCrd[1], 0.1] : tempCrd;
        } else {
          rayCrd = rayCrd[2] <= 0 ? [rayCrd[0], rayCrd[1], 0.1] : rayCrd;
        }
        let c3 = Cesium.Cartesian3.fromDegrees(rayCrd[0], rayCrd[1], rayCrd[2]);
        let crd = {
          WGS84: rayCrd,
          Cartesian3: c3
        };
        if (crd) {
          if (!this.curLine) {
            this.createLine();
          }
          this.curLine.positions.push(crd.WGS84);
          this.curLine.positionArr.push(crd.Cartesian3);
          if (!DynamicPrimitive.getLine(this.shapeId)) {
            DynamicPrimitive.addPolyline({
              id: this.shapeId,
              positions: this.curLine.positions,
              color: Cesium.Color.RED,
              width: 3,
              isHeight: true,
              isGround: false,
              isPoint: true,
              pointOutline: true
            });
          } else {
            DynamicPrimitive.updatePolylinePos(
              this.shapeId,
              this.curLine.positions
            );
          }
          if (DynamicPrimitive.getLine(this.shapeId + "un")) {
            const l = this.curLine.positions.at(-1);
            DynamicPrimitive.updatePolylinePos(this.shapeId + "un", [l, l]);
          }
          if (this.curLine.positionArr.length === 1)
            return this.drawLabel(
              crd.WGS84,
              `<span class="line-label">${window.i18nT ? window.i18nT("线段") : "线段"}${this.lineArr.length}${window.i18nT ? window.i18nT("起点") : "起点"}<span class="btn-remove-point" role="button"></span></span>`
            );
          if (this.type === 1) {
            const distanceParams = await computedMeasureDistance(
              this.viewer,
              this.curLine.positionArr.at(-2),
              this.curLine.positionArr.at(-1)
            );
            this.curLine.lineLength += distanceParams.space;
            if (this.autoUnitFlag) {
              this.autoUnit = this.autoConvertUnit(
                this.viewer.scene.mode == Cesium.SceneMode.SCENE2D ? distanceParams.globeSurface : distanceParams.space
              ).unit;
            } else {
              this.autoUnit = this.curUnit;
            }
            const labelContext = this.getLabelContentUnit(
              distanceParams,
              this.autoUnit
            );
            this.drawLabel(crd.WGS84, labelContext, distanceParams);
            this.leftUnitLabelChange(this.autoUnit, this.lineArr);
          } else {
            const distanceParams = await computedMeasureDistance(
              this.viewer,
              this.curLine.positionArr.at(-2),
              this.curLine.positionArr.at(-1)
            );
            this.curLine.lineLength += distanceParams.space;
            this.drawLabel(
              crd.WGS84,
              this.getMeasureDistanceContent(formatContentList(distanceParams))
            );
          }
        }
      }
    });
    __publicField(this, "autoConvertUnit", (value, unit = "米") => {
      const units = ["公里", "米", "分米", "厘米"];
      const unitValues = {
        公里: 1e3,
        米: 1,
        分米: 0.01,
        厘米: 0.1
      };
      let currentValue = value;
      let currentUnit = unit;
      while (currentValue >= 1e3 && units.indexOf(currentUnit) > 0) {
        currentUnit = units[units.indexOf(currentUnit) - 1];
        currentValue = currentValue / unitValues[currentUnit];
      }
      return { value: currentValue.toFixed(2), unit: currentUnit };
    });
    // 双击
    __publicField(this, "leftDoubleClickListener", () => {
      this.closeTool();
    });
    // 右击
    __publicField(this, "rightClickListener", async (e) => {
      var _a2, _b2;
      if (!this.isOpen) return;
      if (e && this.isOpen && ((_b2 = (_a2 = this.curLine) == null ? void 0 : _a2.positions) == null ? void 0 : _b2.length)) {
        let crd = {
          WGS84: this.mouseMovePointCrd,
          Cartesian3: Cesium.Cartesian3.fromDegrees(
            this.mouseMovePointCrd[0],
            this.mouseMovePointCrd[1],
            this.mouseMovePointCrd[2]
          )
        };
        if (crd) {
          this.curLine.positions.push(crd.WGS84);
          this.curLine.positionArr.push(crd.Cartesian3);
          DynamicPrimitive.updatePolylinePos(
            this.shapeId,
            this.curLine.positions
          );
        }
        this.drawEnd();
        this.closeTool();
      }
    });
    // 鼠标移动
    __publicField(this, "mouseMoveListener", async (pick, e) => {
      var _a2, _b2;
      let rayCrds = RayPickedHelper.drillPick(
        this.viewer,
        e.endPosition.x,
        e.endPosition.y,
        3
      );
      let rayCrd = null;
      console.log('rayCrds', rayCrds);

      if (Array.isArray(rayCrds) && rayCrds.length) {
        rayCrd = rayCrds.filter((ray) => {
          if (ray.obj && ray.obj.id !== "mouse_move_line_point") {
            return ray;
          }
        })[0];
      }

      // let crdtest = this.mapOption.pixelToCoordinates(e.endPosition.x, e.endPosition.y) || [];
      // console.log('rayCrds crdtest', crdtest);


      // if (!rayCrd) {
        let crd = this.mapOption.pixelToCoordinates(e.endPosition.x, e.endPosition.y) || [];
        rayCrd = {
          crd,
          position: Cesium.Cartesian3.fromDegrees(...crd)
        };
      // }
      let c3 = rayCrd.position;
      const cartesian = c3;
      if (Cesium.defined(cartesian)) {
        this.refreshTip(cartesian);
      }
      if (this.isOpen) {
        if ((_b2 = (_a2 = this.curLine) == null ? void 0 : _a2.positions) == null ? void 0 : _b2.length) {
          rayCrd = rayCrd[2] <= 0 ? [rayCrd[0], rayCrd[1], 0.1] : rayCrd;
          let crd = {
            WGS84: rayCrd.crd,
            Cartesian3: c3
          };
          if (crd == null ? void 0 : crd.WGS84) {
            if (!DynamicPrimitive.getLine(this.shapeId + "un")) {
              DynamicPrimitive.addPolyline({
                id: this.shapeId + "un",
                color: Cesium.Color.LAWNGREEN,
                width: 3,
                positions: [this.curLine.positions.at(-1), crd.WGS84],
                isHeight: true,
                isGround: false,
                isDashed: true,
                isPoint: false,
                pointOutline: true
              });
            } else {
              DynamicPrimitive.updatePolylinePos(this.shapeId + "un", [
                this.curLine.positions.at(-1),
                crd.WGS84
              ]);
            }
            if (!this.mouseMovePointEntiy) {
              this.mouseMovePointEntiy = this.drawPoint(crd.WGS84);
            } else {
              this.mouseMovePointCrd = crd.WGS84;
            }
          }
        }
      }
    });
    if (viewer) {
      this.viewer = viewer;
      this.mapOption = mapOption;
      this.handler = mapOption.viewer.screenSpaceEventHandler;
      DynamicPrimitive.viewer = this.viewer;
      MapBaseHelper$1.viewer = this.viewer;
      PosUtil.viewer = this.viewer;
    }
  }
  // 初始化工具
  initTool() {
    document.body.addEventListener("click", this.clickListener.bind(this));
  }
  // 开始使用工具
  openTool(type, unit = "公里") {
    this.type = type;
    if (this.isOpen) {
      return;
    }
    this.leftClickTime = 0;
    this.isOpen = true;
    this.curUnit = unit;
    this.shapeId = uuid();
    this.addEventListener();
    if (typeof this.openToolCallback === "function") {
      this.openToolCallback();
    }
  }
  async getCrd(position, isHeight) {
    let crd = [];
    if (Cesium.SceneMode.SCENE2D === this.viewer.scene.mode) {
      crd = this.mapOption.pixelToGlobeCoordinates(position.x, position.y);
    } else {
      crd = this.mapOption.pixelToCoordinates(position.x, position.y);
    }
    crd = crd[2] <= 0 ? [crd[0], crd[1], 0.1] : crd;
    if (crd) {
      return {
        WGS84: crd,
        Cartesian3: Cesium.Cartesian3.fromDegrees(crd[0], crd[1], crd[2])
      };
    }
  }
  // 添加事件
  addEventListener() {
    this.mapOption.screenSpaceLeftClick(
      "my_line_tool_left_click",
      this.leftClickListener
    );
    this.handler.setInputAction(
      this.rightClickListener,
      Cesium.ScreenSpaceEventType.RIGHT_CLICK
    );
    this.mapOption.screenSpaceMouseMove(
      "my_line_tool_mouse_move",
      this.mouseMoveListener.bind(this)
    );
  }
  // 指定对应盒子使用对饮的鼠标样式
  appointBoxCursor(el, cursor) {
    if (el) {
      el.style.cursor = cursor;
    }
  }
  // 原生单击事件
  clickListener(e) {
    var _a2, _b2, _c, _d, _e, _f, _g, _h;
    if (this.curLine) return;
    const target = e.target;
    if (target.className === "btn-remove-line") {
      let label = (_a2 = target == null ? void 0 : target.parentNode) == null ? void 0 : _a2.parentNode;
      if (label && !label.id) {
        label = (_c = (_b2 = target == null ? void 0 : target.parentNode) == null ? void 0 : _b2.parentNode) == null ? void 0 : _c.parentNode;
      }
      const id = (_d = label == null ? void 0 : label.id) == null ? void 0 : _d.split("_")[0];
      const line = (_e = this.lineArr) == null ? void 0 : _e.find((it) => it.id === id);
      this.removeLine(line);
    } else if (target.className === "btn-remove-point") {
      let label = (_f = target == null ? void 0 : target.parentNode) == null ? void 0 : _f.parentNode;
      if (label && !label.id) {
        label = (_h = (_g = target == null ? void 0 : target.parentNode) == null ? void 0 : _g.parentNode) == null ? void 0 : _h.parentNode;
      }
      this.removePoint(label);
    }
  }
  //  移除事件
  removeEventListener() {
    this.mapOption.removeMapListener("LeftClick", "my_line_tool_left_click");
    this.mapOption.removeMapListener("MouseMove", "my_line_tool_mouse_move");
  }
  // 线绘制完成
  async drawEnd() {
    if (!this.curLine) return;
    DynamicPrimitive.removePolyline(this.shapeId + "un");
    let distanceParams = null;
    if (this.type === 1) {
      distanceParams = await computedMeasureDistance(
        this.viewer,
        this.curLine.positionArr.at(-2),
        this.curLine.positionArr.at(-1)
      );
      if (this.curLine && this.curLine.lineLength) {
        this.curLine.lineLength += distanceParams.space;
      }
      if (this.autoUnitFlag) {
        this.autoUnit = this.autoConvertUnit(
          this.viewer.scene.mode == Cesium.SceneMode.SCENE2D ? distanceParams.globeSurface : distanceParams.space
        ).unit;
      } else {
        this.autoUnit = this.curUnit;
      }
      if (this.curLine && this.curLine.positionArr) {
        const labelContext = this.getLabelContentUnit(
          distanceParams,
          this.curUnit,
          true
        );
        this.drawLabel(this.curLine.positions.at(-1), labelContext, {
          ...distanceParams,
          isLast: true
        });
      }
      this.leftUnitLabelChange(this.autoUnit, this.lineArr);
      if (typeof this.drawEndCallback === "function") {
        if (this.curLine && this.curLine.labelArr) {
          const allDistanceInfo = this.curLine.labelArr.map((m) => m.data);
          this.drawEndCallback(
            this.curLine,
            allDistanceInfo,
            this.curLine.positions
          );
        }
      }
      this.reset();
    } else {
      const distanceParams2 = await computedMeasureDistance(
        this.viewer,
        this.curLine.positionArr.at(-2),
        this.curLine.positionArr.at(-1)
      );
      this.curLine.lineLength += distanceParams2.space;
      this.drawLabel(
        this.curLine.positions.at(-1),
        this.getMeasureDistanceContent(formatContentList(distanceParams2))
      );
      this.reset();
    }
    const obj = this.lineArr.at(-1);
    const uncompletedLine = obj == null ? void 0 : obj.uncompletedLine;
    uncompletedLine && this.viewer.entities.remove(uncompletedLine);
    obj.uncompletedLine = null;
  }
  reset() {
    this.curLine = null;
  }
  // 创建线
  createLine() {
    const completedLine = {
      id: this.shapeId,
      unId: this.shapeId + "un",
      positions: [],
      type: this.type,
      lineLength: 0,
      index: this.lineArr.length - 1,
      positionArr: [],
      labelArr: []
    };
    this.lineArr.push(completedLine);
    this.curLine = completedLine;
    this.lineAllCollent.lineList = this.lineArr;
    return completedLine;
  }
  refreshTip(position) {
    if (this.curLine && this.type === 2) {
      this.mapOption.hideBalloon("line_tip");
      return;
    }
    const coordinate = MapBaseHelper$1.c3ToCoordinates(position);
    let content = "";
    if (!this.lineTip) {
      this.lineTip = this.mapOption.addBalloon({
        id: "line_tip",
        position: [...coordinate],
        content,
        offset: [15, 25]
      });
    }
    if (!this.curLine) {
      content = `<div class="line-tip">${window.i18nT ? window.i18nT("单击确定起点") : "单击确定起点"}</div>`;
    } else {
      content = ` <div class="line-tip">${window.i18nT ? window.i18nT("单击继续，双击或者右键结束") : "单击继续，双击或者右键结束"}</div> `;
    }
    this.mapOption.showBalloon("line_tip");
    this.mapOption.refreshBalloon("line_tip", coordinate, content);
  }
  // 关闭工具
  closeTool() {
    if (this.isOpen && this.curLine) {
      this.removeEventListener();
      this.viewer.entities.remove(this.mouseMovePointEntiy);
      this.mouseMovePointEntiy = null;
      this.mouseMovePointCrd = [];
      if (this.curLine.positions.length === 1) {
        this.removeLine(this.curLine);
        this.curLine = null;
        if (typeof this.drawEndCallback === "function") {
          this.drawEndCallback();
        }
      } else {
        const index = this.curLine.positionArr.length - 1;
        const lastLabel = this.curLine.labelArr.splice(index, 1)[0];
        lastLabel && this.mapOption.removeBalloon(lastLabel.id);
        this.curLine && this.drawEnd();
      }
      this.isOpen = false;
      this.lineTip && this.mapOption.removeBalloon("line_tip");
      this.lineTip = null;
      if (typeof this.closeToolCallback === "function") {
        this.closeToolCallback();
      }
    } else {
      this.removeEventListener();
      this.lineTip && this.mapOption.removeBalloon("line_tip");
      this.lineTip = null;
      this.isOpen = false;
    }
  }
  viewItem(id) {
    if (this.activeId) {
      const beforeActive = DynamicPrimitive.getLine(this.activeId);
      if (beforeActive) beforeActive.color = Cesium.Color.RED;
    }
    const line = DynamicPrimitive.getLine(id);
    if (line) {
      this.activeId = id;
      line.getCenter();
      line.color = Cesium.Color.CYAN;
      this.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    }
  }
  // 停止
  stop() {
    if (this.isOpen) {
      this.closeTool();
    }
  }
  // 移除线
  removeLine(line) {
    var _a2, _b2;
    const i = (_a2 = this.lineArr) == null ? void 0 : _a2.findIndex((item) => (item == null ? void 0 : item.id) === (line == null ? void 0 : line.id));
    (_b2 = line == null ? void 0 : line.labelArr) == null ? void 0 : _b2.forEach((m) => {
      this.mapOption.removeBalloon(m == null ? void 0 : m.id);
    });
    DynamicPrimitive.removePolyline(line == null ? void 0 : line.id);
    DynamicPrimitive.removePolyline((line == null ? void 0 : line.id) + "un");
    this.lineArr.splice(i, 1);
    this.lineAllCollent.lineList = this.lineArr;
    this.updataStartLabel();
    if (typeof this.delectLineCallback == "function") {
      this.delectLineCallback(line);
    }
  }
  // 移除点
  removePoint(label) {
    var _a2, _b2, _c, _d;
    const str = (_a2 = label == null ? void 0 : label.id) == null ? void 0 : _a2.split("_");
    const id = str[0];
    const lineIndex = (_b2 = this.lineArr) == null ? void 0 : _b2.findIndex((it) => (it == null ? void 0 : it.id) === id);
    const line = this.lineArr[lineIndex];
    if (((_c = line == null ? void 0 : line.positionArr) == null ? void 0 : _c.length) <= 2) {
      if (typeof this.delectLineCallback == "function") {
        this.delectLineCallback(line);
        this.updataStartLabel();
      }
      return this.removeLine(line);
    }
    const index = (_d = line == null ? void 0 : line.labelArr) == null ? void 0 : _d.indexOf(label);
    if (index >= 0) {
      line.positionArr.splice(index, 1);
      line.positions.splice(index, 1);
      this.mapOption.removeBalloon(label == null ? void 0 : label.id);
      line == null ? void 0 : line.labelArr.splice(index, 1);
      if (!this.autoUnitFlag) {
        this.updateLineLabel(line, lineIndex);
      }
      DynamicPrimitive.updatePolylinePos(line == null ? void 0 : line.id, line == null ? void 0 : line.positions);
    }
    if (this.autoUnitFlag) {
      this.lineArr.forEach((line2, index2) => {
        this.updateLineLabel(line2, index2);
      });
    }
  }
  removeAllLine() {
    if (this.lineAllCollent.lineList.length) {
      this.lineAllCollent.lineList.forEach((m) => {
        this.removeLine(m);
      });
    }
  }
  // 移除所有线
  clear() {
    this.isOpen = false;
    this.viewer.entities.remove(this.mouseMovePointEntiy);
    this.mouseMovePointEntiy = null;
    this.mouseMovePointCrd = [];
    const ids = this.lineArr.map((it) => it.id);
    for (let i = ids.length - 1; i >= 0; i--) {
      const line = this.lineArr[i];
      line.labelArr.forEach((m) => {
        this.mapOption.removeBalloon(m.id);
      });
      DynamicPrimitive.removePolyline(ids[i]);
      DynamicPrimitive.removePolyline(ids[i] + "un");
    }
    this.lineAllCollent.lineList = [];
    this.lineArr = [];
    this.drawLineSum = 0;
    this.drawLabelSum = 0;
    this.curLine = null;
    this.mapOption.removeBalloon("line_tip");
    this.lineTip = null;
    this.removeEventListener();
  }
  // 清理资源
  dispose() {
    this.clear();
    this.isDisposed = true;
    this.viewer = null;
    this.curDrawPointArr = null;
    this.curLine = null;
    this.lineArr = null;
    this.tip = null;
    this.curMousePosition = null;
    this.openToolCallback = null;
    this.drawEndCallback = null;
    this.closeToolCallback = null;
    this.removeEventListener();
    this.handler = null;
  }
  // 画点
  drawPoint(position) {
    this.mouseMovePointCrd = position;
    const pointParams = {
      pixelSize: 10,
      color: this.color("#fff"),
      outlineColor: this.color("#ff0000"),
      outlineWidth: 3,
      disableDepthTestDistance: Number.POSITIVE_INFINITY
    };
    const pointEntity = new Cesium.Entity({
      show: true,
      id: "mouse_move_line_point",
      position: new Cesium.CallbackProperty(() => {
        return Cesium.Cartesian3.fromDegrees(...this.mouseMovePointCrd);
      }, false),
      point: pointParams
    });
    return this.viewer.entities.add(pointEntity);
  }
  // 画标签
  drawLabel(position, content, data) {
    const id = this.shapeId + "_" + this.curLine.positions.length;
    const labelEntity = this.mapOption.addBalloon({
      id,
      position,
      content,
      offset: [12, -14],
      data,
      isGround: true
    });
    this.curLine.labelArr.push(labelEntity);
    this.lineAllCollent.labelList.push(labelEntity);
  }
  // 添加删除按钮
  addRemoveButton(label) {
  }
  // 更新线段的标签
  async updateLineLabel(line, lineIndex) {
    let lineLength = 0;
    const allDistanceInfo = [];
    for (let i = 0; i < line.labelArr.length; i++) {
      const label = line.labelArr[i];
      if (i === 0) {
        this.updateLineStartLabel(line, lineIndex);
      } else {
        let distance2 = null;
        distance2 = await computedMeasureDistance(
          this.viewer,
          line.positionArr[i - 1],
          line.positionArr[i]
        );
        lineLength += distance2.space;
        if (this.autoUnitFlag) {
          this.autoUnit = this.autoConvertUnit(
            this.viewer.scene.mode == Cesium.SceneMode.SCENE2D ? distance2.globeSurface : distance2.space
          ).unit;
        } else {
          this.autoUnit = this.curUnit;
        }
        this.updateLabel(
          label,
          this.getLabelContentUnit(
            distance2,
            this.autoUnitFlag ? this.autoUnit : this.curUnit,
            line.labelArr.length == i + 1 ? true : false
          ),
          {
            ...distance2,
            isLast: line.labelArr.length == i + 1 ? true : false
          }
        );
        line.labelArr[i].data = {
          ...distance2,
          isLast: line.labelArr.length == i + 1 ? true : false
        };
        allDistanceInfo.push(distance2);
      }
    }
    line.lineLength = lineLength;
    if (typeof this.updataLineCallback === "function") {
      this.updataLineCallback(line, allDistanceInfo, line.positions);
    }
  }
  updateLabel(label, content, data) {
    const id = label.id;
    this.mapOption.changeBalloon(id, content, false, "", data);
  }
  updateLineStartLabel(line, index) {
    line.index = index;
    const txt = `${window.i18nT ? window.i18nT("线段") : "线段"}${index + 1}${window.i18nT ? window.i18nT("起点") : "起点"}`;
    const label = line.labelArr[0];
    if (label.innerText.indexOf(txt) === -1) {
      this.updateLabel(
        label,
        `<span class="line-label"><span class="polygon-label-text">${txt}</span><span class="btn-remove-point" role="button"></span></span>`
      );
    }
  }
  updataStartLabel() {
    this.lineArr.forEach((line, index) => {
      this.updateLineStartLabel(line, index);
    });
  }
  // 根据单位切换显示文本
  leftUnitLabelChange(unit, lineList) {
    let labelList = [];
    this.curUnit = unit;
    if (lineList.length) {
      labelList = lineList.map((line) => line && line.labelArr).flat(5);
      if (labelList.length) {
        labelList.forEach((label) => {
          if (label && label.data) {
            const content = this.getLabelContentUnit(
              label.data,
              unit,
              label.data.isLast
            );
            this.mapOption.changeBalloon(label.id, content);
          }
        });
      }
    }
  }
  // 根据单位切换显示文本
  unitLabelChange(unit, lineList) {
    let labelList = [];
    if (unit == "自动判断") {
      this.autoUnitFlag = true;
      if (lineList.length) {
        labelList = lineList.map((line) => line && line.labelArr).flat(5);
        let key = this.viewer.scene.mode == Cesium.SceneMode.SCENE2D ? "globeSurface" : "space";
        let maxNum = Math.min(
          ...labelList.map((v) => v.data && v.data[key]).filter((v) => v)
        );
        this.autoUnit = this.autoConvertUnit(maxNum).unit;
        if (labelList.length) {
          labelList.forEach((label) => {
            if (label && label.data) {
              const content = this.getLabelContentUnit(
                label.data,
                this.autoUnit,
                label.data.isLast
              );
              this.mapOption.changeBalloon(label.id, content);
            }
          });
        }
      }
      return this.autoUnit;
    }
    if (unit == "分米" || unit == "厘米") {
      this.autoUnitFlag = false;
    } else {
      this.autoUnitFlag = true;
    }
    this.curUnit = unit;
    if (lineList.length) {
      labelList = lineList.map((line) => line && line.labelArr).flat(5);
      if (labelList.length) {
        labelList.forEach((label) => {
          if (label && label.data) {
            const content = this.getLabelContentUnit(
              label.data,
              unit,
              label.data.isLast
            );
            this.mapOption.changeBalloon(label.id, content);
          }
        });
      }
    }
    this.updataStartLabel();
  }
  getLabelContentUnit(type, unit = "公里", isLast = false) {
    let content = "";
    if (this.viewer.scene.mode == Cesium.SceneMode.SCENE2D) {
      const text3 = `${window.i18nT ? window.i18nT(_ALineTool.sceneMode2DText) : _ALineTool.sceneMode2DText}：${formatLength(
        type.globeSurface,
        unit
      )}`;
      content = `
       <span class="line-label">
        <span class="header-content">
          <span>${window.i18nT ? window.i18nT("距离") : "距离"}(${window.i18nT ? window.i18nT(unit) : unit})</span>
          <span class="btn-remove-point" role="button"></span>
          ${isLast ? '<span class="btn-remove-line"></span>' : ""}
        </span>

        <div class="line-label-content">
          <div class="line-division"></div>
          <span>${text3}</span>
        </div>
      </span>`;
    } else {
      const text = `${window.i18nT ? window.i18nT(_ALineTool.sceneMode3DText) : _ALineTool.sceneMode3DText}：${formatLength(type.space, unit)}`;
      content = `
    <span class="line-label">
        <span class="header-content">
          <span>${window.i18nT ? window.i18nT("距离") : "距离"}(${window.i18nT ? window.i18nT(unit) : unit})</span>
          <span class="btn-remove-point" role="button"></span>
          ${isLast ? '<span class="btn-remove-line"></span>' : ""}
        </span>

        <div class="line-label-content">
          <div class="line-division"></div>
          <span>${text}</span>
        </div>
      </span>`;
    }
    return content;
  }
  getMeasureDistanceContent(list, isLast = false) {
    let content = "";
    for (let i = 0; i < list.length; i++) {
      const { text, distance: distance2 } = list[i];
      content += `
      <p class="line-label">
        <span>
          <span>距上点${text}</span>
          ${formatLength(distance2)}
        </span>
        <span class="btn-remove-point" role="button"></span>
        ${isLast ? `<span class="btn-remove-line"></span>` : ""}
      </p>`;
    }
    return `<div>${content}</div>`;
  }
};
__publicField(_ALineTool, "sceneMode2DText", "地球球体表面距离");
// 2d显示的文字
__publicField(_ALineTool, "sceneMode3DText", "直线距离");
let ALineTool = _ALineTool;
const xImg = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/4QAuRXhpZgAATU0AKgAAAAgAAkAAAAMAAAABAAAAAEABAAEAAAABAAAAAAAAAAD/2wBDAAoHBwkHBgoJCAkLCwoMDxkQDw4ODx4WFxIZJCAmJSMgIyIoLTkwKCo2KyIjMkQyNjs9QEBAJjBGS0U+Sjk/QD3/2wBDAQsLCw8NDx0QEB09KSMpPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT3/wAARCAEEAQQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD2WiiigCC5/hqGprn+GoaACrtUqu0AFQXP8NT1Bc/w0AQ0UUUAXaKKKAILn+Goamuf4ahoAKu1Sq7QAVBc/wANT1Bc/wANAENFFFAF2iiigCC5/hqGprn+GoaACrtUqu0AFQXP8NT1Bc/w0AQ0UUUAXaKKKACiiigCH7T/ALP60faf9n9agooAm/1/+zil+zf7X6Ult/FU9AEP2b/a/Sj7T/s/rU1UqAJ/tP8As/rSf6//AGcVDU1t/FQAv2b/AGv0o+zf7X6VNRQBD9p/2f1o+0/7P61BRQBN/r/9nFL9m/2v0pLb+Kp6AIfs3+1+lH2n/Z/WpqpUAT/af9n9aT/X/wCzioamtv4qAF+zf7X6UfZv9r9KmooAh+0/7P60faf9n9agooAm/wBf/s4pfs3+1+lJbfxVPQBD9m/2v0o+0/7P61NVKgCf7T/s/rSf6/8A2cVDU1t/FQAv2b/a/Sj7N/tfpU1FAEP2n/Z/Wj7T/s/rUFFAE/2n/Z/WioKKACirtFAEFt/FU9QXP8NQ0AXapUVdoApVNbfxVPUFz/DQBPRVKigAoq7RQBBbfxVPUFz/AA1DQBdqlRV2gClU1t/FU9QXP8NAE9FUqKACirtFAEFt/FU9QXP8NQ0AXapUVdoApVNbfxVPUFz/AA0AT0VSooAKKu0UAUqKu0UAFFQ/af8AZ/Wj7T/s/rQAlz/DUNTf6/8A2cUv2b/a/SgCCrtQ/Zv9r9KPtP8As/rQBNUFz/D+NRXWpQ2VrLc3BEcMSl3YngAc14V4u8e6h4lupI4pHttPBxHAjYLD1fHUn06D9aaVwPaTq2niTyzfWokzjaZlB/nVsEHkcg/jXzDmuh8MeM9S8N3KeXK81nn57Z2ypHt/dPuPxzVOIH0VRWToviKy17T47yxbfG3BUn5kPcMOxrQ+0/7P61ACXP8ADUNTf6//AGcUv2b/AGv0oAgq7UP2b/a/Sj7T/s/rQBNUFz/DS/af9n9aT/X/AOzigCGip/s3+1+lH2b/AGv0oAmoqH7T/s/rWT4i8UWfhvTmu7vk9I4g2Gkb0H+PagBnizxLZ+GNOFzdnc7ZEUKnDSH+g9+1eNav8Q9e1WYlLxrOLPyx252Y/wCBdTWV4g1+88Saq97fPlzwqD7sa9lHt/PrWbWkVYRu2PjfxDYTCRNVuZcHlZ38wH/vr19q9d8D+PYPFUZt50W31GNdzxg/LIP7y5/l2968Fq9omqS6LrNrfwEh4JA2Bxkdx+IyPxokkwPp2oLn+Gl+0/7P60n+v/2cVmMhoqf7N/tfpR9m/wBr9KAJqKh+0/7P60faf9n9aAJqKh+0/wCz+tFAEFFFFAE1t/FU9QW38VT0AFUqu1SoA4z4p3T23g5kQkC4nSNsccct/wCyivFK988d6PJrfhW5t4FLTxkTRKOcle31IyPqa8DII4Pb8K0jsIKKKKoDX8N+JLzw1qAubRso3EsLHCyD39D79v0r3TQNfs/Eemrd2L5HR0P3o29D/nmvnStPQPEF54c1JbuxfHaSM8rIvof8e1S1cD6Rtv4qnrC8K+I7LxLp/wBqs2w4wJYmPzRt6H29+9btZjCqVXapUAFTW38VQ1NbfxUAT0UVma5rln4f0uS+vpNsacKo+87dlUdz/wDr6UAUtf1+z8Paa95fPhRwiD70jf3R/nivB/EHiC88Sak95eN7Rxg5WNfQf496k8SeJLzxLqbXV021F4ihBysa+nufU9/yrIrRKwgoooqgCrelWEuq6rbWUAJknkCDHbPU/gMn8KrRxtLIqRqzOx2qqjJJP8zXs3gDwQNAhGoagoOoSrgL18lT2/3j3P4DvmW7AdtU1t/FUNTW38VZjJ6KKKAKVFFFABRRRQBdooooAguf4ahqa5/hqGgAq7VKrtABXl3xD+HYuXk1bRYsTnLT26j/AFn+0o9fbv256+o1Bc/w0J2A+WyCCQeCPwor13x58P11MSano8YW8HzSwqMCb3Ho38/r18jdGRyrAqynBBGMVqncQlFFFMDQ0TXLzQNQS8sZNsg4ZT91x/dI7ivdPDHiiz8UaeJ7Y7Jk4lhJy0Z/qD6/1r57q7pOr3miahHeWMpjlQ/gw9CO4PpUtXA+kau1yfhPxbaeKbDzI8R3UY/fQE5K+49VPr+ddZWewwqC5/hqes3WtTtdIsHvL6URwxg5J7+wHcn0o3Ar6tq1pomnyXt9II4ox9Sx7AepNeE+KfFF34o1IzzkpCmRDCDkRj+pPc/0p/i3xZdeKNQ8yTMdrGSIIc52j1Pqx9fwrBrRKwgoooqgClRGdwqglmOAAM5pACSAOSfxr1z4f+AxpqR6rq0ebxhuhhYZ8oep/wBr+X16JuwE3gDwGukImp6pGDfMMxxEZEAP/s38q9JqlV2s27jCoLn+Gp6guf4aQENFFFAF2iiigAooooAh+0/7P60faf8AZ/WoKKAJv9f/ALOKX7N/tfpSW38VT0AQ/Zv9r9KPtP8As/rU1UqAJ/tP+z+tJ/r/APZxUNTW38VAC/Zv9r9K4Hx58OV1lZNS0pVXUAMvGBgT/wCDe/fvXolFCdgPlaSNopGjkVkdTtZWGCCO3sabXtPjjwHFr8TX2nqseoqOR0E4HY+je/4H1HjM0MttM8M8bRyxttZXGCpFaJ3EMoooqgLOm6ndaRfx3ljK0U0ZyGHOfY+oPpXvHhDxva+KrPhVhvYx+9g3f+PL6g/p0Pv8/VPY31zpt5HdWczRTxHcrKcY/wAR7VLVwPpTUNWttMspbu9dYoIlyzE/l9SfSvCPGfjK58V6gGO6KyiP7iHOcf7R9WP6dB6mLxP4y1DxR5K3O2KGJRiGM4Uv3b6/yH4k4FCjbcAoooqgCiivUPh74Bx5WsaxFz963gcdPR2H8h+PpSbsBZ+HPw+8jy9X1iPE/DW8DDPl/wC03v6Dt169PTPs3+1+lJbfxVPWbdxkP2b/AGv0o+0/7P61NVKkBP8Aaf8AZ/Wk/wBf/s4qGprb+KgBfs3+1+lH2b/a/SpqKAIftP8As/rR9p/2f1qCigCf7T/s/rRUFFABRV2igCC2/iqeoLn+GoaALtUqKu0AUqmtv4qnqC5/hoAnoqlRQAVyHjfwND4kgN1aBYtSReGPAlA7N7+h/Pjp3lFNOwHyzdWs1lcyW9zG8U0TbWRxgg96ir3nx34It/E1sJ4AsOoxr8kuOHx0Vvb37fSvDL2yuNOvJLW7iaKaI7WRhgj/AD61adxENFFFUAUUUUAFFFei/D3wH9uMeratF/owO6CFx/rf9o/7Pt3+nVN2An+HngHzfK1jWIv3f3reBx97/bYenoO/Xp19Sq7RWbdxkFt/FU9QXP8ADUNIC7VKirtAFKprb+Kp6guf4aAJ6KpUUAFFXaKAKVFXaKACioftP+z+tH2n/Z/WgBLn+Goam/1/+zil+zf7X6UAQVdqH7N/tfpR9p/2f1oAmqC5/hpftP8As/rSf6//AGcUAQ0VP9m/2v0o+zf7X6UATUVD9p/2f1pj3axozvhVAyWJwAB1/KgBLuRIYjJI6pGgLMzHAAHfPYV4R4/8UW3iTVl+xwoILcFFm24eX/7H0HuT7VpfELx+2vSNp2msV0+M/O4OPPI/9lHp36ntXB1cVbViCiiirAKKKKADp/SvZfAfj6PWkj07UmWO/UYRsbRMB/Jvbv2rxqlR2jcOjFWU5DA4II6UmrgfVVFeceAfiONVSPTNXdRfAbYpicCb2Po38/r19B+0/wCz+tZNWGJc/wANQ1N/r/8AZxS/Zv8Aa/SgCCrtQ/Zv9r9KPtP+z+tAE1QXP8NL9p/2f1pP9f8A7OKAIaKn+zf7X6UfZv8Aa/SgCaioftP+z+tH2n/Z/WgCaioftP8As/rRQBBRRRQBNbfxVPUFt/FU9ABVKrtUqACprb+Koamtv4qAJ6KKOByaAKJIQFmIAAySeMV5B8QPHh1Z5NL0qQixU4llU484jsP9n+f0qb4hePDfmTSdJl/0UHbPMh/1v+yP9n37/Tr53Vxj1YgoooqwCiiuv8C+CJfEVyLq7Vo9Nib5j0MpH8I9vU/gOeg3YDknikjCM6MquNykjG4dOPUZBFNr6D17wnp2vaOthJEsQiXEDxrgw9uPb27/AK14dr2gXnh7Ums76PBHKOOVkX1H+eKlO4GbRRRVAKCUIIJBHII4+leseA/iGL3y9L1qUC4+7DcOceZ/st/te/f69fJqKTVwPqS2/iqevKfh58RNxj0nXJfnOFguXPX0Vz/I/n616tWTVhhVKrtUqACprb+Koamtv4qAJ6KKKAKVFFFABRRRQBdooooAguf4ahqa5/hqGgAq7VKrtABUFz/DU9QXP8NAENeV/EPx953maPo8v7rO24nQ/e/2F9vU9+nTrL8Q/H2PN0fR5eeVuJ0P5op/mfw9a8wq4x6sAoooqxBRRXT+CvBs/ii93yborCJv3so43f7K+/v2/IUN2Al8EeCpfEt0J7gNHp0TYkccGQ/3V/qe314r3m1tYbK2jt7aJYoY12oijAUCqVnZwWNrHbWsSxQxLtRFGAB/9etOsm7jCsTxP4fs/EWm/ZL5PUxyD70beo/w71t1Bc/w0gPnHxD4cvPDepG1vFyp5ilA+WRfUf4dqya+jdc0Oy8Qae9nfR7kblWH3kb1B7H/ACa8M8T+F7zwxqBguRvibmKYDCyD+hHp/TmtE7iMWiiiqAK9L8A/EPyvL0rW5f3f3YLlz93/AGWPp/tdu/HI80opNXA+nsg1drxjwH8QjYeXpesyE2v3YZ2OfK9m/wBn37fTp7KjB1DKQVIyCDwazasMdUFz/DU9QXP8NICGiiigC7RRRQAUUUUAQ/af9n9aPtP+z+tQUUATf6//AGcUv2b/AGv0pLb+Kp6AIfs3+1+lH2n/AGf1qaqVAE/2n/Z/WvMviN8QfK8zSNHkxMMrcTq33P8AYX39T26dem38RPEMmgeHSLZyl1dt5UbDgqOrH6gcfUivDCSSSeSfxq4q+oBRRRViCiit7wl4TuvFOoeWm6O1jIM82M7R6D1Y+n40bAT+C/Btz4r1DA3RWMR/fzAdP9kerH9Op7A+7afpNtpllFaWaLFBEu1FA6ev1J9aboum2ukWCWdlEIoYwAFHf3J7k+taVZN3GQ/Zv9r9KPtP+z+tTVSpAT/af9n9aT/X/wCzioamtv4qAF+zf7X6VR1bQbPW9Pks75BJC/TjBU9iD2IrUooA+cvFnhO78L3/AJcwMlrIf3M4GAw9D6MPT8qwa+k9T0y11ewks76JZYZByp4x7j0I9a8O8XeD7rwtec7pbKU4inxjP+yfRv59R6DRO4jnaKKKoAr1D4V+MplnGhXzmSNlJtWY8qRyU+mMkemMV5fWt4VeRPFelGPO/wC1Rj82wf0zSaugPo/7T/s/rSf6/wD2cVDU1t/FWQxfs3+1+lH2b/a/SpqKAIftP+z+tH2n/Z/WoKKAJ/tP+z+tFQUUAFFXaKAILb+Kp6guf4ahoAu1Soq7QB5P8ZInNtpMoB8tWlVj7kIR/wCgmvLK+kvFXh+LxLoM9hIwR2+aKQjOxx0P06j6E189atpF5ol/JZ6hA0MqHoRww9Qe49xVxelhFKiitnw14XvfE9+IbVCsKn97ORlYx/U+39OarYB3hbwtd+KNSEEGUgTBnmIyEH9Sew/pXu+k6TaaLp8dlZRCOKMfUse5PqT61Poei2egaZFY2EeyKPqSPmdu7E9yf/rVpVm3cZBbfxVPUFz/AA1DSAu1Soq7QBSqa2/iqeoLn+GgCeiqVFABVe/sLbU7OS0vIVlglGGVuc/4EetatFAHz54y8E3Phi5Mse6bT5GxHNjO0/3W9D79D+lcvX0/qFtDeQGC5iWWGQEMjjIYVwWo/CTSbmYyWdzcWgY52cSKPpnn9TVxl3A8drvvhb4amvdWGsTxlbW1z5RIx5knTj2GSc+uPeum034TaRZzCS8nnvNpzsPyKfrjk/nXoUFvFawJDbxpHFGNqoi4Cj0A7UOXYCvU1t/FU9QXP8NQBPRVKigAoq7RQBSoq7RQAUVD9p/2f1o+0/7P60AJc/w1DU3+v/2cUv2b/a/SgCCrtQ/Zv9r9KPtP+z+tAE1ZusaVZarAsOoWsNxHzgSKDj6en4Vc+0/7P60n+v8A9nFAHKp8PPDEcnmDSkLA5wZZGH5FsV0FtawWcKw20McMS8KkahQPwFW/s3+1+lH2b/a/Si4E1FQ/af8AZ/Wj7T/s/rQAlz/DUNTf6/8A2cUv2b/a/SgCCrtQ/Zv9r9KPtP8As/rQBNUFz/DS/af9n9aT/X/7OKAIaKn+zf7X6UfZv9r9KAJqKh+0/wCz+tH2n/Z/WgBLn+Goam/1/wDs4pfs3+1+lAEFXah+zf7X6Ufaf9n9aAJqguf4aX7T/s/rSf6//ZxQBDRU/wBm/wBr9KPs3+1+lAE1FQ/af9n9aPtP+z+tAE1FQ/af9n9aKAIKKKKAJrb+Kp6gtv4qnoAKpVdqlQAVNbfxVDU1t/FQBPRRRQBSooooAmtv4qnqC2/iqegAqlV2qVABU1t/FUNTW38VAE9FFFAFKiiigCa2/iqeoLb+Kp6ACqVXapUAFTW38VQ1NbfxUAT0UUUAUqKKKACiiigC7RRRQBBc/wANQ1Nc/wANQ0AFXapVdoAKguf4anqC5/hoAhooooAu0UUUAQXP8NQ1Nc/w1DQAVdqlV2gAqC5/hqeoLn+GgCGiiigC7RRRQBBc/wANQ1Nc/wANQ0AFXapVdoAKguf4anqC5/hoAhooooAu0UUUAFFFFABRRRQBBc/w1DRRQAVdoooAKguf4aKKAIaKKKALtFFFAEFz/DUNFFABV2iigAqC5/hoooAhooooAu0UUUAQXP8ADUNFFABV2iigAqC5/hoooAhooooAu0UUUAFFFFAH/9k=";
const formatArea = (area, unit = "平方公里") => {
  const {
    squareKilometers,
    squareMeters,
    squareCentimeters,
    squareDecimeters
  } = convertUnits(area);
  let value = squareKilometers;
  switch (unit) {
    case "平方公里":
      value = squareKilometers;
      break;
    case "平方米":
      value = squareMeters;
      break;
    case "平方厘米":
      value = squareCentimeters;
      break;
    case "平方分米":
      value = squareDecimeters;
      break;
  }
  return value;
};
const convertUnits = (value) => {
  const squareKilometers = value / 1e6;
  const squareMeters = value;
  const squareCentimeters = value * 1e4;
  const squareDecimeters = value * 100;
  return {
    squareKilometers: squareKilometers ? squareKilometers.toFixed(2) : "0.00",
    // 平方公里
    squareMeters: squareMeters ? squareMeters.toFixed(2) : "0.00",
    // 平方米
    squareCentimeters: squareCentimeters ? squareCentimeters.toFixed(2) : "0.00",
    // 平方厘米
    squareDecimeters: squareDecimeters ? squareDecimeters.toFixed(2) : "0.00"
    // 平方分米
  };
};
const _APolygonTool = class _APolygonTool extends BaseTool {
  // 3d显示的文字
  constructor(viewer, mapOption) {
    super();
    __publicField(this, "handler", null);
    // 事件处理器
    __publicField(this, "curPolygon", null);
    // 当前绘制的多边形
    __publicField(this, "polygonArr", []);
    // 已绘制的多边形数组
    __publicField(this, "tip", new Cesium.Entity());
    // 跟随鼠标的tip
    __publicField(this, "polygonTip", null);
    __publicField(this, "curPolygonArea", 0);
    // 当前面积
    __publicField(this, "mapOption");
    __publicField(this, "polygonStyle", new AGraphicsStyle());
    // 多边形样式
    __publicField(this, "tipStyle", new AGraphicsStyle());
    // tip 样式
    __publicField(this, "areaStyle", new AGraphicsStyle());
    // 面积样式
    __publicField(this, "type", 1);
    // 测量类型 1:空间面积  2:地表面积  3:投影面积
    // 是否贴地
    __publicField(this, "clampToGround", true);
    __publicField(this, "curUnit", "平方公里");
    // 单位
    __publicField(this, "typeListener", "click");
    // 事件类型
    __publicField(this, "shapeId", "");
    //当前绘制形状uuid
    // 打开、关闭、绘制完成回调函数
    __publicField(this, "openToolCallback", null);
    __publicField(this, "drawEndCallback", null);
    __publicField(this, "closeToolCallback", null);
    __publicField(this, "updataLineCallback", null);
    __publicField(this, "delectLineCallback", null);
    __publicField(this, "leftClickTime", +/* @__PURE__ */ new Date());
    __publicField(this, "polygonPointCrds", []);
    // mapCanvas = document.querySelector('#map_container') as HTMLDivElement;
    __publicField(this, "mapCanvas", document.querySelector("#map_container"));
    __publicField(this, "polygonAllCollent", {
      pointList: [],
      labelList: [],
      polygonList: []
    });
    __publicField(this, "activeId", "");
    __publicField(this, "currentPolygon");
    __publicField(this, "currentPoint");
    __publicField(this, "autoUnitFlag", true);
    // 是否自动切换单位
    __publicField(this, "autoUnit", "平方公里");
    __publicField(this, "mouseMovePointEntiy", null);
    __publicField(this, "mouseMovePointCrd", []);
    __publicField(this, "polygonPointList", []);
    __publicField(this, "lastPointId", "");
    __publicField(this, "autoConvertUnit", (value, unit = "平方米") => {
      const units = ["平方公里", "平方米", "平方分米", "平方厘米"];
      const unitValues = {
        平方公里: 1e6,
        平方米: 1,
        平方分米: 1e-4,
        平方厘米: 0.01
      };
      let currentValue = value;
      let currentUnit = unit;
      while (currentValue >= 1e6 && units.indexOf(currentUnit) > 0) {
        currentUnit = units[units.indexOf(currentUnit) - 1];
        currentValue = currentValue / unitValues[currentUnit];
      }
      return { value: currentValue.toFixed(2), unit: currentUnit };
    });
    // 单击
    __publicField(this, "leftClickListener", async (e, rayCrd) => {
      var _a2;
      if (performance.now() - this.leftClickTime < 300) {
        this.leftClickTime = performance.now();
        if (this.curPolygon && this.curPolygon.positionArr.length <= 2) {
          this.polygonPointList.forEach((v) => {
            if (v.id == this.lastPointId) {
              this.viewer.entities.remove(v);
            }
          });
        }
        return this.leftDoubleClickListener();
      }
      this.leftClickTime = performance.now();
      if (this.isOpen) {
        if (this.mouseMovePointCrd.length) {
          let tempCrd = this.mouseMovePointCrd;
          rayCrd = tempCrd[2] <= 0 ? [tempCrd[0], tempCrd[1], 1] : tempCrd;
        } else {
          rayCrd = rayCrd[2] <= 0 ? [rayCrd[0], rayCrd[1], 1] : rayCrd;
        }
        let c3 = Cesium.Cartesian3.fromDegrees(rayCrd[0], rayCrd[1], rayCrd[2]);
        let crd = {
          WGS84: rayCrd,
          Cartesian3: c3
        };
        if (crd) {
          if (!this.curPolygon) {
            this.createPolygon();
          }
          if (this.curPolygon) {
            this.curPolygon.positions.push(crd.WGS84);
            this.curPolygon.positionArr.push(crd.Cartesian3);
            if (!DynamicPrimitive.getPolygon(this.shapeId)) {
              DynamicPrimitive.addPolygon({
                id: this.shapeId,
                positions: this.curPolygon.positions,
                isGround: false,
                isHeight: true,
                outline: true,
                isPoint: false,
                pointOutline: true,
                color: Cesium.Color.RED.withAlpha(0.5)
              });
            } else {
              DynamicPrimitive.updatePolygonPos(
                this.shapeId,
                this.curPolygon.positions
              );
            }
            const id = this.shapeId + "_" + ((_a2 = this.curPolygon) == null ? void 0 : _a2.positionArr.length) + "_count_point";
            this.lastPointId = id;
            this.polygonPointList.push(this.leftDrawPoint(id, crd.WGS84));
            const labelContent = this.getPointContent(
              "other",
              this.polygonArr.length - 1,
              this.curPolygon.data
            );
            if (this.curPolygon.positionArr.length < 2) {
              this.getPointContent(
                "start",
                this.polygonArr.length - 1,
                this.curPolygon.data
              );
            }
            this.drawLabel(crd.WGS84, labelContent);
          }
        }
      }
    });
    // 双击
    __publicField(this, "leftDoubleClickListener", () => {
      this.closeTool("double");
    });
    // 右击
    __publicField(this, "rightClickListener", async (e, type) => {
      var _a2, _b2;
      if (!this.isOpen) return;
      this.typeListener = type;
      if (this.isOpen && ((_b2 = (_a2 = this.curPolygon) == null ? void 0 : _a2.positionArr) == null ? void 0 : _b2.length)) {
        let crd = {
          WGS84: this.mouseMovePointCrd,
          Cartesian3: Cesium.Cartesian3.fromDegrees(
            this.mouseMovePointCrd[0],
            this.mouseMovePointCrd[1],
            this.mouseMovePointCrd[2]
          )
        };
        if (!crd) return;
        if (this.checkPosRepeat(crd.WGS84)) {
          return false;
        }
        this.curPolygon.positions.push(crd.WGS84);
        this.curPolygon.positionArr.push(crd.Cartesian3);
        DynamicPrimitive.updatePolygonPos(
          this.shapeId,
          this.curPolygon.positions
        );
        this.closeTool();
      }
    });
    // 鼠标移动
    __publicField(this, "mouseMoveListener", async (pick, e) => {
      var _a2;
      let rayCrds = RayPickedHelper.drillPick(
        this.viewer,
        e.endPosition.x,
        e.endPosition.y,
        3
      );
      let rayCrd = null;
      if (Array.isArray(rayCrds) && rayCrds.length) {
        rayCrds.filter((ray) => {
          if (ray.obj && ray.obj.id !== "mouse_move_point") {
            return ray;
          }
        })[0];
      }
      if (!rayCrd) {
        let crd = this.mapOption.pixelToCoordinates(e.endPosition.x, e.endPosition.y) || [];
        crd[2] = crd[2] <= 0 ? 1 : crd[2];
        rayCrd = {
          crd,
          position: Cesium.Cartesian3.fromDegrees(...crd)
        };
      }
      let c3 = rayCrd.position;
      const cartesian = c3;
      if (Cesium.defined(cartesian)) {
        this.refreshTip(cartesian);
      }
      if (this.isOpen) {
        rayCrd = rayCrd[2] <= 0 ? [rayCrd[0], rayCrd[1], 0.1] : rayCrd;
        let crd = {
          WGS84: rayCrd.crd,
          Cartesian3: c3
        };
        if (crd && ((_a2 = this.curPolygon) == null ? void 0 : _a2.positions.length)) {
          DynamicPrimitive.updatePolygonPos(this.shapeId, [
            ...this.curPolygon.positions,
            crd.WGS84
          ]);
          if (!this.mouseMovePointEntiy) {
            this.mouseMovePointCrd = crd.WGS84;
            this.mouseMovePointEntiy = this.drawPoint(crd.WGS84);
          } else {
            this.mouseMovePointCrd = crd.WGS84;
          }
        }
      }
    });
    if (viewer) {
      this.viewer = viewer;
      this.handler = mapOption.viewer.screenSpaceEventHandler;
      this.mapOption = mapOption;
      DynamicPrimitive.viewer = this.viewer;
      MapBaseHelper$1.viewer = this.viewer;
    }
  }
  // 初始化工具
  initTool() {
    this.clickListener = this.clickListener.bind(this);
    document.body.addEventListener("click", this.clickListener);
  }
  // 开始使用工具
  openTool(type, unit = "平方公里") {
    this.curUnit = unit;
    if (this.curPolygon) {
      this.curPolygon = null;
    }
    this.shapeId = uuid();
    this.type = type;
    this.leftClickTime = 0;
    if (this.isOpen) {
      return;
    }
    this.isOpen = true;
    this.addEventListener();
    if (typeof this.openToolCallback === "function") {
      this.openToolCallback();
    }
  }
  // 指定对应盒子使用对饮的鼠标样式
  appointBoxCursor(el, cursor) {
    if (el) {
      el.style.cursor = cursor;
    }
  }
  // 原生单击事件
  clickListener(e) {
    var _a2, _b2, _c, _d, _e;
    if (this.curPolygon) return;
    if (e.target.className === "btn-remove-polygon") {
      let label = (_b2 = (_a2 = e.target) == null ? void 0 : _a2.parentNode) == null ? void 0 : _b2.parentNode;
      if (label && !label.id) {
        label = (_c = e.target.parentNode.parentNode) == null ? void 0 : _c.parentNode;
      }
      const id = (_d = label == null ? void 0 : label.id) == null ? void 0 : _d.split("_")[0];
      const polygon = this.polygonArr.find((it) => it.id === id);
      if (typeof this.delectLineCallback == "function") {
        this.delectLineCallback(polygon);
      }
      this.removePolygon(polygon);
    } else if (e.target.className === "btn-remove-polygon-point" || e.target.className === "btn-remove-polygon-warpper") {
      let label = null;
      if (e.target.className === "btn-remove-polygon-point") {
        label = e.target.parentNode.parentNode;
      } else {
        label = e.target.parentNode;
      }
      if (label && !label.id) {
        label = (_e = e.target.parentNode.parentNode) == null ? void 0 : _e.parentNode;
      }
      this.removePoint(label);
    }
  }
  getPointContent(type, index, data) {
    switch (type) {
      case "start":
        return `<span class="polygon-label"><span class="polygon-label-text">${window.i18nT ? window.i18nT("面积") : "面积"}${index + 1}${window.i18nT ? window.i18nT("起点") : "起点"}</span><span class="btn-remove-polygon-point" role="button"></span>`;
      case "end":
        return this.getLabelContentUnit(data, this.curUnit);
      default:
        return `<span class="btn-remove-polygon-warpper"><span class="btn-remove-polygon-point" role="button"></span>`;
    }
  }
  checkPosRepeat(crd) {
    if (crd.length && this.curPolygon)
      for (let i = 0; i < this.curPolygon.positions.length; i++) {
        const item = this.curPolygon.positions[i];
        if (crd[0] == item[0] && crd[1] == item[1] && crd[2] == item[2]) {
          return true;
        }
      }
    return false;
  }
  async getCrd(position, isHeight) {
    let crd = [];
    if (Cesium.SceneMode.SCENE2D === this.viewer.scene.mode) {
      crd = this.mapOption.pixelToGlobeCoordinates(position.x, position.y);
    } else {
      crd = this.mapOption.pixelToCoordinates(position.x, position.y);
    }
    crd = crd[2] <= 0 ? [crd[0], crd[1], 1] : crd;
    if (crd) {
      return {
        WGS84: crd,
        Cartesian3: Cesium.Cartesian3.fromDegrees(crd[0], crd[1], crd[2])
      };
    }
  }
  refreshTip(position) {
    if (!this.isOpen) {
      return;
    }
    if (this.curPolygon && this.type === 2) {
      this.mapOption.hideBalloon("polygon_tip");
      return;
    }
    const coordinate = MapBaseHelper$1.c3ToCoordinates(position);
    let content = "";
    if (!this.polygonTip) {
      this.polygonTip = this.mapOption.addBalloon({
        id: "polygon_tip",
        position: coordinate,
        content,
        offset: [15, 25]
      });
    }
    if (!this.curPolygon) {
      content = `<div class="line-tip">${window.i18nT ? window.i18nT("单击确定起点") : "单击确定起点"}</div>`;
    } else {
      if (this.type === 1) {
        const arr = this.getLonLatHeightArr(this.curPolygon);
        const coordinate2 = this.cartesianToCoordinate(position);
        arr.push({
          lon: coordinate2.longitude,
          lat: coordinate2.latitude,
          height: coordinate2.height
        });
        getPlaneArea(arr);
      } else {
        const arr = this.getCoordinateArr(this.curPolygon);
        const coordinate2 = this.cartesianToCoordinate(position);
        arr.push(coordinate2.longitude, coordinate2.latitude);
        getPolygonArea(arr);
      }
      content = `<div class="line-tip">${window.i18nT ? window.i18nT("单击继续，双击或者右键结束") : "单击继续，双击或者右键结束"}</div> `;
    }
    this.mapOption.showBalloon("polygon_tip");
    this.mapOption.refreshBalloon("polygon_tip", coordinate, content);
  }
  // 添加事件
  addEventListener() {
    this.mapOption.screenSpaceLeftClick(
      "polygon_tool_left_click",
      this.leftClickListener
    );
    this.mapOption.screenSpaceMouseMove(
      "polygon_tool_mouse_move",
      this.mouseMoveListener.bind(this)
    );
    this.handler.setInputAction(
      this.rightClickListener,
      Cesium.ScreenSpaceEventType.RIGHT_CLICK
    );
  }
  //  移除事件
  removeEventListener() {
    this.mapOption.removeMapListener("LeftClick", "polygon_tool_left_click");
    this.mapOption.removeMapListener("MouseMove", "polygon_tool_mouse_move");
  }
  // 多边形绘制完成
  async drawEnd(isClose = false, linType) {
    if (!isClose && !this.curPolygon) return;
    const position = this.curPolygon.positions.at(-1);
    DynamicPrimitive.updatePolygonPos(this.shapeId, [
      ...this.curPolygon.positions
    ]);
    if (this.curPolygon.positions.length <= 2) {
      this.curPolygon && this.removePolygon(this.curPolygon);
      if (typeof this.drawEndCallback === "function") {
        this.drawEndCallback();
      }
      this.reset();
    } else {
      const arr = this.getCoordinateArr(this.curPolygon);
      if (this.type === 1) {
        const params = await this.computedMeasureArea(this.curPolygon);
        if (this.autoUnitFlag) {
          this.autoUnit = this.autoConvertUnit(
            this.viewer.scene.mode == Cesium.SceneMode.SCENE2D ? params.globeSurface : params.space
          ).unit;
        } else {
          this.autoUnit = this.curUnit;
        }
        this.drawLabel(
          position,
          this.getLabelContentUnit(params, this.autoUnit, true),
          {
            ...params,
            isLast: true
          }
        );
        this.letfUnitLabelChange(this.autoUnit, this.polygonArr);
        if (typeof this.drawEndCallback === "function") {
          this.drawEndCallback(
            this.curPolygon,
            params,
            this.curPolygon.positions
          );
        }
        this.reset();
      } else if (this.type === 2) {
        getTerrainArea(arr, (area) => {
          this.curPolygonArea = area;
          this.drawLabel(
            position,
            this.getLabelContent(this.curPolygon.type, area, true)
          );
          this.reset();
        });
      } else if (this.type === 3) {
        const area = getPolygonArea(arr);
        this.curPolygonArea = area;
        this.drawLabel(
          position,
          this.getLabelContent(this.curPolygon.type, area, true)
        );
        this.reset();
      }
    }
  }
  viewItem(id) {
    if (this.activeId) {
      const beforeActive = DynamicPrimitive.getPolygon(this.activeId);
      if (beforeActive) {
        beforeActive.color = Cesium.Color.RED.withAlpha(0.5);
        beforeActive.outlineColor = Cesium.Color.RED;
      }
    }
    const polygon = DynamicPrimitive.getPolygon(id);
    if (polygon) {
      this.activeId = id;
      polygon.getCenter();
      polygon.color = Cesium.Color.CYAN.withAlpha(0.5);
      polygon.outlineColor = Cesium.Color.CYAN;
      this.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    }
  }
  reset() {
    this.curPolygon = null;
  }
  // 创建多边形
  createPolygon() {
    const polygon = {
      id: this.shapeId,
      positions: [],
      data: {},
      pointArr: [],
      positionArr: [],
      labelArr: [],
      type: this.type,
      index: this.polygonArr.length
    };
    this.polygonArr.push(polygon);
    this.curPolygon = polygon;
    this.polygonAllCollent.polygonList = this.polygonArr;
    return polygon;
  }
  // 关闭工具
  closeTool(lintType) {
    var _a2;
    if (this.isOpen && this.curPolygon) {
      this.removeEventListener();
      if (this.curPolygon.positionArr.length > 2) {
        const id = `${this.shapeId}_${(_a2 = this.curPolygon) == null ? void 0 : _a2.positionArr.length}_count_point`;
        let point = this.polygonPointList.find((item) => item.id === id);
        if (!point) {
          this.polygonPointList.push(
            this.leftDrawPoint(id, this.mouseMovePointCrd)
          );
        }
      }
      this.viewer.entities.remove(this.mouseMovePointEntiy);
      this.mouseMovePointEntiy = null;
      this.mouseMovePointCrd = [];
      this.tip.show = false;
      const index = this.curPolygon.positionArr.length - 1;
      const lastLabel = this.curPolygon.labelArr.splice(index, 1)[0];
      lastLabel && this.mapOption.removeBalloon(lastLabel.id);
      this.curPolygon && this.drawEnd(false, lintType);
      this.polygonTip && this.mapOption.removeBalloon("polygon_tip");
      this.polygonTip = null;
      this.isOpen = false;
      if (typeof this.closeToolCallback === "function") {
        this.closeToolCallback();
      }
    } else {
      this.removeEventListener();
      this.polygonTip && this.mapOption.removeBalloon("polygon_tip");
      this.polygonTip = null;
      this.isOpen = false;
    }
  }
  // 停止
  stop() {
    if (this.isOpen) {
      this.closeTool();
      if (typeof this.closeToolCallback === "function") {
        this.closeToolCallback();
      }
    }
  }
  drawPoint(position) {
    this.mouseMovePointCrd = position[2] <= 0 ? [position[0], position[1], 1] : position;
    const pointParams = {
      pixelSize: 10,
      color: this.color("#fff"),
      outlineColor: this.color("#ff0000"),
      outlineWidth: 3,
      disableDepthTestDistance: Number.POSITIVE_INFINITY
    };
    const pointEntity = new Cesium.Entity({
      show: true,
      id: "mouse_move_point",
      position: new Cesium.CallbackProperty(() => {
        return Cesium.Cartesian3.fromDegrees(...this.mouseMovePointCrd);
      }, false),
      point: pointParams
    });
    return this.viewer.entities.add(pointEntity);
  }
  leftDrawPoint(id, position) {
    const pointParams = {
      pixelSize: 10,
      color: this.color("#fff"),
      outlineColor: this.color("#ff0000"),
      outlineWidth: 3,
      disableDepthTestDistance: Number.POSITIVE_INFINITY
    };
    const pointEntity = new Cesium.Entity({
      show: true,
      id,
      position: new Cesium.CallbackProperty(() => {
        return Cesium.Cartesian3.fromDegrees(...position);
      }, false),
      point: pointParams
    });
    return this.viewer.entities.add(pointEntity);
  }
  async updatePolygonLabel(polygon, lineIndex) {
    const arr = this.getCoordinateArr(polygon);
    let polygonArea = {};
    if (this.type === 1) {
      polygonArea = await this.computedMeasureArea(polygon);
    } else {
      polygonArea = await new Promise((resolve) => {
        calculateSphereArea(arr, (area) => {
          resolve(area);
        });
      });
    }
    polygon.labelArr.forEach((label, index) => {
      if (index === 0) {
        this.updatePloygonStartLabel(polygon, lineIndex);
      } else if (index === polygon.labelArr.length - 1) {
        label.data = {
          ...polygonArea,
          isLast: true
        };
        if (this.autoUnitFlag) {
          this.autoUnit = this.autoConvertUnit(
            this.viewer.scene.mode == Cesium.SceneMode.SCENE2D ? polygonArea.globeSurface : polygonArea.space
          ).unit;
        } else {
          this.autoUnit = this.curUnit;
        }
        this.updateLabel(
          label,
          this.getLabelContentUnit(
            polygonArea,
            this.autoUnitFlag ? this.autoUnit : this.curUnit
          ),
          label.data
        );
      } else if (!label.innerText) {
        this.updateLabel(
          label,
          this.getPointContent("other", lineIndex, label.data),
          label.data
        );
      }
    });
    if (typeof this.updataLineCallback === "function") {
      this.updataLineCallback(polygon, polygonArea, polygon.positions);
    }
  }
  async updateUnitPolygonLabel(unit, polygon, lineIndex) {
    const arr = this.getCoordinateArr(polygon);
    let polygonArea = {};
    if (this.type === 1) {
      polygonArea = await this.computedMeasureArea(polygon);
    } else {
      polygonArea = await new Promise((resolve) => {
        calculateSphereArea(arr, (area) => {
          resolve(area);
        });
      });
    }
    polygon.labelArr.forEach((label, index) => {
      if (index === 0) {
        this.updatePloygonStartLabel(polygon, lineIndex);
      } else if (index === polygon.labelArr.length - 1) {
        label.data = {
          ...polygonArea,
          isLast: true
        };
        this.updateLabel(
          label,
          this.getLabelContentUnit(polygonArea, unit),
          label.data
        );
      } else if (!label.innerText) {
        this.updateLabel(
          label,
          this.getPointContent("other", lineIndex, label.data),
          label.data
        );
      }
    });
    if (typeof this.updataLineCallback === "function") {
      this.updataLineCallback(polygon, polygonArea, polygon.positions);
    }
  }
  updateLabel(label, content, data) {
    const id = label.id;
    this.mapOption.changeBalloon(id, content, false, "", data);
  }
  async removePoint(label) {
    var _a2, _b2, _c, _d, _e, _f, _g, _h;
    const str = (_a2 = label == null ? void 0 : label.id) == null ? void 0 : _a2.split("_");
    const id = str[0];
    const lineIndex = (_b2 = this.polygonArr) == null ? void 0 : _b2.findIndex((it) => (it == null ? void 0 : it.id) === id);
    const polygon = this.polygonArr[lineIndex];
    if (polygon && polygon.positionArr && polygon.positionArr.length <= 3) {
      if (typeof this.delectLineCallback == "function") {
        this.delectLineCallback(polygon);
      }
      return this.removePolygon(polygon);
    }
    const index = (_c = polygon == null ? void 0 : polygon.labelArr) == null ? void 0 : _c.indexOf(label);
    if (index >= 0) {
      this.polygonPointList.filter((v) => (v == null ? void 0 : v.id) === (label == null ? void 0 : label.id) + "_count_point").forEach((v) => {
        var _a3;
        this.viewer.entities.remove(v);
        this.polygonPointList.splice((_a3 = this.polygonPointList) == null ? void 0 : _a3.indexOf(v), 1);
      });
      (_d = polygon == null ? void 0 : polygon.positionArr) == null ? void 0 : _d.splice(index, 1);
      (_e = polygon == null ? void 0 : polygon.positions) == null ? void 0 : _e.splice(index, 1);
      this.mapOption.removeBalloon((_g = (_f = polygon == null ? void 0 : polygon.labelArr) == null ? void 0 : _f.at(index)) == null ? void 0 : _g.id);
      (_h = polygon == null ? void 0 : polygon.labelArr) == null ? void 0 : _h.splice(index, 1);
      if (!this.autoUnitFlag) {
        this.updatePolygonLabel(polygon, lineIndex);
      }
      this.polygonPointList;
      DynamicPrimitive.updatePolygonPos(polygon == null ? void 0 : polygon.id, polygon == null ? void 0 : polygon.positions);
      if (this.autoUnitFlag) {
        let polygonArea = {};
        const arr = this.getCoordinateArr(polygon);
        if (this.type === 1) {
          polygonArea = await this.computedMeasureArea(polygon);
        } else {
          polygonArea = await new Promise((resolve) => {
            calculateSphereArea(arr, (area) => {
              resolve(area);
            });
          });
        }
        this.autoUnit = this.autoConvertUnit(
          this.viewer.scene.mode == Cesium.SceneMode.SCENE2D ? polygonArea.globeSurface : polygonArea.space
        ).unit;
        this.polygonArr.forEach((polygon2, index2) => {
          this.updateUnitPolygonLabel(this.autoUnit, polygon2, index2);
        });
      }
    }
  }
  // 移除多边形
  removePolygon(polygon) {
    var _a2;
    this.viewer.entities;
    const i = polygon == null ? void 0 : polygon.index;
    (_a2 = polygon == null ? void 0 : polygon.labelArr) == null ? void 0 : _a2.forEach((m) => {
      this.mapOption.removeBalloon(m == null ? void 0 : m.id);
      this.polygonPointList.filter((v) => (v == null ? void 0 : v.id) === (m == null ? void 0 : m.id) + "_count_point").forEach((v) => {
        var _a3;
        this.viewer.entities.remove(v);
        this.polygonPointList.splice((_a3 = this.polygonPointList) == null ? void 0 : _a3.indexOf(v), 1);
      });
    });
    DynamicPrimitive.removePolygon(polygon == null ? void 0 : polygon.id);
    this.polygonArr.splice(i, 1);
    this.polygonAllCollent.polygonList = this.polygonArr;
    this.updataStartLabel();
  }
  removeAllPolygon() {
    if (this.polygonAllCollent.pointList.length) {
      this.polygonAllCollent.pointList.forEach(
        (m) => this.viewer.entities.remove(m)
      );
    }
    if (this.polygonAllCollent.labelList.length) {
      this.polygonAllCollent.labelList.forEach((m) => {
        this.mapOption.removeBalloon(m.id);
      });
    }
    if (this.polygonAllCollent.polygonList.length) {
      this.polygonAllCollent.polygonList.forEach(
        (m) => this.viewer.entities.remove(m)
      );
    }
  }
  // 移除所有多边形
  clear() {
    this.isOpen = false;
    this.viewer.entities.remove(this.mouseMovePointEntiy);
    this.mouseMovePointEntiy = null;
    this.mouseMovePointCrd = [];
    const ids = this.polygonArr.map((it) => it.id);
    for (let i = ids.length - 1; i >= 0; i--) {
      const polygon = this.polygonArr[i];
      polygon.labelArr.forEach((m) => {
        this.mapOption.removeBalloon(m.id);
      });
      DynamicPrimitive.removePolygon(polygon.id);
    }
    this.polygonArr = [];
    this.polygonAllCollent.polygonList = [];
    this.drawPolygonSum = 0;
    this.drawLabelSum = 0;
    this.curPolygon = null;
    this.mapOption.removeBalloon("polygon_tip");
    this.polygonTip = null;
    this.removeEventListener();
    this.polygonPointList.forEach((v) => {
      this.viewer.entities.remove(v);
    });
    this.polygonPointList = [];
  }
  // 清理资源
  dispose() {
    this.clear();
    this.isDisposed = true;
    this.viewer = null;
    this.curDrawPointArr = null;
    this.curPolygon = null;
    this.polygonArr = null;
    this.tip = null;
    this.curMousePosition = null;
    this.openToolCallback = null;
    this.drawEndCallback = null;
    this.closeToolCallback = null;
    this.removeEventListener();
    this.handler = null;
  }
  // 画删除按钮
  drawCloseButton(position) {
    const buttonEntity = new Cesium.Entity({
      position,
      name: "删除按钮",
      billboard: {
        image: xImg,
        width: 12,
        height: 12,
        color: this.color("#ff0000"),
        pixelOffset: new Cesium.Cartesian2(0, -15)
      },
      isCloseBtn: true
    });
    this.polygonArr.at(-1).button = buttonEntity;
    this.viewer.entities.add(buttonEntity);
  }
  // Cartesian转经纬度
  cartesianToCoordinate(cartesian) {
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    const coordinate = {
      longitude: Cesium.Math.toDegrees(cartographic.longitude),
      latitude: Cesium.Math.toDegrees(cartographic.latitude),
      height: cartographic.height
    };
    return coordinate;
  }
  getCoordinateArr(polygon) {
    const arr = [];
    polygon.positionArr.forEach((m) => {
      const coordinate = this.cartesianToCoordinate(m);
      arr.push(coordinate.longitude, coordinate.latitude);
    });
    return arr;
  }
  getLonLatHeightArr(polygon) {
    const arr = [];
    polygon.positionArr.forEach((m) => {
      const coordinate = this.cartesianToCoordinate(m);
      arr.push({
        lon: coordinate.longitude,
        lat: coordinate.latitude,
        height: coordinate.height
      });
    });
    return arr;
  }
  // 画标签
  drawLabel(position, content, data) {
    var _a2;
    const id = this.shapeId + "_" + ((_a2 = this.curPolygon) == null ? void 0 : _a2.positionArr.length);
    const labelEntity = this.mapOption.addBalloon({
      id,
      position,
      content,
      offset: [12, -14],
      data,
      isGround: true
    });
    this.curPolygon.labelArr.push(labelEntity);
    this.polygonAllCollent.labelList.push(labelEntity);
  }
  updatePloygonStartLabel(polygon, index) {
    const txt = `${window.i18nT ? window.i18nT("面积") : "面积"}${index + 1}${window.i18nT ? window.i18nT("起点") : "起点"}`;
    const label = polygon.labelArr[0];
    polygon.index = index;
    if (label.innerText.indexOf(txt) === -1) {
      this.updateLabel(
        label,
        `<span class="polygon-label"><span class="polygon-label-text">${txt}</span><span class="btn-remove-polygon-point" role="button"></span></span>`,
        label.data
      );
    }
  }
  updataStartLabel() {
    this.polygonAllCollent.polygonList.forEach(
      (polygon, index) => {
        this.updatePloygonStartLabel(polygon, index);
      }
    );
  }
  // 获取标签文字
  getLabelText() {
    const typeText = this.type === 1 ? "空间面积" : this.type === 2 ? "地表面积" : "投影面积";
    const areaText = formatArea(this.curPolygonArea);
    return typeText + areaText;
  }
  // 根据单位切换显示文本
  letfUnitLabelChange(unit, lineList) {
    let labelList = [];
    this.curUnit = unit;
    if (lineList.length) {
      labelList = lineList.map((line) => line && line.labelArr).flat(5);
      if (labelList.length) {
        labelList.forEach((label) => {
          if (label && label.data) {
            const content = this.getLabelContentUnit(label.data, unit);
            this.mapOption.changeBalloon(label.id, content);
          }
        });
      }
    }
  }
  // 根据单位切换显示文本
  updateUnitLabelChange(unit, lineList) {
    let labelList = [];
    this.curUnit = unit;
    if (lineList.length) {
      labelList = lineList.map((line) => line && line.labelArr).flat(5);
      if (labelList.length) {
        labelList.forEach((label) => {
          if (label && label.data) {
            const content = this.getLabelContentUnit(label.data, unit);
            this.mapOption.changeBalloon(label.id, content);
          }
        });
      }
    }
  }
  // 根据单位切换显示文本
  unitLabelChange(unit, lineList) {
    let labelList = [];
    if (unit == "自动判断") {
      this.autoUnitFlag = true;
      if (lineList.length) {
        labelList = lineList.map((line) => line && line.labelArr).flat(5);
        let key = this.viewer.scene.mode == Cesium.SceneMode.SCENE2D ? "globeSurface" : "space";
        let maxNum = Math.min(
          ...labelList.map((v) => v.data && v.data[key]).filter((v) => v)
        );
        this.autoUnit = this.autoConvertUnit(maxNum).unit;
        if (labelList.length) {
          labelList.forEach((label) => {
            if (label && label.data) {
              const content = this.getLabelContentUnit(
                label.data,
                this.autoUnit
              );
              this.mapOption.changeBalloon(label.id, content);
            }
          });
        }
      }
      return this.autoUnit;
    }
    if (unit == "平方分米" || unit == "平方厘米") {
      this.autoUnitFlag = false;
    } else {
      this.autoUnitFlag = true;
    }
    this.curUnit = unit;
    if (lineList.length) {
      labelList = lineList.map((line) => line && line.labelArr).flat(5);
      if (labelList.length) {
        labelList.forEach((label) => {
          if (label && label.data) {
            const content = this.getLabelContentUnit(label.data, unit);
            this.mapOption.changeBalloon(label.id, content);
          }
        });
      }
    }
    this.updataStartLabel();
  }
  getLabelContentUnit(data, unit = "平方公里") {
    let str = "";
    if (this.viewer.scene.mode == Cesium.SceneMode.SCENE2D) {
      const text3 = `${window.i18nT ? window.i18nT(_APolygonTool.sceneMode2DText) : _APolygonTool.sceneMode2DText}：${formatArea(data.globeSurface, unit)}`;
      str = `<span class="polygon-label">
      <span class="header-content">
        <span>${window.i18nT ? window.i18nT("面积") : "面积"}(${window.i18nT ? window.i18nT(unit) : unit})</span>
        <span class="btn-remove-polygon-point" role="button"></span>
        <span class="btn-remove-polygon"></span>
      </span>

       <div class="line-label-content">
         <div class="line-division"></div>
         <span>${text3}</span>
       </div>
     </span>`;
    } else {
      const text = `${window.i18nT ? window.i18nT(_APolygonTool.sceneMode3DText) : _APolygonTool.sceneMode3DText}：${formatArea(data.space, unit)}`;
      str = `<span class="polygon-label">
     <span class="header-content">
      <span>${window.i18nT ? window.i18nT("面积") : "面积"}(${window.i18nT ? window.i18nT(unit) : unit})</span>
      <span class="btn-remove-polygon-point" role="button"></span>
      <span class="btn-remove-polygon"></span>
     </span>

     <div class="line-label-content">
       <div class="line-division"></div>
       <span>${text}</span>
     </div>
   </span>`;
    }
    return str;
  }
  // 计算地表距离 空间距离 投影距离
  computedMeasureArea(arr) {
    return new Promise(async (resolve) => {
      const params = {
        // sphere: 0, // 投影距离
        // surface: 0, // 地表距离
        // space: 0, // 空间距离
        // globeSurface: 0 // 地球球表面积
      };
      const narr = this.getCoordinateArr(arr);
      const spaceCrd = this.getLonLatHeightArr(arr).map((crds) => {
        return [crds.lon, crds.lat];
      }).flat(5);
      if (this.viewer.scene.mode == Cesium.SceneMode.SCENE2D) {
        params.globeSurface = getPolygonArea(narr);
      } else {
        params.space = GeoMath3D.getPolygonAreaByBLH(spaceCrd, 2);
      }
      resolve(params);
    });
  }
};
__publicField(_APolygonTool, "sceneMode2DText", "地球球体表面积");
// 2d显示的文字
__publicField(_APolygonTool, "sceneMode3DText", "水平平面面积");
let APolygonTool = _APolygonTool;
const arrow = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAAADwSURBVEhLzZbBrcIwEAUHKqAESqAj6ODTAekAOoCOKIEScohtbrtcckBPcWwjWfojvUuknSdFzjp4ZPCE18QCF37BJs4qy8USV52vwgMnleVikbvOV+GBg0VGFS7FEk8f2amjyFzyUuFS5pK9Oor4m311SeT1z0sSTxUuZS45qKOIO7uGkvGnEgCfeKgwF0scdb4KC9xUlotF/gA2KinhkYFN3cpwY9jqwyKmD1ZotVviqq8iF4ucdX4Vi9xVkk3gpPNZfGw8pqHhmDZ/aM3yXquir7znuu564VjiqJJsJh46v0rXS9+nht+WVLeDvvkAAEcTOAREVtQAAAAASUVORK5CYII=";
let primitiveInfo = null;
let flag = false;
class CesiumMap extends AMapOperation {
  constructor() {
    super(...arguments);
    __publicField(this, "glowFlag", false);
    __publicField(this, "requestAnimationGlowing", null);
    // 闪烁线段效果实现
    // 闪烁线段
    __publicField(this, "updateGlowingEffect", () => {
      if (Object.keys(this.amapAdapter.layerOperations.multiplePolyline).length === 0) {
        return;
      }
      for (const key in this.amapAdapter.layerOperations.multiplePolyline) {
        const item = this.amapAdapter.layerOperations.multiplePolyline[key];
        if (item._type === "flicker") {
          item.appearance.material.uniforms.outlineWidth = Math.abs(
            Math.sin(Cesium.JulianDate.now().secondsOfDay) * item._style.lineWidth
          );
        }
        if (item._type === "arrow") {
          const lineLength = item._lineLength;
          const repeatCount = Math.ceil(
            lineLength / (this.getCurrentResolution() * item._primitiveInfo.style.lineWidth)
          );
          item.appearance.material.uniforms.repeatCount = repeatCount;
        }
      }
      requestAnimationFrame(this.updateGlowingEffect);
    });
    __publicField(this, "dynamicIconMap", /* @__PURE__ */ new Map());
    __publicField(this, "animationFrameInterVal", null);
    __publicField(this, "animationFrameInterCount", 0);
  }
  /**
   * 添加点
   * @param pointInfo 【对照Cesium PointPrimitiveCollection】
   * @returns 绘制成功的点对象
   */
  addPoint(pointInfo) {
    const pointCollection = this.amapAdapter.layerOperations.pointCollection;
    const _layerOperations = this.amapAdapter.layerOperations;
    const { id, show = true, position, style, data } = pointInfo;
    if (_layerOperations.multiplePoints[id]) {
      return;
    }
    if (!style) {
      return;
    }
    const {
      StyleKey: styleKey,
      pointType: type = "circle",
      // 点类型 square方 circle圆
      pointSize: pixelSize,
      pointColor: color,
      pointOpacity: alpha = 1,
      pointBorderVisible: outline = false,
      pointBorderColor: outlineColor = "#ffffff",
      pointBorderWidth: outlineWidth,
      pointBorderOpacity: outlineAlpha = 1,
      clampToGround = true,
      pointDisableDepthTestDistance = Number.POSITIVE_INFINITY,
      pointDistanceDisplayCondition: distanceDisplayCondition = [
        1,
        Number.POSITIVE_INFINITY
      ],
      scaleByDistance = void 0
    } = style;
    const _color = Cesium.Color.fromCssColorString(color);
    _color.alpha = alpha;
    let _outlineColor = void 0;
    if (outline) {
      _outlineColor = Cesium.Color.fromCssColorString(outlineColor);
      _outlineColor.alpha = outlineAlpha;
    }
    let _scaleByDistance = {};
    if (Array.isArray(scaleByDistance) && scaleByDistance.length) {
      _scaleByDistance = {
        scaleByDistance: new Cesium.NearFarScalar(...scaleByDistance)
      };
    }
    const point = pointCollection.add({
      id,
      show,
      position: Cesium.Cartesian3.fromDegrees(...position),
      pixelSize,
      color: _color,
      outlineColor: _outlineColor,
      outlineWidth,
      clampToGround,
      // 是否贴地
      ..._scaleByDistance,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        ...distanceDisplayCondition
      ),
      disableDepthTestDistance: pointDisableDepthTestDistance
      // 始终显示在其他对象的前面
    });
    point._id = id;
    point._styleKey = styleKey;
    point._type = type;
    point._data = data;
    _layerOperations.multiplePoints[id] = point;
    return point;
  }
  /**
   * 添加多个点
   * @param pointBaseInfo 【对照Cesium PointPrimitiveCollection】
   * @returns 绘制成功的点的对象集合
   */
  addMultiplePoints(pointBaseInfo) {
    const pointCollection = this.amapAdapter.layerOperations.pointCollection;
    const _layerOperations = this.amapAdapter.layerOperations;
    const pointList = [];
    const { id, show = true, positions, style, data } = pointBaseInfo;
    if (_layerOperations.multiplePoints[id]) {
      return;
    }
    if (!style) {
      return;
    }
    const {
      StyleKey: styleKey,
      pointType: type = "circle",
      // 点类型 square方 circle圆
      pointSize: pixelSize,
      pointColor: color,
      pointOpacity: alpha = 1,
      pointBorderVisible: outline = false,
      pointBorderColor: outlineColor = "#ffffff",
      pointBorderWidth: outlineWidth,
      pointBorderOpacity: outlineAlpha = 1,
      clampToGround = true,
      scaleByDistance = void 0,
      pointDisableDepthTestDistance = Number.POSITIVE_INFINITY,
      pointDistanceDisplayCondition: distanceDisplayCondition = []
    } = style;
    const _color = Cesium.Color.fromCssColorString(color);
    _color.alpha = alpha;
    let _outlineColor = void 0;
    if (outline) {
      _outlineColor = Cesium.Color.fromCssColorString(outlineColor);
      _outlineColor.alpha = outlineAlpha;
    }
    let _scaleByDistance = {};
    if (Array.isArray(scaleByDistance) && scaleByDistance.length) {
      _scaleByDistance = {
        scaleByDistance: new Cesium.NearFarScalar(...scaleByDistance)
      };
    }
    for (let i = 0; i < positions.length; i++) {
      let position = positions[i];
      let posObj = positions[i];
      let _data = data;
      if (typeof posObj == "object" && posObj.positions) {
        position = posObj.positions;
        _data = posObj.data;
      }
      let _distanceDisplayCondition = distanceDisplayCondition;
      if (posObj && posObj.properties != void 0 && posObj.properties.fLevel) {
        const distanc = this.mapsLevelToHeight(posObj.properties.fLevel);
        if (_distanceDisplayCondition.length) {
          let maxShowLevel = _distanceDisplayCondition[0];
          let minShowLevel = _distanceDisplayCondition[1];
          _distanceDisplayCondition = [
            maxShowLevel,
            distanc >= minShowLevel ? minShowLevel : distanc
          ];
        } else {
          _distanceDisplayCondition = [0, distanc];
        }
      }
      if (!_distanceDisplayCondition.length) {
        _distanceDisplayCondition = [0, Number.POSITIVE_INFINITY];
      }
      const point = pointCollection.add({
        id,
        show,
        position: Cesium.Cartesian3.fromDegrees(...position),
        pixelSize,
        color: _color,
        outlineColor: _outlineColor,
        outlineWidth,
        clampToGround,
        // 是否贴地
        ..._scaleByDistance,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          ..._distanceDisplayCondition
        ),
        disableDepthTestDistance: pointDisableDepthTestDistance,
        // 始终显示在其他对象的前面
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      });
      point._id = id;
      point._styleKey = styleKey;
      point._type = type;
      point._data = _data;
      pointList.push(point);
      _distanceDisplayCondition = distanceDisplayCondition;
    }
    _layerOperations.multiplePoints[id] = pointList;
    return pointList;
  }
  /**
   * 移除点
   * @param id 点的唯一标识
   */
  removePoint(id) {
    const pointCollection = this.amapAdapter.layerOperations.pointCollection;
    const _layerOperations = this.amapAdapter.layerOperations;
    const point = _layerOperations.multiplePoints[id];
    if (point) {
      if (Array.isArray(point)) {
        for (let i = 0; i < point.length; i++) {
          pointCollection.remove(point[i]);
        }
      } else {
        pointCollection.remove(point);
      }
      delete _layerOperations.multiplePoints[id];
    }
  }
  /**
   * 移除多个点
   * @param ids 点的唯一标识列表
   */
  removeMultiplePoints(ids) {
    for (let i = 0; i < ids.length; i++) {
      this.removePoint(ids[i]);
    }
  }
  /**
   * 移除全部点
   */
  removeAllPoints() {
    const multiplePoints = this.amapAdapter.layerOperations.multiplePoints;
    for (const key in multiplePoints) {
      this.removePoint(key);
    }
  }
  polylineTypeAppearance(type, option) {
    let appearance = null;
    const { _color, imgUrl, _outLineColor, width } = option;
    switch (type) {
      case "solid":
      case "section":
        appearance = new Cesium.PolylineMaterialAppearance({
          material: new Cesium.Material({
            fabric: {
              type: "Color",
              uniforms: {
                flat: true,
                faceForward: true,
                color: _color
              }
            }
          }),
          translucent: false
        });
        break;
      case "image":
        appearance = new Cesium.PolylineMaterialAppearance({
          material: Cesium.Material.fromType("Image", {
            image: imgUrl,
            repeat: { x: 1, y: 1 }
          })
        });
        break;
      case "dashed":
        appearance = new Cesium.PolylineMaterialAppearance({
          material: Cesium.Material.fromType(Cesium.Material.PolylineDashType, {
            color: _color,
            //线条颜色
            dashLength: 20
            //短划线长度
          })
        });
        break;
      case "glow":
        appearance = new Cesium.PolylineMaterialAppearance({
          material: new Cesium.Material({
            fabric: {
              type: "PolylineGlow",
              uniforms: {
                color: _color,
                // 发光颜色
                glowPower: 0.3,
                // 设置发光强度为最大值
                taperPower: 1
                // 设置锥度强度为最大值
              }
            }
          })
        });
        break;
      case "flow":
        appearance = new Cesium.PolylineMaterialAppearance({
          material: new Cesium.Material({
            translucent: true,
            fabric: {
              uniforms: {
                color: _color,
                image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAAgCAYAAABkS8DlAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAADSSURBVHja7NYxEoUgDEDBYM39z2qHtZViwMFxt1FJnF/98ZXWWkRE7LWWOOt5Lsm9q/vsbu9Zdtazs/J19O5bs1XPZrwze/6V31zxbOZs1n905Wt2p3f25GzE7ohv6q3nLQCA3xEAACAAAAABAAAIAABAAAAAAgAAEAAAgAAAAAQAACAAAAABAAAIAABAAAAAAgAAEAAAgAAAAAQAACAAAEAAAAACAAAQAACAAAAABAAAIAAAAAEAAAgAAEAAAAACAAAQAACAAAAA8g4AAAD//wMA4WEFTJOT5UIAAAAASUVORK5CYII=",
                speed: 20
              },
              source: `
                czm_material czm_getMaterial(czm_materialInput materialInput) {
                  czm_material material = czm_getDefaultMaterial(materialInput);
                  vec2 st = materialInput.st;
                  float st_map_s = fract(st.s - speed * czm_frameNumber * 0.001);
                  vec4 colorImage = texture(image, vec2(st_map_s, st.t)); // 使用texture而不是texture2D
                  vec4 fragColor;
                  fragColor.rgb = color.rgb / 1.0;
                  material.alpha = colorImage.a * color.a;
                  material.diffuse = fragColor.rgb;
                  material.emission = fragColor.rgb;
                  return material;
                }
              `
            }
          })
        });
        break;
      case "gradualWall":
        appearance = new Cesium.PolylineMaterialAppearance({
          material: new Cesium.Material({
            fabric: {
              type: "PolylinePulseLink",
              uniforms: {
                color: _color,
                image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAAgCAYAAABkS8DlAAAA80lEQVR4nO3Wu2rDQBRAwZtUAf//nxpSynUIeaxkOwpnptE+rhCoOi/vl8s2M9t8tLL/av3buZ/WR2dXz47ercyc+Xnv2WfdnfXsEe/8x28+69/99dkj71Zm9sye8Xl0ZvVuz9k9Zr9b7537tH+7XreZmdcBAHIEAAAECQAACBIAABAkAAAgSAAAQJAAAIAgAQAAQQIAAIIEAAAECQAACBIAABAkAAAgSAAAQJAAAIAgAQAAQQIAAIIEAAAECQAACBIAABAkAAAgSAAAQJAAAIAgAQAAQQIAAIIEAAAECQAACBIAABAkAAAgSAAAQJAAAICgG603Akwnm1ZDAAAAAElFTkSuQmCC",
                speed: 1e3
              },
              source: "czm_material czm_getMaterial(czm_materialInput materialInput)\n                    {\n                        czm_material material = czm_getDefaultMaterial(materialInput);\n                        vec2 st = materialInput.st;\n                        vec4 colorImage = texture2D(image, vec2(fract((st.t - speed*czm_frameNumber*0.005)), st.t));\n                        vec4 fragColor;\n                        fragColor.rgb = color.rgb / 1.0;\n                        fragColor = czm_gammaCorrect(fragColor);\n                        material.alpha = colorImage.a * color.a;\n                        material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n                        material.emission = fragColor.rgb;\n                        return material;\n                    }"
            },
            translucent: function() {
              return true;
            }
          })
        });
        break;
      case "flicker":
        appearance = new Cesium.PolylineMaterialAppearance({
          material: new Cesium.Material({
            fabric: {
              type: "PolylineOutline",
              uniforms: {
                color: _color,
                // 设置外发光颜色为白色
                outlineColor: _outLineColor,
                // 设置线段颜色为白色
                outlineWidth: 5
                // 设置外发光宽度
              }
            }
          })
        });
        break;
      case "doubleSolid":
        appearance = new Cesium.PolylineMaterialAppearance({
          material: new Cesium.Material({
            fabric: {
              type: "PolylineOutline",
              uniforms: {
                color: Cesium.Color.WHITE.withAlpha(0),
                outlineColor: _color,
                outlineWidth: width && width - 1
              }
            }
          })
        });
        break;
      case "outLine":
        appearance = new Cesium.PolylineMaterialAppearance({
          material: new Cesium.Material({
            fabric: {
              type: "PolylineOutline",
              uniforms: {
                color: _color,
                outlineColor: Cesium.Color.WHITE.withAlpha(0.8),
                outlineWidth: width && width / 2
              }
            }
          })
        });
        break;
      case "arrow":
        appearance = new Cesium.PolylineMaterialAppearance({
          material: new Cesium.Material({
            translucent: true,
            fabric: {
              uniforms: {
                color: _color,
                image: arrow,
                speed: 10,
                repeatCount: 10,
                aspectRatio: 1,
                bgColor: new Cesium.Color(1, 0, 0, 1)
              },
              source: `
                  uniform vec4 color;
                  uniform sampler2D image;
                  uniform float speed;
                  uniform float repeatCount;
                  uniform float aspectRatio;
                  uniform vec4 bgColor;

                  czm_material czm_getMaterial(czm_materialInput materialInput)
                  {
                    czm_material m = czm_getDefaultMaterial(materialInput);
                    vec2 st = materialInput.st;

                    /* -------- 1. 背景层：永远填满整条线 -------- */
                    vec4 bgLayer = bgColor;                 // 纯色背景
                    bgLayer.a *= color.a;                   // 全局透明度

                    /* -------- 2. 箭头层：采样 + 流动 -------- */
                    float adaptiveRepeat = repeatCount;
                    float time = czm_frameNumber * speed / 1000.0;
                    float s = fract(st.s * adaptiveRepeat - time);

                    float centeredT = st.t - 0.5;
                    float aspectAdjustedT = centeredT / aspectRatio;
                    float finalT = clamp(aspectAdjustedT + 0.5, 0.0, 1.0);

                    vec4 arrowLayer = texture(image, vec2(s, finalT));

                    /* 透明底直接 discard（关键！） */
                    if (arrowLayer.a < 0.05 || finalT <= 0.0 || finalT >= 1.0)
                      discard;

                    /* 箭头染色 */
                    arrowLayer.rgb = color.rgb;
                    arrowLayer.a  *= color.a;

                    /* -------- 3. 混合：背景已画好，箭头叠上去 -------- */
                    vec4 final = mix(bgLayer, arrowLayer, arrowLayer.a);
                    m.alpha = final.a;
                    m.diffuse = final.rgb;
                    return m;
                  }
                `
            }
          })
        });
        break;
    }
    return appearance;
  }
  /**
   * 获取一批坐标的长度
   * @param positions 线段坐标  笛卡尔
   * @returns
   */
  getPolylineLength(positions) {
    let len = 0;
    for (let i = 0; i < positions.length - 1; i++) {
      len += Cesium.Cartesian3.distance(positions[i], positions[i + 1]);
    }
    return len;
  }
  createPolylinePrimitive(id, show, geometryInstance, appearance, option, drawProperty) {
    const primitiveList = [];
    const {
      outline,
      ground,
      groundType,
      doublePrimitive,
      styleKey,
      style,
      type,
      data,
      sectionList,
      polylineInfo,
      lineLength
    } = option;
    let _geometryInstance = geometryInstance;
    let primitive = null;
    if (ground) {
      primitive = new Cesium.GroundPolylinePrimitive({
        show,
        classificationType: this.getGroundType(groundType),
        geometryInstances: _geometryInstance,
        appearance,
        compressVertices: true,
        releaseGeometryInstances: false,
        allowPicking: true,
        asynchronous: true,
        ...drawProperty
      });
      primitiveList.push(primitive);
    }
    if (!ground) {
      primitive = new Cesium.Primitive({
        show,
        geometryInstances: _geometryInstance,
        appearance,
        compressVertices: true,
        releaseGeometryInstances: false,
        allowPicking: true,
        asynchronous: true,
        ...drawProperty
      });
      primitiveList.push(primitive);
    }
    const scenePrimitive = this.amapAdapter.layerOperations.primitiveCollection.add(
      primitiveList[0]
    );
    scenePrimitive._id = id;
    scenePrimitive._styleKey = styleKey;
    scenePrimitive._style = style;
    scenePrimitive._type = type;
    scenePrimitive._doublePrimitive = doublePrimitive;
    scenePrimitive._data = data;
    scenePrimitive._lineLength = lineLength;
    scenePrimitive._sectionData = sectionList;
    scenePrimitive._primitiveInfo = polylineInfo;
    if (!outline) {
      this.amapAdapter.layerOperations.multiplePolyline[id] = scenePrimitive;
    }
    this.updateGlowingEffect();
    return scenePrimitive;
  }
  getGroundType(type) {
    let typeMap = {
      1: Cesium.ClassificationType.BOTH,
      2: Cesium.ClassificationType.CESIUM_3D_TILE,
      3: Cesium.ClassificationType.TERRAIN
    };
    let res = typeMap[1];
    switch (type) {
      case 1:
        res = typeMap[1];
        break;
      case 2:
        res = typeMap[2];
        break;
      case 3:
        res = typeMap[3];
        break;
    }
    return res;
  }
  /**
   * 添加线段
   * @param polylineInfo 【对应Cesium PolylineGeometry】
   * @returns 绘制的线段
   */
  addPolyline(polylineInfo) {
    const {
      id,
      show = true,
      positions,
      ground = true,
      vnum = 2,
      groundType = 0,
      doublePrimitive = false,
      style,
      data,
      outline = false,
      drawProperty = {}
    } = polylineInfo;
    if (this.amapAdapter.layerOperations.multiplePolyline[id]) {
      return;
    }
    if (!style) {
      return;
    }
    const {
      StyleKey: styleKey,
      lineType: type = "solid",
      lineImage: imgUrl,
      // 线段图片
      lineWidth: width,
      lineColor: color,
      lineOpacity: alpha = 1
      // lineBorderVisible: lineBorderVisible = false,
      // lineBorderWidth: outlineWidth,
      // lineBorderColor: outlineColor,
      // lineBorderOpacity: outletAlpha = 1
    } = style;
    let geometry = null;
    let geometryInstance = null;
    let appearance = null;
    let sectionList = null;
    const _color = Cesium.Color.fromCssColorString(color);
    _color.alpha = alpha;
    const degreesPos = vnum == 2 ? Cesium.Cartesian3.fromDegreesArray(positions) : Cesium.Cartesian3.fromDegreesArrayHeights(positions);
    const _outLineColor = Cesium.Color.fromCssColorString(color);
    _outLineColor.alpha = 0.5;
    if (ground || doublePrimitive) {
      geometry = new Cesium.GroundPolylineGeometry({
        positions: degreesPos,
        width
      });
    }
    if (!ground || doublePrimitive) {
      geometry = new Cesium.PolylineGeometry({
        positions: degreesPos,
        width
      });
    }
    geometryInstance = new Cesium.GeometryInstance({
      geometry,
      id
      // 设置一个唯一的ID
    });
    if (type == "section") {
      sectionList = this.polylineSection(positions, width, color);
    }
    appearance = this.polylineTypeAppearance(type, {
      _color,
      imgUrl,
      _outLineColor,
      width
    });
    const scenePrimitive = this.createPolylinePrimitive(
      id,
      show,
      geometryInstance,
      appearance,
      {
        outline,
        ground,
        groundType,
        doublePrimitive,
        styleKey,
        style,
        type,
        data,
        sectionList,
        polylineInfo
      },
      drawProperty
    );
    if (doublePrimitive) {
      this.addMultiplePolylines({
        ...polylineInfo,
        id: id + "_double",
        ground: !polylineInfo.ground,
        doublePrimitive: false
      });
    }
    return scenePrimitive;
  }
  // 绘制鱼叉断面
  polylineSection(positions, width, color) {
    const sx = positions[0];
    const sy = positions[1];
    const ex = positions[positions.length - 2];
    const ey = positions[positions.length - 1];
    const posList = [
      [sx, sy],
      [ex, ey]
    ];
    const angle = this.getAngleSection(sx, sy, ex, ey);
    const sectionList = [];
    for (let i = 0; i < posList.length; i++) {
      const pos = posList[i];
      const toggleAngle = angle;
      sectionList.push(
        this.addIconSectionPoint({
          id: "icon_section" + pos + i,
          position: pos,
          style: {
            iconImage: this.getCanvasImg(width, color).img,
            iconWidth: 24,
            iconHeight: 24,
            iconOffsetX: 0,
            iconOffsetY: 0,
            iconRtation: i == 0 ? toggleAngle - Math.PI : toggleAngle,
            verticalOrigin: "center",
            horizontalOrigin: "center"
          }
        })
      );
    }
    return sectionList;
  }
  /**
   * 计算两个点的角度
   * @param sx 开始经度
   * @param sy 开始纬度
   * @param ex 结束经度
   * @param ey 结束纬度
   * @returns 两个经度纬度的角度
   */
  getAngle(sx, sy, ex, ey) {
    const dx = ex - sx;
    const dy = ey - sy;
    let angle = 90;
    if (dx != 0) {
      angle = Math.atan2(dy, dx);
    }
    angle = -angle;
    if (dx < 0) {
      angle += Math.PI;
    }
    return angle;
  }
  /**
   * 计算两个线水平方向的夹角
   * @param sx 开始经度
   * @param sy 开始纬度
   * @param ex 结束经度
   * @param ey 结束纬度
   * @returns 两个经度纬度的角度
   */
  getAngleSection(sx, sy, ex, ey) {
    const dx = ex - sx;
    const dy = ey - sy;
    let angle = 90;
    if (dx != 0) {
      angle = Math.atan2(dy, dx);
    }
    return angle;
  }
  /**
   * 添加多条线段
   * @param baseInfo 样式配置
   * @param polylineInfo 线段位置大小
   * @returns 线段对象
   */
  addMultiplePolylines(polylineInfo) {
    var _a2, _b2, _c;
    let geometry = null;
    const geometryInstances = [];
    let appearance = null;
    const sectionList = [];
    let lineLength = null;
    const {
      id,
      show = true,
      ground = true,
      groundType = 0,
      doublePrimitive = false,
      // 是否双线段 贴地不贴地都显示
      vnum = 2,
      positions,
      style,
      data,
      outline = false,
      drawProperty = {}
    } = polylineInfo;
    if (this.amapAdapter.layerOperations.multiplePolyline[id]) {
      return;
    }
    if (!style) {
      return;
    }
    const {
      StyleKey: styleKey,
      lineType: type = "solid",
      lineImage: imgUrl,
      // 线段图片
      lineWidth: width,
      lineColor: color,
      lineOpacity: alpha = 1
      // lineBorderVisible: lineBorderVisible = false,
      // lineBorderWidth: outlineWidth,
      // lineBorderColor: outlineColor,
      // lineBorderOpacity: outletAlpha = 1
    } = style;
    const _color = Cesium.Color.fromCssColorString(color);
    _color.alpha = alpha;
    const _outLineColor = Cesium.Color.fromCssColorString(color);
    _outLineColor.alpha = 0.5;
    for (let i = 0; i < positions.length; i++) {
      let position = null;
      let idCopy = id;
      let idata = null;
      if (positions[i] && positions[i].id) {
        position = (_a2 = positions[i]) == null ? void 0 : _a2.position;
        idCopy = (_b2 = positions[i]) == null ? void 0 : _b2.id;
        idata = (_c = positions[i]) == null ? void 0 : _c.data;
      } else {
        position = positions[i];
      }
      const degreesPos = vnum == 2 ? Cesium.Cartesian3.fromDegreesArray(position) : Cesium.Cartesian3.fromDegreesArrayHeights(position);
      if (type === "gradualWall") {
        geometry = Cesium.WallGeometry.fromConstantHeights({
          positions: degreesPos,
          maximumHeight: 1e3,
          vertexFormat: Cesium.MaterialAppearance.VERTEX_FORMAT
        });
      } else {
        if (ground) {
          geometry = new Cesium.GroundPolylineGeometry({
            positions: degreesPos,
            width
          });
        }
        if (!ground) {
          geometry = new Cesium.PolylineGeometry({
            positions: degreesPos,
            width
          });
        }
      }
      const instance = new Cesium.GeometryInstance({
        geometry,
        id: idCopy
        // 设置一个唯一的ID
      });
      instance._id = idCopy;
      instance._styleKey = styleKey;
      instance._type = type;
      instance._data = idata;
      geometryInstances.push(instance);
      if (type == "section") {
        sectionList.push(
          ...this.polylineSection(position, width, color)
        );
      }
      if (type == "arrow") {
        lineLength = this.getPolylineLength(degreesPos);
      }
    }
    appearance = this.polylineTypeAppearance(type, {
      _color,
      imgUrl,
      _outLineColor,
      width
    });
    const scenePrimitive = this.createPolylinePrimitive(
      id,
      show,
      geometryInstances,
      appearance,
      {
        outline,
        ground,
        groundType,
        styleKey,
        doublePrimitive,
        style,
        type,
        data,
        sectionList,
        polylineInfo,
        lineLength
      },
      drawProperty
    );
    if (doublePrimitive) {
      this.addMultiplePolylines({
        ...polylineInfo,
        id: id + "_double",
        ground: !polylineInfo.ground,
        doublePrimitive: false,
        outline: false
      });
    }
    return scenePrimitive;
  }
  /**
   * 添加多条线段
   * @param baseInfo 样式配置
   * @param polylineInfo 线段位置大小
   * @returns 线段对象
   */
  addTfMultiplePolylines(polylineInfo) {
    var _a2, _b2, _c;
    let geometry = null;
    const geometryInstances = [];
    let appearance = null;
    let linePrimitive = null;
    const {
      id,
      show = true,
      ground = true,
      materialType = "SOLIDLINE",
      vnum = 2,
      positions,
      style
    } = polylineInfo;
    if (this.amapAdapter.layerOperations.multiplePolyline[id]) {
      return;
    }
    for (let i = 0; i < positions.length; i++) {
      const { lineColor: color, lineWidth: width } = (_a2 = positions[i]) == null ? void 0 : _a2.style;
      const _color = Cesium.Color.fromCssColorString(color);
      let idCopy = (_b2 = positions[i]) == null ? void 0 : _b2.id;
      let position = (_c = positions[i]) == null ? void 0 : _c.position;
      let insShow = positions[i].show;
      const degreesPos = vnum == 2 ? Cesium.Cartesian3.fromDegreesArray(position) : Cesium.Cartesian3.fromDegreesArrayHeights(position);
      if (ground) {
        geometry = new Cesium.GroundPolylineGeometry({
          positions: degreesPos,
          width
        });
      }
      if (!ground) {
        geometry = new Cesium.PolylineGeometry({
          positions: degreesPos,
          width
        });
      }
      const instance = new Cesium.GeometryInstance({
        geometry,
        id: idCopy,
        // 设置一个唯一的ID
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(_color),
          show: new Cesium.ShowGeometryInstanceAttribute(insShow)
        }
      });
      instance._id = idCopy;
      instance._data = positions[i].data;
      geometryInstances.push(instance);
    }
    appearance = tfMaterialMap[materialType];
    if (materialType == "CUSTOMCOLOR") {
      appearance = new Cesium.PolylineMaterialAppearance({
        material: new Cesium.Material({
          fabric: {
            type: "Color",
            uniforms: {
              flat: true,
              faceForward: true,
              color: Cesium.Color.fromCssColorString(style.lineColor)
            }
          }
        }),
        translucent: false
      });
    }
    if (ground) {
      linePrimitive = new Cesium.GroundPolylinePrimitive({
        show,
        geometryInstances,
        appearance,
        compressVertices: true,
        releaseGeometryInstances: true,
        allowPicking: true,
        asynchronous: true
      });
    }
    if (!ground) {
      linePrimitive = new Cesium.Primitive({
        show,
        geometryInstances,
        appearance,
        compressVertices: true,
        releaseGeometryInstances: false,
        allowPicking: true,
        asynchronous: true
      });
    }
    linePrimitive = this.amapAdapter.layerOperations.primitiveCollection.add(linePrimitive);
    linePrimitive._id = id;
    linePrimitive._primitiveInfo = polylineInfo;
    this.amapAdapter.layerOperations.multiplePolyline[id] = linePrimitive;
    return linePrimitive;
  }
  /**
   * 移除线段
   * @param id 线段的唯一标识
   */
  removePolyline(id) {
    const dbId = id + "_double";
    const _layerOperations = this.amapAdapter.layerOperations;
    const polyline = this.amapAdapter.layerOperations.multiplePolyline[id];
    const dbPolyline = this.amapAdapter.layerOperations.multiplePolyline[dbId];
    if (polyline) {
      this.amapAdapter.layerOperations.primitiveCollection.remove(polyline);
      this.amapAdapter.layerOperations.primitiveCollection.remove(dbPolyline);
      delete _layerOperations.multiplePolyline[id];
      delete _layerOperations.multiplePolyline[dbId];
      if (polyline._sectionData && Array.isArray(polyline._sectionData)) {
        for (let i = 0; i < polyline._sectionData.length; i++) {
          const id2 = polyline._sectionData[i]._id;
          this.removeIconPoint(id2);
        }
      }
    }
  }
  /**
   * 移除多条线段
   * @param ids 线段的唯一标识集合
   */
  removeMultiplePolylines(ids) {
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      this.removePolyline(id);
    }
  }
  /**
   * 移除全部线段
   */
  removeAllPolylines() {
    const multiplePolylines = this.amapAdapter.layerOperations.multiplePolyline;
    for (const key in multiplePolylines) {
      this.removePolyline(key);
    }
  }
  /**
   * 添加多边形
   * @param polygonInfo 多边形绘制需要的参数【对应Cesium PolygonGeometry】holes多边形挖空
   * @returns 添加成功多边形对象
   */
  addPolygon(polygonInfo) {
    const _amapOperations = this.amapAdapter.layerOperations;
    let instance = null;
    let geo = null;
    let appearance = null;
    let primitive = null;
    const {
      id,
      show = true,
      ground = true,
      positions,
      holes = [],
      style,
      data,
      drawProperty = {}
    } = polygonInfo;
    if (_amapOperations.multiplePolygon[id] || !style) {
      return;
    }
    const {
      StyleKey: styleKey,
      fillVisible: polygonVisibleColor = true,
      fillColor: color,
      fillOpacity: alpha = 1,
      fillborderVisible: outline = false,
      fillBorderWidth: outlineWidth,
      fillBorderColor: outlineColor,
      fillBorderOpacity: outlineAlpha = 1
    } = style;
    let _color = null;
    _color = Cesium.Color.fromCssColorString(color);
    _color.alpha = alpha;
    const holeList = [];
    if (holes && holes.length > 0) {
      holes.forEach((hole) => {
        holeList.push(
          new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(hole))
        );
      });
    }
    geo = new Cesium.PolygonGeometry({
      polygonHierarchy: new Cesium.PolygonHierarchy(
        Cesium.Cartesian3.fromDegreesArray(positions),
        holeList
      ),
      vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
    });
    instance = new Cesium.GeometryInstance({
      id,
      geometry: geo,
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(_color)
      }
    });
    appearance = new Cesium.PerInstanceColorAppearance({
      flat: true,
      faceForward: true,
      aboveGround: true,
      translucent: true,
      closed: false
    });
    if (ground) {
      primitive = new Cesium.GroundPrimitive({
        show: show ? polygonVisibleColor : false,
        geometryInstances: instance,
        appearance,
        compressVertices: false,
        releaseGeometryInstances: false,
        allowPicking: true,
        asynchronous: true,
        ...drawProperty
      });
    } else {
      primitive = new Cesium.Primitive({
        show: show ? polygonVisibleColor : false,
        geometryInstances: instance,
        appearance,
        compressVertices: false,
        releaseGeometryInstances: false,
        allowPicking: true,
        asynchronous: true,
        ...drawProperty
      });
    }
    const scenePrimitive = this.amapAdapter.layerOperations.primitiveCollection.add(primitive);
    scenePrimitive._id = id;
    scenePrimitive._styleKey = styleKey;
    scenePrimitive._outline = outline;
    scenePrimitive._data = data;
    this.amapAdapter.layerOperations.multiplePolygon[id] = scenePrimitive;
    if (id && outline && Array.isArray(positions) && outlineWidth && outlineColor) {
      const baseInfo = {
        id,
        positions,
        ground,
        style: {
          lineWidth: outlineWidth,
          lineColor: outlineColor,
          lineOpacity: outlineAlpha
        }
      };
      this.addPolyline(baseInfo);
    }
    return scenePrimitive;
  }
  addMultiplePolygons(polygonInfo, layerOpter) {
    const _amapOperations = this.amapAdapter.layerOperations;
    const instances = [];
    let instance = null;
    let geo = null;
    let appearance = null;
    let primitive = null;
    const outlinePrimitve = [];
    const outlineDataList = [];
    const {
      id,
      show = true,
      positions,
      style,
      coordinateType,
      data,
      ground = true,
      groundType = 3,
      doublePrimitive = true,
      // 是否双线段 贴地不贴地都显示
      drawProperty = {}
      // 绘制属性
    } = polygonInfo;
    let _groundType = Cesium.ClassificationType.TERRAIN;
    if (groundType == 1) {
      _groundType = Cesium.ClassificationType.BOTH;
    }
    if (groundType == 2) {
      _groundType = Cesium.ClassificationType.CESIUM_3D_TILE;
    }
    if (_amapOperations.multiplePolygon[id] || !style) {
      return;
    }
    const {
      StyleKey: styleKey,
      fillVisible: polygonVisibleColor = true,
      fillColor: color,
      fillOpacity: alpha = 1,
      fillborderVisible: outline = false,
      fillBorderWidth: outlineWidth,
      fillBorderColor: outlineColor,
      fillBorderOpacity: outlineAlpha = 1,
      fillBorderType: outlineType = "solid"
    } = style;
    let _color = null;
    if (typeof color != "string") {
      _color = color;
    } else {
      _color = Cesium.Color.fromCssColorString(color);
      _color.alpha = alpha;
    }
    if (!polygonVisibleColor) {
      _color.alpha = 0;
    }
    for (let i = 0; i < positions.length; i++) {
      let position = positions[i];
      const holes = positions[i].holes;
      let _baseId = null;
      let baseData = null;
      const holeList = [];
      if (Object.prototype.toString.call(position) === "[object Object]") {
        if (position.id && position.color) {
          _baseId = position.id;
          _color = Cesium.Color.fromCssColorString(position.color);
          _color.alpha = position.alpha != void 0 ? position.alpha : 1;
        }
        if (!polygonVisibleColor) {
          _color.alpha = 0;
        }
        baseData = position.data;
        position = position.positions;
      }
      if (Array.isArray(position) && position.length && outline && outlineWidth && outlineColor && outlineAlpha) {
        outlineDataList.push({
          id: _baseId ? _baseId : id,
          position,
          data: baseData
        });
      }
      if (holes && holes.length > 0) {
        holes.forEach((hole) => {
          holeList.push(
            new Cesium.PolygonHierarchy(
              Cesium.Cartesian3.fromDegreesArray(hole)
            )
          );
        });
      }
      if (coordinateType == "Descartes") {
        geo = new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(
            this.addPos2C3List(position)
          )
        });
      } else {
        geo = new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(
            Cesium.Cartesian3.fromDegreesArray(position),
            holeList
          )
        });
      }
      instance = new Cesium.GeometryInstance({
        id: _baseId ? _baseId : id,
        geometry: geo,
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(_color)
        }
      });
      instance.data = baseData;
      instances.push(instance);
    }
    appearance = new Cesium.PerInstanceColorAppearance({
      flat: true,
      faceForward: true,
      translucent: true
    });
    if (ground) {
      primitive = new Cesium.GroundPrimitive({
        show,
        geometryInstances: instances,
        appearance,
        compressVertices: true,
        releaseGeometryInstances: false,
        allowPicking: true,
        asynchronous: false,
        classificationType: _groundType,
        ...drawProperty
      });
    } else {
      primitive = new Cesium.Primitive({
        show,
        geometryInstances: instances,
        appearance,
        compressVertices: false,
        releaseGeometryInstances: false,
        allowPicking: true,
        asynchronous: false,
        ...drawProperty
      });
    }
    const scenePrimitive = this.amapAdapter.layerOperations.primitiveCollection.add(primitive);
    if (outlineDataList && outlineDataList.length > 0) {
      const polylineInfo = {
        id,
        show,
        ground,
        doublePrimitive,
        positions: outlineDataList,
        data: polygonInfo.data,
        style: {
          lineWidth: outlineWidth,
          lineColor: outlineColor,
          lineOpacity: outlineAlpha,
          lineType: outlineType
        },
        outline: true
      };
      outlinePrimitve.push(this.addMultiplePolylines(polylineInfo));
      this.amapAdapter.layerOperations.primitiveCollection.raise(
        outlinePrimitve[0]
      );
    }
    scenePrimitive._id = id;
    scenePrimitive.LayerId = id;
    scenePrimitive._styleKey = styleKey;
    scenePrimitive._data = data;
    scenePrimitive._outlinePrimitve = outlinePrimitve;
    !layerOpter && (this.amapAdapter.layerOperations.multiplePolygon[id] = scenePrimitive);
    return scenePrimitive;
  }
  /**
   * 坐标转换
   * @param pos 一维数组
   * @returns
   */
  addPos2C3List(pos) {
    let arr = null;
    if (pos && pos.length > 0) {
      arr = [];
      for (let i = 0; i < pos.length; i += 3) {
        arr.push({
          x: pos[i + 0],
          y: pos[i + 1],
          z: pos[i + 2]
        });
      }
    }
    return arr;
  }
  /**
   * 移除一个多边形
   * @param id 多变形唯一标识
   */
  removePolygon(id) {
    const _layerOperations = this.amapAdapter.layerOperations;
    const polygon = this.amapAdapter.layerOperations.multiplePolygon[id];
    if (polygon) {
      this.amapAdapter.layerOperations.primitiveCollection.remove(polygon);
      delete _layerOperations.multiplePolygon[id];
      if (polygon._outline) {
        const polyline = this.amapAdapter.layerOperations.multiplePolyline[id];
        this.amapAdapter.layerOperations.primitiveCollection.remove(polyline);
        delete _layerOperations.multiplePolyline[id];
      }
      if (polygon._outlinePrimitve) {
        for (let i = 0; i < polygon._outlinePrimitve.length; i++) {
          this.removePolyline(polygon._id + "_double");
          const outline = polygon._outlinePrimitve[i];
          this.amapAdapter.layerOperations.primitiveCollection.remove(outline);
        }
      }
    }
  }
  /**
   * 移除多个多边形
   * @param ids 多边形唯一标识集合
   */
  removeMultiplePolygons(ids) {
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      this.removePolygon(id);
    }
  }
  /**
   * 移除全部多边形
   */
  removeAllPolygons() {
    const multiplePolygon = this.amapAdapter.layerOperations.multiplePolygon;
    for (const key in multiplePolygon) {
      this.removePolygon(key);
    }
  }
  getCanvasImg(width, color) {
    const canvas = document.createElement("canvas");
    canvas.width = 48;
    canvas.height = 48;
    const ctx = canvas.getContext("2d");
    ctx.moveTo(48, 12);
    ctx.lineTo(24, 24);
    ctx.lineTo(48, 36);
    ctx.lineWidth = width * 2;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.beginPath();
    const img = new Image();
    img.src = canvas.toDataURL("image/png");
    return { img };
  }
  // 鱼叉点辅助函数
  addIconSectionPoint(iconPintInfo) {
    const iconPointCollection = this.amapAdapter.layerOperations.iconPointCollection;
    const _layerOperations = this.amapAdapter.layerOperations;
    const {
      id,
      show = true,
      position,
      iconServerUrl,
      style,
      data
    } = iconPintInfo;
    if (_layerOperations.multipleIconPoins[id]) {
      return;
    }
    if (!style) {
      return;
    }
    const {
      StyleKey: styleKey,
      iconImage: image,
      iconOpacity: alpha = 1,
      iconWidth: width = 0,
      iconHeight: height = 0,
      iconRtation: rotation = 0,
      iconOffsetX: offsetX = -width / 2,
      iconOffsetY: offsetY = -height,
      verticalOrigin,
      horizontalOrigin,
      iconEyeOffset: eyeOffset = [0, 0, -1e3],
      iconDistanceDisplayCondition: distanceDisplayCondition = [
        1,
        Number.POSITIVE_INFINITY
      ]
    } = style;
    const _offsetX = offsetX != void 0 ? offsetX : -width / 2;
    const _offsetY = offsetY != void 0 ? offsetY : -height / 2;
    const { vertical, horizontal } = this.originHandel(
      verticalOrigin,
      horizontalOrigin
    );
    const _verticalOrigin = vertical;
    const _horizontalOrigin = horizontal;
    const iconPoint = iconPointCollection.add({
      id,
      show,
      // 是否显示
      position: Cesium.Cartesian3.fromDegrees(...position),
      image: iconServerUrl ? iconServerUrl + image : image,
      // 图像地址，URI或Canvas的属性//image: '/img/36lxdt.png',
      color: Cesium.Color.WHITE.withAlpha(alpha),
      // 设置颜色和透明度
      width,
      height,
      rotation,
      // 逆时针旋转
      sizeInMeters: false,
      // 大小是否以米为单位
      verticalOrigin: _verticalOrigin,
      // 相对于坐标的垂直位置
      horizontalOrigin: _horizontalOrigin,
      // 相对于坐标的水平位置
      pixelOffset: new Cesium.Cartesian2(_offsetX, _offsetY),
      // 该属性指定标签在屏幕空间中距此标签原点的像素偏移量
      scale: 1,
      // 应用于图像的统一比例。比例大于会1.0放大标签，而比例小于会1.0缩小标签。
      clampToGround: true,
      eyeOffset: new Cesium.Cartesian3(...eyeOffset),
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        ...distanceDisplayCondition
      )
    });
    iconPoint._id = id;
    iconPoint._styleKey = styleKey;
    iconPoint._data = data;
    _layerOperations.multipleIconPoins[id] = iconPoint;
    return iconPoint;
  }
  /**
   * 添加图标点
   * @param iconPintInfo 【对应Ceesium Billboard方法】
   * @returns 添加的图标对象
   */
  addIconPoint(iconPintInfo) {
    const iconPointCollection = this.amapAdapter.layerOperations.iconPointCollection;
    const _layerOperations = this.amapAdapter.layerOperations;
    const {
      id,
      show = true,
      position,
      iconServerUrl,
      style,
      data
    } = iconPintInfo;
    if (_layerOperations.multipleIconPoins[id]) {
      return;
    }
    if (!style) {
      return;
    }
    const {
      StyleKey: styleKey,
      iconImage: image,
      iconOpacity: alpha = 1,
      iconWidth: width = 0,
      iconHeight: height = 0,
      iconRtation: rotation = 0,
      iconOffsetX: offsetX = 0,
      iconOffsetY: offsetY = 0,
      verticalOrigin,
      horizontalOrigin,
      iconEyeOffset: eyeOffset = [0, 0, 0],
      scaleByDistance = void 0,
      iconDistanceDisplayCondition: distanceDisplayCondition = [
        1,
        Number.POSITIVE_INFINITY
      ],
      iconDisableDepthTestDistance = 0,
      iconRange = void 0
    } = style;
    const _offsetX = offsetX != void 0 ? offsetX : -width / 2;
    const _offsetY = offsetY != void 0 ? offsetY : -height / 2;
    const { vertical, horizontal } = this.originHandel(
      verticalOrigin,
      horizontalOrigin
    );
    const _verticalOrigin = vertical;
    const _horizontalOrigin = horizontal;
    let _scaleByDistance = {};
    if (Array.isArray(scaleByDistance) && scaleByDistance.length) {
      _scaleByDistance = {
        scaleByDistance: new Cesium.NearFarScalar(...scaleByDistance)
      };
    }
    const iconPoint = iconPointCollection.add({
      id,
      show,
      // 是否显示
      position: Cesium.Cartesian3.fromDegrees(...position),
      image: iconServerUrl ? iconServerUrl + image : image,
      // 图像地址，URI或Canvas的属性//image: '/img/36lxdt.png',
      color: Cesium.Color.WHITE.withAlpha(alpha),
      // 设置颜色和透明度
      width,
      height,
      rotation,
      // 逆时针旋转
      sizeInMeters: false,
      // 大小是否以米为单位
      verticalOrigin: _verticalOrigin,
      // 相对于坐标的垂直位置
      horizontalOrigin: _horizontalOrigin,
      // 相对于坐标的水平位置
      pixelOffset: new Cesium.Cartesian2(_offsetX, _offsetY),
      // 该属性指定标签在屏幕空间中距此标签原点的像素偏移量
      scale: 1,
      // 应用于图像的统一比例。比例大于会1.0放大标签，而比例小于会1.0缩小标签。
      clampToGround: true,
      eyeOffset: new Cesium.Cartesian3(...eyeOffset),
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        ...distanceDisplayCondition
      ),
      ..._scaleByDistance,
      disableDepthTestDistance: iconDisableDepthTestDistance,
      // 深度监测
      imageSubRegion: iconRange ? new Cesium.BoundingRectangle(...iconRange) : void 0
    });
    iconPoint._id = id;
    iconPoint._styleKey = styleKey;
    iconPoint._iconPintInfo = iconPintInfo;
    iconPoint._data = data;
    _layerOperations.multipleIconPoins[id] = iconPoint;
    return iconPoint;
  }
  /**
   * 添加多个图形点
   * @param iconPintInfo 【对应Ceesium Billboard方法】
   * @returns 添加的图标对象集合
   */
  addMultipleIconPoint(iconPintInfo) {
    const iconPointColl = [];
    const iconPointCollection = this.amapAdapter.layerOperations.iconPointCollection;
    const _layerOperations = this.amapAdapter.layerOperations;
    const {
      id,
      show = true,
      positions,
      iconServerUrl,
      style,
      data
    } = iconPintInfo;
    if (_layerOperations.multipleIconPoins[id]) {
      return;
    }
    if (!style) {
      return;
    }
    let iconPointStyle = style;
    const {
      StyleKey: styleKey,
      iconWidth: width = 0,
      iconHeight: height = 0,
      iconOffsetX: offsetX = 0,
      iconOffsetY: offsetY = 0,
      verticalOrigin,
      horizontalOrigin,
      iconType
    } = iconPointStyle;
    const _offsetX = offsetX != void 0 ? offsetX : -width / 2;
    const _offsetY = offsetY != void 0 ? offsetY : -height / 2;
    const { vertical, horizontal } = this.originHandel(
      verticalOrigin,
      horizontalOrigin
    );
    const _verticalOrigin = vertical;
    const _horizontalOrigin = horizontal;
    if (iconType === "diffusion") {
      iconPointColl.push(this.addPointDiffusion(iconPintInfo, true));
    }
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i].positions;
      const _data = positions[i].data;
      let _color = positions[i].color || "#ffffff";
      if (positions[i].style) {
        iconPointStyle = {
          ...iconPointStyle,
          ...positions[i].style
        };
      }
      const {
        StyleKey: styleKey2,
        iconImage: image,
        iconOpacity: alpha = 1,
        iconWidth: width2 = 0,
        iconHeight: height2 = 0,
        iconRtation: rotation = 0,
        iconEyeOffset: eyeOffset = [0, 0, 0],
        iconDistanceDisplayCondition: distanceDisplayCondition = [],
        iconDisableDepthTestDistance = 0,
        // 深度监测
        scaleByDistance = void 0,
        iconRange = void 0
      } = iconPointStyle;
      let _distanceDisplayCondition = distanceDisplayCondition;
      if (positions[i].properties != void 0 && positions[i].properties.fLevel) {
        const distanc = this.mapsLevelToHeight(positions[i].properties.fLevel);
        if (_distanceDisplayCondition.length) {
          let maxShowLevel = _distanceDisplayCondition[0];
          let minShowLevel = _distanceDisplayCondition[1];
          _distanceDisplayCondition = [
            maxShowLevel,
            distanc >= minShowLevel ? minShowLevel : distanc
          ];
        } else {
          _distanceDisplayCondition = [0, distanc];
        }
      }
      if (!_distanceDisplayCondition.length) {
        _distanceDisplayCondition = [0, Number.POSITIVE_INFINITY];
      }
      let _scaleByDistance = {};
      if (Array.isArray(scaleByDistance) && scaleByDistance.length) {
        _scaleByDistance = {
          scaleByDistance: new Cesium.NearFarScalar(...scaleByDistance)
        };
      }
      const iconPoint = iconPointCollection.add({
        id,
        show,
        // 是否显示
        position: Cesium.Cartesian3.fromDegrees(...position),
        image: iconServerUrl ? iconServerUrl + image : image,
        // 图像地址，URI或Canvas的属性//image: '/img/36lxdt.png',
        color: Cesium.Color.fromCssColorString(_color).withAlpha(alpha),
        width: width2,
        height: height2,
        rotation,
        // 逆时针旋转
        sizeInMeters: false,
        // 大小是否以米为单位
        verticalOrigin: _verticalOrigin,
        // 相对于坐标的垂直位置
        horizontalOrigin: _horizontalOrigin,
        // 相对于坐标的水平位置
        pixelOffset: new Cesium.Cartesian2(_offsetX, _offsetY),
        // 该属性指定标签在屏幕空间中距此标签原点的像素偏移量
        scale: 1,
        // 应用于图像的统一比例。比例大于会1.0放大标签，而比例小于会1.0缩小标签。
        clampToGround: true,
        eyeOffset: new Cesium.Cartesian3(...eyeOffset),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          ..._distanceDisplayCondition
        ),
        disableDepthTestDistance: iconDisableDepthTestDistance,
        // 深度监测
        ..._scaleByDistance,
        imageSubRegion: iconRange ? new Cesium.BoundingRectangle(...iconRange) : void 0
      });
      iconPoint._id = id;
      iconPoint._styleKey = styleKey2;
      iconPoint._iconPintInfo = iconPintInfo;
      iconPoint._data = _data;
      iconPointColl.push(iconPoint);
      _distanceDisplayCondition = distanceDisplayCondition;
    }
    _layerOperations.multipleIconPoins[id] = iconPointColl;
    return iconPointColl;
  }
  /**
   * 绘制圆点扩散效果
   * @param iconPintInfo
   * @returns 绘制成功的圆点扩散图元
   */
  addPointDiffusion(iconPintInfo, pFlag = false) {
    const circleSource = `
    czm_material czm_getMaterial(czm_materialInput materialInput)
    {
        czm_material material = czm_getDefaultMaterial(materialInput);
        vec2 st = materialInput.st;
        vec3 diffuse = color.rgb;
        float alpha = 0.0;
        float u_time = (czm_frameNumber / 60.0);
        float dis = distance(st, vec2(0.5));

        alpha = 0.0;

        if(dis <  fract(u_time * 0.5) / 2.0 ) {
          diffuse = color.rgb;
        }

        if(dis <  fract(u_time * 0.5 - 0.5) / 2.0 ) {
          diffuse = color.rgb;
          alpha = dis / fract(u_time * 0.5 - 0.5);
        }

        material.diffuse = diffuse;
        material.alpha = alpha;
        return material;
    }
    `;
    const { id, showDiffusion = true, positions, style, data } = iconPintInfo;
    const instances = [];
    let appearance = null;
    let geometry = null;
    const {
      StyleKey: styleKey,
      fillColor: color,
      fillOpacity: alpha = 1,
      semiMajorAxis,
      semiMinorAxis
    } = style;
    let _color = null;
    _color = Cesium.Color.fromCssColorString(color);
    _color.alpha = alpha;
    const r = this.getLevelResolution(this.getMapsLevel());
    const d1 = semiMajorAxis * r;
    const d2 = semiMinorAxis * r;
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i].positions;
      const _data = positions[i].data;
      geometry = new Cesium.EllipseGeometry({
        center: Cesium.Cartesian3.fromDegrees(...position),
        semiMajorAxis: d1,
        semiMinorAxis: d2
      });
      const instance = new Cesium.GeometryInstance({
        geometry
      });
      instance.data = _data;
      instance._data = data;
      instances.push(instance);
    }
    appearance = new Cesium.EllipsoidSurfaceAppearance({
      material: new Cesium.Material({
        fabric: {
          type: "diffusion",
          uniforms: {
            // color: new Cesium.Color(0.1804, 0.9725, 0.0745, 0.5) // 颜色
            color: _color
            // 颜色
          },
          source: circleSource
        }
      })
    });
    const primitive = new Cesium.Primitive({
      show: showDiffusion,
      geometryInstances: instances,
      appearance,
      compressVertices: true,
      releaseGeometryInstances: false,
      allowPicking: true,
      asynchronous: true
    });
    const scenePrimitive = this.amapAdapter.layerOperations.primitiveCollection.add(primitive);
    scenePrimitive._id = id;
    scenePrimitive.LayerId = id;
    scenePrimitive._styleKey = styleKey;
    scenePrimitive._data = data;
    scenePrimitive._type = "diffusion";
    scenePrimitive._primitiveInfo = iconPintInfo;
    if (!pFlag) {
      this.amapAdapter.layerOperations.multipleIconPoins[id] = [scenePrimitive];
    }
    if (!flag) {
      this.setupCameraChangedListener("myMapCameraChanged", () => {
        flag = true;
        if (Object.keys(this.amapAdapter.layerOperations.multipleIconPoins).length > 0) {
          for (const key in this.amapAdapter.layerOperations.multipleIconPoins) {
            const item = this.amapAdapter.layerOperations.multipleIconPoins[key];
            if (Array.isArray(item)) {
              item.forEach((data2, index) => {
                if (data2 && data2._primitiveInfo) {
                  primitiveInfo = data2._primitiveInfo;
                  primitiveInfo.style.semiMajorAxis = data2._primitiveInfo.style.semiMajorAxis;
                  primitiveInfo.style.semiMinorAxis = data2._primitiveInfo.style.semiMinorAxis;
                  this.amapAdapter.layerOperations.primitiveCollection.remove(
                    data2
                  );
                  this.amapAdapter.layerOperations.multipleIconPoins[key].splice(index, 1);
                  const diffusionPrimitive = this.addPointDiffusion(
                    primitiveInfo,
                    true
                  );
                  this.amapAdapter.layerOperations.multipleIconPoins[key].push(
                    diffusionPrimitive
                  );
                }
              });
            }
          }
        }
      });
    }
    return scenePrimitive;
  }
  /**
   * 移除扩散点
   * @param id 唯一标识
   */
  removePointDiffusion(id) {
    const _layerOperations = this.amapAdapter.layerOperations;
    const iconPoint = _layerOperations.multipleIconPoins[id];
    if (iconPoint) {
      if (Array.isArray(iconPoint)) {
        for (let i = 0; i < iconPoint.length; i++) {
          this.amapAdapter.layerOperations.primitiveCollection.remove(
            iconPoint[i]
          );
        }
      } else {
        this.amapAdapter.layerOperations.primitiveCollection.remove(iconPoint);
      }
      delete _layerOperations.multipleIconPoins[id];
    }
  }
  /**
   * 移除多个扩散图标
   * @param ids id集合
   */
  removeMultiplePointDiffusion(ids) {
    for (let i = 0; i < ids.length; i++) {
      this.removePointDiffusion(ids[i]);
    }
  }
  /**
   * 带标注的图标【三维】
   * @param iconPintInfo
   */
  addPointSeawall(iconPintInfo) {
    const { id, show = true, positions, style, data } = iconPintInfo;
    this.addMultipleLables({
      id,
      show,
      positions,
      style,
      data
    });
    this.addMultipleIconPoint({
      id,
      show,
      positions: positions.map((p) => ({ ...p, positions: p.position })),
      style: { ...style, horizontalOrigin: void 0 },
      data
    });
  }
  /**
   * 移除带标注图标【三维】
   * @param id 唯一标识
   */
  removePointSeawall(id) {
    this.removeMultipleLabels([id]);
    this.removeMultipleIconPoints([id]);
  }
  /**
   * 移除多个带标注图标【三维】
   * @param ids 唯一标识
   */
  removeMultiplePointSeawall(ids) {
    for (let i = 0; i < ids.length; i++) {
      this.removePointSeawall(ids[i]);
    }
  }
  originHandel(verticalOrigin, horizontalOrigin) {
    let _verticalOrigin = null;
    switch (verticalOrigin) {
      case "top":
        _verticalOrigin = Cesium.VerticalOrigin.TOP;
        break;
      case "center":
        _verticalOrigin = Cesium.VerticalOrigin.CENTER;
        break;
      case "baseline":
        _verticalOrigin = Cesium.VerticalOrigin.BASELINE;
        break;
      case "bottom":
        _verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
        break;
      default:
        _verticalOrigin = Cesium.VerticalOrigin.TOP;
        break;
    }
    let _horizontalOrigin = null;
    switch (horizontalOrigin) {
      case "top":
        _horizontalOrigin = Cesium.HorizontalOrigin.TOP;
        break;
      case "center":
        _horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
        break;
      case "baseline":
        _horizontalOrigin = Cesium.HorizontalOrigin.BASELINE;
        break;
      case "bottom":
        _horizontalOrigin = Cesium.HorizontalOrigin.BOTTOM;
        break;
      case "right":
        _horizontalOrigin = Cesium.HorizontalOrigin.RIGHT;
        break;
      case "left":
        _horizontalOrigin = Cesium.HorizontalOrigin.LEFT;
        break;
      default:
        _horizontalOrigin = Cesium.HorizontalOrigin.LEFT;
        break;
    }
    return {
      vertical: _verticalOrigin,
      horizontal: _horizontalOrigin
    };
  }
  /**
   * 移除图标点
   * @param id 图标点唯一标识
   */
  removeIconPoint(id) {
    const iconPointCollection = this.amapAdapter.layerOperations.iconPointCollection;
    const _layerOperations = this.amapAdapter.layerOperations;
    const iconPoint = _layerOperations.multipleIconPoins[id];
    if (iconPoint) {
      if (Array.isArray(iconPoint)) {
        for (let i = 0; i < iconPoint.length; i++) {
          iconPointCollection.remove(iconPoint[i]);
          this.amapAdapter.layerOperations.primitiveCollection.remove(
            iconPoint[i]
          );
        }
      } else {
        iconPointCollection.remove(iconPoint);
        this.amapAdapter.layerOperations.primitiveCollection.remove(iconPoint);
      }
      delete _layerOperations.multipleIconPoins[id];
    }
  }
  /**
   * 移除多个图标点
   * @param id 图标点唯一标识集合
   */
  removeMultipleIconPoints(ids) {
    for (let i = 0; i < ids.length; i++) {
      this.removeIconPoint(ids[i]);
    }
  }
  /**
   * 移除全部图标点
   */
  removeAllIconPoints() {
    const multipleIconPoins = this.amapAdapter.layerOperations.multipleIconPoins;
    for (const key in multipleIconPoins) {
      this.removeIconPoint(key);
    }
  }
  /**
   * 移除全部图形 【点、线、多边形、动态实体对象】
   */
  removeAllGraphics() {
    this.removeAllPoints();
    this.removeAllPolylines();
    this.removeAllPolygons();
    this.removeAllIconPoints();
    this.removeAllDynamicIcon();
    clearInterval(this.animationFrameInterVal);
    cancelAnimationFrame(this.animationFrameInterVal);
    this.animationFrameInterVal = null;
  }
  /**
   * 设置图形层次顺序 （设置成功了，但是pick到的图层还是之前的）
   * @param id 图形的唯一标识
   * @param order 要移动到的层级
   */
  setGraphicsOrder(id, order) {
    const primitives = this.amapAdapter.layerOperations.primitiveCollection;
    const primitive = this.amapAdapter.layerOperations.multiplePolygon[id] || this.amapAdapter.layerOperations.multiplePolyline[id];
    const index = primitives._primitives.indexOf(primitive);
    if (index !== -1) {
      if (order === "top") {
        primitives.raiseToTop(primitive);
      } else if (order === "bottom") {
        primitives.lowerToBottom(primitive);
      } else if (typeof order === "number") {
        const total = primitives._primitives.length;
        if (order > 0 && order < total) {
          primitives._primitives.splice(index, 1);
          primitives._primitives.splice(order, 0, primitive);
        }
        if (order >= total) {
          primitives.raiseToTop(primitive);
        }
        if (order <= 0) {
          primitives.lowerToBottom(primitive);
        }
      }
    }
  }
  /**
   * 移除全部在地图上显示的内容 【点、线、多边形、文字、瓦片...】
   */
  clearAllMapPrimitive() {
    this.removeAllGraphics();
    this.removeAllWmsLayers();
    this.removeAllLabels();
    this.removeAllBalloons();
    clearInterval(this.animationFrameInterVal);
    cancelAnimationFrame(this.animationFrameInterVal);
    this.animationFrameInterVal = null;
  }
  /**
   * 变化多边形颜色 需要配合 addMultiplePolygons 方法 使用
   * @param id 添加多个多边形时候的最外层父级ID
   * @param sonId 每个多边形的ID
   * @param color 要改变的颜色
   * @param alpha 透明度
   */
  changeMultiplePolygonColor(id, sonId, color, alpha = 1) {
    let primitive = null;
    if (typeof id === "string") {
      primitive = this.amapAdapter.layerOperations.multiplePolygon[id];
    } else {
      primitive = id;
    }
    if (primitive) {
      const attributes = primitive.getGeometryInstanceAttributes(sonId);
      if (!attributes) {
        return;
      }
      let _color = color;
      if (typeof color === "string" && alpha !== void 0) {
        _color = Cesium.Color.fromCssColorString(color);
        _color.alpha = alpha;
        attributes.color = Cesium.ColorGeometryInstanceAttribute.fromColor(_color).value;
        attributes.color.alpha = alpha;
        return;
      }
      attributes.color = color;
    }
  }
  /**
   * 变化单个线段颜色
   * @param id ID
   * @param color 要改变的颜色
   * @param alpha 透明度
   */
  changePolylineColor(id, color, alpha) {
    const primitive = this.amapAdapter.layerOperations.multiplePolyline[id];
    if (primitive && color) {
      const _color = Cesium.Color.fromCssColorString(color);
      _color.alpha = alpha != void 0 ? alpha : 1;
      if (primitive.appearance.material && primitive.appearance.material.uniforms) {
        primitive.appearance.material.uniforms.color = _color;
      }
    }
  }
  /**
   * 南沙项目内涝播放方法 【可以用于别的】
   * @param obj 处理好的数据格式 ins pos type
   * @param id 唯一标识 也可以是下标
   * @param isShow 是否显示
   * @returns 绘制成功的图元
   */
  addEspeciallyPolygons(obj, id, isShow) {
    let instance = null;
    let color = null;
    const instances = [];
    for (let i = 0; i < obj.ts.length; i++) {
      const tmp = {};
      tmp.position = new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.DOUBLE,
        componentsPerAttribute: 3,
        normalize: true,
        values: obj.ts[i].pos
      });
      const geometry = new Cesium.Geometry({
        attributes: new Cesium.GeometryAttributes(tmp),
        indices: obj.ts[i].ins,
        primitiveType: Cesium.PrimitiveType.TRIANGLES,
        vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
        boundingSphere: Cesium.BoundingSphere.fromVertices(obj.ts[i].pos)
      });
      color = Cesium.Color.fromCssColorString(obj.ts[i].color);
      color.alpha = obj.ts[i].color === "#000000" ? 0 : 0.8;
      instance = new Cesium.GeometryInstance({
        id,
        geometry,
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(color),
          show: new Cesium.ShowGeometryInstanceAttribute(true)
          //显示或者隐藏
        }
      });
      instances.push(instance);
    }
    const appearance = new Cesium.PerInstanceColorAppearance({
      flat: true
    });
    const gTrianglesY100t2 = this.viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances: instances,
        appearance,
        compressVertices: true,
        releaseGeometryInstances: true,
        allowPicking: true,
        classificationType: Cesium.ClassificationType.TERRAIN,
        show: isShow,
        asynchronous: true
      })
    );
    if (obj.levelData) {
      this.amapAdapter.layerOperations.flowEspeciallyPolygon[id] = gTrianglesY100t2;
    } else {
      this.amapAdapter.layerOperations.especiallyPolygon[id] = gTrianglesY100t2;
    }
    this.amapAdapter.layerOperations.especiallyPolygonShow = gTrianglesY100t2;
    this.amapAdapter.layerOperations.allEspeciallyPolygon.push(
      gTrianglesY100t2
    );
    return gTrianglesY100t2;
  }
  /**
   * 切换 addEspeciallyPolygons 生成数据的颜色
   * @param pIndex 要变化颜色数据下标 或者 ID唯一标识
   */
  changeEspeciallyPolygons(pIndex, levelData = false) {
    const _especiallyPolygon = this.amapAdapter.layerOperations.especiallyPolygon;
    const flowEspeciallyPolygon = this.amapAdapter.layerOperations.flowEspeciallyPolygon;
    const errorObj = {
      pIndex,
      data: null,
      msg: "error"
    };
    if (levelData) {
      if (!this.amapAdapter.layerOperations.flowEspeciallyPolygon[pIndex]) {
        return errorObj;
      }
    } else {
      if (!this.amapAdapter.layerOperations.especiallyPolygon[pIndex]) {
        return errorObj;
      }
    }
    if (levelData) {
      if (this.amapAdapter.layerOperations.especiallyPolygonShow && flowEspeciallyPolygon && flowEspeciallyPolygon.length > 0 && pIndex >= 0 && pIndex < flowEspeciallyPolygon.length) {
        this.amapAdapter.layerOperations.especiallyPolygonShow.show = false;
        this.amapAdapter.layerOperations.especiallyPolygonShow = this.amapAdapter.layerOperations.flowEspeciallyPolygon[pIndex];
        this.amapAdapter.layerOperations.especiallyPolygonShow.show = true;
      }
    } else {
      if (this.amapAdapter.layerOperations.especiallyPolygonShow && _especiallyPolygon && _especiallyPolygon.length > 0 && pIndex >= 0 && pIndex < _especiallyPolygon.length) {
        this.amapAdapter.layerOperations.especiallyPolygonShow.show = false;
        this.amapAdapter.layerOperations.especiallyPolygonShow = this.amapAdapter.layerOperations.especiallyPolygon[pIndex];
        this.amapAdapter.layerOperations.especiallyPolygonShow.show = true;
      }
    }
  }
  // 隐藏全部内涝图形
  hideAllEspeciallyPolygons() {
    if (this.amapAdapter.layerOperations.allEspeciallyPolygon.length && this.amapAdapter.layerOperations.especiallyPolygon.length && this.amapAdapter.layerOperations.especiallyPolygonShow) {
      this.amapAdapter.layerOperations.allEspeciallyPolygon.forEach(
        (polygon) => {
          polygon.show = false;
        }
      );
      this.amapAdapter.layerOperations.especiallyPolygonShow.show = false;
      for (let i = 0; i < this.amapAdapter.layerOperations.especiallyPolygon.length; i++) {
        this.amapAdapter.layerOperations.especiallyPolygon[i].show = false;
      }
    }
  }
  /**
   * 移除 addEspeciallyPolygons 方法生成的图元
   */
  removeEspeciallyPolygons() {
    if (this.amapAdapter.layerOperations.especiallyPolygon && this.amapAdapter.layerOperations.allEspeciallyPolygon) {
      for (let i = 0; i < this.amapAdapter.layerOperations.especiallyPolygon.length; i++) {
        this.viewer.scene.primitives.remove(
          this.amapAdapter.layerOperations.especiallyPolygon[i]
        );
      }
      this.amapAdapter.layerOperations.allEspeciallyPolygon.forEach(
        (polygon) => {
          this.viewer.scene.primitives.remove(polygon);
        }
      );
      this.amapAdapter.layerOperations.especiallyPolygon.length = 0;
      this.amapAdapter.layerOperations.allEspeciallyPolygon = [];
    }
    this.viewer.scene.primitives.remove(
      this.amapAdapter.layerOperations.especiallyPolygonShow
    );
    this.amapAdapter.layerOperations.especiallyPolygonShow = null;
  }
  /**
   * 新水位流向箭头数据
   * @param fObj 处理好的数据格式 color pos【笛卡尔坐标】
   * @param index 唯一标识
   * @param isShow 是否显示
   * @returns 绘制成功的图元
   */
  // addFlowArrowLine(vao: any, index: string | number, isshow: boolean) {
  //   const instances = [];
  //   instances.push(createInstance(vao, index));
  //   if (!this.arrowAppearance) {
  //     this.arrowAppearance = createAppearance(this);
  //   }
  //   const arrow_vao = this.viewer.scene.primitives.add(
  //     new Cesium.Primitive({
  //       geometryInstances: instances,
  //       appearance: this.arrowAppearance,
  //       compressVertices: true,
  //       releaseGeometryInstances: true,
  //       allowPicking: true,
  //       show: isshow,
  //       asynchronous: false
  //     })
  //   );
  //   arrow_vao.testName = 'arrowLine';
  //   this.amapAdapter.layerOperations.flowArrowLineList[index] = arrow_vao;
  //   this.amapAdapter.layerOperations.flowArrowLineShow = arrow_vao;
  //   this.amapAdapter.layerOperations.allFlowArrowLine.push(arrow_vao);
  //   return arrow_vao;
  // }
  /**
   *
   * @param fObj 处理好的数据格式 color pos【笛卡尔坐标】
   * @param index 唯一标识
   * @param isShow 是否显示
   * @returns 绘制成功的图元
   */
  addFlowArrowLine(fObj, index, isShow) {
    let instance = null, color = null;
    const instances = [];
    const tmp = {};
    tmp.position = new Cesium.GeometryAttribute({
      componentDatatype: Cesium.ComponentDatatype.DOUBLE,
      componentsPerAttribute: 3,
      normalize: false,
      values: fObj.pos
    });
    if (fObj.color) {
      tmp.color = new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.UNSIGNED_BYTE,
        componentsPerAttribute: 4,
        normalize: true,
        values: fObj.color
      });
    }
    const geometry = new Cesium.Geometry({
      attributes: new Cesium.GeometryAttributes(tmp),
      primitiveType: Cesium.PrimitiveType.LINES,
      vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
      boundingSphere: Cesium.BoundingSphere.fromVertices(fObj.pos)
    });
    color = Cesium.Color.fromCssColorString("#ffffff");
    color.alpha = 1;
    instance = new Cesium.GeometryInstance({
      id: index,
      geometry,
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
      }
    });
    instances.push(instance);
    const appearance = new Cesium.PerInstanceColorAppearance({
      flat: true,
      faceForward: true,
      aboveGround: true,
      translucent: true,
      closed: false
    });
    const arrowLine = this.viewer.scene.primitives.add(
      new Cesium.Primitive({
        show: isShow,
        geometryInstances: instances,
        appearance,
        compressVertices: true,
        releaseGeometryInstances: true,
        allowPicking: false,
        asynchronous: true
      })
    );
    arrowLine.testName = "arrowLine";
    this.amapAdapter.layerOperations.flowArrowLineList[index] = arrowLine;
    this.amapAdapter.layerOperations.flowArrowLineShow = arrowLine;
    this.amapAdapter.layerOperations.allFlowArrowLine.push(arrowLine);
    return arrowLine;
  }
  /**
   * 切换 addFlowArrowLine 生成的箭头数据
   * @param pIndex 切换显示的图元标识
   */
  changeFlowArrowLine(pIndex) {
    const errorObj = {
      pIndex,
      data: null,
      msg: "error"
    };
    if (!this.amapAdapter.layerOperations.flowArrowLineList[pIndex]) {
      return errorObj;
    }
    if (this.amapAdapter.layerOperations.flowArrowLineShow && this.amapAdapter.layerOperations.flowArrowLineList && this.amapAdapter.layerOperations.flowArrowLineList.length > 0 && pIndex >= 0 && pIndex < this.amapAdapter.layerOperations.flowArrowLineList.length) {
      this.amapAdapter.layerOperations.flowArrowLineShow.show = false;
      this.amapAdapter.layerOperations.flowArrowLineShow = this.amapAdapter.layerOperations.flowArrowLineList[pIndex];
      this.amapAdapter.layerOperations.flowArrowLineShow.show = true;
    }
  }
  // 隐藏全部箭头
  hideAllFlowArrowLines() {
    if (this.amapAdapter.layerOperations.flowArrowLineList.length && this.amapAdapter.layerOperations.allFlowArrowLine && this.amapAdapter.layerOperations.flowArrowLineShow)
      this.amapAdapter.layerOperations.allFlowArrowLine.forEach((line) => {
        line.show = false;
      });
    if (this.amapAdapter.layerOperations && this.amapAdapter.layerOperations.flowArrowLineShow) {
      this.amapAdapter.layerOperations.flowArrowLineShow.show = false;
    }
    for (let i = 0; i < this.amapAdapter.layerOperations.flowArrowLineList.length; i++) {
      this.amapAdapter.layerOperations.flowArrowLineList[i].show = false;
    }
  }
  /**
   * 移除 addFlowArrowLine 生成的箭头数据
   */
  removeFlowArrowLines() {
    if (this.amapAdapter.layerOperations.flowArrowLineList && this.amapAdapter.layerOperations.allFlowArrowLine) {
      for (let i = 0; i < this.amapAdapter.layerOperations.flowArrowLineList.length; i++) {
        this.viewer.scene.primitives.remove(
          this.amapAdapter.layerOperations.flowArrowLineList[i]
        );
      }
      this.amapAdapter.layerOperations.allFlowArrowLine.forEach((line) => {
        this.viewer.scene.primitives.remove(line);
      });
      this.amapAdapter.layerOperations.allFlowArrowLine = [];
      this.amapAdapter.layerOperations.flowArrowLineList.length = 0;
    }
    this.amapAdapter.layerOperations.flowArrowLineShow = null;
  }
  /**
   * 修改点样式
   * @param id 文字id
   * @param style 文字样式
   */
  setPointStyle(id, style) {
    const _layerOperations = this.amapAdapter.layerOperations.multiplePoints;
    const point = _layerOperations[id];
    let newStyle = {};
    if (point && style) {
      if (Array.isArray(point)) {
        for (let i = 0; i < point.length; i++) {
          const point2 = _layerOperations[id][i];
          newStyle = this.updataPointParams(point2, style);
        }
      } else {
        newStyle = this.updataPointParams(point, style);
      }
    }
    return newStyle;
  }
  /**
   * 修改图标样式
   * @param id 文字id
   * @param style 文字样式
   */
  setIconPointStyle(id, style, iconServerUrl) {
    const _layerOperations = this.amapAdapter.layerOperations.multipleIconPoins;
    const point = _layerOperations[id];
    let newStyle = {};
    if (point && style) {
      if (Array.isArray(point)) {
        for (let i = 0; i < point.length; i++) {
          const point2 = _layerOperations[id][i];
          newStyle = this.updataIconPointParams(point2, style, iconServerUrl);
        }
      } else {
        newStyle = this.updataIconPointParams(point, style, iconServerUrl);
      }
    }
    return newStyle;
  }
  /**
   * 修改线样式
   * @param id 文字id
   * @param style 文字样式
   */
  setPolylineStyle(id, style) {
    let newStyle = {};
    if (this.amapAdapter.layerOperations.multiplePolyline[id] && this.amapAdapter.layerOperations.multiplePolyline[id]._primitiveInfo) {
      const polylineInfoClone = JSON.parse(
        JSON.stringify(
          this.amapAdapter.layerOperations.multiplePolyline[id]._primitiveInfo
        )
      );
      this.removeMultiplePolylines([id]);
      if (polylineInfoClone && style) {
        const polylineInfo = polylineInfoClone;
        polylineInfo.style = style;
        newStyle = polylineInfo.style;
        this.addMultiplePolylines(polylineInfo);
      }
    }
    return newStyle;
  }
  /**
   * 修改多边形样式
   * @param id 文字id
   * @param style 文字样式
   */
  setPolygonStyle(id, style) {
    let newStyle = {};
    const polygon = this.amapAdapter.layerOperations.multiplePolygon[id];
    if (polygon && style) {
      const {
        StyleKey: styleKey,
        fillVisible: polygonVisibleColor,
        fillColor: color,
        fillOpacity: alpha,
        fillborderVisible: outline,
        fillBorderWidth: outlineWidth,
        fillBorderColor: outlineColor,
        fillBorderOpacity: outlineAlpha
      } = style;
      newStyle = style;
      if (polygon.geometryInstances && Array.isArray(polygon.geometryInstances)) {
        polygon.geometryInstances.forEach((p) => {
          this.changeMultiplePolygonColor(
            id,
            p.id,
            color,
            polygonVisibleColor ? alpha ? alpha : 1 : 0
          );
        });
      }
      if (polygon._outlinePrimitve) {
        if (Array.isArray(polygon._outlinePrimitve)) {
          polygon._outlinePrimitve.forEach((p, i) => {
            if (p && p._primitiveInfo) {
              const polylineInfoClone = JSON.parse(
                JSON.stringify(p._primitiveInfo)
              );
              this.amapAdapter.layerOperations.primitiveCollection.remove(
                polygon._outlinePrimitve[i]
              );
              if (polylineInfoClone) {
                const polylineInfo = polylineInfoClone;
                polylineInfo.style = {
                  ...style,
                  lineWidth: outlineWidth,
                  lineColor: outlineColor,
                  lineOpacity: outline ? outlineAlpha ? outlineAlpha : 0.7 : 0
                };
                polygon._outlinePrimitve = [
                  this.addMultiplePolylines(polylineInfo)
                ];
              }
            }
          });
        }
      }
    }
    return newStyle;
  }
  /**
   * 修改图层样式
   * @param id
   * @param style
   * @param iconServerUrl
   */
  setLayerStyle(id, style, iconServerUrl) {
    let newStyle = {};
    newStyle = { ...newStyle, ...this.setLabelStyle(id, style) };
    newStyle = { ...newStyle, ...this.setPointStyle(id, style) };
    newStyle = {
      ...newStyle,
      ...this.setIconPointStyle(id, style, iconServerUrl)
    };
    newStyle = { ...newStyle, ...this.setPolylineStyle(id, style) };
    newStyle = { ...newStyle, ...this.setPolygonStyle(id, style) };
    return newStyle;
  }
  // 创建地图遮罩
  createMapMask(params) {
    const _amapOperations = this.amapAdapter.layerOperations;
    const { id, position, color = "#0c5188", alpha = 5 } = params;
    const nid = `${id}MapMask`;
    if (_amapOperations.multiplePolygon[nid]) {
      return;
    }
    if (!position.length) {
      return;
    }
    this.addMultiplePolygons({
      id: nid,
      positions: [
        {
          positions: [0, 0, 0, 90, 179, 90, 179, 0],
          id: nid,
          color,
          alpha,
          holes: [position]
        }
      ],
      style: {},
      ground: true
    });
  }
  // 移除遮罩
  removeMapMask(id) {
    this.removePolygon(id);
  }
  /**
   * 更新图层地形高度
   * @param terrainFlag  true 带地形 ， false 不带地形
   */
  updataTerrainHeight(terrainFlag = true) {
    const labelList = [];
    const pointList = [];
    const iconPointList = [];
    const balloonList = [];
    for (const key in this.amapAdapter.balloonOperations.multipleBalloon) {
      const item = this.amapAdapter.balloonOperations.multipleBalloon[key];
      balloonList.push({ ...item._balloonInfo, show: item.show });
    }
    for (const key in this.amapAdapter.graphicsOperations.multipleLabels) {
      const item = this.amapAdapter.graphicsOperations.multipleLabels[key];
      if (item && Array.isArray(item)) {
        labelList.push({ ...item[0]._lableInfo, show: item[0]._show });
      }
    }
    for (const key in this.amapAdapter.layerOperations.multiplePoints) {
      const item = this.amapAdapter.layerOperations.multiplePoints[key];
      if (item && Array.isArray(item)) {
        pointList.push(item[0]._pointInfo);
      }
    }
    for (const key in this.amapAdapter.layerOperations.multipleIconPoins) {
      const item = this.amapAdapter.layerOperations.multipleIconPoins[key];
      if (item && Array.isArray(item)) {
        iconPointList.push(item[0]._iconPintInfo);
      } else {
        iconPointList.push({
          show: item.show,
          ...item._iconPintInfo,
          positions: [
            {
              data: item._iconPintInfo.data,
              positions: item._iconPintInfo.position || []
            }
          ]
        });
      }
    }
    this.removeAllIconPoints();
    this.removeMultipleLabels(labelList.map((v) => v.id));
    this.removeMultipleBalloons(balloonList.map((v) => v.id));
    this.removeAllPoints();
    balloonList.forEach((item) => {
      if (item && item.position) {
        this.addBalloon({
          ...item,
          positionTerrain: item.position,
          position: !terrainFlag ? [item.position[0], item.position[1], 3] : item.positionTerrain ? item.positionTerrain : item.position
        });
      }
    });
    labelList.forEach((item) => {
      if (item && item.positions) {
        this.addMultipleLables({
          ...item,
          positions: item.positions.map((p) => {
            const curPos = !terrainFlag ? [p.position[0], p.position[1], 3] : p.positionTerrain ? p.positionTerrain : p.position;
            return {
              ...p,
              position: curPos,
              positionTerrain: p.position
            };
          })
        });
      }
    });
    pointList.forEach((item) => {
      if (item && item.positions) {
        this.addMultiplePoints({
          ...item,
          positions: item.positions.map((p) => {
            const curPos = !terrainFlag ? [p.positions[0], p.positions[1], 3] : p.positionTerrain ? p.positionTerrain : p.positions;
            return {
              ...p,
              positions: curPos,
              positionTerrain: p.positions
            };
          })
        });
      }
    });
    iconPointList.forEach((item) => {
      if (item && item.positions) {
        this.addMultipleIconPoint({
          ...item,
          positions: item.positions.map((p) => {
            const curPos = !terrainFlag ? [p.positions[0], p.positions[1], 3] : p.positionTerrain ? p.positionTerrain : p.positions;
            return {
              ...p,
              positions: curPos,
              positionTerrain: p.positions
            };
          })
        });
      }
    });
  }
  /**
   * 添加文字
   * @param lableInfo 对应cesium文档 LabelCollection方法
   * @returns 添加成功的文字对象
   */
  addLable(lableInfo, layerOpter) {
    const labelCollection = this.amapAdapter.layerOperations.labelCollection;
    const _multipleLabels = this.amapAdapter.graphicsOperations.multipleLabels;
    const { id, show = true, position, style, data } = lableInfo;
    if (_multipleLabels[id]) {
      return;
    }
    const {
      StyleKey: styleKey,
      // font = 'bold 14px 微软雅黑',
      fontSize = 14,
      fontFamily = "微软雅黑",
      fontBold = true,
      // fontUnderline = false,
      // fontItalic = false,
      // fontAngle = 0,
      fontOffsetX: offsetX,
      fontOffsetY: offsetY,
      fontPandding = [10, 10],
      fontBackground = false,
      fontBackgroundColor,
      fontBackgroundOpacity = 0.5,
      fontColor: color = "#ffffff",
      fontOpacity: alpha = 1,
      fontBorderVisible: outline = true,
      fontBorderColor: outlineColor = "#000000",
      fontborderWidth: outlineWidth = 0,
      fontHorizontalOrigin: horizontalOrigin,
      fontVerticalOrigin: verticalOrigin,
      // fontDistanceDisplayCondition: distanceDisplayCondition = style.fontDistanceDisplayCondition ? style.fontDistanceDisplayCondition : [1, Number.POSITIVE_INFINITY]
      fontDistanceDisplayCondition: distanceDisplayCondition = [
        1,
        Number.POSITIVE_INFINITY
      ],
      fontDisableDepthTestDistance: disableDepthTestDistance = Number.POSITIVE_INFINITY,
      fontScaleByDistance = void 0
    } = style;
    const font = `${fontBold ? "bold" : "normal"} ${fontSize}px ${fontFamily}`;
    const pandding = fontPandding.length ? fontPandding : [10, 10];
    const { vertical, horizontal } = this.originHandelGraphics(
      verticalOrigin,
      horizontalOrigin
    );
    const _verticalOrigin = vertical;
    const _horizontalOrigin = horizontal;
    const _color = Cesium.Color.fromCssColorString(color);
    _color.alpha = alpha;
    let _outlineColor = null;
    if (outline) {
      _outlineColor = Cesium.Color.fromCssColorString(outlineColor);
      _outlineColor.alpha = alpha;
    }
    let _fontBackgroundColor = null;
    if (fontBackground) {
      _fontBackgroundColor = Cesium.Color.fromCssColorString(fontBackgroundColor);
      _fontBackgroundColor.alpha = fontBackgroundOpacity;
    }
    let _fontScaleByDistance = {};
    if (Array.isArray(fontScaleByDistance) && fontScaleByDistance.length) {
      _fontScaleByDistance = {
        pixelOffsetScaleByDistance: new Cesium.NearFarScalar(
          ...fontScaleByDistance
        ),
        scaleByDistance: new Cesium.NearFarScalar(...fontScaleByDistance)
      };
    }
    const label = labelCollection.add({
      id,
      show,
      position: Cesium.Cartesian3.fromDegrees(...position.position),
      text: position.text,
      font,
      fillColor: _color,
      outlineColor: _outlineColor,
      outlineWidth,
      showBackground: fontBackground,
      pixelOffset: new Cesium.Cartesian2(offsetX, offsetY),
      horizontalOrigin: _horizontalOrigin,
      verticalOrigin: _verticalOrigin,
      backgroundPadding: new Cesium.Cartesian2(...pandding),
      backgroundColor: _fontBackgroundColor,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        ...distanceDisplayCondition
      ),
      disableDepthTestDistance,
      // eyeOffset: new Cesium.Cartesian3(0, 0, -10000),
      ..._fontScaleByDistance,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      // 设置文字相对于地面的高度
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      translucencyByDistance: void 0
    });
    label._id = id;
    label._styleKey = styleKey;
    label._data = data;
    !layerOpter && (_multipleLabels[id] = label);
    return label;
  }
  /**
   * 添加多个文字
   * @param baseInfo 对应cesium文档 LabelCollection方法
   * @param lableInfo 【显示文字、显示位置】
   * @returns 添加成功的文字对象
   */
  addMultipleLables(lableInfo) {
    const labelCollection = this.amapAdapter.layerOperations.labelCollection;
    const _multipleLabels = this.amapAdapter.graphicsOperations.multipleLabels;
    const labelList = [];
    const { id, show = true, positions, style, data } = lableInfo;
    if (_multipleLabels[id]) {
      return;
    }
    const {
      StyleKey: styleKey,
      // font = 'bold 14px 微软雅 黑',
      fontSize = 14,
      fontFamily = "微软雅黑",
      fontBold = true,
      fontUnderline = false,
      fontItalic = false,
      // fontAngle = 0,
      fontOffsetX: offsetX,
      fontOffsetY: offsetY,
      fontPandding = [10, 10],
      fontBackground = false,
      fontBackgroundColor,
      fontBackgroundOpacity = 0.5,
      fontColor: color = "#ffffff",
      fontOpacity: alpha = 1,
      fontBorderVisible: outline = true,
      fontBorderColor: outlineColor = "#000000",
      fontborderWidth: outlineWidth = 0,
      fontHorizontalOrigin: horizontalOrigin,
      fontVerticalOrigin: verticalOrigin,
      fontDistanceDisplayCondition: distanceDisplayCondition = [],
      // fontDistanceDisplayCondition: distanceDisplayCondition,
      fontDisableDepthTestDistance: disableDepthTestDistance = Number.POSITIVE_INFINITY,
      fontEyeOffset: eyeOffset,
      fontScaleByDistance = void 0
    } = style;
    let _fontScaleByDistance = {};
    if (Array.isArray(fontScaleByDistance) && fontScaleByDistance.length) {
      _fontScaleByDistance = {
        pixelOffsetScaleByDistance: new Cesium.NearFarScalar(
          ...fontScaleByDistance
        ),
        scaleByDistance: new Cesium.NearFarScalar(...fontScaleByDistance)
      };
    }
    const font = `${fontBold ? "bold" : ""} ${fontItalic ? "italic" : ""} ${fontUnderline ? "underline" : ""} ${fontSize}px ${fontFamily}`;
    const pandding = fontPandding.length ? fontPandding : [10, 10];
    const { vertical, horizontal } = this.originHandelGraphics(
      verticalOrigin,
      horizontalOrigin
    );
    const _verticalOrigin = vertical;
    const _horizontalOrigin = horizontal;
    const _color = Cesium.Color.fromCssColorString(color);
    _color.alpha = alpha;
    let _distanceDisplayCondition = distanceDisplayCondition;
    let _outlineColor = null;
    if (outline) {
      _outlineColor = Cesium.Color.fromCssColorString(outlineColor);
      _outlineColor.alpha = alpha;
    }
    let _fontBackgroundColor = null;
    if (fontBackground) {
      _fontBackgroundColor = Cesium.Color.fromCssColorString(fontBackgroundColor);
      _fontBackgroundColor.alpha = fontBackgroundOpacity;
    }
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i].position;
      const text = positions[i].text;
      const _data = positions[i].data ?? data;
      if (positions[i].properties != void 0) {
        if (positions[i].properties.MapLevel != void 0) {
          const distanc = this.mapsLevelToHeight(
            positions[i].properties.MapLevel
          );
          if (_distanceDisplayCondition.length) {
            let maxShowLevel = _distanceDisplayCondition[0];
            let minShowLevel = _distanceDisplayCondition[1];
            _distanceDisplayCondition = [
              maxShowLevel,
              distanc >= minShowLevel ? minShowLevel : distanc
            ];
          } else {
            _distanceDisplayCondition = [0, distanc];
          }
        }
      }
      if (!_distanceDisplayCondition.length) {
        _distanceDisplayCondition = [0, Number.POSITIVE_INFINITY];
      }
      const label = labelCollection.add({
        id,
        show,
        position: Cesium.Cartesian3.fromDegrees(...position),
        text,
        font,
        fillColor: _color,
        outlineColor: _outlineColor,
        outlineWidth,
        pixelOffset: new Cesium.Cartesian2(offsetX, offsetY),
        horizontalOrigin: _horizontalOrigin,
        verticalOrigin: _verticalOrigin,
        showBackground: fontBackground,
        backgroundPadding: new Cesium.Cartesian2(...pandding),
        backgroundColor: _fontBackgroundColor,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          ..._distanceDisplayCondition
        ),
        disableDepthTestDistance,
        eyeOffset: eyeOffset ? new Cesium.Cartesian3(0, 0, -1e4) : null,
        heightReference: Cesium.HeightReference.NONE,
        // 设置文字相对于地面的高度
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        ..._fontScaleByDistance,
        translucencyByDistance: void 0
      });
      label._id = id;
      label._styleKey = styleKey;
      label._data = _data;
      label._lableInfo = lableInfo;
      labelList.push(label);
      _distanceDisplayCondition = distanceDisplayCondition;
    }
    _multipleLabels[id] = labelList;
    return labelList;
  }
  /**
   * 移除文字
   * @param id 文字对象唯一标识
   */
  removeLabel(id) {
    const labelCollection = this.amapAdapter.layerOperations.labelCollection;
    const _multipleLabels = this.amapAdapter.graphicsOperations.multipleLabels;
    const label = _multipleLabels[id];
    if (label) {
      if (Array.isArray(label)) {
        for (let i = 0; i < label.length; i++) {
          labelCollection.remove(label[i]);
        }
      } else {
        labelCollection.remove(label);
      }
      delete _multipleLabels[id];
    }
  }
  /**
   * 移除多个文字
   * @param ids 文字对象唯一标识集合
   */
  removeMultipleLabels(ids) {
    for (let i = 0; i < ids.length; i++) {
      this.removeLabel(ids[i]);
    }
  }
  /**
   * 移除全部文字
   */
  removeAllLabels() {
    const _multipleLabels = this.amapAdapter.graphicsOperations.multipleLabels;
    for (const key in _multipleLabels) {
      this.removeLabel(key);
    }
  }
  /**
   * 显示文字
   * @param id 文字唯一标识
   */
  showLabel(id) {
    const _multipleLabels = this.amapAdapter.graphicsOperations.multipleLabels;
    const label = _multipleLabels[id];
    if (label) {
      if (Array.isArray(label)) {
        for (let i = 0; i < label.length; i++) {
          label[i].show = true;
        }
      } else {
        label.show = true;
      }
    }
  }
  /**
   * 显示图形 【点、线、多边形】
   */
  showGraphics(id) {
    const point = this.amapAdapter.layerOperations.multiplePoints[id];
    const polyline = this.amapAdapter.layerOperations.multiplePolyline[id];
    const polygon = this.amapAdapter.layerOperations.multiplePolygon[id];
    const iconPoint = this.amapAdapter.layerOperations.multipleIconPoins[id];
    if (!point && !iconPoint && !polyline && !polygon) {
      return;
    }
    if (point) {
      if (Array.isArray(point)) {
        for (let i = 0; i < point.length; i++) {
          point[i].show = true;
        }
      } else {
        point.show = true;
      }
    }
    if (iconPoint) {
      if (Array.isArray(iconPoint)) {
        for (let i = 0; i < iconPoint.length; i++) {
          iconPoint[i].show = true;
        }
      } else {
        iconPoint.show = true;
      }
    }
    if (polyline) {
      polyline.show = true;
    }
    if (polygon) {
      polygon.show = true;
      if (polygon._outline) {
        const polyline2 = this.amapAdapter.layerOperations.multiplePolyline[id];
        polyline2.show = true;
      }
      if (polygon._outlinePrimitve) {
        for (let i = 0; i < polygon._outlinePrimitve.length; i++) {
          const outline = polygon._outlinePrimitve[i];
          outline.show = true;
        }
      }
    }
  }
  /**
   * 隐藏图形 【点、线、多边形】
   */
  hideGraphics(id) {
    const point = this.amapAdapter.layerOperations.multiplePoints[id];
    const polyline = this.amapAdapter.layerOperations.multiplePolyline[id];
    const polygon = this.amapAdapter.layerOperations.multiplePolygon[id];
    const iconPoint = this.amapAdapter.layerOperations.multipleIconPoins[id];
    if (!point && !iconPoint && !polyline && !polygon) {
      return;
    }
    if (point) {
      if (Array.isArray(point)) {
        for (let i = 0; i < point.length; i++) {
          point[i].show = false;
        }
      } else {
        point.show = false;
      }
    }
    if (iconPoint) {
      if (Array.isArray(iconPoint)) {
        for (let i = 0; i < iconPoint.length; i++) {
          iconPoint[i].show = false;
        }
      } else {
        iconPoint.show = false;
      }
    }
    if (polyline) {
      polyline.show = false;
    }
    if (polygon) {
      polygon.show = false;
      if (polygon._outline) {
        const polyline2 = this.amapAdapter.layerOperations.multiplePolyline[id];
        polyline2.show = false;
      }
      if (polygon._outlinePrimitve) {
        for (let i = 0; i < polygon._outlinePrimitve.length; i++) {
          const outline = polygon._outlinePrimitve[i];
          outline.show = false;
        }
      }
    }
  }
  /**
   * 显示全部隐藏图形 【点、线、多边形】
   */
  showAllGraphics() {
    const pointMap = this.amapAdapter.layerOperations.multiplePoints;
    const polylineMap = this.amapAdapter.layerOperations.multiplePolyline;
    const polygonMap = this.amapAdapter.layerOperations.multiplePolygon;
    const iconPointMap = this.amapAdapter.layerOperations.multipleIconPoins;
    for (const key in pointMap) {
      const point = pointMap[key];
      if (point) {
        if (Array.isArray(point)) {
          for (let i = 0; i < point.length; i++) {
            point[i].show = true;
          }
        } else {
          point.show = true;
        }
      }
    }
    for (const key in iconPointMap) {
      const iconPoint = iconPointMap[key];
      if (iconPoint) {
        if (Array.isArray(iconPoint)) {
          for (let i = 0; i < iconPoint.length; i++) {
            iconPoint[i].show = true;
          }
        } else {
          iconPoint.show = true;
        }
      }
    }
    for (const key in polylineMap) {
      const polyline = polylineMap[key];
      if (polyline) {
        polyline.show = true;
      }
    }
    for (const key in polygonMap) {
      const polygon = polygonMap[key];
      if (polygon) {
        polygon.show = true;
        if (polygon._outline) {
          const polyline = this.amapAdapter.layerOperations.multiplePolyline[key];
          polyline.show = true;
        }
        if (polygon._outlinePrimitve) {
          for (let i = 0; i < polygon._outlinePrimitve.length; i++) {
            const outline = polygon._outlinePrimitve[i];
            outline.show = true;
          }
        }
      }
    }
  }
  /**
   * 隐藏全部显示图形 【点、线、多边形】
   */
  hideAllGraphics() {
    const pointMap = this.amapAdapter.layerOperations.multiplePoints;
    const polylineMap = this.amapAdapter.layerOperations.multiplePolyline;
    const polygonMap = this.amapAdapter.layerOperations.multiplePolygon;
    const iconPointMap = this.amapAdapter.layerOperations.multipleIconPoins;
    for (const key in pointMap) {
      const point = pointMap[key];
      if (point) {
        if (Array.isArray(point)) {
          for (let i = 0; i < point.length; i++) {
            point[i].show = false;
          }
        } else {
          point.show = false;
        }
      }
    }
    for (const key in iconPointMap) {
      const iconPoint = iconPointMap[key];
      if (iconPoint) {
        if (Array.isArray(iconPoint)) {
          for (let i = 0; i < iconPoint.length; i++) {
            iconPoint[i].show = false;
          }
        } else {
          iconPoint.show = false;
        }
      }
    }
    for (const key in polylineMap) {
      const polyline = polylineMap[key];
      if (polyline) {
        polyline.show = false;
      }
    }
    for (const key in polygonMap) {
      const polygon = polygonMap[key];
      if (polygon) {
        polygon.show = false;
        if (polygon._outline) {
          const polyline = this.amapAdapter.layerOperations.multiplePolyline[key];
          polyline.show = false;
        }
        if (polygon._outlinePrimitve) {
          for (let i = 0; i < polygon._outlinePrimitve.length; i++) {
            const outline = polygon._outlinePrimitve[i];
            outline.show = false;
          }
        }
      }
    }
  }
  /**
   * 隐藏文字
   * @param id 文字唯一标识
   */
  hideLabel(id) {
    const _multipleLabels = this.amapAdapter.graphicsOperations.multipleLabels;
    const label = _multipleLabels[id];
    if (label) {
      if (Array.isArray(label)) {
        for (let i = 0; i < label.length; i++) {
          label[i].show = false;
        }
      } else {
        label.show = false;
      }
    }
  }
  originHandelGraphics(verticalOrigin, horizontalOrigin) {
    let _verticalOrigin = null;
    switch (verticalOrigin) {
      case "top":
        _verticalOrigin = Cesium.VerticalOrigin.TOP;
        break;
      case "center":
        _verticalOrigin = Cesium.VerticalOrigin.CENTER;
        break;
      case "baseline":
        _verticalOrigin = Cesium.VerticalOrigin.BASELINE;
        break;
      case "bottom":
        _verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
        break;
      default:
        _verticalOrigin = Cesium.VerticalOrigin.TOP;
        break;
    }
    let _horizontalOrigin = null;
    switch (horizontalOrigin) {
      case "top":
        _horizontalOrigin = Cesium.HorizontalOrigin.TOP;
        break;
      case "center":
        _horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
        break;
      case "baseline":
        _horizontalOrigin = Cesium.HorizontalOrigin.BASELINE;
        break;
      case "bottom":
        _horizontalOrigin = Cesium.HorizontalOrigin.BOTTOM;
        break;
      case "right":
        _horizontalOrigin = Cesium.HorizontalOrigin.RIGHT;
        break;
      case "left":
        _horizontalOrigin = Cesium.HorizontalOrigin.LEFT;
        break;
      default:
        _horizontalOrigin = Cesium.HorizontalOrigin.TOP;
        break;
    }
    return {
      vertical: _verticalOrigin,
      horizontal: _horizontalOrigin
    };
  }
  /**
   * 修改文字样式
   * @param id 文字id
   * @param style 文字样式
   */
  setLabelStyle(id, style) {
    const _layerOperations = this.amapAdapter.graphicsOperations.multipleLabels;
    const label = _layerOperations[id];
    let newStyle = {};
    if (label && style) {
      if (Array.isArray(label)) {
        for (let i = 0; i < label.length; i++) {
          const label2 = _layerOperations[id][i];
          newStyle = this.updataLabelParams(label2, style);
        }
      } else {
        newStyle = this.updataLabelParams(label, style);
      }
    }
    return newStyle;
  }
  updataLabelParams(label, style) {
    let newStyle = {};
    const {
      StyleKey: styleKey,
      fontSize = 14,
      fontFamily,
      fontBold = true,
      fontItalic = false,
      fontUnderline = false,
      fontPandding = [10, 10],
      fontBackground = false,
      fontBackgroundColor,
      fontBackgroundOpacity = 0.5,
      fontColor: color = "#ffffff",
      fontOpacity: alpha = 1,
      fontBorderVisible: outline = true,
      fontBorderColor: outlineColor = "#000000",
      fontborderWidth: outlineWidth = 0,
      // fontOffsetX: offsetX,
      // fontOffsetY: offsetY,
      // fontHorizontalOrigin: horizontalOrigin,
      // fontVerticalOrigin: verticalOrigin,
      fontDistanceDisplayCondition: distanceDisplayCondition,
      fontEyeOffset: eyeOffset
    } = style;
    const ailgnStyle = this.getLabelAilgnMent(style);
    const {
      fontOffsetX: offsetX,
      fontOffsetY: offsetY,
      fontHorizontalOrigin: horizontalOrigin,
      fontVerticalOrigin: verticalOrigin
    } = ailgnStyle;
    newStyle = { ...style, ...ailgnStyle };
    const font = `${fontBold ? "bold" : ""} ${fontItalic ? "italic" : ""} ${fontUnderline ? "underline" : ""} ${fontSize}px ${fontFamily}`;
    const pandding = fontPandding.length ? fontPandding : [10, 10];
    const { vertical, horizontal } = this.originHandelGraphics(
      verticalOrigin,
      horizontalOrigin
    );
    const _color = Cesium.Color.fromCssColorString(color);
    _color.alpha = alpha;
    const _distanceDisplayCondition = distanceDisplayCondition ? distanceDisplayCondition : [1, Number.POSITIVE_INFINITY];
    let _outlineColor = null;
    if (outline) {
      _outlineColor = Cesium.Color.fromCssColorString(outlineColor);
      _outlineColor.alpha = alpha;
    }
    let _fontBackgroundColor = null;
    if (fontBackground) {
      _fontBackgroundColor = Cesium.Color.fromCssColorString(fontBackgroundColor);
      _fontBackgroundColor.alpha = fontBackgroundOpacity;
    }
    label.font = font;
    label.fillColor = _color;
    label.outlineColor = _outlineColor;
    label.outlineWidth = outlineWidth;
    label.pixelOffset = new Cesium.Cartesian2(offsetX, offsetY);
    label.horizontalOrigin = horizontal;
    label.verticalOrigin = vertical;
    label.showBackground = fontBackground;
    label.backgroundPadding = new Cesium.Cartesian2(...pandding);
    label.backgroundColor = _fontBackgroundColor;
    label.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(
      ..._distanceDisplayCondition
    );
    label.eyeOffset = eyeOffset ? new Cesium.Cartesian3(0, 0, -1e4) : null;
    return newStyle;
  }
  updataPointParams(point, style) {
    const {
      StyleKey: styleKey,
      pointType: type = "circle",
      // 点类型 square方 circle圆
      pointSize: pixelSize,
      pointColor: color,
      pointOpacity: alpha = 1,
      pointBorderVisible: outline = false,
      pointBorderColor: outlineColor = "#ffffff",
      pointBorderWidth: outlineWidth,
      pointBorderOpacity: outlineAlpha = 1,
      clampToGround = true,
      disableDepthTestDistance = Number.POSITIVE_INFINITY
    } = style;
    const _color = Cesium.Color.fromCssColorString(color);
    _color.alpha = alpha;
    let _outlineColor = void 0;
    if (outline) {
      _outlineColor = Cesium.Color.fromCssColorString(outlineColor);
      _outlineColor.alpha = outlineAlpha;
    }
    point.pixelSize = pixelSize;
    point.color = _color;
    point.outlineColor = _outlineColor;
    point.outlineWidth = outlineWidth;
    point.clampToGround = clampToGround;
    point.disableDepthTestDistance = disableDepthTestDistance;
    return style;
  }
  /* updataIconPointParams(
      point: any,
      style: IGraphicStyle,
      iconServerUrl?: string
    ) {
      const {
        StyleKey: styleKey,
        iconImage: image,
        iconOpacity: alpha = 1,
        iconWidth: width = 0,
        iconHeight: height = 0,
        iconRtation: rotation = 0,
        iconOffsetX: offsetX = 0,
        iconOffsetY: offsetY = 0,
        verticalOrigin: verticalOrigin,
        horizontalOrigin: horizontalOrigin,
        iconEyeOffset: eyeOffset = [0, 0, -1000],
        iconType,
        iconDistanceDisplayCondition: distanceDisplayCondition = [
          1,
          Number.POSITIVE_INFINITY,
        ],
      } = style;

      const _offsetX = offsetX != undefined ? offsetX : -width / 2;
      const _offsetY = offsetY != undefined ? offsetY : -height / 2;

      const { vertical, horizontal } = this.originHandelGraphics(
        verticalOrigin,
        horizontalOrigin
      );
      const _verticalOrigin = vertical;
      const _horizontalOrigin = horizontal;

      point.image = iconServerUrl ? iconServerUrl + image : image; // 图像地址，URI或Canvas的属性//image: '/img/36lxdt.png',
      point.color = Cesium.Color.WHITE.withAlpha(alpha); // 设置颜色和透明度
      point.width = width;
      point.height = height;
      point.rotation = rotation; // 逆时针旋转
      point.sizeInMeters = false; // 大小是否以米为单位
      point.verticalOrigin = _verticalOrigin; // 相对于坐标的垂直位置
      point.horizontalOrigin = _horizontalOrigin; // 相对于坐标的水平位置
      point.pixelOffset = new Cesium.Cartesian2(_offsetX, _offsetY); // 该属性指定标签在屏幕空间中距此标签原点的像素偏移量
      point.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(
        ...distanceDisplayCondition
      );

      return style;
    } */
  updataIconPointParams(point, style, iconServerUrl) {
    const {
      StyleKey: styleKey,
      iconImage: image,
      iconOpacity: alpha = 1,
      iconWidth: width = 0,
      iconHeight: height = 0,
      iconRtation: rotation = 0,
      iconOffsetX: offsetX = 0,
      iconOffsetY: offsetY = 0,
      verticalOrigin,
      horizontalOrigin,
      iconEyeOffset,
      iconType,
      iconDistanceDisplayCondition: distanceDisplayCondition = [
        1,
        Number.POSITIVE_INFINITY
      ]
    } = style;
    const _offsetX = offsetX != void 0 ? offsetX : -width / 2;
    const _offsetY = offsetY != void 0 ? offsetY : -height / 2;
    const { vertical, horizontal } = this.originHandel(
      verticalOrigin,
      horizontalOrigin
    );
    const _verticalOrigin = vertical;
    const _horizontalOrigin = horizontal;
    if (point) {
      point.image = iconServerUrl ? iconServerUrl + image : image;
      point.color = Cesium.Color.WHITE.withAlpha(alpha);
      point.width = width;
      point.height = height;
      if (iconEyeOffset) {
        point.eyeOffset = new Cesium.Cartesian3(...iconEyeOffset);
      }
      point.rotation = rotation;
      point.sizeInMeters = false;
      point.verticalOrigin = _verticalOrigin;
      point.horizontalOrigin = _horizontalOrigin;
      point.pixelOffset = new Cesium.Cartesian2(_offsetX, _offsetY);
      point.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(
        ...distanceDisplayCondition
      );
    }
    return style;
  }
  getLabelAilgnMent(style) {
    let fontMent = {};
    const {
      StyleKey: styleKey,
      pointType,
      pointSize: pixelSize,
      pointBorderVisible: pointOutline = false,
      pointBorderWidth: pointOutlineWidth,
      fontSize,
      iconWidth,
      iconHeight,
      iconOffsetX,
      iconOffsetY,
      alignMent
    } = style;
    style.fontOffsetX = 0;
    style.fontOffsetY = 0;
    let offsetX = 0;
    let offsetY = 0;
    switch (alignMent) {
      case "left top":
        if (pointType == "circle") {
          if (pixelSize) {
            offsetX = -pixelSize;
            offsetY = -pixelSize / 2;
          }
          if (pixelSize && pointOutline && pointOutlineWidth) {
            offsetX = -pointOutlineWidth + -pixelSize;
            offsetY = (-pointOutlineWidth + -pixelSize) / 2;
          }
        }
        if (pointType == "image") {
          if (iconWidth && iconHeight) {
            offsetX = -iconWidth;
            offsetY = -iconWidth / 2;
          }
          if (iconWidth && iconHeight && iconOffsetX && iconOffsetY) {
            offsetX = -iconWidth + -iconOffsetX;
            offsetY = (-iconWidth + iconOffsetY) / 2 - 10;
          }
        }
        fontMent = {
          fontHorizontalOrigin: "right",
          // 左上
          fontVerticalOrigin: "bottom",
          // 左上
          fontOffsetX: offsetX,
          // 左上 图标与文字间距
          fontOffsetY: offsetY
        };
        break;
      case "left center":
        if (pointType == "circle") {
          if (pixelSize) {
            offsetX = -pixelSize;
            offsetY = 0;
          }
          if (pixelSize && pointOutline && pointOutlineWidth) {
            offsetX = -pointOutlineWidth + -pixelSize + -10;
            offsetY = 0;
          }
        }
        if (pointType == "image") {
          if (iconWidth && iconHeight) {
            offsetX = -iconWidth;
            offsetY = iconHeight;
          }
          if (iconWidth && iconHeight && iconOffsetX && iconOffsetY) {
            offsetX = -iconWidth + -iconOffsetX + -10;
            offsetY = -iconWidth + -iconOffsetX;
          }
        }
        fontMent = {
          fontHorizontalOrigin: "right",
          // 左中
          fontVerticalOrigin: "center",
          // 左中
          fontOffsetX: offsetX,
          // 左中 图标与文字间距
          fontOffsetY: offsetY
          // 左中
        };
        break;
      case "left bottom":
        if (pointType == "circle") {
          if (pixelSize) {
            offsetX = -pixelSize;
            offsetY = pixelSize;
          }
          if (pixelSize && pointOutline && pointOutlineWidth) {
            offsetX = -pointOutlineWidth + -pixelSize;
            offsetY = pointOutlineWidth + pixelSize;
          }
        }
        if (pointType == "image") {
          if (iconWidth && iconHeight) {
            offsetX = -iconWidth;
            offsetY = iconHeight / 2;
          }
          if (iconWidth && iconHeight && iconOffsetX && iconOffsetY) {
            offsetX = -iconWidth + -iconOffsetX;
            offsetY = (iconWidth + iconOffsetX) / 2;
          }
        }
        fontMent = {
          fontHorizontalOrigin: "right",
          // 左下
          fontVerticalOrigin: "top",
          // 左下
          fontOffsetX: offsetX,
          // 左下 图标与文字间距
          fontOffsetY: offsetY
          // 左下
        };
        break;
      case "center top":
        if (pointType == "circle") {
          if (pixelSize) {
            offsetX = 0;
            offsetY = -pixelSize;
          }
          if (pixelSize && pointOutline && pointOutlineWidth) {
            offsetX = 0;
            offsetY = -pointOutlineWidth + -pixelSize;
          }
        }
        if (pointType == "image") {
          if (iconWidth && iconHeight && fontSize) {
            offsetX = 0;
            offsetY = -iconHeight + fontSize;
          }
          if (iconWidth && iconHeight && iconOffsetX && iconOffsetY && fontSize) {
            offsetX = 0;
            offsetY = -(iconHeight + iconOffsetX + fontSize);
          }
        }
        fontMent = {
          fontHorizontalOrigin: "center",
          // 中上
          fontVerticalOrigin: "bottom",
          // 中上
          fontOffsetX: 0,
          // 中上 图标与文字间距
          fontOffsetY: offsetY
          // 中上
        };
        break;
      case "center center":
        if (pointType == "image") {
          if (iconWidth && iconHeight) {
            offsetX = 0;
            offsetY = -iconHeight;
          }
          if (iconWidth && iconHeight && iconOffsetX && iconOffsetY) {
            offsetX = 0;
            offsetY = -(iconHeight + iconOffsetX);
          }
        }
        fontMent = {
          fontHorizontalOrigin: "center",
          // 中中
          fontVerticalOrigin: "center",
          // 中中
          fontOffsetX: 0,
          // 中上 图标与文字间距
          fontOffsetY: offsetY
          // 中上
        };
        break;
      case "center bottom":
        if (pointType == "circle") {
          if (pixelSize) {
            offsetX = 0;
            offsetY = pixelSize;
          }
          if (pixelSize && pointOutline && pointOutlineWidth) {
            offsetX = 0;
            offsetY = (pointOutlineWidth + pixelSize) / 2;
          }
        }
        if (pointType == "image") {
          if (iconWidth && iconHeight) {
            offsetX = 0;
            offsetY = iconHeight;
          }
          if (iconWidth && iconHeight && iconOffsetX && iconOffsetY) {
            offsetX = 0;
            offsetY = (iconHeight + iconOffsetX) / 2;
          }
        }
        fontMent = {
          fontHorizontalOrigin: "center",
          // 中下
          fontVerticalOrigin: "top",
          // 中下
          fontOffsetX: 0,
          // 中上 图标与文字间距
          fontOffsetY: offsetY
          // 中上
        };
        break;
      case "right top":
        if (pointType == "circle") {
          if (pixelSize) {
            offsetX = pixelSize;
            offsetY = -pixelSize / 2;
          }
          if (pixelSize && pointOutline && pointOutlineWidth) {
            offsetX = pointOutlineWidth + pixelSize;
            offsetY = (-pointOutlineWidth + -pixelSize) / 2;
          }
        }
        if (pointType == "image") {
          if (iconWidth && iconHeight && fontSize) {
            offsetX = iconWidth;
            offsetY = -iconHeight + -fontSize;
          }
          if (iconWidth && iconHeight && iconOffsetX && iconOffsetY && fontSize) {
            offsetX = iconHeight + iconOffsetX;
            offsetY = -(iconHeight + iconOffsetX + fontSize);
          }
        }
        fontMent = {
          fontHorizontalOrigin: "left",
          // 右上
          fontVerticalOrigin: "bottom",
          // 右上
          fontOffsetX: offsetX,
          // 左上 图标与文字间距
          fontOffsetY: offsetY
          // 右上
        };
        break;
      case "right center":
        if (pointType == "circle") {
          if (pixelSize) {
            offsetX = pixelSize;
            offsetY = 0;
          }
          if (pixelSize && pointOutline && pointOutlineWidth) {
            offsetX = pointOutlineWidth + pixelSize + 5;
            offsetY = 0;
          }
        }
        if (pointType == "image") {
          if (iconWidth && iconHeight) {
            offsetX = iconWidth + 5;
            offsetY = -(iconHeight / 2);
          }
          if (iconWidth && iconHeight && iconOffsetX && iconOffsetY) {
            offsetX = iconHeight + iconOffsetX + 5;
            offsetY = -(iconHeight / 2);
          }
        }
        fontMent = {
          fontHorizontalOrigin: "left",
          // 右中
          fontVerticalOrigin: "center",
          // 右中
          fontOffsetX: offsetX,
          // 右中 图标与文字间距
          fontOffsetY: offsetY
          // 右中
        };
        break;
      case "right bottom":
        if (pointType == "circle") {
          if (pixelSize) {
            offsetX = pixelSize;
            offsetY = pixelSize / 2;
          }
          if (pixelSize && pointOutline && pointOutlineWidth) {
            offsetX = pointOutlineWidth + pixelSize;
            offsetY = (pointOutlineWidth + pixelSize) / 2;
          }
        }
        if (pointType == "image") {
          if (iconWidth && iconHeight) {
            offsetX = iconWidth;
            offsetY = iconHeight / 2;
          }
          if (iconWidth && iconHeight && iconOffsetX && iconOffsetY) {
            offsetX = iconHeight + iconOffsetX + 5;
            offsetY = (iconHeight + iconOffsetY) / 2;
          }
        }
        fontMent = {
          fontHorizontalOrigin: "left",
          // 右下
          fontVerticalOrigin: "top",
          // 右下
          fontOffsetX: offsetX,
          // 右下 图标与文字间距
          fontOffsetY: offsetY
          // 右下
        };
        break;
    }
    return { ...style, ...fontMent };
  }
  /**
   * 添加冒泡弹窗
   * @param balloonInfo 冒泡弹窗需要的参数【position：显示位置，content：显示内容，offset：偏移量，show，是否显示】
   */
  addBalloon(balloonInfo) {
    const _multipleBalloon = this.amapAdapter.balloonOperations.multipleBalloon;
    const {
      id,
      show = true,
      className = "",
      position,
      content,
      data,
      type = "marker",
      offset = [0, 0],
      distanceDisplayCondition = null,
      zIndex = 2,
      isGround = false
    } = balloonInfo;
    if (_multipleBalloon[id]) {
      return;
    }
    let crd = [];
    if (position.length == 3) {
      crd = [...position];
    } else {
      crd = [...position, 1];
    }
    const c3 = Cesium.Cartesian3.fromDegrees(crd[0], crd[1], crd[2]);
    const c2 = this.viewer.scene.cartesianToCanvasCoordinates(c3);
    let balloon = null;
    balloon = document.createElement("div");
    balloon.setAttribute("class", `balloon ${className}`);
    if (content instanceof HTMLElement) {
      balloon.appendChild(content);
    } else {
      balloon.innerHTML = content;
    }
    const el = document.getElementById(this.divId) || this.divId;
    let distanceShow = show;
    if (Array.isArray(distanceDisplayCondition) && distanceDisplayCondition.length) {
      let heigth = this.mapsLevelToHeight(distanceDisplayCondition[1]);
      let chegith = this.viewer.camera.positionCartographic.height;
      if (chegith > heigth) {
        distanceShow = false;
      }
    }
    balloon.crd = crd;
    balloon.id = id;
    balloon.type = type;
    balloon.data = data;
    balloon.show = show;
    balloon.distanceShow = distanceShow;
    balloon.offset = offset;
    balloon.distanceDisplayCondition = distanceDisplayCondition;
    balloon._balloonInfo = balloonInfo;
    balloon.isGround = isGround;
    balloon.style.opacity = 0;
    balloon.style.zIndex = zIndex;
    balloon.style.left = (c2 == null ? void 0 : c2.x) + offset[0] - 214 + "px";
    balloon.style.top = (c2 == null ? void 0 : c2.y) + offset[1] - 90 + "px";
    balloon.style.display = show ? "block" : "none";
    balloon.style.pointerEvents = "none";
    balloon.style.position = "absolute";
    if (el) {
      el.appendChild(balloon);
    }
    this.amapAdapter.balloonOperations.multipleBalloon[id] = balloon;
    return balloon;
  }
  /**
   * 显示冒泡
   * @param id 冒泡唯一标识
   */
  showBalloon(id) {
    const _multipleBalloon = this.amapAdapter.balloonOperations.multipleBalloon;
    if (_multipleBalloon[id]) {
      _multipleBalloon[id].style.display = "block";
      _multipleBalloon[id].show = true;
      _multipleBalloon[id].distanceShow = true;
    }
  }
  /**
   * 隐藏冒泡
   * @param id 冒泡唯一标识
   */
  hideBalloon(id) {
    const _multipleBalloon = this.amapAdapter.balloonOperations.multipleBalloon;
    if (_multipleBalloon[id]) {
      _multipleBalloon[id].style.display = "none";
      _multipleBalloon[id].show = false;
      _multipleBalloon[id].distanceShow = false;
    }
  }
  /**
   * 变化冒泡样式
   * @param id 冒泡唯一标识
   * @param content 要变化的样式
   * @param flag 是否自定义指定改变的元素盒子
   * @param el 元素盒子容器
   */
  changeBalloon(id, content, flag2 = false, el) {
    const _multipleBalloon = this.amapAdapter.balloonOperations.multipleBalloon;
    const balloon = _multipleBalloon[id];
    if (balloon) {
      if (!flag2) {
        balloon.innerHTML = content;
      } else {
        el && (el.innerHTML = content);
      }
    }
  }
  /**
   * 移除冒泡
   * @param id 冒泡弹窗唯一标识
   */
  removeBalloon(id) {
    const balloon = this.amapAdapter.balloonOperations.multipleBalloon[id];
    if (balloon == null ? void 0 : balloon.remove) {
      balloon.remove();
      delete this.amapAdapter.balloonOperations.multipleBalloon[id];
    }
  }
  /**
   * 变化冒泡内容和冒泡位置
   * @param id 冒泡ID
   * @param position 变化的冒泡位置
   * @param content 冒泡内容
   */
  refreshBalloon(id, position, content) {
    const balloon = this.amapAdapter.balloonOperations.multipleBalloon[id];
    if (balloon) {
      const c3 = Cesium.Cartesian3.fromDegrees(...position);
      const c2 = this.viewer.scene.cartesianToCanvasCoordinates(c3);
      const offsetx = 0;
      const offsety = 0;
      if (c2 && c2.x && c2.y) {
        balloon.crd = position;
        balloon.style.left = c2.x + offsetx + "px";
        balloon.style.top = c2.y + offsety + "px";
        if (content) {
          balloon.innerHTML = content;
        }
      }
    }
  }
  /**
   * 移除多个冒泡
   * @param ids 冒泡弹窗唯一标识集合
   */
  removeMultipleBalloons(ids) {
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      this.removeBalloon(id);
    }
  }
  /**
   * 移除全部冒泡
   */
  removeAllBalloons() {
    const balloonMap = this.amapAdapter.balloonOperations.multipleBalloon;
    for (const key in balloonMap) {
      this.removeBalloon(key);
    }
  }
  // 存放动态图标的Map集合
  /**
   * 创建动态实体对象
   * @param dynamicIconInfo 创建动态实体对象
   * @returns 创建成功的实体对象
   */
  addDynamicIcon(dynamicIconInfo) {
    const _multipleBalloon = this.amapAdapter.balloonOperations.multipleBalloon;
    const { id, show = true, polygon, iconPoint, data } = dynamicIconInfo;
    const _this = this;
    if (_multipleBalloon[id]) {
      return;
    }
    if (iconPoint && !iconPoint.style) {
      return;
    }
    const {
      iconImage,
      iconWidth,
      iconHeight,
      iconOpacity = 1,
      iconRtation = 0,
      iconServerUrl
    } = iconPoint.style;
    this.dynamicIconMap.set(id, {
      iconImage: iconServerUrl ? iconServerUrl + iconImage : iconImage,
      iconRtation,
      iconPosition: iconPoint.position,
      // polygons: polygon.positions
      polygons: {}
    });
    const entity = new Cesium.Entity({
      id,
      show,
      position: new Cesium.CallbackProperty(() => {
        return Cesium.Cartesian3.fromDegrees(
          ...this.dynamicIconMap.get(id).iconPosition
        );
      }, false),
      // 图标点的位置
      // polygon: {
      //   hierarchy: new Cesium.CallbackProperty(() => {
      //     return new Cesium.PolygonHierarchy(
      //       Cesium.Cartesian3.fromDegreesArray(this.dynamicIconMap.get(id).polygonPositions)
      //     );
      //   }, false), // 多边形参数
      //   material: _color,
      //   outline: outline,
      //   outlineColor: _outlineColor,
      //   outlineWidth: outlineWidth,
      //   extrudedHeight: 0
      // },
      billboard: {
        image: new Cesium.CallbackProperty(() => {
          return this.dynamicIconMap.get(id).iconImage;
        }, false),
        // 图像地址
        color: Cesium.Color.WHITE.withAlpha(iconOpacity),
        // 设置颜色和透明度
        height: iconWidth,
        // 高度
        width: iconHeight,
        // 宽度
        rotation: new Cesium.CallbackProperty(() => {
          return this.dynamicIconMap.get(id).iconRtation;
        }, false),
        // 逆时针旋转
        sizeInMeters: false,
        // 大小是否以米为单位
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        // 相对于坐标的垂直位置
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        // 相对于坐标的水平位置
        scale: 1,
        // 应用于图像的统一比例 比例大于会1.0放大标签，而比例小于会1.0缩小标签
        clampToGround: true,
        eyeOffset: Cesium.Cartesian3(0, 0, -1e3),
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    });
    const polygonEntList = [];
    const _id = id;
    polygon.positions.forEach((polygon2) => {
      const { id: id2, positions, zIndex, style } = polygon2;
      this.dynamicIconMap.get(_id).polygons[id2] = positions;
      if (!style) {
        return;
      }
      const {
        fillVisible: polygonVisibleColor = true,
        fillColor: color,
        fillOpacity: alpha = 1,
        fillborderVisible: outline = false,
        fillBorderWidth: outlineWidth,
        fillBorderColor: outlineColor,
        fillBorderOpacity: outlineAlpha = 1
      } = style;
      let _color = null;
      if (polygonVisibleColor) {
        _color = Cesium.Color.fromCssColorString(color);
        _color.alpha = alpha;
      }
      const _outlineColor = Cesium.Color.fromCssColorString(outlineColor);
      _outlineColor.alpha = outlineAlpha;
      polygonEntList.push(
        new Cesium.Entity({
          id: id2,
          show,
          polygon: {
            hierarchy: new Cesium.CallbackProperty(() => {
              return new Cesium.PolygonHierarchy(
                Cesium.Cartesian3.fromDegreesArray(
                  this.dynamicIconMap.get(_id).polygons[polygon2.id]
                )
              );
            }, false),
            // 多边形参数
            material: _color,
            outline,
            outlineColor: _outlineColor,
            outlineWidth,
            extrudedHeight: 0,
            zIndex
          }
        })
      );
    });
    const entityList = [];
    const iconPointEntiy = this.viewer.entities.add(entity);
    for (let i = 0; i < polygonEntList.length; i++) {
      entityList.push(this.viewer.entities.add(polygonEntList[i]));
    }
    iconPointEntiy._id = id;
    iconPointEntiy._data = data;
    this.amapAdapter.balloonOperations.multipleBalloon[id] = [
      iconPointEntiy,
      ...entityList
    ];
    this.viewer.scene.forceRender();
    if (!this.animationFrameInterVal) {
      this.animationFrameInterVal = requestAnimationFrame(function() {
        _this.requestAnimationFrameDynamicIcon(_this);
      });
    }
    return entityList;
  }
  // 定义一个更新动画的函数
  requestAnimationFrameDynamicIcon(_this) {
    _this.animationFrameInterCount++;
    if (_this.animationFrameInterCount % 2 == 0) {
      _this.dynamicIconMap.forEach((value, key) => {
        if (_this.dynamicIconMap.get(key)) {
          _this.dynamicIconMap.get(key).iconRtation = _this.dynamicIconMap.get(key).iconRtation + 0.1;
        }
      });
    }
    if (_this.animationFrameInterVal) {
      _this.animationFrameInterVal = requestAnimationFrame(() => {
        _this.requestAnimationFrameDynamicIcon(_this);
      });
    }
  }
  /**
   * 移动动态实体对象的 图标位置 和 多边形位置
   * @param changeInfo {IChangeDynamicIconInfo} 需要移动的图标 位置 旋转角度 && 要移动的多边形位置
   */
  changeDynamicIcon(changeInfo) {
    const _multipleBalloon = this.amapAdapter.balloonOperations.multipleBalloon;
    const { id, iconPoint, polygon } = changeInfo;
    if (_multipleBalloon[id]) {
      const { iconServerUrl, iconImage, position, iconRtation } = iconPoint;
      const { positions } = polygon;
      this.dynamicIconMap.set(id, {
        iconImage: iconServerUrl ? iconServerUrl + iconImage : iconImage,
        iconRtation: iconRtation ? iconRtation : this.dynamicIconMap.get(id).iconRtation,
        iconPosition: position,
        polygons: this.dynamicIconMap.get(id).polygons
      });
      if (positions.length) {
        positions.forEach((polygon2) => {
          if (this.dynamicIconMap.get(id).polygons[polygon2.id]) {
            this.dynamicIconMap.get(id).polygons[polygon2.id] = polygon2.positions;
          }
        });
      } else {
        if (this.dynamicIconMap.get(id).polygons && Object.keys(this.dynamicIconMap.get(id).polygons).length) {
          for (const key in this.dynamicIconMap.get(id).polygons) {
            this.dynamicIconMap.get(id).polygons[key] = [];
          }
        }
      }
    }
  }
  /**
   * 移除动态实体
   * @param id 动态实体对象唯一标识
   */
  removeDynamicIcon(id) {
    const _multipleBalloon = this.amapAdapter.balloonOperations.multipleBalloon;
    if (_multipleBalloon[id] && Array.isArray(_multipleBalloon[id])) {
      _multipleBalloon[id].forEach((dynamic) => {
        this.viewer.entities.remove(dynamic);
      });
      delete _multipleBalloon[id];
      this.dynamicIconMap.delete(id);
    }
    if (Object.keys(_multipleBalloon).length === 0) {
      clearInterval(this.animationFrameInterVal);
      cancelAnimationFrame(this.animationFrameInterVal);
      this.animationFrameInterVal = null;
      this.animationFrameInterCount = 0;
    }
  }
  /**
   * 移除全部实体对象
   */
  removeAllDynamicIcon() {
    const _multipleBalloon = this.amapAdapter.balloonOperations.multipleBalloon;
    for (const key in _multipleBalloon) {
      this.removeDynamicIcon(key);
    }
    clearInterval(this.animationFrameInterVal);
    cancelAnimationFrame(this.animationFrameInterVal);
    this.animationFrameInterVal = null;
    this.animationFrameInterCount = 0;
  }
}
const MyMapAdapter = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ALineTool,
  APolygonTool,
  AProfileAnalysisTool,
  CesiumMap,
  CustomCombination,
  GeoMath,
  GeoMath3D,
  GltfModelHelper,
  GraphicsOrderHelper,
  MapBaseHelper: MapBaseHelper$1,
  MatrixTransformHelper,
  PosUtil,
  RayPickedHelper,
  TriangleTool,
  WaterFollOption
}, Symbol.toStringTag, { value: "Module" }));
console.log("地图适配器加载完成", MyMapAdapter);
