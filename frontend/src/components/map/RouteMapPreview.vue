<template>
  <div v-if="visible" class="modal" @click.self="handleOutsideClick">
    <div class="modal-content" style="width: 1400px; height: 800px; overflow: hidden;">
      <div class="modal-header">
        <h2 class="modal-title">
          <i class="fa fa-map mr-2" aria-hidden="true"></i>
          行程路线地图预览
        </h2>
        <span class="close" @click="close">&times;</span>
      </div>
      <div class="modal-body">
        <div id="routeMapContainer" style="width: 100%; height: 580px;"></div>
        <div v-if="mapError" class="text-red-500 text-center mt-4">
          地图加载失败: {{ mapError }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import api from '../../services/api';

const props = defineProps({
  visible: Boolean,
  planId: Number
});

const emit = defineEmits(['close']);

let view = null;
let routeGraphics = null;
let pointGraphics = null;
const mapError = ref('');



// 关闭模态框
const close = () => {
  emit('close');
};

// 点击外部关闭模态框
const handleOutsideClick = (event) => {
  if (event.target.classList.contains('modal')) {
    close();
  }
};

// 初始化地图
const initMap = async () => {
  try {
    mapError.value = '';

    // 检查ArcGIS模块是否可用
    if (typeof window !== 'undefined' && window.require) {
      // 使用AMD方式加载（如果可用）
      await loadMapAMD();
    } else {
      // 使用ES模块方式加载
      await loadMapES();
    }
  } catch (error) {
    console.error('地图初始化失败:', error);
    mapError.value = `地图初始化失败: ${error.message}`;
  }
};

// AMD方式加载地图
const loadMapAMD = async () => {
  return new Promise((resolve, reject) => {
    try {
      window.require([
        'esri/Map',
        'esri/views/MapView',
        'esri/Graphic',
        'esri/geometry/Point',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/symbols/SimpleLineSymbol',
        'esri/symbols/TextSymbol',
        'esri/Color'
      ], (Map, MapView, Graphic, Point, SimpleMarkerSymbol, SimpleLineSymbol, TextSymbol, Color) => {
        try {
          // 创建地图
          const map = new Map({
            basemap: 'streets-vector'
          });

          // 创建地图视图
          view = new MapView({
            container: 'routeMapContainer',
            map: map,
            zoom: 12,
            spatialReference: { wkid: 3857 },
            spatialReferenceLocked: true,
            center: [114.057, 22.550] // 深圳默认中心点
          });

          // 加载行程数据
          loadRouteData().then(resolve).catch(reject);
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

// ES模块方式加载地图
const loadMapES = async () => {
  try {
    // 动态导入ArcGIS模块
    const Map = await import('@arcgis/core/Map');
    const MapView = await import('@arcgis/core/views/MapView');

    // 创建地图
    const map = new Map.default({
      basemap: 'streets-vector'
    });

    // 创建地图视图
    view = new MapView.default({
      container: 'routeMapContainer',
      map: map,
      zoom: 12,
      center: [114.057, 22.550] // 深圳默认中心点
    });

    // 加载行程数据
    await loadRouteData();
  } catch (error) {
    throw new Error(`ES模块加载失败: ${error.message}`);
  }
};

// 加载行程数据
const loadRouteData = async () => {
  if (!props.planId) return;

  try {
    const response = await api.getRouteGeometries(props.planId);
    const routeData = response.data;

    if (routeData.nodes && routeData.nodes.length > 0) {
      await renderRoute(routeData);
    }
  } catch (error) {
    console.error('加载行程数据失败:', error);
    mapError.value = `加载行程数据失败: ${error.message}`;
  }
};

// 渲染行程路线
const renderRoute = async (routeData) => {
  if (!view) {
    console.error('地图视图未初始化');
    return;
  }

  try {
    let Graphic, Point, SimpleMarkerSymbol, SimpleLineSymbol, TextSymbol, Color;

    // 根据加载方式选择模块
    if (typeof window !== 'undefined' && window.require) {
      // AMD方式
      await new Promise((resolve, reject) => {
        window.require([
          'esri/Graphic',
          'esri/geometry/Point',
          'esri/symbols/SimpleMarkerSymbol',
          'esri/symbols/SimpleLineSymbol',
          'esri/symbols/TextSymbol',
          'esri/Color'
        ], (G, P, SMS, SLS, TS, C) => {
          Graphic = G;
          Point = P;
          SimpleMarkerSymbol = SMS;
          SimpleLineSymbol = SLS;
          TextSymbol = TS;
          Color = C;
          resolve();
        });
      });
    } else {
      // ES模块方式
      const G = await import('@arcgis/core/Graphic');
      const P = await import('@arcgis/core/geometry/Point');
      const SMS = await import('@arcgis/core/symbols/SimpleMarkerSymbol');
      const SLS = await import('@arcgis/core/symbols/SimpleLineSymbol');
      const TS = await import('@arcgis/core/symbols/TextSymbol');
      const C = await import('@arcgis/core/Color');

      Graphic = G.default;
      Point = P.default;
      SimpleMarkerSymbol = SMS.default;
      SimpleLineSymbol = SLS.default;
      TextSymbol = TS.default;
      Color = C.default;
    }

    // 清除之前的图形
    if (routeGraphics) {
      view.graphics.remove(routeGraphics);
    }
    if (pointGraphics) {
      view.graphics.remove(pointGraphics);
    }

    const graphics = [];
    const points = [];
    const validNodes = routeData.nodes.filter(node => node.lng && node.lat);

    // 创建地点标记
    validNodes.forEach((node, index) => {
      const point = new Point({
        longitude: node.lng,
        latitude: node.lat
      });

      // 创建数字标记
      const numberSymbol = new TextSymbol({
        color: 'white',
        text: node.index.toString(),
        font: {
          size: 16,
          weight: 'bold'
        },
        backgroundColor: new Color([59, 130, 246, 0.9]), // 蓝色背景
        borderLineColor: new Color([37, 99, 235, 1]),
        borderLineWidth: 1
      });

      const numberGraphic = new Graphic({
        geometry: point,
        symbol: numberSymbol
      });

      graphics.push(numberGraphic);

      // 创建地点名称标签
      const nameSymbol = new TextSymbol({
        color: 'black',
        text: node.name,
        font: {
          size: 12,
          weight: 'normal'
        },
        backgroundColor: new Color([255, 255, 255, 0.8]),
        borderLineColor: new Color([0, 0, 0, 0.3]),
        borderLineWidth: 1,
        yoffset: 25
      });

      const nameGraphic = new Graphic({
        geometry: point,
        symbol: nameSymbol
      });

      graphics.push(nameGraphic);

      points.push(point);
    });

    // 创建路线连接
    if (points.length > 1) {
      for (let i = 0; i < points.length - 1; i++) {
        const currentNode = validNodes[i];
        const nextNode = validNodes[i + 1];

        // 创建连接线
        const lineSymbol = new SimpleLineSymbol({
          color: new Color([59, 130, 246, 0.8]),
          width: 3,
          style: 'solid'
        });

        const lineGraphic = new Graphic({
          geometry: {
            type: 'polyline',
            paths: [
              [currentNode.lng, currentNode.lat],
              [nextNode.lng, nextNode.lat]
            ]
          },
          symbol: lineSymbol
        });

        graphics.push(lineGraphic);

        // 在连接线中间添加交通方式图标
        // 使用更精确的位置计算，考虑标签大小和可读性
        const midLng = (currentNode.lng + nextNode.lng) / 2;
        const midLat = (currentNode.lat + nextNode.lat) / 2;

        // 计算连接线的角度，用于调整标签位置
        const deltaLng = nextNode.lng - currentNode.lng;
        const deltaLat = nextNode.lat - currentNode.lat;
        const angle = Math.atan2(deltaLat, deltaLng);

        // 智能位置调整：根据线条角度选择最佳标签位置
        let offsetDistance = 0.00015; // 基础微调距离

        // 如果线条接近水平或垂直，增加偏移距离
        const isNearHorizontal = Math.abs(deltaLat) < Math.abs(deltaLng) * 0.3;
        const isNearVertical = Math.abs(deltaLng) < Math.abs(deltaLat) * 0.3;

        if (isNearHorizontal) {
          offsetDistance = 0.0002; // 水平线条增加垂直偏移
        } else if (isNearVertical) {
          offsetDistance = 0.0002; // 垂直线条增加水平偏移
        }

        // 计算调整后的位置，确保标签在线条上方且清晰可见
        const adjustedLng = midLng + Math.cos(angle + Math.PI / 2) * offsetDistance;
        const adjustedLat = midLat + Math.sin(angle + Math.PI / 2) * offsetDistance;

        const midPoint = new Point({
          longitude: adjustedLng,
          latitude: adjustedLat
        });

        // 只使用文字标签，不使用emoji
        const transportText = nextNode.transportation_mode || '步行';
        console.log('创建交通标签:', nextNode.transportation_mode, transportText, '原始位置:', midLng, midLat, '调整后位置:', adjustedLng, adjustedLat); // 调试信息

        // 创建交通方式文字标签，使用更明显的样式
        const transportSymbol = new TextSymbol({
          color: 'white',
          text: transportText,
          font: {
            size: 12, // 适中的字体大小
            weight: 'bold' // 加粗字体
          },
          backgroundColor: new Color([34, 197, 94, 0.9]), // 绿色背景
          borderLineColor: new Color([22, 163, 74, 1]),
          borderLineWidth: 2, // 边框宽度
          yoffset: 0, // 确保没有垂直偏移
          xoffset: 0  // 确保没有水平偏移
        });

        const transportGraphic = new Graphic({
          geometry: midPoint,
          symbol: transportSymbol
        });

        graphics.push(transportGraphic);

        // 添加调试信息
        console.log('交通标签已添加到图形数组，调整后位置:', adjustedLng, adjustedLat, '偏移距离:', offsetDistance);
      }
    }

    // 添加所有图形到地图
    graphics.forEach(graphic => view.graphics.add(graphic));

    // 添加调试信息
    console.log('所有图形已添加到地图，总数:', graphics.length);
    console.log('地图上的图形总数:', view.graphics.length);

    // 等待视图完全准备好后再调整视图范围
    if (points.length > 0) {
      // 检查视图是否已经准备好
      if (view.ready) {
        try {
          await view.goTo({
            target: points,
            padding: 50,
            duration: 1000 // 添加动画持续时间
          });
        } catch (goToError) {
          console.warn('视图范围调整失败，使用默认视图:', goToError);
          // 如果goTo失败，至少设置中心点和缩放级别
          const centerLng = (Math.min(...validNodes.map(n => n.lng)) + Math.max(...validNodes.map(n => n.lng))) / 2;
          const centerLat = (Math.min(...validNodes.map(n => n.lat)) + Math.max(...validNodes.map(n => n.lat))) / 2;
          view.center = [centerLng, centerLat];
          view.zoom = 12;
        }
      } else {
        // 如果视图还没准备好，等待它准备好
        await new Promise((resolve) => {
          const checkReady = () => {
            if (view.ready) {
              resolve();
            } else {
              setTimeout(checkReady, 100);
            }
          };
          checkReady();
        });

        // 现在视图应该准备好了，再次尝试调整视图范围
        try {
          await view.goTo({
            target: points,
            padding: 50,
            duration: 1000
          });
        } catch (goToError) {
          console.warn('视图范围调整失败:', goToError);
        }
      }
    }

  } catch (error) {
    console.error('渲染路线失败:', error);
    mapError.value = `渲染路线失败: ${error.message}`;
  }
};

// 监听visible变化
watch(() => props.visible, (newVal) => {
  if (newVal && props.planId) {
    // 延迟初始化，确保DOM已完全渲染
    setTimeout(() => {
      initMap();
    }, 300); // 增加延迟时间
  }
});

// 监听planId变化
watch(() => props.planId, (newVal) => {
  if (newVal && props.visible && view && view.ready) {
    loadRouteData();
  }
});

onMounted(() => {
  if (props.visible && props.planId) {
    // 在mounted后也延迟初始化
    setTimeout(() => {
      initMap();
    }, 300);
  }
});

onUnmounted(() => {
  if (view) {
    view.destroy();
  }
});
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  max-height: 90vh;
  overflow: hidden;
  padding: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: bold;
}

.close {
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  margin-bottom: 20px;
}
</style>
