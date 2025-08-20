

<template>
  <div v-if="visible" class="modal" @click.self="handleOutsideClick">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title"><i class="fa fa-cog mr-2" aria-hidden="true"></i>{{ t('systemSettings') }}</h2>
        <span class="close" @click="close">&times;</span>
      </div>
    <div class="modal-body">
                <div class="mt-4 space-y-4">
                    <div class="bg-gray-50 rounded-lg p-4">
                        <h3 class="font-medium text-gray-800 mb-3">{{ t('appearanceSettings') }}</h3>
                        <div class="space-y-3">
                            <div class="flex items-center justify-between">
                                <span>{{ t('themeMode') }}</span>
                                <div class="flex items-center">
                                    <button 
                                        @click="setTheme('light')"
                                        :class="[
                                            'px-3 py-1 rounded-l-md transition-colors',
                                            currentTheme === 'light' 
                                                ? 'bg-blue-500 text-white' 
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        ]"
                                    >
                                        {{ t('light') }}
                                    </button>
                                    <button 
                                        @click="setTheme('dark')"
                                        :class="[
                                            'px-3 py-1 rounded-r-md transition-colors',
                                            currentTheme === 'dark' 
                                                ? 'bg-blue-500 text-white' 
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        ]"
                                    >
                                        {{ t('dark') }}
                                    </button>
                                </div>
                            </div>
                            <div class="flex items-center justify-between">
                                <span>{{ t('mapStyle') }}</span>
                                <select :value="currentMapStyle" class="px-3 py-1 border border-gray-300 rounded-md" name="map-style" @change="onMapStyleChange">
                                    <option value="0">{{ t('standard') }}</option>
                                    <option value="1">{{ t('satellite') }}</option>
                                    <option value="2">{{ t('terrain') }}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-4">
                        <h3 class="font-medium text-gray-800 mb-3">{{ t('languageAndRegion') }}</h3>
                        <div>
                            <div class="flex items-center justify-between">
                                <span>{{ t('displayLanguage') }}</span>
                                <select 
                                    :value="currentLanguage" 
                                    class="px-3 py-1 border border-gray-300 rounded-md" 
                                    name="language"
                                    @change="onLanguageChange"
                                >
                                    <option value="zh">{{ t('simplifiedChinese') }}</option>
                                    <option value="en">{{ t('english') }}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

      <div class="modal-footer">
        <button class="modal-btn modal-btn-secondary" @click="close">{{ t('cancel') }}</button>
        <button class="modal-btn modal-btn-primary" @click="saveSettings">{{ t('saveSettings') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue';
import emitter, { currentMapStyle, currentLanguage, currentTheme } from '@/eventBus'

const props = defineProps({
  visible: Boolean
});

const emit = defineEmits(['close']);

// 语言包
const translations = {
  zh: {
    systemSettings: '系统设置',
    appearanceSettings: '外观设置',
    themeMode: '主题模式',
    light: '浅色',
    dark: '深色',
    mapStyle: '地图样式',
    standard: '标准',
    satellite: '卫星',
    terrain: '地形',
    languageAndRegion: '语言与地区',
    displayLanguage: '显示语言',
    simplifiedChinese: '简体中文',
    english: 'English',
    cancel: '取消',
    saveSettings: '保存设置'
  },
  en: {
    systemSettings: 'System Settings',
    appearanceSettings: 'Appearance Settings',
    themeMode: 'Theme Mode',
    light: 'Light',
    dark: 'Dark',
    mapStyle: 'Map Style',
    standard: 'Standard',
    satellite: 'Satellite',
    terrain: 'Terrain',
    languageAndRegion: 'Language & Region',
    displayLanguage: 'Display Language',
    simplifiedChinese: '简体中文',
    english: 'English',
    cancel: 'Cancel',
    saveSettings: 'Save Settings'
  }
};

// 翻译函数
const t = (key) => {
  return translations[currentLanguage.value][key] || key;
};

const onMapStyleChange = (event) => {
  const value = event.target.value
  currentMapStyle.value = value
  emitter.emit('map-style-changed', value)
}

const onLanguageChange = (event) => {
  const value = event.target.value
  currentLanguage.value = value
  emitter.emit('language-changed', value)
}

const setTheme = (theme) => {
  currentTheme.value = theme
  emitter.emit('theme-changed', theme)
  // 应用主题到 body
  document.body.className = theme === 'dark' ? 'dark' : ''
}

const saveSettings = () => {
  // 保存设置到 localStorage
  localStorage.setItem('language', currentLanguage.value)
  localStorage.setItem('theme', currentTheme.value)
  localStorage.setItem('mapStyle', currentMapStyle.value)
  
  // 触发设置保存事件
  emitter.emit('settings-saved', {
    language: currentLanguage.value,
    theme: currentTheme.value,
    mapStyle: currentMapStyle.value
  })
  
  close()
}

// 初始化设置
const initSettings = () => {
  // 从 localStorage 读取设置
  const savedLanguage = localStorage.getItem('language')
  const savedTheme = localStorage.getItem('theme')
  const savedMapStyle = localStorage.getItem('mapStyle')
  
  if (savedLanguage) currentLanguage.value = savedLanguage
  if (savedTheme) {
    currentTheme.value = savedTheme
    document.body.className = savedTheme === 'dark' ? 'dark' : ''
  }
  if (savedMapStyle) currentMapStyle.value = savedMapStyle
}

// 组件挂载时初始化设置
initSettings()

// 关闭模态框
const close = () => {
  emit('close');
};

// 点击模态框外部关闭
const handleOutsideClick = (event) => {
  if (event.target.classList.contains('modal')) {
    close();
  }
};
</script>

<style scoped>
/* 保持原有的CSS样式 */
.modal {
  display: block;
  position: fixed;
  z-index: 9999;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease-out forwards;
}
.modal-content {
            background-color: #fff;
            margin: 10% auto;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            width: 80%;
            max-width: 800px;
            overflow: hidden;
            transform: translateY(-20px);
            opacity: 0;
            animation: slideIn 0.4s ease-out forwards 0.1s;
        }

        .modal-header {
            padding: 20px 30px;
            background-color: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-title {
            font-size: 1.5rem;
            font-weight: 500;
            color: #1f2937;
        }

        .close {
            color: #9ca3af;
            font-size: 1.5rem;
            font-weight: bold;
            transition: color 0.2s;
        }

        .close:hover,
        .close:focus {
            color: #1f2937;
            text-decoration: none;
            cursor: pointer;
        }

        .modal-body {
            padding: 30px;
            line-height: 1.6;
            color: #4b5563;
        }

        .modal-footer {
            padding: 20px 30px;
            background-color: #f9fafb;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: flex-end;
        }

        .modal-btn {
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 500;
            transition: all 0.2s;
            margin-left: 10px;
        }

        .modal-btn-primary {
            background-color: #3b82f6;
            color: white;
        }

        .modal-btn-primary:hover {
            background-color: #2563eb;
        }

        .modal-btn-secondary {
            background-color: #f3f4f6;
            color: #4b5563;
        }

        .modal-btn-secondary:hover {
            background-color: #e5e7eb;
        }

        /* 弹窗动画 */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideIn {
            from { 
                transform: translateY(-20px);
                opacity: 0;
            }
            to { 
                transform: translateY(0);
                opacity: 1;
            }
        }

        /* 响应式调整 */
        @media (max-width: 768px) {
            .modal-content {
                width: 90%;
                margin: 15% auto;
            }
        }
</style>