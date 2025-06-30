import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  IconButton,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TableChartIcon from '@mui/icons-material/TableChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CalculateIcon from '@mui/icons-material/Calculate';
import ArticleIcon from '@mui/icons-material/Article';

const StructuredAnswer = ({ answer, sources, queryType = 'general' }) => {
  const [expanded, setExpanded] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getQueryTypeIcon = () => {
    switch (queryType) {
      case 'table':
        return <TableChartIcon />;
      case 'chart':
        return <ShowChartIcon />;
      case 'numerical':
        return <CalculateIcon />;
      default:
        return <ArticleIcon />;
    }
  };

  const parseTable = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (!lines.some(line => line.includes('|'))) return null;

    const tableLines = lines.filter(line => line.includes('|'));
    const headers = tableLines[0].split('|').filter(cell => cell.trim()).map(cell => cell.trim());
    const rows = tableLines.slice(2).map(line => 
      line.split('|').filter(cell => cell.trim()).map(cell => cell.trim())
    );

    return (
      <TableContainer component={Paper} sx={{ my: 2, maxWidth: '100%', overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {headers.map((header, i) => (
                <TableCell 
                  key={i} 
                  align={header.toLowerCase().includes('name') ? 'left' : 'right'}
                  sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                {row.map((cell, j) => (
                  <TableCell 
                    key={j}
                    align={j === 0 ? 'left' : 'right'}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const parseContent = (text) => {
    // Split content into sections
    const sections = text.split('\n\n');
    
    return sections.map((section, sectionIndex) => {
      // Check if section contains a table
      if (section.includes('|')) {
        const table = parseTable(section);
        if (table) return table;
      }

      // Process regular text content
      return section.split('\n').map((line, lineIndex) => {
        // Empty lines
        if (!line.trim()) return null;

        // Bullet points
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          return (
            <Typography 
              key={`${sectionIndex}-${lineIndex}`} 
              component="li" 
              sx={{ ml: 3, mb: 1 }}
            >
              {line.trim().substring(1)}
            </Typography>
          );
        }

        // Bold text (marked with *)
        if (line.includes('*')) {
          const parts = line.split(/(\*[^*]+\*)/g);
          return (
            <Typography key={`${sectionIndex}-${lineIndex}`} paragraph>
              {parts.map((part, i) => {
                if (part.startsWith('*') && part.endsWith('*')) {
                  return <strong key={i}>{part.slice(1, -1)}</strong>;
                }
                return part;
              })}
            </Typography>
          );
        }

        // Regular text
        return (
          <Typography 
            key={`${sectionIndex}-${lineIndex}`} 
            paragraph 
            sx={{ mb: 1 }}
          >
            {line}
          </Typography>
        );
      });
    });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        {getQueryTypeIcon()}
        <Chip 
          label={queryType.charAt(0).toUpperCase() + queryType.slice(1)} 
          size="small" 
          color="primary" 
          variant="outlined" 
        />
        <IconButton 
          size="small" 
          onClick={() => handleCopy(answer)}
          sx={{ ml: 'auto' }}
        >
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ pl: 1 }}>
        {parseContent(answer)}
      </Box>

      {sources && sources.length > 0 && (
        <Accordion 
          expanded={expanded} 
          onChange={() => setExpanded(!expanded)}
          sx={{ mt: 2, bgcolor: 'background.paper' }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <Typography variant="subtitle2" color="primary">
              View Sources & References ({sources.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {sources.map((source, index) => (
              <Box 
                key={index} 
                sx={{ 
                  mb: 2,
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: 'background.default'
                }}
              >
                <Typography 
                  variant="subtitle2" 
                  color="primary"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
                >
                  {source.metadata.type === 'image' ? 
                    <ShowChartIcon fontSize="small" /> : 
                    <ArticleIcon fontSize="small" />
                  }
                  Source {index + 1}
                </Typography>
                <Typography variant="body2">
                  {source.content}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ mt: 0.5, display: 'block' }}
                >
                  Page: {source.metadata.page} | Type: {source.metadata.type}
                </Typography>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
};

export default StructuredAnswer;