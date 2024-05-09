const express = require('express')
const router = express.Router()
const passport = require('../config/passport')// 引入 Passport，需要他幫忙做驗證
const upload = require('../middleware/multer')

const admin = require('./modules/admin')

const restController = require('../controllers/restaurant-controller')
const userController = require('../controllers/user-controller')
const commentController = require('../controllers/comment-controller')

const { authenticated, authenticatedAdmin } = require('../middleware/auth')// 引入 auth.js
const { generalErrorHandler } = require('../middleware/error-handler')

router.use('/admin', authenticatedAdmin, admin)
// 如果帶有 / admin 的路徑，就一律丟給後台專用的 admin 這個 module 去處理
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn) // 注意是 post
router.get('/logout', userController.logout)

// user
router.get('/users/top', authenticated, userController.getTopUsers)
router.get('/users/:id/edit', authenticated, userController.editUser)
router.get('/users/:id', authenticated, userController.getUser)
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)
router.post('/following/:userId', authenticated, userController.addFollowing)
router.delete('/following/:userId', authenticated, userController.removeFollowing)

// restaurants
router.get('/restaurants/feeds', authenticated, restController.getFeeds)
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)
router.get('/restaurants/:id', authenticated, restController.getRestaurant)
router.get('/restaurants', authenticated, restController.getRestaurants)

// Favorite
router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)

// like
router.post('/like/:restaurantId', authenticated, userController.addLike)
router.delete('/like/:restaurantId', authenticated, userController.removeLike)

// comments
router.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)
router.post('/comments', authenticated, commentController.postComment)
// 如果一個請求是走 GET /restaurants 進來，會需要先經過 auth.js 這支 middleware 進行身分驗證，通過才能呼叫 restController.getRestaurants 來顯示餐廳清單的主頁
// 如果接收到的請求路徑是 / restaurants，那就交給 controller 的getRestaurants
//  函式來處理。如果這行路由和請求匹配成功，以下的 router.get 就不會執行。
router.get('/', (req, res) => res.redirect('/restaurants'))// 設定 fallback 路由
router.use('/', generalErrorHandler)

module.exports = router
