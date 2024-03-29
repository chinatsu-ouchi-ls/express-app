const { connection } = require('../../aws/connection')
const sendResponse = require('../../common/responseHandler')
const MASSAGE = require('../../common/message')

const createTraining = (req, res) => {
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
    return sendResponse(res, 400, { message: MASSAGE.TRAINING.MASSAGE_003 })
  }

  // isRequired を数値に変換
  const isRequiredValue = isRequired ? 1 : 0

  // 研修をTRAININGテーブルに追加
  const trainingSql = `
      INSERT INTO TRAINING (
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
    trainingSql,
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
        return sendResponse(res, 500, { message: MASSAGE.TRAINING.MASSAGE_001 })
      }

      const trainingId = result.insertId

      // TRAINING_JOB_CATEGORY_VIEWABLE にデータを追加
      const viewableSql = `
        INSERT INTO TRAINING_JOB_CATEGORY_VIEWABLE (training_id, job_category_id) VALUES ?
      `
      const viewableValues = viewableJobCategoryIds.map((jobCategoryId) => [trainingId, jobCategoryId])

      connection.query(viewableSql, [viewableValues], (err, viewableResult) => {
        if (err) {
          console.error('Database error: ', err)
          return sendResponse(res, 500, { message: MASSAGE.TRAINING.MASSAGE_001 })
        }

        sendResponse(res, 200, { trainingId })
      })
    }
  )
}

module.exports = createTraining
