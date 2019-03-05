var map = new AMap.Map('container', {});
let WEATHER_ICON_NUMBER = 6 //路线上打几个天气点 5个点

var startLngLat = getQueryString('start').split(',')
var endLngLat = getQueryString('end').split(',')

// 根据经纬度 ，获取格点实况天气
const getWeatherSK = (position = []) => {
  let [lng,lat] = position
  return new Promise((resolve,reject)=>{
    axios.get('https://www.chenjinxinlove.com/tianyi/grid_rmi_observe', {
      params: {
        lat, lng,
        serialNo: '1000513',
        appkey: '28368882e7af97daf9b91f0dd279a5d5'
      }
    })
    .then(function (response) {
      let resList = response.data.result.obs1h[`${(Math.round(lat*100)/100).toFixed(2)}_${(Math.round(lng*100)/100).toFixed(2)}`]
      let weather = resList[0].WEATHER
      resolve(weather);
    })
    .catch(function (error) {
      reject(error);
    });
  })
}
// 沿途打点，以固定距离 
const setWeatherIcon = result => {
  // 未出错时，result即是对应的路线规划方案
  let route = (result.routes || [{}])[0]
  // 打几个点 分几段距离
  let distance_number = (route.distance / WEATHER_ICON_NUMBER).toFixed(2)
  let stepsList = route.steps || []
  let startPoint = stepsList[0].path[0]
  var p1 = new AMap.LngLat(startPoint.lng, startPoint.lat)
  stepsList.forEach(step => {
    // 以固定距离取点
    (step.tmcsPaths || []).forEach(tmcsPath => {
      (tmcsPath.path || []).forEach(point => {
        let p2 = new AMap.LngLat(point.lng, point.lat)
        if (p1.distance(p2) > distance_number) {
          console.log('[distance]:', p1.distance(p2))
          p1 = p2
          let position = [point.lng, point.lat]
          getWeatherSK(position).then(weaNumber => {
            new AMap.Marker({
              map: map,
              icon: new AMap.Icon({
                image: `http://e.weather.com.cn/chunyun/i/icon/d${weaNumber}.png`,
                imageSize: new AMap.Size(36, 36),
              }),
              position,
              offset: new AMap.Pixel(-18, -36)
            });
          }).catch(err => {
            console.log(22, err)
          })
        }
      })
    })
  })
}
// 开始导航规划
AMap.plugin('AMap.Driving', function () {
  var driving = new AMap.Driving({
    // 驾车路线规划策略，AMap.DrivingPolicy.LEAST_TIME是最快捷模式
    policy: AMap.DrivingPolicy.LEAST_TIME,
    map: map
  })
  driving.search(startLngLat, endLngLat,function(status, result) {
    console.log(11,result)
    setWeatherIcon(result)
  })
})
// 获取url中的参数
function getQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

