/**
 * Dịch vụ xác thực người dùng sử dụng Firebase
 */
import { 
  authenticateWithGoogle, 
  signOutFirebase,
  saveUserData
} from './firebaseService';

/**
 * Xử lý đăng nhập Google và lưu thông tin vào Firebase
 * @param {string} tokenId - Google token ID
 * @returns {Promise<Object>} - Thông tin người dùng
 */
export const loginWithGoogle = async (tokenId) => {
  try {
    // Xác thực với Firebase Auth
    const firebaseUser = await authenticateWithGoogle(tokenId);
    
    // Lấy thông tin cần thiết từ Firebase user
    const user = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName,
      email: firebaseUser.email,
      picture: firebaseUser.photoURL
    };
    
    // Lưu thông tin người dùng vào Firestore
    await saveUserData(user.id, {
      name: user.name,
      email: user.email,
      picture: user.picture
    });
    
    // Lưu token và thông tin người dùng vào localStorage để giữ phiên đăng nhập
    try {
      const token = await firebaseUser.getIdToken(true);
      localStorage.setItem('auth_token', token || firebaseUser.accessToken || tokenId);
      console.log("Firebase token saved to localStorage");
    } catch (tokenError) {
      console.warn("Could not get Firebase token, using fallback", tokenError);
      localStorage.setItem('auth_token', firebaseUser.accessToken || tokenId || 'firebase_auth');
    }
    
    localStorage.setItem('user_info', JSON.stringify(user));
    
    return {
      token: firebaseUser.accessToken || tokenId,
      user
    };
  } catch (error) {
    console.error('Lỗi đăng nhập Google:', error);
    throw new Error('Đăng nhập thất bại, vui lòng thử lại');
  }
};

/**
 * Kiểm tra nếu người dùng đã đăng nhập
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  // Kiểm tra cả thông tin user_info để hỗ trợ trường hợp Firebase không có auth_token
  const hasToken = !!localStorage.getItem('auth_token');
  
  if (hasToken) {
    return true;
  }
  
  // Kiểm tra xem có thông tin user không
  const userInfo = localStorage.getItem('user_info');
  if (userInfo) {
    try {
      const user = JSON.parse(userInfo);
      // Nếu có thông tin user hợp lệ, coi như đã xác thực
      if (user && user.id && user.email) {
        // Tạo một token giả để duy trì xác thực
        localStorage.setItem('auth_token', `firebase_user_${user.id}`);
        console.log("Created fallback token from user info");
        return true;
      }
    } catch (e) {
      console.error("Error parsing user_info:", e);
    }
  }
  
  return false;
};

/**
 * Lấy thông tin người dùng từ localStorage
 * @returns {Object|null}
 */
export const getUserInfo = () => {
  const userInfo = localStorage.getItem('user_info');
  return userInfo ? JSON.parse(userInfo) : null;
};

/**
 * Đăng xuất người dùng
 */
export const logout = async () => {
  try {
    // Đăng xuất khỏi Firebase
    await signOutFirebase();
    
    // Xóa thông tin đăng nhập trong localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
  } catch (error) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    
    throw error;
  }
};

/**
 * Lấy token xác thực
 * @returns {string|null}
 */
export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
}; 