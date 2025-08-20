<template>
  <div class="relative" style="width: 400px">
    <input 
      type="text" 
      v-model="searchTerm"
      @keyup.enter="handleSearch"
      :placeholder="t('searchPlaceholder')" 
      class="search-box w-full px-5 py-3 rounded-full border-0 focus:ring-2 focus:ring-blue-300 focus:outline-none"
    >
    <button 
      @click="handleSearch"
      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400"
    >
    <svg t="1755070912454" class="icon" viewBox="0 0 1034 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11954" width="24px" height="24px"><path d="M346.352941 346.352941m-346.352941 0a346.352941 346.352941 0 1 0 692.705882 0 346.352941 346.352941 0 1 0-692.705882 0Z" fill="#8CF6FB" p-id="11955"></path><path d="M421.647059 843.294118C188.235294 843.294118 0 655.058824 0 421.647059S188.235294 0 421.647059 0s421.647059 188.235294 421.647059 421.647059-188.235294 421.647059-421.647059 421.647059z m0-768C230.4 75.294118 75.294118 230.4 75.294118 421.647059s155.105882 346.352941 346.352941 346.352941 346.352941-155.105882 346.352941-346.352941S612.894118 75.294118 421.647059 75.294118z" fill="#3C2DCB" p-id="11956"></path><path d="M1022.494118 1011.952941c-15.058824 15.058824-39.152941 15.058824-52.705883 0L757.458824 799.623529c-15.058824-15.058824-13.552941-39.152941 1.505882-52.705882 15.058824-13.552941 37.647059-13.552941 52.705882 0L1024 959.247059c13.552941 13.552941 13.552941 37.647059-1.505882 52.705882z" fill="#D098FF" p-id="11957"></path></svg>    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Search from '@arcgis/core/widgets/Search'
import { currentLanguage } from '@/eventBus'

const props = defineProps({ view: Object })
const searchTerm = ref('')

// 语言包
const translations = {
  zh: {
    searchPlaceholder: '输入目的地、景点或地址...'
  },
  en: {
    searchPlaceholder: 'Enter destination, attraction or address...'
  }
};

// 翻译函数
const t = (key) => {
  return translations[currentLanguage.value]?.[key] || translations.zh[key] || key;
};

const handleSearch = async () => {
  if (!props.view || !searchTerm.value.trim()) return

  const searchWidget = new Search({ view: props.view })

  try {
    const results = await searchWidget.search(searchTerm.value)
    if (results.results?.length > 0) {
      const result = results.results[0]
      await props.view.goTo(result.feature.geometry) // ✅ 地图定位
      props.view.popup.open({
        features: [result.feature],
        location: result.feature.geometry
      })
    }
  } catch (err) {
    console.error('搜索失败:', err)
  }
}
</script>

<style scoped>
.search-box {
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
</style>