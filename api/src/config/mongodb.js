import mongoose from "mongoose";

const DB_URL = "mongodb://admin:admin123456@172.16.58.128:27017/p6";

// 创建连接
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// 连接成功
mongoose.connection.on("connected", () => {
  console.log("Mongoose connection open to " + DB_URL);
});

// 连接异常
mongoose.connection.on("error", (err) => {
  console.log("Mongoose connection error: " + err);
});

// 断开连接
mongoose.connection.on("disconnected", () => {
  console.log("Mongoose connection disconnected");
});

export { DB_URL };

export default mongoose;
