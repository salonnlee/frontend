// const koa = require('koa')
// const path = require('path')
import koa from 'koa'
import koaBody from 'koa-body'
import helmet from 'koa-helmet'
import router from './routes/routes'

const app = new koa()

app.use(helmet())
app.use(koaBody())
app.use(router())

console.log('app is running on 3000!')
app.listen(3000)
