import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "../api/axios";

export const useChatStore = defineStore("chat", {
  state: () => ({
    channels: [],
    activeChannel: null,
    messages: [],
    loading: false,
  }),

  actions: {
    async fetchChannels() {
      this.loading = true;
      try {
        const response = await apiClient.get("channels");
        this.channels = response.data.data || response.data;
        if (this.channels.length > 0 && !this.activeChannel) {
          this.activeChannel = this.channels[0];
          await this.fetchMessages(this.channels[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch channels:", error);
      } finally {
        this.loading = false;
      }
    },
    async fetchMessages(channelId) {
      try {
        const response = await apiClient.get(`/channels/${channelId}/messages`);
        this.messages = response.data.data || response.data;
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    },
  },
});
