const { connection } = require('../../aws/connection')
const sendResponse = require('../../common/responseHandler')
const MASSAGE = require('../../common/message')

const deleteMember = (req, res) => {
  const memberId = req.params.memberId

  const sql = 'UPDATE MEMBER SET deleted_at = NOW() WHERE id = ?'

  connection.query(sql, [memberId], (err, result) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.MEMBER.MASSAGE_002 })
    }
    if (result.affectedRows === 0) {
      return sendResponse(res, 404, { message: MASSAGE.MEMBER.MASSAGE_003 })
    }
    sendResponse(res, 200, { message: MASSAGE.MEMBER.MASSAGE_006 })
  })
}

module.exports = deleteMember
