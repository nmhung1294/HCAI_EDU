import { Box, Typography, Avatar, useMediaQuery, useTheme } from '@mui/material';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

/**
 * Component to display a single chat message
 * @param {Object} props
 * @param {Object} props.message - The message object
 */
const ChatMessage = ({ message }) => {
    const isBot = message.sender === 'bot';
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box
            sx={{
                py: isSmall ? 3 : 4,
                px: { xs: 2, sm: 3, md: 4 },
                width: '100%',
                bgcolor: isBot ? 'background.darkLight' : 'background.dark',
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    maxWidth: '768px',
                    width: '100%',
                    gap: isSmall ? 2 : 3,
                }}
            >
                <Avatar
                    sx={{
                        bgcolor: isBot ? 'primary.main' : 'background.paper',
                        color: isBot ? 'white' : 'text.primary',
                        width: isSmall ? 24 : 30,
                        height: isSmall ? 24 : 30,
                        mt: 0.5
                    }}
                >
                    {isBot ?
                        <SmartToyOutlinedIcon sx={{ fontSize: isSmall ? '0.9rem' : '1.1rem' }} /> :
                        <PersonOutlineOutlinedIcon sx={{ fontSize: isSmall ? '0.9rem' : '1.1rem' }} />
                    }
                </Avatar>

                <Box sx={{ width: `calc(100% - ${isSmall ? '40px' : '45px'})` }}>
                    <Typography
                        variant="body1"
                        component="div"
                        sx={{
                            whiteSpace: 'pre-wrap',
                            color: 'text.light',
                            lineHeight: 1.75,
                            fontSize: isSmall ? '0.9rem' : '1rem',
                            '& code': {
                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                borderRadius: '3px',
                                padding: '0.1rem 0.3rem',
                                fontFamily: 'monospace',
                            },
                            '& pre': {
                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                borderRadius: '6px',
                                padding: '0.75rem',
                                overflow: 'auto',
                                fontFamily: 'monospace',
                                fontSize: isSmall ? '0.8rem' : '0.9rem',
                                marginY: '0.75rem',
                            },
                        }}
                    >
                        {message.text}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default ChatMessage; 