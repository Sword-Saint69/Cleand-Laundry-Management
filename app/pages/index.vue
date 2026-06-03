<template>
  <div>
    <!-- Page Title Header -->
    <div class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p class="subtitle">Overview of current laundry shop operations</p>
      </div>
      <div>
        <NuxtLink to="/orders" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 18px; height: 18px;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Order
        </NuxtLink>
      </div>
    </div>

    <!-- Quick Stats Metrics -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon metric-blue">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 24px;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
          </svg>
        </div>
        <div class="metric-info">
          <span class="metric-label">Active Orders</span>
          <span class="metric-value">{{ activeOrdersCount }}</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon metric-orange">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 24px;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <div class="metric-info">
          <span class="metric-label">Draft Orders</span>
          <span class="metric-value">{{ draftOrdersCount }}</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon metric-green">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 24px;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="metric-info">
          <span class="metric-label">Ready for Pickup</span>
          <span class="metric-value">{{ readyOrdersCount }}</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon metric-purple">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 24px;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v1" />
          </svg>
        </div>
        <div class="metric-info">
          <span class="metric-label">Total Revenue</span>
          <span class="metric-value">₹{{ totalRevenue.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <!-- Active Orders Panel and Process Breakdown -->
    <div class="card-section">
      <!-- Active Orders -->
      <div class="panel-card">
        <div class="panel-card-header">
          <h2>Active Laundry Queue</h2>
          <span class="subtitle">{{ activeOrders.length }} orders in progress</span>
        </div>

        <div v-if="!isLoaded" class="text-center text-secondary py-4">
          Loading dashboard data...
        </div>

        <div v-else-if="activeOrders.length === 0" class="text-center text-secondary py-4">
          No active laundry orders right now. Keep up the clean work!
        </div>

        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Service Type</th>
                <th>Items Detail</th>
                <th>Priority</th>
                <th>Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in activeOrders" :key="order.id">
                <td>
                  <strong class="text-primary">{{ order.id }}</strong>
                </td>
                <td>{{ order.customerName }}</td>
                <td>
                  <span style="text-transform: capitalize; font-weight: 500;">
                    {{ order.orderType === 'washing' ? '🧼 Washing' : '💨 Ironing' }}
                  </span>
                </td>
                <td>
                  <div v-for="item in order.items" :key="item.slNo" style="font-size: 0.85rem; line-height: 1.3;">
                    • {{ item.material }} (x{{ item.qty }})
                  </div>
                </td>
                <td>
                  <span :style="{ color: order.priority === 'express' ? 'var(--color-danger)' : 'var(--text-secondary)', fontWeight: 'bold' }">
                    {{ order.priority.toUpperCase() }}
                  </span>
                </td>
                <td>
                  <span :class="['badge', `badge-${order.status}`]">
                    {{ order.status }}
                  </span>
                </td>
                <td class="text-right">
                  <div class="flex gap-1 justify-end">
                    <button 
                      v-if="order.status !== 'ready'" 
                      class="btn btn-secondary btn-sm"
                      @click="advanceStatus(order)"
                      title="Advance to next step"
                    >
                      Next Step →
                    </button>
                    <button 
                      v-else 
                      class="btn btn-primary btn-sm"
                      @click="deliverOrder(order)"
                    >
                      Deliver ✓
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Status Distribution Sidebar Card -->
      <div class="panel-card">
        <h2>Queue Insights</h2>
        <p class="subtitle mb-1">Status breakdown</p>

        <div class="order-progress-wrapper" v-for="stat in statusStats" :key="stat.name">
          <div class="flex justify-between items-center mb-1">
            <span style="font-weight: 500; font-size: 0.9rem; text-transform: capitalize;">{{ stat.name }}</span>
            <span style="font-size: 0.85rem;" class="text-secondary">{{ stat.count }} orders ({{ stat.percentage }}%)</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: `${stat.percentage}%`, backgroundColor: stat.color }"></div>
          </div>
        </div>

        <div style="margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
          <h3 style="font-size: 1rem; margin-bottom: 0.75rem;">Shop Quick Stats</h3>
          <div class="flex justify-between py-1" style="font-size: 0.9rem;">
            <span class="text-secondary">Registered Customers</span>
            <strong>{{ customers.length }}</strong>
          </div>
          <div class="flex justify-between py-1" style="font-size: 0.9rem;">
            <span class="text-secondary">Available Services</span>
            <strong>{{ services.length }}</strong>
          </div>
          <div class="flex justify-between py-1" style="font-size: 0.9rem;">
            <span class="text-secondary">All-time Orders</span>
            <strong>{{ orders.length }}</strong>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Dispatch & Pay Modal -->
  <div class="modal-backdrop" v-if="dispatchingOrder" @click="dispatchingOrder = null">
    <div class="modal-content" style="max-width: 500px;" @click.stop>
      <div class="modal-header">
        <h2>Order Dispatch & Payment</h2>
        <button 
          @click="dispatchingOrder = null" 
          style="background: none; border: none; font-size: 1.5rem; color: var(--text-secondary); cursor: pointer;"
        >
          &times;
        </button>
      </div>
      
      <div class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
        <!-- Customer summary info -->
        <div style="background: var(--bg-hover); padding: 1rem; border-radius: var(--radius-md); font-size: 0.9rem;">
          <div><strong>Customer Name:</strong> {{ dispatchingOrder.customerName }}</div>
          <div><strong>Phone Number:</strong> {{ dispatchingOrder.customerPhone }}</div>
          <div style="margin-top: 0.5rem; font-weight: 500;">Items to Deliver:</div>
          <div v-for="item in dispatchingOrder.items" :key="item.slNo" style="margin-left: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">
            • {{ item.material }} &times; {{ item.qty }}
          </div>
        </div>

        <!-- Invoice Details / Math breakdown -->
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <!-- Net amount -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
            <span>Net Amount:</span>
            <strong>₹{{ dispatchingOrder.totalPrice.toFixed(2) }}</strong>
          </div>

          <!-- Discount amount (Input) -->
          <div class="form-group">
            <label for="dispatch-discount">Discount Amount (₹)</label>
            <input 
              id="dispatch-discount"
              type="number" 
              v-model.number="dispatchDiscount" 
              min="0"
              :max="dispatchingOrder.totalPrice"
              placeholder="0.00"
            />
          </div>

          <!-- Amount payable (Net - Discount) -->
          <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-primary); padding: 0.75rem 1rem; border-radius: var(--radius-sm);">
            <strong>Amount Payable:</strong>
            <strong style="color: var(--color-success); font-size: 1.1rem;">₹{{ dispatchPayable.toFixed(2) }}</strong>
          </div>

          <!-- Amount paid by customer (Input) -->
          <div class="form-group">
            <label for="dispatch-amount-paid">Amount Paid by Customer (₹)</label>
            <input 
              id="dispatch-amount-paid"
              type="number" 
              v-model.number="dispatchAmountPaid" 
              min="0"
              placeholder="Enter amount paid"
            />
          </div>

          <!-- Balance to be given back -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 0.5rem;">
            <span>Balance to return to Customer:</span>
            <strong style="color: var(--color-warning);">₹{{ dispatchBalance.toFixed(2) }}</strong>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="dispatchingOrder = null">Cancel</button>
        <button class="btn btn-secondary" style="background-color: var(--color-warning); color: #fff;" @click="submitDispatch('unpaid')">
          Pay Later
        </button>
        <button class="btn btn-primary" :disabled="dispatchAmountPaid < dispatchPayable" @click="submitDispatch('paid')">
          Paid & Dispatch
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLaundryStore, type Order, type OrderStatus } from '~/composables/useLaundryStore'

const store = useLaundryStore()
const { 
  orders, 
  customers, 
  services,
  isLoaded,
  activeOrdersCount, 
  draftOrdersCount, 
  readyOrdersCount, 
  totalRevenue, 
  updateOrderStatus,
  dispatchOrder
} = store

const dispatchingOrder = ref<any | null>(null)
const dispatchDiscount = ref(0)
const dispatchAmountPaid = ref(0)

const openDispatchPopup = (order: any) => {
  dispatchingOrder.value = order
  dispatchDiscount.value = 0
  dispatchAmountPaid.value = Number(order.totalPrice)
}

const dispatchPayable = computed(() => {
  if (!dispatchingOrder.value) return 0
  return Math.max(0, Number(dispatchingOrder.value.totalPrice) - Number(dispatchDiscount.value || 0))
})

const dispatchBalance = computed(() => {
  return Math.max(0, Number(dispatchAmountPaid.value || 0) - dispatchPayable.value)
})

const submitDispatch = async (paymentStatus: 'paid' | 'unpaid') => {
  if (!dispatchingOrder.value) return
  
  await dispatchOrder(dispatchingOrder.value.id, {
    discountAmount: Number(dispatchDiscount.value || 0),
    amountPaid: paymentStatus === 'paid' ? Number(dispatchAmountPaid.value || 0) : 0,
    balanceReturned: paymentStatus === 'paid' ? Number(dispatchBalance.value || 0) : 0,
    paymentStatus
  })
  
  dispatchingOrder.value = null
}

// Get active orders list (exclude delivered)
const activeOrders = computed(() => {
  return orders.value
    .filter(o => o.status !== 'dispatched')
    .sort((a, b) => {
      // Prioritize express orders
      if (a.priority === 'express' && b.priority !== 'express') return -1
      if (a.priority !== 'express' && b.priority === 'express') return 1
      return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
    })
})

// Define sequence of statuses for easy updates
const statusSequence: OrderStatus[] = ['draft', 'ready', 'dispatched']

const advanceStatus = (order: Order) => {
  if (order.status === 'draft') {
    updateOrderStatus(order.id, 'ready')
  }
}

const deliverOrder = (order: Order) => {
  openDispatchPopup(order)
}

// Compute statistics breakdown
const statusColors: Record<string, string> = {
  draft: 'var(--color-warning)',
  ready: 'var(--color-success)'
}

const statusStats = computed(() => {
  const statuses = ['draft', 'ready']
  const total = activeOrders.value.length || 1
  return statuses.map(s => {
    const count = activeOrders.value.filter(o => o.status === s).length
    return {
      name: s,
      count,
      percentage: Math.round((count / total) * 100),
      color: statusColors[s] || 'var(--text-secondary)'
    }
  })
})
</script>
