import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ChatIcon from '@mui/icons-material/Chat';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Toolbar>
        <Typography 
          variant="h5" 
          component={RouterLink} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            fontWeight: 'bold'
          }}
        >
          <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.1254 13H10.1254V15H14.1254V13Z" fill="white" />
              <path d="M8.12537 9H12.1254V11H8.12537V9Z" fill="white" />
              <path d="M8.12537 17H12.1254V19H8.12537V17Z" fill="white" />
              <path d="M20.1254 6.93C19.6554 6.6 19.1154 6.42 18.5654 6.3C18.2754 3.88 16.1754 2 13.6254 2C11.7354 2 10.0754 3.15 9.30542 4.85C6.86542 5.28 5.00542 7.38 5.00542 9.93C5.00542 10.58 5.12542 11.21 5.34542 11.8C3.90542 12.99 3.00542 14.73 3.00542 16.65C3.00542 19.95 5.71542 22.66 9.01542 22.66H18.6554C21.5354 22.66 23.8954 20.3 23.8954 17.42C23.8954 12.99 20.1254 8.93 20.1254 6.93Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Box>
          RAG Explorer
        </Typography>
        
        <Box sx={{ display: 'flex' }}>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/documents" 
            startIcon={<MenuBookIcon />}
            sx={{ 
              mx: 1, 
              fontWeight: 500,
              ...(isMobile && { minWidth: 'unset', px: 1 })
            }}
          >
            {!isMobile && 'Documents'}
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/chat" 
            startIcon={<ChatIcon />}
            sx={{ 
              mx: 1, 
              fontWeight: 500,
              ...(isMobile && { minWidth: 'unset', px: 1 })
            }}
          >
            {!isMobile && 'Chat'}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 