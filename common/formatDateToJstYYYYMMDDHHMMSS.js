// 日時を 'YYYY/MM/DD HH:MM:SS' 形式に変換する関数（JST）
const formatDateToJstYYYYMMDDHHMMSS = (dateTimeString) => {
  if (!dateTimeString || dateTimeString === '') return null

  const date = new Date(dateTimeString)
  date.setHours(date.getHours() + 9) // UTCからJSTに変換（+9時間）

  const year = date.getFullYear()
  const month = ('0' + (date.getMonth() + 1)).slice(-2)
  const day = ('0' + date.getDate()).slice(-2)
  const hours = ('0' + date.getHours()).slice(-2)
  const minutes = ('0' + date.getMinutes()).slice(-2)
  const seconds = ('0' + date.getSeconds()).slice(-2)

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
}

module.exports = formatDateToJstYYYYMMDDHHMMSS
