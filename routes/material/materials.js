const express = require('express')
const router = express.Router()

const getMaterials = require('./getMaterials')

// 研修一覧の取得
router.get('/', getMaterials)

module.exports = router
