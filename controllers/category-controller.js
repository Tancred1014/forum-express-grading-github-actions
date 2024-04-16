const { Category } = require('../models')
const categoryController = {
  getCategories: (req, res, next) => {
    return Category.findAll({
      raw: true
    })
      .then(categories => res.render('admin/categories', { categories }))
      .catch(err => next(err))
  }
}
module.exports = categoryController
// 建立一個獨立的 category - controller 來管理分類的 CRUD，並且加入第一個 controller action getCategories。這個 action 是負責顯示分類列表，也就是運用 Category.findAll 查出所有資料後，將資料放在 categories 變數裡傳遞給 admin / categories 樣板
