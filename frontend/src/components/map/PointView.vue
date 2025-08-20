<template>
  <div 
    id="pointview" 
    :class="{ 'dark-mode': isDarkMode }"
    :style="pointviewStyle"
  >
    {{ point }}
  </div>
</template>

<script setup>
import { computed, watch, ref, nextTick } from 'vue';
import { currentTheme } from '@/eventBus';

defineProps({
  point: {
    type: String,
    default: ""
  }
})

const isDarkMode = computed(() => currentTheme.value === 'dark');
const forceUpdate = ref(0);

// 监听主题变化
watch(currentTheme, async (newTheme) => {
  console.log('Theme changed to:', newTheme);
  forceUpdate.value++; // 强制重新渲染
  
  // 等待DOM更新后强制应用样式
  await nextTick();
  const pointviewElement = document.getElementById('pointview');
  if (pointviewElement && isDarkMode.value) {
    pointviewElement.style.setProperty('background-color', '#374151', 'important');
    pointviewElement.style.setProperty('border-color', '#6b7280', 'important');
    pointviewElement.style.setProperty('color', '#f9fafb', 'important');
    pointviewElement.style.setProperty('border', '1px solid #6b7280', 'important');
  } else if (pointviewElement) {
    pointviewElement.style.setProperty('background-color', 'white', 'important');
    pointviewElement.style.setProperty('border-color', '#e5e7eb', 'important');
    pointviewElement.style.setProperty('color', '#374151', 'important');
    pointviewElement.style.setProperty('border', '1px solid #e5e7eb', 'important');
  }
});

// 使用内联样式强制应用深色模式
const pointviewStyle = computed(() => {
  console.log('Computing style, isDarkMode:', isDarkMode.value);
  if (isDarkMode.value) {
    return {
      backgroundColor: '#374151 !important',
      borderColor: '#6b7280 !important',
      color: '#f9fafb !important',
      border: '1px solid #6b7280 !important',
      background: '#374151 !important'
    };
  }
  return {
    backgroundColor: 'white !important',
    borderColor: '#e5e7eb !important',
    color: '#374151 !important',
    border: '1px solid #e5e7eb !important',
    background: 'white !important'
  };
});
</script>

<style scoped>
#pointview {
  position: absolute;
  bottom: 40px;
  left: 10px;
  width: 130px;
  height: auto;
  min-height: 5px;
  padding: 8px;
  white-space: pre-line;
  border-radius: 4px;
  font-size: 14px;
  z-index: 9999;
  /* 确保不被侧边栏覆盖 */
  margin-left: 0;
}

#pointview.dark-mode {
  background-color: #374151 !important;
  border-color: #6b7280 !important;
  color: #f9fafb !important;
}
</style>