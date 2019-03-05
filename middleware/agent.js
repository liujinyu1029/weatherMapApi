//====  这是一个中转代理  ====
const grabRequest = require('../util/grabRequest') // grabRequest 封装了 request
// const config = require('../config')
// const catchErr = require('../util/catchErr')

module.exports = async (ctx, next) => {
  let {method,request} = ctx;
  let {path,headers,body} = request;


  // 配置要抓取的远端服务器信息
  let options = {
    url: "http://way.weatherdt.com/tianyi/grid_rmi_observe",
    method:'GET',
    json: false,
    headers: {
      'content-type': 'application/json',
      'cookie': headers.cookie || ''
    }
  };
  // 开始抓取远端服务器数据
  const grabRes = await grabRequest(options);
  ctx.state.apiRes = grabRes
}