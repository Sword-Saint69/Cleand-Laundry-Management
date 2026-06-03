<template>
  <div>
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1>Expenses & Staff Payouts</h1>
        <p class="subtitle">Log and monitor overhead expenses, detergents, and employee salary payouts</p>
      </div>
      <div>
        <button class="btn btn-primary" @click="openAddExpenseModal" style="display: inline-flex; align-items: center; gap: 0.25rem;">
          <i class="ti ti-plus" style="font-size: 1.15rem;"></i>
          <span>Record Expense</span>
        </button>
      </div>
    </div>

    <!-- Calendar Date Range & Filters -->
    <div class="panel-card" style="margin-bottom: 2rem;">
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; justify-content: space-between;">
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <label style="font-weight: 500;">From:</label>
            <input type="date" v-model="startDate" style="padding: 0.5rem;" />
          </div>
          
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <label style="font-weight: 500;">To:</label>
            <input type="date" v-model="endDate" style="padding: 0.5rem;" />
          </div>
        </div>

        <div style="font-weight: 600; color: var(--color-primary); font-size: 0.95rem;">
          Total Ledger Entries: {{ filteredExpenses.length }} items
        </div>
      </div>
    </div>

    <!-- Expenses summary cards -->
    <div class="metrics-grid">
      <!-- Total Payouts to Employees -->
      <div class="metric-card">
        <div class="metric-icon metric-blue">
          <i class="ti ti-users"></i>
        </div>
        <div class="metric-info">
          <span class="metric-label">Employee Payouts</span>
          <span class="metric-value">₹{{ metrics.employeeTotal.toFixed(2) }}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
            Salary & bonuses paid out
          </span>
        </div>
      </div>

      <!-- Other Expenses (e.g. Detergent / Supplies) -->
      <div class="metric-card">
        <div class="metric-icon metric-orange">
          <i class="ti ti-wash"></i>
        </div>
        <div class="metric-info">
          <span class="metric-label">Supplies & Utilities</span>
          <span class="metric-value">₹{{ metrics.otherTotal.toFixed(2) }}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
            Detergents, rent, electricity, etc.
          </span>
        </div>
      </div>

      <!-- Total Combined Expenses -->
      <div class="metric-card">
        <div class="metric-icon metric-purple">
          <i class="ti ti-receipt"></i>
        </div>
        <div class="metric-info">
          <span class="metric-label">Total Outflow</span>
          <span class="metric-value">₹{{ metrics.combinedTotal.toFixed(2) }}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
            Combined expenses in range
          </span>
        </div>
      </div>
    </div>

    <!-- Ledger Table -->
    <div class="panel-card">
      <h2>Expense Transaction History</h2>
      <div v-if="!isLoaded" class="text-center text-secondary py-4">
        Loading ledger...
      </div>
      <div v-else-if="filteredExpenses.length === 0" class="text-center text-secondary py-4">
        No expense entries recorded in this calendar date range.
      </div>
      <div v-else class="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Staff / Recipient</th>
              <th>Notes / Details</th>
              <th class="text-right">Amount</th>
              <th class="text-right no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="exp in filteredExpenses" :key="exp.id">
              <td><strong>{{ formatDateString(exp.date) }}</strong></td>
              <td><span class="badge badge-draft">{{ exp.categoryName }}</span></td>
              <td>
                <span v-if="exp.employeeName" class="badge badge-washed">
                  {{ exp.employeeName }}
                </span>
                <span v-else class="text-secondary" style="font-size: 0.85rem;">N/A</span>
              </td>
              <td>{{ exp.notes || 'N/A' }}</td>
              <td class="text-right"><strong style="color: var(--color-danger)">₹{{ exp.amount.toFixed(2) }}</strong></td>
              <td class="text-right no-print">
                <button class="btn btn-secondary btn-danger btn-sm" @click="confirmDeleteExpense(exp.id)">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Expense Modal -->
    <div class="modal-backdrop" v-if="showAddModal" @click="showAddModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Record Shop Expense</h2>
          <button @click="showAddModal = false" style="background: none; border: none; font-size: 1.5rem; color: var(--text-secondary); cursor: pointer;">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label for="exp-date">Date</label>
              <input id="exp-date" type="date" v-model="form.date" />
            </div>
            <div class="form-group">
              <label for="exp-category">Expense Category</label>
              <select id="exp-category" v-model="form.categoryName" @change="onCategoryChange">
                <option value="" disabled>Select category...</option>
                <option v-for="cat in expenseCategories" :key="cat.id" :value="cat.name">
                  {{ cat.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Employee Payout Picker (conditional or optional) -->
          <div class="form-group" v-if="isSalaryCategory">
            <label for="exp-employee">Select Employee / Staff Member</label>
            <select id="exp-employee" v-model="form.employeeId" @change="onEmployeeChange">
              <option value="" disabled>Select staff...</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.name }} ({{ emp.role }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="exp-amount">Amount (₹)</label>
            <input id="exp-amount" type="number" step="10" min="1" v-model.number="form.amount" placeholder="e.g. 500" />
          </div>

          <div class="form-group">
            <label for="exp-notes">Notes / Details</label>
            <textarea id="exp-notes" v-model="form.notes" rows="2" placeholder="e.g. Liquid Detergent, John salary May, Water bill"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddModal = false">Cancel</button>
          <button class="btn btn-primary" :disabled="!isValidForm" @click="submitExpense">
            Log Expense
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
const {
  employees,
  expenseCategories,
  expenses,
  isLoaded,
  addExpense,
  deleteExpense
} = store

// Helper functions for date range initialization
const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0]
}

const getPastDateString = (daysAgo: number) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split('T')[0]
}

// Search and range boundaries states
const startDate = ref(getPastDateString(30))
const endDate = ref(getTodayDateString())
const showAddModal = ref(false)

// Form state
const form = ref({
  date: getTodayDateString(),
  categoryName: '',
  amount: 0,
  employeeId: '',
  employeeName: '',
  notes: ''
})

const isSalaryCategory = computed(() => {
  const name = form.value.categoryName.toLowerCase()
  return name.includes('salary') || name.includes('employee') || name.includes('staff') || name.includes('wage') || name.includes('payout')
})

const onCategoryChange = () => {
  if (!isSalaryCategory.value) {
    form.value.employeeId = ''
    form.value.employeeName = ''
  }
}

const onEmployeeChange = () => {
  const match = employees.value.find(e => e.id === form.value.employeeId)
  if (match) {
    form.value.employeeName = match.name
  }
}

const isValidForm = computed(() => {
  const basics = form.value.categoryName.trim() !== '' && form.value.amount > 0 && form.value.date !== ''
  if (isSalaryCategory.value) {
    return basics && form.value.employeeId !== ''
  }
  return basics
})

const openAddExpenseModal = () => {
  form.value = {
    date: getTodayDateString(),
    categoryName: expenseCategories.value.length > 0 ? expenseCategories.value[0].name : '',
    amount: 0,
    employeeId: '',
    employeeName: '',
    notes: ''
  }
  showAddModal.value = true
}

const submitExpense = async () => {
  if (!isValidForm.value) return
  
  await addExpense({
    date: form.value.date,
    categoryName: form.value.categoryName,
    amount: Number(form.value.amount || 0),
    employeeId: form.value.employeeId || undefined,
    employeeName: form.value.employeeName || undefined,
    notes: form.value.notes
  })

  showAddModal.value = false
}

const confirmDeleteExpense = (id: string) => {
  if (confirm('Delete this expense entry permanently?')) {
    deleteExpense(id)
  }
}

// Filtering computed logic
const filteredExpenses = computed(() => {
  return expenses.value.filter(exp => {
    return exp.date >= startDate.value && exp.date <= endDate.value
  })
})

const metrics = computed(() => {
  let employeeTotal = 0
  let otherTotal = 0
  
  filteredExpenses.value.forEach(exp => {
    const amt = Number(exp.amount || 0)
    // If it has employee associated, treat as salary payout
    if (exp.employeeId || exp.employeeName) {
      employeeTotal += amt
    } else {
      otherTotal += amt
    }
  })

  return {
    employeeTotal,
    otherTotal,
    combinedTotal: employeeTotal + otherTotal
  }
})

// Format helpers
const formatDateString = (dateStr: string) => {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}
</script>
