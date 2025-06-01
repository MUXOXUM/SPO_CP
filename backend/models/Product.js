const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    product_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    format: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    stock_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    barcode: {
        type: DataTypes.STRING,
        unique: true
    },
    condition: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false
});

module.exports = Product; 