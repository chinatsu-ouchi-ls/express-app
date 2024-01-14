const { connection } = require('../../aws/connection')
const sendResponse = require('../../common/responseHandler')
const MASSAGE = require('../../common/message')

const getMaterials = (req, res) => {
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
      GROUP_CONCAT(DISTINCT jc.id SEPARATOR ', ') AS jobCategoryIds,
      GROUP_CONCAT(DISTINCT jc.name SEPARATOR ', ') AS jobCategoryNames
    FROM MATERIAL m
    JOIN CATEGORY c ON m.category_id = c.id
    LEFT JOIN MATERIAL_JOB_CATEGORY_VIEWABLE mjcv ON m.id = mjcv.material_id
    LEFT JOIN JOB_CATEGORY jc ON mjcv.job_category_id = jc.id
    WHERE m.deleted_at IS NULL
    GROUP BY m.id
  `

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.MATERIAL.MASSAGE_001 })
    }

    const materials = results.map((row) => {
      const jobCategoryIds = row.jobCategoryIds ? row.jobCategoryIds.split(', ') : []
      const jobCategoryNames = row.jobCategoryNames ? row.jobCategoryNames.split(', ') : []

      const viewableJobCategories = jobCategoryIds.map((id, index) => ({
        id: parseInt(id),
        name: jobCategoryNames[index],
      }))

      return {
        id: row.id,
        name: row.name,
        isRequired: row.isRequired === 1,
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
        testResultUrl: row.testResultUrl,
        enqueteResultUrl: row.enqueteResultUrl,
        passingScore: row.passingScore,
        bestScore: row.bestScore,
        viewableJobCategories,
      }
    })

    sendResponse(res, 200, { materials })
  })
}

module.exports = getMaterials
