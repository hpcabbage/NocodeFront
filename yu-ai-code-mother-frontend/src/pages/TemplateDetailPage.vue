<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { getSiteTemplateVoById } from '@/api/templateController'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const template = ref<API.SiteTemplateVO>()

const templateId = computed(() => Number(route.params.id || 0))

const loadTemplate = async () => {
  if (!templateId.value) {
    message.error('模板 id 不存在')
    router.push('/templates')
    return
  }
  loading.value = true
  try {
    const res = await getSiteTemplateVoById({ id: templateId.value })
    if (res.data.code === 0 && res.data.data) {
      template.value = res.data.data
    } else {
      message.error('加载模板详情失败：' + res.data.message)
    }
  } catch (error) {
    console.error('加载模板详情失败：', error)
    message.error('加载模板详情失败')
  } finally {
    loading.value = false
  }
}

const useTemplate = () => {
  if (!template.value?.id) return
  router.push({
    path: '/',
    query: {
      templateId: String(template.value.id),
      templateName: template.value.name || '',
    },
  })
}

const formatDateTime = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const summaryText = computed(() => {
  if (template.value?.description) return template.value.description
  return `这是一个适合${template.value?.category || '通用'}场景的模板，你可以直接基于它继续补充个性化要求。`
})

const detailHighlights = computed(() => {
  const items = [
    {
      label: '适合场景',
      value: template.value?.category || '通用场景',
      tone: 'blue',
    },
    {
      label: '推荐动作',
      value: '先直接使用模板，再补充你的产品目标、风格和细节要求',
      tone: 'purple',
    },
  ]

  if (template.value?.description) {
    items.push({
      label: '内容摘要',
      value: template.value.description,
      tone: 'green',
    })
  }

  return items
})

const promptStats = computed(() => {
  const prompt = template.value?.initPrompt || ''
  const lineCount = prompt ? prompt.split('\n').filter((line) => line.trim().length > 0).length : 0
  return [
    {
      label: '提示词长度',
      value: prompt ? `${prompt.length} 字符` : '暂无内容',
    },
    {
      label: '有效段落',
      value: prompt ? `${lineCount || 1} 段` : '-',
    },
  ]
})

onMounted(() => {
  loadTemplate()
})
</script>

<template>
  <div class="template-detail-page">
    <a-page-header title="模板详情" sub-title="查看模板定位、提示词与使用信息" @back="router.push('/templates')" />

    <a-spin :spinning="loading">
      <div v-if="template" class="detail-layout">
        <div class="left-column">
          <a-card class="preview-card" :bordered="false">
            <div class="cover-panel">
              <img v-if="template.cover" :src="template.cover" alt="cover" class="cover-image" />
              <div v-else class="cover-placeholder">
                <div class="placeholder-badge">Template</div>
                <div class="placeholder-title">{{ template.name || '未命名模板' }}</div>
                <div class="placeholder-subtitle">{{ template.category || '未分类' }} · {{ template.codeGenType || 'html' }}</div>
              </div>
            </div>
          </a-card>

          <a-card class="stats-card" title="模板信息" :bordered="false">
            <div class="stats-grid">
              <div class="stat-item accent-blue">
                <div class="stat-label">代码类型</div>
                <div class="stat-value">{{ template.codeGenType || 'html' }}</div>
              </div>
              <div class="stat-item accent-purple">
                <div class="stat-label">使用次数</div>
                <div class="stat-value">{{ template.useCount || 0 }}</div>
              </div>
              <div class="stat-item accent-amber">
                <div class="stat-label">创建时间</div>
                <div class="stat-value">{{ formatDateTime(template.createTime) }}</div>
              </div>
              <div class="stat-item accent-green">
                <div class="stat-label">模板状态</div>
                <div class="stat-value">{{ template.isPublic === 1 ? '公开模板' : '私有模板' }}</div>
              </div>
            </div>
          </a-card>
        </div>

        <div class="right-column">
          <a-card class="hero-card" :bordered="false">
            <div class="hero-top">
              <div class="title-row">
                <div class="hero-main">
                  <div class="eyebrow">可复用模板</div>
                  <h1>{{ template.name || '未命名模板' }}</h1>
                  <p class="subtitle">{{ summaryText }}</p>
                </div>
                <div class="hero-side">
                  <div class="tag-row">
                    <a-tag color="blue">{{ template.category || '未分类' }}</a-tag>
                    <a-tag v-if="template.isPublic === 1" color="green">公开</a-tag>
                    <a-tag v-if="template.userId" color="purple">作者：{{ template.user?.userName || '匿名用户' }}</a-tag>
                  </div>
                  <div class="hero-side-tip">已整理好模板描述与初始化提示词，可直接复用</div>
                </div>
              </div>

              <div class="quick-meta-row">
                <div class="quick-meta-item">
                  <span class="quick-meta-label">作者</span>
                  <span class="quick-meta-value">{{ template.user?.userName || '匿名用户' }}</span>
                </div>
                <div class="quick-meta-item">
                  <span class="quick-meta-label">最近更新</span>
                  <span class="quick-meta-value">{{ formatDateTime(template.updateTime || template.createTime) }}</span>
                </div>
                <div class="quick-meta-item">
                  <span class="quick-meta-label">模板来源</span>
                  <span class="quick-meta-value">{{ template.templateSource || 'custom' }}</span>
                </div>
              </div>
            </div>

            <div class="highlight-row" :class="{ 'highlight-row-triple': detailHighlights.length >= 3 }">
              <div
                v-for="item in detailHighlights"
                :key="item.label"
                class="highlight-card"
                :class="[
                  item.tone === 'blue' ? 'emphasis-card' : '',
                  item.tone === 'purple' ? 'accent-card-purple' : '',
                  item.tone === 'green' ? 'accent-card-green' : '',
                ]"
              >
                <div class="highlight-label">{{ item.label }}</div>
                <div class="highlight-value">{{ item.value }}</div>
              </div>
            </div>

            <div class="action-row">
              <a-button type="default" @click="router.push('/templates')">返回模板中心</a-button>
              <a-button type="primary" size="large" @click="useTemplate">立即使用这个模板</a-button>
            </div>
          </a-card>

          <a-card class="prompt-card" title="模板提示词" :bordered="false">
            <div class="prompt-tip">这里展示的是模板的原始初始化提示词。建议先直接使用模板，再在对话里继续补充你的业务目标、风格和边界要求。</div>
            <div class="prompt-stats">
              <div v-for="item in promptStats" :key="item.label" class="prompt-stat-item">
                <span class="prompt-stat-label">{{ item.label }}</span>
                <span class="prompt-stat-value">{{ item.value }}</span>
              </div>
            </div>
            <div class="prompt-block">
              <div class="prompt-toolbar">
                <span class="prompt-chip">Init Prompt</span>
                <span class="prompt-toolbar-tip">可作为首轮生成输入</span>
              </div>
              <div class="prompt-content">{{ template.initPrompt || '暂无提示词内容' }}</div>
            </div>
          </a-card>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<style scoped>
.template-detail-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
}

.detail-layout {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 24px;
  margin-top: 16px;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-card,
.stats-card,
.hero-card,
.prompt-card {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
}

.cover-panel {
  height: 360px;
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0ecff 0%, #f5f7ff 45%, #fef3f2 100%);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  width: 100%;
  height: 100%;
  padding: 28px;
  color: #1f2937;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.85), transparent 32%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0));
}

.placeholder-badge {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.75);
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 14px;
}

.placeholder-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.placeholder-subtitle {
  color: #4b5563;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  gap: 12px;
}

.stat-item {
  padding: 14px 16px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
}

.accent-blue {
  background: linear-gradient(180deg, #f5f9ff 0%, #eef6ff 100%);
}

.accent-purple {
  background: linear-gradient(180deg, #faf5ff 0%, #f5edff 100%);
}

.accent-amber {
  background: linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%);
}

.accent-green {
  background: linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%);
}

.stat-label {
  color: #64748b;
  font-size: 12px;
  margin-bottom: 6px;
}

.stat-value {
  color: #0f172a;
  font-size: 15px;
  font-weight: 600;
}

.eyebrow {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 8px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.title-row h1 {
  margin: 0;
  font-size: 32px;
}

.tag-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.subtitle {
  margin: 12px 0 0;
  color: #475569;
  line-height: 1.8;
  font-size: 15px;
  max-width: 760px;
}

.hero-top {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.hero-main {
  flex: 1;
}

.hero-side {
  min-width: 220px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.hero-side-tip {
  padding: 10px 14px;
  border-radius: 14px;
  background: linear-gradient(135deg, #eff6ff 0%, #f8fbff 100%);
  border: 1px solid #dbeafe;
  color: #2563eb;
  font-size: 13px;
  line-height: 1.6;
  text-align: right;
}

.quick-meta-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.quick-meta-item {
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.96);
  border: 1px solid #eef2f7;
}

.quick-meta-label {
  display: block;
  color: #64748b;
  font-size: 12px;
  margin-bottom: 8px;
}

.quick-meta-value {
  color: #0f172a;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.6;
}

.highlight-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.highlight-row-triple {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.highlight-card {
  padding: 16px;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #eef2f7;
}

.emphasis-card {
  background: linear-gradient(135deg, #eff6ff 0%, #f8fbff 55%, #eef2ff 100%);
}

.accent-card-purple {
  background: linear-gradient(135deg, #faf5ff 0%, #f8f5ff 55%, #f3e8ff 100%);
}

.accent-card-green {
  background: linear-gradient(135deg, #f0fdf4 0%, #f7fff8 55%, #dcfce7 100%);
}

.highlight-label {
  color: #64748b;
  font-size: 12px;
  margin-bottom: 8px;
}

.highlight-value {
  color: #0f172a;
  font-weight: 600;
  line-height: 1.6;
}

.prompt-tip {
  color: #64748b;
  line-height: 1.7;
  margin-bottom: 14px;
}

.prompt-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.prompt-stat-item {
  padding: 14px 16px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
}

.prompt-stat-label {
  display: block;
  color: #64748b;
  font-size: 12px;
  margin-bottom: 8px;
}

.prompt-stat-value {
  color: #0f172a;
  font-size: 14px;
  font-weight: 600;
}

.prompt-block {
  background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
  border-radius: 16px;
  padding: 18px;
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.prompt-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.prompt-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.16);
  color: #93c5fd;
  font-size: 12px;
  font-weight: 600;
}

.prompt-toolbar-tip {
  color: #94a3b8;
  font-size: 12px;
}

.prompt-content {
  white-space: pre-wrap;
  line-height: 1.9;
  color: #e2e8f0;
  font-size: 14px;
}

.action-row {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .cover-panel {
    height: 240px;
  }

  .title-row {
    flex-direction: column;
  }

  .hero-side {
    align-items: flex-start;
    min-width: 0;
  }

  .hero-side-tip {
    text-align: left;
  }

  .tag-row {
    justify-content: flex-start;
  }

  .quick-meta-row {
    grid-template-columns: 1fr;
  }

  .highlight-row {
    grid-template-columns: 1fr;
  }

  .highlight-row-triple {
    grid-template-columns: 1fr;
  }

  .prompt-stats {
    grid-template-columns: 1fr;
  }

  .action-row {
    justify-content: stretch;
    flex-direction: column;
  }
}
</style>
