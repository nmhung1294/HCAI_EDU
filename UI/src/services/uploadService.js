import axios from "axios";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { getFirestoreDb } from "./firebaseService"; 

const API_URL = "http://localhost:8000/upload_pdf/"; // Đổi lại nếu backend bạn chạy port khác

// Hàm upload file PDF lên FastAPI
export async function uploadPdfFile(file, userId) {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("file", file);

  // Gửi file lên FastAPI
  const response = await axios.post(API_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  // Lưu đường dẫn file vào Firestore
  const filePath = response.data.file_path;
  const db = getFirestoreDb();
  await addDoc(collection(db, "users", userId, "file_uploaded"), {
    file_path: filePath,
    uploadedAt: new Date(),
  });
  return filePath;
}


// Lấy danh sách file_uploaded của 1 user
export async function getUserUploadedFiles(userId) {
  const db = getFirestoreDb();
  if (!db) throw new Error("Firestore chưa được khởi tạo");

  const filesRef = collection(db, "users", userId, "file_uploaded");
  const querySnapshot = await getDocs(filesRef);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}