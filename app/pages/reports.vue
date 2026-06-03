<template>
  <div>
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1>Reports & Analytics</h1>
        <p class="subtitle">Detailed datewise laundry shop collection metrics and analytics</p>
      </div>
    </div>

    <!-- Filters & Quick Ranges Panel -->
    <div class="panel-card" style="margin-bottom: 2rem;">
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <h3 style="font-size: 1rem; font-weight: 600; color: var(--text-primary);">Date Range Filters</h3>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; justify-content: space-between;">
          <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <label style="font-weight: 500;">From:</label>
              <input type="date" v-model="startDate" style="padding: 0.5rem;" />
            </div>
            
            <div style="display: align-items; gap: 0.5rem; display: flex; align-items: center;">
              <label style="font-weight: 500;">To:</label>
              <input type="date" v-model="endDate" style="padding: 0.5rem;" />
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" @click="setQuickRange('7days')">Last 7 Days</button>
            <button class="btn btn-secondary btn-sm" @click="setQuickRange('30days')">Last 30 Days</button>
            <button class="btn btn-secondary btn-sm" @click="setQuickRange('thisMonth')">This Month</button>
            <button class="btn btn-secondary btn-sm" @click="setQuickRange('lastMonth')">Last Month</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Collection Metrics Grid -->
    <div class="metrics-grid">
      <!-- Total washing collection -->
      <div class="metric-card">
        <div class="metric-icon metric-blue">
          <i class="ti ti-wash"></i>
        </div>
        <div class="metric-info">
          <span class="metric-label">Washing Collection</span>
          <span class="metric-value">₹{{ metrics.washingTotal.toFixed(2) }}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
            {{ metrics.washingCount }} batches
          </span>
        </div>
      </div>

      <!-- Total ironing collection -->
      <div class="metric-card">
        <div class="metric-icon metric-green">
          <i class="ti ti-hanger"></i>
        </div>
        <div class="metric-info">
          <span class="metric-label">Ironing Collection</span>
          <span class="metric-value">₹{{ metrics.ironingTotal.toFixed(2) }}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
            {{ metrics.ironingCount }} batches
          </span>
        </div>
      </div>

      <!-- Grand Revenue Collection -->
      <div class="metric-card">
        <div class="metric-icon metric-purple">
          <i class="ti ti-coin"></i>
        </div>
        <div class="metric-info">
          <span class="metric-label">Grand Total Collection</span>
          <span class="metric-value">₹{{ metrics.grandTotal.toFixed(2) }}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
            {{ metrics.totalCount }} total batches
          </span>
        </div>
      </div>

      <!-- Bookkeeping Split -->
      <div class="metric-card">
        <div class="metric-icon metric-orange">
          <i class="ti ti-cash"></i>
        </div>
        <div class="metric-info">
          <span class="metric-label">Realized (Paid)</span>
          <span class="metric-value" style="color: var(--color-success)">₹{{ metrics.paidTotal.toFixed(2) }}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
            Pending: ₹{{ metrics.unpaidTotal.toFixed(2) }} (Pay Later/Drafts)
          </span>
        </div>
      </div>
    </div>

    <!-- Daily Trend Visual Graph -->
    <div class="panel-card" style="margin-bottom: 2rem;" v-if="dailySummary.length > 0">
      <h2 style="margin-bottom: 1.25rem;">Daily Collection Trends</h2>
      
      <!-- Visual Bars CSS Grid representation -->
      <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 180px; padding: 1rem 0; border-bottom: 1px solid var(--border-color); gap: 0.5rem; overflow-x: auto;">
        <div 
          v-for="day in dailySummary" 
          :key="day.date" 
          style="display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 45px; height: 100%; justify-content: flex-end;"
        >
          <!-- Tooltip showing total -->
          <div style="font-size: 0.7rem; font-weight: bold; margin-bottom: 4px; color: var(--text-secondary);">
            ₹{{ Math.round(day.total) }}
          </div>
          <!-- Bar fills -->
          <div style="display: flex; gap: 2px; width: 100%; height: 80%; align-items: flex-end;">
            <!-- Washing portion -->
            <div 
              :style="{ height: getBarHeightPercentage(day.washingTotal, day.total), background: 'var(--color-primary)' }"
              style="width: 50%; border-radius: var(--radius-sm) var(--radius-sm) 0 0;"
              :title="`Washing: ₹${day.washingTotal}`"
            ></div>
            <!-- Ironing portion -->
            <div 
              :style="{ height: getBarHeightPercentage(day.ironingTotal, day.total), background: 'var(--color-success)' }"
              style="width: 50%; border-radius: var(--radius-sm) var(--radius-sm) 0 0;"
              :title="`Ironing: ₹${day.ironingTotal}`"
            ></div>
          </div>
          <!-- Date Label -->
          <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 6px; text-wrap: nowrap;">
            {{ formatShortDate(day.date) }}
          </div>
        </div>
      </div>
      <div style="display: flex; gap: 1rem; margin-top: 1rem; font-size: 0.75rem; color: var(--text-muted);">
        <div style="display: flex; align-items: center; gap: 0.25rem;">
          <span style="display: inline-block; width: 12px; height: 12px; background: var(--color-primary); border-radius: 2px;"></span>
          Washing Collection
        </div>
        <div style="display: flex; align-items: center; gap: 0.25rem;">
          <span style="display: inline-block; width: 12px; height: 12px; background: var(--color-success); border-radius: 2px;"></span>
          Ironing Collection
        </div>
      </div>
    </div>

    <!-- Details Split Tables -->
    <div class="card-section">
      <!-- Datewise details table -->
      <div class="panel-card">
        <h2>Datewise Collection Breakdown</h2>
        <div v-if="!isLoaded" class="text-center text-secondary py-4">
          Loading report rows...
        </div>
        <div v-else-if="dailySummary.length === 0" class="text-center text-secondary py-4">
          No transactions in this date range.
        </div>
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th class="text-center">Washing Qty</th>
                <th class="text-right">Washing Cash</th>
                <th class="text-center">Ironing Qty</th>
                <th class="text-right">Ironing Cash</th>
                <th class="text-right">Total Collection</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="day in dailySummary" :key="day.date">
                <td><strong>{{ formatDateString(day.date) }}</strong></td>
                <td class="text-center">{{ day.washingCount }}</td>
                <td class="text-right">₹{{ day.washingTotal.toFixed(2) }}</td>
                <td class="text-center">{{ day.ironingCount }}</td>
                <td class="text-right">₹{{ day.ironingTotal.toFixed(2) }}</td>
                <td class="text-right">
                  <strong>₹{{ day.total.toFixed(2) }}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Garment Type breakdown -->
      <div class="panel-card">
        <h2>Bookkeeping Garments Volume</h2>
        <p class="subtitle mb-1">Total items processed by type</p>
        
        <div v-if="!isLoaded" class="text-center text-secondary py-4">
          Loading inventory...
        </div>
        <div v-else-if="garmentBreakdown.length === 0" class="text-center text-secondary py-4">
          No items found in selected range.
        </div>
        <div v-else style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem; max-height: 400px; overflow-y: auto;">
          <div 
            v-for="item in garmentBreakdown" 
            :key="item.name"
            style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: var(--bg-primary); border-radius: var(--radius-md); border: 1px solid var(--border-color);"
          >
            <div style="font-weight: 600; text-transform: capitalize; color: var(--text-primary);">
              {{ item.name }}
            </div>
            <div class="flex items-center gap-2">
              <span class="badge badge-ready" style="font-weight: bold; font-size: 0.8rem; padding: 0.2rem 0.5rem;">
                {{ item.qty }} pcs
              </span>
              <span style="font-size: 0.8rem; color: var(--text-muted);">
                (₹{{ item.revenue.toFixed(0) }})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLaundryStore } from '~/composables/useLaundryStore'

const store = useLaundryStore()
const { orders, isLoaded } = store

// Helper functions for date initialization
const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0]
}

const getPastDateString = (daysAgo: number) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split('T')[0]
}

// State for custom date ranges
const startDate = ref(getPastDateString(30)) // Default to last 30 days
const endDate = ref(getTodayDateString())

// Set quick ranges
const setQuickRange = (range: '7days' | '30days' | 'thisMonth' | 'lastMonth') => {
  const today = new Date()
  if (range === '7days') {
    startDate.value = getPastDateString(7)
    endDate.value = getTodayDateString()
  } else if (range === '30days') {
    startDate.value = getPastDateString(30)
    endDate.value = getTodayDateString()
  } else if (range === 'thisMonth') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
    startDate.value = start.toISOString().split('T')[0]
    endDate.value = getTodayDateString()
  } else if (range === 'lastMonth') {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const end = new Date(today.getFullYear(), today.getMonth(), 0)
    startDate.value = start.toISOString().split('T')[0]
    endDate.value = end.toISOString().split('T')[0]
  }
}

// Filter orders inside date range
const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    if (!order.orderDate) return false
    const datePart = order.orderDate.split('T')[0]
    return datePart >= startDate.value && datePart <= endDate.value
  })
})

// Collection Summaries calculations
const metrics = computed(() => {
  let washingTotal = 0
  let washingCount = 0
  let ironingTotal = 0
  let ironingCount = 0
  let paidTotal = 0
  let unpaidTotal = 0

  filteredOrders.value.forEach(order => {
    const price = Number(order.totalPrice || 0)
    if (order.orderType === 'washing') {
      washingTotal += price
      washingCount++
    } else {
      ironingTotal += price
      ironingCount++
    }

    // Paid collections tracking
    if (order.status === 'dispatched' && order.paymentStatus === 'paid') {
      paidTotal += Number(order.amountPaid || price - (order.discountAmount || 0))
    } else {
      // Calculate unpaid/pending
      unpaidTotal += price
    }
  })

  return {
    washingTotal,
    washingCount,
    ironingTotal,
    ironingCount,
    grandTotal: washingTotal + ironingTotal,
    totalCount: washingCount + ironingCount,
    paidTotal,
    unpaidTotal
  }
})

// Grouped daily totals list
const dailySummary = computed(() => {
  const groups: Record<string, {
    date: string
    washingCount: number
    washingTotal: number
    ironingCount: number
    ironingTotal: number
    total: number
  }> = {}

  // Fill in all dates between start and end dates with zero values first
  const current = new Date(startDate.value)
  const end = new Date(endDate.value)
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0]
    groups[dateStr] = {
      date: dateStr,
      washingCount: 0,
      washingTotal: 0,
      ironingCount: 0,
      ironingTotal: 0,
      total: 0
    }
    current.setDate(current.getDate() + 1)
  }

  // Aggregate order metrics
  filteredOrders.value.forEach(order => {
    if (!order.orderDate) return
    const dateStr = order.orderDate.split('T')[0]
    if (!groups[dateStr]) return // Out of range bounding

    const price = Number(order.totalPrice || 0)
    if (order.orderType === 'washing') {
      groups[dateStr].washingCount++
      groups[dateStr].washingTotal += price
    } else {
      groups[dateStr].ironingCount++
      groups[dateStr].ironingTotal += price
    }
    groups[dateStr].total += price
  })

  // Return as sorted list ascending
  return Object.values(groups).sort((a, b) => a.date.localeCompare(b.date))
})

// Top Garments processed breakdown
const garmentBreakdown = computed(() => {
  const summary: Record<string, { qty: number, revenue: number }> = {}

  filteredOrders.value.forEach(order => {
    if (!order.items) return
    order.items.forEach(item => {
      const name = item.material.trim().toLowerCase()
      if (!name) return
      if (!summary[name]) {
        summary[name] = { qty: 0, revenue: 0 }
      }
      summary[name].qty += Number(item.qty || 0)
      summary[name].revenue += Number(item.total || (Number(item.qty) * Number(item.price)) || 0)
    })
  })

  return Object.entries(summary)
    .map(([name, val]) => ({ name, qty: val.qty, revenue: val.revenue }))
    .sort((a, b) => b.qty - a.qty)
})

// Utility styling for custom Daily chart
const maxDailyTotal = computed(() => {
  const totals = dailySummary.value.map(d => d.total)
  return Math.max(...totals, 1) // Avoid zero division
})

const getBarHeightPercentage = (value: number, total: number) => {
  if (total === 0) return '0%'
  const proportionOfMax = (total / maxDailyTotal.value) * 100
  const ratio = value / total
  return `${proportionOfMax * ratio}%`
}

// Formatting helpers
const formatShortDate = (dateStr: string) => {
  if (!dateStr) return ''
  const [_, m, d] = dateStr.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(m, 10) - 1]} ${d}`
}

const formatDateString = (dateStr: string) => {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}
</script>
