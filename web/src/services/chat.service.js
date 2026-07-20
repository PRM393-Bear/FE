import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs.js";
import { getToken } from "./auth.service.js";
import { apiFetch, BASE_URL } from "../utils/api.js";

class ChatService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.connecting = false;
    this.messageCallbacks = [];
    this.receiptCallbacks = [];
    this.notificationCallbacks = [];
  }

  connect(onConnectSuccess, onConnectError) {
    if (this.connected || this.connecting) return;

    const token = getToken();
    if (!token) return;

    this.connecting = true;

    // We use the SockJS fallback since that's configured on the backend
    const socketUrl = `${BASE_URL || window.location.origin}/ws`;
    
    this.client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: function (str) {
        // console.log(str); // Uncomment to debug STOMP
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      this.connected = true;
      this.connecting = false;
      // Subscribe to private messages
      this.client.subscribe('/user/queue/messages', (message) => {
        if (message.body) {
          const parsedMessage = JSON.parse(message.body);
          this.messageCallbacks.forEach(cb => cb(parsedMessage));
        }
      });

      // Subscribe to read receipts
      this.client.subscribe('/user/queue/receipts', (message) => {
        if (message.body) {
          const parsedReceipt = JSON.parse(message.body);
          this.receiptCallbacks.forEach(cb => cb(parsedReceipt));
        }
      });

      // Subscribe to notifications
      this.client.subscribe('/user/queue/notifications', (message) => {
        if (message.body) {
          const parsedNotification = JSON.parse(message.body);
          this.notificationCallbacks.forEach(cb => cb(parsedNotification));
        }
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
      this.connecting = false;
      this.connected = false;
      if (onConnectError) onConnectError(frame);
    };
    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
    }
    this.connected = false;
    this.messageCallbacks = [];
    this.receiptCallbacks = [];
    this.notificationCallbacks = [];
  }

  onMessage(callback) {
    this.messageCallbacks.push(callback);
  }

  onReceipt(callback) {
    this.receiptCallbacks.push(callback);
  }

  onNotification(callback) {
    this.notificationCallbacks.push(callback);
  }

  offMessage(callback) {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
  }

  offReceipt(callback) {
    this.receiptCallbacks = this.receiptCallbacks.filter(cb => cb !== callback);
  }

  offNotification(callback) {
    this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
  }

  sendMessage(receiverId, content, imageUrl = null) {
    if (this.client && this.connected) {
      this.client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({ receiverId, content, imageUrl })
      });
      return true;
    }

    console.warn("Cannot send message: Not connected to WebSocket");
    return false;
  }

  markAsRead(roomId, senderId) {
    if (this.client && this.connected) {
      this.client.publish({
        destination: '/app/chat.read',
        body: JSON.stringify({ roomId, senderId })
      });
    }
  }

  async getMyRooms() {
    return await apiFetch('/api/chat/rooms');
  }

  async getChatHistory(otherUserId) {
    return await apiFetch(`/api/chat/history/${otherUserId}`);
  }
}

export const chatService = new ChatService();
