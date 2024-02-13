const { connection } = require('../../aws/connection')
const sendResponse = require('../../common/responseHandler')
const MASSAGE = require('../../common/message')
const formatDateToYYYYMMDD = require('../../common/formatDateToYYYYMMDD')

const getMembers = (req, res) => {
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
      MEMBER u
      LEFT JOIN DEPT d ON u.dept_id = d.id
      LEFT JOIN JOB_CATEGORY j ON u.job_category_id = j.id
    WHERE
      u.is_admin = 0 AND u.deleted_at IS NULL
  `

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.MEMBER.MASSAGE_002 })
    }

    // レスポンスをフォーマット
    const members = results.map((member) => ({
      id: member.id,
      name: member.name,
      password: member.password,
      mailAddress: member.mail_address,
      dept: {
        id: member.dept_id,
        name: member.dept_name,
      },
      jobCategory: {
        id: member.job_category_id,
        name: member.job_category_name,
      },
      enteringCompanyAt: formatDateToYYYYMMDD(member.entering_company_at),
    }))

    sendResponse(res, 200, { members })
  })
}

module.exports = getMembers
