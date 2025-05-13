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
    setUserAnswers(prev => ({
      ...prev,
      [`${type}_${index}`]: value
    }));
  };

  const handleCheckAnswers = async () => {
    try {
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

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.dark',
      overflow: 'hidden'
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
        flexShrink: 0
      }}>
        <Typography variant="h4" sx={{ color: 'text.light' }}>
          Khám phá
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Exercise History">
            <IconButton onClick={handleLoadHistory} sx={{ color: 'text.light' }}>
              <HistoryIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear">
            <IconButton onClick={handleClear} sx={{ color: 'text.light' }}>
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
        {/* Chat Section (60%) */}
        <Grid item xs={12} md={7.2} sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          borderRight: '1px solid',
          borderColor: 'divider',
          minWidth: 0, // Prevent flex item from overflowing
          flex: '0 0 60%' // Fixed width of 60%
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

        {/* Practice Section (40%) */}
        <Grid item xs={12} md={4.8} sx={{ 
          height: '100%', 
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.darkLight',
          minWidth: 0, // Prevent flex item from overflowing
          flex: '0 0 40%' // Fixed width of 40%
        }}>
          {/* Practice Header */}
          <Box sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            flexShrink: 0
          }}>
            <Typography variant="h6" sx={{ color: 'text.light', mb: 1 }}>
              Practice Exercises
            </Typography>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
              <Tab label="Fill in Blank" />
              <Tab label="Story Gap" />
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
                      }
                      .swiper-button-prev, .swiper-button-next {
                        color: #1976d2;
                        background: rgba(0, 0, 0, 0.5);
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transform: translateY(-50%);
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
                      pagination={{ clickable: true }}
                      autoHeight={true}
                      style={{ maxWidth: '100%' }}
                    >
                      {practiceExercises?.fill_in_blank?.map((question, index) => (
                        <SwiperSlide key={index}>
                          <Card
                            sx={{
                              bgcolor: 'background.dark',
                              width: '100%',
                              maxWidth: 'calc(100% - 20px)',
                              mx: 'auto',
                            }}
                          >
                            <CardContent>
                              <Typography
                                variant="subtitle1"
                                sx={{ color: 'primary.main', mb: 1, fontWeight: 'bold' }}
                              >
                                Question {index + 1}
                              </Typography>
                              <Typography
                                variant="body1"
                                component="div"
                                sx={{
                                  color: 'text.light',
                                  mb: 2,
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                  '& strong': { color: 'primary.light' },
                                }}
                              >
                                <MarkdownContent content={question.text} />
                              </Typography>
                              {question.options && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {question.options.map((option, optIndex) => (
                                    <Button
                                      key={optIndex}
                                      variant={
                                        userAnswers[`fill_in_blank_${index}`] === option
                                          ? 'contained'
                                          : 'outlined'
                                      }
                                      fullWidth
                                      onClick={() =>
                                        handleAnswerChange('fill_in_blank', index, option)
                                      }
                                      sx={{
                                        justifyContent: 'flex-start',
                                        textTransform: 'none',
                                        color: 'text.light',
                                        borderColor: 'divider',
                                        '&:hover': {
                                          borderColor: 'primary.main',
                                          bgcolor: 'background.dark',
                                        },
                                      }}
                                    >
                                      {option}
                                    </Button>
                                  ))}
                                </Box>
                              )}
                              {showResults &&
                                exerciseResults?.results?.fill_in_blank?.[index] && (
                                  <Box
                                    sx={{
                                      mt: 2,
                                      p: 1,
                                      bgcolor: 'background.darkLight',
                                      borderRadius: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color:
                                          exerciseResults.results.fill_in_blank[index]
                                            .is_correct
                                            ? 'success.main'
                                            : 'error.main',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                      }}
                                    >
                                      <CheckCircleIcon fontSize="small" />
                                      {exerciseResults.results.fill_in_blank[index].is_correct
                                        ? 'Correct!'
                                        : `Incorrect. The correct answer is: ${exerciseResults.results.fill_in_blank[index]
                                          .correct_answer
                                        }`}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: 'text.light',
                                        mt: 1,
                                        fontStyle: 'italic',
                                      }}
                                    >
                                      {exerciseResults.results.fill_in_blank[index].explanation}
                                    </Typography>
                                  </Box>
                                )}
                            </CardContent>
                          </Card>
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
                        <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>
                          {practiceExercises?.story_gap?.title || 'Story Gap Exercise'}
                        </Typography>
                        {practiceExercises?.story_gap?.instructions && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.light',
                              mb: 3,
                              p: 1,
                              bgcolor: 'background.darkLight',
                              borderRadius: 1,
                            }}
                          >
                            {practiceExercises.story_gap.instructions}
                          </Typography>
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
                            '& strong': { color: 'primary.light' },
                          }}
                        >
                          <div>
                            <MarkdownContent content={practiceExercises?.story_gap?.story} />
                          </div>
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {practiceExercises?.story_gap?.gaps?.map((gap, index) => (
                            <Box key={index}>
                              <TextField
                                label={`Word ${index + 1}`}
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
                                    '& fieldset': { borderColor: 'divider' },
                                    '&:hover fieldset': { borderColor: 'primary.main' },
                                    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                                  },
                                  '& .MuiInputLabel-root': { color: 'text.light' },
                                }}
                              />
                              {practiceExercises?.story_gap?.hints?.[index] && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: 'text.light',
                                    display: 'block',
                                    mt: 0.5,
                                    ml: 1,
                                  }}
                                >
                                  Hint: {practiceExercises.story_gap.hints[index]}
                                </Typography>
                              )}
                              {showResults &&
                                exerciseResults?.results?.story_gap?.[index] && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color:
                                        exerciseResults.results.story_gap[index].is_correct
                                          ? 'success.main'
                                          : 'error.main',
                                      display: 'block',
                                      mt: 0.5,
                                      ml: 1,
                                    }}
                                  >
                                    {exerciseResults.results.story_gap[index].is_correct
                                      ? 'Correct!'
                                      : `Incorrect. The correct answer is: ${exerciseResults.results.story_gap[index]
                                        .correct_answer
                                      }`}
                                  </Typography>
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
                      sx={{
                        mt: 2,
                        bgcolor: 'primary.main',
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                    >
                      Check Answers
                    </Button>
                    {showResults && exerciseResults && (
                      <Box
                        sx={{ mt: 2, p: 2, bgcolor: 'background.dark', borderRadius: 1 }}
                      >
                        <Typography variant="h6" sx={{ color: 'primary.main', mb: 1 }}>
                          Results
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.light' }}>
                          Score: {exerciseResults.score.toFixed(1)}%
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.light', mt: 1 }}
                        >
                          Correct Answers: {exerciseResults.correct_answers} /{' '}
                          {exerciseResults.total_questions}
                        </Typography>
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