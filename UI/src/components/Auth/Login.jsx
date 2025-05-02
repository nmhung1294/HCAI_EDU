import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Button,
    Paper,
    Typography,
    Container,
    CircularProgress,
    Alert,
    Divider
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { authenticateWithGooglePopup, handleRedirectResult } from '../../services/firebaseService';

const Login = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [redirectStarted, setRedirectStarted] = useState(false);

    // Kiểm tra localStorage mỗi khi component mount
    useEffect(() => {
        // Kiểm tra xem có token trong localStorage không
        const authToken = localStorage.getItem('auth_token');
        // Nếu đã có token trong localStorage, chuyển hướng ngay
        if (authToken) {
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        }
    }, []);

    useEffect(() => {
        const checkRedirectResult = async () => {
            try {
                const user = await handleRedirectResult();
                if (user) {
                    const from = location.state?.from?.pathname || '/';
                    navigate(from, { replace: true });
                }
            } catch (error) {
                setError('Lỗi khi xử lý kết quả đăng nhập. Vui lòng thử lại.');
            }
        };
        checkRedirectResult();
    }, []);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        setRedirectStarted(false);

        try {
            await authenticateWithGooglePopup();
            setRedirectStarted(true);

        } catch (err) {
            console.error("Login error:", err);
            sessionStorage.removeItem('login_requested');
            setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
            setLoading(false);
            setRedirectStarted(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        borderRadius: 3,
                        bgcolor: 'background.paper',
                        boxShadow: (theme) => theme.palette.mode === 'dark'
                            ? '0 8px 32px rgba(0, 0, 0, 0.5)'
                            : '0 8px 32px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <Typography
                        variant="h3"
                        component="h1"
                        sx={{
                            mb: 3,
                            color: 'primary.main',
                            fontWeight: 'bold',
                            letterSpacing: '-0.5px'
                        }}
                    >
                        Trợ lý AI
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            mb: 4,
                            textAlign: 'center',
                            color: 'text.secondary',
                            maxWidth: '80%'
                        }}
                    >
                        Đăng nhập để bắt đầu cuộc trò chuyện với trợ lý thông minh
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
                            {error}
                        </Alert>
                    )}

                    <Button
                        variant="contained"
                        size="large"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
                        onClick={handleGoogleLogin}
                        disabled={loading || redirectStarted}
                        sx={{
                            py: 1.5,
                            width: '100%',
                            borderRadius: 2,
                            bgcolor: loading ? 'primary.dark' : 'primary.main',
                            '&:hover': {
                                bgcolor: 'primary.dark',
                            },
                        }}
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập với Google'}
                    </Button>

                    {(loading || redirectStarted) && (
                        <Alert severity="info" sx={{ mt: 3, width: '100%' }}>
                            Bạn sẽ được chuyển hướng đến trang đăng nhập Google. Sau khi đăng nhập thành công, bạn sẽ được chuyển về ứng dụng.
                        </Alert>
                    )}

                    <Divider sx={{ width: '100%', my: 4 }} />

                    <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                        Ứng dụng này sử dụng Google Firebase để xác thực và lưu trữ dữ liệu.
                        <br />
                        Đăng nhập để sử dụng đầy đủ tính năng.
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login; 