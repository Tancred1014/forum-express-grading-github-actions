const adminServices = require('../../services/admin-services')
const { Restaurant, User, Category } = require('../../models')
const { session } = require('passport')

const adminController = {
  getRestaurants: (req, res, next) => {
    adminServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('admin/restaurants', data))
  }, // 收到 request 之後，回應一個渲染好的 create-restaurant 樣板 (新增一筆餐廳資料的頁面)。
  createRestaurant: (req, res, next) => {
    return Category.findAll({
      raw: true
    })
      .then(categories => res.render('admin/create-restaurant', { categories }))
      .catch(err => next(err))
  },
  postRestaurant: (req, res, next) => {
    adminServices.postRestaurant(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', 'restaurant was successfully created')
      req.session.createdData = data
      return res.redirect('/admin/restaurants')
    })
  },
  getRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id, { // 去資料庫用 id 找一筆資料
      raw: true, // 找到以後整理格式再回傳
      nest: true,
      include: [Category]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!") //  如果找不到，回傳錯誤訊息，後面不執行
        res.render('admin/restaurant', { restaurant })
      })
      .catch(err => next(err))
    //       呼叫了 Restaurant.findByPk，並且傳了 req.params.id 當作參數。Pk 是 primary key 的簡寫，也就是餐廳的 id，req.params.id 則是對應到路由傳過來的參數。
    // 需要加上 { raw: true } 參數，把從資料庫傳來的資料轉換成 JS 原生物件。
    //     如果餐廳不存在，就會拋出錯誤訊息，並終止執行此區塊的程式碼。這是 throwLinks to an external site.關鍵字的效果。
    //     找到餐廳之後，再把餐廳資料放在 restaurant 變數裡傳給 view，controller 的工作就完成了。
  },
  editRestaurant: (req, res, next) => {
    return Promise.all([ // 需要同時去「查詢 Restaurants table」 和「查詢 Categories table」，但這兩件事沒有先後順序，不需要互相等待，因此我們就可以用 Promise.all() 裡面的陣列，把這兩個程序都裝進去。查詢都回來以後，才會進入後面的 .then 把資料傳給樣板。
      Restaurant.findByPk(req.params.id, { raw: true }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurant, categories]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        res.render('admin/edit-restaurant', { restaurant, categories })
      })
      .catch(err => next(err))
    // 第一步先反查，先使用 findByPk ，檢查一下有沒有這間餐廳，如果沒有的話，直接拋出錯誤訊息。
    // 如果有的話，就前往 admin / edit - restaurant ，帶使用者到編輯的畫面。
  },
  putRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body
    if (!name) throw new Error('Restaurant name is required!')
    const { file } = req // 把檔案取出來
    Promise.all([ // 非同步處理
      Restaurant.findByPk(req.params.id), // 去資料庫查有沒有這間餐廳
      localFileHandler(file) // 把檔案傳到 file-helper 處理
    ])
      .then(([restaurant, filePath]) => { // 以上兩樣事都做完以後
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.update({ // 修改這筆資料
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || restaurant.image, // 如果 filePath 是 Truthy (使用者有上傳新照片) 就用 filePath，是 Falsy (使用者沒有上傳新照片) 就沿用原本資料庫內的值
          categoryId
        })
      })
      .then(() => {
        req.flash('success_messages', 'restaurant was successfully to update')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
    // 將 req.body 中傳入的資料用解構賦值的方法存起來
    // 檢查必填欄位 name 有資料
    // 我們在最開頭一樣有做 name 欄位的必填驗證。
    // 透過 Restaurant.findByPk(req.params.id) 把對應的該筆餐廳資料查出來，如果有成功查到，就透過 restaurant.update 來更新資料。
  },
  deleteRestaurant: (req, res, next) => {
    adminServices.deleteRestaurant(req, (err, data) => {
      if (err) return next(err)
      req.session.deletedData = data
      return res.redirect('/admin/restaurants')
    })
  },
  getUsers: (req, res, next) => {
    return User.findAll({
      raw: true,
      nest: true
    })
      .then(users => res.render('admin/users', { users }))
      .catch(err => next(err))
  },
  patchUser: (req, res, next) => {
    return User.findByPk(req.params.id)
      .then(user => {
        if (!user) throw new Error("User didn't exist!")
        if (user.email === 'root@example.com') {
          req.flash('error_messages', '禁止變更 root 權限')
          return res.redirect('back')
        }

        return user.update({ isAdmin: !user.isAdmin })
      })
      .then(() => {
        req.flash('success_messages', '使用者權限變更成功')
        res.redirect('/admin/users')
      })
      .catch(err => next(err))
  }

}
module.exports = adminController
