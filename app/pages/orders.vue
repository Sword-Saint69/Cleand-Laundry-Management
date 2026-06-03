<template>
  <div>
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>Laundry Orders</h1>
        <p class="subtitle">Create and oversee customer laundry batches</p>
      </div>
      <div>
        <button class="btn btn-primary" @click="showCreateModal = true">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 18px; height: 18px;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create New Order
        </button>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="panel-card" style="margin-bottom: 2rem;">
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; justify-content: space-between;">
        <div style="display: flex; gap: 1rem; flex: 1; min-width: 285px;">
          <input 
            type="text" 
            placeholder="Search by ID or customer..." 
            v-model="searchQuery" 
            style="flex: 1;"
          />
          <select v-model="statusFilter">
            <option value="all">All Statuses</option>
            <option value="active">Active Queue (Non-Delivered)</option>
            <option value="pending">Pending</option>
            <option value="washing">Washing</option>
            <option value="drying">Drying</option>
            <option value="ironing">Ironing</option>
            <option value="ready">Ready for Pickup</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button 
            :class="['btn', 'btn-sm', filterPriority === 'all' ? 'btn-primary' : 'btn-secondary']"
            @click="filterPriority = 'all'"
          >
            All Priority
          </button>
          <button 
            :class="['btn', 'btn-sm', filterPriority === 'express' ? 'btn-primary' : 'btn-secondary']"
            @click="filterPriority = 'express'"
          >
            Express Only
          </button>
        </div>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="panel-card">
      <div v-if="!isLoaded" class="text-center text-secondary py-4">
        Loading orders...
      </div>
      <div v-else-if="filteredOrders.length === 0" class="text-center text-secondary py-4">
        No orders found matching the filter criteria.
      </div>
      <div v-else class="table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Weight / Qty</th>
              <th>Total Cost</th>
              <th>Date Ordered</th>
              <th>Priority</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id">
              <td>
                <strong class="text-primary">{{ order.id }}</strong>
              </td>
              <td>{{ order.customerName }}</td>
              <td>{{ order.serviceName }}</td>
              <td>
                <span v-if="order.weight">{{ order.weight }} kg</span>
                <span v-else>{{ order.qty }} pcs</span>
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
                <select 
                  :value="order.status" 
                  @change="changeStatus(order.id, $event)" 
                  style="padding: 0.25rem 0.5rem; font-size: 0.85rem; border-radius: var(--radius-sm);"
                >
                  <option value="pending">Pending</option>
                  <option value="washing">Washing</option>
                  <option value="drying">Drying</option>
                  <option value="ironing">Ironing</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                </select>
              </td>
              <td class="text-right">
                <button class="btn btn-danger btn-sm" @click="confirmDelete(order.id)">
                  Cancel
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Order Modal -->
    <div class="modal-backdrop" v-if="showCreateModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Create New Order</h2>
          <button 
            @click="showCreateModal = false" 
            style="background: none; border: none; font-size: 1.5rem; color: var(--text-secondary); cursor: pointer;"
          >
            &times;
          </button>
        </div>
        <div class="modal-body">
          <!-- Step 1: Select Customer -->
          <div class="form-group">
            <label for="order-customer">Select Customer</label>
            <select id="order-customer" v-model="newOrder.customerId">
              <option value="" disabled>Choose a customer...</option>
              <option v-for="cust in customers" :key="cust.id" :value="cust.id">
                {{ cust.name }} ({{ cust.phone }})
              </option>
            </select>
            <p style="font-size: 0.8rem;" class="text-secondary">
              Customer not listed? Add them in the
              <NuxtLink to="/customers" style="color: var(--color-primary);">Customers page</NuxtLink> first.
            </p>
          </div>

          <!-- Step 2: Select Service -->
          <div class="form-group">
            <label for="order-service">Select Service</label>
            <select id="order-service" v-model="newOrder.serviceId">
              <option value="" disabled>Choose a service...</option>
              <option v-for="srv in services" :key="srv.id" :value="srv.id">
                {{ srv.name }} (₹{{ srv.price.toFixed(2) }} per {{ srv.unit }})
              </option>
            </select>
          </div>

          <!-- Step 3: Weight or Quantity Input -->
          <div class="form-group" v-if="selectedService">
            <div v-if="selectedService.unit === 'kg'">
              <label for="order-weight">Weight (in kg)</label>
              <input 
                id="order-weight" 
                type="number" 
                v-model.number="newOrder.weight" 
                step="0.1" 
                min="0.1" 
                placeholder="e.g. 5.5"
              />
            </div>
            <div v-else>
              <label for="order-qty">Quantity (pieces)</label>
              <input 
                id="order-qty" 
                type="number" 
                v-model.number="newOrder.qty" 
                min="1" 
                placeholder="e.g. 3"
              />
            </div>
          </div>

          <!-- Step 4: Options -->
          <div class="form-row">
            <div class="form-group">
              <label for="order-priority">Priority</label>
              <select id="order-priority" v-model="newOrder.priority">
                <option value="normal">Normal Processing</option>
                <option value="express">Express Delivery (+20% surcharge)</option>
              </select>
            </div>
            <div class="form-group">
              <label for="order-due">Estimated Due Date</label>
              <input id="order-due" type="date" v-model="newOrder.dueDate" />
            </div>
          </div>

          <!-- Notes -->
          <div class="form-group">
            <label for="order-notes">Special Instructions</label>
            <textarea 
              id="order-notes" 
              rows="3" 
              v-model="newOrder.notes" 
              placeholder="Delicates, hang dry, stain spot treatments..."
            ></textarea>
          </div>

          <!-- Price Display -->
          <div 
            v-if="selectedService && (newOrder.weight || newOrder.qty)" 
            style="background: var(--bg-hover); border-radius: var(--radius-md); padding: 1rem; margin-top: 0.5rem;"
          >
            <div class="flex justify-between items-center">
              <span>Subtotal Calculation:</span>
              <span>
                {{ selectedService.unit === 'kg' ? `${newOrder.weight || 0} kg` : `${newOrder.qty || 0} pcs` }}
                &times; ₹{{ selectedService.price.toFixed(2) }}
              </span>
            </div>
            <div class="flex justify-between items-center" v-if="newOrder.priority === 'express'">
              <span class="text-primary">Express Surcharge (20%):</span>
              <span class="text-primary">+₹{{ (subtotalPrice * 0.2).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center mt-2" style="border-top: 1px solid var(--border-color); padding-top: 0.5rem;">
              <strong>Total Order Price:</strong>
              <strong style="font-size: 1.25rem; color: var(--color-success)">
                ₹{{ computedTotalPrice.toFixed(2) }}
              </strong>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCreateModal = false">Cancel</button>
          <button 
            class="btn btn-primary" 
            :disabled="!isValidForm" 
            @click="submitOrder"
          >
            Generate Order
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useLaundryStore, type OrderStatus } from '~/composables/useLaundryStore'

const store = useLaundryStore()
const { orders, customers, services, isLoaded, addOrder, updateOrderStatus, deleteOrder } = store

const searchQuery = ref('')
const statusFilter = ref('all')
const filterPriority = ref('all')
const showCreateModal = ref(false)

// New Order Form model
const getTomorrowDate = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
}

const newOrder = ref({
  customerId: '',
  serviceId: '',
  weight: 1.0,
  qty: 1,
  priority: 'normal' as 'normal' | 'express',
  dueDate: getTomorrowDate(),
  notes: ''
})

// Auto-fill weights/quantities based on selected service unit type
const selectedService = computed(() => {
  return services.value.find(s => s.id === newOrder.value.serviceId)
})

watch(() => newOrder.value.serviceId, (newServiceId) => {
  const srv = services.value.find(s => s.id === newServiceId)
  if (srv) {
    if (srv.unit === 'kg') {
      newOrder.value.weight = 1.0
      newOrder.value.qty = 0
    } else {
      newOrder.value.weight = 0
      newOrder.value.qty = 1
    }
  }
})

// Subtotal calculation for display in modal
const subtotalPrice = computed(() => {
  if (!selectedService.value) return 0
  if (selectedService.value.unit === 'kg') {
    return selectedService.value.price * (newOrder.value.weight || 0)
  }
  return selectedService.value.price * (newOrder.value.qty || 0)
})

const computedTotalPrice = computed(() => {
  let price = subtotalPrice.value
  if (newOrder.value.priority === 'express') {
    price = price * 1.2
  }
  return price
})

// Form Validation
const isValidForm = computed(() => {
  if (!newOrder.value.customerId || !newOrder.value.serviceId) return false
  if (selectedService.value?.unit === 'kg' && (!newOrder.value.weight || newOrder.value.weight <= 0)) return false
  if (selectedService.value?.unit === 'piece' && (!newOrder.value.qty || newOrder.value.qty <= 0)) return false
  return true
})

// Submit Order
const submitOrder = () => {
  if (!isValidForm.value) return

  const customer = customers.value.find(c => c.id === newOrder.value.customerId)
  const service = services.value.find(s => s.id === newOrder.value.serviceId)

  if (customer && service) {
    addOrder({
      customerId: customer.id,
      customerName: customer.name,
      serviceId: service.id,
      serviceName: service.name,
      weight: service.unit === 'kg' ? newOrder.value.weight : undefined,
      qty: service.unit === 'piece' ? newOrder.value.qty : undefined,
      status: 'pending',
      priority: newOrder.value.priority,
      notes: newOrder.value.notes,
      dueDate: newOrder.value.dueDate
    })

    // Reset Form
    newOrder.value = {
      customerId: '',
      serviceId: '',
      weight: 1.0,
      qty: 1,
      priority: 'normal',
      dueDate: getTomorrowDate(),
      notes: ''
    }
    showCreateModal.value = false
  }
}

// Inline status update
const changeStatus = (orderId: string, event: Event) => {
  const target = event.target as HTMLSelectElement
  updateOrderStatus(orderId, target.value as OrderStatus)
}

// Delete / Cancel order
const confirmDelete = (orderId: string) => {
  if (confirm(`Are you sure you want to cancel and delete order ${orderId}?`)) {
    deleteOrder(orderId)
  }
}

// Filtered Orders logic
const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    // Search query match
    const searchMatch = 
      order.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      order.serviceName.toLowerCase().includes(searchQuery.value.toLowerCase())

    // Status filter match
    const statusMatch = 
      statusFilter.value === 'all' || 
      (statusFilter.value === 'active' && order.status !== 'delivered') ||
      order.status === statusFilter.value

    // Priority filter match
    const priorityMatch = 
      filterPriority.value === 'all' || 
      order.priority === filterPriority.value

    return searchMatch && statusMatch && priorityMatch
  })
})

// Date utility formatter
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
