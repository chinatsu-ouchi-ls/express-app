const { connection } = require('../../aws/connection')
const sendResponse = require('../../common/responseHandler')
const MASSAGE = require('../../common/message')

const getUsers = (req, res) => {
  const sql = 'SELECT * FROM USER'
  connection.query(sql, (err, result) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.USER.MASSAGE_002 })
    }
    sendResponse(res, 200, { users: result })
  })
}

module.exports = getUsers
