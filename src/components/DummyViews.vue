<template>
  <div class="dummy-view">
    <div class="page-header">
      <div class="page-title-section">
        <h1 class="page-title">{{ title }}</h1>
        <p class="page-subtitle">Manage, view, and analyze your {{ title.toLowerCase() }} data.</p>
      </div>
    </div>

    <!-- Mock Stats Dashboard Widgets if Dashboard is selected -->
    <div v-if="tab === 'dashboard'" class="dashboard-grid">
      <div class="stat-card">
        <div class="stat-icon-wrapper orgs">
          <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">7</div>
          <div class="stat-label">Organizations</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper facilities">
          <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 10.5V20a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9.5M12 4a4 4 0 0 1 4 4v2.5H8V8a4 4 0 0 1 4-4z" />
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">24</div>
          <div class="stat-label">Facilities</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper departments">
          <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">12</div>
          <div class="stat-label">Departments</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper users">
          <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">84</div>
          <div class="stat-label">Users</div>
        </div>
      </div>
    </div>

    <!-- General Placeholder Panel -->
    <div class="placeholder-card">
      <div class="placeholder-content">
        <div class="illustration-container">
          <svg class="illustration" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3>{{ title }} Module</h3>
        <p>This section is currently under active development. You can view, add, and manage data from the fully functional <strong class="highlight" @click="$emit('navigate', 'organizations')">Organizations</strong> page.</p>
        <button class="btn btn-primary" @click="$emit('navigate', 'organizations')">Go to Organizations</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  tab: {
    type: String,
    required: true
  }
});

defineEmits(['navigate']);

const title = computed(() => {
  if (!props.tab) return '';
  return props.tab.charAt(0).toUpperCase() + props.tab.slice(1);
});
</script>

<style scoped>
.dummy-view {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon-wrapper.orgs { background-color: rgba(2, 122, 117, 0.1); color: var(--color-primary); }
.stat-icon-wrapper.facilities { background-color: rgba(3, 105, 161, 0.1); color: #0284c7; }
.stat-icon-wrapper.departments { background-color: rgba(126, 34, 206, 0.1); color: #9333ea; }
.stat-icon-wrapper.users { background-color: rgba(21, 128, 61, 0.1); color: #16a34a; }

.stat-icon {
  width: 24px;
  height: 24px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.placeholder-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 60px 24px;
  box-shadow: var(--shadow-sm);
  display: flex;
  justify-content: center;
  align-items: center;
}

.placeholder-content {
  max-width: 420px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.illustration-container {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.illustration {
  width: 40px;
  height: 40px;
}

.placeholder-content h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.placeholder-content p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.highlight {
  color: var(--color-primary);
  cursor: pointer;
  text-decoration: underline;
  font-weight: 600;
}

.placeholder-content button {
  margin-top: 8px;
}
</style>
