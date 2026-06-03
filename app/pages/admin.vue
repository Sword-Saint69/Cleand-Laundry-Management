<template>
  <div>
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>Admin Control Panel</h1>
        <p class="subtitle">Configure rate sheets, materials, and system defaults</p>
      </div>
      <div>
        <button v-if="activeTab === 'materials'" class="btn btn-primary" @click="openAddModal">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 18px; height: 18px;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Material Type
        </button>
      </div>
    </div>

    <!-- Tab Selection -->
    <div style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
      <button 
        :style="{ 
          border: 'none', 
          background: 'none', 
          fontSize: '1rem', 
          fontWeight: '600', 
          padding: '0.5rem 1rem', 
          cursor: 'pointer',
          color: activeTab === 'materials' ? 'var(--color-primary)' : 'var(--text-secondary)',
          borderBottom: activeTab === 'materials' ? '2px solid var(--color-primary)' : 'none'
        }"
        @click="activeTab = 'materials'"
      >
        Material Rate Sheets
      </button>
      <button 
        :style="{ 
          border: 'none', 
          background: 'none', 
          fontSize: '1rem', 
          fontWeight: '600', 
          padding: '0.5rem 1rem', 
          cursor: 'pointer',
          color: activeTab === 'system' ? 'var(--color-primary)' : 'var(--text-secondary)',
          borderBottom: activeTab === 'system' ? '2px solid var(--color-primary)' : 'none'
        }"
        @click="activeTab = 'system'"
      >
        System Status & Maintenance
      </button>
    </div>

    <!-- Content: Materials Tab -->
    <div v-if="activeTab === 'materials'" class="panel-card">
      <div v-if="!isLoaded" class="text-center text-secondary py-4">
        Loading materials list...
      </div>
      <div v-else-if="services.length === 0" class="text-center text-secondary py-4">
        No materials defined yet. Click "Add Material Type" to configure rates for the order form dropdown.
      </div>
      <div v-else class="table-container">
        <table>
          <thead>
            <tr>
              <th>Material Name</th>
              <th>Base Price</th>
              <th>Charge Unit</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="srv in services" :key="srv.id">
              <td>
                <strong style="font-size: 1.05rem;">{{ srv.name }}</strong>
              </td>
              <td>
                <strong style="color: var(--color-success); font-size: 1.05rem;">
                  ₹{{ srv.price.toFixed(2) }}
                </strong>
              </td>
              <td>
                <span class="badge badge-pending" style="font-weight: 600;">
                  per {{ srv.unit.toUpperCase() }}
                </span>
              </td>
              <td>
                <span class="badge badge-ready">Active</span>
              </td>
              <td class="text-right">
                <div class="flex gap-1 justify-end">
                  <button class="btn btn-secondary btn-sm" @click="openEditModal(srv)">
                    Edit Rate
                  </button>
                  <button class="btn btn-secondary btn-danger btn-sm" @click="confirmDelete(srv)">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Content: System Tab -->
    <div v-else-if="activeTab === 'system'" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
      <!-- Stats Summary Card -->
      <div class="panel-card">
        <h2>Database Metrics</h2>
        <p class="subtitle mb-1">Current system record counts in Firestore</p>
        
        <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem;">
          <div class="flex justify-between py-1" style="border-bottom: 1px solid var(--border-color);">
            <span class="text-secondary">Registered Customers</span>
            <strong>{{ customers.length }}</strong>
          </div>
          <div class="flex justify-between py-1" style="border-bottom: 1px solid var(--border-color);">
            <span class="text-secondary">Custom Material Types</span>
            <strong>{{ services.length }}</strong>
          </div>
          <div class="flex justify-between py-1" style="border-bottom: 1px solid var(--border-color);">
            <span class="text-secondary">All-time Billing Invoices</span>
            <strong>{{ orders.length }}</strong>
          </div>
        </div>
      </div>

      <!-- Maintenance Commands Card -->
      <div class="panel-card" style="border-color: rgba(239, 68, 68, 0.2);">
        <h2 style="color: var(--color-danger)">System Actions</h2>
        <p class="subtitle mb-1">Administrative wipe utilities (Caution: Permanent operations)</p>
        
        <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem;">
          <button class="btn btn-secondary btn-danger" @click="wipeDatabase" style="padding: 0.85rem 1rem;">
            Wipe Shop Records (Orders & Customers)
          </button>
          
          <button class="btn btn-secondary" @click="bootstrapServices" style="padding: 0.85rem 1rem;">
            Populate Demo Materials & Services
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Service Modal -->
    <div class="modal-backdrop" v-if="showModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Edit Material Rate' : 'Add New Material Type' }}</h2>
          <button 
            @click="showModal = false" 
            style="background: none; border: none; font-size: 1.5rem; color: var(--text-secondary); cursor: pointer;"
          >
            &times;
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="srv-name">Material Name</label>
            <input 
              id="srv-name" 
              type="text" 
              v-model="serviceForm.name" 
              placeholder="e.g. Silk Saree, Blanket, Jacket" 
              :disabled="isEditing"
            />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="srv-price">Rate / Base Price (₹)</label>
              <input 
                id="srv-price" 
                type="number" 
                step="5" 
                min="1" 
                v-model.number="serviceForm.price" 
                placeholder="100" 
              />
            </div>
            <div class="form-group">
              <label for="srv-unit">Charged By</label>
              <select id="srv-unit" v-model="serviceForm.unit" :disabled="isEditing">
                <option value="piece">Quantity (per piece)</option>
                <option value="kg">Weight (per kg)</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showModal = false">Cancel</button>
          <button class="btn btn-primary" :disabled="!isValidForm" @click="saveService">
            {{ isEditing ? 'Save Changes' : 'Create Material' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLaundryStore, type Service } from '~/composables/useLaundryStore'

const store = useLaundryStore()
const { services, customers, orders, isLoaded, addService, updateService, deleteService, deleteOrder, deleteCustomer } = store

const activeTab = ref('materials')
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)

const serviceForm = ref({
  name: '',
  price: 50,
  unit: 'piece' as 'kg' | 'piece'
})

const isValidForm = computed(() => {
  return serviceForm.value.name.trim() !== '' && serviceForm.value.price > 0
})

const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  serviceForm.value = {
    name: '',
    price: 50,
    unit: 'piece'
  }
  showModal.value = true
}

const openEditModal = (srv: Service) => {
  isEditing.value = true
  editingId.value = srv.id
  serviceForm.value = {
    name: srv.name,
    price: srv.price,
    unit: srv.unit
  }
  showModal.value = true
}

const saveService = () => {
  if (!isValidForm.value) return

  if (isEditing.value && editingId.value) {
    updateService({
      id: editingId.value,
      name: serviceForm.value.name,
      price: serviceForm.value.price,
      unit: serviceForm.value.unit
    })
  } else {
    addService({
      name: serviceForm.value.name,
      price: serviceForm.value.price,
      unit: serviceForm.value.unit
    })
  }

  showModal.value = false
}

const confirmDelete = (srv: Service) => {
  if (confirm(`Delete material/service: "${srv.name}"? This removes it from selectable materials list in order creation.`)) {
    deleteService(srv.id)
  }
}

// System administrative wipe functions
const wipeDatabase = async () => {
  if (confirm('CAUTION: Are you sure you want to delete ALL orders and registered customer details permanently? This cannot be undone.')) {
    // Delete all orders
    for (const order of orders.value) {
      await deleteOrder(order.id)
    }
    // Delete all customers
    for (const cust of customers.value) {
      await deleteCustomer(cust.id)
    }
    alert('System Database wiped successfully.')
  }
}

const bootstrapServices = async () => {
  if (services.value.length > 0) {
    if (!confirm('Materials already exist. Populate demo lists anyway?')) {
      return
    }
  }

  const demoItems: Omit<Service, 'id'>[] = [
    { name: 'Shirt / T-Shirt', price: 40, unit: 'piece' },
    { name: 'Jeans / Pants', price: 60, unit: 'piece' },
    { name: 'Bed Sheet', price: 120, unit: 'piece' },
    { name: 'Blanket / Duvet', price: 200, unit: 'piece' },
    { name: 'Suit / Blazer Dryclean', price: 350, unit: 'piece' },
    { name: 'General Clothes Load', price: 150, unit: 'kg' }
  ]

  for (const item of demoItems) {
    await addService(item)
  }
  alert('Demo materials populated successfully.')
}
</script>
