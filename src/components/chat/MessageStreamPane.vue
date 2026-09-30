<script setup>
import { ref, computed, nextTick, watch } from "vue";
import { useChatStore } from "../../stores/chat";
import { useAuthStore } from "../../stores/auth";
import { getUserColor, getUserInitials } from "../../utils/colors";

const authStore = useAuthStore();
const chatStore = useChatStore();

// Input State
const messageText = ref("");
const attachments = ref([]);
const isUploading = ref(false);
const fileInput = ref(null);
const messageContainer = ref(null);

// Attachment Helpers
function triggerFileInput() {
  fileInput.value?.click();
}

async function handleFileSelect(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  isUploading.value = true;
  try {
    for (const file of files) {
      const uploaded = await chatStore.uploadAttachment(file);
      attachments.value.push(uploaded);
    }
  } catch (error) {
    alert("Failed to upload attachment");
  } finally {
    isUploading.value = false;
    if (fileInput.value) fileInput.value.value = "";
  }
}

function removeAttachment(index) {
  attachments.value.splice(index, 1);
}

// Utility Helpers
function formatTime(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Typing Indicator Throttling
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

// Auto-scroll to bottom on new messages
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
  if (!chatStore.activeChannel) return;

  const hasText = messageText.value.trim().length > 0;
  const hasAttachments = attachments.value.length > 0;

  if ((!hasText && !hasAttachments) || isUploading.value) return;

  const textPayload = messageText.value;
  const attachmentIds = attachments.value
    .map((a) => a.id)
    .filter((id) => id !== null && id !== undefined);

  messageText.value = "";
  attachments.value = [];

  // Main stream message (no parentId)
  await chatStore.sendMessage({
    body: textPayload,
    attachmentIds: attachmentIds,
  });

  scrollToBottom();
}
</script>

<template>
  <main class="flex-1 flex flex-col bg-[#0B1215] text-slate-100 overflow-hidden">
    <!-- Channel Header -->
    <header class="h-14 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-900/40">
      <div class="flex items-center space-x-2">
        <span class="text-emerald-400 font-bold text-xl">#</span>
        <h2 class="font-semibold text-slate-100">
          {{ chatStore.activeChannel?.name || "Select a channel" }}
        </h2>
      </div>
      <div v-if="chatStore.onlineUsers?.length" class="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-full flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        {{ chatStore.onlineUsers.length }} online
      </div>
    </header>

    <!-- Message Stream -->
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
        <!-- User Avatar -->
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
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
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
            v-if="msg.body"
            class="text-slate-300 text-sm mt-1 whitespace-pre-wrap leading-relaxed"
          >
            {{ msg.body }}
          </p>

          <!-- Attachments Display -->
          <div v-if="msg.attachments && msg.attachments.length" class="mt-2 space-y-2">
            <div v-for="file in msg.attachments" :key="file.id">
              <!-- Image Preview -->
              <template v-if="file.mime_type?.startsWith('image/') || file.type?.startsWith('image/')">
                <a :href="file.url" target="_blank" rel="noopener noreferrer">
                  <img
                    :src="file.url"
                    :alt="file.name || 'Attachment'"
                    class="max-w-xs max-h-60 rounded-lg border border-slate-700 hover:opacity-90 transition-opacity object-cover"
                  />
                </a>
              </template>

              <!-- Generic File Download Card -->
              <template v-else>
                <a
                  :href="file.url"
                  target="_blank"
                  download
                  class="inline-flex items-center gap-2 p-2 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span class="truncate max-w-[200px]">{{ file.name || file.filename || 'Download file' }}</span>
                </a>
              </template>
            </div>
          </div>

          <!-- Thread Trigger Button -->
          <button
      v-if="msg.status !== 'sending' && msg.status !== 'failed'"
      @click="chatStore.openThread(msg)"
      class="mt-2 inline-flex items-center space-x-1.5 text-xs text-emerald-400/80 hover:text-emerald-300 hover:underline"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      <span>
        {{
          (msg.replies_count || 0) > 0
            ? `${msg.replies_count} ${Number(msg.replies_count) === 1 ? 'reply' : 'replies'}`
            : 'Reply in thread'
        }}
      </span>
    </button>
        </div>
      </div>
    </div>

    <!-- Typing Indicator Banner -->
    <div v-if="typingLabel" class="px-6 py-1 text-xs text-slate-400 italic">
      {{ typingLabel }}
    </div>

    <!-- Message Input Bar -->
    <div class="p-4 border-t border-slate-800/80 bg-slate-900/20">
      <!-- Pending Attachments Preview Chips -->
      <div v-if="attachments.length > 0" class="flex flex-wrap gap-2 mb-3 p-2 bg-slate-900 rounded-md border border-slate-800">
        <div
          v-for="(file, index) in attachments"
          :key="file.id || index"
          class="flex items-center gap-2 bg-slate-800 text-xs text-slate-200 px-2.5 py-1 rounded border border-slate-700"
        >
          <span class="truncate max-w-[150px]">{{ file.name || file.filename || 'Attachment' }}</span>
          <button type="button" @click="removeAttachment(index)" class="text-slate-400 hover:text-red-400 ml-1">✕</button>
        </div>
      </div>

      <form @submit.prevent="handleSendMessage" class="flex items-center gap-2">
        <!-- Hidden File Input -->
        <input
          type="file"
          ref="fileInput"
          multiple
          class="hidden"
          @change="handleFileSelect"
        />

        <!-- Attachment Button -->
        <button
          type="button"
          @click="triggerFileInput"
          :disabled="isUploading || !chatStore.activeChannel"
          class="p-3 text-slate-400 hover:text-emerald-400 bg-slate-900 border border-slate-800 rounded-lg transition-colors disabled:opacity-40"
          title="Attach file"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        <!-- Message Input -->
        <input
          v-model="messageText"
          @input="handleTypingInput"
          type="text"
          placeholder="Type a message..."
          class="flex-1 bg-slate-900 text-slate-100 text-sm rounded-lg px-4 py-3 border border-slate-800 focus:outline-none focus:border-emerald-500/50 disabled:opacity-40"
          :disabled="!chatStore.activeChannel || isUploading"
        />

        <!-- Send Button -->
        <button
          type="submit"
          :disabled="(!messageText.trim() && !attachments.length) || !chatStore.activeChannel || chatStore.sending || isUploading"
          class="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm px-5 py-3 rounded-lg transition-colors disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  </main>
</template>