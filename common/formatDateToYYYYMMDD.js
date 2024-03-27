// 日付を 'YYYY/MM/DD' 形式に変換する関数（JST）
const formatDateToYYYYMMDD = (dateString) => {
  if (!dateString || dateString === '') {
    return null
  }

  const date = new Date(dateString)

  const year = date.getFullYear()
  // getMonth() は0から始まるため、1を足す
  const month = ('0' + (date.getMonth() + 1)).slice(-2)
  const day = ('0' + date.getDate()).slice(-2)
  return `${year}/${month}/${day}`
}

module.exports = formatDateToYYYYMMDD
