require('dotenv').config()

const express = require('express')
const cors = require('cors')
const app = express()
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分間
  max: 100, // 15分間に100リクエストまで
  message: 'Too many requests from this IP, please try again after 15 minutes',
})

app.use(limiter)

app.use(cors()) // CORSを全てのルートに適用する
app.use(express.json()) // JSONミドルウェアを追加する

const members = require('./routes/member/members')
const trainings = require('./routes/training/trainings')
const getAdminMember = require('./routes/getAdminMember')
const login = require('./routes/login')
const adminLogin = require('./routes/adminLogin')
const postTest = require('./routes/postTest')
const postEnquete = require('./routes/postEnquete')
const getCategories = require('./routes/getCategories')
const getJobCategories = require('./routes/getJobCategories')
const getDepts = require('./routes/getDepts')

app.get('/', (request, response) => {
  response.send('Hello from Express!')
})

app.use('/members', members)
app.use('/trainings', trainings)
app.use('/admin/members', getAdminMember)
app.use('/login', login)
app.use('/admin/login', adminLogin)
app.use('/test/result', postTest)
app.use('/enquete/result', postEnquete)
app.use('/categories', getCategories)
app.use('/jobCategories', getJobCategories)
app.use('/depts', getDepts)

const port = process.env.PORT || 8081

app.listen(port, () => console.log(`Listening on port ${port}...`))
