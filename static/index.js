
let Viewer = null;
// 三小隐患热力图对象
let heatMaps = null;
$(function(){
	Viewer = loadMap('map',function(){

		// 项目类型视角 lon:113.60311320128507  lat:22.70046297786092  height:27579.70653567007  heading:91.97  pitch:-46.86  roll:0.00
		/*flyToHome(Cesium.Cartesian3.fromDegrees(CesiumHeatmap, 20579.70653567007),
			new Cesium.HeadingPitchRoll.fromDegrees(91.97,-30.86, 0.13),function(){
				loadRenovateTypeCountMark();
		});	*/
		viewToHome(Cesium.Cartesian3.fromDegrees(113.94575904127308,22.528729033642016, 25000.0),
			new Cesium.HeadingPitchRoll.fromDegrees(360,-90, 360.00),function(){
				// 加载当月已录入的隐患点热力图
				loadCurMonthEvents();
				// 加载在线的巡查人员最新位置信息,并且 35s 刷新一次最新
				addInspections("static/utils/data/inspectors.json",35000);
			});
});
})

/**
*	加载Gltf模型
*/
function loadGltf(argument) {
	if (!gltfHasLoad) {
        var modelUrls = [
        	{
        		modelUrl:host + 'gltf/fuhai_02_1.gltf'
        	}
        	,{
        		modelUrl:host + 'gltf/fuhai_02_2.gltf'
        	}
        	,{
        		modelUrl:host + 'gltf/fuhai_02_3.gltf'
        	}
        	,{
        		modelUrl:host + 'gltf/fuhai_01.gltf'
        	}
        	,{
        		modelUrl:host + 'gltf/fuhai_03.gltf'
        	}
        	,{
        		modelUrl:host + 'gltf/fuhai_04.gltf'
        	}
        	,{
        		modelUrl:host + 'gltf/fuhai_05.gltf'
        	}
        	// ,{
        	// 	modelUrl:host + 'gltf/fuhai_line13.gltf'
        	// }
        ]
        var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
            Cesium.Cartesian3.fromDegrees(113.80746044325171,22.681914791515567, 30.0));
        for (var i = modelUrls.length - 1; i >= 0; i--) {
        	var model = scene.primitives.add(Cesium.Model.fromGltf({
	            url : modelUrls[i].modelUrl,//模型文件相对路径
	            modelMatrix : modelMatrix,
	            scene : scene
	            ,color: new Cesium.Color(0.6, 0.8, 1.0, 1.0),  // d1e2f5
	            // ,color: Cesium.Color.fromCssColorString('#d1e2f5').withAlpha(1.0),  // d1e2f5
	            colorBlendMode: Cesium.ColorBlendMode.MIX
	            // scale : 1.0//调整模型在地图中的大小
	        }));
	        if (i == 0) {
	        	// lon:113.79187801904338  lat:22.688256089156447  height:2483.6791764069703  heading:1.67  pitch:-58.03  roll:0.01
			 	// flyToHome(Cesium.Cartesian3.fromDegrees(113.79187801904338,22.688256089156447, 2483.6791764069703),
					// new Cesium.HeadingPitchRoll.fromDegrees(1.67,-60.03, 0.0),function(){
						
						// 加载直线扫描图
		 				LineScanPostState = loadLineScan([113.81823089678501,22.752496696239824],[113.77428470062301,22.674080076707547],'#00ffff',300,1000,50);

						// 加载主干道路
						loadRoads();
						// 加载改造片区
						loadTransformLand();

						// 加载交通流动图
						loadDynamicLines();

						// // 加载周边配套
						// loadInterestMark();

						// 加载圆形扫描图
					 	CircleScanPostState = loadCircleScan([113.792883714509,22.70182605408005],'#0066ff',500,2);
					// });	
		        }
        }
        var transModelUrl = host + 'gltf/fuhai_trans03.gltf';
        var transModel = scene.primitives.add(Cesium.Model.fromGltf({
            url : transModelUrl,//改造模型文件相对路径  fuhai_trans1.gltf
            modelMatrix : modelMatrix,
            scene : scene
            // ,color: new Cesium.Color(1.0, 0.0, 1.0, 1.0),  // d1e2f5
            ,color: Cesium.Color.fromCssColorString('#e77797').withAlpha(1.0)  // d1e2f5
            ,colorBlendMode: Cesium.ColorBlendMode.MIX
            // scale : 1.0//调整模型在地图中的大小
    	}));

        transModel.readyPromise.then(function(model) {
		  	// Play all animations when the model is ready to render
		  	model.activeAnimations.addAll();
		  	var modelMaterial = model.getMaterial('material');
		  	// modelMaterial.setValue('diffuse', new Cesium.Cartesian4(0.0, 0.7, 1.0, 1.0));  // vec4
		  	// modelMaterial.setValue('diffuse', new Cesium.Color(1.0, 0.0, 0.0, 1));  // vec4
		  	// modelMaterial.setValue('diffuse', new Cesium.Cartesian4(209, 226, 245, 0.5));  // vec4
			// modelMaterial.setValue('specular', '0.0'); // scalar
			// modelMaterial.setValue('shininess', '1.0'); // scalar
			// modelMaterial.setValue('normal', 'vec3(0.5)'); // scalar
			// modelMaterial.setValue('emission', new Cesium.Cartesian4(0.0, 0.6, 1.0, 1.0)); // emission
			// modelMaterial.setValue('alpha', 'color.rgb'); // emission
		});
        gltfHasLoad = true;
	}else {
		flyToHome(Cesium.Cartesian3.fromDegrees(113.79187801904338,22.688256089156447, 2483.6791764069703),
					new Cesium.HeadingPitchRoll.fromDegrees(1.67,-60.03, 0.0),null);
		// 加载直线扫描图
		LineScanPostState = loadLineScan([113.81823089678501,22.752496696239824],[113.77428470062301,22.674080076707547],'#00ffff',300,1000,50);

		// 加载圆形扫描图
	 	CircleScanPostState = loadCircleScan([113.792883714509,22.70182605408005],'#0066ff',500,2);

	 	// 显示周边配套
	 	switchLayerDisplay(LAYER_NAME.facilityPoi);	
	}
}

	/**
	* 清除圆形扫描和直线扫描
	*/
	function clearScanPostate(){
		if (LineScanPostState) {
			viewer.scene.postProcessStages.remove(LineScanPostState);
		}
		if (CircleScanPostState) {
			viewer.scene.postProcessStages.remove(CircleScanPostState);
		}
	}

	//  加载项目类型图表
	function loadRenovateTypeCountMark(){
		if (!RenovateTypeHasLoad) {
			renovateTypeCountMark(data1);
			renovateTypeCountMark(data2);
			renovateTypeCountMark(data3);
			renovateTypeCountMark(data4);
			renovateTypeCountMark(data5);
			renovateTypeCountMark(data6);
			renovateTypeCountMark(data7);
			renovateTypeCountMark(data8);
			renovateTypeCountMark(data9);
			renovateTypeCountMark(data10);
			renovateTypeCountMark(data11);
			RenovateTypeHasLoad = true;
		}
	}

	function loadProjectProcessInfo(){
		if (!ProjectProcessHasLoad) {
			//创建项目计划进度图表
			createChart_WithoutR(YanLuo);
			createChart_WithoutR(SongGang);
			createChart_WithoutR(ShaJing);
			createChart_WithoutR(FuHai);
			createChart_WithoutR(JiChang);
			createChart_WithoutR(HangCheng);
			createChart_WithoutR(ShiYan);
			createChart_WithoutR(XiXiang);
			createChart_WithoutR(XinAn);
			createChart_WithoutR(XinQiao);
			createChart_WithoutR(FuYong);

			createChart_Right1(YanLuo);
			createChart_Right1(SongGang);
			createChart_Right1(ShaJing);
			createChart_Right1(FuHai);
			createChart_Right1(JiChang);
			createChart_Right1(HangCheng);
			createChart_Right1(ShiYan);
			createChart_Right1(XiXiang);
			createChart_Right1(XinAn);
			createChart_Right1(XinQiao);
			createChart_Right1(FuYong);
			ProjectProcessHasLoad = true;
		}
	}

	var gymTag,kindergartenTag,hospital,library,parkTag,primarySchool,secondarySchool = null;
	function loadInterestMark(){
		if (!InterestMarkHasLoad) {
			gymTag = pointOfInterestMark(COLOUR.GREEN, POI_NAME.GYM.type, POI_NAME.GYM.position);
			kindergartenTag = pointOfInterestMark(COLOUR.ORANGE, POI_NAME.KINDERGARTEN.type, POI_NAME.KINDERGARTEN.position);
			hospital = pointOfInterestMark(COLOUR.RED, POI_NAME.HOSPITAL.type, POI_NAME.HOSPITAL.position); 
			library = pointOfInterestMark(COLOUR.GREEN, POI_NAME.LIBRARY.type, POI_NAME.LIBRARY.position); 
			parkTag = pointOfInterestMark(COLOUR.GREEN, POI_NAME.PARK.type, POI_NAME.PARK.position); 
			primarySchool = pointOfInterestMark(COLOUR.GREEN, POI_NAME.PRIMARY_SCHOOL.type, POI_NAME.PRIMARY_SCHOOL.position); 
			secondarySchool = pointOfInterestMark(COLOUR.GREEN, POI_NAME.SECONDARY_SCHOOL.type, POI_NAME.SECONDARY_SCHOOL.position); 
			InterestMarkHasLoad = true;
		}
		// changeColor(primarySchool, COLOUR.GREEN);
	}

	// 道路实体集
	var roadsDataSource = null;

	/**
	* 加载改造片区附近道路
	*/
	function loadRoads(){
		var czml = [{
		    "id" : "document",
		    "name" : "CZML Geometries: Polyline",
		    "version" : "1.0"
		}, {
		    "id" : "road1",
		    "name" : "道路1",
		    "polyline" : {
		        "positions" : {
		            "cartographicDegrees" : [
		                113.79890945567085, 22.703950890989977, 35,
		                113.7860192387091, 22.703904847908227, 35,
		                113.77805176552397, 22.704338974602443, 35,
		            ]
		        },
		        "material" : {
		            "solidColor" : {
		                "color" : {
		                    "rgba" : [255, 0 , 0, 255]
		                }
		            }
		        },
		        "width" : 15,
			    "clampToGround" : false
		    }
		},{
		    "id" : "road2",
		    "name" : "道路2",
		    "polyline" : {
		        "positions" : {
		            "cartographicDegrees" : [
		                113.79495945567085, 22.710064219242203, 35,
		                113.79495945567085, 22.706850959242857, 35,
		                113.79495945567085, 22.696085524001964, 35
		            ]
		        },
		        "material" : {
		            "solidColor" : {
		                "color" : {
		                    "rgba" : [255, 102, 0, 255]
		                }
		            }
		        },
		        "width" : 10,
			    "clampToGround" : false
		    }
		},{
			"id" : "road3",
			"name" : "道路3",
			"polyline" : {
			    "positions" : {
			        "cartographicDegrees" : [
			            113.80225114853054, 22.69981286062352, 35,
		                113.78988631026576, 22.69992735282093, 35,
		                113.78109691580916, 22.699832777560278, 35,
		                113.77755176552397, 22.70004569582374, 35
			        ]
			    },
			    "material" : {
			        "solidColor" : {
			            "color" : {
			                "rgba" : [9, 255, 0, 255]
			            }
			        }
			    },
			    "width" : 5,
			    "clampToGround" : false
			}
			},{
			"id" : "otherRoad",
			"name" : "otherRoad",
			"polyline" : {
			    "positions" : {
			        "cartographicDegrees" : [
			            113.79100945567085, 22.714264219242203, 35,
		                113.79120216011033, 22.70387031078723, 35,
		                113.78988631026576, 22.69992735282093, 35,
		                113.78792735914323, 22.696321856045286, 35
			        ]
			    },
			    "material" : {
			        "polylineDash" : {
			            "color" : {
			                "rgba" : [9, 255, 0, 255]
			            }
			        }
			    },
			    "width" : 2,
			    "clampToGround" : false
			}
			}];
		roadsDataSource= Cesium.CzmlDataSource.load(czml);
		viewer.dataSources.add(roadsDataSource);
		roadsDataSource.then(function(dataSources){
			changeCameraView(dataSources,0,-45,6000.0);
		});
	}

	// 加载交通流动图
	function loadDynamicLines() {
		viewer.entities.add({
			name : 'Orange line with black outline at height and following this surface',
			polyline : {
				positions : Cesium.Cartesian3.fromDegreesArrayHeights([
						113.79890945567085, 22.703950890989977, 36,
		                113.7860192387091, 22.703904847908227, 36,
		                113.77805176552397, 22.704338974602443, 36,
					   ]),
				width : 10,
				material : new Cesium.PolylineArrowLinkMaterialProperty({
					color : Cesium.Color.fromCssColorString('#FFFFFF').withAlpha(1.0),
					duration : 105000
				})
			}
		});
		viewer.entities.add({
			name : 'Red line with black outline at height and following this surface',
			polyline : {
				positions : Cesium.Cartesian3.fromDegreesArrayHeights([
					    113.79495945567085, 22.710064219242203, 36,
		                113.79495945567085, 22.706850959242857, 36,
		                113.79495945567085, 22.696085524001964, 36
						]),
				width : 10,
				material : new Cesium.PolylineArrowLinkMaterialProperty({
					color : Cesium.Color.fromCssColorString('#FFFFFF').withAlpha(1.0),
					duration : 105000
				})
			}
		});
		viewer.entities.add({
			name : '#3bfff8 line with black outline at height and following this surface',
			polyline : {													  
				positions : Cesium.Cartesian3.fromDegreesArrayHeights([
						113.79890945567085, 22.69981286062352, 36,
		                113.78988631026576, 22.69992735282093, 36,
		                113.7860192387091, 22.69992735282093, 36,
		                113.77755176552397, 22.70004569582374, 36
		                ]),
				width : 10,
				material : new Cesium.PolylineArrowLinkMaterialProperty({
					color : Cesium.Color.fromCssColorString('#FFFFFF').withAlpha(1.0),
					duration : 105000
				})
			}
		});
	}

	/**
	* 加载演示改造片区
	*
	*/
	function loadTransformLand(){
		var polygon = null;
		polygon = new Cesium.PolygonGeometry({
		  	polygonHierarchy : new Cesium.PolygonHierarchy(
			    Cesium.Cartesian3.fromDegreesArray([
			        113.79120216011033, 22.70387031078723,
			        113.79490945567085, 22.703930890989977,
			        113.79487014560826, 22.70001286062352,
			        113.78988631026576, 22.69992735282093
			    ])
			  ),
		  	height: 30,
		  // extrudedHeight : extrudedHeight,
		  classificationType : Cesium.ClassificationType.BOTH
		});

		var rectangle = scene.primitives.add(new Cesium.Primitive({
	        geometryInstances : [new Cesium.GeometryInstance({
	            geometry : polygon
	        })],
	        releaseGeometryInstances : false,
	        appearance : new Cesium.EllipsoidSurfaceAppearance({
	            aboveGround : false
	        })
	    }));
	    var drowningMeterial = new Cesium.Material({
	        fabric : {
	            type : 'Color',
	            uniforms : {
	                // image : host + '/img/map/number3.png'
	                color : Cesium.Color.fromCssColorString('#09a4ce').withAlpha(0.5)
	                // channel : 'r'
	            },
	            components: {
                	// diffuse : 'vec3(1.0)',
                	// diffuse : 'vec3(materialInput.normalEC)',
                	// diffuse : 'vec3(materialInput.positionToEyeEC)',
                	diffuse : 'color.rgb',
    				specular : '0.0',
    				shininess : '1.0',
    				emission : 'color.rgb',  // 自发光
				    alpha : 'color.a'
            	}
	        }
	     });
	    rectangle.appearance.material = drowningMeterial;
	    // viewer.zoomTo(polygon);
	}

	// var roadPressure = {name:'道路1',value:0.98}
	/**
	* 动态变更道路饱和度
	*/
	function changeLoadColor(roadPressure){
		if (roadsDataSource) {
			roadsDataSource.then(function(dataSources){
				var roadEntities = dataSources.entities.values;
				if (roadEntities && roadEntities.length > 0) {
					for (var i = roadEntities.length - 1; i >= 0; i--) {
						var roadEntity = roadEntities[i];
						var material = roadEntity.polyline.material;
						var lineWidth = roadEntity.polyline.width;
						if (roadEntity.name == roadPressure.name) {
							var pressure = roadPressure.value;
							if (pressure < 0.6) {
								material = Cesium.Color.fromCssColorString('#09ff00').withAlpha(1.0);
								lineWidth = 5;
							}else if (pressure >= 0.6 && pressure <0.9 ) {
								material = Cesium.Color.ORANGE;
								lineWidth = 10;
							}else{
								material = Cesium.Color.RED;
								lineWidth = 15;
							}
							roadEntity.polyline.material = material;
							roadEntity.polyline.width = lineWidth;
							break;
						}
					}
				}
			});
		}
	}

	/**
	* 动态变更圆形扫描范围
	*/
	function changeCircleRadius(radius){
		if (CircleScanPostState) {
			viewer.scene.postProcessStages.remove(CircleScanPostState);
			var time = (radius / 500) * 2;
			CircleScanPostState = loadCircleScan([113.792883714509,22.70182605408005],'#0066ff',radius,time);
		}
	}


	/**
	* 动态变更周边配套颜色 zbpt = {name:'初中',value: 0.95}
	* 	var gymTag,kindergartenTag,hospital,library,parkTag,primarySchool,secondarySchool = null;
	*/
	function changeZbptRadius(zbpt){
		var changeTarget = null;
		var targetColor = COLOUR.GREEN;
		if (zbpt) {
			// 更改目标配置设施
			if (zbpt.name == '幼儿园') {
				changeTarget = kindergartenTag;
			}else if (zbpt.name == '小学') {
				changeTarget = primarySchool;
			}else if (zbpt.name == '初中') {
				changeTarget = secondarySchool;
			}
			// 更改色系
			if (zbpt.value <= 0.6) {
				targetColor = COLOUR.GREEN;
			}else if (zbpt.value > 0.6 && zbpt.value <= 0.9) {
				targetColor = COLOUR.ORANGE;
			}else if (zbpt.value > 0.9) {
				targetColor = COLOUR.RED;
			}
			if (changeTarget) {
				changeColor(changeTarget, targetColor);
			}
		}
	}
	