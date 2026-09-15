import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "../api/axios";
import { echo } from "../plugins/echo";
import axios from "axios";

export const useChatStore = defineStore("chat", {
  state: () => ({
    channels: [],
    activeChannel: null,
    messages: [],
    typingUsers: new Map(),
    loading: false,
    sending: false,
    currentChannelSubscription: null,
    activeThreadMessage: null,
    activeThreadReplies: [],
    sendingReply: false,
    threadReplies: [],
    loadingThread: false,
  }),

  actions: {
  async setActiveChannel(channel) {
  if (!channel) return;
  
  this.leaveActiveChannel();
  this.activeChannel = channel;

  // Persist channel ID immediately
  localStorage.setItem("active_channel_id", String(channel.id));

  await this.fetchMessages(channel.id);
  this.listenToChannel(channel.id);
},

    listenToChannel(channelId) {
      const channelName = `channel.${channelId}`;

      //join the PresenceChannel
      this.activePresenceChannel = echo
        .join(channelName)
        //Listen for new messages
        .listen(".message.sent", (e) => {
          const incomingMessage = e.message;

          if (incomingMessage.user?.id) {
            this.typingUsers.delete(incomingMessage.user.id);
          }

          // Handle thread reply broadcasts
          if (incomingMessage.parent_id) {
            if (
              this.activeThreadMessage &&
              this.activeThreadMessage.id === incomingMessage.parent_id
            ) {
              const exists = this.activeThreadReplies.some(
                (m) =>
                  m.id === incomingMessage.id ||
                  (m.status === "sending" && m.body === incomingMessage.body),
              );

              if (!exists) {
                this.activeThreadReplies.push(incomingMessage);
                this.threadReplies = this.activeThreadReplies;
              }
            }
            return;
          }

          // Handle channel main stream broadcasts
          const existsInStream = this.messages.some(
            (m) =>
              m.id === incomingMessage.id ||
              (m.status === "sending" && m.body === incomingMessage.body),
          );

          if (!existsInStream) {
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

    if (this.channels.length > 0) {
      const savedChannelId = localStorage.getItem("active_channel_id");
      
      // Look up saved channel by ID, otherwise fallback to index 0
      const targetChannel = savedChannelId
        ? this.channels.find((c) => String(c.id) === String(savedChannelId))
        : null;

      const channelToSelect = targetChannel || this.channels[0];

      // Always restore via setActiveChannel to ensure Echo sub & storage persist
      await this.setActiveChannel(channelToSelect);
    }
  } catch (error) {
    console.error("Failed to fetch channels:", error);
  } finally {
    this.loading = false;
  }
},

    async sendMessage(body, parentId = null) {
      if (!this.activeChannel || !body.trim()) return;

      const currentUser = JSON.parse(localStorage.getItem("user")) || {
        id: 0,
        name: "You",
      };
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const tempMessage = {
        id: tempId,
        body: body,
        channel_id: this.activeChannel.id,
        parent_id: parentId,
        user: currentUser,
        created_at: new Date().toISOString(),
        status: "sending",
        replies_count: 0,
      };

      // 1. Single optimistic push to thread state
      if (parentId) {
        this.activeThreadReplies.push(tempMessage);
        this.threadReplies = this.activeThreadReplies; // keep references identical
      } else {
        this.messages.push(tempMessage);
      }

      try {
        const response = await apiClient.post(
          `/channels/${this.activeChannel.id}/messages`,
          { body, parent_id: parentId },
        );

        const realMessage = response.data.data || response.data;
        realMessage.status = "sent";

        // 2. Reconcile temporary message with server response
        const targetArray = parentId ? this.activeThreadReplies : this.messages;
        const index = targetArray.findIndex((m) => m.id === tempId);

        if (index !== -1) {
          targetArray[index] = realMessage;
        } else {
          // Prevent duplicates if not found: replace or check existing ID
          if (!targetArray.some((m) => m.id === realMessage.id)) {
            targetArray.push(realMessage);
          }
        }

        if (parentId) {
          this.threadReplies = this.activeThreadReplies;

          // Update parent message reply count
          const parentMsg = this.messages.find((m) => m.id === parentId);
          if (parentMsg) {
            parentMsg.replies_count = (parentMsg.replies_count || 0) + 1;
          }
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        const targetArray = parentId ? this.activeThreadReplies : this.messages;
        const index = targetArray.findIndex((m) => m.id === tempId);
        if (index !== -1) {
          targetArray[index].status = "failed";
        }
      }
    },

    async retryMessage(tempMessage) {
      const targetArray = tempMessage.parent_id
        ? this.threadReplies
        : this.messages;
      const index = targetArray.findIndex((m) => m.id === tempMessage.id);
      if (index !== -1) {
        targetArray[index].status = "sending";
      }

      try {
        const response = await apiClient.post(
          `/channels/${this.activeChannel.id}/messages`,
          {
            body: tempMessage.body,
            parent_id: tempMessage.parent_id,
          },
        );

        const realMessage = response.data.data || response.data;
        realMessage.status = "sent";

        if (index !== -1) {
          targetArray[index] = realMessage;
        }
      } catch (error) {
        if (index !== -1) {
          targetArray[index].status = "failed";
        }
      }
    },

    async openThread(message) {
      if (!this.activeChannel || !message) return;

      this.activeThreadMessage = message;
      this.activeThreadReplies = [];
      this.threadReplies = [];
      this.loadingThread = true;

      try {
        // Hits Route::get('/channels/{channel}/messages/{message}/thread')
        const response = await apiClient.get(
          `/channels/${this.activeChannel.id}/messages/${message.id}/thread`,
        );

        const fetchedReplies = response.data.data || response.data;
        this.activeThreadReplies = fetchedReplies;
        this.threadReplies = fetchedReplies;
      } catch (error) {
        console.error("Failed to load thread replies:", error);
      } finally {
        this.loadingThread = false;
      }
    },
    closeThread() {
      this.activeThreadMessage = null;
      this.activeThreadReplies = [];
      this.threadReplies = [];
    },

    async sendThreadReply(body) {
      if (!this.activeThreadMessage) return;
      await this.sendMessage(body, this.activeThreadMessage.id);
    },

    async fetchThreadReplies(parentId) {
      this.loadingThread = true;
      try {
        const response = await apiClient.get(`/messages/${parentId}/replies`);
        this.threadReplies = response.data.data || response.data;
      } catch (error) {
        console.error("Failed to fetch thread replies:", error);
      } finally {
        this.loadingThread = false;
      }
    },
  },
});
