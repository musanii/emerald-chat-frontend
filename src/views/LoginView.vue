<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')

function handleLogin() {
  // We will hook this up to our Sanctum API state store next!
  if (email.value && password.value) {
    router.push('/app')
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
      <!-- Logo Header -->
      <div class="flex flex-col items-center mb-8">
        <div class="w-12 h-12 rounded-xl bg-jungle-accent flex items-center justify-center font-bold text-jungle-900 text-2xl mb-3 shadow-lg shadow-jungle-accent/20">
          E
        </div>
        <h2 class="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
        <p class="text-xs text-slate-400 mt-1">Sign in to your Emerald Chat account</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
          <input 
            v-model="email"
            type="email" 
            required 
            placeholder="you@company.com" 
            class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
          <input 
            v-model="password"
            type="password" 
            required 
            placeholder="••••••••" 
            class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <button 
          type="submit" 
          class="w-full bg-jungle-accent hover:bg-emerald-400 text-jungle-900 font-bold py-2.5 rounded-lg text-sm transition-all shadow-md shadow-jungle-accent/20 mt-2"
        >
          Sign In
        </button>
      </form>
    </div>
  </div>
</template>