require('dotenv').config()

const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors()) // CORSを全てのルートに適用する
app.use(express.json()) // JSONミドルウェアを追加する

const users = require('./routes/user/users')
const adminUsers = require('./routes/adminUser')
const login = require('./routes/login')

app.get('/', (request, response) => {
  response.send('Hello from Express!')
})

app.use('/users', users)
app.use('/admin/users', adminUsers)
app.use('/login', login)

const port = process.env.PORT || 8081

app.listen(port, () => console.log(`Listening on port ${port}...`))
