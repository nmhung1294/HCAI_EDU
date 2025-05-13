import { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import theme from './theme';
import ChatContainer from './components/Chat/ChatContainer';
import Login from './components/Auth/Login';
import IELTSVocabularyQuery from './components/IELTSVocabularyQuery';
import { AuthProvider, useAuth } from './context/AuthContext';
import { loadFirebaseCredentials, validateCredentials } from './utils/credentialsLoader';
import { initializeFirebase } from './services/firebaseService';
import { isAuthenticated } from './services/authService';

// Firebase Initializer Component
const FirebaseInitializer = ({ children }) => {
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {

        // Load Firebase credentials
        const credentials = await loadFirebaseCredentials();

        // Validate credentials
        if (!validateCredentials(credentials)) {
          setError('Firebase credentials không hợp lệ. Vui lòng kiểm tra file google_credentials.json');
          return;
        }

        // Initialize Firebase
        await initializeFirebase(credentials);
        // Set initialized flag
        setIsFirebaseInitialized(true);
      } catch (error) {
        setError('Không thể khởi tạo Firebase. Vui lòng kiểm tra cấu hình.');
      }
    };

    initializeApp();
  }, []);

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: 'background.dark',
          color: 'error.main',
          p: 3,
          textAlign: 'center',
        }}
      >
        <h2>Lỗi khởi tạo Firebase</h2>
        <p>{error}</p>
        <p>Vui lòng kiểm tra file google_credentials.json và làm mới trang.</p>
      </Box>
    );
  }

  if (!isFirebaseInitialized) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: 'background.dark',
        }}
      >
        <CircularProgress size={40} sx={{ color: 'primary.main' }} />
        <Box sx={{ mt: 2, color: 'text.light' }}>Đang khởi tạo Firebase...</Box>
      </Box>
    );
  }

  return children;
};

// Protected Route Component - Chuyển hướng nếu chưa đăng nhập
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Kiểm tra luôn trong localStorage nếu Firebase đang loading
  const isLocalStorageAuthenticated = !!localStorage.getItem('auth_token');

  // Trong khi đang loading, kiểm tra localStorage
  if (loading) {
    // Kiểm tra token trong localStorage trong khi đợi Firebase load
    if (isLocalStorageAuthenticated) {
      return children;
    }

    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: 'background.dark',
        }}
      >
        <CircularProgress size={40} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  // Nếu đã xác thực qua AuthContext hoặc localStorage
  if (isAuthenticated || isLocalStorageAuthenticated) {
    return children;
  }

  // Redirect to login with return URL
  return <Navigate to="/login" state={{ from: location }} replace />;
};

// Login Route Component - Chuyển hướng nếu đã đăng nhập
const LoginRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Kiểm tra luôn trong localStorage nếu Firebase đang loading
  const isLocalStorageAuthenticated = !!localStorage.getItem('auth_token');

  // Kiểm tra nếu đã đăng nhập thì chuyển hướng về trang chính hoặc trang trước đó
  useEffect(() => {
    // Nếu không còn loading và đã xác thực qua AuthContext hoặc localStorage
    if (!loading && (isAuthenticated || isLocalStorageAuthenticated)) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location, isLocalStorageAuthenticated]);

  // Kiểm tra tức thì nếu đã đăng nhập qua localStorage
  useEffect(() => {
    if (isLocalStorageAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, []);

  // Hiển thị loading trong khi kiểm tra trạng thái đăng nhập
  if (loading) {
    // Nếu có token trong localStorage, chuyển hướng ngay lập tức
    if (isLocalStorageAuthenticated) {
      return <Navigate to="/" replace />;
    }

    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: 'background.dark',
        }}
      >
        <CircularProgress size={40} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  // Nếu đã xác thực, chuyển hướng đến trang chính
  if (isAuthenticated || isLocalStorageAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Nếu chưa đăng nhập thì hiển thị trang đăng nhập
  return <Login />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FirebaseInitializer>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginRoute />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <ChatContainer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ielts-vocabulary"
                element={
                  <ProtectedRoute>
                    <IELTSVocabularyQuery />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </FirebaseInitializer>
    </ThemeProvider>
  );
}

export default App;
