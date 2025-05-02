# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Ứng dụng Chatbot với Firebase

Ứng dụng chatbot này tích hợp với Google để đăng nhập và Firebase để lưu trữ lịch sử chat, cho phép người dùng truy cập trên nhiều thiết bị.

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Chạy ứng dụng trong development mode
npm run dev

# Build cho production
npm run build
```

## Cấu hình Firebase

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo một dự án mới
3. Trong dự án, thêm một ứng dụng web
4. Sao chép thông tin cấu hình từ Firebase
5. Cập nhật file `google_credentials.json` ở thư mục gốc với thông tin sau:

```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_PROJECT_ID.firebaseapp.com",
  "projectId": "YOUR_PROJECT_ID",
  "storageBucket": "YOUR_PROJECT_ID.appspot.com",
  "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
  "appId": "YOUR_APP_ID"
}
```

### Cấu hình Authentication

1. Trong Firebase Console, vào mục Authentication
2. Bật provider "Google"
3. Thêm domain của bạn vào danh sách được phép

### Cấu hình Firestore Database

1. Trong Firebase Console, vào mục Firestore Database
2. Tạo database mới (có thể chọn test mode khi phát triển)
3. Thiết lập các quy tắc bảo mật:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /chats/{chatId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```


- Xuất chat ra file text

## Chú ý

- File `google_credentials.json` chứa thông tin nhạy cảm, không nên đưa vào quản lý mã nguồn (git)
- Tài khoản Firebase của bạn có thể phát sinh chi phí nếu vượt quá hạn mức miễn phí
