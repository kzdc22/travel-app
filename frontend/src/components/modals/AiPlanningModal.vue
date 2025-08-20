<template>
  <div v-if="visible" class="modal" @click.self="handleOutsideClick">
    <div class="modal-content">
      <!-- 模态框头部 -->
      <div class="modal-header">
        <h2 class="modal-title">
          <i class="fa fa-map-o mr-2" aria-hidden="true"></i>
          智能旅游规划
        </h2>
        <span class="close" @click="close">&times;</span>
      </div>

      <!-- 模态框主体 -->
      <div class="modal-body">
        <!-- 表单部分 -->
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="destination">目的地</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fa fa-map-marker"></i></span>
              <input 
                type="text" 
                class="form-control" 
                id="destination" 
                v-model="destination"
                placeholder="输入您想去的城市或景点" 
                required
              >
            </div>
          </div>
          
          <div class="row g-3 mb-4">
            <div class="form-group col-md-6">
              <label for="days">旅行天数</label>
              <div class="input-group">
                <span class="input-group-text">日</span>
                <input 
                  type="number" 
                  class="form-control" 
                  id="days" 
                  v-model.number="days"
                  min="1" 
                  placeholder="1" 
                  required
                >
              </div>
            </div>
            <div class="form-group col-md-6">
              <label for="budget">预算</label>
              <div class="input-group">
                <span class="input-group-text">¥</span>
                <input 
                  type="number" 
                  class="form-control" 
                  id="budget" 
                  v-model.number="budget"
                  min="0" 
                  placeholder="5000" 
                  required
                >
              </div>
            </div>
          </div>
          
          <!-- 兴趣爱好改为复选框组 -->
          <div class="form-group">
            <label>兴趣爱好</label>
            <div class="interest-checkboxes">
              <div class="form-check" v-for="(interest, key) in interests" :key="key">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  :id="key" 
                  :value="key"
                  v-model="selectedInterests"
                >
                <label class="form-check-label" :for="key">
                  {{ interest }}
                </label>
              </div>
            </div>
            <small class="text-muted">可选择多项兴趣</small>
          </div>
          
          <!-- 新增其他要求输入框 -->
          <div class="form-group">
            <label for="additionalRequirements">其他要求</label>
            <textarea 
              class="form-control" 
              id="additionalRequirements" 
              v-model="additionalRequirements"
              rows="3"
              placeholder="请输入您的特殊需求，例如：素食偏好、交通方式偏好、景点避开人群等..."
            ></textarea>
          </div>
          
          <div class="modal-footer">
            <button 
              class="modal-btn modal-btn-secondary" 
              type="button" 
              @click="close"
            >
              关闭
            </button>
            <button 
              type="submit" 
              class="modal-btn modal-btn-primary"
              :disabled="isSubmitting || !isFormValid"
            >
              <span v-if="isSubmitting">
                <i class="fa fa-spinner fa-spin mr-1"></i> 生成中...请耐心等待
              </span>
              <span v-else>
                <i class="fa fa-magic mr-1"></i> 生成路线
              </span>
            </button>
          </div>
        </form>

        <!-- 结果显示部分 -->
        <div v-if="showResult" class="mt-4">
          <h3 class="result-title"><i class="fa fa-map-signs mr-2"></i>您的定制路线</h3>
          <div 
            class="result-content p-3 bg-light rounded shadow-sm"
            v-html="travelPlan"
          ></div>
          
          <div class="mt-3">
            <button 
              class="modal-btn modal-btn-success me-2" 
              @click="savePlan"
            >
              <i class="fa fa-save mr-1"></i> 保存路线
            </button>
            <button 
              class="modal-btn modal-btn-info" 
              @click="showMap"
            >
              <i class="fa fa-map mr-1"></i> 查看地图
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { defineProps, defineEmits } from 'vue';
import emitter from '@/eventBus';

// 接收父组件传入的显示状态
const props = defineProps({
  visible: Boolean
});

// 定义事件
const emit = defineEmits(['close']);

// 表单数据
const destination = ref('');
const days = ref(1);
const budget = ref(5000);
const selectedInterests = ref([]);
const additionalRequirements = ref(''); // 新增其他要求
const isSubmitting = ref(false);
const showResult = ref(false);
const travelPlan = ref('');

// 兴趣爱好选项（键值对形式，便于扩展）
const interests = ref({
  food: '美食',
  culture: '文化',
  nature: '自然风光',
  shopping: '购物',
  adventure: '探险',
  relaxation: '休闲度假'
});

// 表单验证状态
const isFormValid = computed(() => {
  return destination.value && days.value >= 1 && budget.value >= 0 && selectedInterests.value.length > 0;
});

// 监听显示状态变化，重置表单
watch(() => props.visible, (val) => {
  if (val) {
    // 重置表单状态
    destination.value = '';
    days.value = 1;
    budget.value = 5000;
    selectedInterests.value = [];
    additionalRequirements.value = ''; // 重置其他要求
    showResult.value = false;
    travelPlan.value = '';
  }
});

// 处理表单提交
const handleSubmit = async () => {
  // 表单验证
  if (!isFormValid.value) {
    alert('请填写完整信息并至少选择一项兴趣爱好');
    return;
  }

  // 设置提交状态
  isSubmitting.value = true;
  showResult.value = false;

  try {
    // 构建用户需求文本
    let userRequirements = `我想去${destination.value}旅游${days.value}天，预算${budget.value}元。`;
    userRequirements += `我的兴趣是：${selectedInterests.value.map(key => interests.value[key]).join(', ')}。`;
    
    // 添加其他要求
    if (additionalRequirements.value.trim()) {
      userRequirements += `我的特殊要求：${additionalRequirements.value.trim()}`;
    }

    // 调用DeepSeek API生成旅游计划
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-2f17d5a17cce47edb141f4c3703f65bd'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的旅游规划助手。请根据用户提供的以下信息，生成一份详细、实用的旅游路线计划：
            1. 行程应符合指定的天数和预算限制
            2. 充分考虑用户的兴趣爱好
            3. 包含每日行程安排、景点推荐、交通建议和餐饮推荐
            4. 若有特殊要求需重点考虑并在计划中体现
            5. 格式清晰，使用标题、列表等结构方便阅读`
          },
          {
            role: 'user',
            content: userRequirements
          }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error('API请求失败，请稍后重试');
    }

    const data = await response.json();
    travelPlan.value = data.choices[0].message.content.replace(/\n/g, '<br>');
    showResult.value = true;

  } catch (error) {
    alert('生成旅游路线时出错: ' + error.message);
  } finally {
    // 重置提交状态
    isSubmitting.value = false;
  }
};

// 保存路线到本地存储
const savePlan = () => {
  const planData = {
    destination: destination.value,
    days: days.value,
    budget: budget.value,
    interests: selectedInterests.value.map(key => ({key, name: interests.value[key]})),
    additionalRequirements: additionalRequirements.value, // 保存其他要求
    content: travelPlan.value,
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('savedPlan', JSON.stringify(planData));
  alert('路线已保存！');
};

// 地图功能占位
const showMap = () => {
  // 可根据项目实际地图功能调整，此处示例关闭模态框并通知地图组件
  close();
  emitter.emit('show-travel-map', {
    destination: destination.value,
    plan: travelPlan.value
  });
  alert('即将在地图中显示路线！');
};

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
</script>

<style scoped>
/* 继承项目模态框基础样式并扩展 */
.modal {
  display: block;
  position: fixed;
  z-index: 9999;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease-out forwards;
}

.modal-content {
  background-color: #fff;
  margin: 5% auto;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  transform: translateY(-20px);
  opacity: 0;
  animation: slideIn 0.4s ease-out forwards 0.1s;
}

.modal-header {
  padding: 20px 30px;
  background-color: #cedbe7;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 12px 12px 0 0;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close {
  color: #9ca3af;
  font-size: 1.5rem;
  font-weight: bold;
  transition: color 0.2s, transform 0.2s;
  cursor: pointer;
}

.close:hover,
.close:focus {
  color: #1f2937;
  transform: rotate(90deg);
  text-decoration: none;
}

.modal-body {
  padding: 30px;
  line-height: 1.6;
  color: #4b5563;
}

.form-group {
  margin-bottom: 22px;
  width: 100%;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-weight: 500;
  font-size: 1rem;
}

.form-control {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

textarea.form-control {
  resize: vertical;
}

.input-group {
  display: flex;
  align-items: center;
  width: 100%;
}

.input-group-text {
  padding: 10px 14px;
  background-color: #dadee7;
  border: 1px solid #d1d5db;
  border-right: none;
  border-radius: 6px 0 0 6px;
  color: #4b5563;
  font-weight: 500;
}

.input-group .form-control {
  border-radius: 0 6px 6px 0;
  border-left: none;
}

.row {
  display: flex;
  gap: 15px;
  width: 100%;
}

.col-md-6 {
  flex: 1;
}

/* 兴趣爱好复选框样式 */
.interest-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 8px;
}

.form-check {
  display: flex;
  align-items: center;
  margin: 0;
}

.form-check-input {
  margin-right: 8px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.form-check-label {
  cursor: pointer;
  color: #8e1c1a;
  font-weight: 200;
  font-size: 1rem;
  transition: color 0.2s;
}

.form-check-input:checked + .form-check-label {
  color: #283bcf;
  font-weight: 500;
}

.result-title {
  font-size: 1.2rem;
  color: #b93b2d;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #2954ab;
}

.result-content {
  line-height: 1.8;
  color: #374151;
  max-height: 400px;
  overflow-y: auto;
}

.modal-footer {
  padding: 15px 30px 25px;
  background-color: #fff;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}

.modal-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
  margin-left: 10px;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.modal-btn-primary {
  background-color: #688cc6d5;
  color: white;
}

.modal-btn-primary:disabled {
  background-color: #939eac;
  cursor: not-allowed;
  transform: none;
}

.modal-btn-primary:hover:not(:disabled) {
  background-color: #3559a8;
  transform: translateY(-1px);
}

.modal-btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
}

.modal-btn-secondary:hover {
  background-color: #e5e7eb;
  transform: translateY(-1px);
}

.modal-btn-success {
  background-color: #10b981;
  color: white;
}

.modal-btn-success:hover {
  background-color: #059669;
  transform: translateY(-1px);
}

.modal-btn-info {
  background-color: #06b6d4;
  color: white;
}

.modal-btn-info:hover {
  background-color: #0891b2;
  transform: translateY(-1px);
}

.text-muted {
  font-size: 0.85rem;
  color: #9ca3af;
  margin-top: 6px;
  display: block;
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    transform: translateY(-20px);
    opacity: 0;
  }
  to { 
    transform: translateY(0);
    opacity: 1;
  }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 15% auto;
  }
  
  .row {
    flex-direction: column;
    gap: 0;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 10px;
  }
  
  .modal-btn {
    width: 100%;
    margin-left: 0;
    padding: 12px;
  }

  .interest-checkboxes {
    gap: 12px;
  }
}
</style>