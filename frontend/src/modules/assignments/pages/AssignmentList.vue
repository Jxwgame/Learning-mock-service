<template>
  <div class="assignments-list">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="h4 mb-0"><i class="fas fa-tasks me-2"></i>แบบฝึกหัด</h2>
      <button
        v-if="isInstructor"
        class="btn btn-primary btn-sm"
        @click="$emit('create')"
      >
        <i class="fas fa-plus me-1"></i> เพิ่มแบบฝึกหัด
      </button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="assignments.length === 0" class="text-center py-5 text-muted">
      <i class="fas fa-clipboard-list fa-3x mb-3"></i>
      <p>ยังไม่มีแบบฝึกหัดในบทเรียนนี้</p>
    </div>

    <div v-else class="list-group">
      <div
        v-for="assignment in assignments"
        :key="assignment.assignment_id"
        class="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3"
      >
        <div class="d-flex align-items-start gap-3">
          <div class="assignment-icon bg-light rounded p-2 text-primary">
            <i class="fas fa-file-alt fa-lg"></i>
          </div>
          <div>
            <h5 class="mb-1 text-primary cursor-pointer" @click="$emit('select', assignment)">
              {{ assignment.title }}
            </h5>
            <p class="mb-1 text-muted small">
              {{ truncate(assignment.description, 100) }}
            </p>
            <div class="d-flex align-items-center gap-3 text-muted x-small">
              <span v-if="assignment.max_score !== null">
                <i class="fas fa-star me-1"></i> {{ assignment.max_score }} คะแนน
              </span>
              <span v-if="assignment.due_date">
                <i class="fas fa-calendar-alt me-1"></i>
                ครบกำหนด: {{ formatDate(assignment.due_date) }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="isInstructor" class="d-flex gap-2">
          <button
            class="btn btn-outline-secondary btn-sm"
            @click="$emit('edit', assignment)"
            title="แก้ไข"
          >
            <i class="fas fa-edit"></i>
          </button>
          <button
            class="btn btn-outline-danger btn-sm"
            @click="$emit('delete', assignment.assignment_id)"
            title="ลบ"
          >
            <i class="fas fa-trash"></i>
          </button>
          <button
            class="btn btn-outline-primary btn-sm"
             @click="$emit('view-submissions', assignment)"
             title="ตรวจงาน"
          >
            <i class="fas fa-check-double"></i>
          </button>
        </div>
        
        <div v-else>
             <button class="btn btn-primary btn-sm" @click="$emit('select', assignment)">
                ทำแบบฝึกหัด
             </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { Assignment } from '../assignments.api';

const props = defineProps({
  assignments: {
    type: Array as PropType<Assignment[]>,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  isInstructor: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['create', 'edit', 'delete', 'select', 'view-submissions']);

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(text: string, length: number) {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}
</script>

<style scoped>
.x-small {
  font-size: 0.85rem;
}
.cursor-pointer {
  cursor: pointer;
}
.cursor-pointer:hover {
  text-decoration: underline;
}
</style>
