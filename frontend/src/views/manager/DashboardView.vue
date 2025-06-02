<template>
  <div class="dashboard">
    <h1>Дашборд</h1>
    
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Общая выручка</h3>
        <p class="stat-value">{{ formatPrice(stats.totalRevenue) }} ₽</p>
        <p class="stat-label">За последние 30 дней</p>
      </div>
      <div class="stat-card">
        <h3>Продано альбомов</h3>
        <p class="stat-value">{{ stats.totalSales }}</p>
        <p class="stat-label">За последние 30 дней</p>
      </div>
      <div class="stat-card">
        <h3>Новых заказов</h3>
        <p class="stat-value">{{ stats.newOrders }}</p>
        <p class="stat-label">За сегодня</p>
      </div>
      <div class="stat-card">
        <h3>Топ формат</h3>
        <p class="stat-value">{{ stats.topFormat }}</p>
        <p class="stat-label">По продажам</p>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-grid">
      <!-- Sales Timeline -->
      <div class="chart-card">
        <h3>Динамика продаж</h3>
        <Line
          v-if="salesChartData"
          :data="salesChartData"
          :options="salesChartOptions"
        />
      </div>

      <!-- Top Products -->
      <div class="chart-card">
        <h3>Топ продаваемых альбомов</h3>
        <Bar
          v-if="topProductsChartData"
          :data="topProductsChartData"
          :options="topProductsChartOptions"
        />
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
  totalRevenue: 0,
  totalSales: 0,
  newOrders: 0,
  topFormat: '-'
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
    const [statsResponse, salesResponse, topProductsResponse] = await Promise.all([
      axios.get('/api/manager/dashboard/stats'),
      axios.get('/api/manager/dashboard/sales'),
      axios.get('/api/manager/dashboard/top-products')
    ]);

    // Update stats
    stats.value = statsResponse.data;

    // Update sales timeline chart
    salesChartData.value = {
      labels: salesResponse.data.map(item => item.date),
      datasets: [{
        label: 'Продажи',
        data: salesResponse.data.map(item => item.amount),
        borderColor: '#2e7d32',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };

    // Update top products chart
    topProductsChartData.value = {
      labels: topProductsResponse.data.map(item => item.title),
      datasets: [{
        label: 'Продажи',
        data: topProductsResponse.data.map(item => item.sales),
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
  return new Intl.NumberFormat('ru-RU').format(price);
};

// Fetch data on component mount
onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #2e7d32;
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  color: #666;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #2e7d32;
  margin: 0.5rem 0;
}

.stat-label {
  color: #999;
  font-size: 0.9rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 1.5rem;
}

.chart-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  color: #666;
  font-size: 1rem;
  margin-bottom: 1rem;
}

/* Make charts responsive */
.chart-card {
  position: relative;
  height: 400px;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}
</style> 