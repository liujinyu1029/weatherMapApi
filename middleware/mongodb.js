//====  DB中间件  ====
// grabRequest 封装了 request
const mongodb = require('../mongodb') 

module.exports = async (ctx, next) => {
  let {apiData} = ctx.state;
    
  let fullApiData = {
    ...apiData,
    desc:'',//接口描述说明
    isUseLocalData: false, //是否使用本地数据 默认false, 去远端抓取数据
    backups_datas: [] //历史备份数据
  }

  let _dbRes = await mongodb.save(fullApiData);
  ctx.state._dbRes = _dbRes;
}