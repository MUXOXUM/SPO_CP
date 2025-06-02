const { User } = require('../models');

// Получение списка всех сотрудников
const getAllEmployees = async (req, res) => {
    try {
        const employees = await User.findAll({
            where: {
                role: ['manager', 'admin'],
                is_active: true
            },
            attributes: [
                'user_id',
                'email',
                'first_name',
                'last_name',
                'phone',
                'position',
                'hire_date',
                'salary',
                'role'
            ]
        });

        const formattedEmployees = employees.map(emp => ({
            id: emp.user_id,
            email: emp.email,
            firstName: emp.first_name,
            lastName: emp.last_name,
            phone: emp.phone,
            position: emp.position,
            hireDate: emp.hire_date,
            salary: parseFloat(emp.salary),
            role: emp.role
        }));

        res.json(formattedEmployees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Ошибка при получении списка сотрудников' });
    }
};

// Добавление нового сотрудника
const addEmployee = async (req, res) => {
    try {
        const {
            email,
            password,
            firstName,
            lastName,
            phone,
            position,
            salary,
            role
        } = req.body;

        // Проверяем, существует ли пользователь с таким email
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }

        // Проверяем роль
        if (!['manager', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Недопустимая роль' });
        }

        const employee = await User.create({
            email,
            password,
            first_name: firstName,
            last_name: lastName,
            phone,
            position,
            hire_date: new Date(),
            salary,
            role,
            is_active: true
        });

        res.status(201).json({
            id: employee.user_id,
            email: employee.email,
            firstName: employee.first_name,
            lastName: employee.last_name,
            phone: employee.phone,
            position: employee.position,
            hireDate: employee.hire_date,
            salary: parseFloat(employee.salary),
            role: employee.role
        });
    } catch (error) {
        console.error('Error adding employee:', error);
        res.status(500).json({ error: 'Ошибка при добавлении сотрудника' });
    }
};

// Обновление информации о сотруднике
const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            firstName,
            lastName,
            phone,
            position,
            salary,
            role,
            is_active
        } = req.body;

        const employee = await User.findOne({
            where: {
                user_id: id,
                role: ['manager', 'admin']
            }
        });

        if (!employee) {
            return res.status(404).json({ error: 'Сотрудник не найден' });
        }

        // Проверяем роль
        if (role && !['manager', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Недопустимая роль' });
        }

        await employee.update({
            first_name: firstName,
            last_name: lastName,
            phone,
            position,
            salary,
            role,
            is_active: is_active !== undefined ? is_active : employee.is_active
        });

        res.json({
            id: employee.user_id,
            email: employee.email,
            firstName: employee.first_name,
            lastName: employee.last_name,
            phone: employee.phone,
            position: employee.position,
            hireDate: employee.hire_date,
            salary: parseFloat(employee.salary),
            role: employee.role,
            isActive: employee.is_active
        });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ error: 'Ошибка при обновлении данных сотрудника' });
    }
};

module.exports = {
    getAllEmployees,
    addEmployee,
    updateEmployee
}; 