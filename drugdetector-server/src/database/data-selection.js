const mysql = require("mysql"); 

var GetUserIdByDeviceId = async function(connection, deviceId){
    return new Promise( (resolve, reject) => {
        const selectQuery = `SELECT userID FROM ids WHERE deviceID = "${deviceId}";`;
        connection.query(selectQuery, (selectErr, results) => {
            if (selectErr) {
                console.error('Failed to select userID', selectErr);
                reject(selectErr);
            } else {
                console.log('Success: find userID') ;
                let userId = results[0].userID;
                resolve(userId);
            }
        });
    });
};

var GetUserInfoByUserId = async function(connection, userId){
    return new Promise( (resolve, reject) => {
        const selectQuery = `SELECT * FROM users WHERE userId = "${userId}";`;
        connection.query(selectQuery, (selectErr, results) => {
            if (selectErr) {
                console.error('Failed to select userInfo', selectErr);
                reject(selectErr);
            } else {
                console.log('Success: find userInfo') ;
                let userInfos = results[0];
                resolve(userInfos);
            }
        });
    });
};

var GetLogs = async function(connection){
    return new Promise( (resolve, reject) => {
        const selectQuery = `SELECT * FROM logs;`;
        connection.query(selectQuery, (selectErr, results) => {
            if (selectErr) {
                console.error('Failed to get logs', selectErr);
                reject(selectErr);
            } else {
                console.log('Success: get logs') ;
                let logs = results;
                resolve(logs);
            }
        });
    });
};

module.exports = {
    GetUserIdByDeviceId,
    GetUserInfoByUserId,
    GetLogs,
};			
