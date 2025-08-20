<template>
  <div class="layer-category-bar">
    <div v-for="item in allCategories" :key="item.value" style="position:relative;">
      <button :class="['category-btn', item.value, {active: activeCategory===item.value}]" @click="openFilter(item.value, $event)">
        <span class="label">{{item.label}}</span>
        <span class="dropdown-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" fill="#333"/></svg>
        </span>
      </button>
      <CategoryFilterPanel v-show="showFilter && filterCategory===item.value" :category="filterCategory" :modelValue="filterValues[item.value]" @update:modelValue="v=>filterValues[item.value]=v" @ok="onFilterOk(item.value, $event)" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import CategoryFilterPanel from './CategoryFilterPanel.vue'
import { SuitcaseLine, ForkSpoon, ShoppingBag, Location, Tickets } from '@element-plus/icons-vue'

const emit = defineEmits(['select','filter'])

const allCategories = [
  { label: '景点', value: 'scenic' },
  { label: '酒店', value: 'hotel' },
  { label: '美食', value: 'food' },
  { label: '机场', value: 'airport' },
  { label: '火车站', value: 'train' },
]

const activeCategory = ref('scenic')
const showFilter = ref(false)
const filterCategory = ref('scenic')
const filterValues = reactive({
  scenic: {},
  hotel: {},
  food: {},
  shopping: {},
  airport: {},
  train: {},
})

function openFilter(category, event) {
  filterCategory.value = category
  showFilter.value = true
  activeCategory.value = category
  event?.stopPropagation()
}
function onFilterOk(category, values) {
  showFilter.value = false
  emit('filter', { category, values })
}
function closeFilter() {
  showFilter.value = false
}
function handleClickOutside(e) {
  if (!e.target.closest('.filter-panel')) {
    showFilter.value = false
  }
}
onMounted(()=>{
  window.addEventListener('click', handleClickOutside)
})
onBeforeUnmount(()=>{
  window.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.layer-category-bar {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  position: absolute;
  top: 16px;
  left: 72px;
  z-index: 10001;
}
.category-btn {
  display: flex;
  align-items: center;
  background: #fff;
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  height: 38px;
  padding: 0 20px;
  font-size: 15px;
  color: #333;
  cursor: pointer;
  outline: none;
  transition: background 0.2s, color 0.2s;
  position: relative;
}
.category-btn .icon {
  margin-right: 6px;
  font-size: 18px;
  display: flex;
  align-items: center;
}
.dropdown-arrow {
  margin-left: 6px;
  display: flex;
  align-items: center;
}
/* .category-btn.hotel .icon { color: #3498db; }
.category-btn.food .icon { color: #e67e22; }
.category-btn.shopping .icon { color: #e84393; }
.category-btn.airport .icon { color: #8e44ad; }
.category-btn.train .icon { color: #636e72; } */
.category-btn.active, .category-btn:hover {
  background: #e6f7ff;
  color: #1890ff;
}
.label {
  font-size: 15px;
  font-weight: normal;
}
</style> 