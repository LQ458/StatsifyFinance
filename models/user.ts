import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v: string) {
        return /^[^\W_]+$/.test(v);
      },
      message: (props: { value: any }) =>
        `${props.value} contains special characters`,
    },
  },
  originalPassword: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  admin: {
    type: Boolean,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    default: null,
  },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
