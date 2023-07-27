const mongoose = require("mongoose");

const sellSchema = new mongoose.Schema({
  buyerDetail: {
    phoneNumber1: {
      type: String,
    },
    phoneNumber2: {
      type: String,
    },
    buyerName: {
      type: String,
    },
    companyName: {
      type: String,
    },
    address: {
      type: String,
    },
    natureOfBussiness: {
      type: String,
    },
  },
  sellInfo:[{
    productNameId: {
      type: String,
    },
    productCodeId:{
      type: String,
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
    },
    rate:{
      type: Number,
    },
    weight:{
      type: Number
    },
    weighted:{
      type: Number
    },
    unit:{
      type: String
    }
  }],
  payInfo:[{
    payMode:{
      type: String,
    },
    amount:{
      type: Number,
    },
    payDate:{
      type: Date,
    },
    payModifiedDate:{
      type: Date,
    },
  }],
  vehicleInfo: [{
    vehicleType: {
      type: String,
    },
    vehicleNumber: {
      type: String,
    },
    fare: {
      type: Number,
    },
  }],
  totalAmount:{
    type: Number,
  },
  dueAmount:{
    type: Number,
  },
  paidAmount:{
    type: Number,
  },
  discountAmount:{
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

sellSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

sellSchema.set("toJSON", {
  virtuals: true,
});

sellSchema.pre("save", function (next) {
  now = new Date();
  this.modified = now;
  if (!this.created) {
    this.created = now;
  }
  next();
});

exports.sellModel = mongoose.model("sell", sellSchema);
exports.sellSchema = sellSchema;
