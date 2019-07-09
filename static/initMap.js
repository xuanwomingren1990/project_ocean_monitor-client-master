function initMap (mapContainer) {
  loadMap(mapContainer,function(){
      flyToHome(Cesium.Cartesian3.fromDegrees(113.98017371850287, 22.634676769006283, 200000),
        new Cesium.HeadingPitchRoll.fromDegrees(360,-90, 360.00),function(){
          showWaterEffect();
      }); 
  })
}

initMap('map')

function switchBaseMap (index) {
  changeBaseMap(index);
}

function changeLayer () {
  alert('切换地图图层')
}


// 加载动态水域
function showWaterEffect (){
    var loading = layer.msg('正在拼命渲染中...', {icon: 6,time: 6000}); 
    // 获取当前相机视图大小
    var bbox = getCurrentExtent();
    // var url = 'http://192.168.10.207:6163/igs/rest/ogc/doc/SzOcean/WFSServer?REQUEST=GetFeature&version=1.1.0&service=wfs&typename=SzOcean%3A%E6%B7%B9%E6%B2%A1%E6%B0%B4%E6%B7%B1shp%E5%AF%BC%E5%87%BA&maxFeatures=10&outputFormat=GML3'
    // var url = 'http://219.134.64.81:3480/igs/rest/ogc/doc/SzOcean4/WFSServer?REQUEST=GetFeature&version=1.1.0&service=wfs&typename=SzOcean4%3A全世界海洋中国4&maxFeatures=10&outputFormat=GML3'
    // var url = 'http://219.134.64.81:3480/igs/rest/ogc/doc/SzOcean2/WFSServer?REQUEST=GetFeature&version=1.1.0&service=wfs&typename=SzOcean2%3A%E6%B5%B7%E6%B4%8B%E4%B8%AD%E5%9B%BD1&maxFeatures=10&outputFormat=GML3'
    var url = 'http://219.134.64.81:3480/igs/rest/ogc/doc/SzOcean5/WFSServer?REQUEST=GetFeature&version=1.1.0&service=wfs&typename=SzOcean5%3A海洋1&maxFeatures=10&outputFormat=GML3'
    $.ajax({
         url: url,
         cache: true,
         // data:{maxFeatures: 1000,BBOX: bbox.xmin + ',' + bbox.ymin + ',' + bbox.xmax + ',' + bbox.ymax + ',EPSG:4326'},
         async: true,
         success: function(result) {
            var polygons = result.children[0].children[0];
            if (polygons.children.length > 0) {
              for (var i = 0; i < polygons.children.length; i++) {
                var polygonDatas = polygons.children[i];
                var polygonRingList = polygonDatas.children[0].children[0];
                if (polygonRingList.children.length > 0){
                  for (var j = polygonRingList.children.length - 1; j >= 0; j--) {
                    var polygonRings = polygonRingList.children[j];
                    var polygonRing = polygonRings.children[0].children[0].children[0].children[0].textContent;
                    var polygonRingArr = polygonRing.split(' ');
                    for (var k = 0; k < polygonRingArr.length; k++) {
                      polygonRingArr[k] = parseFloat(polygonRingArr[k]);
                    }

                    // 第一步 定义水域多边形对象
                    var o = new Cesium.PolygonGeometry({
                        polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(polygonRingArr)),
                        height: 1,
                        extrudedHeight: 3,
                        perPositionHeight: false
                    });
                    // 第二步 创建动态水域效果
                    var water2 = zdCesiumLab.excute({
                        command : 'waterMaterial'
                      }).apply(viewer, new Cesium.GeometryInstance({
                              geometry: o
                      }));  
                  }
                }
              }
              //关闭
              layer.close(loading);
            }
         },
         error: function(error) {
              console.log("error:"+error);
              console.log("error:"+error);
         }
    });
}


// 淹没水深分类颜色
var waterClassifyColors = ['#0032ff','#00c8ff','#00ffaf','#32ff00','#afff00','#ffff00','#ffaf00','#ff6400','#ff1900','#ff0000'];
// 淹没水深分类高度
var waterClassifyHeight = [10,30,80,10,170,240,260,360,500,525];
// 淹没水深数据源
var waterDeepSource = null;
// 绘制淹没水深等值线
function loadWaterDeepClassify(){
  if (!waterDeepSource) {
    waterDeepSource = new Cesium.CustomDataSource;
    viewer.dataSources.add(waterDeepSource);
  }
  if (waterDeepSource.entities._entities._array.length > 0) {
    waterDeepSource.show = !waterDeepSource.show;
  }else{
    var loading2 = layer.msg('正在拼命渲染中...', {icon: 6,time: 6000}); 
    // 获取当前相机视图大小
    var bbox = getCurrentExtent();
    // var url = 'http://192.168.10.207:6163/igs/rest/ogc/doc/SzOcean4/WFSServer?REQUEST=GetFeature&version=1.1.0&service=wfs&typename=SzOcean4%3A%E6%B7%B9%E6%B2%A1%E6%B0%B4%E6%B7%B1shp%E5%AF%BC%E5%87%BA&maxFeatures=10&outputFormat=GML3'
    var url = 'http://219.134.64.81:3480/igs/rest/ogc/doc/SzOcean5/WFSServer?REQUEST=GetFeature&version=1.1.0&service=wfs&typename=SzOcean5%3A淹没水深shp导出&maxFeatures=10&outputFormat=GML3'
    $.ajax({
         url: url,
         cache: true,
         // data:{maxFeatures: 1000,BBOX: bbox.xmin + ',' + bbox.ymin + ',' + bbox.xmax + ',' + bbox.ymax + ',EPSG:4326'},
         async: true,
         success: function(result) {
            var polygons = result.children[0].children[0];
            if (polygons.children.length > 0) {
              for (var i = 0; i < polygons.children.length; i++) {
                var polygonDatas = polygons.children[i];
                var classes = polygonDatas.children[3].textContent;
                classes = parseInt(classes);
                var polygonRingList = polygonDatas.children[0].children[0];
                if (polygonRingList.children.length > 0){
                  for (var j = polygonRingList.children.length - 1; j >= 0; j--) {
                    var polygonRings = polygonRingList.children[j];
                    var polygonRing = polygonRings.children[0].children[0].children[0].children[0].textContent;
                    var polygonRingArr = polygonRing.split(' ');
                    for (var k = 0; k < polygonRingArr.length; k++) {
                      polygonRingArr[k] = parseFloat(polygonRingArr[k]);
                    }
                    var imageEntity = waterDeepSource.entities.add({
                  name : 'Image Entity',
                  polygon : {
                        hierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(polygonRingArr)),
                        height : 0,
                        extrudedHeight : waterClassifyHeight[classes],
                        outline : false,
                        // outlineColor : Cesium.Color.WHITE,
                        // outlineWidth : 4,
                        material : Cesium.Color.fromCssColorString(waterClassifyColors[classes]).withAlpha(1.0),
               //             material : new zdCesiumLab.ImageWithColorMaterialProperty({
                    //  color : Cesium.Color.fromCssColorString(waterClassifyColors[classes]).withAlpha(1.0),
                    //  image : host + 'img/map/wall1.jpg'
                    // })
                    }
                });
                  }
                }
              }
              viewer.zoomTo(waterDeepSource);
              //关闭
              layer.close(loading2);
            }
         },
         error: function(error) {
              console.log("error:"+error);
              console.log("error:"+error);
         }
    });
  }
}
