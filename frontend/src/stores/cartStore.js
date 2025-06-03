import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
  }),

  getters: {
    totalItems: (state) => {
      return state.items.reduce((total, item) => total + (item.quantity || 0), 0);
    },
    totalPrice: (state) => {
      return state.items.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0);
    },
  },

  actions: {
    addToCart(album) {
      const existingItem = this.items.find(item => item.id === album.id && item.formatId === album.formatId);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        this.items.push({
          id: album.id,
          title: album.title,
          artist: album.artist,
          price: album.price || 0,
          formatId: album.formatId,
          format: album.format,
          quantity: 1
        });
      }
    },

    removeFromCart(albumId, formatId) {
      const index = this.items.findIndex(item => item.id === albumId && item.formatId === formatId);
      if (index > -1) {
        this.items.splice(index, 1);
      }
    },

    updateQuantity(albumId, formatId, quantity) {
      const item = this.items.find(item => item.id === albumId && item.formatId === formatId);
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
    },

    clearCart() {
      this.items = [];
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'cart',
        storage: localStorage,
      },
    ],
  },
}); 