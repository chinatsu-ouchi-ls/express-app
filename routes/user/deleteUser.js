const { connection } = require('../../aws/connection')
const sendResponse = require('../../common/responseHandler')
const MASSAGE = require('../../common/message')

const deleteUser = (req, res) => {
  const userId = req.params.userId

  const sql = 'UPDATE USER SET deleted_at = NOW() WHERE id = ?'

  connection.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.USER.MASSAGE_002 })
    }
    if (result.affectedRows === 0) {
      return sendResponse(res, 404, { message: MASSAGE.USER.MASSAGE_003 })
    }
    sendResponse(res, 200, { message: MASSAGE.USER.MASSAGE_006 })
  })
}

module.exports = deleteUser
