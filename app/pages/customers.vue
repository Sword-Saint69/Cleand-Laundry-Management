<template>
  <div>
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>Customers Directory</h1>
        <p class="subtitle">Manage client accounts and trace their order history</p>
      </div>
      <div>
        <button class="btn btn-primary" @click="showAddModal = true" style="display: inline-flex; align-items: center; gap: 0.25rem;">
          <i class="ti ti-user-plus" style="font-size: 1.25rem;"></i>
          <span>Add Customer</span>
        </button>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="panel-card" style="margin-bottom: 2rem;">
      <input 
        type="text" 
        placeholder="Search customers by name, phone, or email..." 
        v-model="searchQuery" 
        class="w-full"
      />
    </div>

    <div class="card-section">
      <!-- Customer list -->
      <div class="panel-card">
        <h2>Registered Customers</h2>
        <p class="subtitle mb-1">Click a customer to view their detailed order list</p>

        <div v-if="!isLoaded" class="text-center text-secondary py-4">
          Loading customers list...
        </div>
        <div v-else-if="filteredCustomers.length === 0" class="text-center text-secondary py-4">
          No customers found. Click "Add Customer" to get started.
        </div>
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Joined</th>
                <th class="text-center">Orders</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="cust in filteredCustomers" 
                :key="cust.id" 
                @click="selectCustomer(cust)"
                :style="{ cursor: 'pointer', backgroundColor: selectedCustId === cust.id ? 'var(--bg-hover)' : 'transparent' }"
              >
                <td>
                  <strong>{{ cust.name }}</strong>
                  <div style="font-size: 0.8rem; color: var(--text-secondary);">{{ cust.address }}</div>
                </td>
                <td>{{ cust.phone }}</td>
                <td>{{ cust.email }}</td>
                <td>{{ cust.joinedDate }}</td>
                <td class="text-center">
                  <span class="badge badge-drying" style="font-weight: bold;">
                    {{ getCustomerOrderCount(cust.id) }}
                  </span>
                </td>
                <td class="text-right" @click.stop>
                  <button class="btn btn-secondary btn-danger btn-sm" @click="confirmDelete(cust)">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Customer Order History details -->
      <div class="panel-card">
        <h2>Customer File Card</h2>
        <div v-if="!selectedCustomer" class="text-center text-secondary" style="margin-top: 3rem;">
          Select a customer from the left directory to load their order records.
        </div>
        <div v-else>
          <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 1.5rem; margin-bottom: 1.5rem;">
            <h3 style="font-size: 1.2rem; color: var(--color-primary);">{{ selectedCustomer.name }}</h3>
            <p style="font-size: 0.9rem;" class="mt-1">
              <strong>Phone:</strong> {{ selectedCustomer.phone }} <br/>
              <span class="text-secondary" style="font-size: 0.8rem;">Joined {{ selectedCustomer.joinedDate }}</span>
            </p>
          </div>

          <h3>Order History</h3>
          <div v-if="selectedCustomerOrders.length === 0" class="text-secondary" style="font-size: 0.9rem; margin-top: 1rem;">
            No orders found for this customer.
          </div>
          <div v-else style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; max-height: 400px; overflow-y: auto; padding-right: 0.25rem;">
            <div 
              v-for="order in selectedCustomerOrders" 
              :key="order.id"
              style="background: var(--bg-hover); border-radius: var(--radius-md); padding: 1rem; border: 1px solid var(--border-color);"
            >
              <div class="flex justify-between items-center">
                <strong>{{ order.id }}</strong>
                <span :class="['badge', `badge-${order.status}`]">{{ order.status }}</span>
              </div>
              <div class="flex justify-between items-start mt-2" style="font-size: 0.85rem; gap: 1rem;">
                <span class="text-secondary">
                  <strong style="text-transform: capitalize;">{{ order.orderType === 'washing' ? '🧼 Washing' : '💨 Ironing' }}</strong>
                  <div v-for="item in order.items" :key="item.slNo" style="font-size: 0.8rem; margin-top: 2px;">
                    {{ item.material }} (x{{ item.qty }})
                  </div>
                </span>
                <strong>₹{{ order.totalPrice.toFixed(2) }}</strong>
              </div>
              <div v-if="order.notes" style="font-size: 0.8rem; font-style: italic; margin-top: 0.5rem;" class="text-secondary">
                "{{ order.notes }}"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Customer Modal -->
    <div class="modal-backdrop" v-if="showAddModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Register Customer Profile</h2>
          <button 
            @click="showAddModal = false" 
            style="background: none; border: none; font-size: 1.5rem; color: var(--text-secondary); cursor: pointer;"
          >
            &times;
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="cust-name">Full Name</label>
            <input id="cust-name" type="text" v-model="newCustomer.name" placeholder="John Wick" />
          </div>
          <div class="form-group">
            <label for="cust-phone">Phone Number</label>
            <input id="cust-phone" type="text" v-model="newCustomer.phone" placeholder="+1 (555) 0199" />
          </div>
          <div class="form-group">
            <label for="cust-email">Email Address</label>
            <input id="cust-email" type="email" v-model="newCustomer.email" placeholder="john.wick@continental.com" />
          </div>
          <div class="form-group">
            <label for="cust-address">Street Address</label>
            <input id="cust-address" type="text" v-model="newCustomer.address" placeholder="128 Beaver St, NY Room 303" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddModal = false">Cancel</button>
          <button class="btn btn-primary" :disabled="!isValidForm" @click="submitCustomer">
            Register Customer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLaundryStore, type Customer } from '~/composables/useLaundryStore'

const store = useLaundryStore()
const { customers, orders, isLoaded, addCustomer, deleteCustomer } = store

const searchQuery = ref('')
const showAddModal = ref(false)
const selectedCustId = ref<string | null>(null)

// Initialize form
const newCustomer = ref({
  name: '',
  phone: '',
  email: '',
  address: ''
})

const isValidForm = computed(() => {
  return newCustomer.value.name.trim() !== '' && newCustomer.value.phone.trim() !== ''
})

const submitCustomer = () => {
  if (!isValidForm.value) return
  
  const created = addCustomer({
    name: newCustomer.value.name,
    phone: newCustomer.value.phone,
    email: newCustomer.value.email,
    address: newCustomer.value.address
  })

  // Select the newly created customer
  selectedCustId.value = created.id

  // Reset form
  newCustomer.value = {
    name: '',
    phone: '',
    email: '',
    address: ''
  }
  showAddModal.value = false
}

// Select customer for history card
const selectedCustomer = computed(() => {
  return customers.value.find(c => c.id === selectedCustId.value) || null
})

const selectCustomer = (cust: Customer) => {
  selectedCustId.value = cust.id
}

const selectedCustomerOrders = computed(() => {
  if (!selectedCustId.value) return []
  return orders.value.filter(o => o.customerId === selectedCustId.value)
})

const getCustomerOrderCount = (customerId: string) => {
  return orders.value.filter(o => o.customerId === customerId).length
}

const confirmDelete = (cust: Customer) => {
  if (confirm(`Remove ${cust.name}? This will not delete their existing orders but clears their profile contact.`)) {
    if (selectedCustId.value === cust.id) {
      selectedCustId.value = null
    }
    deleteCustomer(cust.id)
  }
}

// Filter directory
const filteredCustomers = computed(() => {
  return customers.value.filter(c => {
    const q = searchQuery.value.toLowerCase()
    return c.name.toLowerCase().includes(q) || 
           c.phone.toLowerCase().includes(q) || 
           c.email.toLowerCase().includes(q)
  })
})
</script>
