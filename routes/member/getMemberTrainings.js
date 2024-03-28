const { connection } = require('../../aws/connection')
const sendResponse = require('../../common/responseHandler')
const MASSAGE = require('../../common/message')
const formatDateToYYYYMMDD = require('../../common/formatDateToYYYYMMDD')

const getMemberTrainings = (req, res) => {
  const memberId = parseInt(req.params.memberId, 10)

  // memberId が数値でない、または NaN の場合、エラーを返す
  if (isNaN(memberId)) {
    return sendResponse(res, 400, { message: MASSAGE.MEMBER.MASSAGE_001 })
  }

  // メンバーの職種に基づく研修の一覧を取得するSQLクエリ
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
      CASE
        WHEN utc.is_completion IS NULL THEN 0
        WHEN utc.is_completion = 1 THEN 1
        WHEN utc.is_completion = 0 THEN 2
      END AS testStatus,
      CASE WHEN uec.id IS NOT NULL THEN 1 ELSE 0 END AS enqueteStatus,
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

  // SQLクエリを実行してメンバーの研修一覧を取得
  connection.query(sql, [memberId], (err, results) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.MEMBER.MASSAGE_002 })
    }
    if (results.length === 0) {
      return sendResponse(res, 401, { message: MASSAGE.MEMBER.MASSAGE_004 })
    }

    // 結果を整形してレスポンスに設定
    const trainings = results.map((row) => ({
      id: row.id,
      name: row.name,
      isRequired: row.isRequired === 1,
      category: {
        id: row.categoryId,
        name: row.categoryName,
      },
      timeLimitAt: formatDateToYYYYMMDD(row.timeLimitAt),
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
      testUpdateAt: formatDateToYYYYMMDD(row.testUpdateAt),
      enqueteUpdateAt: formatDateToYYYYMMDD(row.enqueteUpdateAt),
    }))
    sendResponse(res, 200, { trainings })
  })
}

module.exports = getMemberTrainings
