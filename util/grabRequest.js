const request = require('request')

module.exports = async (options) => {
    let defaultOpation = {
        url: 'http://xxx.com/api/getData',//要抓取接口的远端地址
        method:'post',
        json: true,
        headers: {
            // "Content-Length":0, // Content-Length最好不要写，用默认值，会自动计算长度
            'content-type': 'application/json',
            'cookie': ''
        },
        body:{}// post参数
    };
    return new Promise((resolve,reject)=>{
        request(Object.assign(defaultOpation, options), function (error, response, data) {
            if (!error) {
                if (response && response.statusCode == 200){
                    resolve(data || {
                        errMsg: '远端服务器返回数据为空'
                    })
                }else{
                    resolve({
                        statusCode: response.statusCode,
                        data,
                    })
                }
            } else {
                resolve({
                    errMsg: '抓取远端服务器数据失败',
                    error
                })
            }
        })
    })
}
