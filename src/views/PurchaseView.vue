<template>
  <div class="view-container-pixel">
    <div class="view-header-pixel pixel-border-bottom">
      <h2 class="pixel-page-title">装备库 现实好物</h2>
      <div class="view-header-actions-pixel">
        <button @click="openShareAllModal" class="pixel-button share-all-btn-pixel">[分享图]</button>
        <button @click="openAddModal" class="pixel-button add-btn-pixel">[添加]</button>
        <button @click="handleExport" class="pixel-button export-btn-pixel">[导出]</button>
        <button @click="triggerImport" class="pixel-button import-btn-pixel">[导入]</button>
        <input ref="importInput" type="file" accept=".xlsx,.xls" style="display:none" @change="handleImport" />
      </div>
    </div>

    <div v-if="isLoading" class="loading-indicator-pixel pixel-text">加载中...</div>
    <div v-else-if="purchases.length === 0" class="empty-state-pixel pixel-text">
      <p>无购买记录</p>
      <p class="empty-icon-pixel">[空]</p>
    </div>

    <div v-else class="items-grid-pixel">
      <ItemCard 
        v-for="item in purchases" 
        :key="item.id" 
        :item="item"
        @edit="openEditModal(item.id)" 
        @delete="confirmDelete(item.id)"
        @view-details="openDetailsModal(item.id)"
        @share="openShareModal(item)"
        @edit-remark="openRemarkModal(item.id)"
      />
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay-pixel" @click.self="closeModal">
      <div class="modal-content-pixel pixel-border">
        <h3 class="pixel-title">{{ isEditing ? '[编辑物品]' : '[添加物品]' }}</h3>
        <form @submit.prevent="handleSubmit" class="pixel-form">
          <div>
            <label for="itemName" class="pixel-label">物品名:</label>
            <input type="text" id="itemName" v-model="currentItem.itemName" required class="pixel-input">
          </div>
          <div>
            <label for="cost" class="pixel-label">费用:</label>
            <input type="number" id="cost" v-model.number="currentItem.cost" required min="0" class="pixel-input">
          </div>
          <div>
            <label for="purchaseDate" class="pixel-label">购买日:</label>
            <input type="date" id="purchaseDate" v-model="currentItem.purchaseDate" required class="pixel-input">
          </div>
          <div>
            <label for="evaluation" class="pixel-label">备注:</label>
            <textarea id="evaluation" v-model="currentItem.evaluation" rows="2" class="pixel-input pixel-textarea"></textarea>
          </div>
          <div>
            <label for="itemImage" class="pixel-label">图片URL:</label>
            <input type="text" id="itemImage" v-model="currentItem.itemImage" placeholder="图片URL或Base64" class="pixel-input">
            <label for="itemImageFile" class="pixel-label pixel-file-label">或上传:</label>
            <input type="file" id="itemImageFile" @change="handleImageUpload($event, 'itemImage')" accept="image/*" class="pixel-file-input">
             <div v-if="currentItem.itemImage" class="image-preview-modal-pixel pixel-border">
                <img :src="currentItem.itemImage" alt="预览" class="pixel-image" />
            </div>
          </div>
          <div class="modal-actions-pixel">
            <button type="button" @click="closeModal" class="pixel-button cancel-btn">[取消]</button>
            <button type="submit" class="pixel-button submit-btn">{{ isEditing ? '[更新]' : '[添加]' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 备注编辑弹窗 -->
    <div v-if="showRemarkModal" class="modal-overlay-pixel" @click.self="closeRemarkModal">
      <div class="modal-content-pixel pixel-border">
        <h3 class="pixel-title">[编辑备注]</h3>
        <textarea v-model="remarkDraft" rows="3" class="pixel-input pixel-textarea" placeholder="请输入备注..." autofocus></textarea>
        <div class="modal-actions-pixel">
          <button @click="closeRemarkModal" class="pixel-button cancel-btn">[取消]</button>
          <button @click="saveRemark" class="pixel-button submit-btn">[保存]</button>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="showDetailsPopup && selectedPurchaseDetails" class="modal-overlay-pixel" @click.self="closeDetailsModal">
        <div class="modal-content-pixel details-popup-pixel pixel-border">
            <h3 class="pixel-title">[物品详情]</h3>
            <div class="pixel-text">
                <div v-if="selectedPurchaseDetails.itemImage" class="details-image-container-pixel pixel-border">
                    <img :src="selectedPurchaseDetails.itemImage" :alt="selectedPurchaseDetails.itemName" class="pixel-image">
                </div>
                <p><strong>物品:</strong> {{ selectedPurchaseDetails.itemName }}</p>
                <p><strong>费用:</strong> {{ selectedPurchaseDetails.cost }} 元</p>
                <p><strong>购买:</strong> {{ formatDate(selectedPurchaseDetails.purchaseDate) }}</p>
                <p v-if="selectedPurchaseDetails.evaluation"><strong>备注:</strong> "{{ selectedPurchaseDetails.evaluation }}"</p>
            </div>
            <button @click="closeDetailsModal" class="pixel-button close-details-btn-pixel">[关闭]</button>
        </div>
    </div>

    <!-- 单个项目分享 -->
    <ShareModal v-if="showSingleSharePopup" :show="showSingleSharePopup" :item="itemToShare" @close="closeSingleShareModal" />
    
    <!-- 批量分享 -->
    <ShareModal v-if="showShareAllPopup" :show="showShareAllPopup" :items="purchases" :pageTitle="'购买管理'" @close="closeShareAllModal" />

    <!-- 导入成功弹窗 -->
    <div v-if="showImportSuccess" class="pixel-modal-overlay">
      <div class="pixel-modal-content pixel-border">
        <div class="pixel-modal-title">[导入成功]</div>
        <div class="pixel-modal-body">数据已成功导入！</div>
        <button class="pixel-button" @click="showImportSuccess = false">[关闭]</button>
      </div>
    </div>

  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import { usePurchaseStore } from '../store/purchases';
import { useSubscriptionStore } from '../store/subscriptions';
import { exportAllToExcel, importAllFromExcel } from '../utils/excel';
import ItemCard from '../components/ItemCard.vue';
import ShareModal from '../components/ShareModal.vue';

const newEmptyPurchase = () => ({
  itemName: '',
  cost: 0,
  purchaseDate: new Date().toISOString().split('T')[0],
  evaluation: '',
  itemImage: '',
});

export default defineComponent({
  name: 'PurchaseView',
  components: { ItemCard, ShareModal },
  setup() {
    const store = usePurchaseStore();
    const subscriptionStore = useSubscriptionStore();
    const isLoading = ref(false);
    const showModal = ref(false);
    const isEditing = ref(false);
    const currentItem = ref(newEmptyPurchase());
    const showDetailsPopup = ref(false);
    const selectedPurchaseDetails = ref(null);
    const showSingleSharePopup = ref(false);
    const showShareAllPopup = ref(false);
    const itemToShare = ref(null);
    const importInput = ref(null);

    // 备注编辑相关
    const showRemarkModal = ref(false);
    const remarkDraft = ref('');
    const remarkEditId = ref(null);

    // 导入成功弹窗相关
    const showImportSuccess = ref(false);

    onMounted(async () => {
      isLoading.value = true;
      await store.loadPurchases();
      isLoading.value = false;
    });

    const purchases = computed(() => store.getAllPurchases);

    const openAddModal = () => {
      isEditing.value = false;
      currentItem.value = newEmptyPurchase();
      showModal.value = true;
    };

    const openEditModal = (id) => {
      const itemToEdit = store.getPurchaseById(id);
      if (itemToEdit) {
        isEditing.value = true;
        currentItem.value = { ...itemToEdit };
        showModal.value = true;
      }
    };

    const closeModal = () => {
      showModal.value = false;
    };

    const handleSubmit = () => {
      if (isEditing.value && currentItem.value.id) {
        store.updatePurchase(currentItem.value);
      } else {
        store.addPurchase(currentItem.value);
      }
      closeModal();
    };

    const confirmDelete = (id) => {
      if (window.confirm('确定删除?')) {
        store.deletePurchase(id);
      }
    };

    const openDetailsModal = (id) => {
        const item = store.getPurchaseById(id);
        if (item) {
            selectedPurchaseDetails.value = item;
            showDetailsPopup.value = true;
        }
    };

    const closeDetailsModal = () => {
        showDetailsPopup.value = false;
        selectedPurchaseDetails.value = null;
    };

    // 备注编辑弹窗逻辑
    const openRemarkModal = (id) => {
      const item = store.getPurchaseById(id);
      if (item) {
        remarkEditId.value = id;
        remarkDraft.value = item.evaluation || '';
        showRemarkModal.value = true;
      }
    };
    const closeRemarkModal = () => {
      showRemarkModal.value = false;
      remarkEditId.value = null;
      remarkDraft.value = '';
    };
    const saveRemark = () => {
      if (!remarkEditId.value) return;
      const item = store.getPurchaseById(remarkEditId.value);
      if (item) {
        const updated = { ...item, evaluation: remarkDraft.value };
        store.updatePurchase(updated);
      }
      closeRemarkModal();
    };

    const openShareModal = (item) => {
        itemToShare.value = item;
        showSingleSharePopup.value = true;
    };

    const closeSingleShareModal = () => {
        showSingleSharePopup.value = false;
        itemToShare.value = null;
    };
    
    const openShareAllModal = () => {
        showShareAllPopup.value = true;
    };
    
    const closeShareAllModal = () => {
        showShareAllPopup.value = false;
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const handleImageUpload = (event, fieldName) => {
      const target = event.target;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            currentItem.value[fieldName] = e.target.result;
          }
        };
        reader.readAsDataURL(file);
      }
    };

    const handleExport = () => {
      exportAllToExcel(subscriptionStore.subscriptions, store.purchases);
    };

    const triggerImport = () => {
      importInput.value && importInput.value.click();
    };

    const handleImport = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      importAllFromExcel(file, ({ subscriptions, purchases }) => {
        subscriptionStore.replaceAll(subscriptions);
        store.replaceAll(purchases);
        showImportSuccess.value = true;
      });
      e.target.value = '';
    };

    return {
      purchases, isLoading, showModal, isEditing, currentItem,
      openAddModal, openEditModal, closeModal, handleSubmit, confirmDelete,
      showDetailsPopup, selectedPurchaseDetails, openDetailsModal, closeDetailsModal, formatDate,
      handleImageUpload, showSingleSharePopup, itemToShare, openShareModal, closeSingleShareModal,
      showShareAllPopup, openShareAllModal, closeShareAllModal,
      // 备注相关
      showRemarkModal, remarkDraft, openRemarkModal, closeRemarkModal, saveRemark,
      handleExport, triggerImport, handleImport, importInput,
      // 导入成功弹窗相关
      showImportSuccess
    };
  },
});
</script>

<style scoped>
/* Pixel Art Styles for PurchaseView (largely similar to SubscriptionView) */
.view-container-pixel {
  padding: 8px;
  font-family: 'Silkscreen', 'Press Start 2P', sans-serif;
}

.view-header-pixel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.view-header-actions-pixel {
  display: flex;
  gap: 8px;
}

.pixel-page-title {
  font-family: 'Press Start 2P', 'Silkscreen', sans-serif;
  color: var(--primary-color);
  font-size: 18px; 
  margin: 0;
}

.add-btn-pixel, .share-all-btn-pixel, .export-btn-pixel, .import-btn-pixel {
  font-size: 12px;
  padding: 6px 10px;
}

.items-grid-pixel {
  display: grid;
  grid-template-columns: 1fr; 
  gap: 8px;
}

@media (min-width: 600px) {
  .items-grid-pixel {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

.loading-indicator-pixel, .empty-state-pixel {
  text-align: center;
  margin-top: 24px;
  color: var(--text-secondary-color);
  font-size: 12px;
}

.empty-state-pixel p {
  margin-bottom: 8px;
}

.empty-icon-pixel {
  font-family: 'Press Start 2P', 'Silkscreen', sans-serif;
  font-size: 24px;
  opacity: 0.7;
}

.modal-overlay-pixel {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 8px;
}

.modal-content-pixel {
  background-color: var(--app-bg-color);
  padding: 12px;
  border: 1px solid var(--border-color);
  width: 95%;
  max-width: 320px;
  max-height: 90vh;
  overflow-y: auto;
  color: var(--text-primary-color);
}

.pixel-title {
  font-family: 'Press Start 2P', 'Silkscreen', sans-serif;
  font-size: 14px;
  color: var(--primary-color);
  margin-top: 0;
  margin-bottom: 10px;
  text-align: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 6px;
}

.pixel-form div {
  margin-bottom: 8px;
}

.pixel-label {
  display: block;
  margin-bottom: 4px;
  font-size: 10px;
}

.pixel-input, .pixel-textarea, .pixel-select {
  width: 100%;
  padding: 6px;
  border: 1px solid var(--border-color);
  background-color: var(--card-bg-color);
  color: var(--text-primary-color);
  font-family: 'Silkscreen', 'Press Start 2P', sans-serif;
  font-size: 12px;
  border-radius: 0;
  box-sizing: border-box;
}

.pixel-textarea {
  min-height: 40px; /* Adjust for pixel style */
  resize: vertical; /* Allow vertical resize only */
}

.pixel-file-label {
    margin-top: 6px;
}

.pixel-file-input {
    font-size: 10px;
    margin-top: 2px;
    display: block;
    color: var(--text-secondary-color);
}

.image-preview-modal-pixel {
    margin-top: 6px;
    max-width: 100%;
    height: 64px; 
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--card-bg-color);
}
.image-preview-modal-pixel img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    image-rendering: pixelated;
}

.modal-actions-pixel {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  border-top: 1px solid var(--border-color);
  padding-top: 8px;
}

.modal-actions-pixel .pixel-button {
  padding: 6px 10px;
  font-size: 12px;
}

.modal-actions-pixel .cancel-btn {
  background-color: var(--text-secondary-color);
  color: var(--app-bg-color);
  border-color: var(--text-secondary-color);
}
.dark-theme .modal-actions-pixel .cancel-btn {
    color: var(--pixel-bg-dark);
}

/* Details Popup Styles */
.details-popup-pixel {
  /* Uses .modal-content-pixel base */
}

.details-image-container-pixel {
    width: 100%;
    height: 128px; 
    margin-bottom: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--card-bg-color);
}
.details-image-container-pixel img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    image-rendering: pixelated;
}

.details-popup-pixel .pixel-text p {
    margin: 4px 0;
    font-size: 10px;
    line-height: 1.4;
}
.details-popup-pixel .pixel-text strong {
    color: var(--primary-color);
    font-weight: normal;
}

.close-details-btn-pixel {
    display: block;
    margin: 12px auto 0;
    background-color: var(--accent-color);
    color: var(--pixel-text-primary-light);
    border-color: var(--accent-color);
    padding: 6px 12px;
    font-size: 12px;
}
.dark-theme .close-details-btn-pixel {
    color: var(--pixel-text-primary-dark);
}

.pixel-border {
  border: 1px solid var(--border-color);
}
.pixel-border-bottom {
  border-bottom: 1px solid var(--border-color);
}
.pixel-image {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

/* 导入成功弹窗样式 */
.pixel-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.pixel-modal-content {
  background: var(--app-bg-color);
  border: 2px solid var(--primary-color);
  padding: 24px 32px;
  min-width: 220px;
  text-align: center;
  font-family: 'Press Start 2P', 'Silkscreen', sans-serif;
  color: var(--primary-color);
  box-shadow: 0 0 0 4px var(--border-color);
}
.pixel-modal-title {
  font-size: 18px;
  margin-bottom: 12px;
}
.pixel-modal-body {
  font-size: 14px;
  margin-bottom: 16px;
}
</style>
