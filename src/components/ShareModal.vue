<template>
  <div v-if="show" class="pixel-modal-overlay" @click.self="close">
    <div class="pixel-modal-content pixel-border">
      <div class="pixel-modal-header">
        <span class="pixel-modal-title">生成分享图  {{templates[selectedIndex].name}}</span>
        <button class="pixel-btn pixel-close-btn" @click="close">✕</button>
      </div>
      <div v-if="items && items.length > 0">
        <div v-if="!generatedImage">
          <swiper
            class="pixel-swiper"
            :slides-per-view="1"
            :space-between="0"
            :centered-slides="true"
            :initial-slide="selectedIndex"
            @slideChange="onSlideChange"
          >
            <swiper-slide v-for="(template, idx) in templates" :key="template.id">
              <div :id="`share-card-for-capture-${template.id}`" :class="['pixel-share-card', template.id]" :style="getTemplateStyles(template.id)">
                <div class="pixel-share-header">
                  <span class="pixel-share-title">{{ pageTitle }}</span>
                  <span class="pixel-share-date">{{ new Date().toLocaleDateString('zh-CN') }}</span>
                </div>
                <div class="pixel-share-items">
                  <div v-for="(item, index) in items" :key="index" :class="['pixel-share-item', template.id]">
                    <div class="pixel-item-icon" v-if="getItemIcon(template.id, item)">
                      <img :src="getItemIcon(template.id, item)" alt="icon" />
                    </div>
                    <div class="pixel-share-item-content">
                      <span class="pixel-share-item-title">{{ item.itemName || item.platformName }}</span>
                      <span class="pixel-share-item-detail">{{ formatItemDetail(item) }}</span>
                      <span v-if="item.remark" class="pixel-share-item-remark">{{ item.remark }}</span>
                    </div>
                  </div>
                </div>
                <div class="pixel-share-footer">
                  <img :src="qrImgMap[template.id]" class="pixel-qrcode" alt="二维码" v-if="qrImgMap[template.id]" />
                  <div class="pixel-qrcode-tip">扫码访问地球Online装备库</div>
                </div>
              </div>
            </swiper-slide>
          </swiper>
          <div class="pixel-swiper-indicator">
            <span v-for="(template, idx) in templates" :key="template.id" :class="['pixel-dot', {active: selectedIndex === idx}]" />
          </div>
        </div>
        <div v-else class="pixel-generated-image-preview" ref="previewRef">
          <div class="pixel-preview-divider"></div>
          <span class="pixel-modal-subtitle">生成结果：</span>
          <img :src="generatedImage" alt="生成的分享图" class="pixel-border">
        </div>
      </div>
      <div v-else>
        <span class="pixel-modal-text">没有可分享的项目。</span>
      </div>
      <div class="pixel-modal-actions">
        <button @click="close" class="pixel-btn pixel-cancel-btn">[取消]</button>
        <button v-if="!generatedImage" @click="generateImage" :disabled="isGenerating || !items || items.length === 0" class="pixel-btn pixel-submit-btn">
          {{ isGenerating ? '生成中...' : '[生成当前风格]' }}
        </button>
        <a v-if="generatedImage" :href="generatedImage" download="share-image.png" class="pixel-btn pixel-download-btn">[下载]</a>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, watch, nextTick, onMounted } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/swiper-bundle.css';
import html2canvas from 'html2canvas';
import qrcode from 'qrcode';

// 可根据实际情况替换为本地icon
const stardewIcon = 'https://cdn2.steamgriddb.com/icon/2119b8d43eafcf353e07d7cb5554170b/32/64x64.png';
const win98Icon = 'https://64.media.tumblr.com/c14680f551bb7173c2ef8c1624f8a13d/591683af0d9ad990-00/s540x810/01a0fc73ccf559c20dd0a67b2b3550c2f0efa4d7.png';
const pixelIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAL8AAACUCAMAAAD1XwjBAAAA/FBMVEX////+AAAAAAD/AADw8PCVAAAKCgpIAACPj4/VAADKAAAPDw+qqqrdAACwsLAfHx/o6OjqAAD/4OBbW1u/v7+CgoL4AAD+U1NvAADyAADS0tJAAAClAADEAACPAABmZmZ1dXWhoaF/AAA3AAAmJiYYAABDQ0P/w8OHAAD/9/dOAAD+PT0nAAD+hIT/fX0uAAD+SEj/7Oz+rKz+JiYwMDD+GBgAISGpkZGVFhalgYGfdXWaQ0NkcHBkAABwenpwVVXGJyf/b29lVla9KipPX1/+kpL/0dH/uLj+YmKkQkIbKChyIiJGIyOsn5+AGBiPS0ufXV00HR1WPj5YNDR/HZQXAAADmUlEQVR4nO3cbVfaMBgGYKH4AtRCFZjUIiLgfJtO0b25Td2czk2nm///v+zDzPNk53QmtClp531/7GmeXC2c00CSTk0hCPJoSmPEXC1j/KBanNFMsaGo1dMtVezWjflrRe2o/K52pUX44Ycffvht+1/Z8HeTPYBLDU/k9Ztp7bylVq5Uy6Wj77QrHd9QoyCGv96lO7HUcrSzwTdQ8vPBae1K5T41Wk3sL+hFy69Zyoa/oOHXrQQ//PDDP55/JSv+0ntq/mEM/5rCv6HvH1Kjj9rq3qLIyem8iC+VPVuIyMUZ9epzKyq1+Ek6qu1vUZv5z+dUSjG+mqNrni3zo1wq+2IzotXmLnfL4Zu+40TWUlwAp8Kl3Iju/+WPqqryS/1zp3v66sgrYX8Vfvjhh/9J+YeW/UcvRba/sH8z4vkr97pM2bLsf3axLyLd/svRtsgoqlefY9u/EHXugarbGIOGLPmNBX744Yf/P/Nf5tG/cECJGvRk3v98dETJp39Savjhhx9++O379/PtH53tinyd2FPXoN9y4Lcb+O0Gfrt5kv7leWP/v8ZUR87/9h73Bz2Rm6tQpGOF71P/4bFLLO2lfPHWPxj0l3cIoL/+gRNv/YlJv431M/DDDz/8pv0TexKbW7+9Whv8ybfvflsk9U+iRT1Vrh/6H9SaMfyloCFy82NNJEzX77RD6urWI0Cc9f9SpP0Xayn7/SXqKuH+C9nP+1+0l28m96eyfwd++OGHf7L+quRPYyjBNdup+Lu0fP2W1rSX28YuwPHLomrllvpqmtvAX6d4fVpUWDHnD6nqtVeivozxpTTo4x12zPl508lhwqGOHf80+1X7V+GHH374c+8vdhKOJKSRCPsHKfuD1abIVYcSi+9z+zsqOpfy80tKkz+KOP+qOCG3T/mmq/zDWP4Oz0948MMPP/xP1F/QfxTzmdb91dpDBu0WRXUBdGIh/Cna2/EH9Hoeb2NFRDE/4LRDOvWOXgrkpvJTfYzM0Dehr/D7PCkUZ1IlpZCpOKvyL7Pf3P87SQO/3cBvN/DbjeyPGkrwsWz6D9dFfrVpzzvPD0g74cv3dOpcdvw8PxDsiX/y+zyUcJZo0uA+oFOzw5dS56+S5J+lg4eZVHOi/Vvstz1UUwR+u4HfbuC3m7/8lBz518X0//kVvXTPP6H1B+YWtaUe6U3J+UFL6bE/41+a6MBvN/DbDfx2A7/dBO5DvF4un78Ikv38BmEt3EdBjKcLAAAAAElFTkSuQmCC';
const iosIcon = 'https://img.icons8.com/?size=100&id=gINNTdIsWR8p&format=png&color=000000';

export default defineComponent({
  name: 'ShareModal',
  components: { Swiper, SwiperSlide },
  props: {
    show: Boolean,
    items: Array,
    pageTitle: String
  },
  emits: ['close'],
  setup(props, { emit }) {
    const qrUrl = 'https://darksheep.xyz/pixel-vault/';
    const selectedIndex = ref(0);
    const generatedImage = ref(null);
    const isGenerating = ref(false);
    const qrImgMap = ref({});
    const previewRef = ref(null);
    const templates = ref([
      {
        id: 'stardew',
        name: '星露谷风格',
        fontFamily: "'VT323', 'Silkscreen', monospace",
        bg: 'linear-gradient(135deg, #f7e9b0 60%, #a3d977 100%)',
        color: '#5b3a1b',
        border: '3px solid #a3d977',
        icon: stardewIcon,
        qrBg: '#fffbe6',
        qrFg: '#5b3a1b',
        noRadius: false
      },
      {
        id: 'pixel',
        name: '像素游戏风',
        fontFamily: "'Press Start 2P', 'Silkscreen', monospace",
        bg: '#222',
        color: '#fff',
        border: '4px solid #fff',
        icon: pixelIcon,
        qrBg: '#222',
        qrFg: '#fff',
        noRadius: true
      },
      {
        id: 'ios',
        name: 'iOS风格',
        fontFamily: "'SF Pro Display', 'Arial', sans-serif",
        bg: 'linear-gradient(135deg, #f5f6fa 60%, #d1d8e6 100%)',
        color: '#222',
        border: '2px solid #bdbdbd',
        icon: iosIcon,
        qrBg: '#fff',
        qrFg: '#222',
        noRadius: false
      },
      {
        id: 'win98',
        name: 'Win98风格',
        fontFamily: "'Consolas', 'Courier New', monospace",
        bg: '#c3c7cb',
        color: '#222',
        border: '3px solid #000',
        icon: win98Icon,
        qrBg: '#fff',
        qrFg: '#222',
        noRadius: false,
        win98: true
      }
    ]);

    // 生成所有模板的二维码图片
    const generateAllQRCodes = async () => {
      for (const t of templates.value) {
        qrImgMap.value[t.id] = await qrcode.toDataURL(qrUrl, {
          margin: 0,
          color: {
            dark: t.qrFg,
            light: t.qrBg
          },
          width: 64
        });
      }
    };

    onMounted(() => {
      generateAllQRCodes();
    });

    watch(() => props.show, (newShow) => {
      if (newShow) {
        generatedImage.value = null;
        generateAllQRCodes();
      }
    });

    const getTemplateById = (id) => templates.value.find(t => t.id === id);

    const getTemplateStyles = (templateId) => {
      const t = getTemplateById(templateId);
      if (!t) return {};
      return {
        background: t.bg,
        color: t.color,
        border: t.border,
        fontFamily: t.fontFamily,
        borderRadius: t.noRadius ? '0' : '8px',
        boxShadow: t.win98 ? '4px 4px 0 #fff, 8px 8px 0 #000' : 'none',
        padding: '0',
        width: '100%',
        minHeight: '320px',
        margin: '0 auto',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        transition: 'all 0.3s',
        position: 'relative',
      };
    };

    const getQrBg = (templateId) => getTemplateById(templateId)?.qrBg || '#fff';
    const getQrFg = (templateId) => getTemplateById(templateId)?.qrFg || '#222';

    const onSlideChange = (swiper) => {
      selectedIndex.value = swiper.activeIndex;
      generatedImage.value = null;
    };

    const getItemIcon = (templateId, item) => {
      const t = getTemplateById(templateId);
      if (t && t.icon) return t.icon;
      return '';
    };

    const formatItemDetail = (item) => {
      if (item.cost) {
        if (item.subscriptionType) {
          return `${item.cost}元${item.billingCycle === 'monthly' ? '/月' : (item.billingCycle === 'annually' ? '/年' : '')}`;
        } else {
          return `${item.cost}元`;
        }
      }
      return '';
    };

    const onImageError = (event) => {
      if (event.target) event.target.style.display = 'none';
    };

    const generateImage = async () => {
      const template = templates.value[selectedIndex.value];
      if (!template || !props.items || props.items.length === 0) return;
      isGenerating.value = true;
      generatedImage.value = null;
      await nextTick();
      const elementToCapture = document.getElementById(`share-card-for-capture-${template.id}`);
      if (elementToCapture) {
        try {
          const canvas = await html2canvas(elementToCapture, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: getTemplateById(template.id).bg,
            scale: 2,
            logging: false,
          });
          generatedImage.value = canvas.toDataURL('image/png');
          await nextTick();
          // 自动滚动到预览区
          if (previewRef.value) {
            previewRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } catch (error) {
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
      templates, selectedIndex, generatedImage, isGenerating,
      generateImage, close, getTemplateStyles, getTemplateById, onImageError, formatItemDetail, onSlideChange, qrImgMap, getItemIcon, previewRef
    };
  },
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
@import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
.pixel-modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  display: flex; justify-content: center; align-items: center;
  z-index: 2000;
  padding: 0;
}
.pixel-modal-content {
  background: #181818;
  font-family: 'Press Start 2P', 'Silkscreen', monospace;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  width: 98vw; max-width: 420px;
  max-height: 96vh; overflow-y: auto;
  color: #fff;
  position: relative;
  border: 8px solid #fff;
  image-rendering: pixelated;
}
.pixel-border {
  border: 8px solid #fff;
  box-shadow: 0 0 0 4px #000, 0 0 0 8px #8f99a8;
  border-radius: 0;
}
.pixel-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 0 16px;
  border-bottom: 4px solid #8f99a8;
}
.pixel-modal-title {
  font-size: 16px;
  font-family: 'Press Start 2P', 'Silkscreen', monospace;
  color: #fff;
  letter-spacing: 1px;
}
.pixel-btn {
  font-family: 'Press Start 2P', 'Silkscreen', monospace;
  background: #fff;
  color: #222;
  border: 4px solid #8f99a8;
  border-radius: 0;
  padding: 8px 16px;
  font-size: 14px;
  margin: 0 4px;
  cursor: pointer;
  image-rendering: pixelated;
  box-shadow: 2px 2px 0 #000;
  transition: background 0.1s;
}
.pixel-btn:active {
  background: #8f99a8;
  color: #fff;
}
.pixel-close-btn {
  padding: 4px 10px;
  font-size: 18px;
  background: #fff;
  color: #8f99a8;
  border: 4px solid #8f99a8;
  box-shadow: 2px 2px 0 #000;
}
.pixel-modal-subtitle {
  font-size: 13px;
  color: #fff;
  font-family: 'Press Start 2P', 'Silkscreen', monospace;
  margin: 8px 0 4px 0;
  display: block;
}
.pixel-modal-text {
  font-size: 13px;
  color: #fff;
  font-family: 'Press Start 2P', 'Silkscreen', monospace;
  margin: 12px 0;
  display: block;
  text-align: center;
}
.pixel-swiper {
  width: 100%;
  margin: 0 auto 8px auto;
  padding-bottom: 8px;
}
.pixel-swiper-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
  gap: 4px;
}
.pixel-dot {
  width: 12px; height: 12px;
  background: #fff;
  border: 2px solid #8f99a8;
  display: inline-block;
  margin: 0 2px;
  image-rendering: pixelated;
}
.pixel-dot.active {
  background: #8f99a8;
}
.pixel-share-card {
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  padding: 0;
  overflow: hidden;
  position: relative;
  border-radius: 0;
  border: 4px solid #fff;
  box-shadow: 0 0 0 4px #000;
  image-rendering: pixelated;
}
.pixel-share-card.pixel {
  background: #222;
  color: #fff;
  font-family: 'Press Start 2P', 'Silkscreen', monospace;
  border: 4px solid #fff;
  box-shadow: 0 0 0 4px #000;
}
.pixel-share-card.stardew {
  background: linear-gradient(135deg, #f7e9b0 60%, #a3d977 100%);
  color: #5b3a1b;
  font-family: 'VT323', 'Silkscreen', monospace;
  border: 4px solid #a3d977;
  box-shadow: 0 0 0 4px #5b3a1b;
}
.pixel-share-card.ios {
  background: linear-gradient(135deg, #f5f6fa 60%, #d1d8e6 100%);
  color: #222;
  font-family: 'SF Pro Display', 'Arial', sans-serif;
  border: 4px solid #bdbdbd;
  box-shadow: 0 0 0 4px #aaa;
}
.pixel-share-card.win98 {
  background: #c3c7cb;
  color: #222;
  font-family: 'Consolas', 'Courier New', monospace;
  border: 4px solid #000;
  box-shadow: 4px 4px 0 #fff, 8px 8px 0 #000;
}
.pixel-share-header {
  text-align: center;
  margin-bottom: 8px;
  padding: 16px 0 8px 0;
  border-bottom: 4px solid #8f99a8;
  width: 100%;
  font-size: 15px;
  font-family: inherit;
}
.pixel-share-title {
  font-size: 18px;
  font-family: inherit;
  color: inherit;
  letter-spacing: 1px;
  display: block;
}
.pixel-share-date {
  font-size: 11px;
  color: #aaa;
  font-family: inherit;
  display: block;
}
.pixel-share-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  padding: 12px 0;
  align-items: center;
}
.pixel-share-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  width: 90%;
  margin: 0 auto;
  background: rgba(255,255,255,0.10);
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  padding: 8px 12px;
  min-width: 0;
  border-radius: 0;
  border: 2px solid #fff;
  font-family: inherit;
  color: inherit;
  image-rendering: pixelated;
}
.pixel-share-item.pixel {
  background: #222;
  color: #fff;
  border: 2px solid #fff;
  font-family: 'Press Start 2P', 'Silkscreen', monospace;
}
.pixel-share-item.stardew {
  background: #f7e9b0;
  color: #5b3a1b;
  border: 2px solid #a3d977;
  font-family: 'VT323', 'Silkscreen', monospace;
}
.pixel-share-item.ios {
  background: #fff;
  color: #222;
  border: 2px solid #bdbdbd;
  font-family: 'SF Pro Display', 'Arial', sans-serif;
}
.pixel-share-item.win98 {
  background: #e0e7ef;
  color: #222;
  border: 2px solid #000;
  font-family: 'Consolas', 'Courier New', monospace;
  box-shadow: 2px 2px 0 #fff, 4px 4px 0 #000;
}
.pixel-item-icon {
  width: 28px;
  height: 28px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  image-rendering: pixelated;
}
.pixel-item-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}
.pixel-share-item-content {
  width: 100%;
  text-align: left;
  font-family: inherit;
}
.pixel-share-item-title {
  font-size: 13px;
  font-weight: 600;
  margin: 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: inherit;
}
.pixel-share-item-detail {
  font-size: 12px;
  color: #8f99a8;
  margin: 2px 0;
  font-family: inherit;
}
.pixel-share-item-remark {
  font-size: 12px;
  color: #f59e42;
  margin: 2px 0 0 0;
  word-break: break-all;
  white-space: pre-line;
  font-family: inherit;
}
.pixel-share-footer {
  margin-top: auto;
  padding: 12px 0 8px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-top: 4px solid #8f99a8;
  background: transparent;
  width: 100%;
}
.pixel-qrcode {
  margin: 0 auto 4px auto;
  border-radius: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.10);
  image-rendering: pixelated;
}
.pixel-qrcode-tip {
  font-size: 11px;
  color: #8f99a8;
  margin-top: 2px;
  font-family: 'Press Start 2P', 'Silkscreen', monospace;
}
.pixel-generated-image-preview {
  margin-top: 12px;
  text-align: center;
}
.pixel-generated-image-preview img {
  max-width: 100%;
  border: 4px solid #fff;
  image-rendering: pixelated;
}
.pixel-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
  border-top: 4px solid #8f99a8;
  padding-top: 8px;
}
.pixel-modal-actions .pixel-btn {
  padding: 8px 18px;
  font-size: 14px;
  border-radius: 0;
  border: 4px solid #8f99a8;
  font-family: 'Press Start 2P', 'Silkscreen', monospace;
  background: #fff;
  color: #8f99a8;
  box-shadow: 2px 2px 0 #000;
  cursor: pointer;
  margin: 0 4px;
}
.pixel-modal-actions .pixel-btn:active {
  background: #8f99a8;
  color: #fff;
}
.pixel-modal-actions .pixel-btn.pixel-submit-btn {
  background: #8f99a8;
  color: #fff;
}
.pixel-modal-actions .pixel-btn:disabled {
  background: #e0e7ef;
  color: #aaa;
  cursor: default;
}
@media (max-width: 480px) {
  .pixel-modal-content {
    max-width: 99vw;
    padding: 0;
  }
  .pixel-share-card {
    max-width: 99vw;
    border-radius: 0;
  }
}
.pixel-preview-divider {
  border-top: 2px dashed #8f99a8;
  margin: 16px 0 8px 0;
}
</style>
