<template>
  <div>
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>Laundry Services & Pricing</h1>
        <p class="subtitle">Set shop rate charts for cleaning services</p>
      </div>
      <div>
        <button class="btn btn-primary" @click="openAddModal">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 18px; height: 18px;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Service Type
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="panel-card">
      <div v-if="!isLoaded" class="text-center text-secondary py-4">
        Loading services chart...
      </div>
      <div v-else-if="services.length === 0" class="text-center text-secondary py-4">
        No services defined yet. Click "Add Service Type" to initialize.
      </div>
      <div v-else class="table-container">
        <table>
          <thead>
            <tr>
              <th>Service Name</th>
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
                    Edit Price
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

    <!-- Add/Edit Service Modal -->
    <div class="modal-backdrop" v-if="showModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Edit Service Rate' : 'Add New Service Type' }}</h2>
          <button 
            @click="showModal = false" 
            style="background: none; border: none; font-size: 1.5rem; color: var(--text-secondary); cursor: pointer;"
          >
            &times;
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="srv-name">Service Name</label>
            <input 
              id="srv-name" 
              type="text" 
              v-model="serviceForm.name" 
              placeholder="e.g. Delicate Lace Wash" 
              :disabled="isEditing"
            />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="srv-price">Rate / Base Price (₹)</label>
              <input 
                id="srv-price" 
                type="number" 
                step="0.05" 
                min="0.05" 
                v-model.number="serviceForm.price" 
                placeholder="4.50" 
              />
            </div>
            <div class="form-group">
              <label for="srv-unit">Charged By</label>
              <select id="srv-unit" v-model="serviceForm.unit" :disabled="isEditing">
                <option value="kg">Weight (per kg)</option>
                <option value="piece">Quantity (per piece)</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showModal = false">Cancel</button>
          <button class="btn btn-primary" :disabled="!isValidForm" @click="saveService">
            {{ isEditing ? 'Save Changes' : 'Create Service' }}
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
const { services, isLoaded, addService, updateService, deleteService } = store

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)

const serviceForm = ref({
  name: '',
  price: 1.50,
  unit: 'kg' as 'kg' | 'piece'
})

const isValidForm = computed(() => {
  return serviceForm.value.name.trim() !== '' && serviceForm.value.price > 0
})

const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  serviceForm.value = {
    name: '',
    price: 1.50,
    unit: 'kg'
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
  if (confirm(`Delete service: "${srv.name}"? Active orders using this service will keep their rates, but no new orders can select it.`)) {
    deleteService(srv.id)
  }
}
</script>
