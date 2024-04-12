const getUser = req => {
  return req.user || null
}
const ensureAuthenticated = req => {
  return req.isAuthenticated()
}
module.exports = {
  getUser,
  ensureAuthenticated
}
// 這裡面其實就是把 req.user 再包裝成一支 getUser 函式並導出。注意到 return 這邊
// 最後面多了一個 || null，這個寫法和 req.user ? req.user : null 是等價的，意思是
// 若 req.user 存在就回傳 req.user，不存在的話函式就會回傳空值。
