const { Category } = require('../models')
const categoryController = {
  getCategories: (req, res, next) => {
    return Promise.all([
      Category.findAll({ raw: true }),
      req.params.id ? Category.findByPk(req.params.id, { raw: true }) : null
      // 檢查 req.params.id 這個變數是否存在
      // 如果存在，在資料庫查詢階段，除了全部類別資料外，還需要撈出這個 id 對應的那一筆資料
      // 如果不存在，那也不需要 category 變數，直接存成空值即可。
    ])
      .then(([categories, category]) => res.render('admin/categories', {
        categories,
        category
      }))
      .catch(err => next(err))
  },
  postCategory: (req, res, next) => {
    const { name } = req.body
    if (!name) throw new Error('Category name is required!')
    return Category.create({ name })
      .then(() => res.redirect('/admin/categories'))
      .catch(err => next(err))
    // 這個方法先檢查 name 是否為空，如果是空的話就回傳錯誤訊息，否則就建立一個新的分類並且導回瀏覽分類頁面。
  },
  putCategory: (req, res, next) => {
    const { name } = req.body
    if (!name) throw new Error('Category name is required!')
    return Category.findByPk(req.params.id)
      .then(category => {
        if (!category) throw new Error('Category name is required!')
        return category.update({ name })
      })
      .then(() => res.redirect('/admin/categories'))
      .catch(err => next(err))
  },
  deleteCategory: (req, res, next) => {
    return Category.findByPk(req.params.id)
      .then(category => {
        if (!category) throw new Error("Category didn't exist!") // 反查，確認要刪除的類別存在，再進行下面刪除動作
        return category.destroy()
      })
      .then(() => res.redirect('/admin/categories'))
      .catch(err => next(err))
  }
}
module.exports = categoryController
// 建立一個獨立的 category - controller 來管理分類的 CRUD，並且加入第一個 controller action getCategories。這個 action 是負責顯示分類列表，也就是運用 Category.findAll 查出所有資料後，將資料放在 categories 變數裡傳遞給 admin / categories 樣板
