<template>
  <div id="container" >
    <!-- 顶部导航栏 -->
    <TopBar :view="view"  class="h-20"/> <!-- 传递view对象 -->
    
    
    <!-- 主内容区 -->
    <div class="h-[calc(100vh-5rem)] w-full flex">
      <SideBar class="w-48" />
      <!-- 主地图区域 -->
      <div v-if="!showExplore" id="viewDiv" class="flex-1 relative">
        <PointView :point="pointview" />
        <LocateWidget :view="view" v-if="view" />
        <LayerCategoryBar @select="onCategorySelect" @filter="onFilter" />
        <!-- 测量距离小组件 -->
       
        <div id="measurementWidget" class="absolute top-4 right-4 z-10"></div>
        <CustomPopup 
          :visible="popupVisible" 
          :feature="selectedFeature" 
          @close="closePopup"
        />
      </div>
      <!-- 探索视图 -->
      <ExploreView v-else class="flex-1" />
    </div>
    
    <!-- 模态框容器 -->
    <ModalContainer />
  </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'
import WebMap from '@arcgis/core/WebMap'
import MapView from '@arcgis/core/views/MapView'
import Graphic from '@arcgis/core/Graphic'
import PopupTemplate from '@arcgis/core/PopupTemplate'
import DistanceMeasurement2D from '@arcgis/core/widgets/DistanceMeasurement2D'
import PointView from './components/map/PointView.vue'
import LocateWidget from './components/map/LocateWidget.vue'
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer'
import TopBar from './components/topbar/TopBar.vue'
import SideBar from './components/sidebar/SideBar.vue'
import ModalContainer from './components/ModalContainer.vue'
import LayerCategoryBar from './components/map/LayerCategoryBar.vue'
import ExploreView from './components/explore/ExploreView.vue'
import CustomPopup from './components/map/CustomPopup.vue'
import emitter from './eventBus'


// 1. 彻底禁止 body 滚动
function preventScroll() {
  document.body.style.overflow = 'hidden';
  document.body.style.height = '100vh';   // 防止 iOS 回弹
}

// 2. 恢复 body 滚动
function restoreScroll() {
  document.body.style.overflow = '';
  document.body.style.height = '';
  window.scrollTo(0, 0);                  // 保险：回到顶部
}

// 是否显示探索视图
const showExplore = ref(false)
// 监听探索视图切换事件
emitter.on('toggle-explore', () => {
  const prevShowExplore = showExplore.value
  showExplore.value = !showExplore.value
  
  // 当从探索视图切换回地图视图时，重新初始化地图
  if (prevShowExplore && !showExplore.value) {
    setTimeout(() => {
      // 确保视图容器存在
      const container = document.getElementById('viewDiv')
      if (container) {
        // 清除旧视图
        if (view) {
          view.destroy()
          view = null
        }
        // 重新创建地图和视图
        loadMap(currentBasemapId.value)
        console.log('地图已重新初始化')
      }
    }, 100) // 增加延迟时间，确保DOM已准备好
  }
})

// 自定义弹窗相关
const popupVisible = ref(false)
const selectedFeature = ref(null)

// 关闭弹窗
const closePopup = () => {
  popupVisible.value = false
  selectedFeature.value = null
}

var webmap, view
var scenic_point_layer, 西安住宿_layer, 西安餐厅_layer, station_layer, airport_layer

const pointview = ref("")

const currentBasemapId = ref('aaafb684f0e64b5bb62fdf4ff525d209') // 默认底图ID
const basemapMapping = {
  '0': 'aaafb684f0e64b5bb62fdf4ff525d209', // 标准
  '1': '529988b922ce4174bacb06d35e61134f', // 卫星
  '2': '3cd9abd05ac64fa79f186d0b9db73ff8'// 地形
}

// 监听地图样式变化
import { currentMapStyle } from './eventBus'

emitter.on('map-style-changed', (value) => {
  currentMapStyle.value = value
  const newBasemapId = basemapMapping[value]
  if (newBasemapId && view) {
    loadMap(newBasemapId)
  }
})

// 提取地图加载逻辑为单独函数
const loadMap = (basemapId) => {
  webmap = new WebMap({
    portalItem: {
      id: basemapId,  // 使用传入的basemap ID
      portal: "https://www.arcgis.com"
    },
    layers: [西安住宿_layer, 西安餐厅_layer, scenic_point_layer, station_layer, airport_layer]
  })

  if (view) {
    // 如果视图已存在，更新地图
    view.map = webmap
  } else {
    // 如果视图不存在，创建新视图
    view = new MapView({
      container: "viewDiv",
      map: webmap,
      spatialReference: { wkid: 3857 },
      spatialReferenceLocked: true,
      constraints: { maxScale: 2000 },
      center: [108.9,34.27],
      zoom: 8,
      popup: null // 禁用默认弹窗
    })

    view.ui.remove("attribution");//删除最下方的版权信息
    window.view = view; // 确保全局可用
    
    // 初始化测量距离小组件
    view.when(() => {
  const measurementWidget = new DistanceMeasurement2D({
    view: view,
    mode: 'distance',
    unit: 'kilometers',
    style: {
      lineColor: [0, 122, 194, 0.8],
      lineWidth: 2
    }
  });

  // 👇 关键：监听激活状态
  measurementWidget.watch('active', (active) => {
    active ? preventScroll() : restoreScroll();
  });

  // 挂载到指定 DOM
  const container = document.getElementById('measurementWidget');
  if (container) measurementWidget.container = container;
});
  }
}

onMounted(() => {
  let handler = null // 声明handler变量
  

  
  scenic_point_layer = new GeoJSONLayer({
    url: "JSON/全国A级景区数据_FeaturesToJSON.geojson",
    spatialReference: { wkid: 3857 },
    outFields: ["*"],
    popupEnabled: false, // 禁用默认弹窗
    visible: false,
    renderer: {
      type: "simple",
      symbol: {
        type: "picture-marker",
        url: "/icons/scenic-spot.svg", // 景区图标
        width: "24px",
        height: "24px"
      }
    }
  })

  西安住宿_layer = new GeoJSONLayer({
    url: "JSON/西安住宿.geojson",
    spatialReference: { wkid: 3857 },
    outFields: ["*"],
    popupEnabled: false, // 禁用默认弹窗
    visible: false,
    renderer: {
      type: "simple",
      symbol: {
        type: "picture-marker",
        url: "/icons/hotel.svg", // 住宿图标
        width: "24px",
        height: "24px"
      }
    }
  })

  西安餐厅_layer = new GeoJSONLayer({
    url: "JSON/西安餐厅.geojson",
    spatialReference: { wkid: 3857 },
    outFields: ["*"],
    popupEnabled: false, // 禁用默认弹窗
    visible: false,
    renderer: {
      type: "simple",
      symbol: {
        type: "picture-marker",
        url: "/icons/restaurant.svg", // 餐厅图标
        width: "27px",
        height: "27px"
      }
    }
  })

  // 动车/轨道站点图层（支持按 station 字段筛选 train/subway）
 station_layer = new GeoJSONLayer({
  url: "JSON/动车站点.geojson",
  spatialReference: { wkid: 3857 },
  outFields: ["*"],
  popupEnabled: false,
  visible: false,
  renderer: {
    type: "unique-value",
    field: "station",
    uniqueValueInfos: [
      {
        value: "train",
        symbol: {
          type: "picture-marker",
          url: "/icons/train.svg",
          width: "27px",
          height: "27px"
        }
      },
      {
        value: "subway",
        symbol: {
          type: "picture-marker", // 确保你有这个图标
          url: "/icons/subway.svg", // 确保你有这个图标
          width: "27px",
          height: "27px"
        }
      }
    ],
    // 移除默认符号，避免加载不存在的图标
  }
})

  // 机场图层
  airport_layer = new GeoJSONLayer({
    url: "JSON/中国_机场.geojson",
    spatialReference: { wkid: 3857 },
    outFields: ["*"],
    popupEnabled: false, // 禁用默认弹窗
    visible: false,
    renderer: {
      type: "simple",
      symbol: {
        type: "picture-marker",
        url: "/icons/airport.svg", // 机场图标，如果没有可以创建或使用其他图标
        width: "24px",
        height: "24px"
      }
    }
  })

  // 使用URL中的WebMap ID
  webmap = new WebMap({
    portalItem: {
      id: currentBasemapId.value,
      portal: "https://www.arcgis.com"
    },
    layers: [西安住宿_layer, 西安餐厅_layer, scenic_point_layer, station_layer, airport_layer]
  });

  view = new MapView({
    container: "viewDiv",
    map: webmap,
    spatialReference: { wkid: 3857 },
    spatialReferenceLocked: true,
    constraints: { maxScale: 2000 },
    center: [108.9,34.27],
    zoom: 8,
    popup: null // 禁用默认弹窗
  });

  view.ui.remove("attribution");//删除最下方的版权信息

  window.view = view; // 确保全局可用

  view.when(() => {
    // 添加点击事件处理
    view.on("click", (event) => {
      console.log('地图被点击') // 调试日志
      
      // 查询点击位置的要素
      view.hitTest(event).then((response) => {
        console.log('hitTest结果:', response.results) // 调试日志
        
        // 遍历所有结果，找到有属性的那个
        let found = null
        let isBasemapFeature = false
        
        for (const r of response.results) {
          const g = r.graphic
          console.log('检查要素:', g, 'attributes:', g.attributes, 'properties:', g.properties) // 调试日志
          
          // 检查是否是底图要素（通常底图要素会有特定的属性标识）
          if (g && (g.attributes || g.properties)) {
            const attrs = g.attributes || g.properties
            
            // 判断是否是底图要素（通过属性特征判断）
            if (attrs._label_class !== undefined || attrs._name_local || attrs._name_global || attrs._minzoom !== undefined) {
              found = g
              isBasemapFeature = true
              console.log('找到底图要素:', attrs)
              break
            } else if (attrs.name || attrs['景区名'] || attrs['餐厅名'] || attrs['酒店名'] || attrs['名称'] || attrs.FID !== undefined) {
              // 这是GeoJSON要素
              found = g
              isBasemapFeature = false
              console.log('找到GeoJSON要素:', attrs)
              break
            } else if (attrs.Name || attrs.kind) {
              // 这是机场要素
              found = g
              isBasemapFeature = false
              console.log('找到机场要素:', attrs)
              break
            }
          }
        }

        if (found) {
          // 兼容属性
          let attrs = found.attributes || found.properties
          if (!found.attributes && found.properties) {
            found.attributes = found.properties
          }

          console.log('找到要素:', attrs)
          
          // 将ArcGIS Graphic对象转换为普通对象，避免响应式问题
          const plainFeature = {
            attributes: attrs,
            geometry: found.geometry ? {
              type: found.geometry.type,
              coordinates: found.geometry.coordinates || [found.geometry.x, found.geometry.y]
            } : {
              // 对于底图要素，如果没有几何信息，使用点击坐标
              type: 'point',
              coordinates: [event.mapPoint.longitude, event.mapPoint.latitude]
            },
            isBasemapFeature: isBasemapFeature, // 标记是否是底图要素
            clickPoint: {
              longitude: event.mapPoint.longitude,
              latitude: event.mapPoint.latitude
            }
          }
          
          selectedFeature.value = plainFeature
          popupVisible.value = true
          console.log('显示弹窗:', attrs)
          console.log('popupVisible设置为:', popupVisible.value)
        } else {
          popupVisible.value = false
          console.log('点击空白区域，关闭弹窗')
        }
      }).catch((error) => {
        console.error("点击查询失败:", error)
      })
    })

    // 初始化测量距离小组件
    const measurementWidget = new DistanceMeasurement2D({
      view: view,
      visible: true
    })
    
    // 将小组件添加到指定的DOM容器中
    const container = document.getElementById('measurementWidget')
    if (container) {
      measurementWidget.container = container
    }

  

    handler = view.on("pointer-move", (event) => {
      try {
        let point = view.toMap(event);
        pointview.value = point ? 
          `X:${point.longitude.toFixed(6)}°
           Y:${point.latitude.toFixed(7)}°` : 
          "坐标获取失败";
      } catch (error) {
        console.error("坐标更新错误:", error);
        pointview.value = "坐标更新错误";
      }
    });
    
  }).catch(err => {
    console.error("MapView initialization error:", err);
    pointview.value = "地图加载失败";
  });
})

// 在组件卸载时清理事件监听器
onBeforeUnmount(() => {
  if (window.handler) {
    window.handler.remove();
  }
})

const onCategorySelect = (category) => {
  console.log('选中分类:', category)
  // TODO: 根据分类加载/切换图层
}

// 分类筛选事件处理（景点等级）
const onFilter = ({ category, values }) => {
  try {
    if (!category || !values) return
    if (category === 'scenic') {
      const levels = values.scenicTypes || []
      if (levels.length > 0) {
        scenic_point_layer.visible = true
        const quoted = levels.map(l=>`'${l}'`).join(',')
        scenic_point_layer.definitionExpression = `等级 IN (${quoted})`
      } else {
        scenic_point_layer.definitionExpression = null
        scenic_point_layer.visible = false
      }
    } else if (category === 'train') {
      const types = values.trainTypes || []
      if (types.length > 0) {
        station_layer.visible = true
        const mapped = types.map(t=> t === '火车站' ? "'train'" : (t === '地铁站' ? "'subway'" : null)).filter(Boolean)
        if (mapped.length > 0) {
          station_layer.definitionExpression = `station IN (${mapped.join(',')})`
        } else {
          station_layer.definitionExpression = null
        }
      } else {
        station_layer.definitionExpression = null
        station_layer.visible = false
      }
    } else if (category === 'hotel') {
      const stars = values.hotelStars || []
      if (stars.length > 0) {
        西安住宿_layer.visible = true
        // hotel json: “类型” 字段为数字星级，1/2/3/4/5；把“1星”→1
        const nums = stars.map(s=>parseInt(s)).filter(n=>!Number.isNaN(n))
        if (nums.length > 0) {
          西安住宿_layer.definitionExpression = `类型 IN (${nums.join(',')})`
        } else {
          西安住宿_layer.definitionExpression = null
        }
      } else {
        西安住宿_layer.definitionExpression = null
        西安住宿_layer.visible = false
      }
    } else if (category === 'food') {
      const types = values.foodTypes || []
      if (types.length > 0) {
        西安餐厅_layer.visible = true
        // 餐厅 json: "类型" 字段文字类别，直接 IN 过滤
        const quoted = types.map(t=>`'${t}'`).join(',')
        西安餐厅_layer.definitionExpression = `类型 IN (${quoted})`
      } else {
        西安餐厅_layer.definitionExpression = null
        西安餐厅_layer.visible = false
      }
    }else if (category === 'airport') {
  const types = values.airportTypes || []
  if (types.length) {
    airport_layer.visible = true
    // 机场 geojson 的 kind 字段为 “国际” / “国内”
    const quoted = types.map(t => `'${t === '国际机场' ? '国际' : '国内' }'`).join(',')
    airport_layer.definitionExpression = `kind IN (${quoted})`
  } else {
    airport_layer.definitionExpression = null
    airport_layer.visible = false
  }
}
  } catch (e) {
    console.error('应用筛选失败:', e)
  }
}
</script>

<style scoped>
#container {
  padding:0px;
  margin:0px;
  height:100%;
  width:100%;
  box-sizing: border-box;
  user-select:none;
  position: relative;
  background: white;
}

#viewDiv {
  padding:0px;
  margin:0px;
  height:100%;
  width:100%;
  box-sizing: border-box;
  user-select:none;
  
  overflow: hidden !important;
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
  z-index: 1; 
}
#viewDiv::-webkit-scrollbar {
  display: none !important;
}

#measurementWidget {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1000;
  pointer-events: auto;
  background-color: rgba(239, 233, 157, 0.719);
  color: rgb(40, 43, 42);
}

.search-container {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 999;
  width: 300px;
}
</style>