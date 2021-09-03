import mongoose from "@/config/mongodb";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String },
  password: { type: String }
});

const UserModel = mongoose.model("users", UserSchema);

export default UserModel;
