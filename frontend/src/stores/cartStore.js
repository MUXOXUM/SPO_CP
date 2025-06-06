import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),

  getters: {
    totalItems: (state) => state.items.length,
    
    totalAmount: (state) => {
      return state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    
    cartItems: (state) => state.items
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
          formatId: album.formatId,
          price: album.price,
          quantity: 1
        });
      }
    },

    removeFromCart(itemId, formatId) {
      const index = this.items.findIndex(item => item.id === itemId && item.formatId === formatId);
      if (index !== -1) {
        this.items.splice(index, 1);
      }
    },

    updateQuantity(itemId, formatId, quantity) {
      const item = this.items.find(item => item.id === itemId && item.formatId === formatId);
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