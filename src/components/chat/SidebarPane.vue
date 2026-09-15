<script setup>
import { computed } from 'vue'
import { useChatStore } from '../../stores/chat'
import { useAuthStore } from '../../stores/auth'

const chatStore = useChatStore()
const authStore = useAuthStore()

// Filter channels based on type from the API payload
const publicChannels = computed(() => {
  return Array.isArray(chatStore.channels)
    ? chatStore.channels.filter(c => c?.type === 'public')
    : []
})

const privateChannels = computed(() => {
  return Array.isArray(chatStore.channels)
    ? chatStore.channels.filter(c => c?.type === 'private')
    : []
})

const directChannels = computed(() => {
  return Array.isArray(chatStore.channels)
    ? chatStore.channels.filter(c => c?.type === 'direct')
    : []
})

function handleSelectChannel(channel) {
  chatStore.activeChannel = channel
  chatStore.fetchMessages(channel.id)
}
</script>

<template>
  <aside class="w-64 bg-[#062319] text-slate-300 flex flex-col justify-between shrink-0 border-r border-[#083526]">
    <div>
      <!-- Workspace Switcher Header -->
      <div class="p-3 border-b border-[#0A402E] flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-[#047857] text-white flex items-center justify-center font-bold text-xs">
            N
          </div>
          <div>
            <div class="font-bold text-white text-xs tracking-tight">NexCore Systems</div>
            <div class="text-[10px] text-slate-400">Product workspace</div>
          </div>
        </div>
        <span class="text-xs text-slate-400">⌄</span>
      </div>

      <!-- Public Channels -->
      <div v-if="publicChannels?.length" class="px-3 pt-4">
        <div class="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          <span>Public Channels</span>
          <button class="hover:text-white">+</button>
        </div>
        <div class="space-y-0.5">
          <button
            v-for="channel in publicChannels"
            :key="channel.id"
            @click="handleSelectChannel(channel)"
            :class="[
              'w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-colors',
              chatStore.activeChannel?.id === channel.id
                ? 'bg-[#047857] text-white font-medium'
                : 'text-slate-300 hover:bg-[#0A3D2C]'
            ]"
          >
            <div class="flex items-center gap-2 truncate">
              <span class="text-slate-400 font-mono">#</span>
              <span class="truncate">{{ channel.name }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Private Channels -->
      <div v-if="privateChannels?.length" class="px-3 pt-4">
        <div class="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          <span>Private Channels</span>
          <button class="hover:text-white">+</button>
        </div>
        <div class="space-y-0.5">
          <button
            v-for="channel in privateChannels"
            :key="channel.id"
            @click="handleSelectChannel(channel)"
            :class="[
              'w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-colors',
              chatStore.activeChannel?.id === channel.id
                ? 'bg-[#047857] text-white font-medium'
                : 'text-slate-300 hover:bg-[#0A3D2C]'
            ]"
          >
            <div class="flex items-center gap-2 truncate">
              <span class="text-xs">🔒</span>
              <span class="truncate">{{ channel.name }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Direct Messages -->
      <div v-if="directChannels?.length" class="px-3 pt-4">
        <div class="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          <span>Direct Messages</span>
          <button class="hover:text-white">+</button>
        </div>
        <div class="space-y-0.5">
          <button
            v-for="channel in directChannels"
            :key="channel.id"
            @click="handleSelectChannel(channel)"
            :class="[
              'w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-colors',
              chatStore.activeChannel?.id === channel.id
                ? 'bg-[#047857] text-white font-medium'
                : 'text-slate-300 hover:bg-[#0A3D2C]'
            ]"
          >
            <div class="flex items-center gap-2 truncate">
              <span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
              <span class="truncate">{{ channel.name }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Active User Footer -->
    <div class="p-3 border-t border-[#0A402E] flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-md bg-[#047857] text-white flex items-center justify-center font-bold text-xs">
          {{ authStore.user?.name ? authStore.user.name.slice(0, 2).toUpperCase() : 'ME' }}
        </div>
        <div>
          <div class="text-xs font-bold text-white">{{ authStore.user?.name || 'User' }}</div>
          <div class="text-[10px] text-emerald-400 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Online
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>