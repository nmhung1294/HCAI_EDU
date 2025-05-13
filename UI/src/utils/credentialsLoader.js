/**
 * Utility để đọc và xử lý file credentials
 */

/**
 * Đọc file credentials từ một file JSON
 * Trong môi trường browser, chúng ta không thể đọc file trực tiếp từ hệ thống tệp
 * nên cần import file hoặc đặt biến trực tiếp
 * 
 * @returns {Promise<Object>} - Firebase credentials
 */
export const loadFirebaseCredentials = async () => {
  try {
    // Trong môi trường thực tế, bạn có thể:
    // 1. Import trực tiếp nếu sử dụng bundler như webpack/vite
    // 2. Fetch từ một API endpoint an toàn
    // 3. Đặt biến môi trường khi build
    
    // Cho demo, chúng ta sẽ import trực tiếp
    const credentials = await import('../../google_credentials.json');
    return credentials.default || credentials;
  } catch (error) {
    console.error('Không thể đọc file credentials:', error);
    
    // Nếu không đọc được file, hiển thị thông báo cho user
    alert('Không thể đọc file credentials. Vui lòng kiểm tra lại file google_credentials.json');
    
    // Trả về đối tượng rỗng để tránh lỗi
    return {};
  }
};

/**
 * Kiểm tra xem credentials có đầy đủ thông tin không
 * @param {Object} credentials - Firebase credentials để kiểm tra
 * @returns {boolean} - true nếu credentials hợp lệ
 */
export const validateCredentials = (credentials) => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  
  for (const field of requiredFields) {
    if (!credentials[field]) {
      console.error(`Thiếu trường bắt buộc trong credentials: ${field}`);
      return false;
    }
  }
  
  return true;
}; 