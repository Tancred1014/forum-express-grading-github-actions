const { Restaurant, Category } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    const DEFAULT_LIMIT = 9

    const categoryId = Number(req.query.categoryId) || ''// 從網址上拿下來的參數是字串，先轉成 Number 再操作

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)

    return Promise.all([
      Restaurant.findAndCountAll({
        include: Category,
        // 用 Restaurant.findAll 從 Restaurant model 裡取出資料，並運用 include 一併拿出關聯的 Category model。
        where: {
          ...categoryId ? { categoryId } : {}// 檢查 categoryId 是否為空值
          //           ...categoryId ? { categoryId } : {} 這邊是比較精簡的寫法，如果想先寫慢一點，也可以這樣做：
          //           //...
          //           const where = {}
          // if(categoryId) where.categoryId = categoryId
          // Promise.all({
          //             Restaurant.findAll({
          //               include: Category,
          //               where: where,
          //               nest: true,
          //               raw: true
          //             }),
          //           //...
        },
        limit,
        offset,
        nest: true,
        raw: true
      }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurants, categories]) => {
        // 把餐廳敘述（description）截為 50 個字，避免在敘述文字過長時版面會亂掉，也可以為瀏覽器省下一些負擔。
        // 截取字串可以用 substring 來處理
        // 又因為 restaurants 是一個陣列，所以需要搭配 map 來處理，而 map 整理出來的新陣列，需要多設一個變數 data 來接住回傳值，所以最後我們要使用的資料放在 data 裡
        const data = restaurants.rows.map(r => ({
          ...r,
          description: r.description.substring(0, 50)
        }))
        return res.render('restaurants', {
          restaurants: data,
          categories,
          categoryId,
          pagination: getPagination(limit, page, restaurants.count)
        })
      })
      .catch(err => next(err))
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
