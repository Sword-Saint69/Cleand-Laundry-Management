<template>
  <div>
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>Order History</h1>
        <p class="subtitle">Complete archives of all laundry batches, active or dispatched</p>
      </div>
    </div>

    <!-- Filters & Search Panel -->
    <div class="panel-card" style="margin-bottom: 2rem;">
      <div style="display: flex; gap: 1.25rem; flex-direction: column;">
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
          <input 
            type="text" 
            placeholder="Search by ID, name, or phone..." 
            v-model="searchQuery" 
            style="flex: 1.5; min-width: 250px;"
          />
          
          <select v-model="statusFilter" style="flex: 1; min-width: 150px;">
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="dispatched for washing">Dispatched for Washing</option>
            <option value="washed">Washed</option>
            <option value="ready">Ready</option>
            <option value="dispatched">Dispatched</option>
          </select>

          <select v-model="typeFilter" style="flex: 1; min-width: 150px;">
            <option value="all">All Types</option>
            <option value="washing">🧼 Washing</option>
            <option value="ironing">💨 Ironing</option>
          </select>
        </div>

        <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 1rem;">
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <label style="font-weight: 500;">From Date:</label>
            <input type="date" v-model="startDate" style="padding: 0.5rem;" />
            
            <label style="font-weight: 500;">To Date:</label>
            <input type="date" v-model="endDate" style="padding: 0.5rem;" />
            
            <button class="btn btn-secondary btn-sm" @click="resetFilters" style="padding: 0.5rem 0.75rem;">
              Reset
            </button>
          </div>

          <div style="font-weight: 600; color: var(--color-primary); font-size: 0.95rem;">
            Total Matches: {{ filteredOrders.length }} orders
          </div>
        </div>
      </div>
    </div>

    <!-- Orders History Table -->
    <div class="panel-card">
      <div v-if="!isLoaded" class="text-center text-secondary py-4">
        Loading historical records...
      </div>
      <div v-else-if="filteredOrders.length === 0" class="text-center text-secondary py-4">
        No past orders matching the search filters.
      </div>
      <div v-else class="table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Service Type</th>
              <th>Cost</th>
              <th>Date Ordered</th>
              <th>Priority</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="order in filteredOrders" 
              :key="order.id" 
              @click="viewReceipt(order)" 
              style="cursor: pointer;"
              class="hover-row"
            >
              <td>
                <strong class="text-primary">{{ order.id }}</strong>
              </td>
              <td><strong>{{ order.customerName }}</strong></td>
              <td>{{ order.customerPhone }}</td>
              <td>
                <span style="text-transform: capitalize; font-weight: 500;">
                  {{ order.orderType === 'washing' ? '🧼 Washing' : '💨 Ironing' }}
                </span>
              </td>
              <td>
                <strong style="color: var(--color-success)">₹{{ order.totalPrice.toFixed(2) }}</strong>
              </td>
              <td>{{ formatDate(order.orderDate) }}</td>
              <td>
                <span :style="{ 
                  color: order.priority === 'express' ? 'var(--color-danger)' : 'var(--text-secondary)',
                  fontWeight: '600'
                }">
                  {{ order.priority.toUpperCase() }}
                </span>
              </td>
              <td>
                <span :class="['badge', `badge-${order.status}`]">{{ order.status }}</span>
              </td>
              <td class="text-right" @click.stop>
                <button class="btn btn-secondary btn-sm" @click="viewReceipt(order)">
                  View Invoice
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Receipt / Invoice Modal -->
    <div class="modal-backdrop no-print" v-if="selectedReceiptOrder" @click="selectedReceiptOrder = null">
      <div class="modal-content print-invoice-modal" style="max-width: 500px;" @click.stop>
        <div class="modal-header no-print">
          <h2>Order Invoice</h2>
          <button 
            @click="selectedReceiptOrder = null" 
            style="background: none; border: none; font-size: 1.5rem; color: var(--text-secondary); cursor: pointer;"
          >
            &times;
          </button>
        </div>
        
        <div class="modal-body" style="font-family: monospace; color: #000; padding: 1.5rem; background: #fff; line-height: 1.4;">
          <!-- Shop details -->
          <div class="text-center" style="border-bottom: 2px dashed #ccc; padding-bottom: 1rem; margin-bottom: 1rem;">
            <h1 style="margin: 0; font-size: 1.8rem; letter-spacing: 2px; color: var(--color-primary);">CLEAND</h1>
            <p style="font-size: 0.8rem; color: #666; margin: 2px 0 0 0;">Premium Laundry & Pressing Services</p>
            <p style="font-size: 0.75rem; color: #666; margin: 2px 0 0 0;">Ph: +91 98765 43210</p>
          </div>

          <!-- Order meta -->
          <div style="font-size: 0.85rem; margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.25rem;">
            <div><strong>Invoice No:</strong> {{ selectedReceiptOrder.id }}</div>
            <div><strong>Date:</strong> {{ formatDate(selectedReceiptOrder.orderDate) }}</div>
            <div><strong>Due Date:</strong> {{ selectedReceiptOrder.dueDate }}</div>
            <div><strong>Status:</strong> <span style="text-transform: uppercase; font-weight: bold;">{{ selectedReceiptOrder.status }}</span></div>
            <div><strong>Priority:</strong> <span style="text-transform: uppercase; font-weight: bold;">{{ selectedReceiptOrder.priority }}</span></div>
          </div>

          <!-- Customer details -->
          <div style="border-top: 1px dashed #ccc; border-bottom: 1px dashed #ccc; padding: 0.5rem 0; margin-bottom: 1rem; font-size: 0.85rem;">
            <div><strong>Customer:</strong> {{ selectedReceiptOrder.customerName }}</div>
            <div><strong>Phone:</strong> {{ selectedReceiptOrder.customerPhone }}</div>
            <div><strong>Service:</strong> <span style="text-transform: capitalize;">{{ selectedReceiptOrder.orderType }}</span></div>
          </div>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; margin-bottom: 1rem;">
            <thead>
              <tr style="border-bottom: 1px dashed #ccc;">
                <th style="padding: 4px 0; text-align: left; text-transform: none; font-size: 0.8rem; color: #000;">Material</th>
                <th style="padding: 4px 0; text-align: center; text-transform: none; font-size: 0.8rem; color: #000; width: 60px;">Qty</th>
                <th style="padding: 4px 0; text-align: right; text-transform: none; font-size: 0.8rem; color: #000; width: 80px;">Rate</th>
                <th style="padding: 4px 0; text-align: right; text-transform: none; font-size: 0.8rem; color: #000; width: 90px;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in selectedReceiptOrder.items" :key="item.slNo" style="border-bottom: 1px dashed #eee;">
                <td style="padding: 6px 0; font-size: 0.8rem; color: #000;">
                  {{ item.material }}
                  <span v-if="selectedReceiptOrder.orderType === 'washing' && item.stains && item.stains !== 'None'" style="font-size: 0.7rem; color: var(--color-danger); font-weight: bold; display: block;">
                    [Stains: {{ item.stains }}]
                  </span>
                </td>
                <td style="padding: 6px 0; text-align: center; font-size: 0.8rem; color: #000;">{{ item.qty }}</td>
                <td style="padding: 6px 0; text-align: right; font-size: 0.8rem; color: #000;">₹{{ Number(item.price).toFixed(2) }}</td>
                <td style="padding: 6px 0; text-align: right; font-size: 0.8rem; color: #000;">₹{{ (Number(item.qty) * Number(item.price)).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Pricing summary -->
          <div style="display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.85rem; align-items: flex-end; border-top: 1px dashed #ccc; padding-top: 0.5rem;">
            <div>Subtotal: ₹{{ (selectedReceiptOrder.items.reduce((sum, item) => sum + (Number(item.qty || 0) * Number(item.price || 0)), 0)).toFixed(2) }}</div>
            <div v-if="selectedReceiptOrder.priority === 'express'">Express Surcharge (20%): +₹{{ (selectedReceiptOrder.items.reduce((sum, item) => sum + (Number(item.qty || 0) * Number(item.price || 0)), 0) * 0.2).toFixed(2) }}</div>
            <div style="font-size: 1.1rem; font-weight: bold; margin-top: 0.25rem; border-top: 2px double #ccc; padding-top: 0.25rem;">
              Total Amount: ₹{{ Number(selectedReceiptOrder.totalPrice).toFixed(2) }}
            </div>
          </div>

          <div v-if="selectedReceiptOrder.notes" style="margin-top: 1rem; padding: 0.5rem; background: #f9f9f9; border-radius: 4px; font-size: 0.75rem; border: 1px solid #eee;">
            <strong>Instructions:</strong> {{ selectedReceiptOrder.notes }}
          </div>

          <div class="text-center" style="margin-top: 1.5rem; font-size: 0.75rem; color: #888;">
            Thank you for choosing Cleand!
          </div>
        </div>

        <div class="modal-footer no-print">
          <button class="btn btn-secondary" @click="selectedReceiptOrder = null">Close</button>
          <button class="btn btn-primary" @click="printReceipt" style="display: inline-flex; align-items: center; gap: 0.25rem;">
            <i class="ti ti-printer" style="font-size: 1.25rem;"></i>
            <span>Print Receipt</span>
          </button>
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

const searchQuery = ref('')
const statusFilter = ref('all')
const typeFilter = ref('all')
const startDate = ref('')
const endDate = ref('')

const selectedReceiptOrder = ref<any | null>(null)

const viewReceipt = (order: any) => {
  selectedReceiptOrder.value = order
}

const printReceipt = () => {
  window.print()
}

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = 'all'
  typeFilter.value = 'all'
  startDate.value = ''
  endDate.value = ''
}

const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    // Search query match (ID, customer name, phone number)
    const searchMatch = 
      order.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      order.customerPhone.includes(searchQuery.value)

    // Status filter
    const statusMatch = statusFilter.value === 'all' || order.status === statusFilter.value

    // Type filter (washing, ironing)
    const typeMatch = typeFilter.value === 'all' || order.orderType === typeFilter.value

    // Date range filter
    let dateMatch = true
    if (order.orderDate) {
      const orderTime = new Date(order.orderDate).getTime()
      if (startDate.value) {
        const start = new Date(startDate.value + 'T00:00:00').getTime()
        if (orderTime < start) dateMatch = false
      }
      if (endDate.value) {
        const end = new Date(endDate.value + 'T23:59:59').getTime()
        if (orderTime > end) dateMatch = false
      }
    }

    return searchMatch && statusMatch && typeMatch && dateMatch
  })
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
</script>

<style scoped>
.hover-row:hover td {
  background-color: var(--bg-hover);
}
</style>
