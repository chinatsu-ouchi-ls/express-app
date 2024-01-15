const express = require('express')
const router = express.Router()

const getMaterials = require('./getMaterials')
const getMaterial = require('./getMaterial')
const createMaterial = require('./createMaterial')
const editMaterial = require('./editMaterial')

// 研修一覧の取得
router.get('/', getMaterials)

// 研修詳細の取得
router.get('/:materialId', getMaterial)

// 研修の追加
router.post('/', createMaterial)

// 研修の編集
router.put('/:materialId', editMaterial)

module.exports = router
