const express = require('express')
const { connection } = require('../aws/connection')
const sendResponse = require('../common/responseHandler')
const MASSAGE = require('../common/message')
const router = express.Router()

router.post('/', (req, res) => {
  const { mailAddress, password } = req.body

  // バリデーションチェック
  if (!mailAddress || !password) {
    return sendResponse(res, 400, { message: MASSAGE.LOGIN.MASSAGE_004 })
  }

  const sql = 'SELECT id, password FROM USER WHERE mail_address = ?'

  connection.query(sql, [mailAddress], (err, results) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.LOGIN.MASSAGE_001 })
    }

    if (results.length === 0) {
      return sendResponse(res, 401, { message: MASSAGE.LOGIN.MASSAGE_002 })
    }

    const user = results[0]

    // パスワードの検証（平文の比較）
    if (password !== user.password) {
      return sendResponse(res, 401, { message: MASSAGE.LOGIN.MASSAGE_003 })
    }

    // レスポンスの組み立て
    const response = {
      status: 200,
      userId: user.id,
    }

    // レスポンス
    sendResponse(res, 200, response)
  })
})

module.exports = router
