<template>
  <div class="app-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="brand">
        <img src="/logo.png" alt="Cleand Logo" class="brand-logo-img" />
      </div>
      
      <nav>
        <ul class="nav-menu">
          <li>
            <NuxtLink to="/" class="nav-link">
              <i class="ti ti-layout-dashboard nav-icon"></i>
              <span>Dashboard</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/orders" class="nav-link">
              <i class="ti ti-wash-machine nav-icon"></i>
              <span>Orders</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/history" class="nav-link">
              <i class="ti ti-history nav-icon"></i>
              <span>Order History</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/customers" class="nav-link">
              <i class="ti ti-users nav-icon"></i>
              <span>Customers</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/reports" class="nav-link">
              <i class="ti ti-chart-bar nav-icon"></i>
              <span>Reports & Collections</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/expenses" class="nav-link">
              <i class="ti ti-receipt nav-icon"></i>
              <span>Expenses & Payouts</span>
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
// Simple default layout setup
</script>

<style scoped>
.nav-icon {
  font-size: 1.35rem;
  width: 24px;
  text-align: center;
  display: inline-block;
}
</style>
