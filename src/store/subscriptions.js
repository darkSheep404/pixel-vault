// src/store/subscriptions.js
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// 默认订阅数据
const DEFAULT_SUBSCRIPTIONS = [
  {
    "platformName": "B站",
    "subscriptionType": "大会员",
    "cost": 15,
    "billingCycle": "monthly",
    "autoRenewStatus": false,
    "startDate": "2025-05-27",
    "endDate": "",
    "platformIcon": "",
    "id": "4e3b4609-b92b-40b2-92a0-97ffabc55449"
  },
  {
    "platformName": "汽水音乐",
    "subscriptionType": "VIP会员",
    "cost": 15,
    "billingCycle": "monthly",
    "autoRenewStatus": false,
    "startDate": "2025-05-27",
    "endDate": "",
    "platformIcon": "",
    "id": "88041892-3435-4242-abe4-0adce3a463a8"
  }
];

// Function to calculate total spent for a subscription
const calculateTotalSpent = (item) => {
  if (!item.startDate || !item.cost) return 0;
  const startDate = new Date(item.startDate);
  const endDate = item.endDate ? new Date(item.endDate) : new Date(); // Use current date if no end date

  let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
  months -= startDate.getMonth();
  months += endDate.getMonth();
  months = months <= 0 ? 0 : months; // Ensure non-negative
  
  if (item.billingCycle === 'onetime' || (item.billingCycle === 'monthly' && months === 0 && endDate >= startDate)) {
    return item.cost;
  }
  if (item.billingCycle === 'annually') {
    const years = Math.max(0, endDate.getFullYear() - startDate.getFullYear() + (endDate.getMonth() >= startDate.getMonth() ? 1 : 0));
    return item.cost * (years > 0 ? years : (endDate >= startDate ? 1 : 0) ); 
  }
  // Default to monthly calculation
  return item.cost * (months + 1) ; // +1 to include the starting month
};

// Function to calculate amount spent in 2025
const calculate2025Spent = (item) => {
  if (!item.startDate || !item.cost) return 0;
  const yearToCalc = 2025;
  const startDate = new Date(item.startDate);
  const endDate = item.endDate ? new Date(item.endDate) : new Date(Date.UTC(yearToCalc, 11, 31)); // Cap at end of 2025 if ongoing

  let spentInYear = 0;

  if (startDate.getFullYear() > yearToCalc || endDate.getFullYear() < yearToCalc) {
    if (startDate.getFullYear() === yearToCalc && endDate.getFullYear() === yearToCalc) {
      // Starts and ends within 2025
    } else {
        return 0; // Does not overlap with 2025 at all
    }
  }
  
  if (item.billingCycle === 'onetime') {
    if (startDate.getFullYear() === yearToCalc) {
      spentInYear = item.cost;
    }
  } else if (item.billingCycle === 'annually') {
    let currentPaymentDate = new Date(startDate);
    while(currentPaymentDate <= endDate) {
        if(currentPaymentDate.getFullYear() === yearToCalc) {
            spentInYear += item.cost;
        }
        currentPaymentDate.setFullYear(currentPaymentDate.getFullYear() + 1);
        if (item.endDate && currentPaymentDate > new Date(item.endDate)) break;
        if (currentPaymentDate.getFullYear() > yearToCalc && startDate.getFullYear() < yearToCalc) break; 
    }
  } else { // monthly or other string assumed as monthly
    let firstMonthInYear = 0;
    let lastMonthInYear = 11;

    if (startDate.getFullYear() === yearToCalc) {
      firstMonthInYear = startDate.getMonth();
    }
    if (endDate.getFullYear() === yearToCalc) {
      lastMonthInYear = endDate.getMonth();
    }
    if (startDate.getFullYear() < yearToCalc) {
        firstMonthInYear = 0;
    }
    if (endDate.getFullYear() > yearToCalc) {
        lastMonthInYear = 11;
    }

    if (startDate.getFullYear() <= yearToCalc && endDate.getFullYear() >= yearToCalc) {
        const monthsInYear = lastMonthInYear - firstMonthInYear + 1;
        spentInYear = item.cost * monthsInYear;
    }
  }
  return spentInYear;
};

export const useSubscriptionStore = defineStore('subscriptions', {
  state: () => ({
    subscriptions: [],
  }),
  getters: {
    getSubscriptionsWithCalculatedCosts: (state) => {
      return state.subscriptions.map(sub => ({
        ...sub,
        totalSpent: calculateTotalSpent(sub),
        spentIn2025: calculate2025Spent(sub),
      }));
    },
    getSubscriptionById: (state) => (id) => {
      return state.subscriptions.find(sub => sub.id === id);
    },
  },
  actions: {
    loadSubscriptions() {
      const storedSubscriptions = localStorage.getItem('subscriptions');
      if (storedSubscriptions) {
        this.subscriptions = JSON.parse(storedSubscriptions);
      } else {
        // 如果localStorage中没有数据，则使用默认数据
        this.subscriptions = [...DEFAULT_SUBSCRIPTIONS];
        // 保存默认数据到localStorage
        this.saveSubscriptions();
      }
    },
    saveSubscriptions() {
      localStorage.setItem('subscriptions', JSON.stringify(this.subscriptions));
    },
    addSubscription(subscription) {
      const newSubscription = { ...subscription, id: uuidv4() };
      this.subscriptions.push(newSubscription);
      this.saveSubscriptions();
    },
    updateSubscription(updatedSubscription) {
      const index = this.subscriptions.findIndex(sub => sub.id === updatedSubscription.id);
      if (index !== -1) {
        this.subscriptions[index] = updatedSubscription;
        this.saveSubscriptions();
      }
    },
    deleteSubscription(id) {
      this.subscriptions = this.subscriptions.filter(sub => sub.id !== id);
      this.saveSubscriptions();
    },
    replaceAll(newList) {
      this.subscriptions = Array.isArray(newList) ? newList : [];
      this.saveSubscriptions();
    },
  },
});
