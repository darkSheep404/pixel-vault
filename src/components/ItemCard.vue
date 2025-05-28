<template>
  <div class="item-card pixel-border">
    <div class="item-card-image-section" v-if="item.platformIcon || item.itemImage">
      <img :src="item.platformIcon || item.itemImage" :alt="item.platformName || item.itemName" class="item-image pixel-image" />
    </div>
    <div class="item-card-content">
      <h3 class="item-name">{{ item.platformName || item.itemName }}</h3>
      <p v-if="item.subscriptionType" class="item-detail">类型: {{ item.subscriptionType }}</p>
      <p class="item-detail">费用: {{ item.cost }}元 {{ item.billingCycle && item.billingCycle !== 'onetime' ? (item.billingCycle === 'monthly' ? '/月' : '/年') : '' }}</p>
      <p v-if="item.startDate" class="item-detail">
        使用: {{ formatDate(item.startDate) }} 
        <span v-if="item.endDate"> - {{ formatDate(item.endDate) }}</span>
        <span v-else-if="item.billingCycle !== 'onetime'"> - 至今</span>
      </p>
      <p v-if="item.purchaseDate" class="item-detail">购买: {{ formatDate(item.purchaseDate) }}</p>
      <p v-if="item.autoRenewStatus !== undefined" class="item-detail">
        自动续费: <span :class="item.autoRenewStatus ? 'status-on-pixel' : 'status-off-pixel'">{{ item.autoRenewStatus ? '开启' : '关闭' }}</span>
      </p>
      <p v-if="item.totalSpent !== undefined" class="item-detail">已消费: {{ item.totalSpent?.toFixed(2) }} 元</p>
      <p v-if="item.spentIn2025 !== undefined" class="item-detail">预计年度消费: {{ item.spentIn2025?.toFixed(2) }} 元</p>
      <p v-if="item.evaluation" class="item-evaluation">备注: "{{ item.evaluation }}"</p>
    </div>
    <div class="item-card-actions">
      <button @click="$emit('edit', item.id)" class="action-btn edit-btn pixel-button">[编]</button>
      <button @click="$emit('delete', item.id)" class="action-btn delete-btn pixel-button">[删]</button>
      <button @click="$emit('view-details', item.id)" class="action-btn details-btn pixel-button">[详]</button>
      <button @click="$emit('edit-remark', item.id)" class="action-btn remark-btn pixel-button">[备注]</button>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ItemCard',
  props: {
    item: {
      type: Object,
      required: true,
    },
    showDetailsButton: {
      type: Boolean,
      default: false,
    }
  },
  emits: ['edit', 'delete', 'view-details', 'share', 'edit-remark'],
  setup() {
    const formatDate = (dateString) => {
      if (!dateString) return '';
      // Keep a simple date format for pixel style, or make it configurable
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    return {
      formatDate,
    };
  },
});
</script>

<style scoped>
/* Pixel Art Styles for ItemCard */
.item-card {
  background-color: var(--card-bg-color);
  border: 1px solid var(--border-color);
  padding: 8px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  /* Optional: blocky shadow for depth */
  /* box-shadow: 2px 2px 0px 0px var(--border-color); */ 
}

.item-card-image-section {
  width: 100%;
  max-height: 128px; /* Adjust for pixel art images */
  overflow: hidden;
  margin-bottom: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--app-bg-color); /* Background for image area */
  border: 1px solid var(--border-color);
}

.pixel-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* Or 'cover' if images are consistently sized */
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  /* For platform/item icons, ensure they are small and pixel-perfect */
  /* e.g. width: 32px; height: 32px; if they are icons */
}

.item-card-content {
  flex-grow: 1;
}

.item-name {
  font-family: 'Press Start 2P', 'Silkscreen', sans-serif;
  font-size: 14px; /* Adjust for pixel font */
  color: var(--primary-color);
  margin-top: 0;
  margin-bottom: 6px;
  word-break: break-all; /* Prevent overflow */
}

.item-detail {
  font-family: 'Silkscreen', 'Press Start 2P', sans-serif;
  font-size: 10px; /* Adjust for pixel font */
  color: var(--text-primary-color);
  margin: 2px 0;
  line-height: 1.4;
}

.status-on-pixel {
  color: var(--success-color);
  font-weight: normal; /* Pixel fonts usually have one weight */
}

.status-off-pixel {
  color: var(--error-color);
  font-weight: normal;
}

.item-evaluation {
  font-size: 10px;
  color: var(--text-secondary-color);
  /* font-style: italic; /* Not always available or looks good in pixel fonts */
  margin-top: 6px;
  padding-left: 4px;
  border-left: 1px solid var(--accent-color);
}

.item-card-actions {
  margin-top: 8px;
  display: flex;
  gap: 4px; /* Reduced gap */
  justify-content: flex-end; /* Or space-between for full width */
  border-top: 1px solid var(--border-color);
  padding-top: 8px;
  flex-wrap: wrap;
}

.action-btn {
  /* Using global .pixel-button styles from style.css */
  padding: 4px 6px;
  font-size: 10px; /* Smaller for card actions */
  min-width: 30px; /* Ensure tap target */
  text-align: center;
}

/* Specific button colors if needed, otherwise global pixel-button hover/active apply */
.edit-btn {
  /* background-color: var(--accent-color); */
  /* color: var(--pixel-text-primary-light); */
}

.delete-btn {
  background-color: var(--error-color);
  color: var(--pixel-bg-light); /* White text on red button */
  border-color: var(--error-color);
}
.dark-theme .delete-btn {
    color: var(--pixel-bg-dark);
}

.delete-btn:hover {
  background-color: var(--pixel-text-primary-light); /* Example: Invert on hover */
  color: var(--error-color);
  border-color: var(--error-color);
}

.share-btn {
  /* background-color: var(--primary-color); */
  /* color: var(--pixel-bg-light); */
}

.pixel-border {
  border: 1px solid var(--border-color);
}

/* Responsive adjustments for pixel cards (mostly about font size and padding if needed) */
@media (max-width: 480px) {
  .item-card {
    padding: 6px;
    margin-bottom: 6px;
  }
  .item-name {
    font-size: 12px;
  }
  .item-detail, .item-evaluation {
    font-size: 9px;
  }
  .action-btn {
    font-size: 9px;
    padding: 3px 5px;
  }
}

.action-btn.remark-btn {
  background-color: var(--accent-color);
  color: var(--pixel-text-primary-light);
  border-color: var(--accent-color);
}
.action-btn.remark-btn:hover {
  background-color: var(--pixel-text-primary-light);
  color: var(--accent-color);
  border-color: var(--accent-color);
}
</style>

