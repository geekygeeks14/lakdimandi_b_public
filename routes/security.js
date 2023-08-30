const express = require("express");
const router = express.Router();
const securityLog = require("../api/controller/securityLog");

router.post("/save", securityLog.savelog);
router.get("/getLogs", securityLog.getSecurityLogs);

module.exports = router;
