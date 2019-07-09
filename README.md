# project_ocean_monitor-client

> 海洋预警监测中心

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
使用npm run build构建用于生产的代码，生成的代码在dist目录下

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```
## 关于地图代码的使用
### 1.在index.html文件中使用script标签引入js文件，并且放到id为app的div下面

### 2.在home.vue中可以直接调用上述引入js文件里的函数

## 配置访问地址和端口
修改config/index.js中的host和port指定的ip地址和端口

<!-- For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader). -->
