const { connection } = require('../../aws/connection')
const sendResponse = require('../../common/responseHandler')
const MASSAGE = require('../../common/message')

const editTraining = (req, res) => {
  // リクエストから研修IDを取得
  const trainingId = req.params.trainingId

  // リクエストボディから研修関連のデータを取得
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

  // categoryIdがCATEGORYテーブルに存在するかチェック
  const categoryCheckSql = `SELECT id FROM CATEGORY WHERE id = ?`

  connection.query(categoryCheckSql, [categoryId], (err, results) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.TRAINING.MASSAGE_001 })
    }

    // 指定されたcategoryIdが存在しない場合
    if (results.length === 0) {
      return sendResponse(res, 400, { message: MASSAGE.TRAINING.MASSAGE_004 })
    }

    // categoryIdが存在する場合
    // 研修データを更新するSQLクエリ
    const updateSql = `
    UPDATE TRAINING
    SET 
      name = ?,
      is_required = ?,
      category_id = ?,
      indication_period = ?,
      indication_time = ?,
      media = ?,
      url = ?,
      test_url = ?,
      enquete_url = ?,
      test_result_url = ?,
      enquete_result_url = ?,
      passing_score = ?,
      best_score = ?
    WHERE id = ?
  `
    // SQLクエリを実行して研修データを更新
    connection.query(
      updateSql,
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
        trainingId, // WHERE句で使用する研修ID
      ],
      (err, result) => {
        // データベースエラーの処理
        if (err) {
          console.error('Database error: ', err)
          return sendResponse(res, 500, { message: MASSAGE.TRAINING.MASSAGE_001 })
        }

        // TRAINING_JOB_CATEGORY_VIEWABLEテーブルの既存のデータを取得するSQLクエリ
        const existingViewableSql = `SELECT job_category_id FROM TRAINING_JOB_CATEGORY_VIEWABLE WHERE training_id = ?`

        // SQLクエリを実行して既存の職種IDを取得
        connection.query(existingViewableSql, [trainingId], (err, existingJobCategories) => {
          if (err) {
            console.error('Database error: ', err)
            return sendResponse(res, 500, { message: MASSAGE.TRAINING.MASSAGE_001 })
          }

          // 取得した職種IDを配列に変換
          const existingJobCategoryIds = existingJobCategories.map((item) => item.job_category_id)

          // 新規追加すべき職種IDを特定
          const jobCategoriesToAdd = viewableJobCategoryIds.filter((id) => !existingJobCategoryIds.includes(id))

          // 削除すべき職種IDを特定
          const jobCategoriesToRemove = existingJobCategoryIds.filter((id) => !viewableJobCategoryIds.includes(id))

          // 新規追加する職種IDの処理
          jobCategoriesToAdd.forEach((jobCategoryId) => {
            const insertViewableSql = `INSERT INTO TRAINING_JOB_CATEGORY_VIEWABLE (training_id, job_category_id) VALUES (?, ?)`
            connection.query(insertViewableSql, [trainingId, jobCategoryId], (err, insertResult) => {
              if (err) {
                console.error('Database error: ', err)
                return sendResponse(res, 500, { message: MASSAGE.TRAINING.MASSAGE_001 })
              }
              // 追加成功した場合
            })
          })

          // 削除する職種IDの処理
          jobCategoriesToRemove.forEach((jobCategoryId) => {
            const deleteViewableSql = `DELETE FROM TRAINING_JOB_CATEGORY_VIEWABLE WHERE training_id = ? AND job_category_id = ?`
            connection.query(deleteViewableSql, [trainingId, jobCategoryId], (err, deleteResult) => {
              if (err) {
                console.error('Database error: ', err)
                return sendResponse(res, 500, { message: MASSAGE.TRAINING.MASSAGE_001 })
              }
              // 削除成功した場合
            })
          })

          // 最終的なレスポンスを返す
          sendResponse(res, 200, { message: MASSAGE.TRAINING.MASSAGE_005 })
        })
      }
    )
  })
}

module.exports = editTraining
