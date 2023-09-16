const mongoose = require("mongoose");

const workDetailSchema = new mongoose.Schema({
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
    required: true,
  },
  totalMilliSec: {
    type: Number,
    required: true,
  },
  loadingWorkList: [],
  unLoadingWorkList: [],
  productionWorkList: [],
  otherWorkList:[],
  dateOfWork:{
    type: String,
    required: true,
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

workDetailSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

workDetailSchema.set("toJSON", {
  virtuals: true,
});

workDetailSchema.pre("save", function (next) {
  now = new Date();
  this.modified = now;
  if (!this.created) {
    this.created = now;
  }
  next();
});

exports.workDetailModel = mongoose.model("workDetail", workDetailSchema);
exports.workDetailSchema = workDetailSchema;
