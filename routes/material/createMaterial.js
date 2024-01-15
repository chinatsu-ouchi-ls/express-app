const { connection } = require('../../aws/connection')
const sendResponse = require('../../common/responseHandler')
const MASSAGE = require('../../common/message')

const createMaterial = (req, res) => {
  const {
    name,
    isRequired,
    categoryId,
    indicationPeriod,
    indicationTime,
    media,
    url,
    testUrl,
    enqueteUrl,
    testResultUrl,
    enqueteResultUrl,
    passingScore,
    bestScore,
    viewableJobCategoryIds,
  } = req.body

  // 必須項目のバリデーション
  if (
    !name ||
    isRequired === undefined ||
    !categoryId ||
    !viewableJobCategoryIds ||
    viewableJobCategoryIds.length === 0
  ) {
    return sendResponse(res, 400, { message: MASSAGE.MATERIAL.MASSAGE_003 })
  }

  // isRequired を数値に変換
  const isRequiredValue = isRequired ? 1 : 0

  // categoryIdがCATEGORYテーブルに存在するかチェック
  const categoryCheckSql = `SELECT id FROM CATEGORY WHERE id = ?`
  connection.query(categoryCheckSql, [categoryId], (err, results) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.MATERIAL.MASSAGE_001 })
    }

    // 指定されたcategoryIdが存在しない場合
    if (results.length === 0) {
      return sendResponse(res, 400, { message: MASSAGE.MATERIAL.MASSAGE_004 })
    }

    // categoryIdが存在する場合
    // 研修をMATERIALテーブルに追加
    const materialSql = `
      INSERT INTO MATERIAL (
        name,
        is_required,
        category_id,
        indication_period,
        indication_time,
        media,
        url,
        test_url,
        enquete_url,
        test_result_url,
        enquete_result_url,
        passing_score,
        best_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    connection.query(
      materialSql,
      [
        name,
        isRequiredValue,
        categoryId,
        indicationPeriod,
        indicationTime,
        media,
        url,
        testUrl,
        enqueteUrl,
        testResultUrl,
        enqueteResultUrl,
        passingScore,
        bestScore,
      ],
      (err, result) => {
        if (err) {
          console.error('Database error: ', err)
          return sendResponse(res, 500, { message: MASSAGE.MATERIAL.MASSAGE_001 })
        }

        const materialId = result.insertId

        // MATERIAL_JOB_CATEGORY_VIEWABLE にデータを追加
        const viewableSql = `
        INSERT INTO MATERIAL_JOB_CATEGORY_VIEWABLE (material_id, job_category_id) VALUES ?
      `
        const viewableValues = viewableJobCategoryIds.map((jobCategoryId) => [materialId, jobCategoryId])

        connection.query(viewableSql, [viewableValues], (err, viewableResult) => {
          if (err) {
            console.error('Database error: ', err)
            return sendResponse(res, 500, { message: MASSAGE.MATERIAL.MASSAGE_001 })
          }

          sendResponse(res, 200, { materialId })
        })
      }
    )
  })
}

module.exports = createMaterial
