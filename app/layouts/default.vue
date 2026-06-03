<template>
  <div class="app-container">
    <!-- Top Mobile/Tablet Header Bar -->
    <header class="mobile-top-bar no-print">
      <button 
        class="hamburger-btn" 
        @click="toggleSidebar" 
        aria-label="Toggle Navigation Menu"
        :aria-expanded="isSidebarOpen.toString()"
      >
        <i class="ti ti-menu-2"></i>
      </button>
      <div class="mobile-logo-container">
        <img src="/logo.png" alt="Cleand Logo" class="mobile-logo-img" />
      </div>
      <div style="width: 32px;"></div> <!-- Spacer for balancing -->
    </header>

    <!-- Sidebar Backdrop for Mobiles & Tablets -->
    <div 
      class="sidebar-backdrop no-print" 
      v-if="isSidebarOpen" 
      @click="closeSidebar"
      aria-hidden="true"
    ></div>

    <!-- Sidebar -->
    <aside class="sidebar no-print" :class="{ 'sidebar-open': isSidebarOpen }">
      <div class="brand">
        <img src="/logo.png" alt="Cleand Logo" class="brand-logo-img" />
        <button class="close-sidebar-btn" @click="closeSidebar" aria-label="Close Sidebar">&times;</button>
      </div>
      
      <nav>
        <ul class="nav-menu">
          <li>
            <NuxtLink to="/" class="nav-link" @click="closeSidebar">
              <i class="ti ti-layout-dashboard nav-icon" aria-hidden="true"></i>
              <span>Dashboard</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/orders" class="nav-link" @click="closeSidebar">
              <i class="ti ti-wash-machine nav-icon" aria-hidden="true"></i>
              <span>Orders</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/history" class="nav-link" @click="closeSidebar">
              <i class="ti ti-history nav-icon" aria-hidden="true"></i>
              <span>Order History</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/customers" class="nav-link" @click="closeSidebar">
              <i class="ti ti-users nav-icon" aria-hidden="true"></i>
              <span>Customers</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/expenses" class="nav-link" @click="closeSidebar">
              <i class="ti ti-receipt nav-icon" aria-hidden="true"></i>
              <span>Expenses & Payouts</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/blog" class="nav-link" @click="closeSidebar">
              <i class="ti ti-news nav-icon" aria-hidden="true"></i>
              <span>Articles & Tips</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Main Content Body -->
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const isSidebarOpen = ref(false)
const route = useRoute()

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

// Automatically close sidebar when route changes
watch(() => route.path, () => {
  closeSidebar()
})
</script>

<style scoped>
.nav-icon {
  font-size: 1.35rem;
  width: 24px;
  text-align: center;
  display: inline-block;
}
</style>

