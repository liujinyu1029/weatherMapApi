//====  请求走向控制层  ====
// isUseLocalData:true 使用本地数据库中静态数据
// isUseLocalData:false|undefinde 走线上真实数据
const mongodb = require('../mongodb')

module.exports = async (ctx, next) => {
    //拼接地址
    let res = await mongodb.find_currentHost();
    let {host} = res;
    let {path} = ctx.request;
    let url = host + path;
    //查询该地址的走向配置
    let resApiList = await mongodb.find_apiData({url});
    let apiItem = resApiList[0] || {}
    if (apiItem.isUseLocalData) {
        //走本地
        ctx.response.body = apiItem.data;
    }else{
        //走线上
        await next()
    }
}