import { useRef, useEffect, useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Tooltip,
    useMediaQuery,
    useTheme,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    ListItemButton,
    TextField,
    Badge,
    Avatar,
    Skeleton
} from '@mui/material';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../context/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FolderIcon from '@mui/icons-material/Folder';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ExportIcon from '@mui/icons-material/FileDownload';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

/**
 * Dialog lưu cuộc trò chuyện
 */
const SaveChatDialog = ({ open, onClose, onSave }) => {
    const [title, setTitle] = useState('');

    const handleSave = () => {
        onSave(title);
        setTitle('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Lưu cuộc trò chuyện</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Tiêu đề cuộc trò chuyện"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    Lưu
                </Button>
            </DialogActions>
        </Dialog>
    );
};

/**
 * Dialog xóa cuộc trò chuyện
 */
const DeleteChatDialog = ({ open, onClose, onConfirm }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm">
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogContent>
                <Typography>
                    Bạn có chắc chắn muốn xóa cuộc trò chuyện này không? Hành động này không thể hoàn tác.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button onClick={onConfirm} variant="contained" color="error">
                    Xóa
                </Button>
            </DialogActions>
        </Dialog>
    );
};

/**
 * Main chat container component that manages the chat UI
 */
const ChatContainer = () => {
    const {
        messages,
        isLoading,
        error,
        savedChats,
        isSavedChatsLoading,
        sendUserMessage,
        clearMessages,
        refreshSavedChats,
        loadChat,
        deleteChat
    } = useChat();
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);
    const [chatToDelete, setChatToDelete] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

    // Drawer width
    const drawerWidth = 280;

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Handle menu
    const handleMenuOpen = (event) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    // Handle save chat
    const handleSaveDialogOpen = () => {
        setSaveDialogOpen(true);
        handleMenuClose();
    };

    // Handle chat operations
    const handleLoadChat = (chatId) => {
        loadChat(chatId);
        setSelectedChat(chatId);
        if (isMobile) {
            setDrawerOpen(false);
        }
    };

    const handleClearChat = () => {
        clearMessages();
        setSelectedChat(null);
        handleMenuClose();
    };

    // Handle delete chat
    const handleDeleteDialogOpen = (chatId, event) => {
        if (event) {
            event.stopPropagation();
        }
        setChatToDelete(chatId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteChat = async () => {
        if (chatToDelete) {
            await deleteChat(chatToDelete);
            if (selectedChat === chatToDelete) {
                setSelectedChat(null);
            }
        }
        setDeleteDialogOpen(false);
        setChatToDelete(null);
    };

    // Handle export chat
    const handleExportChat = () => {
        if (messages.length === 0) return;

        const chatContent = messages
            .map(msg => `${msg.sender === 'user' ? 'Tôi' : 'AI'}: ${msg.text}`)
            .join('\n\n');

        const blob = new Blob([chatContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        handleMenuClose();
    };

    // Format date
    const formatDate = (dateString) => {
        try {
            // Kiểm tra nếu là đối tượng Timestamp từ Firestore
            if (dateString && typeof dateString === 'object' && dateString.seconds) {
                // Chuyển đổi Timestamp sang Date
                const date = new Date(dateString.seconds * 1000);
                return format(date, 'dd MMM yyyy, HH:mm', { locale: vi });
            }

            // Xử lý chuỗi ISO hoặc đối tượng Date
            return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: vi });
        } catch (error) {
            console.log('Lỗi định dạng ngày:', error, dateString);
            // Fallback: Hiển thị ngày gốc hoặc "--"
            return typeof dateString === 'string' ? dateString : '--';
        }
    };

    // Handle sign out
    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Lỗi đăng xuất:', error);
        }
    };

    // Drawer content
    const drawerContent = (
        <>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {user?.picture ? (
                        <Avatar
                            src={user.picture}
                            alt={user.name}
                            sx={{ width: 32, height: 32 }}
                        />
                    ) : (
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor: 'primary.main',
                                fontSize: '0.875rem'
                            }}
                        >
                            {user?.name?.charAt(0) || 'U'}
                        </Avatar>
                    )}
                    <Typography variant="subtitle1" sx={{ color: 'text.light', fontWeight: 500 }}>
                        {user?.name || 'Người dùng'}
                    </Typography>
                </Box>

                {isMobile && (
                    <IconButton
                        onClick={() => setDrawerOpen(false)}
                        size="small"
                        sx={{ color: 'text.light' }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>

            <Divider sx={{ bgcolor: 'divider' }} />

            <Box sx={{ p: 2 }}>
                <Box
                    onClick={handleClearChat}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 1.5,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                            bgcolor: 'background.darkLight',
                        },
                    }}
                >
                    <AddIcon sx={{ color: 'text.light', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ color: 'text.light' }}>
                        Cuộc hội thoại mới
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ bgcolor: 'divider' }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.light', fontWeight: 500 }}>
                    Cuộc trò chuyện đã lưu
                </Typography>
                <Tooltip title="Làm mới danh sách">
                    <IconButton
                        size="small"
                        onClick={refreshSavedChats}
                        sx={{ color: 'text.light' }}
                    >
                        <HistoryIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            <List sx={{ flexGrow: 1, pt: 0, maxHeight: '40vh', overflow: 'auto' }}>
                {isSavedChatsLoading ? (
                    // Skeleton loading state
                    Array.from(new Array(3)).map((_, index) => (
                        <ListItem key={`skeleton-${index}`} sx={{ py: 1 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <Skeleton variant="circular" width={20} height={20} />
                            </ListItemIcon>
                            <ListItemText
                                primary={<Skeleton width="80%" />}
                                secondary={<Skeleton width="40%" />}
                            />
                        </ListItem>
                    ))
                ) : savedChats.length > 0 ? (
                    savedChats.map((chat) => (
                        <ListItemButton
                            key={chat.id}
                            selected={selectedChat === chat.id}
                            onClick={() => handleLoadChat(chat.id)}
                            sx={{
                                color: 'text.light',
                                py: 1,
                                px: 2,
                                '&:hover': {
                                    bgcolor: 'background.darkLight',
                                },
                                '&.Mui-selected': {
                                    bgcolor: 'background.darkLight',
                                    '&:hover': {
                                        bgcolor: 'background.darkLight',
                                    }
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: 'text.light', minWidth: 36 }}>
                                <FolderIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                                primary={chat.title}
                                secondary={formatDate(chat.updatedAt)}
                                primaryTypographyProps={{
                                    noWrap: true,
                                    sx: { color: 'text.light' }
                                }}
                                secondaryTypographyProps={{
                                    noWrap: true,
                                    sx: { color: 'text.secondary', fontSize: '0.75rem' }
                                }}
                            />
                            <IconButton
                                size="small"
                                onClick={(e) => handleDeleteDialogOpen(chat.id, e)}
                                sx={{
                                    color: 'text.light',
                                    opacity: 0.6,
                                    '&:hover': { opacity: 1 }
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </ListItemButton>
                    ))
                ) : (
                    <ListItem sx={{ color: 'text.secondary', fontSize: '0.875rem', opacity: 0.7 }}>
                        <ListItemText primary="Chưa có cuộc trò chuyện nào được lưu" />
                    </ListItem>
                )}
            </List>

            <Divider sx={{ bgcolor: 'divider', mt: 'auto' }} />

            <List sx={{ pt: 0 }}>
                <ListItemButton
                    onClick={handleSignOut}
                    sx={{
                        color: 'text.light',
                        py: 1,
                        '&:hover': {
                            bgcolor: 'background.darkLight',
                        },
                    }}
                >
                    <ListItemIcon sx={{ color: 'text.light', minWidth: 36 }}>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Đăng xuất" />
                </ListItemButton>
            </List>
        </>
    );

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            {/* Sidebar/Drawer */}
            {isMobile ? (
                <Drawer
                    variant="temporary"
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            bgcolor: 'background.dark',
                            borderRight: '1px solid',
                            borderColor: 'divider',
                            boxSizing: 'border-box',
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            ) : (
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            bgcolor: 'background.dark',
                            borderRight: '1px solid',
                            borderColor: 'divider',
                            boxSizing: 'border-box',
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            )}

            {/* Main chat area */}
            <Box sx={{
                flexGrow: 1,
                bgcolor: 'background.dark',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden',
            }}>
                {/* Mobile header */}
                <Box sx={{
                    p: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {isMobile && (
                            <IconButton
                                onClick={() => setDrawerOpen(true)}
                                size="small"
                                sx={{ color: 'text.light' }}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}

                        <Typography variant="subtitle1" sx={{ color: 'text.light', fontWeight: 500 }}>
                            {isSmall ? 'Trợ lý AI' : 'Cuộc trò chuyện với Trợ lý AI'}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {/* Chỉ hiển thị nút tạo mới trên màn hình nhỏ */}
                        {isSmall && (
                            <Tooltip title="Cuộc trò chuyện mới">
                                <IconButton
                                    onClick={handleClearChat}
                                    size="small"
                                    sx={{ color: 'text.light' }}
                                >
                                    <AddIcon />
                                </IconButton>
                            </Tooltip>
                        )}

                        <Tooltip title="Tùy chọn">
                            <IconButton
                                onClick={handleMenuOpen}
                                size="small"
                                sx={{ color: 'text.light' }}
                            >
                                <MoreVertIcon />
                            </IconButton>
                        </Tooltip>

                        <Menu
                            anchorEl={menuAnchorEl}
                            open={Boolean(menuAnchorEl)}
                            onClose={handleMenuClose}
                            PaperProps={{
                                sx: {
                                    bgcolor: 'background.dark',
                                    color: 'text.light',
                                    boxShadow: 3,
                                    mt: 1
                                }
                            }}
                        >
                            <MenuItem onClick={handleClearChat}>
                                <ListItemIcon sx={{ color: 'text.light' }}>
                                    <AddIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Cuộc trò chuyện mới</ListItemText>
                            </MenuItem>
                            <MenuItem
                                onClick={refreshSavedChats}
                            >
                                <ListItemIcon sx={{ color: 'text.light' }}>
                                    <HistoryIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Làm mới danh sách chat</ListItemText>
                            </MenuItem>
                            <MenuItem
                                onClick={handleExportChat}
                                disabled={messages.length === 0}
                                sx={{ opacity: messages.length === 0 ? 0.5 : 1 }}
                            >
                                <ListItemIcon sx={{ color: 'text.light' }}>
                                    <ExportIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Xuất cuộc trò chuyện</ListItemText>
                            </MenuItem>
                            <Divider sx={{ bgcolor: 'divider' }} />
                            <MenuItem onClick={handleSignOut}>
                                <ListItemIcon sx={{ color: 'text.light' }}>
                                    <LogoutIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Đăng xuất</ListItemText>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Box>

                {/* Chat Messages */}
                <Box
                    sx={{
                        flexGrow: 1,
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {messages.length === 0 ? (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%',
                                p: 4,
                            }}
                        >
                            <Typography variant={isSmall ? 'h4' : 'h2'} sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2 }}>
                                Trợ lý AI
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.light', textAlign: 'center', maxWidth: 500 }}>
                                Trợ lý AI giúp bạn trả lời câu hỏi, tạo nội dung, hỗ trợ lập trình...
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', maxWidth: 500, mt: 2 }}>
                                Dữ liệu chat của bạn được lưu trữ với Firebase và có thể truy cập từ nhiều thiết bị khác nhau.
                            </Typography>
                        </Box>
                    ) : (
                        messages.map((message) => (
                            <ChatMessage key={message.id} message={message} />
                        ))
                    )}

                    {isLoading && (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                p: 4,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                bgcolor: 'background.darkLight',
                            }}
                        >
                            <CircularProgress size={24} sx={{ color: 'primary.main' }} />
                        </Box>
                    )}

                    {error && (
                        <Box
                            sx={{
                                p: 4,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                bgcolor: 'background.darkLight',
                            }}
                        >
                            <Alert
                                severity="error"
                                sx={{
                                    bgcolor: 'transparent',
                                    color: 'error.main',
                                    '& .MuiAlert-icon': {
                                        color: 'error.main'
                                    }
                                }}
                            >
                                {error}
                            </Alert>
                        </Box>
                    )}

                    <div ref={messagesEndRef} />
                </Box>

                {/* Chat Input */}
                <Box sx={{ p: 2, bgcolor: 'background.dark', mt: 'auto' }}>
                    <ChatInput
                        onSendMessage={sendUserMessage}
                        onClearChat={clearMessages}
                        disabled={isLoading}
                    />
                </Box>
            </Box>

            {/* Dialogs */}
            <SaveChatDialog
                open={saveDialogOpen}
                onClose={() => setSaveDialogOpen(false)}
                onSave={refreshSavedChats}
            />

            <DeleteChatDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDeleteChat}
            />
        </Box>
    );
};

export default ChatContainer; 