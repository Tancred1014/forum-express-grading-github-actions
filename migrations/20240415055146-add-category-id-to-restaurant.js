'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Restaurants', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Categories',
        key: 'id'
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Restaurants', 'category_id')
  }
}
// type: Sequelize.INTEGER - Category model 中生成的 id 是整數，所以這邊也要對應設為 INTEGER。
// allowNull: false - 不允許空值，也就是說餐廳類別是必填，否則無法寫入資料。
// references: { model: 'Categories', key: 'id' } - 明確指定在這筆 migration 生效時，需要一併把關聯設定起來。
