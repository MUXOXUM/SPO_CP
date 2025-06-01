const { Album, Artist, Genre, Product, Review } = require('../models');
const { Op } = require('sequelize');

// Получение списка всех альбомов с фильтрацией
const getAlbums = async (req, res) => {
    try {
        const {
            genre,
            artist,
            year,
            search,
            page = 1,
            limit = 10
        } = req.query;

        const where = {};
        if (search) {
            where.title = { [Op.iLike]: `%${search}%` };
        }
        if (year) {
            where.release_year = year;
        }

        const include = [
            {
                model: Artist,
                where: artist ? { name: { [Op.iLike]: `%${artist}%` } } : undefined
            },
            {
                model: Genre,
                where: genre ? { name: genre } : undefined
            },
            {
                model: Product,
                attributes: ['format', 'price', 'stock_quantity']
            }
        ];

        const offset = (page - 1) * limit;

        const albums = await Album.findAndCountAll({
            where,
            include,
            limit,
            offset,
            distinct: true
        });

        res.json({
            total: albums.count,
            totalPages: Math.ceil(albums.count / limit),
            currentPage: page,
            albums: albums.rows
        });
    } catch (error) {
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
                    include: [Genre]
                },
                {
                    model: Genre
                },
                {
                    model: Product,
                    include: [
                        {
                            model: Review,
                            include: ['Customer']
                        }
                    ]
                }
            ]
        });

        if (!album) {
            return res.status(404).json({ error: 'Album not found' });
        }

        res.json(album);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Получение списка всех форматов
const getFormats = async (req, res) => {
    try {
        const formats = await Product.findAll({
            attributes: ['format'],
            group: ['format']
        });
        res.json(formats.map(f => f.format));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAlbums,
    getAlbumDetails,
    getFormats
}; 