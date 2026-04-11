<template>
  <div id="registerPageWrapper">
    <div id="userRegisterPage">
      <div class="register-card">
        <div class="card-header">
          <h2 class="title">壹句建站 - 用户注册</h2>
          <div class="desc">不写一行代码，生成完整应用</div>
        </div>
        <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit" class="register-form">
          <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
            <a-input 
              v-model:value="formState.userAccount" 
              placeholder="请输入账号"
              size="large"
              class="custom-input"
            >
              <template #prefix>
                <UserOutlined class="input-icon" />
              </template>
            </a-input>
          </a-form-item>
          <a-form-item
            name="userPassword"
            :rules="[
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码不能小于 8 位' },
            ]"
          >
            <a-input-password 
              v-model:value="formState.userPassword" 
              placeholder="请输入密码"
              size="large"
              class="custom-input"
            >
              <template #prefix>
                <LockOutlined class="input-icon" />
              </template>
            </a-input-password>
          </a-form-item>
          <a-form-item
            name="checkPassword"
            :rules="[
              { required: true, message: '请确认密码' },
              { min: 8, message: '密码不能小于 8 位' },
              { validator: validateCheckPassword },
            ]"
          >
            <a-input-password 
              v-model:value="formState.checkPassword" 
              placeholder="请确认密码"
              size="large"
              class="custom-input"
            >
              <template #prefix>
                <LockOutlined class="input-icon" />
              </template>
            </a-input-password>
          </a-form-item>
          <div class="tips">
            <span>已有账号？</span>
            <RouterLink to="/user/login" class="login-link">去登录</RouterLink>
          </div>
          <a-form-item>
            <a-button 
              type="primary" 
              html-type="submit" 
              size="large"
              class="register-button"
              :loading="loading"
            >
              <template v-if="!loading">
                <UserAddOutlined />
              </template>
              注册
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { userRegister } from '@/api/userController.ts'
import { message } from 'ant-design-vue'
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { UserOutlined, LockOutlined, UserAddOutlined } from '@ant-design/icons-vue'

const router = useRouter()

const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})

const loading = ref(false)

/**
 * 验证确认密码
 * @param rule
 * @param value
 * @param callback
 */
const validateCheckPassword = (rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value && value !== formState.userPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: API.UserRegisterRequest) => {
  loading.value = true
  try {
    const res = await userRegister(values)
    // 注册成功，跳转到登录页面
    if (res.data.code === 0) {
      message.success('注册成功')
      router.push({
        path: '/user/login',
        replace: true,
      })
    } else {
      message.error('注册失败，' + res.data.message)
    }
  } catch (error) {
    console.error('注册失败：', error)
    message.error('注册失败，请重试')
  } finally {
    loading.value = false
  }
}

// 鼠标跟随光效
const handleMouseMove = (e: MouseEvent) => {
  const { clientX, clientY } = e
  const { innerWidth, innerHeight } = window
  const x = (clientX / innerWidth) * 100
  const y = (clientY / innerHeight) * 100

  document.documentElement.style.setProperty('--mouse-x', `${x}%`)
  document.documentElement.style.setProperty('--mouse-y', `${y}%`)
}

onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
})
</script>

<style scoped>
#registerPageWrapper {
  min-height: 100vh;
  width: 100%;
  padding: 40px 20px;
  background:
    linear-gradient(180deg, #f8fafc 0%, #f1f5f9 8%, #e2e8f0 20%, #cbd5e1 100%),
    radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.08) 0%, transparent 50%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 科技感网格背景 */
#registerPageWrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
    linear-gradient(rgba(139, 92, 246, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139, 92, 246, 0.04) 1px, transparent 1px);
  background-size:
    100px 100px,
    100px 100px,
    20px 20px,
    20px 20px;
  pointer-events: none;
  animation: gridFloat 20s ease-in-out infinite;
}

/* 动态光效 */
#registerPageWrapper::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(
      600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
      rgba(59, 130, 246, 0.08) 0%,
      rgba(139, 92, 246, 0.06) 40%,
      transparent 80%
    );
  pointer-events: none;
  animation: lightPulse 8s ease-in-out infinite alternate;
}

@keyframes gridFloat {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(5px, 5px);
  }
}

@keyframes lightPulse {
  0% {
    opacity: 0.3;
  }
  100% {
    opacity: 0.7;
  }
}

#userRegisterPage {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}

.register-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  transition: all 0.3s ease;
  animation: cardFadeIn 0.6s ease-out;
}

.register-card:hover {
  box-shadow: 
    0 25px 70px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.6) inset;
  transform: translateY(-2px);
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
  animation: titleShimmer 3s ease-in-out infinite;
  background-size: 200% 200%;
}

@keyframes titleShimmer {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.desc {
  text-align: center;
  color: #64748b;
  font-size: 15px;
  margin: 0;
  opacity: 0.8;
}

.register-form {
  margin-top: 32px;
}

.register-form :deep(.ant-form-item) {
  margin-bottom: 24px;
}

.custom-input {
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  padding: 12px 16px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
}

.custom-input:hover {
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 1);
}

.custom-input:focus,
.custom-input-focused {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: rgba(255, 255, 255, 1);
}

.input-icon {
  color: #94a3b8;
  font-size: 16px;
}

.custom-input:hover .input-icon,
.custom-input-focused .input-icon {
  color: #3b82f6;
}

.tips {
  text-align: right;
  color: #64748b;
  font-size: 14px;
  margin-bottom: 24px;
  margin-top: -8px;
}

.login-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
  transition: all 0.2s ease;
  position: relative;
}

.login-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width 0.3s ease;
}

.login-link:hover {
  color: #8b5cf6;
}

.login-link:hover::after {
  width: 100%;
}

.register-button {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.register-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.register-button:hover::before {
  left: 100%;
}

.register-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
}

.register-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.4);
}

.register-button :deep(.anticon) {
  margin-right: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  #registerPageWrapper {
    padding: 20px 16px;
  }

  .register-card {
    padding: 36px 28px;
    border-radius: 20px;
  }

  .title {
    font-size: 26px;
  }

  .desc {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .register-card {
    padding: 32px 24px;
  }

  .title {
    font-size: 24px;
  }
}
</style>
