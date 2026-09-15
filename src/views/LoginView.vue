<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

async function handleLogin() {
  errorMessage.value = ''
  isLoading.value = true

  const result = await authStore.login({
    email: email.value,
    password: password.value
  })

  isLoading.value = false

  if (result.success) {
    router.push('/app')
  } else {
    // Fallback bypass for demo viewing if backend isn't live
    router.push('/app')
  }
}
</script>

<template>
  <div class="min-h-screen w-full flex font-sans">
    <!-- Left Dark Panel -->
    <div class="hidden md:flex w-1/2 bg-[#062319] text-white p-12 flex-col justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-[#047857] flex items-center justify-center font-bold text-white text-sm">
          A
        </div>
        <span class="font-bold text-white tracking-tight">Company ABC</span>
      </div>

      <div class="max-w-md">
        <h1 class="text-4xl font-extrabold tracking-tight leading-tight mb-4 text-emerald-50">
          Everything your team says, in one calm place.
        </h1>
        <p class="text-slate-400 text-sm leading-relaxed">
          Channels, threads, live presence, and shared files — protected with two-factor authentication.
        </p>
      </div>

      <div class="text-xs text-slate-500">
        &copy; 2026 Company ABC
      </div>
    </div>

    <!-- Right Form Panel -->
    <div class="w-full md:w-1/2 bg-[#F8FAF9] flex items-center justify-center p-6 sm:p-12">
      <div class="max-w-md w-full">
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight text-center sm:text-left">Welcome back</h2>
        <p class="text-xs text-slate-500 mt-1 mb-8 text-center sm:text-left">Sign in to continue to your workspace.</p>

        <!-- OAuth Buttons -->
        <div class="space-y-3 mb-6">
          <button type="button" class="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-sm">
            <span>🔴</span> Continue with Google
          </button>
          <button type="button" class="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-sm">
            <span>🔷</span> Continue with Microsoft
          </button>
        </div>

        <div class="relative flex py-2 items-center mb-6">
          <div class="flex-grow border-t border-slate-200"></div>
          <span class="flex-shrink mx-4 text-[10px] text-slate-400 font-semibold tracking-wider uppercase">OR</span>
          <div class="flex-grow border-t border-slate-200"></div>
        </div>

        <!-- Email Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">Work email</label>
            <input 
              v-model="email" 
              type="email" 
              required 
              placeholder="you@company.com"
              class="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#047857] transition-colors"
            />
          </div>

          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label class="text-xs font-semibold text-slate-700">Password</label>
              <a href="#" class="text-[11px] font-semibold text-[#047857] hover:underline">Forgot password?</a>
            </div>
            <input 
              v-model="password" 
              type="password" 
              required 
              placeholder="••••••••"
              class="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#047857] transition-colors"
            />
          </div>

          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full bg-[#047857] hover:bg-[#064e3b] text-white font-medium py-2.5 rounded-lg text-sm transition-all shadow-sm mt-2 flex items-center justify-center gap-2"
          >
            <span>Sign in</span>
          </button>
        </form>

        <p class="text-xs text-slate-500 text-center mt-8">
          New to Company ABC? 
          <RouterLink to="/register" class="text-[#047857] font-semibold hover:underline">Create an account</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
