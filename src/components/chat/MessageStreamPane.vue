<script setup>
import { ref, computed, nextTick, watch } from "vue";
import { useChatStore } from "../../stores/chat";
import { useAuthStore } from "../../stores/auth";
import { getUserColor, getUserInitials } from "../../utils/colors";

const authStore = useAuthStore();
const chatStore = useChatStore();

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Throttle typing API calls to avoid spamming the backend
let typingTimeout = null;
function handleTypingInput() {
  if (typingTimeout) return;
  chatStore.sendTypingIndicator();
  typingTimeout = setTimeout(() => {
    typingTimeout = null;
  }, 2000);
}

const typingLabel = computed(() => {
  const usersMap = chatStore.typingUsers;
  const names =
    usersMap && typeof usersMap.values === "function"
      ? Array.from(usersMap.values())
      : [];

  if (names.length === 0) return "";
  if (names.length === 1) return `${names[0]} is typing...`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
  return `${names[0]} and ${names.length - 1} others are typing...`;
});

const newMessageText = ref("");
const messageContainer = ref(null);

// Autoscroll to bottom on new messages
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
  console.log("--- Send triggered ---", {
    text: newMessageText.value,
    activeChannel: chatStore.activeChannel,
    isSending: chatStore.sending,
  });

  if (!chatStore.activeChannel) {
    console.warn("No active channel selected!");
    return;
  }

  if (!newMessageText.value.trim() || chatStore.sending) return;

  const text = newMessageText.value;
  newMessageText.value = "";
  await chatStore.sendMessage(text);
  scrollToBottom();
}
</script>

<template>
  <main
    class="flex-1 flex flex-col bg-[#0B1215] text-slate-100 overflow-hidden"
  >
    <!-- Channel Header -->
    <header
      class="h-14 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-900/40"
    >
      <div class="flex items-center space-x-2">
        <span class="text-emerald-400 font-bold text-xl">#</span>
        <h2 class="font-semibold text-slate-100">
          {{ chatStore.activeChannel?.name || "Select a channel" }}
        </h2>
      </div>
    </header>

    <div ref="messageContainer" class="flex-1 overflow-y-auto p-6 space-y-4">
      <div
        v-for="msg in chatStore.messages"
        :key="msg.id"
        class="group relative flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-900/60 transition-colors"
        :class="{
          'opacity-60': msg.status === 'sending',
          'border border-rose-500/40 bg-rose-500/5': msg.status === 'failed',
        }"
      >
        <!-- User Avatar with Dynamic Color -->
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border"
          :class="[
            getUserColor(msg.user).badgeBg,
            getUserColor(msg.user).text,
            getUserColor(msg.user).border,
          ]"
        >
          {{ getUserInitials(msg.user?.name) }}
        </div>

        <!-- Message Body & Metadata -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2">
            <span
              class="font-semibold text-sm"
              :class="getUserColor(msg.user).text"
            >
              {{ msg.user?.name || "Unknown User" }}
            </span>
            <span class="text-xs text-slate-500">
              {{ formatTime(msg.created_at) }}
            </span>

            <!-- Status Indicators -->
            <span
              v-if="msg.status === 'sending'"
              class="text-xs text-amber-400 animate-pulse flex items-center gap-1"
            >
              <svg class="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                  fill="none"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              sending...
            </span>

            <span
              v-if="msg.status === 'failed'"
              class="text-xs text-rose-400 flex items-center gap-1"
            >
              Failed to send
              <button
                @click="chatStore.retryMessage(msg)"
                class="underline hover:text-rose-300 font-medium ml-1"
              >
                Retry
              </button>
            </span>
          </div>

          <p
            class="text-slate-300 text-sm mt-1 whitespace-pre-wrap leading-relaxed"
          >
            {{ msg.body }}
          </p>

          <!-- Reply Counter / Thread Opener -->
          <button
            v-if="msg.status !== 'sending' && msg.status !== 'failed'"
            @click="chatStore.openThread(msg)"
            class="mt-2 inline-flex items-center space-x-1.5 text-xs text-emerald-400/80 hover:text-emerald-300 hover:underline"
          >
            <svg
              class="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <span>{{
              msg.replies_count > 0
                ? `${msg.replies_count} ${
                    msg.replies_count === 1 ? "reply" : "replies"
                  }`
                : "Reply in thread"
            }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Message Input Bar -->
    <div class="p-4 border-t border-slate-800/80 bg-slate-900/20">
      <form @submit.prevent="handleSendMessage" class="flex items-center gap-2">
        <input
          v-model="newMessageText"
          @input="handleTypingInput"
          type="text"
          placeholder="Type a message..."
          class="flex-1 bg-slate-900 text-slate-100 text-sm rounded-lg px-4 py-3 border border-slate-800 focus:outline-none focus:border-emerald-500/50"
          :disabled="!chatStore.activeChannel"
        />
        <button
          type="submit"
          :disabled="!newMessageText.trim() || !chatStore.activeChannel || chatStore.sending"
          class="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm px-5 py-3 rounded-lg transition-colors disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  </main>
</template>