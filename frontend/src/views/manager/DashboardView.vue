<template>
  <div class="dashboard">
    <div class="page-header">
      <div class="header-content">
        <h1>Дашборд</h1>
        <button @click="fetchDashboardData" class="refresh-btn" title="Обновить данные">
          <span class="material-icons">refresh</span>
        </button>
      </div>
    </div>
    
    <!-- Stats Cards -->
    <div class="dashboard-content">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">payments</span>
          </div>
          <div class="stat-info">
            <h3>Выручка за месяц</h3>
            <p class="stat-value">{{ formatPrice(stats.monthly_revenue) }} ₽</p>
            <p class="stat-label">За последние 30 дней</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">shopping_cart</span>
          </div>
          <div class="stat-info">
            <h3>Заказов за месяц</h3>
            <p class="stat-value">{{ stats.monthly_orders }}</p>
            <p class="stat-label">За последние 30 дней</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">group</span>
          </div>
          <div class="stat-info">
            <h3>Активных клиентов</h3>
            <p class="stat-value">{{ stats.total_customers }}</p>
            <p class="stat-label">Всего</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">inventory_2</span>
          </div>
          <div class="stat-info">
            <h3>Товары на складе</h3>
            <p class="stat-value">{{ stats.low_stock_products }}</p>
            <p class="stat-label">Заканчиваются (< 5 шт)</p>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-grid">
        <!-- Sales Timeline -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Динамика продаж</h3>
            <div class="chart-legend">
              <span class="legend-dot revenue-dot"></span>
              <span>Выручка</span>
              <span class="legend-dot orders-dot"></span>
              <span>Заказы</span>
            </div>
          </div>
          <div class="chart-container">
            <Line
              v-if="salesChartData"
              :data="salesChartData"
              :options="salesChartOptions"
            />
          </div>
        </div>

        <!-- Top Products -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Топ продаваемых товаров</h3>
            <div class="chart-legend">
              <span class="legend-dot"></span>
              <span>Количество продаж</span>
            </div>
          </div>
          <div class="chart-container">
            <Bar
              v-if="topProductsChartData"
              :data="topProductsChartData"
              :options="topProductsChartOptions"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Line, Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Stats data
const stats = ref({
  monthly_orders: 0,
  monthly_revenue: 0,
  total_customers: 0,
  low_stock_products: 0,
  average_rating: 0
});

// Chart data
const salesChartData = ref(null);
const topProductsChartData = ref(null);

// Chart options
const salesChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#e0e0e0'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
};

const topProductsChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: {
        color: '#e0e0e0'
      }
    },
    y: {
      grid: {
        display: false
      }
    }
  }
};

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    // Получаем общую статистику
    const statsResponse = await axios.get('/api/manager/dashboard/stats');
    stats.value = statsResponse.data;

    // Получаем данные по продажам
    const salesResponse = await axios.get('/api/manager/dashboard/sales');
    salesChartData.value = {
      labels: salesResponse.data.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
      }),
      datasets: [
        {
          label: 'Выручка',
          data: salesResponse.data.map(item => item.revenue),
          borderColor: '#2e7d32',
          backgroundColor: 'rgba(46, 125, 50, 0.1)',
          yAxisID: 'y',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Заказы',
          data: salesResponse.data.map(item => item.orders),
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          yAxisID: 'y1',
          fill: true,
          tension: 0.4
        }
      ]
    };

    // Обновляем опции для двух осей Y
    salesChartOptions.scales.y1 = {
      position: 'right',
      grid: {
        drawOnChartArea: false
      },
      beginAtZero: true
    };

    // Получаем топ продуктов
    const topProductsResponse = await axios.get('/api/manager/dashboard/top-products');
    topProductsChartData.value = {
      labels: topProductsResponse.data.map(item => `${item.format} #${item.product_id}`),
      datasets: [{
        label: 'Продажи',
        data: topProductsResponse.data.map(item => item.total_sold),
        backgroundColor: '#2e7d32',
        borderRadius: 4
      }]
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};

// Format price
const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU').format(price || 0);
};

// Fetch data on component mount
onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.dashboard {
  min-height: 100vh;
  font-family: 'Montserrat', sans-serif;
}

.page-header {
  background-color: white;
  padding: 1.5rem 0;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.page-header h1 {
  color: #2e7d32;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
}

.refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: none;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background-color: #f5f5f5;
  color: #2e7d32;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: #e8f5e9;
  color: #2e7d32;
}

.stat-icon .material-icons {
  font-size: 24px;
}

.stat-info {
  flex: 1;
}

.stat-card h3 {
  color: #666;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 600;
  color: #2e7d32;
  margin: 0;
  line-height: 1.2;
}

.stat-label {
  color: #999;
  font-size: 0.75rem;
  margin: 0.25rem 0 0 0;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 1.5rem;
}

.chart-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-header h3 {
  color: #333;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.chart-legend {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #666;
  font-size: 0.875rem;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #2e7d32;
}

.revenue-dot {
  background-color: #2e7d32;
}

.orders-dot {
  background-color: #1976d2;
}

.chart-container {
  height: 300px;
  position: relative;
}

@media (max-width: 768px) {
  .header-content,
  .dashboard-content {
    padding: 0 1rem;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-card {
    padding: 1rem;
  }

  .chart-container {
    height: 250px;
  }
}
</style> 