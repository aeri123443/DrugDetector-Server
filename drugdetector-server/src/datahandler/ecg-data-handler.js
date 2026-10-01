const {requestDiviceLogApi} = require('../api/log-receiver');
const {connection} = require('../database/mysql-connection');
const {LoggingData} = require('../database/log-insertion');

// 추후 수정
require('dotenv').config();
const deviceId = process.env.DEVICE_ID;

var CleanseData = async function(){
    let ecgArr = [];
    let data = await requestDiviceLogApi();

    // Q/S, R 추출
    for (var x of data) {
        if (x.attributes.ECG < 690.5) {
            const _dataLine = {
                time: x.occDt,
                data: x.attributes.ECG,
                wave: "QS"
            }
            ecgArr.push(_dataLine)
        } else if (x.attributes.ECG > 696) {
            const _dataLine = {
                time: x.occDt,
                data: x.attributes.ECG,
                wave: "R"
            }
            ecgArr.push(_dataLine)
        }
    }
    // 시간순 정렬
    ecgArr.sort((a, b) => new Date(a.time) - new Date(b.time));

    //QRS 폭 추정
    for(var i=0; i<ecgArr.length; i++){
        if (i==0) {continue};
        if (ecgArr[i].wave == 'R' && ecgArr[i-1].wave == 'QS' && ecgArr[i+1].wave == 'QS'){
            const qrsWidth = new Date(ecgArr[i+1].time) - new Date(ecgArr[i-1].time);
            if (qrsWidth > 12000) {
                LoggingData(connection, deviceId);
            }
        }
    }
};

module.exports = {
    CleanseData,
};			
