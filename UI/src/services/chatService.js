/**
 * Chat service - Sử dụng Firebase để lưu trữ dữ liệu
 */
import { 
  saveChat, 
  getUserChats, 
  getChat, 
  deleteChat 
} from './firebaseService';
import { getUserInfo } from './authService';

/**
 * Tạo ID cho cuộc trò chuyện
 * @returns {string} - Chat ID
 */
const generateChatId = () => {
  return `chat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

/**
 * Gửi tin nhắn và nhận phản hồi từ API
 * @param {string} userInput - Tin nhắn người dùng
 * @returns {Promise<string>} - Phản hồi từ bot
 */
export const sendMessage = async (userInput) => {
  try {
    // Kiểm tra trong localStorage nếu có bookmarked_files
    const bookmarkedFiles = JSON.parse(localStorage.getItem('bookmarked_files') || '[]');
    const user = getUserInfo();
    const userId = user ? user.id : '';
    
    let response;
    
    if (bookmarkedFiles && bookmarkedFiles.length > 0) {
      // Nếu có bookmarked_files, gọi API chat_with_file
      response = await fetch('http://localhost:8000/chat_with_file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_input: userInput,
          file_path: bookmarkedFiles,
          user_id: userId
        }),
      });
    } else {
      // Nếu không có bookmarked_files, gọi API chat thông thường
      response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_input: userInput }),
      });
    }

    if (!response.ok) {
      throw new Error('Failed to fetch response from chat API');
    }

    const data = await response.json();
    const botResponse = data.bot_response;

    const currentTime = new Date();
    const userMessage = {
      id: `user-${currentTime.getTime()}`,
      text: userInput,
      sender: 'user',
      timestamp: currentTime.toISOString()
    };
    const botMessage = {
      id: `bot-${currentTime.getTime() + 1}`,
      text: botResponse,
      sender: 'bot',
      timestamp: new Date(currentTime.getTime() + 1000).toISOString()
    };
    if (user && user.id) {
      const chatId = window.currentChatId || generateChatId();
      window.currentChatId = chatId;
      const title = window.currentChatTitle || userInput.slice(0, 30) + (userInput.length > 30 ? '...' : '');
      window.currentChatTitle = title;
      try {
        await saveChat(user.id, chatId, {
          title: title,
          messages: [userMessage, botMessage],
          lastMessage: botMessage.text,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Không thể lưu chat vào Firestore:', error);
      }
    }
    return botResponse;
  } catch (error) {
    console.error('Lỗi xử lý tin nhắn:', error);
    throw new Error('Không thể xử lý tin nhắn. Vui lòng thử lại sau.');
  }
};


/**
 * Lấy tất cả cuộc trò chuyện từ Firebase
 * @returns {Promise<Array>} - Danh sách cuộc trò chuyện
 */
export const getChatHistory = async () => {
  const user = getUserInfo();
  if (!user || !user.id) {
    return [];
  }
  try {
    const chats = await getUserChats(user.id);
    localStorage.setItem('saved_chats', JSON.stringify(chats));
    return chats;
  } catch (error) {
    console.error('Lỗi lấy lịch sử chat từ Firebase:', error);
    try {
      const localChats = localStorage.getItem('saved_chats');
      if (localChats) {
        return JSON.parse(localChats);
      }
    } catch (localError) {
      console.error('Không thể đọc lịch sử chat từ localStorage:', localError);
    }
    return [];
  }
};

/**
 * Tải một cuộc trò chuyện từ Firebase
 * @param {string} chatId - ID cuộc trò chuyện
 * @returns {Promise<Array>} - Danh sách tin nhắn
 */
export const loadChatFromFirebase = async (chatId) => {
  const user = getUserInfo();
  if (!user || !user.id) {
    return null;
  }
  try {
    const chat = await getChat(user.id, chatId);
    if (chat && chat.messages) {
      window.currentChatId = chatId;
      window.currentChatTitle = chat.title;
      return chat.messages;
    }
    return null;
  } catch (error) {
    console.error('Lỗi tải cuộc trò chuyện:', error);
    return null;
  }
};

/**
 * Xóa một cuộc trò chuyện từ Firebase
 * @param {string} chatId - ID cuộc trò chuyện
 * @returns {Promise<boolean>} - Kết quả xóa
 */
export const deleteChatFromFirebase = async (chatId) => {
  const user = getUserInfo();
  if (!user || !user.id) {
    return false;
  }
  try {
    await deleteChat(user.id, chatId);
    if (window.currentChatId === chatId) {
      window.currentChatId = null;
      window.currentChatTitle = null;
    }
    return true;
  } catch (error) {
    console.error('Lỗi xóa cuộc trò chuyện:', error);
    return false;
  }
};