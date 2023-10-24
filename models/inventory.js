const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  productNameId: {
    type: String,
    required: true,
  },
  productCodeId: {
    type: String,
    required: true,
    require:true,
  },
  companyId:{
    type: String,
    required:true,
  },
  price:{
    type: Number,
  },
  perUnitWeight:{
    type: Number,
  },
  length:{
    type: Number,
  },
  breadth:{
    type: Number,
  },
  height:{
    type: Number,
  },
  qty:{
    type: Number,
    require:true,
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

inventorySchema.virtual("id").get(function () {
  return this._id.toHexString();
});

inventorySchema.set("toJSON", {
  virtuals: true,
});

inventorySchema.pre("save", function (next) {
  now = new Date();
  this.modified = now;
  if (!this.created) {
    this.created = now;
  }
  next();
});

exports.inventoryModel = mongoose.model("inventory", inventorySchema);
exports.inventorySchema = inventorySchema;
