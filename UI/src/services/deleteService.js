import axios from "axios";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getFirestoreDb } from "./firebaseService"; 

const API_URL = "http://localhost:8000/delete_pdf/"; // API endpoint để xóa file

/**
 * Xóa file PDF khỏi server và bản ghi tương ứng khỏi Firestore
 * @param {string} filePath - Đường dẫn đầy đủ đến file PDF (vd: models/uploaded_files/userId/filename.pdf)
 * @param {string} userId - ID của người dùng sở hữu file
 * @returns {Promise<Object>} - Kết quả xóa file
 */
export async function deletePdfFile(filePath, userId) {
  try {
    
    // 1. Xóa file vật lý trên server bằng API
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("file_path", filePath);
    
    // Gọi API xóa file
    const response = await axios.delete(API_URL, {
      data: formData,  
      headers: { 
        'Content-Type': 'multipart/form-data' 
      }
    });
    
    // 2. Xóa bản ghi trong Firestore
    const db = getFirestoreDb();
    if (!db) throw new Error("Firestore chưa được khởi tạo");
    
    // Truy vấn để tìm document có file_path tương ứng
    const filesRef = collection(db, "users", userId, "file_uploaded");
    const q = query(filesRef, where("file_path", "==", filePath));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.warn("Không tìm thấy bản ghi Firestore cho file này");
    } else {
      // Xóa tất cả document khớp với file_path
      for (const docSnapshot of querySnapshot.docs) {
        await deleteDoc(doc(db, "users", userId, "file_uploaded", docSnapshot.id));
        console.log(`Đã xóa document ${docSnapshot.id} khỏi Firestore`);
      }
    }
    
    return {
      success: true,
      message: "Đã xóa file thành công",
      serverResponse: response.data
    };
    
  } catch (error) {
    if (error.response) {
      // Lỗi từ phản hồi API
      return {
        success: false,
        message: error.response.data?.detail || "Không thể xóa file từ server",
        statusCode: error.response.status
      };
    }
    
    return {
      success: false,
      message: "Lỗi khi xóa file: " + error.message
    };
  }
}
