const Koa = require("koa");
const Router = require("koa-router");

const koaBody = require("koa-body");

const app = new Koa();
const router = new Router();

router.prefix("/api");

router.post("/user", async (ctx) => {
  const { body, headers } = ctx.request;

  ctx.setStatus = (status) => {
    ctx.status = status;
    return ctx;
  };
  ctx.setBodyMsg = (msg) => {
    ctx.body = msg;
    return ctx;
  };
  ctx.setBodyMsgWithCode = (msg, data) => {
    ctx.body = {
      code: ctx.status,
      msg: msg
    };
    if (data) {
      ctx.body.data = { ...data };
    }
    return ctx;
  };

  // 0. body is nil or empty
  if (!body || !Object.keys(body).length) {
    ctx.setStatus(404).setBodyMsg("Not Found");
    return;
  }
  // 1. name or email is nil
  if (!body.name || !body.email) {
    ctx.setStatus(404).setBodyMsgWithCode("name and email is required");
    return;
  }
  // 2. headers has no role or role is not admin
  if (!headers.role || headers.role !== "admin") {
    ctx.setStatus(401).setBodyMsgWithCode("unauthorized post");
    return;
  }
  // 3. normal request
  const { name, email } = body;
  ctx.setStatus(200).setBodyMsgWithCode("upload successful", {
    name,
    email
  });
  return;
});

app.use(koaBody());
app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
