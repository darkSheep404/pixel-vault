<template>
  <div v-if="show" class="modal-overlay-pixel" @click.self="close">
    <div class="modal-content-pixel pixel-border">
      <h3 class="pixel-title">生成分享图</h3>
      <div v-if="items && items.length > 0">
        <p class="pixel-text">为 <strong>{{ pageTitle }}</strong> 选择模板:</p>
        
        <div class="template-selector-pixel">
          <div 
            v-for="(template, index) in templates"
            :key="index"
            class="template-preview-container-pixel pixel-border"
            :class="{ 'selected-pixel': selectedTemplate === template.id }"
            @click="selectTemplate(template.id)"
          >
            <div :id="`template-preview-${template.id}`" class="template-preview-pixel" :style="getTemplateStyles(template.id, true)">
              <div class="preview-header-pixel">{{ pageTitle }}</div>
              <div class="preview-items-count-pixel">{{ items.length }}个项目</div>
            </div>
            <p class="template-name-pixel">{{ template.name }}</p>
          </div>
        </div>

        <div v-if="selectedTemplate" class="share-card-render-area-pixel pixel-border">
          <h4 class="pixel-subtitle">预览:</h4>
          <div :id="`share-card-for-capture-${selectedTemplate}`" class="share-card-template-pixel" :style="getTemplateStyles(selectedTemplate, false)">
            <div class="share-header-pixel">
              <h3 class="share-title-pixel">{{ pageTitle }}</h3>
              <p class="share-subtitle-pixel">{{ new Date().toLocaleDateString('zh-CN') }}</p>
            </div>
            
            <div class="share-items-grid-pixel">
              <div v-for="(item, index) in items" :key="index" class="share-item-pixel">
                <img 
                  v-if="(item.itemImage || item.platformIcon) && getTemplateById(selectedTemplate)?.showImages"
                  :src="item.itemImage || item.platformIcon" 
                  :alt="item.itemName || item.platformName" 
                  class="share-item-image-pixel"
                  @error="onImageError"
                >
                <div class="share-item-content-pixel">
                  <h4 class="share-item-title-pixel">{{ item.itemName || item.platformName }}</h4>
                  <p class="share-item-detail-pixel">{{ formatItemDetail(item) }}</p>
                </div>
              </div>
            </div>
            
            <div class="share-card-footer-pixel">
              <p>像素风订阅管理</p>
            </div>
          </div>
        </div>

        <div v-if="generatedImage" class="generated-image-preview-pixel">
          <h4 class="pixel-subtitle">生成结果:</h4>
          <img :src="generatedImage" alt="生成的分享图" class="pixel-border">
        </div>

      </div>
      <div v-else>
        <p class="pixel-text">没有可分享的项目。</p>
      </div>

      <div class="modal-actions-pixel">
        <button @click="close" class="pixel-button cancel-btn">[取消]</button>
        <button @click="generateImage" :disabled="!selectedTemplate || isGenerating || !items || items.length === 0" class="pixel-button submit-btn">
          {{ isGenerating ? '生成中...' : '[生成]' }}
        </button>
        <a v-if="generatedImage" :href="generatedImage" download="share-image.png" class="pixel-button download-btn">[下载]</a>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, watch, nextTick } from 'vue';
import html2canvas from 'html2canvas';

export default defineComponent({
  name: 'ShareModal',
  props: {
    show: Boolean,
    items: Array,
    pageTitle: String
  },
  emits: ['close'],
  setup(props, { emit }) {
    const selectedTemplate = ref('pixel_classic'); // Default pixel template
    const generatedImage = ref(null);
    const isGenerating = ref(false);

    const templates = ref([
      {
        id: 'pixel_classic',
        name: '像素经典',
        showImages: true,
        backgroundColor: 'var(--pixel-card-bg-light)', 
        textColor: 'var(--pixel-text-primary-light)',
        borderColor: 'var(--pixel-border-light)',
        fontFamily: "'Silkscreen', 'Press Start 2P', sans-serif",
        gridColumns: 1
      },
      {
        id: 'pixel_grid',
        name: '像素网格',
        showImages: true,
        backgroundColor: 'var(--pixel-bg-light)',
        textColor: 'var(--pixel-text-primary-light)',
        borderColor: 'var(--pixel-primary-light)',
        fontFamily: "'Silkscreen', 'Press Start 2P', sans-serif",
        gridColumns: 2
      },
      {
        id: 'pixel_dark',
        name: '暗色像素',
        showImages: true,
        backgroundColor: 'var(--pixel-card-bg-dark)',
        textColor: 'var(--pixel-text-primary-dark)',
        borderColor: 'var(--pixel-border-dark)',
        fontFamily: "'Silkscreen', 'Press Start 2P', sans-serif",
        gridColumns: 1
      }
    ]);

    watch(() => props.show, (newShow) => {
      if (newShow) {
        generatedImage.value = null;
      }
    });

    const getTemplateById = (id) => templates.value.find(t => t.id === id);

    const getTemplateStyles = (templateId, isPreview) => {
      const template = getTemplateById(templateId);
      if (!template) return {};
      
      let styles = {
        backgroundColor: template.backgroundColor,
        color: template.textColor,
        border: `1px solid ${template.borderColor}`,
        padding: isPreview ? '4px' : '12px',
        fontFamily: template.fontFamily,
        width: isPreview ? '120px' : '100%', 
        minHeight: isPreview ? '80px' : 'auto',
        margin: isPreview ? '4px' : '0 auto',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        imageRendering: 'pixelated',
      };
      
      if (isPreview) {
        styles.transform = 'scale(0.9)';
        styles.transformOrigin = 'top left';
      }
      
      return styles;
    };

    const selectTemplate = (templateId) => {
      selectedTemplate.value = templateId;
      generatedImage.value = null;
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const formatItemDetail = (item) => {
      if (item.cost) {
        if (item.subscriptionType) {
          // 订阅项目
          return `${item.cost}元${item.billingCycle === 'monthly' ? '/月' : (item.billingCycle === 'annually' ? '/年' : '')}`;
        } else {
          // 购买项目
          return `${item.cost}元`;
        }
      }
      return '';
    };

    const onImageError = (event) => {
      console.error("Error loading image for share card:", event.target.src);
      if (event.target) event.target.style.display = 'none';
    };

    const generateImage = async () => {
      if (!selectedTemplate.value || !props.items || props.items.length === 0) return;
      isGenerating.value = true;
      generatedImage.value = null;

      await nextTick();

      const elementToCapture = document.getElementById(`share-card-for-capture-${selectedTemplate.value}`);
      if (elementToCapture) {
        try {
          const currentTheme = document.documentElement.classList.contains('dark-theme') ? 'dark' : 'light';
          const templateDetails = getTemplateById(selectedTemplate.value);
          let bgColorToUse = templateDetails.backgroundColor;
          
          // Resolve CSS variables for html2canvas
          if (bgColorToUse.startsWith('var(')) {
            bgColorToUse = getComputedStyle(elementToCapture).getPropertyValue(bgColorToUse.slice(4, -1)).trim();
          }

          const canvas = await html2canvas(elementToCapture, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: bgColorToUse || (currentTheme === 'dark' ? '#1E1E1E' : '#FFFFFF'),
            logging: true,
            imageTimeout: 15000,
            scale: 2,
            onclone: (clonedDoc) => {
              const shareCard = clonedDoc.querySelector('.share-card-template-pixel');
              if(shareCard) {
                shareCard.style.margin = '0';
              }
              const images = clonedDoc.querySelectorAll('img');
              images.forEach(img => {
                img.style.imageRendering = 'pixelated';
                const originalImg = document.getElementById(img.id || '');
                if(originalImg) img.src = originalImg.src;
              });
            }
          });
          generatedImage.value = canvas.toDataURL('image/png');
        } catch (error) {
          console.error('Error generating image with html2canvas:', error);
          alert('生成分享图失败，请检查控制台。');
        }
      }
      isGenerating.value = false;
    };

    const close = () => {
      emit('close');
      generatedImage.value = null;
    };

    return {
      templates, selectedTemplate, generatedImage, isGenerating,
      selectTemplate, generateImage, close, formatDate, getTemplateStyles, 
      getTemplateById, onImageError, formatItemDetail
    };
  },
});
</script>

<style scoped>
/* Pixel Art Styles for ShareModal */
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
  z-index: 2000;
  padding: 8px;
}

.modal-content-pixel {
  background-color: var(--app-bg-color);
  padding: 8px;
  border: 1px solid var(--border-color);
  width: 95%;
  max-width: 360px;
  max-height: 90vh;
  overflow-y: auto;
  color: var(--text-primary-color);
  font-family: 'Silkscreen', 'Press Start 2P', sans-serif;
}

.pixel-title {
  font-family: 'Press Start 2P', 'Silkscreen', sans-serif;
  font-size: 16px;
  color: var(--primary-color);
  margin-top: 0;
  margin-bottom: 12px;
  text-align: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
}

.pixel-subtitle {
  font-family: 'Press Start 2P', 'Silkscreen', sans-serif;
  font-size: 12px;
  margin-top: 12px;
  margin-bottom: 6px;
}

.pixel-text {
  font-size: 12px;
  line-height: 1.4;
  margin-bottom: 8px;
}

.template-selector-pixel {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  justify-content: center;
}

.template-preview-container-pixel {
  cursor: pointer;
  border: 1px solid var(--border-color);
  padding: 4px;
  text-align: center;
  background-color: var(--card-bg-color);
}

.template-preview-container-pixel.selected-pixel {
  border: 2px solid var(--accent-color);
}

.template-preview-pixel {
  overflow: hidden;
  position: relative;
  image-rendering: pixelated;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.preview-header-pixel {
  font-size: 10px;
  font-weight: bold;
  margin-bottom: 4px;
}

.preview-items-count-pixel {
  font-size: 8px;
}

.template-name-pixel {
  font-size: 10px;
  margin-top: 4px;
  color: var(--text-secondary-color);
}

.share-card-render-area-pixel {
  margin-top: 8px;
  margin-bottom: 8px;
  border: 1px solid var(--border-color);
  padding: 8px;
  background-color: var(--app-bg-color); 
}

.share-card-template-pixel {
  box-shadow: none;
  image-rendering: pixelated;
}

.share-header-pixel {
  text-align: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.share-title-pixel {
  font-size: 16px;
  font-weight: normal;
  margin: 6px 0;
}

.share-subtitle-pixel {
  font-size: 10px;
  margin: 3px 0;
}

.share-items-grid-pixel {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  width: 100%;
  margin-bottom: 12px;
}

.share-item-pixel {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid var(--border-color);
  padding: 6px;
  background-color: var(--card-bg-color);
}

.share-item-image-pixel {
  max-width: 80%;
  height: 48px;
  object-fit: contain;
  margin-bottom: 6px;
  image-rendering: pixelated;
}

.share-item-content-pixel {
  width: 100%;
  text-align: center;
}

.share-item-title-pixel {
  font-size: 12px;
  font-weight: normal;
  margin: 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.share-item-detail-pixel {
  font-size: 10px;
  margin: 2px 0;
}

.share-card-footer-pixel {
  margin-top: auto;
  padding-top: 8px;
  font-size: 8px;
  opacity: 0.8;
  width: 100%;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.generated-image-preview-pixel {
  margin-top: 12px;
  text-align: center;
}

.generated-image-preview-pixel img {
  max-width: 100%;
  border: 1px solid var(--border-color);
  image-rendering: pixelated;
}

.modal-actions-pixel {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
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

.modal-actions-pixel .submit-btn:disabled {
  background-color: var(--border-color);
  color: var(--text-secondary-color);
  cursor: default;
  border-color: var(--text-secondary-color);
}

/* 响应式调整 */
@media (min-width: 600px) {
  .share-items-grid-pixel {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
