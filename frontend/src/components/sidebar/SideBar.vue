<template>
  <div class="w-56 h-full flex flex-col items-center pt-6 space-y-5 bg-white">
    <div class="sidebar-title">功能区</div>
    <button @click="openModal('my-collection')" class="function-btn w-4/5 py-3 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
      <div class="flex items-center justify-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        我的收藏
      </div>
    </button>
    <div class="sidebar-divider"></div>
    <button @click="openModal('travel-plan-management')" class="function-btn w-4/5 py-3 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200">
      <div class="flex items-center justify-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
        行程管理
      </div>
    </button>
    <div class="sidebar-divider"></div>
    <button @click="openModal('system-settings')" class="function-btn w-4/5 py-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
      <div class="flex items-center justify-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        系统设置
      </div>
    </button>
  </div>
</template>

<script setup>
import emitter from '@/eventBus';
import { currentLanguage } from '@/eventBus';

// 语言包
const translations = {
  zh: {
    mapTools: '地图工具',
    locationMarking: '地点标记',
    routeSharing: '路线分享',
    itineraryManagement: '行程管理',
    systemSettings: '系统设置'
  },
  en: {
    mapTools: 'Map Tools',
    locationMarking: 'Location Marking',
    routeSharing: 'Route Sharing',
    itineraryManagement: 'Itinerary Management',
    systemSettings: 'System Settings'
  }
};

// 翻译函数
const t = (key) => {
  return translations[currentLanguage.value]?.[key] || translations.zh[key] || key;
};

const openModal = (modalName) => {
  emitter.emit('open-modal', modalName);
};
</script>

<style scoped>
.sidebar-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 10px;
  letter-spacing: 1px;
}
.sidebar-divider {
  width: 80%;
  height: 1px;
  background: #e5e7eb;
  margin: 10px 0;
  border-radius: 1px;
}
</style>