<template>
  <!-- 最外层弹窗保持不变 -->
  <div v-if="visible" class="modal" @click.self="handleOutsideClick">
    <!-- 新增一个控制动画的最外层容器 cont -->
    <div class="cont" :class="{ 's--signup': panelActive }">
      <!-- 关闭按钮 -->
      <span class="close" @click="close">&times;</span>

      <!-- 已登录面板 -->
      <div v-if="isLoggedIn" class="form-islogged">
        <h2>已登录</h2>
        <p style="text-align:center;margin:20px 0;">
          当前用户：{{ userInfo?.username }}
        </p>
        <button class="submit" @click="handleLogout">退出登录</button>
      </div>

      <!-- 未登录状态 -->
      <template v-else>
        <!-- 登录表单 -->
        <div class="form sign-in">
          <h4 class="text-center">智行规划师——为您的旅行规划提供帮助</h4><br>
          <h2>欢迎回来</h2>
          <label>
            <span>用户名</span>
            <input v-model="username" type="text" autocomplete="username" />
          </label>
          <label>
            <span>密码</span>
            <input v-model="password" type="password" autocomplete="current-password" />
          </label>
          <p class="forgot-pass" @click="error = '请联系管理员重置密码'">忘记密码？</p>

          <div v-if="error" class="error-message">{{ error }}</div>
          <button type="button" class="submit" :disabled="loading" @click="handleLogin">
            {{ loading ? '登录中...' : '登录' }}
          </button>

          <div class="switch-link">
            没有账号？
            <a href="#" @click.prevent="panelActive = true">立即注册</a>
          </div>
        </div>

        <!-- 右侧图片 + 注册表单 -->
        <div class="sub-cont">
          <!-- 背景图 + 文案 + 切换按钮 -->
          <div class="img">
            <div class="img__text m--up">
              <h2 style="color: skyblue;">新用户？</h2>
              <p>注册即可解锁更多功能！</p>
            </div>
            <div class="img__text m--in">
              <h2 style="color: skyblue;">已有账号？</h2>
              <p>直接登录，欢迎回来！</p>
            </div>
            <div class="img__btn" @click="panelActive = !panelActive">
              <span class="m--up">注册</span>
              <span class="m--in">登录</span>
            </div>
          </div>

          <!-- 注册表单 -->
          <div class="form sign-up">
            <h2>创建账户</h2>
            <label>
              <span>用户名</span>
              <input v-model="regUsername" type="text" autocomplete="username" />
            </label>
            <label>
              <span>密码</span>
              <input v-model="regPassword" type="password" autocomplete="new-password" />
            </label>
            <label>
              <span>确认密码</span>
              <input v-model="regConfirm" type="password" autocomplete="new-password" />
            </label>

            <div v-if="regError" class="error-message">{{ regError }}</div>
            <button type="button" class="submit" :disabled="regLoading" @click="handleRegister">
              {{ regLoading ? '注册中...' : '注册' }}
            </button>

            <div class="switch-link">
              已有账号？
              <a href="#" @click.prevent="panelActive = false">去登录</a>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import api from '../../services/api';
import emitter from '@/eventBus';
import axios from 'axios';

const props = defineProps({ visible: Boolean });
const emit = defineEmits(['close', 'update:visible']);

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const regUsername = ref('');
const regPassword = ref('');
const regConfirm = ref('');
const regError = ref('');
const regLoading = ref(false);

const panelActive = ref(false);

// 使用计算属性管理登录状态
const userInfo = computed(() => JSON.parse(localStorage.getItem('user') || null));
const isLoggedIn = computed(() => !!localStorage.getItem('token'));

// 监听弹窗打开时重置状态
watch(() => props.visible, (val) => {
  if (val) {
    resetFormState();
  }
});

function resetFormState() {
  username.value = password.value = error.value = '';
  regUsername.value = regPassword.value = regConfirm.value = regError.value = '';
  loading.value = regLoading.value = false;
  panelActive.value = false;
}

// 登录
const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  
  try {
    const res = await api.login(username.value, password.value);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    emitter.emit('login-status-changed');
    close();
  } catch (err) {
    error.value = err.response?.data?.message || err.message || '登录失败';
  } finally {
    loading.value = false;
  }
};

// 注册
const handleRegister = async () => {
  regError.value = '';
  
  // 表单验证
  if (!regUsername.value || !regPassword.value) {
    regError.value = '请填写所有必填字段';
    return;
  }
  
  if (regPassword.value !== regConfirm.value) {
    regError.value = '两次输入的密码不一致';
    return;
  }
  
  regLoading.value = true;
  
  try {
    await api.register({
      username: regUsername.value,
      password: regPassword.value
    });
    
    // 注册成功后自动登录
    const loginRes = await api.login(regUsername.value, regPassword.value);
    localStorage.setItem('token', loginRes.data.token);
    localStorage.setItem('user', JSON.stringify(loginRes.data.user));
    emitter.emit('login-status-changed');
    close();
  } catch (err) {
    regError.value = err.response?.data?.message || err.message || '注册失败';
  } finally {
    regLoading.value = false;
  }
};

// 退出登录
const handleLogout = () => {
  // 清除本地存储
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // 重置表单状态
  resetFormState();
  
  // 通知其他组件登录状态变化
  emitter.emit('login-status-changed');
  
  // 关闭弹窗
  close();
};

const close = () => {
  emit('update:visible', false);
  emit('close');
};

const handleOutsideClick = (e) => {
  if (e.target.classList.contains('modal')) close();
};
</script>

<style scoped>
/* ============ 样式优化 ============ */
*, *:before, *:after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Open Sans', Helvetica, Arial, sans-serif; background: #ededed; }
input, button { border: none; outline: none; background: none; font-family: 'Open Sans', Helvetica, Arial, sans-serif; }

/* 弹窗背景 */
.modal {
  position: fixed;
  z-index: 9999;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 主容器 */
.cont {
  overflow: hidden;
  position: relative;
  width: 900px;
  height: 550px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

/* 关闭按钮 */
.close {
  position: absolute;
  top: 15px;
  right: 20px;
  color: #666;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  z-index: 20;
}
.close:hover { color: #111; }

/* 表单通用 */
.form {
  position: relative;
  width: 640px; /* 900 - 260 */
  height: 100%;
  padding: 50px 30px 0;
  transition: transform 1.2s ease-in-out;
}

.form-islogged {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #fff;
  z-index: 10;
  padding: 50px;
}


h2 {
  width: 100%;
  font-size: 26px;
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

label {
  display: block;
  width: 260px;
  margin: 25px auto 0;
  text-align: center;
}
label span {
  font-size: 12px;
  color: #777;
  text-transform: uppercase;
}
input {
  display: block;
  width: 100%;
  margin-top: 5px;
  padding-bottom: 5px;
  font-size: 16px;
  border-bottom: 1px solid rgba(0,0,0,0.25);
  text-align: center;
}
input:focus { border-color: #d4af7a; }

.forgot-pass { 
  margin-top: 15px; 
  text-align: center; 
  font-size: 12px; 
  color: #777; 
  cursor: pointer; 
}

.submit {
  display: block;
  margin: 40px auto 20px;
  width: 260px;
  height: 36px;
  border-radius: 30px;
  color: #fff;
  font-size: 15px;
  cursor: pointer;
  background: #42d8de;
  transition: background 0.3s;
}
.submit:hover {
  background: #32b4b886;
}
.submit:disabled { 
  background: #95c3c980; 
  cursor: not-allowed; 
}

/* 右侧滑块 */
.sub-cont {
  overflow: hidden;
  position: absolute;
  left: 640px;
  top: 0;
  width: 900px;
  height: 100%;
  padding-left: 260px;
  background: #fff;
  transition: transform 1.2s ease-in-out;
}
.cont.s--signup .sub-cont { transform: translate3d(-640px, 0, 0); }

.img {
  overflow: hidden;
  z-index: 2;
  position: absolute;
  left: 0;
  top: 0;
  width: 260px;
  height: 100%;
  padding-top: 360px;
}
.img:before {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  width: 900px;
  height: 100%;
  background-image: url('././././././public/login.jpg');
  background-size: cover;
  transition: transform 1.2s ease-in-out;
}
.img:after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.55);
}
.cont.s--signup .img:before { transform: translate3d(640px, 0, 0); }

.img__text {
  z-index: 2;
  position: absolute;
  left: 0;
  top: 50px;
  width: 100%;
  padding: 0 20px;
  text-align: center;
  color: #ffffff;
  transition: transform 1.2s ease-in-out;
}
.img__text h2 { margin-bottom: 10px; font-weight: normal; }
.img__text p { font-size: 14px; line-height: 1.5; }

.img__text.m--up   { transform: translateX(0); }
.cont.s--signup .img__text.m--up   { transform: translateX(520px); }

.img__text.m--in   { transform: translateX(-520px); }
.cont.s--signup .img__text.m--in   { transform: translateX(0); }

/* 切换按钮 */
.img__btn {
  overflow: hidden;
  z-index: 2;
  position: relative;
  width: 100px;
  height: 36px;
  margin: 0 auto;
  background: transparent;
  color: #fff;
  text-transform: uppercase;
  font-size: 15px;
  cursor: pointer;
}
.img__btn:after {
  content: '';
  z-index: 2;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  border: 2px solid #fff;
  border-radius: 30px;
}
.img__btn span {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  transition: transform 1.2s;
}
.img__btn .m--in { transform: translateY(-72px); }
.cont.s--signup .img__btn .m--in { transform: translateY(0); }

.img__btn .m--up { transform: translateY(0); }
.cont.s--signup .img__btn .m--up { transform: translateY(72px); }

/* 登录/注册表单切换 */
.sign-in { transition-timing-function: ease-out; }
.cont.s--signup .sign-in {
  transition-timing-function: ease-in-out;
  transition-duration: 1.2s;
  transform: translate3d(640px, 0, 0);
}

.sign-up {
  transform: translate3d(-900px, 0, 0);
}
.cont.s--signup .sign-up {
  transform: translate3d(0, 0, 0);
}

/* 底部切换链接（隐藏原生的，用右侧按钮即可） */
.switch-link { 
  display: block; 
  text-align: center; 
  margin-top: 20px;
  font-size: 14px;
  color: #6b5f5f;
}
.switch-link a {
  color: #506288e7;
  text-decoration: none;
}
.switch-link a:hover {
  text-decoration: underline;
}

/* 错误提示 */
.error-message {
  color: #e74c3c;
  text-align: center;
  margin-top: 10px;
  font-size: 13px;
  min-height: 20px;
}


.logged-in {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #fff;
  z-index: 10;
  padding: 50px;
}


.logged-in .submit {
  margin-top: 30px;
}
</style>