<template>
  <div class="logs-page">
    <div class="content-wrapper">
      <div class="page-header">
        <div class="header-content">
          <h1><i class="fas fa-scroll me-2"></i>System Logs</h1>
          <p>ดู Logs ของระบบ: Audit, System, Action, Entity Changes</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline-light" @click="fetchLogs">
            <i class="fas fa-sync-alt me-1"></i>รีเฟรช
          </button>
        </div>
      </div>

      <!-- Log Type Tabs -->
      <div class="logs-tabs">
        <button 
          v-for="tab in logTabs" 
          :key="tab.value" 
          :class="['tab-btn', { active: activeTab === tab.value }]"
          @click="switchTab(tab.value)"
        >
          <i :class="tab.icon + ' me-2'"></i>{{ tab.label }}
        </button>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label small text-muted">ค้นหา</label>
            <input 
              type="text" 
              class="form-control" 
              v-model="search" 
              placeholder="ค้นหา..." 
              @keyup.enter="fetchLogs"
            />
          </div>
          <div class="col-md-2" v-if="activeTab === 'system'">
            <label class="form-label small text-muted">Level</label>
            <select class="form-select" v-model="level" @change="fetchLogs">
              <option value="">ทั้งหมด</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small text-muted">แสดง</label>
            <select class="form-select" v-model="limit" @change="fetchLogs">
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-primary w-100" @click="fetchLogs">
              <i class="fas fa-search me-1"></i>ค้นหา
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="mt-3 text-muted">กำลังโหลด Logs...</p>
      </div>

      <!-- Logs Table -->
      <div v-else class="logs-table-card">
        <div v-if="logs.length === 0" class="text-center py-5 text-muted">
          <i class="fas fa-inbox fa-3x mb-3 opacity-50"></i>
          <p>ไม่พบ Logs ในประเภทนี้</p>
        </div>
        <table v-else class="table table-hover mb-0">
          <thead>
            <tr>
              <th>เวลา</th>
              <th v-if="activeTab !== 'system'">ผู้ใช้</th>
              <th v-if="activeTab === 'system'">Level</th>
              <th>{{ getActionColumnLabel() }}</th>
              <th v-if="['entity'].includes(activeTab)">Entity</th>
              <th>รายละเอียด</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="getLogId(log)" class="log-row">
              <td class="text-muted small">{{ formatDate(log.created_at) }}</td>
              <td v-if="activeTab !== 'system'">
                <span v-if="getUser(log)">{{ getUser(log) }}</span>
                <span v-else class="text-muted">-</span>
              </td>
              <td v-if="activeTab === 'system'">
                <span :class="getLevelBadge(log.level)">{{ log.level }}</span>
              </td>
              <td>
                <span class="action-badge">{{ getAction(log) }}</span>
              </td>
              <td v-if="['entity'].includes(activeTab)">
                <span class="entity-badge">{{ getEntity(log) }}</span>
              </td>
              <td>
                <button class="btn btn-sm btn-outline-secondary" @click="showDetails(log)">
                  <i class="fas fa-eye"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pagination-bar" v-if="totalPages > 1">
          <div class="pagination-info">
            หน้า {{ page }} จาก {{ totalPages }} ({{ total }} รายการ)
          </div>
          <div class="pagination-buttons">
            <button class="btn btn-sm btn-outline-primary" :disabled="page <= 1" @click="goPage(page - 1)">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button 
              v-for="p in paginationRange" 
              :key="p" 
              :class="['btn btn-sm', p === page ? 'btn-primary' : 'btn-outline-primary']"
              @click="goPage(p)"
            >
              {{ p }}
            </button>
            <button class="btn btn-sm btn-outline-primary" :disabled="page >= totalPages" @click="goPage(page + 1)">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Details Modal -->
      <div v-if="selectedLog" class="modal-overlay" @click.self="selectedLog = null">
        <div class="modal-content">
          <div class="modal-header">
            <h5>รายละเอียด Log</h5>
            <button class="btn-close" @click="selectedLog = null"></button>
          </div>
          <div class="modal-body">
            <pre class="log-details">{{ JSON.stringify(selectedLog, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getLogs, type LogType } from '@/modules/reports/reports.api';

// Tab definitions
const logTabs: { value: LogType; label: string; icon: string }[] = [
  { value: 'system', label: 'System Logs', icon: 'fas fa-server' },
  { value: 'entity', label: 'Entity Changes', icon: 'fas fa-exchange-alt' }
];

// State
const loading = ref(true);
const activeTab = ref<LogType>('system');
const logs = ref<any[]>([]);
const search = ref('');
const level = ref('');
const page = ref(1);
const limit = ref(50);
const total = ref(0);
const totalPages = ref(0);
const selectedLog = ref<any>(null);

// Computed
const paginationRange = computed(() => {
  const range: number[] = [];
  const start = Math.max(1, page.value - 2);
  const end = Math.min(totalPages.value, page.value + 2);
  for (let i = start; i <= end; i++) range.push(i);
  return range;
});

// Methods
async function fetchLogs() {
  loading.value = true;
  try {
    const result = await getLogs({
      type: activeTab.value,
      page: page.value,
      limit: limit.value,
      search: search.value || undefined,
      level: level.value || undefined
    });
    logs.value = result.logs || [];
    total.value = result.total || 0;
    totalPages.value = result.totalPages || 0;
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    logs.value = [];
  } finally {
    loading.value = false;
  }
}

function switchTab(tab: LogType) {
  activeTab.value = tab;
  page.value = 1;
  search.value = '';
  level.value = '';
  fetchLogs();
}

function goPage(p: number) {
  page.value = p;
  fetchLogs();
}

function getLogId(log: any) {
  return log.log_id || log.system_log_id || log.entity_change_log_id || Math.random();
}

function getUser(log: any) {
  if (log.user) return `${log.user.first_name} ${log.user.last_name}`;
  if (log.actor) return `${log.actor.first_name} ${log.actor.last_name}`;
  return null;
}

function getAction(log: any) {
  if (activeTab.value === 'system') return log.source;
  if (activeTab.value === 'entity') return log.change_type;
  return '-';
}

function getEntity(log: any) {
  if (log.entity_type) {
    return log.entity_id ? `${log.entity_type}#${log.entity_id}` : log.entity_type;
  }
  return '-';
}

function getActionColumnLabel() {
  if (activeTab.value === 'system') return 'Source';
  if (activeTab.value === 'entity') return 'Change Type';
  return 'Action';
}

function getLevelBadge(lv: string) {
  if (lv === 'error') return 'badge bg-danger';
  if (lv === 'warn') return 'badge bg-warning text-dark';
  return 'badge bg-info';
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('th-TH');
}

function showDetails(log: any) {
  selectedLog.value = log;
}

onMounted(fetchLogs);
</script>

<style scoped>
.logs-page {
  min-height: 100vh;
  background-color: #f1f5f9;
}

.content-wrapper {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header - Green Theme */
.page-header {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-radius: 16px;
  padding: 24px 30px;
  margin-bottom: 24px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(5, 150, 105, 0.15);
}

.page-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.page-header p {
  opacity: 0.9;
  margin: 0;
}

/* Tabs */
.logs-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 10px 20px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s;
}

.tab-btn:hover {
  border-color: #10b981;
  color: #10b981;
}

.tab-btn.active {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  border-color: transparent;
}

/* Filters */
.filters-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Table */
.logs-table-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.table {
  margin: 0;
}

.table th {
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
  padding: 14px 16px;
}

.table td {
  padding: 12px 16px;
  vertical-align: middle;
}

.log-row:hover {
  background: #f0fdf4;
}

.action-badge {
  background: #e0f2fe;
  color: #0369a1;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
}

.entity-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
}

/* Pagination */
.pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
}

.pagination-info {
  color: #64748b;
  font-size: 0.9rem;
}

.pagination-buttons {
  display: flex;
  gap: 4px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 700px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h5 {
  margin: 0;
  font-weight: 600;
}

.modal-body {
  padding: 20px;
  max-height: 60vh;
  overflow: auto;
}

.log-details {
  background: #1e293b;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  overflow-x: auto;
  margin: 0;
}
</style>
