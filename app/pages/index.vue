<template>
  <div>
    <!-- Page Title Header -->
    <div class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p class="subtitle">Overview of current laundry shop operations</p>
      </div>
      <div>
        <NuxtLink to="/orders" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 0.25rem;">
          <i class="ti ti-plus" style="font-size: 1.25rem;"></i>
          <span>New Order</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Quick Stats Metrics -->
    <div class="metrics-grid">
      <!-- Active Orders -->
      <div class="metric-card">
        <div class="metric-icon metric-blue">
          <i class="ti ti-clipboard-list"></i>
        </div>
        <div class="metric-info">
          <span class="metric-label">Active Orders</span>
          <span class="metric-value">{{ activeOrdersCount }}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
            🧼 Wash: {{ washingActiveOrders.length }} | 💨 Iron: {{ ironingActiveOrders.length }}
          </span>
        </div>
      </div>

      <!-- Washing status -->
      <div class="metric-card">
        <div class="metric-icon metric-orange">
          <i class="ti ti-wash"></i>
        </div>
        <div class="metric-info">
          <span class="metric-label">Washing Queue</span>
          <span class="metric-value">{{ washingActiveOrders.filter(o => o.status !== 'ready').length }}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
            In Wash: {{ washingActiveOrders.filter(o => o.status === 'dispatched for washing').length }} | Washed: {{ washingActiveOrders.filter(o => o.status === 'washed').length }}
          </span>
        </div>
      </div>

      <!-- Ready for Delivery -->
      <div class="metric-card">
        <div class="metric-icon metric-green">
          <i class="ti ti-circle-check"></i>
        </div>
        <div class="metric-info">
          <span class="metric-label">Ready for Pickup</span>
          <span class="metric-value">{{ readyOrdersCount }}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
            🧼 Wash: {{ washingActiveOrders.filter(o => o.status === 'ready').length }} | 💨 Iron: {{ ironingActiveOrders.filter(o => o.status === 'ready').length }}
          </span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon metric-purple">
          <i class="ti ti-currency-rupee"></i>
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
                    {{ item.material }} (x{{ item.qty }})
                  </div>
                </td>
                <td>
                  <span :style="{ color: order.priority === 'express' ? 'var(--color-danger)' : 'var(--text-secondary)', fontWeight: 'bold' }">
                    {{ order.priority.toUpperCase() }}
                  </span>
                </td>
                <td>
                  <span :class="['badge', `badge-${order.status.replace(/\s+/g, '-')}`]">
                    {{ order.status === 'dispatched for washing' ? 'D/W' : order.status }}
                  </span>
                </td>
                <td class="text-right">
                  <div class="flex gap-1 justify-end">
                    <button 
                      v-if="order.status !== 'ready'" 
                      class="btn btn-secondary btn-sm"
                      @click="advanceStatus(order)"
                      :title="getNextStepTitle(order)"
                    >
                      {{ getNextStepText(order) }} →
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
        <p class="subtitle mb-1">Status breakdown by Service Category</p>

        <!-- Washing breakdown -->
        <div style="margin-top: 1.25rem;">
          <h3 style="font-size: 0.95rem; color: var(--color-primary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.25rem;">
            <span>🧼</span> Washing Queue
          </h3>
          <div v-if="washingActiveOrders.length === 0" class="text-secondary" style="font-size: 0.85rem; padding: 0.5rem 0;">
            No active washing batches.
          </div>
          <div v-else v-for="stat in washingStats" :key="stat.name" class="order-progress-wrapper" style="margin-top: 0.75rem;">
            <div class="flex justify-between items-center mb-1">
              <span style="font-weight: 500; font-size: 0.85rem; text-transform: capitalize;">{{ stat.name }}</span>
              <span style="font-size: 0.8rem;" class="text-secondary">{{ stat.count }} orders ({{ stat.percentage }}%)</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: `${stat.percentage}%`, backgroundColor: stat.color }"></div>
            </div>
          </div>
        </div>

        <!-- Ironing breakdown -->
        <div style="margin-top: 2rem; border-top: 1px dashed var(--border-color); padding-top: 1.25rem;">
          <h3 style="font-size: 0.95rem; color: var(--color-success); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.25rem;">
            <span>💨</span> Ironing Queue
          </h3>
          <div v-if="ironingActiveOrders.length === 0" class="text-secondary" style="font-size: 0.85rem; padding: 0.5rem 0;">
            No active ironing batches.
          </div>
          <div v-else v-for="stat in ironingStats" :key="stat.name" class="order-progress-wrapper" style="margin-top: 0.75rem;">
            <div class="flex justify-between items-center mb-1">
              <span style="font-weight: 500; font-size: 0.85rem; text-transform: capitalize;">{{ stat.name }}</span>
              <span style="font-size: 0.8rem;" class="text-secondary">{{ stat.count }} orders ({{ stat.percentage }}%)</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: `${stat.percentage}%`, backgroundColor: stat.color }"></div>
            </div>
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
            {{ item.material }} &times; {{ item.qty }}
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

const getNextStepText = (order: Order) => {
  if (order.status === 'dispatched for washing') return 'Mark Washed'
  if (order.status === 'washed') return 'Mark Ready'
  if (order.status === 'draft') return 'Mark Ready'
  return 'Next Step'
}

const getNextStepTitle = (order: Order) => {
  if (order.status === 'dispatched for washing') return 'Set status to Washed'
  if (order.status === 'washed') return 'Set status to Ready'
  if (order.status === 'draft') return 'Set status to Ready'
  return 'Advance status'
}

const advanceStatus = (order: Order) => {
  if (order.status === 'draft') {
    updateOrderStatus(order.id, 'ready')
  } else if (order.status === 'dispatched for washing') {
    updateOrderStatus(order.id, 'washed')
  } else if (order.status === 'washed') {
    updateOrderStatus(order.id, 'ready')
  }
}

const deliverOrder = (order: Order) => {
  openDispatchPopup(order)
}

// Compute statistics breakdown
const statusColors: Record<string, string> = {
  draft: 'var(--color-warning)',
  'dispatched for washing': 'var(--color-primary)',
  washed: 'var(--color-info)',
  ready: 'var(--color-success)'
}

const washingActiveOrders = computed(() => activeOrders.value.filter(o => o.orderType === 'washing'))
const ironingActiveOrders = computed(() => activeOrders.value.filter(o => o.orderType === 'ironing'))

const washingStats = computed(() => {
  const statuses = ['dispatched for washing', 'washed', 'ready']
  const total = washingActiveOrders.value.length || 1
  const list = statuses.map(s => {
    const count = washingActiveOrders.value.filter(o => o.status === s).length
    let label = s
    if (s === 'dispatched for washing') label = 'In Washing'
    return {
      name: label,
      count,
      percentage: Math.round((count / total) * 100),
      color: statusColors[s] || 'var(--text-secondary)'
    }
  }).filter(stat => stat.count > 0)
  return washingActiveOrders.value.length > 0 ? list : []
})

const ironingStats = computed(() => {
  const statuses = ['draft', 'ready']
  const total = ironingActiveOrders.value.length || 1
  const list = statuses.map(s => {
    const count = ironingActiveOrders.value.filter(o => o.status === s).length
    return {
      name: s,
      count,
      percentage: Math.round((count / total) * 100),
      color: statusColors[s] || 'var(--text-secondary)'
    }
  }).filter(stat => stat.count > 0)
  return ironingActiveOrders.value.length > 0 ? list : []
})
</script>
