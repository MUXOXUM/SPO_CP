const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Album = sequelize.define('Album', {
    album_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    release_year: {
        type: DataTypes.INTEGER
    },
    duration: {
        type: DataTypes.INTEGER // в секундах
    },
    label: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false
});

module.exports = Album; 