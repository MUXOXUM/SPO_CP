const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
    customer_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING
    },
    address: {
        type: DataTypes.TEXT
    },
    registration_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    loyalty_points: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: false
});

module.exports = Customer; 