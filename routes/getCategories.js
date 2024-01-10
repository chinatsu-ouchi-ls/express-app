const express = require('express')
const { connection } = require('../aws/connection')
const sendResponse = require('../common/responseHandler')
const MASSAGE = require('../common/message')
const router = express.Router()

router.get('/', (req, res) => {
  const sql = 'SELECT id, name FROM CATEGORY'

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.CATEGORY.MASSAGE_001 })
    }
    sendResponse(res, 200, { categories: results })
  })
})

module.exports = router
