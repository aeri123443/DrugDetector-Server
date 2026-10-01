require('dotenv').config();

const mysql = require("mysql"); 

const connection = mysql.createConnection({
    host: process.env.DB_HOST, // 호스트
    user: process.env.DB_USER,      // 데이터베이스 계정
    password: process.env.DB_PASSWORD,      // 데이터베이스 비밀번호
    database: process.env.DB_DATABASE,  // 사용할 데이터베이스
});

connection.connect((err) => {
    if (err) {
      console.error('Failed to connect to MySQL', err);
      throw err;
    }
    console.log('Success: connected to MySQL');
  });

module.exports = {connection};