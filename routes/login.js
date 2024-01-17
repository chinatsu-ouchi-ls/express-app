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

  // 管理者ではないメンバーのみを取得するSQLクエリ
  const sql = 'SELECT id, password, is_admin FROM MEMBER WHERE mail_address = ?'

  connection.query(sql, [mailAddress], (err, results) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.LOGIN.MASSAGE_001 })
    }

    if (results.length === 0) {
      return sendResponse(res, 401, { message: MASSAGE.LOGIN.MASSAGE_002 })
    }

    const member = results[0]

    // 管理者の場合はエラーを返す
    if (member.is_admin === 1) {
      return sendResponse(res, 401, { message: MASSAGE.LOGIN.MASSAGE_005 })
    }

    // パスワードの検証（平文の比較）
    if (password !== member.password) {
      return sendResponse(res, 401, { message: MASSAGE.LOGIN.MASSAGE_003 })
    }

    // レスポンスの組み立て
    const response = {
      status: 200,
      memberId: member.id,
    }

    // レスポンス
    sendResponse(res, 200, response)
  })
})

module.exports = router
