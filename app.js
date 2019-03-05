const Koa = new require('koa')
const bodyParser = require('koa-bodyparser')
const _static_serve = require('koa-static');
const path = require('path')
// 中间件
const grabAgent = require('./middleware/agent')

const app = new Koa()
app.use(bodyParser())

// 【静态页面】控制台页面
app.use(_static_serve(path.join(__dirname) + '/web'))

// app.use(async (ctx, next) => {
//   // 访问api路径
//   if(ctx.path=='/api'){
//     await next()
//     ctx.body = ctx.state.apiRes || 'empty'
//   }else{
//     ctx.body = '404'
//   }
// })
// 接口代理中间件
// app.use(grabAgent);

app.listen(8090, () => {
  console.log('start at port:8090')
})

