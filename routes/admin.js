const express = require("express");
const router = express.Router();
const admin = require("../api/controller/admin");
const { isAunthaticatedAdmin } = require("../middleware/auth");

router.post("/addUser", isAunthaticatedAdmin, admin.addUser);
router.post("/updateUser/:id", isAunthaticatedAdmin, admin.updateUserById);
router.get("/getUser", isAunthaticatedAdmin, admin.getAllUsers);
router.get("/getPasswordById/:id", isAunthaticatedAdmin, admin.getPasswordById);
router.delete("/deleteUser/:id", isAunthaticatedAdmin, admin.deleteUser);
router.get("/getDashboardData", isAunthaticatedAdmin, admin.getDashboardData);
router.post("/submitPurchaseData", isAunthaticatedAdmin, admin.createPurchase);
router.post("/submitSellData", isAunthaticatedAdmin, admin.createSell);
router.post("/updateSellData/:id", isAunthaticatedAdmin, admin.updateSell);
router.get("/getAllPurchase",isAunthaticatedAdmin, admin.getAllPurchase)
router.get("/getAllSell",isAunthaticatedAdmin, admin.getAllSell)
router.delete("/deleteSellData/:id", isAunthaticatedAdmin, admin.deleteSellData)
router.delete("/deletePurchaseData/:id", isAunthaticatedAdmin, admin.deletePurchaseData)
router.post("/permanentDelete", isAunthaticatedAdmin, admin.permanentDelete)
router.post("/createProductName", isAunthaticatedAdmin, admin.createProductName);
router.post("/createProductCode", isAunthaticatedAdmin, admin.createProductCode);
router.get("/getAllProductName",isAunthaticatedAdmin, admin.getAllProductName)
router.get("/getAllProductCode",isAunthaticatedAdmin, admin.getAllProductCode)
router.post("/updateProductNameById",isAunthaticatedAdmin, admin.updateProductNameById)
router.post("/updateProductCodeById",isAunthaticatedAdmin, admin.updateProductCodeById)
router.delete("/deleteProductNameById/:id",isAunthaticatedAdmin, admin.deleteProductNameById)
router.delete("/deleteProductCodeById/:id",isAunthaticatedAdmin, admin.deleteProductCodeById)
router.get("/getFluctualWeight", isAunthaticatedAdmin, admin.getFluctualWeight);
router.post("/createFluctualWeight", isAunthaticatedAdmin, admin.createFluctualWeight);
router.post("/updateFluctualWeight/:id", isAunthaticatedAdmin, admin.updateFluctualWeight);
router.get("/getCompany", isAunthaticatedAdmin, admin.getCompany);
router.post("/resetPassword/:id", isAunthaticatedAdmin, admin.resetPassword);
router.post("/addWorkDetail", isAunthaticatedAdmin, admin.addWorkDetail);
router.post("/updateWorkDetail", isAunthaticatedAdmin, admin.updateWorkDetail);
router.get("/getWorkDetail", isAunthaticatedAdmin, admin.getWorkDetail);
router.post("/addReciever", isAunthaticatedAdmin, admin.addReciever);
router.get("/getReciver", isAunthaticatedAdmin, admin.getReciever);
router.post("/createPayOption", isAunthaticatedAdmin, admin.createPayOption);
router.get("/getAllPayOption", isAunthaticatedAdmin, admin.getAllPayOption);
router.post("/updatePayOption/:id", isAunthaticatedAdmin, admin.updatePayOption);
router.delete("/deletePayOption/:id", isAunthaticatedAdmin, admin.deletePayOption);

module.exports = router;
