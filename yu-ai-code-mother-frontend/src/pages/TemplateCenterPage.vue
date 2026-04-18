<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  deleteSiteTemplate,
  listSiteTemplateVoByPage,
  updateSiteTemplate,
  updateSiteTemplateByAdmin,
} from '@/api/templateController'
import { useLoginUserStore } from '@/stores/loginUser'

const router = useRouter()
const loginUserStore = useLoginUserStore()
const loading = ref(false)
const templates = ref<API.SiteTemplateVO[]>([])
const activeView = ref<'public' | 'mine' | 'all'>('public')
const query = reactive({
  pageNum: 1,
  pageSize: 9,
  category: undefined as string | undefined,
  searchText: '',
})
const page = reactive({
  total: 0,
})
const editVisible = ref(false)
const editingTemplateId = ref<number | undefined>()
const savingEdit = ref(false)
const publishingTemplateId = ref<number | undefined>()
const editForm = reactive({
  name: '',
  description: '',
  category: undefined as string | undefined,
})

const isLogin = computed(() => !!loginUserStore.loginUser.id)
const isAdmin = computed(() => loginUserStore.loginUser.userRole === 'admin')
const pageDescription = computed(() => {
  if (activeView.value === 'mine') {
    return '管理你保存的模板，可编辑、公开或删除。'
  }
  if (activeView.value === 'all') {
    return '管理员视角，可查看并统一管理全部模板公开状态。'
  }
  return '选择一个公开模板作为起点，再继续用 AI 修改你的网站。'
})

const loadTemplates = async () => {
  loading.value = true
  try {
    const res = await listSiteTemplateVoByPage({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      category: query.category,
      searchText: query.searchText || undefined,
      userId: activeView.value === 'mine' ? loginUserStore.loginUser.id : undefined,
      isPublic: activeView.value === 'public' ? 1 : undefined,
    })
    if (res.data.code === 0 && res.data.data) {
      templates.value = res.data.data.records || []
      page.total = Number(res.data.data.totalRow || 0)
    } else {
      message.error('加载模板失败：' + res.data.message)
    }
  } catch (error) {
    console.error('加载模板失败：', error)
    message.error('加载模板失败')
  } finally {
    loading.value = false
  }
}

const switchView = (view: 'public' | 'mine' | 'all') => {
  if (view === 'mine' && !isLogin.value) {
    message.warning('请先登录后查看我的模板')
    return
  }
  if (view === 'all' && !isAdmin.value) {
    message.warning('只有管理员可以查看全部模板')
    return
  }
  activeView.value = view
  query.pageNum = 1
  loadTemplates()
}

const useTemplate = (template: API.SiteTemplateVO) => {
  router.push({
    path: '/',
    query: {
      templateId: String(template.id),
      templateName: template.name || '',
    },
  })
}

const toggleTemplatePublic = async (template: API.SiteTemplateVO) => {
  if (!template.id) return
  try {
    const res = await updateSiteTemplateByAdmin({
      id: template.id,
      isPublic: template.isPublic === 1 ? 0 : 1,
    })
    if (res.data.code === 0) {
      message.success(template.isPublic === 1 ? '已取消公开' : '已设为公开')
      loadTemplates()
    } else {
      message.error('操作失败：' + res.data.message)
    }
  } catch (error) {
    console.error('操作失败：', error)
    message.error('操作失败')
  }
}

const canManageTemplate = (template: API.SiteTemplateVO) => {
  if (!loginUserStore.loginUser.id) return false
  return isAdmin.value || template.userId === loginUserStore.loginUser.id
}

const canDeleteTemplate = (template: API.SiteTemplateVO) => {
  return canManageTemplate(template)
}

const openEditModal = (template: API.SiteTemplateVO) => {
  editingTemplateId.value = template.id
  editForm.name = template.name || ''
  editForm.description = template.description || ''
  editForm.category = template.category || undefined
  editVisible.value = true
}

const submitEdit = async () => {
  if (!editingTemplateId.value) return
  if (!editForm.name.trim()) {
    message.warning('请输入模板名称')
    return
  }
  savingEdit.value = true
  try {
    const res = await updateSiteTemplate({
      id: editingTemplateId.value,
      name: editForm.name.trim(),
      description: editForm.description.trim() || undefined,
      category: editForm.category || undefined,
    })
    if (res.data.code === 0) {
      message.success('更新模板成功')
      editVisible.value = false
      await loadTemplates()
    } else {
      message.error('更新模板失败：' + res.data.message)
    }
  } catch (error) {
    console.error('更新模板失败：', error)
    message.error('更新模板失败')
  } finally {
    savingEdit.value = false
  }
}

const toggleMyTemplatePublic = async (template: API.SiteTemplateVO) => {
  if (!template.id) return
  publishingTemplateId.value = template.id
  try {
    const res = await updateSiteTemplate({
      id: template.id,
      name: template.name || '未命名模板',
      description: template.description || undefined,
      category: template.category || undefined,
      isPublic: template.isPublic === 1 ? 0 : 1,
    })
    if (res.data.code === 0) {
      message.success(template.isPublic === 1 ? '已取消公开' : '已设为公开')
      await loadTemplates()
    } else {
      message.error('操作失败：' + res.data.message)
    }
  } catch (error) {
    console.error('操作失败：', error)
    message.error('操作失败')
  } finally {
    publishingTemplateId.value = undefined
  }
}

const removeTemplate = async (template: API.SiteTemplateVO) => {
  if (!template.id) return
  try {
    const res = await deleteSiteTemplate({ id: template.id })
    if (res.data.code === 0) {
      message.success('删除模板成功')
      loadTemplates()
    } else {
      message.error('删除模板失败：' + res.data.message)
    }
  } catch (error) {
    console.error('删除模板失败：', error)
    message.error('删除模板失败')
  }
}

onMounted(async () => {
  await loginUserStore.fetchLoginUser()
  loadTemplates()
})
</script>

<template>
  <div class="template-center-page">
    <div class="page-header">
      <div>
        <h1>模板中心</h1>
        <p>{{ pageDescription }}</p>
      </div>
    </div>

    <a-card class="filter-card">
      <div class="view-switch-bar">
        <a-radio-group :value="activeView" button-style="solid">
          <a-radio-button value="public" @click="switchView('public')">公开模板</a-radio-button>
          <a-radio-button value="mine" @click="switchView('mine')">我的模板</a-radio-button>
          <a-radio-button v-if="isAdmin" value="all" @click="switchView('all')">全部模板</a-radio-button>
        </a-radio-group>
      </div>
      <a-space wrap>
        <a-input
          v-model:value="query.searchText"
          placeholder="搜索模板名称"
          style="width: 220px"
          allow-clear
          @pressEnter="loadTemplates"
        />
        <a-select
          v-model:value="query.category"
          placeholder="模板分类"
          allow-clear
          style="width: 160px"
        >
          <a-select-option value="company">企业官网</a-select-option>
          <a-select-option value="portfolio">作品集</a-select-option>
          <a-select-option value="blog">博客</a-select-option>
          <a-select-option value="landing">落地页</a-select-option>
        </a-select>
        <a-button type="primary" @click="loadTemplates" :loading="loading">搜索</a-button>
      </a-space>
    </a-card>

    <div v-if="templates.length === 0" class="empty-wrapper">
      <a-empty
        :description="
          activeView === 'mine'
            ? '你还没有保存过模板'
            : activeView === 'public'
              ? '当前没有公开模板'
              : '暂无模板数据'
        "
      />
    </div>

    <div v-else class="template-grid">
      <a-card v-for="template in templates" :key="template.id" class="template-card" hoverable>
        <template #cover>
          <div class="template-cover">
            <img v-if="template.cover" :src="template.cover" alt="cover" />
            <div v-else class="cover-placeholder">模板</div>
          </div>
        </template>
        <a-card-meta :title="template.name" :description="template.description || '暂无描述'" />
        <div class="template-meta">
          <div class="template-tags">
            <a-tag color="blue">{{ template.category || '未分类' }}</a-tag>
            <a-tag v-if="template.isPublic === 1" color="green">公开</a-tag>
            <a-tag v-else-if="template.userId === loginUserStore.loginUser.id" color="orange">私有</a-tag>
            <a-tag v-else-if="isAdmin && activeView === 'all'" color="default">未公开</a-tag>
            <a-tag v-if="template.userId === loginUserStore.loginUser.id" color="purple">我的</a-tag>
            <a-tag v-if="activeView === 'public' && (template.useCount || 0) >= 1" color="gold">热门</a-tag>
          </div>
          <span>{{ template.user?.userName || '匿名用户' }} · 使用 {{ template.useCount || 0 }} 次</span>
        </div>
        <div class="template-actions">
          <a-button type="primary" block @click="useTemplate(template)">使用模板</a-button>

          <template v-if="isAdmin && activeView === 'all'">
            <a-button style="margin-top: 8px" block @click="toggleTemplatePublic(template)">
              {{ template.isPublic === 1 ? '取消公开' : '设为公开' }}
            </a-button>
            <div class="action-tip">管理员视图，可统一管理模板公开状态，未公开模板只在这里可见</div>
          </template>

          <template v-else-if="template.userId === loginUserStore.loginUser.id">
            <a-button style="margin-top: 8px" block @click="openEditModal(template)">编辑模板</a-button>
            <a-button
              style="margin-top: 8px"
              block
              @click="toggleMyTemplatePublic(template)"
              :loading="publishingTemplateId === template.id"
            >
              {{ template.isPublic === 1 ? '取消公开' : '公开模板' }}
            </a-button>
            <div class="action-tip">
              {{ template.isPublic === 1 ? '当前已公开，其他用户可以在公开模板中使用它。' : '当前仅自己可见，公开后其他用户也能使用。' }}
            </div>
          </template>

          <template v-else-if="activeView === 'public'">
            <div class="action-tip">公开模板优先按使用次数和创建时间展示，你可以直接拿来继续生成应用</div>
          </template>

          <a-popconfirm
            v-if="canDeleteTemplate(template)"
            title="确定删除这个模板吗？"
            @confirm="removeTemplate(template)"
          >
            <a-button danger style="margin-top: 8px" block>删除模板</a-button>
          </a-popconfirm>
        </div>
      </a-card>
    </div>

    <div class="pagination-wrapper">
      <a-pagination
        v-model:current="query.pageNum"
        v-model:page-size="query.pageSize"
        :total="page.total"
        :show-size-changer="false"
        @change="loadTemplates"
      />
    </div>

    <a-modal
      v-model:open="editVisible"
      title="编辑模板"
      @ok="submitEdit"
      :confirm-loading="savingEdit"
    >
      <a-form layout="vertical">
        <a-form-item label="模板名称" required>
          <a-input v-model:value="editForm.name" placeholder="请输入模板名称" />
        </a-form-item>
        <a-form-item label="模板描述">
          <a-textarea v-model:value="editForm.description" :rows="3" placeholder="请输入模板描述" />
        </a-form-item>
        <a-form-item label="模板分类（可选）">
          <a-select v-model:value="editForm.category" allow-clear placeholder="暂时不分类也可以">
            <a-select-option value="company">企业官网</a-select-option>
            <a-select-option value="portfolio">作品集</a-select-option>
            <a-select-option value="blog">博客</a-select-option>
            <a-select-option value="landing">落地页</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.template-center-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin-bottom: 8px;
}

.filter-card {
  margin-bottom: 20px;
}

.view-switch-bar {
  margin-bottom: 16px;
}

.empty-wrapper {
  padding: 48px 0;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.template-card {
  overflow: hidden;
}

.template-cover {
  height: 180px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  color: #999;
  font-size: 18px;
}

.template-meta {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  color: #666;
  font-size: 13px;
}

.template-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.template-actions {
  margin-top: 16px;
}

.action-tip {
  margin-top: 8px;
  color: #999;
  font-size: 12px;
  line-height: 1.5;
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>
