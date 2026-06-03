<template>
  <div class="seo-layout">
    <nav class="seo-breadcrumbs no-print" aria-label="Breadcrumb" style="font-size: 0.85rem; margin-bottom: 1rem; color: var(--text-muted);">
      <ol style="list-style: none; display: flex; gap: 0.5rem; padding: 0;">
        <li><NuxtLink to="/" style="color: var(--color-primary); text-decoration: none;">Home</NuxtLink></li>
        <li style="color: var(--text-muted);">&raquo;</li>
        <li style="color: var(--text-primary); font-weight: 500;">Blog</li>
      </ol>
    </nav>

    <main id="maincontent">
      <div class="page-header">
        <div>
          <h1>Laundry & Fabric Care Resource Center</h1>
          <p class="subtitle">Expert tips, dry cleaning guides, and laundry business optimizations (EEAT Compliant)</p>
        </div>
      </div>

      <!-- Keyword-focused Category Filter Cards -->
      <section aria-label="Categories" style="display: flex; gap: 0.5rem; margin-bottom: 2rem; flex-wrap: wrap;">
        <button 
          v-for="cat in categories" 
          :key="cat"
          @click="selectedCategory = cat"
          :class="['btn', 'btn-sm', selectedCategory === cat ? 'btn-primary' : 'btn-secondary']"
        >
          {{ cat }}
        </button>
      </section>

      <!-- Articles Grid -->
      <section aria-label="Articles Feed">
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
          <article 
            v-for="post in filteredPosts" 
            :key="post.slug"
            class="panel-card"
            style="display: flex; flex-direction: column; justify-content: space-between; transition: var(--transition);"
          >
            <div>
              <span class="badge badge-ready" style="font-size: 0.7rem; margin-bottom: 0.75rem;">{{ post.category }}</span>
              <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; line-height: 1.3;">
                <NuxtLink :to="`/blog/${post.slug}`" style="color: var(--text-primary); text-decoration: none; hover: underline;">
                  {{ post.title }}
                </NuxtLink>
              </h2>
              <p class="subtitle" style="font-size: 0.85rem; line-height: 1.4; margin-bottom: 1rem;">
                {{ post.excerpt }}
              </p>
            </div>

            <div style="border-top: 1px solid var(--border-color); padding-top: 0.75rem; margin-top: 1rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted);">
              <span>By <strong>{{ post.author }}</strong></span>
              <time :datetime="post.date">{{ post.formattedDate }}</time>
            </div>
          </article>
        </div>
      </section>

      <!-- FAQ Accordion (Targets long-tail keywords) -->
      <section aria-label="Frequently Asked Questions" style="margin-top: 4rem;">
        <div class="panel-card">
          <h2 style="margin-bottom: 0.5rem;">Frequently Asked Questions</h2>
          <p class="subtitle" style="margin-bottom: 1.5rem;">Quick expert answers to common garment cleaning and laundry shop operations queries.</p>
          
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div 
              v-for="(faq, index) in faqs" 
              :key="index"
              style="border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;"
            >
              <h3 style="font-size: 1.05rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">
                {{ faq.question }}
              </h3>
              <p class="subtitle" style="font-size: 0.9rem; line-height: 1.5;">
                {{ faq.answer }}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="no-print" style="margin-top: 3rem; padding: 2rem 0; border-top: 1px solid var(--border-color); text-align: center; font-size: 0.85rem; color: var(--text-muted);">
      <p>&copy; 2026 Cleand Laundry Management System. All Rights Reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

useSeoMeta({
  title: 'Cleand Laundry Blog - Fabric Care Guides & Laundry Operations Tips',
  description: 'Read expert advice on stain removals, business overhead optimization, ironing metrics, and dry-cleaning technologies.',
  ogTitle: 'Cleand Laundry Fabric Care Guides & Resources',
  ogDescription: 'Read expert advice on stain removals, business overhead optimization, ironing metrics, and dry-cleaning technologies.',
  ogImage: 'https://cleand.laundry/logo.png',
  twitterCard: 'summary_large_image'
})

// Organization & Website schema configuration
useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How do you remove stubborn ink stains from linen clothes?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Apply alcohol-based solvent (like rubbing alcohol or hand sanitizer) to the backside of the stain, blot with clean microfiber cloth, wash with heavy-duty detergent under cold cycle, and air dry.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is the optimal steam temperature for press ironing cotton shirts?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The optimal temperature setting for 100% cotton garments is between 150°C and 200°C (300°F to 400°F) using heavy steam output to expand fiber structure and release wrinkles safely.'
            }
          }
        ]
      })
    }
  ]
})

const selectedCategory = ref('All')
const categories = ['All', 'Stain Hacks', 'Operations', 'Dry Cleaning']

const posts = [
  {
    slug: '5-laundry-hacks-for-stubborn-stains',
    title: '5 Expert Laundry Hacks for Removing Stubborn Fabric Stains',
    excerpt: 'Remove ink, grease, oil, and coffee marks from linen, silk, and wool garments using safe and non-abrasive chemical techniques.',
    category: 'Stain Hacks',
    author: 'Chef Launderer',
    date: '2026-06-01',
    formattedDate: 'Jun 1, 2026'
  },
  {
    slug: 'how-to-optimize-laundry-shop-overhead-expenses',
    title: 'How to Reduce Laundry Shop Overhead Payouts & Utility Bills',
    excerpt: 'Practical metrics to track utility expenditures, maximize water recycling filters, audit employee payouts, and maximize washing efficiency.',
    category: 'Operations',
    author: 'Admin Expert',
    date: '2026-05-28',
    formattedDate: 'May 28, 2026'
  },
  {
    slug: 'difference-between-steam-ironing-and-washing',
    title: 'Steam Ironing vs. Hot Cycle Washing: Fabric Lifetime Analysis',
    excerpt: 'Detailed comparison of garment shrinkage factors, temperature settings, and color protection variables between services.',
    category: 'Dry Cleaning',
    author: 'Stain Chemist',
    date: '2026-05-15',
    formattedDate: 'May 15, 2026'
  }
]

const filteredPosts = computed(() => {
  if (selectedCategory.value === 'All') return posts
  return posts.filter(p => p.category === selectedCategory.value)
})

const faqs = [
  {
    question: 'How do you remove stubborn ink stains from linen clothes?',
    answer: 'Apply alcohol-based solvent (like rubbing alcohol or hand sanitizer) to the backside of the stain, blot with clean microfiber cloth, wash with heavy-duty detergent under cold cycle, and air dry.'
  },
  {
    question: 'What is the optimal steam temperature for press ironing cotton shirts?',
    answer: 'The optimal temperature setting for 100% cotton garments is between 150°C and 200°C (300°F to 400°F) using heavy steam output to expand fiber structure and release wrinkles safely.'
  }
]
</script>
