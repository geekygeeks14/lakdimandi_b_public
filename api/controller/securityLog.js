const { securityLogModel } = require("../../models/securityLog");
const { userModel } = require("../../models/user");
const momentTZ = require('moment-timezone')

const activityTypeList =['Login', 'Logout', 'Update','Create/Add','Delete','Menu Log','Event Log','Status Change','Suspended company', 'Error Log']
const deviceName=(userAgent)=>{
    let decice = "Unknown";
        if (/Windows/.test(userAgent)) {
            decice = "Windows";
        } else if (/Mac OS|Macintosh/.test(userAgent)) {
            decice = "macOS";
        } else if (/Linux/.test(userAgent)) {
            decice = "Linux";
        } else if (/Android/.test(userAgent)) {
            decice = "Android";
        } else if (/iOS|iPhone|iPad/.test(userAgent)) {
            decice = "iOS";
        }
return decice
}
    const setDescription = async (data)=>{ 
        let logs = []; 
        const tz =  'Asia/Kolkata' ||  "Asia/Calcutta"
        for(let item of data){ 
            let value = JSON.parse(JSON.stringify(item)); 
            if (item.name !== null && item.name != undefined && item.name !=''){
                if(item.activity_type === 'Login'){
                    const currentDate = momentTZ(item.activity_date_time);
                    const changedDate = currentDate.tz(tz).format('MMMM Do YYYY, h:mm:ss A');
                    value['deviceName']= deviceName(item.device)
                    value['desc'] = item.name + ' (' + item.phoneNumber + ') ' + 'has successfully executed, login at '+ changedDate;
                } else if(item.activity_type === 'Logout'){
                    const currentDate = momentTZ(item.activity_date_time); 
                    const changedDate = currentDate.tz(tz).format('MMMM Do YYYY, h:mm:ss A'); 
                    value['deviceName']= deviceName(item.device)
                    value['desc'] = item.name + ' (' + item.phoneNumber + ') ' + 'has successfully executed, logout at '+changedDate; 
                } else if(item.activity_type === 'Menu Log') { 
                    const currentDate = momentTZ(item.activity_date_time);
                    const changedDate = currentDate.tz(tz).format('MMMM Do YYYY, h:mm:ss A'); 
                    value['deviceName']= deviceName(item.device)
                    value['desc'] = item.name + ' (' + item.phoneNumber + ') ' + 'has successfully executed, '+(item.menu_label? item.menu_label:'')+' '+ changedDate; 
                } else if(item.activity_type === 'Event Log') {
                    const currentDate = momentTZ(item.activity_date_time);
                    const changedDate = currentDate.tz(tz).format('MMMM Do YYYY, h:mm:ss A'); 
                    value['deviceName']= deviceName(item.device)
                    value['desc'] = item.name + ' (' + item.phoneNumber + ' has successfully executed Action, '+(item.menu_url ? item.menu_url : '') +' '+ changedDate; 
                } else if(item.activity_type === 'Status Change') { 
                    const currentDate = momentTZ(item.activity_date_time); 
                    const changedDate = currentDate.tz(tz).format('MMMM Do YYYY, h:mm:ss A'); 
                    value['deviceName']= deviceName(item.device)
                    value['desc'] = item.name +'(' + item.phoneNumber + ' has successfully executed Action, '+(item.eventType ? item.eventType : '') +' '+ changedDate; 
                } else if (item.activity_type === 'Delete') { 
                    const currentDate = momentTZ(item.activity_date_time); 
                    const changedDate = currentDate.tz(tz).format('MMMM Do YYYY, h:mm:ss A');
                    value['deviceName']= deviceName(item.device)
                    value['desc'] = item.name +'(' + item.phoneNumber + ' has successfully executed Action, \''+(item.eventType ? item.eventType : '') +'\', '+ changedDate;
                } else if (item.activity_type === 'Suspended company') { 
                    const currentDate = momentTZ(item.activity_date_time); 
                    const changedDate = currentDate.tz(tz).format('MMMM Do YYYY, h:mm:ss A');
                    value['deviceName']= deviceName(item.device)
                    value['desc'] = item.name + ' (' + item.phoneNumber + ') ' + 'has successfully executed,Suspended Org at ' + changedDate; 
                } else if (item.activity_type == 'Error Log') {
                    const currentDate = momentTZ(item.activity_date_time); 
                    const changedDate = currentDate.tz(tz).format('MMMM Do YYYY, h:mm:ss A'); 
                    value['deviceName']= deviceName(item.device)
                    value['desc'] = item.name + ' (' + item.phoneNumber + ') '+ 'has executed, error at <a href=' + item.menuUrl+ '>' + item.menuUrl + '</a>' +' of '+ item.message + ' at '+ changedDate; 
                }else {
                    const currentDate = momentTZ(item.activity_date_time);
                    const changedDate = currentDate.tz(tz).format('MMMM Do YYYY, h:mm:ss A');
                    value['deviceName']= deviceName(item.device)
                    value['desc'] = item.name + ' (' + item.phoneNumber + ') ' + 'has successfully executed at' + changedDate;
                } 
                logs.push(value)
            }
        }                       
        return logs
    }

module.exports = {

    getSecurityLogs: async (req, res) => {
        let companyId = req.setCompanyId
        let companyParam = {'companyId': companyId}
        const roleName = req.user.userInfo.roleName
        if(roleName && (roleName==='TOPADMIN' || roleName==='SUPER_ADMIN')){
          companyParam = {}
        }
        let dateParams={}
        let pageNumber= req.query.pageNumber? parseInt(req.query.pageNumber):0
        let logType = req.query.logType || 'all'
        if (req.query && req.query.startDate && req.query.startDate != ''  && req.query.endDate && req.query.endDate !='') {
            let date = new Date(req.query.startDate)
            let startDate = new Date(date.setDate(date.getDate()));
            let eDate = new Date(req.query.endDate)
            let endDate = new Date(eDate.setDate(eDate.getDate()+1));
            startDate.setUTCHours(18);
            startDate.setUTCMinutes(30);
            startDate.setSeconds(0);
            startDate.setMilliseconds(0);
            endDate.setUTCHours(18);
            endDate.setUTCMinutes(30);
            endDate.setSeconds(0);
            endDate.setMilliseconds(0);
            dateParams = {
                'created': {
                    "$gte": startDate,
                    "$lte": endDate? endDate:new Date(req.query.endDate + ' 23:59:59')
                }
            };
        }else {
            if (req.query && req.query.startDate && req.query.startDate != '') {
                let startDate = ''
                if (!!req.query.startDate) {
                    let date = new Date(req.query.startDate)
                    //startDate = new Date(date.setDate(date.getDate()+1));
                    startDate = new Date(date.setDate(date.getDate()));
                    startDate.setUTCHours(18);
                    startDate.setUTCMinutes(30);
                    startDate.setSeconds(0);
                    startDate.setMilliseconds(0);
                }
                dateParams = {
                    'created': {
                        "$gte": !!startDate ? startDate : new Date(req.query.startDate)
                    }
                }
            }
        }
        // console.log("ggggggggggggggggg", JSON.stringify(dateParams,null, 2))
        let limit = req.query.limit && parseInt(req.query.limit) > 0 ? parseInt(req.query.limit): 10;
        if(logType === 'all') {
            const param={$and:[ dateParams]}
            const count =  await securityLogModel.countDocuments(param)
            const pageSize= Math.ceil(count/limit)
             //console.log("11111111111111111111111111", JSON.stringify(param,null, 2))   
            securityLogModel.find(dateParams).sort({_id:1}).limit(limit).skip(limit*pageNumber).exec( async(err, data) => {
                if (err) {
                    next(err);
                } else {
                    const setLogs = await  setDescription(data)
                    res.json({ 
                        success: true, 
                        data:setLogs,
                        count: count,
                        pageSize: pageSize
                    });
                }
            })
        } else {
            const logTypeParam={
                'activity_type': logType
            }
            const param={$and:[logTypeParam, dateParams]}
            const count =  await securityLogModel.countDocuments(param)
            const pageSize= Math.ceil(count/limit)

            securityLogModel.find(param).limit(limit).skip(limit*pageNumber).exec(async function (err, result)  {
                if(err) {
                    next(err)
                } else {
                    result.sort((a, b) => new Date(a.activity_date_time) -new Date(b.activity_date_time) )
                    const setLogs = await  setDescription(result)
                    res.json({
                         success: true, 
                         data:setLogs,
                         count: count,
                         pageSize: pageSize
                        });
                }
            })
        }
    },
    savelog: async (req, res, next) => {
        try {
            const user = await userModel.findById(req.body.userId); 
            if (!user) { 
                const error = new Error('User not found.'); 
                error.status = 404; 
                throw error; 
            }
            const activityType = (req.body.activity_type || '').toLowerCase()
            const activityTypeCheck =  activityTypeList.find(data=> data.toLowerCase()===activityType)
            if (!activityTypeCheck) { 
                const error = new Error('Not proper activity type');
                error.status = 422; 
                throw error; 
            } 
    
        await securityLogModel.create({ 
                activityDateTime: new Date(),
                activity_type: activityTypeCheck,
                message: req.body.message?  req.body.message:'',
                menu_url:req.body.menuUrl,
                name: (user && user.userInfo )? user.userInfo.fullName: 'N/A', 
                phoneNumber: (user && user.userInfo ) ? user.userInfo.phoneNumber:'N/A' ,
                companyId: (user && user.userInfo )? user.userInfo.companyId:'N/A',
                userId: req.body.userId? req.body.userId:req.ip, 
                ipAdress: req.ip? req.ip : (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || req.socket.remoteAddress,
                device: req.headers[`user-agent`]
            }) 
            res.status(201).json({ 
                success: true, 
                message: 'Logs created'
            }); 
        } catch (err) { 
            next(err); 
        } 
    },
}