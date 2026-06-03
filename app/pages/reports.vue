<template>
  <div>
    <!-- Page Header with Print & Export Actions -->
    <div class="page-header">
      <div>
        <h1>Reports & Collections</h1>
        <p class="subtitle">Analyze cash inflow, logged overhead expenses, and net profit margins</p>
      </div>
      <div class="no-print" style="display: flex; gap: 0.75rem;">
        <button class="btn btn-secondary" @click="exportToCSV" style="display: inline-flex; align-items: center; gap: 0.35rem;">
          <i class="ti ti-download" style="font-size: 1.1rem;"></i>
          <span>Export CSV</span>
        </button>
        <button class="btn btn-primary" @click="printReport" style="display: inline-flex; align-items: center; gap: 0.35rem;">
          <i class="ti ti-printer" style="font-size: 1.1rem;"></i>
          <span>Print Summary</span>
        </button>
      </div>
    </div>

    <!-- Calendar Range Panel -->
    <div class="panel-card no-print" style="margin-bottom: 2rem;">
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <h3 style="font-size: 1rem; font-weight: 600; color: var(--text-primary);">Date Range Presets</h3>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; justify-content: space-between;">
          <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <label style="font-weight: 600; font-size: 0.85rem;">Start Date:</label>
              <input type="date" v-model="startDate" style="padding: 0.6rem 0.8rem;" />
            </div>
            
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <label style="font-weight: 600; font-size: 0.85rem;">End Date:</label>
              <input type="date" v-model="endDate" style="padding: 0.6rem 0.8rem;" />
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" @click="setQuickRange('7days')">7 Days</button>
            <button class="btn btn-secondary btn-sm" @click="setQuickRange('30days')">30 Days</button>
            <button class="btn btn-secondary btn-sm" @click="setQuickRange('thisMonth')">This Month</button>
            <button class="btn btn-secondary btn-sm" @click="setQuickRange('lastMonth')">Last Month</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bookkeeping Metrics Grid -->
    <div class="metrics-grid">
      <!-- Total Inflow Collections -->
      <div class="metric-card">
        <div class="metric-icon metric-blue">
          <i class="ti ti-coin"></i>
        </div>
        <div class="metric-info">
          <span class="metric-label">Total Inflow (Collections)</span>
          <span class="metric-value">₹{{ metrics.inflowTotal.toFixed(2) }}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
            🧼 Wash: ₹{{ metrics.washingTotal.toFixed(0) }} | 💨 Iron: ₹{{ metrics.ironingTotal.toFixed(0) }}
          </span>
        </div>
      </div>

      <!-- Total Outflow Expenses -->
      <div class="metric-card">
        <div class="metric-icon metric-orange">
          <i class="ti ti-receipt"></i>
        </div>
        <div class="metric-info">
          <span class="metric-label">Total Outflow (Expenses)</span>
          <span class="metric-value" style="color: var(--color-danger)">₹{{ metrics.outflowTotal.toFixed(2) }}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
            Salaries Payouts: ₹{{ metrics.employeeSalaryTotal.toFixed(0) }}
          </span>
        </div>
      </div>

      <!-- Net profit collection margin -->
      <div class="metric-card">
        <div class="metric-icon metric-purple">
          <i class="ti ti-chart-pie"></i>
        </div>
        <div class="metric-info">
          <span class="metric-label">Net Cash Flow</span>
          <span class="metric-value" :style="{ color: metrics.netCashFlow >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }">
            ₹{{ metrics.netCashFlow.toFixed(2) }}
          </span>
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
            Inflow minus Overhead Outflows
          </span>
        </div>
      </div>

      <!-- Realized vs Pending Cash -->
      <div class="metric-card">
        <div class="metric-icon metric-green">
          <i class="ti ti-cash"></i>
        </div>
        <div class="metric-info">
          <span class="metric-label">Realized Cash (Paid)</span>
          <span class="metric-value">₹{{ metrics.paidTotal.toFixed(2) }}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
            Booked Pending: ₹{{ metrics.unpaidTotal.toFixed(2) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Revenue Contribution Gauge -->
    <div class="panel-card" style="margin-bottom: 2rem;">
      <h3 style="font-size: 0.95rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--text-secondary);">
        Collections & Expenses Payout Proportions
      </h3>
      <div style="display: flex; width: 100%; height: 16px; background: #e2e8f0; border-radius: 999px; overflow: hidden; margin-bottom: 0.75rem;">
        <div 
          :style="{ width: `${metrics.inflowPercent}%` }" 
          style="background: var(--color-primary); height: 100%; transition: width 0.3s;"
          title="Inflow"
        ></div>
        <div 
          :style="{ width: `${metrics.outflowPercent}%` }" 
          style="background: var(--color-danger); height: 100%; transition: width 0.3s;"
          title="Outflow"
        ></div>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600;">
        <span style="color: var(--color-primary)">🟢 Inflow Collection: ₹{{ metrics.inflowTotal.toFixed(2) }}</span>
        <span style="color: var(--color-danger)">🔴 Outflow Expenses: ₹{{ metrics.outflowTotal.toFixed(2) }}</span>
      </div>
    </div>

    <!-- Daily Trend Visual Graph - Two Rows to Avoid Congestion -->
    <div class="panel-card no-print" style="margin-bottom: 2rem;" v-if="dailySummary.length > 0">
      <h2>Daily Collections & Expenses Trend</h2>
      <p class="subtitle" style="margin-bottom: 1.5rem;">Showing side-by-side inflow (collections) and outflow (expenses) split in two rows to prevent visual crowding.</p>
      
      <div v-for="(row, rIndex) in dailySummaryRows" :key="rIndex" style="margin-bottom: 2rem; background: rgba(0,0,0,0.01); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.25rem 1rem;">
        <h3 style="font-size: 0.9rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-secondary); border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem;">
          Timeline Row {{ rIndex + 1 }} ({{ formatDateString(row[0].date) }} to {{ formatDateString(row[row.length - 1].date) }})
        </h3>
        
        <div style="position: relative; height: 160px; display: flex; align-items: flex-end; justify-content: space-between; gap: 0.25rem;">
          <!-- Y-Axis Gridlines -->
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; justify-content: space-between; pointer-events: none;">
            <div style="border-top: 1px dashed rgba(2, 132, 199, 0.05); width: 100%; height: 0;"></div>
            <div style="border-top: 1px dashed rgba(2, 132, 199, 0.05); width: 100%; height: 0;"></div>
            <div style="border-top: 1px dashed rgba(2, 132, 199, 0.05); width: 100%; height: 0;"></div>
          </div>

          <!-- Daily bar columns -->
          <div 
            v-for="day in row" 
            :key="day.date" 
            style="display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; justify-content: flex-end; position: relative; z-index: 10;"
          >
            <!-- Floating metrics -->
            <div style="font-size: 0.65rem; font-weight: bold; color: var(--text-primary); margin-bottom: 2px;" :title="`Inflow: ₹${day.inflowTotal} | Outflow: ₹${day.outflowTotal}`">
              ₹{{ Math.round(day.inflowTotal) }}
            </div>
            
            <!-- Bars -->
            <div style="display: flex; gap: 2px; width: 100%; height: 70%; align-items: flex-end; justify-content: center;">
              <!-- Inflow Bar (Green/Blue) -->
              <div 
                :style="{ height: getBarHeightPercentage(day.inflowTotal), background: 'var(--color-primary)' }"
                style="width: 10px; border-radius: var(--radius-sm) var(--radius-sm) 0 0; transition: height 0.2s;"
                :title="`Daily Inflow: ₹${day.inflowTotal}`"
              ></div>
              <!-- Outflow Bar (Red) -->
              <div 
                :style="{ height: getBarHeightPercentage(day.outflowTotal), background: 'var(--color-danger)' }"
                style="width: 10px; border-radius: var(--radius-sm) var(--radius-sm) 0 0; transition: height 0.2s;"
                :title="`Daily Outflow (Expenses): ₹${day.outflowTotal}`"
              ></div>
            </div>
            
            <!-- Date label -->
            <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 6px; font-weight: 500;">
              {{ formatShortDate(day.date) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Legends -->
      <div style="display: flex; gap: 1.25rem; font-size: 0.75rem; font-weight: 600;">
        <div style="display: flex; align-items: center; gap: 0.35rem; color: var(--color-primary);">
          <span style="display: inline-block; width: 12px; height: 12px; background: var(--color-primary); border-radius: 3px;"></span>
          Daily Cash Inflow (Revenue)
        </div>
        <div style="display: flex; align-items: center; gap: 0.35rem; color: var(--color-danger);">
          <span style="display: inline-block; width: 12px; height: 12px; background: var(--color-danger); border-radius: 3px;"></span>
          Daily Cash Outflow (Expenses)
        </div>
      </div>
    </div>

    <!-- Ledger Tables -->
    <div class="card-section">
      <!-- Datewise details table -->
      <div class="panel-card" style="flex: 2;">
        <h2>Datewise Collections & Expenses ledger</h2>
        <div v-if="!isLoaded" class="text-center text-secondary py-4">
          Loading bookkeeping details...
        </div>
        <div v-else-if="dailySummary.length === 0" class="text-center text-secondary py-4">
          No records found in this range.
        </div>
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th class="text-right">Washing Cash</th>
                <th class="text-right">Ironing Cash</th>
                <th class="text-right">Total Inflow</th>
                <th class="text-right" style="color: var(--color-danger)">Expenses Outflow</th>
                <th class="text-right">Net Margin</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="day in dailySummary" :key="day.date">
                <td><strong>{{ formatDateString(day.date) }}</strong></td>
                <td class="text-right">₹{{ day.washingTotal.toFixed(2) }}</td>
                <td class="text-right">₹{{ day.ironingTotal.toFixed(2) }}</td>
                <td class="text-right" style="color: var(--color-primary); font-weight: 600;">₹{{ day.inflowTotal.toFixed(2) }}</td>
                <td class="text-right" style="color: var(--color-danger);">₹{{ day.outflowTotal.toFixed(2) }}</td>
                <td class="text-right" :style="{ color: day.netTotal >= 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 'bold' }">
                  ₹{{ day.netTotal.toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right Column Breakdown -->
      <div class="panel-card" style="flex: 1.2; display: flex; flex-direction: column; gap: 1.5rem;">
        <!-- Garments Breakdown -->
        <div>
          <h2>Fabric Volume Output</h2>
          <p class="subtitle mb-1">Processed garments share</p>
          <div v-if="garmentBreakdown.length === 0" class="text-secondary" style="font-size: 0.85rem; padding: 1rem 0;">
            No garments recorded.
          </div>
          <div v-else style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; max-height: 250px; overflow-y: auto;">
            <div 
              v-for="item in garmentBreakdown" 
              :key="item.name"
              style="display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.8rem; background: var(--bg-primary); border-radius: var(--radius-md); border: 1px solid var(--border-color);"
            >
              <span style="font-size: 0.85rem; text-transform: capitalize; font-weight: 500;">{{ item.name }}</span>
              <span class="badge badge-ready" style="font-size: 0.75rem;">{{ item.qty }} pcs ({{ item.percent }}%)</span>
            </div>
          </div>
        </div>

        <!-- Expenses category breakdown -->
        <div>
          <h2>Overhead Outflow Shares</h2>
          <p class="subtitle mb-1">Expenses breakdown by categories</p>
          <div v-if="expenseBreakdown.length === 0" class="text-secondary" style="font-size: 0.85rem; padding: 1rem 0;">
            No expenses recorded.
          </div>
          <div v-else style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; max-height: 250px; overflow-y: auto;">
            <div 
              v-for="item in expenseBreakdown" 
              :key="item.name"
              style="display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.8rem; background: var(--bg-primary); border-radius: var(--radius-md); border: 1px solid var(--border-color);"
            >
              <span style="font-size: 0.85rem; font-weight: 500; text-transform: capitalize;">{{ item.name }}</span>
              <span class="badge badge-draft" style="font-size: 0.75rem; font-weight: bold;">₹{{ item.total.toFixed(0) }}</span>
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
const { orders, expenses, isLoaded } = store

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0]
}

const getPastDateString = (daysAgo: number) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split('T')[0]
}

const startDate = ref(getPastDateString(30))
const endDate = ref(getTodayDateString())

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

const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    if (!order.orderDate) return false
    const datePart = order.orderDate.split('T')[0]
    return datePart >= startDate.value && datePart <= endDate.value
  })
})

const filteredExpenses = computed(() => {
  return expenses.value.filter(exp => {
    return exp.date >= startDate.value && exp.date <= endDate.value
  })
})

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

    if (order.status === 'dispatched' && order.paymentStatus === 'paid') {
      paidTotal += Number(order.amountPaid || price - (order.discountAmount || 0))
    } else {
      unpaidTotal += price
    }
  })

  // Outflow totals
  let outflowTotal = 0
  let employeeSalaryTotal = 0
  filteredExpenses.value.forEach(exp => {
    const amt = Number(exp.amount || 0)
    outflowTotal += amt
    if (exp.employeeId || exp.employeeName) {
      employeeSalaryTotal += amt
    }
  })

  const inflowTotal = washingTotal + ironingTotal
  const totalCount = washingCount + ironingCount
  const netCashFlow = inflowTotal - outflowTotal
  const avgOrderValue = totalCount > 0 ? inflowTotal / totalCount : 0

  const combinedTotal = inflowTotal + outflowTotal
  const inflowPercent = combinedTotal > 0 ? Math.round((inflowTotal / combinedTotal) * 100) : 100
  const outflowPercent = combinedTotal > 0 ? 100 - inflowPercent : 0

  return {
    washingTotal,
    washingCount,
    ironingTotal,
    ironingCount,
    inflowTotal,
    outflowTotal,
    employeeSalaryTotal,
    netCashFlow,
    totalCount,
    paidTotal,
    unpaidTotal,
    avgOrderValue,
    inflowPercent,
    outflowPercent
  }
})

const dailySummary = computed(() => {
  const groups: Record<string, {
    date: string
    washingCount: number
    washingTotal: number
    ironingCount: number
    ironingTotal: number
    inflowTotal: number
    outflowTotal: number
    netTotal: number
  }> = {}

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
      inflowTotal: 0,
      outflowTotal: 0,
      netTotal: 0
    }
    current.setDate(current.getDate() + 1)
  }

  // Aggregate collections (inflow)
  filteredOrders.value.forEach(order => {
    if (!order.orderDate) return
    const dateStr = order.orderDate.split('T')[0]
    if (!groups[dateStr]) return

    const price = Number(order.totalPrice || 0)
    if (order.orderType === 'washing') {
      groups[dateStr].washingCount++
      groups[dateStr].washingTotal += price
    } else {
      groups[dateStr].ironingCount++
      groups[dateStr].ironingTotal += price
    }
    groups[dateStr].inflowTotal += price
    groups[dateStr].netTotal += price
  })

  // Aggregate expenses (outflow)
  filteredExpenses.value.forEach(exp => {
    const dateStr = exp.date
    if (!groups[dateStr]) return
    const amt = Number(exp.amount || 0)
    groups[dateStr].outflowTotal += amt
    groups[dateStr].netTotal -= amt
  })

  return Object.values(groups).sort((a, b) => a.date.localeCompare(b.date))
})

// Split trends data into 2 rows if ranges exceed 15 days to prevent conjection
const dailySummaryRows = computed(() => {
  const list = dailySummary.value
  if (list.length <= 15) return [list]
  const mid = Math.ceil(list.length / 2)
  return [
    list.slice(0, mid),
    list.slice(mid)
  ]
})

const garmentBreakdown = computed(() => {
  const summary: Record<string, { qty: number }> = {}
  let totalItemsCount = 0

  filteredOrders.value.forEach(order => {
    if (!order.items) return
    order.items.forEach(item => {
      const name = item.material.trim().toLowerCase()
      if (!name) return
      if (!summary[name]) summary[name] = { qty: 0 }
      summary[name].qty += Number(item.qty || 0)
      totalItemsCount += Number(item.qty || 0)
    })
  })

  return Object.entries(summary)
    .map(([name, val]) => ({
      name,
      qty: val.qty,
      percent: totalItemsCount > 0 ? Math.round((val.qty / totalItemsCount) * 100) : 0
    }))
    .sort((a, b) => b.qty - a.qty)
})

const expenseBreakdown = computed(() => {
  const summary: Record<string, number> = {}
  filteredExpenses.value.forEach(exp => {
    const name = exp.categoryName.trim()
    if (!summary[name]) summary[name] = 0
    summary[name] += Number(exp.amount || 0)
  })
  return Object.entries(summary)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
})

const maxDailyTotal = computed(() => {
  const values = dailySummary.value.flatMap(d => [d.inflowTotal, d.outflowTotal])
  return Math.max(...values, 1)
})

const getBarHeightPercentage = (value: number) => {
  if (value === 0) return '0%'
  return `${(value / maxDailyTotal.value) * 100}%`
}

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

const printReport = () => {
  window.print()
}

const exportToCSV = () => {
  const rows = [
    ['CLEAND - Datewise Financial Ledger Report'],
    [`Selected Range: ${startDate.value} to ${endDate.value}`],
    [],
    ['Date', 'Washing Cash Inflow', 'Ironing Cash Inflow', 'Total Inflow', 'Expenses Outflow', 'Net Profit Margin']
  ]

  dailySummary.value.forEach(day => {
    rows.push([
      formatDateString(day.date),
      day.washingTotal.toFixed(2),
      day.ironingTotal.toFixed(2),
      day.inflowTotal.toFixed(2),
      day.outflowTotal.toFixed(2),
      day.netTotal.toFixed(2)
    ])
  })

  rows.push([])
  rows.push(['Total Inflow collections', metrics.value.inflowTotal.toFixed(2)])
  rows.push(['Total Outflow expenses', metrics.value.outflowTotal.toFixed(2)])
  rows.push(['Net Cash margin', metrics.value.netCashFlow.toFixed(2)])
  rows.push(['Realized Cash', metrics.value.paidTotal.toFixed(2)])

  const csvContent = 'data:text/csv;charset=utf-8,' 
    + rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(',')).join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `Cleand_Ledger_Report_${startDate.value}_to_${endDate.value}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>
