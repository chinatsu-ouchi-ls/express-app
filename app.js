const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors()) // CORSを全てのルートに適用する

const users = require('./routes/users')

app.get('/', (request, response) => {
  response.send('Hello from Express!')
})

app.use('/users', users)

const port = process.env.PORT || 8081

app.listen(port, () => console.log(`Listening on port ${port}...`))
