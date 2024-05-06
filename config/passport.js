const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const { User, Restaurant } = require('../models')
// set up Passport strategy
passport.use(new LocalStrategy(
  // customize user field
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  // authenticate user
  (req, email, password, cb) => {
    User.findOne({ where: { email } })
      .then(user => {
        if (!user) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))
        bcrypt.compare(password, user.password).then(res => {
          if (!res) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))
          return cb(null, user)
        })
      })
  }
))
// serialize and deserialize user
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
passport.deserializeUser((id, cb) => {
  return User.findByPk(id, {
    include: [
      { model: Restaurant, as: 'FavoritedRestaurants' },
      { model: Restaurant, as: 'LikedRestaurants' },
      { model: User, as: 'Followers' },
      { model: User, as: 'Followings' }
      // 注意在 include 的時候有追加 as: 'FavoritedRestaurants'
      // 這時候我們用 as 來標明我們想要引入的關係，而這個 as 會對應到我們剛剛在 model 裡設定的別名
    ]
  })
    .then(user => cb(null, user.toJSON()))
    .catch(err => cb(err))
})
module.exports = passport
