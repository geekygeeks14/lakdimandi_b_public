const mongoose = require("mongoose");
const INVOICETYPE = ["NEW SELL PAYMENT", "DUE SELL PAYMENT"];
const invoiceSchema = new mongoose.Schema({
  invoiceId: {
    type: String,
    required: true,
  },
  companyId: {
    type: String,
    required: true,
  },
  invoiceInfo: {
    type: JSON
  },
  invoiceType:{
    type: String,
    required: true,
    enum: INVOICETYPE
  }, 
  paidStatus: {
    type: Boolean, // Add Aamount True, Expense then false
  },
  insertedBy: {
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

invoiceSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

invoiceSchema.set("toJSON", {
  virtuals: true,
});

invoiceSchema.pre("save", function (next) {
  now = new Date();
  this.modified = now;
  if (!this.created) {
    this.created = now;
  }
  next();
});

exports.invoiceModel = mongoose.model("invoice", invoiceSchema);
exports.invoiceSchema = invoiceSchema;
