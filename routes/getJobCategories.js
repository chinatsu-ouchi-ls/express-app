const express = require('express')
const { connection } = require('../aws/connection')
const sendResponse = require('../common/responseHandler')
const MASSAGE = require('../common/message')
const router = express.Router()

router.get('/', (req, res) => {
  const sql = 'SELECT id, name FROM JOB_CATEGORY ORDER BY id'

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.JOB_CATEGORY.MASSAGE_001 })
    }
    sendResponse(res, 200, { jobCategories: results })
  })
})

module.exports = router
