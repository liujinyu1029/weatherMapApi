const router = require('koa-router')()
const mongodb = require('../mongodb');

const _catchErr_resBody = err => {
  return {
    ret: 0,
    error: {
      message: err.message,
      stack: err.stack
    }
  }
}

// 去掉 favicon.ico
router.get('/favicon.ico', async (ctx, next) => {
  ctx.response.body = ''
})
// ****************** 域名操作部分 *******************
// 表hostList 获取域名列表
router.all('/_house_api/getHostList', async (ctx, next) => {
  let resList = await mongodb.find_hostList()
  ctx.response.body = {
    ret: 1,
    data: resList
  }
})
// 获取当前生效的唯一域名
router.all('/_house_api/getCurrentHost', async (ctx, next) => {
  let res = await mongodb.find_currentHost()
  ctx.response.body = {
    ret: 1,
    data: res
  }
})
// 设置当前域名
router.all('/_house_api/set_currentHost', async (ctx, next) => {
  let {host} = ctx.request.body||{};
  try{
    let res = await mongodb.set_currentHost(host)
    ctx.response.body = {
      ret: 1,
      data: '当前域名切换成功',
      message:res
    }
  }catch(e){
    ctx.response.body = _catchErr_resBody(e)
  }
})
// 增加新域名 表hostList
router.post('/_house_api/addHost', async (ctx, next) => {
  let {host} = ctx.request.body||{};
  try{
    let result = await mongodb.insert_hostList(host)
    let resList = await mongodb.find_hostList()
    ctx.response.body = {
      ret: 1,
      data: resList,
      result
    }
  }catch(e){
    ctx.response.body = _catchErr_resBody(e)
  }
})
// 删除一个域名 表hostList
router.post('/_house_api/removeHost', async (ctx, next) => {
  let {host} = ctx.request.body||{};
  try{
    let result = await mongodb.removeOne_hostList(host)
    let resList = await mongodb.find_hostList()
    ctx.response.body = {
      ret: 1,
      data: resList,
      result
    }
  }catch(e){
    ctx.response.body = _catchErr_resBody(e)
  }
})

// ****************** apiData操作部分 *******************
// 【查询site表 - 自由】 查询接口表 自由查询
router.all('/_house_api/getApiData', async (ctx, next) => {
  try {
    let resultList = await mongodb.find_apiData(ctx.request.body)
    ctx.response.body = {
      ret: 1,
      data: resultList
    }
  } catch (e) {
    ctx.response.body = _catchErr_resBody(e)
  }
})
// 【查询site表 - host,url模糊 - 返回值可配置】 查询接口表 以 url、host 为条件 模糊查询
router.all('/_house_api/getApiDataByUrl', async (ctx, next) => {
  let {url,filterKeys} = ctx.request.body 
  // filterRule 返回值规则 Array类型
  if (!url){
    ctx.response.body = _catchErr_resBody({
      message: "url参数不能为空"
    })
    return
  }
  try {
    let resObj = await mongodb.find_currentHost()
    let resultList = await mongodb.find_apiData({
      host: resObj.host,
      url: new RegExp(url||'')
    })
    ctx.response.body = {
      ret: 1,
      data: resultList.map(v=>{
        if (!filterKeys) {
          return v
        }else{
          let _out = {}
          filterKeys.forEach(keyName => {
            _out[keyName] = v[keyName]
          })
          return _out
        }
      })
    }
  } catch (e) {
    ctx.response.body = _catchErr_resBody(e)
  }
})
// 【更新接口-自由】更新某一个接口的数据 任意更新规则
router.all('/_house_api/updateOne_apiData', async (ctx, next) => {
  let {url,...setData} = ctx.request.body;
  try{
    let resObj = await mongodb.find_currentHost()
    let result = await mongodb.updateOne_apiData(url, resObj.host, setData)
    ctx.response.body = {
      ret: 1,
      data: result
    }
  }catch(e){
    ctx.response.body = _catchErr_resBody(e)
  }
})
// 【更新接口-自由】更新某一个接口的数据 任意更新规则
router.all('/_house_api/updateMany_apiDataByHost', async (ctx, next) => {
  let {isUseLocalData} = ctx.request.body;
  try{
    let res = await mongodb.updateMany_apiDataByHost({
      isUseLocalData: !!isUseLocalData
    })
    ctx.response.body = {
      ret: 1,
      data: res
    }
  }catch(e){
    ctx.response.body = _catchErr_resBody(e)
  }
})
// 【删除接口】根据url删除一个接口
router.all('/_house_api/removeOne_api', async (ctx, next) => {
  let {url} = ctx.request.body||{};
  try{
    let res = await mongodb.removeOne_api(url)
    ctx.response.body = {
      ret: 1,
      data:res
    }
  } catch (e) {
    ctx.response.body = _catchErr_resBody(e)
  }
})
// 【增加接口】
router.all('/_house_api/addOne_api', async (ctx, next) => {
  let {path,desc,newData} = ctx.request.body||{};
  try{
    let resList = await mongodb.addOne_api(path, newData, desc)
    ctx.response.body = {
      ret: 1,
      data: resList
    }
  } catch (e) {
    ctx.response.body = _catchErr_resBody(e)
  }
})

// 【新增备份】为某一个接口的历史备份列表中增加一个新的备份
router.all('/_house_api/insertOne_apiInfoBackups', async (ctx, next) => {
  let {url,newData} = ctx.request.body||{};
  try{
    let resHost = await mongodb.find_currentHost()
    let resObj = await mongodb.insertOne_apiInfoBackups(url, resHost.host, newData)
    ctx.response.body = {
      ret: 1,
      data: resObj
    }
  } catch (e) {
    ctx.response.body = _catchErr_resBody(e)
  }
})

// 【删除备份】
router.all('/_house_api/remove_apiInfoBackups', async (ctx, next) => {
  let {url,index} = ctx.request.body;
  try{
    let resHost = await mongodb.find_currentHost()
    let resObj = await mongodb.remove_apiInfoBackups(url, resHost.host, index)
    ctx.response.body = {
      ret: 1,
      data: resObj
    }
  } catch (e) {
    ctx.response.body = _catchErr_resBody(e)
  }
})
// 【更新某个备份】
router.all('/_house_api/updateOne_apiInfoBackups', async (ctx, next) => {
  let {url,index,newData} = ctx.request.body;
  try{
    let resHost = await mongodb.find_currentHost()
    let resObj = await mongodb.updateOne_apiInfoBackups(url, resHost.host,index, newData)
    ctx.response.body = {
      ret: 1,
      data: resObj
    }
  } catch (e) {
    ctx.response.body = _catchErr_resBody(e)
  }
})

// 【使用备份】将某个备份设置为使用状态
router.all('/_house_api/setUse_apiInfoBackups', async (ctx, next) => {
  let {url,index} = ctx.request.body;
  try{
    let resHost = await mongodb.find_currentHost()
    let resObj = await mongodb.setUse_apiInfoBackups(url, resHost.host, index)
    ctx.response.body = {
      ret: 1,
      data: resObj
    }
  } catch (e) {
    ctx.response.body = _catchErr_resBody(e)
  }
})



module.exports = router