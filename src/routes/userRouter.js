const Router = require("koa-router");
const user = require("../api/userController");

const router = new Router();

router.prefix("/api");
router.post("/user", user.getUserInfo);

module.exports = router;
