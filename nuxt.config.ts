// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Cleand - Laundry Management System',
      meta: [
        { name: 'description', content: 'Modern, high-performance laundry shop management and analytics system.' }
      ]
    }
  }
})
