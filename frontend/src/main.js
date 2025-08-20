import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import SearchBar from './components/topbar/SearchBar.vue'
import emitter, { currentLanguage, currentTheme } from './eventBus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
import zhCn from "element-plus/es/locale/lang/zh-cn"
import 'element-plus/dist/index.css'

import '@arcgis/core/assets/esri/themes/light/main.css'
import esriConfig from '@arcgis/core/config'
esriConfig.portalUrl = "https://ws8575.club/web"

// 初始化应用设置
const initAppSettings = () => {
  // 从 localStorage 读取设置
  const savedLanguage = localStorage.getItem('language')
  const savedTheme = localStorage.getItem('theme')
  
  // 应用语言设置
  if (savedLanguage) {
    currentLanguage.value = savedLanguage
  }
  
  // 应用主题设置
  if (savedTheme) {
    currentTheme.value = savedTheme
    document.body.className = savedTheme === 'dark' ? 'dark' : ''
  }
}

// 在应用创建前初始化设置
initAppSettings()

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
     app.component(key, component)
 }

// 创建事件总线,更改
app.config.globalProperties.$eventBus = {
  _events: {},
  $on(event, callback) {
    if (!this._events[event]) this._events[event] = []
    this._events[event].push(callback)
  },
  $emit(event, ...args) {
    const callbacks = this._events[event]
    if (callbacks) {
      callbacks.forEach(callback => callback(...args))
    }
  }
}

app.use(ElementPlus, { locale: zhCn })

//全局挂载事件总线
app.config.globalProperties.emitter = emitter

// // 在DOM加载完成后初始化SearchBar
// document.addEventListener('DOMContentLoaded', () => {
//   const searchContainer = document.getElementById('search-bar-container')
//   if (searchContainer) {
//     const searchApp = createApp(SearchBar, {
//       view: window.view // 使用全局的view对象
//     })
//     searchApp.mount(searchContainer)
//   }
// })

 
app.mount('#app')