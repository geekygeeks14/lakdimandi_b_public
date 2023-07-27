const { userModel } = require("../../models/user");
const { roleModel } = require("../../models/role");
const { AuthToken } = require("../../models/authtoken");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const {
  newUserIdGen,
  randomPassword,
  encryptAES,
  passwordEncryptAES,
  passwordDecryptAES,
  decryptAES

} = require("../../util/helper");
const secret = process.env.SECRET;

module.exports = {
  userlogin: async (req, res) => {
    try {
      const user = await userModel.findOne({ "userInfo.userId": req.body.userId });
      if (!user) {
        return res.status(200).json({
          success: false,
          message: "User name or Password is wrong.",
        });
      }
     
      if (user.deleted === true) {
        return res
        .status(200)
        .json({ success: false, message: "Please contact to admin." });
      }
      if (!user.isActive) {
        return res.status(200).json({
          success: false,
          message: "User was suspended. Please contact to admin",
        });
      }
      if(!user.isApproved){
          return res.status(200).json({
            success: false,
            message: "User not approved by admin. Please contact to admin.",
          });
      }
        if(!(user && passwordDecryptAES(user.userInfo.password)===decryptAES(req.body.password,'login'))) {
          return res.status(200).json({
            success: false,
            message: "User name or Password is wrong",
          });
        }
        const roleExist = await roleModel.findOne({ _id: user.userInfo.roleId });
        //if (roleExist && roleExist.roleName && (roleExist.roleName === "TOPADMIN" || roleExist.roleName === "ADMIN")) isAdmin = true;
        //const expireDay=  isAdmin?"1d":"100d"
        const ROLE = roleExist? roleExist.roleName:''
        let isAdmin = (ROLE && (ROLE==='ADMIN'|| ROLE==='TOPADMIN' || ROLE==='SUPER_ADMIN'|| ROLE==='INSTANCE ADMIN'))? true : false
        const expireDay=  "1d"
        const tokenGen = jwt.sign(
          {
            userId: user.id,
            isAdmin: isAdmin,
          },
          secret,
          { expiresIn: expireDay }
        );
        const tokenSave = new AuthToken({
          token: tokenGen,
          userId: user.id
        });

        const tokenData = await tokenSave.save();
        return res.status(200).json({
          success: true,
          message: "Logged-in successfully",
          data: { user: user, token: tokenGen },
        });

    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "Error while login-user.",
        error: err.message,
      });
    }
  },

  // addUser: async (req, res) => {
  //   try {
  //     //  const regis=true
  //     //  if(regis){
  //     //   return res.status(200).json({
  //     //     success: false,
  //     //     message: "Please contact to admin.",
  //     //   });
  //     //  }

  //     if(req.body.aadharNumber){
  //       const notUniqueUser = await userModel.findOne({ "userInfo.aadharNumber": req.body.aadharNumber});
  //       if (notUniqueUser){
  //         return res.status(200).json({
  //           success: false,
  //           message: "Aadhar number is already registered.",
  //         });
  //       }
  //     }

  //     const isAdminRegistration = req.body.isAdminRegistration
  //     delete req.body.isAdminRegistration

  //     const newUserId = await newUserIdGen();
  //     const getRoleId = await roleModel.findOne({ roleName: "STUDENT" });
  //     let newPassword =  randomPassword().join("").toString();
  //       let newUser = new userModel({
  //         userInfo: {
  //           ...req.body,
  //           dob:new Date(req.body.dob),
  //           roleId: getRoleId._id.toString(),
  //           userId: newUserId,
  //           password: passwordEncryptAES(newPassword)
  //         },
  //         isActive:isAdminRegistration? true: false,
  //         isApproved: isAdminRegistration? true: false,
  //       });
  //       const sendSMSandEmaildata = {
  //         fullName: req.body.fullName,
  //         email: req.body.email,
  //         phoneNumber: req.body.phoneNumber1,
  //         userId: newUserId,
  //         password: newPassword,
  //       };

  //       // let responseData = {
  //       //   name: req.body.name,
  //       //   email: req.body.email,
  //       //   roiId: newRoiId,
  //       //   referralRoiId: req.body.parentRoiId,
  //       //   receiverPhoneNumber: req.body.phoneNumber,
  //       //   password: newPassword,
  //       // };
  //         const sms = await sendSms(sendSMSandEmaildata);
  //         //const sms= true
       
  //         if (sms) {
  //           let userData = await newUser.save();
  //           return res.status(200).json({
  //             success: true,
  //             message: "Registration successful.",
  //           });
  //         } else {
  //           return res.status(200).json({
  //             success: false,
  //             message: "Mobile mumber is not valid",
  //           });
  //         }
  //   } catch (err) {
  //     return res.status(400).json({
  //       success: false,
  //       message: "Resigtration unsuccessful.",
  //       error: err.message,
  //     });
  //   }
  // },
};
