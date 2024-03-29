const { connection } = require('../../aws/connection')
const sendResponse = require('../../common/responseHandler')
const MASSAGE = require('../../common/message')

const deleteTraining = (req, res) => {
  const trainingId = parseInt(req.params.trainingId, 10)

  // trainingId が数値でない、または NaN の場合、エラーを返す
  if (isNaN(trainingId)) {
    return sendResponse(res, 400, { message: MASSAGE.TRAINING.MASSAGE_007 })
  }

  // 研修データのdeleted_atを現在の日時に設定するSQLクエリ
  const deleteSql = `
    UPDATE TRAINING
    SET deleted_at = NOW()
    WHERE id = ?
  `

  // SQLクエリを実行して研修データを論理削除
  connection.query(deleteSql, [trainingId], (err, result) => {
    // データベースエラーの処理
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.TRAINING.MASSAGE_001 })
    }

    // 研修が論理削除されたことを示すレスポンスを返す
    sendResponse(res, 200, { message: MASSAGE.TRAINING.MASSAGE_006 })
  })
}

module.exports = deleteTraining
