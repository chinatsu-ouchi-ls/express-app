const { connection } = require('../../aws/connection')
const sendResponse = require('../../common/responseHandler')
const MASSAGE = require('../../common/message')
const formatDateToYYYYMMDD = require('../../common/formatDateToYYYYMMDD')

const getMember = (req, res) => {
  const memberId = parseInt(req.params.memberId, 10)

  // memberId が数値でない、または NaN の場合、エラーを返す
  if (isNaN(memberId)) {
    return sendResponse(res, 400, { message: MASSAGE.MEMBER.MASSAGE_001 })
  }

  const sql = `
    SELECT 
      u.id, 
      u.name,
      u.entering_company_at, 
      d.id AS 'dept.id', 
      d.name AS 'dept.name', 
      j.id AS 'jobCategory.id', 
      j.name AS 'jobCategory.name' 
    FROM MEMBER u 
    LEFT JOIN DEPT d ON u.dept_id = d.id 
    LEFT JOIN JOB_CATEGORY j ON u.job_category_id = j.id 
    WHERE u.id = ?`

  connection.query(sql, [memberId], (err, result) => {
    if (err) {
      console.error('Database error: ', err) // サーバーログ
      return sendResponse(res, 500, { message: MASSAGE.MEMBER.MASSAGE_002 })
    }

    if (result.length === 0) {
      return sendResponse(res, 401, { message: MASSAGE.MEMBER.MASSAGE_003 })
    }

    const member = {
      id: result[0].id,
      name: result[0].name,
      dept: {
        id: result[0]['dept.id'],
        name: result[0]['dept.name'],
      },
      jobCategory: {
        id: result[0]['jobCategory.id'],
        name: result[0]['jobCategory.name'],
      },
      enteringCompanyAt: formatDateToYYYYMMDD(result[0].entering_company_at),
    }

    sendResponse(res, 200, { member })
  })
}

module.exports = getMember
