import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '../api/axios'

export const useChatStore = defineStore('chat', () => {
  const channels = ref([])
  const activeChannel = ref(null)
  const messages = ref([])
  const isLoading = ref(false)

  async function fetchChannels() {
    try {
      const response = await apiClient.get('/channels')
      channels.value = response.data.data
      if (channels.value.length > 0 && !activeChannel.value) {
        activeChannel.value = channels.value[0]
        await fetchMessages(channels.value[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch channels:', error)
    }
  }

  async function fetchMessages(channelId) {
    isLoading.value = true
    try {
      const response = await apiClient.get(`/channels/${channelId}/messages`)
      messages.value = response.data.data
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function sendMessage(channelId, body) {
    try {
      const response = await apiClient.post(`/channels/${channelId}/messages`, { body })
      messages.value.push(response.data.data)
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }

  return { channels, activeChannel, messages, isLoading, fetchChannels, fetchMessages, sendMessage }
})