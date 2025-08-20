
# 项目文件说明

## 项目结构概览
本项目分为前端和后端两大部分，前端基于Vue.js构建，后端使用Node.js和Express框架。以下是各主要文件夹的结构和文件功能说明：

## 前端部分 (src文件夹)

### 根目录组件
1. **App.vue**: 应用的主组件，包含整个应用的布局结构，包括顶部导航栏、侧边栏、地图视图和弹窗等核心UI元素。

### components目录

#### map子目录
- **CustomPopup.vue**: 自定义弹窗组件，用于显示地图上点击的地点信息，支持显示多种属性并提供操作按钮。
- **PointView.vue**: 显示地图上点坐标信息的组件，实时更新鼠标位置的经纬度。
- **LocateWidget.vue**: 定位组件，用于获取和显示用户当前位置。
- **LayerCategoryBar.vue**: 图层分类栏组件，用于切换不同类型的地图图层。

#### topbar子目录
- **TopBar.vue**: 顶部导航栏组件，包含应用标题和功能按钮，用于导航和切换视图。

#### sidebar子目录
- **SideBar.vue**: 侧边栏组件，提供应用的主要导航功能，包含不同模块的入口。

#### modals子目录
- **AiPlanningModal.vue**: AI智能规划模态框，提供基于AI的旅行规划功能，支持输入偏好生成旅行方案。
- **AttractionRecommendationModal.vue**: 景点推荐模态框，基于用户兴趣和偏好推荐各类景点。
- **AuthModal.vue**: 用户认证模态框，包含登录和注册功能。
- **ItineraryEditingModal.vue**: 行程编辑模态框，用于管理和编辑用户的旅行行程。
- **MyCollectionModal.vue**: 收藏夹管理模态框，用于管理用户的地点收藏。
- **MyCollectionModal copy.vue**: 收藏夹管理模态框的副本，可能用于测试或备份。
- **RoutePlanningModal.vue**: 路线规划模态框，用于设置起点、终点和途经点，生成最佳路线。
- **SystemSettingsModal.vue**: 系统设置模态框，包含主题切换、语言设置和地图样式等系统配置。
- **TransportationQueryModal.vue**: 交通查询模态框，提供公共交通、出租车和租车服务等信息查询。

#### explore子目录
- **ExploreView.vue**: 探索视图组件，提供地点浏览和探索功能。

#### 其他组件
- **ModalContainer.vue**: 模态框容器组件，管理应用中所有模态框的显示和隐藏。

## 后端部分 (backend文件夹)

### 入口和配置文件
1. **app.js**: 后端应用的入口文件，设置Express服务器，配置中间件，注册路由，连接数据库。
2. **config/database.js**: 数据库配置文件，设置Sequelize连接参数，初始化数据库连接。

### 控制器文件
- **controllers/authController.js**: 处理用户认证相关操作，包含注册(register)和登录(login)功能。
- **controllers/poisController.js**: 处理兴趣点(POI)相关操作，包含搜索地点(searchLocations)功能。
- **controllers/favoritesController.js**: 处理用户收藏相关操作，管理用户的收藏列表。
- **controllers/travelPlansController.js**: 处理旅行计划相关操作，管理用户的旅行计划。
- **controllers/wishlistController.js**: 处理愿望清单相关操作，管理用户的愿望清单。

### 中间件
- **middleware/auth.js**: 身份验证中间件，用于保护需要登录才能访问的API路由。

### 模型文件
- **models/user.js**: 用户模型，定义用户表结构，包含用户名、密码等字段。
- **models/poi.js**: 兴趣点模型，定义兴趣点表结构，包含名称、类型、位置等字段。
- **models/favorite.js**: 收藏模型，定义收藏表结构，关联用户和收藏项。
- **models/favoriteItem.js**: 收藏项模型，定义收藏项表结构，记录收藏的具体内容。
- **models/lodging.js**: 住宿模型，定义住宿表结构，记录住宿相关信息。
- **models/routePlan.js**: 路线计划模型，定义路线计划表结构，记录旅行路线信息。
- **models/scenicpot.js**: 景点模型，定义景点表结构，记录景点相关信息。
- **models/travelPlan.js**: 旅行计划模型，定义旅行计划表结构，记录详细的旅行计划信息。
- **models/wishlist.js**: 愿望清单模型，定义愿望清单表结构，记录用户的愿望清单信息。

### 路由文件
- **routes/auth.js**: 认证相关路由，定义注册和登录的API端点。
- **routes/pois.js**: 兴趣点相关路由，定义搜索和获取兴趣点的API端点。
- **routes/favorites.js**: 收藏相关路由，定义添加、删除和获取收藏的API端点。
- **routes/travelPlans.js**: 旅行计划相关路由，定义创建、更新和获取旅行计划的API端点。
- **routes/wishlist.js**: 愿望清单相关路由，定义添加、删除和获取愿望清单的API端点。