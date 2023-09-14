const express = require("express");
const router = express.Router();
const securityLog = require("../api/controller/securityLog");
const { isAunthaticatedAdmin } = require("../middleware/auth");

router.post("/save", securityLog.savelog);
router.get("/getLogs", isAunthaticatedAdmin, securityLog.getSecurityLogs);

module.exports = router;
