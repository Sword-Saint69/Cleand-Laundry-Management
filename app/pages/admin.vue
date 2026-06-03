<template>
  <div style="min-height: 100vh; background-color: var(--bg-primary); padding: 2rem 3rem; color: var(--text-primary);">
    <div style="max-width: 1200px; margin: 0 auto;">
      <!-- Back Navigation Header -->
      <div style="margin-bottom: 2rem;">
        <NuxtLink to="/" class="btn btn-secondary" style="font-size: 0.9rem; padding: 0.5rem 1rem; border-color: var(--border-color);">
          ← Back to Shop Dashboard
        </NuxtLink>
      </div>

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>Admin Control Panel</h1>
          <p class="subtitle">Configure rate sheets, stains, employees, and expense categories</p>
        </div>
        <div>
          <button v-if="activeTab !== 'system'" class="btn btn-primary" @click="openAddModal(activeTab)">
            <i class="ti ti-plus" style="font-size: 1.15rem;"></i>
            <span>{{ getAddButtonLabel() }}</span>
          </button>
        </div>
      </div>

      <!-- Tab Selection -->
      <div style="display: flex; gap: 0.5rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; flex-wrap: wrap;">
        <button 
          v-for="tab in ['materials', 'stains', 'employees', 'expense_categories', 'system']"
          :key="tab"
          :style="{ 
            border: 'none', 
            background: 'none', 
            fontSize: '0.95rem', 
            fontWeight: '600', 
            padding: '0.5rem 1rem', 
            cursor: 'pointer',
            color: activeTab === tab ? 'var(--color-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : 'none'
          }"
          @click="activeTab = tab"
        >
          {{ getTabLabel(tab) }}
        </button>
      </div>

      <!-- Content: Materials Tab -->
      <div v-if="activeTab === 'materials'" class="panel-card">
        <h2>Material Rate Sheets</h2>
        <p class="subtitle mb-1">Set rates for the clothes dropdown in order sheets</p>
        <div v-if="!isLoaded" class="text-center text-secondary py-4">
          Loading materials list...
        </div>
        <div v-else-if="services.length === 0" class="text-center text-secondary py-4">
          No materials defined yet. Click "Add Material Type" to begin.
        </div>
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>Material Name</th>
                <th>Base Price</th>
                <th>Charge Unit</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="srv in services" :key="srv.id">
                <td><strong>{{ srv.name }}</strong></td>
                <td><strong style="color: var(--color-success)">₹{{ srv.price.toFixed(2) }}</strong></td>
                <td><span class="badge badge-ready">per {{ srv.unit }}</span></td>
                <td class="text-right">
                  <div class="flex gap-1 justify-end">
                    <button class="btn btn-secondary btn-sm" @click="openEditMaterial(srv)">Edit</button>
                    <button class="btn btn-secondary btn-danger btn-sm" @click="confirmDeleteMaterial(srv)">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Content: Stains Tab -->
      <div v-else-if="activeTab === 'stains'" class="panel-card">
        <h2>Stain Options</h2>
        <p class="subtitle mb-1">Manage levels of stains that appear in washing order rows</p>
        <div v-if="!isLoaded" class="text-center text-secondary py-4">
          Loading stains list...
        </div>
        <div v-else-if="stains.length === 0" class="text-center text-secondary py-4">
          No stain levels defined yet. Click "Add Stain Level" to begin.
        </div>
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>Stain Name</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="st in stains" :key="st.id">
                <td><strong>{{ st.name }}</strong></td>
                <td class="text-right">
                  <button class="btn btn-secondary btn-danger btn-sm" @click="deleteStain(st.id)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Content: Employees Tab -->
      <div v-else-if="activeTab === 'employees'" class="panel-card">
        <h2>Employee Directory</h2>
        <p class="subtitle mb-1">Register staffs to track salary Payouts & duties</p>
        <div v-if="!isLoaded" class="text-center text-secondary py-4">
          Loading employees...
        </div>
        <div v-else-if="employees.length === 0" class="text-center text-secondary py-4">
          No employees added. Click "Add Employee" to register staff.
        </div>
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Role</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="emp in employees" :key="emp.id">
                <td><strong>{{ emp.name }}</strong></td>
                <td>{{ emp.phone }}</td>
                <td><span class="badge badge-washed">{{ emp.role }}</span></td>
                <td class="text-right">
                  <button class="btn btn-secondary btn-danger btn-sm" @click="deleteEmployee(emp.id)">Remove</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Content: Expense Categories Tab -->
      <div v-else-if="activeTab === 'expense_categories'" class="panel-card">
        <h2>Expense Classification</h2>
        <p class="subtitle mb-1">Define categories for logging payouts, detergents, and bills</p>
        <div v-if="!isLoaded" class="text-center text-secondary py-4">
          Loading expense classifications...
        </div>
        <div v-else-if="expenseCategories.length === 0" class="text-center text-secondary py-4">
          No categories defined. Click "Add Expense Category" to begin.
        </div>
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>Category Name</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cat in expenseCategories" :key="cat.id">
                <td><strong>{{ cat.name }}</strong></td>
                <td class="text-right">
                  <button class="btn btn-secondary btn-danger btn-sm" @click="deleteExpenseCategory(cat.id)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Content: System Maintenance Tab -->
      <div v-else-if="activeTab === 'system'" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
        <div class="panel-card">
          <h2>Database Metrics</h2>
          <p class="subtitle mb-1">System record count tracker</p>
          <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem;">
            <div class="flex justify-between py-1" style="border-bottom: 1px solid var(--border-color);">
              <span class="text-secondary">Registered Customers</span>
              <strong>{{ customers.length }}</strong>
            </div>
            <div class="flex justify-between py-1" style="border-bottom: 1px solid var(--border-color);">
              <span class="text-secondary">Material Rate Codes</span>
              <strong>{{ services.length }}</strong>
            </div>
            <div class="flex justify-between py-1" style="border-bottom: 1px solid var(--border-color);">
              <span class="text-secondary">Logged Invoices</span>
              <strong>{{ orders.length }}</strong>
            </div>
            <div class="flex justify-between py-1" style="border-bottom: 1px solid var(--border-color);">
              <span class="text-secondary">Expenses Registered</span>
              <strong>{{ expenses.length }}</strong>
            </div>
          </div>
        </div>

        <div class="panel-card" style="border-color: rgba(239, 68, 68, 0.2);">
          <h2 style="color: var(--color-danger)">System Actions</h2>
          <p class="subtitle mb-1">Administrative wipe utilities (Warning: Irreversible actions)</p>
          <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem;">
            <button class="btn btn-secondary btn-danger" @click="wipeDatabase" style="padding: 0.85rem 1rem;">
              Wipe Shop Records (Orders, Customers, Expenses)
            </button>
            <button class="btn btn-secondary" @click="bootstrapDatabase" style="padding: 0.85rem 1rem;">
              Populate System Defaults & Demo Data
            </button>
          </div>
        </div>
      </div>

      <!-- General Purpose Modals -->
      <div class="modal-backdrop" v-if="showModal" @click="showModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ modalTitle }}</h2>
            <button @click="showModal = false" style="background: none; border: none; font-size: 1.5rem; color: var(--text-secondary); cursor: pointer;">
              &times;
            </button>
          </div>
          
          <div class="modal-body">
            <!-- Material Modal Fields -->
            <div v-if="modalType === 'materials'" style="display: flex; flex-direction: column; gap: 1.25rem;">
              <div class="form-group">
                <label>Material Name</label>
                <input type="text" v-model="materialForm.name" placeholder="e.g. Silk Saree, Blanket, Jacket" :disabled="isEditing" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Price (₹)</label>
                  <input type="number" v-model.number="materialForm.price" placeholder="150" />
                </div>
                <div class="form-group">
                  <label>Charged By</label>
                  <select v-model="materialForm.unit" :disabled="isEditing">
                    <option value="piece">Quantity (per piece)</option>
                    <option value="kg">Weight (per kg)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Stain Modal Fields -->
            <div v-else-if="modalType === 'stains'" style="display: flex; flex-direction: column; gap: 1.25rem;">
              <div class="form-group">
                <label>Stain Option Name</label>
                <input type="text" v-model="stainForm.name" placeholder="e.g. Wine Stain, Ink Leak, Mud" />
              </div>
            </div>

            <!-- Employee Modal Fields -->
            <div v-else-if="modalType === 'employees'" style="display: flex; flex-direction: column; gap: 1.25rem;">
              <div class="form-group">
                <label>Employee Name</label>
                <input type="text" v-model="employeeForm.name" placeholder="John Wick" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Phone Number</label>
                  <input type="text" v-model="employeeForm.phone" placeholder="+91 9988776655" />
                </div>
                <div class="form-group">
                  <label>Staff Role</label>
                  <input type="text" v-model="employeeForm.role" placeholder="e.g. Ironer, Washer, Counter Staff" />
                </div>
              </div>
            </div>

            <!-- Expense Category Modal Fields -->
            <div v-else-if="modalType === 'expense_categories'" style="display: flex; flex-direction: column; gap: 1.25rem;">
              <div class="form-group">
                <label>Expense Category Classification</label>
                <input type="text" v-model="expenseCategoryForm.name" placeholder="e.g. Detergent, Rent, Fuel" />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showModal = false">Cancel</button>
            <button class="btn btn-primary" :disabled="!isValidForm" @click="submitModalAction">
              Save Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLaundryStore } from '~/composables/useLaundryStore'

definePageMeta({
  layout: false
})

const store = useLaundryStore()
const {
  services,
  customers,
  orders,
  stains,
  employees,
  expenseCategories,
  expenses,
  isLoaded,
  addService,
  updateService,
  deleteService,
  addStain,
  deleteStain,
  addEmployee,
  deleteEmployee,
  addExpenseCategory,
  deleteExpenseCategory,
  deleteOrder,
  deleteCustomer,
  deleteExpense
} = store

const activeTab = ref('materials')
const showModal = ref(false)
const modalType = ref('materials')
const isEditing = ref(false)
const editingId = ref<string | null>(null)

// Forms state
const materialForm = ref({ name: '', price: 50, unit: 'piece' as 'kg' | 'piece' })
const stainForm = ref({ name: '' })
const employeeForm = ref({ name: '', phone: '', role: 'Counter Staff' })
const expenseCategoryForm = ref({ name: '' })

const getTabLabel = (tab: string) => {
  const map: Record<string, string> = {
    materials: 'Material Rates',
    stains: 'Stain Options',
    employees: 'Employee Roster',
    expense_categories: 'Expense Items',
    system: 'Maintenance'
  }
  return map[tab] || tab
}

const getAddButtonLabel = () => {
  const map: Record<string, string> = {
    materials: 'Add Material Type',
    stains: 'Add Stain Level',
    employees: 'Register Employee',
    expense_categories: 'Add Expense Category'
  }
  return map[activeTab.value] || 'Add New'
}

const modalTitle = computed(() => {
  if (isEditing.value) return 'Edit Rate Sheet'
  const map: Record<string, string> = {
    materials: 'Add Material Rate Sheet',
    stains: 'Add Stain Option',
    employees: 'Register New Staff Member',
    expense_categories: 'Create Expense category'
  }
  return map[modalType.value] || 'Add Item'
})

const openAddModal = (type: string) => {
  isEditing.value = false
  editingId.value = null
  modalType.value = type
  
  // Reset forms
  materialForm.value = { name: '', price: 50, unit: 'piece' }
  stainForm.value = { name: '' }
  employeeForm.value = { name: '', phone: '', role: 'Counter Staff' }
  expenseCategoryForm.value = { name: '' }

  showModal.value = true
}

const openEditMaterial = (srv: any) => {
  isEditing.value = true
  editingId.value = srv.id
  modalType.value = 'materials'
  materialForm.value = { name: srv.name, price: srv.price, unit: srv.unit }
  showModal.value = true
}

const isValidForm = computed(() => {
  if (modalType.value === 'materials') {
    return materialForm.value.name.trim() !== '' && materialForm.value.price > 0
  } else if (modalType.value === 'stains') {
    return stainForm.value.name.trim() !== ''
  } else if (modalType.value === 'employees') {
    return employeeForm.value.name.trim() !== '' && employeeForm.value.phone.trim() !== ''
  } else if (modalType.value === 'expense_categories') {
    return expenseCategoryForm.value.name.trim() !== ''
  }
  return false
})

const submitModalAction = async () => {
  if (!isValidForm.value) return

  if (modalType.value === 'materials') {
    if (isEditing.value && editingId.value) {
      await updateService({ id: editingId.value, ...materialForm.value })
    } else {
      await addService(materialForm.value)
    }
  } else if (modalType.value === 'stains') {
    await addStain(stainForm.value.name)
  } else if (modalType.value === 'employees') {
    await addEmployee(employeeForm.value)
  } else if (modalType.value === 'expense_categories') {
    await addExpenseCategory(expenseCategoryForm.value.name)
  }

  showModal.value = false
}

const confirmDeleteMaterial = (srv: any) => {
  if (confirm(`Delete material rate code "${srv.name}"?`)) {
    deleteService(srv.id)
  }
}

const wipeDatabase = async () => {
  if (confirm('CAUTION: Are you sure you want to delete ALL orders, customer profiles, and expense entries? This cannot be undone.')) {
    for (const order of orders.value) await deleteOrder(order.id)
    for (const cust of customers.value) await deleteCustomer(cust.id)
    for (const exp of expenses.value) await deleteExpense(exp.id)
    alert('All operational records cleared successfully.')
  }
}

const bootstrapDatabase = async () => {
  // Material demo seeds
  if (services.value.length === 0) {
    const demoItems = [
      { name: 'Shirt / T-Shirt', price: 40, unit: 'piece' as 'kg' | 'piece' },
      { name: 'Jeans / Pants', price: 60, unit: 'piece' as 'kg' | 'piece' },
      { name: 'Bed Sheet', price: 120, unit: 'piece' as 'kg' | 'piece' },
      { name: 'Blanket / Duvet', price: 200, unit: 'piece' as 'kg' | 'piece' },
      { name: 'Suit / Blazer Dryclean', price: 350, unit: 'piece' as 'kg' | 'piece' },
      { name: 'General Clothes Load', price: 150, unit: 'kg' as 'kg' | 'piece' }
    ]
    for (const item of demoItems) await addService(item)
  }

  // Stain demo seeds
  if (stains.value.length === 0) {
    const stainDemo = ['None', 'Mild', 'Heavy']
    for (const s of stainDemo) await addStain(s)
  }

  // Expense categories demo seeds
  if (expenseCategories.value.length === 0) {
    const categoriesDemo = ['Detergent & Supplies', 'Employee Salary', 'Rent', 'Electricity & Water', 'Miscellaneous']
    for (const c of categoriesDemo) await addExpenseCategory(c)
  }

  alert('Default settings & demo categories initialized.')
}
</script>
