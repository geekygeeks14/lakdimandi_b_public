const mongoose = require("mongoose");

const securityLogSchema = new mongoose.Schema({
    activity_date_time: {
        type: Date,
        trim: true,
        default: new Date()
    },
    menu_url: {
        type: String,
        trim: true,
        required: true,
    },
    activity_type: {
        type: String,
        trim: true,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        trim: true,
        required: false,
    },
    message: {
        type: String,
        trim: true,
        required: false,
    },
    phoneNumber: {
        type: String,
        trim: true,
        required: false,
    },
    companyId: {
        type: String,
        trim: true,
        required: false,
    },
    companyName: {
        type: String,
        trim: true,
        required: false,
    },
    ipAdress: {
        type: String,
        trim: true,
        required: false,
    },
    operatingSystem: {
        type: String,
        trim: true,
        required: false,
    },
    device: {
        type: String,
        trim: true,
    },
    created: {
        type: Date,
        default: new Date()
    },
    modified: {
        type: Date,
        default: new Date()
    }
});

securityLogSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

securityLogSchema.set("toJSON", {
  virtuals: true,
});

securityLogSchema.pre("save", function (next) {
  now = new Date();
  this.modified = now;
  if (!this.created) {
    this.created = now;
  }
  next();
});

exports.securityLogModel = mongoose.model("securitylog", securityLogSchema);
exports.securityLogSchema = securityLogSchema;
