const express = require("express");
const router = express.Router();
const cronjobs = require("../api/controller/cronJobs");
const { isAunthaticatedAdmin } = require("../middleware/auth");


router.get("/sendDailyBackupEmail", isAunthaticatedAdmin, cronjobs.sendDailyBackupEmail);
module.exports = router;