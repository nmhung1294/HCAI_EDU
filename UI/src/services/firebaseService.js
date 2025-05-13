import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCredential, 
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  signInWithPopup,
  getRedirectResult
} from 'firebase/auth';
import { 
  getFirestore as getFirestoreFromFirebase, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  Timestamp,
  deleteDoc
} from 'firebase/firestore';

let app;
let auth;
let db;

// Lưu cache credentials để khởi tạo lại Firebase khi cần
let cachedCredentials = null;

/**
 * Khởi tạo Firebase với credentials từ file
 * @param {Object} credentials - Thông tin xác thực Firebase từ file google_credentials.json
 */
export const initializeFirebase = (credentials) => {
  try {
    // Lưu credentials để có thể khởi tạo lại khi cần
    cachedCredentials = credentials;
    
    // Cấu hình Firebase
    const firebaseConfig = {
      apiKey: credentials.apiKey,
      authDomain: credentials.authDomain,
      projectId: credentials.projectId,
      storageBucket: credentials.storageBucket,
      messagingSenderId: credentials.messagingSenderId,
      appId: credentials.appId
    };

    // Khởi tạo Firebase
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestoreFromFirebase(app);
    return { app, auth, db };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy Firebase app instance
 * @returns {Object} Firebase app instance
 */
export const getFirebaseApp = () => {
  if (!app && cachedCredentials) {
    // Nếu app chưa được khởi tạo nhưng có cached credentials, khởi tạo lại
    try {
      initializeFirebase(cachedCredentials);
    } catch (error) {
      console.error('Lỗi khi khởi tạo lại Firestore:', error);
    }
  }
  return app;
};

/**
 * Lấy Firebase auth instance
 * @returns {Object} Firebase auth instance
 */
export const getFirebaseAuth = () => {
  if (!auth && cachedCredentials) {
    // Nếu auth chưa được khởi tạo nhưng có cached credentials, khởi tạo lại
    initializeFirebase(cachedCredentials);
  }
  return auth;
};

/**
 * Lấy Firestore database instance
 * @returns {Object} Firestore database instance
 */
export const getFirestoreDb = () => {
  if (!db && cachedCredentials) {
    // Nếu db chưa được khởi tạo nhưng có cached credentials, khởi tạo lại
    try {
      initializeFirebase(cachedCredentials);
    } catch (error) {
      console.error('Lỗi khi khởi tạo lại Firestore:', error);
    }
  }
  return db;
};

/**
 * Xác thực người dùng với Google ID token
 * @param {string} idToken - Google ID token
 * @returns {Promise<Object>} Thông tin người dùng đã xác thực
 */
export const authenticateWithGoogle = async (idToken) => {
  try {
    const auth = getFirebaseAuth();
    // Tạo credential từ Google token
    const credential = GoogleAuthProvider.credential(idToken);
    
    // Đăng nhập vào Firebase với credential
    const result = await signInWithCredential(auth, credential);
    
    // Trả về thông tin người dùng
    return result.user;
  } catch (error) {
    console.error('Lỗi xác thực Google với Firebase:', error);
    throw error;
  }
};

/**
 * Lưu thông tin người dùng vào Firestore
 * @param {string} userId - ID người dùng
 * @param {Object} userData - Thông tin người dùng để lưu
 * @returns {Promise<void>}
 */
export const saveUserData = async (userId, userData) => {
  if (!userId) {
    console.error('userId không hợp lệ:', userId);
    throw new Error('userId không hợp lệ');
  }
  
  try {
    const db = getFirestoreDb();
    if (!db) {
      throw new Error('Firestore chưa được khởi tạo');
    }
    
    const userRef = doc(db, 'users', userId);
    
    // Kiểm tra nếu document đã tồn tại
    try {
      const userDoc = await getDoc(userRef);
      
      // Thêm lastLogin timestamp
      const updatedData = {
        ...userData,
        lastLogin: Timestamp.now()
      };
      
      if (userDoc.exists()) {
        // Nếu đã tồn tại, cập nhật
        console.log('Cập nhật thông tin người dùng hiện có');
        await updateDoc(userRef, updatedData);
      } else {
        // Nếu chưa tồn tại, tạo mới và thêm created timestamp
        console.log('Tạo thông tin người dùng mới');
        await setDoc(userRef, {
          ...updatedData,
          created: Timestamp.now()
        });
      }
    } catch (docError) {
      console.error('Lỗi khi đọc/ghi document:', docError);
      throw docError;
    }
  } catch (error) {
    console.error('Lỗi lưu thông tin người dùng:', error);
    // Không throw error để không ảnh hưởng đến luồng đăng nhập
    return null;
  }
};

/**
 * Lưu một cuộc trò chuyện vào Firestore
 * @param {string} userId - ID người dùng
 * @param {string} chatId - ID cuộc trò chuyện
 * @param {Object} chatData - Dữ liệu cuộc trò chuyện
 * @returns {Promise<void>}
 */
export const saveChat = async (userId, chatId, chatData) => {
  if (!userId || !chatId) {
    console.error('userId hoặc chatId không hợp lệ');
    return;
  }
  try {
    const db = getFirestoreDb();
    if (!db) {
      console.error('Firestore chưa được khởi tạo');
      return;
    }
    
    const chatRef = doc(db, 'users', userId, 'chats', chatId);
    
    // Lấy dữ liệu cuộc trò chuyện hiện tại
    const chatDoc = await getDoc(chatRef);
    const existingMessages = chatDoc.exists() ? chatDoc.data().messages : [];
    
    // Thêm tin nhắn mới vào danh sách
    const updatedMessages = [...existingMessages, ...chatData.messages];
    
    // Lưu lại toàn bộ lịch sử cuộc trò chuyện
    await setDoc(chatRef, {
      ...chatData,
      messages: updatedMessages,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy tất cả cuộc trò chuyện của người dùng
 * @param {string} userId - ID người dùng
 * @returns {Promise<Array>} Danh sách cuộc trò chuyện
 */
export const getUserChats = async (userId) => {
  if (!userId) {
    console.error('userId không hợp lệ');
    return [];
  }
  
  try {
    const db = getFirestoreDb();
    if (!db) {
      console.error('Firestore chưa được khởi tạo');
      return [];
    }
    
    const chatsRef = collection(db, 'users', userId, 'chats');
    const q = query(chatsRef, orderBy('updatedAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const chats = [];
    
    querySnapshot.forEach((doc) => {
      chats.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return chats;
  } catch (error) {
    console.error('Lỗi lấy cuộc trò chuyện:', error);
    return []; // Trả về mảng rỗng để tránh lỗi
  }
};

/**
 * Lấy một cuộc trò chuyện cụ thể
 * @param {string} userId - ID người dùng
 * @param {string} chatId - ID cuộc trò chuyện
 * @returns {Promise<Object|null>} Dữ liệu cuộc trò chuyện
 */
export const getChat = async (userId, chatId) => {
  if (!userId || !chatId) {
    console.error('userId hoặc chatId không hợp lệ');
    return null;
  }
  
  try {
    const db = getFirestoreDb();
    if (!db) {
      console.error('Firestore chưa được khởi tạo');
      return null;
    }
    
    const chatRef = doc(db, 'users', userId, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);
    
    if (chatDoc.exists()) {
      return {
        id: chatDoc.id,
        ...chatDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Lỗi lấy cuộc trò chuyện:', error);
    return null;
  }
};

/**
 * Xóa một cuộc trò chuyện
 * @param {string} userId - ID người dùng
 * @param {string} chatId - ID cuộc trò chuyện
 * @returns {Promise<boolean>} Kết quả xóa
 */
export const deleteChat = async (userId, chatId) => {
  if (!userId || !chatId) {
    console.error('userId hoặc chatId không hợp lệ');
    return false;
  }
  
  try {
    const db = getFirestoreDb();
    if (!db) {
      console.error('Firestore chưa được khởi tạo');
      return false;
    }
    
    const chatRef = doc(db, 'users', userId, 'chats', chatId);
    await deleteDoc(chatRef);
    console.log(`Đã xóa chat ${chatId}`);
    return true;
  } catch (error) {
    console.error('Lỗi xóa cuộc trò chuyện:', error);
    return false;
  }
};

/**
 * Đăng xuất người dùng
 * @returns {Promise<void>}
 */
export const signOutFirebase = async () => {
  try {
    const auth = getFirebaseAuth();
    if (!auth) {
      console.error('Firebase Auth chưa được khởi tạo');
      return;
    }
    
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    throw error;
  }
};

// Function to authenticate with Google using popup
export const authenticateWithGooglePopup = async () => {
  try {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Error during Google authentication:', error);
    throw error;
  }
};

// Function to handle redirect result
export const handleRedirectResult = async () => {
  try {
    const auth = getFirebaseAuth();
    const result = await getRedirectResult(auth);
    if (result) {
      return result.user;
    }
    return null;
  } catch (error) {
    throw error;
  }
}; 