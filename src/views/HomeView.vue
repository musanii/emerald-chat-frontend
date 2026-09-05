<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
    <div class="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
    <!-- Header / Navbar -->
    <header class="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-jungle-accent flex items-center justify-center font-bold text-jungle-900 text-lg shadow-lg shadow-jungle-accent/20">
          E
        </div>
        <span class="text-xl font-bold tracking-tight">Emerald Chat</span>
      </div>
      <div class="flex items-center gap-4">
        <RouterLink 
          to="/login" 
          class="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
        >
          Sign In
        </RouterLink>
        <RouterLink 
          to="/login" 
          class="text-sm font-semibold bg-jungle-accent hover:bg-emerald-400 text-jungle-900 px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-jungle-accent/20"
        >
          Get Started
        </RouterLink>
      </div>
    </header>

    <!-- Hero Section -->
    <main class="flex-1 max-w-5xl w-full mx-auto px-6 flex flex-col items-center justify-center text-center py-20">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-jungle-900/80 border border-jungle-700/50 text-emerald-400 text-xs font-medium mb-8">
        <span class="w-2 h-2 rounded-full bg-jungle-accent animate-pulse"></span>
        Closed-Loop Team Communication Engine
      </div>
      
      <h1 class="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight mb-6">
        Secure, context-first chat for <span class="text-emerald-400">modern teams.</span>
      </h1>
      
      <p class="text-lg text-slate-400 max-w-2xl leading-relaxed mb-10">
        Streamlined real-time messaging with structured department streams, threaded discussions, and seamless API integration.
      </p>

      <div class="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <RouterLink 
          to="/login" 
          class="w-full sm:w-auto px-8 py-3.5 bg-jungle-accent hover:bg-emerald-400 text-jungle-900 font-bold rounded-xl transition-all shadow-lg shadow-jungle-accent/25 text-center"
        >
          Access Workspace
        </RouterLink>
      </div>
    </main>

    <footer class="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
      &copy; {{ new Date().getFullYear() }} Emerald Chat Engine. All rights reserved.
    </footer>
  </div>

</template>