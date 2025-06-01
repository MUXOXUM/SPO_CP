const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const models = require('./models');
const authRoutes = require('./routes/authRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const orderRoutes = require('./routes/orderRoutes');
const managerRoutes = require('./routes/managerRoutes');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/manager', managerRoutes);

// Test database connection and sync models
const initializeDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        
        // Sync all models
        await sequelize.sync({ alter: true });
        console.log('Database synchronized');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Record Store API!' });
});

// Start server
app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    await initializeDatabase();
});
