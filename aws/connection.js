const mysql = require('mysql')

const connection = mysql.createConnection({
  host: process.env.RDS_HOST,
  member: process.env.RDS_MEMBER,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DATABASE,
  port: process.env.RDS_PORT,
})

module.exports = { connection }
