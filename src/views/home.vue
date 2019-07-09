<template>
	<div class="home-container">
		<!-- 系统名称 -->
		<div class="title-container">
			<div class="title-container-wrapper">
				<div class="logo">logo</div>
				<h2>{{ title }}</h2>
			</div>
		</div>
		
		<!-- 地图 -->
		<div id="map"></div>

		<!-- 地图底图切换 -->
		<div class="base-layer-switch-container">
			<ul>
				<li v-bind:class="{ active: isBaseMaoActice }" v-on:click="switchBaseMap">地图</li>
				<li v-bind:class="{ active: isSatelliteMapActice }" v-on:click="switchSatelliteMap">卫星</li>
				<li v-bind:class="{ active: is3DMapActice }" v-on:click="switch3DMap">三维</li>
			</ul>
		</div>
		
		<!-- 地图图层切换 -->
		<div class="layer-switch-container">
			<ul>
				<li v-bind:class="{ active : isLayerActive1 }" v-on:click="goToHome">专题图</li>
				<li v-bind:class="{ active : isLayerActive2 }" v-on:click="loadWaterDeepClassify">等值线</li>
				<li v-bind:class="{ active : isLayerActive3 }" v-on:click="">风险点</li>
				<!-- <li v-bind:class="{ active : isLayerActive4 }" v-on:click="">海浪</li>
				<li v-bind:class="{ active : isLayerActive5 }" v-on:click="">应急避灾点</li>
				<li v-bind:class="{ active : isLayerActive6 }" v-on:click="">日常预报</li>
				<li v-bind:class="{ active : isLayerActive7 }" v-on:click="">滨海旅游</li>
				<li v-bind:class="{ active : isLayerActive8 }" v-on:click="">近海预报</li> -->
			</ul>
		</div>

	</div>
</template>

<style scoped>
	*{
		box-sizing: border-box;
		padding: 0;
		margin: 0;
	}

	ul {
		list-style: none;
	}

	.home-container {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.title-container {
		box-sizing: border-box;
		position: absolute;
		top: 3vh;
		left: 3vw;
		z-index: 9;
		color: #fff;
		width: 15rem;
		height: 3rem;
		line-height: 3rem;
	}

	.title-container-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
		border: 2px solid #005ba2;
		border-radius: 6px;
		background-color: #013875;
	}
	.title-container-wrapper .logo{
		position: absolute;
		height: 3.5rem;
		line-height: 3.5rem;
		width: 3.5rem;
		top: -0.3rem;
		left: -2.5rem;
		text-align: center;
		border-radius: 50%;
		background-color: #013875;
	}
	.title-container-wrapper > h2 {
		display: inline-block;
		padding: 0;
		margin: 0;
		margin-left: 2rem;
		font-size: 1.2rem;
		font-weight: normal;
		letter-spacing: 2px;
	}

	#map {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 0;
		/* background-color: #ccc; */
	}

	.base-layer-switch-container{
		font-size: 0;
		position: absolute;
		top: 1rem;
		right: 1rem;
		width: 10rem;
		height: 2rem;
		line-height: 2rem;
		background-color: #fff;
		border-radius: 6px;
	}
	.base-layer-switch-container li{
		font-size: 1rem;
		display: inline-block;
		height: 100%;
		width: 33.3333333%;
		text-align: center;
		cursor: pointer;
	}
	.base-layer-switch-container li.active{
		color: #fff;
		background-color: #8ea8e0;
	}

	.layer-switch-container {
		position: absolute;
		top: 30vh;
		right: 1vw;
		width: 8rem;
		height: 2.5rem;
		line-height: 2.5rem;
		text-align: center;
		background-color: transparent;
	}
	.layer-switch-container li {
		margin-bottom: 1rem;
		background-color: #fdc919;
		letter-spacing: 2px;
		border-radius: 6px;
		cursor: pointer;
	}
	.layer-switch-container li.active {
		color: #fff;
		background-color: #ee6d00;
	}

</style>

<script>
	export default {
	  name: 'Home',
	  data () {
	    return {
	      title: '海洋预警监测中心',
	      isBaseMaoActice: false,
	      isSatelliteMapActice: true,
	      is3DMapActice: false,
	      isLayerActive1: false,
	      isLayerActive2: false,
	      isLayerActive3: false,
	      isLayerActive4: false,
	      isLayerActive5: false,
	      isLayerActive6: false,
	      isLayerActive7: false,
	      isLayerActive8: false,
	    }
	  },
	  mounted () {
	  	// initMap('map')
	  },
	  methods: {
	  	// 切换默认地图
	  	switchBaseMap() {
	  		this.isBaseMaoActice = true
	  		this.isSatelliteMapActice = false
	  		this.is3DMapActice = false
	  		
	  		switchBaseMap(1)
	  	},

	  	// 切换卫星地图
	  	switchSatelliteMap() {
	  		this.isBaseMaoActice = false
	  		this.isSatelliteMapActice = true
	  		this.is3DMapActice = false
	  		
	  		switchBaseMap(2);
	  	},

	  	// 切换三维地图
	  	switch3DMap() {
	  		this.isBaseMaoActice = false
	  		this.isSatelliteMapActice = false
	  		this.is3DMapActice = true

	  	},

	  	// 放回首页
	  	goToHome() {
	  		this.isLayerActive1 = !this.isLayerActive1
	  	},

	  	// 切换图层
	  	toggleLayerVisible() {
	  		this.isLayerActive2 = !this.isLayerActive2

	  		// if (this.isLayerActive2) {
	  			changeLayer()
	  		// }
	  	},

	  	// 显示淹没水深等值线
	  	loadWaterDeepClassify() {
	  		this.isLayerActive2 = !this.isLayerActive2
  			loadWaterDeepClassify()
	  	}
	  }
	}
</script>
