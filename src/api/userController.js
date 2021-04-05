async function getUserInfo(ctx) {
  let { body } = ctx.request;
  if (
    !body ||
    typeof body.name === "undefined" ||
    typeof body.email === "undefined"
  ) {
    ctx.status = 404;
    ctx.body = {
      code: 404,
      msg: "name与email不得为空"
    };
    return;
  } else {
    if (typeof ctx.header.role !== "undefined" && ctx.header.role === "admin") {
      ctx.body = {
        code: 200,
        data: { ...body },
        msg: "上传成功"
      };
      return;
    } else {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        msg: "unauthorized post"
      };
    }
  }
}

module.exports = {
  getUserInfo
};
