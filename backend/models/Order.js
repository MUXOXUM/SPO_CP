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
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('new', 'processing', 'shipped', 'delivered', 'cancelled'),
        allowNull: false,
        defaultValue: 'new'
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

// Определяем ассоциации
Order.associate = (models) => {
    Order.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'customer'
    });
    Order.hasMany(models.OrderItem, {
        foreignKey: 'order_id',
        as: 'items'
    });
};

module.exports = Order; 