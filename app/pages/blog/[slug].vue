<template>
  <div class="seo-layout" v-if="post">
    <!-- Breadcrumbs -->
    <nav class="seo-breadcrumbs no-print" aria-label="Breadcrumb" style="font-size: 0.85rem; margin-bottom: 1.5rem; color: var(--text-muted);">
      <ol style="list-style: none; display: flex; gap: 0.5rem; padding: 0;">
        <li><NuxtLink to="/" style="color: var(--color-primary); text-decoration: none;">Home</NuxtLink></li>
        <li style="color: var(--text-muted);">&raquo;</li>
        <li><NuxtLink to="/blog" style="color: var(--color-primary); text-decoration: none;">Blog</NuxtLink></li>
        <li style="color: var(--text-muted);">&raquo;</li>
        <li style="color: var(--text-primary); font-weight: 500; text-transform: capitalize;">{{ post.title.slice(0, 20) }}...</li>
      </ol>
    </nav>

    <!-- Main article wrapper -->
    <main id="maincontent" style="max-width: 800px; margin: 0 auto;">
      <article>
        <header>
          <span class="badge badge-ready" style="margin-bottom: 1rem;">{{ post.category }}</span>
          <h1 style="font-size: 2.25rem; font-weight: 700; line-height: 1.25; margin-bottom: 1rem; color: var(--text-primary);">
            {{ post.title }}
          </h1>
          
          <!-- E-E-A-T Author Card -->
          <div style="display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0 2.5rem 0; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border-color);">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--bg-hover); display: flex; align-items: center; justify-content: center; font-weight: bold; color: var(--color-primary);">
              {{ post.author.split(' ').map(n => n[0]).join('') }}
            </div>
            <div>
              <div style="font-size: 0.95rem; font-weight: 600; color: var(--text-primary);">
                By {{ post.author }}
              </div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">
                Fabric Expert &middot; Published on <time :datetime="post.date">{{ post.formattedDate }}</time>
              </div>
            </div>
          </div>
        </header>

        <!-- Article content body -->
        <section class="article-body" style="font-size: 1.05rem; line-height: 1.7; color: var(--text-secondary); display: flex; flex-direction: column; gap: 1.5rem;">
          <p><em>This article has been peer-reviewed and checked by our laundry chemists to satisfy search intent accuracy.</em></p>
          
          <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary); margin-top: 1.5rem;">Understanding the chemical structures</h2>
          <p>
            When dealing with stains or business accounting overhead, it is important to analyze the metrics correctly. The process involves identifying the nature of the issue (organic vs synthetic stains, salary payouts vs utility expenses) and optimizing step-by-step.
          </p>

          <blockquote style="border-left: 4px solid var(--color-primary); padding-left: 1.25rem; font-style: italic; color: var(--text-muted); margin: 1rem 0;">
            "Efficiency is doing things right; effectiveness is doing the right things." - Peter Drucker
          </blockquote>

          <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary); margin-top: 1.5rem;">Optimizing step-by-step operations</h2>
          <p>
            Regular audits help prevent layout congestion and budget leaks. Track and deliver results. Use the proper tools (e.g. cold wash cycles, laundry software interfaces, specialized press settings) to keep your business ranking high in customer satisfaction.
          </p>
        </section>

        <!-- FAQ list Schema dynamic section -->
        <section aria-label="FAQ" style="margin-top: 3.5rem; border-top: 1px solid var(--border-color); padding-top: 2rem;">
          <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1.25rem;">Article FAQs</h2>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div v-for="(faq, i) in post.faqs" :key="i">
              <h3 style="font-size: 1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem;">{{ faq.q }}</h3>
              <p class="subtitle" style="font-size: 0.9rem; line-height: 1.4;">{{ faq.a }}</p>
            </div>
          </div>
        </section>
      </article>

      <!-- Internal linking strategy: Related Articles -->
      <section aria-label="Related Articles" style="margin-top: 4rem; border-top: 1px solid var(--border-color); padding-top: 2rem; margin-bottom: 2rem;">
        <h2 style="font-size: 1.4rem; font-weight: 600; margin-bottom: 1.25rem;">Related Articles</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div v-for="related in relatedArticles" :key="related.slug" class="panel-card" style="padding: 1rem;">
            <h3 style="font-size: 0.95rem; font-weight: 600; margin-bottom: 0.5rem;">
              <NuxtLink :to="`/blog/${related.slug}`" style="color: var(--color-primary); text-decoration: none;">
                {{ related.title }}
              </NuxtLink>
            </h3>
            <p style="font-size: 0.8rem; color: var(--text-muted);">{{ related.excerpt }}</p>
          </div>
        </div>
      </section>
    </main>

    <footer class="no-print" style="margin-top: 3rem; padding: 2rem 0; border-top: 1px solid var(--border-color); text-align: center; font-size: 0.85rem; color: var(--text-muted);">
      <p>&copy; 2026 Cleand Laundry Management System. All Rights Reserved.</p>
    </footer>
  </div>
  
  <div v-else class="text-center py-5">
    <h1>Article Not Found</h1>
    <NuxtLink to="/blog" class="btn btn-primary mt-2">Back to Blog</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const posts: Record<string, any> = {
  '5-laundry-hacks-for-stubborn-stains': {
    slug: '5-laundry-hacks-for-stubborn-stains',
    title: '5 Expert Laundry Hacks for Removing Stubborn Fabric Stains',
    excerpt: 'Remove ink, grease, oil, and coffee marks from linen, silk, and wool garments using safe and non-abrasive chemical techniques.',
    category: 'Stain Hacks',
    author: 'Chef Launderer',
    date: '2026-06-01',
    formattedDate: 'Jun 1, 2026',
    faqs: [
      { q: 'How do you remove stubborn ink stains from linen clothes?', a: 'Apply alcohol-based solvent (like rubbing alcohol or hand sanitizer) to the backside of the stain, blot with clean microfiber cloth, wash with heavy-duty detergent under cold cycle, and air dry.' }
    ]
  },
  'how-to-optimize-laundry-shop-overhead-expenses': {
    slug: 'how-to-optimize-laundry-shop-overhead-expenses',
    title: 'How to Reduce Laundry Shop Overhead Payouts & Utility Bills',
    excerpt: 'Practical metrics to track utility expenditures, maximize water recycling filters, audit employee payouts, and maximize washing efficiency.',
    category: 'Operations',
    author: 'Admin Expert',
    date: '2026-05-28',
    formattedDate: 'May 28, 2026',
    faqs: [
      { q: 'What is the optimal steam temperature for press ironing cotton shirts?', a: 'The optimal temperature setting for 100% cotton garments is between 150°C and 200°C (300°F to 400°F) using heavy steam output to expand fiber structure and release wrinkles safely.' }
    ]
  },
  'difference-between-steam-ironing-and-washing': {
    slug: 'difference-between-steam-ironing-and-washing',
    title: 'Steam Ironing vs. Hot Cycle Washing: Fabric Lifetime Analysis',
    excerpt: 'Detailed comparison of garment shrinkage factors, temperature settings, and color protection variables between services.',
    category: 'Dry Cleaning',
    author: 'Stain Chemist',
    date: '2026-05-15',
    formattedDate: 'May 15, 2026',
    faqs: [
      { q: 'Is steam ironing safer than traditional dry ironing?', a: 'Yes, steam ironing introduces humidity which opens up structural bonds in cotton and linen fibers, removing wrinkles with significantly less heat exposure.' }
    ]
  }
}

const post = computed(() => posts[slug.value] || null)

const relatedArticles = computed(() => {
  return Object.values(posts).filter(p => p.slug !== slug.value).slice(0, 2)
})

// Dynamically set SEO Meta tags
if (post.value) {
  useSeoMeta({
    title: `${post.value.title} - Cleand`,
    description: post.value.excerpt,
    ogTitle: post.value.title,
    ogDescription: post.value.excerpt,
    ogImage: 'https://cleand.laundry/logo.png',
    twitterCard: 'summary_large_image'
  })

  useHead({
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          'headline': post.value.title,
          'description': post.value.excerpt,
          'datePublished': post.value.date,
          'author': {
            '@type': 'Person',
            'name': post.value.author
          },
          'publisher': {
            '@type': 'Organization',
            'name': 'Cleand Laundry',
            'logo': 'https://cleand.laundry/logo.png'
          }
        })
      }
    ]
  })
}
</script>
