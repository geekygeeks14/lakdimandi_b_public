const { userModel } = require("../../models/user");
const {roleModel} = require("../../models/role")
const { ObjectId } = require("mongodb");
const { purchaseModel } = require("../../models/purchase");
const { sellModel } = require("../../models/sell");
const { productNameModel } = require("../../models/producName");
const { productCodeModel } = require("../../models/productCode");
const { fluctualWeightModel } = require("../../models/fluctualWeight");
const {
  newUserIdGen,
  randomPassword,
  passwordEncryptAES,
  passwordDecryptAES,
  newCompanyIdGen,
  decryptAES,
  newInvoiceIdGenrate,
} = require("../../util/helper");
const { workDetailModel } = require("../../models/workDetail");
const { recieverModel } = require("../../models/reciever");
const { invoiceModel } = require("../../models/invoice");
const { AuthToken } = require("../../models/authtoken");
const { payOptionModel } = require("../../models/payOption");
const { cronjobModel } = require("../../models/cronJob");
const cloudinary = require('cloudinary').v2

module.exports = {

 
getDashboardData: async (req, res) => {
  try {
    let companyId = req.setCompanyId
    let companyParam={companyId: companyId}
    const roleName = req.user.userInfo.roleName
    if(roleName&& roleName==='TOPADMIN'){
      companyParam= {}
    }
    let date = new Date(req.query.todayDate)
     let date_end = new Date(req.query.todayDate) 
     let startDate = new Date(date.setDate(date.getDate()-1)); 
     let endDate= new Date(date_end.setDate(date_end.getDate()))
      startDate.setUTCHours(18); startDate.setUTCMinutes(30); 
      startDate.setSeconds(0); startDate.setMilliseconds(0); 
      endDate.setUTCHours(18); endDate.setUTCMinutes(30); 
      endDate.setSeconds(0); endDate.setMilliseconds(0); 
      params = { 
        'created': 
          { "$gte": startDate, 
            "$lte": endDate
          } 
       };
      //console.log(JSON.stringify(params)) 
      const todaySellsData = await sellModel.find({$and:[params, companyParam]})
      let todaySell=0
      let todayPaid=0
      if(todaySellsData && todaySellsData.length>0){
        todaySell =todaySellsData.reduce((acc, curr)=> acc + curr.totalAmount, 0)
        todayPaid =todaySellsData.reduce((acc, curr)=> acc + curr.paidAmount, 0)
      }
      const dashboardData={
        todaySell : todaySell.toString(),
        todayPaid : todayPaid.toString(),
        todayDue  : (todaySell-todayPaid).toString()
      }
     
    return res.status(200).json({
      success: true,
      dashboardData
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: "Error while getting sell data.",
      error: err.message,
    });
  }
},
  getAllSell: async (req, res) => {
    //one time query
    // const adminData = await userModel.findOne({'userInfo.roleName':'ADMIN'})
    // const allDataToUpdate = await sellModel.find({ companyId: { $exists: false }});
    // const adminCompanyId =  req.setCompanyId
    // if(allDataToUpdate && allDataToUpdate.length>0){
    //   for(let i=0; i<allDataToUpdate.length; i++){
    //       const currentData= allDataToUpdate[i]
    //       await sellModel.findOneAndUpdate({_id: currentData._id},{ companyId: adminCompanyId},{insertedBy: adminData._id.toString()});
    //     } 
    // }
    //
    let cndPram={}
    let companyId = req.setCompanyId
    let companyParam={companyId: companyId}
    const roleName = req.user.userInfo.roleName
    if(roleName&& (roleName==='TOPADMIN' || roleName==='SUPER_ADMIN')){
      companyParam= {}
    }

    if(req.query.companyId && req.query.companyId!=='All'){
      companyParam={companyId: req.query.companyId}
    }
    // if(companyId && roleName&& roleName==='ADMIN'|| roleName==='INSTANCE ADMIN'){
    //   companyParam= {companyId:req.query.companyId}
    // }
    if(req.query.productNameId){
      cndPram={
        ...cndPram,
        'sellInfo.productNameId':req.query.productNameId
      }
    }
    if(req.query.productCodeId){
      cndPram={
        ...cndPram,
        'sellInfo.productCodeId':req.query.productCodeId
      }
    }
    if(req.query.length){
      cndPram={
        ...cndPram,
        'sellInfo.length':req.query.length
      }
    }
    if(req.query.height){
      cndPram={
        ...cndPram,
        'sellInfo.height':req.query.height
      }
    }
    if(req.query.breadth){
      cndPram={
        ...cndPram,
        'sellInfo.breadth':req.query.breadth
      }
    }
    if((req.query.dateFilter && req.query.dateFilter==='today') || (roleName && roleName==='ACCOUNTANT')){
      cndPram= 
      {'created': 
        {
          "$gte": new Date(req.query.fromDate),
          "$lte": new Date(req.query.toDate + ' 23:59:59')
        }
      }
    }
    try {
      const sellData = await sellModel.find({$and: [{ deleted: false },companyParam, cndPram]});
      return res.status(200).json({
        success: true,
        sellData,
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "Error while getting sell data.",
        error: err.message,
      });
    }
  },
  getAllPurchase: async (req, res) => {
    try {

      //one time query
      // const adminData = await userModel.findOne({'userInfo.roleName':'ADMIN'})
      // const allDataToUpdate = await purchaseModel.find({ companyId: { $exists: false }});
      // const adminCompanyId =  req.setCompanyId
      // if(allDataToUpdate && allDataToUpdate.length>0){
      //   for(let i=0; i<allDataToUpdate.length; i++){
      //     const currentData = allDataToUpdate[i]
      //     await purchaseModel.findOneAndUpdate({_id: currentData._id},{ companyId: adminCompanyId},{insertedBy: adminData._id.toString()});
      //   }
      // }
      //
      const companyId =  req.setCompanyId
      // console.log("companyIddddd", companyId)
      let companyParam = {companyId: companyId}
      const roleName = req.user.userInfo.roleName
      if(roleName && roleName === 'TOPADMIN'){
        companyParam = {}
      }
      const purchaseData = await purchaseModel.find({$and: [{ deleted: false },companyParam]});
      return res.status(200).json({
        success: true,
        purchaseData,
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "Error while getting sell data.",
        error: err.message,
      });
    }
  },
  createSell: async(req, res, next)=>{
    try{
      const newInvoiceIdGen = await newInvoiceIdGenrate()
      let newInvoiceInfo= new invoiceModel({})
      let payInfo=[]
       if(req.body.payInfo && req.body.payInfo.length>0){
        payInfo = req.body.payInfo.map(elem => (
          {
           ...elem,
           payDate: new Date()
          } 
        ))
       }
      const newSellData = new sellModel({
        ...req.body,
        payInfo: payInfo
      });
     const newSellDataCreated = await newSellData.save();
      if(newSellDataCreated){
        newInvoiceInfo['invoiceInfo'] = {
          paidAmount: parseFloat(req.body.paidAmount),
          dueAmount :req.body.dueAmount,
          sellId: newSellDataCreated._id
        }
        newInvoiceInfo['invoiceType'] ='NEW SELL PAYMENT'
        newInvoiceInfo['paidStatus'] = true
        newInvoiceInfo['companyId'] = newSellDataCreated.companyId
        newInvoiceInfo['invoiceId'] = newInvoiceIdGen
        newInvoiceInfo['insertedBy'] = req.body.insertedBy
        const newInvoiceCreate = await newInvoiceInfo.save();
        return res.status(200).json({
          success: true,
          message:'Success'
        });
      }else{
        return res.status(200).json({
          success: false,
          message:'Error, Please try again!'
        });
      }
     
    }catch(err){
      console.log("errr",err)
      return res.status(400).json({
        success: false,
        message:'Error while submiting sell data',
        error: err.message,
      });
    }
  
  },
  updateSell: async(req, res, next)=>{
    try{
      const getActionPassword= req.body.actionPassword
      delete req.body.actionPassword
      if(getActionPassword){
        const getUserActionPsw= decryptAES(getActionPassword)
        if(passwordDecryptAES(req.user.userInfo.actionPassword)!== passwordDecryptAES(getUserActionPsw)){
         return res.status(200).json({
           success: false,
           message:'Action password incorrect',
           actionPassword: true // dont remove/change this Frontend dependency
         });
        }
     }
     const newInvoiceIdGen = await newInvoiceIdGenrate()
     let newInvoiceInfo= new invoiceModel({})

      let payInfo=[]
      let updateData={}
      const sellData=  await sellModel.findOne({_id: req.params.id});
      const oldPayInfo= sellData && sellData.payInfo && sellData.payInfo.length>0? sellData.payInfo: []
    
      if(req.body.dueAmountSubmisions && req.body.payInfo && req.body.payInfo.length>0){
        newInvoiceInfo['invoiceInfo'] = {
          paidAmount: parseFloat(req.body.duePaidAmount),
          dueAmount :req.body.restDueAmount,
          sellId: sellData._id
        }
        newInvoiceInfo['invoiceType'] ='DUE SELL PAYMENT'
        newInvoiceInfo['paidStatus'] = true
        newInvoiceInfo['companyId'] = sellData.companyId
        newInvoiceInfo['invoiceId'] = newInvoiceIdGen
        newInvoiceInfo['insertedBy'] = req.body.insertedBy
        const newInvoiceCreate = await newInvoiceInfo.save();
        updateData={
          payInfo: [...oldPayInfo, ...req.body.payInfo],
          paidAmount: parseFloat(sellData.paidAmount) + parseFloat(req.body.duePaidAmount),
          dueAmount :  req.body.restDueAmount,
          modified: new Date()
        }
      }else{
        if(req.body.payInfo && req.body.payInfo.length>0 && !req.body.dueAmountSubmisions){
          payInfo = req.body.payInfo.map(elem => {
              let newData={}
              if(elem._id && oldPayInfo.length>0 && (parseFloat(oldPayInfo.find(data=> data._id.toString() ===elem._id.toString()).amount) !== parseFloat(elem.amount))){
                newData={...elem, payModifiedDate: new Date() }
              }else{
                newData={ ...elem, payDate: new Date()}
              }
              return newData
            }
          )
        }       
         updateData = {
          ...req.body,
          payInfo: payInfo,
          modified: new Date()
        };
      }
    
      const updateSellData=  await sellModel.findOneAndUpdate({_id: req.params.id}, updateData);
      if(updateSellData){
        return res.status(200).json({
          success: true,
          message:'Update Success'
        });
      }else{
        return res.status(200).json({
          success: false,
          message:'Update sell error, Please try again!'
        });
      }
     
    }catch(err){
      console.log("errr",err)
      return res.status(400).json({
        success: false,
        message:'Error while updating sell data.',
        error: err.message,
      });
    }
  },

  createPurchase: async(req, res, next)=>{
    try{
      const productCode = req.body.productCode
      delete req.body.productCode
      let productCodeId=''
      if(productCode && productCode._id){
        productCodeId = productCode._id
      }else{
        const newProductCodeData= new productCodeModel({
          productCode :productCode.label,
          companyId : req.body.companyId
        });
        const newProductCodeCreated = await newProductCodeData.save();
        console.log("newProductCodeCreated", newProductCodeCreated)
        productCodeId= newProductCodeCreated._id.toString()
      }
      // unloading work
      if(req.body.unLoadingWorkDetail && req.body.unLoadingWorkDetail.unLoadingWorker && req.body.unLoadingWorkDetail.unLoadingWorker.length>0){
        const newUnLoadingWork= [{'note':req.body.unLoadingWorkDetail.note, 'startTime':req.body.unLoadingWorkDetail.startTime, 'endTime': req.body.unLoadingWorkDetail.endTime,'rowTime': req.body.unLoadingWorkDetail.rowTime, truck:true}]
          for (const it of req.body.unLoadingWorkDetail.unLoadingWorker) {
              let workFound = await workDetailModel.findOne({$and:[{userId: it.userId},{dateOfWork: req.body.unLoadingWorkDetail.dateOfWork}]})
              if(workFound && workFound.unLoadingWorkList){
               
                // const truckUnLoadingWork= workFound.unLoadingWorkList.find(data=> data.truck)
                // if(truckUnLoadingWork){
                //   let oldUnLoadingWork= workFound.unLoadingWorkList.filter(data=> !data.truck)
                //   workFound.unLoadingWorkList= [...oldUnLoadingWork, ...newUnLoadingWork]
                
                //   //let totalMilliSec=0
                //   const allList = [...workFound.loadingWorkList,...workFound.unLoadingWorkList,...workFound.productionWorkList,...workFound.otherWorkList]
                //   // allList.forEach(data=>{
                //   // if(data.loadingRowTime || data.unLoadingRowTime || data.productionRowTime || data.otherRowTime){
                //   //       const time=   data.loadingRowTime>0?data.loadingRowTime: data.unLoadingRowTime>0? data.unLoadingRowTime: data.productionRowTime>0? data.productionRowTime: data.otherRowTime>0? data.otherRowTime:0
                //   //       totalMilliSec+= parseInt(time)
                //   //   }
                //   // })
                //   workFound.totalMilliSec= allList.reduce((acc, curr) => acc + parseInt(curr.rowTime?curr.rowTime:0),0);
                //   //workFound.totalMilliSec = totalMilliSec
                
                // }else{
                //   let oldUnLoadingWork= workFound.unLoadingWorkList
                //   workFound.unLoadingWorkList= [...oldUnLoadingWork,...newUnLoadingWork]
                //   workFound.totalMilliSec =  parseInt(workFound.totalMilliSec) + parseInt(req.body.unLoadingWorkDetail.rowTime)
                // }

                  let oldUnLoadingWork= workFound.unLoadingWorkList.filter(data=> !data.truck)
                  workFound.unLoadingWorkList= [...oldUnLoadingWork, ...newUnLoadingWork]
                  const allList = [...workFound.loadingWorkList,...workFound.unLoadingWorkList,...workFound.productionWorkList,...workFound.otherWorkList]
                  workFound.totalMilliSec= allList.reduce((acc, curr) => acc + parseInt(curr.rowTime?curr.rowTime:0),0);
                 
                await workDetailModel.findOneAndUpdate({_id: workFound._id},workFound)
              }else{
                const newWorkDetail= new workDetailModel({
                  userId: it.userId,
                  unLoadingWorkList: newUnLoadingWork,
                  parentUserId: req.body.unLoadingWorkDetail.parentUserId,
                  companyId: req.body.companyId,
                  totalMilliSec: req.body.unLoadingWorkDetail.rowTime?req.body.unLoadingWorkDetail.rowTime:0,
                  dateOfWork : req.body.unLoadingWorkDetail.dateOfWork
                });
                  await newWorkDetail.save();
              }
          }
        }
             // Loading Work
      if(req.body.loadingWorkDetail && req.body.loadingWorkDetail.loadingWorker && req.body.loadingWorkDetail.loadingWorker.length>0){
        const newLoadingWork= [{'note':req.body.loadingWorkDetail.note, 'startTime':req.body.loadingWorkDetail.startTime, 'endTime': req.body.loadingWorkDetail.endTime,'rowTime': req.body.loadingWorkDetail.rowTime, truck:true}]
        for (const it of req.body.loadingWorkDetail.loadingWorker) {
            let workFound = await workDetailModel.findOne({$and:[{userId: it.userId},{dateOfWork: req.body.loadingWorkDetail.dateOfWork}]})
            if(workFound && workFound.loadingWorkList){
             
              // const truckLoadingWork= workFound.loadingWorkList.find(data=> data.truck)
              // if(truckLoadingWork){
              //   let oldLoadingWork= workFound.loadingWorkList.filter(data=> !data.truck)
              //   workFound.loadingWorkList= [...oldLoadingWork, ...newLoadingWork]
              
              //   //let totalMilliSec=0
              //   const allList = [...workFound.loadingWorkList,...workFound.loadingWorkList,...workFound.productionWorkList,...workFound.otherWorkList]
              //   // allList.forEach(data=>{
              //   // if(data.loadingRowTime || data.unLoadingRowTime || data.productionRowTime || data.otherRowTime){
              //   //       const time=   data.loadingRowTime>0?data.loadingRowTime: data.unLoadingRowTime>0? data.unLoadingRowTime: data.productionRowTime>0? data.productionRowTime: data.otherRowTime>0? data.otherRowTime:0
              //   //       totalMilliSec+= parseInt(time)
              //   //   }
              //   // })
              //   workFound.totalMilliSec= allList.reduce((acc, curr) => acc + parseInt(curr.rowTime?curr.rowTime:0),0);
              //   //workFound.totalMilliSec = totalMilliSec
              
              // }else{
              //   let oldLoadingWork= workFound.loadingWorkList
              //   workFound.loadingWorkList= [...oldLoadingWork,...newLoadingWork]
              //   workFound.totalMilliSec =  parseInt(workFound.totalMilliSec) + parseInt(req.body.loadingWorkDetail.rowTime)
              // }
              let oldLoadingWork= workFound.loadingWorkList.filter(data=> !data.truck)
              workFound.loadingWorkList= [...oldLoadingWork, ...newLoadingWork]
              const allList = [...workFound.loadingWorkList,...workFound.loadingWorkList,...workFound.productionWorkList,...workFound.otherWorkList]
              workFound.totalMilliSec= allList.reduce((acc, curr) => acc + parseInt(curr.rowTime?curr.rowTime:0),0);

              await workDetailModel.findOneAndUpdate({_id: workFound._id},workFound)
            }else{
              const newWorkDetail= new workDetailModel({
                userId: it.userId,
                loadingWorkList: newLoadingWork,
                parentUserId: req.body.loadingWorkDetail.parentUserId,
                companyId: req.body.companyId,
                totalMilliSec: req.body.loadingWorkDetail.rowTime?req.body.loadingWorkDetail.rowTime:0,
                dateOfWork : req.body.loadingWorkDetail.dateOfWork
              });
                await newWorkDetail.save();
            }
        }
      }
   
     const newPurchaseData = new purchaseModel({
       ...req.body,
       productCodeId: productCodeId
     });
   
     const newPurchaseDataCreated = await newPurchaseData.save();
      if(newPurchaseDataCreated){
        return res.status(200).json({
          success: true,
          message:'Success'
        });
      }else{
        return res.status(200).json({
          success: false,
          message:'Error, Please try again!'
        });
      }
     
    }catch(err){
      return res.status(400).json({
        success: false,
        message:'Error while submiting purchase data',
        error: err.message,
      });
    }
  },

  updatePurchase: async(req, res, next)=>{
    try{
      if(req.body.purchaseImageUpload){
        const truck_front_image =  req.files.truck_front_image_file
        const truck_back_image =  req.files.truck_back_image_file
        const truck_left_image =  req.files.truck_left_image_file
        const truck_right_image =  req.files.truck_right_image_file
        const kanta_slip_image =  req.files.kanta_slip_image_file
        let promise1 = await imageUploadCloud(truck_front_image.tempFilePath, req.body.truck_front_image_name)
        let promise2 = await imageUploadCloud(truck_back_image.tempFilePath, req.body.truck_back_image_name)
        let promise3 = await imageUploadCloud(truck_left_image.tempFilePath, req.body.truck_left_image_name)
        let promise4 = await imageUploadCloud(truck_right_image.tempFilePath, req.body.truck_right_image_name)
        let promise5 = await imageUploadCloud(kanta_slip_image.tempFilePath, req.body.kanta_slip_image_name)
        const [resolve1, resolve2, resolve3, resolve4, resolve5]= await Promise.all([promise1, promise2, promise3, promise4, promise5])
        if(resolve1 && resolve2 && resolve3 && resolve4 && resolve5){
          const purchaseImageId={
            vehicleImage:{
              front: req.body.truck_front_image_name,
              back:req.body.truck_back_image_name,
              left:req.body.truck_left_image_name,
              right:req.body.truck_right_image_name,
            },
            kantaSlipImage:req.body.kanta_slip_image_name
          }
          const updatePurchaseData =  await purchaseModel.findOneAndUpdate({_id: req.body.id},{...purchaseImageId});
          if(updatePurchaseData){
            return res.status(200).json({
              success: true,
              message:'Success'
            });
          }else{
            return res.status(200).json({
              success: false,
              message:'Error, Please try again!'
            });
          }
        }
      }
      if(req.body.purchaseProduct){

      }

     
    }catch(err){
      return res.status(400).json({
        success: false,
        message:'Error while submiting purchase data',
        error: err.message,
      });
    }
  },

  uploadImage: async(req, res, next)=>{
    console.log("reqqqqqqqqqqqqqqqqqqqqqqqqBody", req.body.fileName)
    console.log("reqqqqqqqqqqqqqqqqqqqqqqqqfile", req.files.file)
    const file =  req.files.file
    try{
      cloudinary.uploader.upload(file.tempFilePath, {
        public_id: req.body.fileName,
        resource_type: 'image'
        },(error, result) => {
          if (!error) {
            // The image has been successfully uploaded.
            console.log('Upload Result:', result);
            return res.status(200).json({
              success: true,
              message:'Image uploaded success',
              data: result,
            });
          } else {
            // Handle the error.
            console.error('Upload Error:', error);
            return res.status(200).json({
              success: false,
              message:'Image not uploaded',
              data: error,
            });
          }
      });
    }catch(err){
      console.log("errrrrrrrrrrrr", err)
      return res.status(400).json({
        success: false,
        message:'Error while upload image',
        error: err.message,
      });
    }
  },

  deleteSellData: async (req, res) => {
    try {
      if(req.query.actionPassword){
        const getUserActionPsw= decryptAES(req.query.actionPassword)
        if(passwordDecryptAES(req.user.userInfo.actionPassword)!== passwordDecryptAES(getUserActionPsw)){
         return res.status(200).json({
           success: false,
           message:'Action password incorrect',
           actionPassword: true // dont remove/change this Frontend dependency
         });
        }
     }
      await sellModel.findOneAndUpdate({_id: req.params.id},{deleted:true});
      return res.status(200).json({
        success: true,
        message:`Deleted succesfully.`,
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "Error while deleting sell detail.",
        error: err.message,
      });
    }
  },
  deletePurchaseData: async (req, res) => {
    try {
      await purchaseModel.findOneAndUpdate({_id: req.params.id},{deleted:true});
      return res.status(200).json({
        success: true,
        message:`Deleted succesfully.`,
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "Error while deleting purchase detail.",
        error: err.message,
      });
    }
  },

  createProductName: async(req, res, next)=>{
    try{
      let companyId = req.setCompanyId
      let companyParam={companyId: companyId}
      const roleName = req.user.userInfo.roleName
      if(roleName&& roleName==='TOPADMIN'){
        companyParam= {}
      }
      const findProductName = await productNameModel.findOne({$and:[{ productName: req.body.productName.trim().toLowerCase()},companyParam]});
      if(findProductName){
        return res.status(200).json({
          success: false,
          message:'Already product name added'
        });
      }else{
        const newProductNameData= new productNameModel({
          productName :req.body.productName,
          companyId : req.body.companyId
        });
        const newProductNameCreated = await newProductNameData.save();
        if(newProductNameCreated){
          return res.status(200).json({
            success: true,
            message:'Success'
          });
        }else{
          return res.status(200).json({
            success: false,
            message:'Error, Please try again!'
          });
        }
      }
    }catch(err){
      return res.status(400).json({
        success: false,
        message:'Error while submiting product name',
        error: err.message,
      });
    }
  },

  createProductCode: async(req, res, next)=>{
    try{
      let companyId = req.setCompanyId
      let companyParam={companyId: companyId}
      const roleName = req.user.userInfo.roleName
      if(roleName&& roleName==='TOPADMIN'){
        companyParam= {}
      }
      const findProductCode = await productCodeModel.findOne({$and:[{productCode: req.body.productCode}, companyParam]});
      if(findProductCode){
        return res.status(200).json({
          success: false,
          message:'Already product code added'
        });
      }else{
        const newProductCodeData= new productCodeModel({
          productCode :req.body.productCode,
          companyId : req.body.companyId
        });
        const newProductCodeCreated = await newProductCodeData.save();
        if(newProductCodeCreated){
          return res.status(200).json({
            success: true,
            message:'Success'
          });
        }else{
          return res.status(200).json({
            success: false,
            message:'Error, Please try again!'
          });
        }
      }
    }catch(err){
      return res.status(400).json({
        success: false,
        message:'Error while submiting product Code',
        error: err.message,
      });
    }
  },
  createFluctualWeight: async(req, res, next)=>{
    try{

      let companyId = req.setCompanyId
      let companyParam={companyId: companyId}
      const roleName = req.user.userInfo.roleName
      if(roleName&& roleName==='TOPADMIN'){
        companyParam= {}
      }
      const findfluctualWeight = await fluctualWeightModel.find(companyParam);
      if(findfluctualWeight && findfluctualWeight.length>0){
        return res.status(200).json({
          success: false,
          message:'Already added'
        });
      }else{
        const newFluctualateWeight= new fluctualWeightModel({
          fluctualateWeightValue :req.body.fluctualateWeightValue,
        });
        const newFluctualateWeightCreated = await newFluctualateWeight.save();
        if(newFluctualateWeightCreated){
          return res.status(200).json({
            success: true,
            message:'Success'
          });
        }else{
          return res.status(200).json({
            success: false,
            message:'Error, Please try again!'
          });
        }
      }
    }catch(err){
      return res.status(400).json({
        success: false,
        message:'Error while adding value',
        error: err.message,
      });
    }
  },
  updateFluctualWeight: async(req, res, next)=>{
    try{
      const updatefluctualWeight = await fluctualWeightModel.findOneAndUpdate({_id: req.params.id},{ fluctualateWeightValue :req.body.fluctualateWeightValue, modified: new Date()});
  
      if(updatefluctualWeight){
        return res.status(200).json({
          success: true,
          message:'Update Success'
        });
      }else{
        return res.status(200).json({
          success: false,
          message:'Update failed, Please try again!'
        });
      }
      
    }catch(err){
      return res.status(400).json({
        success: false,
        message:'Error while updating value',
        error: err.message,
      });
    }
  },
  getFluctualWeight: async(req, res, next)=>{
    try{
        // //one time query
        // const allDataToUpdate = await fluctualWeightModel.find({ companyId: { $exists: false }});
        // const adminCompanyId =  req.setCompanyId
        // if(allDataToUpdate && allDataToUpdate.length>0){
        //   for(let i=0; i<allDataToUpdate.length; i++){
        //       const currentData = allDataToUpdate[i]
        //       await fluctualWeightModel.findOneAndUpdate({_id: currentData._id},{ companyId: adminCompanyId});
        //   }
        // }
        // //
      let companyId = req.setCompanyId
      let companyParam={companyId: companyId}
      const roleName = req.user.userInfo.roleName
      if(roleName&& roleName==='TOPADMIN'){
        companyParam= {}
      }
      const fluctualWeightData = await fluctualWeightModel.find({$and:[{deleted:false},companyParam]});
  
      if(fluctualWeightData && fluctualWeightData.length>0){
        return res.status(200).json({
          success: true,
          message:'Get successfully',
          data : fluctualWeightData
        });
      }else{
        return res.status(200).json({
          success: false,
          message:'No values found, Please try again!'
        });
      }
      
    }catch(err){
      return res.status(400).json({
        success: false,
        message:'Error while getting value',
        error: err.message,
      });
    }
  },
  getAllProductName: async (req, res) => {
    try {
        //one time query
        // const allDataToUpdate = await productNameModel.find({ companyId: { $exists: false }});
        // const adminCompanyId =  req.setCompanyId
        // if(allDataToUpdate && allDataToUpdate.length>0){
        //   for(let i=0; i<allDataToUpdate.length; i++){
        //       const currentData = allDataToUpdate[i]
        //       await productNameModel.findOneAndUpdate({_id: currentData._id},{ companyId: adminCompanyId});
        //   }
        // }
        //
        let companyId = req.setCompanyId
        let companyParam={companyId: companyId}
        const roleName = req.user.userInfo.roleName
        if(roleName&& roleName==='TOPADMIN'){
          companyParam= {}
        }
      const productNameData = await productNameModel.find({$and: [companyParam]});
      const allProductNameData = await productNameModel.find(companyParam);
      return res.status(200).json({
        success: true,
        productNameData,
        allProductNameData
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "Error while getting product name data.",
        error: err.message,
      });
    }
  },
  getAllProductCode: async (req, res) => {
    try {
        //one time query
        // const allDataToUpdate = await productCodeModel.find({ companyId: { $exists: false }});
        // const adminCompanyId =  req.setCompanyId
        // if(allDataToUpdate && allDataToUpdate.length>0){
        //   for(let i=0; i<allDataToUpdate.length; i++){
        //       const currentData = allDataToUpdate[i]
        //       await productCodeModel.findOneAndUpdate({_id: currentData._id},{ companyId: adminCompanyId});
        //   }
        // }
        //
        let companyId = req.setCompanyId
        let companyParam={companyId: companyId}
        const roleName = req.user.userInfo.roleName
        if(roleName&& roleName==='TOPADMIN'){
          companyParam= {}
        }
      const productCodeData = await productCodeModel.find({$and: [{ deleted: false },companyParam]});
      const allProductCodeData = await productCodeModel.find(companyParam);
      return res.status(200).json({
        success: true,
        productCodeData,
        allProductCodeData
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "Error while getting product Code data.",
        error: err.message,
      });
    }
  },
  updateProductNameById: async (req, res) => {
    try {
      const updateProductName = await productNameModel.findOneAndUpdate({_id:req.body.id},{productName:req.body.productName});
      if(updateProductName){
        return res.status(200).json({
          success: true,
          message: "Updated successfully",
        });
      }else{
        return res.status(200).json({
          success: false,
          message: "Please try again!",
        });
      }
    
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "Error while updating product Name data.",
        error: err.message,
      });
    }
  },
  updateProductCodeById: async (req, res) => {
    try {
      const updateProductCode = await productCodeModel.findOneAndUpdate({_id:req.body.id},{productCode:req.body.productCode});
      if(updateProductCode){
        return res.status(200).json({
          success: true,
          message: "Updated successfully",
        });
      }else{
        return res.status(200).json({
          success: false,
          message: "Please try again!",
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "Error while updating product Code data.",
        error: err.message,
      });
    }
  },
  deleteProductNameById: async (req, res) => {
    try {
      const deleteProductName = await productNameModel.findOneAndUpdate({_id:req.params.id},{deleted:true});
      if(deleteProductName){
        return res.status(200).json({
          success: true,
          message: "Deleted successfully",
        });
      }else{
        return res.status(200).json({
          success: false,
          message: "Please try again!",
        });
      }
    
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "Error while deleting product Name data.",
        error: err.message,
      });
    }
  },
  deleteProductCodeById: async (req, res) => {
    try {
      const deleteProductCode = await productCodeModel.findOneAndUpdate({_id:req.params.id},{deleted:true});
      if(deleteProductCode){
        return res.status(200).json({
          success: true,
          message: "Deleted successfully",
        });
      }else{
        return res.status(200).json({
          success: false,
          message: "Please try again!",
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "Error while deleting product Code data.",
        error: err.message,
      });
    }
  },
  permanentDelete: async (req, res) => {
    try {
      if(req.body.id && req.body.modelName==='purchase'){
        await purchaseModel.findOneAndDelete({_id: req.body.id});
      }
      if(req.body.id && req.body.modelName==='sell'){
        await sellModel.findOneAndDelete({_id: req.body.id});
      }
      return res.status(200).json({
        success: true,
        message:`Permanent ${req.body.modelName} deleted succesfully.`,
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "Error while permanent deleting.",
        error: err.message,
      });
    }
  },
  addUser: async (req, res) => {
    try {
      const userId = await newUserIdGen();
      //req.body.companyId? req.body.companyId:
      let companyId=  req.body.companyId? req.body.companyId: await newCompanyIdGen()
      let parentUserId= req.body.parentUserId? req.body.parentUserId: undefined
      const getRoleId = await roleModel.findOne({ _id: req.body.roleId});
      let newPassword =  randomPassword().join("").toString();
      if(!getRoleId){
        return res.status(200).json({
          success: false,
          message: 'Role not found.',
        });
      }
      let newUser = new userModel({
        userInfo: {
          ...req.body,
          fullName: `${req.body.firstName} ${req.body.lastName}`,
          roleId: getRoleId._id.toString(),
          roleName: getRoleId.roleName,
          userId: userId,
          companyId: companyId,
          password: passwordEncryptAES(newPassword),
          parentUserId:parentUserId
        },
        permissions: req.body.permissions && req.body.permissions.length>0?req.body.permissions: undefined, 
        isActive: true,
        isApproved: true,
        
      });
      let userData = await newUser.save();

      const responseData = {
        fullName: `${req.body.firstName} ${req.body.lastName}` ,
        phoneNumber: req.body.phoneNumber1,
        companyId: userId,
        password: newPassword,
      };
     
      if (userData) {
        return res.status(200).json({
          success: true,
          message: "Registration successful.",
          data: responseData
        });
      } else {
        return res.status(200).json({
          success: false,
          message: 'Registration faild, Please try again!',
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "Error while registration.",
        error: err.message,
      });
    }
  },


  getAllUsers: async (req, res) => {
    try {
      const searchStr= req.body.searchStr
      //let searchParam={}
      //let classParam={}
      let roleParam={}
      //  if (searchStr && searchStr !== "" && searchStr !== undefined && searchStr !== null){
      //    searchParam={
      //     $or:[
      //       {'userInfo.roleName': new RegExp(searchStr, 'i')},
      //       {'userInfo.fullName': new RegExp(searchStr, 'i')},
      //       {'userInfo.fatherName': new RegExp(searchStr, 'i')},
      //       {'userInfo.motherName': new RegExp(searchStr, 'i')},
      //       {'userInfo.email': new RegExp(searchStr, 'i')},
      //       {'userInfo.phoneNumber1': new RegExp(searchStr, 'i')},
      //       {'userInfo.phoneNumber2': new RegExp(searchStr, 'i')},
      //       {'userInfo.aadharNumber':new RegExp(searchStr, 'i')},
      //       {'userInfo.userId':new RegExp(searchStr, 'i')}
      //     ]
      //   }
      // }
      // if(req.body.selectedClass){
      //     classParam={'userInfo.class':req.body.selectedClass}
      // }

      let companyId = req.setCompanyId
      let companyParam={}
      const roleName = req.user.userInfo.roleName
      let roleRestriction=['TOPADMIN','ADMIN','SUPER_ADMIN']
      if(roleName && roleName==='TOPADMIN'){
        companyParam= {}
        roleRestriction=['TOPADMIN']
      }
      if(roleName && (roleName==='INSTANCE ADMIN' || roleName==='ADMIN')){
        companyParam= {'userInfo.companyId': companyId}
      }
      if(req.query.userType && req.query.userType==='WORKER'){
        roleRestriction.push('INSTANCE ADMIN')
      }
      if(!req.query.userType){
        roleRestriction.push('WORKER')
      }

      const restrictUser={'userInfo.roleName':{$nin:roleRestriction}}
      const users = await userModel.find({
        $and: [ { deleted: false },restrictUser,companyParam]
      });
      return res.status(200).json({
        success: true,
        users,
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "User not found.",
        error: err.message,
      });
    }
  },

  deleteUser: async (req, res) => {
    try {
     await userModel.findOneAndUpdate({_id:req.params.id},{deleted: true, modified:new Date()});
      return res.status(200).json({
        success: true,
        message: "Deleted successfully."
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "user not found.",
        error: err.message,
      });
    }
  },

  updateUserById: async (req, res) => {
    try {
      // if(req.body.roleUpdate){
      //     const newRoleName = req.body.newRoleName
      //     delete req.body.updateRole
      //     delete req.body.newRoleName
      //     const getNewRoleData= await roleModel.findOne({$and:[{roleName:newRoleName},{ roleName:{$nin:['TOPADMIN','ADMIN']}}]})
      //     if(getNewRoleData){
      //       req.body.roleName = getNewRoleData.roleName
      //       req.body.roleId = getNewRoleData._id.toString()
      //     }
      // }
      let user =  await userModel.findOne({_id:req.params.id});
      if(!user){
        return res.status(400).json({
          success: false,
          message: "user not found.",
          error: err.message,
        });
      }

      user.userInfo={
        ...user.userInfo,
        ...req.body
      }
      user.userInfo.fullName = req.body.firstName +" "+req.body.lastName
      user.modified = new Date();
      user.permissions= req.body.permissions ? req.body.permissions:user.permissions ? user.permissions: undefined 

     const updatedUser= await userModel.findOneAndUpdate({_id:req.params.id}, user,{new:true});
      if(updatedUser && (req.body.passwordChange || req.body.permissions)){
        await AuthToken.deleteMany({ userId: updatedUser._id })
      }
      return res.status(200).json({
        success: true,
        message: "Updated successfully.",
        data:updatedUser
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Error while update user.",
        error: err.message,
      });
    }
  },
  getPasswordById: async (req, res) => {
    try {
      let companyId = req.setCompanyId
      let companyParam = {'userInfo.companyId': companyId}
      const roleName = req.user.userInfo.roleName
      if(roleName && (roleName==='TOPADMIN' || roleName==='SUPER_ADMIN')){
        companyParam = {}
      }
      let user =  await userModel.findOne({$and:[{_id:req.params.id}, companyParam]});
      if(!user){
        return res.status(400).json({
          success: false,
          message: "user not belongs to your company",
        });
      }
      const data={
        fullName: user.userInfo.fullName,
        roleName : user.userInfo.roleName,
        userId : user.userInfo.userId,
        password : passwordDecryptAES(user.userInfo.password)
      }
      return res.status(200).json({
        success: true,
        message: "Get successfully.",
        data: data
      })
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Error while getting password.",
        error: err.message,
      });
    }
  },
  getCompany: async (req, res) => {
    try {
      let roleParam = {'userInfo.roleName':{$in:['INSTANCE ADMIN','ADMIN']}}
      let user =  await userModel.find({$and:[{deleted: false}, roleParam]});
      // if(use){
      //   return res.status(400).json({
      //     success: false,
      //     message: "company not found",
      //   });
      // }
      return res.status(200).json({
        success: true,
        message: "Get successfully.",
        data: user
      })
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Error while getting password.",
        error: err.message,
      });
    }
  },
  resetPassword: async (req, res) => {
    try {
      let roleParam = {'userInfo.roleName':{$in:['INSTANCE ADMIN','ADMIN']}}
      let user =  await userModel.findOne({$and:[{'_id':req.params.id},{deleted: false}, roleParam]});
      if(!user){
        return res.status(400).json({
          success: false,
          message: "company/vendor not found",
        });
      }
      if(user){
        const newEncryptedPassword =  passwordEncryptAES(req.body.newPassword)
        user.userInfo.password = newEncryptedPassword
        const updateUser =  await userModel.findOneAndUpdate({'_id':user._id},user);
        if(updateUser){
          return res.status(200).json({
            success: true,
            message: "Successfully password updated.",
          });
        }else{
          return res.status(400).json({
            success: false,
            message: "Password not updated, please try again!",
          });
        }
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Error while getting password.",
        error: err.message,
      });
    }
  },
  addWorkDetail: async(req, res, next)=>{
    try{
      const newWorkDetail= new workDetailModel({
        ...req.body
      });
      const newWorkDetailCreated = await newWorkDetail.save();
      if(newWorkDetailCreated){
        return res.status(200).json({
          success: true,
          message:'Success'
        });
      }else{
        return res.status(200).json({
          success: false,
          message:'Error, Please try again!'
        });
      }
    }catch(err){
      return res.status(400).json({
        success: false,
        message:'Error while adding work detail',
        error: err.message,
      });
    }
  },
  updateWorkDetail: async(req, res, next)=>{
    try{
       const workDetailId= req.body.selectedWorkDetailId
       let updateData={
        ...req.body,
        modified:new Date()
       }
      const updateWorkDetail = await workDetailModel.findOneAndUpdate({_id:workDetailId},updateData)
      if(updateWorkDetail){
        return res.status(200).json({
          success: true,
          message:'Update Successfully'
        });
      }else{
        return res.status(200).json({
          success: false,
          message:'Error, Please try again!'
        });
      }
    }catch(err){
      return res.status(400).json({
        success: false,
        message:'Error while updating work detail',
        error: err.message,
      });
    }
  },
  getWorkDetail: async (req, res) => {
    try {
    //  const allWork= await workDetailModel.find({})
    //  if(allWork  && allWork.length>0){
    //   for(const itWork of allWork){
    //       if(itWork.loadingWorkList && itWork.loadingWorkList.length>0){
    //          for(const itLoadingWork of itWork.loadingWorkList){
    //           itLoadingWork['note']=itLoadingWork.loadingNote? itLoadingWork.loadingNote:itLoadingWork['note']
    //           itLoadingWork['startTime']=itLoadingWork.loadingStartTime? itLoadingWork.loadingStartTime:itLoadingWork['startTime']
    //           itLoadingWork['endTime']=itLoadingWork.loadingEndTime? itLoadingWork.loadingEndTime:itLoadingWork['endTime']
    //           itLoadingWork['rowTime']=itLoadingWork.loadingRowTime? itLoadingWork.loadingRowTime: itLoadingWork['rowTime']
    //           itLoadingWork.loadingNote= undefined
    //           itLoadingWork.loadingStartTime= undefined
    //           itLoadingWork.loadingEndTime= undefined
    //           itLoadingWork.loadingRowTime = undefined
    //          }
    //       }
    //       if(itWork.unLoadingWorkList && itWork.unLoadingWorkList.length>0){
    //         for(const itUnLoadingWork of itWork.unLoadingWorkList){
    //           itUnLoadingWork['note']= itUnLoadingWork.unLoadingNote?itUnLoadingWork.unLoadingNote:itUnLoadingWork['note']
    //           itUnLoadingWork['startTime']=itUnLoadingWork.unLoadingStartTime? itUnLoadingWork.unLoadingStartTime:itUnLoadingWork['startTime']
    //           itUnLoadingWork['endTime']=itUnLoadingWork.unLoadingEndTime? itUnLoadingWork.unLoadingEndTime:itUnLoadingWork['endTime']
    //           itUnLoadingWork['rowTime']=itUnLoadingWork.unLoadingRowTime? itUnLoadingWork.unLoadingRowTime:itUnLoadingWork['rowTime']
    //          itUnLoadingWork.unLoadingNote= undefined
    //          itUnLoadingWork.unLoadingStartTime= undefined
    //          itUnLoadingWork.unLoadingEndTime= undefined
    //          itUnLoadingWork.unLoadingRowTime = undefined
    //         }
    //       }
    //       if(itWork.productionWorkList && itWork.productionWorkList.length>0){
    //         for(const itProduction of itWork.productionWorkList){
    //           itProduction['note']= itProduction.productionNote?itProduction.productionNote:itProduction['note']
    //           itProduction['startTime']= itProduction.productionStartTime? itProduction.productionStartTime: itProduction['startTime']
    //           itProduction['endTime']= itProduction.productionEndTime? itProduction.productionEndTime:itProduction['endTime']
    //           itProduction['rowTime']=itProduction.productionRowTime? itProduction.productionRowTime:itProduction['rowTime']
    //         itProduction.productionNote= undefined
    //         itProduction.productionStartTime= undefined
    //         itProduction.productionEndTime= undefined
    //         itProduction.productionRowTime = undefined
    //         }
    //       }
    //       if(itWork.otherWorkList && itWork.otherWorkList.length>0){
    //         for(const itOtherWork of itWork.otherWorkList){
    //           itOtherWork['note']=itOtherWork.otherNote? itOtherWork.otherNote:itOtherWork['note']
    //           itOtherWork['startTime']=itOtherWork.otherStartTime? itOtherWork.otherStartTime:itOtherWork['startTime']
    //           itOtherWork['endTime']= itOtherWork.otherEndTime? itOtherWork.otherEndTime:itOtherWork['endTime']
    //           itOtherWork['rowTime']= itOtherWork.otherRowTime? itOtherWork.otherRowTime:itOtherWork['rowTime']
    //         itOtherWork.otherNote= undefined
    //         itOtherWork.otherStartTime= undefined
    //         itOtherWork.otherEndTime= undefined
    //         itOtherWork.otherRowTime = undefined
    //         }
    //       }
    //       await workDetailModel.findOneAndUpdate({'_id':itWork._id}, itWork)
    //   }
    //  }

        let companyId = req.setCompanyId
        let companyParam={companyId: companyId}
        const roleName = req.user.userInfo.roleName
        if(roleName&& roleName==='TOPADMIN'){
          companyParam= {}
        }
     
      const allWorkDetailData = await workDetailModel.find(companyParam);
      if(!allWorkDetailData){
        return res.status(200).json({
          success: false,
          message:'Work detail not found.'
        });
      }else{
        return res.status(200).json({
          success: true,
          data:allWorkDetailData,
        });
      }
  
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "Error while getting work deatil.",
        error: err.message,
      });
    }
  },

  addReciever: async (req, res) => {
    try {
        
      recieverModel.create(req.body).then((response, err)=>{
         if(err){
          console.log("err", err)
          return res.status(400).json({
            success: false,
            message: "Reciever not created",
            error: err.message,
          });
         }else{
          return res.status(200).json({
            success: true,
            message:'Reciever created successfully'
          });
         }
      })
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "Error while creating reciever",
        error: err.message,
      });
    }
  },
  getReciever: async (req, res) => {
    try {
        let companyId = req.setCompanyId
        let companyParam={companyId: companyId}
        const roleName = req.user.userInfo.roleName
        if(roleName&& roleName==='TOPADMIN'){
          companyParam= {}
        }
     
      const allRecieverData = await recieverModel.find(companyParam);
      if(!allRecieverData){
        return res.status(200).json({
          success: false,
          message:'Reciever detail not found.'
        });
      }else{
        return res.status(200).json({
          success: true,
          data:allRecieverData,
        });
      }
  
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "Error while getting reciever deatil.",
        error: err.message,
      });
    }
  },
  createPayOption: async (req, res) => {
    try {
        
      payOptionModel.create(req.body).then((response, err)=>{
         if(err){
          console.log("err", err)
          return res.status(400).json({
            success: false,
            message: "Pay Option not created",
            error: err.message,
          });
         }else{
          return res.status(200).json({
            success: true,
            message:'Pay Option created successfully'
          });
         }
      })
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "Error while creating Pay Option",
        error: err.message,
      });
    }
  },
  getAllPayOption: async (req, res) => {
    try {
        let companyId = req.setCompanyId
        let companyParam={companyId: companyId}
        const roleName = req.user.userInfo.roleName
        if(roleName&& roleName==='TOPADMIN'){
          companyParam= {}
        }
     
      const payOptionData = await payOptionModel.find(companyParam);
      if(!payOptionData){
        return res.status(200).json({
          success: false,
          message:'Pay Option not found.'
        });
      }else{
        return res.status(200).json({
          success: true,
          data:payOptionData,
        });
      }
  
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "Error while getting Pay Option.",
        error: err.message,
      });
    }
  },
  updatePayOption: async(req, res, next)=>{
    try{
       let updateData={
        ...req.body,
        modified:new Date()
       }
      const updatePayOption = await payOptionModel.findOneAndUpdate({_id:req.params.id},updateData)
      if(updatePayOption){
        return res.status(200).json({
          success: true,
          message:'Update Successfully'
        });
      }else{
        return res.status(200).json({
          success: false,
          message:'Error, Please try again!'
        });
      }
    }catch(err){
      return res.status(400).json({
        success: false,
        message:'Error while updating pay option',
        error: err.message,
      });
    }
  },
  deletePayOption: async (req, res) => {
    try {
     await payOptionModel.findOneAndUpdate({_id:req.params.id},{deleted: true, modified:new Date()});
      return res.status(200).json({
        success: true,
        message: "Deleted successfully."
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "Pay option not found.",
        error: err.message,
      });
    }
  },
  getAllCronJob: async (req, res) => {
    try {
      const cronjobData = await cronjobModel.find({});
      if(!cronjobData){
        return res.status(200).json({
          success: false,
          message:'Cron job not found.'
        });
      }else{
        return res.status(200).json({
          success: true,
          data:cronjobData,
        });
      }
  
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "Error while getting cron job.",
        error: err.message,
      });
    }
  },
};
