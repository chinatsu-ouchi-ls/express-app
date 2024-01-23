const { connection } = require('../../aws/connection')
const sendResponse = require('../../common/responseHandler')
const MASSAGE = require('../../common/message')

const checkMailExists = (mailAddress) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT id FROM MEMBER WHERE mail_address = ? AND deleted_at IS NULL`
    connection.query(sql, [mailAddress], (err, results) => {
      if (err) {
        reject(new Error(MASSAGE.MEMBER.MASSAGE_002))
      } else {
        resolve(results.length > 0)
      }
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

const createMemberInDb = (name, mailAddress, password, deptId, jobCategoryId, enteringCompanyAt) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO MEMBER (name, mail_address, password, dept_id, job_category_id, entering_company_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    connection.query(sql, [name, mailAddress, password, deptId, jobCategoryId, enteringCompanyAt], (err, result) => {
      if (err) {
        reject(new Error(MASSAGE.MEMBER.MASSAGE_002))
      } else {
        resolve(result)
      }
    })
  })
}

const generateRandomPassword = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < 8; i++) {
    password += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return password
}

const createMember = (req, res) => {
  const { name, mailAddress, deptId, jobCategoryId, enteringCompanyAt } = req.body

  // バリデーションチェック
  if (!name) {
    return sendResponse(res, 400, { message: MASSAGE.MEMBER.MASSAGE_007 })
  }
  if (!mailAddress) {
    return sendResponse(res, 400, { message: MASSAGE.MEMBER.MASSAGE_008 })
  }

  const password = generateRandomPassword()

  checkMailExists(mailAddress)
    .then((mailExists) => {
      if (mailExists) {
        throw new Error(MASSAGE.MEMBER.MASSAGE_014)
      }
      return checkDeptJobCategoryCombinationExists(deptId, jobCategoryId)
    })
    .then((combinationExists) => {
      if (!combinationExists) {
        throw new Error(MASSAGE.MEMBER.MASSAGE_013)
      }
      return createMemberInDb(name, mailAddress, password, deptId, jobCategoryId, enteringCompanyAt)
    })
    .then((result) => {
      sendResponse(res, 200, { memberId: result.insertId })
    })
    .catch((err) => {
      if (err.message === MASSAGE.MEMBER.MASSAGE_002) {
        console.error('Error: ', err)
        sendResponse(res, 500, { message: err.message })
      } else {
        sendResponse(res, 401, { message: err.message })
      }
    })
}

module.exports = createMember
