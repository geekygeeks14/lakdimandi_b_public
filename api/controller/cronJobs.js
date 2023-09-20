const {cronjobModel}=require("../../models/cronJob");
const {userModel } = require("../../models/user");
const {roleModel} = require("../../models/role")
const {purchaseModel } = require("../../models/purchase");
const {sellModel } = require("../../models/sell");
const {productNameModel } = require("../../models/producName");
const {productCodeModel } = require("../../models/productCode");
const {fluctualWeightModel } = require("../../models/fluctualWeight");
const {workDetailModel } = require("../../models/workDetail");
const {recieverModel } = require("../../models/reciever");
const {invoiceModel } = require("../../models/invoice");
const {payOptionModel } = require("../../models/payOption");
const nodemailer = require("nodemailer");
const moment = require("moment-timezone");
const todayIndiaDate = moment.tz(Date.now(), "Asia/Kolkata");
todayIndiaDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
// console.log("Today India date", todayIndiaDate);
//console.log("CURRENT TIME: " + moment().format('hh:mm:ss A'));

const JSZip = require('jszip');
const zip = new JSZip();
require("dotenv/config");

const SMTP_BREVO_USER_EMAIL=  process.env.SMTP_BREVO_USER_EMAIL
const SMTP_BREVO_USER_PASS = process.env.SMTP_BREVO_USER_PASS 
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: SMTP_BREVO_USER_EMAIL,
    pass: SMTP_BREVO_USER_PASS
  },
  // tls: {
  //   // do not fail on invalid certs
  //   rejectUnauthorized: false,
  // }
});

const mailTo= `yadhuvansienterprises@yahoo.com`

let requestBody={
  jobPerform: `Daily Backup Mail`,
  detail: `${mailTo} Daily Backup Mail send successfully.`,
  scheduleTime: (moment().format('hh:mm A')).toString(),
  status: 'Success'
}

// const convertData=(docs)=>{
//     // docs.forEach(element => {
//     //     element._id={
//     //       "$oid": element._id
//     //     }
//     //     if(element.dob){
//     //       element.dob={
//     //         "$date": {
//     //           "$numberLong": element.dob
//     //         }
//     //       }
//     //     }
//     //     element.created={
//     //       "$date": {
//     //         "$numberLong": element.dob
//     //       }
//     //     }
//     //     element.modified={
//     //       "$date": {
//     //         "$numberLong": element.dob
//     //       }
//     //     }
      
//     // });
//    const newDocs=  docs.map(element=> {
//       return{
//         ...element,
//         _id:{
//             "$oid": element._id
//           },
//           created:{
//             "$date": {
//               "$numberLong": element.dob
//             }
//           },
//           modified:{
//             "$date": {
//               "$numberLong": element.dob
//             }
//           }
//       }
//     })
//     console.log("docsdocsdocs", newDocs)
//   return newDocs
// }


module.exports = {
    sendDailyBackupEmail: async (req, res, next) => {
    try {
      let today = new Date(todayIndiaDate);
      let dd = String(today.getDate()).padStart(2, '0');
      let mm = String(today.getMonth() + 1).padStart(2, '0'); 
      let yyyy = today.getFullYear();
      today = dd + '/' + mm + '/' + yyyy;
      const userData = await userModel.find()
      const roleData = await roleModel.find()
      const purchaseData = await purchaseModel.find()
      const sellData = await sellModel.find()
      const productNameData = await productNameModel.find()
      const productCodeData = await productCodeModel.find()
      const workDetailData = await workDetailModel.find()
      const recieverData = await recieverModel.find()
      const fluctualWeightData = await fluctualWeightModel.find()
      const invoiceData = await invoiceModel.find()
      const payOptionData = await payOptionModel.find()
        //convertData(userData), null, "\t")
        zip.file("users.json", JSON.stringify(userData)); 
        zip.file("roles.json",JSON.stringify(roleData)); 
        zip.file("purchases.json", JSON.stringify(purchaseData));
        zip.file("sells.json",JSON.stringify(sellData)); 
        zip.file("productnames.json", JSON.stringify(productNameData));
        zip.file("productcodes.json",JSON.stringify(productCodeData));
        zip.file("workdetails.json", JSON.stringify(workDetailData)); // in future update  the name
        zip.file("vehicleroutefares.json",JSON.stringify(recieverData)); 
        zip.file("payements.json",JSON.stringify(fluctualWeightData)); 
        zip.file("invoices.json", JSON.stringify(invoiceData)); 
        zip.file("payoptions.json",JSON.stringify(payOptionData));

        const buffer = await zip.generateAsync({ type: `nodebuffer` })
        if(buffer){ 
            const mailOptions ={ 
                from: `"YE Daily Backup ${today}" <info@bmmschool.in>`, // sender address 
                to: mailTo, // list of receivers
                cc: `geekygeeks14@gmail.com`,
                subject: `YE Daily Backup ${today}`, // Subject line 
                text: "Find atachment", // plain text body 
                html: "<b>Yadhuvanshi Enterprises</b>", // html body 
                attachments: [ 
                    { 
                        filename: `YE_Daily_Backup_${today}.zip`, 
                        content: buffer 
                    }, 
                ], 
            }
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  requestBody.status= `Fail`
                  requestBody.detail= error.message? error.message: `Error while sending mail`
                  cronjobModel.create(requestBody,function (err, response) {
                    if (err) {
                        next(err)
                    } else {
                        res.status(200).json({
                            status: 'success',
                            message: `Daily Backup run`
                        })
                    }
                  }) 


            }else{
                cronjobModel.create(requestBody,function (err, response) {
                  if (err) {
                      next(err)
                  } else {
                      res.status(200).json({
                          status: 'success',
                          message: `Daily Backup run`
                      })
                   }
                  }) 
                }
            });
        }else{
            requestBody.status= `Fail`
            requestBody.detail= err.message? err.message: `Error while creating backup.`
            cronjobModel.create(requestBody,function (err, response) {
              if (err) {
                  next(err)
              } else {
                  res.status(200).json({
                      status: 'success',
                      message: `Daily Backup run`
                  })
               }
              }) 
          }
        } catch (err) {
            requestBody.status= `Fail`
            requestBody.detail= err.message? err.message: `Something went wrong when creating backup/sending mail`
            cronjobModel.create(requestBody,function (err, response) {
              if (err) {
                  next(err)
              } else {
                  res.status(200).json({
                      status: 'success',
                      message: `Daily Backup run`
                  })
               }
            }) 
            console.log(err);
      return res.status(400).json({
        success: false,
        message: "Something went wrong when creating backup/sending mail",
        error: err.message,
      });
    }
  },
};

// hhhhhhhhhhhhhhhhhh {
          //   "accepted": [
          //     "bmmsbkg@gmail.com"
          //   ],
          //   "rejected": [],
          //   "ehlo": [
          //     "PIPELINING",
          //     "8BITMIME",
          //     "AUTH LOGIN PLAIN CRAM-MD5"
          //   ],
          //   "envelopeTime": 131,
          //   "messageTime": 75,
          //   "messageSize": 3799,
          //   "response": "250 Message queued as <b317022a-32f2-e8cb-8740-f203bac5caf6@bmmschool.in>",
          //   "envelope": {
          //     "from": "info@bmmschool.in",
          //     "to": [
          //       "bmmsbkg@gmail.com"
          //     ]
          //   },
          //   "messageId": "<b317022a-32f2-e8cb-8740-f203bac5caf6@bmmschool.in>"
          // }