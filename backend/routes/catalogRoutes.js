const express = require('express');
const router = express.Router();
const { getAlbums, getAlbumDetails, getFormats } = require('../controllers/catalogController');

// Получение списка альбомов
router.get('/albums', getAlbums);

// Получение деталей альбома
router.get('/albums/:id', getAlbumDetails);

// Получение списка форматов
router.get('/formats', getFormats);

module.exports = router; 