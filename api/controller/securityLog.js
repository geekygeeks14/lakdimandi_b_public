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
        let logType = req.params.logType || 'all'
        let limit = req.query.limit && parseInt(req.query.limit) > 0 ? parseInt(req.query.limit): 0;
        if(logType === 'all') {
            securityLogModel.find(companyParam).sort({_id:-1}).limit(limit).exec( async(err, data) => {
                if (err) {
                    next(err);
                } else {
                    const setLogs = await  setDescription(data)
                    res.json({status: "success", data:setLogs});
                }
            })
        } else {
            const param={
                'activity_type': logType
            }
            securityLogModel.find(param,async function (err, result)  {
                if(err) {
                    next(err)
                } else {
                    result.sort((a, b) => b.activity_date_time - a.activity_date_time)
                    const setLogs = await  setDescription(result)
                    res.json({status: "success", data:setLogs});
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
                name: user.userInfo.fullName, 
                phoneNumber: user.userInfo.phoneNumber,
                companyId: user.userInfo.companyId,
                userId: req.body.userId, 
                ipAdress: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || req.socket.remoteAddress,
                device: req.headers[`user-agent`]
            }) 
            res.status(201).json({ 
                status: 'success', 
                message: 'Logs created'
            }); 
        } catch (err) { 
            next(err); 
        } 
    },
}