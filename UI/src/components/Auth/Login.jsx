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
    Divider,
    Avatar,
    useTheme,
    alpha
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import { authenticateWithGooglePopup, handleRedirectResult } from '../../services/firebaseService';

const Login = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [redirectStarted, setRedirectStarted] = useState(false);
    const theme = useTheme();

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
        <Box
            sx={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                overflow: 'hidden',
                position: 'relative',
                bgcolor: 'background.dark',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backgroundImage: 'radial-gradient(circle at 90% 10%, rgba(14, 165, 233, 0.15), transparent 30%), radial-gradient(circle at 10% 90%, rgba(99, 102, 241, 0.1), transparent 30%)',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    zIndex: 0,
                },
            }}
        >
            {/* Floating Elements Animation */}
            <Box
                sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    zIndex: 0,
                }}
            >
                {[...Array(6)].map((_, index) => (
                    <Box
                        key={index}
                        sx={{
                            position: 'absolute',
                            width: index % 2 ? '10px' : '15px',
                            height: index % 2 ? '10px' : '15px',
                            borderRadius: '50%',
                            backgroundColor: index % 3 === 0
                                ? alpha(theme.palette.primary.main, 0.2)
                                : index % 3 === 1
                                    ? alpha(theme.palette.secondary.main, 0.15)
                                    : alpha(theme.palette.accent.main, 0.1),
                            boxShadow: `0 0 20px ${index % 3 === 0
                                ? alpha(theme.palette.primary.main, 0.4)
                                : index % 3 === 1
                                    ? alpha(theme.palette.secondary.main, 0.4)
                                    : alpha(theme.palette.accent.main, 0.4)}`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animation: `float-${index} ${8 + index * 4}s ease-in-out infinite`,
                            '@keyframes float-0': {
                                '0%, 100%': { transform: 'translate(0, 0)' },
                                '50%': { transform: 'translate(100px, 30px)' },
                            },
                            '@keyframes float-1': {
                                '0%, 100%': { transform: 'translate(0, 0)' },
                                '50%': { transform: 'translate(-70px, 70px)' },
                            },
                            '@keyframes float-2': {
                                '0%, 100%': { transform: 'translate(0, 0)' },
                                '50%': { transform: 'translate(50px, -50px)' },
                            },
                            '@keyframes float-3': {
                                '0%, 100%': { transform: 'translate(0, 0)' },
                                '50%': { transform: 'translate(-100px, -30px)' },
                            },
                            '@keyframes float-4': {
                                '0%, 100%': { transform: 'translate(0, 0)' },
                                '50%': { transform: 'translate(80px, 80px)' },
                            },
                            '@keyframes float-5': {
                                '0%, 100%': { transform: 'translate(0, 0)' },
                                '50%': { transform: 'translate(-50px, -100px)' },
                            },
                        }}
                    />
                ))}
            </Box>

            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
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
                        elevation={4}
                        sx={{
                            p: { xs: 3, sm: 5 },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '100%',
                            borderRadius: 4,
                            bgcolor: 'background.darkLight',
                            color: 'text.light',
                            position: 'relative',
                            overflow: 'hidden',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '6px',
                                background: theme.palette.gradient.primary,
                                borderTopLeftRadius: '16px',
                                borderTopRightRadius: '16px',
                            },
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 70,
                                height: 70,
                                bgcolor: 'transparent',
                                mb: 3,
                                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
                                backdropFilter: 'blur(8px)',
                                border: '2px solid',
                                borderColor: 'primary.main',
                                boxShadow: '0 0 20px rgba(14, 165, 233, 0.4)',
                            }}
                        >
                            <ChatOutlinedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        </Avatar>

                        <Typography
                            variant="h3"
                            component="h1"
                            sx={{
                                mb: 1,
                                color: 'text.light',
                                fontWeight: 'bold',
                                letterSpacing: '-0.5px',
                                fontSize: { xs: '1.75rem', sm: '2rem' },
                                position: 'relative',
                                display: 'inline-flex',
                                alignItems: 'center',
                            }}
                        >
                            Trợ lý AI
                            <AutoAwesomeIcon
                                sx={{
                                    ml: 1,
                                    color: 'warning.main',
                                    animation: 'sparkle 2s ease-in-out infinite',
                                    '@keyframes sparkle': {
                                        '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                                        '50%': { opacity: 0.7, transform: 'scale(1.2)' },
                                    }
                                }}
                            />
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                mb: 4,
                                textAlign: 'center',
                                color: 'text.secondary',
                                maxWidth: '85%',
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                            }}
                        >
                            Trả lời câu hỏi, phân tích dữ liệu và hỗ trợ bạn trong công việc với trí tuệ nhân tạo
                        </Typography>

                        {error && (
                            <Alert
                                severity="error"
                                sx={{
                                    mb: 3,
                                    width: '100%',
                                    borderRadius: 2,
                                    backdropFilter: 'blur(8px)',
                                    backgroundColor: 'rgba(239, 68, 68, 0.15)'
                                }}
                            >
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
                                px: 4,
                                width: '100%',
                                borderRadius: 3,
                                fontSize: '1rem',
                                background: loading ?
                                    'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' :
                                    theme.palette.gradient.primary,
                                backgroundSize: '200% 200%',
                                animation: 'gradient-shift 5s ease infinite',
                                boxShadow: '0 10px 20px rgba(14, 165, 233, 0.3)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-3px)',
                                    boxShadow: '0 14px 28px rgba(14, 165, 233, 0.4)',
                                },
                                '&:active': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 8px 16px rgba(14, 165, 233, 0.3)',
                                },
                                '&.Mui-disabled': {
                                    opacity: 0.8,
                                },
                            }}
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập với Google'}
                        </Button>

                        {(loading || redirectStarted) && (
                            <Alert
                                severity="info"
                                sx={{
                                    mt: 3,
                                    width: '100%',
                                    borderRadius: 2,
                                    backdropFilter: 'blur(8px)',
                                    backgroundColor: 'rgba(6, 182, 212, 0.15)'
                                }}
                            >
                                Bạn sẽ được chuyển hướng đến trang đăng nhập Google. Sau khi đăng nhập thành công, bạn sẽ được chuyển về ứng dụng.
                            </Alert>
                        )}

                        <Divider
                            sx={{
                                width: '100%',
                                my: 4,
                                '&::before, &::after': {
                                    borderColor: 'divider',
                                }
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    color: 'text.secondary',
                                    px: 2,
                                    fontSize: '0.75rem'
                                }}
                            >
                                THÔNG TIN BẢO MẬT
                            </Typography>
                        </Divider>

                        <Typography
                            variant="body2"
                            sx={{
                                color: 'text.secondary',
                                textAlign: 'center',
                                fontSize: '0.8rem',
                                opacity: 0.8
                            }}
                        >
                            Ứng dụng này sử dụng Google Firebase để xác thực và bảo vệ dữ liệu cá nhân.
                            <br />
                            Chúng tôi cam kết bảo mật thông tin và không chia sẻ dữ liệu với bên thứ ba.
                        </Typography>
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
};

export default Login; 