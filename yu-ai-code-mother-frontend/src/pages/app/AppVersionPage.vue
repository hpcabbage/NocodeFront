<template>
  <div class="app-version-page">
    <div class="page-header">
      <div>
        <div class="breadcrumb-link" @click="goBackToChat">← 返回应用对话</div>
        <h1>{{ appInfo?.appName || '应用版本管理' }}</h1>
        <p>提交版本、查看版本详情，以及回滚到指定前端版本。</p>
        <a-tag v-if="isDemoMode" color="purple" style="margin-top: 8px">演示态</a-tag>
      </div>
      <div class="header-actions">
        <a-button @click="goBackToChat">返回对话</a-button>
        <a-button type="primary" @click="fetchVersionList" :loading="versionListLoading">刷新列表</a-button>
      </div>
    </div>

    <a-card class="page-card" :loading="pageLoading">
      <a-alert
        v-if="pageError"
        type="error"
        show-icon
        :message="pageError"
        style="margin-bottom: 16px"
      />
      <div v-if="!pageError" class="version-page-layout">
        <div class="version-panel">
          <h3>提交当前版本</h3>
          <a-form layout="vertical">
            <a-form-item label="版本标题" required>
              <a-input v-model:value="versionForm.versionTitle" placeholder="比如：首页 banner 改版" />
            </a-form-item>
            <a-form-item label="版本备注">
              <a-textarea
                v-model:value="versionForm.changeSummary"
                :rows="3"
                placeholder="给这个版本写一段备注，方便之后识别和回滚"
              />
            </a-form-item>
            <a-form-item label="本次提示词（可选）">
              <a-textarea
                v-model:value="versionForm.userPrompt"
                :rows="3"
                placeholder="不填则默认取最近一条用户消息"
              />
            </a-form-item>
            <a-button type="primary" :loading="committingVersion" @click="submitVersionCommit">
              提交这一版
            </a-button>
          </a-form>
        </div>

        <div class="version-panel">
          <div class="version-list-header">
            <h3>版本列表</h3>
            <span class="version-count">共 {{ filteredVersionList.length }} 条</span>
          </div>

          <div class="version-toolbar">
            <a-switch v-model:checked="onlyStable" size="small" />
            <span class="version-toolbar-text">只看稳定版本</span>
          </div>

          <a-empty v-if="!versionListLoading && filteredVersionList.length === 0" :description="onlyStable ? '还没有稳定版本' : '还没有版本记录'" />

          <div v-else class="version-list">
            <div
              v-for="item in filteredVersionList"
              :key="item.id"
              class="version-list-item"
              :class="{ active: selectedVersion?.id === item.id, current: item.currentVersion }"
              @click="selectVersion(item)"
            >
              <div class="version-list-item-top">
                <span class="version-title">{{ item.versionTitle || `V${item.versionNo}` }}</span>
                <a-tag color="blue">V{{ item.versionNo }}</a-tag>
              </div>
              <div class="version-tag-row">
                <a-tag v-for="tag in getVersionTags(item)" :key="tag.text" :color="tag.color">{{ tag.text }}</a-tag>
              </div>
              <div class="version-summary">{{ item.changeSummary || '未填写备注' }}</div>
              <div v-if="item.sourceVersionId" class="version-source-text">
                {{ item.sourceType === 'ROLLBACK' ? '恢复自' : '来源于' }} {{ getVersionLabelById(item.sourceVersionId) }}
              </div>
              <div class="version-time">{{ formatTime(item.createTime) || '-' }}</div>
            </div>
          </div>
        </div>
      </div>

      <a-card v-if="!pageError && selectedVersion" title="版本详情" class="version-detail-card">
        <div class="detail-tag-row">
          <a-tag v-for="tag in getVersionTags(selectedVersion)" :key="tag.text" :color="tag.color">{{ tag.text }}</a-tag>
        </div>
        <a-descriptions :column="2" bordered size="small">
          <a-descriptions-item label="版本号">V{{ selectedVersion.versionNo }}</a-descriptions-item>
          <a-descriptions-item label="状态">{{ selectedVersion.versionStatus || '-' }}</a-descriptions-item>
          <a-descriptions-item label="标题">{{ selectedVersion.versionTitle || '-' }}</a-descriptions-item>
          <a-descriptions-item label="父版本">{{ selectedVersion.parentVersionNo || '无' }}</a-descriptions-item>
          <a-descriptions-item label="生成类型">{{ selectedVersion.codeGenType || '-' }}</a-descriptions-item>
          <a-descriptions-item label="来源">{{ formatSourceType(selectedVersion.sourceType) }}</a-descriptions-item>
          <a-descriptions-item label="当前使用中">{{ selectedVersion.currentVersion ? '是' : '否' }}</a-descriptions-item>
          <a-descriptions-item label="稳定版本">{{ selectedVersion.isStable ? '是' : '否' }}</a-descriptions-item>
          <a-descriptions-item label="来源版本" :span="2">
            {{ selectedVersion.sourceVersionId ? getVersionLabelById(selectedVersion.sourceVersionId) : '无' }}
          </a-descriptions-item>
          <a-descriptions-item v-if="selectedVersion.sourceVersionId && selectedVersion.sourceType === 'ROLLBACK'" label="恢复关系" :span="2">
            当前版本由回滚生成，恢复自 {{ getVersionLabelById(selectedVersion.sourceVersionId) }}
          </a-descriptions-item>
          <a-descriptions-item label="版本目录" :span="2">{{ selectedVersion.versionPath || '-' }}</a-descriptions-item>
          <a-descriptions-item label="Meta 文件" :span="2">{{ selectedVersion.metaPath || '-' }}</a-descriptions-item>
          <a-descriptions-item label="版本备注" :span="2">{{ selectedVersion.changeSummary || '-' }}</a-descriptions-item>
          <a-descriptions-item label="用户提示词" :span="2">{{ selectedVersion.userPrompt || '-' }}</a-descriptions-item>
        </a-descriptions>

        <div class="meta-section">
          <h4>Meta 信息</h4>
          <a-empty
            v-if="!selectedVersion.metaInfo || Object.keys(selectedVersion.metaInfo).length === 0"
            description="暂无 meta 信息"
          />
          <a-descriptions v-else :column="1" bordered size="small">
            <a-descriptions-item v-for="(value, key) in selectedVersion.metaInfo" :key="key" :label="key">
              {{ value || '-' }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <div class="version-note-section">
          <h4>版本说明</h4>
          <a-alert
            type="info"
            show-icon
            message="当前版本管理仅保留快照、备注与回滚能力，不展示代码差异。"
            style="margin-bottom: 12px"
          />
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="版本备注">
              {{ selectedVersion.changeSummary || '未填写备注' }}
            </a-descriptions-item>
            <a-descriptions-item label="提交时提示词">
              {{ selectedVersion.userPrompt || '未记录提示词' }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <div class="rollback-section">
          <h4>版本操作</h4>
          <a-alert
            type="success"
            show-icon
            :message="selectedVersion.isStable ? '这个版本当前已标记为稳定版本。' : '你可以把这个版本标记为稳定版本，方便后续快速识别和恢复。'"
            style="margin-bottom: 12px"
          />
          <a-button :loading="updatingStable" @click="toggleStableVersion" style="margin-bottom: 16px">
            {{ selectedVersion.isStable ? '取消稳定版本' : '标记为稳定版本' }}
          </a-button>

          <h4>回滚到当前版本</h4>
          <a-alert
            type="warning"
            show-icon
            message="回滚会覆盖当前应用输出内容，并生成一条新的回滚版本记录。"
            style="margin-bottom: 12px"
          />
          <a-form layout="vertical">
            <a-form-item label="回滚说明（可选）">
              <a-textarea
                v-model:value="rollbackForm.rollbackReason"
                :rows="3"
                placeholder="比如：最新改动有问题，先恢复到这个稳定版本"
              />
            </a-form-item>
            <a-button type="primary" danger :loading="rollingBackVersion" @click="submitRollback">
              回滚到这个版本
            </a-button>
          </a-form>
        </div>
      </a-card>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  commitAppVersion,
  getAppFrontendVersionVoById,
  getAppVoById,
  listAppFrontendVersionVoByPage,
  rollbackAppVersion,
  setAppVersionStable,
} from '@/api/appController'
import { listAppChatHistory } from '@/api/chatHistoryController'
import { formatTime } from '@/utils/time'

const route = useRoute()
const router = useRouter()

const demoVersionList: API.AppFrontendVersionVO[] = [
  {
    id: 1001,
    appId: 999,
    versionNo: 7,
    versionTitle: '首页布局收口',
    changeSummary: '调整 hero 区块、按钮文案与卡片间距',
    userPrompt: '把首页视觉层级拉开，CTA 更明显一些',
    codeGenType: 'vue_project',
    sourceType: 'ROLLBACK',
    sourceVersionId: 1000,
    isStable: 0,
    currentVersion: true,
    versionPath: '/demo/frontend_versions/app_999/v7',
    metaPath: '/demo/frontend_versions/app_999/v7/meta.txt',
    parentVersionNo: 6,
    versionStatus: 'ACTIVE',
    metaInfo: {
      generator: 'demo',
      branch: 'main',
      note: '仅用于版本页演示验证',
    },
    createTime: '2026-04-19 16:00:00',
  },
  {
    id: 1000,
    appId: 999,
    versionNo: 6,
    versionTitle: '首页 CTA 初版',
    changeSummary: '补首屏文案与按钮结构',
    userPrompt: '先把首页首屏搭起来',
    codeGenType: 'vue_project',
    sourceType: 'MANUAL_COMMIT',
    sourceVersionId: 998,
    isStable: 1,
    currentVersion: false,
    versionPath: '/demo/frontend_versions/app_999/v6',
    metaPath: '/demo/frontend_versions/app_999/v6/meta.txt',
    parentVersionNo: 5,
    versionStatus: 'ACTIVE',
    metaInfo: {
      generator: 'demo',
      branch: 'main',
    },
    createTime: '2026-04-19 15:20:00',
  },
]

const isDemoMode = computed(() => route.query.demo === '1')

const appId = ref<number>()
const appInfo = ref<API.AppVO>()
const pageLoading = ref(false)
const pageError = ref('')
const versionListLoading = ref(false)
const committingVersion = ref(false)
const rollingBackVersion = ref(false)
const updatingStable = ref(false)
const versionList = ref<API.AppFrontendVersionVO[]>([])
const selectedVersion = ref<API.AppFrontendVersionVO>()
const latestUserMessage = ref('')
const onlyStable = ref(false)

const versionForm = reactive({
  versionTitle: '',
  changeSummary: '',
  userPrompt: '',
})

const rollbackForm = reactive({
  rollbackReason: '',
})


const formatSourceType = (sourceType?: string) => {
  if (!sourceType) return '-'
  if (sourceType === 'ROLLBACK') return '回滚生成'
  if (sourceType === 'MANUAL_COMMIT') return '手动提交'
  return sourceType
}

const getVersionTags = (version?: API.AppFrontendVersionVO) => {
  if (!version) return []
  const tags: Array<{ text: string; color: string }> = []
  if (version.currentVersion) {
    tags.push({ text: '当前使用中', color: 'green' })
  }
  if (version.isStable) {
    tags.push({ text: '稳定版本', color: 'gold' })
  }
  if (version.sourceType === 'ROLLBACK') {
    tags.push({ text: '回滚生成', color: 'purple' })
  }
  if (version.sourceType === 'MANUAL_COMMIT') {
    tags.push({ text: '手动提交', color: 'blue' })
  }
  return tags
}

const getVersionLabelById = (versionId?: number) => {
  if (!versionId) return '-'
  const matched = versionList.value.find((item) => item.id === versionId)
  if (matched?.versionNo) {
    return `V${matched.versionNo}`
  }
  return `#${versionId}`
}

const filteredVersionList = computed(() => {
  if (!onlyStable.value) return versionList.value
  return versionList.value.filter((item) => !!item.isStable)
})

const resetForms = () => {
  versionForm.versionTitle = ''
  versionForm.changeSummary = ''
  versionForm.userPrompt = latestUserMessage.value || ''
  rollbackForm.rollbackReason = ''
}

const goBackToChat = () => {
  if (!appId.value) return
  router.push(`/app/chat/${appId.value}`)
}

const applyDemoState = () => {
  appInfo.value = {
    id: 999,
    appName: '版本管理演示应用',
    codeGenType: 'vue_project',
  }
  versionList.value = demoVersionList
  selectedVersion.value = demoVersionList[0]
  latestUserMessage.value = demoVersionList[0].userPrompt || ''
  resetForms()
}

const fetchLatestUserMessage = async () => {
  if (isDemoMode.value || !appId.value) return
  try {
    const res = await listAppChatHistory({
      appId: appId.value,
      pageSize: 20,
    })
    if (res.data.code === 0 && res.data.data?.records) {
      const latestUser = [...(res.data.data.records || [])].find((item) => item.messageType === 'user')
      latestUserMessage.value = latestUser?.message || ''
      if (!versionForm.userPrompt) {
        versionForm.userPrompt = latestUserMessage.value
      }
    }
  } catch (error) {
    console.error('获取最近用户消息失败：', error)
  }
}

const fetchAppInfo = async () => {
  if (isDemoMode.value) {
    applyDemoState()
    return
  }
  if (!appId.value) return
  pageLoading.value = true
  pageError.value = ''
  try {
    const res = await getAppVoById({ id: appId.value })
    if (res.data.code === 0 && res.data.data) {
      appInfo.value = res.data.data
    } else {
      pageError.value = '获取应用信息失败：' + res.data.message
    }
  } catch (error) {
    console.error('获取应用信息失败：', error)
    pageError.value = '获取应用信息失败，请检查后端服务或应用权限'
  } finally {
    pageLoading.value = false
  }
}

const fetchVersionList = async () => {
  if (isDemoMode.value) {
    applyDemoState()
    return
  }
  if (!appId.value) return
  versionListLoading.value = true
  try {
    const res = await listAppFrontendVersionVoByPage({
      appId: appId.value,
      pageNum: 1,
      pageSize: 50,
    })
    if (res.data.code === 0 && res.data.data) {
      versionList.value = res.data.data.records || []
      if (versionList.value.length > 0) {
        const currentSelectedId = selectedVersion.value?.id
        const targetVersion = currentSelectedId
          ? versionList.value.find((item) => item.id === currentSelectedId) || versionList.value[0]
          : versionList.value[0]
        await selectVersion(targetVersion)
      } else {
        selectedVersion.value = undefined
      }
    } else {
      message.error('加载版本列表失败：' + res.data.message)
    }
  } catch (error) {
    console.error('加载版本列表失败：', error)
    message.error('加载版本列表失败')
  } finally {
    versionListLoading.value = false
  }
}

const selectVersion = async (version: API.AppFrontendVersionVO) => {
  if (!version?.id) return
  if (isDemoMode.value) {
    selectedVersion.value = version
    return
  }
  try {
    const res = await getAppFrontendVersionVoById({ versionId: version.id })
    if (res.data.code === 0 && res.data.data) {
      selectedVersion.value = res.data.data
    } else {
      message.error('加载版本详情失败：' + res.data.message)
    }
  } catch (error) {
    console.error('加载版本详情失败：', error)
    message.error('加载版本详情失败')
  }
}

const submitVersionCommit = async () => {
  if (isDemoMode.value) {
    message.info('演示态下不提交真实版本')
    return
  }
  if (!appId.value) return
  if (!versionForm.versionTitle.trim()) {
    message.warning('请输入版本标题')
    return
  }
  committingVersion.value = true
  try {
    const res = await commitAppVersion({
      appId: appId.value,
      versionTitle: versionForm.versionTitle.trim(),
      changeSummary: versionForm.changeSummary.trim() || undefined,
      userPrompt: versionForm.userPrompt.trim() || latestUserMessage.value || undefined,
    })
    if (res.data.code === 0 && res.data.data) {
      message.success('版本提交成功')
      resetForms()
      await fetchVersionList()
      selectedVersion.value = res.data.data
    } else {
      message.error('版本提交失败：' + res.data.message)
    }
  } catch (error) {
    console.error('版本提交失败：', error)
    message.error('版本提交失败')
  } finally {
    committingVersion.value = false
  }
}

const submitRollback = async () => {
  if (isDemoMode.value) {
    message.info('演示态下不执行真实回滚')
    return
  }
  if (!selectedVersion.value?.id) {
    message.warning('请先选择要回滚到的版本')
    return
  }
  rollingBackVersion.value = true
  try {
    const res = await rollbackAppVersion({
      versionId: selectedVersion.value.id,
      rollbackReason: rollbackForm.rollbackReason.trim() || undefined,
    })
    if (res.data.code === 0 && res.data.data) {
      message.success('回滚成功，当前内容已恢复到所选版本')
      rollbackForm.rollbackReason = ''
      await fetchVersionList()
      selectedVersion.value = res.data.data
    } else {
      message.error('回滚失败：' + res.data.message)
    }
  } catch (error) {
    console.error('回滚失败：', error)
    message.error('回滚失败')
  } finally {
    rollingBackVersion.value = false
  }
}

const toggleStableVersion = async () => {
  if (isDemoMode.value) {
    const nextStable = selectedVersion.value?.isStable ? 0 : 1
    if (selectedVersion.value) {
      selectedVersion.value = {
        ...selectedVersion.value,
        isStable: nextStable,
      }
      versionList.value = versionList.value.map((item) =>
        item.id === selectedVersion.value?.id ? { ...item, isStable: nextStable } : item,
      )
    }
    message.success(nextStable ? '已标记为稳定版本' : '已取消稳定版本')
    return
  }
  if (!selectedVersion.value?.id) {
    message.warning('请先选择一个版本')
    return
  }
  updatingStable.value = true
  const nextStable = selectedVersion.value.isStable ? 0 : 1
  try {
    const res = await setAppVersionStable({
      versionId: selectedVersion.value.id,
      isStable: nextStable,
    })
    if (res.data.code === 0 && res.data.data) {
      message.success(nextStable ? '已标记为稳定版本' : '已取消稳定版本')
      await fetchVersionList()
      selectedVersion.value = res.data.data
    } else {
      message.error('更新稳定版本失败：' + res.data.message)
    }
  } catch (error) {
    console.error('更新稳定版本失败：', error)
    message.error('更新稳定版本失败')
  } finally {
    updatingStable.value = false
  }
}

onMounted(async () => {
  if (isDemoMode.value) {
    appId.value = 999
    applyDemoState()
    return
  }
  const routeId = Number(route.params.id)
  if (!routeId) {
    message.error('应用 ID 不存在')
    router.push('/')
    return
  }
  appId.value = routeId
  await fetchAppInfo()
  if (pageError.value) {
    return
  }
  await fetchLatestUserMessage()
  resetForms()
  await fetchVersionList()
})
</script>

<style scoped>
.app-version-page {
  min-height: 100vh;
  padding: 24px;
  background: #f7f8fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 8px 0;
  font-size: 28px;
  color: #1f1f1f;
}

.page-header p {
  margin: 0;
  color: #666;
}

.breadcrumb-link {
  color: #1677ff;
  cursor: pointer;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.page-card {
  border-radius: 16px;
}

.version-page-layout {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 16px;
  margin-bottom: 16px;
}

.version-panel {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 16px;
  background: #fafafa;
}

.version-panel h3 {
  margin-top: 0;
  margin-bottom: 16px;
}

.version-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.version-count {
  color: #999;
  font-size: 13px;
}

.version-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.version-toolbar-text {
  color: #666;
  font-size: 13px;
}

.version-list {
  max-height: 520px;
  overflow-y: auto;
}

.version-list-item {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 12px;
  background: #fff;
  cursor: pointer;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.version-list-item:hover,
.version-list-item.active {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.08);
}

.version-list-item.current {
  border-color: #52c41a;
  box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.10);
  background: #fcfff7;
}

.version-list-item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.version-title {
  font-weight: 600;
  color: #1f1f1f;
}

.version-tag-row,
.detail-tag-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.version-summary {
  color: #666;
  font-size: 13px;
  margin-bottom: 8px;
}

.version-source-text {
  color: #1677ff;
  font-size: 12px;
  margin-bottom: 8px;
}

.version-time {
  color: #999;
  font-size: 12px;
}

.version-detail-card {
  margin-top: 8px;
}

.detail-tag-row {
  margin-bottom: 12px;
}

.meta-section {
  margin-top: 16px;
}

.meta-section h4,
.version-note-section h4,
.rollback-section h4 {
  margin-bottom: 12px;
}

.version-note-section,
.rollback-section {
  margin-top: 20px;
}

.version-note-section :deep(.ant-descriptions) {
  background: #fff;
}

.version-note-section :deep(.ant-alert) {
  border-radius: 8px;
}

@media (max-width: 960px) {
  .page-header {
    flex-direction: column;
  }

  .version-page-layout {
    grid-template-columns: 1fr;
  }
}
</style>
