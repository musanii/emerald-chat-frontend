import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "../api/axios";
import { echo } from "../plugins/echo";

export const useChatStore = defineStore("chat", {
  state: () => ({
    channels: [],
    activeChannel: null,
    messages: [],
    typingUsers: new Map(),
    loading: false,
    sending: false,
    currentChannelSubscription: null,
  }),

  actions: {
    async setActiveChannel(channel) {
      this.leaveActiveChannel();
      this.activeChannel = channel;
      await this.fetchMessages(channel.id);
      this.listenToChannel(channel);
    },

    listenToChannel(channelId) {
      const channelName = `channel.${channelId}`;

      //join the PresenceChannel
      this.activePresenceChannel = echo
        .join(channelName)
        //Listen for new messages
        .listen(".message.sent", (e) => {
          const incomingMessage = e.message;

          //Remove sender from typing list if they send a message
          if (incomingMessage.user?.id) {
            this.typingUsers.delete(incomingMessage.user.id);
          }
          if (!this.messages.some((m) => m.id === incomingMessage.id)) {
            this.messages.push(incomingMessage);
          }
        })

        //Listen for typing events
        .listen(".user.typing", (e) => {
          //Ignore own typing events
          const currentUserId = JSON.parse(localStorage.getItem("user"))?.id;
          if (e.userId === currentUserId) return;
          //Add user to typing state and auto-remove after 3 seconds of inactivity
          this.typingUsers.set(e.userid, e.userName);
          setTimeout(() => {
            this.typingUsers.delete(e.userId);
          }, 3000);
        });
    },

    leaveActiveChannel() {
      if (this.activeChannel) {
        echo.leave(`channel.${this.activeChannel.id}`);
        this.typingUsers.clear();
        this.activePresenceChannel = null;
      }
    },

    async sendTypingIndicator() {
      if (!this.activeChannel) return;
      try {
        await apiClient.post(`/channels/${this.activeChannel.id}/typing`);
      } catch (error) {
        //silently handle typing failures
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

    async sendMessage(body) {
      if (!this.activeChannel || !body.trim()) return;

      this.sending = true;

      try {
        const response = await apiClient.post(
          `channels/${this.activeChannel.id}/messages`,
          {
            body,
          },
        );
        const newMessage = response.data.data || response.data;
        if (!this.messages.some((m) => m.id === newMessage.id)) {
          this.messages.push(newMessage);
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        this.sending = false;
      }
    },
  },
});
