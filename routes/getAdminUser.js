const express = require('express')
const { connection } = require('../aws/connection')
const sendResponse = require('../common/responseHandler')
const MASSAGE = require('../common/message')
const router = express.Router()

// 特定のユーザーの詳細情報と研修の一覧を取得
router.get('/:userId', (req, res) => {
  const userId = req.params.userId

  // パラメーターの検証
  if (isNaN(userId) || userId < 1) {
    return sendResponse(res, 400, { message: MASSAGE.USER.MASSAGE_001 })
  }

  // ユーザー詳細情報の取得
  const userSql = `
    SELECT 
      u.id, 
      u.name, 
      u.entering_company_at, 
      d.id AS 'dept.id', 
      d.name AS 'dept.name', 
      j.id AS 'jobCategory.id', 
      j.name AS 'jobCategory.name' 
    FROM USER u 
    LEFT JOIN DEPT d ON u.dept_id = d.id 
    LEFT JOIN JOB_CATEGORY j ON u.job_category_id = j.id 
    WHERE u.id = ?
  `

  // ユーザーの研修一覧の取得
  const trainingsSql = `
    SELECT
      m.id,
      m.name,
      m.is_required AS isRequired,
      c.id AS categoryId,
      c.name AS categoryName,
      m.indication_period AS indicationPeriod,
      m.indication_time AS indicationTime,
      m.media,
      m.url,
      m.test_url AS testUrl,
      m.enquete_url AS enqueteUrl,
      m.passing_score AS passingScore,
      m.best_score AS bestScore,
      IFNULL(utc.is_completion, 0) AS testStatus,
      IFNULL(uec.id, 0) AS enqueteStatus,
      utc.test_score AS testScore,
      utc.updated_at AS testUpdateAt,
      uec.updated_at AS enqueteUpdateAt
    FROM USER u
    JOIN TRAINING_JOB_CATEGORY_VIEWABLE mjcv ON mjcv.job_category_id = u.job_category_id
    JOIN TRAINING m ON m.id = mjcv.training_id
    LEFT JOIN CATEGORY c ON c.id = m.category_id
    LEFT JOIN USER_TEST_COMPLETION utc ON utc.user_id = u.id AND utc.training_id = m.id
    LEFT JOIN USER_ENQUETE_COMPLETION uec ON uec.user_id = u.id AND uec.training_id = m.id
    WHERE u.id = ?
  `

  connection.query(userSql, [userId], (err, userResult) => {
    // エラーハンドリング
    if (err) {
      return sendResponse(res, 500, { message: MASSAGE.USER.MASSAGE_002 })
    }
    if (userResult.length === 0) {
      return sendResponse(res, 404, { message: MASSAGE.USER.MASSAGE_003 })
    }

    // ユーザーの研修一覧を取得
    connection.query(trainingsSql, [userId], (trainingsErr, trainingsResult) => {
      // エラーハンドリング
      if (trainingsErr) {
        return sendResponse(res, 500, { message: MASSAGE.USER.MASSAGE_002 })
      }

      // レスポンスの組み立て
      const response = {
        status: 200,
        user: {
          ...userResult[0],
          trainings: trainingsResult,
        },
      }
      sendResponse(res, 200, response)
    })
  })
})

module.exports = router
