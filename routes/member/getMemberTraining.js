const { connection } = require('../../aws/connection')
const sendResponse = require('../../common/responseHandler')
const MASSAGE = require('../../common/message')

const getMemberTraining = (req, res) => {
  const memberId = req.params.memberId
  const trainingId = req.params.trainingId

  // memberId が数値でない場合、エラーを返す
  if (!Number.isInteger(memberId)) {
    return sendResponse(res, 400, { message: MASSAGE.MEMBER.MASSAGE_001 })
  }
  // trainingId が数値でない場合、エラーを返す
  if (!Number.isInteger(trainingId)) {
    return sendResponse(res, 400, { message: MASSAGE.MEMBER.MASSAGE_015 })
  }

  // 研修詳細情報を取得するSQLクエリ
  const sql = `
    SELECT
      m.id,
      m.name,
      m.is_required AS isRequired,
      c.id AS categoryId,
      c.name AS categoryName,
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
      uec.updated_at AS enqueteUpdateAt,
      DATE_FORMAT(DATE_ADD(u.entering_company_at, INTERVAL m.indication_period MONTH), '%Y/%m/%d %H:%i:%s') AS timeLimitAt
    FROM TRAINING m
    LEFT JOIN CATEGORY c ON m.category_id = c.id
    LEFT JOIN MEMBER u ON u.id = ?
    LEFT JOIN MEMBER_TEST_COMPLETION utc ON utc.training_id = m.id AND utc.member_id = u.id
    LEFT JOIN MEMBER_ENQUETE_COMPLETION uec ON uec.training_id = m.id AND uec.member_id = u.id
    WHERE m.id = ?
  `
  // SQLクエリを実行して研修詳細情報を取得
  connection.query(sql, [memberId, trainingId], (err, result) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.MEMBER.MASSAGE_002 })
    }
    if (result.length === 0) {
      return sendResponse(res, 401, { message: MASSAGE.MEMBER.MASSAGE_004 })
    }

    // 結果を整形してレスポンスに設定
    const training = {
      id: result[0].id,
      name: result[0].name,
      isRequired: result[0].isRequired === 1,
      category: {
        id: result[0].categoryId,
        name: result[0].categoryName,
      },
      timeLimitAt: result[0].timeLimitAt,
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

module.exports = getMemberTraining
