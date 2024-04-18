const { Restaurant, Category } = require('../models')
const restaurantController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({
      include: Category,
      // 用 Restaurant.findAll 從 Restaurant model 裡取出資料，並運用 include 一併拿出關聯的 Category model。
      nest: true,
      raw: true
    }).then(restaurants => {
      // 把餐廳敘述（description）截為 50 個字，避免在敘述文字過長時版面會亂掉，也可以為瀏覽器省下一些負擔。
      // 截取字串可以用 substring 來處理
      // 又因為 restaurants 是一個陣列，所以需要搭配 map 來處理，而 map 整理出來的新陣列，需要多設一個變數 data 來接住回傳值，所以最後我們要使用的資料放在 data 裡
      const data = restaurants.map(r => ({
        ...r,
        description: r.description.substring(0, 50)
      }))
      return res.render('restaurants', {
        restaurants: data
      })
    })
  },
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: Category, // 拿出關聯的 Category model
      nest: true,
      raw: true
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        res.render('restaurant', {
          restaurant
        })
      })
      .catch(err => next(err))
  }
}
// 加上負責處理瀏覽餐廳頁面的函式，我們將這個功能命名叫 getRestaurants
// restaurantController 是一個物件(object)。
// restaurantController 有不同的方法，例如 getRestaurants ，這個方法目前是負責「瀏覽餐廳頁面」，
// 也就是去 render 一個叫做 restaurants 的樣板。
module.exports = restaurantController
