<template>
  <header class="top-toolbar pixel-border-bottom">
    <div class="toolbar-content">
      <div class="toolbar-left">
        <h1 class="app-title"></h1>
      </div>
      <nav class="toolbar-center">
        <router-link to="/" class="nav-link pixel-button" active-class="active">APP会员</router-link>
        <router-link to="/purchases" class="nav-link pixel-button" active-class="active">现实好物</router-link>
      </nav>
      <div class="toolbar-right">
        <button @click="toggleTheme" class="theme-toggle-btn pixel-button">
          {{ theme === 'light' ? '[ 夜 ]' : '[ 日 ]' }}
        </button>
      </div>
    </div>
  </header>
</template>

<script>
import { defineComponent, ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'TopToolbar',
  setup() {
    const theme = ref('light');
    const route = useRoute();
    const appTitle = ref('订阅管理');

    const updateTitle = () => {
      if (route.path === '/purchases') {
        appTitle.value = '现实好物';
      } else {
        appTitle.value = 'APP会员';
      }
    };

    const setThemeOnDocument = (newTheme) => {
      document.documentElement.classList.remove('light-theme', 'dark-theme');
      document.documentElement.classList.add(newTheme + '-theme');
      localStorage.setItem('app-theme', newTheme);
      theme.value = newTheme;
    };

    const toggleTheme = () => {
      const newTheme = theme.value === 'light' ? 'dark' : 'light';
      setThemeOnDocument(newTheme);
    };

    onMounted(() => {
      let savedTheme = localStorage.getItem('app-theme');
      if (!savedTheme || (savedTheme !== 'light' && savedTheme !== 'dark')) {
        savedTheme = 'light'; // Default to light if invalid or not set
      }
      setThemeOnDocument(savedTheme);
      updateTitle();
    });

    watch(() => route.path, () => {
      updateTitle();
    });

    return {
      theme,
      toggleTheme,
      appTitle
    };
  },
});
</script>

<style scoped>
/* Pixel Art Styles for TopToolbar */
.top-toolbar {
  background-color: var(--toolbar-bg-color);
  padding: 4px 8px; /* Reduced padding for pixel style */
  /* box-shadow: none; /* No smooth shadows in pixel art */
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  box-sizing: border-box;
  border-bottom: 1px solid var(--toolbar-border-color);
  display: flex;
  align-items: center; /* Vertically center content */
  min-height: 40px; /* Example height, adjust as needed */
}

.toolbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  /* max-width: 1200px; /* This might be too large for pixel style, or handled by #app */
  margin: 0 auto;
}

.toolbar-left {
  flex: 1;
  display: flex;
  align-items: center;
}

.app-title {
  font-family: 'Press Start 2P', 'Silkscreen', sans-serif;
  font-size: 16px; /* Adjust for pixel font readability */
  color: var(--text-primary-color);
  margin: 0;
  white-space: nowrap;
}

.toolbar-center {
  flex: 0 1 auto; /* Allow shrinking but don't grow excessively */
  display: flex;
  justify-content: center;
  align-items: center;
}

.nav-link {
  font-family: 'Silkscreen', 'Press Start 2P', sans-serif;
  margin: 0 4px; /* Reduced margin */
  padding: 4px 8px;
  text-decoration: none;
  color: var(--text-primary-color);
  font-size: 12px; /* Adjust for pixel font */
  border: 1px solid var(--border-color);
  background-color: var(--card-bg-color); /* Or transparent and border only */
  border-radius: 0; /* Hard edges */
  transition: none; /* No smooth transitions */
  white-space: nowrap;
}

.nav-link.active {
  background-color: var(--primary-color);
  color: var(--pixel-bg-light); /* Assuming primary color is dark enough for light text */
  border-color: var(--primary-color);
}

.dark-theme .nav-link.active {
 color: var(--pixel-bg-dark);
}

.nav-link:not(.active):hover {
  background-color: var(--accent-color);
  color: var(--pixel-text-primary-light); /* Or black/white depending on accent */
  border-color: var(--accent-color);
}

.dark-theme .nav-link:not(.active):hover {
  color: var(--pixel-text-primary-dark);
}

.toolbar-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.theme-toggle-btn {
  /* Uses .pixel-button from global style.css, but can add specifics */
  padding: 4px 8px;
  font-size: 12px; /* Match nav-link or set as needed */
  min-width: 40px; /* Ensure decent tap target / visual balance */
  text-align: center;
}

/* Responsive adjustments for pixel style (might be less about scaling, more about layout changes) */
@media (max-width: 480px) {
  .app-title {
    font-size: 12px; /* Further reduce if needed, or hide */
    /* display: none; /* Option to hide title on very small screens */
  }
  .nav-link {
    font-size: 10px;
    padding: 4px 6px;
    margin: 0 2px;
  }
  .theme-toggle-btn {
    font-size: 10px;
    padding: 4px 6px;
    min-width: 30px;
  }
  .top-toolbar {
    padding: 4px;
    min-height: 32px;
  }
}

.pixel-border-bottom {
    border-bottom: 1px solid var(--toolbar-border-color);
}

.pixel-button {
  /* This class can be used for nav-link and theme-toggle-btn if styles are identical */
  /* Styles are mostly defined in style.css for global button */
}

</style>
