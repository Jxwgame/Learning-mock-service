<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import Navsidebar from "@/components/Navsidebar.vue";
import TopNavbar from "@/components/TopNavbar.vue";

const isAppReady = ref(false);
const route = useRoute();

// Global Sidebar State
const isSidebarCollapsed = ref(false);
const isMobileSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
};

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false;
};

onMounted(() => {
  isAppReady.value = true;
});
</script>

<template>
  <div
    v-if="!isAppReady"
    class="d-flex justify-content-center align-items-center vh-100"
  >
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>

  <div v-else class="app-container">
    <template v-if="!route.meta.public">
      <Navsidebar 
        :collapsed="isSidebarCollapsed" 
        :mobile-open="isMobileSidebarOpen"
        @toggle-collapse="toggleSidebar"
        @close-mobile="closeMobileSidebar"
      />
      <TopNavbar 
        :is-sidebar-collapsed="isSidebarCollapsed"
        @toggle-mobile-sidebar="toggleMobileSidebar"
      />
      
      <main class="main-content" :class="{ 'collapsed': isSidebarCollapsed }">
        <router-view />
      </main>
    </template>
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
}
</style>