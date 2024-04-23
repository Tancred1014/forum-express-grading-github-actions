const { Comment, User, Restaurant } = require('../models')
const commentController = {
  postComment: (req, res, next) => {
    const { restaurantId, text } = req.body
    const userId = req.user.id
    if (!text) throw new Error('Comment text is required!')
    return Promise.all([
      User.findByPk(userId),
      Restaurant.findByPk(restaurantId)
    ])
      .then(([user, restaurant]) => {
        if (!user) throw new Error("User didn't exist!")
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return Comment.create({
          text,
          restaurantId,
          userId
        })
      })
      .then(() => {
        res.redirect(`/restaurants/${restaurantId}`)
      })
      .catch(err => next(err))
  }
}
module.exports = commentController
// 在 postComment 裡，最前面我們先從 req 中取出表單發送過來的 text、restaurantId 及 userId 資料。

// 接著，在把資料傳進資料庫之前，謹慎起見，我們會先做反查，確認我們要送出這筆評論的使用者跟餐廳資料都存在，才會往下進行 Comment.create 的動作，把表單提供的資料送到資料庫中的 Comments table 中儲存。
