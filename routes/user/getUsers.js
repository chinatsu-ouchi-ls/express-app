const { connection } = require('../../aws/connection')
const sendResponse = require('../../common/responseHandler')
const MASSAGE = require('../../common/message')

const getUsers = (req, res) => {
  const sql = `
    SELECT
      u.id,
      u.name,
      u.password,
      u.mail_address,
      u.entering_company_at,
      d.id as dept_id,
      d.name as dept_name,
      j.id as job_category_id,
      j.name as job_category_name
    FROM
      USER u
      LEFT JOIN DEPT d ON u.dept_id = d.id
      LEFT JOIN JOB_CATEGORY j ON u.job_category_id = j.id
    WHERE
      u.is_admin = 0 AND u.deleted_at IS NULL
  `

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.USER.MASSAGE_002 })
    }

    // レスポンスをフォーマット
    const users = results.map((user) => ({
      id: user.id,
      name: user.name,
      password: user.password,
      mailAddress: user.mail_address,
      dept: {
        id: user.dept_id,
        name: user.dept_name,
      },
      jobCategory: {
        id: user.job_category_id,
        name: user.job_category_name,
      },
      enteringCompanyAt: user.entering_company_at,
    }))

    sendResponse(res, 200, { users })
  })
}

module.exports = getUsers
