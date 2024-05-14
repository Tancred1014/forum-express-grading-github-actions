const { Restaurant, Category, Comment, User } = require('../../models')
const { getOffset, getPagination } = require('../../helpers/pagination-helper')

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
        const favoritedRestaurantsId = req.user && req.user.FavoritedRestaurants.map(fr => fr.id)
        const likedRestaurantsId = req.user && req.user.LikedRestaurants.map(fr => fr.id)
        // 外面這個迭代器 restaurants.rows.map(r => ...) 每一次把一家餐廳取出來時，都會觸發 req.user.FavoritedRestaurants.map(fr => fr.id) 重新執行一次，這其實沒有必要，可以往前提取出來
        const data = restaurants.rows.map(r => ({
          ...r,
          description: r.description.substring(0, 50),
          isFavorited: favoritedRestaurantsId.includes(r.id), // use Array includes method 比對
          isLike: likedRestaurantsId.includes(r.id)
          // 我們在 data 裡加入一個 isFavorited 屬性。
          // req.user && req.user.favoritedRestaurantsId 這行的目的是要取出使用者的收藏清單，然後 map 成 id 清單，之後用 Array 的 includesLinks to an external site.方法進行比對，最後會回傳布林值。不過因為 req.user 有可能是空的，謹慎起見我們要寫成 req.user && req.user.FavoritedRestaurants...先做檢查。
          // 整段程式碼的意思就是說要來看看現在這間餐廳是不是有被使用者收藏，有的話 isFavorited 就會是 true，否則會是 false。
          // 因此後面 Handlebars 在處理資料時，每筆餐廳物件上就有一個 isFavorited 屬性，讓 Handlebars 可以用 if/else 去判斷要渲染哪一個按鈕。
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
      include: [
        Category,
        { model: Comment, include: User },
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikeUsers' }
      ]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.increment('viewCount')
      })
      .then(restaurant => {
        const isFavorited = restaurant.FavoritedUsers.some(f => f.id === req.user.id)
        const isLike = restaurant.LikeUsers.some(l => l.id === req.user.id)
        //         這裡我們是使用 some 方法Links to an external site.來操作陣列。使用 some 的好處是只要帶迭代過程中找到一個符合條件的項目後，就會立刻回傳 true，後面的項目不會繼續執行。也就是說，假設這家餐廳有 100 個人收藏它，若迴圈執行到第二次就比對成功，發現 FavoritedUsers 的 id，和當前登入者 id 相同的話，後面就不會繼續執行。
        // 比起 map 方法Links to an external site.無論如何都會從頭到尾把陣列裡的項目執行一次，some 因為加入了判斷條件 f.id === req.user.id，可以有效減少執行次數。
        res.render('restaurant', {
          restaurant: restaurant.toJSON(),
          isFavorited,
          isLike
        })
      })
      .catch(err => next(err))
  },
  getDashboard: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: Category,
      nest: true,
      raw: true
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        res.render('dashboard', { restaurant })
      })
      .catch(err => next(err))
  },
  getFeeds: (req, res, next) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [Category],
        raw: true,
        nest: true
      }),
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant],
        raw: true,
        nest: true
      })
    ])
      .then(([restaurants, comments]) => {
        res.render('feeds', {
          restaurants,
          comments
        })
      })
      .catch(err => next(err))
  },

  getTopRestaurants: (req, res, next) => {
    return Restaurant
      .findAll({
        include: [{ model: User, as: 'FavoritedUsers' }]
      })
      .then(topRestaurants => {
        const restaurants = topRestaurants.map(r => ({
          ...r.toJSON(),
          description: r.description.length >= 150 ? r.description.substring(0, 147) + '...' : r.description,
          favoritedCount: r.FavoritedUsers.length,
          isFavorited: req.user && req.user.FavoritedRestaurants.some(fr => fr.id === r.id)
        }))
          .sort((a, b) => b.favoritedCount - a.favoritedCount)
          .slice(0, 10)

        res.render('top-restaurants', { restaurants })
      })
      .catch(err => next(err))
  }
}

module.exports = restaurantController
