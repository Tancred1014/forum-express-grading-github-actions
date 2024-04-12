const restaurantController = {
  getRestaurants: (req, res) => {
    return res.render('restaurants')
  }
}
// 加上負責處理瀏覽餐廳頁面的函式，我們將這個功能命名叫 getRestaurants
// restaurantController 是一個物件(object)。
// restaurantController 有不同的方法，例如 getRestaurants ，這個方法目前是負責「瀏覽餐廳頁面」，
// 也就是去 render 一個叫做 restaurants 的樣板。
module.exports = restaurantController
