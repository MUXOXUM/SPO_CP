const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
    order_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'user_id'
        }
    },
    order_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
    },
    payment_method: {
        type: DataTypes.STRING
    },
    shipping_address: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'Orders',
    timestamps: false
});

module.exports = Order; 