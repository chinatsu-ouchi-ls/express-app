const { connection } = require('../../aws/connection')
const sendResponse = require('../../common/responseHandler')
const MASSAGE = require('../../common/message')

const getUser = (req, res) => {
  const userId = req.params.userId

  // パラメーターの検証
  if (isNaN(userId) || userId < 1) {
    return sendResponse(res, 400, { message: MASSAGE.USER.MASSAGE_001 })
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
    FROM USER u 
    LEFT JOIN DEPT d ON u.dept_id = d.id 
    LEFT JOIN JOB_CATEGORY j ON u.job_category_id = j.id 
    WHERE u.id = ?`

  connection.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Database error: ', err) // サーバーログ
      return sendResponse(res, 500, { message: MASSAGE.USER.MASSAGE_002 })
    }

    if (result.length === 0) {
      return sendResponse(res, 404, { message: MASSAGE.USER.MASSAGE_003 })
    }

    const user = {
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
      enteringCompanyAt: result[0].entering_company_at,
    }

    sendResponse(res, 200, { user })
  })
}

module.exports = getUser
