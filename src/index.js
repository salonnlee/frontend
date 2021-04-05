// const koa = require('koa')
const koa = require("koa");
const koaBody = require("koa-body");
const helmet = require("koa-helmet");
const router = require("./routes/routes");

const app = new koa();

app.use(helmet());
app.use(koaBody());
app.use(router());

console.log("app is running on 3000!");
app.listen(3000);
