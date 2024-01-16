const express = require('express')
const { connection } = require('../aws/connection')
const sendResponse = require('../common/responseHandler')
const MASSAGE = require('../common/message')
const router = express.Router()

const checkUserExists = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id FROM USER WHERE id = ? AND deleted_at IS NULL'
    connection.query(sql, [userId], (err, results) => {
      if (err) return reject(new Error(MASSAGE.TEST.MASSAGE_003))
      resolve(results.length > 0)
    })
  })
}

const checkTrainingExists = (trainingId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id FROM TRAINING WHERE id = ? AND deleted_at IS NULL'
    connection.query(sql, [trainingId], (err, results) => {
      if (err) return reject(new Error(MASSAGE.TEST.MASSAGE_003))
      resolve(results.length > 0)
    })
  })
}

const checkPassingScore = (trainingId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT passing_score FROM TRAINING WHERE id = ?'
    connection.query(sql, [trainingId], (err, results) => {
      if (err) return reject(new Error(MASSAGE.TEST.MASSAGE_003))
      resolve(results[0]?.passing_score)
    })
  })
}

const checkTestExistence = (userId, trainingId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id FROM USER_TEST_COMPLETION WHERE user_id = ? AND training_id = ?'
    connection.query(sql, [userId, trainingId], (err, results) => {
      if (err) return reject(new Error(MASSAGE.TEST.MASSAGE_003))
      resolve(results.length > 0)
    })
  })
}

const updateTestCompletion = (userId, trainingId, score, isCompletion) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE USER_TEST_COMPLETION 
      SET test_score = ?, is_completion = ? 
      WHERE user_id = ? AND training_id = ?`
    connection.query(sql, [score, isCompletion, userId, trainingId], (err, result) => {
      if (err) return reject(new Error(MASSAGE.TEST.MASSAGE_003))
      resolve(result)
    })
  })
}

const insertTestCompletion = (userId, trainingId, score, isCompletion) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO USER_TEST_COMPLETION (user_id, training_id, test_score, is_completion)
      VALUES (?, ?, ?, ?)`
    connection.query(sql, [userId, trainingId, score, isCompletion], (err, result) => {
      if (err) return reject(new Error(MASSAGE.TEST.MASSAGE_003))
      resolve(result)
    })
  })
}

router.post('/', (req, res) => {
  const { userId, trainingId, score } = req.body

  // バリデーションチェック
  if (!userId || !trainingId || score === undefined) {
    return sendResponse(res, 400, { message: MASSAGE.TEST.MASSAGE_001 })
  }

  checkUserExists(userId)
    .then((userExists) => {
      if (!userExists) {
        throw new Error(MASSAGE.TEST.MASSAGE_004) // ユーザーが存在しない、または削除されている場合のエラーメッセージ
      }
      return checkTrainingExists(trainingId)
    })
    .then((trainingExists) => {
      if (!trainingExists) {
        throw new Error(MASSAGE.TEST.MASSAGE_005) // トレーニングが存在しない、または削除されている場合のエラーメッセージ
      }
      return checkPassingScore(trainingId)
    })
    .then((passingScore) => {
      const isCompletion = score >= passingScore ? 1 : 0
      return checkTestExistence(userId, trainingId).then((exists) => ({ exists, isCompletion }))
    })
    .then(({ exists, isCompletion }) => {
      if (exists) {
        return updateTestCompletion(userId, trainingId, score, isCompletion)
      } else {
        return insertTestCompletion(userId, trainingId, score, isCompletion)
      }
    })
    .then(() => {
      sendResponse(res, 200, { message: MASSAGE.TEST.MASSAGE_002 })
    })
    .catch((err) => {
      if (err.message === MASSAGE.TEST.MASSAGE_003) {
        console.error('Error: ', err)
        sendResponse(res, 500, { message: err.message })
      } else {
        sendResponse(res, 400, { message: err.message })
      }
    })
})

module.exports = router
