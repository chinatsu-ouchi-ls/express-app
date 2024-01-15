const { connection } = require('../../aws/connection')
const sendResponse = require('../../common/responseHandler')
const MASSAGE = require('../../common/message')

const getMaterialDetail = (req, res) => {
  const materialId = req.params.materialId

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
      u.id AS userId,
      u.name AS userName,
      d.id AS deptId,
      d.name AS deptName,
      jc.id AS jobCategoryId,
      jc.name AS jobCategoryName,
      u.entering_company_at AS enteringCompanyAt,
      utc.test_score AS testScore,
      utc.is_completion AS testStatus,
      utc.updated_at AS testUpdateAt,
      uec.updated_at AS enqueteUpdateAt,
      DATE_ADD(u.entering_company_at, INTERVAL m.indication_period MONTH) AS timeLimitAt
    FROM MATERIAL m
    JOIN CATEGORY c ON m.category_id = c.id
    LEFT JOIN MATERIAL_JOB_CATEGORY_VIEWABLE mjcv ON m.id = mjcv.material_id
    LEFT JOIN JOB_CATEGORY jc ON mjcv.job_category_id = jc.id
    LEFT JOIN USER u ON jc.id = u.job_category_id AND u.is_admin = 0 AND u.deleted_at IS NULL
    LEFT JOIN DEPT d ON u.dept_id = d.id
    LEFT JOIN USER_TEST_COMPLETION utc ON u.id = utc.user_id AND m.id = utc.material_id
    LEFT JOIN USER_ENQUETE_COMPLETION uec ON u.id = uec.user_id AND m.id = uec.material_id
    WHERE m.id = ? AND m.deleted_at IS NULL
  `

  connection.query(sql, [materialId], (err, results) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.MATERIAL.MASSAGE_002 })
    }

    if (results.length === 0) {
      return sendResponse(res, 404, { message: MASSAGE.MATERIAL.MASSAGE_003 })
    }

    // 研修の基本情報を取得
    const materialBaseInfo = results[0]

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

    // 資格があるユーザー一覧を生成
    const eligibleUsers = results.reduce((acc, row) => {
      if (row.userId && !acc.some((user) => user.id === row.userId)) {
        acc.push({
          id: row.userId,
          name: row.userName,
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

    // ユーザーIDに基づいてソート
    eligibleUsers.sort((a, b) => a.id - b.id)

    // 返却する研修詳細情報
    // 返却する研修詳細情報
    const material = {
      id: materialBaseInfo.id,
      name: materialBaseInfo.name,
      isRequired: materialBaseInfo.isRequired,
      category: {
        id: materialBaseInfo.categoryId,
        name: materialBaseInfo.categoryName,
      },
      indicationPeriod: materialBaseInfo.indicationPeriod,
      indicationTime: materialBaseInfo.indicationTime,
      media: materialBaseInfo.media,
      url: materialBaseInfo.url,
      testUrl: materialBaseInfo.testUrl,
      enqueteUrl: materialBaseInfo.enqueteUrl,
      testResultUrl: materialBaseInfo.testResultUrl,
      enqueteResultUrl: materialBaseInfo.enqueteResultUrl,
      passingScore: materialBaseInfo.passingScore,
      bestScore: materialBaseInfo.bestScore,
      viewableJobCategories: viewableJobCategories,
      eligibleUsers: eligibleUsers,
    }

    sendResponse(res, 200, { material })
  })
}

module.exports = getMaterialDetail