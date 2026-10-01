require('dotenv').config();

const {requestTokenAwareApi} = require('./token-receiver');
const TIMEGAP = 30 * 1000; //30초 간격 설정(밀리초 단위)
const TESTTIME = '2023-11-24 18:02:20'; // 실시간이 아닌 특정 테스트 시간이 필요할 때 수정

var SetEndpoint = function(timeto){

    const param = {
        from: "",
        to: ""
    }

    if (!timeto) {
        param.to = new Date().getTime();
    } else {
        param.to = new Date(timeto).getTime();
    }
    param.from = param.to - TIMEGAP; 

    const _endpoint = `${process.env.ENDPOINT_STREAM}/${process.env.DEVICE_ID}/log?from=${param.from}&to=${param.to}`;

    return _endpoint;
}

var requestDiviceLogApi = async function(callback, args){

    try{
        const token = await requestTokenAwareApi();
        
        const response = await fetch(SetEndpoint(TESTTIME), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })

        const result = await response.json();


        if (result.data) {
            console.log("Success: get ECG Logs");
            return result.data;
        } else {
            let errMsg = 'Failed to get ECG Logs\n' + 'result:' + JSON.stringify(result); 
            throw new Error(errMsg);
        }

    } catch (error) {
        console.error(error);
        throw error;
    }
};

module.exports = {
    requestDiviceLogApi,
  };			
