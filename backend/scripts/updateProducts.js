const sequelize = require('../config/database');
const { Product } = require('../models');

const updateProducts = async () => {
    try {
        // Получаем все существующие продукты
        const products = await Product.findAll();

        // Обновляем каждый продукт
        for (const product of products) {
            // Генерируем название и исполнителя на основе формата
            const title = `${product.format} альбом ${product.product_id}`;
            const artist = `Исполнитель ${product.product_id}`;

            // Обновляем запись
            await product.update({
                title,
                artist
            });
        }

        console.log('Products updated successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error updating products:', error);
        process.exit(1);
    }
};

// Запускаем обновление
updateProducts(); 