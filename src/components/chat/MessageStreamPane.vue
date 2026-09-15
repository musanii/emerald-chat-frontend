<script setup>
import { ref,computed, nextTick, watch } from "vue";
import { useChatStore } from "../../stores/chat";
import { useAuthStore } from "../../stores/auth";

const authStore = useAuthStore();
const chatStore = useChatStore();

//Throttle typing API calls to avoid spamming the backend
let typingTimeout = null
function handleTypingInput(){
  if(typingTimeout) return
  chatStore.sendTypingIndicator()
  typingTimeout = setTimeout(()=>{
    typingTimeout=null
  },2000)
}

const typingLabel = computed(() => {
  // Defensive check: fallback to an empty array if typingUsers is undefined or not a Map
  const usersMap = chatStore.typingUsers
  const names = usersMap && typeof usersMap.values === 'function' 
    ? Array.from(usersMap.values()) 
    : []

  if (names.length === 0) return ''
  if (names.length === 1) return `${names[0]} is typing...`
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`
  return `${names[0]} and ${names.length - 1} others are typing...`
})

const newMessageText = ref("");
const messageContainer = ref(null);

//Autoscroll to bottom on new messages
const scrollToBottom = async () => {
  await nextTick();

  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

watch(
  () => chatStore.messages,
  () => {
    scrollToBottom();
  },
  { deep: true },
);

async function handleSendMessage() {
  console.log('--- Send triggered ---', {
    text: newMessageText.value,
    activeChannel: chatStore.activeChannel,
    isSending: chatStore.sending
  })

  if (!chatStore.activeChannel) {
    console.warn('No active channel selected!')
    return
  }

  if (!newMessageText.value.trim() || chatStore.sending) return

  const text = newMessageText.value
  newMessageText.value = ''
  await chatStore.sendMessage(text)
  scrollToBottom()
}
</script>

<template>
  <main
    class="flex-1 flex flex-col bg-[#0B1215] text-slate-100 overflow-hidden"
  >
    <!-- Channel Header -->
    <header
      class="h-14 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 bg-[#0E171B]"
    >
      <div v-if="chatStore.activeChannel" class="flex items-center gap-3">
        <span class="text-slate-400 font-mono text-lg">
          {{
            chatStore.activeChannel.type === "private"
              ? "🔒"
              : chatStore.activeChannel.type === "direct"
                ? "👤"
                : "#"
          }}
        </span>
        <div>
          <h2 class="font-bold text-sm text-white flex items-center gap-2">
            {{ chatStore.activeChannel.name }}
            <span
              class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono"
            >
              {{ chatStore.activeChannel.type }}
            </span>
          </h2>
          <p class="text-xs text-slate-400 truncate max-w-md">
            {{ chatStore.activeChannel.description || "No topic set" }}
          </p>
        </div>
      </div>
      <div v-else class="text-sm text-slate-400">Select a channel</div>
    </header>

    <!-- Messages Container -->
    <div ref="messageContainer" class="flex-1 overflow-y-auto p-6 space-y-4">
      <div
        v-if="!chatStore.activeChannel"
        class="h-full flex items-center justify-center text-slate-500 text-sm"
      >
        Select a channel from the sidebar to view messages.
      </div>

      <div
        v-else-if="chatStore.messages.length === 0"
        class="h-full flex items-center justify-center text-slate-500 text-sm"
      >
        No messages yet. Send the first message below!
      </div>

      <div
        v-for="msg in chatStore.messages"
        :key="msg.id"
        class="flex items-start gap-3 group hover:bg-[#121D22] p-2 -mx-2 rounded-lg transition-colors"
      >
        <div
          class="w-8 h-8 rounded bg-[#047857] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5"
        >
          {{ msg.user?.name ? msg.user.name.slice(0, 2).toUpperCase() : "U" }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline gap-2">
            <span class="text-xs font-semibold text-slate-200">
              {{ msg.user?.name || "Unknown User" }}
            </span>
            <span class="text-[10px] text-slate-500">
              {{
                new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }}
            </span>
          </div>
          <p
            class="text-xs text-slate-300 mt-1 whitespace-pre-wrap break-words"
          >
            {{ msg.body }}
          </p>
        </div>
      </div>
    </div>

    <!-- Message Input Bar -->
    <div class="p-4 border-t border-slate-800 bg-[#0E171B] shrink-0">
      <!-- Active Typing Indicator Banner -->
      <div v-if="typingLabel" class="px-6 py-1 text-[11px] text-emerald-400 font-mono flex items-center gap-2">
        <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        {{ typingLabel }}
      </div>
      <form @submit.prevent="handleSendMessage" class="flex items-center gap-2">
        <input
          v-model="newMessageText"
          @input="handleTypingInput"
          @keydown.enter.prevent="handleSendMessage"
          type="text"
          :placeholder="
            chatStore.activeChannel
              ? `Message #${chatStore.activeChannel.name}`
              : 'Select a channel...'
          "
          :disabled="!chatStore.activeChannel || chatStore.sending"
          class="flex-1 bg-[#162228] border border-slate-700/60 rounded-lg px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#047857] transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          :disabled="!newMessageText.trim() || chatStore.sending"
          class="bg-[#047857] hover:bg-[#059669] text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  </main>
</template>
