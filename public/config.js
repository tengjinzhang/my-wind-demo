window.meta = {
  // 接口地址
  VITE_BASE_API: 'http://192.168.20.10:9691', // 测试环境

  // 图片查看base_url
  VITE_PHOTO_API: 'http://192.168.20.10:8402/v1/info/',

  // 图层服务
  VITE_LAYERINFO_API: 'http://192.168.20.10:8516',

  // 图片路径
  VITE_BASE_IMAGE_SRC: '',

  // geoserver 地址
  VITE_GEO_API: 'http://192.168.20.10:9573/geoserver/shuilibase/ows',

  // 全国行政区划GeoServer地址
  VITE_GEO_API_QUANGUO: 'http://192.168.20.10:20029/geoserver/QuanGuo',

  // 地形地质
  VITE_BASE_TERRAIN_URL: 'http://192.168.20.10:20016/v1/info/2D/Terrain/guangdong',

  MODE: 1, // 0开发 1测试 2正式
  VERSION: 'v1.3.4', // 版本号

  // 系统标识
  SYSTEMTAG: 'gis-service-test',

  // 心跳时间 // 600000
  TIME_DATA: 60000,

  // geoserver图层key
  GEOLAYERKEY: 'shuilibase',

  //获取config.json数据地址 3D
  CONFIG_JSON_URL_3D: 'http://192.168.20.10:9697/v1/info/guihua-gateway-gis/3d/config_3d.json',

  // 行政区划编码地址
  CONFIG_JSON_URL_AREACODE:
    'http://192.168.20.10:9697/v1/info/guihua-gateway-gis/AreaCodeTreeData.json'
};
