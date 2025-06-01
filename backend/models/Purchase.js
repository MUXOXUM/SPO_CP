const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Purchase = sequelize.define('Purchase', {
    purchase_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    purchase_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending'
    }
}, {
    timestamps: false
});

module.exports = Purchase; 