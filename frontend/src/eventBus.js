// eventBus.js
import mitt from 'mitt'
import { ref } from 'vue'

const emitter = mitt()

// 新增：全局地图样式
export const currentMapStyle = ref('0') // 默认标准

// 新增：全局语言设置
export const currentLanguage = ref('zh') // 默认中文

// 新增：全局主题模式
export const currentTheme = ref('light') // 默认浅色

// 开发环境下暴露到全局，方便调试
if (process.env.NODE_ENV === 'development') {
  window.emitter = emitter;
  console.log('🚀 事件总线已暴露到全局，可通过 window.emitter 访问');
}

export default emitter