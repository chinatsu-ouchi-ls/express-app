require('dotenv').config()

const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors()) // CORSを全てのルートに適用する
app.use(express.json()) // JSONミドルウェアを追加する

const users = require('./routes/user/users')
const getAdminUser = require('./routes/getAdminUser')
const login = require('./routes/login')
const adminLogin = require('./routes/adminLogin')
const postTest = require('./routes/postTest')
const postEnquete = require('./routes/postEnquete')
const getCategories = require('./routes/getCategories')

app.get('/', (request, response) => {
  response.send('Hello from Express!')
})

app.use('/users', users)
app.use('/admin/users', getAdminUser)
app.use('/login', login)
app.use('/admin/login', adminLogin)
app.use('/test/result', postTest)
app.use('/enquete/result', postEnquete)
app.use('/categories', getCategories)

const port = process.env.PORT || 8081

app.listen(port, () => console.log(`Listening on port ${port}...`))
