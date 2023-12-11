const mysql = require('mysql')

const connection = mysql.createConnection({
  host: 'rds-mysql-pikatore.cn7rjsqtbrnm.ap-northeast-1.rds.amazonaws.com',
  user: 'admin',
  password: 'L4r7nUzT',
  port: '3306',
  database: 'pikatore_db',
})

module.exports = { connection }
