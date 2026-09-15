<script setup>
import { ref } from 'vue'
import { onMounted } from 'vue'
import { useChatStore } from '../stores/chat'
import { useAuthStore } from '../stores/auth'
import SidebarPane from '../components/chat/SidebarPane.vue'
import MessageStreamPane from '../components/chat/MessageStreamPane.vue'

const chatStore = useChatStore()
const authStore = useAuthStore()

//Fetch channels when the component is mounted

onMounted(async () => {
  await chatStore.fetchChannels()
})

function selectChannel(channel){
  chatStore.activeChannel = channel
  chatStore.fetchMessages(channel.id)
}

const activeThreadOpen = ref(true)
const newMessage = ref('')

const messages = ref([
  {
    id: 1,
    user: 'Maya Chen',
    avatar: 'MC',
    avatarBg: 'bg-emerald-600',
    time: '9:32 AM',
    text: "Good morning! The new onboarding flow is ready for a final review. I've added the latest notes from yesterday's research session."
  },
  {
    id: 2,
    user: 'Jon Bell',
    avatar: 'JB',
    avatarBg: 'bg-amber-500',
    time: '9:38 AM',
    text: "The interaction pass looks great. I left one comment on the mobile handoff—otherwise this feels ready to share with the broader team.",
    reactions: [{ emoji: '👨‍👩‍👧', count: 4 }],
    replyCount: 3
  },
  {
    id: 3,
    user: 'Amina Okafor',
    avatar: 'AO',
    avatarBg: 'bg-orange-600',
    time: '9:44 AM',
    text: "Nice work. I've updated the project brief and added the launch checklist below.",
    reactions: [{ emoji: '✓', count: 2 }]
  }
])

const threadReplies = ref([
  {
    id: 101,
    user: 'Jon Bell',
    avatar: 'JB',
    avatarBg: 'bg-amber-500',
    time: '9:38 AM',
    text: 'The interaction pass looks great. I left one comment on the mobile handoff.'
  },
  {
    id: 102,
    user: 'Maya Chen',
    avatar: 'MC',
    avatarBg: 'bg-slate-300',
    text: "I'll pick that up before our afternoon review."
  },
  {
    id: 103,
    user: 'Amina Okafor',
    avatar: 'AO',
    avatarBg: 'bg-slate-300',
    text: 'Perfect. I\'ve linked the updated brief as well.'
  }
])
</script>

<template>
  <div class="h-screen w-screen flex bg-white font-sans overflow-hidden text-slate-800">
    <!-- Pane 1: Deep Green Sidebar -->
   <SidebarPane/>

    <!-- Pane 2: Main Stream Feed -->
    <MessageStreamPane
    :threadOpen="activeThreadOpen"
    @toggleThread="activeThreadOpen= !activeThreadOpen"
    />

    <!-- Pane 3: Right Thread Drawer -->
    <aside v-if="activeThreadOpen" class="w-80 border-l border-slate-200 bg-[#F8FAF9] flex flex-col justify-between shrink-0">
      <header class="h-14 border-b border-slate-200 px-4 flex items-center justify-between">
        <div class="flex gap-4 text-xs font-bold">
          <button class="text-slate-900 border-b-2 border-[#047857] pb-4 pt-4">Thread</button>
          <button class="text-slate-400 hover:text-slate-700 pb-4 pt-4">Details</button>
        </div>
        <button @click="activeThreadOpen = false" class="text-slate-400 hover:text-slate-700 text-xs">✕</button>
      </header>

      <!-- Thread Stream -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- Parent Message -->
        <div class="pb-4 border-b border-slate-200">
          <div class="flex items-center gap-2 mb-1">
            <span class="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[10px]">JB</span>
            <span class="font-bold text-slate-900 text-xs">Jon Bell</span>
            <span class="text-[10px] text-slate-400">9:38 AM</span>
          </div>
          <p class="text-xs text-slate-700 leading-relaxed pl-8">
            The interaction pass looks great. I left one comment on the mobile handoff.
          </p>
        </div>

        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">3 replies</div>

        <!-- Replies -->
        <div v-for="reply in threadReplies" :key="reply.id" class="flex gap-2.5 text-xs">
          <span :class="['w-6 h-6 rounded-full text-white flex items-center justify-center font-bold text-[10px] shrink-0', reply.avatarBg]">
            {{ reply.avatar }}
          </span>
          <div>
            <span class="font-bold text-slate-900 text-xs">{{ reply.user }}</span>
            <p class="text-slate-600 text-xs mt-0.5 leading-relaxed">{{ reply.text }}</p>
          </div>
        </div>
      </div>

      <!-- Thread Input Box -->
      <div class="p-3 border-t border-slate-200 bg-white">
        <div class="flex items-center gap-2">
          <input 
            type="text" 
            placeholder="Reply..." 
            class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#047857]"
          />
          <button class="bg-[#047857] text-white p-1.5 rounded-lg text-xs">
            &gt;
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>
