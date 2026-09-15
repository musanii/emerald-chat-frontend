<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '../stores/chat'
import { useAuthStore } from '../stores/auth'
import SidebarPane from '../components/chat/SidebarPane.vue'
import MessageStreamPane from '../components/chat/MessageStreamPane.vue'

const chatStore = useChatStore()
const authStore = useAuthStore()

// Use storeToRefs so activeThreadMessage and threadReplies remain reactive
const { activeThreadMessage, threadReplies, loadingThread, sendingReply } = storeToRefs(chatStore)

const replyText = ref('')

onMounted(async () => {
  await chatStore.fetchChannels()
})

const handleSendReply = async () => {
  if (!replyText.value.trim()) return
  const text = replyText.value
  replyText.value = ''
  await chatStore.sendThreadReply(text)
}
</script>

<template>
  <div class="h-screen w-screen flex bg-white font-sans overflow-hidden text-slate-800">
    <!-- Pane 1: Deep Green Sidebar -->
    <SidebarPane />

    <!-- Pane 2: Main Stream Feed -->
    <MessageStreamPane />

    <!-- Pane 3: Dynamic Right Thread Drawer -->
    <aside 
      v-if="activeThreadMessage" 
      class="w-80 border-l border-slate-200 bg-[#F8FAF9] flex flex-col justify-between shrink-0"
    >
      <!-- Header -->
      <header class="h-14 border-b border-slate-200 px-4 flex items-center justify-between">
        <div class="flex gap-4 text-xs font-bold">
          <button class="text-slate-900 border-b-2 border-[#047857] pb-4 pt-4">Thread</button>
          <button class="text-slate-400 hover:text-slate-700 pb-4 pt-4">Details</button>
        </div>
        <button @click="chatStore.closeThread()" class="text-slate-400 hover:text-slate-700 text-xs">✕</button>
      </header>

      <!-- Thread Stream -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- Parent Message -->
        <div class="pb-4 border-b border-slate-200">
          <div class="flex items-center gap-2 mb-1">
            <span class="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
              {{ activeThreadMessage.user?.name?.charAt(0) || 'U' }}
            </span>
            <span class="font-bold text-slate-900 text-xs">{{ activeThreadMessage.user?.name || 'Unknown' }}</span>
            <span class="text-[10px] text-slate-400">
              {{ new Date(activeThreadMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
            </span>
          </div>
          <p class="text-xs text-slate-700 leading-relaxed pl-8">
            {{ activeThreadMessage.body }}
          </p>
        </div>

        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {{ threadReplies.length }} {{ threadReplies.length === 1 ? 'reply' : 'replies' }}
        </div>

        <!-- Loading state -->
        <div v-if="loadingThread" class="text-xs text-slate-400 py-2">
          Loading replies...
        </div>

        <!-- Dynamic Replies List -->
        <div 
          v-else 
          v-for="reply in threadReplies" 
          :key="reply.id" 
          class="flex gap-2.5 text-xs"
        >
          <span class="w-6 h-6 rounded-full bg-slate-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
            {{ reply.user?.name?.charAt(0) || 'U' }}
          </span>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-900 text-xs">{{ reply.user?.name || 'User' }}</span>
              <span class="text-[9px] text-slate-400">
                {{ reply.created_at ? new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '' }}
              </span>
            </div>
            <p class="text-slate-600 text-xs mt-0.5 leading-relaxed">{{ reply.body }}</p>
          </div>
        </div>
      </div>

      <!-- Thread Input Box -->
      <div class="p-3 border-t border-slate-200 bg-white">
        <form @submit.prevent="handleSendReply" class="flex items-center gap-2">
          <input 
            v-model="replyText"
            type="text" 
            placeholder="Reply..." 
            :disabled="sendingReply"
            class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#047857] disabled:opacity-50"
          />
          <button 
            type="submit"
            :disabled="sendingReply || !replyText.trim()"
            class="bg-[#047857] text-white p-1.5 rounded-lg text-xs disabled:opacity-50"
          >
            &gt;
          </button>
        </form>
      </div>
    </aside>
  </div>
</template>