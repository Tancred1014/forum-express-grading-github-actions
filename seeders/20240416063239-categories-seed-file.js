'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Categories',
      ['中式料理', '日本料理', '義大利料理', '墨西哥料理', '素食料理', '美式料理', '複合式料理']
        .map(item => {
          // 關於第二項參數，Sequelize 需要的是陣列，而我們放進去的是一個 map 函式，這個函式的回傳值仍然是一個陣列。
          return {
            name: item,
            created_at: new Date(),
            updated_at: new Date()
          }
        }
        ), {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Categories', {})
  }
}
// 資料表的名稱，我們要把資料放進 Categories table
// 要放進去的資料陣列，這個陣列我們會先用 map 語法來整理過，詳見下方說明。注意如果傳入的是空陣列 Sequelize 會報錯Links to an external site.。
// 第三和四個參數不是必填，因為目前沒有額外設定，所以講師傳了一個空物件 { }
