import { reactive } from 'vue';
import { getSettings } from './api';

// 全局站点设置（名称、logo、背景图），供各组件读取
export const siteSettings = reactive({
  title: '',
  logo: '',
  background: ''
});

// 应用启动时调用一次：拉取后端配置并应用到页面标题/favicon
export async function loadSiteSettings() {
  try {
    const res = await getSettings();
    const { title, logo, background } = res.data || {};

    if (title) {
      siteSettings.title = title;
      document.title = title;
    }

    if (logo) {
      siteSettings.logo = logo;
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = logo;
    }

    if (background) {
      siteSettings.background = background;
    }
  } catch (e) {
    console.warn('加载站点设置失败，使用默认配置', e);
  }
}
