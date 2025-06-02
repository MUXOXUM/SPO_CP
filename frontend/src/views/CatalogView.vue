<template>
  <div class="catalog">
    <header class="catalog-header">
      <div class="header-content">
        <h1>Каталог музыкальных записей</h1>
        <div class="user-controls">
          <button @click="handleLogout" class="logout-btn">
            <span class="material-icons">logout</span>
            <span>Выйти</span>
          </button>
        </div>
      </div>
    </header>

    <div class="catalog-filters">
      <div class="search-container">
        <span class="material-icons search-icon">search</span>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Поиск по названию или исполнителю..."
          class="search-input"
        >
      </div>
      <div class="select-container">
        <select v-model="selectedFormat" class="format-select">
          <option value="">Все форматы</option>
          <option v-for="format in formats" :key="format.id" :value="format.id">
            {{ format.name }}
          </option>
        </select>
        <span class="material-icons select-icon">expand_more</span>
      </div>
    </div>

    <div v-if="filteredAlbums.length === 0" class="no-results">
      <span class="material-icons">album</span>
      <p>Альбомы не найдены</p>
    </div>

    <div v-else class="albums-grid">
      <div v-for="album in filteredAlbums" :key="album.id" class="album-card">
        <div class="album-image">
          <img 
            :src="getFormatIcon(album.formatId)" 
            :alt="getFormatName(album.formatId)"
            class="album-format-img"
          >
          <div class="album-overlay">
            <button @click="addToCart(album)" class="add-to-cart-btn">
              <span class="material-icons">shopping_cart</span>
              <span>В корзину</span>
            </button>
          </div>
        </div>
        <div class="album-info">
          <h3>{{ album.title }}</h3>
          <p class="artist">{{ album.artist }}</p>
          <div class="album-details">
            <p class="format" v-if="getFormatName(album.formatId)">
              {{ getFormatName(album.formatId) }}
            </p>
            <p class="price">{{ formatPrice(album.price) }} ₽</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import axios from 'axios';

const router = useRouter();
const authStore = useAuthStore();

const albums = ref([]);
const formats = ref([]);
const searchQuery = ref('');
const selectedFormat = ref('');

const filteredAlbums = computed(() => {
  return albums.value.filter(album => {
    const matchesSearch = album.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         album.artist.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesFormat = !selectedFormat.value || album.formatId === selectedFormat.value;
    return matchesSearch && matchesFormat;
  });
});

const getFormatName = (formatId) => {
  const format = formats.value.find(f => f.id === formatId);
  return format ? format.name : '';
};

const getFormatIcon = (formatId) => {
  const format = formats.value.find(f => f.id === formatId);
  if (!format) return '';
  
  const formatName = format.name.toLowerCase();
  
  switch (formatName) {
    case 'винил':
      return '/vinyl.png';
    case 'cd':
      return '/cd.png';
    case 'кассета':
      return '/vhs.png';
    case 'цифровая':
    case 'цифровой':
    case 'цифровая запись':
      return '/digit.png';
    default:
      return '';
  }
};

const fetchAlbums = async () => {
  try {
    const response = await axios.get('/api/catalog/albums');
    albums.value = response.data;
  } catch (error) {
    console.error('Error fetching albums:', error);
  }
};

const fetchFormats = async () => {
  try {
    const response = await axios.get('/api/catalog/formats');
    formats.value = response.data;
  } catch (error) {
    console.error('Error fetching formats:', error);
  }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU').format(price);
};

const addToCart = (album) => {
  // TODO: Implement cart functionality
  alert('Функция корзины будет добавлена позже');
};

const handleLogout = () => {
  authStore.logout();
  router.push('/auth');
};

onMounted(() => {
  fetchAlbums();
  fetchFormats();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.catalog {
  min-height: 100vh;
  font-family: 'Montserrat', sans-serif;
  background-color: #f8f9fa;
}

.catalog-header {
  background-color: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.catalog-header h1 {
  color: #2e7d32;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
}

.user-controls {
  display: flex;
  gap: 1rem;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: white;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  color: #666;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: #ffebee;
  border-color: #d32f2f;
  color: #d32f2f;
}

.catalog-filters {
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 0 2rem;
  display: flex;
  gap: 1rem;
}

.search-container {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.search-input:focus {
  outline: none;
  border-color: #2e7d32;
  box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.1);
}

.select-container {
  position: relative;
  width: 200px;
}

.format-select {
  width: 100%;
  padding: 0.875rem 2.5rem 0.875rem 1rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  appearance: none;
  background-color: white;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
}

.select-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  pointer-events: none;
}

.no-results {
  text-align: center;
  padding: 4rem 0;
  color: #666;
}

.no-results .material-icons {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #e0e0e0;
}

.albums-grid {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.album-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.album-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
}

.album-image {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.album-format-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 2rem;
  background-color: #f8f9fa;
}

.album-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.album-card:hover .album-image img {
  transform: scale(1.02);
}

.album-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.album-card:hover .album-overlay {
  opacity: 1;
}

.album-info {
  padding: 1.25rem;
}

.album-info h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist {
  color: #666;
  margin: 0.5rem 0;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.format {
  color: #666;
  font-size: 0.85rem;
  padding: 0.25rem 0.5rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin: 0;
}

.price {
  font-weight: 600;
  color: #2e7d32;
  margin: 0;
  font-size: 1.1rem;
}

.add-to-cart-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #2e7d32;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.add-to-cart-btn:hover {
  background-color: #1b5e20;
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .catalog-header {
    padding: 1rem;
  }

  .catalog-filters {
    flex-direction: column;
    padding: 0 1rem;
  }

  .select-container {
    width: 100%;
  }

  .albums-grid {
    padding: 0 1rem;
    gap: 1rem;
  }
}
</style> 