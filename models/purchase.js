const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  purchaseBasicInfo:{
    type: JSON,
  },
  purchaseProduct:{
    type: JSON,
  },
  workDetail:{
    type: JSON,
  },
  totalWeight:{
    type: Number,
  },
  actualWeight:{
    type: Number,
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
  companyId:{
    type: String,
  },
  insertedBy:{
    type: String,
  }
});

purchaseSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

purchaseSchema.set("toJSON", {
  virtuals: true,
});

purchaseSchema.pre("save", function (next) {
  now = new Date();
  this.modified = now;
  if (!this.created) {
    this.created = now;
  }
  next();
});

exports.purchaseModel = mongoose.model("purchase", purchaseSchema);
exports.purchaseSchema = purchaseSchema;
