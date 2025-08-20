<template>
  <div v-if="visible" class="custom-popup">
    <!-- 弹窗主体 -->
    <div class="popup-container">
      <!-- 弹窗头部 -->
      <div class="popup-header">
        <div class="popup-title">
          <i class="fa fa-map-marker title-icon"></i>
          {{ title }}
        </div>
        <button class="popup-close" @click="closePopup">
          <i class="fa fa-times"></i>
        </button>
      </div>
      
      <!-- 弹窗内容 -->
      <div class="popup-content">
        <!-- 地点信息 -->
        <div class="location-info">
          <div v-if="feature && feature.attributes" class="info-grid">
            <div v-for="(value, key) in getDisplayInfo()" :key="key" class="info-item">
              <div class="info-label">{{ getLabel(key) }}</div>
              <div class="info-value">{{ value }}</div>
            </div>
          </div>
          <div v-else class="no-info">
            <i class="fa fa-info-circle"></i>
            <span>暂无详细信息</span>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="popup-actions">
          <button class="action-btn action-btn-primary" @click="addToCollection">
            <span>加入收藏</span>
          </button>
          <button class="action-btn action-btn-secondary" @click="addToItinerary">
            <span>加入行程</span>
          </button>
          <button class="action-btn action-btn-secondary" @click="viewDetails">
            <span>查看详情</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import emitter from '@/eventBus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  feature: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

// 标题
const title = computed(() => {
  if (!props.feature) return '地点信息'
  
  const attrs = props.feature.attributes
  if (!attrs) return '地点信息'
  
  // 优先显示本地名称，然后是英文名称，最后是其他标识
  if (attrs._name_local) return attrs._name_local
  if (attrs._name_global) return attrs._name_global
  if (attrs.name) return attrs.name
  if (attrs.Name) return attrs.Name // 机场名称字段
  if (attrs['景区名称']) return attrs['景区名称']
  if (attrs['景区名']) return attrs['景区名']
  if (attrs['餐厅名']) return attrs['餐厅名']
  if (attrs['酒店名']) return attrs['酒店名']
  if (attrs['名称']) return attrs['名称']
  if (attrs.Match_addr) return attrs.Match_addr
  if (attrs.id) return `地点 ${attrs.id}`
  
  return '地点信息'
})

// 获取显示信息
const getDisplayInfo = () => {
  if (!props.feature || !props.feature.attributes) return {}
  
  const attrs = props.feature.attributes
  const info = {}
  
  // 检查是否是底图要素
  if (props.feature.isBasemapFeature) {
    // 只保留中文名称、英文名称和经纬度
    if (attrs._name_local) info.name = attrs._name_local
    if (attrs._name_global) info.nameGlobal = attrs._name_global
    
    // 添加点击坐标信息
    if (props.feature.clickPoint) {
      info.longitude = props.feature.clickPoint.longitude.toFixed(6)
      info.latitude = props.feature.clickPoint.latitude.toFixed(6)
    }
  } else {
    // 显示名称、区县、类型/等级（或站点类型）、详细地址、经度、纬度
    if (attrs.name) info.name = attrs.name
    if (attrs['景区名称']) info.name = attrs['景区名称']
    if (attrs['景区名']) info.name = attrs['景区名']
    if (attrs['餐厅名']) info.name = attrs['餐厅名']
    if (attrs['酒店名']) info.name = attrs['酒店名']
    if (attrs.Name) info.name = attrs.Name // 机场名称
    
    if (attrs['所属区']) info.district = attrs['所属区']
    if (attrs['所属区县']) info.district = attrs['所属区县']
    if (attrs['区县']) info.district = attrs['区县']
    
    // 等级（全国A级景区数据）
    if (attrs['等级']) info.grade = attrs['等级']

    // 车站类型（train/subway）
    if (attrs.station) {
      info.stationType = attrs.station === 'subway' ? '地铁站' : (attrs.station === 'train' ? '火车站/高铁站' : attrs.station)
    }
    
    // 机场类型（国际/国内）
    if (attrs.kind) {
      info.airportType = attrs.kind === '国际' ? '国际机场' : (attrs.kind === '国内' ? '国内机场' : attrs.kind)
    }
    
    // 酒店：将"类型"作为"星级"展示；其他要素仍作为"类型"
    if (attrs['酒店名'] && attrs['类型'] !== undefined) {
      info.stars = attrs['类型']
    } else if (attrs['类型'] !== undefined) {
      info.type = attrs['类型']
    }
    if (attrs['餐厅类型']) info.type = attrs['餐厅类型']
    if (attrs['酒店类型']) info.type = attrs['酒店类型']
    
    if (attrs['详细地']) info.address = attrs['详细地']
    if (attrs['详细地址']) info.address = attrs['详细地址']
    if (attrs['地址']) info.address = attrs['地址']
    if (attrs.address) info.address = attrs.address // 机场地址字段
    
    if (attrs['经度']) info.longitude = attrs['经度']
    if (attrs['经度（']) info.longitude = attrs['经度（']
    if (attrs['入口lon']) info.longitude = attrs['入口lon']
    if (attrs['lng_WGS84']) info.longitude = attrs['lng_WGS84']
    
    if (attrs['纬度']) info.latitude = attrs['纬度']
    if (attrs['纬度（']) info.latitude = attrs['纬度（']
    if (attrs['入口lat']) info.latitude = attrs['入口lat']
    if (attrs['lat_WGS84']) info.latitude = attrs['lat_WGS84']
  }
  
  return info
}

// 字段标签映射
const fieldLabels = {
  // 底图要素标签
  name: '名称',
  nameGlobal: '英文名称',
  longitude: '经度',
  latitude: '纬度',
  
  // GeoJSON要素标签
  district: '区县',
  type: '类型',
  stars: '星级',
  grade: '等级',
  stationType: '站点类型',
  airportType: '机场类型',
  address: '详细地址'
}

const getLabel = (key) => {
  return fieldLabels[key] || key
}

// 关闭弹窗
const closePopup = () => {
  emit('close')
}

// 添加到收藏夹
const addToCollection = () => {
  if (props.feature) {
    // 构建标准化的地点信息对象
    const locationData = buildLocationData();
    console.log('CustomPopup: 发送 add-to-collection 事件', locationData);
    
    // 先打开模态框，给组件挂载的时间
    emitter.emit('open-modal', 'my-collection');
    
    // 延迟发送地点数据，确保组件已挂载并注册了事件监听器
    setTimeout(() => {
      emitter.emit('add-to-collection', locationData);
      console.log('CustomPopup: 延迟发送 add-to-collection 事件完成');
    }, 200); // 200ms延迟，确保组件完全挂载
  }
}

// 加入行程
const addToItinerary = () => {
  if (props.feature) {
    // 构建标准化的地点信息对象
    const locationData = buildLocationData();
    console.log('CustomPopup: 发送 add-to-itinerary 事件', locationData);
    
    // 先打开模态框，给组件挂载的时间
    emitter.emit('open-modal', 'travel-plan-management');
    
    // 延迟发送地点数据，确保组件已挂载并注册了事件监听器
    setTimeout(() => {
      emitter.emit('add-to-itinerary', locationData);
      console.log('CustomPopup: 延迟发送 add-to-itinerary 事件完成');
    }, 200); // 200ms延迟，确保组件完全挂载
  }
}

// 查看详情（保留最简实现）
const viewDetails = () => {}

// 构建标准化的地点信息对象
const buildLocationData = () => {
  console.log('CustomPopup: 开始构建地点信息', props.feature);
  if (!props.feature || !props.feature.attributes) {
    console.log('CustomPopup: 要素或属性为空');
    return null;
  }
  
  const attrs = props.feature.attributes;
  console.log('CustomPopup: 要素属性', attrs);
  
  const locationData = {
    // 基本信息
    name: getLocationName(attrs),
    address: getLocationAddress(attrs),
    longitude: getLocationLongitude(attrs),
    latitude: getLocationLatitude(attrs),
    
    // 额外信息（用于显示）
    type: getLocationType(attrs),
    district: getLocationDistrict(attrs),
    
    // 原始要素信息（保留用于调试）
    originalFeature: props.feature
  };
  
  console.log('CustomPopup: 构建的地点信息', locationData);
  return locationData;
}

// 获取地点名称
const getLocationName = (attrs) => {
  if (attrs._name_local) return attrs._name_local;
  if (attrs._name_global) return attrs._name_global;
  if (attrs.name) return attrs.name;
  if (attrs.Name) return attrs.Name; // 机场名称字段
  if (attrs['景区名称']) return attrs['景区名称'];
  if (attrs['景区名']) return attrs['景区名'];
  if (attrs['餐厅名']) return attrs['餐厅名'];
  if (attrs['酒店名']) return attrs['酒店名'];
  if (attrs['名称']) return attrs['名称'];
  if (attrs.Match_addr) return attrs.Match_addr;
  return '未知地点';
}

// 获取地点地址
const getLocationAddress = (attrs) => {
  if (attrs['详细地']) return attrs['详细地'];
  if (attrs['详细地址']) return attrs['详细地址'];
  if (attrs['地址']) return attrs['地址'];
  if (attrs.address) return attrs.address;
  return '';
}

// 获取经度
const getLocationLongitude = (attrs) => {
  if (attrs['经度']) return parseFloat(attrs['经度']);
  if (attrs['经度（']) return parseFloat(attrs['经度（']);
  if (attrs['入口lon']) return parseFloat(attrs['入口lon']);
  if (attrs['lng_WGS84']) return parseFloat(attrs['lng_WGS84']);
  if (attrs.longitude) return parseFloat(attrs.longitude);
  if (props.feature.clickPoint) return props.feature.clickPoint.longitude;
  return null;
}

// 获取纬度
const getLocationLatitude = (attrs) => {
  if (attrs['纬度']) return parseFloat(attrs['纬度']);
  if (attrs['纬度（']) return parseFloat(attrs['纬度（']);
  if (attrs['入口lat']) return parseFloat(attrs['入口lat']);
  if (attrs['lat_WGS84']) return parseFloat(attrs['lat_WGS84']);
  if (attrs.latitude) return parseFloat(attrs.latitude);
  if (props.feature.clickPoint) return props.feature.clickPoint.latitude;
  return null;
}

// 获取地点类型
const getLocationType = (attrs) => {
  if (attrs['类型'] !== undefined) return attrs['类型'];
  if (attrs['餐厅类型']) return attrs['餐厅类型'];
  if (attrs['酒店类型']) return attrs['酒店类型'];
  return '';
}

// 获取区县信息
const getLocationDistrict = (attrs) => {
  if (attrs['所属区']) return attrs['所属区'];
  if (attrs['所属区县']) return attrs['所属区县'];
  if (attrs['区县']) return attrs['区县'];
  if (attrs.district) return attrs.district;
  return '';
}
</script>

<style scoped>
.custom-popup {
  position: fixed;
  top: 80px; /* 顶部导航栏高度 */
  right: 0;
  width: 420px;
  height: calc(100vh - 80px); /* 减去顶部导航栏高度 */
  z-index: 99999;
  pointer-events: auto;
  animation: popupSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.popup-container {
  background: white;
  height: 100%;
  width: 100%;
  overflow: hidden;
  border-radius: 12px 0 0 12px;
  box-shadow: -5px 0 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(225deg, #80ffdb 0%, #5390d9 100%);
  color: white;
  flex-shrink: 0;
  border-radius: 12px 0 0 0;
}

.popup-title {
  font-weight: 600;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 18px;
  opacity: 0.9;
}

.popup-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  padding: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  font-size: 16px;
}

.popup-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.popup-content {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 #f8fafc;
}

.popup-content::-webkit-scrollbar {
  width: 6px;
}

.popup-content::-webkit-scrollbar-track {
  background: #f8fafc;
}

.popup-content::-webkit-scrollbar-thumb {
  background-color: #e2e8f0;
  border-radius: 3px;
}

.location-info {
  margin-bottom: 20px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.info-grid {
  display: grid;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #64748b;
  font-weight: 500;
  font-size: 12px;
  margin-bottom: 4px;
}

.info-value {
  color: #1e293b;
  font-weight: 600;
  font-size: 14px;
  word-break: break-word;
}

.no-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 14px;
  padding: 24px 12px;
  text-align: center;
  justify-content: center;
}

.no-info i {
  font-size: 32px;
  opacity: 0.5;
}

.popup-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  padding-top: 10px;
}

.action-btn {
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
}

/* 已删除按钮图标 */

.action-btn-secondary {
  background: white;
  color: #475569;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.action-btn-primary {
  background: white;
  color: #475569;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.action-btn-primary:hover, .action-btn-secondary:hover {
  background: #f1f5f9;
  color: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
}

@keyframes popupSlideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .custom-popup {
    width: 180px;
  }
}
</style>