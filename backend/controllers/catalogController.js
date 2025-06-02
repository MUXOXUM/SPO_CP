const { Album, Artist, Genre, Product } = require('../models');
const { Op } = require('sequelize');

// Получение списка всех альбомов с фильтрацией
const getAlbums = async (req, res) => {
    try {
        const albums = await Album.findAll({
            attributes: [
                ['album_id', 'id'],
                'title',
                'release_year',
                'duration',
                'label'
            ],
            include: [
                {
                    model: Artist,
                    attributes: ['name'],
                    required: true
                },
                {
                    model: Genre,
                    attributes: ['name'],
                    required: true
                },
                {
                    model: Product,
                    attributes: [
                        'format',
                        'price',
                        ['stock_quantity', 'inStock']
                    ],
                    required: false
                }
            ],
            raw: true,
            nest: true
        });

        // Преобразуем данные в формат, ожидаемый фронтендом
        const formattedAlbums = albums.map(album => ({
            id: album.id,
            title: album.title,
            artist: album.Artist.name,
            formatId: album.Product?.format || 'CD', // По умолчанию CD если нет продукта
            price: parseFloat(album.Product?.price) || 0,
            inStock: parseInt(album.Product?.inStock) || 0,
            releaseYear: album.release_year,
            duration: album.duration,
            label: album.label,
            genre: album.Genre.name,
            coverImage: null // TODO: Добавить поддержку изображений
        }));

        console.log('Sending albums:', formattedAlbums);
        res.json(formattedAlbums);
    } catch (error) {
        console.error('Error in getAlbums:', error);
        res.status(500).json({ error: error.message });
    }
};

// Получение списка всех форматов
const getFormats = async (req, res) => {
    try {
        const formats = await Product.findAll({
            attributes: ['format'],
            group: ['format'],
            raw: true
        });
        
        // Преобразуем в формат, ожидаемый фронтендом
        const formattedFormats = formats
            .filter(f => f.format)
            .map(f => ({
                id: f.format,
                name: f.format
            }));
        
        console.log('Sending formats:', formattedFormats);
        res.json(formattedFormats);
    } catch (error) {
        console.error('Error in getFormats:', error);
        res.status(500).json({ error: error.message });
    }
};

// Получение детальной информации об альбоме
const getAlbumDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const album = await Album.findByPk(id, {
            include: [
                {
                    model: Artist,
                    attributes: ['name'],
                    required: true
                },
                {
                    model: Genre,
                    attributes: ['name'],
                    required: true
                },
                {
                    model: Product,
                    attributes: [
                        'format',
                        'price',
                        ['stock_quantity', 'inStock']
                    ],
                    required: false
                }
            ],
            raw: true,
            nest: true
        });

        if (!album) {
            return res.status(404).json({ error: 'Album not found' });
        }

        // Преобразуем в формат, ожидаемый фронтендом
        const formattedAlbum = {
            id: album.album_id,
            title: album.title,
            artist: album.Artist.name,
            formatId: album.Product?.format || 'CD',
            price: parseFloat(album.Product?.price) || 0,
            inStock: parseInt(album.Product?.inStock) || 0,
            releaseYear: album.release_year,
            duration: album.duration,
            label: album.label,
            genre: album.Genre.name,
            coverImage: null
        };

        console.log('Sending album details:', formattedAlbum);
        res.json(formattedAlbum);
    } catch (error) {
        console.error('Error in getAlbumDetails:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAlbums,
    getAlbumDetails,
    getFormats
}; 