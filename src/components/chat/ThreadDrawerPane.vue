<script setup>
import { ref, watch, nextTick } from 'vue';
import { useChatStore } from '../../stores/chat';
import { getUserColor, getUserInitials } from '../../utils/colors';


const chatStore = useChatStore()


const replyText = ref("")
const replyContainer = ref(null)

function formatTime(timestamp){
  if(!timestamp) return "";
  const date = new Date(timestamp)
  return date.toLocaleDateString([],{hour:"2-digit", minute:"2-digit"});
}

const scrollBottom = async () => {
  await nextTick();
  if(replyContainer.value){
    replyContainer.value.scrollTop = replyContainer.value.ScrollHeight;
  }
};

//Scroll to bottom whenever thread replies change
watch(
  () => chatStore.activeThreadReplies,
  () =>{
    scrollBottom();
  },
  {deep:true},
);

async function handleSendReply(){
  if(!replyText.value.trim() || chatStore.sendingReply)return;

  const text = replyText.value;
  replyText.value ="";
  await chatStore.sendThreadReply(text)
  scrollBottom()
}

</script>

<template>
  <aside
    v-if="chatStore.activeThreadMessage"
    class="w-80 md:w-96 border-l border-slate-800/80 bg-[#0d1519] flex flex-col h-full shadow-2xl relative z-20"
  >
    <!-- Drawer Header -->
    <header
      class="h-14 border-b border-slate-800/80 px-4 flex items-center justify-between bg-slate-900/40"
    >
      <div class="flex items-center space-x-2">
        <h3 class="font-semibold text-slate-100 text-sm">Thread</h3>
        <span
          v-if="chatStore.activeChannel"
          class="text-xs text-slate-400 truncate max-w-[140px]"
        >
          #{{ chatStore.activeChannel.name }}
        </span>
      </div>
      <button
        @click="chatStore.closeThread()"
        class="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800/60 transition-colors"
        title="Close thread"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </header>

    <!-- Drawer Body -->
    <div ref="replyContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- Parent Message Banner -->
      <div
        class="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2"
      >
        <div class="flex items-center space-x-2">
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border"
            :class="[
              getUserColor(chatStore.activeThreadMessage.user)?.badgeBg || 'bg-slate-800',
              getUserColor(chatStore.activeThreadMessage.user)?.text || 'text-slate-200',
              getUserColor(chatStore.activeThreadMessage.user)?.border || 'border-slate-700',
            ]"
          >
            {{ getUserInitials(chatStore.activeThreadMessage.user?.name) }}
          </div>
          <span
            class="font-semibold text-xs"
            :class="getUserColor(chatStore.activeThreadMessage.user)?.text || 'text-slate-200'"
          >
            {{ chatStore.activeThreadMessage.user?.name || "Unknown User" }}
          </span>
          <span class="text-[10px] text-slate-500">
            {{ formatTime(chatStore.activeThreadMessage.created_at) }}
          </span>
        </div>
        <p class="text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
          {{ chatStore.activeThreadMessage.body }}
        </p>
      </div>

      <!-- Divider -->
      <div class="flex items-center space-x-2 py-1">
        <div class="h-px bg-slate-800 flex-1"></div>
        <span class="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          {{ chatStore.activeThreadReplies.length }}
          {{ chatStore.activeThreadReplies.length === 1 ? 'Reply' : 'Replies' }}
        </span>
        <div class="h-px bg-slate-800 flex-1"></div>
      </div>

      <!-- Thread Replies List -->
      <div class="space-y-3">
        <div
          v-for="reply in chatStore.activeThreadReplies"
          :key="reply.id"
          class="flex items-start space-x-2.5 group"
        >
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border mt-0.5"
            :class="[
              getUserColor(reply.user)?.badgeBg || 'bg-slate-800',
              getUserColor(reply.user)?.text || 'text-slate-200',
              getUserColor(reply.user)?.border || 'border-slate-700',
            ]"
          >
            {{ getUserInitials(reply.user?.name) }}
          </div>
          <div class="flex-1 min-w-0 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/50">
            <div class="flex items-center space-x-2">
              <span
                class="font-semibold text-xs"
                :class="getUserColor(reply.user)?.text || 'text-slate-200'"
              >
                {{ reply.user?.name || "Unknown User" }}
              </span>
              <span class="text-[10px] text-slate-500">
                {{ formatTime(reply.created_at) }}
              </span>
            </div>
            <p class="text-slate-300 text-xs mt-1 whitespace-pre-wrap leading-relaxed">
              {{ reply.body }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Reply Input Bar -->
    <div class="p-3 border-t border-slate-800/80 bg-slate-900/30">
      <form @submit.prevent="handleSendReply" class="flex items-center gap-2">
        <input
          v-model="replyText"
          type="text"
          placeholder="Reply in thread..."
          class="flex-1 bg-slate-900 text-slate-100 text-xs rounded-lg px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-emerald-500/50"
          :disabled="chatStore.sendingReply"
        />
        <button
          type="submit"
          :disabled="!replyText.trim() || chatStore.sendingReply"
          class="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-3.5 py-2.5 rounded-lg transition-colors disabled:opacity-40"
        >
          Reply
        </button>
      </form>
    </div>
  </aside>
</template>