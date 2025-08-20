<template>
  <div class="locate-widget">
    <div
      @click="handleLocate"
      :title="buttonTitle"
      class="locate-button"
      :class="{ 'locating': isLocating }"
    >
      <el-icon v-if="!isLocating" class="locate-icon">
        <Location />
      </el-icon>
      <el-icon v-else class="locate-icon loading">
        <Loading />
      </el-icon>
    </div>
    
    <!-- 定位状态提示 -->
    <el-alert
      v-if="locationMessage"
      :title="locationMessage"
      :type="locationType"
      show-icon
      :closable="false"
      class="location-alert"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Location, Loading } from '@element-plus/icons-vue'
import Locate from '@arcgis/core/widgets/Locate'
import Graphic from '@arcgis/core/Graphic'
import Point from '@arcgis/core/geometry/Point'
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol'

const props = defineProps({
  view: {
    type: Object,
    required: true
  }
})

const isLocating = ref(false)
const locationMessage = ref('')
const locationType = ref('info')
const currentLocation = ref(null)

// 计算属性
const buttonTitle = computed(() => {
  if (isLocating.value) {
    return '正在定位...'
  }
  return '定位我的位置'
})

// 定位处理函数
const handleLocate = async () => {
  if (!props.view) {
    showMessage('地图未加载', 'error')
    return
  }

  isLocating.value = true
  locationMessage.value = '正在获取您的位置...'
  locationType.value = 'info'

  try {
    // 检查浏览器是否支持地理位置
    if (!navigator.geolocation) {
      showMessage('您的浏览器不支持地理位置功能', 'error')
      return
    }

    // 获取当前位置
    const position = await getCurrentPosition()
    const { latitude, longitude } = position.coords

    // 清除之前的定位点
    clearLocationGraphic()

    // 创建定位点图形
    const point = new Point({
      longitude: longitude,
      latitude: latitude
    })

    const symbol = new SimpleMarkerSymbol({
      color: [0, 122, 255, 0.8],
      size: 12,
      outline: {
        color: [255, 255, 255, 0.8],
        width: 2
      }
    })

    const locationGraphic = new Graphic({
      geometry: point,
      symbol: symbol,
      attributes: {
        type: 'location',
        timestamp: new Date().toISOString()
      }
    })

    // 添加到地图
    props.view.graphics.add(locationGraphic)
    currentLocation.value = locationGraphic

    // 跳转到定位点
    await props.view.goTo({
      target: point,
      zoom: 16
    })

    showMessage(`定位成功！您的位置：${longitude.toFixed(6)}, ${latitude.toFixed(6)}`, 'success')
    
    // 3秒后清除消息
    setTimeout(() => {
      locationMessage.value = ''
    }, 3000)

  } catch (error) {
    console.error('定位失败:', error)
    let errorMessage = '定位失败'
    
    switch (error.code) {
      case 1:
        errorMessage = '定位被拒绝，请允许浏览器获取位置信息'
        break
      case 2:
        errorMessage = '无法获取位置信息，请检查网络连接'
        break
      case 3:
        errorMessage = '定位超时，请重试'
        break
      default:
        errorMessage = '定位失败，请重试'
    }
    
    showMessage(errorMessage, 'error')
  } finally {
    isLocating.value = false
  }
}

// 获取当前位置的Promise包装
const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    })
  })
}

// 清除定位图形
const clearLocationGraphic = () => {
  if (currentLocation.value) {
    props.view.graphics.remove(currentLocation.value)
    currentLocation.value = null
  }
}

// 显示消息
const showMessage = (message, type) => {
  locationMessage.value = message
  locationType.value = type
}

// 组件卸载时清理
onBeforeUnmount(() => {
  clearLocationGraphic()
})
</script>

<style scoped>
.locate-widget {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}

.locate-button {
  position: absolute;
  top: 90px;
  left: 11px;
  pointer-events: auto;
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid #e4e7ed;
  color: #606266;
  font-size: 14px;
  width: 40px;
  height: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 10000;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.locate-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

.locate-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.locate-button.locating {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

.locate-icon {
  font-size: 16px;
  transition: all 0.3s ease;
}

.locate-icon.loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.location-alert {
  position: absolute;
  top: 170px;
  left: 16px;
  max-width: 280px;
  z-index: 10001;
  pointer-events: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style> 