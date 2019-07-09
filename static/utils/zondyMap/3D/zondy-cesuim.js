

    /**
	 *   三维地图框架封装js
	 *   author Yu HuaWen
	 *   Date  2018/03/09
     */

	var host = null;
    var jsFiles = null;
    var cesuimToolFiles = null;
	var cssFiles = null;


    /**
     * Method: _getScriptLocation
     * Return the path to this script. This is also implemented in
     * OpenLayers.js
     *
     * Returns:
     * {String} Path to this script
     */
    var _getScriptLocation = function() {
        var r = new RegExp("(^|(.*?\\/))(zondy-cesuim\.js)(\\?|$)"),
            s = document.getElementsByTagName('script'),
            src, m, l = "";
        for(var i=0, len=s.length; i<len; i++) {
            src = s[i].getAttribute('src');
            if(src) {
                var m = src.match(r);
                if(m) {
                    l = m[1];
                    break;
                }
            }
        }
        return l;
    };

	(function(){
	    if(!jsFiles) {
	        jsFiles = [
	            // "Build/requireJs/require.js",
	            // "Build/Cesium/Cesium.js",
	            "Build/CesiumUnminified/Cesium.js",
	            "Build/Cesium/zondy_cesuim_Lab.js", // cesuim效果实验室 js
	            // "proType-Cesium.js", // 项目类型 js
	            // "proProcess-Cesium.js", // 项目进度 js
	            // "Build/Cesium/ZdCesium.js", // min.js
	            // "Build/Cesium/Cesium.js", // min.js
	            "js/viewerCesiumNavigationMixin.min.js"
	        ]; // etc.
	        var scriptTags = new Array(jsFiles.length);
	        host = _getScriptLocation();
	        for (var i = 0, len = jsFiles.length; i < len; i++) {
	            scriptTags[i] = "<script src='" + host + jsFiles[i] +
	                "'></script>";
	        }
	        if (scriptTags.length > 0) {
	            document.write(scriptTags.join(""));
	        }
	    }
	    loadZondyCesuimTools();

	    if(!cssFiles) {
	        cssFiles = [
	            "Build/Cesium/Widgets/widgets.css",
	            "css/zondy-cesuim.css",
	            // "css/BaoanDemo.css",
	            // "css/baoan.css",
	            "js/tools/css/box.css",
	            "js/tools/css/DrawHelper.css"
	        ]; // etc.
	        var cssTags = new Array(cssFiles.length);
	        host = _getScriptLocation();
	        for (var i = 0, len = cssFiles.length; i < len; i++) {
	            cssTags[i] = '<link rel="stylesheet" href="'+host+cssFiles[i]+'">';
	        }
	        if (cssTags.length > 0) {
	            document.write(cssTags.join(""));
	        }
	    }
	})();

	// geoserver服务器地址
	var geoserverUrl = 'http://172.17.6.23:8081/geoserver';

	// 房屋图层geoJson服务地址
	var buildingLayer = geoserverUrl + '/GIS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GIS:dpbd&outputFormat=application%2Fjson';

	// 地图视图对象
	var viewer = null;

	// 天地图 全球矢量地图服务
    var tdtVImageryProvider = null;

	// 天地图 全球矢量中文注记服务
    var tdtVImageryProvider2 = null;

	// 天地图 全球影像地图服务
    var tdtAviImageryProvider = null;

	// 天地图 全球影像中文注记服务
    var tdtAviImageryProvider2 = null;

	// 深圳天地图 影像服务
    var szTdtAviImageryProvider = null;
	
	// 大鹏图层数据支持
	var dpjdPrivider,dpjdPointPrivider,dpjdbPrivider,dpsqPrivider,dpsqPointPrivider,
	dpwgPrivider,dproadPrivider,dphighWayPrivider,dpbdPrivider,dpbdpPrivider,dpbd201510Privider,
	terrainProvider = null;

	// 地球上呈现的图像图层集合
	var imageryLayers = null;

	// 地球上呈现的大鹏图层服务
	var tdtAviImageryLayer,tdtAviWImageryLayer,jdImageryLayer,jdpImageryLayer,
	sqImageryLayer,sqpImageryLayer,wgImageryLayer,roadImageryLayer,highWayImageryLayer,
	bdImageryLayer = null;

	// view对象下entity集合
	var entitiesView = null;

	// view scene对象
	var scene = null;
	
	// view canvas对象
    var canvas = null;

    // view clock对象
    var clock = null;

	// view camera对象
	var camera = null;

	// view cesiumWidget对象
	var cesiumWidget = null;

	// view eppipsoid对象
	var ellipsoid = null;

	// 底图朦胧层数据源
	var baseHazyDataSource = null; 

	// 房屋数据源
	var dpbdDatasource = null; 
	
	// 房屋实体集
	var buildingEntities = null;
	
	// 房屋3D数据集合
	var buildingDataSources = [];
	var tdtVec_w,tdtCva_w,tdtImg_w,tdtCia_w = null;

	// infoBox容器对象
	var infoBox = {
		infoBoxContainer : undefined, // infoBox 容器
		infoBoxLTPosition : undefined,  //infoBox球面坐标位置
		infoBoxScreenPosition : undefined,  //infoBox屏幕坐标位置
		content : undefined  // infoBox 填充内容
	}

	// 鼠标当前选中的实体对象
	var selected = null;

	// 鼠标当前悬浮的实体对象
	var highlighted = null;	

	// 叠加图层是否显示
	var overlayDisplay = true;

	// 场景主视角
	var initialOrientation = null;
	
	// 圆形扫描图
	var ScanPostState = null;

	// 自定义图元集
	var primitiveCollection = null;
	// 自定义点图元集
	var pointPrimitives = null;
	// 自定义实体集
	var defaultEntities = null;
	// 地图初始化参数
	var opt = {
		vrButton : false,
        animation: false,  //是否显示动画控件
        shouldAnimate: true,
        baseLayerPicker: false, //是否显示图层选择控件
        geocoder: false, //是否显示地名查找控件
        timeline: false, //是否显示时间线控件
        sceneModePicker: false, //是否显示投影方式控件
        navigationHelpButton: false, //是否显示帮助信息控件
        infoBox: false,  //是否显示点击要素之后显示的信息
        // imageryProvider: tdtAviImageryProvider,
        // imageryProvider: bingMap,
        // globe: false,
		shadows: false,
		geocoder: false,
		homeButton: false,
		navigationInstructionsInitiallyVisible: false,
        // sceneMode: Cesium.SceneMode.SCENE2D // 2D模式
        // sceneMode: Cesium.SceneMode.COLUMBUS_VIEW // 2.5D模式
        // sceneMode: Cesium.SceneMode.SCENE3D // 3D模式
		//mapProjection: new Cesium.GeographicProjection(Cesium.Ellipsoid.fromCartesian3(new Cesium.Cartesian3()))
    };

	// 加载地图视图
	// parameter viewContainer 视图容器
	function loadMap(viewContainer,onComplete){
		
		selected = {
		    feature: undefined,
		    originalColor: new Cesium.Color(),
		    originalBillboard: undefined
		};

		highlighted = {
		    feature: undefined,
		    originalColor: new Cesium.Color()
		};	

		initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(46.0,-60.0, 0.0);

		// 天地图 全球矢量地图服务
	    tdtVImageryProvider = new Cesium.WebMapTileServiceImageryProvider({
			url: 'http://t'+Math.round(Math.random()*7)+'.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&tk=4adc8b1d4b59c92bf18685fc81e7b701',
	        layer: "tdtVecBasicLayer",
	        style: "default",
	        format: "image/jpeg",
	        tileMatrixSetID: "GoogleMapsCompatible",
			maximumLevel: 25,
			// minimumLevel:10,
	        show: true
	    });
		// 天地图 全球矢量中文注记服务
	    tdtVImageryProvider2 = new Cesium.WebMapTileServiceImageryProvider({
			// url: "http://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg",
			url: 'http://t'+Math.round(Math.random()*7)+'.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&tk=4adc8b1d4b59c92bf18685fc81e7b701',
			layer: "tdtAnnoLayer",
			style: "default",
			format: "image/jpeg",
			tileMatrixSetID: "GoogleMapsCompatible",
	        show: true
		});
		// 天地图 全球影像地图服务
	    tdtAviImageryProvider = new Cesium.WebMapTileServiceImageryProvider({
	        // url: "http://t7.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles",
	        url: 'http://t'+Math.round(Math.random()*7)+'.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&tk=4adc8b1d4b59c92bf18685fc81e7b701',
	        layer: "tdtBasicLayer",
	        style: "default",
	        format: "image/jpeg",
	        tileMatrixSetID: "GoogleMapsCompatible",
	        show: true
	    });
		// 天地图 全球影像中文注记服务
	    tdtAviImageryProvider2 = new Cesium.WebMapTileServiceImageryProvider({
			// url: "http://t7.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg",
			url: 'http://t'+Math.round(Math.random()*7)+'.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&tk=4adc8b1d4b59c92bf18685fc81e7b701',
			layer: "tdtAnnoLayer",
			style: "default",
			format: "image/jpeg",
			tileMatrixSetID: "GoogleMapsCompatible",
			show: true
		});
		// 深圳本地天地图 影像地图服务
	    szTdtAviImageryProvider = new Cesium.WebMapTileServiceImageryProvider({
	        url: 'http://ag.szgeoinfo.com/arcgis/rest/services/szmap/MapServer/WMTS?layer=szmap&style=default&tilematrixset=default028mm&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={TileMatrix}&TileCol={TileCol}&TileRow={TileRow}',
	        layer: 'szmap',
	        style: "default",
	        format: "image/jpeg",
	        tileMatrixSetID: "shenzhen tdt image service",
	        show: true
	    });




		var wmtsParameters = 'tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png';
		dpbdPrivider = new Cesium.WebMapTileServiceImageryProvider({  
            url : geoserverUrl + '/gwc/service/wmts?layer=GIS:dpbd&style&' + wmtsParameters + '&TileMatrix=EPSG:900913:{TileMatrix}&TileCol={TileRow}&TileRow={TileCol}',
		    layer:'GIS:dpbd',  //房屋面图层的名称   
		    style : 'default',
		    format : 'image/png',
		    tileMatrixSetID : 'EPSG:900913',
		    maximumLevel: 21 
        });
		opt.sceneMode=Cesium.SceneMode.SCENE3D; // 3D模式
		opt.fullscreenElement=document.getElementById(viewContainer),//全屏时渲染的HTML元素,

	    viewer = new Cesium.Viewer(viewContainer, opt);
	    // 移除默认加载的图层
	    viewer.imageryLayers.removeAll();  


	    cesiumWidget = viewer.cesiumWidget;
	    // 坐标系统
	    // viewer.extend(Cesium.viewerCesiumInspectorMixin);

		tdtVec_w = new Cesium.ImageryLayer(tdtVImageryProvider, {
                show: false
            });
		tdtVec_w.alpha = 1.0;
	    viewer.imageryLayers.add(tdtVec_w);
		tdtCva_w = new Cesium.ImageryLayer(tdtVImageryProvider2, {
                show: false
            });
		tdtCva_w.alpha = 1.0;
	    viewer.imageryLayers.add(tdtCva_w);
		tdtImg_w = new Cesium.ImageryLayer(tdtAviImageryProvider, {
                show: true
            });
		tdtImg_w.alpha = 1.0;
	    viewer.imageryLayers.add(tdtImg_w);
		tdtCia_w = new Cesium.ImageryLayer(tdtAviImageryProvider2, {
                show: true
            });
		tdtCia_w.alpha = 1.0;
	    viewer.imageryLayers.add(tdtCia_w);
		// var szTdt = new Cesium.ImageryLayer(szTdtAviImageryProvider, {
  //               show: true
  //           });
		// szTdt.alpha = 1.0;
	 //    viewer.imageryLayers.add(szTdt);

		// igServer发布的wms地图服务
	    igServerProvider = new Cesium.WebMapTileServiceImageryProvider({
	        // url: 'http://192.168.253.10:6163/igs/rest/ogc/WMTSServer/1.0.0/WorldMorcato2/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png',
	        url: 'http://192.168.253.10:6163/igs/rest/ogc/WMTSServer?layer=WorldMorcato3&style=default&tilematrixset=GoogleMapsCompatible_GB&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={TileMatrix}&TileCol={TileCol}&TileRow={TileRow}',
	        layer: 'WorldMorcato3',
	        style: "default",
	        tilematrixset: "GoogleMapsCompatible_GB",
	        format: "image/jpeg",
	        tileMatrixSetID: "shenzhen igServer wmts service",
	        show: true
	    });

		// viewer.imageryLayers.addImageryProvider(igServerProvider);

		// viewer.imageryLayers.addImageryProvider(provider2);
	    // google Map Terrian
	    // var googleMapTerrian = new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
     //        url: 'http://www.google.cn/maps/vt?lyrs=t@189&gl=cn&x={x}&y={y}&z={z}',
     //        tilingScheme: new Cesium.WebMercatorTilingScheme(),
     //        minimumLevel: 1,
     //        maximumLevel: 20,
     //        credit: 'http://www.bjxbsj.cn',
     //    }), {
     //            show: true
     //        });
	    // viewer.imageryLayers.add(googleMapTerrian);

	    // google Map
	    // http://www.google.cn/maps/vt?lyrs=s@800&x={x}&y={y}&z={z}&gl=cn
	    // var googleMap = new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
     //        url: 'http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}&gl=cn',
     //        tilingScheme: new Cesium.WebMercatorTilingScheme(),
     //        minimumLevel: 1,
     //        maximumLevel: 20,
     //        credit: 'http://www.bjxbsj.cn',
     //    }), {
     //            show: false
     //        });
	    // 两倍亮度
        // googleMap.brightness = 2.0;
	    // viewer.imageryLayers.add(googleMap);

	    // 谷歌交通地图
	    // var googleRoadMap = new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
     //        url: 'http://www.google.cn/maps/vt/pb=!1m4!1m3!1i{z}!2i{x}!3i{y}!2m3!1e0!2sm!3i380072576!3m8!2szh-CN!3scn!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!1e0',
     //        tilingScheme: new Cesium.WebMercatorTilingScheme(),
     //        minimumLevel: 1,
     //        maximumLevel: 20,
     //        credit: 'http://www.bjxbsj.cn',
     //    }), {
     //            show: false
     //        });
	    // 两倍亮度
        // googleRoadMap.brightness = 1.5;
	    // viewer.imageryLayers.add(googleRoadMap);

		// var bingMap = new Cesium.ImageryLayer(new Cesium.BingMapsImageryProvider({
		//     url : 'https://dev.virtualearth.net',
		//     mapStyle : Cesium.BingMapsStyle.AERIAL,
		//     key : 'AsFuMopRN9V8SiYlMwxLRUDxAzJvg5MPx9PIlHNF5epge5m1s35iJ5_PHC-pq7nB'
		// }), {
  //               show: true
  //           });
		// bingMap.alpha = 1.0;
	 //    viewer.imageryLayers.add(bingMap);

		// 加载自定义深圳底图服务
  //       var szBaseLayer = new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
		//    url : "http://localhost:8088/baseLayer/_alllayers/{zTile}/{y}/{x}.png",
	 //         customTags : {
	 //             zTile: function(imageryProvider, x, y, level) {
	 //                 return 'L' + zeroPad(level, 2, 10);
	 //             }
	 //         }
		// }), {
  //           show: true
  //       });
  //       viewer.imageryLayers.add(szBaseLayer);

        // 加载宝安区街道轮廓服务
  //       var regionLayer = new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
		//    url : "http://172.17.6.23/baoanLayer/_alllayers/{z}/{y}/{x}.png"
		// }), {
  //           show: false
  //       });
        // regionLayer.alpha = 0.5;
        // 两倍亮度
        // regionLayer.brightness = 2.0;
        // viewer.imageryLayers.add(regionLayer);

		// var esri = new Cesium.ImageryLayer(new Cesium.ArcGisMapServerImageryProvider({
		//     url : 'https://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer'
		// }), {
  //           show: false
  //       });
        // viewer.imageryLayers.add(esri);

	 //    var demMap = new Cesium.ImageryLayer(new Cesium.ArcGisMapServerImageryProvider({
		//     url : 'http://172.17.6.48:6080/arcgis/rest/services/szgc/szgc01232/MapServer'
		// }), {
  //           show: false
  //       });
  //       demMap.alpha = 0.3;
        // viewer.imageryLayers.add(demMap);

		//地形图
		terrainProvider = Cesium.createWorldTerrain({
            requestWaterMask: true,
            requestVertexNormals: true
        });
		// 地形图
		// viewer.terrainProvider = terrainProvider;
		// viewer.terrainProvider = false;
		// 深圳地形图
	 	// var shenZterrainLayer = new Cesium.CesiumTerrainProvider({
   //       	url: "http://172.17.6.23/shenZTerrians", // 默认立体地表
   //    	});
 		// viewer.terrainProvider = shenZterrainLayer;

		imageryLayers = viewer.imageryLayers;
	    // 添加导航条扩展
		viewer.extend(Cesium.viewerCesiumNavigationMixin, {});
		// 不显示Cesium Logo
		viewer.cesiumLogo = null;

	    scene = viewer.scene;
	    camera = viewer.camera;
    	canvas = viewer.canvas;
     	clock = viewer.clock;
     	entitiesView = viewer.entities;
     	ellipsoid = scene.globe.ellipsoid;

     	//Set bounds of our simulation time
		// var start = Cesium.JulianDate.fromDate(new Date());
		// var stop = Cesium.JulianDate.addSeconds(start, 360, new Cesium.JulianDate());

		//Make sure viewer is at the desired time.
		// clock.startTime = start.clone();
		// clock.stopTime = stop.clone();
		// clock.currentTime = start.clone();
		// clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
		// clock.multiplier = 60;
		// clock.shouldAnimate = true;
		// viewer.timeline.zoomTo(start, stop);
		// Cesium.Math.setRandomNumberSeed(3);

	 	// 夜晚效果
		// updateViewModel();
		
		// 加载自定义切片服务
		// viewer.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
		//    // url : "http://219.134.64.81:3480/DPMS_TILE/basic/" + "L" + zeroPad("{z}", 2, 10) + "/" + "R" + zeroPad(- parseInt("{y}") - 1, 8, 16) + "/" + "C" + zeroPad("{x}", 8, 16) + ".png"
		//    url : "http://219.134.64.81:3480/WGS84MAP/{z}/{y}/{x}.png",
	 //         customTags : {
	 //             zTile: function(imageryProvider, x, y, level) {
	 //                 return 'L' + zeroPad(level, 2, 10);
	 //             },
	 //             yTile: function(imageryProvider, x, y, level) {
	 //                 return 'R' + zeroPad(- y - 1, 8, 16);
	 //             },
	 //             xTile: function(imageryProvider, x, y, level) {
	 //                 return 'C' + zeroPad(x, 8, 16);
	 //             }
	 //         }
		// }));

		// 加载自定义切片服务
		// viewer.imageryLayers.addImageryProvider(new Cesium.ArcGisMapServerImageryProvider({
		//     url : 'http://172.17.6.48:6080/arcgis/rest/services/dp84/dp_84_meter/MapServer'.
		// }));
		// 加载单张背景图
		// var blackMarkle = viewer.imageryLayers.addImageryProvider(new Cesium.SingleTileImageryProvider({
		//     url : host + '/img/map/BlackMarble_2016.jpg'
		// }));
		// //50%透明度
		// blackMarkle.alpha = 0.4;
		// //两倍亮度
		// blackMarkle.brightness = 2.0;

		pointPrimitives = scene.primitives.add(new Cesium.PointPrimitiveCollection());  // Add point primitive collection
		primitiveCollection =scene.primitives.add(new Cesium.PrimitiveCollection());  // Add primitive collection
		var customds = new Cesium.CustomDataSource();
		viewer.dataSources.add(customds);
        defaultEntities = customds.entities;  // create custom entity collection
		// 场景的日照效果
		scene.globe.enableLighting = true;
		// scene.globe.globeAlpha = 0.001;
		scene.globe.baseColor = new Cesium.Color(0.0, 0.0, 0.0, 1.0); // 没有影像时地球的基础颜色，默认为蓝色
		// scene.requestRenderMode = true;
		// 贴地遮盖开启(深度检测)
		scene.globe.depthTestAgainstTerrain = false;



		// 事件定义
		initEvent();

		// 为绘图工具类调用初始化函数
		viewerInit();

		// 定义鼠标事件
		initMouseEvent();

		// 飞行到主视角 中地大楼位置：113.94570135467,22.532467865715  机场：113.80739545843453,22.629256083726414
		// viewToHome(Cesium.Cartesian3.fromDegrees(113.98345559463777  ,22.73545466245103, 2000.0),
		// 			new Cesium.HeadingPitchRoll.fromDegrees(0.0,-70.0, 0.0),null);		

		// 飞行到改造片区
		// flyToHome(Cesium.Cartesian3.fromDegrees(113.9847,22.74166, 3000.0),
		// 		new Cesium.HeadingPitchRoll.fromDegrees(0.0,-90.0, 0.0),null);
		var lon = Cesium.Math.toRadians(113.80746044325171);
		var lat = Cesium.Math.toRadians(22.681914791515567);
		console.log('lon:'+lon + ',lat:'+lat);

		// loadImageEntity();
		viewer.sceneMode = Cesium.SceneMode.SCENE3D;
	    if (Cesium.defined(onComplete) && typeof(onComplete) == 'function') {
			onComplete();
		}
		return viewer;
	}


	function changeBaseMap(index){
		if (index === 1) {
			if (tdtVec_w) {
				tdtVec_w.show = true;
			}
			if (tdtCva_w) {
				tdtCva_w.show = true;
			}
			if (tdtImg_w) {
				tdtImg_w.show = false;
			}
			if (tdtCia_w) {
				tdtCia_w.show = false;
			}
		}else if (index === 2) {
			if (tdtImg_w) {
				tdtImg_w.show = true;
			}
			if (tdtCia_w) {
				tdtCia_w.show = true;
			}
			if (tdtVec_w) {
				tdtVec_w.show = false;
			}
			if (tdtCva_w) {
				tdtCva_w.show = false;
			}
		}
	}
	/**
	 * 进制转换并补齐Arcgis Server目录和名称前面的0
	 * @param num
	 * @param len
	 * @param radix 进制
	 * @returns {string}
	 */
	function zeroPad(num, len, radix) {
	    var str = num.toString(radix || 10);
	    while (str.length < len) {
	        str = "0" + str;
	    }
	    return str;
	}
	
	var mouseClickPoints = [];
	/**
	* 定义鼠标事件
	*
	*/
	function initMouseEvent(argument) {
		//取消双击事件
    	viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
		// 鼠标点击事件，显示当前点击的经纬度坐标
		var mouseClickHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
		mouseClickHandler.setInputAction(function onMouseClick(movement) {
			var mousePosition = '';
			if (movement.position) {
				pickPosition = scene.pickPosition(movement.position,new Cesium.Cartesian3());
				var cartographicPickPosition = Cesium.Cartographic.fromCartesian(pickPosition);
				var degreesPickPositionLon = Cesium.Math.toDegrees(cartographicPickPosition.longitude);
				var degreesPickPositionLat = Cesium.Math.toDegrees(cartographicPickPosition.latitude);
				mousePosition += degreesPickPositionLon + ',\n' + degreesPickPositionLat;
				mouseClickPoints.push(degreesPickPositionLon);
				mouseClickPoints.push(degreesPickPositionLat);
			}
			$("#mousePosition").html(mousePosition);
			console.log(mouseClickPoints);
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

		var highlighted = {
	        feature : undefined,
	        originalColor : new Cesium.Color()
	    };
	}

	// The viewModel tracks the state of our mini application.
	var viewModel = {};
	/**
	* 切换白天、夜晚模式
	* @param {Number} dayType 场景模式 0：白天；1：夜晚
	*/
	function changeDayType(dayType){
		if (dayType === 0) {
			// 白天的初始值为夜晚
			viewModel = {
			    brightness: 0.20,
			    contrast: 1.0,
			    hue: 0.0,
			    saturation: 1.0,
			    gamma: 1.0
			};
		}else {
			// 夜晚的初始值为白天
			viewModel = {
			    brightness: 1.0,
			    contrast: 1.0,
			    hue: 0.0,
			    saturation: 1.0,
			    gamma: 1.0
			};
		}
		var t1=window.setInterval(changeDayStep, 1000);
	    function changeDayStep() {
	    	if (dayType === 0) {
	    		viewModel['brightness'] = viewModel['brightness'] + 0.15;
	    		if (viewModel['brightness'] >= 1.0) {
	    			//去掉定时器的方法  
	    			window.clearInterval(t1);   
	    		}
	    	}else {
				viewModel['brightness'] = viewModel['brightness'] - 0.15;
				if (viewModel['brightness'] <= 0.20) {
	    			//去掉定时器的方法  
	    			window.clearInterval(t1);   
	    		}
	    	}
	    	updateViewModel();
		}

	}
	// 夜晚效果
	function updateViewModel() {
		if (imageryLayers.length > 0) {
            for (var i = imageryLayers.length - 1; i >= 0; i--) {
            	var layer = imageryLayers.get(i);
            	for (var name in viewModel) {
            		layer[name] = viewModel[name];
            	}
            }
        }
	}

	// 改变相机视角
	function changeCameraView(headingYaw,pitchYaw,rangeYaw){
		zdCesiumLab.excute({
			command : 'viewChange',
			opts: {
				viewer : viewer,
				headingYaw : headingYaw,
				pitchYaw : pitchYaw,
				rangeYaw : rangeYaw// undefined
			}
		})
	}
	
	var viewModel1 = {
	    rate : 5.0,
	    gravity : 0,
	    minimumLife : 1.0,
	    maximumLife : 1.0,
	    minimumSpeed : 1.0,
	    maximumSpeed : 4.0,
	    startScale : 1.0,
	    endScale : 5.0,
	    particleSize : 25.0,
	    transX : 2.5,
	    transY : 4.0,
	    transZ : 1.0,
	    heading : 0.0,
	    pitch : 0.0,
	    roll : 0.0,
	    fly : true,
	    spin : true,
	    show : true
	};
	function loadGif() {
		// 小点闪动图标
		var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
            Cesium.Cartesian3.fromDegrees(113.93055628136,22.524247382348, 50.0));
		var particleSystem = scene.primitives.add(new Cesium.ParticleSystem({
		    image : host + 'img/map/check-circle-blank.png',
		    startScale : 0.5,
		    endScale : 2.5,
		    minimumLife : 2.0,
		    maximumLife : 1.0,
		    speed : 5.0,
		    width : 20,
		    height : 20,
		    maximumHeight: 10,
		    lifeTime : 10.0,
		    //主模型参数(位置)
		    modelMatrix : modelMatrix,
		    // 发射器参数
		    emitter : new Cesium.CircleEmitter(0.5),
		    rate : 1,
		    //颜色
		    startColor: Cesium.Color.WHITE.withAlpha(0.7),
		    endColor: Cesium.Color.WHITE.withAlpha(0.01),
		    forces: [applyGravity]
		}));
		
		// 数据云闪动+渐变色效果
		var modelMatrix_cloud = Cesium.Transforms.eastNorthUpToFixedFrame(
            Cesium.Cartesian3.fromDegrees(113.94355628136,22.524247382348, 2000.0));
		var particleSystemCloud = scene.primitives.add(new Cesium.ParticleSystem({
		    image : host + 'img/map/cloud.png',
		    startScale : 1.0,
		    endScale : 1.5,
		    minimumLife : 2.0,
		    maximumLife : 2.0,
		    speed : 0.0,
		    width : 80,
		    height : 64,
		    lifeTime : 5.0,
		    //主模型参数(位置)
		    modelMatrix : modelMatrix_cloud,
		    // 发射器参数
		    // emitter : new Cesium.CircleEmitter(1.0),
		    emitter : new Cesium.ConeEmitter(Cesium.Math.toRadians(30.0)),
		    rate : 1.0,
		    //颜色
		    startColor: Cesium.Color.WHITE.withAlpha(0.7),
		    endColor: Cesium.Color.RED.withAlpha(1.0),
		    forces: [applyGravity]
		}));
		// 范围扩展效果
		var modelMatrix_area = Cesium.Transforms.eastNorthUpToFixedFrame(
            Cesium.Cartesian3.fromDegrees(113.95855628136,22.524247382348, 5000.0));
		var particleSystem_area = scene.primitives.add(new Cesium.ParticleSystem({
		    image : host + 'img/map/check-circle-blank.png',
		    startScale : 1.0,
		    endScale : 30.0,
		    minimumLife : 2.0,
		    maximumLife : 5.0,
		    speed : 0.0,
		    width : 20,
		    height : 20,
		    lifeTime : 5.0,
		    //主模型参数(位置)
		    modelMatrix : modelMatrix_area,
		    // 发射器参数
		    emitter : new Cesium.CircleEmitter(5),
		    rate : 1,
		    // emitterModelMatrix : modelMatrix,
		    //颜色
		    startColor: Cesium.Color.WHITE.withAlpha(0.7),
		    endColor: Cesium.Color.WHITE.withAlpha(0.01),
		    forces: [applyGravity]
		}));
	}

	function applyGravity(particle, dt) {
	   var position = particle.position;
	   var gravityVector = Cesium.Cartesian3.normalize(position, new Cesium.Cartesian3());
	   Cesium.Cartesian3.multiplyByScalar(gravityVector, viewModel1.gravity * dt, gravityVector);
	   particle.velocity = Cesium.Cartesian3.add(particle.velocity, gravityVector, particle.velocity);
	}


	// 创建高度线
	function createHighLine(opt) {
		//WebGL Globe only contains lines, so that's the only graphics we create.
        var polyline = new Cesium.PolylineGraphics();
        polyline.material = opt.material;
        polyline.width = new Cesium.ConstantProperty(opt.width);
        polyline.followSurface = new Cesium.ConstantProperty(false);
        polyline.positions = new Cesium.ConstantProperty([opt.surfacePosition, opt.heightPosition]);

        //The polyline instance itself needs to be on an entity.
        var entity = new Cesium.Entity({
            id : opt.id,
            show : true,
            polyline : polyline,
            seriesName : opt.seriesName //Custom property to indicate series name
        });
        //Add the entity to the collection.
        entitiesView.add(entity);
	}

	var startLonLat = [113.90055628136,23.524247382348];
	var endLonLat = [114.90055628136,23.524247382348];
	var loadLength = 300;
	var radius = 0.003;

	var entityArray = [];

	
	/**
	*
	* 一键清除
	*/
	function oneKeyClear() {
		// body...
	}
	// 加载自定义Cesuim工具类
	function loadZondyCesuimTools(){
		if (!cesuimToolFiles) {
			cesuimToolFiles = [
		            "js/CesiumHeatmap.js",
		            "js/tools/MathUtil.js",
		            "js/tools/dotted.js",
		            "js/tools/flight.js",
		            "js/tools/prompt.js",
		            "js/tools/CesiumUtils.js",
		            "js/tools/SpirographPositionProperty.js",
		            "js/tools/DrawHelper.js",
		            "js/tools/5-1DynamicDrawTool.js"
		        ]; // etc.
		        var cesuimToolTags = new Array(cesuimToolFiles.length);
		        host = _getScriptLocation();
		        for (var i = 0, len = cesuimToolFiles.length; i < len; i++) {
		            cesuimToolTags[i] = "<script src='" + host + cesuimToolFiles[i] +
		                "'></script>";
		        }
		        if (cesuimToolTags.length > 0) {
		            document.write(cesuimToolTags.join(""));
		        }
		}
	}

	/**
	* 场景视角直接切换到主视角
	* @param {Cesium.Cartesian3} destination  视角坐标位置 笛卡尔3坐标
	* @param {Cesium.HeadingPitchRoll} orientation  相机视角方向
	* @param {function} onComplete  回调函数
	*/
	function viewToHome(destination,orientation,onComplete) {
		scene.camera.setView({
            destination: destination,
            orientation: orientation
        });
	    if (Cesium.defined(onComplete) && typeof(onComplete) == 'function') {
    		onComplete();
    	}
	}

	/**
	* 飞行到主视角
	* @param {Cesium.Cartesian3} destination  视角坐标位置 笛卡尔3坐标
	* @param {Cesium.HeadingPitchRoll} orientation  相机视角方向
	* @param {function} onComplete  回调函数
	*/
	function flyToHome(destination,orientation,onComplete) {
	// 先飞行到全国视角
	setTimeout(function() {
		camera.flyTo({
		 	duration: 3.0,
		 	maximumHeight: 500000,
	    	destination: destination,
	    	orientation: orientation,
	        complete:function() {
					onComplete();
	        	}
	    	});
		},1000);
	}

	// 生成三维地图组件
	function createMapWidgets(mapContainer){
		$.ajax({
           type : "get",
           url : host + "zondy-cesuim-doms.html",
           // dataType : "json",
           success : function(html) {         
           		var mapWidgets = $(html);
                viewer.container.appendChild(mapWidgets[0]);
            }
         });
	}	

	/**
	* 地图事件注册
	*/
	function initEvent() {
		// 移除默认左键点击事件
		viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);

		var drawMouseMoveHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
	   //鼠标移动时做的操作
	    drawMouseMoveHandler.setInputAction(function (movement) {
	    	 var cartesian = viewer.camera.pickEllipsoid(movement.endPosition, scene.globe.ellipsoid);
	    	 if (!Cesium.defined(cartesian)) return;
	         var cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian);
	         var curMovementLon = Cesium.Math.toDegrees(cartographic1.longitude);
	         var curMovementLat = Cesium.Math.toDegrees(cartographic1.latitude);
	         var height = cartographic1.height;
	    	
	      //鼠标移动画线事件
	      yidong(cartesian,curMovementLon,curMovementLat,height);
	    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

		var drawClickHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
	    //鼠标左击做的操作
	    drawClickHandler.setInputAction(function (click) {
	    	   if(operation==1){
	    	   		var cartesian = viewer.camera.pickEllipsoid(click.position, scene.globe.ellipsoid);
	    	   		if (!Cesium.defined(cartesian)) return;
		            var ray = viewer.scene.camera.getPickRay(click.position);
		            var position1 = viewer.scene.globe.pick(ray,viewer.scene);
		            var cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position1);
			    
			    	//获取坐标点
			        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
			        var currentClickLon = Cesium.Math.toDegrees(cartographic1.longitude);
			        var currentClickLat = Cesium.Math.toDegrees(cartographic1.latitude);
			        var height = cartographic1.height;
			        console.log(currentClickLon,currentClickLat,height);
			        //flight=1为飞行，存储飞行画线的所有点
					if(flight==1){				
						flightArray.push([currentClickLon,currentClickLat,height]);			
					}
				    //划线事件
		       		mouseLeft(cartesian,cartographic,currentClickLon,currentClickLat,height);
	    	   }else{
	    	   		var pickedObject = scene.pick(click.position);
	           		// dianjiditu(pickedObject);
	    	   }
	       		
	       		
	         //	assignment(movement);
	           // 
	    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

		var rightClickHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
	    //鼠标右键点击时做的操作
	    rightClickHandler.setInputAction(function (click)
	    {
	    	var cartesian = viewer.camera.pickEllipsoid(click.position, scene.globe.ellipsoid);
	            var ray = viewer.scene.camera.getPickRay(click.position);
	            var position1 = viewer.scene.globe.pick(ray,viewer.scene);
	            var cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position1);
	            if (cartesian && isStartDraw){
	            	//获取坐标点
	                var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
	                var endPointLon = Cesium.Math.toDegrees(cartographic1.longitude);
	                var endPointLat = Cesium.Math.toDegrees(cartographic1.latitude);
	                 console.log(endPointLon,endPointLat,height);
	                var height = cartographic1.height;
	                //flight=1为飞行，存储飞行画线的所有点
					if(flight==1){				
						flightArray.push([endPointLon,endPointLat,height]);			
					}
	                //结束画线画面事件
	         		mouseMiddle(cartesian,cartographic,endPointLon,endPointLat,height);         		
	            }
	    	// mouseMiddle(click);
	    }, Cesium.ScreenSpaceEventType.RIGHT_UP);

	    // 禁止鼠标中键进入地下
	    viewer.camera.changed.addEventListener(
            function () {
                if (viewer.camera._suspendTerrainAdjustment && viewer.scene.mode === Cesium.SceneMode.SCENE3D) {
                    viewer.camera._suspendTerrainAdjustment = false;
                    viewer.camera._adjustHeightForTerrain();
                }
            }
        );
	}

	// 清除viewer 已加载的模型
	function clearViewerEntities() {
		if (Cesium.defined(entitiesView)) {
			entitiesView.removeAll();
			if (!entitiesView.show) {
				entitiesView.show = true;
			}
		}
	}

	// 视角定位到主视角范围
	function toHome(onComplete) {
		camera.flyTo({
 				duration: 2.5,
                destination : Cesium.Cartesian3.fromDegrees(114.29550,22.41466,45000),
                orientation : initialOrientation,
                easingFunction : Cesium.EasingFunction.LINEAR_NONE
            });
		if (Cesium.defined(onComplete) && typeof(onComplete) == 'function') {
    		onComplete();
    	}
	}


	// 隐藏/显示 viewer自带的实体集对象
	function entitiesShow(onComplete) {
		if (Cesium.defined(entitiesView)) {
			entitiesView.show = !entitiesView.show;
		}
		if (Cesium.defined(onComplete) && typeof(onComplete) == 'function') {
    		onComplete();
    	}
	}

	// 获取当前三维范围
	function getCurrentExtent() {

	    // 范围对象
	    var extent = {};
	    
	    // 得到当前三维场景的椭球体
	    var ellipsoid = scene.globe.ellipsoid;
	    
	    var canvas = scene.canvas;
	    
	    // canvas左上角
	    var car3_lt = camera.pickEllipsoid(new Cesium.Cartesian2(0,0), ellipsoid);
	    
	    // canvas右下角
	    var car3_rb = camera.pickEllipsoid(new Cesium.Cartesian2(canvas.width,canvas.height), ellipsoid);
	    
	    // 当canvas左上角和右下角全部在椭球体上
	    if (car3_lt && car3_rb) {
	        var carto_lt = ellipsoid.cartesianToCartographic(car3_lt);
	        var carto_rb = ellipsoid.cartesianToCartographic(car3_rb);
	        extent.xmin = Cesium.Math.toDegrees(carto_lt.longitude);
	        extent.ymax = Cesium.Math.toDegrees(carto_lt.latitude);
	        extent.xmax = Cesium.Math.toDegrees(carto_rb.longitude);
	        extent.ymin = Cesium.Math.toDegrees(carto_rb.latitude);
	    }
	    
	    // 当canvas左上角不在但右下角在椭球体上
	    else if (!car3_lt && car3_rb) {
	        var car3_lt2 = null;
	        var yIndex = 0;
	        do {
	            // 这里每次10像素递加，一是10像素相差不大，二是为了提高程序运行效率
	            yIndex <= canvas.height ? yIndex += 10 : canvas.height;
	            car3_lt2 = camera.pickEllipsoid(new Cesium.Cartesian2(0,yIndex), ellipsoid);
	        }while (!car3_lt2);
	        var carto_lt2 = ellipsoid.cartesianToCartographic(car3_lt2);
	        var carto_rb2 = ellipsoid.cartesianToCartographic(car3_rb);
	        extent.xmin = Cesium.Math.toDegrees(carto_lt2.longitude);
	        extent.ymax = Cesium.Math.toDegrees(carto_lt2.latitude);
	        extent.xmax = Cesium.Math.toDegrees(carto_rb2.longitude);
	        extent.ymin = Cesium.Math.toDegrees(carto_rb2.latitude);
	    }
	    if (extent.xmin > extent.xmax){
	    	var xmin = extent.xmax;
	    	var xmax = extent.xmin;
	    	extent.xmin = xmin;
	    	extent.xmax = xmax;
	    }
	    if (extent.ymin > extent.ymax){
	    	var ymin = extent.ymax;
	    	var ymax = extent.ymin;
	    	extent.ymin = ymin;
	    	extent.ymax = ymax;
	    }
	    // 获取高度
	    extent.height = Math.ceil(camera.positionCartographic.height);
	    return extent;
	}

	// 屏幕坐标转笛卡尔空间直角坐标
	function screenXYToLT(cart2){
		// 得到当前三维场景的椭球体
	   	var ellipsoid = scene.globe.ellipsoid;
	   	var cart3 = camera.pickEllipsoid(new Cesium.Cartesian2(cart2.x,cart2.y), ellipsoid);
	   	// var carto_lt = ellipsoid.cartesianToCartographic(screenXY);
	   	return cart3;
	}

	// 笛卡尔空间直角坐标转屏幕坐标
	function LTToscreenXY(cart3){
		// 得到当前三维场景的椭球体
	   	// var screenXY = ellipsoid.cartographicToCartesian(carto_lt);
	   	// var cart2 = Cesium.Cartesian2.fromCartesian3(cart3);
	   	var cart2 = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, cart3);
	   	return cart2;
	}

	// 获取当前相机的
	function showCameraHPR(){
		 var lon = Cesium.Math.toDegrees(camera.positionCartographic['longitude']);
         var lat = Cesium.Math.toDegrees(camera.positionCartographic['latitude']);
         var alt = camera.positionCartographic['height'];
         var heading = Cesium.Math.toDegrees(camera.heading).toFixed(2);
         var pitch = Cesium.Math.toDegrees(camera.pitch).toFixed(2);
         var roll = Cesium.Math.toDegrees(camera.roll).toFixed(2);
         console.log("lon:" + lon + "  lat:" + lat + "  height:" + alt + "  heading:" + heading + "  pitch:" + pitch + "  roll:" + roll);
	}

	// 弧度转经纬度
	function cartograhphicToDegrees(){
		var coordinaeOrign = $('#cartograhphicToDegrees').val();
		var coor = coordinaeOrign.split(',');
		// 经度
		var lng=Cesium.Math.toDegrees(coor[0]);
		// 纬度
		var lat=Cesium.Math.toDegrees(coor[1]); 
		// 高度
		var alt=coor[2];
		$('#coordinaeResult').html(lng+','+lat+','+alt);
	}
	// 经纬度转弧度
	function degreesToCartographic(){
		var coordinaeOrign = $('#degreesToCartographic').val();
		var coor = coordinaeOrign.split(',');
		var cartographic=Cesium.Cartographic.fromDegrees(coor[0],coor[1],coor[2]);
		$('#coordinaeResult').html(cartographic.longitude+','+cartograhphic.latitude+','+cartographic.height);
	}
	// 经纬度转笛卡尔空间直角坐标(世界坐标)
	function degreesToCartesian3(){
		var coordinaeOrign = $('#degreesToCartesian3').val();
		var ellipsoid=viewer.scene.globe.ellipsoid;
		var coor = coordinaeOrign.split(',');
		// 先转换成弧度
		var cartographic=Cesium.Cartographic.fromDegrees(coor[0],coor[1],coor[2]);
		// 再转换成世界坐标
		var cartesian3=ellipsoid.cartographicToCartesian(cartographic);
		$('#coordinaeResult').html(cartesian3.x+','+cartesian3.y+','+cartesian3.z);
	}
	// 笛卡尔空间直角坐标(世界坐标)转经纬度
	function Cartesian3ToDegrees(){
		var coordinaeOrign = $('#Cartesian3ToDegrees').val();
		var coor = coordinaeOrign.split(',');
		var cartesian3=new Cesium.Cartesian3(coor[0],coor[1],coor[2]);
		// var cartographic = Cesium.Cartographic.fromCartesian(cartesian3.x,cartesian3.y,cartesian3.z);
		var ellipsoid=viewer.scene.globe.ellipsoid;
		var cartographic=ellipsoid.cartesianToCartographic(cartesian3);
		// 经度
		var lng=Cesium.Math.toDegrees(cartographic.longitude);
		// 纬度
		var lat=Cesium.Math.toDegrees(cartographic.latitude);
		// 高度
		var alt=cartographic.height;
		$('#coordinaeResult').html(lng+','+lat+','+alt);
	}

/**
* 创建随机的Cartesian3 坐标
*/
function randomPoint(e){
	var i=haoutil.math.random(113.97e3,113.99e3)/1e3
	,r=haoutil.math.random(22.73e3,22.74e3)/1e3;
	return Cesium.Cartesian3.fromDegrees(i,r,e);
}
/**
* 创建随机的Color
*/
function randomColor(r){var e=[new Cesium.Color(1/255,1/255,1,.9),new Cesium.Color(1,1/255,1/255,.9),new Cesium.Color(1/255,1,1/255,.9)];return e[r%3]}