const express = require("express");
const router = express.Router();
const secuirityLog = require("../api/controller/secuirityLog");

router.post("/save", secuirityLog.savelog);
router.get("/getLogs", secuirityLog.getSecuirtyLogs);

module.exports = router;
