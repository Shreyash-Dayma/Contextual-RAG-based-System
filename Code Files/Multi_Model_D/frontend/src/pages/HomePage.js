import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Container,
  Paper,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ChatIcon from '@mui/icons-material/Chat';
import ArticleIcon from '@mui/icons-material/Article';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import TableChartIcon from '@mui/icons-material/TableChart';
import ImageIcon from '@mui/icons-material/Image';
import InsertChartIcon from '@mui/icons-material/InsertChart';

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box 
        sx={{ 
          mt: 4, 
          mb: 8, 
          py: 5,
          px: 3,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Typography variant="h2" gutterBottom fontWeight="bold">
          Complex PDF RAG Explorer
        </Typography>
        <Typography variant="h5" paragraph sx={{ mb: 4, maxWidth: 800, mx: 'auto', opacity: 0.9 }}>
          Unlock the knowledge in your complex PDFs with advanced extraction and intelligent chat
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            color="secondary" 
            size="large" 
            startIcon={<CloudUploadIcon />}
            onClick={() => navigate('/documents')}
            sx={{ fontWeight: 'bold', px: 3, py: 1.5, backgroundColor: 'white', color: theme.palette.primary.main }}
          >
            Upload Document
          </Button>
          <Button 
            variant="outlined" 
            color="inherit" 
            size="large"
            startIcon={<ChatIcon />}
            onClick={() => navigate('/chat')}
            sx={{ fontWeight: 'bold', px: 3, py: 1.5, borderColor: 'rgba(255,255,255,0.7)' }}
          >
            Start Chatting
          </Button>
        </Box>
      </Box>

      {/* Features */}
      <Typography variant="h3" gutterBottom textAlign="center" sx={{ mb: 4 }}>
        Advanced Features
      </Typography>
      
      <Grid container spacing={3} mb={8}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderLeft: `4px solid ${theme.palette.primary.main}` }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ArticleIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">Complex PDF Processing</Typography>
              </Box>
              <Typography variant="body1">
                Process complex PDFs containing various elements including text, tables, images, and charts into searchable knowledge.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderLeft: `4px solid ${theme.palette.secondary.main}` }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AutoAwesomeIcon sx={{ color: theme.palette.secondary.main, mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">Retrieval-Augmented Generation</Typography>
              </Box>
              <Typography variant="body1">
                Get accurate answers grounded in your documents using advanced RAG techniques with local LLM integration.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Technology Section */}
      <Paper elevation={2} sx={{ p: 4, mb: 8, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom textAlign="center" sx={{ mb: 4 }}>
          Powered by Advanced Technologies
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <FormatAlignLeftIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
              <Typography variant="h6" gutterBottom fontWeight="medium">Text Extraction</Typography>
              <Typography variant="body2" color="text.secondary">
                Unstructured.io
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <TableChartIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
              <Typography variant="h6" gutterBottom fontWeight="medium">Table Extraction</Typography>
              <Typography variant="body2" color="text.secondary">
                Unstructured.io
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <ImageIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
              <Typography variant="h6" gutterBottom fontWeight="medium">Image OCR</Typography>
              <Typography variant="body2" color="text.secondary">
                PaddleOCR
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <InsertChartIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
              <Typography variant="h6" gutterBottom fontWeight="medium">Chart Analysis</Typography>
              <Typography variant="body2" color="text.secondary">
                PaddleOCR
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default HomePage; 