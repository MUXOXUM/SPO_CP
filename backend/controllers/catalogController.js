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
                        'stock_quantity'
                    ],
                    required: false,
                    where: {
                        // Если нужна фильтрация по формату
                        ...(req.query.format ? { format: req.query.format } : {})
                    }
                }
            ]
        });

        // Преобразуем данные в формат, ожидаемый фронтендом
        const formattedAlbums = albums.map(album => {
            // Находим продукт с наименьшей ценой для альбома
            const products = album.Products || [];
            const cheapestProduct = products.length > 0 
                ? products.reduce((min, p) => p.price < min.price ? p : min, products[0])
                : null;

            return {
                id: album.album_id,
                title: album.title,
                artist: album.Artist.name,
                formatId: cheapestProduct?.format || 'CD',
                price: cheapestProduct ? parseFloat(cheapestProduct.price) : 0,
                inStock: cheapestProduct ? parseInt(cheapestProduct.stock_quantity) : 0,
                releaseYear: album.release_year,
                duration: album.duration,
                label: album.label,
                genre: album.Genre.name,
                coverImage: null
            };
        });

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
                        'stock_quantity'
                    ],
                    required: false
                }
            ]
        });

        if (!album) {
            return res.status(404).json({ error: 'Album not found' });
        }

        // Находим продукт с наименьшей ценой
        const products = album.Products || [];
        const cheapestProduct = products.length > 0 
            ? products.reduce((min, p) => p.price < min.price ? p : min, products[0])
            : null;

        // Преобразуем в формат, ожидаемый фронтендом
        const formattedAlbum = {
            id: album.album_id,
            title: album.title,
            artist: album.Artist.name,
            formatId: cheapestProduct?.format || 'CD',
            price: cheapestProduct ? parseFloat(cheapestProduct.price) : 0,
            inStock: cheapestProduct ? parseInt(cheapestProduct.stock_quantity) : 0,
            releaseYear: album.release_year,
            duration: album.duration,
            label: album.label,
            genre: album.Genre.name,
            coverImage: null,
            // Добавляем информацию о всех доступных форматах
            availableFormats: products.map(p => ({
                format: p.format,
                price: parseFloat(p.price),
                inStock: parseInt(p.stock_quantity)
            }))
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