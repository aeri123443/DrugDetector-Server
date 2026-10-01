require('dotenv').config();

const express = require("express"); // npm i express | yarn add express
const cors    = require("cors");    // npm i cors | yarn add cors
const morgan = require('morgan');
const mysql   = require("mysql");   // npm i mysql | yarn add mysql
const app     = express();
const PORT    = process.env.SERVER_PORT;
const {CleanseData} = require('./datahandler/ecg-data-handler');
const {SendLogs} = require('./api/data-sender');

// MySQL 연결
const db = mysql.createPool({
    host: process.env.DB_HOST, // 호스트
    user: process.env.DB_USER,      // 데이터베이스 계정
    password: process.env.DB_PASSWORD,      // 데이터베이스 비밀번호
    database: process.env.DB_DATABASE,  // 사용할 데이터베이스
});

app.use(morgan('dev'));
app.use(cors({
    origin: "*",                // 출처 허용 옵션
    //credentials: true,          // 응답 헤더에 Access-Control-Allow-Credentials 추가
    optionsSuccessStatus: 200,  // 응답 상태 200으로 설정
}))

// post 요청 시 값을 객체로 바꿔줌
app.use(express.urlencoded({ extended: true })) 

// 서버 연결 시 발생
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});

CleanseData();

app.get("/api/getlogs", async (req, res) => {
    //res.header("Access-Control-Allow-Origin", "*");
    
    // const sqlQuery = "SELECT * FROM detector";

    // db.query(sqlQuery, (err, result) => {
    //     res.send(result);
    // });
    await SendLogs(req, res);
});
