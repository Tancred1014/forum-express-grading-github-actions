const { Restaurant, Category } = require('../models')
const adminServices = {
  getRestaurants: (req, cb) => {
    Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category] // 當你想要使用 model 的關聯資料時，需要透過 include 把關聯資料拉進來，關聯資料才會被拿到 findAll 的回傳值裡。
    })
      .then(restaurants => cb(null, { restaurants }))
      .catch(err => cb(err))
  }
}
module.exports = adminServices
