<template>
  <div class="manager-catalog">
    <div class="header">
      <h1>Управление каталогом</h1>
      <button @click="showAddModal = true" class="add-btn">
        Добавить альбом
      </button>
    </div>

    <!-- Filters -->
    <div class="filters">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Поиск по названию или исполнителю..."
        class="search-input"
      >
      <select v-model="selectedFormat" class="format-select">
        <option value="">Все форматы</option>
        <option v-for="format in formats" :key="format.id" :value="format.id">
          {{ format.name }}
        </option>
      </select>
    </div>

    <!-- Albums Table -->
    <div class="table-container">
      <table class="albums-table">
        <thead>
          <tr>
            <th>Обложка</th>
            <th>Название</th>
            <th>Исполнитель</th>
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
            <td>{{ album.title }}</td>
            <td>{{ album.artist }}</td>
            <td>{{ getFormatName(album.formatId) }}</td>
            <td>{{ formatPrice(album.price) }} ₽</td>
            <td>{{ album.inStock }}</td>
            <td class="actions">
              <button @click="editAlbum(album)" class="edit-btn">
                Изменить
              </button>
              <button @click="confirmDelete(album)" class="delete-btn">
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingAlbum" class="modal-overlay">
      <div class="modal">
        <h2>{{ editingAlbum ? 'Редактировать альбом' : 'Добавить альбом' }}</h2>
        <form @submit.prevent="handleSubmit" class="album-form">
          <div class="form-group">
            <label>Название:</label>
            <input v-model="albumForm.title" required>
          </div>
          <div class="form-group">
            <label>Исполнитель:</label>
            <input v-model="albumForm.artist" required>
          </div>
          <div class="form-group">
            <label>Формат:</label>
            <select v-model="albumForm.formatId" required>
              <option v-for="format in formats" :key="format.id" :value="format.id">
                {{ format.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Цена:</label>
            <input v-model="albumForm.price" type="number" required>
          </div>
          <div class="form-group">
            <label>Количество:</label>
            <input v-model="albumForm.inStock" type="number" required>
          </div>
          <div class="form-group">
            <label>Обложка:</label>
            <input type="file" @change="handleImageUpload" accept="image/*">
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-btn">
              Отмена
            </button>
            <button type="submit" class="save-btn">
              {{ editingAlbum ? 'Сохранить' : 'Добавить' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <h2>Подтверждение удаления</h2>
        <p>Вы уверены, что хотите удалить альбом "{{ albumToDelete?.title }}"?</p>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="cancel-btn">
            Отмена
          </button>
          <button @click="deleteAlbum" class="delete-btn">
            Удалить
          </button>
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
    const matchesSearch = (
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
.manager-catalog {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h1 {
  color: #2e7d32;
  margin: 0;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
}

.format-select {
  width: 200px;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.albums-table {
  width: 100%;
  border-collapse: collapse;
}

.albums-table th,
.albums-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.albums-table th {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #666;
}

.album-cover {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.add-btn,
.edit-btn,
.delete-btn,
.save-btn,
.cancel-btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.add-btn,
.save-btn {
  background-color: #2e7d32;
  color: white;
}

.add-btn:hover,
.save-btn:hover {
  background-color: #1b5e20;
}

.edit-btn {
  background-color: #f5f5f5;
  color: #666;
}

.edit-btn:hover {
  background-color: #e0e0e0;
}

.delete-btn {
  background-color: #f5f5f5;
  color: #d32f2f;
}

.delete-btn:hover {
  background-color: #ffebee;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

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
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.modal h2 {
  color: #2e7d32;
  margin-bottom: 1.5rem;
}

.album-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #666;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }

  .format-select {
    width: 100%;
  }

  .actions {
    flex-direction: column;
  }

  .modal {
    margin: 1rem;
  }
}
</style> 