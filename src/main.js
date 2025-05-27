import { createApp } from 'vue';
import { createPinia } from 'pinia'; // Import Pinia
import router from './router'; // Import router instance
import App from './App.vue';
import './style.css';

const app = createApp(App);

app.use(createPinia()); // Use Pinia
app.use(router); // Use router

app.mount('#app');

