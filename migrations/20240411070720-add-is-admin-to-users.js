'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'is_admin', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'is_admin')
  }
}
// 這是因為我們用了 Sequelize 提供的方法Links to an external site.queryInterface.addColumn() 直接來操作資料庫：

// 第一個參數是要操作的資料表(table)：需要一個字串來指定，這裡我們給 Users
// 第二個參數是要新增的欄位名稱 （column name)：需要一個字串來指定欄位，這裡我們給 is_admin
// 第三個參數是定義這個欄位的屬性(attribute)：需要一個物件來設定，這裡我們寫 { type: Sequelize.BOOLEAN, defaultValue: false } ，指定資料型態是布林值、預設情況是 false
// 第四個參數不是必須的，可以根據需求來加更多設定選項，例如官網範例是設定 after: 'columnB' ，指定了現在新增的這個欄位要排在 columnB 後面。
