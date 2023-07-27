const express = require("express");
const router = express.Router();
const public = require("../api/controller/public");

router.post("/userlogin", public.userlogin);
//router.post("/addUser", public.addUser);

module.exports = router;
