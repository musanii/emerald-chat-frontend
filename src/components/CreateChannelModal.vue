<script setup>
import { ref, onMounted } from 'vue';
import { useChatStore } from '../stores/chat';
import apiClient from '../api/axios';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close']);
const chatStore = useChatStore();

const departments = ref([]);
const loadingDepartments = ref(false);

const form = ref({
  name: '',
  description: '',
  department_id: '',
  is_private: false
});

const loading = ref(false);
const errorMessage = ref('');

// Fetch departments on modal mount
onMounted(async () => {
  loadingDepartments.value = true;
  try {
    const response = await apiClient.get('/departments');
    departments.value = response.data.data || response.data;
    if (departments.value.length > 0) {
      form.value.department_id = departments.value[0].id;
    }
  } catch (err) {
    console.error('Failed to fetch departments:', err);
  } finally {
    loadingDepartments.value = false;
  }
});

async function handleSubmit() {
  if (!form.value.name.trim() || !form.value.department_id) return;

  loading.value = true;
  errorMessage.value = '';

  const payload = {
    name: form.value.name.trim(),
    description: form.value.description.trim(),
    department_id: Number(form.value.department_id),
    type: form.value.is_private ? 'private' : 'public',
    is_private: form.value.is_private
  };

  const result = await chatStore.createChannel(payload);
  loading.value = false;

  if (result.success) {
    form.value = {
      name: '',
      description: '',
      department_id: departments.value[0]?.id || '',
      is_private: false
    };
    emit('close');
  } else {
    errorMessage.value = result.message;
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div class="w-full max-w-md bg-[#0D1518] border border-slate-800 rounded-xl p-6 shadow-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-slate-100">Create New Channel</h2>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-200">✕</button>
      </div>

      <!-- Error Alert -->
      <div v-if="errorMessage" class="mb-4 text-xs text-red-400 bg-red-950/40 p-2.5 rounded border border-red-800/50">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Department Select -->
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1">Department</label>
          <select
            v-model="form.department_id"
            required
            :disabled="loadingDepartments"
            class="w-full bg-slate-900 border border-slate-800 text-slate-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500/50 disabled:opacity-50"
          >
            <option value="" disabled>Select a Department</option>
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">
              {{ dept.name }}
            </option>
          </select>
        </div>

        <!-- Channel Name -->
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1">Channel Name</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="e.g. engineering"
            required
            class="w-full bg-slate-900 border border-slate-800 text-slate-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1">Description (Optional)</label>
          <textarea
            v-model="form.description"
            rows="2"
            placeholder="What's this channel about?"
            class="w-full bg-slate-900 border border-slate-800 text-slate-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500/50"
          ></textarea>
        </div>

        <!-- Visibility Selection Cards -->
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-2">Channel Visibility</label>
          <div class="grid grid-cols-2 gap-2">
            <!-- Public Card -->
            <button
              type="button"
              @click="form.is_private = false"
              :class="[
                'p-3 rounded-lg border text-left transition',
                !form.is_private
                  ? 'border-emerald-500 bg-emerald-950/20 text-white'
                  : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
              ]"
            >
              <div class="font-bold text-xs flex items-center gap-1.5 mb-1">
                <span class="font-mono text-slate-400">#</span> Public
              </div>
              <p class="text-[10px] text-slate-400 leading-tight">
                Anyone in your department can view and join.
              </p>
            </button>

            <!-- Private Card -->
            <button
              type="button"
              @click="form.is_private = true"
              :class="[
                'p-3 rounded-lg border text-left transition',
                form.is_private
                  ? 'border-emerald-500 bg-emerald-950/20 text-white'
                  : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
              ]"
            >
              <div class="font-bold text-xs flex items-center gap-1.5 mb-1">
                <span>🔒</span> Private
              </div>
              <p class="text-[10px] text-slate-400 leading-tight">
                Accessible only via direct invitation.
              </p>
            </button>
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading || !form.name.trim() || !form.department_id"
            class="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg disabled:opacity-40 transition-opacity"
          >
            {{ loading ? 'Creating...' : 'Create Channel' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>