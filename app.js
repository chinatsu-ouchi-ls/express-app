require('dotenv').config()

const express = require('express')
const cors = require('cors')
const app = express()
const rateLimit = require('express-rate-limit')
// リクエスト制限を設定
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 30, // 15分間に100リクエストまで
})
// アプリケーションにリミッターを適用
app.use(limiter)
app.use(cors()) // CORSを全てのルートに適用する
app.use(express.json()) // JSONミドルウェアを追加する

const users = require('./routes/user/users')
const materials = require('./routes/material/materials')
const getAdminUser = require('./routes/getAdminUser')
const login = require('./routes/login')
const adminLogin = require('./routes/adminLogin')
const postTest = require('./routes/postTest')
const postEnquete = require('./routes/postEnquete')
const getCategories = require('./routes/getCategories')
const getDepts = require('./routes/getDepts')

app.get('/', (request, response) => {
  response.send('Hello from Express!')
})

app.use('/users', users)
app.use('/materials', materials)
app.use('/admin/users', getAdminUser)
app.use('/login', login)
app.use('/admin/login', adminLogin)
app.use('/test/result', postTest)
app.use('/enquete/result', postEnquete)
app.use('/categories', getCategories)
app.use('/depts', getDepts)

const port = process.env.PORT || 8081

app.listen(port, () => console.log(`Listening on port ${port}...`))
