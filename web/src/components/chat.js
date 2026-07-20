import "../styles/chat.css";
import { chatService } from "../services/chat.service.js";
import { getUser, getUserIdFromToken, isAuthenticated } from "../services/auth.service.js";
import { uploadImageApi } from "../services/auth.service.js";
import { showToast } from "../utils/ui.js";

let isChatOpen = false;
let currentChatUserId = null;
let currentRoomId = null;
let rooms = [];
let messages = [];

// DOM Elements
let chatContainer;
let fabBtn;
let drawer;
let roomListView;
let chatWindowView;
let roomListContent;
let chatMessagesContent;
let chatInputForm;
let messageInput;
let uploadBtn;
let backBtn;
let chatHeaderTitle;

export function initChat() {
  if (!isAuthenticated()) {
    const existing = document.getElementById("chat-drawer-container");
    if (existing) existing.remove();
    return;
  }

  // Prevent duplicate rendering
  if (document.getElementById("chat-drawer-container")) {
    return;
  }

  // Render HTML structure
  renderChatHTML();
  
  // Cache DOM elements
  chatContainer = document.getElementById("chat-drawer-container");
  fabBtn = document.getElementById("chat-fab-btn");
  drawer = document.getElementById("chat-drawer");
  roomListView = document.getElementById("chat-room-list-view");
  chatWindowView = document.getElementById("chat-window-view");
  roomListContent = document.getElementById("chat-room-list-content");
  chatMessagesContent = document.getElementById("chat-messages-content");
  chatInputForm = document.getElementById("chat-input-form");
  messageInput = document.getElementById("chat-message-input");
  uploadBtn = document.getElementById("chat-upload-btn");
  backBtn = document.getElementById("chat-back-btn");
  chatHeaderTitle = document.getElementById("chat-header-title");
  const fileInput = document.getElementById("chat-file-input");

  // Connect STOMP
  chatService.connect(() => {
    loadRooms();
  }, (err) => {
    console.error("Chat connection error", err);
  });

  // Listeners
  chatService.onMessage(handleIncomingMessage);
  chatService.onReceipt(handleIncomingReceipt);

  // Bind Events
  fabBtn.addEventListener("click", toggleChat);
  
  document.getElementById("chat-close-btn").addEventListener("click", () => {
    isChatOpen = false;
    updateChatVisibility();
  });

  backBtn.addEventListener("click", () => {
    currentChatUserId = null;
    currentRoomId = null;
    roomListView.classList.remove("hidden");
    chatWindowView.classList.add("hidden");
    loadRooms();
  });

  chatInputForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await sendMessage();
  });

  uploadBtn.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const originalHtml = uploadBtn.innerHTML;
      
      // Show loading state
      uploadBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span>';
      uploadBtn.disabled = true;
      
      try {
        await sendImage(file);
      } finally {
        e.target.value = ""; // reset
        uploadBtn.innerHTML = originalHtml;
        uploadBtn.disabled = false;
      }
    }
  });

  // Initial Visibility
  updateChatVisibility();
}

function renderChatHTML() {
  const html = `
    <div id="chat-drawer-container" class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col items-end pointer-events-none z-[100]">
      
      <!-- Chat Drawer -->
      <div id="chat-drawer" class="pointer-events-auto bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 w-[calc(100vw-2rem)] sm:w-80 md:w-96 h-[65vh] max-h-[600px] sm:h-[500px] mb-4 flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right scale-0 opacity-0">
        
        <!-- Room List View -->
        <div id="chat-room-list-view" class="flex flex-col h-full w-full">
          <div class="glass-header bg-primary/90 text-on-primary px-4 py-3 flex items-center justify-between shadow-sm">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined">forum</span>
              <h3 class="font-bold">Tin nhắn</h3>
            </div>
            <button id="chat-close-btn" class="hover:bg-white/20 p-1 rounded-full transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div id="chat-room-list-content" class="flex-1 overflow-y-auto bg-surface-container-lowest p-2">
            <!-- Room items will be injected here -->
            <div class="flex items-center justify-center h-full text-on-surface-variant text-sm">
              <span class="material-symbols-outlined animate-spin mr-2">sync</span> Đang tải...
            </div>
          </div>
        </div>

        <!-- Chat Window View -->
        <div id="chat-window-view" class="flex flex-col h-full w-full hidden">
          <div class="glass-header bg-primary/90 text-on-primary px-3 py-3 flex items-center justify-between shadow-sm">
            <div class="flex items-center gap-2">
              <button id="chat-back-btn" class="hover:bg-white/20 p-1 rounded-full transition-colors">
                <span class="material-symbols-outlined">arrow_back</span>
              </button>
              <h3 id="chat-header-title" class="font-bold line-clamp-1">Người dùng</h3>
            </div>
          </div>
          
          <div id="chat-messages-content" class="chat-messages-container flex-1 overflow-y-auto bg-surface-container-lowest p-3 flex flex-col gap-3">
            <!-- Messages injected here -->
          </div>

          <div class="p-3 bg-surface border-t border-outline-variant/30">
            <form id="chat-input-form" class="flex items-center gap-2">
              <input type="file" id="chat-file-input" accept="image/*" class="hidden" />
              <button type="button" id="chat-upload-btn" class="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-variant/50 flex-shrink-0">
                <span class="material-symbols-outlined">image</span>
              </button>
              <input type="text" id="chat-message-input" placeholder="Nhập tin nhắn..." class="flex-1 bg-surface-variant/50 border-none rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none transition-shadow" autocomplete="off" />
              <button type="submit" class="bg-primary text-on-primary p-2 rounded-full hover:bg-primary/90 transition-colors shadow-sm flex-shrink-0 flex items-center justify-center">
                <span class="material-symbols-outlined text-sm">send</span>
              </button>
            </form>
          </div>
        </div>

      </div>

      <!-- FAB -->
      <button id="chat-fab-btn" class="pointer-events-auto w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all flex items-center justify-center">
        <span class="material-symbols-outlined text-2xl">chat</span>
        <span id="chat-unread-badge" class="absolute top-0 right-0 w-4 h-4 bg-error text-on-error text-[10px] font-bold flex items-center justify-center rounded-full hidden border-2 border-surface-container-lowest"></span>
      </button>

    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);
}

function toggleChat() {
  isChatOpen = !isChatOpen;
  updateChatVisibility();
  if (isChatOpen && roomListView.classList.contains("hidden") === false) {
    loadRooms();
  }
}

function updateChatVisibility() {
  if (isChatOpen) {
    drawer.classList.remove("scale-0", "opacity-0");
    drawer.classList.add("scale-100", "opacity-100");
    fabBtn.innerHTML = '<span class="material-symbols-outlined text-2xl">close</span>';
  } else {
    drawer.classList.remove("scale-100", "opacity-100");
    drawer.classList.add("scale-0", "opacity-0");
    fabBtn.innerHTML = '<span class="material-symbols-outlined text-2xl">chat</span><span id="chat-unread-badge" class="absolute top-0 right-0 w-4 h-4 bg-error text-on-error text-[10px] font-bold flex items-center justify-center rounded-full hidden border-2 border-surface-container-lowest"></span>';
    updateUnreadBadge();
  }
}

async function loadRooms() {
  try {
    rooms = await chatService.getMyRooms();
    renderRoomList();
    updateUnreadBadge();
  } catch (err) {
    console.error("Failed to load rooms", err);
    roomListContent.innerHTML = `<div class="text-error text-center p-4 text-sm">Không thể tải danh sách trò chuyện</div>`;
  }
}

function renderRoomList() {
  if (!rooms || rooms.length === 0) {
    roomListContent.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-on-surface-variant p-4 text-center">
        <span class="material-symbols-outlined text-4xl mb-2 opacity-50">chat_bubble</span>
        <p class="text-sm">Chưa có tin nhắn nào.<br>Hãy bắt đầu trò chuyện với một tổ chức hoặc thành viên!</p>
      </div>
    `;
    return;
  }

  const myId = getUserIdFromToken();
  roomListContent.innerHTML = rooms.map(room => {
    const isUser1 = room.user1Id === myId;
    const otherUserId = isUser1 ? room.user2Id : room.user1Id;
    const otherUserName = isUser1 ? room.user2Name : room.user1Name;
    const otherUserAvatar = (isUser1 ? room.user2Avatar : room.user1Avatar) || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(otherUserName) + '&background=random';
    
    // Unread logic: if last message exists, is not SENT by me, and status is SENT (not READ)
    const isUnread = room.lastMessage && room.lastMessage.senderId !== myId && room.lastMessage.status === "SENT";

    return `
      <div class="p-3 hover:bg-surface-variant/50 rounded-xl cursor-pointer flex items-center gap-3 transition-colors chat-slide-up" onclick="window.openChatWith('${otherUserId}', '${otherUserName.replace(/'/g, "\\'")}')">
        <img src="${otherUserAvatar}" class="w-12 h-12 rounded-full object-cover border border-outline-variant/30" />
        <div class="flex-1 overflow-hidden">
          <h4 class="font-semibold text-on-surface text-sm line-clamp-1">${otherUserName}</h4>
          <p class="${isUnread ? 'font-bold text-on-surface' : 'text-on-surface-variant'} text-xs line-clamp-1">
            ${room.lastMessage ? (room.lastMessage.senderId === myId ? 'Bạn: ' : '') + (room.lastMessage.content || 'Đã gửi một ảnh') : 'Chưa có tin nhắn'}
          </p>
        </div>
        ${isUnread ? `<div class="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0"></div>` : ''}
      </div>
    `;
  }).join("");
}

function updateUnreadBadge() {
  if (!fabBtn) return;
  const badge = document.getElementById("chat-unread-badge");
  if (!badge) return;
  
  const myId = getUserIdFromToken();
  let unreadCount = 0;
  rooms.forEach(room => {
    if (room.lastMessage && room.lastMessage.senderId !== myId && room.lastMessage.status === "SENT") {
      unreadCount++;
    }
  });

  if (unreadCount > 0) {
    badge.textContent = unreadCount;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

// Global exposure for onClick
window.openChatWith = async (userId, userName) => {
  currentChatUserId = userId;
  chatHeaderTitle.textContent = userName;
  
  roomListView.classList.add("hidden");
  chatWindowView.classList.remove("hidden");
  chatMessagesContent.innerHTML = `
    <div class="flex items-center justify-center h-full text-on-surface-variant text-sm">
      <span class="material-symbols-outlined animate-spin mr-2">sync</span> Đang tải...
    </div>
  `;
  
  if (!isChatOpen) toggleChat();

  try {
    messages = await chatService.getChatHistory(userId);
    if (messages.length > 0) {
      currentRoomId = messages[0].roomId;
    }
    renderMessages();
    
    // Mark as read if we have unread messages from this user
    if (currentRoomId) {
      chatService.markAsRead(currentRoomId, userId);
      // Update local rooms state to clear unread bubble
      const room = rooms.find(r => r.id === currentRoomId);
      if (room && room.lastMessage && room.lastMessage.senderId === userId) {
        room.lastMessage.status = "READ";
      }
    }
  } catch (err) {
    console.error("Failed to load history", err);
    showToast("Không thể tải lịch sử trò chuyện hiện tại. Vui lòng thử lại sau.", "error");
    messages = [];
    renderMessages();
  }
};

function renderMessages() {
  const myId = getUserIdFromToken();
  
  if (!messages || messages.length === 0) {
    chatMessagesContent.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-on-surface-variant p-4 text-center">
        <p class="text-sm">Hãy bắt đầu cuộc trò chuyện!</p>
      </div>
    `;
    return;
  }

  let html = "";
  messages.forEach((msg, idx) => {
    const isMe = msg.senderId === myId;
    const showAvatar = !isMe && (idx === messages.length - 1 || messages[idx + 1].senderId === myId);
    
    html += `
      <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} chat-bubble-anim">
        ${msg.imageUrl ? `
          <div class="mb-1 rounded-2xl overflow-hidden border border-outline-variant/30 max-w-[75%]">
            <a href="${msg.imageUrl}" target="_blank">
              <img src="${msg.imageUrl}" class="w-full h-auto max-h-40 object-cover" />
            </a>
          </div>
        ` : ''}
        ${msg.content ? `
          <div class="px-3.5 py-2 rounded-2xl max-w-[75%] text-sm ${
            isMe 
              ? 'bg-primary text-on-primary chat-message-own' 
              : 'bg-surface-variant text-on-surface-variant chat-message-other border border-outline-variant/30'
          }">
            ${msg.content}
          </div>
        ` : ''}
        ${isMe && idx === messages.length - 1 ? `
          <span class="text-[10px] text-on-surface-variant mt-1 px-1">
            ${msg.status === 'READ' ? 'Đã xem' : 'Đã gửi'}
          </span>
        ` : ''}
      </div>
    `;
  });

  chatMessagesContent.innerHTML = html;
  scrollToBottom();
}

function scrollToBottom() {
  chatMessagesContent.scrollTop = chatMessagesContent.scrollHeight;
}

async function sendMessage() {
  const content = messageInput.value.trim();
  if (!currentChatUserId) {
    showToast("Không thể gửi tin nhắn. Người nhận không xác định.", "error");
    return;
  }
  if (!content) {
    showToast("Nhập nội dung tin nhắn trước khi gửi.", "warning");
    return;
  }

  messageInput.value = "";

  const sent = chatService.sendMessage(currentChatUserId, content);
  if (!sent) {
    showToast("Không thể gửi tin nhắn. Đang kết nối lại chat...", "error");
  }
}

async function sendImage(file) {
  if (!currentChatUserId) return;
  try {
    const url = await uploadImageApi(file);
    chatService.sendMessage(currentChatUserId, "", url);
  } catch (e) {
    console.error("Upload failed", e);
    alert("Không thể gửi ảnh!");
  }
}

// Handlers for incoming STOMP messages
function handleIncomingMessage(msg) {
  // If the message belongs to the current active chat window, append it
  const myId = getUserIdFromToken();
  const isRelatedToCurrentChat = currentChatUserId && (msg.senderId === currentChatUserId || (msg.senderId === myId && (msg.roomId === currentRoomId || !currentRoomId)));

  if (isRelatedToCurrentChat) {
    if (!currentRoomId) currentRoomId = msg.roomId; // capture room ID for first message
    messages.push(msg);
    renderMessages();
    if (msg.senderId === currentChatUserId) {
      chatService.markAsRead(currentRoomId, currentChatUserId);
    }
  }

  // Reload room list to update last message and badge
  loadRooms();
}

function handleIncomingReceipt(receipt) {
  if (currentRoomId && receipt.roomId === currentRoomId) {
    // mark all sent by me as READ
    const myId = getUserIdFromToken();
    let updated = false;
    messages.forEach(m => {
      if (m.senderId === myId && m.status !== "READ") {
        m.status = "READ";
        updated = true;
      }
    });
    if (updated) renderMessages();
  }
}
