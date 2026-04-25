<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import { addApp, listMyAppVoByPage, listGoodAppVoByPage } from '@/api/appController'
import { getDeployUrl } from '@/config/env'
import AppCard from '@/components/AppCard.vue'

const route = useRoute()
const router = useRouter()
const loginUserStore = useLoginUserStore()

// 用户提示词
const userPrompt = ref('')
const creating = ref(false)
const selectedTemplateId = ref<number | undefined>()
const selectedTemplateName = ref('')

const templateEntryTips = [
  '先挑一个贴近业务的模板，再补一句你的差异化要求',
  '模板会作为起点保留，你输入的内容只负责补充和修改',
  '如果暂时没想法，也可以直接从空白需求开始创建',
]

// 我的应用数据
const myApps = ref<API.AppVO[]>([])
const myAppsPage = reactive({
  current: 1,
  pageSize: 6,
  total: 0,
})

// 精选应用数据
const featuredApps = ref<API.AppVO[]>([])
const featuredAppsPage = reactive({
  current: 1,
  pageSize: 6,
  total: 0,
})

// 设置提示词
const setPrompt = (prompt: string) => {
  userPrompt.value = prompt
}

const clearSelectedTemplate = () => {
  selectedTemplateId.value = undefined
  selectedTemplateName.value = ''
  router.replace({ path: '/', query: {} })
}

watch(
  () => route.query.templateId,
  (value) => {
    if (value) {
      selectedTemplateId.value = Number(value)
      selectedTemplateName.value = String(route.query.templateName || '')
    }
  },
)

// 优化提示词功能已移除

// 创建应用
const createApp = async () => {
  if (!userPrompt.value.trim()) {
    message.warning('请输入应用描述')
    return
  }

  if (!loginUserStore.loginUser.id) {
    message.warning('请先登录')
    await router.push('/user/login')
    return
  }

  creating.value = true
  try {
    const payload: API.AppAddRequest = selectedTemplateId.value
      ? {
          templateId: selectedTemplateId.value,
          customPrompt: userPrompt.value.trim(),
        }
      : {
          initPrompt: userPrompt.value.trim(),
        }

    const res = await addApp(payload)

    if (res.data.code === 0 && res.data.data) {
      message.success('应用创建成功')
      // 跳转到对话页面，确保ID是字符串类型
      const appId = String(res.data.data)
      await router.push(`/app/chat/${appId}`)
    } else {
      message.error('创建失败：' + res.data.message)
    }
  } catch (error) {
    console.error('创建应用失败：', error)
    message.error('创建失败，请重试')
  } finally {
    creating.value = false
  }
}

// 加载我的应用
const loadMyApps = async () => {
  if (!loginUserStore.loginUser.id) {
    return
  }

  try {
    const res = await listMyAppVoByPage({
      pageNum: myAppsPage.current,
      pageSize: myAppsPage.pageSize,
      sortField: 'createTime',
      sortOrder: 'desc',
    })

    if (res.data.code === 0 && res.data.data) {
      myApps.value = res.data.data.records || []
      myAppsPage.total = Number(res.data.data.totalRow || 0)
    }
  } catch (error) {
    console.error('加载我的应用失败：', error)
  }
}

// 加载精选应用
const loadFeaturedApps = async () => {
  try {
    const res = await listGoodAppVoByPage({
      pageNum: featuredAppsPage.current,
      pageSize: featuredAppsPage.pageSize,
      sortField: 'createTime',
      sortOrder: 'desc',
    })

    if (res.data.code === 0 && res.data.data) {
      featuredApps.value = res.data.data.records || []
      featuredAppsPage.total = Number(res.data.data.totalRow || 0)
    }
  } catch (error) {
    console.error('加载精选应用失败：', error)
  }
}

// 查看对话
const viewChat = (appId: string | number | undefined) => {
  if (appId) {
    router.push(`/app/chat/${appId}?view=1`)
  }
}

// 查看作品
const viewWork = (app: API.AppVO) => {
  if (app.deployKey) {
    const url = getDeployUrl(app.deployKey)
    window.open(url, '_blank')
  }
}

// 格式化时间函数已移除，不再需要显示创建时间

// 页面加载时获取数据
onMounted(() => {
  loadMyApps()
  loadFeaturedApps()

  if (route.query.templateId) {
    selectedTemplateId.value = Number(route.query.templateId)
    selectedTemplateName.value = String(route.query.templateName || '')
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

  document.addEventListener('mousemove', handleMouseMove)

  // 清理事件监听器
  return () => {
    document.removeEventListener('mousemove', handleMouseMove)
  }
})
</script>

<template>
  <div id="homePage">
    <div class="container">
      <!-- 网站标题和描述 -->
      <div class="hero-section">
        <div class="hero-badge">AI 应用搭建工作台</div>
        <h1 class="hero-title">一句话，生成能继续迭代的网站</h1>
        <p class="hero-description">
          从模板起步，到在线对话修改，再到版本管理与发布，整个建站流程都收进同一个工作台里。
        </p>
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="hero-stat-value">一句话</span>
            <span class="hero-stat-label">创建应用起点</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-value">在线对话</span>
            <span class="hero-stat-label">持续修改页面</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-value">版本快照</span>
            <span class="hero-stat-label">随时回看与恢复</span>
          </div>
        </div>
      </div>

      <div class="template-entry-card">
        <div class="template-entry-copy">
          <div class="template-entry-eyebrow">模板市场</div>
          <h2>需要起点时，再去模板市场挑一个顺手的模板</h2>
          <p>
            模板市场更适合“已经知道自己要做什么，但不想从零开始”的场景。首页仍然以直接输入需求为主，模板只是一个可选加速器。
          </p>
        </div>
        <div class="template-entry-side">
          <div class="template-entry-side-title">你可以这样用</div>
          <div class="template-entry-tips">
            <div v-for="tip in templateEntryTips" :key="tip" class="template-entry-tip">
              {{ tip }}
            </div>
          </div>
          <div class="template-entry-actions">
            <a-button type="default" size="large" @click="router.push('/templates')">去模板市场看看</a-button>
            <a-button v-if="selectedTemplateId" type="link" @click="clearSelectedTemplate">取消当前模板</a-button>
          </div>
        </div>
      </div>

      <!-- 用户提示词输入框 -->
      <div v-if="selectedTemplateId" class="selected-template-bar">
        <a-tag color="blue">当前模板：{{ selectedTemplateName || `模板 #${selectedTemplateId}` }}</a-tag>
        <span class="selected-template-text">已带入模板起点，现在只需要补充你想新增或修改的要求。</span>
      </div>
      <div class="input-section">
        <div class="input-section-header">
          <div>
            <div class="input-section-title">描述你要做的应用</div>
            <div class="input-section-subtitle">建议直接写目标用户、页面结构和你想要的风格，生成结果会更稳。</div>
          </div>
          <div class="input-section-tag">支持从空白创建，也支持模板增强</div>
        </div>
        <a-textarea
          v-model:value="userPrompt"
          :placeholder="selectedTemplateId ? '补充你希望在模板基础上增加或修改的要求' : '帮我创建一个有首页、文章列表、详情页和后台登录的个人博客网站，风格简洁一点'"
          :rows="5"
          :maxlength="1000"
          class="prompt-input"
        />
        <div class="input-actions">
          <a-button type="default" size="large" @click="router.push('/templates')">模板中心</a-button>
          <a-button type="primary" size="large" @click="createApp" :loading="creating">
            <template #icon>
              <span>↑</span>
            </template>
            {{ selectedTemplateId ? '基于模板创建' : '立即创建应用' }}
          </a-button>
        </div>
      </div>

      <!-- 快捷按钮 -->
      <div class="quick-actions-wrap">
        <div class="quick-actions-title">试试这些常见场景</div>
        <div class="quick-actions">
        <a-button
          type="default"
          @click="
            setPrompt(
              '创建一个现代化的个人博客网站，包含文章列表、详情页、分类标签、搜索功能、评论系统和个人简介页面。采用简洁的设计风格，支持响应式布局，文章支持Markdown格式，首页展示最新文章和热门推荐。',
            )
          "
          >个人博客网站</a-button
        >
        <a-button
          type="default"
          @click="
            setPrompt(
              '设计一个专业的企业官网，包含公司介绍、产品服务展示、新闻资讯、联系我们等页面。采用商务风格的设计，包含轮播图、产品展示卡片、团队介绍、客户案例展示，支持多语言切换和在线客服功能。',
            )
          "
          >企业官网</a-button
        >
        <a-button
          type="default"
          @click="
            setPrompt(
              '构建一个功能完整的在线商城，包含商品展示、购物车、用户注册登录、订单管理、支付结算等功能。设计现代化的商品卡片布局，支持商品搜索筛选、用户评价、优惠券系统和会员积分功能。',
            )
          "
          >在线商城</a-button
        >
        <a-button
          type="default"
          @click="
            setPrompt(
              '制作一个精美的作品展示网站，适合设计师、摄影师、艺术家等创作者。包含作品画廊、项目详情页、个人简历、联系方式等模块。采用瀑布流或网格布局展示作品，支持图片放大预览和作品分类筛选。',
            )
          "
          >作品展示网站</a-button
        >
        </div>
      </div>

      <!-- 我的作品 -->
      <div class="section section-card">
        <div class="section-heading">
          <div>
            <div class="section-eyebrow">Workspace</div>
            <h2 class="section-title">我的作品</h2>
          </div>
          <div class="section-extra">继续修改、查看对话或直接打开成品</div>
        </div>
        <div class="app-grid">
          <AppCard
            v-for="app in myApps"
            :key="app.id"
            :app="app"
            @view-chat="viewChat"
            @view-work="viewWork"
          />
        </div>
        <div class="pagination-wrapper">
          <a-pagination
            v-model:current="myAppsPage.current"
            v-model:page-size="myAppsPage.pageSize"
            :total="myAppsPage.total"
            :show-size-changer="false"
            :show-total="(total: number) => `共 ${total} 个应用`"
            @change="loadMyApps"
          />
        </div>
      </div>

      <!-- 精选案例 -->
      <div class="section section-card section-card-featured">
        <div class="section-heading">
          <div>
            <div class="section-eyebrow">Showcase</div>
            <h2 class="section-title">精选案例</h2>
          </div>
          <div class="section-extra">看看别人是怎么从一句话走到完整作品的</div>
        </div>
        <div class="featured-grid">
          <AppCard
            v-for="app in featuredApps"
            :key="app.id"
            :app="app"
            :featured="true"
            @view-chat="viewChat"
            @view-work="viewWork"
          />
        </div>
        <div class="pagination-wrapper">
          <a-pagination
            v-model:current="featuredAppsPage.current"
            v-model:page-size="featuredAppsPage.pageSize"
            :total="featuredAppsPage.total"
            :show-size-changer="false"
            :show-total="(total: number) => `共 ${total} 个案例`"
            @change="loadFeaturedApps"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#homePage {
  width: 100%;
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(59, 130, 246, 0.14) 0%, rgba(59, 130, 246, 0) 38%),
    linear-gradient(180deg, #f8fbff 0%, #f3f7fc 28%, #eef3f8 100%);
  position: relative;
  overflow: hidden;
}

/* 科技感网格背景 */
#homePage::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.28), transparent 78%);
  pointer-events: none;
}

/* 动态光效 */
#homePage::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(520px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(59, 130, 246, 0.08) 0%, transparent 75%),
    radial-gradient(circle at 85% 18%, rgba(99, 102, 241, 0.08) 0%, transparent 32%);
  pointer-events: none;
}

.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 32px 24px 72px;
  position: relative;
  z-index: 2;
  width: 100%;
  box-sizing: border-box;
}

/* 移除居中光束效果 */

/* 英雄区域 */
.hero-section {
  max-width: 980px;
  margin: 0 auto 32px;
  padding: 72px 32px 48px;
  color: #1e293b;
  position: relative;
  overflow: hidden;
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.72);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(16px);
  text-align: center;
}

.hero-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top, rgba(59, 130, 246, 0.14) 0%, transparent 52%);
  pointer-events: none;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.16);
  color: #2563eb;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 18px;
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 54px;
  font-weight: 700;
  margin: 0 0 18px;
  line-height: 1.12;
  color: #0f172a;
  letter-spacing: -0.03em;
  position: relative;
  z-index: 1;
}

.hero-description {
  max-width: 720px;
  margin: 0 auto;
  font-size: 18px;
  line-height: 1.8;
  color: #475569;
  position: relative;
  z-index: 1;
}

.hero-stats {
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  position: relative;
  z-index: 1;
}

.hero-stat {
  padding: 18px 16px;
  border-radius: 20px;
  background: rgba(248, 250, 252, 0.92);
  border: 1px solid #e2e8f0;
  text-align: left;
}

.hero-stat-value {
  display: block;
  color: #0f172a;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 6px;
}

.hero-stat-label {
  display: block;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

/* 模板入口 */
.template-entry-card {
  max-width: 980px;
  margin: 0 auto 20px;
  padding: 22px 24px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.06);
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(300px, 0.9fr);
  gap: 20px;
  align-items: stretch;
}

.template-entry-copy {
  padding: 8px 4px;
}

.template-entry-eyebrow {
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 10px;
}

.template-entry-card h2 {
  margin: 0 0 12px;
  font-size: 24px;
  line-height: 1.4;
  color: #0f172a;
}

.template-entry-card p {
  margin: 0;
  color: #64748b;
  line-height: 1.8;
  max-width: 560px;
  font-size: 14px;
}

.template-entry-side {
  padding: 18px;
  border-radius: 22px;
  background: rgba(248, 250, 252, 0.88);
  border: 1px solid #e2e8f0;
}

.template-entry-side-title {
  margin-bottom: 12px;
  color: #0f172a;
  font-size: 14px;
  font-weight: 700;
}

.template-entry-actions {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.template-entry-tips {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.template-entry-tip {
  padding: 12px 14px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-size: 13px;
  line-height: 1.6;
}

/* 输入区域 */
.selected-template-bar {
  max-width: 800px;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 4px;
}

.selected-template-text {
  color: #64748b;
  font-size: 13px;
}

.input-section {
  position: relative;
  margin: 0 auto 28px;
  max-width: 920px;
  padding: 24px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(18px);
}

.input-section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
}

.input-section-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6px;
}

.input-section-subtitle {
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
}

.input-section-tag {
  flex-shrink: 0;
  padding: 8px 12px;
  border-radius: 999px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
}

.prompt-input {
  border-radius: 22px;
  border: 1px solid #dbe4f0;
  font-size: 16px;
  padding: 20px 22px;
  background: #fcfdff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.prompt-input:focus {
  background: #ffffff;
  border-color: #93c5fd;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

.input-actions {
  margin-top: 16px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
}

/* 快捷按钮 */
.quick-actions-wrap {
  max-width: 980px;
  margin: 0 auto 36px;
}

.quick-actions-title {
  margin-bottom: 14px;
  color: #475569;
  font-size: 14px;
  font-weight: 600;
}

.quick-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 60px;
  flex-wrap: wrap;
}

.quick-actions .ant-btn {
  border-radius: 25px;
  padding: 8px 20px;
  height: auto;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #475569;
  backdrop-filter: blur(15px);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.quick-actions .ant-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  transition: left 0.5s;
}

.quick-actions .ant-btn:hover::before {
  left: 100%;
}

.quick-actions .ant-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(59, 130, 246, 0.4);
  color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
}

/* 区域标题 */
.section {
  margin-bottom: 28px;
}

.section-card {
  padding: 28px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.08);
}

.section-card-featured {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(248, 250, 252, 0.96) 100%);
}

.section-heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 24px;
}

.section-eyebrow {
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.section-title {
  font-size: 30px;
  font-weight: 700;
  margin: 0;
  color: #0f172a;
}

.section-extra {
  color: #64748b;
  font-size: 14px;
}

/* 我的作品网格 */
.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

/* 精选案例网格 */
.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 20px 16px 56px;
  }

  .hero-section {
    padding: 48px 20px 28px;
    border-radius: 24px;
  }

  .hero-title {
    font-size: 34px;
  }

  .hero-description {
    font-size: 16px;
  }

  .hero-stats,
  .template-entry-tips {
    grid-template-columns: 1fr;
  }

  .input-section-header,
  .section-heading,
  .template-entry-card {
    flex-direction: column;
  }

  .template-entry-card {
    grid-template-columns: 1fr;
  }

  .template-entry-actions,
  .input-actions {
    align-items: stretch;
    justify-content: flex-start;
  }

  .selected-template-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .input-section,
  .section-card {
    padding: 20px;
    border-radius: 22px;
  }

  .app-grid,
  .featured-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    justify-content: center;
  }
}
</style>
