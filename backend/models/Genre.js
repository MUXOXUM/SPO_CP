const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Genre = sequelize.define('Genre', {
    genre_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: false
});

module.exports = Genre; 