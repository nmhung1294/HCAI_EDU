import { createTheme, alpha } from '@mui/material/styles';

// Custom color palette với gradient
const gradients = {
  primary: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 50%, #3b82f6 100%)',
  secondary: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)',
  accent: 'linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)',
  dark: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
};

// Nâng cao theme với các màu sắc đẹp hơn và các tùy chỉnh phong phú hơn
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0ea5e9', // Màu xanh dương hiện đại thay cho xanh lá
      light: '#38bdf8',
      dark: '#0284c7',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6366f1', // Màu tím nhẹ thay cho đen
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    accent: {
      main: '#f97316', // Màu cam làm điểm nhấn
      light: '#fb923c',
      dark: '#ea580c',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    info: {
      main: '#06b6d4',
      light: '#22d3ee',
      dark: '#0891b2',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // Màu nền nhẹ nhàng hơn
      paper: '#ffffff',
      dark: '#0f172a',
      darkLight: '#1e293b',
      accent: alpha('#f97316', 0.05), // Nền có màu accent nhẹ
      highlight: alpha('#6366f1', 0.08), // Nền highlight nhẹ
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
      light: '#f1f5f9',
      accent: '#f97316',
    },
    divider: 'rgba(15, 23, 42, 0.08)',
  },
  typography: {
    fontFamily: [
      'Inter',
      'Plus Jakarta Sans',
      'Söhne',
      'ui-sans-serif',
      'system-ui',
      '-apple-system',
      'Segoe UI',
      'Roboto',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    caption: {
      fontSize: '0.75rem',
      letterSpacing: '0.03em',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 12, // Tăng độ cong góc
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(15, 23, 42, 0.05)',
    '0px 4px 8px rgba(15, 23, 42, 0.06)',
    '0px 8px 16px rgba(15, 23, 42, 0.07)',
    '0px 12px 24px rgba(15, 23, 42, 0.08)',
    // ... các mức shadow khác
    '0px 20px 32px rgba(15, 23, 42, 0.12)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
          borderRadius: '10px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          boxShadow: '0px 4px 12px rgba(14, 165, 233, 0.25)',
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(14, 165, 233, 0.30)',
          },
        },
        containedPrimary: {
          background: gradients.primary,
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 5s ease infinite',
        },
        containedSecondary: {
          background: gradients.secondary,
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 5s ease infinite',
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: alpha('#0ea5e9', 0.08),
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0px 8px 24px rgba(15, 23, 42, 0.08)',
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(15, 23, 42, 0.06)',
        },
        elevation2: {
          boxShadow: '0px 4px 16px rgba(15, 23, 42, 0.08)',
        },
        elevation3: {
          boxShadow: '0px 8px 24px rgba(15, 23, 42, 0.09)',
        },
        elevation4: {
          boxShadow: '0px 12px 32px rgba(15, 23, 42, 0.10)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          overflow: 'hidden',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 12px 28px rgba(15, 23, 42, 0.12)',
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '20px 24px 12px',
        },
        title: {
          fontSize: '1.25rem',
          fontWeight: 600,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '12px 24px 20px',
          '&:last-child': {
            paddingBottom: 20,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'box-shadow 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0px 2px 8px rgba(15, 23, 42, 0.06)',
            },
            '&.Mui-focused': {
              boxShadow: '0px 4px 12px rgba(14, 165, 233, 0.15)',
            },
          },
          '& .MuiInputLabel-root': {
            fontWeight: 500,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#38bdf8',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: '2px',
          },
        },
        notchedOutline: {
          transition: 'border-color 0.2s ease-in-out',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 46,
          height: 26,
          padding: 0,
        },
        switchBase: {
          padding: 1,
          '&.Mui-checked': {
            transform: 'translateX(20px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              opacity: 1,
              background: gradients.primary,
            },
          },
        },
        thumb: {
          width: 24,
          height: 24,
          boxShadow: '0px 2px 4px rgba(15, 23, 42, 0.2)',
        },
        track: {
          borderRadius: 13,
          opacity: 0.3,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 12px rgba(15, 23, 42, 0.06)',
          backdropFilter: 'blur(8px)',
          background: alpha('#ffffff', 0.8),
        },
        colorPrimary: {
          backgroundColor: alpha('#ffffff', 0.8),
          color: '#0f172a',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiTabs-indicator': {
            height: '3px',
            borderRadius: '1.5px',
          },
        },
        indicator: {
          background: gradients.primary,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          minWidth: 100,
          '&.Mui-selected': {
            color: '#0ea5e9',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        colorPrimary: {
          background: alpha('#0ea5e9', 0.1),
          color: '#0284c7',
          '&:hover': {
            background: alpha('#0ea5e9', 0.15),
          },
        },
        colorSecondary: {
          background: alpha('#6366f1', 0.1),
          color: '#4f46e5',
          '&:hover': {
            background: alpha('#6366f1', 0.15),
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#0f172a',
          fontSize: '0.75rem',
          padding: '8px 12px',
          borderRadius: 8,
          boxShadow: '0px 4px 16px rgba(15, 23, 42, 0.16)',
        },
        arrow: {
          color: '#0f172a',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: alpha('#f8fafc', 0.8),
        },
        root: {
          padding: '16px 20px',
          borderColor: '#e2e8f0',
        },
      },
    },
  },
});

// Thêm các keyframes cho animation của gradient
theme.components.MuiCssBaseline = {
  styleOverrides: `
    @keyframes gradient-shift {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }
    
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb {
      background: #94a3b8;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }
  `,
};

// Đăng ký các màu tùy chỉnh để có thể sử dụng trong toàn bộ ứng dụng
theme.palette = {
  ...theme.palette,
  gradient: {
    primary: gradients.primary,
    secondary: gradients.secondary,
    accent: gradients.accent,
    dark: gradients.dark,
  },
  neutral: {
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
};

export default theme;