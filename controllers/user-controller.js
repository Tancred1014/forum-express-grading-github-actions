const bcrypt = require('bcryptjs') // 載入 bcrypt
const db = require('../models')
const { User } = db
const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => { // 修改這裡
    // 如果兩次輸入的密碼不同，就建立一個 Error 物件並拋出
    if (req.body.password !== req.body.passwordCheck) throw new Error('Passwords do not match!')

    // 確認資料裡面沒有一樣的 email，若有，就建立一個 Error 物件並拋出
    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('Email already exists!')
        return bcrypt.hash(req.body.password, 10) // 前面加 return
      })
      .then(hash => User.create({ // 上面錯誤狀況都沒發生，就把使用者的資料寫入資料庫
        name: req.body.name,
        email: req.body.email,
        password: hash
      }))
      .then(() => {
        req.flash('success_messages', '成功註冊帳號！') // 並顯示成功訊息
        res.redirect('/signin')
      })
      .catch(err => next(err)) // 接住前面拋出的錯誤，呼叫專門做錯誤處理的 middleware
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  }
}
module.exports = userController
// signUpPage：負責 render 註冊的頁面
// signUp：負責實際處理註冊的行為，包括：
// 收到註冊請求時，這個請求裡會攜帶表單資料
// 透過 bcrypt 使用雜湊演算法，把使用者密碼轉成暗碼，再存入資料庫裡面。hash() 函式接受兩個參數：
// 第一個參數：一個需要被加密的字串，這裡我們帶入使用者輸入的密碼 req.body.password
// 第二個參數：可以指定要加的鹽或複雜度係數。這裡我們設定為複雜度係數為 10
// 呼叫 User.create 建立一個新的 User
// 把 User 的屬性 name 以及 email 設置成用戶端傳來的資料，密碼則是保存了剛剛 bcrypt 處理過後的暗碼
// 確認成功建立新的 User 以後，重新導向回 signin 頁面
