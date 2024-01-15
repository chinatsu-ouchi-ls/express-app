const { connection } = require('../../aws/connection')
const sendResponse = require('../../common/responseHandler')
const MASSAGE = require('../../common/message')

const getUserTraining = (req, res) => {
  const userId = req.params.userId
  const trainingId = req.params.trainingId

  // パラメーターの検証
  if (isNaN(userId) || userId < 1 || isNaN(trainingId) || trainingId < 1) {
    return sendResponse(res, 400, { message: MASSAGE.USER.MASSAGE_004 })
  }

  // 研修詳細情報を取得するSQLクエリ
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
      COALESCE(utc.is_completion, 0) AS testStatus,
      COALESCE(uec.id, 0) AS enqueteStatus,
      utc.test_score AS testScore,
      utc.updated_at AS testUpdateAt,
      uec.updated_at AS enqueteUpdateAt
    FROM TRAINING m
    LEFT JOIN CATEGORY c ON m.category_id = c.id
    LEFT JOIN USER_TEST_COMPLETION utc ON utc.training_id = m.id AND utc.user_id = ?
    LEFT JOIN USER_ENQUETE_COMPLETION uec ON uec.training_id = m.id AND uec.user_id = ?
    WHERE m.id = ?
  `

  connection.query(sql, [userId, userId, trainingId], (err, result) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.USER.MASSAGE_002 })
    }
    if (result.length === 0) {
      return sendResponse(res, 404, { message: MASSAGE.USER.MASSAGE_004 })
    }

    const training = {
      id: result[0].id,
      name: result[0].name,
      isRequired: result[0].isRequired,
      category: {
        id: result[0].categoryId,
        name: result[0].categoryName,
      },
      indicationPeriod: result[0].indicationPeriod,
      indicationTime: result[0].indicationTime,
      media: result[0].media,
      url: result[0].url,
      testUrl: result[0].testUrl,
      enqueteUrl: result[0].enqueteUrl,
      passingScore: result[0].passingScore,
      bestScore: result[0].bestScore,
      testStatus: result[0].testStatus,
      enqueteStatus: result[0].enqueteStatus,
      testScore: result[0].testScore,
      testUpdateAt: result[0].testUpdateAt,
      enqueteUpdateAt: result[0].enqueteUpdateAt,
    }
    sendResponse(res, 200, { training })
  })
}

module.exports = getUserTraining
