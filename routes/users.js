const express = require('express')
const { connection } = require('../aws/connection')
const router = express.Router()

// 既存のユーザー取得のルート
router.get('/', (req, res, next) => {
  const sql = 'select * from users'
  connection.query(sql, (err, result, fields) => {
    if (err) {
      next(err)
      return
    }
    res.send(result)
  })
})

// 新しいユーザーを追加するルート
router.post('/add', (req, res, next) => {
  const { name } = req.body
  const sql = 'INSERT INTO users (name) VALUES (?)'

  connection.query(sql, [name], (err, result) => {
    if (err) {
      next(err)
      return
    }
    console.log(result)
    res.send({ message: 'User added successfully', id: result.insertId })
  })
})

module.exports = router
