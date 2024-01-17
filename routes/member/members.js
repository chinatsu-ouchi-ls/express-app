const express = require('express')
const router = express.Router()

const getMembers = require('./getMembers')
const getMember = require('./getMember')
const getMemberTrainings = require('./getMemberTrainings')
const getMemberTraining = require('./getMemberTraining')
const deleteMember = require('./deleteMember')
const createMember = require('./createMember')
const editMember = require('./editMember')

// メンバー一覧の取得
router.get('/', getMembers)

// メンバー詳細の取得
router.get('/:memberId', getMember)

// メンバーに割り当てられた研修の一覧を取得
router.get('/:memberId/trainings', getMemberTrainings)

// メンバーIDと研修IDに基づいて、特定の研修の詳細情報を取得
router.get('/:memberId/trainings/:trainingId', getMemberTraining)

// メンバー削除
router.delete('/:memberId', deleteMember)

// メンバー新規作成
router.post('/', createMember)

// メンバー編集
router.put('/:memberId', editMember)

module.exports = router
