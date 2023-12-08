const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors()) // CORSを全てのルートに適用する

const mysql = require('mysql')

const connection = mysql.createConnection({
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  port: process.env.RDS_POR,
  database: process.env.RDS_DATABASE,
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
