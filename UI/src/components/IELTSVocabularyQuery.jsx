import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Paper,
  Avatar,
  Fade,
  Collapse,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Snackbar
} from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { queryIELTSVocabulary } from '../services/webScraperService';
import { generatePracticeQuestions, generateRandomQuestions } from '../services/practiceQuestionService';
import SendIcon from '@mui/icons-material/Send';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReactMarkdown from 'react-markdown';
import { queryVocabulary } from '../services/vocabularyService';
import { checkAnswers, getExerciseHistory } from '../services/exerciseService';

const MarkdownContent = ({ content }) => {
  return (
    <Box
      sx={{
        '& > *': {
          margin: 0,
          padding: 0,
        },
        '& > * + *': {
          marginTop: '1em',
        },
        '& h1, & h2, & h3, & h4, & h5, & h6': {
          margin: '1.5em 0 0.5em 0',
          color: 'primary.main',
          '&:first-of-type': {
            marginTop: 0,
          },
        },
        '& p': {
          margin: '0.5em 0',
        },
        '& ul, & ol': {
          margin: '0.5em 0',
          paddingLeft: '1.5em',
        },
        '& li': {
          margin: '0.25em 0',
        },
        '& a': {
          color: 'primary.main',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
        '& code': {
          backgroundColor: 'background.darkLight',
          padding: '0.2em 0.4em',
          borderRadius: '3px',
          fontSize: '0.9em',
        },
        '& pre': {
          backgroundColor: 'background.darkLight',
          padding: '1em',
          borderRadius: '4px',
          overflow: 'auto',
          margin: '1em 0',
        },
        '& blockquote': {
          borderLeft: '4px solid',
          borderColor: 'primary.main',
          margin: '1em 0',
          padding: '0.5em 1em',
          backgroundColor: 'background.darkLight',
        },
      }}
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => <span>{children}</span>,
          pre: ({ children }) => <div>{children}</div>,
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline ? (
              <div
                style={{
                  backgroundColor: 'var(--background-dark-light)',
                  padding: '1em',
                  borderRadius: '4px',
                  overflow: 'auto',
                  margin: '1em 0',
                }}
              >
                <code className={className} {...props}>
                  {children}
                </code>
              </div>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

const IELTSVocabularyQuery = () => {
  const [query, setQuery] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [practiceExercises, setPracticeExercises] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [exerciseResults, setExerciseResults] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [exerciseHistory, setExerciseHistory] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const messagesEndRef = useRef(null);

  // URL detection regex
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Check for URLs in query
  useEffect(() => {
    const urls = query.match(urlRegex);
    if (urls && urls.length > 0) {
      setCustomUrl(urls[0]);
      setShowUrlInput(true);
    }
  }, [query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setUserAnswers({});
    setShowResults(false);
    setExerciseResults(null);

    // Add user message
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const data = await queryVocabulary(query, showUrlInput ? customUrl : null);
      // Add bot message
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.response,
        article: data.selected_article
      };
      setMessages(prev => [...prev, botMessage]);

      // Set practice exercises from response
      if (data.practice_exercises) {
        console.log('Practice exercises:', data.practice_exercises);
        setPracticeExercises(data.practice_exercises);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching the response');
    } finally {
      setLoading(false);
      setQuery('');
      setCustomUrl('');
      setShowUrlInput(false);
    }
  };

  const handleAnswerChange = (type, index, value) => {
    // Cập nhật câu trả lời của người dùng
    setUserAnswers(prev => ({
      ...prev,
      [`${type}_${index}`]: value
    }));

    // Kiểm tra câu trả lời ngay lập tức nếu là phần Fill in Blank
    if (type === 'fill_in_blank' && practiceExercises?.fill_in_blank) {
      // Lấy câu trả lời đúng từ dữ liệu có sẵn
      const correctAnswer = practiceExercises.fill_in_blank[index]?.correct_answer;
      const isCorrect = value === correctAnswer;
      const explanation = practiceExercises.fill_in_blank[index]?.explanation;

      // Tạo kết quả tương tự như kết quả từ API
      const results = {
        results: {
          fill_in_blank: practiceExercises.fill_in_blank.map((q, i) => {
            // Chỉ cập nhật câu trả lời cho câu hỏi hiện tại
            if (i === index) {
              return {
                is_correct: isCorrect,
                correct_answer: correctAnswer,
                user_answer: value,
                explanation: explanation
              };
            }
            // Giữ lại kết quả cũ cho các câu hỏi đã trả lời trước đó
            else if (exerciseResults?.results?.fill_in_blank && exerciseResults.results.fill_in_blank[i]) {
              return exerciseResults.results.fill_in_blank[i];
            }
            // Mặc định là null cho các câu chưa trả lời
            return null;
          }).filter(item => item !== null),
          story_gap: exerciseResults?.results?.story_gap || []
        },
        score: 0, // Điểm số sẽ được cập nhật dưới đây
        total_questions: practiceExercises.fill_in_blank.length +
          (practiceExercises.story_gap?.gaps?.length || 0),
        correct_answers: 0 // Số câu đúng sẽ được cập nhật dưới đây
      };

      // Tính số câu đúng và điểm số
      const correctAnswers = results.results.fill_in_blank.filter(q => q?.is_correct).length;
      results.correct_answers = correctAnswers;
      results.score = (correctAnswers / results.total_questions) * 100;

      // Cập nhật state với kết quả mới
      setExerciseResults(results);
      setShowResults(true);
    }
  };

  const handleCheckAnswers = async () => {
    try {
      console.log(practiceExercises)
      if (!practiceExercises?.exercise_id) {
        setSnackbar({
          open: true,
          message: 'No exercise to check',
          severity: 'error'
        });
        return;
      }

      const results = await checkAnswers(
        practiceExercises.exercise_id,
        'user123', // Replace with actual user ID
        userAnswers
      );
      setExerciseResults(results);
      setShowResults(true);
      setSnackbar({
        open: true,
        message: `Score: ${results.score}/${results.total_questions}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error checking answers:', error);
      setSnackbar({
        open: true,
        message: 'Failed to check answers. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleLoadHistory = async () => {
    try {
      const history = await getExerciseHistory('user123'); // Replace with actual user ID
      setExerciseHistory(history);
      setShowHistory(true);
    } catch (error) {
      console.error('Error loading history:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load exercise history',
        severity: 'error'
      });
    }
  };

  const handleClear = () => {
    setMessages([]);
    setQuery('');
    setCustomUrl('');
    setShowUrlInput(false);
    setError(null);
    setPracticeExercises(null);
    setUserAnswers({});
    setShowResults(false);
    setExerciseResults(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setUserAnswers({});
    setShowResults(false);
    setExerciseResults(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleRefresh = () => {
    // Reload current practice exercises without clearing the UI
    if (practiceExercises) {
      setUserAnswers({});
      setShowResults(false);
      setExerciseResults(null);
      // Add animation effect
      const practiceSection = document.querySelector('.MuiGrid-item:last-child');
      if (practiceSection) {
        practiceSection.style.animation = 'none';
        setTimeout(() => {
          practiceSection.style.animation = 'fadeInRefresh 0.5s ease';
        }, 10);
      }

      setSnackbar({
        open: true,
        message: 'Exercise refreshed',
        severity: 'success'
      });
    } else {
      setSnackbar({
        open: true,
        message: 'No exercise to refresh',
        severity: 'info'
      });
    }
  };

  // Handle key navigation for exercises
  const handleKeyDown = (event, type, currentIndex, optionIndex) => {
    if (type === 'fill_in_blank' && practiceExercises?.fill_in_blank) {
      const options = practiceExercises.fill_in_blank[currentIndex]?.options || [];

      // Handle keyboard navigation
      switch (event.key) {
        case 'ArrowUp':
          if (optionIndex > 0) {
            // Focus previous option
            document.getElementById(`option-${currentIndex}-${optionIndex - 1}`)?.focus();
          }
          break;
        case 'ArrowDown':
          if (optionIndex < options.length - 1) {
            // Focus next option
            document.getElementById(`option-${currentIndex}-${optionIndex + 1}`)?.focus();
          }
          break;
        case 'Enter':
        case ' ':
          // Select current option
          handleAnswerChange(type, currentIndex, options[optionIndex]);
          break;
        case 'n':
          // Go to next question
          if (currentIndex < practiceExercises.fill_in_blank.length - 1) {
            const swiperInstance = document.querySelector('.swiper')?.swiper;
            if (swiperInstance) {
              swiperInstance.slideNext();
            }
          }
          break;
        case 'p':
          // Go to previous question
          if (currentIndex > 0) {
            const swiperInstance = document.querySelector('.swiper')?.swiper;
            if (swiperInstance) {
              swiperInstance.slidePrev();
            }
          }
          break;
        default:
          break;
      }
    }
  };

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.dark',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.darkLight',
        height: '64px',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Typography variant="h4" sx={{ color: 'text.light' }}>
            Khám phá
          </Typography>
          {practiceExercises && (
            <Fade in={true}>
              <Chip
                label="Practice Mode"
                size="small"
                color="primary"
                sx={{
                  height: 24,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  ml: 1,
                  animation: 'pulse 1.5s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.4)'
                    },
                    '70%': {
                      boxShadow: '0 0 0 6px rgba(25, 118, 210, 0)'
                    },
                    '100%': {
                      boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)'
                    }
                  }
                }}
              />
            </Fade>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Exercise History">
            <IconButton onClick={handleLoadHistory} sx={{
              color: 'text.light',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: 'primary.main',
                transform: 'scale(1.1)'
              }
            }}>
              <HistoryIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} sx={{
              color: 'text.light',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: 'primary.main',
                transform: 'scale(1.1) rotate(45deg)'
              }
            }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear">
            <IconButton onClick={handleClear} sx={{
              color: 'text.light',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: 'primary.main',
                transform: 'scale(1.1)'
              }
            }}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Main Content */}
      <Grid container sx={{
        flexGrow: 1,
        overflow: 'hidden',
        height: 'calc(100vh - 64px)'
      }}>
        {/* Chat Section (60% on desktop, 100% on mobile) */}
        <Grid item xs={12} md={7.2} sx={{
          height: { xs: 'calc(50vh - 32px)', md: '100%' },
          display: 'flex',
          flexDirection: 'column',
          borderRight: { xs: 'none', md: '1px solid' },
          borderBottom: { xs: '1px solid', md: 'none' },
          borderColor: 'divider',
          minWidth: 0, // Prevent flex item from overflowing
          flex: { xs: 'none', md: '0 0 60%' } // Fixed width of 60% on desktop
        }}>
          {/* Chat Messages */}
          <Box sx={{
            flexGrow: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            gap: 2,
            minHeight: 0, // Allow content to scroll
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'background.dark',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'primary.main',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'primary.dark',
            }
          }}>
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
                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2 }}>
                  Khám phá
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.light', textAlign: 'center', maxWidth: 500 }}>
                  Ask me anything and I'll help you learn and understand better.
                </Typography>
                <Alert
                  severity="info"
                  icon={<InfoIcon />}
                  sx={{
                    mt: 3,
                    maxWidth: '100%',
                    bgcolor: 'background.darkLight',
                    '& .MuiAlert-icon': {
                      color: 'primary.main'
                    }
                  }}
                >
                  You can also provide a custom URL to scrape vocabulary from any website.
                </Alert>
              </Box>
            ) : (
              <Box sx={{
                height: '100%',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'background.darkLight',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'primary.main',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: 'primary.dark',
                },
              }}>
                {messages.map((message) => (
                  <Fade in={true} timeout={300} key={message.id}>
                    <Box
                      sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        position: 'relative',
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
                          background: message.sender === 'bot' ? 'primary.main' : 'accent.main',
                          opacity: 0,
                          transition: 'opacity 0.3s ease'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          width: '100%',
                          gap: 3,
                          p: 2,
                          bgcolor: 'background.darkLight',
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: message.sender === 'bot' ? 'primary.main' : 'accent.main',
                            color: 'white',
                            width: 38,
                            height: 38,
                            boxShadow: message.sender === 'bot'
                              ? '0 3px 12px rgba(14, 165, 233, 0.3)'
                              : '0 3px 12px rgba(249, 115, 22, 0.3)',
                            mt: 0.5,
                            flexShrink: 0
                          }}
                        >
                          {message.sender === 'bot' ? <SmartToyOutlinedIcon /> : <PersonOutlineOutlinedIcon />}
                        </Avatar>

                        <Box sx={{
                          width: 'calc(100% - 50px)',
                          overflow: 'hidden'
                        }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: message.sender === 'bot' ? 'primary.light' : 'accent.light',
                              fontWeight: 600,
                              mb: 0.5,
                              display: 'block',
                              letterSpacing: '0.02em',
                              textTransform: 'uppercase',
                              fontSize: '0.75rem'
                            }}
                          >
                            {message.sender === 'bot' ? 'Assistant' : 'You'}
                          </Typography>
                          <Typography
                            variant="body1"
                            component="div"
                            sx={{
                              whiteSpace: 'pre-wrap',
                              color: 'text.light',
                              lineHeight: 1.8,
                              fontSize: '1rem',
                              wordBreak: 'break-word',
                            }}
                          >
                            <MarkdownContent content={message.text} />
                          </Typography>
                          {message.article && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.dark', borderRadius: 1 }}>
                              <Typography variant="subtitle2" sx={{ color: 'primary.light', mb: 1 }}>
                                Source Article:
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.light' }}>
                                <a
                                  href={message.article.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: 'inherit', textDecoration: 'none' }}
                                >
                                  {message.article.title}
                                </a>
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Fade>
                ))}
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Form */}
          <Box sx={{
            p: 2,
            bgcolor: 'background.darkLight',
            borderTop: '1px solid',
            borderColor: 'divider',
            flexShrink: 0
          }}>
            <Paper
              component="form"
              onSubmit={handleSubmit}
              sx={{
                p: 2,
                bgcolor: 'background.dark',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              {showUrlInput && (
                <TextField
                  fullWidth
                  label="Custom URL"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'text.light',
                      '& fieldset': {
                        borderColor: 'divider',
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'text.light',
                    },
                  }}
                />
              )}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Dán liên kết hoặc nhập câu hỏi của bạn..."
                  variant="outlined"
                  size="small"
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'text.light',
                      '& fieldset': {
                        borderColor: 'divider',
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !query.trim()}
                  sx={{
                    minWidth: '48px',
                    height: '40px',
                    bgcolor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    <SendIcon />
                  )}
                </Button>
              </Box>
            </Paper>
          </Box>
        </Grid>

        {/* Practice Section (40% on desktop, 100% on mobile) */}
        <Grid item xs={12} md={4.8} sx={{
          height: { xs: 'calc(50vh - 32px)', md: '100%' },
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.darkLight',
          minWidth: 0, // Prevent flex item from overflowing
          flex: { xs: 'none', md: '0 0 40%' } // Fixed width of 40% on desktop
        }}>
          {/* Practice Header */}
          <Box sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            flexShrink: 0
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: 'text.light' }}>
                Practice Exercises
              </Typography>

              {/* Progress indicator */}
              {exerciseResults && activeTab === 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    color: exerciseResults.score > 50 ? 'success.main' : 'text.light'
                  }}>
                    {Math.round((exerciseResults.results.fill_in_blank.length / practiceExercises.fill_in_blank.length) * 100)}%
                  </Box>
                  <Box sx={{
                    width: 100,
                    height: 8,
                    bgcolor: 'background.dark',
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Box sx={{
                      height: '100%',
                      width: `${(exerciseResults.results.fill_in_blank.length / practiceExercises.fill_in_blank.length) * 100}%`,
                      bgcolor: exerciseResults.score > 50 ? 'success.main' : 'primary.main',
                      borderRadius: 4,
                      transition: 'width 0.5s ease'
                    }} />
                  </Box>
                </Box>
              )}
            </Box>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                mb: 2,
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                },
                '& .MuiTab-root': {
                  minHeight: 48,
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: 0,
                    bgcolor: 'primary.main',
                    transition: 'all 0.3s ease',
                    opacity: 0
                  },
                  '&.Mui-selected': {
                    color: 'primary.main',
                    '&::after': {
                      opacity: 0.1,
                      height: '100%'
                    }
                  },
                  '&:hover:not(.Mui-selected)': {
                    color: 'primary.light',
                    bgcolor: 'rgba(25, 118, 210, 0.04)'
                  }
                }
              }}
            >
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>Fill in Blank</span>
                    {practiceExercises?.fill_in_blank && (
                      <Chip
                        size="small"
                        label={practiceExercises.fill_in_blank.length}
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          bgcolor: 'rgba(25, 118, 210, 0.1)',
                          color: 'primary.main',
                          fontWeight: 'bold'
                        }}
                      />
                    )}
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>Story Gap</span>
                    {practiceExercises?.story_gap && (
                      <Chip
                        size="small"
                        label="1"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          bgcolor: 'rgba(25, 118, 210, 0.1)',
                          color: 'primary.main',
                          fontWeight: 'bold'
                        }}
                      />
                    )}
                  </Box>
                }
              />
            </Tabs>
          </Box>

          {/* Practice Content */}
          <Box sx={{
            flexGrow: 1,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'background.dark',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'primary.main',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'primary.dark',
            }
          }}>
            {practiceExercises ? (
              <>
                {activeTab === 0 ? (
                  <Box sx={{ width: '100%', maxWidth: '100vw', overflow: 'hidden' }}>
                    <style>
                      {`
                      .swiper {
                        width: 100%;
                        max-width: 100%;
                        padding: 20px 40px;
                        box-sizing: border-box;
                      }
                      .swiper-slide {
                        width: 100% !important;
                        display: flex;
                        justify-content: center;
                        transition: transform 0.3s ease, opacity 0.3s ease;
                      }
                      .swiper-slide-active {
                        transform: scale(1);
                        opacity: 1;
                      }
                      .swiper-slide-prev, .swiper-slide-next {
                        transform: scale(0.9);
                        opacity: 0.6;
                      }
                      .swiper-button-prev, .swiper-button-next {
                        color: #1976d2;
                        background: rgba(25, 118, 210, 0.1);
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transform: translateY(-50%);
                        transition: all 0.2s ease;
                      }
                      .swiper-button-prev:hover, .swiper-button-next:hover {
                        background: rgba(25, 118, 210, 0.2);
                        transform: translateY(-50%) scale(1.1);
                      }
                      .swiper-button-prev {
                        left: 10px;
                      }
                      .swiper-button-next {
                        right: 10px;
                      }
                      .swiper-button-prev:after, .swiper-button-next:after {
                        font-size: 20px;
                      }
                      .swiper-pagination {
                        bottom: 10px !important;
                      }
                      .swiper-pagination-bullet {
                        background: #1976d2;
                        opacity: 0.5;
                        transition: all 0.2s ease;
                      }
                      .swiper-pagination-bullet-active {
                        background: #1976d2;
                        opacity: 1;
                        transform: scale(1.2);
                      }
                      .swiper-pagination-bullet-correct {
                        background: #4caf50 !important;
                        opacity: 1 !important;
                      }
                      .swiper-pagination-bullet-incorrect {
                        background: #f44336 !important;
                        opacity: 1 !important;
                      }
                      .swiper-pagination-bullet-active.swiper-pagination-bullet-correct,
                      .swiper-pagination-bullet-active.swiper-pagination-bullet-incorrect {
                        transform: scale(1.4);
                      }
                      @media (max-width: 600px) {
                        .swiper {
                          padding: 10px 30px;
                        }
                        .swiper-button-prev, .swiper-button-next {
                          width: 30px;
                          height: 30px;
                        }
                        .swiper-button-prev:after, .swiper-button-next:after {
                          font-size: 16px;
                        }
                      }
                    `}
                    </style>
                    <Swiper
                      modules={[Navigation, Pagination]}
                      spaceBetween={20}
                      slidesPerView={1}
                      navigation
                      effect="creative"
                      creativeEffect={{
                        prev: {
                          translate: [0, 0, -400],
                          opacity: 0,
                        },
                        next: {
                          translate: [0, 0, -400],
                          opacity: 0,
                        },
                      }}
                      speed={800}
                      pagination={{
                        clickable: true,
                        dynamicBullets: true,
                        renderBullet: function (index, className) {
                          const isCompleted = exerciseResults?.results?.fill_in_blank?.[index];
                          const isCorrect = isCompleted && exerciseResults.results.fill_in_blank[index].is_correct;
                          const additionalClass = isCompleted
                            ? (isCorrect ? 'swiper-pagination-bullet-correct' : 'swiper-pagination-bullet-incorrect')
                            : '';
                          return `<span class="${className} ${additionalClass}" style="${isCompleted ? 'transform: scale(1.2);' : ''}"></span>`;
                        }
                      }}
                      autoHeight={true}
                      style={{ maxWidth: '100%' }}
                    >
                      {practiceExercises?.fill_in_blank?.map((question, index) => (
                        <SwiperSlide key={index}>
                          <Fade in={true} timeout={800}>
                            <Card
                              sx={{
                                bgcolor: 'background.dark',
                                width: '100%',
                                maxWidth: 'calc(100% - 20px)',
                                mx: 'auto',
                                borderRadius: 2,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                                  transform: 'translateY(-2px)'
                                },
                                border: '1px solid',
                                borderColor: 'divider'
                              }}
                            >
                              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                <Box sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  mb: 2,
                                  pb: 1.5,
                                  borderBottom: '1px solid',
                                  borderColor: 'divider'
                                }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                      sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        bgcolor: 'primary.main',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '0.875rem'
                                      }}
                                    >
                                      {index + 1}
                                    </Box>
                                    <Typography
                                      variant="subtitle1"
                                      sx={{ color: 'primary.main', fontWeight: 'bold' }}
                                    >
                                      Câu hỏi
                                    </Typography>
                                  </Box>
                                  {exerciseResults?.results?.fill_in_blank?.[index] && (
                                    <Chip
                                      size="small"
                                      icon={exerciseResults.results.fill_in_blank[index].is_correct ?
                                        <CheckCircleIcon fontSize="small" /> :
                                        <CloseIcon fontSize="small" />}
                                      label={exerciseResults.results.fill_in_blank[index].is_correct ? "Đúng" : "Sai"}
                                      sx={{
                                        bgcolor: exerciseResults.results.fill_in_blank[index].is_correct ?
                                          'success.main' : 'error.main',
                                        color: '#fff',
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        py: 0.5,
                                        borderRadius: '12px',
                                        '& .MuiChip-label': {
                                          px: 1
                                        }
                                      }}
                                    />
                                  )}
                                </Box>
                                <Typography
                                  variant="body1"
                                  component="div"
                                  sx={{
                                    color: 'text.light',
                                    mb: 3,
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    '& strong': {
                                      color: 'primary.main',
                                      fontWeight: 700,
                                      px: 0.5,
                                      py: 0.2,
                                      bgcolor: 'rgba(25, 118, 210, 0.08)',
                                      borderRadius: 0.5
                                    },
                                    fontSize: { xs: '0.95rem', sm: '1rem' },
                                    lineHeight: 1.7,
                                    letterSpacing: '0.01em'
                                  }}
                                >
                                  <MarkdownContent content={question.text} />
                                </Typography>
                                {question.options && (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {question.options.map((option, optIndex) => {
                                      // Kiểm tra xem câu này đã có kết quả chưa 
                                      const hasResult = exerciseResults?.results?.fill_in_blank?.[index];
                                      // Kiểm tra xem người dùng đã chọn option này chưa
                                      const isSelected = userAnswers[`fill_in_blank_${index}`] === option;
                                      // Kiểm tra xem option này có phải là câu trả lời đúng không
                                      const isCorrectAnswer = option === question.correct_answer;
                                      // Kiểm tra xem người dùng đã chọn đúng chưa
                                      const isAnsweredCorrectly = hasResult && isSelected && isCorrectAnswer;
                                      // Kiểm tra xem người dùng đã chọn sai chưa
                                      const isAnsweredIncorrectly = hasResult && isSelected && !isCorrectAnswer;
                                      // Kiểm tra xem đây có phải là đáp án đúng và người dùng đã chọn một đáp án sai khác
                                      const isCorrectUnselected = hasResult && !isSelected && isCorrectAnswer &&
                                        userAnswers[`fill_in_blank_${index}`];

                                      // Vô hiệu hóa các option khác sau khi người dùng đã chọn một câu trả lời
                                      const isDisabled = hasResult && !isSelected;

                                      return (
                                        <Button
                                          key={optIndex}
                                          variant={isSelected ? 'contained' : 'outlined'}
                                          fullWidth
                                          disabled={isDisabled}
                                          onClick={() => handleAnswerChange('fill_in_blank', index, option)}
                                          onKeyDown={(e) => handleKeyDown(e, 'fill_in_blank', index, optIndex)}
                                          id={`option-${index}-${optIndex}`}
                                          startIcon={
                                            isAnsweredCorrectly ? <CheckCircleIcon /> :
                                              isAnsweredIncorrectly ? <CloseIcon /> :
                                                isCorrectUnselected ? <CheckCircleIcon /> : null
                                          }
                                          sx={{
                                            justifyContent: 'flex-start',
                                            textTransform: 'none',
                                            position: 'relative',
                                            p: 1.5,
                                            transition: 'all 0.3s ease',
                                            fontWeight: isSelected || isCorrectUnselected ? 500 : 400,
                                            outline: 'none',
                                            '&:focus-visible': {
                                              boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.4)',
                                              transform: 'translateY(-2px)',
                                              zIndex: 1
                                            },

                                            // Styling based on answer status
                                            ...(isAnsweredCorrectly && {
                                              color: 'white',
                                              backgroundColor: 'success.main',
                                              borderColor: 'success.main',
                                              '&:hover': {
                                                backgroundColor: 'success.dark',
                                                borderColor: 'success.dark',
                                              },
                                            }),

                                            ...(isAnsweredIncorrectly && {
                                              color: 'white',
                                              backgroundColor: 'error.main',
                                              borderColor: 'error.main',
                                              '&:hover': {
                                                backgroundColor: 'error.dark',
                                                borderColor: 'error.dark',
                                              },
                                            }),

                                            ...(isCorrectUnselected && {
                                              color: 'success.main',
                                              borderColor: 'success.main',
                                              borderWidth: 2,
                                              backgroundColor: 'rgba(76, 175, 80, 0.08)',
                                              '&:hover': {
                                                borderColor: 'success.main',
                                                backgroundColor: 'rgba(76, 175, 80, 0.12)',
                                              },
                                            }),

                                            ...(!isAnsweredCorrectly && !isAnsweredIncorrectly && !isCorrectUnselected && {
                                              color: 'text.light',
                                              borderColor: 'divider',
                                              '&:hover': {
                                                borderColor: 'primary.main',
                                                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                              },
                                            }),
                                          }}
                                        >
                                          {option}

                                          {/* Thêm badge cho đáp án đúng/sai */}
                                          {(isAnsweredCorrectly || isAnsweredIncorrectly || isCorrectUnselected) && (
                                            <Box
                                              sx={{
                                                position: 'absolute',
                                                right: 8,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                color: isAnsweredCorrectly ? 'white' :
                                                  isAnsweredIncorrectly ? 'white' :
                                                    'success.main',
                                                fontWeight: 500,
                                                fontSize: '0.8rem',
                                              }}
                                            >
                                              {isAnsweredCorrectly && 'Đúng'}
                                              {isAnsweredIncorrectly && 'Sai'}
                                              {isCorrectUnselected && 'Đáp án đúng'}
                                            </Box>
                                          )}
                                        </Button>
                                      );
                                    })}
                                  </Box>
                                )}
                                {exerciseResults?.results?.fill_in_blank?.[index] && (
                                  <Collapse in={true} timeout={700}>
                                    <Box
                                      sx={{
                                        mt: 3,
                                        p: 2.5,
                                        bgcolor: exerciseResults.results.fill_in_blank[index].is_correct ?
                                          'rgba(46, 125, 50, 0.08)' : 'rgba(211, 47, 47, 0.08)',
                                        border: '1px solid',
                                        borderColor: exerciseResults.results.fill_in_blank[index].is_correct ?
                                          'success.main' : 'error.main',
                                        borderRadius: 2,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&::before': {
                                          content: '""',
                                          position: 'absolute',
                                          top: 0,
                                          left: 0,
                                          width: '4px',
                                          height: '100%',
                                          backgroundColor: exerciseResults.results.fill_in_blank[index].is_correct ?
                                            'success.main' : 'error.main'
                                        }
                                      }}
                                    >
                                      <Typography
                                        variant="subtitle2"
                                        sx={{
                                          mb: 1.5,
                                          color: exerciseResults.results.fill_in_blank[index].is_correct ?
                                            'success.main' : 'error.main',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 1,
                                          fontWeight: 600
                                        }}
                                      >
                                        {exerciseResults.results.fill_in_blank[index].is_correct ?
                                          <CheckCircleIcon fontSize="small" /> :
                                          <CloseIcon fontSize="small" />}
                                        {exerciseResults.results.fill_in_blank[index].is_correct ? 'Đáp án chính xác!' : 'Đáp án chưa chính xác'}
                                      </Typography>

                                      {!exerciseResults.results.fill_in_blank[index].is_correct && (
                                        <Box
                                          sx={{
                                            p: 1.5,
                                            borderRadius: 1,
                                            mb: 1.5,
                                            bgcolor: 'background.dark',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            border: '1px dashed',
                                            borderColor: 'success.main'
                                          }}
                                        >
                                          <CheckCircleIcon sx={{ color: 'success.main' }} fontSize="small" />
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              color: 'success.main',
                                              fontWeight: 500
                                            }}
                                          >
                                            Đáp án đúng: <strong>{exerciseResults.results.fill_in_blank[index].correct_answer}</strong>
                                          </Typography>
                                        </Box>
                                      )}

                                      {exerciseResults.results.fill_in_blank[index].explanation && (
                                        <Box>
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              color: 'text.secondary',
                                              textTransform: 'uppercase',
                                              letterSpacing: '0.1em',
                                              fontWeight: 500,
                                            }}
                                          >
                                            Giải thích
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              color: 'text.light',
                                              mt: 0.5,
                                              lineHeight: 1.6,
                                              pl: 1,
                                              borderLeft: '2px solid',
                                              borderColor: 'divider'
                                            }}
                                          >
                                            {exerciseResults.results.fill_in_blank[index].explanation}
                                          </Typography>
                                        </Box>
                                      )}
                                    </Box>
                                  </Collapse>
                                )}
                              </CardContent>
                            </Card>
                          </Fade>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </Box>
                ) : activeTab === 1 ? (
                  <Box sx={{ width: '100%', maxWidth: '100vw', overflow: 'hidden' }}>
                    <Card
                      sx={{
                        bgcolor: 'background.dark',
                        width: '100%',
                        maxWidth: 'calc(100% - 20px)',
                        mx: 'auto',
                      }}
                    >
                      <CardContent
                        sx={{
                          maxHeight: '60vh',
                          overflowY: 'auto',
                          '&::-webkit-scrollbar': {
                            width: '8px',
                          },
                          '&::-webkit-scrollbar-track': {
                            background: 'background.darkLight',
                            borderRadius: '4px',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            background: 'primary.main',
                            borderRadius: '4px',
                          },
                          '&::-webkit-scrollbar-thumb:hover': {
                            background: 'primary.dark',
                          },
                        }}
                      >
                        <Typography variant="h6" sx={{
                          color: 'primary.main',
                          mb: 2,
                          pb: 1,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          {practiceExercises?.story_gap?.title || 'Story Gap Exercise'}
                        </Typography>
                        {practiceExercises?.story_gap?.instructions && (
                          <Box
                            sx={{
                              mb: 3,
                              p: 2,
                              bgcolor: 'rgba(25, 118, 210, 0.08)',
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'primary.main',
                              position: 'relative',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '4px',
                                height: '100%',
                                bgcolor: 'primary.main'
                              }
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color: 'primary.main',
                                mb: 1,
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}
                            >
                              <InfoIcon fontSize="small" />
                              Hướng dẫn
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'text.light',
                                lineHeight: 1.6
                              }}
                            >
                              {practiceExercises.story_gap.instructions}
                            </Typography>
                          </Box>
                        )}
                        <Typography
                          variant="body1"
                          component="div"
                          sx={{
                            color: 'text.light',
                            mb: 3,
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.8,
                            wordBreak: 'break-word',
                            '& strong': {
                              color: 'primary.main',
                              fontWeight: 700,
                              px: 0.5,
                              py: 0.2,
                              bgcolor: 'rgba(25, 118, 210, 0.08)',
                              borderRadius: 0.5
                            },
                            fontSize: { xs: '0.95rem', sm: '1rem' },
                            letterSpacing: '0.01em',
                            p: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          <div>
                            <MarkdownContent content={practiceExercises?.story_gap?.story} />
                          </div>
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {practiceExercises?.story_gap?.gaps?.map((gap, index) => (
                            <Box key={index}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    minWidth: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '0.75rem',
                                    flexShrink: 0
                                  }}
                                >
                                  {index + 1}
                                </Box>
                                <TextField
                                  label={`Từ cần điền`}
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  value={userAnswers[`story_gap_${index}`] || ''}
                                  onChange={(e) =>
                                    handleAnswerChange('story_gap', index, e.target.value)
                                  }
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      color: 'text.light',
                                      '& fieldset': {
                                        borderColor: 'divider',
                                        borderWidth: showResults && exerciseResults?.results?.story_gap?.[index] ? 2 : 1
                                      },
                                      '&:hover fieldset': {
                                        borderColor: showResults && exerciseResults?.results?.story_gap?.[index] ?
                                          (exerciseResults.results.story_gap[index].is_correct ? 'success.main' : 'error.main') :
                                          'primary.main'
                                      },
                                      '&.Mui-focused fieldset': {
                                        borderColor: showResults && exerciseResults?.results?.story_gap?.[index] ?
                                          (exerciseResults.results.story_gap[index].is_correct ? 'success.main' : 'error.main') :
                                          'primary.main'
                                      },
                                      ...((showResults && exerciseResults?.results?.story_gap?.[index]) && {
                                        borderColor: exerciseResults.results.story_gap[index].is_correct ? 'success.main' : 'error.main',
                                        bgcolor: exerciseResults.results.story_gap[index].is_correct ? 'rgba(76, 175, 80, 0.04)' : 'rgba(211, 47, 47, 0.04)'
                                      })
                                    },
                                    '& .MuiInputLabel-root': {
                                      color: (showResults && exerciseResults?.results?.story_gap?.[index]) ?
                                        (exerciseResults.results.story_gap[index].is_correct ? 'success.main' : 'error.main') :
                                        'text.light'
                                    },
                                  }}
                                />
                                {showResults && exerciseResults?.results?.story_gap?.[index] && (
                                  <Box
                                    sx={{
                                      ml: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      color: exerciseResults.results.story_gap[index].is_correct ? 'success.main' : 'error.main',
                                    }}
                                  >
                                    {exerciseResults.results.story_gap[index].is_correct ?
                                      <CheckCircleIcon /> : <CloseIcon />}
                                  </Box>
                                )}
                              </Box>
                              {practiceExercises?.story_gap?.hints?.[index] && (
                                <Box
                                  sx={{
                                    mt: 1,
                                    mb: 2,
                                    ml: 4,
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 0.5
                                  }}
                                >
                                  <Box component="span" sx={{ color: 'primary.light', fontWeight: 600, fontSize: '0.75rem' }}>Gợi ý:</Box>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: 'text.light',
                                      fontStyle: 'italic',
                                      lineHeight: 1.4,
                                      display: 'block'
                                    }}
                                  >
                                    {practiceExercises.story_gap.hints[index]}
                                  </Typography>
                                </Box>
                              )}
                              {showResults && exerciseResults?.results?.story_gap?.[index] && (
                                <Box
                                  sx={{
                                    mt: 1,
                                    mb: 2,
                                    ml: 4,
                                    p: 1.5,
                                    bgcolor: exerciseResults.results.story_gap[index].is_correct ?
                                      'rgba(76, 175, 80, 0.08)' : 'rgba(211, 47, 47, 0.08)',
                                    borderRadius: 1,
                                    borderLeft: '3px solid',
                                    borderColor: exerciseResults.results.story_gap[index].is_correct ?
                                      'success.main' : 'error.main'
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: exerciseResults.results.story_gap[index].is_correct ?
                                        'success.main' : 'error.main',
                                      fontWeight: 500,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5
                                    }}
                                  >
                                    {exerciseResults.results.story_gap[index].is_correct ? (
                                      <>
                                        <CheckCircleIcon fontSize="small" /> Chính xác!
                                      </>
                                    ) : (
                                      <>
                                        <CloseIcon fontSize="small" /> Chưa chính xác
                                      </>
                                    )}
                                  </Typography>

                                  {!exerciseResults.results.story_gap[index].is_correct && (
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        mt: 1,
                                        color: 'text.light',
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 0.5
                                      }}
                                    >
                                      <Box component="span" sx={{ fontWeight: 600 }}>Đáp án đúng:</Box>
                                      <Box
                                        component="span"
                                        sx={{
                                          color: 'success.main',
                                          fontWeight: 600,
                                          bgcolor: 'rgba(76, 175, 80, 0.1)',
                                          px: 1,
                                          py: 0.2,
                                          borderRadius: 0.5
                                        }}
                                      >
                                        {exerciseResults.results.story_gap[index].correct_answer}
                                      </Box>
                                    </Typography>
                                  )}
                                </Box>
                              )}
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                    <Button
                      variant="contained"
                      onClick={handleCheckAnswers}
                      disabled={showResults}
                      startIcon={!showResults && <CheckCircleIcon />}
                      size="large"
                      sx={{
                        mt: 3,
                        mb: 2,
                        py: 1.2,
                        fontWeight: 600,
                        bgcolor: 'primary.main',
                        '&:hover': { bgcolor: 'primary.dark' },
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          bgcolor: 'primary.dark',
                          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)'
                        }
                      }}
                    >
                      Kiểm tra đáp án
                    </Button>
                    {showResults && exerciseResults && (
                      <Box
                        sx={{
                          mt: 3,
                          p: 3,
                          bgcolor: 'background.dark',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: exerciseResults.score > 50 ? 'success.main' : 'error.main',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '4px',
                            height: '100%',
                            bgcolor: exerciseResults.score > 50 ? 'success.main' : 'error.main'
                          }
                        }}
                      >
                        <Typography variant="h6" sx={{
                          color: exerciseResults.score > 50 ? 'success.main' : 'error.main',
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          fontWeight: 600
                        }}>
                          {exerciseResults.score > 50 ? <CheckCircleIcon /> : <InfoIcon />}
                          Kết quả
                        </Typography>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 2,
                          pb: 2,
                          borderBottom: '1px solid',
                          borderColor: 'divider'
                        }}>
                          <Typography variant="body1" sx={{
                            color: 'text.light',
                            fontWeight: 500,
                            fontSize: '1.1rem'
                          }}>
                            Điểm số:
                          </Typography>
                          <Box sx={{
                            px: 2,
                            py: 1,
                            bgcolor: exerciseResults.score > 50 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(211, 47, 47, 0.1)',
                            borderRadius: 2,
                            fontWeight: 700,
                            color: exerciseResults.score > 50 ? 'success.main' : 'error.main',
                            fontSize: '1.2rem'
                          }}>
                            {exerciseResults.score.toFixed(1)}%
                          </Box>
                        </Box>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2
                        }}>
                          <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            p: 1,
                            flexGrow: 1
                          }}>
                            <Typography variant="caption" sx={{ color: 'text.light', mb: 0.5 }}>
                              Số câu đúng
                            </Typography>
                            <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 600 }}>
                              {exerciseResults.correct_answers}
                            </Typography>
                          </Box>
                          <Divider orientation="vertical" flexItem />
                          <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            p: 1,
                            flexGrow: 1
                          }}>
                            <Typography variant="caption" sx={{ color: 'text.light', mb: 0.5 }}>
                              Tổng số câu
                            </Typography>
                            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                              {exerciseResults.total_questions}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%',
                      color: 'text.light',
                      textAlign: 'center',
                      p: 2,
                    }}
                  >
                    <InfoIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="body1">
                      Ask a question about vocabulary to get practice exercises.
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  color: 'text.light',
                  textAlign: 'center',
                  p: 2,
                }}
              >
                <InfoIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="body1">
                  No exercises available. Ask a question to get started.
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
      {/* ======================================================================================= */}
      {/* Exercise History Dialog */}
      <Dialog
        open={showHistory}
        onClose={() => setShowHistory(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.dark',
            color: 'text.light',
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ color: 'text.light', bgcolor: 'background.dark' }}>
          Exercise History
        </DialogTitle>
        <DialogContent sx={{
          bgcolor: 'background.dark',
          color: 'text.light',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'background.dark',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'primary.main',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'primary.dark',
          }
        }}>
          <List>
            {exerciseHistory.map((exercise, index) => (
              <ListItem
                key={exercise.exercise_id}
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': {
                    borderBottom: 'none'
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ color: 'primary.main' }}>
                      Exercise {index + 1}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" sx={{ color: 'text.light', mt: 1 }}>
                        Query: {exercise.query}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {exercise.vocabulary.map((word, i) => (
                          <Chip
                            key={i}
                            label={word}
                            size="small"
                            sx={{
                              bgcolor: 'background.darkLight',
                              color: 'text.light'
                            }}
                          />
                        ))}
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.light', display: 'block', mt: 1 }}>
                        {new Date(exercise.timestamp).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setPracticeExercises({
                        exercise_id: exercise.exercise_id,
                        fill_in_blank: exercise.questions,
                        story_gap: exercise.story_gap
                      });
                      setShowHistory(false);
                    }}
                    sx={{
                      color: 'primary.main',
                      borderColor: 'primary.main',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        bgcolor: 'background.darkLight'
                      }
                    }}
                  >
                    Review
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'background.dark' }}>
          <Button onClick={() => setShowHistory(false)} sx={{ color: 'text.light' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Alert */}
      <Collapse in={!!error}>
        <Alert
          severity="error"
          sx={{ mx: 2, mb: 2 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setError(null)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Collapse>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IELTSVocabularyQuery;