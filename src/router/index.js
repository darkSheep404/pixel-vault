// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import SubscriptionView from '../views/SubscriptionView.vue';
import PurchaseView from '../views/PurchaseView.vue';

const routes = [
  {
    path: '/',
    name: 'Subscriptions',
    component: SubscriptionView,
  },
  {
    path: '/purchases',
    name: 'Purchases',
    component: PurchaseView,
  },
  // Redirect to subscriptions by default if no path matches
  { 
    path: '/:pathMatch(.*)*', 
    redirect: '/' 
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;

