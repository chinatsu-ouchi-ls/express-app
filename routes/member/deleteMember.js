const { connection } = require('../../aws/connection')
const sendResponse = require('../../common/responseHandler')
const MASSAGE = require('../../common/message')

const deleteMember = (req, res) => {
  const memberId = parseInt(req.params.memberId, 10)

  // memberId が数値でない、または NaN の場合、エラーを返す
  if (isNaN(memberId)) {
    return sendResponse(res, 400, { message: MASSAGE.MEMBER.MASSAGE_001 })
  }

  const sql = 'UPDATE MEMBER SET deleted_at = NOW() WHERE id = ?'

  connection.query(sql, [memberId], (err, result) => {
    if (err) {
      console.error('Database error: ', err)
      return sendResponse(res, 500, { message: MASSAGE.MEMBER.MASSAGE_002 })
    }
    if (result.affectedRows === 0) {
      return sendResponse(res, 401, { message: MASSAGE.MEMBER.MASSAGE_003 })
    }
    sendResponse(res, 200, { message: MASSAGE.MEMBER.MASSAGE_006 })
  })
}

module.exports = deleteMember
