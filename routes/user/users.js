const express = require('express')
const router = express.Router()

const getUsers = require('./getUsers')
const getUser = require('./getUser')
const getUserTrainings = require('./getUserTrainings')
const getUserTraining = require('./getUserTraining')
const deleteUser = require('./deleteUser')
const createUser = require('./createUser')
const editUser = require('./editUser')

// ユーザー一覧の取得
router.get('/', getUsers)

// ユーザー詳細の取得
router.get('/:userId', getUser)

// ユーザーに割り当てられた研修の一覧を取得
router.get('/:userId/trainings', getUserTrainings)

// ユーザーIDと研修IDに基づいて、特定の研修の詳細情報を取得
router.get('/:userId/trainings/:trainingId', getUserTraining)

// ユーザー削除
router.delete('/:userId', deleteUser)

// ユーザー新規作成
router.post('/', createUser)

// ユーザー編集
router.put('/:userId', editUser)

module.exports = router
