const express = require('express')
const { connection } = require('../aws/connection')
const sendResponse = require('../common/responseHandler')
const MASSAGE = require('../common/message')
const router = express.Router()

const checkPassingScore = (trainingId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT passing_score FROM TRAINING WHERE id = ?'
    connection.query(sql, [trainingId], (err, results) => {
      if (err) return reject(new Error(MASSAGE.TEST.MASSAGE_003))
      resolve(results[0]?.passing_score)
    })
  })
}

const checkTestExistence = (memberId, trainingId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id FROM MEMBER_TEST_COMPLETION WHERE member_id = ? AND training_id = ?'
    connection.query(sql, [memberId, trainingId], (err, results) => {
      if (err) return reject(new Error(MASSAGE.TEST.MASSAGE_003))
      resolve(results.length > 0)
    })
  })
}

const updateTestCompletion = (memberId, trainingId, score, isCompletion) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE MEMBER_TEST_COMPLETION 
      SET test_score = ?, is_completion = ? 
      WHERE member_id = ? AND training_id = ?`
    connection.query(sql, [score, isCompletion, memberId, trainingId], (err, result) => {
      if (err) return reject(new Error(MASSAGE.TEST.MASSAGE_003))
      resolve(result)
    })
  })
}

const insertTestCompletion = (memberId, trainingId, score, isCompletion) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO MEMBER_TEST_COMPLETION (member_id, training_id, test_score, is_completion)
      VALUES (?, ?, ?, ?)`
    connection.query(sql, [memberId, trainingId, score, isCompletion], (err, result) => {
      if (err) return reject(new Error(MASSAGE.TEST.MASSAGE_003))
      resolve(result)
    })
  })
}

router.post('/', (req, res) => {
  const { memberId, trainingId, score } = req.body

  // バリデーションチェック
  if (!memberId || !trainingId || score === undefined) {
    return sendResponse(res, 400, { message: MASSAGE.TEST.MASSAGE_001 })
  }

  checkPassingScore(trainingId)
    .then((passingScore) => {
      const isCompletion = score >= passingScore ? 1 : 0
      return checkTestExistence(memberId, trainingId).then((exists) => ({ exists, isCompletion }))
    })
    .then(({ exists, isCompletion }) => {
      if (exists) {
        return updateTestCompletion(memberId, trainingId, score, isCompletion)
      } else {
        return insertTestCompletion(memberId, trainingId, score, isCompletion)
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
        sendResponse(res, 401, { message: err.message })
      }
    })
})

module.exports = router
