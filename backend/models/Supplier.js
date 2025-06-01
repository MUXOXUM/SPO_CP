const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Supplier = sequelize.define('Supplier', {
    supplier_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contact_person: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING
    },
    address: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: false
});

module.exports = Supplier; 