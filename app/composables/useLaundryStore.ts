import { ref, computed, onMounted } from 'vue'
import { db } from '~/utils/firebase'
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc 
} from 'firebase/firestore'

export interface Service {
  id: string
  name: string
  price: number
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

export interface OrderItem {
  slNo: number
  material: string
  qty: number
  price: number
  total: number
}

export type OrderStatus = 'draft' | 'ready' | 'dispatched'

export interface Order {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  items: OrderItem[]
  status: OrderStatus
  priority: 'normal' | 'express'
  orderType: 'washing' | 'ironing'
  notes: string
  totalPrice: number
  orderDate: string
  dueDate: string
  discountAmount?: number
  amountPaid?: number
  balanceReturned?: number
  paymentStatus?: 'paid' | 'unpaid'
}

export const useLaundryStore = () => {
  const services = ref<Service[]>([])
  const customers = ref<Customer[]>([])
  const orders = ref<Order[]>([])
  const isLoaded = ref(false)

  // Real-time synchronization listeners
  onMounted(() => {
    // Listen to Services
    onSnapshot(collection(db, 'services'), (snapshot) => {
      const list: Service[] = []
      snapshot.forEach(doc => {
        list.push(doc.data() as Service)
      })
      services.value = list
    })

    // Listen to Customers
    onSnapshot(collection(db, 'customers'), (snapshot) => {
      const list: Customer[] = []
      snapshot.forEach(doc => {
        list.push(doc.data() as Customer)
      })
      customers.value = list
    })

    // Listen to Orders
    onSnapshot(collection(db, 'orders'), (snapshot) => {
      const list: Order[] = []
      snapshot.forEach(doc => {
        list.push(doc.data() as Order)
      })
      // Sort orders descending by order date
      orders.value = list.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      isLoaded.value = true
    })
  })

  // Order Actions
  const addOrder = async (orderData: Omit<Order, 'id' | 'customerId' | 'orderDate' | 'totalPrice'>) => {
    const id = `ORD-${Math.floor(1000 + Math.random() * 9000)}`
    const orderDate = new Date().toISOString()
    
    // Auto-create or find customer by phone number
    let finalCustomerId = ''
    const existingCust = customers.value.find(c => c.phone === orderData.customerPhone)
    
    if (existingCust) {
      finalCustomerId = existingCust.id
    } else {
      // Create new customer automatically
      const custId = `cust-${Math.floor(100 + Math.random() * 900)}`
      const joinedDate = new Date().toISOString().split('T')[0]
      const newCust: Customer = {
        id: custId,
        name: orderData.customerName,
        phone: orderData.customerPhone,
        email: '',
        address: '',
        joinedDate
      }
      await setDoc(doc(db, 'customers', custId), newCust)
      finalCustomerId = custId
    }

    // Calculate total price from all subitems
    let subtotal = 0
    if (orderData.items && orderData.items.length > 0) {
      subtotal = orderData.items.reduce((sum, item) => sum + (Number(item.qty || 0) * Number(item.price || 0)), 0)
    }

    let calcPrice = subtotal
    if (orderData.priority === 'express') {
      calcPrice = calcPrice * 1.2
    }

    const finalOrder: Order = {
      ...orderData,
      id,
      customerId: finalCustomerId,
      orderDate,
      totalPrice: Number(calcPrice.toFixed(2))
    }

    await setDoc(doc(db, 'orders', id), finalOrder)
    return finalOrder
  }

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const orderRef = doc(db, 'orders', orderId)
    const orderSnap = await getDoc(orderRef)
    if (orderSnap.exists()) {
      await setDoc(orderRef, { ...orderSnap.data(), status }, { merge: true })
    }
  }

  const dispatchOrder = async (orderId: string, paymentDetails: {
    discountAmount: number
    amountPaid: number
    balanceReturned: number
    paymentStatus: 'paid' | 'unpaid'
  }) => {
    const orderRef = doc(db, 'orders', orderId)
    const orderSnap = await getDoc(orderRef)
    if (orderSnap.exists()) {
      await setDoc(orderRef, {
        ...orderSnap.data(),
        status: 'dispatched',
        ...paymentDetails
      }, { merge: true })
    }
  }

  const deleteOrder = async (orderId: string) => {
    await deleteDoc(doc(db, 'orders', orderId))
  }

  // Customer Actions
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'joinedDate'>) => {
    const id = `cust-${Math.floor(100 + Math.random() * 900)}`
    const joinedDate = new Date().toISOString().split('T')[0]
    
    const finalCustomer: Customer = {
      ...customerData,
      id,
      joinedDate
    }

    await setDoc(doc(db, 'customers', id), finalCustomer)
    return finalCustomer
  }

  const deleteCustomer = async (id: string) => {
    await deleteDoc(doc(db, 'customers', id))
  }

  // Service Actions
  const addService = async (serviceData: Omit<Service, 'id'>) => {
    const id = `srv-${Math.floor(100 + Math.random() * 900)}`
    const finalService = { ...serviceData, id }
    await setDoc(doc(db, 'services', id), finalService)
    return finalService
  }

  const updateService = async (updatedService: Service) => {
    await setDoc(doc(db, 'services', updatedService.id), updatedService)
  }

  const deleteService = async (id: string) => {
    await deleteDoc(doc(db, 'services', id))
  }

  // Computed / Analytics Helpers
  const activeOrdersCount = computed(() => {
    return orders.value.filter(o => o.status !== 'dispatched').length
  })

  const draftOrdersCount = computed(() => {
    return orders.value.filter(o => o.status === 'draft').length
  })

  const readyOrdersCount = computed(() => {
    return orders.value.filter(o => o.status === 'ready').length
  })

  const totalRevenue = computed(() => {
    return orders.value
      .filter(o => o.status === 'dispatched')
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
    dispatchOrder,
    deleteOrder,
    addCustomer,
    deleteCustomer,
    addService,
    updateService,
    deleteService,
    activeOrdersCount,
    draftOrdersCount,
    readyOrdersCount,
    totalRevenue,
    totalSalesThisMonth
  }
}
