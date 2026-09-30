<script setup>
import { ref, computed, nextTick, watch } from "vue";
import { useChatStore } from "../../stores/chat";
import { getUserColor, getUserInitials } from "../../utils/colors";

const chatStore = useChatStore();

const replyText = ref("");
const attachments = ref([]);
const isUploading = ref(false);
const isSending = ref(false);
const fileInput = ref(null);
const repliesContainer = ref(null);

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
      if (uploaded && uploaded.id) {
        attachments.value.push(uploaded);
      }
    }
  } catch (error) {
    console.error("[Thread] Failed to upload attachment:", error);
  } finally {
    isUploading.value = false;
    if (fileInput.value) fileInput.value.value = "";
  }
}

function removeAttachment(index) {
  attachments.value.splice(index, 1);
}

function formatTime(timestamp) {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const scrollToBottom = async () => {
  await nextTick();
  if (repliesContainer.value) {
    repliesContainer.value.scrollTop = repliesContainer.value.scrollHeight;
  }
};

watch(() => chatStore.activeThreadReplies?.length, scrollToBottom);

const canSubmit = computed(() => {
  const hasText = replyText.value.trim().length > 0;
  const hasAttachments = attachments.value.length > 0;
  return (hasText || hasAttachments) && !isUploading.value && !isSending.value;
});

async function handleSendReply() {
  console.log("[Thread] Submitting reply attempt...");

  if (!chatStore.activeThreadMessage) {
    console.error("[Thread] Error: activeThreadMessage is null!");
    return;
  }

  const trimmedText = replyText.value.trim();
  const validAttachments = attachments.value.filter((a) => a && a.id);

  if (!trimmedText && validAttachments.length === 0) {
    console.warn("[Thread] Blocked: empty message body and no attachments.");
    return;
  }

  const textPayload = trimmedText;
  const attachmentIds = validAttachments.map((a) => a.id);
  const parentId = chatStore.activeThreadMessage.id;

  console.log("[Thread] Sending payload:", {
    body: textPayload,
    attachmentIds,
    parentId,
  });

  isSending.value = true;

  try {
    await chatStore.sendMessage({
      body: textPayload,
      attachmentIds: attachmentIds,
      parentId: parentId, // Ensure chatStore.sendMessage handles parentId / parent_id
    });
    
    // Clear inputs ONLY on success
    replyText.value = "";
    attachments.value = [];
    console.log("[Thread] Reply sent successfully.");
  } catch (error) {
    console.error("[Thread] Failed to send reply:", error);
  } finally {
    isSending.value = false;
    scrollToBottom();
  }
}
</script>

<template>
  <aside
    v-if="chatStore.activeThreadMessage"
    class="w-96 border-l border-slate-800 bg-[#0D1518] flex flex-col h-full"
  >
    <!-- Thread Header -->
    <header class="h-14 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
      <div class="flex items-center space-x-2">
        <h3 class="font-semibold text-slate-200 text-sm">Thread</h3>
        <span class="text-xs text-slate-400">
          #{{ chatStore.activeChannel?.name || 'channel' }}
        </span>
      </div>
      <button
        @click="chatStore.closeThread"
        class="text-slate-400 hover:text-slate-200 p-1 rounded"
      >
        ✕
      </button>
    </header>

    <!-- Thread Content Container -->
    <div ref="repliesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- Parent Message -->
      <div class="pb-4 border-b border-slate-800/80">
        <div class="flex items-center space-x-2 mb-1">
          <span class="font-semibold text-sm text-emerald-400">
            {{ chatStore.activeThreadMessage.user?.name || "User" }}
          </span>
          <span class="text-xs text-slate-500">
            {{ formatTime(chatStore.activeThreadMessage.created_at) }}
          </span>
        </div>
        <p class="text-slate-300 text-sm whitespace-pre-wrap">
          {{ chatStore.activeThreadMessage.body }}
        </p>

        <!-- Parent Message Attachments -->
        <div
          v-if="chatStore.activeThreadMessage.attachments?.length"
          class="mt-2 space-y-2"
        >
          <div
            v-for="file in chatStore.activeThreadMessage.attachments"
            :key="file.id"
          >
            <template v-if="file.mime_type?.startsWith('image/') || file.type?.startsWith('image/')">
              <a :href="file.url" target="_blank" rel="noopener noreferrer">
                <img
                  :src="file.url"
                  :alt="file.name || 'Attachment'"
                  class="max-w-full max-h-48 rounded border border-slate-700 object-cover"
                />
              </a>
            </template>
            <template v-else>
              <a
                :href="file.url"
                target="_blank"
                download
                class="flex items-center gap-2 p-2 rounded bg-slate-800 border border-slate-700 text-xs text-slate-200 hover:bg-slate-700"
              >
                📎 <span class="truncate">{{ file.name || file.filename || 'Download file' }}</span>
              </a>
            </template>
          </div>
        </div>
      </div>

      <!-- Replies Stream -->
      <div
        v-for="reply in chatStore.activeThreadReplies"
        :key="reply.id"
        class="flex items-start space-x-2.5"
      >
        <div
          class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border"
          :class="[
            getUserColor(reply.user).badgeBg,
            getUserColor(reply.user).text,
            getUserColor(reply.user).border,
          ]"
        >
          {{ getUserInitials(reply.user?.name) }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2">
            <span class="font-semibold text-xs text-slate-200">
              {{ reply.user?.name }}
            </span>
            <span class="text-[10px] text-slate-500">
              {{ formatTime(reply.created_at) }}
            </span>
          </div>
          <p class="text-slate-300 text-xs mt-0.5 whitespace-pre-wrap">
            {{ reply.body }}
          </p>

          <!-- Reply Attachments -->
          <div v-if="reply.attachments?.length" class="mt-2 space-y-1.5">
            <div v-for="file in reply.attachments" :key="file.id">
              <template v-if="file.mime_type?.startsWith('image/') || file.type?.startsWith('image/')">
                <a :href="file.url" target="_blank" rel="noopener noreferrer">
                  <img
                    :src="file.url"
                    :alt="file.name || 'Attachment'"
                    class="max-w-full max-h-40 rounded border border-slate-700 object-cover"
                  />
                </a>
              </template>
              <template v-else>
                <a
                  :href="file.url"
                  target="_blank"
                  download
                  class="flex items-center gap-2 p-1.5 rounded bg-slate-800 border border-slate-700 text-xs text-slate-200"
                >
                  📎 <span class="truncate">{{ file.name || file.filename || 'Download file' }}</span>
                </a>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reply Input Bar -->
    <div class="p-3 border-t border-slate-800 bg-slate-900/40 shrink-0">
      <!-- Pending Attachments Chips -->
      <div v-if="attachments.length > 0" class="flex flex-wrap gap-1.5 mb-2">
        <div
          v-for="(file, index) in attachments"
          :key="file.id || index"
          class="flex items-center gap-1 bg-slate-800 text-[11px] text-slate-200 px-2 py-0.5 rounded border border-slate-700"
        >
          <span class="truncate max-w-[120px]">{{ file.name }}</span>
          <button type="button" @click="removeAttachment(index)" class="text-slate-400 hover:text-red-400">✕</button>
        </div>
      </div>

      <form @submit.prevent="handleSendReply" class="flex items-center gap-2">
        <input type="file" ref="fileInput" multiple class="hidden" @change="handleFileSelect" />
        
        <button
          type="button"
          @click="triggerFileInput"
          :disabled="isUploading || isSending"
          class="p-2 text-slate-400 hover:text-emerald-400 bg-slate-900 border border-slate-800 rounded-lg disabled:opacity-40"
        >
          📎
        </button>

        <input
          v-model="replyText"
          type="text"
          placeholder="Reply in thread..."
          @keydown.enter.exact.prevent="canSubmit && handleSendReply()"
          class="flex-1 bg-slate-900 text-slate-100 text-xs rounded-lg px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-emerald-500/50"
        />

        <button
          type="submit"
          :disabled="!canSubmit"
          class="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-3 py-2.5 rounded-lg disabled:opacity-40 transition-opacity"
        >
          {{ isSending ? "Sending..." : "Reply" }}
        </button>
      </form>
    </div>
  </aside>
</template>