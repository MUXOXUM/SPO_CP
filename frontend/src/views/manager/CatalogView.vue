<template>
  <div class="manager-catalog">
    <div class="page-header">
      <div class="header-content">
        <h1>Управление каталогом</h1>
        <button @click="showAddModal = true" class="add-btn">
          <span class="material-icons">add</span>
          <span>Добавить альбом</span>
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
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

    <!-- Albums Table -->
    <div class="table-container">
      <table class="albums-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Лейбл</th>
            <th>Исполнитель</th>
            <th>Год</th>
            <th>Жанр</th>
            <th>Формат</th>
            <th>Цена</th>
            <th>В наличии</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="album in filteredAlbums" :key="album.id">
            <td>
              <img 
                :src="album.coverImage || '/placeholder.jpg'" 
                :alt="album.title"
                class="album-cover"
              >
            </td>
            <td>
              <div class="album-info">
                <span class="album-label">{{ album.label }}</span>
              </div>
            </td>
            <td>{{ album.artist }}</td>
            <td>{{ album.releaseYear }}</td>
            <td>
              <span class="genre-badge">
                {{ album.genre }}
              </span>
            </td>
            <td>
              <span class="format-badge">
                {{ getFormatName(album.formatId) }}
              </span>
            </td>
            <td>{{ formatPrice(album.price) }} ₽</td>
            <td>
              <span class="stock-badge" :class="{ low: album.inStock < 5 }">
                {{ album.inStock }}
              </span>
            </td>
            <td class="actions">
              <button @click="editAlbum(album)" class="icon-btn edit-btn" title="Изменить">
                <span class="material-icons">edit</span>
              </button>
              <button @click="confirmDelete(album)" class="icon-btn delete-btn" title="Удалить">
                <span class="material-icons">delete</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingAlbum" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingAlbum ? 'Редактировать альбом' : 'Добавить альбом' }}</h2>
          <button @click="closeModal" class="close-btn">
            <span class="material-icons">close</span>
          </button>
        </div>
        <form @submit.prevent="handleSubmit" class="album-form">
          <div class="form-row">
            <div class="form-group">
              <label>Название:</label>
              <input v-model="albumForm.title" required placeholder="Введите название альбома">
            </div>
            <div class="form-group">
              <label>Исполнитель:</label>
              <input v-model="albumForm.artist" required placeholder="Введите имя исполнителя">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Формат:</label>
              <div class="select-container">
                <select v-model="albumForm.formatId" required>
                  <option value="" disabled selected>Выберите формат</option>
                  <option v-for="format in formats" :key="format.id" :value="format.id">
                    {{ format.name }}
                  </option>
                </select>
                <span class="material-icons select-icon">expand_more</span>
              </div>
            </div>
            <div class="form-group">
              <label>Цена:</label>
              <input v-model="albumForm.price" type="number" required placeholder="0">
            </div>
            <div class="form-group">
              <label>Количество:</label>
              <input v-model="albumForm.inStock" type="number" required placeholder="0">
            </div>
          </div>
          <div class="form-group">
            <label>Обложка:</label>
            <div class="file-input">
              <input type="file" @change="handleImageUpload" accept="image/*" id="coverImage">
              <label for="coverImage" class="file-label">
                <span class="material-icons">upload</span>
                <span>Выберите файл</span>
              </label>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-btn">
              Отмена
            </button>
            <button type="submit" class="save-btn">
              <span class="material-icons">{{ editingAlbum ? 'save' : 'add' }}</span>
              <span>{{ editingAlbum ? 'Сохранить' : 'Добавить' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>Подтверждение удаления</h2>
          <button @click="showDeleteModal = false" class="close-btn">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-content">
          <div class="warning-message">
            <span class="material-icons warning-icon">warning</span>
            <p>Вы уверены, что хотите удалить альбом "{{ albumToDelete?.title }}"?</p>
            <p class="warning-subtext">Это действие нельзя отменить.</p>
          </div>
          <div class="modal-actions">
            <button @click="showDeleteModal = false" class="cancel-btn">
              Отмена
            </button>
            <button @click="deleteAlbum" class="delete-btn">
              <span class="material-icons">delete</span>
              <span>Удалить</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// Data
const albums = ref([]);
const formats = ref([]);
const searchQuery = ref('');
const selectedFormat = ref('');
const showAddModal = ref(false);
const showDeleteModal = ref(false);
const editingAlbum = ref(null);
const albumToDelete = ref(null);

const albumForm = ref({
  title: '',
  artist: '',
  formatId: '',
  price: '',
  inStock: '',
  coverImage: null
});

// Computed
const filteredAlbums = computed(() => {
  return albums.value.filter(album => {
    const matchesSearch = album.title && (
      album.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      album.artist.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
    const matchesFormat = !selectedFormat.value || album.formatId === selectedFormat.value;
    return matchesSearch && matchesFormat;
  });
});

// Methods
const fetchAlbums = async () => {
  try {
    const response = await axios.get('/api/catalog/albums');
    console.log('Received albums:', response.data); // Отладочный лог
    
    if (!Array.isArray(response.data)) {
      console.error('Expected array of albums, got:', response.data);
      albums.value = [];
      return;
    }

    albums.value = response.data.map(album => ({
      ...album,
      title: album.title || 'Без названия',
      artist: album.artist || 'Неизвестный исполнитель',
      formatId: album.formatId || album.format,
      inStock: Number(album.inStock) || 0,
      price: Number(album.price) || 0
    }));
  } catch (error) {
    console.error('Error fetching albums:', error);
    albums.value = [];
  }
};

const fetchFormats = async () => {
  try {
    const response = await axios.get('/api/catalog/formats');
    console.log('Received formats:', response.data); // Отладочный лог
    
    if (!Array.isArray(response.data)) {
      console.error('Expected array of formats, got:', response.data);
      formats.value = [];
      return;
    }

    formats.value = response.data.map(format => ({
      id: format.id || format,
      name: format.name || format
    }));
  } catch (error) {
    console.error('Error fetching formats:', error);
    formats.value = [];
  }
};

const getFormatName = (formatId) => {
  const format = formats.value.find(f => f.id === formatId);
  return format ? format.name : '-';
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU').format(price);
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    // TODO: Implement image upload
    albumForm.value.coverImage = file;
  }
};

const editAlbum = (album) => {
  editingAlbum.value = album;
  albumForm.value = { ...album };
  showAddModal.value = true;
};

const confirmDelete = (album) => {
  albumToDelete.value = album;
  showDeleteModal.value = true;
};

const deleteAlbum = async () => {
  try {
    await axios.delete(`/api/catalog/albums/${albumToDelete.value.id}`);
    await fetchAlbums();
    showDeleteModal.value = false;
    albumToDelete.value = null;
  } catch (error) {
    console.error('Error deleting album:', error);
  }
};

const handleSubmit = async () => {
  try {
    if (editingAlbum.value) {
      await axios.put(`/api/catalog/albums/${editingAlbum.value.id}`, albumForm.value);
    } else {
      await axios.post('/api/catalog/albums', albumForm.value);
    }
    await fetchAlbums();
    closeModal();
  } catch (error) {
    console.error('Error saving album:', error);
  }
};

const closeModal = () => {
  showAddModal.value = false;
  editingAlbum.value = null;
  albumForm.value = {
    title: '',
    artist: '',
    formatId: '',
    price: '',
    inStock: '',
    coverImage: null
  };
};

// Lifecycle
onMounted(() => {
  fetchAlbums();
  fetchFormats();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.manager-catalog {
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

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background-color: #2e7d32;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.add-btn:hover {
  background-color: #1b5e20;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
}

.filters {
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

.table-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.albums-table {
  width: 100%;
  border-collapse: collapse;
}

.albums-table th,
.albums-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.albums-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #666;
}

.album-cover {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
}

.format-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: #e8f5e9;
  color: #2e7d32;
  border-radius: 4px;
  font-size: 0.875rem;
}

.stock-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: #e8f5e9;
  color: #2e7d32;
  border-radius: 4px;
  font-weight: 500;
}

.stock-badge.low {
  background-color: #ffebee;
  color: #d32f2f;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: none;
}

.icon-btn .material-icons {
  font-size: 20px;
}

.edit-btn {
  color: #2e7d32;
}

.edit-btn:hover {
  background-color: #e8f5e9;
}

.delete-btn {
  color: #d32f2f;
}

.delete-btn:hover {
  background-color: #ffebee;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: none;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background-color: #f5f5f5;
}

.album-form {
  padding: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #666;
  font-size: 0.875rem;
  font-weight: 500;
}

.form-group input,
.form-group select {
  padding: 0.875rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2e7d32;
  box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.1);
}

.file-input {
  position: relative;
}

.file-input input[type="file"] {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.file-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem;
  background-color: #f8f9fa;
  border: 1.5px dashed #e0e0e0;
  border-radius: 8px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-label:hover {
  border-color: #2e7d32;
  color: #2e7d32;
}

.modal-content {
  padding: 1.5rem;
}

.warning-message {
  text-align: center;
  color: #333;
}

.warning-icon {
  font-size: 48px;
  color: #d32f2f;
  margin-bottom: 1rem;
}

.warning-subtext {
  color: #666;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn,
.save-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.cancel-btn {
  background: none;
  border: 1.5px solid #e0e0e0;
  color: #666;
}

.cancel-btn:hover {
  background-color: #f5f5f5;
}

.save-btn {
  background-color: #2e7d32;
  border: none;
  color: white;
}

.save-btn:hover {
  background-color: #1b5e20;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
}

.album-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.album-title {
  font-weight: 500;
  color: #333;
}

.album-label {
  font-size: 0.875rem;
  color: #666;
}

.genre-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .header-content,
  .filters,
  .table-container {
    padding: 0 1rem;
  }

  .form-row {
    flex-direction: column;
  }

  .modal {
    margin: 1rem;
  }
}
</style> 