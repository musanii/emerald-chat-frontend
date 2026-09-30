import { defineStore } from "pinia";
import apiClient from "../api/axios";
import { echo } from "../plugins/echo";

export const useChatStore = defineStore("chat", {
  state: () => ({
    channels: [],
    activeChannel: null,
    messages: [],
    typingUsers: new Map(),
    onlineUsers: [],
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

      localStorage.setItem("active_channel_id", String(channel.id));

      await this.fetchMessages(channel.id);
      this.listenToChannel(channel.id);
    },

    listenToChannel(channelId) {
      const channelName = `channel.${channelId}`;

      this.activePresenceChannel = echo
        .join(channelName)
        /* ... presence handlers ... */
        .listen(".message.sent", (e) => {
          const incomingMessage = e.message;

          if (incomingMessage.user?.id) {
            this.typingUsers.delete(incomingMessage.user.id);
          }

          // Handle thread reply broadcasts
          if (incomingMessage.parent_id) {
            // 1. Update the reply count on the parent message in the main stream
            const parentId = Number(incomingMessage.parent_id);
            const parentMsg = this.messages.find((m) => Number(m.id) === parentId);

            if (parentMsg) {
              parentMsg.replies_count = (Number(parentMsg.replies_count) || 0) + 1;
            }

            // 2. If the thread drawer is open for this message, push the reply
            if (
              this.activeThreadMessage &&
              Number(this.activeThreadMessage.id) === parentId
            ) {
              const exists = this.activeThreadReplies.some(
                (m) => m.id === incomingMessage.id
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
            (m) => m.id === incomingMessage.id
          );

          if (!existsInStream) {
            this.messages.push(incomingMessage);
          }
        });
    },

    leaveActiveChannel() {
      if (this.activeChannel) {
        echo.leave(`channel.${this.activeChannel.id}`);
        this.typingUsers.clear();
        this.onlineUsers = [];
        this.activePresenceChannel = null;
      }
    },

    async sendTypingIndicator() {
      if (!this.activeChannel) return;
      try {
        await apiClient.post(`/channels/${this.activeChannel.id}/typing`);
      } catch (error) {
        // silently ignore
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

          const targetChannel = savedChannelId
            ? this.channels.find((c) => String(c.id) === String(savedChannelId))
            : null;

          const channelToSelect = targetChannel || this.channels[0];
          await this.setActiveChannel(channelToSelect);
        }
      } catch (error) {
        console.error("Failed to fetch channels:", error);
      } finally {
        this.loading = false;
      }
    },

    async sendMessage(payloadInput = {}) {
      let body = "";
      let attachmentIds = [];
      let parentId = null;

      if (typeof payloadInput === "string") {
        body = payloadInput;
      } else if (payloadInput && typeof payloadInput === "object") {
        body = payloadInput.body || "";
        attachmentIds = payloadInput.attachmentIds || payloadInput.attachment_ids || [];
        parentId = payloadInput.parentId || payloadInput.parent_id || null;
      }

      // Resolve Channel ID
      let channelId = this.activeChannel?.id;
      if (!channelId && this.activeThreadMessage?.channel_id) {
        channelId = this.activeThreadMessage.channel_id;
      }
      if (!channelId) {
        const savedId = localStorage.getItem("active_channel_id");
        if (savedId) channelId = Number(savedId);
      }

      if (!channelId) return;

      const payload = { body: body.trim() };

      const validAttachments = (Array.isArray(attachmentIds) ? attachmentIds : []).filter(Boolean);
      if (validAttachments.length > 0) {
        payload.attachment_ids = validAttachments;
      }

      if (parentId) {
        payload.parent_id = Number(parentId);
      }

      try {
        const response = await apiClient.post(
          `/channels/${channelId}/messages`,
          payload
        );

        const realMessage = response.data.data || response.data;
        realMessage.status = "sent";

        if (parentId) {
          this.activeThreadReplies.push(realMessage);
          this.threadReplies = this.activeThreadReplies;

          // Increment reply count on parent message in main stream
          const parentMsg = this.messages.find((m) => Number(m.id) === Number(parentId));
          if (parentMsg) {
            parentMsg.replies_count = (Number(parentMsg.replies_count) || 0) + 1;
          }
        } else {
          this.messages.push(realMessage);
        }

        return response;
      } catch (error) {
        console.error("Failed to send message:", error);
        throw error;
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

      const payload = { body: tempMessage.body };
      if (tempMessage.attachment_ids?.length) {
        payload.attachment_ids = tempMessage.attachment_ids;
      }
      if (tempMessage.parent_id) {
        payload.parent_id = tempMessage.parent_id;
      }

      const channelId = this.activeChannel?.id || tempMessage.channel_id;

      try {
        const response = await apiClient.post(
          `/channels/${channelId}/messages`,
          payload
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
      if (!message) return;

      this.activeThreadMessage = message;
      this.activeThreadReplies = [];
      this.threadReplies = [];
      this.loadingThread = true;

      const channelId = this.activeChannel?.id || message.channel_id;

      try {
        const response = await apiClient.get(
          `/channels/${channelId}/messages/${message.id}/thread`
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
      await this.sendMessage({
        body: body,
        parentId: this.activeThreadMessage.id,
      });
    },

    async uploadAttachment(file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await apiClient.post("/attachments", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const payload = response.data.data || response.data;

        return {
          id: payload.id || payload.file_id || payload.attachment_id,
          name: payload.name || payload.original_name || payload.filename || file.name,
          url: payload.url || payload.path || "",
          mime_type: payload.mime_type || payload.type || file.type,
        };
      } catch (error) {
        console.error("Attachment upload failed:", error);
        throw error;
      }
    },
  },
});