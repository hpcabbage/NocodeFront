<template>
  <div class="user-profile-page">
    <a-page-header title="个人信息" sub-title="管理个人资料和账号安全" />
    <a-row :gutter="16">
      <a-col :xs="24" :md="12">
        <a-card title="基础资料" :loading="initLoading">
          <a-form
            :model="profileForm"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 16 }"
            @finish="handleProfileSubmit"
          >
            <a-form-item
              label="用户昵称"
              name="userName"
              :rules="[{ required: true, message: '请输入用户昵称' }]"
            >
              <a-input v-model:value="profileForm.userName" placeholder="请输入昵称" />
            </a-form-item>
            <a-form-item
              label="头像地址"
              name="userAvatar"
              :rules="[{ required: true, message: '请输入头像地址' }]"
            >
              <a-input v-model:value="profileForm.userAvatar" placeholder="请输入头像链接" />
            </a-form-item>
            <a-form-item label="个人简介" name="userProfile">
              <a-textarea
                v-model:value="profileForm.userProfile"
                :rows="4"
                placeholder="一句话介绍自己"
                show-count
                :maxlength="200"
              />
            </a-form-item>
            <a-form-item :wrapper-col="{ offset: 6, span: 16 }">
              <a-space>
                <a-button type="primary" html-type="submit" :loading="profileLoading">保存</a-button>
                <a-button @click="resetProfile">重置</a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12">
        <a-card title="密码修改" :loading="initLoading">
          <a-form
            :model="passwordForm"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 16 }"
            @finish="handlePasswordSubmit"
          >
            <a-form-item
              label="新密码"
              name="newPassword"
              :rules="[{ required: true, message: '请输入新密码' }]"
            >
              <a-input-password
                v-model:value="passwordForm.newPassword"
                placeholder="请输入新密码"
                autocomplete="new-password"
              />
            </a-form-item>
            <a-form-item
              label="确认密码"
              name="confirmPassword"
              :rules="[{ required: true, validator: validateConfirmPassword }]"
            >
              <a-input-password
                v-model:value="passwordForm.confirmPassword"
                placeholder="请再次输入新密码"
                autocomplete="new-password"
              />
            </a-form-item>
            <a-form-item :wrapper-col="{ offset: 6, span: 16 }">
              <a-space>
                <a-button type="primary" html-type="submit" :loading="passwordLoading">
                  更新密码
                </a-button>
                <a-button @click="resetPassword">重置</a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import { updateUser } from '@/api/userController'

const router = useRouter()
const loginUserStore = useLoginUserStore()

const initLoading = ref(false)
const profileLoading = ref(false)
const passwordLoading = ref(false)

const profileForm = reactive({
  userName: '',
  userAvatar: '',
  userProfile: '',
})

const passwordForm = reactive({
  newPassword: '',
  confirmPassword: '',
})

// 初始化表单数据
const fillProfileForm = () => {
  const user = loginUserStore.loginUser
  profileForm.userName = user?.userName ?? ''
  profileForm.userAvatar = user?.userAvatar ?? ''
  profileForm.userProfile = user?.userProfile ?? ''
}

// 加载用户信息
const loadLoginUser = async () => {
  initLoading.value = true
  if (!loginUserStore.loginUser.id) {
    await loginUserStore.fetchLoginUser()
  }
  if (!loginUserStore.loginUser.id) {
    message.warning('请先登录')
    router.push(`/user/login?redirect=${encodeURIComponent('/user/profile')}`)
    initLoading.value = false
    return
  }
  fillProfileForm()
  initLoading.value = false
}

onMounted(() => {
  loadLoginUser()
})

// 校验两次密码一致
const validateConfirmPassword = (_rule: any, value: string) => {
  if (!value) {
    return Promise.reject('请再次输入新密码')
  }
  if (value !== passwordForm.newPassword) {
    return Promise.reject('两次输入的密码不一致')
  }
  return Promise.resolve()
}

// 保存基本资料
const handleProfileSubmit = async () => {
  if (!loginUserStore.loginUser.id) {
    message.warning('请先登录')
    return
  }
  profileLoading.value = true
  const res = await updateUser({
    id: loginUserStore.loginUser.id,
    userName: profileForm.userName,
    userAvatar: profileForm.userAvatar,
    userProfile: profileForm.userProfile,
  })
  if (res.data.code === 0) {
    message.success('保存成功')
    await loginUserStore.fetchLoginUser()
    fillProfileForm()
  } else {
    message.error(`保存失败：${res.data.message ?? '未知错误'}`)
  }
  profileLoading.value = false
}

// 修改密码
const handlePasswordSubmit = async () => {
  if (!loginUserStore.loginUser.id) {
    message.warning('请先登录')
    return
  }
  if (!passwordForm.newPassword) {
    message.warning('请输入新密码')
    return
  }
  passwordLoading.value = true
  const res = await updateUser({
    id: loginUserStore.loginUser.id,
    userPassword: passwordForm.newPassword,
  })
  if (res.data.code === 0) {
    message.success('密码已更新，请使用新密码重新登录')
    resetPassword()
  } else {
    message.error(`密码更新失败：${res.data.message ?? '未知错误'}`)
  }
  passwordLoading.value = false
}

const resetProfile = () => {
  fillProfileForm()
}

const resetPassword = () => {
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}
</script>

<style scoped>
.user-profile-page {
  padding: 24px;
}

.ant-card {
  margin-bottom: 16px;
}
</style>



