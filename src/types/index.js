// src/types/index.js

// TypeScript interfaces are removed as this is now a JavaScript file.
// We will rely on JSDoc for type hinting if needed, or simply use plain JavaScript objects.

// export interface SubscriptionItem {
//   id: string;
//   platformName: string;
//   subscriptionType: string;
//   cost: number;
//   billingCycle: 'monthly' | 'annually' | 'onetime' | string;
//   autoRenewStatus: boolean;
//   startDate: string; // ISO date string
//   endDate?: string; // ISO date string, optional for ongoing subscriptions
//   platformIcon?: string; // URL or Base64 string for the image
//   notes?: string;
// }

// export interface PurchaseItem {
//   id: string;
//   itemName: string;
//   cost: number;
//   purchaseDate: string; // ISO date string
//   evaluation?: string;
//   itemImage?: string; // URL or Base64 string for the image
//   category?: string;
// }

// Calculated fields will be handled by getters in Pinia store or computed properties in components
// totalSpent for SubscriptionItem
// year2025Spent for SubscriptionItem

// No exports needed from this file in JS if we are not defining actual JS classes/functions for types.
// If we were to define validation functions or constructors, they would go here.

