<template>
  <div class="w-full h-20 flex items-center bg-gradient-to-r from-blue-200 to-white shadow-sm">
    <!-- Logo区域 -->
    <div class="flex-shrink-0 w-56 h-full flex items-center justify-center bg-blue-500 shadow-lg">
      <div class="text-center">
        <h1 class="text-white text-3xl font-sans tracking-wider">{{ t('appTitle') }}</h1>
      </div>
    </div>
    <!-- 搜索和功能区 -->
    <div class="flex-1 h-full flex items-center px-6">
      <SearchBar v-if="view" :view="view" class="w-full max-w-2xl ml-8" />
      <div class="ml-auto flex gap-x-8">
        <button @click="openModal('ai-planning')" class="function-btn px-5 py-2 bg-white rounded-full text-blue-500 border border-blue-200 hover:bg-blue-50 hover:border-blue-300">AI智能规划</button>
        <button @click="toggleExplore" class="function-btn px-5 py-2 bg-white rounded-full text-green-500 border border-green-200 hover:bg-green-50 hover:border-green-300">
          {{ isExploring ? '返回地图' : '旅行探索' }}
        </button>
        <button @click="openModal('auth')" class="function-btn px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full text-white border border-blue-200 hover:from-blue-400 hover:to-blue-300 hover:shadow-lg transition-all duration-200 flex items-center gap-2">
          <i class="fa fa-user-circle text-lg"></i>
          <span>{{ isLoggedIn ? '退出登录' : '登录' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import  emitter  from '@/eventBus';
import { defineProps, computed, ref, watch } from 'vue'; // 添加props支持
import SearchBar from './SearchBar.vue';
import { currentLanguage } from '@/eventBus';

const props = defineProps({
  view: {
    type: Object,
    required: false,
    default: null
  }
})

// 检测登录状态
const isLoggedIn = ref(!!localStorage.getItem('token'));

// 监听登录状态变化
const updateLoginStatus = () => {
  isLoggedIn.value = !!localStorage.getItem('token');
};

// 监听storage事件
window.addEventListener('storage', updateLoginStatus);

// 监听自定义事件
emitter.on('login-status-changed', updateLoginStatus);

// 语言包
const translations = {
  zh: {
    appTitle: '智行规划师',
    routePlanning: '路线规划',
    attractionRecommendation: '景点推荐',
    transportationQuery: '交通查询',
    myCollection: '我的收藏',
    loginLogout: '登录/退出登录'
  },
  en: {
    appTitle: 'Intelligent Travel Planner',
    routePlanning: 'Route Planning',
    attractionRecommendation: 'Attractions',
    transportationQuery: 'Transport',
    myCollection: 'My Collection',
    loginLogout: 'Login/Logout'
  }
};

// 翻译函数
const t = (key) => {
  return translations[currentLanguage.value]?.[key] || translations.zh[key] || key;
};

// 打开模态框的方法
const openModal = (modalName) => {
  emitter.emit('open-modal', modalName);
};

// 探索视图状态
const isExploring = ref(false);

// 切换探索视图
const toggleExplore = () => {
  isExploring.value = !isExploring.value;
  emitter.emit('toggle-explore');
};


</script>