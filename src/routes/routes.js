const combineRoutes = require("koa-combine-routers");
const userRoutes = require("./userRouter");

const router = combineRoutes(userRoutes);

module.exports = router;
