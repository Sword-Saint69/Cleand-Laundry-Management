import { ref, watch, computed, onMounted } from 'vue'

export interface Service {
  id: string
  name: string
  price: number // price per unit
  unit: 'kg' | 'piece'
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  joinedDate: string
}

export type OrderStatus = 'pending' | 'washing' | 'drying' | 'ironing' | 'ready' | 'delivered'

export interface Order {
  id: string
  customerId: string
  customerName: string
  serviceId: string
  serviceName: string
  weight?: number // if unit is kg
  qty?: number // if unit is piece
  status: OrderStatus
  priority: 'normal' | 'express'
  notes: string
  totalPrice: number
  orderDate: string
  dueDate: string
}

// Initial empty data
const defaultServices: Service[] = []

const defaultCustomers: Customer[] = []

const defaultOrders: Order[] = []

export const useLaundryStore = () => {
  const services = ref<Service[]>([])
  const customers = ref<Customer[]>([])
  const orders = ref<Order[]>([])
  const isLoaded = ref(false)

  // Initialize and load from local storage
  const loadData = () => {
    if (typeof window !== 'undefined') {
      const storedServices = localStorage.getItem('laundry_services')
      const storedCustomers = localStorage.getItem('laundry_customers')
      const storedOrders = localStorage.getItem('laundry_orders')

      services.value = storedServices ? JSON.parse(storedServices) : defaultServices
      customers.value = storedCustomers ? JSON.parse(storedCustomers) : defaultCustomers
      orders.value = storedOrders ? JSON.parse(storedOrders) : defaultOrders
      isLoaded.value = true
    }
  }

  // Watch for state changes and persist to localStorage
  watch(services, (newVal) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('laundry_services', JSON.stringify(newVal))
    }
  }, { deep: true })

  watch(customers, (newVal) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('laundry_customers', JSON.stringify(newVal))
    }
  }, { deep: true })

  watch(orders, (newVal) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('laundry_orders', JSON.stringify(newVal))
    }
  }, { deep: true })

  // Initialize once
  onMounted(() => {
    loadData()
  })

  // Order Actions
  const addOrder = (orderData: Omit<Order, 'id' | 'orderDate' | 'totalPrice'>) => {
    const id = `ORD-${Math.floor(1000 + Math.random() * 9000)}`
    const orderDate = new Date().toISOString()
    
    // Calculate total price
    const service = services.value.find(s => s.id === orderData.serviceId)
    const basePrice = service ? service.price : 0
    let calcPrice = 0
    if (service?.unit === 'kg') {
      calcPrice = basePrice * (orderData.weight || 0)
    } else {
      calcPrice = basePrice * (orderData.qty || 0)
    }

    // Add express service fee (+20%)
    if (orderData.priority === 'express') {
      calcPrice = calcPrice * 1.2
    }

    const finalOrder: Order = {
      ...orderData,
      id,
      orderDate,
      totalPrice: Number(calcPrice.toFixed(2))
    }

    orders.value.unshift(finalOrder)
    return finalOrder
  }

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const index = orders.value.findIndex(o => o.id === orderId)
    if (index !== -1) {
      orders.value[index].status = status
    }
  }

  const deleteOrder = (orderId: string) => {
    orders.value = orders.value.filter(o => o.id !== orderId)
  }

  // Customer Actions
  const addCustomer = (customerData: Omit<Customer, 'id' | 'joinedDate'>) => {
    const id = `cust-${Math.floor(100 + Math.random() * 900)}`
    const joinedDate = new Date().toISOString().split('T')[0]
    
    const finalCustomer: Customer = {
      ...customerData,
      id,
      joinedDate
    }

    customers.value.push(finalCustomer)
    return finalCustomer
  }

  const deleteCustomer = (id: string) => {
    customers.value = customers.value.filter(c => c.id !== id)
  }

  // Service Actions
  const addService = (serviceData: Omit<Service, 'id'>) => {
    const id = `srv-${Math.floor(100 + Math.random() * 900)}`
    const finalService = { ...serviceData, id }
    services.value.push(finalService)
    return finalService
  }

  const updateService = (updatedService: Service) => {
    const index = services.value.findIndex(s => s.id === updatedService.id)
    if (index !== -1) {
      services.value[index] = updatedService
    }
  }

  const deleteService = (id: string) => {
    services.value = services.value.filter(s => s.id !== id)
  }

  // Computed / Analytics Helpers
  const activeOrdersCount = computed(() => {
    return orders.value.filter(o => o.status !== 'delivered').length
  })

  const washingOrdersCount = computed(() => {
    return orders.value.filter(o => o.status === 'washing').length
  })

  const readyOrdersCount = computed(() => {
    return orders.value.filter(o => o.status === 'ready').length
  })

  const totalRevenue = computed(() => {
    return orders.value
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + o.totalPrice, 0)
  })

  const totalSalesThisMonth = computed(() => {
    return orders.value
      .reduce((sum, o) => sum + o.totalPrice, 0)
  })

  return {
    services,
    customers,
    orders,
    isLoaded,
    addOrder,
    updateOrderStatus,
    deleteOrder,
    addCustomer,
    deleteCustomer,
    addService,
    updateService,
    deleteService,
    activeOrdersCount,
    washingOrdersCount,
    readyOrdersCount,
    totalRevenue,
    totalSalesThisMonth
  }
}
