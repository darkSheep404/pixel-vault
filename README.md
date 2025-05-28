# Vue 3 + JS + Vite

遇到的bug
```
rror: Attempting to parse an unsupported color function "linear-gradient"
    at Object.parse (html2canvas.js?v=f231ceeb:1671:15)
    at parseColor (html2canvas.js?v=f231ceeb:1788:18)
    at parseBackgroundColor (html2canvas.js?v=f231ceeb:7777:78)
    at html2canvas.js?v=f231ceeb:7731:30
    at step (html2canvas.js?v=f231ceeb:114:17)
    at Object.next (html2canvas.js?v=f231ceeb:66:14)
    at fulfilled (html2canvas.js?v=f231ceeb:38:24)
```
根本原因：
html2canvas 不支持 background: linear-gradient(...) 这种 CSS 渐变写法，只支持纯色（如 #fff、rgb(...)、rgba(...)）。
你的模板 stardew 和 ios 都用了 linear-gradient 作为背景色，导致截图时报错，无法生成图片。
解决方案
方案一：截图时用纯色背景，显示时仍用渐变
显示时：继续用 linear-gradient，保证美观。
截图时：临时把背景色改成纯色（如渐变的主色），截图后再还原。
方案二：直接改成纯色背景
直接把模板的 bg 改成纯色（如 #f7e9b0、#f5f6fa），但这样视觉效果会变差。
推荐做法（方案一）
在 generateImage 方法中，截图前判断当前模板是否是渐变背景，如果是，临时把背景色改成纯色，截图后再还原。
纯色可以取渐变的第一个颜色，比如：
stardew: #f7e9b0
ios: #f5f6fa


isGenerating.value = true;
      generatedImage.value = null;
      await nextTick();
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      const elementToCapture = document.getElementById(`share-card-for-capture-${template.id}`);
      let originalBg = '';
      if (elementToCapture) {
        // 检查是否是渐变背景
        if (template.bg.startsWith('linear-gradient')) {
          originalBg = elementToCapture.style.background;
          // 临时用纯色
          if (template.id === 'stardew') {
            elementToCapture.style.background = '#f7e9b0';
          } else if (template.id === 'ios') {
            elementToCapture.style.background = '#f5f6fa';
          }
        }
        try {
          const canvas = await html2canvas(elementToCapture, {
            useCORS: true,
            backgroundColor: template.bg.startsWith('linear-gradient') 
              ? (template.id === 'stardew' ? '#f7e9b0' : '#f5f6fa')
              : template.bg,
            scale: 2,
            logging: false,
          });
          generatedImage.value = canvas.toDataURL('image/png');
          await nextTick();
          if (previewRef.value) {
            previewRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } catch (e) {
          console.log(e)
          alert('生成分享图失败，请检查控制台。');
        } finally {
          // 还原背景
          if (template.bg.startsWith('linear-gradient')) {
            elementToCapture.style.background = originalBg;
          }
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
      generateImage, close, getTemplateStyles, getTemplateById, onImageError, formatItemDetail, onSlideChange, getItemIcon, previewRef, qrUrl
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