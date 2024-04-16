const { Category } = require('../models')
const categoryController = {
  getCategories: (req, res, next) => {
    return Category.findAll({
      raw: true
    })
      .then(categories => res.render('admin/categories', { categories }))
      .catch(err => next(err))
  },
  postCategory: (req, res, next) => {
    const { name } = req.body
    if (!name) throw new Error('Category name is required!')
    return Category.create({ name })
      .then(() => res.redirect('/admin/categories'))
      .catch(err => next(err))
    // 這個方法先檢查 name 是否為空，如果是空的話就回傳錯誤訊息，否則就建立一個新的分類並且導回瀏覽分類頁面。
  }
}
module.exports = categoryController
// 建立一個獨立的 category - controller 來管理分類的 CRUD，並且加入第一個 controller action getCategories。這個 action 是負責顯示分類列表，也就是運用 Category.findAll 查出所有資料後，將資料放在 categories 變數裡傳遞給 admin / categories 樣板
