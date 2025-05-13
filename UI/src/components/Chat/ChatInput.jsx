import { useState, useEffect, useRef } from 'react';
import {
    Box,
    TextField,
    IconButton,
    InputAdornment,
    Paper,
    Tooltip,
    useMediaQuery,
    useTheme,
    Fade
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ClearIcon from '@mui/icons-material/Clear';

/**
 * Component for the chat input field with improved UI and functionality
 * @param {Object} props
 * @param {Function} props.onSendMessage - Callback when a message is sent
 * @param {Function} props.onClearChat - Callback to clear the chat
 * @param {boolean} props.disabled - Whether the input is disabled
 */
const ChatInput = ({ onSendMessage, onClearChat, disabled = false }) => {
    const [message, setMessage] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
    const inputRef = useRef(null);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleKeyDown = (e) => {
        // Send message on Enter (unless Shift is pressed for new line)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const handleClearInput = () => {
        setMessage('');
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Autofocus input on component mount
    useEffect(() => {
        if (inputRef.current && !isSmall) {
            inputRef.current.focus();
        }
    }, [isSmall]);

    return (
        <Box
            component="form"
            onSubmit={handleSendMessage}
            sx={{
                position: 'relative',
                maxWidth: '800px',
                mx: 'auto',
                width: '100%',
                px: { xs: 1, sm: 2 },
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: isSmall ? '8px 12px' : '12px 16px',
                    border: '1px solid',
                    borderColor: isFocused ? 'primary.light' : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 3,
                    bgcolor: 'background.dark',
                    boxShadow: isFocused
                        ? '0 0 0 2px rgba(16, 163, 127, 0.2)'
                        : '0 2px 15px rgba(0,0,0,0.08)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        borderColor: isFocused ? 'primary.light' : 'rgba(255, 255, 255, 0.2)',
                    }
                }}
            >
                {/* Icon buttons */}
                <Tooltip title="Đính kèm tập tin (Sắp ra mắt)">
                    <span>
                        <IconButton
                            color="inherit"
                            disabled={true}
                            size={isSmall ? "small" : "medium"}
                            sx={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                opacity: 0.7,
                                '&:hover': { opacity: 1, color: 'primary.main' },
                                '&.Mui-disabled': {
                                    color: 'rgba(255, 255, 255, 0.3)',
                                },
                                mr: 1,
                            }}
                        >
                            <AttachFileIcon fontSize={isSmall ? "small" : "medium"} />
                        </IconButton>
                    </span>
                </Tooltip>

                <TextField
                    fullWidth
                    multiline
                    inputRef={inputRef}
                    maxRows={isSmall ? 4 : 6}
                    variant="standard"
                    placeholder="Nhập tin nhắn của bạn..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={disabled}
                    InputProps={{
                        disableUnderline: true,
                        sx: {
                            '& .MuiInputBase-input': {
                                color: '#fff',
                                '&::placeholder': {
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    opacity: 1,
                                },
                                '&:disabled': {
                                    color: 'rgba(255, 255, 255, 0.3)',
                                    WebkitTextFillColor: 'rgba(255, 255, 255, 0.3)',
                                },
                            },
                            fontSize: isSmall ? '0.95rem' : '1rem',
                            lineHeight: 1.5,
                        },
                        endAdornment: (
                            <InputAdornment position="end">
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {message.length > 0 && (
                                        <Fade in={message.length > 0}>
                                            <Tooltip title="Xóa nội dung">
                                                <IconButton
                                                    onClick={handleClearInput}
                                                    size={isSmall ? "small" : "medium"}
                                                    sx={{
                                                        color: 'rgba(255, 255, 255, 0.7)',
                                                        '&:hover': {
                                                            color: theme.palette.error.light
                                                        },
                                                    }}
                                                >
                                                    <ClearIcon fontSize={isSmall ? "small" : "medium"} />
                                                </IconButton>
                                            </Tooltip>
                                        </Fade>
                                    )}
                                    <Tooltip title="Gửi tin nhắn">
                                        <span>
                                            <IconButton
                                                onClick={handleSendMessage}
                                                disabled={!message.trim() || disabled}
                                                size={isSmall ? "small" : "medium"}
                                                sx={{
                                                    color: message.trim()
                                                        ? 'primary.main'
                                                        : 'rgba(255, 255, 255, 0.3)',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        color: 'primary.light',
                                                        transform: 'scale(1.05)',
                                                    },
                                                    '&.Mui-disabled': {
                                                        color: 'rgba(255, 255, 255, 0.3)',
                                                    },
                                                }}
                                            >
                                                <SendIcon
                                                    fontSize={isSmall ? "small" : "medium"}
                                                    sx={{
                                                        transform: 'rotate(-45deg)',
                                                        transition: 'transform 0.2s ease',
                                                    }}
                                                />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </Box>
                            </InputAdornment>
                        ),
                    }}
                />
            </Paper>

            <Box
                sx={{
                    textAlign: 'center',
                    fontSize: isSmall ? '0.7rem' : '0.8rem',
                    color: 'text.secondary',
                    mt: 1.5,
                    mb: isSmall ? 1 : 2,
                    opacity: 0.8,
                    fontStyle: 'italic',
                }}
            >
                Trợ lý AI có thể đưa ra thông tin không chính xác. Xem lại và đánh giá câu trả lời với sự cẩn trọng.
            </Box>
        </Box>
    );
};

export default ChatInput;