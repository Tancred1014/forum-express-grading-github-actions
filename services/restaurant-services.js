const { Restaurant, Category } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const restaurantServices = {
  getRestaurants: (req, cb) => {
    const DEFAULT_LIMIT = 9
    const categoryId = Number(req.query.categoryId) || ''
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)
    Promise.all([
      Restaurant.findAndCountAll({
        include: Category,
        where: {
          ...categoryId ? { categoryId } : {}
          // 檢查 categoryId 是否為空值
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
        const favoritedRestaurantsId = req.user?.FavoritedRestaurants ? req.user.FavoritedRestaurants.map(fr => fr.id) : []
        const likedRestaurantsId = req.user?.LikedRestaurants ? req.user.LikedRestaurants.map(lr => lr.id) : []
        // 外面這個迭代器 restaurants.rows.map(r => ...) 每一次把一家餐廳取出來時，都會觸發 req.user.FavoritedRestaurants.map(fr => fr.id) 重新執行一次，這其實沒有必要，可以往前提取出來
        const data = restaurants.rows.map(r => ({
          ...r,
          description: r.description.substring(0, 50),
          isFavorited: favoritedRestaurantsId.includes(r.id),
          isLiked: likedRestaurantsId.includes(r.id)
          // 我們在 data 裡加入一個 isFavorited 屬性。
          // req.user && req.user.favoritedRestaurantsId 這行的目的是要取出使用者的收藏清單，然後 map 成 id 清單，之後用 Array 的 includesLinks to an external site.方法進行比對，最後會回傳布林值。不過因為 req.user 有可能是空的，謹慎起見我們要寫成 req.user && req.user.FavoritedRestaurants...先做檢查。
          // 整段程式碼的意思就是說要來看看現在這間餐廳是不是有被使用者收藏，有的話 isFavorited 就會是 true，否則會是 false。
          // 因此後面 Handlebars 在處理資料時，每筆餐廳物件上就有一個 isFavorited 屬性，讓 Handlebars 可以用 if/else 去判斷要渲染哪一個按鈕。
        }))
        return cb(null, {
          restaurants: data,
          categories,
          categoryId,
          pagination: getPagination(limit, page, restaurants.count)
        })
      })
      .catch(err => cb(err))
  }
}
module.exports = restaurantServices
