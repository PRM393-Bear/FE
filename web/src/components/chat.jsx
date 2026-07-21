import React, { useState, useEffect, useRef } from 'react';
import "../styles/chat.css";
import { chatService } from "../services/chat.service.js";
import { getUserIdFromToken } from "../services/auth.service.js";
import { uploadImageApi } from "../services/auth.service.js";
import { showToast } from "../utils/ui.js";
import { useAuth } from '../context/AuthContext.jsx';

export default function Chat() {
  const { isAuthenticated } = useAuth();
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentChatUserId, setCurrentChatUserId] = useState(null);
  const [currentChatUserName, setCurrentChatUserName] = useState('');
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const chatMessagesContentRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const myId = getUserIdFromToken();

  useEffect(() => {
    if (!isAuthenticated) return;

    chatService.connect(() => {
      loadRooms();
    }, (err) => {
      console.error("Chat connection error", err);
    });

    chatService.onMessage(handleIncomingMessage);
    chatService.onReceipt(handleIncomingReceipt);

    // Global exposure for onClick from other components
    window.openChatWith = async (userId, userName) => {
      setCurrentChatUserId(userId);
      setCurrentChatUserName(userName);
      setIsChatOpen(true);
      
      try {
        const historyMessages = await chatService.getChatHistory(userId);
        if (historyMessages.length > 0) {
          setCurrentRoomId(historyMessages[0].roomId);
          chatService.markAsRead(historyMessages[0].roomId, userId);
        }
        setMessages(historyMessages);
        startPolling(userId);
      } catch (err) {
        console.error("Failed to load history", err);
        showToast("Không thể tải lịch sử trò chuyện hiện tại. Vui lòng thử lại sau.", "error");
        setMessages([]);
      }
    };

    return () => {
      stopPolling();
      // chatService doesn't have an explicit disconnect in this snippet, but good practice
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (chatMessagesContentRef.current) {
      chatMessagesContentRef.current.scrollTop = chatMessagesContentRef.current.scrollHeight;
    }
  }, [messages]);

  const loadRooms = async () => {
    try {
      const fetchedRooms = await chatService.getMyRooms();
      setRooms(fetchedRooms);
    } catch (err) {
      console.error("Failed to load rooms", err);
    }
  };

  const startPolling = (userId) => {
    stopPolling();
    pollIntervalRef.current = setInterval(async () => {
      try {
        const newMessages = await chatService.getChatHistory(userId);
        setMessages(prev => {
          if (newMessages.length > prev.length) {
             if (newMessages.length > 0) {
                 setCurrentRoomId(newMessages[0].roomId);
                 chatService.markAsRead(newMessages[0].roomId, userId);
             }
             return newMessages;
          }
          return prev;
        });
      } catch (e) {}
    }, 3000);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const handleIncomingMessage = (msg) => {
    setMessages(prev => {
      const isRelatedToCurrentChat = currentChatUserId && (msg.senderId === currentChatUserId || (msg.senderId === myId && (msg.roomId === currentRoomId || !currentRoomId)));
      if (isRelatedToCurrentChat) {
        if (!currentRoomId) setCurrentRoomId(msg.roomId);
        if (msg.senderId === currentChatUserId) {
          chatService.markAsRead(msg.roomId || currentRoomId, currentChatUserId);
        }
        return [...prev, msg];
      }
      return prev;
    });
    loadRooms();
  };

  const handleIncomingReceipt = (receipt) => {
    if (currentRoomId && receipt.roomId === currentRoomId) {
      setMessages(prev => prev.map(m => {
        if (m.senderId === myId && m.status !== "READ") {
          return { ...m, status: "READ" };
        }
        return m;
      }));
    }
  };

  const toggleChat = () => {
    setIsChatOpen(prev => {
      if (!prev) loadRooms();
      return !prev;
    });
  };

  const handleBackToRooms = () => {
    setCurrentChatUserId(null);
    setCurrentRoomId(null);
    stopPolling();
    loadRooms();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const content = inputMessage.trim();
    if (!currentChatUserId) {
      showToast("Không thể gửi tin nhắn. Người nhận không xác định.", "error");
      return;
    }
    if (!content) {
      showToast("Nhập nội dung tin nhắn trước khi gửi.", "warning");
      return;
    }

    setInputMessage('');
    const sent = chatService.sendMessage(currentChatUserId, content);
    if (!sent) {
      showToast("Không thể gửi tin nhắn. Đang kết nối lại chat...", "error");
    } else {
      setMessages(prev => [...prev, {
        senderId: myId,
        roomId: currentRoomId,
        content: content,
        status: "SENT",
        createdAt: new Date().toISOString()
      }]);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      try {
        const url = await uploadImageApi(file);
        const sent = chatService.sendMessage(currentChatUserId, "", url);
        if (sent) {
          setMessages(prev => [...prev, {
            senderId: myId,
            roomId: currentRoomId,
            content: "",
            imageUrl: url,
            status: "SENT",
            createdAt: new Date().toISOString()
          }]);
        }
      } catch (err) {
        console.error("Upload failed", err);
        showToast("Không thể gửi ảnh!", "error");
      } finally {
        e.target.value = "";
        setIsUploading(false);
      }
    }
  };

  const getUnreadCount = () => {
    let unreadCount = 0;
    rooms.forEach(room => {
      if (room.lastMessage && room.lastMessage.senderId !== myId && room.lastMessage.status === "SENT") {
        unreadCount++;
      }
    });
    return unreadCount;
  };

  const unreadCount = getUnreadCount();

  if (!isAuthenticated) return null;

  return (
    <div id="chat-drawer-container" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col items-end pointer-events-none z-[100]">
      {/* Chat Drawer */}
      <div 
        id="chat-drawer" 
        className={`pointer-events-auto bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 w-[calc(100vw-2rem)] sm:w-80 md:w-96 h-[65vh] max-h-[600px] sm:h-[500px] mb-4 flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right ${isChatOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
      >
        {!currentChatUserId ? (
          /* Room List View */
          <div id="chat-room-list-view" className="flex flex-col h-full w-full">
            <div className="glass-header bg-primary/90 text-on-primary px-4 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">forum</span>
                <h3 className="font-bold">Tin nhắn</h3>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div id="chat-room-list-content" className="flex-1 overflow-y-auto bg-surface-container-lowest p-2">
              {!rooms ? (
                <div className="flex items-center justify-center h-full text-on-surface-variant text-sm">
                  <span className="material-symbols-outlined animate-spin mr-2">sync</span> Đang tải...
                </div>
              ) : rooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-on-surface-variant p-4 text-center">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">chat_bubble</span>
                  <p className="text-sm">Chưa có tin nhắn nào.<br/>Hãy bắt đầu trò chuyện với một tổ chức hoặc thành viên!</p>
                </div>
              ) : (
                rooms.map(room => {
                  const isUser1 = room.user1Id === myId;
                  const otherUserId = isUser1 ? room.user2Id : room.user1Id;
                  const otherUserName = isUser1 ? room.user2Name : room.user1Name;
                  const otherUserAvatar = (isUser1 ? room.user2Avatar : room.user1Avatar) || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(otherUserName) + '&background=random';
                  const isUnread = room.lastMessage && room.lastMessage.senderId !== myId && room.lastMessage.status === "SENT";

                  return (
                    <div key={room.id} className="p-3 hover:bg-surface-variant/50 rounded-xl cursor-pointer flex items-center gap-3 transition-colors chat-slide-up" onClick={() => window.openChatWith(otherUserId, otherUserName)}>
                      <img src={otherUserAvatar} className="w-12 h-12 rounded-full object-cover border border-outline-variant/30" alt="avatar" />
                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-semibold text-on-surface text-sm line-clamp-1">{otherUserName}</h4>
                        <p className={`${isUnread ? 'font-bold text-on-surface' : 'text-on-surface-variant'} text-xs line-clamp-1`}>
                          {room.lastMessage ? (room.lastMessage.senderId === myId ? 'Bạn: ' : '') + (room.lastMessage.content || 'Đã gửi một ảnh') : 'Chưa có tin nhắn'}
                        </p>
                      </div>
                      {isUnread && <div className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0"></div>}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* Chat Window View */
          <div id="chat-window-view" className="flex flex-col h-full w-full">
            <div className="glass-header bg-primary/90 text-on-primary px-3 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <button onClick={handleBackToRooms} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h3 className="font-bold line-clamp-1">{currentChatUserName}</h3>
              </div>
            </div>
            
            <div ref={chatMessagesContentRef} className="chat-messages-container flex-1 overflow-y-auto bg-surface-container-lowest p-3 flex flex-col gap-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-on-surface-variant p-4 text-center">
                  <p className="text-sm">Hãy bắt đầu cuộc trò chuyện!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderId === myId;
                  return (
                    <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} chat-bubble-anim`}>
                      {msg.imageUrl && (
                        <div className="mb-1 rounded-2xl overflow-hidden border border-outline-variant/30 max-w-[75%]">
                          <a href={msg.imageUrl} target="_blank" rel="noreferrer">
                            <img src={msg.imageUrl} className="w-full h-auto max-h-40 object-cover" alt="chat-img" />
                          </a>
                        </div>
                      )}
                      {msg.content && (
                        <div className={`px-3.5 py-2 rounded-2xl max-w-[75%] text-sm ${isMe ? 'bg-primary text-on-primary chat-message-own' : 'bg-surface-variant text-on-surface-variant chat-message-other border border-outline-variant/30'}`}>
                          {msg.content}
                        </div>
                      )}
                      {isMe && idx === messages.length - 1 && (
                        <span className="text-[10px] text-on-surface-variant mt-1 px-1">
                          {msg.status === 'READ' ? 'Đã xem' : 'Đã gửi'}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 bg-surface border-t border-outline-variant/30">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-variant/50 flex-shrink-0">
                  {isUploading ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">image</span>}
                </button>
                <input type="text" value={inputMessage} onChange={e => setInputMessage(e.target.value)} placeholder="Nhập tin nhắn..." className="flex-1 bg-surface-variant/50 border-none rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none transition-shadow" autoComplete="off" />
                <button type="submit" className="bg-primary text-on-primary p-2 rounded-full hover:bg-primary/90 transition-colors shadow-sm flex-shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* FAB */}
      <button onClick={toggleChat} className="pointer-events-auto w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all flex items-center justify-center">
        {isChatOpen ? <span className="material-symbols-outlined text-2xl">close</span> : <span className="material-symbols-outlined text-2xl">chat</span>}
        {!isChatOpen && unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-error text-on-error text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-surface-container-lowest">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
