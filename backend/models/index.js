const Genre = require('./Genre');
const Artist = require('./Artist');
const Album = require('./Album');
const Product = require('./Product');
const Customer = require('./Customer');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Review = require('./Review');
const Employee = require('./Employee');
const Supplier = require('./Supplier');
const Purchase = require('./Purchase');
const PurchaseItem = require('./PurchaseItem');
const User = require('./User');

// Связи для User и Customer
User.hasOne(Customer, { foreignKey: 'user_id' });
Customer.belongsTo(User, { foreignKey: 'user_id' });

// Связи для Artist
Artist.belongsTo(Genre, { foreignKey: 'genre_id' });
Genre.hasMany(Artist, { foreignKey: 'genre_id' });

// Связи для Album
Album.belongsTo(Artist, { foreignKey: 'artist_id' });
Artist.hasMany(Album, { foreignKey: 'artist_id' });
Album.belongsTo(Genre, { foreignKey: 'genre_id' });
Genre.hasMany(Album, { foreignKey: 'genre_id' });

// Связи для Product
Product.belongsTo(Album, { foreignKey: 'album_id' });
Album.hasMany(Product, { foreignKey: 'album_id' });

// Связи для Order
Order.belongsTo(Customer, { foreignKey: 'customer_id' });
Customer.hasMany(Order, { foreignKey: 'customer_id' });

// Связи для OrderItem
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(OrderItem, { foreignKey: 'product_id' });

// Связи для Review
Review.belongsTo(Customer, { foreignKey: 'customer_id' });
Customer.hasMany(Review, { foreignKey: 'customer_id' });
Review.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(Review, { foreignKey: 'product_id' });

// Связи для Purchase
Purchase.belongsTo(Supplier, { foreignKey: 'supplier_id' });
Supplier.hasMany(Purchase, { foreignKey: 'supplier_id' });
Purchase.belongsTo(Employee, { foreignKey: 'employee_id' });
Employee.hasMany(Purchase, { foreignKey: 'employee_id' });

// Связи для PurchaseItem
PurchaseItem.belongsTo(Purchase, { foreignKey: 'purchase_id' });
Purchase.hasMany(PurchaseItem, { foreignKey: 'purchase_id' });
PurchaseItem.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(PurchaseItem, { foreignKey: 'product_id' });

module.exports = {
    Genre,
    Artist,
    Album,
    Product,
    Customer,
    Order,
    OrderItem,
    Review,
    Employee,
    Supplier,
    Purchase,
    PurchaseItem,
    User
}; 