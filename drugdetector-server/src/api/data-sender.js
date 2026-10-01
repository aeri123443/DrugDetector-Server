const {GetLogs} = require('../database/data-selection');

const SendLogs = async function(req, res){
    const {connection} = require('../database/mysql-connection');
    const logs = await GetLogs(connection);
    console.log(logs);
    res.send(logs);
}

module.exports = {SendLogs};