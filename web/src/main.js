import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { loadSiteSettings } from './settings';

// 启动前先拉取站点设置（名称/logo/背景图），避免加载后闪烁
loadSiteSettings().finally(() => {
  createApp(App).use(router).mount('#app');
}); 