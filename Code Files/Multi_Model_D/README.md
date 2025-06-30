# Complex PDF RAG Explorer

A full-stack application for processing complex PDFs containing text, tables, images, and charts and enabling question-answering through Retrieval-Augmented Generation (RAG).

![RAG Explorer](https://raw.githubusercontent.com/your-username/complex-pdf-rag/main/screenshot.png)

## Architecture

This project consists of:

1. **Django Backend**: Handles document processing, vector storage, and RAG pipeline management
2. **React Frontend**: Provides a modern interface for document upload and chat interactions
3. **Local LLM Integration**: Connects to Ollama running the deepseek-r1.1.5b model

## Features

- Upload and process PDFs with mixed content (text, tables, images, charts)
- Extract text with unstructured.io
- Perform OCR on images and charts with PaddleOCR
- Generate embeddings with Sentence Transformers
- Store vectors in FAISS for efficient similarity search
- Conversation history management
- Source attribution for transparent AI responses

## Technology Stack

### Backend
- Django and Django REST Framework
- Unstructured.io for PDF parsing
- PaddleOCR for image/chart text extraction
- Sentence Transformers for embeddings
- FAISS for vector storage
- LangChain for RAG pipeline
- Ollama for local LLM integration

### Frontend
- React with Material UI for a responsive interface
- React Router for navigation
- Axios for API communication
- React Dropzone for file uploads
- React Markdown for message formatting

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- Ollama with deepseek-r1.1.5b model installed

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run migrations:
   ```
   python manage.py migrate
   ```

4. Start the Django server:
   ```
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

### Ollama Setup
1. Install Ollama from [https://ollama.ai/](https://ollama.ai/)

2. Pull the deepseek-r1.1.5b model:
   ```
   ollama pull deepseek:r1.1.5b
   ```

3. Run the Ollama server:
   ```
   ollama run deepseek:r1.1.5b
   ```

## Usage

1. Access the application at `http://localhost:3000`
2. Upload PDF documents containing text, tables, images, and charts
3. Start chatting with your documents using the intuitive interface
4. See source attributions for transparent AI responses

## Project Structure

```
.
├── backend/                  # Django backend
│   ├── rag_app/              # Main application code
│   ├── rag_project/          # Django project settings
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React frontend
│   ├── public/               # Public assets
│   ├── src/                  # React source code
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-based page components
│   │   └── services/         # API services
│   └── package.json          # Node.js dependencies
└── README.md                 # This file
```

## License

MIT 