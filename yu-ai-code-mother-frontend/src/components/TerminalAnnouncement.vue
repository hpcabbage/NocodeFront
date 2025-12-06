<template>
  <div class="terminal-container">
    <div class="terminal-window">
      <div class="terminal-header">
        <div class="control-btn close"></div>
        <div class="control-btn minimize"></div>
        <div class="control-btn maximize"></div>
        <span class="title">公告栏</span>
      </div>
      <div class="terminal-content">
        <div v-for="(item, index) in announcements" :key="index" class="announcement">
          <span class="prompt">admin:</span>
          <span class="timestamp">{{ item.timestamp }}</span>
          <span class="message" :style="{ color: item.color }">{{ item.content }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const announcements = [
  {
    timestamp: 'admin Sep 25 09:11:04',
    content: '[关于开源试用,面试官访问] 试用账户: user 密码:12345678',
    color: '#ff5555'
  },
  {
    timestamp: 'admin Sep 25 09:12:00',
    content: '[个人中心] 快来使用AI建站吧！',
    color: '#50fa7b'
  }
];
</script>

<style scoped>
.terminal-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 480px;
  z-index: 1000;
}

.terminal-window {
  background: #282a36;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  overflow: hidden;
}

.terminal-header {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #343746;
  border-bottom: 1px solid #191a21;
}

.control-btn {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.close { background: #ff5f56; }
.minimize { background: #ffbd2e; }
.maximize { background: #27c93f; }

.title {
  margin-left: auto;
  color: #f8f8f2;
  font-size: 14px;
}

.terminal-content {
  padding: 16px;
  min-height: 180px;
  font-family: 'Fira Code', monospace;
}

.announcement {
  margin-bottom: 12px;
  line-height: 1.5;
}

.prompt {
  color: #bd93f9;
  margin-right: 8px;
}

.timestamp {
  color: #6272a4;
  margin-right: 12px;
}
</style>