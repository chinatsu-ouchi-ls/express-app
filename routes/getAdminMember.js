const express = require('express')
const { connection } = require('../aws/connection')
const sendResponse = require('../common/responseHandler')
const MASSAGE = require('../common/message')
const formatDateToYYYYMMDD = require('../common/formatDateToYYYYMMDD')
const formatDateToYYYYMMDDHHMMSS = require('../common/formatDateToYYYYMMDDHHMMSS')
const formatDateToJstYYYYMMDDHHMMSS = require('../common/formatDateToJstYYYYMMDDHHMMSS')
const router = express.Router()

// 特定のメンバーの詳細情報と研修の一覧を取得
router.get('/:memberId', (req, res) => {
  const memberId = parseInt(req.params.memberId, 10)

  // memberId が数値でない、または NaN の場合、エラーを返す
  if (isNaN(memberId)) {
    return sendResponse(res, 400, { message: MASSAGE.MEMBER.MASSAGE_001 })
  }

  // メンバー詳細情報の取得
  const memberSql = `
    SELECT 
      u.id, 
      u.name,
      u.password,
      u.mail_address,
      u.entering_company_at, 
      d.id AS 'dept_id', 
      d.name AS 'dept_name', 
      j.id AS 'job_category_id', 
      j.name AS 'job_category_name' 
    FROM MEMBER u 
    LEFT JOIN DEPT d ON u.dept_id = d.id 
    LEFT JOIN JOB_CATEGORY j ON u.job_category_id = j.id 
    WHERE u.id = ?
  `

  // メンバーの研修一覧の取得
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
      CASE
        WHEN utc.is_completion IS NULL THEN 0
        WHEN utc.is_completion = 1 THEN 1
        ELSE 2
      END AS testStatus,
      CASE
        WHEN uec.updated_at IS NULL THEN 0
        ELSE 1
      END AS enqueteStatus,
      utc.test_score AS testScore,
      utc.updated_at AS testUpdateAt,
      uec.updated_at AS enqueteUpdateAt,
      DATE_FORMAT(DATE_ADD(u.entering_company_at, INTERVAL m.indication_period MONTH), '%Y/%m/%d %H:%i:%s') AS timeLimitAt
    FROM MEMBER u
    JOIN TRAINING_JOB_CATEGORY_VIEWABLE mjcv ON mjcv.job_category_id = u.job_category_id
    JOIN TRAINING m ON m.id = mjcv.training_id
    LEFT JOIN CATEGORY c ON c.id = m.category_id
    LEFT JOIN MEMBER_TEST_COMPLETION utc ON utc.member_id = u.id AND utc.training_id = m.id
    LEFT JOIN MEMBER_ENQUETE_COMPLETION uec ON uec.member_id = u.id AND uec.training_id = m.id
    WHERE u.id = ? AND m.deleted_at IS NULL
  `

  connection.query(memberSql, [memberId], (err, memberResult) => {
    // エラーハンドリング
    if (err) {
      return sendResponse(res, 500, { message: MASSAGE.MEMBER.MASSAGE_002 })
    }
    if (memberResult.length === 0) {
      return sendResponse(res, 404, { message: MASSAGE.MEMBER.MASSAGE_003 })
    }

    // メンバーの研修一覧を取得
    connection.query(trainingsSql, [memberId], (trainingsErr, trainingsResult) => {
      // エラーハンドリング
      if (trainingsErr) {
        return sendResponse(res, 500, { message: MASSAGE.MEMBER.MASSAGE_002 })
      }

      // レスポンスの組み立て
      const response = {
        status: 200,
        member: {
          id: memberResult[0].id,
          name: memberResult[0].name,
          password: memberResult[0].password,
          mailAddress: memberResult[0].mail_address,
          dept: {
            id: memberResult[0].dept_id,
            name: memberResult[0].dept_name,
          },
          jobCategory: {
            id: memberResult[0].job_category_id,
            name: memberResult[0].job_category_name,
          },
          enteringCompanyAt: formatDateToYYYYMMDD(memberResult[0].entering_company_at),
          trainings: trainingsResult.map((trainingResult) => ({
            id: trainingResult.id,
            name: trainingResult.name,
            isRequired: trainingResult.isRequired,
            category: {
              id: trainingResult.categoryId,
              name: trainingResult.categoryName,
            },
            timeLimitAt: formatDateToYYYYMMDD(trainingResult.timeLimitAt),
            indicationTime: trainingResult.indicationTime,
            media: trainingResult.media,
            url: trainingResult.url,
            testUrl: trainingResult.testUrl,
            enqueteUrl: trainingResult.enqueteUrl,
            passingScore: trainingResult.passingScore,
            bestScore: trainingResult.bestScore,
            testStatus: trainingResult.testStatus,
            enqueteStatus: trainingResult.enqueteStatus,
            testScore: trainingResult.testScore,
            testUpdateAt: formatDateToJstYYYYMMDDHHMMSS(trainingResult.testUpdateAt),
            enqueteUpdateAt: formatDateToJstYYYYMMDDHHMMSS(trainingResult.enqueteUpdateAt),
          })),
        },
      }
      sendResponse(res, 200, response)
    })
  })
})

module.exports = router
