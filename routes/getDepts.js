const express = require('express')
const { connection } = require('../aws/connection')
const sendResponse = require('../common/responseHandler')
const MASSAGE = require('../common/message')
const router = express.Router()

router.get('/', (req, res) => {
  const sql = `
    SELECT 
      d.id AS deptId, 
      d.name AS deptName, 
      jc.id AS jobCategoryId, 
      jc.name AS jobCategoryName 
    FROM DEPT d
    LEFT JOIN DEPT_JOB_CATEGORY_MASTER djcm ON d.id = djcm.dept_id
    LEFT JOIN JOB_CATEGORY jc ON djcm.job_category_id = jc.id
    ORDER BY d.id, jc.id`

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.DEPT.MASSAGE_001 })
    }

    // 部門と職種を整理
    const depts = results.reduce((acc, row) => {
      let dept = acc.find((d) => d.id === row.deptId)
      if (!dept) {
        dept = { id: row.deptId, name: row.deptName, jobCategories: [] }
        acc.push(dept)
      }
      if (row.jobCategoryId) {
        dept.jobCategories.push({ id: row.jobCategoryId, name: row.jobCategoryName })
      }
      return acc
    }, [])

    sendResponse(res, 200, { depts })
  })
})

module.exports = router
