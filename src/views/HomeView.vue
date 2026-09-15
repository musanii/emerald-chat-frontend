<script setup>
import { RouterLink } from 'vue-router'

const features = [
  {
    icon: '#',
    title: 'Channels that stay tidy',
    description: 'Public and private spaces with unread badges so nothing important slips past.'
  },
  {
    icon: '💬',
    title: 'Threads without noise',
    description: 'Reply in context, react with a tap, and keep the main channel readable.'
  },
  {
    icon: '👤',
    title: 'Live presence',
    description: 'See exactly who is around before you ask, with real-time status dots.'
  },
  {
    icon: '🛡️',
    title: 'Two-factor security',
    description: 'Add an authenticator app in seconds and protect every sign-in.'
  },
  {
    icon: '⚡',
    title: 'Fast by default',
    description: 'Instant search, drag-and-drop files, and a composer built for speed.'
  },
  {
    icon: '🔒',
    title: 'Private by design',
    description: 'Your conversations stay in your workspace, with strict access rules.'
  }
]
</script>

<template>
  <div class="min-h-screen bg-[#F8FAF9] text-slate-800 font-sans flex flex-col justify-between">
    <!-- Header -->
    <header class="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-[#047857] flex items-center justify-center font-bold text-white text-sm">
          A
        </div>
        <span class="font-bold text-slate-900 tracking-tight">Company ABC</span>
      </div>

      <div class="flex items-center gap-4 text-sm font-medium">
        <RouterLink to="/login" class="text-slate-600 hover:text-slate-900 transition-colors">
          Sign in
        </RouterLink>
        <RouterLink to="/register" class="bg-[#047857] hover:bg-[#064e3b] text-white px-4 py-2 rounded-lg transition-all shadow-sm">
          Get started
        </RouterLink>
      </div>
    </header>

    <!-- Main Hero -->
    <main class="w-full max-w-4xl mx-auto px-6 py-12 flex flex-col items-center text-center">
      <!-- Badge -->
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/60 border border-emerald-200/60 text-[#047857] text-xs font-medium mb-8">
        <span class="w-1.5 h-1.5 rounded-full bg-[#047857]"></span>
        Now with two-factor authentication
      </div>

      <!-- Title -->
      <h1 class="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
        Team chat that keeps <br class="hidden sm:inline"/>
        your work <span class="text-[#047857]">in focus</span>
      </h1>

      <p class="text-slate-500 text-sm sm:text-base max-w-2xl mb-8 leading-relaxed">
        Channels, threads, files, and presence in one quiet workspace. Sign in with Google, Microsoft, or email — and add an extra layer of security whenever you want.
      </p>

      <!-- CTA Buttons -->
      <div class="flex items-center gap-3 mb-4">
        <RouterLink to="/register" class="bg-[#047857] hover:bg-[#064e3b] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2">
          <span>Create your workspace</span>
          <span>&rarr;</span>
        </RouterLink>
        <RouterLink to="/login" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-5 py-2.5 rounded-lg text-sm border border-slate-200 transition-all">
          Sign in
        </RouterLink>
      </div>

      <!-- Micro Badges -->
      <div class="flex items-center gap-6 text-xs text-slate-400 font-medium mb-16">
        <span class="flex items-center gap-1.5"><span class="text-[#047857]">✓</span> Free to try</span>
        <span class="flex items-center gap-1.5"><span class="text-[#047857]">✓</span> No credit card</span>
        <span class="flex items-center gap-1.5"><span class="text-[#047857]">✓</span> Secure by default</span>
      </div>

      <!-- 6 Feature Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left">
        <div v-for="(item, index) in features" :key="index" class="p-5 rounded-xl border border-slate-200 bg-white/70 hover:shadow-sm transition-all">
          <div class="w-8 h-8 rounded-lg bg-emerald-50 text-[#047857] flex items-center justify-center font-bold text-sm mb-3">
            {{ item.icon }}
          </div>
          <h3 class="font-bold text-slate-900 text-sm mb-1">{{ item.title }}</h3>
          <p class="text-slate-500 text-xs leading-relaxed">{{ item.description }}</p>
        </div>
      </div>
    </main>

    <!-- Bottom CTA Banner -->
    <section class="w-full bg-[#F3F6F4] border-t border-slate-200/60 py-12 text-center mt-12">
      <h2 class="text-xl font-bold text-slate-900 mb-2">Bring your team into one calm space</h2>
      <p class="text-xs text-slate-500 mb-6">Set up in minutes. Invite your team, create channels, and get back to the work that matters.</p>
      <RouterLink to="/register" class="inline-flex items-center gap-2 bg-[#047857] hover:bg-[#064e3b] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-all">
        <span>Get started free</span>
        <span>&rarr;</span>
      </RouterLink>
    </section>
  </div>
</template>