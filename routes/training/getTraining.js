const { connection } = require('../../aws/connection')
const sendResponse = require('../../common/responseHandler')
const MASSAGE = require('../../common/message')

const getTraining = (req, res) => {
  const trainingId = req.params.trainingId

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
      m.test_result_url AS testResultUrl,
      m.enquete_result_url AS enqueteResultUrl,
      m.passing_score AS passingScore,
      m.best_score AS bestScore,
      u.id AS memberId,
      u.name AS memberName,
      d.id AS deptId,
      d.name AS deptName,
      jc.id AS jobCategoryId,
      jc.name AS jobCategoryName,
      u.entering_company_at AS enteringCompanyAt,
      utc.test_score AS testScore,
      utc.is_completion AS testStatus,
      utc.updated_at AS testUpdateAt,
      uec.updated_at AS enqueteUpdateAt,
    CASE
      WHEN m.indication_period IS NOT NULL THEN DATE_ADD(u.entering_company_at, INTERVAL m.indication_period MONTH)
      ELSE NULL
    END AS timeLimitAt
    FROM TRAINING m
    JOIN CATEGORY c ON m.category_id = c.id
    LEFT JOIN TRAINING_JOB_CATEGORY_VIEWABLE mjcv ON m.id = mjcv.training_id
    LEFT JOIN JOB_CATEGORY jc ON mjcv.job_category_id = jc.id
    LEFT JOIN MEMBER u ON jc.id = u.job_category_id AND u.is_admin = 0 AND u.deleted_at IS NULL
    LEFT JOIN DEPT d ON u.dept_id = d.id
    LEFT JOIN MEMBER_TEST_COMPLETION utc ON u.id = utc.member_id AND m.id = utc.training_id
    LEFT JOIN MEMBER_ENQUETE_COMPLETION uec ON u.id = uec.member_id AND m.id = uec.training_id
    WHERE m.id = ? AND m.deleted_at IS NULL
  `

  connection.query(sql, [trainingId], (err, results) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.TRAINING.MASSAGE_001 })
    }

    if (results.length === 0) {
      return sendResponse(res, 404, { message: MASSAGE.TRAINING.MASSAGE_002 })
    }

    // 研修の基本情報を取得
    const trainingBaseInfo = results[0]

    // 資格がある職種の一覧を生成
    const viewableJobCategories = results.reduce((acc, row) => {
      if (row.jobCategoryId && !acc.some((jobCat) => jobCat.id === row.jobCategoryId)) {
        acc.push({
          id: row.jobCategoryId,
          name: row.jobCategoryName,
        })
      }
      return acc
    }, [])

    // 資格があるメンバー一覧を生成
    const eligibleMembers = results.reduce((acc, row) => {
      if (row.memberId && !acc.some((member) => member.id === row.memberId)) {
        acc.push({
          id: row.memberId,
          name: row.memberName,
          dept: {
            id: row.deptId,
            name: row.deptName,
          },
          jobCategory: {
            id: row.jobCategoryId,
            name: row.jobCategoryName,
          },
          enteringCompanyAt: row.enteringCompanyAt,
          testStatus: row.testStatus || 0,
          enqueteStatus: row.enqueteUpdateAt ? 1 : 0,
          testScore: row.testScore,
          testUpdateAt: row.testUpdateAt,
          enqueteUpdateAt: row.enqueteUpdateAt,
          timeLimitAt: row.timeLimitAt,
        })
      }
      return acc
    }, [])

    // メンバーIDに基づいてソート
    eligibleMembers.sort((a, b) => a.id - b.id)

    // 返却する研修詳細情報
    const training = {
      id: trainingBaseInfo.id,
      name: trainingBaseInfo.name,
      isRequired: trainingBaseInfo.isRequired === 1,
      category: {
        id: trainingBaseInfo.categoryId,
        name: trainingBaseInfo.categoryName,
      },
      indicationPeriod: trainingBaseInfo.indicationPeriod,
      indicationTime: trainingBaseInfo.indicationTime,
      media: trainingBaseInfo.media,
      url: trainingBaseInfo.url,
      testUrl: trainingBaseInfo.testUrl,
      enqueteUrl: trainingBaseInfo.enqueteUrl,
      testResultUrl: trainingBaseInfo.testResultUrl,
      enqueteResultUrl: trainingBaseInfo.enqueteResultUrl,
      passingScore: trainingBaseInfo.passingScore,
      bestScore: trainingBaseInfo.bestScore,
      viewableJobCategories: viewableJobCategories,
      eligibleMembers: eligibleMembers,
    }

    sendResponse(res, 200, { training })
  })
}

module.exports = getTraining
