# RAG Project Backend

This is the backend for a Retrieval-Augmented Generation (RAG) system that processes complex PDFs containing text, tables, images, and charts.

## Technologies Used

- Django and Django REST Framework for the API
- Unstructured.io for parsing PDF text and tables
- PaddleOCR for OCR on images and charts
- Sentence Transformers for generating embeddings
- FAISS for vector storage
- Ollama for the local LLM (using deepseek-r1.1.5b)
- LangChain for the RAG pipeline

## Setup

1. Install the requirements:
   ```
   pip install -r requirements.txt
   ```

2. Set up the database:
   ```
   python manage.py migrate
   ```

3. Start the development server:
   ```
   python manage.py runserver
   ```

4. Ensure Ollama is running with the deepseek-r1.1.5b model:
   ```
   ollama run deepseek:r1.1.5b
   ```

## API Endpoints

### Documents
- `GET /api/documents/` - List all documents
- `POST /api/documents/upload/` - Upload a new document
- `GET /api/documents/{document_id}/` - Get document details
- `DELETE /api/documents/{document_id}/` - Delete a document

### Query
- `POST /api/query/` - Query the documents using RAG

### Conversations
- `GET /api/conversations/` - List all conversations
- `POST /api/conversations/` - Create a new conversation
- `GET /api/conversations/{conversation_id}/` - Get conversation details
- `DELETE /api/conversations/{conversation_id}/` - Delete a conversation 