const express = require('express')
const router = express.Router()

const getTrainings = require('./getTrainings')
const getTraining = require('./getTraining')
const createTraining = require('./createTraining')
const editTraining = require('./editTraining')
const deleteTraining = require('./deleteTraining')

// 研修一覧の取得
router.get('/', getTrainings)

// 研修詳細の取得
router.get('/:trainingId', getTraining)

// 研修の追加
router.post('/', createTraining)

// 研修の編集
router.put('/:trainingId', editTraining)

// 研修の削除
router.delete('/:trainingId', deleteTraining)

module.exports = router
