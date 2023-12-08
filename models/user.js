const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userInfo: {
    email: {
      type: String,
      //required: true,
    },
    fullName: {
      type: String,
      trim: true,
      required: true,
    },
    firstName: {
      type: String,
      trim: true,
      required: true,
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
    },
    companyName: {
      type: String,
      trim: true,
      //required: true,
    },
    password: {
      type: String,
      required: true,
    },
    actionPassword: {
      type: String,
    },
    phoneNumber1: {
      type: String,
      trim: true,
      //required: true,
    },
    phoneNumber2: {
      type: String,
      //required: true,
    },
    dob:{
      type:Date,
      //required: true,
    },
    gender: {
      type: String,
    },
    roleName: {
      type: String,
      required: true,
      trim: true,
      default: "USER",
    },
    userId: {
      type: String,
      required: true,
    },
    companyId: {
      type: String,
      required: true,
    },
    parentUserId: {
      type: String,
    },
    roleId:{
      type: String,
      required: true
    },
    perHourRate:{
      type:Number
    },
    address:{
      type:String,
      trim: true,
    },
    city:{
      type:String,
      trim: true,
    },
    state:{
      type:String,
      trim: true,
    }
  },
  permissions: {
    type: Array,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
  },
  modified: {
    type: Date,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
});

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userSchema.set("toJSON", {
  virtuals: true,
});

userSchema.pre("save", function (next) {
  now = new Date();
  this.modified = now;
  if (!this.created) {
    this.created = now;
  }
  next();
});

exports.userModel = mongoose.model("User", userSchema);
exports.userSchema = userSchema;
