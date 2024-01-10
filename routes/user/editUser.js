const { connection } = require('../../aws/connection')
const sendResponse = require('../../common/responseHandler')
const MASSAGE = require('../../common/message')

const editUser = (req, res) => {
  const userId = req.params.userId
  const { name, mailAddress, password, deptId, jobCategoryId, enteringCompanyAt } = req.body

  // バリデーションチェック
  if (!name) {
    return sendResponse(res, 400, { message: MASSAGE.USER.MASSAGE_007 })
  }
  if (!mailAddress) {
    return sendResponse(res, 400, { message: MASSAGE.USER.MASSAGE_008 })
  }
  if (!password) {
    return sendResponse(res, 400, { message: MASSAGE.USER.MASSAGE_009 })
  }

  // SQLクエリの組み立て
  const sql = `
    UPDATE USER 
    SET
      name = ?, 
      mail_address = ?, 
      password = ?,
      dept_id = ?, 
      job_category_id = ?, 
      entering_company_at = ?
    WHERE id = ?
  `

  // クエリパラメータの設定
  const queryParams = [name, mailAddress, password, deptId, jobCategoryId, enteringCompanyAt, userId]

  // クエリの実行
  connection.query(sql, queryParams, (err, result) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.USER.MASSAGE_002 })
    }
    if (result.affectedRows === 0) {
      return sendResponse(res, 404, { message: MASSAGE.USER.MASSAGE_003 })
    }
    sendResponse(res, 200, { message: MASSAGE.USER.MASSAGE_010 })
  })
}

module.exports = editUser
