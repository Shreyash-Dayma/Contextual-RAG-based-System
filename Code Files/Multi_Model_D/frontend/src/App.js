import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import DocumentsPage from './pages/DocumentsPage';
import ChatPage from './pages/ChatPage';
import { Box } from '@mui/material';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // Blue
      light: '#60a5fa',
      dark: '#1e40af',
    },
    secondary: {
      main: '#10b981', // Green
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: '#f5f8fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="app-container">
        <Header />
        <Box className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/chat/:documentId" element={<ChatPage />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;