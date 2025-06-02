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
        type: DataTypes.INTEGER,
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    label: {
        type: DataTypes.STRING,
        allowNull: false
    },
    artist_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    genre_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'Albums',
    timestamps: false
});

module.exports = Album; 