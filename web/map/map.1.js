var map = new AMap.Map('container', {});
let distanceRule = 10000 // 以固定距离取点
let distanceAddUp = 0
var driveLine = [{
    keyword: '安慧里',
    city: '北京'
  },
  {
    keyword: '渤海',
    city: '天津'
  }
]

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
      let res = response.data.result.obs1h[`${Math.round(lat*100)/100}_${Math.round(lng*100)/100}`][0].WEATHER
      resolve(res);
    })
    .catch(function (error) {
      reject(error);
    });
  })
}
// 沿途打点，以固定距离 distanceRule
const setWeatherIcon = result => {
  // 未出错时，result即是对应的路线规划方案
  ((result.routes || [{}])[0].steps || []).forEach(step => {
    // 以固定距离取点
    (step.tmcs || []).forEach(tmc => {
      distanceAddUp += +tmc.distance || 0
      if (distanceAddUp > distanceRule) {
        let point = tmc.polyline.split(';')[0]
        getWeatherSK(point.split(',')).then(weaNumber=>{
          new AMap.Marker({
            map: map,
            icon: new AMap.Icon({
              image: `http://e.weather.com.cn/chunyun/i/icon/d${weaNumber}.png`,
              imageSize: new AMap.Size(36, 36),
            }),
            position: point.split(','),
            offset: new AMap.Pixel(-18, -36)
          });
        }).catch(err=>{
          console.log(22,err)
        })
        distanceAddUp = 0
      }
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
  driving.search(driveLine, function (status, result) {
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

