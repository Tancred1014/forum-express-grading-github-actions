const restaurantServices = require('../../services/restaurant-services')
const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.json(data))
  }
}
module.exports = restaurantController
// 接著針對 getRestaurants 做修改，請參照下圖，主要是在 req 後追加一個參數，是一個 callback function，而 res 和 next 用不到可以刪除：

// https://assets-lighthouse.alphacamp.co/uploads/image/file/20106/pasted_image_0.png

// 從 controller 呼叫 service 時，傳入了一個 callback function，還沒有執行
// 在 service 整理完資料後，用 callback() 呼叫了函式，並且把資料傳入
// 函式執行時，controller 呼叫了 res.json，把資料轉為 JSON 格式傳出
