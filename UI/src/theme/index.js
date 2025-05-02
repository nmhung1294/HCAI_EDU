import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#10a37f', // ChatGPT green
      light: '#1aae8a',
      dark: '#0e8c6d',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#202123', // ChatGPT dark
      light: '#343541',
      dark: '#0d0d0e',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f7f7f8',
      paper: '#ffffff',
      dark: '#343541',
      darkLight: '#444654',
    },
    text: {
      primary: '#202123',
      secondary: '#6e6e80',
      light: '#ececf1',
    },
    divider: 'rgba(0,0,0,0.1)',
  },
  typography: {
    fontFamily: [
      'Söhne',
      'ui-sans-serif',
      'system-ui',
      '-apple-system',
      'Segoe UI',
      'Roboto',
      'Ubuntu',
      'Cantarell',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

export default theme; 