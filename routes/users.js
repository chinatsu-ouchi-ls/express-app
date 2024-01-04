const express = require('express')
const { connection } = require('../aws/connection')
const router = express.Router()

// 既存のユーザー取得のルート
router.get('/', (req, res, next) => {
  const sql = 'select * from USER'
  connection.query(sql, (err, result, fields) => {
    if (err) {
      next(err)
      return
    }
    res.send(result)
  })
})

// 新しいユーザーを追加するルート
// router.post('/', (req, res, next) => {
//   const { name } = req.body
//   const sql = 'INSERT INTO USER (name) VALUES (?)'

//   connection.query(sql, [name], (err, result) => {
//     if (err) {
//       next(err)
//       return
//     }
//     console.log(result)
//     res.send({ message: 'User added successfully', id: result.insertId })
//   })
// })

// ユーザー詳細の取得
router.get('/:userId', (req, res, next) => {
  const userId = req.params.userId
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
      next(err)
      return
    }
    if (result.length === 0) {
      res.status(404).send({ message: 'User not found' })
    } else {
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
        enteringCompanyAt: result[0].enteringCompanyAt,
      }
      res.send({ status: 200, user })
    }
  })
})

module.exports = router
