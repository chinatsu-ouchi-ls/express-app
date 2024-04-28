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

  // 管理者ではない、かつ削除されていない（退職していない）メンバーを取得するSQLクエリ
  const sql = 'SELECT id, password, is_admin FROM MEMBER WHERE mail_address = ? AND deleted_at IS NULL AND is_admin = 0'

  connection.query(sql, [mailAddress], (err, results) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.LOGIN.MASSAGE_001 })
    }

    if (results.length === 0) {
      return sendResponse(res, 401, { message: MASSAGE.LOGIN.MASSAGE_002 })
    }

    const member = results[0]

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
