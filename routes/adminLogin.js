const express = require('express')
const { connection } = require('../aws/connection')
const sendResponse = require('../common/responseHandler')
const MASSAGE = require('../common/message')
const router = express.Router()

router.post('/', (req, res) => {
  const { accountId, password } = req.body

  // バリデーションチェック
  if (!accountId || !password) {
    return sendResponse(res, 400, { message: MASSAGE.LOGIN.MASSAGE_006 })
  }

  // 管理者メンバーを取得するSQLクエリ
  const sql = 'SELECT id, password, is_admin FROM MEMBER WHERE mail_address = ?'

  connection.query(sql, [accountId], (err, results) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.LOGIN.MASSAGE_001 })
    }

    if (results.length === 0) {
      // アカウントが存在しない場合
      return sendResponse(res, 401, { message: MASSAGE.LOGIN.MASSAGE_008 })
    }

    if (results[0].is_admin !== 1) {
      // 管理者でない場合
      return sendResponse(res, 401, { message: MASSAGE.LOGIN.MASSAGE_007 })
    }

    const adminMember = results[0]

    // パスワードの検証（平文の比較）
    if (password !== adminMember.password) {
      return sendResponse(res, 401, { message: MASSAGE.LOGIN.MASSAGE_003 })
    }

    // レスポンスの組み立て
    const response = {
      status: 200,
      message: MASSAGE.LOGIN.MASSAGE_009,
    }

    // レスポンス
    sendResponse(res, 200, response)
  })
})

module.exports = router
