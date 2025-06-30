// F:\MIT\Multi_Model_D\frontend\src\pages\DocumentsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  Box, Button, CircularProgress, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Snackbar, Alert, IconButton
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Chat as ChatIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { documentApi } from '../services/api';

const DocumentsPage = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await documentApi.getAll();
      setDocuments(Array.isArray(response) ? response : []);
    } catch (error) {
      showNotification('Failed to fetch documents: ' + (error.response?.data?.error || error.message), 'error');
      setDocuments([]);
      console.error('Fetch documents error:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    if (file.type !== 'application/pdf') {
      showNotification('Only PDF files are supported', 'error');
      return;
    }
    setUploading(true);
    try {
      const response = await documentApi.upload(file);
      setDocuments((prev) => [...prev, response]);
      showNotification('Document uploaded successfully!', 'success');
    } catch (error) {
      showNotification('Failed to upload document: ' + (error.response?.data?.error || error.message), 'error');
      console.error('Upload error:', error.response?.data || error);
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDelete = async (id) => {
    try {
      await documentApi.delete(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      showNotification('Document deleted successfully!', 'success');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      showNotification(`Failed to delete document: ${errorMessage}`, 'error');
      console.error('Delete error:', {
        message: errorMessage,
        response: error.response?.data,
        status: error.response?.status,
        id
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1
  });

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Documents</Typography>
      <Typography variant="body1" gutterBottom>
        Upload PDF documents to extract and process their content for RAG-based queries.
      </Typography>
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          mb: 3,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.500',
          bgcolor: isDragActive ? 'grey.100' : 'background.paper',
          cursor: 'pointer'
        }}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <Box>
            <CircularProgress />
            <Typography>Uploading...</Typography>
          </Box>
        ) : (
          <Box>
            <CloudUploadIcon sx={{ fontSize: 50, color: 'grey.600' }} />
            <Typography>
              Drag & drop a PDF file here, or click to select
            </Typography>
          </Box>
        )}
      </Paper>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>File Name</TableCell>
              <TableCell>Upload Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : documents.length > 0 ? (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.filename}</TableCell>
                  <TableCell>{new Date(doc.upload_time).toLocaleString()}</TableCell>
                  <TableCell>
                    <Typography color={doc.processed ? 'success.main' : 'warning.main'}>
                      {doc.processed ? 'Processed' : 'Processing...'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<ChatIcon />}
                      onClick={() => navigate(`/chat/${doc.id}`)}
                      sx={{ mr: 1 }}
                    >
                      Chat with this
                    </Button>
                    <IconButton color="error" onClick={() => handleDelete(doc.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No documents available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentsPage;