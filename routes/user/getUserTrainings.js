const { connection } = require('../../aws/connection')
const sendResponse = require('../../common/responseHandler')
const MASSAGE = require('../../common/message')

const getUserTrainings = (req, res) => {
  const userId = req.params.userId

  // パラメーターの検証
  if (isNaN(userId) || userId < 1) {
    return sendResponse(res, 400, { message: MASSAGE.USER.MASSAGE_001 })
  }

  // ユーザーの職種に基づく研修の一覧を取得するSQLクエリ
  const sql = `
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

  connection.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.USER.MASSAGE_002 })
    }
    if (results.length === 0) {
      return sendResponse(res, 404, { message: MASSAGE.USER.MASSAGE_004 })
    }

    const trainings = results.map((row) => ({
      id: row.id,
      name: row.name,
      isRequired: row.isRequired,
      category: {
        id: row.categoryId,
        name: row.categoryName,
      },
      indicationPeriod: row.indicationPeriod,
      indicationTime: row.indicationTime,
      media: row.media,
      url: row.url,
      testUrl: row.testUrl,
      enqueteUrl: row.enqueteUrl,
      passingScore: row.passingScore,
      bestScore: row.bestScore,
      testStatus: row.testStatus,
      enqueteStatus: row.enqueteStatus,
      testScore: row.testScore,
      testUpdateAt: row.testUpdateAt,
      enqueteUpdateAt: row.enqueteUpdateAt,
    }))
    sendResponse(res, 200, { trainings })
  })
}

module.exports = getUserTrainings
