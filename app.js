const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors()) // CORSを全てのルートに適用する

const mysql = require('mysql')

const connection = mysql.createConnection({
  host: 'rds-mysql-pikatore.cn7rjsqtbrnm.ap-northeast-1.rds.amazonaws.com',
  user: 'admin',
  password: 'L4r7nUzT',
  port: '3306',
  database: 'pikatore_db',
})

app.get('/users', (request, response) => {
  const sql = 'select * from users'
  connection.query(sql, (err, result, fields) => {
    if (err) throw err
    response.send(result)
  })
})

const port = process.env.PORT || 8081

app.listen(port, () => console.log(`Listening on port ${port}...`))
