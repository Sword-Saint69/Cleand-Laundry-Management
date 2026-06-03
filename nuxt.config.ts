// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Cleand - Laundry Management System',
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5' },
        { name: 'description', content: 'Modern, high-performance laundry shop management and analytics system.' },
        { name: 'format-detection', content: 'telephone=no' },
        // E-E-A-T & Google Search Console verification placeholders
        { name: 'google-site-verification', content: 'google-verification-placeholder-code' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Cleand Laundry' },
        { property: 'og:title', content: 'Cleand - Laundry Management System & Analytics' },
        { property: 'og:description', content: 'Streamline operations, track revenue collection ledger, inventory output, expenses payouts, and orders.' },
        { property: 'og:image', content: 'https://cleand.laundry/logo.png' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Cleand - Laundry Management System & Analytics' },
        { name: 'twitter:description', content: 'Streamline operations, track revenue collection ledger, inventory output, expenses payouts, and orders.' }
      ],
      link: [
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css' },
        { rel: 'icon', type: 'image/png', href: '/logo.png' },
        { rel: 'canonical', href: 'https://cleand.laundry/' }
      ],
      script: [
        // Google Analytics 4 stub
        {
          type: 'text/javascript',
          children: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            // gtag('config', 'G-64B2912GRM'); // Measurement ID configured
          `
        },
        // Microsoft Clarity placeholder stub
        {
          type: 'text/javascript',
          children: `
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "clarity-placeholder-id");
          `
        }
      ]
    }
  }
})

