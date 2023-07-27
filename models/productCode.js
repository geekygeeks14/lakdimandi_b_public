const mongoose = require("mongoose");

const productCodeSchema = new mongoose.Schema({
  productCode: {
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

productCodeSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

productCodeSchema.set("toJSON", {
  virtuals: true,
});

productCodeSchema.pre("save", function (next) {
  now = new Date();
  this.modified = now;
  if (!this.created) {
    this.created = now;
  }
  next();
});

exports.productCodeModel = mongoose.model("productCode", productCodeSchema);
exports.productCodeSchema = productCodeSchema;
