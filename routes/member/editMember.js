const { connection } = require('../../aws/connection')
const sendResponse = require('../../common/responseHandler')
const MASSAGE = require('../../common/message')

const checkOtherMailExists = (memberId, mailAddress) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT id FROM MEMBER WHERE id != ? AND mail_address = ? AND deleted_at IS NULL`
    connection.query(sql, [memberId, mailAddress], (err, results) => {
      if (err) {
        reject(new Error(MASSAGE.MEMBER.MASSAGE_002))
      } else {
        resolve(results.length > 0)
      }
    })
  })
}

const checkDeptExists = (deptId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id FROM DEPT WHERE id = ?'
    connection.query(sql, [deptId], (err, results) => {
      if (err) return reject(new Error(MASSAGE.MEMBER.MASSAGE_002))
      resolve(results.length > 0)
    })
  })
}

const checkJobCategoryExists = (jobCategoryId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id FROM JOB_CATEGORY WHERE id = ?'
    connection.query(sql, [jobCategoryId], (err, results) => {
      if (err) return reject(new Error(MASSAGE.MEMBER.MASSAGE_002))
      resolve(results.length > 0)
    })
  })
}

const checkDeptJobCategoryCombinationExists = (deptId, jobCategoryId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id FROM DEPT_JOB_CATEGORY_MASTER WHERE dept_id = ? AND job_category_id = ?'
    connection.query(sql, [deptId, jobCategoryId], (err, results) => {
      if (err) reject(new Error(MASSAGE.MEMBER.MASSAGE_002))
      resolve(results.length > 0)
    })
  })
}

const editMemberInDb = (memberId, name, mailAddress, password, deptId, jobCategoryId, enteringCompanyAt) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE MEMBER 
      SET
        name = ?, 
        mail_address = ?, 
        password = ?,
        dept_id = ?, 
        job_category_id = ?, 
        entering_company_at = ?
      WHERE id = ?
    `
    connection.query(
      sql,
      [name, mailAddress, password, deptId, jobCategoryId, enteringCompanyAt, memberId],
      (err, result) => {
        if (err) {
          reject(new Error(MASSAGE.MEMBER.MASSAGE_002))
        } else {
          resolve(result)
        }
      }
    )
  })
}

const editMember = (req, res) => {
  const memberId = req.params.memberId
  const { name, mailAddress, password, deptId, jobCategoryId, enteringCompanyAt } = req.body

  // バリデーションチェック
  if (!name) {
    return sendResponse(res, 400, { message: MASSAGE.MEMBER.MASSAGE_007 })
  }
  if (!mailAddress) {
    return sendResponse(res, 400, { message: MASSAGE.MEMBER.MASSAGE_008 })
  }
  if (!password) {
    return sendResponse(res, 400, { message: MASSAGE.MEMBER.MASSAGE_009 })
  }

  checkOtherMailExists(memberId, mailAddress)
    .then((mailExists) => {
      if (mailExists) {
        throw new Error(MASSAGE.MEMBER.MASSAGE_014)
      }
      return checkDeptExists(deptId)
    })
    .then((deptExists) => {
      if (!deptExists) {
        throw new Error(MASSAGE.MEMBER.MASSAGE_011)
      }
      return checkJobCategoryExists(jobCategoryId)
    })
    .then((jobCategoryExists) => {
      if (!jobCategoryExists) {
        throw new Error(MASSAGE.MEMBER.MASSAGE_012)
      }
      return checkDeptJobCategoryCombinationExists(deptId, jobCategoryId)
    })
    .then((combinationExists) => {
      if (!combinationExists) {
        throw new Error(MASSAGE.MEMBER.MASSAGE_013)
      }
      return editMemberInDb(memberId, name, mailAddress, password, deptId, jobCategoryId, enteringCompanyAt)
    })
    .then((result) => {
      if (result.affectedRows === 0) {
        throw new Error(MASSAGE.MEMBER.MASSAGE_003)
      }
      sendResponse(res, 200, { message: MASSAGE.MEMBER.MASSAGE_010 })
    })
    .catch((err) => {
      if (err.message === MASSAGE.MEMBER.MASSAGE_002) {
        console.error('Error: ', err)
        sendResponse(res, 500, { message: err.message })
      } else {
        sendResponse(res, 400, { message: err.message })
      }
    })
}

module.exports = editMember