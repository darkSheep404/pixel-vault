<template>
  <div id="app">
    <TopToolbar />
    <main>
      <router-view />
    </main>
    <footer class="pixel-footer">
      <p>个人订阅与购买管理 &copy; 2025</p>
    </footer>
  </div>
</template>

<script>
import { defineComponent, onMounted } from 'vue';
import TopToolbar from './components/TopToolbar.vue';

export default defineComponent({
  name: 'App',
  components: {
    TopToolbar,
  },
  setup() {
    onMounted(() => {
      // Fallback theme initialization, TopToolbar should be primary.
      const savedTheme = localStorage.getItem('app-theme');
      if (savedTheme) {
        document.documentElement.classList.remove('light-theme', 'dark-theme'); // Clear existing theme classes
        document.documentElement.classList.add(savedTheme + '-theme');
      } else {
        document.documentElement.classList.remove('light-theme', 'dark-theme');
        document.documentElement.classList.add('light-theme'); // Default to light
      }
    });

    return {};
  },
});
</script>

<style>
/* App.vue specific styles - mostly layout */

/* Global styles and theme variables are now in src/style.css */

body {
  /* Body styles are now in src/style.css */
  /* Ensure it inherits pixel font and background from style.css */
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--app-bg-color); /* Uses CSS var from style.css */
  color: var(--text-primary-color); /* Uses CSS var from style.css */
  /* padding is removed, handled by main/footer or global style.css if needed */
}

main {
  flex-grow: 1;
  padding: 8px; /* Pixel-friendly padding, can be adjusted */
  /* max-width is handled by #app in style.css or can be set here if different */
  width: 100%;
  box-sizing: border-box;
  /* padding-top for fixed toolbar is handled by TopToolbar or main content wrapper if needed */
  /* For pixel style, ensure content starts below toolbar clearly */
}

.pixel-footer {
  text-align: center;
  padding: 8px; /* Pixel-friendly padding */
  background-color: var(--toolbar-bg-color); /* Match toolbar or card bg */
  color: var(--text-secondary-color);
  font-size: 12px; /* Smaller for pixel footer */
  border-top: 1px solid var(--toolbar-border-color);
  /* margin-top: auto; /* This is handled by flex-grow on main */
}

/* Remove Material Icons import, pixel icons will be handled differently */
/* @import url('https://fonts.googleapis.com/icon?family=Material+Icons'); */

</style>

