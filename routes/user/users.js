const express = require('express')
const router = express.Router()

const getUsers = require('./getUsers')
const getUser = require('./getUser')
const getUserMaterials = require('./getUserMaterials')
const getUserMaterial = require('./getUserMaterial')
const deleteUser = require('./deleteUser')

// ユーザー一覧の取得
router.get('/', getUsers)

// ユーザー詳細の取得
router.get('/:userId', getUser)

// ユーザーに割り当てられた研修の一覧を取得
router.get('/:userId/materials', getUserMaterials)

// ユーザーIDと研修IDに基づいて、特定の研修の詳細情報を取得
router.get('/:userId/materials/:materialId', getUserMaterial)

// ユーザー削除
router.delete('/:userId', deleteUser)


module.exports = router
