const {GetUserIdByDeviceId, GetUserInfoByUserId} = require('./data-selection');

const LoggingData = async function(connection, deviceId){
    const userId = await GetUserIdByDeviceId(connection, deviceId);
    const userInfos = await GetUserInfoByUserId(connection, userId);
    const logData = {
        userID: userId,
        userName: userInfos.userName,
        gender: userInfos.gender,
        age: userInfos.age,
        time: new Date(),
        place: '00 클럽',
        ResECG: '코카인 의심',
    }

    SaveLogToDatabase(connection, logData);

}

const SaveLogToDatabase = async function(connection, logData){
    return new Promise( (resolve, reject) => {
        const insertQuery = 'INSERT INTO logs SET ?';
        connection.query(insertQuery, logData, (error, results, fields)  => {
            if (error) {
                console.error('Failed to insert', error);
                reject(error);
            } else {
                console.log('Success: insert log') ;
                resolve(results);
            }
        });
    });
}

module.exports = {
    LoggingData,
}
