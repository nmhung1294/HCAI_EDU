import { useState } from 'react';
import {
    Box,
    TextField,
    IconButton,
    InputAdornment,
    Paper,
    Tooltip,
    useMediaQuery,
    useTheme
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';

/**
 * Component for the chat input field
 * @param {Object} props
 * @param {Function} props.onSendMessage - Callback when a message is sent
 * @param {Function} props.onClearChat - Callback to clear the chat
 * @param {boolean} props.disabled - Whether the input is disabled
 */
const ChatInput = ({ onSendMessage, onClearChat, disabled = false }) => {
    const [message, setMessage] = useState('');
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSendMessage(message);
            setMessage('');
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSendMessage}
            sx={{
                position: 'relative',
                maxWidth: '768px',
                mx: 'auto',
                width: '100%',
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: isSmall ? '6px 10px' : '8px 12px',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'background.dark',
                    boxShadow: '0 0 15px rgba(0,0,0,0.1)',
                }}
            >
                {!isSmall && (
                    <Tooltip title="Gửi file (Sắp ra mắt)">
                        <IconButton
                            color="inherit"
                            disabled={true}
                            size="small"
                            sx={{
                                color: 'text.light',
                                opacity: 0.7,
                                '&:hover': { opacity: 1 },
                                mr: 1,
                                display: { xs: 'none', sm: 'flex' }
                            }}
                        >
                            <UploadFileOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}

                <TextField
                    fullWidth
                    multiline
                    maxRows={isSmall ? 3 : 4}
                    variant="standard"
                    placeholder="Gửi tin nhắn..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={disabled}
                    InputProps={{
                        disableUnderline: true,
                        sx: {
                            color: 'text.light',
                            fontSize: isSmall ? '0.9rem' : '0.95rem',
                            '& ::placeholder': {
                                color: 'text.light',
                                opacity: 0.7,
                            },
                        },
                        endAdornment: (
                            <InputAdornment position="end">
                                <Box sx={{ display: 'flex' }}>
                                    {!isSmall && (
                                        <Tooltip title="Chat bằng giọng nói (Sắp ra mắt)">
                                            <IconButton
                                                color="inherit"
                                                disabled={true}
                                                size="small"
                                                sx={{
                                                    color: 'text.light',
                                                    opacity: 0.7,
                                                    '&:hover': { opacity: 1 },
                                                    display: { xs: 'none', sm: 'flex' }
                                                }}
                                            >
                                                <MicIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}

                                    <Tooltip title="Gửi tin nhắn">
                                        <IconButton
                                            color="inherit"
                                            onClick={handleSendMessage}
                                            disabled={!message.trim() || disabled}
                                            type="submit"
                                            size={isSmall ? 'small' : 'medium'}
                                            sx={{
                                                color: message.trim() ? 'primary.main' : 'text.light',
                                                opacity: message.trim() ? 1 : 0.7,
                                                '&:hover': {
                                                    opacity: 1,
                                                    bgcolor: 'rgba(16, 163, 127, 0.1)'
                                                },
                                                ml: isSmall ? 0.5 : 1
                                            }}
                                        >
                                            <SendIcon fontSize={isSmall ? 'small' : 'medium'} />
                                        </IconButton>
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
                    fontSize: isSmall ? '0.65rem' : '0.75rem',
                    color: 'text.secondary',
                    mt: isSmall ? 1 : 2,
                    mb: isSmall ? 1 : 2,
                    opacity: 0.7,
                }}
            >
                Trợ lý AI có thể đưa ra thông tin không chính xác. Xem lại và đánh giá câu trả lời với sự cẩn trọng.
            </Box>
        </Box>
    );
};

export default ChatInput; 