const express = require('express')
const { connection } = require('../aws/connection')
const sendResponse = require('../common/responseHandler')
const MASSAGE = require('../common/message')
const router = express.Router()

router.post('/', (req, res) => {
  const { userId, materialId, score } = req.body

  // バリデーションチェック
  if (!userId || !materialId || score === undefined) {
    return sendResponse(res, 400, { message: MASSAGE.TEST.MASSAGE_001 })
  }

  // 合格点数を確認するためのSQLクエリ
  const checkPassingScoreSql = 'SELECT passing_score FROM MATERIAL WHERE id = ?'

  connection.query(checkPassingScoreSql, [materialId], (err, materialResults) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.TEST.MASSAGE_003 })
    }

    // 合格点数を取得
    const passingScore = materialResults[0]?.passing_score

    // スコアが合格点数以上かどうかを確認
    const isCompletion = score >= passingScore ? 1 : 0

    // 既にテスト結果が存在するか確認するSQLクエリ
    const checkExistSql = 'SELECT id FROM USER_TEST_COMPLETION WHERE user_id = ? AND material_id = ?'

    connection.query(checkExistSql, [userId, materialId], (err, existResults) => {
      if (err) {
        console.error('Database error: ', err)
        return sendResponse(res, 500, { message: MASSAGE.TEST.MASSAGE_003 })
      }

      if (existResults.length > 0) {
        // 既存のデータを更新
        const updateSql = `
          UPDATE USER_TEST_COMPLETION 
          SET test_score = ?, is_completion = ? 
          WHERE user_id = ? AND material_id = ?`

        connection.query(updateSql, [score, isCompletion, userId, materialId], (err, updateResult) => {
          if (err) {
            console.error('Database error: ', err)
            return sendResponse(res, 500, { message: MASSAGE.TEST.MASSAGE_003 })
          }
          sendResponse(res, 200, { message: MASSAGE.TEST.MASSAGE_002 })
        })
      } else {
        // 新しいデータを挿入
        const insertSql = `
          INSERT INTO USER_TEST_COMPLETION (user_id, material_id, test_score, is_completion)
          VALUES (?, ?, ?, ?)`

        connection.query(insertSql, [userId, materialId, score, isCompletion], (err, insertResult) => {
          if (err) {
            console.error('Database error: ', err)
            return sendResponse(res, 500, { message: MASSAGE.TEST.MASSAGE_003 })
          }
          sendResponse(res, 200, { message: MASSAGE.TEST.MASSAGE_002 })
        })
      }
    })
  })
})

module.exports = router
