// F:\MIT\Multi_Model_D\frontend\src\pages\ChatPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Box, TextField, Button, Paper, Typography, CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import StructuredAnswer from '../components/StructuredAnswer';
import { queryApi, conversationApi } from '../services/api';

const ChatPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!documentId) {
      navigate('/documents');
      return;
    }

    // Create conversation when component mounts
    const initializeConversation = async () => {
      try {
        await conversationApi.create({ documentId: String(documentId) });
      } catch (error) {
        console.error('Error creating conversation:', error);
        navigate('/documents');
      }
    };
    
    initializeConversation();
  }, [documentId, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault(); // Prevent form submission
    
    if (!newMessage.trim() || !documentId || loading) {
      return;
    }

    const userMessage = newMessage.trim();
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setNewMessage('');
    setLoading(true);

    try {
      const response = await queryApi.query({
        query: userMessage,
        documentId: String(documentId)
      });

      setMessages(prev => [...prev, {
        type: 'assistant',
        content: response.answer,
        sources: response.sources,
        queryType: response.query_type || 'general'
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        type: 'error',
        content: error.message || 'Sorry, there was an error processing your request.'
      }]);
    } finally {
      setLoading(false);
      // Focus back on input after sending
      inputRef.current?.focus();
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent newline
      handleSendMessage(e);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', py: 3 }}>
        <Paper
          sx={{
            flex: 1,
            mb: 2,
            p: 2,
            overflowY: 'auto',
            bgcolor: 'background.default',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                maxWidth: message.type === 'assistant' ? '90%' : '70%',
                alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                mb: 2
              }}
            >
              {message.type === 'user' ? (
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    borderRadius: '20px 20px 0 20px'
                  }}
                >
                  <Typography>{message.content}</Typography>
                </Paper>
              ) : message.type === 'assistant' ? (
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: '20px 20px 20px 0',
                    width: '100%'
                  }}
                >
                  <StructuredAnswer
                    answer={message.content}
                    sources={message.sources}
                    queryType={message.queryType}
                  />
                </Paper>
              ) : (
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: 'error.light',
                    color: 'error.contrastText',
                    borderRadius: '20px'
                  }}
                >
                  <Typography>{message.content}</Typography>
                </Paper>
              )}
            </Box>
          ))}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <CircularProgress size={20} />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Paper>

        <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask about tables, charts, or any data in your PDF..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            inputRef={inputRef}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '25px',
                bgcolor: 'background.paper'
              }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !newMessage.trim()}
            sx={{ borderRadius: '25px', minWidth: '50px', width: '50px', height: '56px' }}
          >
            <SendIcon />
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ChatPage;