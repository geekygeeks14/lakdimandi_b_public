const mongoose = require("mongoose");

const recieverSchema = new mongoose.Schema({
  recieverName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  companyId:{
    type: String,
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

recieverSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

recieverSchema.set("toJSON", {
  virtuals: true,
});

recieverSchema.pre("save", function (next) {
  now = new Date();
  this.modified = now;
  if (!this.created) {
    this.created = now;
  }
  next();
});

exports.recieverModel = mongoose.model("reciever", recieverSchema);
exports.recieverSchema = recieverSchema;
