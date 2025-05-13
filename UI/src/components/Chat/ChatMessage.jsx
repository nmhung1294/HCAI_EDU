import { Box, Typography, Avatar, useMediaQuery, useTheme, Paper, Fade } from '@mui/material';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ReactMarkdown from 'react-markdown';

/**
 * Component to display a single chat message with enhanced markdown support
 * @param {Object} props
 * @param {Object} props.message - The message object
 */
const ChatMessage = ({ message }) => {
    const isBot = message.sender === 'bot';
    const theme = useTheme();
    const isMedium = useMediaQuery(theme.breakpoints.down('md'));

    const avatarSize = {
        xs: 28,
        sm: 32,
        md: 38
    };

    // Xác định màu nền dựa vào loại tin nhắn
    const getBgColor = () => {
        return {
            xs: theme.palette.background.dark
        };
    };

    return (
        <Fade in={true} timeout={300}>
            <Box
                sx={{
                    width: '100%',
                    background: getBgColor(),
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'center',
                    position: 'relative',
                    my: { xs: 1, sm: 1.5, md: 1.5 },
                    '&:hover': {
                        '&::before': {
                            opacity: 0.05,
                        }
                    },
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '3px',
                        height: '100%',
                        background: isBot ? theme.palette.primary.main : theme.palette.accent.main,
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                    }
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        maxWidth: '768px',
                        width: '100%',
                        gap: { xs: 2, sm: 2.5, md: 3 },
                    }}
                >
                    <Avatar
                        sx={{
                            bgcolor: isBot
                                ? 'primary.main'
                                : 'accent.main',
                            color: 'white',
                            width: { xs: avatarSize.xs, sm: avatarSize.sm, md: avatarSize.md },
                            height: { xs: avatarSize.xs, sm: avatarSize.sm, md: avatarSize.md },
                            boxShadow: isBot
                                ? '0 3px 12px rgba(14, 165, 233, 0.3)'
                                : '0 3px 12px rgba(249, 115, 22, 0.3)',
                            mt: 0.5,
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: isBot
                                    ? '0 4px 16px rgba(14, 165, 233, 0.4)'
                                    : '0 4px 16px rgba(249, 115, 22, 0.4)',
                            }
                        }}
                    >
                        {isBot ?
                            <SmartToyOutlinedIcon sx={{
                                fontSize: {
                                    xs: '1rem',
                                    sm: '1.1rem',
                                    md: '1.3rem'
                                }
                            }} /> :
                            <PersonOutlineOutlinedIcon sx={{
                                fontSize: {
                                    xs: '1rem',
                                    sm: '1.1rem',
                                    md: '1.3rem'
                                }
                            }} />
                        }
                    </Avatar>

                    <Box sx={{
                        width: `calc(100% - ${isMedium ? '40px' : '50px'})`,
                        position: 'relative'
                    }}>
                        {/* Hiển thị tên người gửi tin nhắn */}
                        <Typography
                            variant="caption"
                            sx={{
                                color: isBot ? 'primary.light' : 'accent.light',
                                fontWeight: 600,
                                mb: 0.5,
                                display: 'block',
                                letterSpacing: '0.02em',
                                textTransform: 'uppercase',
                                fontSize: { xs: '0.7rem', sm: '0.75rem' }
                            }}
                        >
                            {isBot ? 'Assistant' : 'You'}
                        </Typography>

                        {/* Nội dung tin nhắn */}
                        {isBot ? (
                            <Paper
                                elevation={0}
                                sx={{
                                    backgroundColor: 'transparent',
                                    borderRadius: theme.shape.borderRadius,
                                    position: 'relative',
                                    zIndex: 1,
                                }}
                            >
                                <ReactMarkdown
                                    components={{
                                        h1: ({ node, ...props }) => (
                                            <Typography
                                                variant="h5"
                                                sx={{
                                                    mt: 3,
                                                    mb: 2,
                                                    fontWeight: 700,
                                                    color: 'text.light',
                                                    position: 'relative',
                                                    '&::after': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        bottom: -8,
                                                        left: 0,
                                                        width: '40px',
                                                        height: '3px',
                                                        backgroundColor: theme.palette.primary.main,
                                                        borderRadius: '2px'
                                                    }
                                                }}
                                                {...props}
                                            />
                                        ),
                                        h2: ({ node, ...props }) => (
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    mt: 2.5,
                                                    mb: 1.5,
                                                    fontWeight: 700,
                                                    color: 'text.light',
                                                    position: 'relative',
                                                    '&::after': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        bottom: -6,
                                                        left: 0,
                                                        width: '30px',
                                                        height: '2px',
                                                        backgroundColor: theme.palette.primary.light,
                                                        borderRadius: '1px'
                                                    }
                                                }}
                                                {...props}
                                            />
                                        ),
                                        h3: ({ node, ...props }) => (
                                            <Typography
                                                variant="subtitle1"
                                                sx={{
                                                    mt: 2,
                                                    mb: 1,
                                                    fontWeight: 600,
                                                    color: 'text.light'
                                                }}
                                                {...props}
                                            />
                                        ),
                                        p: ({ node, ...props }) => (
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    mb: 1.5,
                                                    lineHeight: 1.8,
                                                    color: 'text.light',
                                                    fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                                                }}
                                                {...props}
                                            />
                                        ),
                                        ul: ({ node, ...props }) => (
                                            <Box
                                                component="ul"
                                                sx={{
                                                    pl: 2.5,
                                                    mb: 2,
                                                    listStyleType: 'disc',
                                                    '& li::marker': {
                                                        color: theme.palette.primary.light
                                                    }
                                                }}
                                                {...props}
                                            />
                                        ),
                                        ol: ({ node, ...props }) => (
                                            <Box
                                                component="ol"
                                                sx={{
                                                    pl: 2.5,
                                                    mb: 2,
                                                    '& li::marker': {
                                                        color: theme.palette.primary.light,
                                                        fontWeight: 600
                                                    }
                                                }}
                                                {...props}
                                            />
                                        ),
                                        li: ({ node, ...props }) => (
                                            <Box
                                                component="li"
                                                sx={{
                                                    mb: 1,
                                                    color: 'text.light',
                                                    fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                                                    lineHeight: 1.7,
                                                    '& > p': {
                                                        m: 0
                                                    }
                                                }}
                                                {...props}
                                            />
                                        ),
                                        code: ({ node, inline, className, children, ...props }) => {
                                            // Lấy ngôn ngữ từ className (ví dụ: language-javascript -> javascript)
                                            const match = /language-(\w+)/.exec(className || '');
                                            const lang = match ? match[1] : '';

                                            return inline ? (
                                                // Inline code
                                                <Box
                                                    component="code"
                                                    sx={{
                                                        backgroundColor: 'rgba(0, 0, 0, 0.25)',
                                                        borderRadius: '4px',
                                                        padding: '0.15rem 0.4rem',
                                                        fontFamily: '"Roboto Mono", monospace',
                                                        fontSize: '90%',
                                                        color: theme.palette.primary.light,
                                                    }}
                                                    {...props}
                                                >
                                                    {children}
                                                </Box>
                                            ) : (
                                                // Code block
                                                <Box
                                                    sx={{
                                                        position: 'relative',
                                                        mt: 2,
                                                        mb: 3
                                                    }}
                                                >
                                                    {/* Language label */}
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: -12,
                                                            right: 12,
                                                            backgroundColor: theme.palette.primary.dark,
                                                            color: '#fff',
                                                            fontSize: '0.7rem',
                                                            py: 0.5,
                                                            px: 1.5,
                                                            borderRadius: '4px',
                                                            fontFamily: theme.typography.fontFamily,
                                                            fontWeight: 500,
                                                            opacity: 0.9,
                                                            zIndex: 1,
                                                        }}
                                                    >
                                                        {lang || 'code'}
                                                    </Box>
                                                    {/* Code content */}
                                                    <Box
                                                        component="pre"
                                                        className={className}  // Important: Keep the className for syntax highlighting
                                                        sx={{
                                                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                                            borderRadius: '8px',
                                                            padding: '1.5rem 1rem',
                                                            overflow: 'auto',
                                                            fontFamily: '"Roboto Mono", monospace',
                                                            fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                                                            lineHeight: 1.5,
                                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                                            color: 'text.light', // Add this to ensure text is visible
                                                            '& code': {
                                                                fontFamily: 'inherit',
                                                                fontSize: 'inherit',
                                                            },
                                                            // Highlight colors for different code elements
                                                            '& .token.comment': {
                                                                color: '#6b7280',
                                                            },
                                                            '& .token.string': {
                                                                color: '#22c55e',
                                                            },
                                                            '& .token.number': {
                                                                color: '#3b82f6',
                                                            },
                                                            '& .token.keyword': {
                                                                color: '#ec4899',
                                                            },
                                                            '& .token.function': {
                                                                color: '#f59e0b',
                                                            },
                                                            // Scrollbar styling
                                                            '&::-webkit-scrollbar': {
                                                                height: '8px',
                                                                width: '8px',
                                                            },
                                                            '&::-webkit-scrollbar-track': {
                                                                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                                                borderRadius: '4px'
                                                            },
                                                            '&::-webkit-scrollbar-thumb': {
                                                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                                                borderRadius: '4px',
                                                                '&:hover': {
                                                                    backgroundColor: 'rgba(255, 255, 255, 0.25)'
                                                                }
                                                            },
                                                        }}
                                                        {...props}
                                                    >
                                                        {children}
                                                    </Box>
                                                </Box>
                                            );
                                        },
                                        blockquote: ({ node, ...props }) => (
                                            <Box
                                                component="blockquote"
                                                sx={{
                                                    borderLeft: '3px solid',
                                                    borderColor: theme.palette.primary.main,
                                                    pl: 2,
                                                    py: 0.5,
                                                    my: 2,
                                                    color: 'text.secondary',
                                                    backgroundColor: 'rgba(14, 165, 233, 0.05)',
                                                    borderRadius: '0 8px 8px 0',
                                                }}
                                                {...props}
                                            />
                                        ),
                                        a: ({ node, ...props }) => (
                                            <Box
                                                component="a"
                                                sx={{
                                                    color: theme.palette.primary.light,
                                                    textDecoration: 'none',
                                                    borderBottom: '1px dashed',
                                                    borderColor: theme.palette.primary.light,
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        color: theme.palette.primary.main,
                                                        borderBottomStyle: 'solid',
                                                    }
                                                }}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                {...props}
                                            />
                                        ),
                                        table: ({ node, ...props }) => (
                                            <Box
                                                sx={{
                                                    overflowX: 'auto',
                                                    mb: 2,
                                                    '&::-webkit-scrollbar': {
                                                        height: '8px',
                                                    },
                                                    '&::-webkit-scrollbar-track': {
                                                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                                        borderRadius: '4px'
                                                    },
                                                    '&::-webkit-scrollbar-thumb': {
                                                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                                        borderRadius: '4px',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(255, 255, 255, 0.25)'
                                                        }
                                                    },
                                                }}
                                            >
                                                <Box
                                                    component="table"
                                                    sx={{
                                                        width: '100%',
                                                        borderCollapse: 'separate',
                                                        borderSpacing: 0,
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '8px',
                                                        overflow: 'hidden',
                                                    }}
                                                    {...props}
                                                />
                                            </Box>
                                        ),
                                        th: ({ node, ...props }) => (
                                            <Box
                                                component="th"
                                                sx={{
                                                    py: 1.5,
                                                    px: 2,
                                                    textAlign: 'left',
                                                    fontWeight: 600,
                                                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                                                    color: theme.palette.primary.light,
                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                                }}
                                                {...props}
                                            />
                                        ),
                                        td: ({ node, ...props }) => (
                                            <Box
                                                component="td"
                                                sx={{
                                                    py: 1,
                                                    px: 2,
                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                                }}
                                                {...props}
                                            />
                                        ),
                                        hr: ({ node, ...props }) => (
                                            <Box
                                                component="hr"
                                                sx={{
                                                    my: 2,
                                                    border: 'none',
                                                    height: '1px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                }}
                                                {...props}
                                            />
                                        ),
                                    }}
                                    sx={{
                                        whiteSpace: 'pre-wrap',
                                        color: 'text.light',
                                        '& strong': {
                                            fontWeight: 700,
                                            color: isBot ? theme.palette.primary.light : theme.palette.accent.light,
                                        },
                                        '& em': {
                                            fontStyle: 'italic',
                                            color: 'text.secondary',
                                        },
                                    }}
                                >
                                    {message.text}
                                </ReactMarkdown>
                            </Paper>
                        ) : (
                            <Paper
                                elevation={0}
                                sx={{
                                    backgroundColor: 'transparent',
                                    borderRadius: theme.shape.borderRadius,
                                }}
                            >
                                <Typography
                                    variant="body1"
                                    component="div"
                                    sx={{
                                        whiteSpace: 'pre-wrap',
                                        color: 'text.light',
                                        lineHeight: 1.8,
                                        fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                                        '& code': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.25)',
                                            borderRadius: '4px',
                                            padding: '0.15rem 0.4rem',
                                            fontFamily: '"Roboto Mono", monospace',
                                            fontSize: '90%',
                                            color: theme.palette.accent.light,
                                        },
                                        '& pre': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.25)',
                                            borderRadius: '8px',
                                            padding: '1rem',
                                            overflow: 'auto',
                                            fontFamily: '"Roboto Mono", monospace',
                                            fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                                            marginY: '1rem',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                        },
                                        '& strong': {
                                            fontWeight: 700,
                                            color: theme.palette.accent.light,
                                        },
                                        '& em': {
                                            fontStyle: 'italic',
                                            color: 'text.secondary',
                                        },
                                    }}
                                >
                                    {message.text}
                                </Typography>
                            </Paper>
                        )}
                    </Box>
                </Box>
            </Box>
        </Fade>
    );
};

export default ChatMessage;