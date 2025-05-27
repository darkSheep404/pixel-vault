// src/store/purchases.js
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// 默认购买数据
const DEFAULT_PURCHASES = [
  {
    "itemName": "大疆 NEO 无人机",
    "cost": 1299,
    "purchaseDate": "2025-05-27",
    "evaluation": "",
    "itemImage": "",
    "id": "1ef279df-d59f-465b-8a00-9480fdf8aeca"
  }
];

export const usePurchaseStore = defineStore('purchases', {
  state: () => ({
    purchases: [],
  }),
  getters: {
    getAllPurchases: (state) => {
      return state.purchases.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
    },
    getPurchaseById: (state) => (id) => {
      return state.purchases.find(item => item.id === id);
    },
    getTotalPurchaseSpending: (state) => {
      return state.purchases.reduce((total, item) => total + item.cost, 0);
    }
  },
  actions: {
    loadPurchases() {
      const storedPurchases = localStorage.getItem('purchases');
      if (storedPurchases) {
        this.purchases = JSON.parse(storedPurchases);
      } else {
        // 如果localStorage中没有数据，则使用默认数据
        this.purchases = [...DEFAULT_PURCHASES];
        // 保存默认数据到localStorage
        this.savePurchases();
      }
    },
    savePurchases() {
      localStorage.setItem('purchases', JSON.stringify(this.purchases));
    },
    addPurchase(purchase) {
      const newPurchase = { ...purchase, id: uuidv4() };
      this.purchases.push(newPurchase);
      this.savePurchases();
    },
    updatePurchase(updatedPurchase) {
      const index = this.purchases.findIndex(item => item.id === updatedPurchase.id);
      if (index !== -1) {
        this.purchases[index] = updatedPurchase;
        this.savePurchases();
      }
    },
    deletePurchase(id) {
      this.purchases = this.purchases.filter(item => item.id !== id);
      this.savePurchases();
    },
    replaceAll(newList) {
      this.purchases = Array.isArray(newList) ? newList : [];
      this.savePurchases();
    },
  },
});
