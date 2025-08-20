<!-- 旅行探索视图组件 -->
<template>
  <div class="explore-container bg-gray-50 min-h-screen">
    <!-- 顶部导航栏 -->
    <div class="sticky top-0 z-10 bg-white shadow-sm">
      <div class="max-w-screen-xl mx-auto">
        <!-- 城市和分类选择器 -->
        <div class="flex items-center justify-between p-4">
          <div class="flex items-center space-x-4">
            <div class="relative group">
              <select 
                v-model="selectedCity"
                class="appearance-none px-6 py-2 text-lg font-medium text-gray-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option v-for="city in availableCities" :key="city" :value="city">
                  {{ city }}
                </option>
              </select>
              <div class="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400">
                <i class="fa fa-chevron-down"></i>
              </div>
            </div>
            <!-- 模拟的分类标签 -->
            <div class="flex space-x-4 text-sm">
              <span class="cursor-pointer px-3 py-1 rounded-full bg-red-50 text-red-500 hover:bg-red-100">热门推荐</span>
              <span class="cursor-pointer px-3 py-1 rounded-full hover:bg-gray-100">深度游</span>
              <span class="cursor-pointer px-3 py-1 rounded-full hover:bg-gray-100">美食</span>
              <span class="cursor-pointer px-3 py-1 rounded-full hover:bg-gray-100">文化</span>
            </div>
          </div>
          <!-- 模拟的功能按钮 -->
          <div class="flex items-center space-x-4 text-gray-600">
            <button class="p-2 hover:bg-gray-50 rounded-full">
              <i class="fa fa-compass text-xl"></i>
            </button>
            <button class="p-2 hover:bg-gray-50 rounded-full">
              <i class="fa fa-bell text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 攻略卡片瀑布流 -->
    <div class="guides-grid p-6 columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
      <div 
        v-for="guide in currentCityGuides" 
        :key="guide.id"
        class="guide-card bg-white rounded-2xl shadow-lg overflow-hidden mb-6 break-inside-avoid-column hover:shadow-xl transition-shadow duration-300"
      >
        <!-- 卡片图片 -->
        <div 
          class="relative aspect-[4/3] overflow-hidden cursor-pointer group" 
          @click="showGuideDetail(guide)"
        >
          <img 
            :src="guide.coverImage" 
            :alt="guide.title"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          >
          <!-- 悬浮标签 -->
          <div class="absolute top-3 left-3 flex space-x-2">
            <span class="px-2 py-1 bg-black bg-opacity-30 backdrop-blur-sm rounded-full text-white text-xs">
              {{ guide.pois.length }} 景点
            </span>
            <span class="px-2 py-1 bg-black bg-opacity-30 backdrop-blur-sm rounded-full text-white text-xs">
              {{ Math.floor(Math.random() * 1000) + 1 }}km
            </span>
          </div>
        </div>
        
        <!-- 卡片内容 -->
        <div class="p-4">
          <!-- 用户信息 -->
          <div class="flex items-center mb-3">
            <div class="w-8 h-8 rounded-full overflow-hidden mr-2">
              <img 
                :src="'https://picsum.photos/32/32?random=' + guide.id" 
                class="w-full h-full object-cover"
                alt="用户头像"
              >
            </div>
            <div class="flex-1">
              <div class="text-sm font-medium">城市领航员</div>
              <div class="text-xs text-gray-500">{{ new Date().toLocaleDateString() }}</div>
            </div>
            <button 
              class="px-4 py-1 rounded-full text-sm border border-red-500 text-red-500 hover:bg-red-50 transition-colors duration-300"
            >
              关注
            </button>
          </div>
          
          <!-- 标题和描述 -->
          <h3 class="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{{ guide.title }}</h3>
          <p class="text-sm text-gray-600 mb-3 line-clamp-2">
            {{ guide.content.split('\n')[3].trim() }}
          </p>

          <!-- 互动栏 -->
          <div class="flex items-center justify-between text-gray-500 pt-3 border-t">
            <div class="flex items-center space-x-4">
              <button class="flex items-center space-x-1 hover:text-red-500">
                <i class="fa fa-heart-o"></i>
                <span>{{ Math.floor(Math.random() * 1000) }}</span>
              </button>
              <button class="flex items-center space-x-1 hover:text-blue-500">
                <i class="fa fa-comment-o"></i>
                <span>{{ Math.floor(Math.random() * 100) }}</span>
              </button>
            </div>
            <button class="hover:text-gray-700">
              <i class="fa fa-share-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 攻略详情模态框 -->
    <div 
      v-if="selectedGuide"
      class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="closeGuideDetail"
    >
      <div class="bg-white rounded-2xl max-w-4xl w-11/12 max-h-[90vh] overflow-y-auto">
        <!-- 图片轮播 -->
        <div class="relative bg-gray-900">
          <div class="aspect-[16/9] overflow-hidden">
            <img 
              :src="selectedGuide.images[currentImageIndex]" 
              :alt="selectedGuide.title"
              class="w-full h-full object-cover"
            >
            <!-- 图片指示器 -->
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              <button 
                v-for="(_, index) in selectedGuide.images" 
                :key="index"
                :class="[
                  'w-2 h-2 rounded-full transition-all duration-300',
                  currentImageIndex === index ? 'bg-white w-6' : 'bg-white/50'
                ]"
                @click="currentImageIndex = index"
              ></button>
            </div>
          </div>
          <!-- 轮播控制按钮 -->
          <button 
            @click="prevImage" 
            class="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
            v-if="selectedGuide.images.length > 1"
          >
            <i class="fa fa-chevron-left"></i>
          </button>
          <button 
            @click="nextImage" 
            class="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
            v-if="selectedGuide.images.length > 1"
          >
            <i class="fa fa-chevron-right"></i>
          </button>
        </div>

        <!-- 详情内容 -->
        <div class="p-8">
          <!-- 作者信息 -->
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 rounded-full overflow-hidden mr-3 ring-2 ring-red-500 ring-offset-2">
              <img 
                :src="'https://picsum.photos/48/48?random=' + selectedGuide.id" 
                class="w-full h-full object-cover"
                alt="作者头像"
              >
            </div>
            <div class="flex-1">
              <div class="flex items-center">
                <span class="font-medium text-lg mr-2">城市领航员</span>
                <span class="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full">官方认证</span>
              </div>
              <div class="text-sm text-gray-500">{{ new Date().toLocaleDateString() }} · 已更新</div>
            </div>
            <button class="px-6 py-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl">
              关注作者
            </button>
          </div>

          <h2 class="text-3xl font-bold text-gray-800 mb-4">{{ selectedGuide.title }}</h2>

          <!-- 互动数据 -->
          <div class="flex items-center space-x-6 mb-6 text-gray-500">
            <span class="flex items-center">
              <i class="fa fa-eye mr-2"></i>
              {{ Math.floor(Math.random() * 10000) }} 浏览
            </span>
            <span class="flex items-center">
              <i class="fa fa-heart-o mr-2"></i>
              {{ Math.floor(Math.random() * 1000) }} 喜欢
            </span>
            <span class="flex items-center">
              <i class="fa fa-bookmark-o mr-2"></i>
              {{ Math.floor(Math.random() * 500) }} 收藏
            </span>
          </div>

          <!-- 景点列表 -->
          <div class="mb-8 bg-gray-50 rounded-2xl p-6">
            <h3 class="text-xl font-semibold text-gray-700 mb-4 flex items-center">
              <i class="fa fa-map-marker text-red-500 mr-2"></i>
              行程景点
            </h3>
            <div class="flex flex-wrap gap-3">
              <span 
                v-for="poi in selectedGuide.pois" 
                :key="poi"
                class="px-4 py-2 bg-white shadow-sm hover:shadow rounded-full text-sm flex items-center group cursor-pointer transition-all duration-300 hover:bg-red-50"
              >
                <span class="mr-2">{{ poi }}</span>
                <i class="fa fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-red-500"></i>
              </span>
            </div>
          </div>

          <!-- 攻略正文 -->
          <div class="prose prose-lg max-w-none" v-html="compiledContent">
          </div>

          <!-- 底部互动栏 -->
          <div class="flex items-center justify-between mt-8 pt-6 border-t">
            <div class="flex space-x-4">
              <button class="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-gray-100">
                <i class="fa fa-thumbs-up text-xl"></i>
                <span>赞一个</span>
              </button>
              <button class="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-gray-100">
                <i class="fa fa-star text-xl"></i>
                <span>收藏</span>
              </button>
            </div>
            <button class="flex items-center space-x-2 px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600">
              <i class="fa fa-share-alt"></i>
              <span>分享攻略</span>
            </button>
          </div>
        </div>

        <!-- 关闭按钮 -->
        <button 
          @click="closeGuideDetail" 
          class="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
        >
          <i class="fa fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { travelGuides } from '../../data/travelGuides';
import { marked } from 'marked';

export default {
  name: 'ExploreView',
  setup() {
    const selectedCity = ref(Object.keys(travelGuides)[0]);
    const selectedGuide = ref(null);
    const currentImageIndex = ref(0);
    const favorites = ref(new Set());

    // 计算可用城市列表
    const availableCities = computed(() => Object.keys(travelGuides));

    // 计算当前城市的攻略列表
    const currentCityGuides = computed(() => travelGuides[selectedCity.value] || []);

    // 计算已转换的 Markdown 内容
    const compiledContent = computed(() => {
      if (!selectedGuide.value) return '';
      return marked(selectedGuide.value.content);
    });

    // 显示攻略详情
    const showGuideDetail = (guide) => {
      selectedGuide.value = guide;
      currentImageIndex.value = 0;
    };

    // 关闭攻略详情
    const closeGuideDetail = () => {
      selectedGuide.value = null;
    };

    // 切换收藏状态
    const toggleFavorite = (guide) => {
      if (favorites.value.has(guide.id)) {
        favorites.value.delete(guide.id);
      } else {
        favorites.value.add(guide.id);
      }
    };

    // 检查是否已收藏
    const isFavorite = (guideId) => favorites.value.has(guideId);

    // 图片轮播控制
    const nextImage = () => {
      if (!selectedGuide.value) return;
      currentImageIndex.value = (currentImageIndex.value + 1) % selectedGuide.value.images.length;
    };

    const prevImage = () => {
      if (!selectedGuide.value) return;
      currentImageIndex.value = currentImageIndex.value === 0 
        ? selectedGuide.value.images.length - 1 
        : currentImageIndex.value - 1;
    };

    return {
      selectedCity,
      availableCities,
      currentCityGuides,
      selectedGuide,
      currentImageIndex,
      compiledContent,
      showGuideDetail,
      closeGuideDetail,
      toggleFavorite,
      isFavorite,
      nextImage,
      prevImage
    };
  }
};
</script>

<style scoped>
.explore-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background-color: #fafafa;
}

.guides-grid {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* 添加一些美化样式 */
.prose {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.prose h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.prose p {
  color: #262626;
  line-height: 1.8;
  margin-bottom: 1rem;
}

/* 添加卡片动画效果 */
.guide-card {
  transform: translateY(0);
  transition: all 0.3s ease;
}

.guide-card:hover {
  transform: translateY(-5px);
}

/* 添加图片加载动画 */
img {
  opacity: 0;
  animation: fadeIn 0.5s ease forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 响应式布局 */
@media (max-width: 768px) {
  .guides-grid {
    padding: 1rem;
    columns: 1;
  }
  
  .prose {
    font-size: 0.9rem;
  }
}

/* 美化滚动条 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}
</style>
