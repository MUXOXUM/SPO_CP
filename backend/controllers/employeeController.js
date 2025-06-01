const { Employee, User } = require('../models');

// Получение списка всех сотрудников
const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.findAll({
            include: [{
                model: User,
                attributes: ['email', 'role', 'is_active']
            }]
        });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Добавление нового сотрудника
const addEmployee = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            position,
            email,
            phone,
            password
        } = req.body;

        // Создаем пользователя с ролью manager
        const user = await User.create({
            email,
            password,
            role: 'manager'
        });

        // Создаем профиль сотрудника
        const employee = await Employee.create({
            user_id: user.user_id,
            first_name,
            last_name,
            position,
            email,
            phone
        });

        res.status(201).json(employee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Обновление информации о сотруднике
const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            first_name,
            last_name,
            position,
            phone
        } = req.body;

        const employee = await Employee.findByPk(id);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        await employee.update({
            first_name,
            last_name,
            position,
            phone
        });

        res.json(employee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getAllEmployees,
    addEmployee,
    updateEmployee
}; 