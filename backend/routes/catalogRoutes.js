const express = require('express');
const router = express.Router();
const { 
    getAlbums, 
    getAlbumDetails, 
    getFormats,
    addAlbum,
    updateAlbum,
    deleteAlbum
} = require('../controllers/catalogController');

// Получение списка альбомов
router.get('/albums', getAlbums);

// Получение деталей альбома
router.get('/albums/:id', getAlbumDetails);

// Получение списка форматов
router.get('/formats', getFormats);

// Добавление нового альбома
router.post('/albums', addAlbum);

// Обновление альбома
router.put('/albums/:id', updateAlbum);

// Удаление альбома
router.delete('/albums/:id', deleteAlbum);

module.exports = router; 