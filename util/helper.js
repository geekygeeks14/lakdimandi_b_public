
const mongoose = require("mongoose");
const { userModel } = require("../models/user");
const CryptoJS = require('crypto-js');


require("dotenv/config");

const URL = process.env.MONGO_LOCAL_CONN_URL;
const SECRET_MSG= process.env.SECRET_MSG
const SECRET_MSG_PASSWORD = process.env.SECRET_MSG_PASSWORD
module.exports = {
 
  randomPassword: (number = 8) => {
    const chars = ["0123456789"];
    return [number]
      .map((len, i) => {
        return Array(len)
          .fill(chars[i])
          .map((x) => {
            return x[Math.floor(Math.random() * x.length)];
          })
          .join("");
      })
      .concat()
      .join("")
      .split("")
      .sort(() => {
        return 0.5 - Math.random();
      });
  },

  //to genrate new roi

  newUserIdGen: async () => {
    let newUserId = Date.now().toString().substring(7, 20).toString();
    for (;;) {
      const sameRoiId = await userModel.findOne({ "userInfo.userId": newUserId  });
      if (sameRoiId) {
        newUserId = Date.now().toString().substring(7, 20).toString();
      } else {
        break;
      }
    }
    return newUserId;
  },
  newCompanyIdGen: async () => {
    let newCompnayId = Date.now().toString().substring(7, 20).toString();
    for (;;) {
      const sameCompanyId = await userModel.findOne({ "userInfo.companyId": newCompnayId});
      if (sameCompanyId) {
        newCompnayId = Date.now().toString().substring(7, 20).toString();
      } else {
        break;
      }
    }
    return `C${newCompnayId}`;
  },

  encryptAES : (text) => {
    return CryptoJS.AES.encrypt(text, SECRET_MSG).toString();
  },


  decryptAES : (encryptedBase64, SECRET_MSG) => {
    const decrypted = CryptoJS.AES.decrypt(encryptedBase64, SECRET_MSG);
    if (decrypted) {
        try {
            console.log(decrypted);
            const str = decrypted.toString(CryptoJS.enc.Utf8);
            if (str.length > 0) {
                return str;
            } else {
                return encryptedBase64;
            }
        } catch (e) {
            return encryptedBase64;
        }
    }
    return encryptedBase64;
  },

  passwordEncryptAES : (text) => {
    return CryptoJS.AES.encrypt(text, SECRET_MSG_PASSWORD).toString();
  },
  passwordDecryptAES : (encryptedBase64) => {
    const decrypted = CryptoJS.AES.decrypt(encryptedBase64, SECRET_MSG_PASSWORD);
    if (decrypted) {
        try {
            const str = decrypted.toString(CryptoJS.enc.Utf8);
            if (str.length > 0) {
                return str;
            } else {
                return encryptedBase64;
            }
        } catch (e) {
            return encryptedBase64;
        }
    }
    return encryptedBase64;
  },
};
