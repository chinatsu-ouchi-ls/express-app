const sendResponse = (res, status, data) => {
  res.status(status).send({ status, ...data })
}

module.exports = sendResponse
