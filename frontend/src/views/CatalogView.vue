<template>
  <div class="catalog">
    <header class="catalog-header">
      <h1>Каталог музыкальных записей</h1>
      <div class="user-controls">
        <button @click="handleLogout" class="logout-btn">
          Выйти
        </button>
      </div>
    </header>

    <div class="catalog-filters">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Поиск по названию..."
        class="search-input"
      >
      <select v-model="selectedFormat" class="format-select">
        <option value="">Все форматы</option>
        <option v-for="format in formats" :key="format.id" :value="format.id">
          {{ format.name }}
        </option>
      </select>
    </div>

    <div class="albums-grid">
      <div v-for="album in filteredAlbums" :key="album.id" class="album-card">
        <div class="album-image">
          <img :src="album.coverImage || '/placeholder.jpg'" :alt="album.title">
        </div>
        <div class="album-info">
          <h3>{{ album.title }}</h3>
          <p class="artist">{{ album.artist }}</p>
          <p class="price">{{ formatPrice(album.price) }} ₽</p>
          <button @click="addToCart(album)" class="add-to-cart-btn">
            В корзину
          </button>
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
.catalog {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.catalog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.catalog-header h1 {
  color: #2e7d32;
  font-size: 2rem;
}

.user-controls {
  display: flex;
  gap: 1rem;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: #e0e0e0;
  color: #d32f2f;
}

.catalog-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-input,
.format-select {
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
}

.search-input {
  flex: 1;
}

.format-select {
  width: 200px;
}

.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}

.album-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.album-card:hover {
  transform: translateY(-4px);
}

.album-image {
  aspect-ratio: 1;
  overflow: hidden;
}

.album-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-info {
  padding: 1rem;
}

.album-info h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.artist {
  color: #666;
  margin: 0.5rem 0;
}

.price {
  font-weight: bold;
  color: #2e7d32;
  margin: 0.5rem 0;
}

.add-to-cart-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #2e7d32;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-to-cart-btn:hover {
  background-color: #1b5e20;
}
</style> 