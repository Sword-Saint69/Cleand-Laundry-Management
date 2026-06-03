<template>
  <div>
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>Laundry Orders</h1>
        <p class="subtitle">Create and oversee customer laundry batches</p>
      </div>
      <div>
        <button class="btn btn-primary" @click="openCreateModal" style="display: inline-flex; align-items: center; gap: 0.25rem;">
          <i class="ti ti-plus" style="font-size: 1.25rem;"></i>
          <span>Create New Order</span>
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
            <option value="active">Active Queue (Non-Dispatched)</option>
            <option value="draft">Draft</option>
            <option value="ready">Ready</option>
            <option value="dispatched">Dispatched</option>
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
              <th>Customer Info</th>
              <th>Service Type</th>
              <th>Items Detail</th>
              <th>Total Cost</th>
              <th>Date Ordered</th>
              <th>Priority</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id" @click="viewReceipt(order)" style="cursor: pointer;" class="hover-row">
              <td>
                <strong class="text-primary">{{ order.id }}</strong>
              </td>
              <td>
                <strong>{{ order.customerName }}</strong>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">{{ order.customerPhone }}</div>
              </td>
              <td>
                <span style="text-transform: capitalize; font-weight: 500;">
                  {{ order.orderType === 'washing' ? '🧼 Washing' : '💨 Ironing' }}
                </span>
              </td>
              <td>
                <div v-for="item in order.items" :key="item.slNo" style="font-size: 0.85rem; line-height: 1.35; margin-bottom: 2px;">
                  {{ item.material }} <span v-if="order.orderType === 'washing' && item.stains && item.stains !== 'None'" style="font-size: 0.75rem; color: var(--color-danger); font-weight: 600;">[{{ item.stains }} Stains]</span> (x{{ item.qty }} &times; ₹{{ item.price }})
                </div>
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
              <td @click.stop>
                <!-- If Ironing order -->
                <select 
                  v-if="order.orderType === 'ironing'"
                  :value="order.status" 
                  @change="changeStatus(order.id, $event)" 
                  style="padding: 0.25rem 0.5rem; font-size: 0.85rem; border-radius: var(--radius-sm);"
                >
                  <option value="draft">Draft</option>
                  <option value="ready">Ready</option>
                  <option value="dispatched">Dispatched</option>
                </select>
                <!-- If Washing order -->
                <select 
                  v-else
                  :value="order.status" 
                  @change="changeStatus(order.id, $event)" 
                  style="padding: 0.25rem 0.5rem; font-size: 0.85rem; border-radius: var(--radius-sm);"
                >
                  <option value="dispatched for washing">Dispatched for Washing</option>
                  <option value="washed">Washed</option>
                  <option value="ready">Ready</option>
                  <option value="dispatched">Dispatched</option>
                </select>
              </td>
              <td class="text-right" @click.stop>
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
      <div class="modal-content" style="max-width: 850px; width: 90%;">
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
          <!-- Step 1: Select between Washing or Ironing -->
          <div v-if="orderStep === 1" style="display: flex; flex-direction: column; gap: 1.25rem; align-items: center; padding: 1rem 0;">
            <p style="font-weight: 600; font-size: 1.05rem; color: var(--text-secondary); text-align: center; margin-bottom: 0.5rem;">Select the process type for this order:</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; width: 100%;">
              <!-- Washing Card -->
              <div 
                @click="selectOrderTypeStep('washing')"
                style="border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 2rem 1rem; text-align: center; cursor: pointer; transition: var(--transition); background: var(--bg-hover); box-shadow: var(--shadow-sm);"
                onmouseover="this.style.borderColor='var(--color-primary)'; this.style.transform='translateY(-2px)';"
                onmouseout="this.style.borderColor='var(--border-color)'; this.style.transform='none';"
              >
                <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🧼</div>
                <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--color-primary); margin-bottom: 0.25rem;">Washing</h3>
                <p style="font-size: 0.8rem; color: var(--text-secondary);">Wash, dry & clean</p>
              </div>

              <!-- Ironing Card -->
              <div 
                @click="selectOrderTypeStep('ironing')"
                style="border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 2rem 1rem; text-align: center; cursor: pointer; transition: var(--transition); background: var(--bg-hover); box-shadow: var(--shadow-sm);"
                onmouseover="this.style.borderColor='var(--color-success)'; this.style.transform='translateY(-2px)';"
                onmouseout="this.style.borderColor='var(--border-color)'; this.style.transform='none';"
              >
                <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">💨</div>
                <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--color-success); margin-bottom: 0.25rem;">Ironing</h3>
                <p style="font-size: 0.8rem; color: var(--text-secondary);">Steam press & crease restore</p>
              </div>
            </div>
          </div>

          <!-- Step 2: Full Form Details -->
          <div v-else-if="orderStep === 2" style="display: flex; flex-direction: column; gap: 1.25rem;">
            <!-- Category Indicator Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-hover); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
              <span style="font-size: 0.95rem;">Order Category: <strong style="text-transform: capitalize;">{{ newOrder.orderType === 'washing' ? '🧼 Washing' : '💨 Ironing' }}</strong></span>
              <button class="btn btn-secondary btn-sm" @click="orderStep = 1" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Change Category</button>
            </div>

            <!-- Customer Name and Phone Fields -->
            <div class="form-row">
              <div class="form-group">
                <label for="order-cust-name">Customer Name</label>
                <input id="order-cust-name" type="text" v-model="newOrder.customerName" placeholder="e.g. Sarah Connor" />
              </div>
              <div class="form-group" style="position: relative;">
                <label for="order-cust-phone">Customer Phone</label>
                <input 
                  id="order-cust-phone" 
                  type="text" 
                  v-model="newOrder.customerPhone" 
                  placeholder="e.g. +91 9988776655" 
                  autocomplete="off"
                  @focus="showCustomerDropdown = true"
                  @blur="hideCustomerDropdownWithDelay"
                />
                <div 
                  v-if="showCustomerDropdown && matchingCustomers.length > 0"
                  style="position: absolute; top: 100%; left: 0; right: 0; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); z-index: 1000; max-height: 200px; overflow-y: auto; margin-top: 4px;"
                >
                  <div 
                    v-for="c in matchingCustomers" 
                    :key="c.id"
                    @click="selectCustomerForOrder(c)"
                    style="padding: 0.75rem 1rem; cursor: pointer; border-bottom: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.15rem; transition: background 0.2s;"
                    onmouseover="this.style.background='var(--bg-hover)';"
                    onmouseout="this.style.background='transparent';"
                  >
                    <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary);">{{ c.phone }}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">{{ c.name }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Dynamic Items list builder -->
            <div style="margin-top: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <h3 style="font-size: 1rem; font-weight: 600;">Order Items List</h3>
                <button type="button" class="btn btn-secondary btn-sm" @click="addNewItemRow" style="padding: 0.35rem 0.75rem;">
                  + Add Item Row
                </button>
              </div>

              <!-- List Table -->
              <div v-if="newOrder.items.length === 0" style="text-align: center; color: var(--text-secondary); padding: 1.5rem; background: var(--bg-primary); border-radius: var(--radius-md); border: 1px dashed var(--border-color); font-size: 0.9rem;">
                No items added yet. Click "+ Add Item Row" to list garments.
              </div>
              
              <div v-else class="table-container" style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.25rem; background: var(--bg-primary);">
                <table style="font-size: 0.85rem;">
                  <thead>
                    <tr>
                      <th style="padding: 0.5rem; width: 60px; text-align: center;">Sl No</th>
                      <th style="padding: 0.5rem;">Material</th>
                      <th v-if="newOrder.orderType === 'washing'" style="padding: 0.5rem; width: 120px;">Stains</th>
                      <th style="padding: 0.5rem; width: 90px;">Qty</th>
                      <th style="padding: 0.5rem; width: 110px;">Price (₹)</th>
                      <th style="padding: 0.5rem; width: 110px;">Total (₹)</th>
                      <th style="padding: 0.5rem; width: 50px; text-align: center;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in newOrder.items" :key="index">
                      <td style="padding: 0.5rem; text-align: center; vertical-align: middle;">
                        {{ index + 1 }}
                      </td>
                      <td style="padding: 0.25rem;">
                        <select 
                          v-model="item.material" 
                          @change="onMaterialChange(item)" 
                          style="padding: 0.4rem; font-size: 0.85rem; width: 100%; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: var(--radius-sm);"
                        >
                          <option value="" disabled>Select item...</option>
                          <option v-for="srv in services" :key="srv.id" :value="srv.name">
                            {{ srv.name }}
                          </option>
                        </select>
                      </td>
                      <td v-if="newOrder.orderType === 'washing'" style="padding: 0.25rem;">
                        <select 
                          v-model="item.stains" 
                          style="padding: 0.4rem; font-size: 0.85rem; width: 100%; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: var(--radius-sm);"
                        >
                          <option value="None">None</option>
                          <option value="Mild">Mild</option>
                          <option value="Heavy">Heavy</option>
                        </select>
                      </td>
                      <td style="padding: 0.25rem;">
                        <input 
                          type="number" 
                          v-model.number="item.qty" 
                          min="1" 
                          style="padding: 0.4rem; font-size: 0.85rem; width: 100%;" 
                          @input="updateItemTotal(item)"
                        />
                      </td>
                      <td style="padding: 0.25rem;">
                        <input 
                          type="number" 
                          v-model.number="item.price" 
                          min="0" 
                          step="1" 
                          placeholder="Price per piece"
                          style="padding: 0.4rem; font-size: 0.85rem; width: 100%;" 
                          @input="updateItemTotal(item)"
                        />
                      </td>
                      <td style="padding: 0.5rem; vertical-align: middle;">
                        ₹{{ (item.qty * item.price).toFixed(2) }}
                      </td>
                      <td style="padding: 0.25rem; text-align: center; vertical-align: middle;">
                        <button type="button" @click="removeItemRow(index)" style="background: none; border: none; color: var(--color-danger); cursor: pointer; font-size: 1.25rem;" title="Remove row">
                          &times;
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Priority Options & Delivery Target -->
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
                rows="2" 
                v-model="newOrder.notes" 
                placeholder="Fragile, hand dry, crease instructions..."
              ></textarea>
            </div>

            <!-- Overall Invoice Calculation Panel -->
            <div 
              v-if="newOrder.items.length > 0" 
              style="background: var(--bg-hover); border-radius: var(--radius-md); padding: 1rem; margin-top: 0.5rem;"
            >
              <div class="flex justify-between items-center">
                <span>Items Subtotal:</span>
                <span>₹{{ subtotalPrice.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between items-center" v-if="newOrder.priority === 'express'">
                <span class="text-primary">Express Surcharge (20%):</span>
                <span class="text-primary">+₹{{ (subtotalPrice * 0.2).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between items-center mt-2" style="border-top: 1px solid var(--border-color); padding-top: 0.5rem;">
                <strong>Grand Total Price:</strong>
                <strong style="font-size: 1.25rem; color: var(--color-success)">
                  ₹{{ computedTotalPrice.toFixed(2) }}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cancelModal">
            {{ orderStep === 2 ? 'Back' : 'Cancel' }}
          </button>
          <button 
            v-if="orderStep === 2"
            class="btn btn-primary" 
            :disabled="!isValidForm" 
            @click="submitOrder"
          >
            Generate Order
          </button>
        </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useLaundryStore, type OrderStatus, type OrderItem } from '~/composables/useLaundryStore'

const store = useLaundryStore()
const { orders, customers, services, isLoaded, addOrder, updateOrderStatus, dispatchOrder, deleteOrder } = store

const searchQuery = ref('')
const statusFilter = ref('all')
const filterPriority = ref('all')
const showCreateModal = ref(false)
const orderStep = ref(1)
const selectedReceiptOrder = ref<any | null>(null)
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

const viewReceipt = (order: any) => {
  selectedReceiptOrder.value = order
}

const printReceipt = () => {
  window.print()
}

const getTomorrowDate = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
}

const newOrder = ref({
  customerName: '',
  customerPhone: '',
  items: [] as OrderItem[],
  priority: 'normal' as 'normal' | 'express',
  orderType: 'washing' as 'washing' | 'ironing',
  dueDate: getTomorrowDate(),
  notes: ''
})

// Watch phone number to auto-fill customer name if they exist in the DB
watch(() => newOrder.value.customerPhone, (newPhone) => {
  if (newPhone) {
    const existing = customers.value.find(c => c.phone.trim() === newPhone.trim())
    if (existing) {
      newOrder.value.customerName = existing.name
    }
  }
})

const showCustomerDropdown = ref(false)
const selectCustomerForOrder = (customer: any) => {
  newOrder.value.customerPhone = customer.phone
  newOrder.value.customerName = customer.name
  showCustomerDropdown.value = false
}
const hideCustomerDropdownWithDelay = () => {
  setTimeout(() => {
    showCustomerDropdown.value = false
  }, 200)
}
const matchingCustomers = computed(() => {
  const query = newOrder.value.customerPhone.toLowerCase().trim()
  if (!query) return customers.value
  return customers.value.filter(c => 
    c.phone.toLowerCase().includes(query) || 
    c.name.toLowerCase().includes(query)
  )
})

const openCreateModal = () => {
  orderStep.value = 1
  showCreateModal.value = true
}

const selectOrderTypeStep = (type: 'washing' | 'ironing') => {
  newOrder.value.orderType = type
  // Initialize with one default item row to start
  newOrder.value.items = [
    { slNo: 1, material: '', stains: 'None', qty: 1, price: 0, total: 0 }
  ]
  orderStep.value = 2
}

const cancelModal = () => {
  if (orderStep.value === 2) {
    orderStep.value = 1
  } else {
    showCreateModal.value = false
  }
}

// Items handlers
const addNewItemRow = () => {
  newOrder.value.items.push({
    slNo: newOrder.value.items.length + 1,
    material: '',
    stains: 'None',
    qty: 1,
    price: 0,
    total: 0
  })
}

const updateItemTotal = (item: OrderItem) => {
  item.total = Number(item.qty || 0) * Number(item.price || 0)
}

const onMaterialChange = (item: OrderItem) => {
  const selectedSrv = services.value.find(s => s.name === item.material)
  if (selectedSrv) {
    item.price = selectedSrv.price
    updateItemTotal(item)
  }
}

const removeItemRow = (index: number) => {
  newOrder.value.items.splice(index, 1)
  newOrder.value.items.forEach((item, idx) => {
    item.slNo = idx + 1
  })
}

// Subtotal calculation
const subtotalPrice = computed(() => {
  return newOrder.value.items.reduce((sum, item) => sum + (Number(item.qty || 0) * Number(item.price || 0)), 0)
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
  if (!newOrder.value.customerName.trim() || !newOrder.value.customerPhone.trim()) return false
  if (newOrder.value.items.length === 0) return false
  return newOrder.value.items.every(item => item.material.trim() !== '' && item.qty > 0 && item.price >= 0)
})

// Submit Order
const submitOrder = async () => {
  if (!isValidForm.value) return

  await addOrder({
    customerName: newOrder.value.customerName,
    customerPhone: newOrder.value.customerPhone,
    items: newOrder.value.items,
    status: 'draft',
    priority: newOrder.value.priority,
    orderType: newOrder.value.orderType,
    notes: newOrder.value.notes,
    dueDate: newOrder.value.dueDate
  })

  // Reset Form
  newOrder.value = {
    customerName: '',
    customerPhone: '',
    items: [],
    priority: 'normal',
    orderType: 'washing',
    dueDate: getTomorrowDate(),
    notes: ''
  }
  orderStep.value = 1
  showCreateModal.value = false
}

// Inline status update
const changeStatus = (orderId: string, event: Event) => {
  const target = event.target as HTMLSelectElement
  const selectedStatus = target.value
  
  if (selectedStatus === 'dispatched') {
    const ord = orders.value.find(o => o.id === orderId)
    if (ord) {
      target.value = ord.status
      openDispatchPopup(ord)
    }
  } else {
    updateOrderStatus(orderId, selectedStatus as OrderStatus)
  }
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
      order.customerPhone.includes(searchQuery.value)

    // Status filter match
    const statusMatch = 
      (statusFilter.value === 'all' || 
       (statusFilter.value === 'active' && order.status !== 'dispatched') ||
       order.status === statusFilter.value)

    // Priority filter match
    const priorityMatch = 
      filterPriority.value === 'all' || 
      order.priority === filterPriority.value

    return searchMatch && statusMatch && priorityMatch
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
