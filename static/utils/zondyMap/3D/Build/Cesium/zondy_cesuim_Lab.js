
/**
*
*   深圳中地Cesium 效果实验室
*	
*   @lastVersion V 1.0
*	@currentVersion V 1.1.0
*	
*	@author Yu HuaWen
*	@date 2018/10/20
*
*   @版权所有 深圳市中地软件有限公司
**/

var zdCesiumLab = {
	name: "Zondy for Cesium三维地球框架",
	version: "1.1.0",
	author: "Yu HuaWen",
	company: "深圳市中地软件有限公司"
};

// --------------------定义雷达扫描线 api Start---------------------
/**
*  雷达扫描线
* @param {} options 参数集
* @param {Cesium.Viewer} _viewer 视图对象
* @param {Cesium.Cartographic} _cartographicCenter 扫描中心
* @param {Number} _radius 半径(米)
* @param {Cesium.Color} _scanColor 扫描颜色
* @param {Number} _duration 持续时间 秒
*
* @author yu Huawen
* @date 2018/10/25
*/
zdCesiumLab.AddLidarScanPostStage = function(options) {
	
	var _viewer = options.viewer;
	var _cartographicCenter = options.cartographicCenter;
	var _radius = options.radius;
	var _scanColor = options.scanColor;
	var _duration = options.duration * 1000;

	var scanSegmentShader = 
	"uniform sampler2D colorTexture;\n" +
	"uniform sampler2D depthTexture;\n" +
	"varying vec2 v_textureCoordinates;\n" +
	"uniform vec4 u_scanCenterEC;\n" +
	"uniform vec3 u_scanPlaneNormalEC;\n" +
	"uniform vec3 u_scanLineNormalEC;\n" +
	"uniform float u_radius;\n" +
	"uniform vec4 u_scanColor;\n" +
	"vec4 toEye(in vec2 uv,in float depth)\n" +
	"{\n" +
		"vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));\n" +
		"vec4 posInCamera = czm_inverseProjection * vec4(xy,depth,1.0);\n" +
		"posInCamera = posInCamera / posInCamera.w;\n" +
		"return posInCamera;\n" +
	"}\n" +
	"bool isPointOnLineRight(in vec3 ptOnLine,in vec3 lineNormal,in vec3 testPt)\n" +
	"{\n" +
		"vec3 v01 = testPt - ptOnLine;\n" +
		"normalize(v01);\n" + 
		"vec3 temp = cross(v01,lineNormal);\n" + 
		"float d = dot(temp,u_scanPlaneNormalEC);\n" +
		"return d > 0.5;\n" +
	"}\n" +
	"vec3 pointProjectOnPlane(in vec3 planeNormal,in vec3 planeOrigin,in vec3 point)\n" +
	"{\n" +
		"vec3 v01 = point - planeOrigin;\n" +
		"float d = dot(planeNormal,v01); \n" +
		"return (point - planeNormal * d);\n" +
	"}\n" +
	"float distancePointToLine(in vec3 ptOnLine,in vec3 lineNormal,in vec3 testPt)\n" +
	"{\n" +
		"vec3 tempPt = pointProjectOnPlane(lineNormal,ptOnLine,testPt);\n" +
		"return length(tempPt - ptOnLine);\n" +
	"}\n" +
	"float getDepth(in vec4 depth)\n" +
	"{\n" +
		"float z_window = czm_unpackDepth(depth);\n" +
		"z_window = czm_reverseLogDepth(z_window);\n" +
		"float n_range = czm_depthRange.near;\n" +
		"float f_range = czm_depthRange.far;\n" +
		"return (2.0 * z_window - n_range - f_range) / (f_range - n_range);\n" + 
	"}\n" +
	"void main()\n" +
	"{\n" +
		"gl_FragColor = texture2D(colorTexture,v_textureCoordinates);\n" +
		"float depth = getDepth(texture2D(depthTexture,v_textureCoordinates));\n" +
		"vec4 viewPos = toEye(v_textureCoordinates,depth);\n" +
		"vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz,u_scanCenterEC.xyz,viewPos.xyz);\n" +
		"float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);\n" +
		"float twou_radius = u_radius * 1.5;\n" +
		"if(dis <= u_radius)\n" +
		"{\n" +
			"float f0 = 1.0 - abs(u_radius - dis)/ u_radius;\n"+
			"f0 = pow(f0,10.0);\n" +
			"vec3 lineEntPt = vec3(u_scanCenterEC.xyz) + u_scanLineNormalEC * u_radius;\n" +
			"float f = 0.0;\n" + 
			"if(isPointOnLineRight(u_scanCenterEC.xyz,u_scanLineNormalEC.xyz,prjOnPlane.xyz))\n" +
			"{\n" +
				"float dis1 = length(prjOnPlane.xyz - lineEntPt);\n" +
				"f = abs(twou_radius - dis1) / twou_radius;\n" +
				"f = pow(f,3.0);\n" +
			"}\n" +
			"gl_FragColor = mix(gl_FragColor,u_scanColor,f+f0);\n" +
		"}\n" +
	"}\n";
	// 
	var _Cartesian3Center = Cesium.Cartographic.toCartesian(_cartographicCenter);
	var _Cartesian4Center = new Cesium.Cartesian4(_Cartesian3Center.x,_Cartesian3Center.y,_Cartesian3Center.z,1);
	//
	var _CartographicCenter1 = new Cesium.Cartographic(_cartographicCenter.longitude,_cartographicCenter.latitude,_cartographicCenter.height + 500);
	var _Cartesian3Center1 = Cesium.Cartographic.toCartesian(_CartographicCenter1);
	var _Cartesian4Center1 = new Cesium.Cartesian4(_Cartesian3Center1.x,_CartographicCenter1.y,_CartographicCenter1.z,1);
	//
	var _CartographicCenter2 = new Cesium.Cartographic(_cartographicCenter.longitude + Cesium.Math.toRadians(0.001),_cartographicCenter.latitude,_cartographicCenter.height);
	var _Cartesian3Center2 = Cesium.Cartographic.toCartesian(_CartographicCenter2);
	var _Cartesian4Center2 = new Cesium.Cartesian4(_Cartesian3Center2.x,_Cartesian3Center2.y,_Cartesian3Center2.z,1);
	var _RotateQ = new Cesium.Quaternion();
	var _RotateM = new Cesium.Matrix3();
	//
	var _time = (new Date()).getTime();
	//
	var _scratchCartesian4Center = new Cesium.Cartesian4();
	var _scratchCartesian4Center1 = new Cesium.Cartesian4();
	var _scratchCartesian4Center2 = new Cesium.Cartesian4();
	var _scratchCartesian3Normal = new Cesium.Cartesian3();
	var _scratchCartesian3Normal1 = new Cesium.Cartesian3();
	var ScanPostState = new Cesium.PostProcessStage({
		fragmentShader : scanSegmentShader,
		uniforms : {
			u_scanCenterEC : function() {
				return Cesium.Matrix4.multiplyByVector(_viewer.camera._viewMatrix,_Cartesian4Center,_scratchCartesian4Center);
			},
			u_scanPlaneNormalEC : function() {
				//
				var temp = Cesium.Matrix4.multiplyByVector(_viewer.camera._viewMatrix,_Cartesian4Center,_scratchCartesian4Center);
				var temp1 = Cesium.Matrix4.multiplyByVector(_viewer.camera._viewMatrix,_Cartesian4Center1,_scratchCartesian4Center1);
				_scratchCartesian3Normal.x = temp1.x - temp.x;
				_scratchCartesian3Normal.y = temp1.y - temp.y;
				_scratchCartesian3Normal.z = temp1.z - temp.z;
				//
				Cesium.Cartesian3.normalize(_scratchCartesian3Normal,_scratchCartesian3Normal);
				return _scratchCartesian3Normal;
			},
			u_radius : _radius,
			u_scanLineNormalEC : function() {
				//
				var temp = Cesium.Matrix4.multiplyByVector(_viewer.camera._viewMatrix,_Cartesian4Center,_scratchCartesian4Center);
				var temp1 = Cesium.Matrix4.multiplyByVector(_viewer.camera._viewMatrix,_Cartesian4Center1,_scratchCartesian4Center1);
				var temp2 = Cesium.Matrix4.multiplyByVector(_viewer.camera._viewMatrix,_Cartesian4Center2,_scratchCartesian4Center2);
				//
				_scratchCartesian3Normal.x = temp1.x - temp.x;
				_scratchCartesian3Normal.y = temp1.y - temp.y;
				_scratchCartesian3Normal.z = temp1.z - temp.z;
				//
				Cesium.Cartesian3.normalize(_scratchCartesian3Normal,_scratchCartesian3Normal);
				//
				_scratchCartesian3Normal1.x = temp2.x - temp.x;
				_scratchCartesian3Normal1.y = temp2.y - temp.y;
				_scratchCartesian3Normal1.z = temp2.z - temp.z;
				//
				var tempTime = (((new Date()).getTime() - _time) % _duration) / _duration;
				Cesium.Quaternion.fromAxisAngle(_scratchCartesian3Normal,tempTime * Cesium.Math.PI*2,_RotateQ);
				Cesium.Matrix3.fromQuaternion(_RotateQ,_RotateM);
				Cesium.Matrix3.multiplyByVector(_RotateM,_scratchCartesian3Normal1,_scratchCartesian3Normal1);
				Cesium.Cartesian3.normalize(_scratchCartesian3Normal1,_scratchCartesian3Normal1);
				return _scratchCartesian3Normal1;
			},
			u_scanColor : _scanColor
		}
	});
	_viewer.scene.postProcessStages.add(ScanPostState);
}
// --------------------定义雷达扫描线 api End---------------------


// --------------------定义圆形扫描线 api Start---------------------
/**
*  圆形扫描线
* @param {} options 参数集
* @param {Cesium.Viewer} _viewer 视图对象
* @param {Cesium.Cartographic} _cartographicCenter 扫描中心
* @param {Number} _maxRadius 最大半径(米)
* @param {Cesium.Color} _scanColor 扫描颜色
* @param {Number} _duration 持续时间 秒
*
* @author yu Huawen
* @date 2018/10/25
*/
zdCesiumLab.AddCircleScanPostStage = function(options) {
	var _viewer = options.viewer;
	var _cartographicCenter = options.cartographicCenter;
	var _maxRadius = options.maxRadius;
	var _scanColor = options.scanColor;
	var _duration = options.duration * 1000;
	 var scanSegmentShader =

	    "uniform sampler2D colorTexture;\n" +

	    "uniform sampler2D depthTexture;\n" +

	    "varying vec2 v_textureCoordinates;\n" +

	    "uniform vec4 u_scanCenterEC;\n" +

	    "uniform vec3 u_scanPlaneNormalEC;\n" +

	    "uniform float u_radius;\n" +

	    "uniform vec4 u_scanColor;\n" +

	    "vec4 toEye(in vec2 uv, in float depth)\n" +

	    " {\n" +

	      " vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));\n" +

	      " vec4 posInCamera =czm_inverseProjection * vec4(xy, depth, 1.0);\n" +

	      " posInCamera =posInCamera / posInCamera.w;\n" +

	      " return posInCamera;\n" +

	    " }\n" +

	    "vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point)\n" +

	    "{\n" +

	        "vec3 v01 = point -planeOrigin;\n" +

	        "float d = dot(planeNormal, v01) ;\n" +

	        "return (point - planeNormal * d);\n" +

	     "}\n" +

	     "float getDepth(in vec4 depth)\n" +

	     "{\n" +

	        "float z_window = czm_unpackDepth(depth);\n" +

	        "z_window = czm_reverseLogDepth(z_window);\n" +

	        "float n_range = czm_depthRange.near;\n" +

	        "float f_range = czm_depthRange.far;\n" +

	        "return (2.0 * z_window - n_range - f_range) / (f_range - n_range);\n" +

	     "}\n" +

	     "void main()\n" +

	     "{\n" +

	        "gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n" +

	        "float depth = getDepth( texture2D(depthTexture, v_textureCoordinates));\n" +

	        "vec4 viewPos = toEye(v_textureCoordinates, depth);\n" +

	        "vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz, u_scanCenterEC.xyz, viewPos.xyz);\n" +

	        "float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);\n" +

	        "if(dis < u_radius)\n" +

	            "{\n" +

	            "float f = 1.0 -abs(u_radius - dis) / u_radius;\n" +

	            "f = pow(f, 4.0);\n" +

	            "gl_FragColor = mix(gl_FragColor, u_scanColor, f);\n" +

	         "}\n" +

	      "}\n";
	// 
	var _Cartesian3Center = Cesium.Cartographic.toCartesian(_cartographicCenter);
	var _Cartesian4Center = new Cesium.Cartesian4(_Cartesian3Center.x,_Cartesian3Center.y,_Cartesian3Center.z,1);
	//
	var _CartographicCenter1 = new Cesium.Cartographic(_cartographicCenter.longitude,_cartographicCenter.latitude,_cartographicCenter.height + 500);
	var _Cartesian3Center1 = Cesium.Cartographic.toCartesian(_CartographicCenter1);
	var _Cartesian4Center1 = new Cesium.Cartesian4(_Cartesian3Center1.x,_Cartesian3Center1.y,_Cartesian3Center1.z,1);
	//
	var _time = (new Date()).getTime();
	//
	var _scratchCartesian4Center = new Cesium.Cartesian4();
	var _scratchCartesian4Center1 = new Cesium.Cartesian4();
	var _scratchCartesian3Normal = new Cesium.Cartesian3();
	var ScanPostState = new Cesium.PostProcessStage({
		fragmentShader : scanSegmentShader,
		uniforms : {
			u_scanCenterEC : function() {
				return Cesium.Matrix4.multiplyByVector(_viewer.camera._viewMatrix,_Cartesian4Center,_scratchCartesian4Center);
			},
			u_scanPlaneNormalEC : function() {
				//
				var temp = Cesium.Matrix4.multiplyByVector(_viewer.camera._viewMatrix,_Cartesian4Center,_scratchCartesian4Center);
				var temp1 = Cesium.Matrix4.multiplyByVector(_viewer.camera._viewMatrix,_Cartesian4Center1,_scratchCartesian4Center1);
				_scratchCartesian3Normal.x = temp1.x - temp.x;
				_scratchCartesian3Normal.y = temp1.y - temp.y;
				_scratchCartesian3Normal.z = temp1.z - temp.z;
				//
				Cesium.Cartesian3.normalize(_scratchCartesian3Normal,_scratchCartesian3Normal);
				return _scratchCartesian3Normal;
			},
			u_radius : function() {
				return _maxRadius * (((new Date()).getTime() - _time) % _duration) / _duration;
			},
			u_scanColor : _scanColor
		}
	});
	//
	viewer.scene.postProcessStages.add(ScanPostState);
	return ScanPostState;
}
// --------------------定义圆形扫描线 api End---------------------


// --------------------定义直线扫描线 api Start---------------------
/**
*  直线扫描线
* @param {} options 参数集
* @param {Cesium.Viewer} viewer 视图对象
* @param {Cesium.Cartographic} scanCenter 扫描中心
* @param {Cesium.Cartesian3} dirPostion 扫描方向坐标
* @param {Cesium.Color} scanColor 扫描颜色
* @param {Number} speed 扫描速度(米/秒)
* @param {Number} lineWidth 线宽(米)
* @param {Number} period 持续时间 秒
*
* @author yu Huawen
* @date 2018/11/10
*/
zdCesiumLab.AddLineScanPostStage = function(options) {

	var _viewer = options.viewer;
	var _posCenter = options.scanCenter;
	var _dirPostion = options.dirPostion;
	var _scanColor = options.scanColor;
	var _speed = options.speed;
	var _lineWidth = options.lineWidth;
	var _period = options.period;

	if (!Cesium.defined(_dirPostion)) {
		_dirPostion = new Cesium.Cartesian3(0, 0, 1);
	}

	var scanLineSegmentShader =
	"uniform sampler2D colorTexture;\n" +
	"uniform sampler2D depthTex;\n" +
	"varying vec2 v_textureCoordinates;\n" +
	"uniform vec4 u_scanCenterEC;\n" +
	"uniform vec3 u_scanPlaneNormalEC;\n" +
	"uniform vec3 u_scanLineDir;\n" +
	"uniform vec3 u_scanLinePt;\n" +
	"uniform float u_lineWidth;\n" +
	"uniform vec4 u_scanColor;\n" +
	"vec4 toEye(in vec2 uv,in float depth)\n" +
	"{\n" +
		"vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));\n" +
		"vec4 posInCamera = czm_inverseProjection * vec4(xy,depth,1.0);\n" +
		"posInCamera = posInCamera / posInCamera.w;\n" +
		"return posInCamera;\n" +
	"}\n" +
	"float distancePointToLine(vec3 ptOnLine, vec3 vectorLine, vec3 testPt)\n" +
		"{\n" +
			"vec3 v = vectorLine;\n" +
			"vec3 w = testPt - ptOnLine;\n" +
			"float c1 = dot(w, v);\n" +
			"float c2 = dot(v, v);\n" +
			"float b = c1 / c2;\n" +
			"vec3 Pb = ptOnLine + b * v;\n" +
			"return length(testPt - Pb);\n" +
	"}\n" +
	"vec3 pointProjectOnPlane(in vec3 planeNormal,in vec3 planeOrigin,in vec3 point)\n" +
	"{\n" +
		"vec3 v01 = point - planeOrigin;\n" +
		"float d = dot(planeNormal,v01); \n" +
		"return (point - planeNormal * d);\n" +
	"}\n" +
	"float getDepth(in vec4 depth)\n" +
	"{\n" +
		"float z_window = czm_unpackDepth(depth);\n" +
		"z_window = czm_reverseLogDepth(z_window);\n" +
		"float n_range = czm_depthRange.near;\n" +
		"float f_range = czm_depthRange.far;\n" +
		"return (2.0 * z_window - n_range - f_range) / (f_range - n_range);\n" + 
	"}\n" +
	"void main()\n" +
	"{\n" +
		"gl_FragColor = texture2D(colorTexture,v_textureCoordinates);\n" +
		"float depth = getDepth(texture2D(depthTex,v_textureCoordinates));\n" +
		"float scale = pow(depth * 0.5 + 0.5, 8.0);\n" +
		"if(scale < 0.0001)\n" +
		"{\n" +
			"gl_FragColor.r = 0.0;\n" +
			"return;\n" +
		"}\n" +
		"vec4 viewPos = toEye(v_textureCoordinates,depth);\n" +
		"vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz,u_scanCenterEC.xyz,viewPos.xyz);\n" +
		"float dis = distancePointToLine(u_scanLinePt, u_scanLineDir, prjOnPlane.xyz);\n" +
		"if(dis < u_lineWidth)\n" +
		"{\n" +
			"float f = abs(u_lineWidth - dis) / u_lineWidth;\n" +
			"f = pow(f, 8.0);\n" +
			"gl_FragColor = mix(gl_FragColor,u_scanColor,f);\n" +
		"}\n" +
	"}\n";
	//
	var _scanLineMoveDir = new Cesium.Cartesian3();
	var _scanLinePt = new Cesium.Cartesian3();
	var _scanLineDir = new Cesium.Cartesian3();
	var M =  new Cesium.Cartesian3();
	
	var _scanCenter = new Cesium.Cartesian4(_posCenter.x,_posCenter.y,_posCenter.z,1);
	//
	var _cartographicCenter = Cesium.Cartographic.fromCartesian(_posCenter);
	var _CartographicCenter1 = new Cesium.Cartographic(_cartographicCenter.longitude,_cartographicCenter.latitude,_cartographicCenter.height + 500);
	var _Cartesian3Center1 = Cesium.Cartographic.toCartesian(_CartographicCenter1);
	var _Cartesian4Center1 = new Cesium.Cartesian4(_Cartesian3Center1.x,_Cartesian3Center1.y,_Cartesian3Center1.z,1);
	//
	var _time = performance.now();
	//
	var _scratchCartesian4Center = new Cesium.Cartesian4();
	var _scratchCartesian4Center1 = new Cesium.Cartesian4();
	var _scratchCartesian4Center2 = new Cesium.Cartesian4();
	var _scratchCartesian3Normal = new Cesium.Cartesian3();
	var _scratchCartesian3Normal1 = new Cesium.Cartesian3();

	
	var ScanPostState = new Cesium.PostProcessStage({
		fragmentShader : scanLineSegmentShader,
		uniforms : {
			depthTex : function() {
				return _viewer.scene._defaultView.pickDepths[0]._depthTexture
			},
			u_scanCenterEC : function() {
				return Cesium.Matrix4.multiplyByVector(_viewer.camera._viewMatrix,_scanCenter,_scratchCartesian4Center);
			},
			u_scanPlaneNormalEC : function() {
				//
				var temp = Cesium.Matrix4.multiplyByVector(_viewer.camera._viewMatrix,_scanCenter,_scratchCartesian4Center);
				var temp1 = Cesium.Matrix4.multiplyByVector(_viewer.camera._viewMatrix,_Cartesian4Center1,_scratchCartesian4Center1);
				_scratchCartesian3Normal.x = temp1.x - temp.x;
				_scratchCartesian3Normal.y = temp1.y - temp.y;
				_scratchCartesian3Normal.z = temp1.z - temp.z;
				//
				Cesium.Cartesian3.normalize(_scratchCartesian3Normal,_scratchCartesian3Normal);
				return _scratchCartesian3Normal;
			},
			u_scanLinePt : function() {
				_scanLineMoveDir = Cesium.Cartesian3.subtract(_dirPostion,_scanCenter, _scanLineMoveDir);
				_scanLineMoveDir = Cesium.Cartesian3.normalize(_scanLineMoveDir, _scanLineMoveDir);
				
				var r = _viewer.camera;
				var t = _speed * (((performance.now() - _time)/ 1000) % _period);
				_scanLinePt = Cesium.Cartesian3.multiplyByScalar(_scanLineMoveDir, t, _scanLinePt);
				_scanLinePt = Cesium.Cartesian3.add(_scanCenter, _scanLinePt, _scanLinePt);
				M.x = _scanLinePt.x, M.y = _scanLinePt.y, M.z = _scanLinePt.z, M.w = 1;
				M = Cesium.Matrix4.multiplyByVector(r.viewMatrix, M, M);
				_scanLinePt.x = M.x;
				_scanLinePt.y = M.y;
				_scanLinePt.z = M.z;
				return _scanLinePt;
			},
			u_scanLineDir : function() {
				_scanLineMoveDir = Cesium.Cartesian3.subtract(_dirPostion,_scanCenter, _scanLineMoveDir);
				_scanLineMoveDir = Cesium.Cartesian3.normalize(_scanLineMoveDir, _scanLineMoveDir);
				
				var r = _viewer.camera;
				if(_viewer.scene.mode === Cesium.SceneMode.SCENE2D)
				  _scanLineDir = Cesium.Cartesian3.cross(_scanLineMoveDir, new Cesium.Cartesian3(0, 0, 1), _scanLineDir) 
				else
				{
					_scanLineDir = Cesium.Cartesian3.cross(_scanLineMoveDir, _scanCenter, _scanLineDir);
					Cesium.Cartesian3.normalize(_scanLineDir, _scanLineDir);
				}
				var i = new Cesium.Cartesian3();
				i = Cesium.Cartesian3.multiplyByScalar(_scanLineDir, 10, i);
				i = Cesium.Cartesian3.add(_scanCenter, i, i);
				M.x = i.x, M.y = i.y, M.z = i.z, M.w = 1;
				M = Cesium.Matrix4.multiplyByVector(r.viewMatrix, M, M);
				_scanLineDir.x = M.x - _scratchCartesian4Center.x;
				_scanLineDir.y = M.y - _scratchCartesian4Center.y;
				_scanLineDir.z = M.z - _scratchCartesian4Center.z;
				Cesium.Cartesian3.normalize(_scanLineDir, _scanLineDir)
				return _scanLineDir;
			},
			u_scanColor : _scanColor,
			u_lineWidth : _lineWidth
		}
	});
	//
	viewer.scene.postProcessStages.add(ScanPostState);
	return ScanPostState;
}
// --------------------定义直线扫描线 api End---------------------


// --------------------定义按照固定半径计算坐标 api Start---------------------
/**
*  按照固定半径计算坐标
* @param {} options 参数集
* @param {Cesium.Clock} _clock 时钟对象
* @param {float} _startLon 起始坐标经度
* @param {float} _startLat 起始坐标纬度
* @param {Number} _radius 半径 米
*
* @author yu Huawen
* @date 2018/11/10
*/
zdCesiumLab.computeCirclularFlight = function (options) {

	var _clock = options.clock;
	var _startLon = options.startLon;
	var _startLat = options.startLat;
	var _radius = options.radius;

	var property = new Cesium.SampledPositionProperty();
	var pointStart = _clock.startTime;
	var totolSeconds = Cesium.JulianDate.compare(_clock.stopTime,_clock.startTime);
	for (var i = 0; i <= totolSeconds; i += 0.1) {
	    var radians = Cesium.Math.toRadians(i);
	    var time = Cesium.JulianDate.addSeconds(pointStart, i, new Cesium.JulianDate());
	    var position = Cesium.Cartesian3.fromDegrees(_startLon - (_radius * 1.5 * Math.cos(radians)), _startLat - (_radius * Math.sin(radians)), Cesium.Math.nextRandomNumber() * 500 + 1750);
	    property.addSample(time, position);
	}
	return property;
}
// --------------------定义按照固定半径计算坐标 api End---------------------


// --------------------定义动态线渲染材质 api Start---------------------
/**
* 动态线渲染材质 
* @param {} options 参数集
* @param {Cesium.Color} _color 颜色
* @param {Number} _duration 持续时间 毫秒
*
* @author yu Huawen
* @date 2018/11/10
*/
var PolylineArrowLinkMaterialProperty = function(options) {
	this._definitionChanged = new Cesium.Event();
	this._color = undefined;
	this._colorSubscription = undefined;
	this.color = options.color;
	this.duration = options.duration || 1e3;
	this._time = (new Date()).getTime();

    }
    Cesium.defineProperties(PolylineArrowLinkMaterialProperty.prototype, {
		isConstant : {
			get : function() {
				return false;
			}
		},
		definitionChanged : {
			get : function() {
				return this._definitionChanged;
			}
		},
		color : Cesium.createPropertyDescriptor('color')
	});
	PolylineArrowLinkMaterialProperty.prototype.getType = function(time) {
		return Cesium.Material.PolylineArrowLinkType;
	};
	PolylineArrowLinkMaterialProperty.prototype.getValue = function(time, result) {
		if (!Cesium.defined(result)) {
			result = {};
		}
		result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
		result.image = Cesium.Material.PolylineTrailLinkImage;
		result.time = (((new Date()).getTime() - this._time) % this.duration) / 1000.0;
		return result;
	};
	PolylineArrowLinkMaterialProperty.prototype.equals = function(other) {
		return this === other || (other instanceof PolylineArrowLinkMaterialProperty && Cesium.Property.equals(this._color, other._color));
	};
Cesium.PolylineArrowLinkMaterialProperty = PolylineArrowLinkMaterialProperty;
Cesium.Material.PolylineArrowLinkType = "PolylineArrowLink";
Cesium.Material.PolylineTrailLinkImage =  host + "/img/map/point.png";
Cesium.Material.PolyLineTrailLinkSource = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
											{\n\
												czm_material material = czm_getDefaultMaterial(materialInput);\n\
												vec2 st = materialInput.st;\n\
												material.alpha = texture2D(image, vec2(fract(st.s - time), st.t)).a * color.a;\n\
												material.diffuse = color.rgb;\n\
												material.emission = color.rgb;\n\
												return material;\n\
											}";
Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineArrowLinkType, {
		fabric : {
			type : Cesium.Material.PolylineArrowLinkType,
			uniforms : {
				color : new Cesium.Color(1.0, 0.0, 0.0, 1),
				image : Cesium.Material.PolylineTrailLinkImage,
				time : 0
			},
			source : Cesium.Material.PolyLineTrailLinkSource
		},
		translucent : function(material) {
			return true;
		}
});	
zdCesiumLab.PolylineArrowLinkMaterialProperty = Cesium.PolylineArrowLinkMaterialProperty;
// --------------------定义动态线渲染材质 api End-------------------------


// --------------------定义图片叠加颜色材质 api Start---------------------
/**
* 图片叠加颜色材质
* @param {} options 参数集
* @param {Cesium.Color} _color 颜色
* @param {Number} _duration 持续时间 毫秒
*
* @author yu Huawen
* @date 2018/12/10
*/
var ImageWithColorMaterialProperty = function(options) {
	this._definitionChanged = new Cesium.Event();
	this._color = undefined;
	this._image = undefined;
	this._colorSubscription = undefined;
	this.color = options.color;
	this.image = options.image;
	this._time = (new Date()).getTime();
}
Cesium.defineProperties(ImageWithColorMaterialProperty.prototype, {
	isConstant : {
		get : function() {
			return false;
		}
	},
	definitionChanged : {
		get : function() {
			return this._definitionChanged;
		}
	},
	color : Cesium.createPropertyDescriptor('color'),
	image : Cesium.createPropertyDescriptor('image')
});
ImageWithColorMaterialProperty.prototype.getType = function(time) {
	return Cesium.Material.ImageWithColorType;
};
ImageWithColorMaterialProperty.prototype.getValue = function(time, result) {
	if (!Cesium.defined(result)) {
		result = {};
	}
	result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
	result.image = Cesium.Property.getValueOrClonedDefault(this._image, time, Cesium.Material.defaultImage, result.image);
	return result;
};
ImageWithColorMaterialProperty.prototype.equals = function(other) {
	return this === other || (other instanceof ImageWithColorMaterialProperty && Cesium.Property.equals(this._color, other._color)&&
        Cesium.Property.equals(this._image, other._image));
};
Cesium.ImageWithColorMaterialProperty = ImageWithColorMaterialProperty;
Cesium.Material.ImageWithColorType = 'ImageWithColor';
Cesium.Material.defaultImage = host + '/img/map/menu.png';
Cesium.Material._materialCache.addMaterial(Cesium.Material.ImageWithColorType, {
	fabric : {
		type : Cesium.Material.ImageWithColorType,
		uniforms : {
			image : '',
			repeat : new Cesium.Cartesian2(1.0, 1.0),
	        color : new Cesium.Color(1.0, 0.0, 0.0, 1)
		},
		components: {
        	diffuse : 'texture2D(image, fract(repeat * materialInput.st)).rgb * color.rgb',
			specular : '0.0',  // 反光效果 0.0不反光
			shininess : '1.0', // 反光锐度
			normal : 'vec3(1.0)',  // 材质的法向属性。使用 vec3定义了在视点空间的表面法向量。一般在法向贴图上使用。默认是表面法向量。
			emission : 'texture2D(image, fract(repeat * materialInput.st)).rgb',  // 自发光
		    // alpha : 'texture2D(image, vec2(materialInput.st.s, materialInput.st.t)).a * color.a'
		    alpha : '1.0'
    	}
	},
	translucent : function(material) {
		return true;
	}
});	
zdCesiumLab.ImageWithColorMaterialProperty = Cesium.ImageWithColorMaterialProperty;
// --------------------定义图片叠加颜色材质 api End---------------------


// --------------------定义动态扩散材质 api Start---------------------
/**
* 动态扩散材质
* @param {} options 参数集
* @param {Cesium.Color} _color 颜色
* @param {Number} _duration 持续时间 毫秒
*
* @author yu Huawen
* @date 2019/05/14
*/
var ElliposidFadeMaterialProperty = function(options) {
	// options = s(options, s.EMPTY_OBJECT),
	this._definitionChanged = new Cesium.Event(),
    this._color = undefined,
    this._colorSubscription = undefined,
    this.color = options.color,
    this._duration = options.duration || 1e3,
    this._time = (new Date()).getTime()
    // this._time = undefined
}
var o = Cesium.Color
      , s = Cesium.defaultValue
      , l = Cesium.defined
      , u = Cesium.defineProperties
      , c = Cesium.Event
      , d = Cesium.createPropertyDescriptor
      , h = Cesium.Property
      , f = Cesium.Material
      , p = o.WHITE;
Cesium.defineProperties(ElliposidFadeMaterialProperty.prototype, {
	isConstant : {
		get : function() {
			return false;
		}
	},
	definitionChanged : {
		get : function() {
			return this._definitionChanged;
		}
	},
	color : d("color")
});
ElliposidFadeMaterialProperty.prototype.getType = function(time) {
	return Cesium.Material.ElliposidFadeType;
};
ElliposidFadeMaterialProperty.prototype.getValue = function(time, result) {
	if (!Cesium.defined(result)) {
		result = {};
	}
	result.color = h.getValueOrClonedDefault(this._color, time, p, result.color);	
	result.time = (((new Date()).getTime() - this._time) % this._duration) / this._duration;
	return result;
};
ElliposidFadeMaterialProperty.prototype.equals = function(other) {
	return this === other || (other instanceof ElliposidFadeMaterialProperty && Cesium.Property.equals(this._color, other._color));
};
Cesium.ElliposidFadeMaterialProperty = ElliposidFadeMaterialProperty;
Cesium.Material.ElliposidFadeType = 'ElliposidFade';
Cesium.Material.defaultImage = host + '/img/map/menu.png';
Cesium.Material._materialCache.addMaterial(Cesium.Material.ElliposidFadeType, {
	fabric : {
		type : Cesium.Material.ElliposidFadeType,
		uniforms : {
			color: new o(1,0,0,1),
            time: 3000,
            rimColor : new o(1.0, 1.0, 1.0, 0.4),
            width : 1.0,
            channels : 'rgb',
            repeat : new Cesium.Cartesian2(1.0, 1.0)
		},
		source: "czm_material czm_getMaterial(czm_materialInput materialInput)\n                " +
			    "{\n                    " +
			        "czm_material material = czm_getDefaultMaterial(materialInput);\n                    " +
			        "material.diffuse = 1.5 * color.rgb;\n                    " +
			        "float d = 1.0 - dot(materialInput.normalEC, normalize(materialInput.positionToEyeEC));\n                    " +
			        "float s = smoothstep(1.0 - width, 1.0, d);\n                    " +
			        "material.emission = color.rgb * s;\n                    " +
			        "vec2 st = materialInput.st;\n                    " +
			        "float dis = distance(st, vec2(0.5, 0.5));\n                    " +
			        "float per = fract(time);\n                    " +
			        "if(dis > time * 0.5 ){\n                        " +
			            "material.alpha = 0.02;\n                        " +
			            "//discard;\n                    " +
			    	"}else {\n                            " +
			            "material.alpha = color.a  * dis / time / 1.5;\n                   " +
			        "}\n                    " +
			        "return material;\n                " +
			    "}",
		components : {
                emission : 'texture2D(color, fract(repeat * materialInput.st)).channels'
            }	    
	},
	translucent : function(material) {
		return true;
	}
});	
zdCesiumLab.ElliposidFadeMaterialProperty = Cesium.ElliposidFadeMaterialProperty;
// --------------------定义动态扩散材质 api End---------------------


// --------------------定义动态立体墙材质 api Start---------------------
/**
* 动态立体墙材质
* @param {} options 参数集
* @param {Cesium.Color} _color 颜色
* @param {Number} _duration 持续时间 毫秒
*
* @author yu Huawen
* @date 2019/05/15
*/
var AnimationLineMaterialProperty = function(options) {
	// options = s(options, s.EMPTY_OBJECT),

    this._definitionChanged = new Cesium.Event(),
    this._color = undefined,
    this._colorSubscription = undefined,
    this.color = options.color || p,
    this._duration = options.duration || 1e3;
    var e = AnimationLineMaterialProperty.getImageMaterial(options.url, options.repeat);
    this._materialType = e.type,
    this._materialImage = e.image,
    this._time = undefined
}
var o = Cesium.Color
      , s = Cesium.defaultValue
      , l = Cesium.defined
      , u = Cesium.defineProperties
      , c = Cesium.Event
      , d = Cesium.createPropertyDescriptor
      , h = Cesium.Property
      , f = Cesium.Material
      , p = o.WHITE;
Cesium.defineProperties(AnimationLineMaterialProperty.prototype, {
	isConstant : {
		get : function() {
			return false;
		}
	},
	definitionChanged : {
		get : function() {
			return this._definitionChanged;
		}
	},
	color: d("color")
});
AnimationLineMaterialProperty.prototype.getType = function(time) {
	return this._materialType;
};
AnimationLineMaterialProperty.prototype.getValue = function(time, result) {
	if (!Cesium.defined(result)) {
		result = {};
	}
	result.color = h.getValueOrClonedDefault(this._color, time, p, result.color);
	result.image = this._materialImage;
	if(void 0 === this._time){
		this._time = time.secondsOfDay;
	}
    result.time = 1e3 * (time.secondsOfDay - this._time) / this._duration;
	return result;
};
AnimationLineMaterialProperty.prototype.equals = function(t) {
	return this === t || t instanceof AnimationLineMaterialProperty && h.equals(this._color, t._color)
};
var g = 0;
AnimationLineMaterialProperty.getImageMaterial = function(t, e) {
    g++;
    var i = "AnimationLine" + g + "Type"
      , n = "AnimationLine" + g + "Image";
    return f[i] = i,
    f[n] = t,
    f._materialCache.addMaterial(f[i], {
        fabric: {
            type: f.PolylineArrowLinkType,
            uniforms: {
                color: new o(1,0,0,1),
                image: f[n],
                time: 0,
                repeat: e || new a.default.Cartesian2(1,1)
            },
            source: "czm_material czm_getMaterial(czm_materialInput materialInput)\n                        {\n                            czm_material material = czm_getDefaultMaterial(materialInput);\n                            vec2 st = repeat * materialInput.st;\n                            vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n                            if(color.a == 0.0)\n                            {\n                                material.alpha = colorImage.a;\n                                material.diffuse = colorImage.rgb; \n                            }\n                            else\n                            {\n                                material.alpha = colorImage.a * color.a;\n                                material.diffuse = max(color.rgb * material.alpha * 3.0, color.rgb); \n                            }\n                            return material;\n                        }"
        },
        translucent: function() {
            return !0
        }
    }),
    {
        type: f[i],
        image: f[n]
    }
};
zdCesiumLab.AnimationLineMaterialProperty = AnimationLineMaterialProperty;
// --------------------定义动态立体墙材质 api End---------------------


// --------------------定义地图相机视角旋转 api Start---------------------
/**
* 地图相机视角旋转
* @param {} options 参数集
* @param {Cesium.Viewer} viewer 地图viewer
* @param {Number} headingYaw 航向角,航向角从局部北方向旋转，其中正角度向东增加,负角度向东增加。
* @param {Number} pitchYaw 俯仰角，俯仰角是局部xy平面的旋转。 正俯仰角在平面上方，负俯仰角在平面下方。
* @param {Number} rangeYaw 范围，范围是距框架中心的距离，如果值为undefined，则默认相机当前的高度作为距框架中心的距离。
*
* @author yu Huawen
* @date 2018/11/03
*/
zdCesiumLab.viewChange = function(options) {
	var _viewer = options.viewer;
	var _headingYaw = options.headingYaw;
	var _pitchYaw = options.pitchYaw;
	var _rangeYaw = options.rangeYaw;

	
    var heading = Cesium.Math.toRadians(_headingYaw);
	var pitch = Cesium.Math.toRadians(_pitchYaw);
	var range = _rangeYaw;
	if (!Cesium.defined(range)) {
		range = _viewer.camera.positionCartographic['height'];
	}
 	//
   _viewer.flyTo(_viewer.entities,{
	 	// duration: 2.0,
    	offset: new Cesium.HeadingPitchRange(heading, pitch, range)
    	});
}
// --------------------定义地图相机视角旋转 api End---------------------


// --------------------定义生成曲线插值 api Start---------------------
/**
* 生成曲线插值
* @param startPoint 起点
* @param endPoint 终点
* @returns {Array} 插值数组
*
* @author yu Huawen
* @date 2018/11/03
*/
function generateCurve(startPoint, endPoint){
	let addPointCartesian = new Cesium.Cartesian3();
	Cesium.Cartesian3.add(startPoint, endPoint, addPointCartesian);
	let midPointCartesian = new Cesium.Cartesian3();
	Cesium.Cartesian3.divideByScalar(addPointCartesian, 2, midPointCartesian);
	let midPointCartographic = Cesium.Cartographic.fromCartesian(midPointCartesian);
	midPointCartographic.height = Cesium.Cartesian3.distance(startPoint, endPoint) / 6;
	let midPoint = new Cesium.Cartesian3();
	Cesium.Ellipsoid.WGS84.cartographicToCartesian(midPointCartographic, midPoint);

	let spline = new Cesium.CatmullRomSpline({
	    times: [0.0, 0.8, 1.0],
	    points: [startPoint, midPoint, endPoint]
	});
	let curvePointsArr = [];
	for(let i = 0, len = 300; i < len; i++){
	    curvePointsArr.push(spline.evaluate(i / len));
	}
	return curvePointsArr;
}
// --------------------定义生成曲线插值 api End---------------------


// --------------------定义数据迁徙模拟 api Start---------------------
/**
* 数据迁徙模拟
* @param startPt 起点
* @param endPt 终点
* @param startName 终点位置名称
* @param destinationName 终点位置名称
* @param dataCount 数据量
* @param backColor 背景线颜色
* @param TrailColor 流动线颜色
* @returns {Array}
*
* @author yu Huawen
* @date 2018/11/05
*/
zdCesiumLab.MigrationAction = function(options){
	// 用于拟合当前曲线的笛卡尔坐标点数组
    let startPt = options.startPt;
    let endPt = options.endPt;
    let startName = options.startName;
    let destinationName = options.destinationName;
    let dataCount = options.dataCount;
    let backColor = options.backColor;
    let TrailColor = options.TrailColor;

    let curLinePointsArr = generateCurve(startPt, endPt);
    viewer.entities.add({ // 起点
        description: 'start-point',
        name: startName,
        position: startPt,
        point: {
            color: backColor,
            pixelSize: 8
        }
    });
    viewer.entities.add({ // 终点
        description: 'end-point',
        name: destinationName,
        position: endPt,
        point: {
            color: TrailColor,
            pixelSize: 10
        }
    });
    viewer.entities.add({ // 背景线
        description: 'background-line',
        name: startName + ' -> ' + destinationName + ':' + dataCount,
        polyline: {
            width: 2,
            positions: curLinePointsArr,
            material: new Cesium.PolylineDashMaterialProperty({
                color: backColor
            })
        }
    });

    viewer.entities.add({ // 尾迹线
        description: 'trail-line',
        name: startName + ' -> ' + destinationName + ':' + dataCount,
        polyline: {
            width: 20,
            positions: curLinePointsArr,
            material : new Cesium.PolylineArrowLinkMaterialProperty({
				color : TrailColor,
				duration : 30000
			})
        }
    });
}
// --------------------定义数据迁徙模拟 api End---------------------


// --------------------定义动态水域材质 api Start---------------------
/**
* 动态水域材质
* @param waters 动态水域对象的数组
* @param normalMapUrl 动态水域纹理
*
* @author yu Huawen
* @date 2019/05/14
*/
zdCesiumLab.waterMaterial = {
    waters: [],
    normalMapUrl: host + "/img/textures/waterNormals.jpg",
    /**
	* 初始化
	* @param v viewer对象
	* @param a {GeometryInstances} 水面图形实例
	* @param r {String} 材质图片地址
	* @author yu Huawen
	* @date 2019/05/14
	*/
    apply: function(v, a, r) {
        var n = v.scene.primitives.add(new Cesium.Primitive({
            geometryInstances: a,
            appearance: new Cesium.EllipsoidSurfaceAppearance({
                aboveGround: !1,
                material: new Cesium.Material({
                    fabric: {
                        type: "Water",
                        uniforms: {
                            normalMap: r || this.normalMapUrl,
                            frequency: 8e4,
                            animationSpeed: .02,
                            amplitude: 100,
                            specularIntensity: .3,
                            baseWaterColor: new Cesium.Color.fromCssColorString("#3300ff"), //006ab4
                            blendColor: new Cesium.Color.fromCssColorString("#00ccff")
                            // baseWaterColor: new Cesium.Color.fromCssColorString("#1e599f"),
                            // blendColor: new Cesium.Color.fromCssColorString("#b8ebff")
                        }
                    }
                })                
                // ,vertexShaderSource: this.getVertexShader()
                ,fragmentShaderSource: this.getFragmentShader()
            }),
            show: !0
        }));
        return this.waters.push(n),
        n
    },
    /**
	* 移除单个水面原体对象
	* @param v viewer对象
	* @param e 水面原体对象
	*/
    remove: function(v, e) {
        v.scene.primitives.remove(e)
    },
    /**
	* 移除所有水面原体对象
	* @param v viewer对象
	*/
    removeAll: function(v) {
        for (var a = 0; a < this.waters.length; a++)
            v.scene.primitives.remove(v, this.waters[a]);
        this.waters = [];
    },
    /**
	* 定义动态水域片元着色器
	*/
    getFragmentShader: function() {
        return "varying vec3 v_positionMC;\n" +
			    "varying vec3 v_positionEC;\n                " +
			    "varying vec2 v_st;\n                " +
			    "\n                " +
			    "void main()\n                " +
			    "{\n                    " +
			        "czm_materialInput materialInput;\n                    " +
			        "vec3 normalEC = normalize(czm_normal3D * czm_geodeticSurfaceNormal(v_positionMC, vec3(0.0), vec3(1.0)));\n                " +
			        "#ifdef FACE_FORWARD\n                    " +
			            "normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);\n                " +
			        "#endif\n                    " +
			        "materialInput.s = v_st.s;\n                    " +
			        "materialInput.st = v_st;\n                    " +
			        "materialInput.str = vec3(v_st, 0.0);\n                    " +
			        "materialInput.normalEC = normalEC;\n                    " +
			        "materialInput.tangentToEyeMatrix = czm_eastNorthUpToEyeCoordinates(v_positionMC, materialInput.normalEC);\n                    " +
			        "vec3 positionToEyeEC = -v_positionEC;\n                    " +
			        "materialInput.positionToEyeEC = positionToEyeEC;\n                    " + 
			        "czm_material material = czm_getMaterial(materialInput);\n                " +
			        "#ifdef FLAT\n                    " +
			            "gl_FragColor = vec4(material.diffuse + material.emission, material.alpha);\n                " +
			        "#else\n                    " +
			            "gl_FragColor = czm_phong(normalize(positionToEyeEC), material);\n                    " +
			            "gl_FragColor.a = 0.5;\n                " +
			        "#endif\n                " +
			    "}";
    },	
 //    /**
	// * 定义动态水域片元着色器
	// */
 //    getFragmentShader: function() {
 //        return 
 //        // "uniform float iTime;\n" +
 //        // "uniform vec2 iResolution;\n" +
 //        "float iTime = 0.0;\n" +
 //        "vec2 iResolution = vec2(300.0, 200.0);\n" +
 //        "uniform sampler2D iChannel0;\n" +
 //        "vec2 iMouse = vec2(0.0, 0.0);\n\n" +
 //        "\n\n" +
 //        "const int NUM_STEPS = 8;\n" +
 //        "const float PI = 3.141592;\n" +
 //        "const float EPSILON = 1e-3;\n" +
 //        "#define EPSILON_NRM (0.1 / iResolution.x)\n\n" +
 //        "// sea\n" +
 //        "const int ITER_GEOMETRY = 3;\n" +
 //        "const int ITER_FRAGMENT = 5;\n" +
 //        "const float SEA_HEIGHT = 0.6;\n" +
 //        "const float SEA_CHOPPY = 4.0;\n" +
 //        "const float SEA_SPEED = 0.8;\n" +
 //        "const float SEA_FREQ = 0.16;\n" +
 //        "const vec3 SEA_BASE = vec3(0.1,0.19,0.22);\n" +
 //        "const vec3 SEA_WATER_COLOR = vec3(0.8,0.9,0.6);\n" +
 //        "#define SEA_TIME (1.0 + iTime * SEA_SPEED)\n" +
 //        "const mat2 octave_m = mat2(1.6,1.2,-1.2,1.6);\n\n" +
 //        "// math\n" +
 //        "mat3 fromEuler(vec3 ang) {\n" +
 //        "   vec2 a1 = vec2(sin(ang.x),cos(ang.x));\n" +
 //        "   vec2 a2 = vec2(sin(ang.y),cos(ang.y));\n    " +
 //        "   vec2 a3 = vec2(sin(ang.z),cos(ang.z));\n    " +
 //        "   mat3 m;\n    " +
 //        "   m[0] = vec3(a1.y*a3.y+a1.x*a2.x*a3.x,a1.y*a2.x*a3.x+a3.y*a1.x,-a2.y*a3.x);\n" +
 //        "   m[1] = vec3(-a2.y*a1.x,a1.y*a2.y,a2.x);\n" +
 //        "   m[2] = vec3(a3.y*a1.x*a2.x+a1.y*a3.x,a1.x*a3.x-a1.y*a3.y*a2.x,a2.y*a3.y);\n" +
 //        "   return m;\n" +
 //        "}\n" +
 //        "float hash( vec2 p ) {\n" +
 //        "   float h = dot(p,vec2(127.1,311.7));\n    " +
 //        "   return fract(sin(h)*43758.5453123);\n" +
 //        "}\n" +
 //        "float noise( in vec2 p ) {\n" +
 //        "   vec2 i = floor( p );\n" +
 //        "   vec2 f = fract( p );\n" +
 //        "   vec2 u = f*f*(3.0-2.0*f);\n" +
 //        "   return -1.0+2.0*mix( mix( hash( i + vec2(0.0,0.0) ),\n" +
 //        "                     hash( i + vec2(1.0,0.0) ), u.x),\n " +
 //        "               mix( hash( i + vec2(0.0,1.0) ),\n" +
 //        "                     hash( i + vec2(1.0,1.0) ), u.x), u.y);\n" +
 //        "}\n\n" +
 //        "// lighting\n" +
 //        "float diffuse(vec3 n,vec3 l,float p) {\n" +
 //        "   return pow(dot(n,l) * 0.4 + 0.6,p);\n" +
 //        "}\n" +
 //        "float specular(vec3 n,vec3 l,vec3 e,float s) {\n" +
 //        "   float nrm = (s + 8.0) / (PI * 8.0);\n" +
 //        "   return pow(max(dot(reflect(e,n),l),0.0),s) * nrm;\n" +
 //        "}\n\n" +
 //        "// sky\n" +
 //        "vec3 getSkyColor(vec3 e) {\n" +
 //        "   e.y = max(e.y,0.0);\n" +
 //        "   return vec3(pow(1.0-e.y,2.0), 1.0-e.y, 0.6+(1.0-e.y)*0.4);\n" +
 //        "}\n\n" +
 //        "// sea\n" +
 //        "float sea_octave(vec2 uv, float choppy) {\n" +
 //        "   uv += noise(uv);\n" +
 //        "   vec2 wv = 1.0-abs(sin(uv));\n" +
 //        "   vec2 swv = abs(cos(uv));\n" +
 //        "   wv = mix(wv,swv,wv);\n" +
 //        "   return pow(1.0-pow(wv.x * wv.y,0.65),choppy);\n" +
 //        "}\n\n" +
 //        "float map(vec3 p) {\n" +
 //        "   float freq = SEA_FREQ;\n" +
 //        "   float amp = SEA_HEIGHT;\n" +
 //        "   float choppy = SEA_CHOPPY;\n" +
 //        "   vec2 uv = p.xz; uv.x *= 0.75;\n\n" +
 //        "   float d, h = 0.0;\n" +
 //        "   for(int i = 0; i < ITER_GEOMETRY; i++) {\n" +
 //        "       d = sea_octave((uv+SEA_TIME)*freq,choppy);\n" +
 //        "       d += sea_octave((uv-SEA_TIME)*freq,choppy);\n" +
 //        "       h += d * amp;\n" +
 //        "       uv *= octave_m; freq *= 1.9; amp *= 0.22;\n" +
 //        "       choppy = mix(choppy,1.0,0.2);\n" +
 //        "   }\n" +
 //        "    return p.y - h;\n" +
 //        "}\n\n" +
 //        "float map_detailed(vec3 p) {\n" +
 //        "   float freq = SEA_FREQ;\n" +
 //        "   float amp = SEA_HEIGHT;\n" +
 //        "   float choppy = SEA_CHOPPY;\n" +
 //        "   vec2 uv = p.xz; uv.x *= 0.75;\n\n" +
 //        "   float d, h = 0.0;\n    " +
 //        "   for(int i = 0; i < ITER_FRAGMENT; i++) {\n" +
 //        "       d = sea_octave((uv+SEA_TIME)*freq,choppy);\n" +
 //        "       d += sea_octave((uv-SEA_TIME)*freq,choppy);\n" +
 //        "       h += d * amp;\n" +
 //        "       uv *= octave_m; freq *= 1.9; amp *= 0.22;\n" +
 //        "       choppy = mix(choppy,1.0,0.2);\n" +
 //        "   }\n" +
 //        "   return p.y - h;\n" +
 //        "}\n\n" +
 //        "vec3 getSeaColor(vec3 p, vec3 n, vec3 l, vec3 eye, vec3 dist) {\n" +
 //        "   float fresnel = clamp(1.0 - dot(n,-eye), 0.0, 1.0);\n" +
 //        "   fresnel = pow(fresnel,3.0) * 0.65;\n\n" +
 //        "   vec3 reflected = getSkyColor(reflect(eye,n));\n" +
 //        "   vec3 refracted = SEA_BASE + diffuse(n,l,80.0) * SEA_WATER_COLOR * 0.12;\n\n" +
 //        "   vec3 color = mix(refracted,reflected,fresnel);\n\n" +
 //        "   float atten = max(1.0 - dot(dist,dist) * 0.001, 0.0);\n" +
 //        "   color += SEA_WATER_COLOR * (p.y - SEA_HEIGHT) * 0.18 * atten;\n\n" +
 //        "   color += vec3(specular(n,l,eye,60.0));\n\n" +
 //        "   return color;\n" +
 //        "}\n\n" +
 //        "// tracing\n" +
 //        "vec3 getNormal(vec3 p, float eps) {\n" +
 //        "   vec3 n;\n" +
 //        "   n.y = map_detailed(p);\n" +
 //        "   n.x = map_detailed(vec3(p.x+eps,p.y,p.z)) - n.y;\n" +
 //        "   n.z = map_detailed(vec3(p.x,p.y,p.z+eps)) - n.y;\n" +
 //        "   n.y = eps;\n" +
 //        "   return normalize(n);\n" +
 //        "}\n\n" +
 //        "float heightMapTracing(vec3 ori, vec3 dir, out vec3 p) {\n" +
 //        "   float tm = 0.0;\n" +
 //        "   float tx = 1000.0;\n" +
 //        "   float hx = map(ori + dir * tx);\n" +
 //        "   if(hx > 0.0) return tx;\n" +
 //        "   float hm = map(ori + dir * tm);\n" +
 //        "   float tmid = 0.0;\n    " +
 //        "   for(int i = 0; i < NUM_STEPS; i++) {\n" +
 //        "       tmid = mix(tm,tx, hm/(hm-hx));\n" +
 //        "       p = ori + dir * tmid;\n" +
 //        "       float hmid = map(p);\n" +
 //        "       if(hmid < 0.0) {\n" +
 //        "           x = tmid;\n" +
 //        "           hx = hmid;\n" +
 //        "       } else {\n" +
 //        "           tm = tmid;\n" +
 //        "           hm = hmid;\n" +
 //        "       }\n" +
 //        "   }\n" +
 //        "   return tmid;\n" +
 //        "}\n\n" +
 //        "// main\n" +
 //        "void main() {\n" +
 //        "   vec2 uv = gl_FragCoord.xy / iResolution.xy;\n" +
 //        "   uv = uv * 2.0 - 1.0;\n" +
 //        "   uv.x *= iResolution.x / iResolution.y;\n" +
 //        "   float time = iTime * 0.1 + iMouse.x*0.01;\n\n" +
 //        "   // ray\n" +
 //        "   vec3 ang = vec3(sin(time*3.0)*0.1,sin(time)*0.2+0.3,time);\n" +
 //        "   vec3 ori = vec3(0.0,3.5,time*5.0);\n" +
 //        "   vec3 dir = normalize(vec3(uv.xy,-2.0)); dir.z += length(uv) * 0.15;\n" +
 //        "   dir = normalize(dir) * fromEuler(ang);\n\n" +
 //        "   // tracing\n" +
 //        "   vec3 p;\n" +
 //        "   heightMapTracing(ori,dir,p);\n" +
 //        "   vec3 dist = p - ori;\n" +
 //        "   vec3 n = getNormal(p, dot(dist,dist) * EPSILON_NRM);\n" +
 //        "   vec3 light = normalize(vec3(0.0,1.0,0.8));\n\n" +
 //        "   // color\n" +
 //        "   vec3 color = mix(\n" +
 //        "       getSkyColor(dir),\n" +
 //        "       getSeaColor(p,n,light,dir,dist),\n" +
 //        "       pow(smoothstep(0.0,-0.05,dir.y),0.3));\n\n" +
 //        "       // post\n" +
 //        "   gl_FragColor = vec4(pow(color,vec3(0.75)), 1.0);\n" +
 //        "}\n";
 //    },
    /**
	* 定义动态水域片元着色器
	*/
    getVertexShader: function() {
        return "void main()\n" +
        "{\n  " +
        "	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n" +
        "   gl_Position = projectionMatrix * mvPosition;\n" +
        "}\n";
    }
};
// Cesium.Material.SeascapeType = 'Seascape';
// Cesium.Material.defaultImage = host + '/img/map/menu.png';
// Cesium.Material._materialCache.addMaterial(Cesium.Material.SeascapeType, {
// 	fabric : {
// 		type : Cesium.Material.SeascapeType,
// 		uniforms : {
// 			color: new o(1,0,0,1),
//             time: 3000,
//             rimColor : new o(1.0, 1.0, 1.0, 0.4),
//             width : 1.0,
//             channels : 'rgb',
//             repeat : new Cesium.Cartesian2(1.0, 1.0)
// 		},
// 		source: "czm_material czm_getMaterial(czm_materialInput materialInput)\n                " +
// 			    "{\n                    " +
// 			        "czm_material material = czm_getDefaultMaterial(materialInput);\n                    " +
// 			        "material.diffuse = 1.5 * color.rgb;\n                    " +
// 			        "float d = 1.0 - dot(materialInput.normalEC, normalize(materialInput.positionToEyeEC));\n                    " +
// 			        "float s = smoothstep(1.0 - width, 1.0, d);\n                    " +
// 			        "material.emission = color.rgb * s;\n                    " +
// 			        "vec2 st = materialInput.st;\n                    " +
// 			        "float dis = distance(st, vec2(0.5, 0.5));\n                    " +
// 			        "float per = fract(time);\n                    " +
// 			        "if(dis > time * 0.5 ){\n                        " +
// 			            "material.alpha = 0.02;\n                        " +
// 			            "//discard;\n                    " +
// 			    	"}else {\n                            " +
// 			            "material.alpha = color.a  * dis / time / 1.5;\n                   " +
// 			        "}\n                    " +
// 			        "return material;\n                " +
// 			    "}",
// 		components : {
//                 emission : 'texture2D(color, fract(repeat * materialInput.st)).channels'
//             }	    
// 	},
// 	translucent : function(material) {
// 		return true;
// 	}
// });	
// --------------------定义动态水域材质 api End---------------------


// --------------------定义动态立体墙材质 api Start---------------------
/**
* 动态立体墙材质
* @param {} options 参数集
* @param {Cesium.Color} _color 颜色
* @param {Number} _duration 持续时间 毫秒
*
* @author yu Huawen
* @date 2019/05/15
*/
var AnimationLineMaterialProperty = function(options) {
	// options = s(options, s.EMPTY_OBJECT),

    this._definitionChanged = new Cesium.Event(),
    this._color = undefined,
    this._colorSubscription = undefined,
    this.color = options.color || p,
    this._duration = options.duration || 1e3;
    var e = AnimationLineMaterialProperty.getImageMaterial(options.url, options.repeat);
    this._materialType = e.type,
    this._materialImage = e.image,
    this._time = undefined
}
var o = Cesium.Color
      , s = Cesium.defaultValue
      , l = Cesium.defined
      , u = Cesium.defineProperties
      , c = Cesium.Event
      , d = Cesium.createPropertyDescriptor
      , h = Cesium.Property
      , f = Cesium.Material
      , p = o.WHITE;
Cesium.defineProperties(AnimationLineMaterialProperty.prototype, {
	isConstant : {
		get : function() {
			return false;
		}
	},
	definitionChanged : {
		get : function() {
			return this._definitionChanged;
		}
	},
	color: d("color")
});
AnimationLineMaterialProperty.prototype.getType = function(time) {
	return this._materialType;
};
AnimationLineMaterialProperty.prototype.getValue = function(time, result) {
	if (!Cesium.defined(result)) {
		result = {};
	}
	result.color = h.getValueOrClonedDefault(this._color, time, p, result.color);
	result.image = this._materialImage;
	if(void 0 === this._time){
		this._time = time.secondsOfDay;
	}
    result.time = 1e3 * (time.secondsOfDay - this._time) / this._duration;
	return result;
};
AnimationLineMaterialProperty.prototype.equals = function(t) {
	return this === t || t instanceof AnimationLineMaterialProperty && h.equals(this._color, t._color)
};
var g = 0;
AnimationLineMaterialProperty.getImageMaterial = function(t, e) {
    g++;
    var i = "AnimationLine" + g + "Type"
      , n = "AnimationLine" + g + "Image";
    return f[i] = i,
    f[n] = t,
    f._materialCache.addMaterial(f[i], {
        fabric: {
            type: f.PolylineArrowLinkType,
            uniforms: {
                color: new o(1,0,0,1),
                image: f[n],
                time: 0,
                repeat: e || new a.default.Cartesian2(1,1)
            },
            source: "czm_material czm_getMaterial(czm_materialInput materialInput)\n                        {\n                            czm_material material = czm_getDefaultMaterial(materialInput);\n                            vec2 st = repeat * materialInput.st;\n                            vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n                            if(color.a == 0.0)\n                            {\n                                material.alpha = colorImage.a;\n                                material.diffuse = colorImage.rgb; \n                            }\n                            else\n                            {\n                                material.alpha = colorImage.a * color.a;\n                                material.diffuse = max(color.rgb * material.alpha * 3.0, color.rgb); \n                            }\n                            return material;\n                        }"
        },
        translucent: function() {
            return !0
        }
    }),
    {
        type: f[i],
        image: f[n]
    }
};
zdCesiumLab.AnimationLineMaterialProperty = AnimationLineMaterialProperty;
// --------------------定义动态立体墙材质 api End---------------------


// --------------------定义土方开挖 api Start---------------------
/**
* 土方开挖
* @param starting 开启挖地
* @param viewer viewer对象
* @param clippingMouseHandler 开挖动作鼠标响应对象
* @param clipHeight 开挖深度
* @param drawAreas 开挖区域数据集
* @param clippingEntities 土方开挖实体集
*
* @author yu Huawen
* @date 2019/05/22
*/
zdCesiumLab.clipping = {
    starting: false,
    viewer: null,
    clippingMouseHandler: null,
	clipHeight: 30, 
	drawAreas: [],
	clippingEntities: null,
	/**
	* 初始化
	* @param options 参数集
	*/
    apply: function(options) {
    	var opt = this;
    	opt.starting = options.starting;
    	opt.viewer = options.viewer;
    	opt.clipHeight = options.clipHeight;

		let clippingPlanesPositions = [];
		let clippingPlanesMovePositions = [];
		if (!opt.clippingEntities) {
			let clippingDataSource = new Cesium.CustomDataSource;
			opt.viewer.dataSources.add(clippingDataSource);
			opt.clippingEntities = clippingDataSource.entities;
		}
		opt.removeAll(opt.viewer);
	    if (!opt.clippingMouseHandler){
	        opt.clippingMouseHandler = new Cesium.ScreenSpaceEventHandler(opt.viewer.scene.canvas);
	    }
		// 绘制开挖区域鼠标点击事件
		opt.clippingMouseHandler.setInputAction(function onMouseClick(movement) {
			if (opt.starting) {
				if (movement.position) {
					pickPosition = opt.viewer.scene.pickPosition(movement.position,new Cesium.Cartesian3());
					// clippingPlanesPositions.pop();
					if (pickPosition) {
						clippingPlanesPositions.push(pickPosition);
					}

					// 绘制坐标点
					// 将笛卡尔坐标转换为地理坐标
		            let cartographic = Cesium.Cartographic.fromCartesian(pickPosition);//这里高程值 如果未拾取到物体未负值或无值
		            //添加entity
		            let drawPoint = new Cesium.Entity({
						position: pickPosition,//Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883,3000),
		                point: {
		                    pixelSize: 10,
		                    color: Cesium.Color.YELLOW
		                }
		            });
		            opt.clippingEntities.add(drawPoint);
		            opt.drawAreas.push(drawPoint);
				}
			}
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK); 

		let lastPolylineEntity = null;
		let lastPolygonEntity = null;

		// 绘制开挖区域鼠标移动事件
		opt.clippingMouseHandler.setInputAction(function onMouseMove(movement) {
			if (opt.starting) {
				if (movement.endPosition) {
					clippingPlanesMovePositions = [];
					pickPosition = opt.viewer.scene.pickPosition(movement.endPosition,new Cesium.Cartesian3());
					clippingPlanesMovePositions= clippingPlanesPositions.slice()
					clippingPlanesMovePositions.push(pickPosition);
					if (clippingPlanesPositions.length > 0) {
						 //添加line entity
						 if (lastPolylineEntity) {
						 	lastPolylineEntity.show = false;
						 }
						let newPolylineEntity = new Cesium.Entity({
							 polyline: {
			                	positions : clippingPlanesMovePositions,
				                clampToGround : true,
			                    width : 5,
				                material : new Cesium.PolylineOutlineMaterialProperty({
				                    color : Cesium.Color.ORANGE,
				                    outlineWidth : 2,
				                    outlineColor : Cesium.Color.BLACK
				                })
			                }
						}) 
			            opt.clippingEntities.add(newPolylineEntity);
			            lastPolylineEntity = newPolylineEntity;
			            opt.drawAreas.push(newPolylineEntity);
					} 
					if (clippingPlanesPositions.length > 1) {
						//添加line entity
						 if (lastPolygonEntity) {
						 	lastPolygonEntity.show = false;
						 }
						let newPolygonEntity = new Cesium.Entity({
							 polygon : {
				                hierarchy : {
				                    positions : clippingPlanesMovePositions
				                },
				                material : Cesium.Color.BLUE.withAlpha(0.5)
			                }
						}) 
			            opt.clippingEntities.add(newPolygonEntity);
			            lastPolygonEntity = newPolygonEntity;
			            opt.drawAreas.push(newPolygonEntity);
					}
				}
			}
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

		// 绘制开挖区域结束事件
		opt.clippingMouseHandler.setInputAction(function onRightClick(movement) {
			if (opt.starting) {
				if (movement.position) {
					pickPosition = opt.viewer.scene.pickPosition(movement.position,new Cesium.Cartesian3());
					clippingPlanesPositions.push(pickPosition);
					if (opt.drawAreas.length > 0) {
						for (let i = opt.drawAreas.length - 1; i >= 0; i--) {
							let drawArea = opt.drawAreas[i];
							opt.clippingEntities.remove(drawArea);
						}
					}
					opt.drawAreas = [];

					// 第二步 执行开挖动作
					opt.clippingPlanes({
						clippPostions: clippingPlanesPositions,
						clipHeight: opt.clipHeight,
						viewer: opt.viewer
					});
					clippingPlanesPositions = [];
					clippingPlanesMovePositions = [];
				}
				opt.starting = false;
				opt.resetHandle();
			}
		}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    },
	/**
	* 地面裁剪
	* @param e.clippPostions 裁剪区域球面坐标
	* @param e.clipHeight 裁剪高度
	*/
    clippingPlanes: function(e) {
        let _clippPostions = e.clippPostions;
		let _clipHeight = e.clipHeight;
		let v = e.viewer;

		let i=[],n=[],a=_clippPostions.length,t=new Cesium.Cartesian3;
		r=Cesium.Cartesian3.subtract(_clippPostions[0],_clippPostions[1],t);
		r=0<r.x;
		for(let s=0;s<a;++s){
			let l=(s+1)%a;
			let o=Cesium.Cartesian3.midpoint(_clippPostions[s],_clippPostions[l],new Cesium.Cartesian3);
			i.push(_clippPostions[s]);
			i.push(o);
			let m,p=Cesium.Cartesian3.normalize(o,new Cesium.Cartesian3);
			m=r?Cesium.Cartesian3.subtract(_clippPostions[s],o,new Cesium.Cartesian3):Cesium.Cartesian3.subtract(_clippPostions[l],o,new Cesium.Cartesian3);
			m=Cesium.Cartesian3.normalize(m,m);
			let c=Cesium.Cartesian3.cross(m,p,new Cesium.Cartesian3);
			c=Cesium.Cartesian3.normalize(c,c);
			let u=new Cesium.Plane(c,0);
			let g=Cesium.Plane.getPointDistance(u,o);
			n.push(new Cesium.ClippingPlane(c,g))
		}
		v.scene.globe.clippingPlanes=new Cesium.ClippingPlaneCollection({
			planes:n,
			edgeWidth:1,
			edgeColor:Cesium.Color.WHITE,enabled:!0
		});
		this.addClippingImageMaterial(v, i, _clipHeight);
    },
	/**
	* 绘制开挖模型
	* @param v viewer对象
	* @param d 模型生成球面坐标
	* @param clipHeight 模型高度
	*/
    addClippingImageMaterial: function(v, d,clipHeight){
    	// v.scene.globe.depthTestAgainstTerrain=false;
		let i=clipHeight||100;
		let n=[],a=[],minimumHeights=[],polygonPoints=[];
		for(let t=0;t<d.length;++t){
			let r=Cesium.Cartographic.fromCartesian(d[t]);
			let s=r.height;
			let l=v.scene.sampleHeight(r);
			if (null!=s&&s<l){
				s=l
			};
			minimumHeights.push(s-i);
			n.push(s);
			a.push(Cesium.Cartesian3.fromRadians(r.longitude,r.latitude,0));
			polygonPoints.push(Cesium.Cartesian3.fromRadians(r.longitude,r.latitude,s-i))
		}
		a.push(a[0]);
		minimumHeights.push(minimumHeights[0]);
		n.push(n[0]);
		let clipWall=this.clippingEntities.add({
			name:"挖地四周墙",
			wall:{
				positions:a,
				maximumHeights:n,
				minimumHeights:new Cesium.CallbackProperty(function(){
					return minimumHeights
				},false),
				material:new Cesium.ImageMaterialProperty({
					// image: host + "img/textures/excavationregion_side.jpg",
					image: host + "img/textures/excavationregion_top.jpg",
					repeat:new Cesium.Cartesian2(10,i)
				})
			}
		});
		let clipBottom=this.clippingEntities.add({
			name:"挖地底面",
			polygon:{
				hierarchy:new Cesium.CallbackProperty(function(){
					return polygonPoints},false),
				perPositionHeight:true,
				material:new Cesium.ImageMaterialProperty({
					image: host + "img/textures/excavationregion_side.jpg",
					repeat:new Cesium.Cartesian2(10,10)
				})
			}
		});
    },
    /**
	* 清除开挖结果
	* @param v viewer对象
	*/
    removeAll: function(v) {
        // 清除土方开挖
		if (this.clippingEntities) {
			this.clippingEntities.removeAll();	
		}
		// 清除地球裁剪面
		if (v.scene.globe.clippingPlanes) {
			// v.scene.globe.clippingPlanes.enabled=false;
			v.scene.globe.clippingPlanes.removeAll();
			// if(!v.scene.globe.clippingPlanes.isDestroyed()){
			// 	v.scene.globe.clippingPlanes.destroy()
			// }
			// v.scene.globe.clippingPlanes=true;
		}
    },
    /**
    * 重置鼠标触发事件
    */
    resetHandle: function(){
    	if (this.clippingMouseHandler){
	        this.clippingMouseHandler.destroy();
	        this.clippingMouseHandler = null;
	    }
    }
};	
// --------------------定义土方开挖 api End---------------------


// --------------------定义高度量算 api Start---------------------
/**
* 高度量算 
* @param starting true：开启高度量算;false:关闭高度量算
* @param viewer viewer对象
* @param measureHandle 量算动作鼠标响应对象
* @param bottom_screen 丈量线底部(屏幕坐标 x,y)
* @param bottom_cartesian 丈量线底部(球面坐标 X,Y,Z)
* @param bottom_cartographic 丈量线底部(大地坐标 B,L,H)
* @param bottom_Point 丈量线底部(点)
* @param top_Point 丈量线顶部(点)
* @param height_top 测量线顶点高度值
* @param crossSection 最新的参考平面
* @param verticalLine 最新的垂直测量辅助线
* @param heightText 最新的高度注记
* @param top_cartesian 测量线顶点坐标
* @param lastVerticalLine 上一次生成的参考平面
* @param lastVerticalLine 上一次生成的垂直测量辅助线
* @param lastHeightText 上一次生成的高度注记
* @param drawEntities 高度量算实体集合
* 
* @author yu Huawen
* @date 2019/05/28
*/
zdCesiumLab.measureHeight = {
	starting: false,
	viewer: null,
	measureHandle: null,
	bottom_screen: null,
	bottom_cartesian: null,
	bottom_cartographic: null,
	bottom_Point: null,
	top_Point: null,
	height_top: 0,
	crossSection: null,
	verticalLine: null,
	heightText: null,
	top_cartesian: null,
	lastCrossSection: null,
	lastVerticalLine: null,
	lastHeightText: null,
	drawEntities: null,
	/** 
	* 初始化
	*
	* @param v viewer对象
	*/
    apply: function(options) {
    	var opt = this;
    	opt.viewer = options.viewer;
    	opt.starting = true;

		if (!opt.measureHandle){
	        opt.measureHandle = new Cesium.ScreenSpaceEventHandler(opt.viewer.scene.canvas);
	    }
	    if (!opt.drawEntities) {
	        let drawDataSource=new Cesium.CustomDataSource;
		    viewer.dataSources.add(drawDataSource);
		    opt.drawEntities = drawDataSource.entities;
	    }

	    //单击左键
	    opt.measureHandle.setInputAction(function (movement) {
	        if (opt.starting){
	        	if (!opt.lastCrossSection) {
	        		opt.bottom_screen = movement.position;//屏幕坐标(x,y)
		            opt.bottom_cartesian = viewer.camera.pickEllipsoid(opt.bottom_screen, ellipsoid);//屏幕坐标（x,y）-> 球面坐标（X,Y,Z）
		            opt.bottom_cartographic = ellipsoid.cartesianToCartographic(opt.bottom_cartesian);//球面坐标（X,Y,Z）-> 大地坐标(B,L，H)
		            //添加丈量线底部点
		            opt.bottom_Point = viewer.entities.add({
		                position : opt.bottom_cartesian,
		                point: {
		                    pixelSize: 5,
		                    color : Cesium.Color.RED,
		                }
		            });
		            //添加终点
		            opt.top_Point = viewer.entities.add({
		                position: opt.bottom_cartesian,
		                point : {
		                    pixelSize: 5,
		                    color : Cesium.Color.RED,
		                }
		            });
		            //创建测量辅助面、垂直测量线、高度注记
		            opt.lastCrossSection = opt.createReferencePlane(opt.viewer, opt.bottom_cartesian, 400, opt.height_top);
		            opt.lastVerticalLine = opt.createVerticalLine(opt.viewer, opt.bottom_cartographic,opt.height_top);
		            opt.lastHeightText = opt.createHeightText(opt.viewer, opt.bottom_cartographic,opt.height_top);
	        	}
	        }
	    },Cesium.ScreenSpaceEventType.LEFT_CLICK);

	    //鼠标移动
	     opt.measureHandle.setInputAction(function (movement) {
	        if (opt.starting){
	            let endMousePosition = movement.startPosition;
	            if (opt.bottom_cartographic) {
	            	//计算丈量线终点随鼠标移动时的坐标
		            let longitude_top = Cesium.Math.toDegrees(opt.bottom_cartographic.longitude);//终点经度，度为点位
		            let latitude_top = Cesium.Math.toDegrees(opt.bottom_cartographic.latitude);//终点纬度，度为单位
		            opt.height_top = opt.getLength(opt.viewer, endMousePosition);
		            opt.top_cartesian = Cesium.Cartesian3.fromDegrees(longitude_top,latitude_top,opt.height_top);
		            //随着鼠标位移改变垂线终点位置,横截面位置,垂直辅助线，高度注记
		            opt.top_Point.position = opt.top_cartesian;

		            opt.crossSection = opt.createReferencePlane(opt.viewer, opt.bottom_cartesian, 400, opt.height_top);
		            opt.verticalLine = opt.createVerticalLine(opt.viewer, opt.bottom_cartographic, opt.height_top);
		            opt.heightText = opt.createHeightText(opt.viewer, opt.bottom_cartographic,opt.height_top);
		            //之前的参考面不可见
		            if (opt.lastCrossSection){
		                opt.lastCrossSection.show = false;
		                // opt.drawEntities.remove(opt.lastCrossSection);
		            }
		            // 之前的垂直测量线不可见
		            if (opt.lastVerticalLine){
		                // opt.lastVerticalLine.show = false;
		                opt.drawEntities.remove(opt.lastVerticalLine);
		            }
		            // 之前的高度注记不可见
		            if (opt.lastHeightText){
		                // opt.lastHeightText.show = false;
		                opt.drawEntities.remove(opt.lastHeightText);
		            }
		            opt.lastCrossSection = opt.crossSection;
		            opt.lastVerticalLine = opt.verticalLine;
		            opt.lastHeightText = opt.heightText;
	            }
	        }
	    },Cesium.ScreenSpaceEventType.MOUSE_MOVE);

	    //单击右键
	    opt.measureHandle.setInputAction(function (movement) {
	        opt.createReferencePlane(opt.viewer, opt.bottom_cartesian, 400, opt.height_top);
	        opt.createVerticalLine(opt.viewer, opt.bottom_cartographic, opt.height_top);
	        opt.createHeightText(opt.viewer, opt.bottom_cartographic,opt.height_top);
	        //之前的参考面不可见
            if (opt.lastCrossSection){
                opt.lastCrossSection.show = false;
                // opt.drawEntities.remove(opt.lastCrossSection);
            }
            // 之前的垂直测量线不可见
            if (opt.lastVerticalLine){
                // opt.lastVerticalLine.show = false;
                opt.drawEntities.remove(opt.lastVerticalLine);
            }
            // 之前的高度注记不可见
            if (opt.lastHeightText){
                // opt.lastHeightText.show = false;
                opt.drawEntities.remove(opt.lastHeightText);
            }
	        opt.resetAll();
	    },Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    },
	/**
	 * 计算测量线高度
	 * @param v  viewer对象
	 * @param endMousePosition  测量线终点屏幕坐标
	 * @returns {number}  高度值
	 */
    getLength: function(v, endMousePosition) {
        //经过相机的铅垂线与地面交点
	    let cartographic_camera = ellipsoid.cartesianToCartographic(v.camera.position);//相机的大地坐标
	    let longitude_camera = cartographic_camera.longitude * 180 / Cesium.Math.PI;//相机经度（度为单位）
	    let latitude_camera = cartographic_camera.latitude * 180 / Cesium.Math.PI;//相机纬度（度为单位）
	    let height_camera = cartographic_camera.height;//相机高度
	    let camera_vertical_cartesian = Cesium.Cartesian3.fromDegrees(//穿过相机的铅垂线与地面交点
	        longitude_camera,
	        latitude_camera,
	        0
	    );
	    //垂线终点的地面投影
	    let top_projection_cartesian = v.camera.pickEllipsoid(endMousePosition, ellipsoid);//屏幕坐标（x,y）转球面坐标（X,Y,Z);
	    //计算垂线长度
	    let length1 = Cesium.Cartesian3.distance(top_projection_cartesian, this.bottom_cartesian);
	    let length2 = Cesium.Cartesian3.distance(top_projection_cartesian, camera_vertical_cartesian);
	    let height = length1 / length2 * height_camera;
	    return height;
    },
    /**
	 * 添加参考平面
 	 * @param v  viewer对象
	 * @param position  参考平面平面位置
	 * @param radius    半径
	 * @param height    高度值
	 */
    createReferencePlane: function(v, position, radius, height){
    	let newCrossSection = this.drawEntities.add({
	        name : "参考面",
	        position: position,
	        ellipse: {
	            semiMajorAxis: radius,//长半轴
	            semiMinorAxis: radius,//短半轴
	            height: height,//相对于椭球面的海拔高度，默认是0
	            material: new Cesium.Color(0.0, 0.5, 0.0, 0.5),
	            outline: true,//要显示轮廓，必须设置高度
	            outlineColor: Cesium.Color.fromCssColorString('#ff6600').withAlpha(1.0),
	            outlineWidth: 15
	        }
	    });
	    return newCrossSection;
    },
    /**
	 * 添加垂直测量辅助线
  	 * @param v  viewer对象
	 * @param bottom_cartographic   辅助线底部坐标
	 * @param height_top            辅助线高度
	 */
    createVerticalLine: function(v, bottom_cartographic, height_top) {
        let newVerticalLine = this.drawEntities.add({
	        polyline : {
	            positions : Cesium.Cartesian3.fromDegreesArrayHeights([
	                Cesium.Math.toDegrees(bottom_cartographic.longitude), Cesium.Math.toDegrees(bottom_cartographic.latitude),0,
	                Cesium.Math.toDegrees(bottom_cartographic.longitude), Cesium.Math.toDegrees(bottom_cartographic.latitude),height_top
	            ]),
	            material : Cesium.Color.CYAN,
	        }
	    });
	    return newVerticalLine;
    },
    /**
	 * 添加高度注记
	 * @param bottom_cartographic   垂直测量线底部点坐标
	 * @param height_top            垂直测量线高度
	 */
    createHeightText: function(v, bottom_cartographic, height_top){
    	let text = '0.00';
	    if (height_top !== 0) {
	        let texts = (height_top+"").split(".");
	        console.log(texts)
	        let str_before = texts[0];
	        let str_behind = texts[1].substr(0,2);
	        text = str_before + "." + str_behind;
	    }
	    let newHeightText = this.drawEntities.add({
	        position: Cesium.Cartesian3.fromDegrees(
	            Cesium.Math.toDegrees(bottom_cartographic.longitude), Cesium.Math.toDegrees(bottom_cartographic.latitude),height_top
	        ),
	        label : {
	            text : text + "米",
	            font : '14pt monospace',
	            fillColor : Cesium.Color.fromCssColorString('#ff9933').withAlpha(1.0),
	            // fillColor : Cesium.Color.GOLD,
	            style : Cesium.LabelStyle.FILL_AND_OUTLINE,
	            // backgroundColor : Cesium.Color.WHITE,
	            // showBackground : true,
	            outlineWidth: 5,
	            verticalOrigin : Cesium.VerticalOrigin.BOTTOM,//设置原点在标签垂直方向的位置（本例原点在标签的底部）
	            horizontalOrigin : Cesium.HorizontalOrigin.CENTER,//设置原点在标签水平方向的位置（本例原点在标签的左边）
	            pixelOffset : new Cesium.Cartesian2(0,-9)//设置在屏幕空间中的位置偏移量
	        }
	    });
	    return newHeightText;
    },
    /**
	 * 清空量算结果
   	 * @param v  viewer对象
	 */
    removeAll: function(v){
	    if (this.drawEntities) {
	    	this.drawEntities.removeAll();
	    	this.drawEntities = null;
	    }
    },
    /**
	 * 重置全局变量值
	 */
    resetAll: function(){
    	if (this.measureHandle){
	        this.measureHandle.destroy();
	        this.measureHandle = null;
	    }
	    this.starting = false;
	    this.ending = true;
	    this.bottom_screen = null;//丈量线底部(屏幕坐标 x,y)
	    this.bottom_cartesian = null;//丈量线底部(球面坐标 X,Y,Z)
	    this.bottom_cartographic = null;//丈量线底部(大地坐标 B,L,H)
	    this.bottom_Point = null;//丈量线底部(点)
	    this.top_Point = null;//丈量线顶部(点)
	    this.height_top = 0;
	    this.crossSection = null;
	    this.verticalLine = null;
	    this.heightText = null;
	    this.top_cartesian = null;
	    this.lastCrossSection = null;
	    this.lastVerticalLine = null;
	    this.lastHeightText = null;
    }
};	
// --------------------定义高度量算 api End---------------------


/**
* 命令执行方法体
*	
*/
zdCesiumLab.excute = function(options){
	if (typeof (zdCesiumLab[options.command]) === 'function') {
		return zdCesiumLab[options.command](options.opts);
	}
	return zdCesiumLab[options.command];
}
