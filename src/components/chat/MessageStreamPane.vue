<script setup>
import { ref } from 'vue'
import { useChatStore } from '../../stores/chat'

defineProps({
  threadOpen: Boolean
})

const emit = defineEmits(['toggleThread'])
const chatStore = useChatStore()
const newMessage = ref('')

async function handleSendMessage() {
  if (!newMessage.value.trim() || !chatStore.activeChannel) return
  await chatStore.sendMessage(chatStore.activeChannel.id, newMessage.value)
  newMessage.value = ''
}
</script>

<template>
  <main class="flex-1 flex flex-col justify-between bg-white overflow-hidden">
    <!-- Channel Top Header -->
    <header class="h-14 border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      <div>
        <h2 class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
          <span class="text-slate-400">#</span> {{ chatStore.activeChannel?.name || 'select-channel' }}
        </h2>
        <p class="text-[11px] text-slate-400">{{ chatStore.activeChannel?.description || 'Channel conversation feed' }}</p>
      </div>
      <div class="flex items-center gap-3 text-xs text-slate-500">
        <span>👥 24</span>
        <span>🔍</span>
        <span>🔔</span>
        <button @click="emit('toggleThread')" class="text-slate-400 hover:text-slate-700 font-bold">&gt;</button>
      </div>
    </header>

    <!-- Message Stream -->
    <div class="flex-1 overflow-y-auto p-6 space-y-6">
      <div class="mb-6">
        <div class="w-10 h-10 rounded-xl bg-[#047857] text-white flex items-center justify-center font-bold text-xl mb-3">
          #
        </div>
        <h1 class="text-2xl font-bold text-slate-900">Welcome to #{{ chatStore.activeChannel?.name || 'chat' }}</h1>
        <p class="text-xs text-slate-500 mt-1">This is where the team shares work, decisions, and everything in between.</p>
      </div>

      <div class="relative flex py-2 items-center">
        <div class="flex-grow border-t border-slate-200"></div>
        <span class="flex-shrink mx-4 text-[10px] text-slate-400 font-semibold uppercase">TODAY</span>
        <div class="flex-grow border-t border-slate-200"></div>
      </div>

      <!-- Messages List -->
      <div v-for="msg in chatStore.messages" :key="msg.id" class="flex gap-3 group">
        <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
          {{ msg.user?.name ? msg.user.name.slice(0, 2).toUpperCase() : 'U' }}
        </div>
        <div class="flex-1">
          <div class="flex items-baseline gap-2 mb-1">
            <span class="font-bold text-slate-900 text-xs">{{ msg.user?.name || 'Member' }}</span>
            <span class="text-[10px] text-slate-400">{{ msg.created_at || 'Just now' }}</span>
          </div>
          <p class="text-xs text-slate-700 leading-relaxed">{{ msg.body || msg.text }}</p>

          <div v-if="msg.reply_count" class="mt-2 flex items-center gap-3 text-xs">
            <button @click="emit('toggleThread')" class="text-[#047857] text-xs font-semibold hover:underline">
              {{ msg.reply_count }} replies
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Composer Box -->
    <div class="p-4 border-t border-slate-200">
      <div class="border border-slate-200 rounded-xl p-3 bg-white focus-within:border-[#047857] transition-colors shadow-sm">
        <textarea
          v-model="newMessage"
          @keydown.enter.prevent="handleSendMessage"
          :placeholder="`Message #${chatStore.activeChannel?.name || 'channel'}`"
          rows="2"
          class="w-full text-xs text-slate-800 focus:outline-none resize-none"
        ></textarea>
        <div class="flex items-center justify-between pt-2 border-t border-slate-100">
          <div class="flex items-center gap-3 text-slate-400 text-xs">
            <button>📎</button>
            <button>{ }</button>
            <button>😊</button>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-slate-400">Enter to send</span>
            <button
              @click="handleSendMessage"
              class="bg-[#047857] hover:bg-[#064e3b] text-white p-1.5 rounded-lg text-xs transition-colors"
            >
              ↵
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>