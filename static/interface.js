
/**
*
*   接口服务地址配置文件
*	
*	V 1.0
*	
*	Yu HuaWen
**/

var api = new function () {

	/*############ 地图服务基础地址 ##############*/
	this.baseServerPath = 'http://172.17.6.23:8088';

    /*############ 自定义深圳底图服务 ##############*/
    this.szBaseService = this.baseServerPath + '/szBaseLayer/_alllayers/{zTile}/{y}/{x}.png';
    // this.szBaseService = 'http://172.17.6.48:6080/arcgis/rest/services/hsk/hsc_0307/MapServer/tile/{z}/{y}/{x}';

    /*############ 宝安街道服务 ##############*/
    this.baoanJdService = this.baseServerPath + '/baoanLayer/_alllayers/{z}/{y}/{x}.png';

};