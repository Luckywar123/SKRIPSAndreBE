const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('inventorydb', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;
