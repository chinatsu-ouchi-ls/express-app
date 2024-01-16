const express = require('express')
const { connection } = require('../aws/connection')
const sendResponse = require('../common/responseHandler')
const MASSAGE = require('../common/message')
const router = express.Router()

const checkUserExists = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id FROM USER WHERE id = ? AND deleted_at IS NULL'
    connection.query(sql, [userId], (err, results) => {
      if (err) return reject(new Error(MASSAGE.ENQUETE.MASSAGE_002))
      resolve(results.length > 0)
    })
  })
}

const checkTrainingExists = (trainingId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id FROM TRAINING WHERE id = ? AND deleted_at IS NULL'
    connection.query(sql, [trainingId], (err, results) => {
      if (err) return reject(new Error(MASSAGE.ENQUETE.MASSAGE_002))
      resolve(results.length > 0)
    })
  })
}

const checkEnqueteExists = (userId, trainingId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id FROM USER_ENQUETE_COMPLETION WHERE user_id = ? AND training_id = ?'
    connection.query(sql, [userId, trainingId], (err, results) => {
      if (err) return reject(new Error(MASSAGE.ENQUETE.MASSAGE_002))
      resolve(results.length > 0)
    })
  })
}

const insertEnquete = (userId, trainingId) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO USER_ENQUETE_COMPLETION (user_id, training_id) VALUES (?, ?)'
    connection.query(sql, [userId, trainingId], (err, result) => {
      if (err) return reject(new Error(MASSAGE.ENQUETE.MASSAGE_002))
      resolve(result)
    })
  })
}

router.post('/', (req, res) => {
  const { userId, trainingId } = req.body

  // バリデーションチェック
  if (!userId || !trainingId) {
    return sendResponse(res, 400, { message: MASSAGE.ENQUETE.MASSAGE_001 })
  }

  checkUserExists(userId)
    .then((userExists) => {
      if (!userExists) {
        throw new Error(MASSAGE.ENQUETE.MASSAGE_005) // ユーザーが存在しない、または削除されている場合のエラーメッセージ
      }
      return checkTrainingExists(trainingId)
    })
    .then((trainingExists) => {
      if (!trainingExists) {
        throw new Error(MASSAGE.ENQUETE.MASSAGE_006) // トレーニングが存在しない、または削除されている場合のエラーメッセージ
      }
      return checkEnqueteExists(userId, trainingId)
    })
    .then((enqueteExists) => {
      if (enqueteExists) {
        throw new Error(MASSAGE.ENQUETE.MASSAGE_003) // アンケート結果が既に存在する場合のメッセージ
      }
      return insertEnquete(userId, trainingId)
    })
    .then(() => {
      sendResponse(res, 200, { message: MASSAGE.ENQUETE.MASSAGE_004 }) // 新しいアンケート結果が挿入された場合のメッセージ
    })
    .catch((err) => {
      if (err.message === MASSAGE.ENQUETE.MASSAGE_002) {
        console.error('Error: ', err)
        sendResponse(res, 500, { message: err.message })
      } else {
        sendResponse(res, 400, { message: err.message })
      }
    })
})

module.exports = router
