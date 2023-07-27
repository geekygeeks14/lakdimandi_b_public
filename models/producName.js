const mongoose = require("mongoose");

const productNameSchema = new mongoose.Schema({
  productName: {
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

productNameSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

productNameSchema.set("toJSON", {
  virtuals: true,
});

productNameSchema.pre("save", function (next) {
  now = new Date();
  this.modified = now;
  if (!this.created) {
    this.created = now;
  }
  next();
});

exports.productNameModel = mongoose.model("productName", productNameSchema);
exports.productNameSchema = productNameSchema;
