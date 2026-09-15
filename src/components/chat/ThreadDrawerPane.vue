<script setup>
defineEmits(['close'])
</script>

<template>
  <aside class="w-80 border-l border-slate-200 bg-[#F8FAF9] flex flex-col justify-between shrink-0">
    <header class="h-14 border-b border-slate-200 px-4 flex items-center justify-between">
      <div class="flex gap-4 text-xs font-bold">
        <button class="text-slate-900 border-b-2 border-[#047857] pb-4 pt-4">Thread</button>
        <button class="text-slate-400 hover:text-slate-700 pb-4 pt-4">Details</button>
      </div>
      <button @click="$emit('close')" class="text-slate-400 hover:text-slate-700 text-xs font-bold">✕</button>
    </header>

    <!-- Thread Stream -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
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

      <div class="space-y-3">
        <div class="flex gap-2.5 text-xs">
          <span class="w-6 h-6 rounded-full bg-slate-400 text-white flex items-center justify-center font-bold text-[10px] shrink-0">MC</span>
          <div>
            <span class="font-bold text-slate-900 text-xs">Maya Chen</span>
            <p class="text-slate-600 text-xs mt-0.5 leading-relaxed">I'll pick that up before our afternoon review.</p>
          </div>
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
        <button class="bg-[#047857] text-white p-1.5 rounded-lg text-xs">&gt;</button>
      </div>
    </div>
  </aside>
</template>