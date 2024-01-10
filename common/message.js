const MASSAGE = {
  USER: {
    MASSAGE_001: '入力されたユーザーIDは無効です。正しいIDを入力してください。',
    MASSAGE_002: '内部サーバーエラーが発生しました。システムの問題により処理を完了できませんでした。',
    MASSAGE_003: '指定されたユーザーが見つかりません。入力された情報を再確認してください。',
    MASSAGE_004: '研修は見つかりませんでした。',
    MASSAGE_005: '無効なユーザーIDまたは研修IDです',
    MASSAGE_006: 'ユーザーが正常に削除されました。',
  },
  LOGIN: {
    MASSAGE_001: '内部サーバーエラーが発生しました。システムの問題により処理を完了できませんでした。',
    MASSAGE_002: 'メールアドレスが違います。',
    MASSAGE_003: 'パスワードが違います。',
    MASSAGE_004: 'メールアドレスとパスワードは必須です。',
    MASSAGE_005: '管理者はログインできません。',
    MASSAGE_006: 'アカウントIDとパスワードは必須です。',
    MASSAGE_007: '管理者以外はログインできません。',
    MASSAGE_008: 'アカウントIDが違います。',
    MASSAGE_009: 'ログインに成功しました。',
  },
  TEST: {
    MASSAGE_001: 'リクエストデータが無効です。',
    MASSAGE_002: 'テスト結果が正常に送信されました。',
    MASSAGE_003: '内部サーバーエラーが発生しました。システムの問題により処理を完了できませんでした。',
  },
  ENQUETE: {
    MASSAGE_001: 'リクエストデータが無効です。',
    MASSAGE_002: '内部サーバーエラーが発生しました。システムの問題により処理を完了できませんでした。',
    MASSAGE_003: 'アンケートはすでに実施されています。',
    MASSAGE_004: 'アンケート結果が正常に送信されました。',
  },
}

module.exports = MASSAGE
