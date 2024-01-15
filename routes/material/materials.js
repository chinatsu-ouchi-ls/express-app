const express = require('express')
const router = express.Router()

const getMaterials = require('./getMaterials')
const getMaterial = require('./getMaterial')

// 研修一覧の取得
router.get('/', getMaterials)

// 研修詳細の取得
router.get('/:materialId', getMaterial)

module.exports = router
