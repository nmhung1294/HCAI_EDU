import { useState, useEffect, useCallback } from 'react';
import { 
  sendMessage, 
  getChatHistory,
  loadChatFromFirebase,
  deleteChatFromFirebase
} from '../services/chatService';
import { getUserInfo } from '../services/authService';

/**
 * Custom hook để quản lý các chức năng chat và lịch sử
 * @returns {Object} Các state và function để quản lý chat
 */
export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedChats, setSavedChats] = useState([]);
  const [isSavedChatsLoading, setIsSavedChatsLoading] = useState(false);

  // Load chat history from Firebase when user logs in
  useEffect(() => {
    const loadSavedChats = async () => {
      const user = getUserInfo();
      if (user && user.id) {
        setIsSavedChatsLoading(true);
        try {
          const chats = await getChatHistory();
          setSavedChats(chats);
        } catch (err) {
          console.error('Lỗi khi tải lịch sử chat:', err);
        } finally {
          setIsSavedChatsLoading(false);
        }
      }
    };

    loadSavedChats();
  }, []);

  /**
   * Gửi tin nhắn và thêm phản hồi vào danh sách chat
   * @param {string} message - Tin nhắn của người dùng
   */
  const sendUserMessage = async (message) => {
    if (!message.trim()) return;
    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);
    try {
      const botResponse = await sendMessage(message);
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      refreshSavedChats();
    } catch (err) {
      setError(err.message || 'Không thể nhận phản hồi từ trợ lý AI');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Làm mới danh sách cuộc trò chuyện đã lưu từ Firebase
   */
  const refreshSavedChats = useCallback(async () => {
    const user = getUserInfo();
    if (!user || !user.id) return;
    setIsSavedChatsLoading(true);
    try {
      const chats = await getChatHistory();
      setSavedChats(chats);
    } catch (err) {
      console.error('Lỗi khi tải lịch sử chat:', err);
    } finally {
      setIsSavedChatsLoading(false);
    }
  }, []);

  /**
   * Xóa tất cả tin nhắn trong cuộc hội thoại hiện tại
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /**
   * Tải một cuộc trò chuyện từ Firebase
   * @param {string} chatId - ID cuộc trò chuyện
   */
  const loadChat = useCallback(async (chatId) => {
    setIsLoading(true);
    try {
      const chatMessages = await loadChatFromFirebase(chatId);
      if (chatMessages) {
        setMessages(chatMessages);
      }
    } catch (err) {
      setError('Không thể tải cuộc trò chuyện. Vui lòng thử lại.');
      console.error('Lỗi khi tải cuộc trò chuyện:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Xóa một cuộc trò chuyện khỏi Firebase
   * @param {string} chatId - ID cuộc trò chuyện
   */
  const deleteChat = useCallback(async (chatId) => {
    try {
      await deleteChatFromFirebase(chatId);
      const currentChat = window.currentChatId;
      if (currentChat === chatId) {
        setMessages([]);
      }
      refreshSavedChats();
      return true;
    } catch (err) {
      console.error('Lỗi khi xóa cuộc trò chuyện:', err);
      return false;
    }
  }, [refreshSavedChats]);

  return {
    messages,
    isLoading,
    error,
    savedChats,
    isSavedChatsLoading,
    sendUserMessage,
    clearMessages,
    refreshSavedChats,
    loadChat,
    deleteChat
  };
};
