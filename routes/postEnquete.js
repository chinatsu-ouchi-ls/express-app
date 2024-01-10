const express = require('express')
const { connection } = require('../aws/connection')
const sendResponse = require('../common/responseHandler')
const MASSAGE = require('../common/message')
const router = express.Router()

router.post('/', (req, res) => {
  const { userId, materialId } = req.body

  // バリデーションチェック
  if (!userId || !materialId) {
    return sendResponse(res, 400, { message: MASSAGE.ENQUETE.MASSAGE_001 })
  }

  // 既にアンケート結果が存在するか確認するSQLクエリ
  const checkExistSql = 'SELECT id FROM USER_ENQUETE_COMPLETION WHERE user_id = ? AND material_id = ?'

  connection.query(checkExistSql, [userId, materialId], (err, existResults) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.ENQUETE.MASSAGE_002 })
    }

    if (existResults.length > 0) {
      // アンケート結果が既に存在する場合は何もしない
      return sendResponse(res, 200, { message: MASSAGE.ENQUETE.MASSAGE_003 })
    } else {
      // 新しいアンケート結果を挿入
      const insertSql = `
        INSERT INTO USER_ENQUETE_COMPLETION (user_id, material_id)
        VALUES (?, ?)`

      connection.query(insertSql, [userId, materialId], (err, insertResult) => {
        if (err) {
          console.error('Database error: ', err)
          return sendResponse(res, 500, { message: MASSAGE.ENQUETE.MASSAGE_002 })
        }
        sendResponse(res, 200, { message: MASSAGE.ENQUETE.MASSAGE_004 })
      })
    }
  })
})

module.exports = router
