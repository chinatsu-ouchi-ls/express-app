const { connection } = require('../../aws/connection')
const sendResponse = require('../../common/responseHandler')
const MASSAGE = require('../../common/message')

const createUser = (req, res) => {
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

  const sql = `
        INSERT INTO USER (name, mail_address, password, dept_id, job_category_id, entering_company_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `

  connection.query(sql, [name, mailAddress, password, deptId, jobCategoryId, enteringCompanyAt], (err, result) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.USER.MASSAGE_002 })
    }
    sendResponse(res, 200, { userId: result.insertId })
  })
}

module.exports = createUser
