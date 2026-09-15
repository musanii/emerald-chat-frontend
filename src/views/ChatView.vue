<script setup>
import { ref } from 'vue'

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
    <aside class="w-64 bg-[#062319] text-slate-300 flex flex-col justify-between shrink-0 border-r border-[#083526]">
      <div>
        <!-- Workspace Switcher Header -->
        <div class="p-3 border-b border-[#0A402E] flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-[#047857] text-white flex items-center justify-center font-bold text-xs">
              A
            </div>
            <div>
              <div class="font-bold text-white text-xs tracking-tight">Company ABC</div>
              <div class="text-[10px] text-slate-400">Product workspace</div>
            </div>
          </div>
          <span class="text-xs text-slate-400">⌄</span>
        </div>

        <!-- Project Selector -->
        <div class="px-3 pt-3">
          <div class="bg-[#0A3D2C] p-2 rounded-lg flex items-center justify-between text-xs font-semibold text-white">
            <div class="flex items-center gap-2">
              <span class="text-[10px] bg-[#047857] px-1 rounded text-white font-bold">PD</span>
              <span>Product & Design</span>
            </div>
            <span class="text-slate-400">⌄</span>
          </div>
        </div>

        <!-- Public Channels -->
        <div class="px-3 pt-4">
          <div class="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span>Public Channels</span>
            <button class="hover:text-white">+</button>
          </div>
          <div class="space-y-0.5">
            <a href="#" class="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-[#0A3D2C] text-slate-300">
              <span class="text-slate-400">#</span> general
            </a>
            <a href="#" class="flex items-center justify-between px-2 py-1.5 rounded-md text-xs hover:bg-[#0A3D2C] text-slate-300">
              <div class="flex items-center gap-2">
                <span class="text-slate-400">#</span> announcements
              </div>
              <span class="bg-[#047857] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
            </a>
            <a href="#" class="flex items-center justify-between px-2 py-1.5 rounded-md text-xs bg-[#047857] text-white font-medium">
              <div class="flex items-center gap-2">
                <span>#</span> design-studio
              </div>
              <span class="bg-emerald-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">8</span>
            </a>
            <a href="#" class="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-[#0A3D2C] text-slate-300">
              <span class="text-slate-400">#</span> product-feedback
            </a>
          </div>
        </div>

        <!-- Private Channels -->
        <div class="px-3 pt-4">
          <div class="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span>Private Channels</span>
            <button class="hover:text-white">+</button>
          </div>
          <div class="space-y-0.5">
            <a href="#" class="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-[#0A3D2C] text-slate-300">
              <span class="text-slate-400">🔒</span> leadership
            </a>
            <a href="#" class="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-[#0A3D2C] text-slate-300">
              <span class="text-slate-400">🔒</span> launch-room
            </a>
          </div>
        </div>

        <!-- Direct Messages -->
        <div class="px-3 pt-4">
          <div class="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span>Direct Messages</span>
            <button class="hover:text-white">+</button>
          </div>
          <div class="space-y-0.5 text-xs">
            <a href="#" class="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#0A3D2C]">
              <span class="w-5 h-5 rounded-md bg-emerald-700 text-white text-[10px] flex items-center justify-center font-bold">MC</span>
              <span>Maya Chen</span>
            </a>
            <a href="#" class="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#0A3D2C]">
              <span class="w-5 h-5 rounded-md bg-amber-600 text-white text-[10px] flex items-center justify-center font-bold">JB</span>
              <span>Jon Bell</span>
            </a>
            <a href="#" class="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#0A3D2C]">
              <span class="w-5 h-5 rounded-md bg-orange-600 text-white text-[10px] flex items-center justify-center font-bold">AO</span>
              <span>Amina Okafor</span>
            </a>
            <a href="#" class="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#0A3D2C]">
              <span class="w-5 h-5 rounded-md bg-teal-700 text-white text-[10px] flex items-center justify-center font-bold">DR</span>
              <span>Diego Ruiz</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Current User Profile Footer -->
      <div class="p-3 border-t border-[#0A402E] flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-md bg-[#047857] text-white flex items-center justify-center font-bold text-xs">
            KO
          </div>
          <div>
            <div class="text-xs font-bold text-white">Kevin Otieno</div>
            <div class="text-[10px] text-emerald-400 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Available
            </div>
          </div>
        </div>
        <button class="text-slate-400 hover:text-white text-xs">⚙️</button>
      </div>
    </aside>

    <!-- Pane 2: Main Stream Feed -->
    <main class="flex-1 flex flex-col justify-between bg-white overflow-hidden">
      <!-- Channel Top Header -->
      <header class="h-14 border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
        <div>
          <h2 class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <span class="text-slate-400">#</span> design-studio
          </h2>
          <p class="text-[11px] text-slate-400">Design critique, explorations, and team updates</p>
        </div>
        <div class="flex items-center gap-3 text-xs text-slate-500">
          <span>👥 24</span>
          <span>🔍</span>
          <span>🔔</span>
          <button @click="activeThreadOpen = !activeThreadOpen" class="text-slate-400 hover:text-slate-700">&gt;</button>
        </div>
      </header>

      <!-- Message Stream -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Banner Header -->
        <div class="mb-6">
          <div class="w-10 h-10 rounded-xl bg-[#047857] text-white flex items-center justify-center font-bold text-xl mb-3">
            #
          </div>
          <h1 class="text-2xl font-bold text-slate-900">Welcome to #design-studio</h1>
          <p class="text-xs text-slate-500 mt-1">This is where the team shares work, decisions, and everything in between.</p>
        </div>

        <div class="relative flex py-2 items-center">
          <div class="flex-grow border-t border-slate-200"></div>
          <span class="flex-shrink mx-4 text-[10px] text-slate-400 font-semibold uppercase">TODAY</span>
          <div class="flex-grow border-t border-slate-200"></div>
        </div>

        <!-- Messages List -->
        <div v-for="msg in messages" :key="msg.id" class="flex gap-3 group">
          <div :class="['w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0', msg.avatarBg]">
            {{ msg.avatar }}
          </div>
          <div class="flex-1">
            <div class="flex items-baseline gap-2 mb-1">
              <span class="font-bold text-slate-900 text-xs">{{ msg.user }}</span>
              <span class="text-[10px] text-slate-400">{{ msg.time }}</span>
            </div>
            <p class="text-xs text-slate-700 leading-relaxed">{{ msg.text }}</p>

            <!-- Thread replies trigger -->
            <div v-if="msg.replyCount" class="mt-2 flex items-center gap-3 text-xs">
              <span v-for="(r, i) in msg.reactions" :key="i" class="bg-amber-50 border border-amber-200/60 text-amber-800 text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                {{ r.emoji }} {{ r.count }}
              </span>
              <button @click="activeThreadOpen = true" class="text-[#047857] text-xs font-semibold hover:underline">
                {{ msg.replyCount }} replies
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
            placeholder="Message #design-studio" 
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
              <button class="bg-[#047857] hover:bg-[#064e3b] text-white p-1.5 rounded-lg text-xs transition-colors">
                ↵
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

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