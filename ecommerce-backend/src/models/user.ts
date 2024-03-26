import mongoose from "mongoose";
import validator from "validator";

interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  photo: string;
  role: "admin" | "user";
  gender: "male" | "female";
  dob: Date;
  createdAt: Date;
  updatedAt: Date;
  //Virtual Attribute
  age: number;
}
const schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: [true, "Please enter id"],
    },
    name: {
      type: String,
      required: [true, "Please enter name"],
    },
    email: {
      type: String,
      unique: [true, "Email already exits"],
      required: [true, "Please enter email"],
      validate: validator.default.isEmail,
    },
    photo: {
      type: String,
      required: [true, "Please add photo"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    gender: {
      type: String,
      required: [true, "Please enter date of birth"],
    },
    dob: {
      type: Date,
      enum: ["male", "female"],
      required: [true, "Please enter gender"],
    },
  },
  {
    timestamps: true,
  }
);

schema.virtual("age").get(function () {
  const today = new Date();
  const dob: Date = this.dob;
  let age = today.getFullYear() - dob.getFullYear();
  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDay() < dob.getDay())
  )
    age--;

  return age;
});

export const User = mongoose.model<IUser>("User", schema);
