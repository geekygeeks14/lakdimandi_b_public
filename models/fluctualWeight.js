const mongoose = require("mongoose");

const fluctualWeightSchema = new mongoose.Schema({
  fluctualateWeightValue: {
    type: Number,
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

fluctualWeightSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

fluctualWeightSchema.set("toJSON", {
  virtuals: true,
});

fluctualWeightSchema.pre("save", function (next) {
  now = new Date();
  this.modified = now;
  if (!this.created) {
    this.created = now;
  }
  next();
});

exports.fluctualWeightModel = mongoose.model("fluctualWeight", fluctualWeightSchema);
exports.fluctualWeightSchema = fluctualWeightSchema;
