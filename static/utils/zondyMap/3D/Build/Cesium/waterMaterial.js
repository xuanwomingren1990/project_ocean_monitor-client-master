
var waterMaterial = {
    waters: [],
    normalMapUrl: "../lib/CesiumPlugins/water/img/waterNormals.jpg",
    apply: function(e, a, r) {
        var n = e.scene.primitives.add(new Cesium.Primitive({
            geometryInstances: a,
            appearance: new Cesium.EllipsoidSurfaceAppearance({
                aboveGround: !1,
                material: new Cesium.Material({
                    fabric: {
                        type: "Water",
                        uniforms: {
                            normalMap: r || this.normalMapUrl,
                            frequency: 8e3,
                            animationSpeed: .02,
                            amplitude: 5,
                            specularIntensity: .8,
                            baseWaterColor: new Cesium.Color.fromCssColorString("#006ab4"),
                            blendColor: new Cesium.Color.fromCssColorString("#00baff")
                        }
                    }
                }),
                fragmentShaderSource: this.getShader()
            }),
            show: !0
        }));
        return this.waters.push(n),
        n
    },
    remove: function(e) {
        viewer.scene.primitives.remove(e)
    },
    removeAll: function(e) {
        for (var a = 0; a < this.waters.length; a++)
            e.scene.primitives.remove(this.waters[a]);
        this.waters = []
    },
    getShader: function() {
        return "varying vec3 v_positionMC;\n                varying vec3 v_positionEC;\n                varying vec2 v_st;\n                \n                void main()\n                {\n                    czm_materialInput materialInput;\n                    vec3 normalEC = normalize(czm_normal3D * czm_geodeticSurfaceNormal(v_positionMC, vec3(0.0), vec3(1.0)));\n                #ifdef FACE_FORWARD\n                    normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);\n                #endif\n                    materialInput.s = v_st.s;\n                    materialInput.st = v_st;\n                    materialInput.str = vec3(v_st, 0.0);\n                    materialInput.normalEC = normalEC;\n                    materialInput.tangentToEyeMatrix = czm_eastNorthUpToEyeCoordinates(v_positionMC, materialInput.normalEC);\n                    vec3 positionToEyeEC = -v_positionEC;\n                    materialInput.positionToEyeEC = positionToEyeEC;\n                    czm_material material = czm_getMaterial(materialInput);\n                #ifdef FLAT\n                    gl_FragColor = vec4(material.diffuse + material.emission, material.alpha);\n                #else\n                    gl_FragColor = czm_phong(normalize(positionToEyeEC), material);\n                    gl_FragColor.a = 0.5;\n                #endif\n                }"
    }
};
